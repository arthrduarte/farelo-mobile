import { useEffect, useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import { Log, Follow } from '../types/db'

const CACHE_KEY = (profile_id: string) => `feed_cache_${profile_id}`

export function useFeed(profile_id: string, pageSize: number = 20) {
    const [feed, setFeed] = useState<Log[]>([])
    const [loading, setLoading] = useState(true)

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

    // 2️⃣ the actual “fetch followings’ logs” routine
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

            // 2b) fetch their logs
            console.log("Fetching their logs")
            const { data: logs, error: logErr } = await supabase
                .from('logs')
                .select('*')
                .in('profile_id', followingIds)
                .order('created_at', { ascending: false })
                .limit(pageSize)
            console.log("Logs:", logs)

            if (logErr) throw logErr
            if (logs) {
                console.log("Setting feed:", logs)
                setFeed(logs)
                await AsyncStorage.setItem(CACHE_KEY(profile_id), JSON.stringify(logs))
            }
        } catch (err) {
            console.error('useFeed › fetchFeed error', err)
        } finally {
            setLoading(false)
        }
    }, [profile_id, pageSize])

    // 3️⃣ run fetch after we’ve loaded cache
    useEffect(() => {
        if (profile_id) {
            fetchFeed()
        }
    }, [fetchFeed, profile_id])

    return { feed, loading, refresh: fetchFeed }
}
