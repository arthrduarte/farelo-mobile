import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Recipe } from '@/types/db';
import { IconSymbol } from './ui/IconSymbol';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface RecipeDetailsProps {
  recipe: Recipe;
  onBack: () => void;
  onDiscard: () => void;
  onLog: () => void;
}

export default function FinishRecipe({ recipe, onBack, onDiscard, onLog }: RecipeDetailsProps) {
  const { profile } = useAuth();
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [newTag, setNewTag] = useState('');

  const handleNewLog = async () => {
    console.log('New log:', {
        recipe,
        description,
        notes,
        newTag,
        recipeId: recipe.id,
        profileId: profile?.id,
    });

    const { data, error } = await supabase
      .from('logs')
      .insert({
        profile_id: profile?.id,
        recipe_id: recipe.id,
        description,
        images: [recipe.ai_image_url],
      });

    if (error) {
      console.error('Error creating log:', error);
    } else {
      console.log('Log created successfully:', data);
    }
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <MaterialIcons name="arrow-back" size={24} color="#793206" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.title}>{recipe.title}</Text>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.textInput}
            placeholder="How was it? Tell people about it here..."
            placeholderTextColor="#79320680"
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.divider}/>


        {/* Images */}
        <View style={styles.imagesContainer}>
          {/* Recipe Image */}
          <Image 
            source={{ uri: recipe.ai_image_url }} 
            style={styles.recipeImage}
          />
          
          {/* Upload Photo Button */}
          <TouchableOpacity style={styles.uploadButton}>
            <MaterialIcons name="add-a-photo" size={24} color="#793206" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider}/>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {recipe.tags?.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            <View style={styles.addTagContainer}>
              <TextInput
                style={styles.tagInput}
                placeholder="add more"
                placeholderTextColor="#79320680"
                value={newTag}
                onChangeText={setNewTag}
              />
            </View>
          </View>
        </View>

        <View style={styles.divider}/>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (only for you)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="How did it turn out? Would you change anything next time?"
            placeholderTextColor="#79320680"
            multiline
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View style={styles.divider}/>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.logButton} onPress={handleNewLog}>
            <Text style={styles.logButtonText}>Log</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.discardButton} onPress={onDiscard}>
            <Text style={styles.discardButtonText}>Discard Meal</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    marginBottom: 16,
    height: 40,
    borderRadius: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#793206',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    color: '#793206',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#793206',
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 8,
    textAlignVertical: 'top',
    color: '#793206',
  },
  imagesContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  recipeImage: {
    width: 140,
    height: 140,
    borderRadius: 8,
  },
  uploadButton: {
    width: 140,
    height: 140,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#79320633',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#793206',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  addTagContainer: {
    borderWidth: 1,
    borderColor: '#79320633',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tagInput: {
    fontSize: 14,
    color: '#793206',
    minWidth: 80,
  },
  actionButtons: {
    gap: 12,
    marginTop: 12,
  },
  discardButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  discardButtonText: {
    color: '#793206',
    fontSize: 16,
    fontWeight: '600',
  },
  logButton: {
    backgroundColor: '#793206',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    borderBottomColor: '#79320633',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
}); 
