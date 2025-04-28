import { View, Text, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface NotesSectionProps {
    notes?: string;
}

export const NotesSection: React.FC<NotesSectionProps> = ({ notes }) => {
    return (
        <View>
            <View style={styles.sectionHeader}>
                <IconSymbol name="book" color="#793206" size={24} />
                <Text style={styles.sectionTitle}>Notes</Text>
            </View>
            <View style={styles.notesContainer}>
                <Text style={[styles.notesText, styles.textOnBrown]}>
                    {notes || 'No notes added yet.'}
                </Text>
            </View>
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
    notesContainer: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#fff',
    },
    notesText: {
        fontSize: 18,
        lineHeight: 24,
    },
    textOnBrown: {
        color: '#793206',
    },
});
