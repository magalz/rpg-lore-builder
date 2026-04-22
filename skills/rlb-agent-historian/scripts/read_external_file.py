# /// script
# dependencies = [
#   "pypdf",
# ]
# requires-python = ">=3.9"
# ///

import os
import argparse
import sys
from pypdf import PdfReader

def extract_text_from_pdf(pdf_path):
    """Extrai texto de um arquivo PDF."""
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return f"Erro ao ler PDF {pdf_path}: {e}"

def extract_text_from_txt(txt_path):
    """Extrai texto de um arquivo TXT."""
    try:
        with open(txt_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"Erro ao ler TXT {txt_path}: {e}"

def main():
    parser = argparse.ArgumentParser(description="Extrai texto de arquivos PDF e TXT.")
    parser.add_argument("path", help="Caminho para um arquivo ou pasta.")
    args = parser.parse_args()

    if not os.path.exists(args.path):
        print(f"Erro: O caminho '{args.path}' não existe.")
        sys.exit(1)

    results = []

    if os.path.isfile(args.path):
        files_to_process = [args.path]
    else:
        files_to_process = [os.path.join(args.path, f) for f in os.listdir(args.path) 
                            if f.lower().endswith(('.pdf', '.txt'))]

    for file_path in files_to_process:
        print(f"--- Processando: {file_path} ---")
        if file_path.lower().endswith('.pdf'):
            text = extract_text_from_pdf(file_path)
        elif file_path.lower().endswith('.txt'):
            text = extract_text_from_txt(file_path)
        else:
            continue
        
        results.append(f"ORIGEM: {file_path}\nCONTÉUDO:\n{text}\n---")

    if not results:
        print("Nenhum arquivo compatível (.pdf, .txt) encontrado.")
    else:
        for r in results:
            print(r)

if __name__ == "__main__":
    main()
