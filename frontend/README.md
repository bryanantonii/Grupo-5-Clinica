# Clinora — Front-end Angular

Projeto Integrador SENAI. Interface baseada no Penpot, com a marca e a foto originais.

## Executar

Na pasta frontend:

```powershell
npm ci
npm start
```

Abra http://localhost:4200. As dependências já estão instaladas nesta máquina.

Para gerar a produção, execute npm run build. Os arquivos ficam em dist/frontend/browser/.

## Funcionalidades

- Início, profissionais com busca e filtro, perfil, convênios, contato e sobre.
- Agendamento em quatro etapas, confirmação, área do paciente, edição do perfil e cancelamento.
- Telas de acesso, cadastro e recuperação de senha para demonstração.
- Layout responsivo, menu para celular, navegação por teclado e formulários validados.

## Demonstração

Use dados fictícios. Entre com o mesmo e-mail informado no agendamento e qualquer senha fictícia de oito ou mais caracteres. Nenhuma senha é armazenada.

Os dados ficam na sessão da aba e sobrevivem ao recarregamento. Nenhuma consulta real é marcada e nenhum e-mail ou mensagem é enviado. A integração com o backend ainda precisa ser feita.

Os componentes ficam em src/app/features/clinora/, os dados da demonstração em clinora.service.ts e os estilos em src/estilos-do-grupo.css. O backend e os exemplos didáticos foram preservados.

A configuração environment.usarMock continua controlando apenas o módulo didático Produtos. Ela não conecta Clinora à API automaticamente.

## Verificação

Compilação de produção concluída e fluxos de agendamento, bloqueio de horário ocupado, persistência, consulta, cancelamento, contato e navegação no celular verificados no navegador.
