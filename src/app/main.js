// Imports zone
import { Telegraf, session, Scenes } from "telegraf";
import { registerBotCommands, setBotCommands } from "./commands.js";
import { handleMiddleware, useMiddlewareForReply } from "./hanlders.js";
import { registerBotActions } from "./actions.js";
import { TELEGRAM_TOKEN } from "../env.js";
import { createSessionFolder } from "../helper.js";
import { sendMessageToAllUsers } from "./functions.js";
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

// Основная работа
bot.on("text", (ctx) => {
    ctx.replyWithMarkdownV2("Введите /start");
});

// bot.on("text", (ctx) => {
//     const setVolume = processSetting(ctx, "volume", "number", 0, 100);
//     setVolume(ctx.message.text);
// });

bot.launch();

sendMessageToAllUsers("Введите /start для начала работы");

createSessionFolder();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
