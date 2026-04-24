import os
import yaml
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configuration
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
WIKI_PATH = os.path.join(PROJECT_ROOT, "_bmad/memory/rlb/wiki")
SKILLS_PATH = os.path.join(PROJECT_ROOT, "skills")

# Initialize AI Studio
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL_ID = os.getenv("GEMINI_MODEL_ID", "gemini-1.5-flash")

def configure_genai(api_key: str):
    global GEMINI_API_KEY
    GEMINI_API_KEY = api_key
    genai.configure(api_key=api_key)

if GEMINI_API_KEY:
    configure_genai(GEMINI_API_KEY)

app = FastAPI(title="The Lore Sanctum API")

@app.get("/api/auth/status")
async def auth_status():
    if not os.getenv("GEMINI_API_KEY"):
        return {"authenticated": False, "reason": "No GEMINI_API_KEY detected in .env"}
    return {"authenticated": True}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Agent(BaseModel):
    id: str
    name: str
    description: str
    icon: Optional[str] = "Brain"

class AuthConfigureRequest(BaseModel):
    api_key: str
    model_id: str

@app.post("/api/auth/configure")
async def configure_auth(request: AuthConfigureRequest):
    try:
        # Update .env file
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        lines = []
        key_found = False
        model_found = False
        
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("GEMINI_API_KEY="):
                        lines.append(f"GEMINI_API_KEY={request.api_key}\n")
                        key_found = True
                    elif line.startswith("GEMINI_MODEL_ID="):
                        lines.append(f"GEMINI_MODEL_ID={request.model_id}\n")
                        model_found = True
                    else:
                        lines.append(line)
        
        if not key_found:
            lines.append(f"GEMINI_API_KEY={request.api_key}\n")
        if not model_found:
            lines.append(f"GEMINI_MODEL_ID={request.model_id}\n")
            
        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(lines)
            
        # Update runtime config
        global GEMINI_MODEL_ID
        GEMINI_MODEL_ID = request.model_id
        configure_genai(request.api_key)
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class WikiNode(BaseModel):
    name: str
    path: str
    type: str # "file" or "directory"
    children: Optional[List['WikiNode']] = None

@app.get("/api/agents", response_model=List[Agent])
async def list_agents():
    agents = []
    if not os.path.exists(SKILLS_PATH):
        return agents
    
    for folder in os.listdir(SKILLS_PATH):
        if folder.startswith("rlb-agent-"):
            skill_file = os.path.join(SKILLS_PATH, folder, "SKILL.md")
            if os.path.exists(skill_file):
                with open(skill_file, "r", encoding="utf-8") as f:
                    content = f.read()
                    # Basic frontmatter parsing
                    name = folder.replace("rlb-agent-", "").capitalize()
                    description = "Lore council member"
                    if "---" in content:
                        parts = content.split("---")
                        if len(parts) >= 3:
                            try:
                                fm = yaml.safe_load(parts[1])
                                name = fm.get("name", name)
                                description = fm.get("description", description)
                            except:
                                pass
                    agents.append(Agent(id=folder, name=name, description=description))
    return agents

def build_wiki_tree(base_path: str, current_rel_path: str = "") -> List[WikiNode]:
    full_path = os.path.join(base_path, current_rel_path)
    nodes = []
    if not os.path.exists(full_path):
        return nodes
        
    for entry in os.scandir(full_path):
        entry_rel_path = os.path.relpath(entry.path, WIKI_PATH)
        # Normalize slashes for frontend
        entry_rel_path = entry_rel_path.replace("\\", "/")
        
        if entry.is_dir():
            children = build_wiki_tree(base_path, entry_rel_path)
            nodes.append(WikiNode(name=entry.name, path=entry_rel_path, type="directory", children=children))
        elif entry.name.endswith(".md"):
            nodes.append(WikiNode(name=entry.name, path=entry_rel_path, type="file"))
            
    # Sort: directories first, then files
    nodes.sort(key=lambda x: (x.type == "file", x.name.lower()))
    return nodes

@app.get("/api/wiki", response_model=List[WikiNode])
async def list_wiki():
    if not os.path.exists(WIKI_PATH):
        return []
    return build_wiki_tree(WIKI_PATH)

@app.get("/api/wiki/content")
async def get_wiki_content(path: str):
    full_path = os.path.join(WIKI_PATH, path)
    if not os.path.exists(full_path) or not os.path.isfile(full_path):
        raise HTTPException(status_code=404, detail="Wiki file not found")
    
    with open(full_path, "r", encoding="utf-8") as f:
        return {"content": f.read()}

class ChatRequest(BaseModel):
    agent_id: str
    message: str
    history: List[dict] = []

def get_agent_context(agent_id: str) -> str:
    agent_path = os.path.join(SKILLS_PATH, agent_id)
    if not os.path.exists(agent_path):
        return ""
    
    context = []
    # Read SKILL.md
    skill_file = os.path.join(agent_path, "SKILL.md")
    if os.path.exists(skill_file):
        with open(skill_file, "r", encoding="utf-8") as f:
            context.append(f"INSTRUCTIONS FOR YOUR ROLE:\n{f.read()}")
    
    # Read references
    ref_path = os.path.join(agent_path, "references")
    if os.path.exists(ref_path):
        context.append("\nOPERATIONAL PROCEDURES:")
        for file in os.listdir(ref_path):
            if file.endswith(".md"):
                with open(os.path.join(ref_path, file), "r", encoding="utf-8") as f:
                    context.append(f"\n--- Procedure: {file} ---\n{f.read()}")
    
    return "\n".join(context)

@app.post("/api/chat")
async def chat(request: ChatRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured in .env")
    
    try:
        agent_context = get_agent_context(request.agent_id)
        model = genai.GenerativeModel(GEMINI_MODEL_ID, system_instruction=agent_context)
        
        # Convert history for AI Studio format
        history = []
        for h in request.history:
            role = "user" if h["role"] == "user" else "model"
            history.append({"role": role, "parts": [h["content"]]})
        
        chat_session = model.start_chat(history=history)
        response = chat_session.send_message(request.message)
        
        return {"response": response.text}
    except Exception as e:
        error_msg = str(e)
        print(f"Error during Gemini API call: {error_msg}")
        if "API key not valid" in error_msg or "401" in error_msg:
            raise HTTPException(status_code=401, detail="Invalid GEMINI_API_KEY")
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {error_msg}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
