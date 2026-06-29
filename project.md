# Test Squadfy

**Contexto do Desafio**Crie uma aplicação onde um Tech Lead possa:

- Visualizar um catálogo de desenvolvedores (com nome, avatar, senioridade, custo e habilidades).
- Montar uma squad com até 5 membros (adicionando e removendo do catálogo).
- Visualizar métricas em tempo real (custo total, nível médio e cobertura de habilidades da squad).
- Salvar a composição da squad em uma base mockada.

**Requisitos Funcionais**

1. Autenticação
    - Tela de login com e-mail e senha (credenciais fixas).
    - A autenticação deve ser feita via servidor, com geração de token armazenado em cookie seguro (HttpOnly).
    - As rotas privadas (dashboard) devem ser protegidas contra acessos não autenticados.
2. Catálogo de Talentos
    - Utilize JSON Server para simular uma API REST com uma lista de pelo menos 20 perfis.
    - Exiba os perfis em cards com suporte a filtros (busca por nome e senioridade).
    - Consuma os dados utilizando uma biblioteca de gerenciamento de cache/server-state (ex: React Query).
3. Montagem da Squad
    - Área dedicada para exibir os membros selecionados (máximo de 5).
    - Botões para adicionar/remover membros.
    - O estado da squad (membros selecionados) deve ser gerenciado globalmente via Context API + useReducer, exposto por um hook customizado.
4. Painel de Métricas
    - Em tempo real, ao modificar a squad, atualize:
        - Custo total (somatório dos salários).
        - Nível médio da squad (baseado na senioridade).
        - Cobertura de habilidades (quais techs estão contempladas no time).
    - Atenção: O cálculo das métricas deve ser otimizado para evitar renderizações desnecessárias.
5. Persistência
    - Botão para "Salvar Squad" que envia os dados para o JSON Server via requisição POST, utilizando Server Actions do Next.js para a comunicação.

**Requisitos Técnicos (Obrigatórios)**

- Next.js 15+ (App Router).
- TypeScript (tipagem forte e rigorosa).
- Tailwind CSS (layout responsivo).
- Gerenciamento de estado cliente: Context API + useReducer (com separação clara de actions/reducer).
- Gerenciamento de estado servidor: React Query (cache, loading e erros da API).
- Segurança: Autenticação stateless com cookies HttpOnly e proteção de rotas.
- Server Actions: Utilize para as operações que exigem interação direta com o servidor (login e salvamento).

**Diferenciais (Pontos Extras)**

- Testes unitários com Jest para as funções de cálculo das métricas.
- README com seção de "Decisões Arquitetônicas" explicando suas escolhas (ex: por que optou por determinado padrão de estado, como organizou as pastas, etc.).
- Deploy na Vercel (ou similares) para facilitar a visualização.

**Instruções de Entrega**

1. Repositório: Crie um repositório público no GitHub.
2. JSON Server: Inclua no package.json um script para rodar o mock (db.json).
3. README.md: Deve conter as instruções para rodar o projeto e a seção de decisões arquitetônicas.
4. Prazo: Envie o link do repositório respondendo a este e-mail até quinta-feira 02/07.