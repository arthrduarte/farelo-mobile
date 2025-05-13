import { router, useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { MaterialIcons } from '@expo/vector-icons';
import { formatTimeAgo } from "@/lib/utils";
import { useLog } from "@/hooks/useLogs";
import { useAuth } from "@/contexts/AuthContext";
import React, { useState, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { Divider } from "@/components/Divider";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

export default function LogCommentsScreen() {
    const { logId } = useLocalSearchParams();
    const { data, isLoading, refetch } = useLog(logId as string);
    const { profile } = useAuth();
    const [newComment, setNewComment] = useState('');

    const handleAddComment = useCallback(async () => {
        if (!newComment.trim() || !profile || !data?.log?.id) return;

        const commentToAdd = {
            log_id: data.log.id,
            profile_id: profile.id,
            content: newComment.trim(),
        };

        setNewComment('');

        try {
            const { error } = await supabase.from('log_comments').insert(commentToAdd);
            if (error) throw error;
            refetch();
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    }, [newComment, profile, data?.log?.id, refetch]);

    if (isLoading || !data || !profile) {
        return (
            <ThemedView style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#793206" />
            </ThemedView>
        );
    }

    const { log, comments } = data;

    return (
        <ThemedView style={styles.container}>
            <ScreenHeader title="Comments" showBackButton={true} />
            <KeyboardAvoidingView 
                style={styles.keyboardAvoidingContainer}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <View style={styles.topContentContainer}>
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
                                <Text style={styles.description} numberOfLines={2}>{log.description}</Text>
                            )}
                        </View>
                        <View style={styles.recipeArrowContainer}>
                            <MaterialIcons name="arrow-forward" size={24} color="#793206" />
                        </View>
                    </TouchableOpacity>
                    <Divider />
                </View>

                <ScrollView 
                    style={styles.commentsScrollView}
                    contentContainerStyle={styles.commentsScrollContentContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    {comments.map((comment) => (
                        <View 
                            key={comment.id}
                            style={styles.commentContainer}
                        >
                            <Image 
                                source={{ uri: comment.profile?.image }}
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
                        <View style={styles.noCommentsContainer}>
                            <Text style={styles.noCommentsText}>No comments yet. Be the first!</Text>
                        </View>
                    )}
                </ScrollView>

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EDE4D2',
    },
    keyboardAvoidingContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContentContainer: {
    },
    logHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 16,
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
        marginBottom: 16,
    },
    recipeDetailsContainer: {
        flex: 1,
    },
    recipeArrowContainer: {
        paddingLeft: 16,
    },
    recipeName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#793206',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#793206',
        opacity: 0.8,
    },
    commentsScrollView: {
        flex: 1,
    },
    commentsScrollContentContainer: {
        paddingBottom: 16,
    },
    commentContainer: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
        marginTop: 2,
    },
    commentContent: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#7932061A',
    },
    commentName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#793206',
        marginBottom: 2,
    },
    commentText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#333333',
        lineHeight: 18,
    },
    commentTime: {
        fontSize: 10,
        color: '#79320680',
        marginTop: 4,
        textAlign: 'right',
    },
    noCommentsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    noCommentsText: {
        textAlign: 'center',
        color: '#79320680',
        fontSize: 14,
        fontStyle: 'italic',
    },
    inputContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 0,
        borderTopWidth: 1,
        borderTopColor: '#79320633',
        backgroundColor: '#EDE4D2',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 10 : 8,
        fontSize: 16,
        color: '#793206',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#79320633',
    },
    sendButton: {
        padding: 8,
    },
});
