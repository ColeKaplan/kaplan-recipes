import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
  initialQuality?: number;
}

export const defaultCompressionOptions: CompressionOptions = {
  maxSizeMB: 0.75, // Kept under 1MB to avoid proxy/server payload limits
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp',
  initialQuality: 0.8,
};

/**
 * Compresses a single image file to WebP under the specified size limit.
 */
export async function compressImage(
  file: File,
  customOptions?: Partial<CompressionOptions>
): Promise<File> {
  const options = { ...defaultCompressionOptions, ...customOptions };

  try {
    const originalSizeMB = (file.size / 1024 / 1024).toFixed(2);
    const compressedBlob = await imageCompression(file, options);
    
    // Convert to File with proper .webp extension
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const newFileName = `${baseName}.webp`;
    const compressedFile = new File([compressedBlob], newFileName, {
      type: 'image/webp',
      lastModified: Date.now(),
    });

    const compressedSizeMB = (compressedFile.size / 1024 / 1024).toFixed(2);
    console.log(
      `[Image Compression] ${file.name}: ${originalSizeMB}MB → ${compressedSizeMB}MB (under ${options.maxSizeMB}MB limit)`
    );

    return compressedFile;
  } catch (error) {
    console.warn(`[Image Compression] Failed to compress ${file.name}, using original:`, error);
    return file;
  }
}

/**
 * Compresses an array of image files in parallel.
 */
export async function compressImages(
  files: File[],
  customOptions?: Partial<CompressionOptions>
): Promise<File[]> {
  if (!files || files.length === 0) return [];
  return Promise.all(files.map((file) => compressImage(file, customOptions)));
}
