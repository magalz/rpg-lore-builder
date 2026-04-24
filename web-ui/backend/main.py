import os
import yaml
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import vertexai
from vertexai.generative_models import GenerativeModel, ChatSession, Content, Part
from dotenv import load_dotenv

from google.cloud import service_usage_v1, resourcemanager_v3
from googleapiclient.discovery import build
from google.auth.transport.requests import Request

load_dotenv()

# Configuration
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
WIKI_PATH = os.path.join(PROJECT_ROOT, "_bmad/memory/rlb/wiki")
SKILLS_PATH = os.path.join(PROJECT_ROOT, "skills")

def get_gcp_config():
    # Prioridade absoluta para o que o mestre salvou no .env
    project = os.getenv("GCP_PROJECT_ID")
    location = os.getenv("GCP_LOCATION", "global")
    return project, location

GCP_PROJECT, GCP_LOCATION = get_gcp_config()

if GCP_PROJECT:
    vertexai.init(project=GCP_PROJECT, location=GCP_LOCATION)

app = FastAPI(title="The Lore Sanctum API")

@app.get("/api/auth/projects")
async def list_projects():
    try:
        client = resourcemanager_v3.ProjectsClient()
        projects = client.search_projects()
        return [{"id": p.project_id, "name": p.display_name} for p in projects]
    except Exception as e:
        print(f"Error listing projects: {e}")
        return []

@app.get("/api/auth/status")
async def auth_status():
    user_email = None
    project_id = os.getenv("GCP_PROJECT_ID") # Apenas o que o mestre salvou manualmente
    
    try:
        import google.auth
        from google.auth.transport.requests import Request
        # Pegamos as credenciais, mas ignoramos o 'detected_project' para forçar o .env
        credentials, _ = google.auth.default(
            scopes=['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/cloud-platform']
        )
        
        # Tenta pegar o e-mail. Se der 403, o usuário está logado, mas o projeto atual está sem permissão.
        try:
            auth_request = Request()
            credentials.refresh(auth_request)
            service = build('oauth2', 'v2', credentials=credentials)
            user_info = service.userinfo().get().execute()
            user_email = user_info.get('email')
        except Exception as e:
            print(f"Aviso: Não foi possível obter o e-mail (provavelmente falta de permissão no projeto de cota): {e}")
            user_email = "Usuário Logado (E-mail indisponível)"

    except Exception as e:
        print(f"Erro de autenticação/login: {e}")
        return {"authenticated": False, "reason": "AUTH_REQUIRED", "message": "Login required."}

    # Só retornamos 'authenticated: True' se houver um projeto salvo no .env
    if not project_id:
        return {"authenticated": False, "reason": "NO_PROJECT", "message": "No Project ID detected.", "email": user_email}
    
    return {"authenticated": True, "project": project_id, "email": user_email}

class ProjectRequest(BaseModel):
    project_id: str

@app.post("/api/auth/project")
async def update_project(request: ProjectRequest):
    global GCP_PROJECT
    
    print(f"Ativando APIs necessárias para o projeto {request.project_id}...")
    try:
        import google.auth
        credentials, _ = google.auth.default(
            scopes=['https://www.googleapis.com/auth/cloud-platform']
        )
        client = service_usage_v1.ServiceUsageClient(credentials=credentials)
        
        # O formato para habilitar é: projects/{project_number_or_id}/services/{service_name}
        services = ["serviceusage.googleapis.com", "aiplatform.googleapis.com"]
        for service_name in services:
            print(f"Habilitando {service_name}...")
            # Usamos o objeto de request para garantir compatibilidade entre versões da biblioteca
            request_obj = service_usage_v1.EnableServiceRequest(
                name=f"projects/{request.project_id}/services/{service_name}"
            )
            operation = client.enable_service(request=request_obj)
            # Aguarda a operação terminar (pode levar alguns segundos)
            operation.result()
            
    except Exception as e:
        error_detail = str(e)
        print(f"Erro ao ativar APIs via SDK: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Erro ao configurar Google Cloud: {error_detail}")

    # 2. Update .env file
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    lines = []
    found = False
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                if line.startswith("GCP_PROJECT_ID="):
                    lines.append(f"GCP_PROJECT_ID={request.project_id}\n")
                    found = True
                else:
                    lines.append(line)
    
    if not found:
        lines.append(f"GCP_PROJECT_ID={request.project_id}\n")
    
    with open(env_path, "w") as f:
        f.writelines(lines)
    
    # 3. Reload in current session
    os.environ["GCP_PROJECT_ID"] = request.project_id
    GCP_PROJECT = request.project_id
    vertexai.init(project=GCP_PROJECT, location=GCP_LOCATION)
    
    return {"success": True, "project": request.project_id}

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
        model = GenerativeModel("gemini-3.1-flash-lite-preview", system_instruction=agent_context)
        
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
