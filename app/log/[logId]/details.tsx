import { router, useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { MaterialIcons } from '@expo/vector-icons';
import { formatTimeAgo } from "@/lib/utils";
import { IngredientsSection } from "@/components/recipe/IngredientsSection";
import { InstructionsSection } from "@/components/recipe/InstructionsSection";
import { ImagesSection } from "@/components/recipe/ImagesSection";
import { TagsSection } from "@/components/recipe/TagsSection";
import { useLog } from "@/hooks/useLogs";
import { useAuth } from "@/contexts/AuthContext";

export default function LogDetailsScreen() {
    const { logId } = useLocalSearchParams();
    const { data, isLoading } = useLog(logId as string);
    const { profile } = useAuth();

    if (isLoading || !data) {
        return (
            <ThemedView style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#793206" />
            </ThemedView>
        );
    }

    const { log, comments } = data;

    return (
        <ThemedView style={styles.container}>
        
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <MaterialIcons name="arrow-back" size={24} color="#793206" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.header}>
                    <Image 
                        source={{ uri: log.profile.image }}
                        style={styles.avatar}
                    />
                    <View style={styles.headerText}>
                        <Text style={styles.name}>
                            {log.profile.first_name} {log.profile.last_name}
                        </Text>
                        <Text style={styles.time}>
                            {formatTimeAgo(log.created_at)}
                        </Text>
                    </View>
                </View>

                {/* Description */}
                <Text style={styles.description}>{log.description}</Text>

                {/* Image Carousel */}
                {log.images.length === 1 ? (
                    <ImagesSection mainImage={log.images[0]} height={250} />
                ) : (
                    <ImagesSection images={log.images} height={250} />
                )}

                {/* Add to Cookbook Button */}
                {log.recipe.profile_id != profile?.id ? (
                    <TouchableOpacity style={styles.addButton}>
                        <Text style={styles.addButtonText}>Add to your cookbook</Text>
                    </TouchableOpacity>
                ) : null}

                <View style={styles.divider} />

                {/* Tags */}
                <TagsSection tags={log.recipe.tags} />

                {/* Recipe Details */}
                <IngredientsSection ingredients={log.recipe.ingredients} />

                <View style={styles.divider} />

                <InstructionsSection instructions={log.recipe.instructions} />

                <View style={styles.divider} />

                {/* Comments Section */}
                <View>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="comment" size={24} color="#793206" />
                        <Text style={styles.sectionTitle}>Comments</Text>
                    </View>
                    {comments.map((comment, index) => (
                        <View 
                            key={comment.id}
                            style={[
                                styles.comment,
                                index % 2 === 0 ? styles.commentBrown : styles.commentBeige,
                            ]}
                        >
                            <Text style={[
                                styles.commentText,
                                index % 2 === 0 ? styles.textOnBrown : styles.textOnBeige
                            ]}>{comment.content}</Text>
                            <Text style={styles.commentTime}>
                                {formatTimeAgo(comment.created_at)}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        marginBottom: 16,
        height: 40,
        borderRadius: 20,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#793206',
    },
    time: {
        fontSize: 12,
        color: '#79320633',
    },
    description: {
        fontSize: 16,
        color: '#793206',
        marginBottom: 16,
    },
    addButton: {
        backgroundColor: '#793206',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 16,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        borderBottomColor: '#79320633',
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginVertical: 16,
    },
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
    comment: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    commentBrown: {
        backgroundColor: '#79320633',
    },
    commentBeige: {
        backgroundColor: '#EDE4D2',
    },
    commentText: {
        fontSize: 16,
        marginBottom: 4,
    },
    commentTime: {
        fontSize: 12,
        color: '#79320633',
    },
    textOnBrown: {
        color: '#793206',
    },
    textOnBeige: {
        color: '#793206',
    },
});
