import { createMenu, withErrorHandling } from "../helper.js";

export const showMenu = withErrorHandling(async (ctx) => {
    await ctx.scene.leave();

    let currentMode = ctx.session.promptMode ? "**По запросу**" : "**По референсу**";
    const message = `
  *🤖 Cloth Swap Бот 🎩👗*
    
  👔 Ищете стильный деловой костюм или возможно чарующее вечернее платье? Я готов помочь вам найти идеальный образ. 

  📸 Просто отправьте мне фотографию, и я волшебным образом переодену вас или вашего друга в новый наряд! ✨

Текущий режим обработки: ${currentMode}
`;

    const buttons = [
        [{ text: "Переодеть по референсу (IP адаптер )", action: "ref_photo" }],
        [{ text: "Переодеть по выбору ( Prompt )", action: "default_photo" }],
        [{ text: "⚙ Настройки", action: "settings" }],
    ];

    const menu = createMenu(message, buttons);

    await ctx.replyWithMarkdownV2(menu.message, menu.keyboard);
});
