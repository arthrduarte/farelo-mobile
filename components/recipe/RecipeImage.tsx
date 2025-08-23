import { Image, StyleSheet, Dimensions } from 'react-native';
import { PulsingPlaceholder } from './ImagePlaceholder';

const windowWidth = Dimensions.get('window').width;
const imageSize = windowWidth - 32; // Full width minus padding (16 on each side)

interface ImagesSectionProps {
  image_url?: string;
  height?: number;
}

export const ImagesSection = ({ image_url = '', height = imageSize }: ImagesSectionProps) => {
  return image_url ? (
    <Image
      source={{ uri: image_url }}
      style={[styles.recipeImage, { height: height, width: height }]}
    />
  ) : (
    <PulsingPlaceholder />
  );
};

const styles = StyleSheet.create({
  recipeImage: {
    borderRadius: 12,
    marginBottom: 16,
  },
});
