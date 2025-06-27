import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

type ReportType = 'recipe' | 'comment' | 'profile' | 'log';

export default function ReportScreen() {
  const { type } = useLocalSearchParams<{ type: ReportType }>();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a reason for reporting this content.');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement the actual report submission logic
      // This would typically involve calling an API to save the report
      console.log('Report submitted:', {
        type,
        message: message.trim()
      });

      Alert.alert(
        'Report Submitted', 
        'Thank you for your report. We will review it and take appropriate action.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader 
        title="Report" 
        showBackButton={true} 
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.description}>Please tell us why you are reporting this content.</ThemedText>
        
        <TextInput
          style={styles.textArea}
          value={message}
          onChangeText={setMessage}
          placeholder="Describe the issue..."
          placeholderTextColor="#79320666"
          multiline
          textAlignVertical="top"
          maxLength={1000}
        />
        
        <ThemedText style={styles.characterCount}>
          {message.length}/1000
        </ThemedText>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.sendButton,
          { opacity: !message.trim() || isSubmitting ? 0.5 : 1 }
        ]}
        onPress={handleSend}
        disabled={!message.trim() || isSubmitting}
      >
        <ThemedText style={styles.sendButtonText}>
          {isSubmitting ? 'Sending...' : 'Send Report'}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE4D2',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },

  description: {
    fontSize: 16,
    color: '#793206',
    marginBottom: 20,
    lineHeight: 22,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#793206',
    borderWidth: 1,
    borderColor: '#79320633',
    minHeight: 200,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#79320666',
    marginTop: 8,
  },
  sendButton: {
    backgroundColor: '#793206',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 