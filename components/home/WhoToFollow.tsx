import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/db';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/ui/Avatar';
import { MaterialIcons } from '@expo/vector-icons';
import { useBlocks } from '@/hooks/useBlocks';

export const WhoToFollow = () => {
    const [suggestedUsers, setSuggestedUsers] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { profile: currentUser } = useAuth();
    const { getAllBlockedIds } = useBlocks();

    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            if (!currentUser) return;
            
            setIsLoading(true);
            try {
                const blockedIds = await getAllBlockedIds();

                let query = supabase
                    .from('profiles_with_log_count')
                    .select('*')
                    .neq('id', currentUser.id)
                    .order('log_count', { ascending: false })
                    .limit(9);

                if (blockedIds.length > 0) {
                    query = query.not('id', 'in', `(${blockedIds.join(',')})`);
                }

                const { data, error } = await query;

                if (error) throw error;
                setSuggestedUsers(data || []);
            } catch (error) {
                console.error("Error fetching suggested users:", error);
                setSuggestedUsers([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestedUsers();
    }, [currentUser]);

    const handleSelectUser = (selectedProfile: Profile) => {
        router.push({
            pathname: '/profile/[id]',
            params: { 
                id: selectedProfile.id,
                profile: JSON.stringify(selectedProfile)
            }
        });
    };

    if (isLoading || suggestedUsers.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Who to Follow</Text>
            </View>
            
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {suggestedUsers.map((user) => (
                    <TouchableOpacity
                        key={user.id}
                        style={styles.userCard}
                        onPress={() => handleSelectUser(user)}
                    >
                        <Avatar 
                            imageUrl={user.image} 
                            firstName={user.first_name} 
                            size={60} 
                        />
                        <Text style={styles.name} numberOfLines={1}>
                            {user.first_name} {user.last_name}
                        </Text>
                        <Text style={styles.username} numberOfLines={1}>
                            @{user.username}
                        </Text>
                    </TouchableOpacity>
                ))}
                
                {/* See More Card */}
                <TouchableOpacity
                    style={[styles.userCard, styles.seeMoreCard]}
                    onPress={() => router.push('/search')}
                >
                    <View style={styles.seeMoreIconContainer}>
                        <MaterialIcons name="add" size={32} color="#793206" />
                    </View>
                    <Text style={styles.seeMoreText}>See More</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#793206',
    },
    scrollContent: {
        paddingHorizontal: 12,
    },
    userCard: {
        alignItems: 'center',
        marginHorizontal: 4,
        width: 100,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#793206',
        textAlign: 'center',
        marginTop: 8,
    },
    username: {
        fontSize: 12,
        color: '#79320680',
        textAlign: 'center',
    },
    seeMoreCard: {
        justifyContent: 'center',
    },
    seeMoreIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#EDE4D2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#79320633',
    },
    seeMoreText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#793206',
        textAlign: 'center',
        marginTop: 8,
    },
});
