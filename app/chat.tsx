import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

// Dummy data for messages - replace with actual data fetching
const initialMessages = [
  { id: '1', text: 'Hello there!', sender: 'other' },
  { id: '2', text: 'Hi! How are you?', sender: 'user' },
  { id: '3', text: 'I am good, thanks! And you?', sender: 'other' },
  { id: '4', text: 'Doing great! Ready to cook something amazing?', sender: 'user' },
  { id: '5', text: 'Oui! What are we making today, chef?', sender: 'other' },
];

export default function ChatScreen() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim().length > 0) {
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
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView style={styles.messagesContainer}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            const bubble = (
              <View
                style={[
                  styles.messageBubble,
                  isUser ? styles.userMessage : styles.otherMessage,
                ]}
              >
                <Text style={isUser ? styles.userMessageText : styles.otherMessageText}>
                  {msg.text}
                </Text>
              </View>
            );

            const userAvatar = profile?.image 
              ? <Image source={{ uri: profile.image }} style={styles.avatarImage} /> 
              : <View style={[styles.avatarImage, styles.avatarPlaceholder]}><MaterialIcons name="person" size={24} color="#793206" /></View>;
              
            const otherAvatar = <Image source={require('@/assets/images/jacquin-full.png')} style={styles.avatarImage} />;
            
            return (
              <View 
                key={msg.id} 
                style={[
                  styles.messageRow, 
                  isUser ? styles.userMessageRow : styles.otherMessageRow
                ]}
              >
                {isUser ? (
                  <>
                    {bubble}
                    {userAvatar}
                  </>
                ) : (
                  <>
                    {otherAvatar}
                    {bubble}
                  </>
                )}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#79320680"
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
    backgroundColor: '#EDE4D2',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
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
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#79320633',
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    maxWidth: '75%',
  },
  userMessage: {
    backgroundColor: '#793206',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 15,
    borderTopLeftRadius: 15,
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
  userMessageText: {
    color: '#EDE4D2',
    fontSize: 15,
  },
  otherMessageText: {
    color: '#793206',
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#79320633',
    backgroundColor: '#EDE4D2',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#793206',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    color: '#793206',
    backgroundColor: '#FFFFFF',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#793206',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
