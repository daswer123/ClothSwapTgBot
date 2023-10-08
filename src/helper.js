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

export const processSetting = (ctx, settingName, dataType, minValue = null, maxValue = null) => {
    return async (newValue) => {
        switch (dataType) {
        case "number":
            newValue = Number(newValue);
            if (minValue !== null && newValue < minValue) {
                return ctx.reply(`Значение должно быть больше ${minValue}`);
            }
                if (maxValue !== null && newValue > maxValue) {
                return ctx.reply(`Значение должно быть меньше ${maxValue}`);
            }
            break;
        case "boolean":
            newValue = newValue.toLowerCase() === "true";
            break;
        case "string":
                // Проверки для строковых значений могут быть добавлены здесь
            break;
        default:
                return ctx.reply(`Неизвестный тип данных: ${dataType}`);
        }
        ctx.session[settingName] = newValue;
        return ctx.reply(`Настройка ${settingName} обновлена до ${newValue}`);
    };
};
