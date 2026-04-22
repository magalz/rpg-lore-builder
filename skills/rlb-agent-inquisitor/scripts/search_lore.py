#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# ///
import sys
import os
from pathlib import Path

def search_lore():
    if len(sys.argv) < 3:
        print("Usage: python search_lore.py <project-root> <query>")
        sys.exit(1)

    project_root = Path(sys.argv[1])
    query = sys.argv[2].lower()
    wiki_path = project_root / "_bmad/memory/rlb/wiki"
    
    results = []
    if not wiki_path.exists():
        print(f"Wiki não encontrada em {wiki_path}")
        return

    for file in wiki_path.glob("*.md"):
        content = file.read_text(encoding="utf-8")
        if query in content.lower() or query in file.name.lower():
            results.append({
                "file": str(file.relative_to(project_root)),
                "snippet": content[:200].replace("\n", " ") + "..."
            })
    
    if results:
        print(f"Encontrados {len(results)} resultados para '{query}':")
        for res in results:
            print(f"- {res['file']}: {res['snippet']}")
    else:
        print(f"Nenhum resultado encontrado para '{query}'.")

if __name__ == "__main__":
    search_lore()
