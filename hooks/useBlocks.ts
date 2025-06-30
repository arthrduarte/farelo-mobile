import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export const useBlocks = (userId?: string) => {
  const { profile } = useAuth()
  const queryClient = useQueryClient()

  const { data: isBlocked = false } = useQuery({
    queryKey: ['blocks', profile?.id, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blocks')
        .select('*')
        .eq('blocker_id', profile?.id)
        .eq('blocked_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    },
    enabled: !!profile?.id && !!userId
  })

  const blockUser = async (blockedId: string) => {
    const { error: blockError } = await supabase
      .from('blocks')
      .insert({
        blocker_id: profile?.id,
        blocked_id: blockedId
      })

    if (blockError) throw blockError

    const { error: unfollowError1 } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', profile?.id)
      .eq('following_id', blockedId)

    if (unfollowError1) throw unfollowError1

    const { error: unfollowError2 } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', blockedId)
      .eq('following_id', profile?.id)

    if (unfollowError2) throw unfollowError2

    // Invalidate both blocks and follows queries to update UI
    queryClient.invalidateQueries({ queryKey: ['blocks'] })
    queryClient.invalidateQueries({ queryKey: ['follows'] })
  }

  const unblockUser = async (blockedId: string) => {
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('blocker_id', profile?.id)
      .eq('blocked_id', blockedId)

    if (error) throw error
    queryClient.invalidateQueries({ queryKey: ['blocks'] })
  }

  const getAllBlockedIds = async () => {
    const { data, error } = await supabase
      .from('blocks')
      .select('blocked_id')

    if (error) throw error
    return data.map((b: { blocked_id: string }) => b.blocked_id)
  }

  return { blockUser, unblockUser, getAllBlockedIds, isBlocked }
}