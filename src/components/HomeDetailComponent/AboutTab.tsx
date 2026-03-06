import React, { memo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Colors,
  FontFamilies,
  verticalScale,
  moderateScale,
  horizontalScale,
  fontScale,
} from '../../theme';

interface AboutTabProps {
  synopsis: string;
  views: string;
  status: string;
  language: string;
}

const AboutTab: React.FC<AboutTabProps> = memo(({
  synopsis,
  views,
  status,
  language,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LINES = 3;

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Check if synopsis is empty
  const hasSynopsis = synopsis && synopsis.trim().length > 0;

  // Truncate text for preview
  const displayText = isExpanded ? synopsis : synopsis;

  return (
    <View style={styles.container}>
      {/* Synopsis Section */}
      <Text style={styles.synopsisTitle}>Synopsis</Text>
      {hasSynopsis ? (
        <>
          <Text 
            style={styles.synopsisText}
            numberOfLines={isExpanded ? undefined : MAX_LINES}
          >
            {displayText}
          </Text>
          <TouchableOpacity onPress={toggleExpand}>
            <Text style={styles.readMoreText}>
              {isExpanded ? 'show less' : 'read more'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No description available</Text>
        </View>
      )}

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Views</Text>
          <Text style={styles.statValue}>{views}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Status</Text>
          <Text style={[styles.statValue, styles.statValueTeal]}>{status}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Language</Text>
          <Text style={styles.statValue}>{language}</Text>
        </View>
      </View>
    </View>
  );
});

AboutTab.displayName = 'AboutTab';

const styles = StyleSheet.create({
  container: {
    paddingTop: verticalScale(20),
  },
  synopsisTitle: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: Colors.text,
    marginBottom: verticalScale(12),
    paddingHorizontal:horizontalScale(16)
  },
  synopsisText: {
    fontFamily: FontFamilies.sfProDisplayMedium,
    fontSize: fontScale(16),
    color: Colors.light_gray,
    lineHeight: moderateScale(22),
      paddingHorizontal:horizontalScale(16),
      // backgroundColor:'red'
  },
  readMoreText: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: fontScale(16),
    fontWeight: '700',
    color: Colors.light_blue,
    marginTop: verticalScale(8),
      paddingHorizontal:horizontalScale(16)
  },
  emptyContainer: {
    paddingVertical: verticalScale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FontFamilies.sfProDisplayMedium,
    fontSize: moderateScale(16),
    color: Colors.inactive,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: verticalScale(24),
    paddingTop: verticalScale(24),
    // borderTopWidth: 1,
    // borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    fontSize: fontScale(14),
    color: Colors.inactive,
    marginBottom: verticalScale(4),
  },
  statValue: {
    fontFamily: FontFamilies.sfProDisplayMedium,
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: Colors.text,
  },
  statValueTeal: {
    color: '#4CE3B2',
  },
});

export default AboutTab;