import { bot } from "./main.js";
import { getAllUsersFromDatabase } from "../backend/db.js";

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
