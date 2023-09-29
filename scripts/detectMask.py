import numpy as np
from skimage.measure import label, regionprops
from skimage.morphology import remove_small_objects
from skimage.io import imread, imsave
from skimage.filters import gaussian
from PIL import Image

from skimage.morphology import disk
from scipy.ndimage.morphology import binary_dilation

def dilate_mask(mask_filename, dilation_radius=20):
    """
    Эта функция принимает имя файла маски, загружает маску, расширяет ее на заданное количество пикселей
    и сохраняет расширенную маску в исходный файл.

    :param mask_filename: Имя файла с маской, которую нужно расширить.
    :param dilation_radius: Количество пикселей, на которые нужно расширить маску. По умолчанию равно 20.
    """

    # Загружаем маску из файла
    mask = imread(mask_filename, as_gray=True)

    # Расширяем область на заданное количество пикселей
    dilated_mask = binary_dilation(mask > 0, disk(dilation_radius))

    # Нормализуем маску
    dilated_mask = (dilated_mask.astype(np.uint8)) * 255

    # Сохраняем расширенную маску в исходный файл
    Image.fromarray(dilated_mask).save(mask_filename)

    return mask_filename

# dilate_mask("D:\\Dev\\UNDRESS_bot\\sessions\\225703666\\1245\\mask1.png",20)

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

# split_mask_into_regions("mask1.png")
# split_mask_into_regions("mask2.png")
# split_mask_into_regions("mask3.png")