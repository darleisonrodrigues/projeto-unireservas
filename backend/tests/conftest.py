"""
Configuração compartilhada dos testes.

Insere o diretório `backend/` no sys.path para que os módulos da aplicação
(`config`, `utils`, `models`) sejam importáveis exatamente como em `main.py`,
independentemente do diretório de onde o pytest for executado.

Estes testes cobrem unidades puras (settings, enums, parsing, validação de
modelos Pydantic) e por isso NÃO dependem de credenciais do Firebase — podem
rodar no CI sem segredos.
"""

import os
import sys

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
