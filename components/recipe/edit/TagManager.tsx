import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface TagManagerProps {
  visible: boolean;
  onClose: () => void;
  tags: string[];
  onUpdateTags: (newTags: string[]) => void;
}

export default function TagManager({ visible, onClose, tags, onUpdateTags }: TagManagerProps) {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && newTag.length <= 12) {
      onUpdateTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    onUpdateTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.drawer}>
          <View style={styles.header}>
            <Text style={styles.title}>Manage Tags</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#793206" />
            </TouchableOpacity>
          </View>

          <View style={styles.addTagSection}>
            <TextInput
              style={styles.input}
              value={newTag}
              onChangeText={setNewTag}
              placeholder="Add new tag..."
              maxLength={12}
            />
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddTag}
            >
              <MaterialIcons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.tagList}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tagItem}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveTag(index)}
                  style={styles.removeButton}
                >
                  <MaterialIcons name="close" size={20} color="#793206" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  drawer: {
    backgroundColor: '#EDE4D2',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#793206',
  },
  addTagSection: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    // borderWidth: 1,
    // borderColor: '#793206',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#793206',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagList: {
    gap: 10,
  },
  tagItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EDE4D2',
    padding: 12,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 16,
    color: '#793206',
  },
  removeButton: {
    padding: 4,
  },
}); 