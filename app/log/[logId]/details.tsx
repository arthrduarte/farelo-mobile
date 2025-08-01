import { router, useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Animated, Alert } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { MaterialIcons } from '@expo/vector-icons';
import { formatTimeAgo } from "@/lib/utils";
import { IngredientsSection } from "@/components/recipe/IngredientsSection";
import { InstructionsSection } from "@/components/recipe/InstructionsSection";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ImagesSection } from "@/components/recipe/RecipeImage";
import { TagsSection } from "@/components/recipe/TagsSection";
import { useLog, useLogs } from "@/hooks/useLogs";
import { useCopyRecipe } from "@/hooks/useRecipes";
import { useAuth } from "@/contexts/AuthContext";
import { Divider } from "@/components/Divider";
import Drawer from "@/components/ui/Drawer";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function LogDetailsScreen() {
    const { logId } = useLocalSearchParams();
    const { data, isLoading } = useLog(logId as string);
    const { profile } = useAuth();
    const { mutate: copyRecipe, isPending: isCopying } = useCopyRecipe();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const drawerAnimation = useRef(new Animated.Value(0)).current;
    const { deleteLog, isDeleting } = useLogs(profile?.id || '');

    const toggleDrawer = () => {
        const toValue = isDrawerOpen ? 0 : 1;
        Animated.spring(drawerAnimation, {
            toValue,
            useNativeDriver: true,
            tension: 65,
            friction: 11
        }).start();
        setIsDrawerOpen(!isDrawerOpen);
    };

    if (isLoading || !data || !profile) {
        return (
            <ThemedView style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#793206" />
            </ThemedView>
        );
    }

    const { log, comments } = data;
    const isOwnRecipe = log.recipe.profile_id === profile.id;

    const handleCopyRecipe = () => {
        if (isOwnRecipe) return;
        if (isDrawerOpen) {
            toggleDrawer();
        }
        copyRecipe({ recipeIdToCopy: log.recipe.id });
    };

    const handleDeleteLog = async () => {
        if (!log || !log.id) return;
        toggleDrawer();
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this log? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteLog(log.id);
                            Alert.alert("Log Deleted", "The log has been successfully deleted.", [
                                { text: "OK", onPress: () => {
                                    router.back();
                                }}
                            ]);
                        } catch (error) {
                            console.error("[LogDetailsScreen] Failed to delete log:", error);
                            Alert.alert("Error", "Could not delete the log. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    const handleReportLog = () => {
        if (!log || !log.id) return;
        toggleDrawer();
        router.push(`/report?type=log&itemId=${log.id}`);
    };

    const drawerOptions = isOwnRecipe
        ? [
            {
                icon: 'delete' as keyof typeof MaterialIcons.glyphMap,
                text: isDeleting ? 'Deleting...' : 'Delete Log',
                onPress: handleDeleteLog,
                disabled: isDeleting,
            },
          ]
        : [
            {
                icon: 'report' as keyof typeof MaterialIcons.glyphMap,
                text: 'Report Log',
                onPress: handleReportLog,
            },
            {
                icon: 'save-alt' as keyof typeof MaterialIcons.glyphMap,
                text: 'Save Recipe',
                onPress: handleCopyRecipe,
            },
          ];

    return (
        <ThemedView style={styles.container}>
            <ScreenHeader 
                title="Details" 
                showBackButton={true} 
                rightItem={
                    <TouchableOpacity onPress={toggleDrawer}>
                        <MaterialIcons name="more-vert" size={24} color="#793206" />
                    </TouchableOpacity>
                }
            />

            <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 16 }}>
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

                <Text style={styles.recipeName}>{log.recipe.title}</Text>
                {log.description && (
                    <Text style={styles.description}>{log.description}</Text>
                )}

                {/* Image Carousel */}
                {log.images.length === 1 ? (
                    <ImagesSection mainImage={log.images[0]} height={250} />
                ) : (
                    <ImagesSection images={log.images} height={250} />
                )}

                {/* Add to Cookbook Button */}
                {!isOwnRecipe ? (
                    <TouchableOpacity 
                        style={[styles.addButton, isCopying && styles.disabledButton]}
                        onPress={handleCopyRecipe}
                        disabled={isCopying}
                    >
                        <Text style={styles.addButtonText}>
                            {isCopying ? "Copying..." : "Copy to your recipes"}
                        </Text>
                    </TouchableOpacity>
                ) : null}

                <Divider />

                {/* Tags */}
                <TagsSection tags={log.recipe.tags} />

                {/* Recipe Details */}
                <IngredientsSection ingredients={log.recipe.ingredients} />

                <Divider />

                <InstructionsSection instructions={log.recipe.instructions} />

                <Divider />
            </ScrollView>
            <Drawer
                isDrawerOpen={isDrawerOpen}
                toggleDrawer={toggleDrawer}
                drawerAnimation={drawerAnimation}
                options={drawerOptions}
                title="Options"
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    recipeName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#793206',
        marginBottom: 8,
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
    disabledButton: {
        backgroundColor: '#79320680',
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
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
