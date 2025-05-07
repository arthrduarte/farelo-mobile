import { View, Text, StyleSheet } from 'react-native';

interface TagsSectionProps {
    tags?: string[];
}

export const TagsSection: React.FC<TagsSectionProps> = ({ tags }) => {
    if (!tags || tags.length === 0) return null;

    return (
        <View style={styles.tagContainer}>
            {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    tag: {
        backgroundColor: '#793206',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    tagText: {
        color: 'white',
        fontSize: 14,
    },
});
