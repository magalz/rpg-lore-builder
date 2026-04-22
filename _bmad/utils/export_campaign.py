import os
import zipfile
from datetime import datetime

def export_campaign(module_code='rlb'):
    """
    Empacota a memória do módulo em um arquivo .zip com timestamp.
    """
    base_dir = f'_bmad/memory/{module_code}'
    if not os.path.exists(base_dir):
        print(f"Erro: Pasta de memória '{base_dir}' não encontrada.")
        return

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_name = f'backup_{module_code}_{timestamp}.zip'
    
    print(f"Iniciando exportação da campanha '{module_code}'...")
    
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(base_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # Mantém a estrutura de pastas dentro do zip
                arcname = os.path.relpath(file_path, os.path.join(base_dir, '..'))
                zipf.write(file_path, arcname)
    
    print(f"Sucesso! Campanha exportada para: {zip_name}")

if __name__ == "__main__":
    export_campaign()
