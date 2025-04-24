import { useEffect, useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import { Log, Profile, Recipe } from '../types/db'

type EnhancedLog = Log & {
    profile: Pick<Profile, 'first_name' | 'last_name' | 'username' | 'image'>;
    recipe: Pick<Recipe, 'title' | 'time' | 'servings'>;
}

const CACHE_KEY = (profile_id: string) => `feed_cache_${profile_id}`

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

    // 2️⃣ the actual "fetch followings' logs" routine
    const fetchFeed = useCallback(async () => {
        console.log("Fetching feed")
        if (!profile_id) return
        setLoading(true)
        try {
            // 2a) get list of who this user follows
            console.log("Getting list of who this user follows")
            const { data: follows, error: followErr } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', profile_id)
            console.log("Follows:", follows)

            if (followErr) throw followErr
            const followingIds = follows?.map((f) => f.following_id) ?? []

            if (followingIds.length === 0) {
                setFeed([])
                await AsyncStorage.setItem(CACHE_KEY(profile_id), '[]')
                return
            }

            // 2b) fetch their logs with profile and recipe information
            console.log("Fetching their logs")
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
            console.log("Logs:", logs)

            if (logErr) throw logErr
            if (logs) {
                console.log("Setting feed:", logs)
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
