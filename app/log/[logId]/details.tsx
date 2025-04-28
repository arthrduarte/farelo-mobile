import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { Log, Profile, Recipe, Log_Comment } from "@/types/db";
import { MaterialIcons } from '@expo/vector-icons';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useState } from "react";
import { formatTimeAgo } from "@/lib/utils";

type EnhancedLog = Log & {
    profile: Pick<Profile, 'first_name' | 'last_name' | 'username' | 'image'>;
    recipe: Recipe;
};

type ChatMessage = {
    role: 'user' | 'ai';
    message: string;
    timestamp: string;
};

// Temporary mock data
const MOCK_LOG: EnhancedLog = {
    id: "1",
    profile_id: "1",
    recipe_id: "1",
    description: "This recipe turned out amazing! The flavors were perfect.",
    images: [
        "https://picsum.photos/400/300",
        "https://picsum.photos/400/301",
        "https://picsum.photos/400/302"
    ],
    created_at: "2024-03-20T10:00:00Z",
    profile: {
        first_name: "John",
        last_name: "Doe",
        username: "johndoe",
        image: "https://picsum.photos/100/100"
    },
    recipe: {
        id: "1",
        title: "Spaghetti Carbonara",
        description: "Classic Italian pasta dish",
        ai_image_url: "",
        time: 30,
        servings: 4,
        ingredients: [
            "400g spaghetti",
            "200g pancetta",
            "4 large eggs",
            "100g Pecorino Romano",
            "100g Parmigiano Reggiano",
            "Black pepper"
        ],
        instructions: [
            "Bring a large pot of salted water to boil",
            "Cook pasta according to package instructions",
            "Meanwhile, cook pancetta until crispy",
            "Mix eggs and cheese in a bowl",
            "Combine everything and serve hot"
        ],
        tags: ["Italian", "Pasta", "Quick"],
        source_url: "",
        user_image_url: "",
        notes: "",
        profile_id: "1",
        chat: [] as ChatMessage[]
    }
};

const MOCK_COMMENTS: Log_Comment[] = [
    {
        id: "1",
        log_id: "1",
        profile_id: "2",
        content: "Looks delicious! I'll try this soon.",
        created_at: "2024-03-20T11:00:00Z"
    },
    {
        id: "2",
        log_id: "1",
        profile_id: "3",
        content: "Great presentation!",
        created_at: "2024-03-20T12:00:00Z"
    }
];


export default function LogDetailsScreen() {
    const { logId } = useLocalSearchParams();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // For now using mock data - will be replaced with real data fetching
    const log = MOCK_LOG;
    const comments = MOCK_COMMENTS;

    if (!log) {
        return (
            <ThemedView style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#793206" />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
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
                <View style={styles.carouselContainer}>
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
                        {log.images.map((image, index) => (
                            <Image
                                key={index}
                                source={{ uri: image }}
                                style={styles.carouselImage}
                            />
                        ))}
                    </ScrollView>
                    <View style={styles.paginationDots}>
                        {log.images.map((_, index) => (
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

                {/* Add to Cookbook Button */}
                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>Add to your cookbook</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                {/* Recipe Details */}
                <View>
                    <View style={styles.sectionHeader}>
                        <IconSymbol name="pepper" color="#793206" size={24} />
                        <Text style={styles.sectionTitle}>Ingredients</Text>
                    </View>
                    {log.recipe.ingredients?.map((ingredient, index) => (
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

                <View style={styles.divider} />

                <View>
                    <View style={styles.sectionHeader}>
                        <IconSymbol name="book" color="#793206" size={24} />
                        <Text style={styles.sectionTitle}>Instructions</Text>
                    </View>
                    {log.recipe.instructions?.map((instruction, index) => (
                        <View 
                            key={index}
                            style={[
                                styles.instruction,
                                index % 2 === 0 ? styles.ingredientBrown : styles.ingredientBeige,
                            ]}
                        >
                            <Text style={[
                                styles.instructionText,
                                index % 2 === 0 ? styles.textOnBrown : styles.textOnBeige
                            ]}>{index + 1}. {instruction}</Text>
                        </View>
                    ))}
                </View>

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
                                index % 2 === 0 ? styles.ingredientBrown : styles.ingredientBeige,
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
    carouselContainer: {
        height: 300,
        marginBottom: 16,
    },
    carouselImage: {
        width: 343, // Adjust based on screen width minus padding
        height: 250,
        borderRadius: 12,
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
        marginBottom: 16,
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
    instruction: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        padding: 12,
        borderRadius: 8,
    },
    instructionText: {
        fontSize: 18,
        flex: 1,
        marginBottom: 0,
    },
    comment: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    commentText: {
        fontSize: 16,
        marginBottom: 4,
    },
    commentTime: {
        fontSize: 12,
        color: '#79320633',
    },
});
