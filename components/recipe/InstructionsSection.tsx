import { View, Text, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

interface InstructionsSectionProps {
    instructions: string[];
}

export const InstructionsSection: React.FC<InstructionsSectionProps> = ({ instructions }) => {
    return (
        <View>
            <View style={styles.sectionHeader}>
                <Feather name="book" color="#793206" size={24} />
                <Text style={styles.sectionTitle}>Instructions</Text>
            </View>
            {instructions?.map((instruction: string, index: number) => (
                <View 
                    key={index}
                    style={[
                        styles.instruction,
                        index % 2 === 0 ? styles.instructionBrown : styles.instructionBeige,
                    ]}
                >
                    <Text style={[
                        styles.instructionText,
                        index % 2 === 0 ? styles.textOnBrown : styles.textOnBeige
                    ]}>{index + 1}. {instruction}</Text>
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
});
