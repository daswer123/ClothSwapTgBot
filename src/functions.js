import { PythonShell } from 'python-shell';
import config from 'config';
import fs from "fs"
import path from 'path';
import axios from 'axios';

export const transformSession = (tg_options) => {
  // Деструктуризация объекта
  const {
    dino_thres,
    Dino_categore_1: dino_category_1,
    Dino_categore_2: dino_category_2,
    prompt_1: promt_1,
    prompt_2: promt_2,
    den_str_1,
    den_str_2,
    den_str_3,
    den_str_4,
    one_mask,
    content_type,
    person,
    mask_expand,
    adetailer_str: adteiler_str,
    debug
  } = tg_options;

  // Функция для преобразования строки в число с плавающей точкой
  const parseMyFloat = (str) => {
    if (typeof str === 'string') {
      const replacedStr = str.replace(',', '.');
      const parsedNum = parseFloat(replacedStr);
      if (isNaN(parsedNum)) {
        throw new Error(`Ошибка преобразования строки в число: ожидалось число, получено ${str}`);
      }
      return parsedNum;
    } else {
      return str;
    }
  };

  // Преобразование в требуемый формат
  const transformedSession = {
    dino_thres: parseMyFloat(dino_thres),
    dino_category_1,
    dino_category_2,
    promt_1,
    promt_2,
    den_str_1: parseMyFloat(den_str_1),
    den_str_2: parseMyFloat(den_str_2),
    den_str_3: parseMyFloat(den_str_3),
    den_str_4: parseMyFloat(den_str_4),
    one_mask: parseInt(one_mask, 10),
    debug: debug === 'true',
    content_type,
    person,
    mask_expand: parseInt(mask_expand, 10),
    adteiler_str: parseMyFloat(adteiler_str)
  };

  return transformedSession;
};


export const changeDress = async (tg_options, photoPath) => {
  // Ensure semaphore is released, even if there is an error
  tg_options = transformSession(tg_options)
  try {
    const dino_thres = tg_options.dino_thres
    const dino_category_1 = tg_options.dino_category_1
    const dino_category_2 = tg_options.dino_category_2
    const promt_1 = tg_options.promt_1
    const promt_2 = tg_options.promt_2
    const den_str_1 = tg_options.den_str_1
    const den_str_2 = tg_options.den_str_2
    const den_str_3 = tg_options.den_str_3
    const den_str_4 = tg_options.den_str_4
    const one_mask = tg_options.one_mask
    const content_type = tg_options.content_type
    const person = tg_options.person
    const mask_expand = tg_options.mask_expand
    const adetailer_str = tg_options.adteiler_str


    console.log(tg_options, photoPath);

    // Проверка наличия всех необходимых значений
    // const requiredKeys = ['dino_thres', 'dino_categore_1', 'dino_categore_2', 'prompt_1', 'prompt_2', 'den_str_1', 'den_str_2', 'den_str_3', 'den_str_4', 'one_mask', 'content_type', 'person', 'mask_expand', 'adetailer_str'];
    // for (const key of requiredKeys) {
    //   if (typeof tg_options[key] === 'undefined') {
    //     throw new Error(`Неопределенное значение для ключа ${key}`);
    //   }
    // }

    const options = {
      mode: 'text',
      pythonPath: config.get("PYTHON_VENV_PATH"),
      pythonOptions: ['-u'], // get print results in real-time
      scriptPath: config.get("API_SCRIPT_PATH"),
      args: [
        photoPath,
        dino_thres,
        "clothes",
        "bra, panties, underwear, shorts, garment",
        promt_1,
        promt_2,
        den_str_1,
        den_str_2,
        den_str_3,
        den_str_4,
        0,
        content_type,
        person,
        mask_expand,
        adetailer_str
      ]
    };

    const messages = await PythonShell.run('testApi.py', options);
    console.log("Файл успешно преобразован");


  } catch (err) {
    console.error(err);
  }
};


export async function colorizeAnime(photoPath, sessionPath, prompt) {

  const imgBuffer = fs.readFileSync(photoPath);
  const imgBase64 = imgBuffer.toString('base64');

  prompt = "(anime), (illustration), cartoon, detailed, , a colorize image of " + prompt

  const payload =
  {
    "alwayson_scripts": {
      "ControlNet": {
        "args": [
          {
            "batch_images": "",
            "control_mode": "My prompt is more important",
            "enabled": true,
            "guidance_end": 1,
            "guidance_start": 0,
            "image": null,
            "input_mode": "simple",
            "is_ui": true,
            "loopback": false,
            "low_vram": false,
            "model": "control_v11p_sd15_canny_fp16 [b18e0966]",
            "module": "canny",
            "output_dir": "",
            "pixel_perfect": true,
            "processor_res": 512,
            "resize_mode": "Crop and Resize",
            "threshold_a": 100,
            "threshold_b": 200,
            "weight": 0.3
          },
          {
            "batch_images": "",
            "control_mode": "Balanced",
            "enabled": true,
            "guidance_end": 1,
            "guidance_start": 0,
            "image": null,
            "input_mode": "simple",
            "is_ui": true,
            "loopback": false,
            "low_vram": false,
            "model": "control_v11p_sd15_lineart_fp16 [5c23b17d]",
            "module": "lineart_standard (from white bg & black line)",
            "output_dir": "",
            "pixel_perfect": true,
            "processor_res": 512,
            "resize_mode": "Crop and Resize",
            "threshold_a": -1,
            "threshold_b": -1,
            "weight": 0.7
          },
          {
            "batch_images": "",
            "control_mode": "Balanced",
            "enabled": false,
            "guidance_end": 1,
            "guidance_start": 0,
            "image": null,
            "input_mode": "simple",
            "is_ui": true,
            "loopback": false,
            "low_vram": false,
            "model": "None",
            "module": "none",
            "output_dir": "",
            "pixel_perfect": false,
            "processor_res": -1,
            "resize_mode": "Crop and Resize",
            "threshold_a": -1,
            "threshold_b": -1,
            "weight": 1
          }
        ]
      },
    },
    "batch_size": 1,
    "cfg_scale": 7,
    "denoising_strength": 1,
    "do_not_save_grid": false,
    "do_not_save_samples": false,
    "height": 640,
    "init_images": [
      imgBase64
    ],
    "initial_noise_multiplier": 1,
    "inpaint_full_res": 0,
    "inpaint_full_res_padding": 32,
    "inpainting_fill": 1,
    "inpainting_mask_invert": 0,
    "mask_blur_x": 4,
    "mask_blur_y": 4,
    "n_iter": 4,
    "negative_prompt": "",
    "override_settings": {

    },
    "override_settings_restore_afterwards": true,
    "prompt": prompt,
    "resize_mode": 0,
    "restore_faces": false,
    "s_churn": 0.0,
    "s_min_uncond": 0,
    "s_noise": 1.0,
    "s_tmax": null,
    "s_tmin": 0.0,
    "sampler_name": "Euler a",
    "script_args": [

    ],
    "script_name": null,
    "seed": -1.0,
    "seed_enable_extras": false,
    "seed_resize_from_h": 0,
    "seed_resize_from_w": 0,
    "steps": 20,
    "styles": [
      "- Anime Negative"
    ],
    "subseed": -1,
    "subseed_strength": 0,
    "tiling": false,
    "width": 640
  }

  try {
    const response = await axios.post('http://127.0.0.1:7860/sdapi/v1/img2img', payload);

    if (response.status === 200) {
      console.log(`Фото преобразованно.`);
      let images_base64 = response.data.images;

      // Цикл для обработки каждого изображения в ответе
      for (let i = 0; i < images_base64.length; i++) {
        let imageBuffer = Buffer.from(images_base64[i], 'base64');

        // Здесь мы добавляем номер изображения к имени файла
        let filename = `${sessionPath}/ready_${i}.jpg`;
        fs.writeFileSync(filename, imageBuffer);
        console.log(`Image saved as ${filename}`);
      }

      return images_base64[0];
    }

    return responce
  } catch (error) {
    console.error(error);  // Обработка ошибки
  }





}
