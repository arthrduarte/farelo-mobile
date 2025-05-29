import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert, SafeAreaView, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useRecipe, RECIPE_KEYS } from '@/hooks/useRecipes';
import { useLocalSearchParams } from 'expo-router';
import { MessageItem } from '@/components/chat/MessageItem';
import { ChatInput } from '@/components/chat/ChatInput';
import { useQueryClient } from '@tanstack/react-query';

// Define the message type based on the database schema
type ChatMessage = {
  role: 'user' | 'ai';
  message: string;
  timestamp: string;
};

export default function ChatScreen() {
  const { profile } = useAuth();
  const { recipeId } = useLocalSearchParams();
  const { data: recipe, isError } = useRecipe(recipeId as string, profile?.id);
  const queryClient = useQueryClient();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Load existing chat messages when recipe is loaded
  useEffect(() => {
    if (recipe?.chat && Array.isArray(recipe.chat)) {
      if (messages.length === 0) {
        setMessages(recipe.chat as ChatMessage[]);
      }
    }
  }, [recipe]);

  const handleSendMessage = async (message: string) => {
    
    const userMessage: ChatMessage = {
      role: 'user',
      message: message,
      timestamp: new Date().toISOString(),
    };
    
    const updatedMessages = [userMessage, ...messages];
    setMessages(updatedMessages);
    setIsLoadingMessage(true);
  };

  const handleAIResponse = (aiMessage: string) => {
    
    const aiResponse: ChatMessage = {
      role: 'ai',
      message: aiMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => {
      const newMessages = [aiResponse, ...prev];
      return newMessages;
    });
    setIsLoadingMessage(false);

    queryClient.invalidateQueries({
      queryKey: RECIPE_KEYS.detail(recipeId as string)
    });
  };

  if (isError || !recipe) {
    return (
      <ThemedView style={styles.container}>
        <ScreenHeader title="Jacquin" showBackButton={true} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load recipe chat</Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Jacquin" showBackButton={true} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <FlatList
          data={messages}
          renderItem={({ item }) => <MessageItem message={item} userAvatar={profile?.image} />}
          contentContainerStyle={styles.messagesContainer}
          keyExtractor={(item, index) => `${item.timestamp}-${index}`}
          ref={flatListRef}
          inverted
        />

        <ChatInput 
          onSendMessage={handleSendMessage} 
          onAIResponse={handleAIResponse}
          isLoading={isLoadingMessage}
          recipeContext={{
            title: recipe?.title || '',
            ingredients: recipe?.ingredients || [],
            instructions: recipe?.instructions || [],
          }}
          recipeId={recipeId as string}
          profileId={profile?.id || ''}
        />
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE4D2',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#793206',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#793206',
    textAlign: 'center',
  },
  messagesContainer: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    flexGrow: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#793206',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#79320680',
    textAlign: 'center',
    lineHeight: 22,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 8,
    backgroundColor: '#EDE4D2',
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    maxWidth: '75%',
  },
  otherMessage: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
    borderTopLeftRadius: 15,
    borderBottomRightRadius: 15,
    borderTopRightRadius: 15,
    borderColor: '#79320633',
    borderWidth: 1,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  }
});
