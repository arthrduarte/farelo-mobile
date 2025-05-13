import { View, Text, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Feather from '@expo/vector-icons/Feather';

interface IngredientsSectionProps {
    ingredients: string[];
}

export const IngredientsSection: React.FC<IngredientsSectionProps> = ({ ingredients }) => {
    return (
        <View>
            <View style={styles.sectionHeader}>
                <Feather name="coffee" color="#793206" size={24} />
                <Text style={styles.sectionTitle}>Ingredients</Text>
            </View>
            {ingredients?.map((ingredient: string, index: number) => (
                <View 
                    key={index} 
                    style={[
                        styles.ingredient,
                        index % 2 === 0 ? styles.ingredientBrown : styles.ingredientBeige,
                    ]}
                >
                    <Text style={[
                        styles.ingredientText,
                        index % 2 === 0 ? styles.textOnBrown : styles.textOnBeige
                    ]}>• {ingredient}</Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#793206',
    },
    ingredient: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        padding: 12,
        borderRadius: 8,
    },
    ingredientBrown: {
        backgroundColor: '#79320633',
    },
    ingredientBeige: {
        backgroundColor: '#EDE4D2',
    },
    ingredientText: {
        fontSize: 18,
        flex: 1,
        marginBottom: 0,
    },
    textOnBrown: {
        color: '#793206',
    },
    textOnBeige: {
        color: '#793206',
    },
});
