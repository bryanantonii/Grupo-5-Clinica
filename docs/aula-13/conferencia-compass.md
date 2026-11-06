# Conferência no MongoDB Compass

Na conferência de 6 de novembro, a conexão salva do Compass exibiu `Password cannot be empty`. A mesma `MONGODB_URI` do backend conectou ao Atlas pelo Mongoose, respondeu ao comando `ping` e permitiu ler o banco `clinora`. A falha observada está no preenchimento da conexão do Compass.

1. Abra `backend/.env` localmente e localize `MONGODB_URI`.
2. Copie somente o valor que começa com `mongodb+srv://`. Não inclua `MONGODB_URI=`, aspas, espaços ou quebra de linha. Não compartilhe esse valor no GitHub ou no chat.
3. No Compass, use **Add new connection**, cole o valor no campo da conexão e clique em **Connect**. A conexão antiga sem senha não precisa ser reutilizada.
4. Depois de conectar, abra `clinora` → `pacientes` → **Documents**.
5. No filtro, use `{"email":"teste.aula13.front@example.com"}` e clique em **Find**.
6. Confira o paciente fictício **Teste Aula 13 Integração**, `ativo: false`, o telefone `(51) 99999-1013`, `createdAt` e `updatedAt`.

O registro foi inativado pela interface da clínica e permanece no banco. Essa é a demonstração de exclusão lógica: ele deixa a lista de ativos, mas conserva o histórico.

A leitura pelo Mongoose confirmou esses campos após a edição no navegador. A conferência visual no Compass depende de concluir a conexão no aplicativo; este registro não a declara concluída. Se surgir outro erro, anote somente a mensagem, sem a URL ou senha.
