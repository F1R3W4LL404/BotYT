const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const chalk = require('chalk').default;

dotenv.config();

const token = process.env.TELEGRAM_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL;

if (!token || !webhookUrl) {
  console.error(chalk.red('El token o la URL del webhook no están configurados.'));
  process.exit(1);
}

const bot = new TelegramBot(token);

// Configurar el webhook
bot.setWebHook(`${webhookUrl}/bot${token}`)
  .then(() => {
    console.log(chalk.green('Webhook configurado correctamente.'));
  })
  .catch((error) => {
    console.error(chalk.red('Error al configurar el webhook:', error));
  });

// Variable para almacenar el estado del menú
const menuStates = new Map();

// Manejar la solicitud de inicio del bot
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const options = {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: '🎵 Música' }],
        [{ text: '🎥 Video' }]
      ],
      one_time_keyboard: true
    })
  };

  bot.sendMessage(chatId, '¿Qué quieres convertir?', options)
    .then((message) => {
      // Registrar el estado del menú
      menuStates.set(chatId, 'conversion');
      menuStates.set(chatId, message.message_id);
    })
    .catch((error) => {
      console.error(chalk.red('Error al enviar el mensaje:', error));
    });
});

// Manejar las respuestas del menú de conversión
bot.onText(/🎵 Música/, (msg) => {
  const chatId = msg.chat.id;

  // Eliminar el teclado personalizado después de la selección
  bot.sendMessage(chatId, 'Opciones:', {
    reply_markup: {
      remove_keyboard: true
    }
  })
    .then((message) => {
      // Mostrar el botón "Regresar"
      const options = {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: '⬅️ Regresar', callback_data: 'regresar' }]
          ]
        })
      };

      // Actualizar el mensaje existente
      bot.editMessageText('Has seleccionado convertir música.', {
        chat_id: chatId,
        message_id: menuStates.get(chatId),
        reply_markup: options.reply_markup
      })
        .catch((error) => {
          console.error(chalk.red('Error al actualizar el mensaje:', error));
        });
    })
    .catch((error) => {
      console.error(chalk.red('Error al enviar el mensaje:', error));
    });
});

bot.onText(/🎥 Video/, (msg) => {
  const chatId = msg.chat.id;

  // Eliminar el teclado personalizado después de la selección
  bot.sendMessage(chatId, 'Opciones:', {
    reply_markup: {
      remove_keyboard: true
    }
  })
    .then((message) => {
      // Mostrar el botón "Regresar"
      const options = {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: '⬅️ Regresar', callback_data: 'regresar' }]
          ]
        })
      };

      // Actualizar el mensaje existente
      bot.editMessageText('Has seleccionado convertir video.', {
        chat_id: chatId,
        message_id: menuStates.get(chatId),
        reply_markup: options.reply_markup
      })
        .catch((error) => {
          console.error(chalk.red('Error al actualizar el mensaje:', error));
        });
    })
    .catch((error) => {
      console.error(chalk.red('Error al enviar el mensaje:', error));
    });
});

// Manejar el botón "Regresar"
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;

  if (query.data === 'regresar') {
    if (menuStates.get(chatId) === 'retorno') {
      const options = {
        reply_markup: JSON.stringify({
          keyboard: [
            [{ text: '🎵 Música' }],
            [{ text: '🎥 Video' }]
          ],
          one_time_keyboard: true
        })
      };

      // Actualizar el mensaje existente
      bot.editMessageText('¿Qué quieres convertir?', {
        chat_id: chatId,
        message_id: menuStates.get(chatId),
        reply_markup: options.reply_markup
      })
        .then(() => {
          // Actualizar el estado del menú
          menuStates.set(chatId, 'conversion');
        })
        .catch((error) => {
          console.error(chalk.red('Error al actualizar el mensaje:', error));
        });
    } else {
      console.error(chalk.red('No puedes usar este comando en este momento.'));
    }
  }
});

// Iniciar el bot
bot.startPolling()
  .then(() => {
    console.log(chalk.green('Bot iniciado correctamente.'));
  })
  .catch((error) => {
    console.error(chalk.red('Error al iniciar el bot:', error));
  });
