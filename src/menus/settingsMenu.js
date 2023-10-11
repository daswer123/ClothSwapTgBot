import { createMenu, withErrorHandling } from "../helper.js";

export const showSettings = withErrorHandling(async (ctx) => {
    await ctx.scene.leave();

    const { dinoStr, contentType, breastSize, mask_expand } = ctx.session;
    const message = `
*⚙️ Настройки Cloth Swap 🧥👗*

**🎯 Сила определения**: Это как хорошо наш робот видит и понимает одежду на фотографии. Если вы хотите, чтобы он увидел больше деталей, установите значение ниже, например, 0.25. Но будьте осторожны, он может также увидеть то, что вы не хотите! Стандартное значение - 0.3.

**🔍 Усиление маски**: Это насколько большой будет область, в которой робот будет менять одежду. Больше значит больше шансов на успешную замену, но робот может ненароком затронуть и другие элементы на фотографии. Если вы хотите меньше ошибок - установите значение поменьше.

**👫 Пол**: Выберите "мужчина" или "женщина". Это помогает нашему роботу понять, как правильно обработать фотографию.

**🌍 Тип контента**: Выберите "аниме" или "реальность". Это сообщает роботу, какую модель использовать для обработки вашего фото. `;

    const buttons = [
        [
            { text: `🎯 Сила определения: ${dinoStr}`, action: "dinoTreshSetting" },
            { text: `🔍 Усиление маски ${mask_expand}`, action: "expandMaskSetting" },
        ],
        [
            { text: `👫 Размер груди: ${breastSize}`, action: "setSexSetting" },
            { text: `🌍 Тип контента: ${contentType}`, action: "contentTypeSetting" },
        ],
        [{ text: "🔙 Меню", action: "menu" }],
    ];

    const menu = createMenu(message, buttons);

    await ctx.replyWithMarkdownV2(menu.message, menu.keyboard);
});
