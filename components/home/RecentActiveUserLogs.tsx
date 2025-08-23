import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LogCard } from '@/components/log/LogCard';
import { LogLoader } from '@/components/log/LogLoader';
import { WhoToFollow } from '@/components/home/WhoToFollow';
import { useRecentLogsFromActiveUsers } from '@/hooks/logs';
import { useAuth } from '@/contexts/AuthContext';
import type { EnhancedLog } from '@/types/types';

export const RecentActiveUserLogs = () => {
  const { profile } = useAuth();
  const { data: logs, isLoading, isError } = useRecentLogsFromActiveUsers(profile?.id);

  if (!profile?.id) return null;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Trending</Text>
        <Text style={styles.subtitle}>See what active users are cooking</Text>
        <LogLoader />
        <LogLoader />
        <LogLoader />
      </View>
    );
  }

  if (isError || !logs || logs.length === 0) {
    return null; // Don't show anything if there's an error or no logs
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trending</Text>
      <Text style={styles.subtitle}>See what active users are cooking</Text>
      {logs.map((log: EnhancedLog, index: number) => (
        <React.Fragment key={log.id}>
          <LogCard log={log} showFollow={true} />
          {index === 0 && <WhoToFollow />}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#793206',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#79320680',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
});
