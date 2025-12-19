import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, BORDER_RADIUS, SPACING } from '../config/theme';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  multiline,
  numberOfLines,
  keyboardType,
  autoCapitalize = 'none',
  editable = true,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && { height: numberOfLines * 40, textAlignVertical: 'top' },
          error && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.darkGray}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: SIZES.md,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  inputDisabled: {
    backgroundColor: COLORS.lightGray,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: SIZES.sm,
    marginTop: SPACING.xs,
  },
});

export default Input;
