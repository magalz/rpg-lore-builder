import unittest
import os
import subprocess
import shutil
from pathlib import Path

class TestSearchLore(unittest.TestCase):
    def setUp(self):
        self.test_root = Path("test_rlb_inquisitor_root")
        self.wiki_dir = self.test_root / "_bmad/memory/rlb/wiki"
        if self.test_root.exists():
            shutil.rmtree(self.test_root)
        os.makedirs(self.wiki_dir)
        
        # Criando arquivos de lore para teste
        (self.wiki_dir / "elveria.md").write_text("Elveria é uma cidade de elfos negros.", encoding="utf-8")
        (self.wiki_dir / "gods.md").write_text("Lathander é o deus do sol.", encoding="utf-8")

    def tearDown(self):
        if self.test_root.exists():
            shutil.rmtree(self.test_root)

    def run_script(self, query):
        cmd = ["python", "skills/rlb-agent-inquisitor/scripts/search_lore.py", str(self.test_root), query]
        return subprocess.run(cmd, capture_output=True, text=True)

    def test_search_found(self):
        result = self.run_script("Elveria")
        self.assertIn("Encontrados 1 resultados", result.stdout)
        self.assertIn("elveria.md", result.stdout)

    def test_search_not_found(self):
        result = self.run_script("Cyberpunk")
        self.assertIn("Nenhum resultado encontrado", result.stdout)

if __name__ == "__main__":
    unittest.main()
