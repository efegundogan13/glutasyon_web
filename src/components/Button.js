import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES, BORDER_RADIUS, SPACING } from '../config/theme';

const Button = ({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false, 
  variant = 'primary',
  style,
  textStyle 
}) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.gray;
    switch (variant) {
      case 'secondary':
        return COLORS.secondary;
      case 'danger':
        return COLORS.danger;
      case 'outline':
        return 'transparent';
      default:
        return COLORS.primary;
    }
  };

  const getTextColor = () => {
    return variant === 'outline' ? COLORS.primary : COLORS.white;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outline,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  outline: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  text: {
    fontSize: SIZES.lg,
    fontWeight: '600',
  },
});

export default Button;
