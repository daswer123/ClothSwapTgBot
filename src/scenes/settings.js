import { processSetting } from "../helper.js";
import { Scenes } from "telegraf";

const { BaseScene } = Scenes;

const volumeScene = new BaseScene("volume");
volumeScene.enter((ctx) => ctx.reply("Введите новое значение громкости:"));
volumeScene.on("text", (ctx) => {
    const setVolume = processSetting(ctx, "volume", "number", 0, 100);
    setVolume(ctx.message.text);
    ctx.scene.leave();
});

const audioTypeScene = new BaseScene("audioType");
audioTypeScene.enter((ctx) => ctx.reply("Введите новый тип аудио:"));
audioTypeScene.on("text", (ctx) => {
    const setAudioType = processSetting(ctx, "audioType", "string");
    setAudioType(ctx.message.text);
    ctx.scene.leave();
});

const allSettings = [volumeScene, audioTypeScene];
export { allSettings };
