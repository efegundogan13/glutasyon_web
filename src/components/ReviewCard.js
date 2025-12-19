import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StarRating from 'react-native-star-rating-widget';
import { COLORS, SIZES, SPACING, BORDER_RADIUS } from '../config/theme';
import { formatDateTime } from '../utils/validation';

const ReviewCard = ({ review, onApprove, onDelete, canManage }) => {
  const userName = review.user?.name || review.userName || 'Kullanıcı';
  
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.date}>{formatDateTime(review.createdAt)}</Text>
          </View>
        </View>
        {canManage && (
          <View style={styles.actions}>
            {!review.approved && (
              <TouchableOpacity onPress={() => onApprove(review.id)} style={styles.actionBtn}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => onDelete(review.id)} style={styles.actionBtn}>
              <Ionicons name="trash" size={24} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <View style={styles.ratingContainer}>
        <StarRating
          rating={review.rating}
          onChange={() => {}}
          starSize={20}
          color={COLORS.accent}
          enableHalfStar={false}
          enableSwiping={false}
        />
      </View>
      
      {review.comment && (
        <Text style={styles.comment}>{review.comment}</Text>
      )}
      
      {!review.approved && (
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>Onay Bekliyor</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: SIZES.lg,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  date: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
  },
  actionBtn: {
    marginLeft: SPACING.sm,
  },
  ratingContainer: {
    marginBottom: SPACING.sm,
  },
  comment: {
    fontSize: SIZES.md,
    color: COLORS.text,
    lineHeight: 20,
  },
  pendingBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
  },
  pendingText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
});

export default ReviewCard;
