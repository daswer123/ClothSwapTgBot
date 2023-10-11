import fs from "fs";
import { Markup } from "telegraf";
import { sessionPathFolder } from "./variables.js";

export function createSessionFolder() {
    // создаем папку сессии, если она еще не существует
    if (!fs.existsSync(sessionPathFolder)) {
        fs.mkdirSync(sessionPathFolder, { recursive: true });
    }
}

export function escapeMarkdown(text) {
    const specialCharacters = ["_", "[", "]", "(", ")", "~", ">", "#", "+", "-", "=", "|", "{", "}", ".", "!"];
    let escapedText = text;

    specialCharacters.forEach((char) => {
        const regex = new RegExp(`\\${char}`, "g");
        escapedText = escapedText.replace(regex, `\\${char}`);
    });

    return escapedText;
}

// HOC для обработки ошибок
export const withErrorHandling = (handler, errorMessage) => {
    return async (ctx) => {
        try {
            await handler(ctx);
        } catch (err) {
            ctx.reply(errorMessage || "😢 Непредвиденная ошибка, пожалуйста, введите /start");
            console.log(err);
        }
    };
};

// Шаблон для создания клавиатуры
export const createMenu = (message, buttons) => {
    message = escapeMarkdown(message);

    const keyboardButtons = buttons.map((row) => row.map((button) => Markup.button.callback(button.text, button.action)));
    const keyboard = Markup.inlineKeyboard(keyboardButtons).resize();

    return { message, keyboard };
};

// Шаблон для обработки настроек
export const processSetting = (ctx, settingName, dataType, minValue = null, maxValue = null, cancelButtonCallback = "menu") => {
    return async (newValue) => {
        const keyboard = Markup.inlineKeyboard([Markup.button.callback("🔙 Назад", cancelButtonCallback)]); // Создаем кнопку отмены

        switch (dataType) {
            case "number":
                newValue = Number(newValue);
                if (isNaN(newValue)) {
                    await ctx.reply(`🚫 Неверное значение. Значение должно быть числом.`, keyboard);
                    return false;
                }
                if ((minValue !== null && newValue < minValue) || (maxValue !== null && newValue > maxValue)) {
                    await ctx.reply(`🚫 Значение должно быть в диапазоне между ${minValue} и ${maxValue}.`, keyboard);
                    return false;
                }
                break;
            case "string":
                // Проверки для строковых значений могут быть добавлены здесь
                break;
            default:
                await ctx.reply(`🚫 Неизвестный тип данных: ${dataType}`, keyboard);
                return false;
        }
        ctx.session[settingName] = newValue;
        await ctx.reply(`✅ Настройка ${settingName} обновлена до ${newValue}`, keyboard);
        return true; // Возвращает true, если обновление настроек прошло успешно
    };
};
