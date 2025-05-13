import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/db';
import { useAuth } from '@/contexts/AuthContext';
import { debounce } from 'lodash'; // Using lodash debounce
import Avatar from '@/components/ui/Avatar';

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { profile: currentUser } = useAuth();

    // Debounced search function
    const searchUsers = useCallback(debounce(async (query: string) => {
        if (!query.trim() || !currentUser) {
            setResults([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .ilike('username', `%${query}%`)
                .neq('id', currentUser.id) // Exclude current user
                .limit(15); // Limit results

            if (error) throw error;
            setResults(data || []);
        } catch (error) {
            console.error("Error searching users:", error);
            setResults([]); // Clear results on error
        } finally {
            setIsLoading(false);
        }
    }, 500), [currentUser]); // 500ms debounce, depend on currentUser

    // Effect to call debounced search when query changes
    useEffect(() => {
        searchUsers(searchQuery);
        // Cancel the debounce on unmount
        return () => {
            searchUsers.cancel();
        };
    }, [searchQuery, searchUsers]);

    const handleSelectUser = (selectedProfile: Profile) => {
        router.push({
            pathname: '/profile/[id]',
            params: { 
                id: selectedProfile.id,
                profile: JSON.stringify(selectedProfile)
            }
        });
    };

    const renderItem = ({ item }: { item: Profile }) => (
        <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectUser(item)}>
            <Avatar imageUrl={item.image} firstName={item.first_name} size={40} />
            <View>
                <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
                <Text style={styles.username}>@{item.username}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            {/* Back Button and Search Input Header */}
            <View style={styles.headerContainer}>
                 <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#793206" />
                 </TouchableOpacity>
                 <TextInput
                    style={styles.input}
                    placeholder="Search by username..."
                    placeholderTextColor="#79320680"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus={true} // Focus input on screen load
                />
            </View>

            {/* Results List */}
            {isLoading && searchQuery ? (
                <ActivityIndicator style={styles.loader} size="large" color="#793206" />
            ) : (
                <FlatList
                    data={results}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={() => (
                        searchQuery ? <Text style={styles.noResultsText}>No users found for "{searchQuery}"</Text> : null
                    )}
                    contentContainerStyle={styles.listContentContainer}
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EDE4D2', // Theme background
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8, // Reduced padding
        paddingTop: Platform.OS === 'ios' ? 20 : 10, // Status bar height
        paddingBottom: 10,
        backgroundColor: '#EDE4D2', // Match container
        borderBottomWidth: 1,
        borderBottomColor: '#79320633',
    },
     backButton: {
        padding: 8,
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#793206',
        borderWidth: 1,
        borderColor: '#79320633',
    },
    loader: {
        marginTop: 20,
    },
    listContentContainer: {
        padding: 16,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#7932061A', // Lighter separator
    },
    name: {
        fontSize: 16,
        color: '#793206',
        fontWeight: '600',
        marginLeft: 12,
    },
    username: {
        fontSize: 14,
        color: '#79320680',
        marginLeft: 12,
    },
    noResultsText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#79320680',
        fontSize: 16,
    },
});
