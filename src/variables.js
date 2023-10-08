// SAM OPTIONS
export const SAM_MODEL = `sam_vit_l_0b3195.pth`;
export const DINO_MODEL = `GroundingDINO_SwinB (938MB)`;
export const DINO_CATEGORY_1 = `clothes`;
export const DINO_CATEGORY_2 = `bra, panties, underwear, shorts, garment`;

// PROMPT base
export const promptBaseFemale = "RAW photo,(natural skin texture, muted colors)";
export const promptBaseMale = "man body, nature skin, RAW";
export const negPromptBase =
    "[deformed | disfigured], poorly drawn, [bad : wrong] anatomy, [extra | missing | floating | disconnected] limb, (mutated hands and fingers), blurry";

// Bot setting
export const sessionPathFolder = "sessions";

// Session
export const INITIAL_SESSION = {
    // Tech vars
    inDatabase: false,
    current_message_id: 0,
    current_user_message_id: 0,
    // Настройки для пользователя
    dinoStr: 0.3,
    prompt_1: "Yellow clothes",
    contentType: "real",
    person: "girl",
    mask_expand: 15,
    // Waiting hanlders
};
