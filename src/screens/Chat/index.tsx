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
import {useRoute, RouteProp} from '@react-navigation/native';
import {
  verticalScale,
  horizontalScale,
  moderateScale,
  Colors,
} from '../../theme';

// Components
import {ChatHeader, MessageBubble, ChatInput, ImagePreviewModal, TypingIndicator, PalmLineTabs} from './components';

// Icons
const ArrowDownIcon = require('../../assets/icons/chat_icons/arrow.png');

// Data
import {
  ChatMessage,
  createUserMessage,
  createAIMessage,
  createPalmReadingMessage,
} from './chatMockData';

// Chat AI Service
import {
  chatConversationService,
  OracleChatMessage,
} from '../../services/ChatConversationService';

// Utils
import {
  launchCamera,
  launchImageLibrary,
  showImagePickerOptions,
  ImagePickerResult,
} from '../../utils/imagePicker';

// Analytics
import {useScreenView} from '../../hooks/useFacebookAnalytics';
import firebaseService from '../../services/firebase/FirebaseService';
import {
  trackChatView,
  trackChatMessageSend,
} from '../../utils/mainScreenAnalytics';
import CosmicAlert from '../../components/CosmicAlert';

// Palm diagram assets
const LeftHandDiagram = require('../../assets/icons/chat_icons/left_hand.png');
const RightHandDiagram = require('../../assets/icons/chat_icons/right_hand.png');

type ChatRouteParams = {
  Chat: {
    source?: 'palm' | 'love';
    imageUri?: string;
    handType?: 'leftHand' | 'rightHand';
    yourSign?: string;
    theirSign?: string;
    loveMatchSummary?: string;
  };
};

type Props = NativeStackScreenProps<any, 'Chat'>;

// Scroll threshold to show/hide scroll button
const SCROLL_THRESHOLD = 200;

interface AttachedImage {
  uri: string;
  type?: string;
  fileName?: string;
}

const ChatScreen: React.FC<Props> = () => {
  // Get route params
  const route = useRoute<RouteProp<ChatRouteParams, 'Chat'>>();
  const {source, imageUri, handType, yourSign, theirSign, loveMatchSummary} = route.params || {};
  
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const [hasHandledInitialMessage, setHasHandledInitialMessage] = useState(false);
  const [showQuotaAlert, setShowQuotaAlert] = useState(false);

  // Conversation history for API (system + user + assistant)
  const conversationRef = useRef<OracleChatMessage[]>([]);
  
  // Refs
  const flatListRef = useRef<FlatList>(null);
  const isKeyboardVisible = useRef(false);
  const isInitialLoad = useRef(true);
  const scrollButtonAnim = useRef(new Animated.Value(0)).current;
  const contentHeight = useRef(0);
  const scrollOffset = useRef(0);
  const layoutHeight = useRef(0);

  // Initialize conversation with system prompt + welcome message
  useEffect(() => {
    const systemPrompt = chatConversationService.buildSystemPrompt(source, yourSign, theirSign, handType);
    conversationRef.current = [{role: 'system', content: systemPrompt}];

    // Determine welcome message based on source
    let welcomeText: string;
    if (source === 'palm' && handType) {
      welcomeText = chatConversationService.getPalmWelcomeMessage(handType);
    } else if (source === 'love' && yourSign && theirSign) {
      welcomeText = chatConversationService.getLoveWelcomeMessage(yourSign, theirSign);
    } else {
      welcomeText = chatConversationService.getWelcomeMessage();
    }

    const welcomeMsg = createAIMessage(welcomeText);
    setMessages([welcomeMsg]);

    // Add to conversation history
    conversationRef.current.push({role: 'assistant', content: welcomeText});

    setTimeout(() => {
      isInitialLoad.current = false;
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Analytics - Screen View
  useScreenView('Chat', {
    screen_category: 'main',
    source: source || 'direct',
  });

  // Analytics - Track screen view on mount
  useEffect(() => {
    trackChatView();
    firebaseService.logScreenView('Chat', 'ChatScreen');
  }, []);

  // Handle initial message from Palm Capture or Love Match
  useEffect(() => {
    if (hasHandledInitialMessage) return;
    
    if (source === 'palm' && imageUri && handType) {
      // Send palm reading request with image — validate hand first
      const handLabel = handType === 'leftHand' ? 'left' : 'right';
      const message = `I've just scanned my ${handLabel} palm. Can you give me a detailed reading based on this image?`;
      
      setTimeout(async () => {
        const userMessage = createUserMessage(message, imageUri);
        setMessages(prev => [...prev, userMessage]);
        setHasHandledInitialMessage(true);
        flatListRef.current?.scrollToEnd({animated: true});

        // Step 1: Validate the hand image before reading
        setIsTyping(true);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({animated: true});
        }, 100);

        try {
          const validation = await chatConversationService.validateHandImage(imageUri, handType);

          if (!validation.isHand || (validation.detectedHand !== 'unknown' && validation.detectedHand !== handLabel)) {
            // Validation failed — show rejection message, don't do reading
            setIsTyping(false);
            const rejectMsg = createAIMessage(
              validation.message || `Please share a clear photo of your ${handLabel} palm for an accurate reading.`,
            );
            setMessages(prev => [...prev, rejectMsg]);
            conversationRef.current.push({role: 'assistant', content: rejectMsg.content || ''});
            return;
          }

          // Step 2: Validation passed — proceed with reading (include hand diagram in response)
          setIsTyping(false);
          const diagram = handType === 'leftHand' ? LeftHandDiagram : RightHandDiagram;
          sendToOracle(message, imageUri, diagram);
        } catch {
          // If validation errors out, proceed with reading anyway
          setIsTyping(false);
          const diagram = handType === 'leftHand' ? LeftHandDiagram : RightHandDiagram;
          sendToOracle(message, imageUri, diagram);
        }
      }, 500);
    } else if (source === 'love' && yourSign && theirSign) {
      // Send love compatibility request with the summary data as user's first message
      const message = loveMatchSummary
        ? `Here are my love compatibility results:\n\n${loveMatchSummary}\n\nCan you give me deeper insight into our compatibility?`
        : `My sign is ${yourSign} and my partner's sign is ${theirSign}. Can you tell me about our love compatibility?`;
      
      setTimeout(() => {
        const userMessage = createUserMessage(message);
        setMessages(prev => [...prev, userMessage]);
        setHasHandledInitialMessage(true);
        flatListRef.current?.scrollToEnd({animated: true});
        
        // Send to AI
        sendToOracle(message);
      }, 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, imageUri, handType, yourSign, theirSign, hasHandledInitialMessage]);

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

  // Add new message to UI
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

  // Send a message to the Oracle API
  const sendToOracle = useCallback(
    async (text: string, imgUri?: string, palmDiagram?: number) => {
      // Add user message to conversation history
      conversationRef.current.push({role: 'user', content: text});

      setIsTyping(true);
      // Scroll to show typing indicator
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
      try {
        const reply = await chatConversationService.sendMessage(
          conversationRef.current,
          imgUri,
        );

        // Add assistant reply to conversation history
        conversationRef.current.push({role: 'assistant', content: reply});

        // Add to UI — if palmDiagram is provided, show hand diagram above the reading
        const aiMessage = palmDiagram
          ? createPalmReadingMessage(palmDiagram, reply)
          : createAIMessage(reply);
        addMessage(aiMessage);
      } catch (error: any) {
        console.error('❌ [Chat] Oracle error:', error.message);
        const msg = (error?.message || '').toLowerCase();
        const code = error?.response?.data?.error?.code || '';
        const status = error?.response?.status;
        const isQuota = status === 429 || msg.includes('429') || msg.includes('quota') || code === 'insufficient_quota';
        if (isQuota) {
          setShowQuotaAlert(true);
        }
        const errorMsg = createAIMessage(
          isQuota
            ? 'The cosmic channels are temporarily overloaded ✨ Please try again in a moment.'
            : 'The cosmic connection flickered for a moment ✨ Please try sending your message again.',
        );
        addMessage(errorMsg);
      } finally {
        setIsTyping(false);
      }
    },
    [addMessage],
  );

  // Send text message (with optional image)
  const handleSendMessage = useCallback(
    async (text: string, attachedImageUri?: string) => {
      trackChatMessageSend(text.length);
      const userMessage = createUserMessage(text, attachedImageUri);
      addMessage(userMessage);

      // Clear attached image immediately so preview disappears right away
      setAttachedImage(null);

      if (attachedImageUri && source === 'palm' && handType) {
        // User is in a palm reading session and sent a new image (from camera/gallery)
        // Validate it against the expected hand — same behavior as initial flow
        setIsTyping(true);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({animated: true});
        }, 100);

        try {
          const validation = await chatConversationService.validateHandImage(attachedImageUri, handType);
          const handLabel = handType === 'leftHand' ? 'left' : 'right';

          if (!validation.isHand || (validation.detectedHand !== 'unknown' && validation.detectedHand !== handLabel)) {
            // Wrong hand or not a hand — reject
            setIsTyping(false);
            const rejectMsg = createAIMessage(
              validation.message || `Please share a clear photo of your ${handLabel} palm for an accurate reading.`,
            );
            setMessages(prev => [...prev, rejectMsg]);
            conversationRef.current.push({role: 'assistant', content: rejectMsg.content || ''});
            return;
          }

          // Correct hand — proceed with reading (include hand diagram in response)
          setIsTyping(false);
          const diagram = handType === 'leftHand' ? LeftHandDiagram : RightHandDiagram;
          sendToOracle(text, attachedImageUri, diagram);
        } catch {
          setIsTyping(false);
          const diagram = handType === 'leftHand' ? LeftHandDiagram : RightHandDiagram;
          sendToOracle(text, attachedImageUri, diagram);
        }
      } else if (attachedImageUri && source !== 'palm') {
        // User attached an image in general/love chat — detect if it's a palm
        setIsTyping(true);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({animated: true});
        }, 100);

        try {
          const detection = await chatConversationService.detectPalmInChatImage(attachedImageUri);
          if (detection.isPalm && detection.detectedHand !== 'unknown') {
            // Prepend palm context so the AI knows which hand
            const augmented = `[Palm image detected: ${detection.detectedHand.toUpperCase()} hand]\n\n${text}`;
            setIsTyping(false);
            const diagram = detection.detectedHand === 'left' ? LeftHandDiagram : RightHandDiagram;
            sendToOracle(augmented, attachedImageUri, diagram);
          } else if (detection.isPalm) {
            // It's a palm but hand unknown — let AI figure it out
            const augmented = `[Palm image detected — hand could not be determined]\n\n${text}`;
            setIsTyping(false);
            sendToOracle(augmented, attachedImageUri);
          } else {
            // Not a palm — send normally
            setIsTyping(false);
            sendToOracle(text, attachedImageUri);
          }
        } catch {
          // Detection failed — just send normally
          setIsTyping(false);
          sendToOracle(text, attachedImageUri);
        }
      } else {
        sendToOracle(text, attachedImageUri);
      }
    },
    [addMessage, sendToOracle, source, handType],
  );

  // Handle palm line tab press — ask Oracle about a specific line
  const handlePalmLinePress = useCallback(
    (lineName: string) => {
      const handLabel = handType === 'leftHand' ? 'left' : 'right';
      const text = `Tell me about my ${lineName} on my ${handLabel} palm.`;
      const userMessage = createUserMessage(text);
      addMessage(userMessage);
      sendToOracle(text, imageUri);
    },
    [addMessage, sendToOracle, handType, imageUri],
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

  // Quick reply press handler (reserved for future use)
  // const handleQuickReplyPress = useCallback(
  //   (reply: QuickReply) => {
  //     trackChatQuickReplyTap(reply.label);
  //     const messageText = `Tell me about my ${reply.label}`;
  //     handleSendMessage(messageText);
  //   },
  //   [handleSendMessage],
  // );

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

  // Memoized quick replies (reserved for future use)
  // const quickReplies = useMemo(() => DEFAULT_QUICK_REPLIES, []);

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
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

          {/* Header */}
          <ChatHeader
            title={
              source === 'palm'
                ? 'Palm Reader'
                : source === 'love'
                ? 'Love Oracle'
                : 'Cosmic Oracle'
            }
            subtitle={
              source === 'palm'
                ? 'AI PALMISTRY'
                : source === 'love'
                ? 'AI COMPATIBILITY'
                : 'AI ASTROLOGER'
            }
          />

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
                ListFooterComponent={isTyping ? <TypingIndicator /> : null}
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
              {source === 'palm' && (
                <PalmLineTabs
                  onLinePress={handlePalmLinePress}
                  disabled={isTyping}
                />
              )}
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

      {/* Image Preview Modal */}
      <ImagePreviewModal
        visible={isImageModalVisible}
        imageUrl={previewImage}
        onClose={handleCloseImageModal}
      />

      {/* Quota Error Alert */}
      <CosmicAlert
        visible={showQuotaAlert}
        title="Cosmic Channels Busy"
        message="The oracle is receiving too many cosmic transmissions right now. Please try again in a moment."
        buttonText="Got It"
        onDismiss={() => setShowQuotaAlert(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundFallback: {
    flex: 1,
    backgroundColor: Colors.new_background,
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
    backgroundColor: Colors.new_background,
  },
});

export default ChatScreen;
