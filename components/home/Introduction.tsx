import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Profile } from '@/types/db';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

const INTRODUCTION_DISMISSED_KEY = 'introduction_dismissed';

export const Introduction = () => {
  const [arthur, setArthur] = useState<Profile | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    const checkDismissedStatus = async () => {
      const dismissed = await AsyncStorage.getItem(INTRODUCTION_DISMISSED_KEY);
      if (dismissed === 'true') {
        setIsVisible(false);
      }
    };
    checkDismissedStatus();
  }, []);

  useEffect(() => {
    const fetchIntroduction = async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', '852f5da6-42f1-4bc7-9476-bfdabf5db7be').single();
    
      if (error) {
        console.error('Error fetching introduction:', error);
      } 
      
      setArthur(data);     
    };
    fetchIntroduction();
  }, []);

  const handleDismiss = async () => {
    await AsyncStorage.setItem(INTRODUCTION_DISMISSED_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Hey {profile?.username}! 👋</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={handleDismiss}
            >
              <Feather name="x" size={16} color="#793206" />
            </TouchableOpacity>
          </View>
          <Text style={styles.description}>
            I'm Arthur, the creator of Farelo. Thanks for trying out the app!
          </Text>
          <Text style={styles.description}>
            I'm working solo on Farelo with the goal of making it your go-to place for sharing recipes with friends and saving them all in one place. 
          </Text>
          <Text style={styles.description}>
            Feel free to email me at team.usefarelo@gmail.com with any feedback or feature requests - I'd love to hear from you!
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <Image
            source={{ uri: arthur?.image }}
            style={styles.profileImage}
          />
          <View style={styles.bottomRowInfo}>
            <Text style={styles.bottomRowTextName}>Arthur Duarte</Text>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  content: {
    gap: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  bottomRowInfo: {
    flex: 1,
    gap: 16,
  },
  textContainer: {
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#793206',
  },
  description: {
    fontSize: 16,
    color: '#793206',
    lineHeight: 20,
  },
  followButton: {
    backgroundColor: '#793206',
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
  },
  followButtonText: {
    textAlign: 'center',
    color: '#EDE4D2',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomRowTextName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#793206',
  },
});
