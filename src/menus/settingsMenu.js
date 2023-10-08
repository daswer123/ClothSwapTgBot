import { createMenu, withErrorHandling } from "../helper.js";

export const showSettings = withErrorHandling(async (ctx) => {
    const message = `
  *⚙ Cloth Swap Настройки *
  `;

    const buttons = [
        [
            { text: "Сила определения", action: "volume" },
            { text: "⚙ Тип контента", action: "changeVolume" },
        ],
        [{ text: "Обратно", action: "menu" }],
    ];

    const menu = createMenu(message, buttons);

    await ctx.replyWithMarkdownV2(menu.message, menu.keyboard);
});
