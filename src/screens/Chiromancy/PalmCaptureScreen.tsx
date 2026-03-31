import React, {memo, useCallback, useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import LottieView from 'lottie-react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
  moderateScale,
} from '../../theme';
import {launchCamera, ImagePickerResult} from '../../utils/imagePicker';
import CustomAlert from '../../components/common/CustomAlert';

// Analytics
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';
import {
  trackPalmCaptureView,
  trackPalmCaptureImage,
  trackPalmAnalysisStart,
} from '../../utils/mainScreenAnalytics';

// Import icons
import CrossIcon from '../../assets/icons/home_icons/cross.svg';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

type HandType = 'leftHand' | 'rightHand';

type PalmCaptureRouteParams = {
  PalmCapture: {
    handType: HandType;
  };
};

const BackgroundImage = require('../../assets/icons/bottomtab_icons/main_screen_background.png');
const AstrologyLottie = require('../../assets/lottie/Astrology.json');
import {ImageBackground} from 'react-native';

// Minimalist Scan Frame Component
const HandGuide = memo(({handType, animValue}: {handType: HandType; animValue: Animated.Value}) => {
  const isLeftHand = handType === 'leftHand';
  
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Subtle glow pulse
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    
    // Scanning line animation
    const scan = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    
    glow.start();
    scan.start();
    
    return () => {
      glow.stop();
      scan.stop();
    };
  }, [glowAnim, scanLineAnim]);

  const frameWidth = SCREEN_WIDTH * 0.75;
  const frameHeight = SCREEN_WIDTH * 0.85;

  return (
    <Animated.View 
      style={[
        styles.handGuideContainer, 
        {opacity: animValue}
      ]}>
      
      {/* Outer ambient glow */}
      <Animated.View style={[styles.outerGlowRing, {opacity: glowAnim}]} />
      
      {/* Main scan frame */}
      <View style={[styles.scanFrame, {width: frameWidth, height: frameHeight}]}>
        
        {/* Scanning line effect */}
        <Animated.View 
          style={[
            styles.scanLine,
            {
              transform: [{
                translateY: scanLineAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, frameHeight - 4],
                })
              }],
              opacity: scanLineAnim.interpolate({
                inputRange: [0, 0.1, 0.9, 1],
                outputRange: [0, 1, 1, 0],
              }),
            }
          ]} 
        />
        
        {/* Corner brackets - Top Left */}
        <View style={[styles.cornerBracket, styles.cornerTopLeft]}>
          <View style={styles.bracketHorizontal} />
          <View style={styles.bracketVertical} />
        </View>
        
        {/* Corner brackets - Top Right */}
        <View style={[styles.cornerBracket, styles.cornerTopRight]}>
          <View style={[styles.bracketHorizontal, styles.bracketHRight]} />
          <View style={[styles.bracketVertical, styles.bracketVRight]} />
        </View>
        
        {/* Corner brackets - Bottom Left */}
        <View style={[styles.cornerBracket, styles.cornerBottomLeft]}>
          <View style={[styles.bracketHorizontal, styles.bracketHBottom]} />
          <View style={[styles.bracketVertical, styles.bracketVBottom]} />
        </View>
        
        {/* Corner brackets - Bottom Right */}
        <View style={[styles.cornerBracket, styles.cornerBottomRight]}>
          <View style={[styles.bracketHorizontal, styles.bracketHRight, styles.bracketHBottom]} />
          <View style={[styles.bracketVertical, styles.bracketVRight, styles.bracketVBottom]} />
        </View>
        
        {/* Center content - Lottie Animation */}
        <View style={styles.frameCenterContent}>
          
          {/* Astrology Lottie Animation */}
          <LottieView
            source={AstrologyLottie}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          
          {/* Guide text */}
          <View style={styles.guideTextContainer}>
            <Text style={styles.guideMainText}>
              {isLeftHand ? 'LEFT' : 'RIGHT'} PALM
            </Text>
            <View style={styles.guideDivider} />
            {/* <Text style={styles.guideSubText}>POSITION WITHIN FRAME</Text> */}
          </View>
        </View>
        
        {/* Thumb indicator */}
        {/* <View style={[
          styles.thumbIndicatorContainer,
          isLeftHand ? styles.thumbIndicatorLeft : styles.thumbIndicatorRight
        ]}>
          <View style={styles.thumbIndicatorDot} />
          <View style={styles.thumbIndicatorLine} />
          <Text style={styles.thumbIndicatorLabel}>THUMB</Text>
        </View> */}
      </View>
      
    </Animated.View>
  );
});

// Capture Preview Component
const CapturePreview = memo(({
  imageUri,
  handType,
  onConfirm,
  onRetake,
  animValue,
  onWrongHand,
}: {
  imageUri: string;
  handType: HandType;
  onConfirm: () => void;
  onRetake: () => void;
  animValue: Animated.Value;
  onWrongHand: () => void;
}) => {
  const handLabel = handType === 'leftHand' ? 'Left Palm' : 'Right Palm';
  
  return (
    <Animated.View style={[styles.previewContainer, {opacity: animValue}]}>
      <View style={styles.previewImageContainer}>
        <FastImage
          source={{uri: imageUri}}
          style={styles.previewImage}
          resizeMode={FastImage.resizeMode.contain}
        />
        <View style={styles.previewBadge}>
          <Text style={styles.previewBadgeText}>{handLabel}</Text>
        </View>
      </View>
      
      <Text style={styles.confirmTitle}>Is this your {handLabel}?</Text>
      <Text style={styles.confirmSubtitle}>
        Make sure you captured the correct hand
      </Text>
      
      <View style={styles.confirmButtonsContainer}>
        <TouchableOpacity 
          style={[styles.confirmButton, styles.retakeButton]}
          onPress={onRetake}
          activeOpacity={0.7}>
          <Text style={styles.retakeButtonText}>Retake</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.confirmButton, styles.yesButton]}
          onPress={onConfirm}
          activeOpacity={0.7}>
          <Text style={styles.yesButtonText}>Yes, Analyze</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.wrongHandButton}
        onPress={onWrongHand}
        activeOpacity={0.7}>
        <Text style={styles.wrongHandButtonText}>I captured the wrong hand</Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

const PalmCaptureScreen: React.FC = memo(() => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<PalmCaptureRouteParams, 'PalmCapture'>>();
  const handType = route.params?.handType || 'leftHand';
  
  const [capturedImage, setCapturedImage] = useState<ImagePickerResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showWrongHandAlert, setShowWrongHandAlert] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const guideAnim = useRef(new Animated.Value(0)).current;
  const previewAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Analytics - Screen View
  useScreenView('PalmCapture', {
    screen_category: 'chiromancy',
    hand_type: handType === 'leftHand' ? 'left' : 'right',
  });

  // Analytics - Track screen view on mount
  useEffect(() => {
    const hand = handType === 'leftHand' ? 'left' : 'right';
    trackPalmCaptureView(hand as 'left' | 'right');
    firebaseService.logScreenView('PalmCapture', 'PalmCaptureScreen');
  }, [handType]);

  useEffect(() => {
    // Animate in on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(guideAnim, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Start pulse animation for capture button
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    
    return () => pulse.stop();
  }, [fadeAnim, slideAnim, guideAnim, pulseAnim]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCapture = useCallback(async () => {
    const result = await launchCamera({
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.9,
    });
    
    if (result) {
      const hand = handType === 'leftHand' ? 'left' : 'right';
      trackPalmCaptureImage(hand as 'left' | 'right');
      setCapturedImage(result);
      setShowPreview(true);
      
      // Animate preview in
      Animated.timing(previewAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [previewAnim, handType]);

  const handleRetake = useCallback(() => {
    // Animate preview out
    Animated.timing(previewAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCapturedImage(null);
      setShowPreview(false);
    });
  }, [previewAnim]);

  const handleConfirm = useCallback(() => {
    if (capturedImage) {
      const hand = handType === 'leftHand' ? 'left' : 'right';
      trackPalmAnalysisStart(hand as 'left' | 'right');
      // Replace current screen with Chat so going back skips PalmCaptureScreen
      navigation.replace('Chat', {
        source: 'palm',
        imageUri: capturedImage.uri,
        handType: handType,
      });
    }
  }, [capturedImage, navigation, handType]);

  const handleWrongHand = useCallback(() => {
    setShowWrongHandAlert(true);
  }, []);

  const handleWrongHandAlertDismiss = useCallback(() => {
    setShowWrongHandAlert(false);
  }, []);

  const handLabel = handType === 'leftHand' ? 'Left' : 'Right';

  return (
    <View style={styles.container}>
      <ImageBackground
        source={BackgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover">
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <Animated.View style={[styles.contentWrapper, {opacity: fadeAnim}]}>
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            {/* Header */}
            <Animated.View 
              style={[
                styles.header, 
                {transform: [{translateY: slideAnim}]}
              ]}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}>
                <CrossIcon width={moderateScale(40)} height={moderateScale(40)} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Capture {handLabel} Palm</Text>
              <View style={styles.headerSpacer} />
            </Animated.View>

            {/* Main Content */}
            <View style={styles.content}>
              {!showPreview ? (
                <>
                  {/* Instructions */}
                  <Animated.View 
                    style={[
                      styles.instructionsContainer,
                      {
                        opacity: guideAnim,
                        transform: [{translateY: Animated.multiply(guideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }), 1)}],
                      }
                    ]}>
                    <Text style={styles.instructionsTitle}>Position Your {handLabel} Hand</Text>
                    <Text style={styles.instructionsText}>
                      {handType === 'leftHand' 
                        ? 'Place your LEFT palm facing the camera with thumb on the LEFT side'
                        : 'Place your RIGHT palm facing the camera with thumb on the RIGHT side'}
                    </Text>
                  </Animated.View>

                  {/* Hand Guide */}
                  <HandGuide handType={handType} animValue={guideAnim} />

                  {/* Tips */}
                  <Animated.View style={[styles.tipsContainer, {opacity: guideAnim}]}>
                    <View style={styles.tipItem}>
                      <View style={styles.tipDot} />
                      <Text style={styles.tipText}>Good lighting is essential</Text>
                    </View>
                    <View style={styles.tipItem}>
                      <View style={styles.tipDot} />
                      <Text style={styles.tipText}>Keep your fingers spread apart</Text>
                    </View>
                    <View style={styles.tipItem}>
                      <View style={styles.tipDot} />
                      <Text style={styles.tipText}>Hold steady for a clear image</Text>
                    </View>
                  </Animated.View>

                  {/* Capture Button */}
                  <Animated.View 
                    style={[
                      styles.captureButtonContainer,
                      {
                        opacity: guideAnim,
                        transform: [{scale: pulseAnim}],
                      }
                    ]}>
                    <TouchableOpacity 
                      style={styles.captureButton}
                      onPress={handleCapture}
                      activeOpacity={0.7}>
                      {/* <CameraIcon width={moderateScale(32)} height={moderateScale(32)} /> */}
                      <Text style={styles.captureButtonText}>Capture Palm</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </>
              ) : (
                // Preview captured image
                capturedImage && (
                  <CapturePreview
                    imageUri={capturedImage.uri}
                    handType={handType}
                    onConfirm={handleConfirm}
                    onRetake={handleRetake}
                    animValue={previewAnim}
                    onWrongHand={handleWrongHand}
                  />
                )
              )}
            </View>
          </SafeAreaView>
        </Animated.View>

        {/* Wrong Hand Alert */}
        <CustomAlert
          visible={showWrongHandAlert}
          type="warning"
          title="Wrong Hand Detected"
          message={`Please capture your ${handType === 'leftHand' ? 'LEFT' : 'RIGHT'} palm. The thumb should be on the ${handType === 'leftHand' ? 'left side' : 'right side'} of the image when your palm is facing the camera.`}
          buttons={[
            {
              text: 'Retake Photo',
              style: 'primary',
              onPress: handleRetake,
            },
          ]}
          onDismiss={handleWrongHandAlertDismiss}
        />
      </ImageBackground>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  contentWrapper: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
  },
  closeButton: {
    // width: moderateScale(44),
    // height: moderateScale(44),
    // borderRadius: moderateScale(22),
    // backgroundColor: 'rgba(194, 209, 243, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(20),
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: moderateScale(20),
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
  },
  instructionsContainer: {
    alignItems: 'center',
    marginTop: verticalScale(10),
  },
  instructionsTitle: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(24),
    color: 'rgba(221, 197, 96, 1)',
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  instructionsText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(14),
    color: 'rgba(194, 209, 243, 0.8)',
    textAlign: 'center',
    lineHeight: fontScale(20),
    paddingHorizontal: horizontalScale(20),
  },
  handGuideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(25),
    marginBottom: verticalScale(15),
  },
  outerGlowRing: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.9,
    borderRadius: radiusScale(20),
    borderWidth: 1,
    borderColor: 'rgba(221, 197, 96, 0.08)',
    backgroundColor: 'rgba(221, 197, 96, 0.01)',
  },
  scanFrame: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.15)',
    borderRadius: radiusScale(16),
    backgroundColor: 'rgba(10, 22, 40, 0.4)',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: moderateScale(20),
    right: moderateScale(20),
    height: 2,
    backgroundColor: 'rgba(221, 197, 96, 0.7)',
    borderRadius: 1,
    shadowColor: 'rgba(221, 197, 96, 1)',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 12,
    zIndex: 10,
  },
  // Corner brackets
  cornerBracket: {
    position: 'absolute',
    width: moderateScale(35),
    height: moderateScale(35),
  },
  cornerTopLeft: {
    top: moderateScale(12),
    left: moderateScale(12),
  },
  cornerTopRight: {
    top: moderateScale(12),
    right: moderateScale(12),
  },
  cornerBottomLeft: {
    bottom: moderateScale(12),
    left: moderateScale(12),
  },
  cornerBottomRight: {
    bottom: moderateScale(12),
    right: moderateScale(12),
  },
  bracketHorizontal: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: moderateScale(20),
    height: 2,
    backgroundColor: 'rgba(221, 197, 96, 0.7)',
    borderRadius: 1,
  },
  bracketHRight: {
    left: undefined,
    right: 0,
  },
  bracketVertical: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 2,
    height: moderateScale(20),
    backgroundColor: 'rgba(221, 197, 96, 0.7)',
    borderRadius: 1,
  },
  bracketVRight: {
    left: undefined,
    right: 0,
  },
  bracketVBottom: {
    top: undefined,
    bottom: 0,
  },
  bracketHBottom: {
    top: undefined,
    bottom: 0,
  },
  // Center content
  frameCenterContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(40),
    position: 'relative',
  },
  // Lottie animation
  lottieAnimation: {
    width: moderateScale(250),
    height: moderateScale(250),
  },
  // Guide text
  guideTextContainer: {
    alignItems: 'center',
    marginTop: verticalScale(10),
  },
  guideMainText: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(22),
    color: 'rgba(221, 197, 96, 0.9)',
    letterSpacing: 4,
  },
  guideDivider: {
    width: moderateScale(40),
    height: 1,
    backgroundColor: 'rgba(221, 197, 96, 0.3)',
    marginVertical: verticalScale(8),
  },
  guideSubText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(10),
    color: 'rgba(194, 209, 243, 0.6)',
    letterSpacing: 3,
  },
  // Thumb indicator
  thumbIndicatorContainer: {
    position: 'absolute',
    bottom: moderateScale(55),
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(6),
  },
  thumbIndicatorLeft: {
    left: moderateScale(20),
    flexDirection: 'row',
  },
  thumbIndicatorRight: {
    right: moderateScale(20),
    flexDirection: 'row-reverse',
  },
  thumbIndicatorDot: {
    width: moderateScale(5),
    height: moderateScale(5),
    borderRadius: moderateScale(2.5),
    backgroundColor: 'rgba(221, 197, 96, 0.7)',
  },
  thumbIndicatorLine: {
    width: moderateScale(20),
    height: 1,
    backgroundColor: 'rgba(221, 197, 96, 0.4)',
  },
  thumbIndicatorLabel: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(8),
    color: 'rgba(221, 197, 96, 0.7)',
    letterSpacing: 2,
  },
  tipsContainer: {
    marginTop: verticalScale(30),
    paddingHorizontal: horizontalScale(5),
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  tipDot: {
    width: moderateScale(7),
    height: moderateScale(7),
    borderRadius: moderateScale(100),
    backgroundColor: 'rgba(221, 197, 96, 0.6)',
    marginRight: horizontalScale(10),
  },
  tipText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(15),
    color: 'rgba(194, 209, 243, 0.7)',
  },
  captureButtonContainer: {
    position: 'absolute',
    bottom: verticalScale(30),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(221, 197, 96, 0.36)',
    borderRadius: radiusScale(30),
    borderWidth: 1,
    borderColor: 'rgba(221, 197, 96, 1)',
    paddingVertical: verticalScale(17),
    paddingHorizontal: horizontalScale(40),
    gap: horizontalScale(12),
  },
  captureButtonText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(14),
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Preview styles
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: verticalScale(20),
  },
  previewImageContainer: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.85,
    borderRadius: radiusScale(24),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(221, 197, 96, 0.5)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewBadge: {
    position: 'absolute',
    top: verticalScale(12),
    right: horizontalScale(12),
    backgroundColor: 'rgba(221, 197, 96, 0.9)',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: radiusScale(16),
  },
  previewBadgeText: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(12),
    color: '#0A1628',
    fontWeight: '600',
  },
  confirmTitle: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(26),
    color: 'rgba(221, 197, 96, 1)',
    marginTop: verticalScale(24),
    textAlign: 'center',
  },
  confirmSubtitle: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(15),
    color: 'rgba(194, 209, 243, 0.7)',
    marginTop: verticalScale(12),
    textAlign: 'center',
  },
  confirmButtonsContainer: {
    flexDirection: 'row',
    marginTop: verticalScale(30),
    gap: horizontalScale(16),
  },
  confirmButton: {
    borderRadius: radiusScale(24),
    overflow: 'hidden',
  },
  retakeButton: {
    backgroundColor: 'rgba(194, 209, 243, 0.15)',
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(28),
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.3)',
  },
  retakeButtonText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(14),
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  yesButton: {
    backgroundColor: 'rgba(221, 197, 96, 0.36)',
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(28),
    borderWidth: 1,
    borderColor: 'rgba(221, 197, 96, 1)',
  },
  yesButtonText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(14),
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  wrongHandButton: {
    marginTop: verticalScale(20),
    paddingVertical: verticalScale(10),
  },
  wrongHandButtonText: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(15),
    color: 'rgba(239, 68, 68, 0.8)',
    textDecorationLine: 'underline',
  },
});

export default PalmCaptureScreen;
