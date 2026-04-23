import os
import subprocess
import sys

def run_auth():
    print("Tentando iniciar o fluxo de autenticação do Google Cloud...")
    try:
        # Tenta rodar o gcloud se estiver no PATH
        subprocess.run(["gcloud", "auth", "application-default", "login"], check=True)
        print("\nSucesso! Autenticação concluída.")
    except FileNotFoundError:
        print("\nErro: 'gcloud' não encontrado no seu sistema.")
        print("Para usar o Vertex AI localmente, você precisa instalar o Google Cloud SDK.")
        print("Visite: https://cloud.google.com/sdk/docs/install")
    except Exception as e:
        print(f"\nErro inesperado: {e}")

if __name__ == "__main__":
    run_auth()
