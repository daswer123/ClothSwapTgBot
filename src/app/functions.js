import fs from "fs";
import path from "path";
import axios from "axios";
import { bot } from "./main.js";
import { getAllUsersFromDatabase } from "../backend/db.js";
import { Markup } from "telegraf";

export async function sendMessageToAllUsers(message) {
    const userIds = getAllUsersFromDatabase();

    // console.log(userIds)

    for (const userId of userIds) {
        try {
            await bot.telegram.sendMessage(userId, message);
        } catch (error) {
            // Если пользователь заблокировал бота, пропустить и продолжить со следующим пользователем
            if (error.code === 403) {
                console.log(`Пользователь ${userId} заблокировал бота. Пропускаем.`);
                continue;
            }
            // Вывести ошибку для всех других случаев
            console.error(`Не удалось отправить сообщение пользователю ${userId}:`, error);
        }
    }
}

// Отправить сообщение определённому пользователю
export async function sendMessageToUser(userId, message) {
    try {
        await bot.telegram.sendMessage(userId, message);
    } catch (error) {
        // Если пользователь заблокировал бота, выводим сообщение об ошибке
        if (error.code === 403) {
            console.log(`Пользователь ${userId} заблокировал бота.`);
        } else {
            // Выводим ошибку для всех других случаев
            console.error(`Не удалось отправить сообщение пользователю ${userId}:`, error);
        }
    }
}

export async function createSessionPath(ctx) {
    const uniqueId = ctx.from.id; // получаем уникальный идентификатор пользователя
    const messageId = ctx.message.message_id; // получаем уникальный идентификатор сообщения
    const sessionPath = `sessions/${uniqueId}/${messageId}`;

    // Создаем папку для пользователя, если она еще не существует
    if (!fs.existsSync(sessionPath)) {
        await fs.promises.mkdir(sessionPath, { recursive: true });
    }
    return sessionPath;
}

export async function downloadPhoto(sessionPath, photo, telegram) {
    const photoPath = path.join(sessionPath, `input.jpg`);
    const photoFile = await telegram.getFileLink(photo.file_id);

    // Скачиваем файл
    const response = await axios.get(photoFile, { responseType: "stream" });
    const writer = fs.createWriteStream(photoPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on("finish", () => resolve(photoPath));
        writer.on("error", reject);
    });
}

export async function createChangeButtons(ctx, sessionPath, msgId) {
    const clothingOptions = {
        "Футболка + шорты": "t-short and shorts",
        Форма: "school uniform, short skirt",
        Платье: "dress",
    };

    // Генерируем кнопки по две в ряд
    const buttons = [];
    for (let i = 0; i < Object.entries(clothingOptions).length; i += 2) {
        const pair = Object.entries(clothingOptions).slice(i, i + 2);
        buttons.push(pair.map(([text, action]) => Markup.button.callback(text, `swap_${action}_${msgId}`)));
    }

    // Добавляем кнопку "Отмена"
    buttons.push([Markup.button.callback("Отмена", "menu")]);

    const inlineKeyboard = Markup.inlineKeyboard(buttons);

    await ctx.reply("Выберите что вы хотите сделать с одеждой", inlineKeyboard);
}
