import React, {memo, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StatusBar,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import {styles} from './styles';
import {getGuideById, Lesson} from './mockData';
import {moderateScale} from '../../theme';
import GradientText from '../../components/GradientText';
import {selectCompletedLessonsForGuide} from '../../redux/slices/cosmicGuidesSlice';
import {RootState} from '../../redux/rootReducer';

// Icons
import CrossIcon from '../../assets/icons/home_icons/cross.svg';
import GoRightIcon from '../../assets/icons/home_icons/go_right.svg';
import ReadDoneIcon from '../../assets/icons/home_icons/read_done.svg';

// Background Image
const BackgroundImage = require('../../assets/icons/bottomtab_icons/main_screen_background.png');

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Lesson Card Component
interface LessonCardProps {
  lesson: Lesson;
  index: number;
  onPress: () => void;
}

const LessonCard = memo(({lesson, index, onPress}: LessonCardProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, {damping: 15});
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {damping: 15});
  }, [scale]);

  return (
    <Animated.View entering={FadeInDown.delay(200 + index * 80).springify()}>
      <AnimatedTouchable
        style={[styles.lessonCard, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={0.9}>
        <View style={styles.lessonNumberContainer}>
          {lesson.isCompleted ? (
            <ReadDoneIcon width={moderateScale(40)} height={moderateScale(40)} />
          ) : (
            <Text style={styles.lessonNumber}>{lesson.number}</Text>
          )}
        </View>
        <View style={styles.lessonTextContainer}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonReadTime}>{lesson.readTime}</Text>
        </View>
        {!lesson.isCompleted && (
          <View style={styles.lessonArrow}>
            <GoRightIcon width={moderateScale(24)} height={moderateScale(24)} />
          </View>
        )}
      </AnimatedTouchable>
    </Animated.View>
  );
});

LessonCard.displayName = 'LessonCard';

// Types for navigation
type CosmicGuideDetailProps = NativeStackScreenProps<any, 'CosmicGuideDetail'>;

const CosmicGuideDetail: React.FC<CosmicGuideDetailProps> = ({navigation, route}) => {
  const {guideId} = route.params as {guideId: string};
  
  // Get guide data
  const guide = useMemo(() => getGuideById(guideId), [guideId]);
  
  // Get completed lessons from Redux (persisted)
  const completedLessons = useSelector((state: RootState) =>
    selectCompletedLessonsForGuide(state, guideId),
  );

  // Close handler
  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Navigate to lesson detail
  const handleLessonPress = useCallback(
    (lesson: Lesson) => {
      navigation.navigate('LessonDetail', {
        guideId,
        lessonId: lesson.id,
        totalLessons: guide?.lessonsCount || 0,
      });
    },
    [navigation, guideId, guide?.lessonsCount],
  );

  if (!guide) {
    return null;
  }

  const GuideIcon = guide.Icon;

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
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            
            {/* Title */}
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              style={styles.titleContainer}>
              <GradientText style={styles.guideTitle}>{guide.title}</GradientText>
            </Animated.View>

            {/* Guide Icon */}
            <Animated.View
              entering={FadeInDown.delay(150).springify()}
              style={styles.iconSection}>
              <GuideIcon width={moderateScale(60)} height={moderateScale(60)} />
              <Text style={styles.lessonsCount}>
                {guide.lessonsCount} LESSONS
              </Text>
            </Animated.View>

            {/* Lesson Cards */}
            {guide.lessons.map((lesson, index) => (
              <LessonCard
                key={lesson.id}
                lesson={{
                  ...lesson,
                  isCompleted: completedLessons.includes(lesson.id),
                }}
                index={index}
                onPress={() => handleLessonPress(lesson)}
              />
            ))}
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

export default CosmicGuideDetail;
