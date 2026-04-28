import os
import yaml
import re
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv, dotenv_values
import argparse
import shutil
import zipfile
from datetime import datetime
from fastapi.responses import FileResponse

# Paths and Redirection Logic
parser = argparse.ArgumentParser()
parser.add_argument("--data-dir", help="Directory for persistent data (AppData)")
args, _ = parser.parse_known_args()

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
APP_DATA_DIR = args.data_dir if args.data_dir else PROJECT_ROOT

# Essential paths
# Essential paths
SKILLS_PATH = os.path.join(APP_DATA_DIR, "skills")
ENV_PATH = os.path.join(APP_DATA_DIR, "web-ui/backend/.env")
CAMPAIGNS_ROOT = os.path.join(APP_DATA_DIR, "campaigns")

# If we are in redirection mode, ensure base folders exist
if args.data_dir:
    os.makedirs(os.path.dirname(ENV_PATH), exist_ok=True)
    os.makedirs(SKILLS_PATH, exist_ok=True)
    os.makedirs(CAMPAIGNS_ROOT, exist_ok=True)
    
    # Initialize from project root if AppData is empty
    def sync_folder(src_rel, dest_full):
        src_full = os.path.join(PROJECT_ROOT, src_rel)
        if os.path.exists(src_full) and not os.listdir(dest_full):
            print(f"Instalando recursos iniciais em: {dest_full}")
            shutil.copytree(src_full, dest_full, dirs_exist_ok=True)

    sync_folder("skills", SKILLS_PATH)
    
    # Initialize default campaign if none exists
    default_wiki_dest = os.path.join(CAMPAIGNS_ROOT, "rlb", "wiki")
    if not os.path.exists(default_wiki_dest):
        os.makedirs(default_wiki_dest, exist_ok=True)
        sync_folder("_bmad/memory/rlb/wiki", default_wiki_dest)
    
    # Initial .env sync
    src_env = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(src_env) and not os.path.exists(ENV_PATH):
        shutil.copy2(src_env, ENV_PATH)

def get_campaign_path(campaign_id: str, subfolder: str = "wiki"):
    """Returns the absolute path for a specific campaign subfolder."""
    return os.path.join(CAMPAIGNS_ROOT, campaign_id, subfolder)

# Load configuration from the resolved ENV_PATH
env_config = dotenv_values(ENV_PATH)

# Initialize AI Studio
GEMINI_API_KEY = env_config.get("GEMINI_API_KEY")
GEMINI_MODEL_ID = env_config.get("GEMINI_MODEL_ID", "gemini-1.5-flash")
GEMINI_AUTO_SAVE = env_config.get("GEMINI_AUTO_SAVE", "true").lower() == "true"

def configure_genai(api_key: str):
    global GEMINI_API_KEY
    GEMINI_API_KEY = api_key
    genai.configure(api_key=api_key, transport="rest")

if GEMINI_API_KEY:
    configure_genai(GEMINI_API_KEY)

app = FastAPI(title="The Lore Sanctum API")

@app.get("/api/auth/status")
async def auth_status():
    local_env = dotenv_values(ENV_PATH)
    api_key = local_env.get("GEMINI_API_KEY")
    model_id = local_env.get("GEMINI_MODEL_ID", "gemini-1.5-flash")
    auto_save = local_env.get("GEMINI_AUTO_SAVE", "true").lower() == "true"
    if not api_key:
        return {"authenticated": False, "reason": "No valid API key detected in .env", "model_id": model_id, "auto_save": auto_save}
    return {"authenticated": True, "model_id": model_id, "auto_save": auto_save}

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
    auto_save: Optional[bool] = True

@app.post("/api/auth/configure")
async def configure_auth(request: AuthConfigureRequest):
    try:
        lines = []
        key_found = False
        model_found = False
        auto_save_found = False
        
        # Clean inputs
        clean_key = request.api_key.strip() if request.api_key else None
        clean_model = request.model_id.strip() if request.model_id else None
        auto_save_val = "true" if request.auto_save else "false"

        if os.path.exists(ENV_PATH):
            with open(ENV_PATH, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("GEMINI_API_KEY=") and clean_key:
                        lines.append(f"GEMINI_API_KEY={clean_key}\n")
                        key_found = True
                    elif line.startswith("GEMINI_MODEL_ID=") and clean_model:
                        lines.append(f"GEMINI_MODEL_ID={clean_model}\n")
                        model_found = True
                    elif line.startswith("GEMINI_AUTO_SAVE="):
                        lines.append(f"GEMINI_AUTO_SAVE={auto_save_val}\n")
                        auto_save_found = True
                    else:
                        lines.append(line)
        
        if not key_found and clean_key:
            lines.append(f"GEMINI_API_KEY={clean_key}\n")
        if not model_found and clean_model:
            lines.append(f"GEMINI_MODEL_ID={clean_model}\n")
        if not auto_save_found:
            lines.append(f"GEMINI_AUTO_SAVE={auto_save_val}\n")
            
        with open(ENV_PATH, "w", encoding="utf-8") as f:
            f.writelines(lines)
            
        # Update runtime config
        global GEMINI_MODEL_ID, GEMINI_API_KEY, GEMINI_AUTO_SAVE
        if clean_model:
            GEMINI_MODEL_ID = clean_model
        
        GEMINI_AUTO_SAVE = request.auto_save if request.auto_save is not None else True

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
        if os.path.exists(ENV_PATH):
            with open(ENV_PATH, "r", encoding="utf-8") as f:
                lines = f.readlines()
            with open(ENV_PATH, "w", encoding="utf-8") as f:
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

@app.get("/api/campaigns")
async def list_campaigns():
    if not os.path.exists(CAMPAIGNS_ROOT):
        return []
    return [name for name in os.listdir(CAMPAIGNS_ROOT) if os.path.isdir(os.path.join(CAMPAIGNS_ROOT, name))]

@app.post("/api/campaigns")
async def create_campaign(name: str):
    path = os.path.join(CAMPAIGNS_ROOT, name)
    if os.path.exists(path):
        raise HTTPException(status_code=400, detail="Campaign already exists")
    os.makedirs(os.path.join(path, "wiki"), exist_ok=True)
    return {"status": "success", "id": name}

@app.get("/api/campaigns/{campaign_id}/export")
async def export_campaign_zip(campaign_id: str):
    campaign_path = os.path.join(CAMPAIGNS_ROOT, campaign_id)
    if not os.path.exists(campaign_path):
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_filename = f"backup_{campaign_id}_{timestamp}.zip"
    zip_path = os.path.join(APP_DATA_DIR, zip_filename)
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(campaign_path):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, campaign_path)
                zipf.write(file_path, arcname)
    
    return FileResponse(zip_path, filename=zip_filename, background=None)

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

def build_wiki_tree(base_path: str, wiki_root: str, current_rel_path: str = "") -> List[WikiNode]:
    full_path = os.path.join(base_path, current_rel_path)
    nodes = []
    if not os.path.exists(full_path):
        return nodes
        
    for entry in os.scandir(full_path):
        entry_rel_path = os.path.relpath(entry.path, wiki_root)
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
async def list_wiki(campaign_id: str = "rlb"):
    wiki_path = get_campaign_path(campaign_id, "wiki")
    if not os.path.exists(wiki_path):
        return []
    return build_wiki_tree(wiki_path, wiki_path)

@app.get("/api/wiki/content")
async def get_wiki_content(path: str, campaign_id: str = "rlb"):
    wiki_path = get_campaign_path(campaign_id, "wiki")
    full_path = os.path.join(wiki_path, path)
    if not os.path.exists(full_path) or not os.path.isfile(full_path):
        raise HTTPException(status_code=404, detail="Wiki file not found")
    
    with open(full_path, "r", encoding="utf-8") as f:
        return {"content": f.read()}

# --- Tool Functions for Function Calling ---

def save_campaign_file(campaign_id: str, path: str, content: str) -> str:
    """
    Saves or updates a file within the campaign directory.
    Paths are relative to the campaign root (e.g., 'wiki/npcs/kael.md').
    """
    campaign_root = os.path.join(CAMPAIGNS_ROOT, campaign_id)
    full_path = os.path.abspath(os.path.join(campaign_root, path))
    
    # Security: Ensure we don't escape the campaign root
    if not full_path.startswith(os.path.abspath(campaign_root)):
        return "Error: Path escapes campaign sandbox."
    
    try:
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        return f"Successfully saved to {path}"
    except Exception as e:
        return f"Error saving file: {str(e)}"

def read_campaign_file(campaign_id: str, path: str) -> str:
    """Reads a file from the campaign directory. Path is relative to campaign root."""
    campaign_root = os.path.join(CAMPAIGNS_ROOT, campaign_id)
    full_path = os.path.abspath(os.path.join(campaign_root, path))
    
    if not full_path.startswith(os.path.abspath(campaign_root)):
        return "Error: Access denied."
    
    if not os.path.exists(full_path):
        return "Error: File not found."
    
    try:
        with open(full_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {str(e)}"

def list_campaign_files(campaign_id: str, folder: str = "wiki") -> List[str]:
    """Lists files within a campaign subfolder. Path is relative to campaign root."""
    campaign_root = os.path.join(CAMPAIGNS_ROOT, campaign_id)
    full_path = os.path.abspath(os.path.join(campaign_root, folder))
    
    if not full_path.startswith(os.path.abspath(campaign_root)):
        return ["Error: Access denied."]
    
    if not os.path.exists(full_path):
        return []
        
    try:
        files = []
        for root, _, filenames in os.walk(full_path):
            for f in filenames:
                rel_p = os.path.relpath(os.path.join(root, f), campaign_root)
                files.append(rel_p.replace("\\", "/"))
        return files
    except Exception as e:
        return [f"Error listing files: {str(e)}"]

def save_agent_memory(campaign_id: str, agent_id: str, summary: str) -> str:
    """Saves a summary of the session as persistent memory for the agent in this campaign."""
    sanctum_path = os.path.join(CAMPAIGNS_ROOT, campaign_id, "sanctum", agent_id)
    os.makedirs(sanctum_path, exist_ok=True)
    memory_file = os.path.join(sanctum_path, "memory.md")
    
    try:
        # Append to memory with timestamp
        date_str = datetime.now().strftime("%Y-%m-%d %H:%M")
        with open(memory_file, "a", encoding="utf-8") as f:
            f.write(f"\n## Session Update ({date_str})\n{summary}\n")
        return "Memory updated successfully."
    except Exception as e:
        return f"Error saving memory: {str(e)}"

class PendingFile(BaseModel):
    name: str
    mime_type: str
    data: str

class ChatRequest(BaseModel):
    agent_id: str
    message: str
    campaign_id: str = "rlb"
    history: List[dict] = []
    files: Optional[List[PendingFile]] = []

def get_agent_context(agent_id: str, campaign_id: str) -> str:
    agent_path = os.path.join(SKILLS_PATH, agent_id)
    if not os.path.exists(agent_path):
        return ""
    
    context = []
    # Injected wiki path for the campaign
    campaign_root = os.path.join(CAMPAIGNS_ROOT, campaign_id)
    wiki_path = os.path.join(campaign_root, "wiki")
    
    # --- Sanctum Memory Injection ---
    sanctum_memory_path = os.path.join(campaign_root, "sanctum", agent_id, "memory.md")
    if os.path.exists(sanctum_memory_path):
        with open(sanctum_memory_path, "r", encoding="utf-8") as f:
            context.append(f"PAST KNOWLEDGE & MEMORIES FROM PREVIOUS SESSIONS:\n{f.read()}\n")

    # Read SKILL.md
    skill_file = os.path.join(agent_path, "SKILL.md")
    if os.path.exists(skill_file):
        with open(skill_file, "r", encoding="utf-8") as f:
            content = f.read()
            # Dynamic path injection
            content = content.replace("{WIKI_PATH}", wiki_path)
            content = content.replace("{CAMPAIGN_ROOT}", campaign_root)
            # Broad replacement for any subfolders (wiki, raw, schema, etc)
            content = content.replace("_bmad/memory/rlb", campaign_root)
            context.append(f"INSTRUCTIONS FOR YOUR ROLE:\n{content}")
    
    # Read references
    ref_path = os.path.join(agent_path, "references")
    if os.path.exists(ref_path):
        context.append("\nOPERATIONAL PROCEDURES:")
        for file in os.listdir(ref_path):
            if file.endswith(".md"):
                with open(os.path.join(ref_path, file), "r", encoding="utf-8") as f:
                    content = f.read()
                    content = content.replace("{WIKI_PATH}", wiki_path)
                    content = content.replace("{CAMPAIGN_ROOT}", campaign_root)
                    content = content.replace("_bmad/memory/rlb", campaign_root)
                    context.append(f"\n--- Procedure: {file} ---\n{content}")
    
    return "\n".join(context)

@app.post("/api/chat")
async def chat(request: ChatRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured. Please use the Connect screen.")
    
    try:
        agent_context = get_agent_context(request.agent_id, request.campaign_id)
        
        # --- Function Calling Setup ---
        # We wrap the tool functions to bake in the campaign_id and agent_id
        def save_file(path: str, content: str) -> str:
            """Saves or updates a file within the campaign directory. Paths are relative to root (e.g., 'wiki/npcs/kael.md')."""
            return save_campaign_file(request.campaign_id, path, content)

        def read_file(path: str) -> str:
            """Reads a file from the campaign directory. Path is relative to campaign root."""
            return read_campaign_file(request.campaign_id, path)

        def list_files(folder: str = "wiki") -> List[str]:
            """Lists files within a campaign subfolder. Path is relative to campaign root."""
            return list_campaign_files(request.campaign_id, folder)

        def save_memory(summary: str) -> str:
            """Saves a summary of the session as persistent memory for the agent in this campaign."""
            return save_agent_memory(request.campaign_id, request.agent_id, summary)

        tools = [save_file, read_file, list_files, save_memory]
        
        model = genai.GenerativeModel(
            GEMINI_MODEL_ID, 
            system_instruction=agent_context,
            tools=tools
        )
        
        # Convert history for AI Studio format
        history = []
        for h in request.history:
            role = "user" if h["role"] == "user" else "model"
            history.append({"role": role, "parts": [h["content"]]})
        
        # Start chat with automatic function calling enabled if configured
        chat_session = model.start_chat(history=history, enable_automatic_function_calling=GEMINI_AUTO_SAVE)
        
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
        
        # Determine if a tool was used (for frontend notifications)
        tool_used = False
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if "function_call" in str(part):
                    tool_used = True
                    break

        return {
            "response": response.text,
            "tool_used": tool_used
        }
    except Exception as e:
        error_msg = str(e)
        print(f"Error during Gemini API call: {error_msg}")
        if "API key not valid" in error_msg or "401" in error_msg:
            raise HTTPException(status_code=401, detail="Invalid GEMINI_API_KEY")
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {error_msg}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
