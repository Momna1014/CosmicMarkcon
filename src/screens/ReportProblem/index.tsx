import React, {useCallback, useMemo, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute, RouteProp} from '@react-navigation/native';
import Share, {Social} from 'react-native-share';
import RNFS from 'react-native-fs';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {ChatHeader} from '../Chat/components';
import {styles} from './styles';
import {showErrorToast, showInfoToast} from '../../utils/toast';
import {launchImageLibraryMulti, ImagePickerResult} from '../../utils/imagePicker';
import {
  ReportDiagnosticsService,
  type ReportSource,
} from '../../services/support/ReportDiagnosticsService';

const SUPPORT_EMAIL = 'momnasarfraz636@gmail.com';
const MIN_DESCRIPTION_LENGTH = 20;
const MAX_DESCRIPTION_LENGTH = 1500;
const MAX_ATTACHMENTS = 5;
const MAILTO_BODY_MAX = 1600;

type ReportRouteParams = {
  ReportProblem: {source?: ReportSource} | undefined;
};

type Props = {
  navigation: any;
};

const ReportProblemScreen: React.FC<Props> = () => {
  const route = useRoute<RouteProp<ReportRouteParams, 'ReportProblem'>>();
  const source: ReportSource = route.params?.source || 'settings';

  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<ImagePickerResult[]>([]);

  const [touched, setTouched] = useState({description: false});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const trimmedDescription = description.trim();

  const errors = useMemo(() => {
    const next: {description?: string} = {};
    if (!trimmedDescription) {
      next.description = 'Description is required.';
    } else if (trimmedDescription.length < MIN_DESCRIPTION_LENGTH) {
      next.description = `Please add a bit more detail (at least ${MIN_DESCRIPTION_LENGTH} characters).`;
    }
    return next;
  }, [trimmedDescription]);

  const isFormValid = !errors.description;
  const isSubmitDisabled = !isFormValid || isSubmitting;

  const handleAddImages = useCallback(async () => {
    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (remaining <= 0) {
      showInfoToast(
        `You can attach up to ${MAX_ATTACHMENTS} images.`,
        'Limit reached',
      );
      return;
    }
    const picked = await launchImageLibraryMulti(remaining);
    if (picked.length === 0) return;
    setAttachments(prev => [...prev, ...picked].slice(0, MAX_ATTACHMENTS));
  }, [attachments.length]);

  const handleRemoveImage = useCallback((uri: string) => {
    setAttachments(prev => prev.filter(item => item.uri !== uri));
  }, []);

  const buildEmailContent = useCallback(async () => {
    const diagnostics = await ReportDiagnosticsService.collect(source);
    return {
      subject: ReportDiagnosticsService.buildEmailSubject(diagnostics),
      body: ReportDiagnosticsService.buildEmailBody(
        trimmedDescription,
        diagnostics,
      ),
    };
  }, [trimmedDescription, source]);

  const fallbackToMailto = useCallback(
    async (subject: string, body: string) => {
      const clippedBody =
        body.length > MAILTO_BODY_MAX
          ? `${body.slice(0, MAILTO_BODY_MAX)}\n...(truncated)`
          : body;

      const fullMailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(clippedBody)}`;
      const subjectOnlyMailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
        subject,
      )}`;
      const bareMailto = `mailto:${SUPPORT_EMAIL}`;

      try {
        await Linking.openURL(fullMailto);
        return;
      } catch (fullError) {
        console.warn(
          '[ReportProblem] full mailto failed, retrying subject-only',
          fullError,
        );
      }

      try {
        await Linking.openURL(subjectOnlyMailto);
        return;
      } catch (subjectError) {
        console.warn(
          '[ReportProblem] subject-only mailto failed, retrying bare',
          subjectError,
        );
      }

      await Linking.openURL(bareMailto);
    },
    [],
  );

  const openEmailComposer = useCallback(
    async (subject: string, message: string, urls: string[]) => {
      if (urls.length > 0) {
        try {
          await Share.shareSingle({
            social: Social.Email,
            title: subject,
            subject,
            message,
            email: SUPPORT_EMAIL,
            urls,
          });
          return;
        } catch (shareError) {
          console.warn(
            '[ReportProblem] shareSingle EMAIL failed, falling back to mailto (attachments will be lost)',
            shareError,
          );
        }
      }

      await fallbackToMailto(subject, message);
    },
    [fallbackToMailto],
  );

  // Copy a picked image into the app cache so we have a real file path
  // that other apps (Gmail, Mail) can read. Image picker URIs on Android
  // are scoped content:// URIs that Gmail cannot read directly.
  const copyToCache = useCallback(
    async (item: ImagePickerResult, index: number): Promise<string> => {
      const ext =
        item.fileName?.split('.').pop()?.toLowerCase() ||
        (item.type?.split('/').pop() ?? 'jpg');
      const safeName = `cosmiq_report_${Date.now()}_${index}.${ext}`;
      const dest = `${RNFS.CachesDirectoryPath}/${safeName}`;

      try {
        await RNFS.copyFile(item.uri, dest);
      } catch (copyError) {
        console.warn(
          '[ReportProblem] copyFile failed, falling back to original URI',
          copyError,
        );
        return Platform.OS === 'ios' && !item.uri.startsWith('file://')
          ? `file://${item.uri}`
          : item.uri;
      }
      return Platform.OS === 'android' ? `file://${dest}` : dest;
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    setTouched({description: true});
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      const {subject, body} = await buildEmailContent();
      const urls = await Promise.all(
        attachments.map((item, index) => copyToCache(item, index)),
      );
      await openEmailComposer(subject, body, urls);
      setSubmitted(true);
    } catch (error) {
      console.error('[ReportProblem] Failed to open email composer', error);
      showErrorToast(
        'We could not open your email app. Please try again or email us directly.',
        'Something went wrong',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [buildEmailContent, attachments, copyToCache, openEmailComposer, isFormValid]);

  const handleResetForAnother = useCallback(() => {
    setDescription('');
    setAttachments([]);
    setTouched({description: false});
    setSubmitted(false);
  }, []);

  const showDescriptionError = touched.description && !!errors.description;

  if (submitted) {
    return (
      <View style={styles.backgroundFallback}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />
          <ChatHeader title="Report a Problem" subtitle="Thank You" />
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.successCard}>
              <View style={styles.successIconWrap}>
                <Text style={styles.successCheck}>✓</Text>
              </View>
              <Text style={styles.successTitle}>Report sent</Text>
              <Text style={styles.successMessage}>
                Your email app has been opened with your report. Please send the
                email to complete your submission. We appreciate you helping us
                make Cosmiq better.
              </Text>
              <TouchableOpacity
                style={styles.successButton}
                onPress={handleResetForAnother}
                activeOpacity={0.8}>
                <Text style={styles.successButtonText}>Send another</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.backgroundFallback}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <ChatHeader
          title="Report a Problem"
          subtitle="We'd love to hear from you"
        />
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.glassCard}>
              <Text style={styles.introTitle}>Tell us what happened</Text>
              <Text style={styles.introSubtitle}>
                Share as much detail as you can. The more we know, the faster
                we can help.
              </Text>
            </View>

            {/* Description */}
            <Text style={styles.sectionHeading}>Description</Text>
            <View style={styles.glassCard}>
              <View
                style={[
                  styles.inputBox,
                  showDescriptionError && styles.inputBoxError,
                ]}>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={description}
                  onChangeText={value =>
                    setDescription(value.slice(0, MAX_DESCRIPTION_LENGTH))
                  }
                  onBlur={() =>
                    setTouched(prev => ({...prev, description: true}))
                  }
                  placeholder="Describe the problem, what you expected, and the steps to reproduce it."
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  multiline
                  maxLength={MAX_DESCRIPTION_LENGTH}
                />
              </View>
              <View style={styles.fieldHintRow}>
                <Text style={styles.fieldHint}>
                  Minimum {MIN_DESCRIPTION_LENGTH} characters.
                </Text>
                <Text
                  style={[
                    styles.fieldCounter,
                    trimmedDescription.length >= MIN_DESCRIPTION_LENGTH &&
                      styles.fieldCounterValid,
                  ]}>
                  {trimmedDescription.length}/{MAX_DESCRIPTION_LENGTH}
                </Text>
              </View>
              {showDescriptionError ? (
                <Text style={styles.errorText}>{errors.description}</Text>
              ) : null}
            </View>

            {/* Attachments */}
            <Text style={styles.sectionHeading}>Attachments (optional)</Text>
            <View style={styles.glassCard}>
              <View style={styles.attachmentHeader}>
                <Text style={styles.attachmentHeaderText}>
                  {attachments.length}/{MAX_ATTACHMENTS} images added
                </Text>
              </View>

              <View style={styles.attachmentGrid}>
                {attachments.map(item => (
                  <View key={item.uri} style={styles.attachmentItem}>
                    <Image
                      source={{uri: item.uri}}
                      style={styles.attachmentImage}
                    />
                    <TouchableOpacity
                      style={styles.removeAttachmentButton}
                      onPress={() => handleRemoveImage(item.uri)}
                      activeOpacity={0.8}
                      hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
                      <MaterialCommunityIcon
                        name="close"
                        size={14}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </View>
                ))}

                {attachments.length < MAX_ATTACHMENTS ? (
                  <TouchableOpacity
                    style={styles.addAttachmentTile}
                    onPress={handleAddImages}
                    activeOpacity={0.8}>
                    <MaterialCommunityIcon
                      name="image-plus"
                      size={26}
                      color="rgba(255, 255, 255, 0.7)"
                    />
                    <Text style={styles.addAttachmentText}>Add</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <Text style={styles.fieldHint}>
                Pick up to {MAX_ATTACHMENTS} screenshots from your gallery.
                They will be attached to the email automatically.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitDisabled && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitDisabled}
              activeOpacity={0.85}>
              {isSubmitting ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Send Report</Text>
                  <Text style={styles.submitArrow}>→</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.footerNote}>
              Your report will be sent via email along with basic device info to
              help us debug. No personal account data is included.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default ReportProblemScreen;
