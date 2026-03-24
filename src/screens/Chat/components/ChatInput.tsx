import React, {memo, useState, useCallback, useRef} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  Animated,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
  moderateScale,
} from '../../../theme';

// Icons
import GalleryIcon from '../../../assets/icons/chat_icons/gallery.svg';
import SendIcon from '../../../assets/icons/chat_icons/send.svg';
import CrossIcon from '../../../assets/icons/home_icons/cross.svg';

interface AttachedImage {
  uri: string;
  type?: string;
  fileName?: string;
}

interface ChatInputProps {
  onSendMessage: (text: string, imageUri?: string) => void;
  onCameraPress: () => void;
  onGalleryPress: () => void;
  attachedImage?: AttachedImage | null;
  onRemoveImage?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = memo(
  ({
    onSendMessage,
    onCameraPress: _onCameraPress,
    onGalleryPress,
    attachedImage,
    onRemoveImage,
    placeholder = 'Ask the whoop...',
    disabled = false,
  }) => {
    const [message, setMessage] = useState('');
    const inputRef = useRef<TextInput>(null);
    const scaleAnim = useRef(new Animated.Value(0)).current;

    // Animate image preview
    React.useEffect(() => {
      Animated.spring(scaleAnim, {
        toValue: attachedImage ? 1 : 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }, [attachedImage, scaleAnim]);

    const handleSend = useCallback(() => {
      const trimmedMessage = message.trim();
      const hasMessage = trimmedMessage.length > 0;
      const hasImage = !!attachedImage;

      if (hasMessage || hasImage) {
        onSendMessage(trimmedMessage, attachedImage?.uri);
        setMessage('');
        Keyboard.dismiss();
      }
    }, [message, attachedImage, onSendMessage]);

    const handleGalleryPress = useCallback(() => {
      onGalleryPress();
    }, [onGalleryPress]);

    const handleRemoveImage = useCallback(() => {
      if (onRemoveImage) {
        onRemoveImage();
      }
    }, [onRemoveImage]);

    const canSend = (message.trim().length > 0 || !!attachedImage) && !disabled;

    return (
      <View style={styles.container}>
        {/* Image Preview */}
        {attachedImage && (
          <Animated.View
            style={[
              styles.imagePreviewContainer,
              {
                opacity: scaleAnim,
                transform: [
                  {
                    scale: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.imagePreviewWrapper}>
              <FastImage
                source={{uri: attachedImage.uri}}
                style={styles.previewImage}
                resizeMode={FastImage.resizeMode.cover}
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={handleRemoveImage}
                activeOpacity={0.7}>
                <CrossIcon width={moderateScale(16)} height={moderateScale(16)} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        <View style={styles.inputWrapper}>
          {/* Gallery/Camera Button */}
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={handleGalleryPress}
            activeOpacity={0.7}
            disabled={disabled}>
            <GalleryIcon
              width={moderateScale(40)}
              height={moderateScale(40)}
            />
          </TouchableOpacity>

          {/* Text Input */}
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder={attachedImage ? 'Add a caption...' : placeholder}
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            multiline
            maxLength={1000}
            editable={!disabled}
            returnKeyType="default"
            blurOnSubmit={false}
          />

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.sendButton, canSend && styles.sendButtonActive]}
            onPress={handleSend}
            activeOpacity={0.7}
            disabled={!canSend}>
            <SendIcon
              width={moderateScale(40)}
              height={moderateScale(40)}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

ChatInput.displayName = 'ChatInput';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(8),
    paddingBottom: Platform.OS === 'ios' ? verticalScale(8) : verticalScale(12),
  },
  imagePreviewContainer: {
    marginBottom: verticalScale(10),
  },
  imagePreviewWrapper: {
    alignSelf: 'flex-start',
    position: 'relative',
  },
  previewImage: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: radiusScale(12),
    borderWidth: 2,
    borderColor: 'rgba(125, 211, 252, 0.5)',
  },
  removeImageButton: {
    position: 'absolute',
    top: -moderateScale(8),
    right: -moderateScale(8),
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(194, 209, 243, 0.04)',
    borderRadius: radiusScale(16),
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    paddingHorizontal: horizontalScale(13),
    paddingVertical: verticalScale(13),
    minHeight: moderateScale(48),
  },
  mediaButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    // backgroundColor: 'rgba(194, 209, 243, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: horizontalScale(8),
  },
  input: {
    flex: 1,
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(17),
    color: '#FFFFFF',
    maxHeight: verticalScale(100),
    paddingVertical: Platform.OS === 'ios' ? verticalScale(8) : verticalScale(4),
    paddingHorizontal: horizontalScale(4),
    // backgroundColor:'red'
  },
  sendButton: {
    // width: moderateScale(36),
    // height: moderateScale(36),
    // borderRadius: moderateScale(18),
    // backgroundColor: 'rgba(125, 211, 252, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: horizontalScale(8),
  },
  sendButtonActive: {
    // backgroundColor: 'rgba(125, 211, 252, 0.6)',
  },
});

export default ChatInput;
