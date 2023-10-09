import { processSetting } from "../helper.js";
import { Scenes } from "telegraf";
import { Markup } from "telegraf";

const { BaseScene } = Scenes;

export function createScene(name, enterMessage, settingParam, type, min, max, leaveCallback) {
    const scene = new BaseScene(name);

    // Создаем клавиатуру со специальной кнопкой "Отмена"
    const keyboard = Markup.inlineKeyboard([Markup.button.callback("Отмена", leaveCallback)]);

    scene.enter((ctx) => ctx.replyWithMarkdownV2(enterMessage, keyboard));

    scene.on("text", async (ctx) => {
        const setParam = processSetting(ctx, settingParam, type, min, max, leaveCallback);
        const result = await setParam(ctx.message.text);
        if (result) {
            ctx.scene.leave();
        }
    });

    return scene;
}

export function createOptionScene(name, enterMessage, settingName, optionRows, leaveCallback) {
    const scene = new BaseScene(name);

    // Создаем клавиатуру с опциями
    const keyboard = Markup.inlineKeyboard(
        // Группируем кнопки по рядам
        [
            ...optionRows.map((row) => row.map((option) => Markup.button.callback(option, option))),
            // Добавляем кнопку "Отмена" в отдельном ряду
            [Markup.button.callback("Отмена", leaveCallback)],
        ],
    );

    scene.enter((ctx) => ctx.replyWithMarkdownV2(enterMessage, keyboard));

    // Обрабатываем нажатие на кнопку с опцией
    optionRows.flat().forEach((option) => {
        scene.action(option, async (ctx) => {
            ctx.session[settingName] = option;
            await ctx.reply(
                `✅ Настройка ${settingName} обновлена до ${option}`,
                Markup.inlineKeyboard([[Markup.button.callback("🔙 Назад", leaveCallback)]]),
            );
            ctx.scene.leave();
            ctx.answerCbQuery();
        });
    });

    return scene;
}
