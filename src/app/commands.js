import { showMenu } from "../menus/mainMenu.js";

export async function setBotCommands(bot) {
    await bot.telegram.setMyCommands([
        { command: "start", description: "Начать работу с ботом" },
        { command: "menu", description: "Показать меню" },
        { command: "swap", description: "Изменить одежду" },
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
/swap - Изменить одежду
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
    } catch (err) {
        console.log(err);
    }
}
