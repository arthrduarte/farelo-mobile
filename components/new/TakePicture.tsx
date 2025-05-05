import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function TakePicture() {

  const handleSubmission = () => {
    console.log('Submission');
  }

  return (
    <>
    <TouchableOpacity 
      style={styles.placeholderContainer} 
      activeOpacity={0.7}
      >
      <MaterialIcons name="camera-alt" size={48} color="#79320680" />
      <Text style={styles.placeholderText}>Tap to take a picture</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.uploadButton} onPress={handleSubmission}>
      <Text style={styles.uploadButtonText}>Continue</Text>
    </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  placeholderContainer: {
    backgroundColor: '#79320633',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    marginHorizontal: 16,
    minHeight: 200,
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#793206',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
    uploadButton: {
    backgroundColor: '#793206',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#79320680',
  },
  uploadButtonText: {
    color: '#EDE4D2',
    fontSize: 16,
    fontWeight: '600',
  },
});
