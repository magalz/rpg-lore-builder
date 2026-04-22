import unittest
import os
import subprocess
from pathlib import Path

class TestManageBacklog(unittest.TestCase):
    def setUp(self):
        self.test_root = Path("test_rlb_root")
        self.backlog_file = self.test_root / "_bmad/memory/rlb/backlog-lore.md"
        if self.test_root.exists():
            import shutil
            shutil.rmtree(self.test_root)
        os.makedirs(self.test_root)

    def tearDown(self):
        import shutil
        if self.test_root.exists():
            shutil.rmtree(self.test_root)

    def run_script(self, *args):
        cmd = ["python", "skills/rlb-workflow-genesis/scripts/manage_backlog.py", "--project-root", str(self.test_root)] + list(args)
        return subprocess.run(cmd, capture_output=True, text=True)

    def test_add_item(self):
        self.run_script("--add", "Mago de Fogo", "--context", "Criação do Mundo")
        self.assertTrue(self.backlog_file.exists())
        content = self.backlog_file.read_text(encoding="utf-8")
        self.assertIn("Mago de Fogo", content)
        self.assertIn("🔴 Pendente", content)

    def test_resolve_item(self):
        self.run_script("--add", "Mago de Fogo", "--context", "Criação do Mundo")
        self.run_script("--resolve", "Mago de Fogo")
        content = self.backlog_file.read_text(encoding="utf-8")
        self.assertIn("🟢 Resolvido", content)

if __name__ == "__main__":
    unittest.main()
