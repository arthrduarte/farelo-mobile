import { useEffect, useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import { Log, Log_Comment, Profile, Recipe } from '../types/db'
import { useQuery } from '@tanstack/react-query'
type EnhancedLog = Log & {
    profile: Pick<Profile, 'first_name' | 'last_name' | 'username' | 'image'>;
    recipe: Recipe;
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

            // 2b) fetch logs with profile and recipe information
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
                    recipe:recipes(
                        title,
                        time,
                        servings
                    )
                `)
                .in('profile_id', followingIds)
                .order('created_at', { ascending: false })
                .limit(pageSize)

            if (logErr) throw logErr
            if (logs) {
                setFeed(logs as EnhancedLog[])
                await AsyncStorage.setItem(CACHE_KEY(profile_id), JSON.stringify(logs))
            }
        } catch (err) {
            console.error('useFeed › fetchFeed error', err)
        } finally {
            setLoading(false)
        }
    }, [profile_id, pageSize])

    const fetchOwnLogs = useCallback(async () => {
        if (!profile_id) return
        setLoading(true)
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
                    recipe:recipes(
                        title,
                        time,
                        servings
                    )
                `)
                .eq('profile_id', profile_id)
                .order('created_at', { ascending: false })
                .limit(pageSize)
            if (logErr) throw logErr
            setOwnLogs(logs as EnhancedLog[])
        } catch (err) {
            console.error('useFeed › fetchOwnLogs error', err)
        } finally {
            setLoading(false)
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
            // Fetch log with profile and complete recipe information
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

            // Fetch comments for this log
            const { data: comments, error: commentsError } = await supabase
                .from('log_comments')
                .select('*')
                .eq('log_id', id)
                .order('created_at', { ascending: true });

            if (commentsError) throw commentsError;

            return {
                log: log as EnhancedLog,
                comments: comments as Log_Comment[]
            };
        },
    });
}; 