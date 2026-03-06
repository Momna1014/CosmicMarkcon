/**
 * PDFViewer Component
 * 
 * Main PDF viewer component using react-native-pdf
 * Displays PDF from URL with zoom, scroll, and page navigation
 * 
 * NOTE: You need to install react-native-pdf and react-native-blob-util:
 * yarn add react-native-pdf react-native-blob-util
 * cd ios && pod install
 */

import React, { memo, useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Pdf from 'react-native-pdf';
import {
  Colors,
  FontFamilies,
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PDFViewerProps {
  pdfUrl: string;
  onPageChange?: (page: number, totalPages: number) => void;
  onLoadComplete?: (totalPages: number) => void;
  onError?: (error: Error) => void;
  onPress?: () => void;
  initialPage?: number;
  horizontal?: boolean;
  enablePaging?: boolean;
  fitPolicy?: 0 | 1 | 2; // 0: fit width, 1: fit height, 2: fit both
  backgroundColor?: string;
  showPageNumber?: boolean;
  spacing?: number;
  style?: any;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  onPageChange,
  onLoadComplete,
  onError,
  onPress,
  initialPage = 1,
  horizontal = false,
  enablePaging = false,
  fitPolicy = 0, // Fit width by default (better for manga)
  backgroundColor = Colors.background,
  showPageNumber = true,
  spacing = 0,
  style,
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pdfRef = useRef<any>(null);

  const handleLoadComplete = useCallback(
    (numberOfPages: number) => {
      setTotalPages(numberOfPages);
      setIsLoading(false);
      setLoadProgress(100);
      onLoadComplete?.(numberOfPages);
    },
    [onLoadComplete]
  );

  const handleLoadProgress = useCallback((percent: number) => {
    setLoadProgress(Math.round(percent * 100));
  }, []);

  const handlePageChanged = useCallback(
    (page: number, numberOfPages: number) => {
      setCurrentPage(page);
      onPageChange?.(page, numberOfPages);
    },
    [onPageChange]
  );

  const handleError = useCallback(
    (err: any) => {
      console.error('PDF Error:', err);
      setError('Failed to load PDF. Please check your connection and try again.');
      setIsLoading(false);
      onError?.(err);
    },
    [onError]
  );

  const handlePress = useCallback(() => {
    onPress?.();
  }, [onPress]);

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor }]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => setError(null)}
          activeOpacity={0.7}
        >
          <Text style={styles.retryText}>Tap to Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <Pdf
        ref={pdfRef}
        source={pdfUrl.startsWith('/') || pdfUrl.startsWith('file://') 
          ? { uri: pdfUrl } 
          : { uri: pdfUrl, cache: true }}
        page={initialPage}
        scale={1.0}
        minScale={1.0}
        maxScale={1.0}
        horizontal={horizontal}
        enablePaging={enablePaging}
        fitPolicy={fitPolicy}
        spacing={spacing}
        onLoadComplete={handleLoadComplete}
        onPageChanged={handlePageChanged}
        onError={handleError}
        onLoadProgress={handleLoadProgress}
        onPressLink={(uri) => console.log('Link pressed:', uri)}
        singlePage={false}
        enableAntialiasing={true}
        enableAnnotationRendering={true}
        onPageSingleTap={handlePress}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={[
          styles.pdf, 
          { backgroundColor },
          // Fix for iOS vertical scrolling - prevent horizontal movement
          Platform.OS === 'ios' && !horizontal && {
            width: SCREEN_WIDTH,
            alignSelf: 'center',
          }
        ]}
        trustAllCerts={false}
        // iOS specific: Lock horizontal scrolling when in vertical mode
        scrollEnabled={Platform.OS === 'ios' ? true : undefined}
        renderActivityIndicator={() => <></>}
      />

      {/* Page Number Indicator */}
      {showPageNumber && totalPages > 0 && !isLoading && (
        <View style={styles.pageIndicator} pointerEvents="none">
          <Text style={styles.pageText}>
            {currentPage}/{totalPages}
          </Text>
        </View>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading PDF...</Text>
          <View style={{flexDirection:'row', alignItems:'center'}}>
 <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${loadProgress}%` }]} />
         

          </View>
           <Text style={styles.progressText}>{loadProgress}%</Text>
          </View>
         
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden', // Prevent content overflow on iOS
  },
  pdf: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20),
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.light_gray,
  },
  progressText: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(12),
    fontFamily: FontFamilies.poppinsMedium,
    color: Colors.primary,
    marginLeft:horizontalScale(10)
  },
  progressBarContainer: {
    width: moderateScale(200),
    height: verticalScale(6),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: moderateScale(3),
    marginTop: verticalScale(10),
    overflow: 'hidden',
    // flexDirection:'row',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: moderateScale(3),
  },
  errorText: {
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  retryButton: {
    paddingHorizontal: moderateScale(24),
    paddingVertical: moderateScale(12),
    backgroundColor: Colors.primary,
    borderRadius: moderateScale(8),
  },
  retryText: {
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.poppinsMedium,
    color: Colors.white,
  },
  pageIndicator: {
    position: 'absolute',
    bottom: verticalScale(90),
    right: moderateScale(8),
    backgroundColor: 'rgba(0, 0, 0, 0.76)',
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(3),
  },
  pageText: {
    fontSize: moderateScale(13),
    fontFamily: FontFamilies.poppinsMedium,
    color: Colors.white,
  },
});

export default memo(PDFViewer);
