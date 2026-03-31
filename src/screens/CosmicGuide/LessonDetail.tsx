import React, {memo, useCallback, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  StatusBar,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSelector, useDispatch} from 'react-redux';
import {styles} from './styles';
import {getGuideById, getLessonById} from './mockData';
import {moderateScale} from '../../theme';
import GradientText from '../../components/GradientText';
import {markLessonCompleted, selectIsLessonCompleted} from '../../redux/slices/cosmicGuidesSlice';
import {RootState} from '../../redux/rootReducer';
import CosmicAlert from '../../components/CosmicAlert';

// Analytics
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';
import {
  trackLessonDetailView,
  trackLessonComplete,
  trackLessonDetailDismiss,
} from '../../utils/mainScreenAnalytics';

// Icons
import CrossIcon from '../../assets/icons/home_icons/cross.svg';

// Background Image
const BackgroundImage = require('../../assets/icons/bottomtab_icons/main_screen_background.png');

// Check Icon Component
const CheckIcon = memo(() => (
  <Text style={styles.checkIconText}>✓</Text>
));

CheckIcon.displayName = 'CheckIcon';

// Types for navigation
type LessonDetailProps = NativeStackScreenProps<any, 'LessonDetail'>;

const LessonDetail: React.FC<LessonDetailProps> = ({navigation, route}) => {
  const {guideId, lessonId, totalLessons} = route.params as {
    guideId: string;
    lessonId: string;
    totalLessons: number;
  };

  const dispatch = useDispatch();

  // Get data
  const guide = useMemo(() => getGuideById(guideId), [guideId]);
  const lesson = useMemo(() => getLessonById(guideId, lessonId), [guideId, lessonId]);
  
  // Get completion state from Redux
  const isCompleted = useSelector((state: RootState) =>
    selectIsLessonCompleted(state, guideId, lessonId),
  );
  
  // Track alert visibility
  const [showAlert, setShowAlert] = React.useState(false);

  // Analytics - Screen View
  useScreenView('LessonDetail', {
    screen_category: 'cosmic_guide',
    guide_id: guideId,
    lesson_id: lessonId,
  });

  // Analytics - Track screen view on mount
  useEffect(() => {
    if (lesson) {
      trackLessonDetailView(guideId, lessonId, lesson.title);
      firebaseService.logScreenView('LessonDetail', 'LessonDetailScreen');
    }
  }, [guideId, lessonId, lesson]);

  // Close handler
  const handleClose = useCallback(() => {
    trackLessonDetailDismiss(guideId, lessonId, isCompleted);
    navigation.goBack();
  }, [navigation, guideId, lessonId, isCompleted]);

  // Complete handler
  const handleComplete = useCallback(() => {
    if (!isCompleted && lesson) {
      trackLessonComplete(guideId, lessonId, lesson.number);
      // Dispatch Redux action to mark lesson as completed
      dispatch(markLessonCompleted({guideId, lessonId}));
      // Show completion alert
      setShowAlert(true);
    }
  }, [isCompleted, dispatch, guideId, lessonId, lesson]);

  // Handle alert dismiss
  const handleAlertDismiss = useCallback(() => {
    setShowAlert(false);
    navigation.goBack();
  }, [navigation]);

  if (!lesson || !guide) {
    return null;
  }

  return (
    <View style={styles.backgroundFallback}>
      <ImageBackground
        source={BackgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover">
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}>
              <CrossIcon width={moderateScale(40)} height={moderateScale(40)} />
            </TouchableOpacity>
            <View style={styles.headerSpacer} />
            <Text style={styles.lessonCounter}>
              LESSON {lesson.number} OF {totalLessons}
            </Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}>
            
            {/* Title Section */}
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              style={styles.titleContainer}>
              <GradientText style={styles.guideTitle}>{lesson.title}</GradientText>
              <Text style={styles.subtitleText}>{guide.title.toUpperCase()}</Text>
            </Animated.View>

            {/* Content Card */}
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              style={styles.contentCard}>
              <Text style={styles.mainText}>{lesson.content.mainText}</Text>
              <Text style={styles.subText}>{lesson.content.subText}</Text>

              {/* Key Takeaway Card */}
              <View style={styles.keyTakeawayCard}>
                <Text style={styles.keyTakeawayLabel}>Key Takeaway</Text>
                <Text style={styles.keyTakeawayText}>
                  {lesson.content.keyTakeaway}
                </Text>
              </View>
            </Animated.View>

            {/* Complete Button */}
            <Animated.View
              entering={FadeInDown.delay(300).springify()}
              style={styles.completeButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.completeButton,
                  isCompleted && styles.completeButtonCompleted,
                ]}
                onPress={handleComplete}
                activeOpacity={0.8}>
                <Text style={styles.completeButtonText}>
                  {isCompleted ? 'Completed' : 'Complete'}
                </Text>
                {isCompleted && <CheckIcon />}
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>

      {/* Completion Alert */}
      <CosmicAlert
        visible={showAlert}
        title="Lesson Complete! ✨"
        message="You've absorbed the cosmic wisdom of this lesson. Continue your celestial journey!"
        buttonText="Continue"
        onDismiss={handleAlertDismiss}
      />
    </View>
  );
};

export default LessonDetail;
