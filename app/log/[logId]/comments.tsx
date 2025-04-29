import { router, useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { MaterialIcons } from '@expo/vector-icons';
import { formatTimeAgo } from "@/lib/utils";
import { useLog } from "@/hooks/useLogs";
import { useAuth } from "@/contexts/AuthContext";
import React, { useState, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { KeyboardAvoidingView, Platform } from 'react-native';
import { Divider } from "@/components/Divider";

export default function LogCommentsScreen() {
    const { logId } = useLocalSearchParams();
    const { data, isLoading, refetch } = useLog(logId as string); // Get refetch function
    const { profile } = useAuth();
    const [newComment, setNewComment] = useState('');

    if (isLoading || !data || !profile) {
        return (
            <ThemedView style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#793206" />
            </ThemedView>
        );
    }

    const { log, comments } = data;

    const handleAddComment = useCallback(async () => {
        if (!newComment.trim() || !profile) return;

        const commentToAdd = {
            log_id: log.id,
            profile_id: profile.id,
            content: newComment.trim(),
        };

        setNewComment(''); // Clear input immediately for better UX

        try {
            const { error } = await supabase.from('log_comments').insert(commentToAdd);
            if (error) throw error;
            refetch(); // Refetch log data to show the new comment
        } catch (error) {
            console.error("Error adding comment:", error);
            // Optionally: Add error handling for the user (e.g., show a toast)
            // Re-set the input if sending failed? Depends on desired UX.
            // setNewComment(commentToAdd.content); 
        }
    }, [newComment, profile, log.id, refetch]);

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingContainer}
                keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // Adjust offset as needed
            >
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color="#793206" />
                </TouchableOpacity>

                {/* Log Header */}
                <View style={styles.logHeader}>
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
                <TouchableOpacity style={styles.recipeContainer} onPress={() => router.push({
                    pathname: '/log/[logId]/details',
                    params: { logId: log.id }
                })}>
                    <View style={styles.recipeDetailsContainer}>
                        <Text style={styles.recipeName}>{log.recipe.title}</Text>
                        {log.description && (
                            <Text style={styles.description}>{log.description}</Text>
                        )}
                    </View>
                    <View style={styles.recipeArrowContainer}>
                        <MaterialIcons name="arrow-forward" size={24} color="#793206" />
                    </View>
                </TouchableOpacity>

                <Divider />

                {/* Comments List */}
                <ScrollView style={styles.commentsScrollView}>
                    {comments.map((comment, index) => (
                        <View 
                            key={comment.id}
                            style={styles.commentContainer}
                        >
                            <Image 
                                source={{ uri: comment.profile?.image }} // Use comment profile image
                                style={styles.commentAvatar}
                            />
                            <View style={styles.commentContent}>
                                <Text style={styles.commentName}>
                                    {comment.profile?.first_name} {comment.profile?.last_name}
                                </Text>
                                <Text style={styles.commentText}>
                                    {comment.content}
                                </Text>
                                <Text style={styles.commentTime}>
                                    {formatTimeAgo(comment.created_at)}
                                </Text>
                            </View>
                        </View>
                    ))}
                    {comments.length === 0 && (
                        <Text style={styles.noCommentsText}>No comments yet. Be the first!</Text>
                    )}
                </ScrollView>

                {/* Add Comment Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Add a comment..."
                        placeholderTextColor="#79320680" 
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                    />
                    <TouchableOpacity onPress={handleAddComment} style={styles.sendButton} disabled={!newComment.trim()}>
                        <MaterialIcons 
                            name="send" 
                            size={24} 
                            color={!newComment.trim() ? "#79320633" : "#793206"} 
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

// Add comprehensive styles based on details.tsx and new elements
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
     keyboardAvoidingContainer: {
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
    logHeader: {
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
    recipeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recipeDetailsContainer: {
        flex: 1,
    },
    recipeArrowContainer: {
        padding: 16,
    },
    recipeName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#793206',
        marginBottom: 4,
    },
    description: {
        fontSize: 16, // Slightly smaller
        color: '#793206',
    },
    commentsScrollView: {
        flex: 1, // Takes remaining space
    },
    commentContainer: {
        flexDirection: 'row',
        borderRadius: 8,
        marginBottom: 8,
        alignItems: 'flex-start', // Align items to the top
    },
    commentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    commentContent: {
        flex: 1, // Take remaining width
    },
    commentBrown: {
        backgroundColor: '#79320633',
    },
    commentBeige: {
        backgroundColor: '#EDE4D2', // Use secondary color
    },
    commentName: {
        fontSize: 16,
        fontWeight: '600',
    },
    commentText: {
        fontSize: 16,
        fontWeight: '400',
        marginBottom: 4,
    },
    commentTime: {
        fontSize: 12, // Smaller time
        color: '#79320680', // Less prominent time color
    },
    textOnBrown: {
        color: '#793206', // Main color text
    },
    textOnBeige: {
        color: '#793206', // Main color text
    },
    noCommentsText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#79320680',
        fontStyle: 'italic',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#79320633',
        backgroundColor: '#EDE4D2', // Match card background
        alignItems: 'center', // Align items vertically
    },
    input: {
        flex: 1,
        minHeight: 40, // Minimum height
        maxHeight: 120, // Max height before scrolling
        backgroundColor: '#FFFFFF', // White background for input
        borderRadius: 20, // Rounded corners
        paddingHorizontal: 16,
        paddingVertical: 10, // Adjust vertical padding
        fontSize: 16,
        color: '#793206', // Text color
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#79320633',
    },
    sendButton: {
        padding: 8, // Padding around the icon
    },
});
