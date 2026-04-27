import os
import yaml
import re
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv, dotenv_values

# Configuration
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
WIKI_PATH = os.path.join(PROJECT_ROOT, "_bmad/memory/rlb/wiki")
SKILLS_PATH = os.path.join(PROJECT_ROOT, "skills")
env_config = dotenv_values(os.path.join(os.path.dirname(__file__), ".env"))

# Initialize AI Studio
GEMINI_API_KEY = env_config.get("GEMINI_API_KEY")
GEMINI_MODEL_ID = env_config.get("GEMINI_MODEL_ID", "gemini-1.5-flash")

def configure_genai(api_key: str):
    global GEMINI_API_KEY
    GEMINI_API_KEY = api_key
    genai.configure(api_key=api_key, transport="rest")

if GEMINI_API_KEY:
    configure_genai(GEMINI_API_KEY)

app = FastAPI(title="The Lore Sanctum API")

@app.get("/api/auth/status")
async def auth_status():
    local_env = dotenv_values(os.path.join(os.path.dirname(__file__), ".env"))
    api_key = local_env.get("GEMINI_API_KEY")
    model_id = local_env.get("GEMINI_MODEL_ID", "gemini-1.5-flash")
    if not api_key:
        return {"authenticated": False, "reason": "No valid API key detected in .env", "model_id": model_id}
    return {"authenticated": True, "model_id": model_id}

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
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        lines = []
        key_found = False
        model_found = False
        
        # Clean inputs
        clean_key = request.api_key.strip() if request.api_key else None
        clean_model = request.model_id.strip() if request.model_id else None

        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("GEMINI_API_KEY=") and clean_key:
                        lines.append(f"GEMINI_API_KEY={clean_key}\n")
                        key_found = True
                    elif line.startswith("GEMINI_MODEL_ID=") and clean_model:
                        lines.append(f"GEMINI_MODEL_ID={clean_model}\n")
                        model_found = True
                    else:
                        lines.append(line)
        
        if not key_found and clean_key:
            lines.append(f"GEMINI_API_KEY={clean_key}\n")
        if not model_found and clean_model:
            lines.append(f"GEMINI_MODEL_ID={clean_model}\n")
            
        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(lines)
            
        # Update runtime config
        global GEMINI_MODEL_ID, GEMINI_API_KEY
        if clean_model:
            GEMINI_MODEL_ID = clean_model
        
        if clean_key:
            GEMINI_API_KEY = clean_key
            os.environ["GEMINI_API_KEY"] = clean_key
            os.environ["GOOGLE_API_KEY"] = clean_key
            
            # Force clear underlying client caches
            try:
                import google.generativeai.client as genai_client
                genai_client._client_manager.clients.clear()
            except:
                pass
                
            # Use 'rest' transport to bypass gRPC caching bug that causes persistent 401s
            genai.configure(api_key=clean_key, transport="rest")
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/auth/configure")
async def delete_auth():
    try:
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
            with open(env_path, "w", encoding="utf-8") as f:
                f.writelines([line for line in lines if not line.startswith("GEMINI_API_KEY=")])
        
        # Clear from memory
        os.environ.pop("GEMINI_API_KEY", None)
        os.environ.pop("GOOGLE_API_KEY", None)
        global GEMINI_API_KEY
        GEMINI_API_KEY = None
        
        # Forcefully rewrite the underlying state machine in `google-generativeai` SDK
        # Passing an empty string overwrites the internal singleton and popping caches
        try:
            import google.generativeai.client as genai_client
            genai_client._client_manager.clients.clear()
            genai.configure(api_key="", transport="rest")
        except:
            pass
        
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

@app.get("/api/workflows", response_model=List[Agent])
async def list_workflows():
    workflows = []
    if not os.path.exists(SKILLS_PATH):
        return workflows
    
    for folder in os.listdir(SKILLS_PATH):
        if folder.startswith("rlb-workflow-"):
            skill_file = os.path.join(SKILLS_PATH, folder, "SKILL.md")
            if os.path.exists(skill_file):
                with open(skill_file, "r", encoding="utf-8") as f:
                    content = f.read()
                    name = folder.replace("rlb-workflow-", "").replace("-", " ").capitalize()
                    description = "Lore ritual workflow"
                    if "---" in content:
                        parts = content.split("---")
                        if len(parts) >= 3:
                            try:
                                fm = yaml.safe_load(parts[1])
                                name = fm.get("name", name)
                                description = fm.get("description", description)
                            except:
                                pass
                    # Clean description from [instructional brackets]
                    description = re.sub(r'\s*\[.*?\]\s*', '', description).strip()
                    workflows.append(Agent(id=folder, name=name, description=description))
    return workflows

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

class PendingFile(BaseModel):
    name: str
    mime_type: str
    data: str

class ChatRequest(BaseModel):
    agent_id: str
    message: str
    history: List[dict] = []
    files: Optional[List[PendingFile]] = []

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
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured. Please use the Connect screen.")
    
    try:
        agent_context = get_agent_context(request.agent_id)
        model = genai.GenerativeModel(GEMINI_MODEL_ID, system_instruction=agent_context)
        
        # Convert history for AI Studio format
        history = []
        for h in request.history:
            role = "user" if h["role"] == "user" else "model"
            history.append({"role": role, "parts": [h["content"]]})
        
        chat_session = model.start_chat(history=history)
        
        parts = []
        if request.message.strip():
            parts.append(request.message)
            
        if request.files:
            import base64
            for f in request.files:
                parts.append({
                    "mime_type": f.mime_type,
                    "data": base64.b64decode(f.data)
                })
                
        response = chat_session.send_message(parts)
        
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
