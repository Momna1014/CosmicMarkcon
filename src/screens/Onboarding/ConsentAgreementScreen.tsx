/**
 * Consent & Privacy Agreement Screen
 *
 * Accordion design — Core Experience open by default, others collapsed.
 * Storage descriptions are verified against actual API calls in
 * ChatConversationService.ts and ConversationService.ts.
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {FadeIn, FadeInDown} from 'react-native-reanimated';
import {
  Colors,
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
  moderateScale,
} from '../../theme';
import {hapticLight} from '../../utils/haptics';
import {trackAgreementAfterOnboarding3} from '../../utils/onboardingAnalytics';
import {OnboardingButton} from '../../components/OnboardingButton';
import BackArrowIcon from '../../assets/icons/new_onboarding/back_arrow.svg';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PRIVACY_POLICY_URL = 'https://milaltechnologies.com/privacy-policy.html';
const TERMS_URL = 'https://milaltechnologies.com/terms-and-conditions.html';

const H_PAD = horizontalScale(20);

// ---------------------------------------------------------------------------
// Data model
// ---------------------------------------------------------------------------

type ConsentItem = {
  label: string;
  description: string;
  storage: string;
  required: boolean;
};

type ConsentSection = {
  title: string;
  icon: string;
  items: ConsentItem[];
};

// ---------------------------------------------------------------------------
// Section content — storage lines verified against actual code
// ---------------------------------------------------------------------------

const SECTIONS: ConsentSection[] = [
  {
    title: 'Core Experience',
    icon: '✦',
    items: [
      {
        label: 'Birth date & zodiac sign',
        description:
          'Your birth date is the foundation of every reading in the app. Your zodiac sign is derived from it automatically.',
        storage:
          'Stored on your device. Also sent to OpenAI, Inc. on every request to generate your personalised readings and horoscopes.',
        required: true,
      },
      {
        label: 'Anonymous session',
        description:
          'A randomly generated ID that links your app sessions. No personal details are attached to it.',
        storage: 'Linked to Google Firebase anonymously. Not sent to OpenAI.',
        required: true,
      },
    ],
  },
  {
    title: 'AI-Powered Features',
    icon: '✺',
    items: [
      {
        label: 'Personalised readings & horoscopes',
        description:
          'To generate your daily horoscope, weekly insights, and cosmic readings, Cosmiq sends your birth date, zodiac sign, and birth location to OpenAI (ChatGPT). This data is required to produce personalised astrological content.',
        storage:
          'Sent to OpenAI, Inc. (openai.com). OpenAI may retain this data per its own privacy policy at openai.com/privacy.',
        required: true,
      },
      {
        label: 'AI advisor chat messages',
        description:
          'When you use the AI advisor or cosmic chat, your messages and conversation history are sent to OpenAI to generate responses. Your name, birth date, zodiac sign, and birth location are also included in each request if you have provided them.',
        storage:
          'Sent to OpenAI, Inc. Conversation data is not stored by Cosmiq after your session ends.',
        required: true,
      },
      {
        label: 'Palm reading images',
        description:
          'When you use the palm reading feature, the photo you take or upload is sent to OpenAI\'s Vision API for analysis. No other personal data is attached to the image.',
        storage:
          'Sent to OpenAI, Inc. The image is not stored by Cosmiq after the reading is complete.',
        required: false,
      },
      {
        label: 'Partner & compatibility data',
        description:
          'If you add a partner for compatibility readings, their name, birth date, and zodiac sign are included in requests sent to OpenAI alongside your own data.',
        storage:
          'Sent to OpenAI, Inc. Only used to generate the compatibility reading.',
        required: false,
      },
    ],
  },
  {
    title: 'Personalisation',
    icon: '◈',
    items: [
      {
        label: 'Name',
        description:
          'Used to personalise your readings and messages. You can skip this.',
        storage:
          'Stored on your device. Also sent to OpenAI, Inc. when provided, to address you by name in readings and chat responses.',
        required: false,
      },
      {
        label: 'Gender identity',
        description:
          'Used to tailor your content style and character visuals. You can skip this.',
        storage: 'Stored on your device only. Not sent to OpenAI.',
        required: false,
      },
      {
        label: 'Birth city & country',
        description:
          'Used for location-aware astrological calculations. You can skip this. This is not your current GPS location.',
        storage:
          'Stored on your device. Also sent to OpenAI, Inc. when provided, for location-aware readings.',
        required: false,
      },
    ],
  },
  {
    title: 'Notifications',
    icon: '◎',
    items: [
      {
        label: 'Push notifications',
        description:
          'Used to deliver daily horoscope reminders. Only active after you separately grant notification permission.',
        storage:
          'Device token stored with Firebase Cloud Messaging. Not sent to OpenAI.',
        required: false,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const Badge: React.FC<{required: boolean}> = ({required}) => (
  <View
    style={[
      styles.badge,
      required ? styles.badgeRequired : styles.badgeOptional,
    ]}>
    <Text
      style={[
        styles.badgeText,
        required ? styles.badgeTextRequired : styles.badgeTextOptional,
      ]}>
      {required ? 'Required' : 'Optional'}
    </Text>
  </View>
);

const AccordionSection: React.FC<{
  section: ConsentSection;
  isOpen: boolean;
  onToggle: () => void;
  delay: number;
}> = ({section, isOpen, onToggle, delay}) => (
  <Animated.View
    entering={FadeInDown.delay(delay).duration(480)}
    style={styles.card}>
    {/* Header row — always visible, tappable */}
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.75}
      style={styles.accordionHeader}>
      <View style={styles.accordionLeft}>
        <Text style={styles.cardIcon}>{section.icon}</Text>
        <Text style={styles.cardTitle}>{section.title.toUpperCase()}</Text>
      </View>
      <View style={styles.accordionRight}>
        <Text style={styles.itemCountText}>{section.items.length}</Text>
        <Text style={[styles.chevron, isOpen && styles.chevronOpen]}>›</Text>
      </View>
    </TouchableOpacity>

    {/* Body — shown when open */}
    {isOpen && (
      <View>
        {section.items.map((item, index) => (
          <View
            key={item.label}
            style={[
              styles.item,
              index < section.items.length - 1 && styles.itemDivider,
            ]}>
            <View style={styles.itemTop}>
              <Text style={styles.itemLabel} numberOfLines={2}>
                {item.label}
              </Text>
              <Badge required={item.required} />
            </View>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <Text style={styles.itemStorage}>{item.storage}</Text>
          </View>
        ))}
      </View>
    )}
  </Animated.View>
);

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export interface ConsentAgreementScreenProps {
  onNext: () => void;
  onGoBack?: () => void;
}

export const ConsentAgreementScreen: React.FC<
  ConsentAgreementScreenProps
> = ({onNext, onGoBack}) => {
  const [agreed, setAgreed] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['Core Experience']),
  );

  useEffect(() => {
    trackAgreementAfterOnboarding3();
  }, []);

  const toggleSection = (title: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const toggleCheckbox = () => {
    hapticLight();
    setAgreed(prev => !prev);
  };

  const handleContinue = () => {
    if (!agreed) {
      return;
    }
    onNext();
  };

  const handleBack = () => {
    hapticLight();
    onGoBack?.();
  };

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={styles.safeArea}>
        {/* ── Header ─────────────────────────────────── */}
        <Animated.View
          entering={FadeIn.delay(80).duration(400)}
          style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <BackArrowIcon
              width={moderateScale(24)}
              height={moderateScale(24)}
            />
          </TouchableOpacity>
          <Text style={styles.headerLabel}>Privacy & Consent</Text>
        </Animated.View>

        {/* ── Hero ───────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(140).duration(520)}
          style={styles.hero}>
          <Text style={styles.heroTitle}>Before we continue</Text>
          <Text style={styles.heroBody}>
            Here is exactly what data Cosmiq collects, where it stays, and what
            is shared with third-party services including OpenAI.
          </Text>
        </Animated.View>

        {/* ── Accordion list ─────────────────────────── */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces>
          {SECTIONS.map((section, index) => (
            <AccordionSection
              key={section.title}
              section={section}
              isOpen={openSections.has(section.title)}
              onToggle={() => toggleSection(section.title)}
              delay={180 + index * 55}
            />
          ))}

          <Animated.View
            entering={FadeInDown.delay(420).duration(400)}
            style={styles.linksRow}>
            <TouchableOpacity
              onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
              activeOpacity={0.7}>
              <Text style={styles.link}>Full Privacy Policy</Text>
            </TouchableOpacity>
            <View style={styles.linkSep} />
            <TouchableOpacity
              onPress={() => Linking.openURL(TERMS_URL)}
              activeOpacity={0.7}>
              <Text style={styles.link}>Terms of Service</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        {/* ── Sticky footer ──────────────────────────── */}
        <Animated.View
          entering={FadeIn.delay(320).duration(480)}
          style={styles.footer}>
          <TouchableOpacity
            onPress={toggleCheckbox}
            activeOpacity={0.85}
            style={styles.checkRow}>
            <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
              {agreed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkLabel}>
              I have read the above disclosures and agree to Cosmiq's Privacy
              Policy and Terms of Service, including the sharing of my personal
              data with OpenAI to power AI features.
            </Text>
          </TouchableOpacity>

          <OnboardingButton
            text="Continue"
            onPress={handleContinue}
            disabled={!agreed}
          />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.new_background,
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(4),
    gap: horizontalScale(12),
  },
  backBtn: {},
  headerLabel: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(15),
    fontWeight: '600',
    color: Colors.newOnboardingSubheading,
  },

  // Hero
  hero: {
    paddingHorizontal: H_PAD,
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(14),
  },
  heroTitle: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(30),
    color: Colors.newOnboardingHeading,
    marginBottom: verticalScale(6),
  },
  heroBody: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(13),
    color: Colors.newOnboardingSubheading,
    lineHeight: fontScale(20),
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: H_PAD,
    paddingBottom: verticalScale(16),
    gap: verticalScale(8),
  },

  // Accordion card
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radiusScale(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(14),
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
    flex: 1,
  },
  accordionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
  },
  cardIcon: {
    fontSize: fontScale(13),
    color: 'rgba(184, 190, 208, 0.55)',
  },
  cardTitle: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(12),
    fontWeight: '600',
    letterSpacing: 0.7,
    color: Colors.newOnboardingHeading,
  },
  itemCountText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(11),
    color: 'rgba(184, 190, 208, 0.4)',
  },
  chevron: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(18),
    color: 'rgba(184, 190, 208, 0.5)',
    transform: [{rotate: '90deg'}],
    lineHeight: fontScale(20),
  },
  chevronOpen: {
    transform: [{rotate: '270deg'}],
    color: Colors.newOnboardingSubheading,
  },

  // Item (inside open accordion body)
  item: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(5),
    gap: horizontalScale(8),
  },
  itemLabel: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(13),
    fontWeight: '600',
    color: Colors.newOnboardingHeading,
    flex: 1,
  },
  itemDescription: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(12),
    color: Colors.newOnboardingSubheading,
    lineHeight: fontScale(18),
    marginBottom: verticalScale(4),
  },
  itemStorage: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(11),
    color: 'rgba(184, 190, 208, 0.5)',
    lineHeight: fontScale(16),
    fontStyle: 'italic',
  },

  // Badges
  badge: {
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(3),
    borderRadius: radiusScale(20),
    flexShrink: 0,
  },
  badgeRequired: {
    backgroundColor: 'rgba(240, 180, 41, 0.13)',
  },
  badgeOptional: {
    backgroundColor: 'rgba(160, 184, 255, 0.10)',
  },
  badgeText: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(10),
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  badgeTextRequired: {
    color: '#F0B429',
  },
  badgeTextOptional: {
    color: '#A0B8FF',
  },

  // Links
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
    gap: horizontalScale(12),
  },
  link: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(13),
    color: 'rgba(184, 190, 208, 0.6)',
    textDecorationLine: 'underline',
  },
  linkSep: {
    width: 1,
    height: verticalScale(13),
    backgroundColor: 'rgba(184, 190, 208, 0.22)',
  },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: H_PAD,
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(22),
    gap: verticalScale(14),
    backgroundColor: Colors.new_background,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: horizontalScale(12),
  },
  checkbox: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: radiusScale(6),
    borderWidth: 1.5,
    borderColor: 'rgba(184, 190, 208, 0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: verticalScale(1),
  },
  checkboxActive: {
    backgroundColor: '#F3EFE7',
    borderColor: '#F3EFE7',
  },
  checkmark: {
    fontFamily: FontFamilies.interBold,
    fontSize: fontScale(13),
    fontWeight: '700',
    color: Colors.new_background,
    lineHeight: fontScale(16),
  },
  checkLabel: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(13),
    color: Colors.newOnboardingSubheading,
    lineHeight: fontScale(19),
    flex: 1,
  },
});

export default ConsentAgreementScreen;
