import React from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { Log, Profile, Recipe, Log_Like, Log_Comment } from '@/types/db';
import { router } from 'expo-router';
import { formatTimeAgo } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLikes } from '@/hooks/useLikes';
import { useCopyRecipe } from '@/hooks/useRecipes';
import { Divider } from './Divider';
import { EnhancedLog } from '@/types/types';

type LogCardProps = {
  log: EnhancedLog;
};

export const LogCard: React.FC<LogCardProps> = ({ log }) => {
  const { profile } = useAuth();
  
  const { isLiked, likeCount, toggleLike } = useLikes({
    initialIsLiked: log.likes.some((like) => like.profile_id === profile?.id),
    initialLikeCount: log.likes?.length || 0,
    logId: log.id,
  });
  const { mutate: copyRecipe, isPending: isCopying } = useCopyRecipe();
  
  if (!log.profile || !log.recipe || !profile) {
    return null;
  }

  const fullName = `${log.profile.first_name} ${log.profile.last_name}`;
  
  const handleCopyRecipe = () => {
    if (log.recipe.profile_id === profile.id) {
      console.log("Cannot copy your own recipe from a log.");
      return;
    }
    copyRecipe({ recipeIdToCopy: log.recipe_id });
  };

  return (
    <TouchableOpacity onPress={() => router.push(`/log/${log.id}/details`)} activeOpacity={1}>
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

        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <View style={styles.timeIcon}>
              <MaterialIcons name="schedule" size={16} color="#603808" />
            </View>
            <Text style={styles.metaText}>{log.recipe.time} mins</Text>
          </View>
          <View style={styles.metaItem}>
            <View style={styles.servingsIcon}>
              <MaterialIcons name="people" size={16} color="#603808" />
            </View>
            <Text style={styles.metaText}>{log.recipe.servings} servings</Text>
          </View>
        </View>

      <Image 
        source={{ uri: log.images[0] }}
        style={styles.mainImage}
        resizeMode="cover"
      />

      <View style={styles.interactionsContainer}>
        <Text style={styles.interactionsAmount}>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</Text>
        <TouchableOpacity onPress={() => router.push({
          pathname: '/log/[logId]/comments',
          params: { logId: log.id }
        })}>
          <Text style={styles.interactionsAmount}>{log.comments?.length || 0} {log.comments?.length === 1 ? 'comment' : 'comments'}</Text>
        </TouchableOpacity>
      </View>

      <Divider />

      <View style={styles.actions}>
        <TouchableOpacity onPress={toggleLike}>
          <View style={styles.actionContainer}>
            {isLiked ? 
              <AntDesign name="heart" size={24} color="#793206" />
            :
              <AntDesign name="hearto" size={24} color="#793206" />
            }
            <ThemedText style={styles.actionCount}>{likeCount}</ThemedText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push({
          pathname: '/log/[logId]/comments',
          params: { logId: log.id }
        })}>
          <Feather name="message-circle" size={24} color="#793206" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleCopyRecipe} 
          disabled={isCopying || log.recipe.profile_id === profile.id}
        >
          <AntDesign 
            name="plus" 
            size={24} 
            color={isCopying || log.recipe.profile_id === profile.id ? "#79320633" : "#793206"}
          />
        </TouchableOpacity>
      </View>
    </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
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
  metaInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  timeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#793206',
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
  interactionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  interactionsAmount: {
    fontSize: 12,
    color: '#793206',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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