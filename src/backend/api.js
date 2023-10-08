import fs from 'fs/promises';
import { writeFile } from 'fs/promises';
import fss from "fs"
import axios from 'axios';
import path from 'path';
import { decode } from 'base64-arraybuffer';
import { PythonShell } from 'python-shell';
import { DINO_CATEGORY_1, DINO_CATEGORY_2, DINO_MODEL, SAM_MODEL, SD_ADRESS } from '../env.js';

// Work with python
export const dilatePython = async (filename, maskSize = 20) => {
    try {
        // let mp3Path = `${sessionPath}/${filename}`;

        let optionss = {
            mode: 'text',
            pythonPath: "venv\\Scripts\\python",
            pythonOptions: ['-u'], // get print results in real-time
            scriptPath: "scripts",
            args: [
                '-d',
                `${filename}`,
                maskSize
            ]
        };

        const messages = await PythonShell.run('detectMask.py', optionss)


        return messages
    } catch (err) {
        console.log(err)
    }
}

export const createEdgeMaskPython = async (filename, borderSize = 5) => {
    try {
        // let mp3Path = `${sessionPath}/${filename}`;

        let optionss = {
            mode: 'text',
            pythonPath: "venv\\Scripts\\python",
            pythonOptions: ['-u'], // get print results in real-time
            scriptPath: "scripts",
            args: [
                '-e',
                `${filename}`,
                borderSize
            ]
        };

        const messages = await PythonShell.run('detectMask.py', optionss)


        return messages
    } catch (err) {
        console.log(err)
    }
}

// Help functions
async function filenameToBase64(filename) {
    const filePath = path.resolve(filename);
    const fileBuffer = await fs.readFile(filePath);
    return fileBuffer.toString('base64');
}

function saveMask(mask64, i) {
    const maskBuffer = Buffer.from(mask64, 'base64');
    const maskName = `mask${i}.png`;
    fss.writeFileSync(maskName, maskBuffer);
}

async function changeModel(modelName) {
    const url = 'http://localhost:7860/sdapi/v1/options';
    const payload = { sd_model_checkpoint: modelName };
    const response = await axios.post(url, payload);
    console.log(response.data);
    return response.data;
}

async function modifyMasks(reply, expandSize) {
    // Получаем маски из ответа и сохраняем их
    // for (let i = 0; i < reply.masks.length; i++) {
    //     await saveMask(reply.masks[i], i + 1);
    // }

    // Сохраняем 1-ю маску
    await saveMask(reply.masks[0], 1);

    // Расширяем маску на указанное кол-во пикселей
    await dilatePython("mask1.png", expandSize)

    // Создаем маску с краями указанное маски , что бы скрыть огрехи генерации
    await createEdgeMaskPython("mask1.png")

    // Загружаем сохраненную маску и преобразуем ее в base64
    const fullmask = await filenameToBase64("mask1.png")

    return fullmask;
}

// Main func
async function createMask(imgBase64, dinoThres) {
    const url = `${SD_ADRESS}/sam/sam-predict`;

    // Определим настройки для первого запроса
    let payload = {
        'sam_model_name': SAM_MODEL,
        'input_image': imgBase64,
        'dino_enabled': true,
        'dino_box_threshold': dinoThres,
        'dino_model_name': DINO_MODEL,
        'dino_text_prompt': DINO_CATEGORY_1,
        'dino_preview_checkbox': false,
    };

    let response = await axios.post(url, payload);
    let reply = response.data;
    console.log(reply["msg"]);

    // Если первый запрос не возвращает нужного результата
    // (например, если reply["msg"] не содержит ожидаемых данных),
    // повторяем запрос с новым значением "dino_text_prompt"
    if (reply["msg"] === "You neither added point prompts nor enabled GroundingDINO. Segmentation cannot be generated.") {
        console.log("Генерация маски пошла не поплану, применяем 2-й способ")
        payload["dino_text_prompt"] = DINO_CATEGORY_2;
        response = await axios.post(url, payload);
        reply = response.data;
        // console.log(reply["msg"]);
    }

    return reply;
}

async function handleMask(imgBase64, dinoThres = 0.3, expandSize = 20) {
    const reply = await createMask(imgBase64, dinoThres);
    console.log("Маски созданны")
    const fullmask = await modifyMasks(reply, expandSize);
    console.log("Модификация масок завершенна")

    return fullmask
}

async function secondRequest(imgBase64, mask, index, prompt, onAdt, batchSize, denStr, sampler = "DPM++ 2M Karras") {
    const payload2 = {
        "init_images": [imgBase64],
        "resize_mode": 0,
        "denoising_strength": denStr,
        "image_cfg_scale": 7,
        "mask": mask,
        "mask_blur": 8,
        "mask_blur_x": 0,
        "mask_blur_y": 0,
        "inpainting_fill": 1,
        "inpaint_full_res": true,
        "inpaint_full_res_padding": 64,
        "inpainting_mask_invert": 0,
        "initial_noise_multiplier": 1,
        "prompt": prompt,
        "seed": -1,
        "subseed": -1,
        "subseed_strength": 0,
        "seed_resize_from_h": -1,
        "seed_resize_from_w": -1,
        "sampler_name": sampler,
        "batch_size": batchSize,
        "n_iter": 1,
        "steps": 25,
        "cfg_scale": 6,
        "width": 640,
        "height": 640,
        "restore_faces": false,
        "tiling": false,
        "do_not_save_samples": false,
        "do_not_save_grid": false,
        "negative_prompt": "[deformed | disfigured], poorly drawn, [bad : wrong] anatomy, [extra | missing | floating | disconnected] limb, (mutated hands and fingers), blurry",
        "eta": 31377,
        "s_min_uncond": 0,
        "s_churn": 0,
        "s_tmax": 0,
        "s_tmin": 0,
        "s_noise": 1,
        "override_settings_restore_afterwards": true,
        "include_init_images": false,
        "send_images": true,
        "save_images": false,
        "alwayson_scripts": {
            "ADetailer": {
                "args": [
                    onAdt,
                    {
                        "ad_model": "hand_yolov8n.pt",
                        "ad_confidence": 0.2,
                        "ad_prompt": "hands",
                        "ad_negative_prompt": "mutated, bad anatomy",
                        "ad_mask_blur": 8,
                        "ad_denoising_strength": 0.4,
                        "ad_inpaint_width": 512,
                        "ad_inpaint_height": 512,
                        "ad_steps": 22,
                    }
                ]
            }
        }
    }

    // try {

    const response2 = await axios.post(`${SD_ADRESS}/sdapi/v1/img2img`, payload2);
    // console.log(response2)

    if (response2.status === 200) {
        console.log(`Второй этап выполнен успешно для маски ${index}.`);
        const imagesBase64 = response2.data.images;

        for (let i = 0; i < imagesBase64.length; i++) {
            const imageBuffer = Buffer.from(imagesBase64[i], 'base64');

            // Здесь мы добавляем номер изображения к имени файла
            const filename = `ready_${index}_${i + 1}.jpg`;
            await fs.writeFile(filename, imageBuffer);
            console.log(`Image saved as ${filename}`);
        }

        return imagesBase64[0];
    } else {
        console.log(`Ошибка во время выполнения второго этапа для маски ${index}.`);
        console.log(response2.data);
        const errorMessage = response2.data.message || 'No error message available';
        console.log(`Error message: ${errorMessage}`);
    }
    // } catch (error) {
    //     console.log(`Error: ${error}`);
    // }
}




const img_base64 = await filenameToBase64("input.jpg")

// const reply = await createMask(img_base64, 0.3);
// console.log("Этап 1 завершен")
const fullmask = await handleMask(img_base64, 0.3, 20);
// console.log("Этап 2 завершен")
let result = await secondRequest(img_base64, fullmask, 1, "yellow short and top", false, 1, 1)
result = await secondRequest(result, result, 1, "yellow short and top", false, 1, 0.2)
console.log("Этап 3 завершен")

