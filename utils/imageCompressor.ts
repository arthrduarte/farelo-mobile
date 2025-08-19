import * as ImageManipulator from 'expo-image-manipulator';

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: ImageManipulator.SaveFormat;
}

export const compressImage = async (
  uri: string,
  options: ImageCompressionOptions = {},
): Promise<string> => {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.8,
    format = ImageManipulator.SaveFormat.JPEG,
  } = options;

  try {
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
