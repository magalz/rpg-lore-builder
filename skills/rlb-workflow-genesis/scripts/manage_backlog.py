#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# ///
import argparse
import json
import os
from pathlib import Path
from datetime import datetime

def manage_backlog():
    parser = argparse.ArgumentParser(description="Gerencia o Backlog de Lore para o módulo RLB.")
    parser.add_argument("--add", help="Termo a ser adicionado ao backlog")
    parser.add_argument("--context", help="Contexto onde o termo foi citado (arquivo ou citação)")
    parser.add_argument("--resolve", help="Termo a ser marcado como resolvido")
    parser.add_argument("--list", action="store_true", help="Lista pendências do backlog")
    parser.add_argument("--project-root", default=".", help="Raiz do projeto")
    
    args = parser.parse_args()
    
    backlog_path = Path(args.project_root) / "_bmad/memory/rlb/backlog-lore.md"
    os.makedirs(backlog_path.parent, exist_ok=True)
    
    # Inicializa o arquivo se não existir
    if not backlog_path.exists():
        with open(backlog_path, "w", encoding="utf-8") as f:
            f.write("# 📋 Backlog de Lore (RLB)\n\n| Termo | Status | Contexto | Data |\n| --- | --- | --- | --- |\n")

    if args.add:
        with open(backlog_path, "a", encoding="utf-8") as f:
            date = datetime.now().strftime("%Y-%m-%d")
            f.write(f"| {args.add} | 🔴 Pendente | {args.context or 'Não especificado'} | {date} |\n")
        print(f"Adicionado ao backlog: {args.add}")

    elif args.resolve:
        lines = backlog_path.read_text(encoding="utf-8").splitlines()
        new_lines = []
        found = False
        for line in lines:
            if f"| {args.resolve} |" in line:
                new_lines.append(line.replace("🔴 Pendente", "🟢 Resolvido"))
                found = True
            else:
                new_lines.append(line)
        
        if found:
            backlog_path.write_text("\n".join(new_lines) + "\n", encoding="utf-8")
            print(f"Termo resolvido: {args.resolve}")
        else:
            print(f"Termo não encontrado no backlog: {args.resolve}")

    elif args.list:
        content = backlog_path.read_text(encoding="utf-8")
        print(content)

if __name__ == "__main__":
    manage_backlog()
