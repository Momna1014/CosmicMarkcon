import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ImageBackground,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ListRenderItem,
  TouchableOpacity,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  verticalScale,
  horizontalScale,
  moderateScale,
} from '../../theme';

// Components
import {ChatHeader, MessageBubble, QuickReplyChips, ChatInput, ImagePreviewModal} from './components';

// Icons
const ArrowDownIcon = require('../../assets/icons/chat_icons/arrow.png');

// Data
import {
  ChatMessage,
  QuickReply,
  MOCK_MESSAGES,
  DEFAULT_QUICK_REPLIES,
  createUserMessage,
  createAIResponse,
} from './chatMockData';

// Utils
import {
  launchCamera,
  launchImageLibrary,
  showImagePickerOptions,
  ImagePickerResult,
} from '../../utils/imagePicker';

const BackgroundImage = require('../../assets/icons/bottomtab_icons/main_screen_background.png');

type Props = NativeStackScreenProps<any, 'Chat'>;

// Scroll threshold to show/hide scroll button
const SCROLL_THRESHOLD = 200;

interface AttachedImage {
  uri: string;
  type?: string;
  fileName?: string;
}

const ChatScreen: React.FC<Props> = () => {
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  
  // Refs
  const flatListRef = useRef<FlatList>(null);
  const isKeyboardVisible = useRef(false);
  const isInitialLoad = useRef(true);
  const scrollButtonAnim = useRef(new Animated.Value(0)).current;
  const contentHeight = useRef(0);
  const scrollOffset = useRef(0);
  const layoutHeight = useRef(0);

  // Load mock messages on mount
  useEffect(() => {
    setMessages(MOCK_MESSAGES);
    // Scroll to bottom after initial load
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({animated: false});
      isInitialLoad.current = false;
    }, 100);
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      isKeyboardVisible.current = true;
      // Only scroll to bottom when keyboard shows
      flatListRef.current?.scrollToEnd({animated: true});
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      isKeyboardVisible.current = false;
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Animate scroll button
  useEffect(() => {
    Animated.spring(scrollButtonAnim, {
      toValue: showScrollButton ? 1 : 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [showScrollButton, scrollButtonAnim]);

  // Handle scroll events
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
      
      scrollOffset.current = contentOffset.y;
      contentHeight.current = contentSize.height;
      layoutHeight.current = layoutMeasurement.height;
      
      // Calculate distance from bottom
      const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
      
      // Show scroll button if scrolled up beyond threshold
      setShowScrollButton(distanceFromBottom > SCROLL_THRESHOLD);
    },
    [],
  );

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({animated: true});
  }, []);

  // Add new message
  const addMessage = useCallback(
    (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      // Scroll to bottom when adding new message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    },
    [],
  );

  // Simulate AI typing and response
  const simulateAIResponse = useCallback(
    (userMessage: ChatMessage) => {
      setIsTyping(true);
      
      setTimeout(() => {
        const aiResponse = createAIResponse(userMessage);
        addMessage(aiResponse);
        setIsTyping(false);
      }, 1500 + Math.random() * 1000);
    },
    [addMessage],
  );

  // Send text message (with optional image)
  const handleSendMessage = useCallback(
    (text: string, imageUri?: string) => {
      const userMessage = createUserMessage(text, imageUri);
      addMessage(userMessage);
      simulateAIResponse(userMessage);
      // Clear attached image after sending
      setAttachedImage(null);
    },
    [addMessage, simulateAIResponse],
  );

  // Attach image (from picker) - doesn't send immediately
  const handleAttachImage = useCallback(
    (imageResult: ImagePickerResult) => {
      setAttachedImage({
        uri: imageResult.uri,
        type: imageResult.type,
        fileName: imageResult.fileName,
      });
    },
    [],
  );

  // Remove attached image
  const handleRemoveImage = useCallback(() => {
    setAttachedImage(null);
  }, []);

  // Camera press handler
  const handleCameraPress = useCallback(async () => {
    const result = await launchCamera();
    if (result) {
      handleAttachImage(result);
    }
  }, [handleAttachImage]);

  // Gallery press handler
  const handleGalleryPress = useCallback(() => {
    showImagePickerOptions(
      async () => {
        const result = await launchCamera();
        if (result) {
          handleAttachImage(result);
        }
      },
      async () => {
        const result = await launchImageLibrary();
        if (result) {
          handleAttachImage(result);
        }
      },
    );
  }, [handleAttachImage]);

  // Quick reply press handler
  const handleQuickReplyPress = useCallback(
    (reply: QuickReply) => {
      const messageText = `Tell me about my ${reply.label}`;
      handleSendMessage(messageText);
    },
    [handleSendMessage],
  );

  // Image press handler - opens modal
  const handleImagePress = useCallback((imageUrl: string) => {
    setPreviewImage(imageUrl);
    setIsImageModalVisible(true);
  }, []);

  // Close image modal
  const handleCloseImageModal = useCallback(() => {
    setIsImageModalVisible(false);
    setTimeout(() => {
      setPreviewImage(null);
    }, 200);
  }, []);

  // Render message item
  const renderMessage: ListRenderItem<ChatMessage> = useCallback(
    ({item}) => (
      <MessageBubble
        message={item}
        onImagePress={handleImagePress}
      />
    ),
    [handleImagePress],
  );

  // Key extractor
  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  // Memoized quick replies
  const quickReplies = useMemo(() => DEFAULT_QUICK_REPLIES, []);

  // Scroll button animation styles
  const scrollButtonStyle = useMemo(
    () => ({
      opacity: scrollButtonAnim,
      transform: [
        {
          scale: scrollButtonAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1],
          }),
        },
        {
          translateY: scrollButtonAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }),
        },
      ],
    }),
    [scrollButtonAnim],
  );

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
          <ChatHeader title="Palm Reader" subtitle="AI READER" />

          {/* Keyboard Avoiding View */}
          <KeyboardAvoidingView
            style={styles.keyboardAvoid}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
            
            {/* Messages List Container */}
            <View style={styles.messagesContainer}>
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={keyExtractor}
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                inverted={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                removeClippedSubviews={Platform.OS === 'android'}
                maxToRenderPerBatch={15}
                windowSize={10}
                initialNumToRender={20}
                maintainVisibleContentPosition={{
                  minIndexForVisible: 0,
                  autoscrollToTopThreshold: 10,
                }}
              />
              
              {/* Scroll to Bottom Button */}
              <Animated.View style={[styles.scrollButtonContainer, scrollButtonStyle]}>
                <TouchableOpacity
                  style={styles.scrollButton}
                  onPress={scrollToBottom}
                  activeOpacity={0.8}>
                  <Image
                    source={ArrowDownIcon}
                    style={styles.scrollArrowImage}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Quick Reply Chips */}
            {/* <QuickReplyChips
              replies={quickReplies}
              onReplyPress={handleQuickReplyPress}
            /> */}

            {/* Input Area */}
            <SafeAreaView edges={['bottom']} style={styles.inputSafeArea}>
              <ChatInput
                onSendMessage={handleSendMessage}
                onCameraPress={handleCameraPress}
                onGalleryPress={handleGalleryPress}
                attachedImage={attachedImage}
                onRemoveImage={handleRemoveImage}
                disabled={isTyping}
              />
            </SafeAreaView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        visible={isImageModalVisible}
        imageUrl={previewImage}
        onClose={handleCloseImageModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundFallback: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    position: 'relative',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: verticalScale(12),
  },
  scrollButtonContainer: {
    position: 'absolute',
    bottom: verticalScale(12),
    right: horizontalScale(16),
    zIndex: 10,
  },
  scrollButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: 'rgba(221, 196, 96, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollArrowImage: {
    width: moderateScale(20),
    height: moderateScale(20),
    tintColor: '#FFFFFF',
  },
  inputSafeArea: {
    backgroundColor: 'rgba(10, 22, 40, 0.8)',
  },
});

export default ChatScreen;
