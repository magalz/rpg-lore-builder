import unittest
import os
import sys
from unittest.mock import patch, MagicMock

# Adiciona o diretório scripts ao path para importar o módulo
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import read_external_file

class TestReadExternalFile(unittest.TestCase):

    def test_extract_text_from_txt(self):
        test_file = 'test.txt'
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write('Conteúdo de teste')
        
        content = read_external_file.extract_text_from_txt(test_file)
        self.assertEqual(content, 'Conteúdo de teste')
        
        os.remove(test_file)

    @patch('read_external_file.PdfReader')
    def test_extract_text_from_pdf(self, mock_pdf_reader):
        mock_page = MagicMock()
        mock_page.extract_text.return_value = 'Texto do PDF'
        
        mock_reader_instance = mock_pdf_reader.return_value
        mock_reader_instance.pages = [mock_page]
        
        content = read_external_file.extract_text_from_pdf('dummy.pdf')
        self.assertIn('Texto do PDF', content)

if __name__ == '__main__':
    unittest.main()
