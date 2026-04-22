#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# ///
import sys
import os
from pathlib import Path
from datetime import date

SKILL_NAME = "rlb-agent-inquisitor"

def main():
    if len(sys.argv) < 3:
        sys.exit(1)
    
    project_root = Path(sys.argv[1]).resolve()
    skill_path = Path(sys.argv[2]).resolve()
    sanctum_path = project_root / "_bmad/memory" / SKILL_NAME
    
    sanctum_path.mkdir(parents=True, exist_ok=True)
    (sanctum_path / "sessions").mkdir(exist_ok=True)
    (sanctum_path / "references").mkdir(exist_ok=True)
    (sanctum_path / "scripts").mkdir(exist_ok=True)
    
    # Copia templates substituindo variáveis simples
    for template in (skill_path / "assets").glob("*-template.md"):
        output_name = template.name.replace("-template", "").upper()
        content = template.read_text(encoding="utf-8")
        content = content.replace("{user_name}", "Mestre")
        content = content.replace("{birth_date}", date.today().isoformat())
        (sanctum_path / output_name).write_text(content, encoding="utf-8")
        
    print(f"Sanctuário criado em {sanctum_path}")

if __name__ == "__main__":
    main()
