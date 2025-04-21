import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Temporary type and data for development
type Recipe = {
  id: string;
  image: string;
  title: string;
  tags: string[];
  time: string;
  servings: number;
}

const mockRecipes: Recipe[] = [
  {
    id: '1',
    image: 'https://via.placeholder.com/150',
    title: 'Brown Sugar Oat Muffins',
    tags: ['breakfast', 'quick', 'sweet'],
    time: '10 mins',
    servings: 12
  },
  {
    id: '2',
    image: 'https://via.placeholder.com/150',
    title: 'Brown Sugar Oat Muffins',
    tags: ['breakfast', 'quick', 'sweet'],
    time: '10 mins',
    servings: 12
  },
  {
    id: '3',
    image: 'https://via.placeholder.com/150',
    title: 'Brown Sugar Oat Muffins',
    tags: ['breakfast', 'quick', 'sweet'],
    time: '10 mins',
    servings: 12
  },
  {
    id: '4',
    image: 'https://via.placeholder.com/150',
    title: 'Brown Sugar Oat Muffins',
    tags: ['breakfast', 'quick', 'sweet'],
    time: '10 mins',
    servings: 12
  }
];

export default function RecipesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header Buttons */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add new recipe</Text>
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchText}>Search</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="filter-list" size={24} color="#603808" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recipe List */}
      <ScrollView style={styles.recipeList} showsVerticalScrollIndicator={false}>
        {mockRecipes.map((recipe) => (
          <View key={recipe.id} style={styles.recipeCard}>
            <Image 
              source={{ uri: recipe.image }} 
              style={styles.recipeImage}
            />
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              <View style={styles.tagContainer}>
                {recipe.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.metaInfo}>
                <View style={styles.metaItem}>
                  <View style={styles.timeIcon}>
                    <MaterialIcons name="schedule" size={16} color="#603808" />
                  </View>
                  <Text style={styles.metaText}>{recipe.time}</Text>
                </View>
                <View style={styles.metaItem}>
                  <View style={styles.servingsIcon}>
                    <MaterialIcons name="people" size={16} color="#603808" />
                  </View>
                  <Text style={styles.metaText}>{recipe.servings} servings</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#EDE4D2',
  },
  header: {
    gap: 16,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#793206',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    backgroundColor: '#79320633',
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchText: {
    color: '#793206',
    fontSize: 16,
    opacity: 0.6,
  },
  filterButton: {
    backgroundColor: '#EDE4D2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
  },
  recipeList: {
    flex: 1,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: '#79320633',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  recipeImage: {
    width: 100,
    height: 100,
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#793206',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#793206',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tagText: {
    color: 'white',
    fontSize: 14,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaText: {
    color: '#793206',
    fontSize: 14,
  },
});
