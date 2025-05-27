import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useRecipe, useUpdateRecipe } from '@/hooks/useRecipes';
import { useLocalSearchParams } from 'expo-router';
import { MessageItem } from '@/components/chat/MessageItem';

// Define the message type based on the database schema
type ChatMessage = {
  role: 'user' | 'ai';
  message: string;
  timestamp: string;
};

export default function ChatScreen() {
  const { profile } = useAuth();
  const { recipeId } = useLocalSearchParams();
  const { data: recipe, isLoading: recipeLoading, isError } = useRecipe(recipeId as string, profile?.id);
  const updateRecipeMutation = useUpdateRecipe();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load existing chat messages when recipe is loaded
  useEffect(() => {
    if (recipe?.chat && Array.isArray(recipe.chat)) {
      setMessages(recipe.chat as ChatMessage[]);
    }
  }, [recipe]);

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !recipe || !profile) return;

    const userMessage: ChatMessage = {
      role: 'user',
      message: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoadingMessage(true);

    try {
      // Make API call to chat endpoint
      const response = await fetch('https://usefarelo.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.message,
          recipeContext: {
            title: recipe.title,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions
          },
          recipeId: recipe.id,
          profile_id: profile.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to send message');
      }

      const responseData = await response.json();
      
      // Add AI response
      const aiMessage: ChatMessage = {
        role: 'ai',
        message: responseData.message || responseData.response || 'I received your message!',
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);

      // Update the recipe in the database with the new chat
      const updatedRecipe = {
        ...recipe,
        chat: finalMessages as unknown as JSON,
      };

      await updateRecipeMutation.mutateAsync(updatedRecipe);

    } catch (error) {
      console.error('Chat error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to send message. Please try again.'
      );
      
      // Remove the user message if API call failed
      setMessages(messages);
    } finally {
      setIsLoadingMessage(false);
    }
  };

  if (recipeLoading) {
    return (
      <ThemedView style={styles.container}>
        <ScreenHeader title="Jacquin" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#793206" />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </ThemedView>
    );
  }

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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Image source={require('@/assets/images/jacquin-full.png')} style={styles.emptyStateImage} />
              <Text style={styles.emptyStateTitle}>Hey there!</Text>
              <Text style={styles.emptyStateSubtitle}>I'm Jacquin, your cooking assistant. Ask me anything about {recipe.title}!</Text>
            </View>
          ) : (
            messages.map((msg, index) => (
              <MessageItem 
                key={`${msg.timestamp}-${index}`}
                message={msg}
                userAvatar={profile?.image}
              />
            ))
          )}
          
          {isLoadingMessage && (
            <View style={[styles.messageRow, styles.otherMessageRow]}>
              <Image source={require('@/assets/images/jacquin-full.png')} style={styles.avatarImage} />
              <View style={[styles.messageBubble, styles.otherMessage, styles.typingIndicator]}>
                <ActivityIndicator size={20} color="#793206" />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me about this recipe..."
            placeholderTextColor="#79320680"
            multiline
            maxLength={500}
            editable={!isLoadingMessage}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoadingMessage) && styles.sendButtonDisabled
            ]} 
            onPress={handleSend}
            disabled={!inputText.trim() || isLoadingMessage}
          >
            {isLoadingMessage ? (
              <ActivityIndicator size={20} color="#EDE4D2" />
            ) : (
              <MaterialIcons name="send" size={24} color="#EDE4D2" />
            )}
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
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 15,
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
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#79320633',
    backgroundColor: '#EDE4D2',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    color: '#793206',
    fontSize: 16,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#793206',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#79320680',
  },
});
