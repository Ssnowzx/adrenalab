# ADRENASKT // SISTEMA_ONLINE 🛹👾

Sistema web retro-futurista com estética Cyberpunk/CRT desenvolvido para a marca AdrenaSKT. O projeto combina uma experiência de usuário imersiva (estilo desktop antigo) com funcionalidades modernas de e-commerce e segurança robusta.

---

## 🚀 Funcionalidades Implementadas

### 🖥️ Interface & UX
- **Desktop System**: Interface baseada em janelas arrastáveis (Loja, Sobre, Player).
- **Estética Cyberpunk**: Efeitos CRT, scanlines, fontes pixeladas e paleta de cores Neon Purple.
- **Full Page Sections**: Transições suaves para páginas de foco total (Login, Checkout, Perfil, Arquivo).

### 🔐 Autenticação & Usuários
- **Login/Cadastro**: Integração completa com **Supabase Auth**.
- **Perfil do Usuário**: Página exclusiva exibindo status, nível (Gamificação) e data de entrada.
- **Histórico de Pedidos**: O usuário pode visualizar suas compras passadas, carregadas diretamente do banco de dados.

### 🛒 E-commerce & Checkout
- **Carrinho de Compras**: Gerenciamento de estado global e persistência.
- **Checkout Transparente**: Integração com **Mercado Pago Bricks** para pagamentos sem sair do site.
- **Segurança Backend**: Processamento de pagamentos e gravação de pedidos feitos via **Serverless Functions** (`api/process-payment.js`), eliminando vulnerabilidades de injeção de dados pelo frontend.

---

## ⚠️ CONFIGURAÇÃO CRÍTICA (DEPLOY / PRODUÇÃO) ⚠️

Para garantir que o checkout e o salvamento de pedidos funcionem corretamente e com segurança máxima, você **PRECISA** configurar as Variáveis de Ambiente no seu serviço de hospedagem (Recomendado: **Vercel**).

**Não pule esta etapa, ou o sistema de vendas falhará.**

Vá em **Settings > Environment Variables** no painel da Vercel e adicione:

| Nome da Variável | Valor (Onde encontrar) | Descrição |
| :--- | :--- | :--- |
| `MP_ACCESS_TOKEN` | `APP_USR-...` | Painel Dev Mercado Pago > Credenciais de Produção. |
| `SUPABASE_URL` | `https://....supabase.co` | Supabase > Project Settings > API > Project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_...` | Supabase > Project Settings > API > Project API Keys (**Service Role**). |

> **IMPORTANTE**: A chave `SUPABASE_SERVICE_ROLE_KEY` dá acesso total ao seu banco de dados. **Nunca** a coloque no código público (`.js`, `.html`). Ela deve viver apenas no servidor (Variáveis de Ambiente).

---

## 🛠️ Banco de Dados (Configuração Inicial)

O sistema depende de tabelas específicas no Supabase. O script de criação está salvo na raiz do projeto como `supabase_schema.sql`.

**Passos para configurar:**
1. Abra o **SQL Editor** no painel do Supabase.
2. Copie todo o conteúdo do arquivo `supabase_schema.sql`.
3. Cole e execute (`Run`) no editor.

Isso criará:
- Tabela `profiles` (Perfis de usuário e níveis).
- Tabela `orders` (Pedidos).
- Tabela `order_items` (Itens comprados).
- Triggers automáticos para novos usuários.
- Políticas de Segurança (RLS) para proteger os dados.

---

## 📂 Estrutura do Projeto

- **`index.html`**: Estrutura principal, contendo o Desktop e as Seções Full Page.
- **`api/`**: Funções Backend (Serverless).
  - `process-payment.js`: Cérebro do checkout. Recebe o pagamento, valida com MP e salva no Supabase.
- **`src/js/`**:
  - `app.js`: Ponto de entrada e inicialização.
  - `core/`: Lógica de negócios (`checkoutManager.js`, `store.js`, `supabaseClient.js`).
  - `components/`: Lógica de UI (`authManager.js`).

---

## 💻 Como Rodar Localmente

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Rodar servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

*Nota: Para testar o fluxo de checkout completo localmente (pagamento + banco), você precisará configurar as variáveis de ambiente localmente (ex: usando Vercel CLI `vercel dev`) ou subir para um ambiente de preview.*

---

