import blessed from 'blessed';
import { askAgent } from './agent/agent';
import { logInfo, logError, logWarn } from './utils/logger';

async function main(): Promise<void> {
  logInfo('UI', 'Starting ClaudIA application');
  
  const screen = blessed.screen({
    smartCSR: true,
    title: '🤖 ClaudIA - Assistente Inteligente',
    fullUnicode: true,
  });
  
  logInfo('UI', 'Blessed screen created successfully');

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
    alwaysScroll: false, // Mudado para false para permitir scroll manual
    mouse: true, // Habilita suporte ao mouse
    keys: true, // Habilita navegação por teclado
    vi: true, // Habilita navegação estilo vi (j/k para cima/baixo)
    scrollbar: {
      ch: '█',
      style: {
        bg: 'magenta'
      },
      track: {
        bg: 'black'
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
    content: ' 🔤 Ctrl+C sair | 📝 Enter enviar | Tab navegar | ⬆️⬇️ j/k scroll | Home/End înicio/fim | 🔄 Aguardando...',
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
  logInfo('UI', 'Displaying welcome message to user');
  chat.add('{center}{bold}{cyan-fg}🌟 Bem-vindo ao ClaudIA! 🌟{/cyan-fg}{/bold}{/center}');
  chat.add('{center}{green-fg}Faça qualquer pergunta e eu te ajudo! 😊{/green-fg}{/center}');
  chat.add('');
  
  // Instruções sobre navegação
  chat.add('{bold}{magenta-fg}📚 Como navegar pelo chat:{/magenta-fg}{/bold}');
  chat.add('  • {yellow-fg}Tab{/yellow-fg} - Alternar entre chat e input');
  chat.add('  • {yellow-fg}↑↓ ou j/k{/yellow-fg} - Rolar para cima/baixo');
  chat.add('  • {yellow-fg}Page Up/Down{/yellow-fg} - Rolar rapidamente');
  chat.add('  • {yellow-fg}Home/End{/yellow-fg} - Ir para início/fim');
  chat.add('  • {yellow-fg}Mouse{/yellow-fg} - Clique e scroll wheel');
  chat.add('');
  
  // Role para baixo para mostrar as instruções mais recentes
  chat.setScrollPerc(100);

  // Controles de navegação e scroll
  let chatFocused = false;
  
  // Função para alternar entre chat e input
  const toggleFocus = () => {
    if (chatFocused) {
      input.focus();
      chatFocused = false;
      updateStatus('✏️ Modo digitação - Digite sua pergunta e pressione Enter');
    } else {
      chat.focus();
      chatFocused = true;
      updateStatus('📖 Modo leitura - Use ↑↓ ou j/k para navegar, Tab para voltar ao input');
    }
    screen.render();
  };

  // Tab para alternar entre chat e input
  screen.key(['tab'], toggleFocus);
  
  // Escape para focar no input
  screen.key(['escape'], () => {
    input.focus();
    chatFocused = false;
    updateStatus('✏️ Retornando ao input - Digite sua pergunta');
    screen.render();
  });
  
  // Controles quando o chat está focado
  chat.key(['up', 'k'], () => {
    chat.scroll(-1);
    screen.render();
  });
  
  chat.key(['down', 'j'], () => {
    chat.scroll(1);
    screen.render();
  });
  
  chat.key(['pageup'], () => {
    chat.scroll(-10);
    screen.render();
  });
  
  chat.key(['pagedown'], () => {
    chat.scroll(10);
    screen.render();
  });
  
  // Home vai para o início do chat
  chat.key(['home', 'g'], () => {
    chat.setScrollPerc(0);
    screen.render();
  });
  
  // End vai para o final do chat
  chat.key(['end', 'G'], () => {
    chat.setScrollPerc(100);
    screen.render();
  });

  screen.key(['C-c', 'q'], () => {
    logInfo('UI', 'User requested application exit');
    updateStatus('🔄 Encerrando aplicação...');
    setTimeout(() => {
      logInfo('UI', 'ClaudIA application shutting down');
      process.exit(0);
    }, 500);
  });

  input.on('submit', async (value: string) => {
    const question = value.trim();
    input.clearValue();
    screen.render();

    if (!question) {
      logWarn('UI', 'User submitted empty question');
      input.focus();
      return;
    }
    
    logInfo('UI', 'User submitted question', { 
      questionLength: question.length,
      question: question.substring(0, 100) // Log first 100 chars for privacy
    });

    // Formatação colorida para mensagem do usuário
    chat.add(`{bold}{blue-fg}👤 Você:{/blue-fg}{/bold} {white-fg}${question}{/white-fg}`);
    chat.add(''); // Linha em branco para espaçamento
    
    // Role para baixo após adicionar mensagem do usuário
    chat.setScrollPerc(100);
    
    updateStatus('🤔 ClaudIA está pensando...');
    screen.render();
    
    logInfo('UI', 'Sending question to agent');

    try {
      const answer = await askAgent(question);
      
      logInfo('UI', 'Received response from agent', { 
        answerLength: answer.length 
      });
      
      // Formatação colorida para resposta da IA
      chat.add(`{bold}{green-fg}🤖 ClaudIA:{/green-fg}{/bold} {yellow-fg}${answer}{/yellow-fg}`);
      chat.add(''); // Linha em branco para espaçamento
      
      // Role para baixo após adicionar resposta da IA
      chat.setScrollPerc(100);
      
      updateStatus('✅ Resposta enviada! Digite sua próxima pergunta...');
    } catch (error) {
      logError('UI', 'Error occurred during agent interaction', error as Error, { question });
      
      chat.add(`{bold}{red-fg}❌ Erro:{/red-fg}{/bold} {red-fg}${(error as Error).message}{/red-fg}`);
      chat.add(''); // Linha em branco para espaçamento
      
      // Role para baixo após adicionar mensagem de erro
      chat.setScrollPerc(100);
      
      updateStatus('⚠️ Erro ocorreu! Tente novamente...');
    }

    screen.render();
    input.focus();
    chatFocused = false; // Garantir que o input esteja focado após a resposta
  });

  input.focus();
  screen.render();
  
  logInfo('UI', 'ClaudIA UI fully initialized and ready for interaction');
}

main().catch((error) => {
  logError('UI', 'Fatal error in main function', error as Error);
  console.error('Fatal error:', error);
  process.exit(1);
});

