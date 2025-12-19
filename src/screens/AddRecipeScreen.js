import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { recipeService } from '../services/recipeService';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, SIZES, SPACING, BORDER_RADIUS } from '../config/theme';
import { pickImage } from '../utils/imagePicker';

const AddRecipeScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prepTime: '',
    servings: '',
  });
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState(['']);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handlePickImage = async () => {
    const img = await pickImage();
    if (img) {
      setImage(img);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const updateIngredient = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const removeIngredient = (index) => {
    if (ingredients.length === 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const updateInstruction = (index, value) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const removeInstruction = (index) => {
    if (instructions.length === 1) return;
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tarif adı gerekli';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Açıklama gerekli';
    }

    const hasEmptyIngredient = ingredients.some((i) => !i.trim());
    if (hasEmptyIngredient) {
      newErrors.ingredients = 'Tüm malzemeler doldurulmalı';
    }

    const hasEmptyInstruction = instructions.some((i) => !i.trim());
    if (hasEmptyInstruction) {
      newErrors.instructions = 'Tüm talimatlar doldurulmalı';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Hata', 'Lütfen tüm gerekli alanları doldurun');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('prepTime', formData.prepTime || '30');
      formDataToSend.append('servings', formData.servings || '4');
      formDataToSend.append('ingredients', JSON.stringify(ingredients));
      formDataToSend.append('instructions', JSON.stringify(instructions));

      if (image) {
        formDataToSend.append('image', {
          uri: image.uri,
          type: 'image/jpeg',
          name: 'recipe.jpg',
        });
      }

      await recipeService.createRecipe(formDataToSend);

      Alert.alert('Başarılı', 'Tarif eklendi', [
        {
          text: 'Tamam',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Hata', 'Tarif eklenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={styles.title}>Yeni Tarif Ekle</Text>

          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.recipeImage} />
            ) : (
              <View style={styles.imagePickerContent}>
                <Ionicons name="camera" size={48} color={COLORS.gray} />
                <Text style={styles.imagePickerText}>Fotoğraf Ekle</Text>
              </View>
            )}
          </TouchableOpacity>

          <Input
            label="Tarif Adı *"
            value={formData.title}
            onChangeText={(value) => updateFormData('title', value)}
            placeholder="Örn: Glutensiz Çikolatalı Kurabiye"
            error={errors.title}
          />

          <Input
            label="Açıklama *"
            value={formData.description}
            onChangeText={(value) => updateFormData('description', value)}
            placeholder="Tarif hakkında kısa açıklama"
            multiline
            numberOfLines={3}
            error={errors.description}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Hazırlama Süresi (dk)"
                value={formData.prepTime}
                onChangeText={(value) => updateFormData('prepTime', value)}
                placeholder="30"
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Porsiyon"
                value={formData.servings}
                onChangeText={(value) => updateFormData('servings', value)}
                placeholder="4"
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Malzemeler</Text>
              <TouchableOpacity onPress={addIngredient}>
                <Ionicons name="add-circle" size={28} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            {ingredients.map((ingredient, index) => (
              <View key={index} style={styles.listItem}>
                <Input
                  value={ingredient}
                  onChangeText={(value) => updateIngredient(index, value)}
                  placeholder={`Malzeme ${index + 1}`}
                  style={styles.listItemInput}
                />
                {ingredients.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeIngredient(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {errors.ingredients && (
              <Text style={styles.errorText}>{errors.ingredients}</Text>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Yapılışı</Text>
              <TouchableOpacity onPress={addInstruction}>
                <Ionicons name="add-circle" size={28} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            {instructions.map((instruction, index) => (
              <View key={index} style={styles.listItem}>
                <Input
                  value={instruction}
                  onChangeText={(value) => updateInstruction(index, value)}
                  placeholder={`Adım ${index + 1}`}
                  multiline
                  numberOfLines={2}
                  style={styles.listItemInput}
                />
                {instructions.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeInstruction(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {errors.instructions && (
              <Text style={styles.errorText}>{errors.instructions}</Text>
            )}
          </View>

          <Button
            title="Tarifi Kaydet"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
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
  scrollContent: {
    padding: SPACING.md,
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  title: {
    fontSize: SIZES.header,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  imagePicker: {
    width: '100%',
    height: 200,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  imagePickerContent: {
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: SIZES.md,
    color: COLORS.gray,
    marginTop: SPACING.sm,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  listItemInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeButton: {
    marginLeft: SPACING.sm,
    marginTop: SPACING.lg,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: SIZES.sm,
    marginTop: SPACING.xs,
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
});

export default AddRecipeScreen;
