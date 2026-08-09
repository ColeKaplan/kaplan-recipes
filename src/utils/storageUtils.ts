import { api } from "../lib/api";

/**
 * Extracts the file path from a Supabase storage URL (kept for reference).
 */
export const extractFilePathFromUrl = (url: string): string | null => {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        const publicIndex = pathParts.indexOf('public');
        if (publicIndex === -1 || publicIndex >= pathParts.length - 2) return null;
        return pathParts.slice(publicIndex + 2).join('/') || null;
    } catch {
        return null;
    }
};

/**
 * Deletes multiple images via the backend API.
 */
export const deleteImagesFromStorage = async (imageUrls: string[]): Promise<number> => {
    if (!imageUrls || imageUrls.length === 0) return 0;
    try {
        const { deleted } = await api.images.delete(imageUrls);
        return deleted;
    } catch (error) {
        console.error('Error deleting images:', error);
        return 0;
    }
};

/**
 * Determines which images were removed and deletes them from storage.
 */
export const cleanupRemovedImages = async (
    oldImages: string[] | null,
    newImages: string[] | null
): Promise<number> => {
    if (!oldImages || oldImages.length === 0) return 0;
    const newImageSet = new Set(newImages || []);
    const removedImages = oldImages.filter(url => !newImageSet.has(url));
    if (removedImages.length === 0) return 0;
    return await deleteImagesFromStorage(removedImages);
};
