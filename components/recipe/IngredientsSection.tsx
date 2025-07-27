import { View, Text, StyleSheet, Pressable } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';

interface IngredientsSectionProps {
    ingredients: string[];
    details?: boolean;
}

export const IngredientsSection: React.FC<IngredientsSectionProps> = ({ ingredients, details = false }) => {
    const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>(ingredients.map(() => false));

    const toggleIngredient = (index: number) => {
        const newCheckedIngredients = [...checkedIngredients];
        newCheckedIngredients[index] = !newCheckedIngredients[index];
        setCheckedIngredients(newCheckedIngredients);
    };

    return (
        <View>
            <View style={styles.sectionHeader}>
                <Feather name="coffee" color="#793206" size={24} />
                <Text style={styles.sectionTitle}>Ingredients</Text>
            </View>
            {ingredients?.map((ingredient: string, index: number) => (
                <Pressable 
                    key={index} 
                    style={[
                        styles.ingredient,
                        index % 2 === 0 ? styles.ingredientBrown : styles.ingredientBeige,
                    ]}
                    onPress={() => details && toggleIngredient(index)}
                >
                    <View style={styles.ingredientContent}>
                        {details && (
                            <Feather 
                                name={checkedIngredients[index] ? "check-square" : "square"} 
                                size={20} 
                                color="#793206" 
                                style={styles.checkbox}
                            />
                        )}
                        <Text style={[
                            styles.ingredientText,
                            index % 2 === 0 ? styles.textOnBrown : styles.textOnBeige,
                            checkedIngredients[index] && styles.checkedText
                        ]}>
                            {details ? ingredient : `• ${ingredient}`}
                        </Text>
                    </View>
                </Pressable>
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
    ingredientContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    checkbox: {
        marginRight: 8,
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
    checkedText: {
        textDecorationLine: 'line-through',
        opacity: 0.7,
    },
});
