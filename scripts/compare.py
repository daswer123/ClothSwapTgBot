import numpy as np
from PIL import Image

def load_mask(filename):
    """Load mask from a PNG file and convert to binary format."""
    img = Image.open(filename)
    return np.array(img) > 0  # Assume mask is binary: white (255) and black (0)

def jaccard_similarity(mask1, mask2):
    """Compute Jaccard coefficient for two masks."""
    intersection = np.logical_and(mask1, mask2)
    union = np.logical_or(mask1, mask2)
    return intersection.sum() / float(union.sum())

def count_white_pixels(mask):
    """Count the number of white pixels in a mask."""
    return mask.sum()

def compare_test():

    # Load masks
    mask1 = load_mask('mask1.png')
    mask2 = load_mask('mask2.png')
    mask3 = load_mask('mask3.png')

    # Compute Jaccard coefficient for each pair of masks
    similarity12 = jaccard_similarity(mask1, mask2)
    similarity13 = jaccard_similarity(mask1, mask3)
    similarity23 = jaccard_similarity(mask2, mask3)

    # Count white pixels in each mask and find the mask with the most white pixels
    white_pixels1 = count_white_pixels(mask1)
    white_pixels2 = count_white_pixels(mask2)
    white_pixels3 = count_white_pixels(mask3)

    max_white_pixels_mask = np.argmax([white_pixels1, white_pixels2, white_pixels3]) + 1

    # Print results
    print(f"Similarity between mask1 and mask2: {similarity12*100:.2f}%")
    print(f"Similarity between mask1 and mask3: {similarity13*100:.2f}%")
    print(f"Similarity between mask2 and mask3: {similarity23*100:.2f}%")
    print(f"Mask {max_white_pixels_mask} has the most white pixels.")
def compare_masks(mask_filenames, high_similarity_threshold=0.9, low_similarity_threshold=0.1):
    # Load masks
    masks = [load_mask(filename) for filename in mask_filenames]

    # Compute Jaccard coefficient for each pair of masks
    similarities = {(i, j): jaccard_similarity(masks[i], masks[j]) for i in range(len(masks)) for j in range(i+1, len(masks))}

    # Check for any combination of masks that meets the criteria
    for i in range(len(masks)):
        for j in range(i+1, len(masks)):
            k = 3 - i - j  # The index of the third mask (since we know i + j + k = 3 for indices 0, 1, 2)
            sum_similarity_i = similarities[(min(i, j), max(i, j))] + similarities[(min(i, k), max(i, k))]
            sum_similarity_j = similarities[(min(i, j), max(i, j))] + similarities[(min(j, k), max(j, k))]
            if high_similarity_threshold <= sum_similarity_i < 1 and similarities[(min(j, k), max(j, k))] < low_similarity_threshold:
                return [j+1, k+1]  # +1 to get the mask number, not index
            if high_similarity_threshold <= sum_similarity_j < 1 and similarities[(min(i, k), max(i, k))] < low_similarity_threshold:
                return [i+1, k+1]  # +1 to get the mask number, not index

    # If no suitable combination of masks is found, return the mask with the most white pixels
    white_pixels = [count_white_pixels(mask) for mask in masks]
    max_white_pixels = max(white_pixels)
    max_white_pixels_mask = white_pixels.index(max_white_pixels) + 1  # +1 to get the mask number, not index
    return [max_white_pixels_mask]

# Usage:
# masks_to_use = compare_masks(["mask1.png", "mask2.png", "mask3.png"])
# print(f"Masks to use: {masks_to_use}")


# compare_test()
# mask_to_use = compare_masks(["mask1.png", "mask2.png", "mask3.png"])
# print(mask_to_use)
# if mask_to_use == 0:
#     print("No masks are similar enough.")
# else:
#     print(f"Mask {mask_to_use} is the most similar and has the most white pixels.")