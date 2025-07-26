import { View, Text, StyleSheet, Pressable } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';

interface InstructionsSectionProps {
    instructions: string[];
    details?: boolean;
}

export const InstructionsSection: React.FC<InstructionsSectionProps> = ({ instructions, details = false }) => {
    const [checkedInstructions, setCheckedInstructions] = useState<boolean[]>(instructions.map(() => false));

    const toggleInstruction = (index: number) => {
        const newCheckedInstructions = [...checkedInstructions];
        newCheckedInstructions[index] = !newCheckedInstructions[index];
        setCheckedInstructions(newCheckedInstructions);
    };

    return (
        <View>
            <View style={styles.sectionHeader}>
                <Feather name="book" color="#793206" size={24} />
                <Text style={styles.sectionTitle}>Instructions</Text>
            </View>
            {instructions?.map((instruction: string, index: number) => (
                <Pressable 
                    key={index}
                    style={[
                        styles.instruction,
                        index % 2 === 0 ? styles.instructionBrown : styles.instructionBeige,
                    ]}
                    onPress={() => details && toggleInstruction(index)}
                >
                    <View style={styles.instructionContent}>
                        {details && (
                            <Feather 
                                name={checkedInstructions[index] ? "check-square" : "square"} 
                                size={20} 
                                color="#793206" 
                                style={styles.checkbox}
                            />
                        )}
                        <Text style={[
                            styles.instructionText,
                            index % 2 === 0 ? styles.textOnBrown : styles.textOnBeige,
                            checkedInstructions[index] && styles.checkedText
                        ]}>
                            {index + 1}. {instruction}
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
    instruction: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        padding: 12,
        borderRadius: 8,
    },
    instructionBrown: {
        backgroundColor: '#79320633',
    },
    instructionBeige: {
        backgroundColor: '#EDE4D2',
    },
    instructionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    checkbox: {
        marginRight: 8,
    },
    instructionText: {
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
