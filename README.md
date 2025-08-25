# ClaudIA - Intelligent CLI Productivity Platform

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" alt="LangChain" />
</p>

## 📋 Overview

ClaudIA is an intelligent command-line productivity platform that combines the power of AI with seamless calendar integration. Built with Node.js and enhanced with LangChain/LangGraph, ClaudIA provides an interactive terminal interface for managing your daily productivity through reminders, checkpoints, TODO lists, and intelligent scheduling assistance.

## ✨ Features

### 🤖 AI-Powered Agent
- **Natural Language Processing**: Communicate with the AI agent using natural language
- **Intelligent Task Management**: Create and organize reminders, checkpoints, and TODOs
- **Smart Scheduling**: Get personalized recommendations on task prioritization and timing
- **Context-Aware Assistance**: The agent learns your patterns and preferences

### 📅 Calendar Integration
- **Google Calendar Support**: Seamlessly sync with your Google Calendar
- **Microsoft Calendar Support**: Full integration with Microsoft/Outlook calendars
- **Event Retrieval**: Get events for specific days, weeks, or custom time ranges
- **Real-time Sync**: Stay updated with your latest calendar changes

### 📝 Productivity Tools
- **Reminders**: Set and manage time-based reminders
- **Checkpoints**: Create milestone markers for your projects
- **TODO Lists**: Generate and manage intelligent task lists
- **Priority Management**: AI-assisted task prioritization

### 🖥️ Terminal Interface
- **Blessed UI**: Rich, interactive terminal user interface
- **Cross-platform**: Works on macOS, Linux, and Windows
- **Keyboard Navigation**: Full keyboard shortcuts and navigation
- **Responsive Design**: Adapts to different terminal sizes

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Google Calendar API credentials (optional)
- Microsoft Graph API credentials (optional)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/claudia.git
cd claudia

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Configure your API keys in .env file
# GOOGLE_CALENDAR_CLIENT_ID=your_google_client_id
# GOOGLE_CALENDAR_CLIENT_SECRET=your_google_client_secret
# MICROSOFT_GRAPH_CLIENT_ID=your_microsoft_client_id
# MICROSOFT_GRAPH_CLIENT_SECRET=your_microsoft_client_secret
# OPENAI_API_KEY=your_openai_api_key

# Build the project
npm run build

# Start ClaudIA
npm start
```

### Global Installation

```bash
# Install globally via npm
npm install -g claudia-cli

# Run from anywhere
claudia
```

## 📖 Usage

### Basic Commands

```bash
# Start the interactive CLI
claudia

# Quick reminder creation
claudia remind "Meeting with team" --time "2024-01-15 14:00"

# Create a checkpoint
claudia checkpoint "Project milestone completed"

# Get today's agenda
claudia agenda today

# Get this week's events
claudia agenda week
```

### AI Agent Interactions

Once in the interactive mode, you can communicate naturally with the AI agent:

```
> "Create a reminder for my dentist appointment tomorrow at 2 PM"
✓ Reminder created: Dentist appointment on Jan 16, 2024 at 2:00 PM

> "What should I work on next?"
📋 Based on your calendar and pending tasks, I recommend:
   1. Finish the quarterly report (due in 2 days)
   2. Prepare for tomorrow's team meeting
   3. Review code changes from yesterday

> "Show me my schedule for next week"
📅 Next week's schedule:
   Monday: Team standup (9 AM), Client call (3 PM)
   Tuesday: Free until 2 PM, then project review
   ...
```

### Configuration

ClaudIA can be configured through the `.env` file or command-line arguments:

```bash
# Custom configuration file
claudia --config /path/to/custom-config.json

# Specify calendar provider
claudia --calendar google

# Debug mode
claudia --debug
```

## 🛠️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# AI Configuration
OPENAI_API_KEY=your_openai_api_key
LANGCHAIN_API_KEY=your_langchain_api_key

# Google Calendar
GOOGLE_CALENDAR_CLIENT_ID=your_google_client_id
GOOGLE_CALENDAR_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/auth/callback

# Microsoft Graph
MICROSOFT_GRAPH_CLIENT_ID=your_microsoft_client_id
MICROSOFT_GRAPH_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_GRAPH_TENANT_ID=your_tenant_id

# Database (for local storage)
DATABASE_URL=sqlite:./claudia.db

# Logging
LOG_LEVEL=info
```

### Calendar Setup

#### Google Calendar
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Create credentials (OAuth 2.0 Client ID)
5. Add the credentials to your `.env` file

#### Microsoft Calendar
1. Go to [Azure Portal](https://portal.azure.com/)
2. Register a new application
3. Configure API permissions for Microsoft Graph
4. Generate client secret
5. Add the credentials to your `.env` file

## 🏗️ Architecture

```
claudia/
├── src/
│   ├── agent/           # LangChain/LangGraph AI agent
│   ├── calendar/        # Calendar integrations
│   ├── cli/            # Command-line interface
│   ├── ui/             # Blessed terminal UI components
│   ├── database/       # Local data storage
│   ├── utils/          # Utility functions
│   └── types/          # TypeScript type definitions
├── tests/              # Test files
├── docs/               # Documentation
└── config/            # Configuration files
```

### Key Technologies

- **Node.js**: Runtime environment
- **TypeScript**: Type-safe development
- **LangChain/LangGraph**: AI agent framework
- **Blessed**: Terminal UI library
- **SQLite**: Local database for data persistence
- **Google Calendar API**: Google calendar integration
- **Microsoft Graph API**: Microsoft calendar integration

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