import blessed from 'blessed';
import { askAgent } from './agent/agent';

async function main(): Promise<void> {
  const screen = blessed.screen({
    smartCSR: true,
    title: 'ClaudIA',
  });

  const chat = blessed.log({
    top: 0,
    left: 0,
    width: '100%',
    height: '90%',
    label: 'Conversa',
    border: 'line',
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
      ch: ' ',
      inverse: true,
    },
  });

  const input = blessed.textbox({
    bottom: 0,
    left: 0,
    height: '10%',
    width: '100%',
    label: 'Pergunte',
    border: 'line',
    inputOnFocus: true,
  });

  screen.append(chat);
  screen.append(input);

  screen.key(['C-c', 'q'], () => process.exit(0));

  input.on('submit', async (value) => {
    const question = value.trim();
    input.clearValue();
    screen.render();

    if (!question) {
      input.focus();
      return;
    }

    chat.add(`Você: ${question}`);
    screen.render();

    try {
      const answer = await askAgent(question);
      chat.add(`ClaudIA: ${answer}`);
    } catch (error) {
      chat.add(`Erro: ${(error as Error).message}`);
    }

    screen.render();
    input.focus();
  });

  input.focus();
  screen.render();
}

main();

