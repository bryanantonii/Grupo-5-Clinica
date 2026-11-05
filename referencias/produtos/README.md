# Exemplo didático da base do professor

Os 18 arquivos de Produtos foram preservados aqui com o conteúdo original.
Eles servem para consulta e estão fora das pastas `src` dos aplicativos.
Os exemplos usam as extensões `.ts.txt` e `.html.txt`: o conteúdo permanece
igual, mas o VS Code os trata como documentos de consulta, sem tentar resolver
imports e decorators de uma aplicação que não está mais nessa pasta.

- `backend/`: controller, módulo, service, schema, DTOs e oito testes do exemplo.
- `frontend/`: rotas, componentes, modelo e serviços do exemplo.

Esses arquivos não fazem parte do build, dos testes ou das rotas da Clinora.
Os imports relativos correspondem à posição original do exemplo; esta pasta
não é uma aplicação executável isoladamente.

As rotas reais da clínica estão documentadas em
[Rotas da Clinora](../../docs/rotas-clinora.md).
