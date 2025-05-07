import { View, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { PulsingPlaceholder } from '../recipe/ImagePlaceholder';
import { useState } from 'react';

interface LogImageProps {
    images?: string[];
    mainImage?: string;
    height?: number;
    onImagePress?: () => void;
}

export const LogImage: React.FC<LogImageProps> = ({ 
    images, 
    mainImage,
    height = 200,
    onImagePress
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // If it's a single image (recipe details case)
    if (mainImage) {
        return mainImage ? (
            <Image 
                source={{ uri: mainImage }} 
                style={[styles.recipeImage, { height }]}
            />
        ) : (
            <PulsingPlaceholder />
        );
    }

    // If it's multiple images (log details case)
    if (images && images.length > 0) {
        return (
            <View style={[styles.carouselContainer, { height: height + 50 }]}>
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={(e) => {
                        const offset = e.nativeEvent.contentOffset.x;
                        setCurrentImageIndex(Math.round(offset / styles.carouselImage.width));
                    }}
                    scrollEventThrottle={16}
                >
                    {images.map((image, index) => (
                        <TouchableOpacity 
                            key={index} 
                            onPress={onImagePress}
                            activeOpacity={onImagePress ? 0.8 : 1}
                        >
                            <Image
                                source={{ uri: image }}
                                style={[styles.carouselImage, { height }]}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <View style={styles.paginationDots}>
                    {images.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentImageIndex && styles.activeDot
                            ]}
                        />
                    ))}
                </View>
            </View>
        );
    }

    return <PulsingPlaceholder />;
};

const styles = StyleSheet.create({
    recipeImage: {
        width: '100%',
        borderRadius: 12,
        marginBottom: 16,
    },
    carouselContainer: {
        marginBottom: 16,
    },
    carouselImage: {
        width: 343, // Adjust based on screen width minus padding
        borderRadius: 12,
        marginRight: 16,
    },
    paginationDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#79320633',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#793206',
    },
});
