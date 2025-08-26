import blessed from 'blessed';
import { askAgent } from './agent/agent';
import { logInfo, logError } from './utils/logger';

async function main(): Promise<void> {
  const screen = blessed.screen({
    smartCSR: true,
    title: '🤖 ClaudIA - Assistente Inteligente',
    fullUnicode: true,
  });
  logInfo('Application started');

  // Header com informações
  const header = blessed.box({
    top: 0,
    left: 0,
    width: '100%',
    height: 3,
    content: '{center}🤖 {bold}{blue-fg}ClaudIA{/blue-fg}{/bold} - Seu Assistente de IA Pessoal{/center}',
    tags: true,
    style: {
      fg: 'white',
      bg: 'blue',
      border: {
        fg: 'cyan'
      }
    },
    border: {
      type: 'line',
      fg: 6
    }
  });

  const chat = blessed.log({
    top: 3,
    left: 1,
    width: '98%',
    height: '82%',
    label: ' 💬 Conversa ',
    border: {
      type: 'line',
      fg: 5
    },
    style: {
      fg: 'white',
      bg: 'black',
      border: {
        fg: 'magenta'
      },
      label: {
        fg: 'magenta',
        bold: true
      }
    },
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
      ch: '█',
      style: {
        bg: 'magenta'
      }
    },
    padding: {
      left: 2,
      right: 2,
      top: 1,
      bottom: 1
    },
    tags: true
  });

  const input = blessed.textbox({
    bottom: 1,
    left: 1,
    height: 5,
    width: '98%',
    label: ' ✏️  Digite sua pergunta ',
    border: {
      type: 'line',
      fg: 2
    },
    style: {
      fg: 'white',
      bg: 'black',
      border: {
        fg: 'green'
      },
      label: {
        fg: 'green',
        bold: true
      },
      focus: {
        border: {
          fg: 'yellow'
        },
        label: {
          fg: 'yellow'
        }
      }
    },
    inputOnFocus: true,
    padding: {
      left: 1,
      right: 1
    }
  });

  // Status bar
  const statusBar = blessed.box({
    bottom: 0,
    left: 0,
    width: '100%',
    height: 1,
    content: ' 🔤 Ctrl+C para sair | 📝 Enter para enviar | 🔄 Aguardando sua pergunta...',
    style: {
      fg: 'black',
      bg: 'white'
    }
  });

  screen.append(header);
  screen.append(chat);
  screen.append(input);
  screen.append(statusBar);

  // Função para atualizar status
  const updateStatus = (message: string) => {
    statusBar.setContent(` ${message}`);
    screen.render();
  };

  // Mensagem de boas-vindas
  chat.add('{center}{bold}{cyan-fg}🌟 Bem-vindo ao ClaudIA! 🌟{/cyan-fg}{/bold}{/center}');
  chat.add('{center}{green-fg}Faça qualquer pergunta e eu te ajudo! 😊{/green-fg}{/center}');
  chat.add(''); // Linha em branco para espaçamento

  screen.key(['C-c', 'q'], () => {
    updateStatus('🔄 Encerrando aplicação...');
    logInfo('Application terminated by user');
    setTimeout(() => process.exit(0), 500);
  });

  input.on('submit', async (value: string) => {
    const question = value.trim();
    input.clearValue();
    screen.render();

    if (!question) {
      input.focus();
      return;
    }

    logInfo(`User question: ${question}`);

    // Formatação colorida para mensagem do usuário
    chat.add(`{bold}{blue-fg}👤 Você:{/blue-fg}{/bold} {white-fg}${question}{/white-fg}`);
    chat.add(''); // Linha em branco para espaçamento
    updateStatus('🤔 ClaudIA está pensando...');
    screen.render();

    try {
      const answer = await askAgent(question);
      logInfo(`Agent answer: ${answer}`);
      // Formatação colorida para resposta da IA
      chat.add(`{bold}{green-fg}🤖 ClaudIA:{/green-fg}{/bold} {yellow-fg}${answer}{/yellow-fg}`);
      chat.add(''); // Linha em branco para espaçamento
      updateStatus('✅ Resposta enviada! Digite sua próxima pergunta...');
    } catch (error) {
      logError((error as Error).message);
      chat.add(`{bold}{red-fg}❌ Erro:{/red-fg}{/bold} {red-fg}${(error as Error).message}{/red-fg}`);
      chat.add(''); // Linha em branco para espaçamento
      updateStatus('⚠️ Erro ocorreu! Tente novamente...');
    }

    screen.render();
    input.focus();
  });

  input.focus();
  screen.render();
}

main();

