import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { AntDesign, Feather } from '@expo/vector-icons';
import { Log, Profile, Recipe, Log_Like } from '@/types/db';
import { router } from 'expo-router';
import { formatTimeAgo } from '@/lib/utils';

type EnhancedLog = Log & {
  profile: Pick<Profile, 'first_name' | 'last_name' | 'username' | 'image'>;
  recipe: Pick<Recipe, 'title' | 'time' | 'servings'>;
  likes: Log_Like[];
};

type LogCardProps = {
  log: EnhancedLog;
  onLike?: () => void;
  onComment?: () => void;
  onAdd?: () => void;
};

export const LogCard: React.FC<LogCardProps> = ({ log, onLike, onComment, onAdd }) => {
  if (!log.profile || !log.recipe) {
    return null;
  }

  const fullName = `${log.profile.first_name} ${log.profile.last_name}`;
  
  return (
    <TouchableOpacity onPress={() => router.push(`/log/${log.id}/details`)}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image 
            source={{ uri: log.profile.image }}
            style={styles.avatar}
        />
        <View style={styles.headerText}>
          <ThemedText type="defaultSemiBold">{fullName}</ThemedText>
          <ThemedText style={styles.time}>{formatTimeAgo(log.created_at)}</ThemedText>
        </View>
      </View>

      <ThemedText type="title" style={styles.title}>{log.recipe.title}</ThemedText>
      {log.description && (
        <ThemedText style={styles.description}>{log.description}</ThemedText>
      )}

      <View style={styles.cookingInfo}>
        <View style={styles.infoItem}>
          <ThemedText>{log.recipe.time} mins</ThemedText>
        </View>
        <View style={styles.infoItem}>
          <ThemedText>{log.recipe.servings} servings</ThemedText>
        </View>
      </View>

      <Image 
        source={{ uri: log.images[0] }}
        style={styles.mainImage}
        resizeMode="cover"
      />

      <View style={styles.actions}>
        <TouchableOpacity onPress={onLike} style={styles.actionButton}>
          <View style={styles.actionContainer}>
            <AntDesign name="heart" size={24} color="#793206" />
            <ThemedText style={styles.actionCount}>{log.likes?.length || 0}</ThemedText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={onComment} style={styles.actionButton}>
          <Feather name="message-circle" size={24} color="#793206" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onAdd} style={styles.actionButton}>
          <AntDesign name="plus" size={24} color="#793206" />
        </TouchableOpacity>
      </View>
    </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EDE4D2',
    // borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    // marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  time: {
    fontSize: 12,
    color: '#79320633',
  },
  title: {
    fontSize: 20,
    marginBottom: 4,
    color: '#793206',
  },
  description: {
    marginBottom: 12,
    color: '#793206',
  },
  cookingInfo: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  infoItem: {
    backgroundColor: '#79320633',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  mainImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#79320633',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8
  },
  actionButton: {
    padding: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    color: '#793206',
    fontSize: 14,
  },
}); 