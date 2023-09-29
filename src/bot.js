import { Telegraf, Markup, session } from "telegraf";
import { message } from "telegraf/filters";
import config from "config";
import axios from "axios"
import fs from "fs";
import path from "path";

import { createSessionPath, downloadPhoto, sendMessageToAllUsers } from "./botFunctions.js";
import { INITIAL_SESSION, SETTINGS } from "./initial_vars.js"
import { changeDress, colorizeAnime } from "./functions.js";
import { promises as fss } from 'fs';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const bot = new Telegraf(config.get("TELEGRAM_TOKEN"), { handlerTimeout: 600_000 });
bot.use(session());

process.setMaxListeners(0);

await bot.telegram.setMyCommands([
  { command: "start", description: "Начать работу с ботом" },
  { command: "settings", description: "Настройки трансформации" },
  { command: "reset", description: "Сбросить настройки" },
  { command: "dress", description: "Режим смены одежды на фото" },
  { command: "colorize", description: "Колоризировать аниме персонажа" },
  { command: "help", description: "Показать все команды" },
]);

bot.command("help", ctx => {
  ctx.reply(`/start - Начать работу с ботом\n/settings - Показать настройки трансформации\n/help - Показать все команды`)
})

bot.command("reset", ctx => {
  ctx.session = { ...INITIAL_SESSION }
  ctx.reply("Настройки сброшенны")
})

bot.use(async (ctx, next) => {
  const uniqueId = ctx.from.id;
  const userSessionDir = path.join('sessions', String(uniqueId));
  const sessionPath = path.join(userSessionDir, 'settings.json');

  // Создаем папку для пользователя, если она еще не существует
  try {
    await fss.mkdir(userSessionDir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error; // игнорируем ошибку, если директория уже существует
  }

  // Загружаем сессию при начале работы бота
  try {
    const sessionData = await fss.readFile(sessionPath);
    ctx.session = JSON.parse(sessionData.toString());
  } catch (error) {
    if (error.code !== 'ENOENT') throw error; // игнорируем ошибку, если файл не существует
    ctx.session = { ...INITIAL_SESSION };
  }

  // Передаем управление следующему middleware
  await next();

  // Сохраняем сессию после каждого обновления
  try {
    await fss.writeFile(sessionPath, Buffer.from(JSON.stringify(ctx.session)));
  } catch (error) {
    console.error(`Ошибка записи файла сессии: ${error}`);
  }
});



const startKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback('Настройки', 'settings'),
    Markup.button.callback('Колоризировать Аниме', 'colorize'),
  ],
  [
    Markup.button.callback('Сменить одежду', 'dress'),
  ]
]);


bot.command("start", async (ctx) => {

  await ctx.reply("Привет, я бот который умеет переодевать людей и аниме персонажей.\n\nДостаточно скинуть фотографию и через 30-40 секунд получишь результат", startKeyboard)


  const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

  // Загружаем сессии при запуске
  if (fs.existsSync(SESSIONS_FILE)) {
    const sessionsData = fs.readFileSync(SESSIONS_FILE);
    ctx.session = { ...INITIAL_SESSION };
    try {
      const sessions = JSON.parse(sessionsData);
      ctx.session = sessions;
    } catch (error) {
      ctx.session = INITIAL_SESSION;
      console.error(`Ошибка чтения файла сессий: ${error}`);
    }
  }
})


bot.on('photo', async (ctx) => {
  try {

    const sessionPath = await createSessionPath(ctx);

    if (ctx.session.colorizePhoto) {
      ctx.session.colorizePhoto = false

      const photo = ctx.message.photo.pop();
      const photoPath = await downloadPhoto(sessionPath, photo, ctx.telegram);

      ctx.session.photoToColorize = photoPath;
      console.log("Файл загружен");

      ctx.reply("Фото загруженно, введите что изображенно на фото\nНапример: blonde girl, red t-short, red bra\nstay in street")
      return ""
    }

    if (ctx.session.changeDress) {

      // Фотографии приходят в разных размерах, мы возьмем самую большую
      const photo = ctx.message.photo.pop();

      const photoPath = await downloadPhoto(sessionPath, photo, ctx.telegram);
      console.log(photoPath, "Файл загружен");

      ctx.reply("Файл успешно загружен, преобразование\nОжидайте результат в течении 1 минуты")
      await changeDress(ctx.session, photoPath)

      if (ctx.session.debug === true) {
        const mask1Path = path.join(sessionPath, 'mask1.png');
        const mask2Path = path.join(sessionPath, 'mask2.png');
        const mask3Path = path.join(sessionPath, 'mask3.png');

        // Убедитесь, что все файлы существуют, прежде чем отправлять их
        if (fs.existsSync(mask1Path) && fs.existsSync(mask2Path) && fs.existsSync(mask3Path)) {
          const mediaGroup = [
            { type: 'photo', media: { source: fs.readFileSync(mask1Path) } },
            { type: 'photo', media: { source: fs.readFileSync(mask2Path) } },
            { type: 'photo', media: { source: fs.readFileSync(mask3Path) } },
          ];

          await ctx.telegram.sendMediaGroup(ctx.chat.id, mediaGroup);
        }
      }

      // Выводим все что мы нагененрировали
      const mediaGroup = [];
      for (let i = 1; i <= 10; i++) {
        const imagePath = path.join(sessionPath, `ready_${0}_${i}.jpg`);
        if (fs.existsSync(imagePath)) {
          mediaGroup.push({ type: 'photo', media: { source: fs.readFileSync(imagePath) } });
        }
      }

      for (let i = 3; i <= 4; i++) {
        const imagePath = path.join(sessionPath, `ready_${1}_${i}.jpg`);
        if (fs.existsSync(imagePath)) {
          mediaGroup.push({ type: 'photo', media: { source: fs.readFileSync(imagePath) } });
        }
      }

      if (mediaGroup.length > 0) {
        await ctx.telegram.sendMediaGroup(ctx.chat.id, mediaGroup);
      }

      ctx.session.changeDress = false
      return
    }
    else {
      await ctx.reply("Бот принимает только фотографию, выберите настройки и скиньте фотографию кого-либо.\n\nДостаточно скинуть фотографию и через 30-40 секунд получишь результат", startKeyboard)
      ctx.session.colorizePhoto = false
      ctx.session.changeDress = false
      ctx.session.photoToColorize = ""
    }


  } catch (e) {
    ctx.reply("Что-то пошло не так, попробуйте снова")
    ctx.session.changeDress = false
    console.log(e)
  }

});


// Определите важные и неважные настройки
const IMPORTANT_SETTINGS = ['dino_thres', 'Dino_categore_1', 'prompt_1', 'den_str_1', 'one_mask', 'content_type', 'person', 'mask_expand'];
const OTHER_SETTINGS = Object.keys(SETTINGS).filter(setting => !IMPORTANT_SETTINGS.includes(setting));

bot.command('colorize', (ctx) => {
  ctx.session.colorizePhoto = true
  ctx.reply("Вы вошли в режим колоризации аниме\nСкиньте ЧБ фотку аниме персонажа")
})

bot.action('colorize', (ctx) => {
  ctx.session.colorizePhoto = true
  ctx.reply("Вы вошли в режим колоризации аниме\nСкиньте ЧБ фотку аниме персонажа")
})

bot.command('dress', (ctx) => {
  ctx.session.changeDress = true
  ctx.reply("Вы вошли в режим смены одежды, все настройки можно увидеть в /settings\nСкиньте фото и через некоторое время получите результат")
})

bot.action('dress', (ctx) => {
  ctx.session.changeDress = true
  ctx.reply("Вы вошли в режим смены одежды, все настройки можно увидеть в /settings\nСкиньте фото и через некоторое время получите результат")
})

// Команда /settings
bot.command('settings', (ctx) => {
  const importantButtons = IMPORTANT_SETTINGS.map((setting) =>
    [Markup.button.callback(`${SETTINGS[setting].short}`, `${setting}`)]
  );

  const otherButtons = OTHER_SETTINGS.map((setting) =>
    [Markup.button.callback(`${SETTINGS[setting].short}`, `${setting}`)]
  );

  const keyboard = Markup.inlineKeyboard([
    ...importantButtons,
    [
      Markup.button.callback('--- Дополнительные настройки ---', 'NO_ACTION'), // разделитель
      Markup.button.callback('--- Дополнительные настройки ---', 'NO_ACTION')  // разделитель
    ],
    ...otherButtons
  ], { columns: 2 });

  ctx.reply('Настройки преобразования\nВажные настройки: \nОсновная подсказка - То на что вы хотите изменить одежду\nТип контента - Вы выбираете что вы преобразовываете, Аниме или реального человека\nПерсона - Вы выбираете мужчина или женщина будет преобразован\n\n Все настройки пишите на английском', keyboard);
});

bot.action('settings', (ctx) => {
  const importantButtons = IMPORTANT_SETTINGS.map((setting) =>
    [Markup.button.callback(`${SETTINGS[setting].short}`, `${setting}`)]
  );

  const otherButtons = OTHER_SETTINGS.map((setting) =>
    [Markup.button.callback(`${SETTINGS[setting].short}`, `${setting}`)]
  );

  const keyboard = Markup.inlineKeyboard([
    ...importantButtons,
    [
      Markup.button.callback('--- Дополнительные настройки ---', 'NO_ACTION'), // разделитель
      Markup.button.callback('--- Дополнительные настройки ---', 'NO_ACTION')  // разделитель
    ],
    ...otherButtons
  ], { columns: 2 });

  ctx.reply('Настройки преобразования\nВажные настройки: \nОсновная подсказка - То на что вы хотите изменить одежду\nТип контента - Вы выбираете что вы преобразовываете, Аниме или реального человека\nПерсона - Вы выбираете мужчина или женщина будет преобразован\n\n Все настройки пишите на английском', keyboard);
});

bot.action('NO_ACTION', () => { }); // обработчик для разделителя, чтобы избежать ошибок

// Обработчики действий для каждой настройки
Object.keys(SETTINGS).forEach((setting) => {
  bot.action(`${setting}`, (ctx) => {
    ctx.reply(`Текущее значение \n${ctx.session[setting]}\n${SETTINGS[setting].description}\nВведите значение для ${SETTINGS[setting].short}:`);
    ctx.session.awaitingInput = setting;
  });
});

// Обработчик текста для ввода нового значения настройки
bot.on('text', async (ctx) => {
  if (ctx.session.photoToColorize) {

    const sessionPath = await createSessionPath(ctx);

    ctx.reply("Начата обработка, подождите 30 секунд")
    await colorizeAnime(ctx.session.photoToColorize, sessionPath, ctx.message.text)

    // Выводим все что мы нагененрировали
    const mediaGroup = [];
    for (let i = 0; i <= 3; i++) {
      const imagePath = path.join(sessionPath, `ready_${i}.jpg`);
      console.log(imagePath)
      if (fs.existsSync(imagePath)) {
        mediaGroup.push({ type: 'photo', media: { source: fs.readFileSync(imagePath) } });
      }
    }

    if (mediaGroup.length > 0) {
      await ctx.telegram.sendMediaGroup(ctx.chat.id, mediaGroup);
    }

    ctx.session.photoToColorize = "";
    return
  }
  if (ctx.session.awaitingInput) {
    const newValue = ctx.message.text;
    ctx.session[ctx.session.awaitingInput] = newValue;
    SETTINGS[ctx.session.awaitingInput].value = newValue
    ctx.reply(`${SETTINGS[ctx.session.awaitingInput].short} был обновлен на ${newValue}`, startKeyboard);
    ctx.session.awaitingInput = null;
    ctx.session.colorizePhoto = false
  }
  else {
    await ctx.reply("Бот принимает только фотографию, выберите настройки и скиньте фотографию кого-либо.\n\nДостаточно скинуть фотографию и через 30-40 секунд получишь результат", startKeyboard)
    ctx.session.colorizePhoto = false
    ctx.session.changeDress = false
    ctx.session.photoToColorize = ""
  }
});




bot.launch();
// Restart msg
// sendMessageToAllUsers("Бот был перезапущен, \nВведите /start для начала работы", bot)
// sendMessageToAllUsers("Бот временно не работает, тех.работы", bot)

const sessionPath = `sessions`;
// создаем папку сессии, если она еще не существует
if (!fs.existsSync(sessionPath)) {
  fs.mkdirSync(sessionPath, { recursive: true });
}


process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));