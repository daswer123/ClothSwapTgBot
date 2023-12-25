import { showMenu } from "../menus/mainMenu.js";

export async function setBotCommands(bot) {
    await bot.telegram.setMyCommands([
        { command: "start", description: "Начать работу с ботом" },
        { command: "menu", description: "Показать меню" },
        { command: "ref", description: "Изменить одежду по образцу" },
        { command: "prompt", description: "Изменить одежду по выбору" },
        { command: "help", description: "Показать список команд" },
    ]);
}

export async function registerBotCommands(bot) {
    try {
        bot.command("help", async (ctx) => {
            try {
                const message = `
Доступные команды:
/start - Начать работу с ботом
/menu - Показать меню
/ref - Изменить одежду по образцу
/prompt - Изменить одежду по выбору
/help - Показать список команд
`;

                await ctx.reply(message);
            } catch (e) {
                console.log(e);
            }
        });

        // Подключение команд из других модулей

        // Комманды основного модуля
        bot.command("start", async (ctx) => {
            await showMenu(ctx);
        });

        bot.command("menu", async (ctx) => {
            await showMenu(ctx);
        });

        bot.command("prompt", async (ctx) => {
            ctx.session.promptMode = true;
            ctx.session.refMode = false;
            ctx.session.SecondStage = false;
            ctx.session.refSession = "";
            ctx.reply(
                "Режим переключена на преобразование одежды по запросу\nОтправьте любуй фотографию и выберите во что перереодеть персонажа\n\nПока вы не переключите режим все фотографии будут обрабатыватся в этом режиме",
            );
        });

        bot.command("ref", async (ctx) => {
            ctx.session.promptMode = false;
            ctx.session.refMode = true;
            ctx.session.SecondStage = false;
            ctx.session.refSession = "";
            ctx.reply(
                "Режим переключенн на преобразование одежды по образцу\nСначало отправьте фотографию с которой будет скопированна одежда, потом отправьте фотографию в которой вы бы хотели видеть эту одежду\n\nПока вы не переключите режим все фотографии будут обрабатыватся в этом режиме",
            );
        });
    } catch (err) {
        console.log(err);
    }
}
