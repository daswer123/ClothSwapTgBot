import fs from 'fs';
import path from 'path';
import axios from 'axios';

export async function createSessionPath(ctx) {
  const uniqueId = ctx.from.id; // получаем уникальный идентификатор пользователя
  const messageId = ctx.message.message_id; // получаем уникальный идентификатор сообщения
  const sessionPath = `sessions/${uniqueId}/${messageId}`;


  // Создаем папку для пользователя, если она еще не существует
  if (!fs.existsSync(sessionPath)) {
    await fs.promises.mkdir(sessionPath, { recursive: true });
  }
  return sessionPath;
}

export async function downloadPhoto(sessionPath, photo, telegram) {
  const photoPath = path.join(sessionPath, `input.jpg`);
  const photoFile = await telegram.getFileLink(photo.file_id);

  // Скачиваем файл
  const response = await axios.get(photoFile, { responseType: 'stream' });
  const writer = fs.createWriteStream(photoPath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(photoPath));
    writer.on('error', reject);
  });
}

// Отправить сообщение всем юзерам
export async function sendMessageToAllUsers(message, bot) {
  const sessionsDir = './sessions';
  const userIds = fs.readdirSync(sessionsDir).map(Number);

  for (const userId of userIds) {
    try {
      await bot.telegram.sendMessage(userId, message);
    } catch (error) {
      // Если пользователь заблокировал бота, пропустить и продолжить со следующим пользователем
      if (error.code === 403) {
        console.log(`Пользователь ${userId} заблокировал бота. Пропускаем.`);
        continue;
      }
      // Вывести ошибку для всех других случаев
      console.error(`Не удалось отправить сообщение пользователю ${userId}:`, error);
    }
  }
}