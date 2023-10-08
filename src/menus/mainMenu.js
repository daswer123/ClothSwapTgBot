import { createMenu, withErrorHandling } from "../helper.js";

export const showMenu = withErrorHandling(async (ctx) => {
    const message = `
  *🤖 Cloth Swap Бот 🎩👗*
  
  📸 Просто отправьте мне фотографию или текстовое описание, и я волшебным образом переодену вас или вашего друга в новый наряд! ✨
  
  👔 Ищете стильный деловой костюм или возможно чарующее вечернее платье? Я готов помочь вам найти идеальный образ. 
  
  😉 И помните, иногда в моем гардеробе можно найти что-то действительно *пикантное*... 
  `;

    const buttons = [[{ text: "🎭 Изменить одежду", action: "characters" }], [{ text: "⚙ Настройки", action: "settings" }]];

    const menu = createMenu(message, buttons);

    await ctx.replyWithMarkdownV2(menu.message, menu.keyboard);
});
