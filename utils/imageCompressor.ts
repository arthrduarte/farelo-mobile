import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: ImageManipulator.SaveFormat;
}

const getFileSizeInMB = async (uri: string): Promise<number> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists && 'size' in fileInfo) {
      return fileInfo.size / (1024 * 1024); // Convert bytes to MB
    }
    return 0;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
};

const getCompressionSettings = (fileSizeMB: number) => {
  if (fileSizeMB < 1) {
    // Don't compress files under 1MB
    return null;
  } else if (fileSizeMB < 3) {
    // 1-3MB: light compression
    return { maxWidth: 1200, maxHeight: 1200, quality: 0.9 };
  } else if (fileSizeMB < 5) {
    // 3-5MB: moderate compression
    return { maxWidth: 1024, maxHeight: 1024, quality: 0.8 };
  } else if (fileSizeMB < 10) {
    // 5-10MB: heavy compression
    return { maxWidth: 800, maxHeight: 800, quality: 0.7 };
  } else {
    // 10MB+: very heavy compression
    return { maxWidth: 600, maxHeight: 600, quality: 0.6 };
  }
};

export const compressImage = async (
  uri: string,
  options: ImageCompressionOptions = {},
): Promise<string> => {
  try {
    const fileSizeMB = await getFileSizeInMB(uri);
    const autoSettings = getCompressionSettings(fileSizeMB);

    // If file is under 1MB and no custom options provided, return original
    if (!autoSettings && Object.keys(options).length === 0) {
      return uri;
    }

    const {
      maxWidth = autoSettings?.maxWidth || 1024,
      maxHeight = autoSettings?.maxHeight || 1024,
      quality = autoSettings?.quality || 0.8,
      format = ImageManipulator.SaveFormat.JPEG,
    } = options;

    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: maxWidth,
            height: maxHeight,
          },
        },
      ],
      {
        compress: quality,
        format,
      },
    );

    return result.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

export const getImageSize = async (uri: string): Promise<{ width: number; height: number }> => {
  try {
    const result = await ImageManipulator.manipulateAsync(uri, [], {
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return { width: result.width, height: result.height };
  } catch (error) {
    console.error('Error getting image size:', error);
    throw error;
  }
};
