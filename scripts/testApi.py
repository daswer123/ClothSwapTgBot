import base64
import requests
from PIL import Image
from io import BytesIO
from detectMask import split_mask_into_regions, dilate_mask
import numpy as np
from skimage import morphology
from compare import compare_masks
import argparse
import os

def change_model(model_name):
    url = "http://localhost:7860/sdapi/v1/options"
    payload = {
        "sd_model_checkpoint": model_name,   
    }

    response = requests.post(url, json=payload)
    reply = response.json()
    print(reply)
    return reply


def create_white_image_base64(img_filename):
    # Открываем изображение, чтобы узнать его размер
    img = Image.open(img_filename)

    # Создаем полностью белое изображение того же размера
    white_img = Image.fromarray(np.full((img.height, img.width, 3), 255, dtype=np.uint8))

    # Преобразовываем PIL Image в base64
    buffered = BytesIO()
    white_img.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode()

    return img_base64

def create_edge_mask(file_path, border_width = 5):
    # Загружаем изображение и конвертируем в numpy array
    img = Image.open(file_path)
    mask = np.array(img)

    # Создаем структурирующий элемент
    selem = morphology.square(2*border_width)

    # Применяем операцию дилатации и эрозии
    dilated = morphology.dilation(mask, selem)
    eroded = morphology.erosion(mask, selem)

    # Создаем маску краев путем вычитания исходной маски из расширенной
    edge_mask = dilated ^ eroded

    # Сохраняем маску краев в файл
    edge_mask_img = Image.fromarray(edge_mask)
    edge_mask_img.save('test_mask_line.png')

    # Конвертируем картинку в base64
    buffered = BytesIO()
    edge_mask_img.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode()

    return img_base64


def filename_to_base64(filename):
    with open(filename, "rb") as fh:
        return base64.b64encode(fh.read())

def first_request(img_base64,dino_thres,Dino_categore_1,Dino_categore_2):
    url = "http://localhost:7860/sam/sam-predict"
    
    # Определим настройки для первого запроса
    payload = {
        "sam_model_name": "sam_vit_l_0b3195.pth",
        "input_image": img_base64,
        "dino_enabled": True,
        "dino_box_threshold": dino_thres,
        "dino_model_name": "GroundingDINO_SwinB (938MB)",
        "dino_text_prompt": Dino_categore_1,
        "dino_preview_checkbox": False,
    }

    response = requests.post(url, json=payload)
    reply = response.json()
    print(reply["msg"])

    # Если первый запрос не возвращает нужного результата
    # (например, если reply["msg"] не содержит ожидаемых данных),
    # повторяем запрос с новым значением "dino_text_prompt"
    if reply["msg"] == "You neither added point prompts nor enabled GroundingDINO. Segmentation cannot be generated.":  # Замените эту проверку на подходящую для вашего случая
        payload["dino_text_prompt"] = Dino_categore_2
        response = requests.post(url, json=payload)
        reply = response.json()
        print(reply["msg"])

    return reply

def save_mask(mask_64, i):
    mask_bytes = base64.b64decode(mask_64)
    # Open image from bytes
    mask_image = Image.open(BytesIO(mask_bytes))
    # Save image to file
    mask_name = f"mask{i}.png"  # Use f-string to insert the value of `i` into the file name
    mask_image.save(mask_name)

def handle_first_response(reply,one_mask,mask_expand = 5,file_locate = ""):
    # декодировать base64 в байты
    mask_base64 = reply["masks"][0]  # получить Вторую маску
    mask_base64_1 = reply["masks"][1]  # получить Вторую маску
    mask_base64_2 = reply["masks"][2]  # получить Вторую маску

    save_mask(mask_base64,1)
    save_mask(mask_base64_1,2)
    save_mask(mask_base64_2,3)

    mask_num = compare_masks(["mask1.png", "mask2.png", "mask3.png"])

    # if(len(mask_num) > 1):
    #   dilate_mask("mask2.png")
    #   dilate_mask("mask3.png")

    # dilate_mask("mask1.png")
    

    # print(maskss)
    # print("Этап 1 завершен")
    # mask_bytes = base64.b64decode(mask_base64)
    # # открыть изображение из байт
    # mask_image = Image.open(BytesIO(mask_bytes))

    # # сохранить изображение в файл
    # mask_image.save("mask.png")

    breast_mask = ""
    under_mask = ""

    print(mask_num)

    create_edge_mask("mask1.png",3)
    
    dilate_mask("mask1.png",mask_expand)
    
    fullmask = filename_to_base64("mask1.png").decode()
    return [fullmask]

    # if(one_mask > 0):
    #     dilate_mask(f"mask{1}.png",mask_expand)
    #     fullmask = filename_to_base64(f"mask{1}.png").decode()
    #     return [fullmask]

    # if(len(mask_num) > 1):
    #     dilate_mask(f"mask{mask_num[0]}.png",mask_expand)
    #     dilate_mask(f"mask{mask_num[1]}.png",mask_expand)
    #     breast_mask = filename_to_base64(f"mask{mask_num[0]}.png").decode()
    #     under_mask = filename_to_base64(f"mask{mask_num[1]}.png").decode()
    # else:
    #     masks = split_mask_into_regions(f"mask{mask_num[0]}.png",1000, mask_expand)
    #     if(len(masks) > 1):
    #         breast_mask = filename_to_base64("mask1.png").decode()
    #         under_mask = filename_to_base64("mask2.png").decode()
    #     else:
    #         dilate_mask(f"mask{1}.png",mask_expand)
    #         fullmask = filename_to_base64("mask1.png").decode()
    #         return [fullmask]
    # return [breast_mask, under_mask]
    # masks = split_mask_into_regions("mask2.png")
    # masks = split_mask_into_regions("mask3.png")

    

def second_request(onAdt,mask, index, img_base64,prompt,den_str,samler = "DPM++ 2M Karras"):
    # формирование запроса на второй этап
    payload2 = {
      "init_images": [img_base64],
      "resize_mode": 0,
      "denoising_strength": den_str,
      "image_cfg_scale": 7,
      "mask": mask,
      "mask_blur": 6,
      "mask_blur_x": 0,
      "mask_blur_y": 0,
      "inpainting_fill": 1,
      "inpaint_full_res": True,
      "inpaint_full_res_padding": 128,
      "inpainting_mask_invert": 0,
      "initial_noise_multiplier": 1,
      "prompt": prompt,
      "seed": -1,
      "subseed": -1,
      "subseed_strength": 0,
      "seed_resize_from_h": -1,
      "seed_resize_from_w": -1,
      "sampler_name": samler,
      "batch_size": 2,
      "n_iter": 1,
      "steps": 25,
      "cfg_scale": 7,
      "width": 640,
      "height": 640,
      "restore_faces": False,
      "tiling": False,
      "do_not_save_samples": False,
      "do_not_save_grid": False,
      "negative_prompt": "(deformed, distorted, disfigured:1.2), poorly drawn, bad anatomy, wrong anatomy(mutated hands and fingers:1.2) mutation, mutated, ugly, blurry, amputation",
      "eta": 31377,
      "s_min_uncond": 0,
      "s_churn": 0,
      "s_tmax": 0,
      "s_tmin": 0,
      "s_noise": 1,
      "override_settings_restore_afterwards": True,
      "include_init_images": False,
      "send_images": True,
      "save_images": False,
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

    response2 = requests.post("http://127.0.0.1:7860/sdapi/v1/img2img", json=payload2)

    if response2.status_code == 200:
        print(f"Второй этап выполнен успешно для маски {index}.")
        images_base64 = response2.json()["images"]

        for i, image_base64 in enumerate(images_base64):
            image_bytes = base64.b64decode(image_base64)

            image = Image.open(BytesIO(image_bytes))

            # Здесь мы добавляем номер изображения к имени файла
            filename = f"ready_{index}_{i+1}.jpg"
            image.save(filename)
            print(f"Image saved as {filename}")

        return images_base64[0]

    else:
        print(f"Ошибка во время выполнения второго этапа для маски {index}.")
        print(response2.json())
        error_message = response2.json().get('message', 'No error message available')
        print(f"Error message: {error_message}")

def main():
    parser = argparse.ArgumentParser(description='Process command line arguments.')
    parser.add_argument('file_path', type=str, default="", nargs='?', help='File path')
    parser.add_argument('dino_thres', type=float, default=0.4, nargs='?', help='Dino threshold')
    parser.add_argument('Dino_categore_1', type=str, default="clothes", nargs='?', help='Dino category 1')
    parser.add_argument('Dino_categore_2', type=str, default="bra, panties, underwear, shorts, garment", nargs='?', help='Dino category 2')
    parser.add_argument('prompt_1', type=str, default="nude,naked,natural skin", nargs='?', help='Prompt 1')
    parser.add_argument('prompt_2', type=str, default="naked", nargs='?', help='Prompt 2')
    parser.add_argument('den_str_1', type=float, default=1, nargs='?', help='Denominator strength 1')
    parser.add_argument('den_str_2', type=float, default=0.16, nargs='?', help='Denominator strength 2')
    parser.add_argument('den_str_3', type=float, default=1, nargs='?', help='Denominator strength 3')
    parser.add_argument('den_str_4', type=float, default=0.16, nargs='?', help='Denominator strength 4')
    parser.add_argument('one_mask', type=int, default=0, nargs='?', help='Process only first mask')
    parser.add_argument('content_type', type=str, default="real", nargs='?', help='Anime or Real type content')
    parser.add_argument('person', type=str, default="girl", nargs='?', help='Boy or Girl')
    parser.add_argument('mask_expand', type=int, default=10, nargs='?', help='How much mask will expand')
    parser.add_argument('adteiler_str', type=float, default=0.4, nargs='?', help='adteiler_str Strenght')
    

    args = parser.parse_args()

    # print(args.dino_thres)
    # print(args.Dino_categore_1)
    # print(args.Dino_categore_2)
    # print(args.prompt_1)
    # print(args.prompt_2)
    # print(args.den_str_1)
    # print(args.den_str_2)
    # print(args.den_str_3)
    # print(args.den_str_4)

    # Извлекаем путь к директории
    directory = os.path.dirname(args.file_path)
    # Устанавливаем базовую директорию

    one_mask = args.one_mask
    person = args.person
    content_type = args.content_type
    mask_expand = args.mask_expand
    adteiler_str = args.adteiler_str

    white_maks = ""


    img_filename = args.file_path
    img_base64 = filename_to_base64(img_filename).decode()


    prompt_base = ""

    if(args.person == "boy"):
        prompt_base = "man body, nature skin, RAW"
    else:
        prompt_base = "girl, nature skin, RAW"

    os.chdir(directory)
    reply = first_request(img_base64,args.dino_thres,args.Dino_categore_1, args.Dino_categore_2)
    pre_masks = handle_first_response(reply,one_mask,mask_expand)
    masks = []

    if(len(pre_masks) < 2):
        masks = [white_maks,pre_masks[0]]
    else:
        masks = [white_maks,pre_masks[0],pre_masks[1]]

    if(content_type == "real"):
        change_model("absolutereality_v181INPAINTING.safetensors [7e16c94105]")
    else:
        change_model("Anime-inpainting.safetensors [5bca7e55ea]")

    white_maks = filename_to_base64("test_mask_line.png").decode()
    print("white mask", white_maks)

    # if(len(masks) > 2):
    #     img = second_request(False,masks[1],0, img_base64,prompt_base + args.prompt_1,args.den_str_1)
    #     img = second_request(False,masks[1],1, img,prompt_base + "detailed skin",args.den_str_2,"Heun")
    #     # change_model("reliberate_v10.safetensors [980cb713af]")
    #     img = second_request(False,masks[2],2, img,args.prompt_2,args.den_str_3)
    #     img = second_request(True,masks[2],3, img,prompt_base + "detailed skin",args.den_str_4,"Heun")
    #     # img = second_request(masks[0],4, img,"detailed",0.1)
    # else:
    # change_model("reliberate_v20.safetensors [6b08e2c182]")
    img = second_request(False,masks[1],0, img_base64, prompt_base + "(" + args.prompt_1 +":1.2 )",1)
    # change_model("absolutereality_v181INPAINTING.safetensors [7e16c94105]")
    img = second_request(False,masks[1],0, img_base64, prompt_base +"(" + args.prompt_1 +":1.2 )",1)
    img = second_request(False,masks[1],0, img_base64, prompt_base +"(" + args.prompt_1 +":1.2 )",1)
    img = second_request(False,masks[0],0, img_base64, prompt_base +"(" + args.prompt_1 +":1.2 )",1)
    img = second_request(True,white_maks,1, img, "",args.den_str_2)
        


if __name__ == "__main__":
    main()

