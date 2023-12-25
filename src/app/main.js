// Imports zone
import { Telegraf, session, Scenes } from "telegraf";
import { registerBotCommands, setBotCommands } from "./commands.js";
import { handleMiddleware, useMiddlewareForReply } from "./hanlders.js";
import { registerBotActions } from "./actions.js";
import { TELEGRAM_TOKEN } from "../env.js";
import { createSessionFolder } from "../helper.js";
import { createChangeButtons, createSessionPath, downloadPhoto, sendMessageToAllUsers } from "./functions.js";
import { allSettings } from "../scenes/settings.js";
import { changeDress, changeDressRef } from "../backend/api.js";

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
    if (ctx.session.SecondStage) {
        ctx.session.SecondStage = false;
        const sessionPath = ctx.session.refSession;
        ctx.session.refSession = "";

        // Фотографии приходят в разных размерах, мы возьмем самую большую
        const photo = ctx.message.photo.pop();
        const photoPath_input = await downloadPhoto(sessionPath, photo, ctx.telegram, "input.jpg");
        console.log(photoPath_input, "Файл загружен");

        ctx.reply("Обработка фотографии, ожидайте");
        await changeDressRef(ctx, sessionPath);

        ctx.replyWithPhoto({ source: `${sessionPath}/ready_1_1.jpg` }, { reply_to_message_id: ctx.message.message_id });
    }

    const name = ctx.session.promptMode ? "input.jpg" : "reference.jpg";

    const sessionPath = await createSessionPath(ctx);
    console.log("Фотка загружена");

    // Фотографии приходят в разных размерах, мы возьмем самую большую
    const photo = ctx.message.photo.pop();

    const photoPath = await downloadPhoto(sessionPath, photo, ctx.telegram, name);
    console.log(photoPath, "Файл загружен");

    if (ctx.session.promptMode) {
        const msgId = ctx.message.message_id;
        createChangeButtons(ctx, sessionPath, msgId);
    }

    if (ctx.session.refMode) {
        ctx.session.SecondStage = true;
        ctx.session.refSession = sessionPath;

        ctx.reply("Теперь отправьте фотографию, на которой вы хотите изменить одежду");
    }
    // ctx.reply("Файл успешно загружен");
});

// Основная работа
bot.on("text", async (ctx) => {
    if (ctx.session.waitForTextPrompt) {
        ctx.session.waitForTextPrompt = false;
        const msgId = ctx.session.promptModeCustom;
        ctx.session.promptModeCustom = "";

        const uniqueId = ctx.from.id; // получаем уникальный идентификатор пользователя
        const sessionPath = `sessions/${uniqueId}/${msgId}`;
        ctx.session.promptModeCustom = "";

        ctx.session.prompt_1 = ctx.message.text;

        ctx.reply("Обработка фотографии, ожидайте");
        await changeDress(ctx, sessionPath);

        // Например, мы можем просто отправить сообщение обратно пользователю
        // ctx.reply(`Вы выбрали: ${clothing}, сообщение ID: ${msgId}`);
        ctx.replyWithPhoto({ source: `${sessionPath}/ready_1_1.jpg` }, { reply_to_message_id: msgId });
        return;
    }
    await ctx.replyWithMarkdownV2("Введите /start");
});

bot.launch();

// sendMessageToAllUsers("Введите /start для начала работы");

createSessionFolder();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
