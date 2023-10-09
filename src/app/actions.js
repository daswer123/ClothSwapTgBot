// import { Markup } from 'telegraf';

import { withErrorHandling } from "../helper.js";
import { showMenu } from "../menus/mainMenu.js";
import { showSettings } from "../menus/settingsMenu.js";

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
    // Подключенние action бота для других модулей
});
