// Change dinoTresh

import { createOptionScene, createScene } from "./base.js";

const dinoStrScene = createScene("dinoTreshSetting", "Введите силу обнаружения маски:", "dinoStr", "number", 0.1, 1, "settings");

const expandMaskScene = createScene(
    "expandMaskSetting",
    "Введите силу расширения маски:",
    "mask_expand",
    "number",
    1,
    100,
    "settings",
);

const contentTypeSettingScene = createOptionScene(
    "contentTypeSetting",
    "Выберите тип контента:",
    "contentType",
    [["real", "anime"]],
    "settings",
);

const setSexSettingScene = createOptionScene(
    "setSexSetting",
    "Выберите пол:",
    "contentType",
    [["Мужской", "Женский"]],
    "settings",
);

const allSettings = [expandMaskScene, dinoStrScene, contentTypeSettingScene, setSexSettingScene];
export { allSettings };
