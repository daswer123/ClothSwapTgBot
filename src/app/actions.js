// import { Markup } from 'telegraf';

import { changeDress } from "../backend/api.js";
import { withErrorHandling } from "../helper.js";
import { showMenu } from "../menus/mainMenu.js";
import { showSettings } from "../menus/settingsMenu.js";
// import { createSessionPath } from "./functions.js";

export const registerBotActions = withErrorHandling(async (bot) => {
    bot.action("menu", (ctx) => {
        showMenu(ctx);
    });

    bot.action("settings", (ctx) => {
        showSettings(ctx);
    });

    bot.action("dinoTreshSetting", async (ctx) => {
        // ctx.replyWithMarkdownV2("Введите настройку");
        ctx.scene.enter("dinoTreshSetting");
        ctx.answerCbQuery();
    });

    bot.action("expandMaskSetting", async (ctx) => {
        // ctx.replyWithMarkdownV2("Введите настройку");
        ctx.scene.enter("expandMaskSetting");
        ctx.answerCbQuery();
    });

    bot.action("contentTypeSetting", async (ctx) => {
        // ctx.replyWithMarkdownV2("Введите настройку");
        ctx.scene.enter("contentTypeSetting");
        ctx.answerCbQuery();
    });

    bot.action("setSexSetting", async (ctx) => {
        // ctx.replyWithMarkdownV2("Введите настройку");
        ctx.scene.enter("setSexSetting");
        ctx.answerCbQuery();
    });

    bot.action("default_photo", async (ctx) => {
        ctx.session.promptMode = true;
        ctx.session.refMode = false;
        ctx.session.SecondStage = false;
        ctx.session.refSession = "";
        ctx.reply(
            "Режим переключена на преобразование одежды по запросу\nОтправьте любуй фотографию и выберите во что перереодеть персонажа\n\nПока вы не переключите режим все фотографии будут обрабатыватся в этом режиме",
        );
    });

    bot.action("ref_photo", async (ctx) => {
        ctx.session.promptMode = false;
        ctx.session.refMode = true;
        ctx.reply(
            "Режим переключенн на преобразование одежды по образцу\nСначало отправьте фотографию с которой будет скопированна одежда, потом отправьте фотографию в которой вы бы хотели видеть эту одежду\n\nПока вы не переключите режим все фотографии будут обрабатыватся в этом режиме",
        );
    });

    bot.action("my_prompt", async (ctx) => {
        ctx.reply("Введите подсказку на английском, какую одежду вы бы хотели видить на фотографии");
        ctx.session.waitForTextPrompt = true;
    });

    bot.action(/swap_(.*)_([0-9]+)/, async (ctx) => {
        // Этот код будет выполнен, когда пользователь нажмет на кнопку

        // Распарсим данные обратного вызова
        const [, clothing, msgId] = ctx.match;

        // Теперь вы можете использовать значения `clothing` и `msgId` для обработки действия
        // Например, вы можете использовать `clothing` для определения какую одежду надеть на персонажа
        // и `msgId` для определения какое сообщение должно быть обновлено

        // Ваш код здесь...

        const uniqueId = ctx.from.id; // получаем уникальный идентификатор пользователя
        const sessionPath = `sessions/${uniqueId}/${msgId}`;
        ctx.session.promptModeCustom = "";

        ctx.session.prompt_1 = clothing;

        ctx.reply("Обработка фотографии, ожидайте");
        ctx.answerCbQuery();
        await changeDress(ctx, sessionPath);

        // Например, мы можем просто отправить сообщение обратно пользователю
        // ctx.reply(`Вы выбрали: ${clothing}, сообщение ID: ${msgId}`);
        ctx.replyWithPhoto({ source: `${sessionPath}/ready_1_1.jpg` }, { reply_to_message_id: msgId });
    });
    // Подключенние action бота для других модулей
});
