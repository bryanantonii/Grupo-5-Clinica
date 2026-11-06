# Conferência no MongoDB Compass

Conferência visual concluída em 6 de novembro de 2026 no banco `clinora`, coleção `pacientes`, depois de conectar o Compass. O filtro por e-mail retornou um documento: o mesmo paciente fictício criado, editado e inativado pela interface Angular.

Foram conferidos o telefone editado `(51) 99999-1013`, `ativo: false`, `_id` e `convenio` como `ObjectId`, `createdAt` e `updatedAt`. A criação está registrada às 19:17:10 e a última atualização às 19:18:48, no horário de São Paulo. No Compass, esses timestamps aparecem em UTC, às 22:17:10 e 22:18:48.

Para repetir a conferência:

1. Abra `backend/.env` localmente e localize `MONGODB_URI`.
2. Copie somente o valor que começa com `mongodb+srv://`. Não inclua `MONGODB_URI=`, aspas, espaços ou quebra de linha. Não compartilhe esse valor no GitHub ou no chat.
3. No Compass, use **Add new connection**, cole o valor no campo da conexão e clique em **Connect**. A conexão antiga sem senha não precisa ser reutilizada.
4. Depois de conectar, abra `clinora` → `pacientes` → **Documents**.
5. No filtro, use `{"email":"teste.aula13.front@example.com"}` e clique em **Find**.
6. Confira o paciente fictício **Teste Aula 13 Integração**, `ativo: false`, o telefone `(51) 99999-1013`, `createdAt` e `updatedAt`.

O registro foi inativado pela interface da clínica e permanece no banco. Essa é a demonstração de exclusão lógica: ele deixa a lista de ativos, mas conserva o histórico.

A leitura pelo Mongoose e a conferência visual no Compass confirmaram os mesmos campos. A tela ficou aberta no paciente filtrado para a apresentação. As verificações no Compass foram somente de leitura.

A conexão salva inicialmente mostrou `Password cannot be empty`. O preenchimento da conexão foi corrigido e o Compass conectou normalmente. Se esse erro reaparecer, confira se foi copiado somente o valor completo da variável. A URL e as credenciais ficam fora da documentação e do Git.
