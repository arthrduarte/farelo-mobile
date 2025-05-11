import { useEffect, useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import { Log, Log_Comment, Log_Like, Profile, Recipe } from '../types/db'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { EnhancedLog } from '@/types/types'
import { profileUpdateEmitter, PROFILE_UPDATED } from '@/contexts/AuthContext'

const CACHE_KEY = (profile_id: string) => `feed_cache_${profile_id}`

const LOG_KEYS = {
    detail: (id: string) => ['log', id] as const,
};

export function useLogs(profile_id: string, pageSize: number = 20) {
    const [feed, setFeed] = useState<EnhancedLog[]>([])
    const [feedLoading, setFeedLoading] = useState(true)
    const [profileLogs, setProfileLogs] = useState<EnhancedLog[]>([])
    const [profileLogsLoading, setProfileLogsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [isDeleting, setIsDeleting] = useState(false);

    const queryClient = useQueryClient();

    // 1️⃣ load cached logs on mount (for feed)
    useEffect(() => {
        if (!profile_id) {
            setFeedLoading(false)
            return
        }
        let active = true
        AsyncStorage.getItem(CACHE_KEY(profile_id))
            .then((raw) => {
                if (!active) return
                if (raw) setFeed(JSON.parse(raw))
            })
            .finally(() => {
                if (active) setFeedLoading(false)
            })
        return () => { active = false }
    }, [profile_id])

    // 2️⃣ fetch both following and own logs
    const fetchFeed = useCallback(async () => {
        if (!profile_id) return
        setFeedLoading(true)
        try {
            // 2a) get list of who this user follows
            const { data: follows, error: followErr } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', profile_id)

            if (followErr) throw followErr
            const followingIds = [...(follows?.map((f) => f.following_id) ?? []), profile_id]

            // 2b) fetch logs including the full recipe
            const { data: logs, error: logErr } = await supabase
                .from('logs')
                .select(`
                    *,
                    profile:profiles(*),
                    recipe:recipes(*)
                `)
                .in('profile_id', followingIds)
                .order('created_at', { ascending: false })
                .limit(pageSize)

            if (logErr) throw logErr
            if (!logs) {
                setFeed([]); // Ensure feed is empty if no logs
                await AsyncStorage.setItem(CACHE_KEY(profile_id), JSON.stringify([]));
                setFeedLoading(false);
                return;
            }

            // 2c) fetch likes for each log
            const logIds = logs.map((log) => log.id);
            const { data: likes, error: likesErr } = await supabase
                .from('log_likes')
                .select('*')
                .in('log_id', logIds)

            if (likesErr) throw likesErr

            // 2d) fetch all comments for the logs
            const { data: comments, error: commentsError } = await supabase
                .from('log_comments')
                .select('*') // Only need log_id to count per log
                .in('log_id', logIds)

            if (commentsError) throw commentsError;

            // Combine logs with their likes and comment counts
            const logsWithData = logs.map(log => {
                const logLikes = likes?.filter(like => like.log_id === log.id) ?? [];
                const logComments = comments?.filter(comment => comment.log_id === log.id) ?? [];

                return {
                    ...log,
                    recipe: log.recipe as Recipe,
                    likes: logLikes,
                    comments: logComments
                }
            });

            setFeed(logsWithData as EnhancedLog[]);
            await AsyncStorage.setItem(CACHE_KEY(profile_id), JSON.stringify(logsWithData))

        } catch (err) {
            console.error('useFeed › fetchFeed error', err)
        } finally {
            setFeedLoading(false)
        }
    }, [profile_id, pageSize])

    const fetchProfileLogs = useCallback(async () => {
        if (!profile_id) return
        setProfileLogsLoading(true);
        try {
            const { data: logs, error: logErr } = await supabase
                .from('logs')
                .select(`
                    *,
                    profile:profiles(*),
                    recipe:recipes(*)
                `)
                .eq('profile_id', profile_id)
                .order('created_at', { ascending: false })
                .limit(pageSize)

            if (logErr) {
                throw logErr;
            }
            if (!logs || logs.length === 0) {
                setProfileLogs([]);
                return; // Return early, finally will set loading to false
            }

            const logIds = logs.map((log) => log.id);

            // Fetch likes for own logs
            const { data: likes, error: likesErr } = await supabase
                .from('log_likes')
                .select('*')
                .in('log_id', logIds)

            if (likesErr) throw likesErr

            // Fetch comments for own logs
            const { data: comments, error: commentsError } = await supabase
                .from('log_comments')
                .select('*') // Fetch full comments
                .in('log_id', logIds)

            if (commentsError) throw commentsError;

            // Combine own logs with their likes and comments
            const profileLogsWithData = logs.map(log => {
                const logLikes = likes?.filter(like => like.log_id === log.id) ?? [];
                const logComments = comments?.filter(comment => comment.log_id === log.id) ?? [];

                return {
                    ...log,
                    recipe: log.recipe as Recipe,
                    likes: logLikes,
                    comments: logComments
                }
            });

            setProfileLogs(profileLogsWithData as EnhancedLog[]);

        } catch (err) {
            console.error('useLogs › fetchProfileLogs error', err)
            setProfileLogs([]);
        } finally {
            setProfileLogsLoading(false)
        }
    }, [profile_id, pageSize])


    // 3️⃣ run fetch after we've loaded cache
    useEffect(() => {
        if (profile_id) {
            setFeedLoading(true);
            setProfileLogsLoading(true);
            fetchFeed()
            fetchProfileLogs()
        }
    }, [profile_id]);

    // Listen for profile updates and refetch logs
    useEffect(() => {
        const handleProfileUpdate = () => {
            if (profile_id) {
                setFeedLoading(true);
                setProfileLogsLoading(true);
                fetchFeed()
                fetchProfileLogs()
            }
        }

        profileUpdateEmitter.on(PROFILE_UPDATED, handleProfileUpdate)

        return () => {
            profileUpdateEmitter.off(PROFILE_UPDATED, handleProfileUpdate)
        }
    }, [profile_id, fetchFeed, fetchProfileLogs])

    const deleteLog = async (logIdToDelete: string) => {
        if (!profile_id) {
            console.error("deleteLog: profile_id is missing.");
            setError(new Error("User profile ID is missing."));
            return;
        }
        setIsDeleting(true);
        setError(null);
        try {
            // Delete from Supabase
            const { error: deleteError } = await supabase
                .from('logs')
                .delete()
                .eq('id', logIdToDelete);

            if (deleteError) {
                throw deleteError;
            }

            // Update local state immediately for responsive UI
            setFeed(prevFeed => prevFeed.filter(log => log.id !== logIdToDelete));
            setProfileLogs(prevProfileLogs => prevProfileLogs.filter(log => log.id !== logIdToDelete));

            // Update AsyncStorage for feed
            try {
                const rawCachedFeed = await AsyncStorage.getItem(CACHE_KEY(profile_id));
                if (rawCachedFeed) {
                    const cachedFeedArray: EnhancedLog[] = JSON.parse(rawCachedFeed);
                    const updatedCachedFeedArray = cachedFeedArray.filter(log => log.id !== logIdToDelete);
                    await AsyncStorage.setItem(CACHE_KEY(profile_id), JSON.stringify(updatedCachedFeedArray));
                }
            } catch (cacheError) {
                console.warn("deleteLog: Failed to update feed cache after deletion:", cacheError);
                // Non-fatal, proceed with server refresh
            }

            // Invalidate React Query cache for the detailed log view
            queryClient.invalidateQueries({ queryKey: LOG_KEYS.detail(logIdToDelete) });

            // Refresh feed and profile logs from the server
            // This ensures consistency and updates based on server state.
            await fetchFeed();
            await fetchProfileLogs();

        } catch (err) {
            console.error('deleteLog error', err);
            setError(err as Error);
            throw err; // Rethrow for the component to handle if needed
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        feed,
        feedLoading,
        refresh: fetchFeed,
        profileLogs,
        profileLogsLoading,
        refreshProfileLogs: fetchProfileLogs,
        error,
        deleteLog,
        isDeleting,
    }
}

export const useLog = (id: string | undefined) => {
    return useQuery({
        queryKey: LOG_KEYS.detail(id || ''),
        enabled: !!id,
        queryFn: async () => {
            const { data: log, error: logError } = await supabase
                .from('logs')
                .select(`
                    *,
                    profile:profiles(
                        first_name,
                        last_name,
                        username,
                        image
                    ),
                    recipe:recipes(*)
                `)
                .eq('id', id)
                .single();

            if (logError) throw logError;

            const { data: comments, error: commentsError } = await supabase
                .from('log_comments')
                .select(`
                    *,
                    profile:profiles(
                        first_name,
                        last_name,
                        username,
                        image
                    )
                `)
                .eq('log_id', id)
                .order('created_at', { ascending: true });

            if (commentsError) throw commentsError;

            const { data: likes, error: likesError } = await supabase
                .from('log_likes')
                .select('*')
                .eq('log_id', id);

            if (likesError) throw likesError;

            const enhancedLogData: EnhancedLog = {
                ...(log as Log),
                profile: log.profile as EnhancedLog['profile'],
                recipe: log.recipe as Recipe,
                likes: likes as Log_Like[] || [],
                comments: comments as (Log_Comment & { profile: Profile })[] || []
            };

            return {
                log: enhancedLogData,
                comments: comments as (Log_Comment & { profile: Profile })[]
            };
        },
    });
}; 