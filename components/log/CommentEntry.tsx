import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { formatTimeAgo } from '@/lib/utils';

type Comment = {
  id: string;
  content: string;
  created_at: string;
  profile: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    image: string;
  };
};

interface CommentEntryProps {
  comment: Comment;
}

export function CommentEntry({ comment }: CommentEntryProps) {
  return (
    <View style={styles.commentContainer}>
      <Image 
        source={{ uri: comment.profile?.image }}
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <Text style={styles.commentName}>
          {comment.profile?.username}
        </Text>
        <Text style={styles.commentText}>
          {comment.content}
        </Text>
        <Text style={styles.commentTime}>
          {formatTimeAgo(comment.created_at)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 5,
    marginTop: 2,
  },
  commentContent: {
    flex: 1,
    padding: 10,
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
    textAlign: 'left',
  },
});
