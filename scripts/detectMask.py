import numpy as np
from skimage.measure import label, regionprops
from skimage.morphology import remove_small_objects
from skimage.io import imread, imsave
from skimage.filters import gaussian
from skimage import morphology
from PIL import Image
import base64
from io import BytesIO

from skimage.morphology import disk
from scipy.ndimage import binary_dilation

def dilate_mask(mask_filename, dilation_radius=20):

    # Загружаем маску из файла
    mask = imread(mask_filename, as_gray=True)

    # Расширяем область на заданное количество пикселей
    dilated_mask = binary_dilation(mask > 0, disk(dilation_radius))

    # Нормализуем маску
    dilated_mask = (dilated_mask.astype(np.uint8)) * 255

    # Сохраняем расширенную маску в исходный файл
    Image.fromarray(dilated_mask).save(mask_filename)

    return mask_filename

dilate_mask("mask1.png",20)

def split_mask_into_regions(mask_filename, min_size=1200, dilation_radius=20):
    # Загрузим изображение маски
    mask = imread(mask_filename)

    # Удаляем маленькие объекты
    clean_mask = remove_small_objects(mask > 1, min_size=min_size)

    # Размываем края
    smooth_mask = gaussian(clean_mask, sigma=0.8)

    # Метки для связных компонентов на изображении
    labeled_mask = label(smooth_mask > 0.1)  # Выберите подходящий порог

    # Получаем свойства отдельных областей
    regions = regionprops(labeled_mask)

    # Сортируем области по размеру в обратном порядке
    regions.sort(key=lambda x: x.area, reverse=True)

    masks = []
    for i, region in enumerate(regions):  # Проходим по всем областям
        if i > 1:  # Если это не первые две области, пропускаем итерацию
            continue

        # Создаем новую маску для каждой области
        new_mask = np.zeros_like(labeled_mask)
        new_mask[labeled_mask == region.label] = 255  # выделяем область

        # Расширяем область на заданное количество пикселей
        dilated_mask = binary_dilation(new_mask, structure=disk(dilation_radius))

        # Нормализуем маску
        dilated_mask = (dilated_mask * 255).astype(np.uint8)

        # Имя файла для сохранения маски
        output_filename = f'mask_region_{i}.png'

        # Сохраняем маску в файл
        im = Image.fromarray(dilated_mask)
        im.save(output_filename)

        masks.append(dilated_mask)  # Добавляем маску в список

    return masks  # Возвращаем список масок

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

# create_edge_mask("mask3.png")
# split_mask_into_regions("mask3.png")
# split_mask_into_regions("mask2.png")
# split_mask_into_regions("mask3.png")


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

# create_white_image_base64("mask3.png")