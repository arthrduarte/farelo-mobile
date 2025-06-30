import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export const useBlocks = () => {
  const { profile } = useAuth()
  const queryClient = useQueryClient()

  const blockUser = async (blockedId: string) => {

    const { error } = await supabase
      .from('blocks')
      .insert({
        blocker_id: profile?.id,
        blocked_id: blockedId
      })

    if (error) throw error
    queryClient.invalidateQueries({ queryKey: ['logs'] })
    queryClient.invalidateQueries({ queryKey: ['feed'] })
  }

  const unblockUser = async (blockedId: string) => {
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('blocker_id', profile?.id)
      .eq('blocked_id', blockedId)

    if (error) throw error
    queryClient.invalidateQueries({ queryKey: ['logs'] })
    queryClient.invalidateQueries({ queryKey: ['feed'] })
  }

  const getAllBlockedIds = async () => {
    const { data, error } = await supabase
      .from('blocks')
      .select('blocked_id')

    if (error) throw error
    return data.map((b: { blocked_id: string }) => b.blocked_id)
  }

  return { blockUser, unblockUser, getAllBlockedIds }
}