import React from 'react';
import { TouchableOpacity, StyleSheet, View, Image } from 'react-native';
import { router } from 'expo-router';

type ChatBubbleProps = {
  recipeId: string;
};

const ChatBubble = ({ recipeId }: ChatBubbleProps) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/recipe/${recipeId}/chat` as any)}
      activeOpacity={0.8}
    >
      <Image source={require('@/assets/images/jacquin-full.png')} style={styles.image} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
});

export default ChatBubble;
