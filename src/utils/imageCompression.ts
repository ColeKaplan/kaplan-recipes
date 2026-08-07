import imageCompression from 'browser-image-compression';

export interface ImageCompressionOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    fileType?: string;
    initialQuality?: number;
}

/**
 * Compresses and optimizes an image file
 * @param file - The original image file
 * @param options - Compression options
 * @returns Compressed image file
 */
export const compressImage = async (
    file: File,
    options?: ImageCompressionOptions
): Promise<File> => {
    const defaultOptions: ImageCompressionOptions = {
        maxSizeMB: 1, // Maximum file size in MB
        maxWidthOrHeight: 1920, // Max dimension (maintains aspect ratio)
        useWebWorker: true, // Use web worker for better performance
        fileType: 'image/webp', // Convert to WebP for better compression
        initialQuality: 0.85, // 85% quality - good balance between size and quality
    };

    const compressionOptions = { ...defaultOptions, ...options };

    try {
        const compressedFile = await imageCompression(file, compressionOptions);

        // If the compressed file is larger than original (rare), return original
        if (compressedFile.size > file.size) {
            console.warn('Compressed file is larger than original, using original file');
            return file;
        }

        // Create a new File object with proper name and extension
        const fileExtension = compressionOptions.fileType === 'image/webp' ? 'webp' :
            compressionOptions.fileType === 'image/jpeg' ? 'jpg' :
                file.name.split('.').pop();

        const fileName = file.name.replace(/\.[^/.]+$/, '') + '.' + fileExtension;

        const optimizedFile = new File([compressedFile], fileName, {
            type: compressionOptions.fileType || compressedFile.type,
            lastModified: Date.now(),
        });

        // Log compression stats
        const originalSizeMB = (file.size / 1024 / 1024).toFixed(2);
        const compressedSizeMB = (optimizedFile.size / 1024 / 1024).toFixed(2);
        const reductionPercent = (((file.size - optimizedFile.size) / file.size) * 100).toFixed(1);

        console.log(`Image compressed: ${originalSizeMB}MB → ${compressedSizeMB}MB (${reductionPercent}% reduction)`);

        return optimizedFile;
    } catch (error) {
        console.error('Error compressing image:', error);
        // Return original file if compression fails
        return file;
    }
};

/**
 * Compresses multiple image files
 * @param files - Array of image files
 * @param options - Compression options
 * @returns Array of compressed image files
 */
export const compressImages = async (
    files: File[],
    options?: ImageCompressionOptions
): Promise<File[]> => {
    const compressionPromises = files.map(file => compressImage(file, options));
    return Promise.all(compressionPromises);
};

/**
 * Validates if a file is an image
 * @param file - File to validate
 * @returns True if file is an image
 */
export const isImageFile = (file: File): boolean => {
    return file.type.startsWith('image/');
};

/**
 * Gets image dimensions
 * @param file - Image file
 * @returns Promise with width and height
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: img.width, height: img.height });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
};

/**
 * Preset configurations for different use cases
 */
export const CompressionPresets = {
    // For recipe hero images - high quality, reasonable size
    recipeHero: {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1920,
        fileType: 'image/webp',
        initialQuality: 0.85,
    },
    // For recipe thumbnails - smaller size, good quality
    recipeThumbnail: {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 800,
        fileType: 'image/webp',
        initialQuality: 0.8,
    },
    // For user avatars - small size
    avatar: {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 400,
        fileType: 'image/webp',
        initialQuality: 0.8,
    },
} as const;
