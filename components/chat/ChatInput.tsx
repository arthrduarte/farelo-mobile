import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, Keyboard } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onAIResponse: (response: string) => void;
  isLoading?: boolean;
  recipeContext: {
    title: string;
    ingredients: string[];
    instructions: string[];
  };
  recipeId: string;
  profileId: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  onAIResponse,
  isLoading = false, 
  recipeContext, 
  recipeId, 
  profileId 
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = async () => {
    if (inputText.trim()) {
      const message = inputText.trim();
      setInputText('');
      Keyboard.dismiss();

      // Call onSendMessage immediately to show user message
      onSendMessage(message);

      try {
        const response = await fetch('https://usefarelo.com/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            recipeContext,
            recipeId,
            profile_id: profileId,
          }),
        });

        const result = await response.json();
        console.log(result);
        
        // Call onAIResponse with the AI's response
        if (result.message) {
          onAIResponse(result.message);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        onAIResponse('Sorry, I encountered an error. Please try again.');
      }
    }
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={inputText}
        onChangeText={setInputText}
        placeholder="Ask me about this recipe..."
        placeholderTextColor="#79320680"
        multiline
        maxLength={500}
        editable={!isLoading}
      />
      <TouchableOpacity 
        style={[styles.sendButton, isLoading && styles.sendButtonDisabled]} 
        onPress={handleSend}
        disabled={isLoading || !inputText.trim()}
      >
        <MaterialIcons name="send" size={24} color="#EDE4D2" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15,
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
