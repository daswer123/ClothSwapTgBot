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
