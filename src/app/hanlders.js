import { getSessionFromDatabase, getUserFromDatabase, saveSessionToDatabase, saveUserToDatabase } from "../backend/db.js";

import { INITIAL_SESSION } from "../variables.js";

// Middlewares
export async function handleMiddleware(ctx, next) {
    // Попытка получить сессию из базы данных
    try {
        // Проверка наличия локальной сессии
        if (!ctx.session || Object.keys(ctx.session).length === 0) {
            // Если локальной сессии нет, попытка получить сессию из базы данных
            const session = await getSessionFromDatabase(ctx.from.id);

            if (session) {
                // Если есть сессия в базе данных, используем её
                ctx.session = session;
                ctx.session.current_message_id = "";
                console.log("Загрузка сессия");
            } else {
                // Если сессии нигде нет, создаем новую
                ctx.session = { ...INITIAL_SESSION };
                console.log("Создана новая сессия");
            }
        }

        // Проверка наличия пользователя в базе данных
        if (!ctx.session.inDatabase) {
            const user = await getUserFromDatabase(ctx.from.id);
            if (!user) {
                // Если пользователя нет в базе данных, добавляем его и присваиваем статус 'default'
                await saveUserToDatabase(ctx.from.id, ctx.from.username, "default");
            }
            // Помечаем, что пользователь теперь в базе данных
            ctx.session.inDatabase = true;
        }

        // Если количество ключей в локальной сессии и инициализированной сессии отличается
        // или если какое-либо значение в сессии `undefined`
        for (let key in INITIAL_SESSION) {
            if (!(key in ctx.session) || ctx.session[key] === undefined) {
                ctx.session[key] = INITIAL_SESSION[key];
            }
        }

        // console.log("Сессия обновлена с новыми ключами");
        await saveSessionToDatabase(ctx.from.id, ctx.session);

        await next(); // Обработка сообщения ботом

        // Сохранение сессии в базу данных после ответа бота
        await saveSessionToDatabase(ctx.from.id, ctx.session);
    } catch (err) {
        console.log(err);
    }
}

export async function useMiddlewareForReply(ctx) {
    try {
        const originalReplyWithMarkdownV2 = ctx.replyWithMarkdownV2;

        ctx.replyWithMarkdownV2 = async (...args) => {
            const sentMessage = await originalReplyWithMarkdownV2.apply(ctx, args);

            ctx.session.current_message_id = sentMessage?.message_id;
            ctx.session.current_user_message_id = ctx.message?.message_id;
            // return sentMessage;
        };
    } catch (err) {
        console.log(err);
    }
}
