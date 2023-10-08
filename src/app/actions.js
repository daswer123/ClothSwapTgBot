// import { Markup } from 'telegraf';

import { processSetting, withErrorHandling } from "../helper.js";
import { showMenu } from "../menus/mainMenu.js";
import { showSettings } from "../menus/settingsMenu.js";

export const registerBotActions = withErrorHandling(async (bot) => {
    bot.action("menu", (ctx) => {
        showMenu(ctx);
    });

    bot.action("settings", (ctx) => {
        showSettings(ctx);
    });

    bot.action("volume", async (ctx) => {
        ctx.replyWithMarkdownV2("Введите настройку");
        ctx.scene.enter("volume");
    });
    // Подключенние action бота для других модулей
});
