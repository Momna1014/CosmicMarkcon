import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import {
  Colors,
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';
import CrossIcon from '../../assets/icons/svgicons/HomeSvgIcons/cross.svg';

interface EnterNameModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  isLoading?: boolean;
}

const EnterNameModal: React.FC<EnterNameModalProps> = memo(({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const inputRef = useRef<TextInput>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setName('');
    }
  }, [visible]);

  const handleSubmit = useCallback(() => {
    const trimmedName = name.trim();
    if (trimmedName.length > 0) {
      onSubmit(trimmedName);
    }
  }, [name, onSubmit]);

  const isSubmitDisabled = name.trim().length === 0 || isLoading;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Glass Background */}
        {Platform.OS === 'ios' ? (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={20}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.8)"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidBlur]} />
        )}

        {/* Centered Content */}
        <View style={styles.centeredContainer}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Enter Your Name</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={isLoading}
              >
                <CrossIcon width={moderateScale(40)} height={moderateScale(40)} />
              </TouchableOpacity>
            </View>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              This name will be displayed with your reviews
            </Text>

            {/* Input Field */}
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={Colors.inactive}
              value={name}
              onChangeText={setName}
              maxLength={50}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              editable={!isLoading}
              autoCapitalize="words"
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitDisabled && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={isSubmitDisabled}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.black} />
              ) : (
                <Text style={styles.submitButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

EnterNameModal.displayName = 'EnterNameModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  androidBlur: {
    backgroundColor: 'rgba(0, 0, 0, 0.93)',
  },
  centeredContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    backgroundColor: Colors.cardBackground,
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  title: {
    fontFamily: FontFamilies.jetBrainsMonoExtraBold,
    fontSize: moderateScale(20),
    fontWeight: '800',
    color: Colors.text,
  },
  closeButton: {
    marginRight: moderateScale(-8),
  },
  subtitle: {
    fontFamily: FontFamilies.sfProDisplayRegular,
    fontSize: moderateScale(14),
    color: Colors.inactive,
    marginBottom: verticalScale(20),
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(14),
    fontFamily: FontFamilies.sfProDisplayMedium,
    fontSize: moderateScale(16),
    color: Colors.text,
    borderWidth: 1,
    borderColor: '#2A2A2C',
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(20),
  },
  submitButton: {
    backgroundColor: Colors.light_blue,
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(52),
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontFamily: FontFamilies.sfProDisplayBold,
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: Colors.black,
  },
});

export default EnterNameModal;
