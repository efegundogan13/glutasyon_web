import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { recipeService } from '../services/recipeService';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, SIZES, SPACING, BORDER_RADIUS } from '../config/theme';
import { getImageUrl } from '../config/api';

const RecipeDetailScreen = ({ route }) => {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = async () => {
    try {
      const data = await recipeService.getRecipe(recipeId);
      setRecipe(data.recipe);
    } catch (error) {
      console.error('Error loading recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!recipe) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Tarif bulunamadı</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image
          source={{ uri: getImageUrl(recipe.image) }}
          style={styles.image}
        />

        <View style={styles.content}>
          <Text style={styles.title}>{recipe.title}</Text>
          
          {recipe.description && (
            <Text style={styles.description}>{recipe.description}</Text>
          )}

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Hazırlama</Text>
              <Text style={styles.metaValue}>{recipe.prepTime || '30'} dk</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Porsiyon</Text>
              <Text style={styles.metaValue}>{recipe.servings || '4'} kişi</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Malzemeler</Text>
            {recipe.ingredients?.map((ingredient, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listItemText}>{ingredient}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yapılışı</Text>
            {recipe.instructions?.map((instruction, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{instruction}</Text>
              </View>
            ))}
          </View>

          {recipe.authorName && (
            <View style={styles.author}>
              <Text style={styles.authorText}>
                Tarif: {recipe.authorName}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: COLORS.lightGray,
    resizeMode: 'contain',
  },
  content: {
    padding: SPACING.md,
  },
  title: {
    fontSize: SIZES.header,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  metaContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  metaValue: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 8,
    marginRight: SPACING.sm,
  },
  listItemText: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  stepNumberText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  author: {
    backgroundColor: COLORS.lightGray,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
  },
  authorText: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: SIZES.lg,
    color: COLORS.textLight,
  },
});

export default RecipeDetailScreen;
