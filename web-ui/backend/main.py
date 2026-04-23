import os
import yaml
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import vertexai
from vertexai.generative_models import GenerativeModel, ChatSession, Content, Part
from dotenv import load_dotenv

import google.auth

load_dotenv()

# Configuration
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
WIKI_PATH = os.path.join(PROJECT_ROOT, "_bmad/memory/rlb/wiki")
SKILLS_PATH = os.path.join(PROJECT_ROOT, "skills")

def get_gcp_config():
    project = os.getenv("GCP_PROJECT_ID")
    location = os.getenv("GCP_LOCATION", "us-central1")
    
    if not project:
        try:
            # Try to auto-detect from environment/gcloud
            credentials, project_id = google.auth.default()
            project = project_id
            print(f"Auto-detected GCP Project: {project}")
        except Exception:
            project = None
            
    return project, location

GCP_PROJECT, GCP_LOCATION = get_gcp_config()

if GCP_PROJECT:
    vertexai.init(project=GCP_PROJECT, location=GCP_LOCATION)

app = FastAPI(title="The Lore Sanctum API")

@app.get("/api/auth/status")
async def auth_status():
    project, _ = get_gcp_config()
    if not project:
        return {"authenticated": False, "reason": "No Project ID detected. Run 'gcloud auth application-default login'"}
    return {"authenticated": True, "project": project}

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
    if not GCP_PROJECT:
        raise HTTPException(status_code=500, detail="GCP_PROJECT_ID not configured in .env")
    
    try:
        agent_context = get_agent_context(request.agent_id)
        model = GenerativeModel("gemini-3-flash-preview", system_instruction=agent_context)
        
        # Convert history to Part objects
        history = []
        for h in request.history:
            role = "user" if h["role"] == "user" else "model"
            history.append(Content(role=role, parts=[Part.from_text(h["content"])]))
        
        chat_session = model.start_chat(history=history)
        response = chat_session.send_message(request.message)
        
        return {"response": response.text}
    except Exception as e:
        error_msg = str(e)
        print(f"Error during Vertex AI call: {error_msg}")
        if "Default Credentials" in error_msg or "401" in error_msg or "unauthenticated" in error_msg.lower():
            raise HTTPException(status_code=401, detail="Google Cloud Authentication Required")
        raise HTTPException(status_code=500, detail=f"Vertex AI Error: {error_msg}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
