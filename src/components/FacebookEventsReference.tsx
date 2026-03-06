/**
 * Facebook Events Quick Reference
 * 
 * Interactive reference card showing all available events
 * Useful for developers to quickly see what events are available
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface EventCategory {
  name: string;
  events: Array<{
    function: string;
    description: string;
    example: string;
  }>;
}

const eventCategories: EventCategory[] = [
  {
    name: 'Authentication',
    events: [
      { function: 'trackLogin', description: 'User signs in', example: "trackLogin('email')" },
      { function: 'trackSignup', description: 'User registers', example: "trackSignup('google')" },
      { function: 'trackLogout', description: 'User signs out', example: 'trackLogout()' },
    ],
  },
  {
    name: 'E-Commerce',
    events: [
      { function: 'trackProductView', description: 'View product', example: "trackProductView(id, name, cat, price, 'USD')" },
      { function: 'trackAddToCart', description: 'Add to cart', example: "trackAddToCart(id, name, price, qty, 'USD')" },
      { function: 'trackPurchase', description: 'Complete purchase', example: 'trackPurchase({ amount, currency, ... })' },
    ],
  },
  {
    name: 'Subscriptions',
    events: [
      { function: 'trackSubscriptionView', description: 'View plan', example: "trackSubscriptionView(id, name, price, 'monthly')" },
      { function: 'trackSubscriptionStarted', description: 'Start subscription', example: 'trackSubscriptionStarted(...)' },
      { function: 'trackSubscriptionCancelled', description: 'Cancel subscription', example: "trackSubscriptionCancelled(id, 'reason')" },
    ],
  },
  {
    name: 'Content',
    events: [
      { function: 'trackContentView', description: 'View content', example: "trackContentView('article', id, title)" },
      { function: 'trackContentShare', description: 'Share content', example: "trackContentShare(id, type, 'facebook')" },
      { function: 'trackContentLike', description: 'Like content', example: "trackContentLike(id, 'post')" },
    ],
  },
  {
    name: 'Search & Social',
    events: [
      { function: 'trackSearch', description: 'Search query', example: "trackSearch(query, resultsCount)" },
      { function: 'trackFollowUser', description: 'Follow user', example: "trackFollowUser(userId, 'follow')" },
      { function: 'trackComment', description: 'Post comment', example: "trackComment(postId, 'post', length)" },
    ],
  },
  {
    name: 'Engagement',
    events: [
      { function: 'trackAppRating', description: 'Rate app', example: 'trackAppRating(5, true)' },
      { function: 'trackFeedbackSubmitted', description: 'Submit feedback', example: "trackFeedbackSubmitted('bug', false)" },
      { function: 'trackOnboardingCompleted', description: 'Finish onboarding', example: 'trackOnboardingCompleted(5)' },
    ],
  },
];

const FacebookEventsReference: React.FC = () => {
  const theme = useTheme();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 16,
    },
    categoryContainer: {
      marginBottom: 12,
    },
    categoryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.primary + '20',
      padding: 12,
      borderRadius: 8,
    },
    categoryName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    categoryCount: {
      fontSize: 14,
      color: theme.colors.text + '80',
    },
    eventsContainer: {
      marginTop: 8,
      paddingLeft: 8,
    },
    eventItem: {
      backgroundColor: theme.colors.card,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary,
    },
    eventFunction: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
      fontFamily: 'monospace',
      marginBottom: 4,
    },
    eventDescription: {
      fontSize: 13,
      color: theme.colors.text,
      marginBottom: 4,
    },
    eventExample: {
      fontSize: 11,
      color: theme.colors.text + '60',
      fontFamily: 'monospace',
      fontStyle: 'italic',
    },
    footer: {
      marginTop: 16,
      padding: 12,
      backgroundColor: theme.colors.primary + '10',
      borderRadius: 8,
    },
    footerText: {
      fontSize: 12,
      color: theme.colors.text + '80',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Facebook Events Reference</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {eventCategories.map((category) => (
          <View key={category.name} style={styles.categoryContainer}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => toggleCategory(category.name)}
            >
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryCount}>
                {expandedCategory === category.name ? '▼' : '▶'} {category.events.length} events
              </Text>
            </TouchableOpacity>
            
            {expandedCategory === category.name && (
              <View style={styles.eventsContainer}>
                {category.events.map((event, index) => (
                  <View key={index} style={styles.eventItem}>
                    <Text style={styles.eventFunction}>{event.function}()</Text>
                    <Text style={styles.eventDescription}>{event.description}</Text>
                    <Text style={styles.eventExample}>{event.example}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          See FACEBOOK_EVENTS_USAGE.md for complete documentation
        </Text>
      </View>
    </View>
  );
};

export default FacebookEventsReference;
