import { supabase } from "../lib/supabase";

/**
 * Extracts the file path from a Supabase storage URL
 * @param url - The full public URL from Supabase storage
 * @returns The file path or null if invalid
 */
export const extractFilePathFromUrl = (url: string): string | null => {
    try {
        // Supabase storage URLs follow the pattern:
        // https://<project>.supabase.co/storage/v1/object/public/<bucket>/<filepath>
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');

        // Find the bucket name and get everything after it
        const publicIndex = pathParts.indexOf('public');
        if (publicIndex === -1 || publicIndex >= pathParts.length - 2) {
            return null;
        }

        // Skip 'public' and bucket name, get the rest
        const filePath = pathParts.slice(publicIndex + 2).join('/');
        return filePath || null;
    } catch (error) {
        console.error('Error extracting file path from URL:', error);
        return null;
    }
};

/**
 * Deletes a single image from Supabase storage
 * @param imageUrl - The full public URL of the image
 * @returns Promise with success status
 */
export const deleteImageFromStorage = async (imageUrl: string): Promise<boolean> => {
    const filePath = extractFilePathFromUrl(imageUrl);

    if (!filePath) {
        console.error('Could not extract file path from URL:', imageUrl);
        return false;
    }

    try {
        const { error } = await supabase.storage
            .from('recipe-images')
            .remove([filePath]);

        if (error) {
            console.error('Error deleting image from storage:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Exception while deleting image:', error);
        return false;
    }
};

/**
 * Deletes multiple images from Supabase storage
 * @param imageUrls - Array of full public URLs
 * @returns Promise with count of successfully deleted images
 */
export const deleteImagesFromStorage = async (imageUrls: string[]): Promise<number> => {
    if (!imageUrls || imageUrls.length === 0) {
        return 0;
    }

    const filePaths = imageUrls
        .map(extractFilePathFromUrl)
        .filter((path): path is string => path !== null);

    if (filePaths.length === 0) {
        console.warn('No valid file paths found in provided URLs');
        return 0;
    }

    try {
        const { error } = await supabase.storage
            .from('recipe-images')
            .remove(filePaths);

        if (error) {
            console.error('Error deleting images from storage:', error);
            return 0;
        }

        return filePaths.length;
    } catch (error) {
        console.error('Exception while deleting images:', error);
        return 0;
    }
};

/**
 * Determines which images were removed and deletes them from storage
 * @param oldImages - Array of image URLs before update
 * @param newImages - Array of image URLs after update
 * @returns Promise with count of deleted images
 */
export const cleanupRemovedImages = async (
    oldImages: string[] | null,
    newImages: string[] | null
): Promise<number> => {
    if (!oldImages || oldImages.length === 0) {
        return 0;
    }

    const newImageSet = new Set(newImages || []);
    const removedImages = oldImages.filter(url => !newImageSet.has(url));

    if (removedImages.length === 0) {
        return 0;
    }

    return await deleteImagesFromStorage(removedImages);
};
