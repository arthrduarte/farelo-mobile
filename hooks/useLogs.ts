import { useEffect, useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import { Log, Log_Comment, Log_Like, Profile, Recipe } from '../types/db'
import { useQuery } from '@tanstack/react-query'

type EnhancedLog = Log & {
    profile: Pick<Profile, 'first_name' | 'last_name' | 'username' | 'image'>;
    recipe: Recipe;
    likes: Log_Like[];
    comments: Log_Comment[];
}

const CACHE_KEY = (profile_id: string) => `feed_cache_${profile_id}`

const LOG_KEYS = {
    detail: (id: string) => ['log', id] as const,
};

export function useLogs(profile_id: string, pageSize: number = 20) {
    const [feed, setFeed] = useState<EnhancedLog[]>([])
    const [loading, setLoading] = useState(true)
    const [ownLogs, setOwnLogs] = useState<EnhancedLog[]>([])

    // 1️⃣ load cached logs on mount
    useEffect(() => {
        if (!profile_id) {
            setLoading(false)
            return
        }
        let active = true
        AsyncStorage.getItem(CACHE_KEY(profile_id))
            .then((raw) => {
                if (!active) return
                if (raw) setFeed(JSON.parse(raw))
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => { active = false }
    }, [profile_id])

    // 2️⃣ fetch both following and own logs
    const fetchFeed = useCallback(async () => {
        if (!profile_id) return
        setLoading(true)
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
                    profile:profiles(
                        first_name,
                        last_name,
                        username,
                        image
                    ),
                    recipe:recipes(*)
                `)
                .in('profile_id', followingIds)
                .order('created_at', { ascending: false })
                .limit(pageSize)

            if (logErr) throw logErr
            if (!logs) {
                setFeed([]); // Ensure feed is empty if no logs
                await AsyncStorage.setItem(CACHE_KEY(profile_id), JSON.stringify([]));
                setLoading(false);
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
            setLoading(false)
        }
    }, [profile_id, pageSize])

    const fetchOwnLogs = useCallback(async () => {
        if (!profile_id) return
        // Keep loading state associated with the feed for simplicity now
        // setLoading(true); 
        try {
            const { data: logs, error: logErr } = await supabase
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
                .eq('profile_id', profile_id)
                .order('created_at', { ascending: false })
                .limit(pageSize)

            if (logErr) throw logErr
            if (!logs || logs.length === 0) {
                setOwnLogs([]); // Set empty if no logs found
                // setLoading(false);
                return;
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
            const ownLogsWithData = logs.map(log => {
                const logLikes = likes?.filter(like => like.log_id === log.id) ?? [];
                const logComments = comments?.filter(comment => comment.log_id === log.id) ?? [];

                return {
                    ...log,
                    recipe: log.recipe as Recipe,
                    likes: logLikes,
                    comments: logComments
                }
            });

            setOwnLogs(ownLogsWithData as EnhancedLog[]);

        } catch (err) {
            console.error('useLogs › fetchOwnLogs error', err)
            setOwnLogs([]); // Set empty on error
        } finally {
            // setLoading(false) // Handled by fetchFeed loading
        }
    }, [profile_id, pageSize])


    // 3️⃣ run fetch after we've loaded cache
    useEffect(() => {
        if (profile_id) {
            fetchFeed()
            fetchOwnLogs()
        }
    }, [fetchFeed, profile_id])

    return { feed, loading, refresh: fetchFeed, ownLogs }
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