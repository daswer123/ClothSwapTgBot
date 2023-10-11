// Imports zone
import { Telegraf, session, Scenes } from "telegraf";
import { registerBotCommands, setBotCommands } from "./commands.js";
import { handleMiddleware, useMiddlewareForReply } from "./hanlders.js";
import { registerBotActions } from "./actions.js";
import { TELEGRAM_TOKEN } from "../env.js";
import { createSessionFolder } from "../helper.js";
import { createChangeButtons, createSessionPath, downloadPhoto, sendMessageToAllUsers } from "./functions.js";
import { allSettings } from "../scenes/settings.js";

const { Stage } = Scenes;

const stage = new Stage([...allSettings]);

// Start
export const bot = new Telegraf(TELEGRAM_TOKEN, {
    handlerTimeout: 900_000_000,
});

// Иницируем сессию
bot.use(session());
bot.use(stage.middleware());
process.setMaxListeners(0);

// Присваиваем боту команды доступные из меню
setBotCommands(bot);

//  Работа с сессией, обработка ошибок
bot.use(async (ctx, next) => {
    try {
        useMiddlewareForReply(ctx); // Задаем middleware для того что был хранить id сообщений бота и пользователя
        handleMiddleware(ctx, next); // Задаем middleware что бы корректно работать с сессией
    } catch (err) {
        console.log(err);
    }
});

// Подключаем комманды и экшены из других модулей
registerBotActions(bot);
registerBotCommands(bot);

//Work with photo
bot.on("photo", async (ctx) => {
    const sessionPath = await createSessionPath(ctx);
    console.log("Фотка загружена");

    // Фотографии приходят в разных размерах, мы возьмем самую большую
    const photo = ctx.message.photo.pop();

    const photoPath = await downloadPhoto(sessionPath, photo, ctx.telegram);
    console.log(photoPath, "Файл загружен");

    const msgId = ctx.message.message_id;
    createChangeButtons(ctx, sessionPath, msgId);
    // ctx.reply("Файл успешно загружен");
});

// Основная работа
bot.on("text", async (ctx) => {
    await ctx.replyWithMarkdownV2("Введите /start");
});

bot.launch();

sendMessageToAllUsers("Введите /start для начала работы");

createSessionFolder();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
