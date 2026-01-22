import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SPACING, BORDER_RADIUS } from '../config/theme';
import { getImageUrl } from '../config/api';

const RecipeCard = memo(({ recipe, onPress, onDelete, showActions }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: getImageUrl(recipe.image) }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.title}
          </Text>
          {showActions && (
            <TouchableOpacity onPress={() => onDelete(recipe.id)} style={styles.deleteBtn}>
              <Ionicons name="trash" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          )}
        </View>
        
        {recipe.description && (
          <Text style={styles.description} numberOfLines={2}>
            {recipe.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.footerText}>{recipe.prepTime || '30'} dk</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="person-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.footerText}>{recipe.servings || '4'} kişilik</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.lightGray,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  deleteBtn: {
    padding: SPACING.xs,
  },
  description: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    marginLeft: SPACING.xs,
  },
});

export default RecipeCard;
