# 🤖 ClaudIA - Assistente Inteligente de Produtividade CLI

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" alt="LangChain" />
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
</p>

## 📋 Visão Geral

ClaudIA é um assistente inteligente de produtividade executado via linha de comando (CLI) que combina o poder da Inteligência Artificial com uma interface terminal interativa e elegante. Construído com Node.js, TypeScript e potencializado pelo LangChain/LangGraph, o ClaudIA oferece uma experiência conversacional natural para gerenciar sua produtividade através de lembretes, checkpoints de projetos e integração com calendários.

## ✨ Funcionalidades

### 🤖 Agente com IA
- **Processamento de Linguagem Natural**: Comunique-se com o agente usando linguagem natural
- **Interface Conversacional**: Interação intuitiva através de chat no terminal
- **Context-Aware**: O agente mantém contexto das conversas e aprende seus padrões
- **Respostas Inteligentes**: Powered by OpenAI GPT-4o-mini para respostas precisas

### 📝 Gerenciamento de Checkpoints
- **Criação de Marcos**: Crie checkpoints para marcos importantes dos seus projetos
- **Busca Inteligente**: Encontre checkpoints por projeto, data ou ID
- **Histórico Completo**: Visualize todo o progresso dos seus projetos
- **Organização por Projeto**: Agrupe checkpoints por nome do projeto

### ⏰ Sistema de Lembretes
- **Lembretes Personalizados**: Crie lembretes com mensagens personalizadas
- **Gerenciamento de Status**: Controle o status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- **Busca e Filtragem**: Encontre lembretes por status, data ou ID específico
- **Atualizações em Tempo Real**: Atualize status e acompanhe progresso

### 📅 Integração com Calendários (Planejado)
- **Suporte ao Google Calendar**: Integração com Google Calendar
- **Suporte ao Microsoft Calendar**: Integração com calendários Microsoft/Outlook
- **Busca de Eventos**: Recupere eventos para dias, semanas ou períodos personalizados
- **Análise de Tempo**: Calcule uso do tempo e identifique slots livres

### 🖥️ Interface Terminal Elegante
- **Blessed UI**: Interface rica e interativa no terminal
- **Design Responsivo**: Adapta-se a diferentes tamanhos de terminal
- **Navegação por Teclado**: Atalhos de teclado completos
- **Multiplataforma**: Funciona em macOS, Linux e Windows

## 🚀 Instalação

### Pré-requisitos
- Node.js (v16 ou superior)
- npm ou yarn
- Chave da API OpenAI (obrigatório)
- Credenciais Google Calendar API (opcional)
- Credenciais Microsoft Graph API (opcional)

### Instalação Rápida

```bash
# Clone o repositório
git clone https://github.com/your-username/claudia.git
cd ClaudIA

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Edite o arquivo .env e adicione sua chave da OpenAI (OBRIGATÓRIO)
# OPENAI_API_KEY=sua_chave_openai_aqui
# 
# Opcionalmente, adicione credenciais de calendário:
# GOOGLE_CLIENT_ID=seu_google_client_id
# GOOGLE_CLIENT_SECRET=seu_google_client_secret
# MICROSOFT_CLIENT_ID=seu_microsoft_client_id
# MICROSOFT_CLIENT_SECRET=seu_microsoft_client_secret

# Configure o banco de dados
npm run db:generate
npm run db:push

# Compile o projeto
npm run build

# Execute o ClaudIA
npm start
```

### Instalação Global (Recomendado)

Para usar o comando `claudia` de qualquer lugar do terminal:

```bash
# Navegue até o diretório do projeto
cd ClaudIA

# Instale globalmente usando npm link
npm link

# Agora você pode executar de qualquer lugar:
claudia
```

**Ou via npm (quando publicado):**

```bash
# Instalar globalmente via npm
npm install -g claudia-ai

# Executar de qualquer lugar
claudia
```

## 📚 Como Usar

### Comando Básico

```bash
# Inicie o ClaudIA (interface conversacional)
claudia
```

### Interações com o Agente IA

Após executar o comando `claudia`, você entrará no modo interativo onde pode conversar naturalmente com o assistente:

**Exemplos de Conversação:**

```
👤 Você: "Crie um checkpoint para o projeto website, concluí o design da homepage"
🤖 ClaudIA: ✓ Checkpoint criado com sucesso!
   - Projeto: website
   - Resumo: Concluí o design da homepage
   - ID: abc123...
   - Criado em: 26/08/2024 às 01:15

👤 Você: "Mostre todos os meus checkpoints do projeto website"
🤖 ClaudIA: 📋 Aqui estão os checkpoints do projeto 'website':
   1. Concluí o design da homepage (26/08/2024)
   2. Implementação do sistema de autenticação (25/08/2024)
   ...

👤 Você: "Crie um lembrete para revisar o código do backend"
🤖 ClaudIA: ✓ Lembrete criado!
   - Mensagem: Revisar o código do backend
   - Status: PENDING
   - ID: def456...

👤 Você: "Quais são meus lembretes pendentes?"
🤖 ClaudIA: 📋 Seus lembretes pendentes:
   1. Revisar o código do backend (PENDING)
   2. Ligar para o cliente (PENDING)
   ...

👤 Você: "Marque o primeiro lembrete como em progresso"
🤖 ClaudIA: ✓ Status atualizado!
   - Lembrete: Revisar o código do backend
   - Status alterado para: IN_PROGRESS
```

### Funcionalidades Disponíveis via Conversa

**Gerenciamento de Checkpoints:**
- “Crie um checkpoint para [projeto] com [descrição]”
- “Mostre todos os checkpoints”
- “Mostre checkpoints do projeto [nome]”
- “Mostre checkpoints desde [data]”
- “Encontre checkpoint com ID [id]”

**Gerenciamento de Lembretes:**
- “Crie um lembrete para [tarefa]”
- “Mostre meus lembretes pendentes”
- “Mostre todos os lembretes”
- “Marque lembrete [id] como concluído”
- “Mostre lembretes desde [data]”

**Busca e Análise:**
- “Resumo da minha produtividade”
- “Mostrar progresso dos projetos”
- “O que eu fiz esta semana?”

### Navegação na Interface

- **Enter**: Enviar pergunta/comando
- **Ctrl+C**: Sair da aplicação
- **Scroll**: Navegar pelo histórico de conversa

## 🔧️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```env
# Configuração da IA (OBRIGATÓRIO)
OPENAI_API_KEY=sua_chave_openai_aqui

# Google Calendar (OPCIONAL)
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
GOOGLE_REDIRECT_URI=sua_google_redirect_uri
GOOGLE_REFRESH_TOKEN=seu_google_refresh_token

# Microsoft Graph (OPCIONAL)
MICROSOFT_CLIENT_ID=seu_microsoft_client_id
MICROSOFT_CLIENT_SECRET=seu_microsoft_client_secret
MS_GRAPH_TOKEN=seu_ms_graph_token
MS_GRAPH_USER_EMAIL=email_do_usuario_ms

# Banco de Dados (gerado automaticamente)
DATABASE_URL="file:./prisma/dev.db"
```

**Nota:** Apenas a `OPENAI_API_KEY` é obrigatória para o funcionamento básico. As credenciais de calendário são opcionais e serão implementadas em versões futuras.

### Configuração da OpenAI API

1. Acesse [OpenAI Platform](https://platform.openai.com/)
2. Crie uma conta ou faça login
3. Navegue para "API Keys"
4. Crie uma nova chave de API
5. Adicione a chave ao seu arquivo `.env`:
   ```env
   OPENAI_API_KEY=sk-proj-...
   ```

### Configuração de Calendários (Futuro)

#### Google Calendar
1. Vá para o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a Google Calendar API
4. Crie credenciais (OAuth 2.0 Client ID)
5. Adicione as credenciais ao seu arquivo `.env`

#### Microsoft Calendar
1. Vá para o [Azure Portal](https://portal.azure.com/)
2. Registre uma nova aplicação
3. Configure permissões de API para Microsoft Graph
4. Gere client secret
5. Adicione as credenciais ao seu arquivo `.env`

## 🏢️ Arquitetura

### Estrutura Real do Projeto

```
ClaudIA/
├── bin/
│   └── claudia           # Script executável global
├── src/
│   ├── agent/            # Agente IA com LangChain/LangGraph
│   │   ├── agent.ts       # Implementação principal do agente
│   │   ├── prompts.ts     # System prompts e configurações
│   │   ├── tool-inventory.ts # Inventário de ferramentas
│   │   └── tools/         # Ferramentas do agente
│   │       ├── checkpoint-tools.ts
│   │       ├── reminder-tools.ts
│   │       └── calendar-tools.ts
│   ├── types/            # Definições TypeScript
│   └── index.ts          # Interface do usuário (Blessed UI)
├── prisma/
│   ├── schema.prisma     # Esquema do banco de dados
│   └── dev.db            # Banco SQLite
├── package.json          # Configurações e dependências
├── tsconfig.json        # Configuração TypeScript
└── .env                 # Variáveis de ambiente
```

### Tecnologias Principais

- **Node.js + TypeScript**: Base da aplicação
- **LangChain/LangGraph**: Framework para agentes de IA
- **OpenAI GPT-4o-mini**: Modelo de linguagem
- **Blessed**: Interface rica para terminal
- **Prisma ORM**: Mapeamento objeto-relacional
- **SQLite**: Banco de dados local
- **Zod**: Validação de esquemas TypeScript

### Padrão de Arquitetura

**Clean Architecture** com separação por domínios:
- **Agent Layer**: Lógica do agente IA e ferramentas
- **UI Layer**: Interface do usuário com Blessed
- **Data Layer**: Persistência com Prisma + SQLite
- **Domain Logic**: Use cases e entidades de negócio

## 🧪 Development

### Setup Development Environment

```bash
# Install development dependencies
npm install

# Run in development mode with hot reload
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

### Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "calendar"

# Run tests in watch mode
npm run test:watch
```

### Building

```bash
# Build for production
npm run build

# Build and package for distribution
npm run package
```

## 📚 API Reference

### Agent Commands

| Command | Description | Example |
|---------|-------------|---------|
| `remind` | Create a reminder | `remind "Call mom" --time "tomorrow 5pm"` |
| `checkpoint` | Create a checkpoint | `checkpoint "Phase 1 complete"` |
| `agenda` | View calendar events | `agenda today`, `agenda "next week"` |
| `todo` | Manage TODO lists | `todo add "Buy groceries"` |
| `help` | Show available commands | `help` |

### Configuration Options

| Option | Type | Description | Default |
|--------|------|-------------|----------|
| `calendar.provider` | string | Calendar provider (`google` or `microsoft`) | `google` |
| `ui.theme` | string | Terminal UI theme | `default` |
| `agent.model` | string | AI model to use | `gpt-3.5-turbo` |
| `storage.path` | string | Local database path | `./claudia.db` |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Follow the existing code style
- Use TypeScript for all new code
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](https://github.com/your-username/claudia/wiki)
- 🐛 [Issues](https://github.com/your-username/claudia/issues)
- 💬 [Discussions](https://github.com/your-username/claudia/discussions)
- 📧 Email: support@claudia.dev

## 🗺️ Roadmap

- [ ] Voice input/output capabilities
- [ ] Mobile app companion
- [ ] Team collaboration features
- [ ] Advanced AI scheduling optimization
- [ ] Plugin system for extensibility
- [ ] Cloud synchronization
- [ ] Multi-language support
- [ ] Slack/Teams integration

## 🙏 Acknowledgments

- LangChain team for the excellent AI framework
- Blessed library maintainers for the terminal UI capabilities
- Google and Microsoft for their calendar APIs
- OpenAI for the language model capabilities

---

<p align="center">
  Made with ❤️ by the ClaudIA team
</p>