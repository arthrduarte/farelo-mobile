import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Profile } from '@/types/db';
import { useAuth } from '@/contexts/AuthContext';

export const Introduction = () => {
  const [arthur, setArthur] = useState<Profile | null>(null);
  const { profile } = useAuth();

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

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Hey {profile?.username}! 👋</Text>
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
