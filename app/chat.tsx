import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { MaterialIcons } from '@expo/vector-icons';

// Dummy data for messages - replace with actual data fetching
const initialMessages = [
  { id: '1', text: 'Hello there!', sender: 'other' },
  { id: '2', text: 'Hi! How are you?', sender: 'user' },
  { id: '3', text: 'I am good, thanks! And you?', sender: 'other' },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim().length > 0) {
      // Add new message to the list
      // In a real app, this would be sent to a backend
      setMessages([
        ...messages,
        { id: Date.now().toString(), text: inputText, sender: 'user' },
      ]);
      setInputText('');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Jacquin" showBackButton={true} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // Adjust as needed
      >
        <ScrollView style={styles.messagesContainer}>
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userMessage : styles.otherMessage,
              ]}
            >
              <Text style={msg.sender === 'user' ? styles.userMessageText : styles.otherMessageText}>
                {msg.text}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#79320680" // BROWN with opacity
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <MaterialIcons name="send" size={24} color="#EDE4D2" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE4D2', // BEIGE - Secondary color for background
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#793206', // BROWN - Main color for user messages
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  otherMessage: {
    backgroundColor: '#FFFFFF', // White or a light beige for other messages
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
    borderColor: '#79320633', // BROWN with low opacity for border
    borderWidth: 1,
  },
  userMessageText: {
    color: '#EDE4D2', // BEIGE - Text on user messages
  },
  otherMessageText: {
    color: '#793206', // BROWN - Text on other messages
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#79320633', // BROWN with low opacity
    backgroundColor: '#EDE4D2', // BEIGE
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#793206', // BROWN
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    color: '#793206', // BROWN
    backgroundColor: '#FFFFFF', // White or light beige input background
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#793206', // BROWN
    justifyContent: 'center',
    alignItems: 'center',
  },
});
