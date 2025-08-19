import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type MessageItemProps = {
  message: {
    role: 'user' | 'ai';
    message: string;
    timestamp: string;
  };
  userAvatar?: string | undefined;
};

export const MessageItem: React.FC<MessageItemProps> = ({ message, userAvatar }) => {
  const isUser = message.role === 'user';

  const bubble = (
    <View
      style={[
        styles.messageBubble,
        isUser ? styles.userMessage : styles.otherMessage,
      ]}
    >
      <Text style={isUser ? styles.userMessageText : styles.otherMessageText}>
        {message.message}
      </Text>
    </View>
  );

  const userAvatarComponent = userAvatar 
    ? <Image source={{ uri: userAvatar }} style={styles.avatarImage} /> 
    : <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
        <MaterialIcons name="person" size={24} color="#793206" />
      </View>;
              
  const otherAvatar = <Image source={require('@/assets/images/jacquin-full.png')} style={styles.avatarImage} />;

  return (
    <View 
      style={[
        styles.messageRow, 
        isUser ? styles.userMessageRow : styles.otherMessageRow
      ]}
    >
      {isUser ? (
        <>
          {bubble}
          {userAvatarComponent}
        </>
      ) : (
        <>
          {otherAvatar}
          {bubble}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    lineHeight: 20,
  },
  otherMessageText: {
    color: '#793206',
    fontSize: 15,
    lineHeight: 20,
  },
});
