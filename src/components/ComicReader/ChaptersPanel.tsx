/**
 * ChaptersPanel Component
 * 
 * Bottom sheet panel showing list of chapters for selection
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Colors,
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PDFChapter } from './types';

interface ChaptersPanelProps {
  chapters: PDFChapter[];
  currentChapterId: string | number;
  onChapterSelect: (chapter: PDFChapter) => void;
  onClose: () => void;
  visible: boolean;
}

const ChapterItem = memo<{
  chapter: PDFChapter;
  isCurrent: boolean;
  onPress: () => void;
}>(({ chapter, isCurrent, onPress }) => (
  <TouchableOpacity
    style={[styles.chapterItem, isCurrent && styles.chapterItemActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.chapterInfo}>
      <Text style={[styles.chapterNumber, isCurrent && styles.textActive]}>
        Chapter {chapter.number}
      </Text>
      <Text style={[styles.chapterTitle, isCurrent && styles.textActive]} numberOfLines={1}>
        {chapter.title}
      </Text>
    </View>
    
    <View style={styles.chapterMeta}>
      {chapter.isDownloaded && (
        <Icon
          name="download-circle"
          size={moderateScale(18)}
          color={Colors.notification}
          style={styles.downloadedIcon}
        />
      )}
      {chapter.isLocked && (
        <Icon
          name="lock"
          size={moderateScale(18)}
          color={Colors.inactive}
        />
      )}
      {isCurrent && (
        <Icon
          name="play-circle"
          size={moderateScale(20)}
          color={Colors.primary}
        />
      )}
    </View>
  </TouchableOpacity>
));

ChapterItem.displayName = 'ChapterItem';

const Separator = () => <View style={styles.separator} />;

const ChaptersPanel: React.FC<ChaptersPanelProps> = ({
  chapters,
  currentChapterId,
  onChapterSelect,
  onClose,
  visible,
}) => {
  const insets = useSafeAreaInsets();

  const renderChapter = useCallback(
    ({ item }: { item: PDFChapter }) => (
      <ChapterItem
        chapter={item}
        isCurrent={item.id === currentChapterId}
        onPress={() => onChapterSelect(item)}
      />
    ),
    [currentChapterId, onChapterSelect]
  );

  const keyExtractor = useCallback(
    (item: PDFChapter) => String(item.id),
    []
  );

  if (!visible) return null;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + verticalScale(70) }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chapters</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={moderateScale(24)} color={Colors.white} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={chapters}
        renderItem={renderChapter}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={Separator}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '60%',
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontFamily: FontFamilies.poppinsSemiBold,
    color: Colors.white,
  },
  closeButton: {
    padding: moderateScale(4),
  },
  listContent: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
  },
  chapterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(12),
    borderRadius: moderateScale(10),
  },
  chapterItemActive: {
    backgroundColor: 'rgba(255, 62, 87, 0.15)',
  },
  chapterInfo: {
    flex: 1,
    marginRight: horizontalScale(12),
  },
  chapterNumber: {
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.poppinsSemiBold,
    color: Colors.white,
  },
  chapterTitle: {
    fontSize: moderateScale(12),
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.inactive,
    marginTop: verticalScale(2),
  },
  textActive: {
    color: Colors.primary,
  },
  chapterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
  },
  downloadedIcon: {
    marginRight: horizontalScale(4),
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});

export default memo(ChaptersPanel);
