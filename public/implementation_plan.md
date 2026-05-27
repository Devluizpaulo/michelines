# Sistema de Permissões Dinâmicas por Perfis (Roles)

Esta implementação adicionará controle dinâmico sobre as permissões de cada perfil (Role) no painel admin, armazenando as configurações no Firestore e permitindo que o Super Admin gerencie quais abas cada perfil pode acessar.

## Análise e Design

### 1. Novo fluxo de permissões dinâmicas
- Atualmente, as permissões são estáticas e estão definidas em `src/lib/permissions.ts`.
- Criaremos um documento no Firestore `role_permissions/config` para armazenar as permissões dinamicamente. Exemplo de estrutura:
  ```json
  {
    "gerente": ["dashboard", "leads", "campanhas", "landing", "frota", "analytics", "operacao"],
    "vendedor": ["dashboard", "leads"],
    "marketing": ["dashboard", "campanhas", "landing"]
  }
  ```
- No [`AuthContext.tsx`](file:///c:/Users/luiz1/Documents/GitHub/michelines/src/contexts/AuthContext.tsx), faremos uma escuta em tempo real (`onSnapshot`) desse documento.
- A função `canAccess` no Context lerá primeiro o estado de permissões dinâmicas. Se o documento do Firestore ainda não tiver carregado ou estiver offline, usará as permissões estáticas de `permissions.ts` como fallback.
- O perfil `super_admin` sempre terá permissão para todas as abas, evitando que o administrador se auto-bloqueie por engano.

### 2. Interface de Configuração para o Super Admin
No [`UserManager.tsx`](file:///c:/Users/luiz1/Documents/GitHub/michelines/src/components/admin/users/UserManager.tsx), adicionaremos uma seção interativa para o Super Admin gerenciar essas permissões.
- **Painel de Configuração:** Exibirá os perfis (Gerente, Vendedor, Marketing) e uma lista de checkboxes para cada aba do sistema.
- **Segurança de Acesso:** Apenas usuários logados com a role `super_admin` poderão visualizar ou editar este painel.
- **Ação de Salvar:** Um botão "Salvar Permissões de Acesso" gravará os novos mapeamentos diretamente no Firestore, atualizando em tempo real as telas de outros administradores conectados.

### 3. Criação de Administradores Iniciais
Criaremos um script utilitário para semear o primeiro Super Admin no banco de dados e no Firebase Auth, garantindo que o cliente possa fazer login e gerenciar outros usuários.

---

## Proposta de Mudanças

### Arquivos

#### [MODIFY] [AuthContext.tsx](file:///c:/Users/luiz1/Documents/GitHub/michelines/src/contexts/AuthContext.tsx)
- Adicionar escuta `onSnapshot` do documento `role_permissions/config`.
- Expor `customPermissions` na API do Contexto.
- Atualizar a função interna `canAccess` para utilizar as configurações dinâmicas com fallback.

#### [MODIFY] [UserManager.tsx](file:///c:/Users/luiz1/Documents/GitHub/michelines/src/components/admin/users/UserManager.tsx)
- Escutar ou carregar `role_permissions/config` para carregar o estado das checkboxes.
- Adicionar painel interativo de edição de abas permitidas por role.
- Implementar função `savePermissions` para gravar alterações no Firestore.

#### [NEW] [seed-admin.mjs](file:///c:/Users/luiz1/Documents/GitHub/michelines/scripts/seed-admin.mjs)
Script de linha de comando para criar os primeiros administradores no banco através da autenticação. Como o Firebase Auth não permite criação remota simples de usuários com senha segura sem SDK de Admin, o script informará como criar ou fará seed direto caso use as credenciais adequadas, ou criaremos um botão secreto/método de bypass temporário para o primeiro registro do Super Admin se necessário. (Nota: Já existe um fluxo de login funcional e possivelmente contas registradas, então o script ajudará a registrar o primeiro Super Admin do cliente).

---

## Plano de Execução

- [ ] Atualizar `AuthContext.tsx` para carregar permissões do Firestore.
- [ ] Atualizar `UserManager.tsx` com painel de gerenciamento de permissões e checkboxes para o Super Admin.
- [ ] Criar script `scripts/seed-admin.mjs` para facilitar a criação do primeiro Super Admin.
- [ ] Executar o script para garantir a existência dos primeiros administradores de teste.
- [ ] Verificar build e compatibilidade TypeScript.

---

## Plano de Verificação

### Testes Manuais
1. **Verificação de Fallback:** Abrir o painel admin. O sistema deve carregar normalmente usando o fallback estático de `permissions.ts` se o documento no banco não existir.
2. **Edição de Permissões:** Logado como `super_admin`, ir na aba "Usuários", remover a permissão da aba "Frota" para o perfil "Gerente" e clicar em salvar.
3. **Validação de Bloqueio:** Logar com uma conta com perfil "Gerente" e validar se a aba "Frota" sumiu do menu lateral e se o acesso direto à rota dela foi bloqueado.
4. **Atualização em Tempo Real:** Manter duas abas do navegador abertas (uma logada como `super_admin` e outra como `gerente`). Alterar as permissões como admin e ver o menu do gerente atualizar em tempo real sem precisar recarregar a página.
