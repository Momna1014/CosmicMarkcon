import {StyleSheet} from 'react-native';
import {
  FontFamilies,
  Colors,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
  moderateScale,
} from '../../theme';

export const styles = StyleSheet.create({
  backgroundFallback: {
    flex: 1,
    backgroundColor: Colors.new_background,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(40),
  },

  // Section heading (matches Profile)
  sectionHeading: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(13),
    color: 'rgba(194, 209, 243, 0.55)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(10),
    marginLeft: horizontalScale(4),
  },

  // Glass card (matches Profile)
  glassCard: {
    borderRadius: radiusScale(20),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    backgroundColor: 'rgba(194, 209, 243, 0.06)',
    padding: horizontalScale(18),
  },

  // Intro card
  introTitle: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(16),
    color: '#FFFFFF',
    marginBottom: verticalScale(6),
  },
  introSubtitle: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(13),
    color: 'rgba(194, 209, 243, 0.75)',
    lineHeight: fontScale(19),
  },

  // Reporting context (when navigated from a flagged AI response)
  reasonsBlock: {
    marginBottom: verticalScale(14),
  },
  reasonsBlockLabel: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(11),
    color: 'rgba(194, 209, 243, 0.55)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: verticalScale(8),
  },
  reasonChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: horizontalScale(8),
  },
  reasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(6),
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(6),
    borderRadius: radiusScale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  reasonChipText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(12),
    color: '#FFFFFF',
  },
  reportedQuoteWrap: {
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: 'rgba(194, 209, 243, 0.12)',
  },
  reportedQuoteLabel: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(11),
    color: 'rgba(194, 209, 243, 0.55)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(8),
  },
  reportedQuoteText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(13),
    color: 'rgba(255, 255, 255, 0.78)',
    lineHeight: fontScale(20),
    fontStyle: 'italic',
  },

  // Attachments
  attachmentHeader: {
    marginBottom: verticalScale(10),
  },
  attachmentHeaderText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(12),
    color: 'rgba(194, 209, 243, 0.7)',
    letterSpacing: 0.5,
  },
  attachmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: horizontalScale(10),
    marginBottom: verticalScale(10),
  },
  attachmentItem: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: radiusScale(12),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    position: 'relative',
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
  },
  removeAttachmentButton: {
    position: 'absolute',
    top: verticalScale(4),
    right: horizontalScale(4),
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAttachmentTile: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: radiusScale(12),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAttachmentText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(11),
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: verticalScale(4),
  },

  // Field
  fieldContainer: {
    marginBottom: verticalScale(18),
  },
  fieldLabel: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(13),
    color: '#C2D1F3',
    letterSpacing: 1,
    marginBottom: verticalScale(8),
    fontWeight: '600',
  },
  fieldHint: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(11),
    color: 'rgba(194, 209, 243, 0.5)',
    marginTop: verticalScale(6),
  },
  fieldHintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(6),
  },
  fieldCounter: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(11),
    color: 'rgba(194, 209, 243, 0.5)',
  },
  fieldCounterValid: {
    color: 'rgba(194, 209, 243, 0.85)',
  },

  // Inputs
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: radiusScale(12),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(2),
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  inputBoxError: {
    borderColor: 'rgba(255, 120, 120, 0.55)',
  },
  textInput: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(15),
    color: '#FFFFFF',
    paddingVertical: verticalScale(12),
    flex: 1,
  },
  textArea: {
    minHeight: verticalScale(140),
    textAlignVertical: 'top',
    paddingVertical: verticalScale(12),
  },
  errorText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(12),
    color: '#FF8A8A',
    marginTop: verticalScale(6),
  },

  // Submit button
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radiusScale(30),
    paddingVertical: verticalScale(16),
    marginTop: verticalScale(16),
    minHeight: verticalScale(52),
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(15),
    color: '#000000',
    marginRight: horizontalScale(6),
  },
  submitArrow: {
    fontSize: fontScale(15),
    color: '#000000',
  },

  // Footer note
  footerNote: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(12),
    color: 'rgba(194, 209, 243, 0.45)',
    textAlign: 'center',
    marginTop: verticalScale(14),
    paddingHorizontal: horizontalScale(8),
    lineHeight: fontScale(18),
  },

  // Success card
  successCard: {
    borderRadius: radiusScale(20),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    backgroundColor: 'rgba(194, 209, 243, 0.06)',
    padding: horizontalScale(24),
    alignItems: 'center',
    marginTop: verticalScale(40),
  },
  successIconWrap: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: moderateScale(36),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
  },
  successCheck: {
    fontSize: fontScale(36),
    color: '#FFFFFF',
  },
  successTitle: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(18),
    color: '#FFFFFF',
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  successMessage: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(13),
    color: 'rgba(194, 209, 243, 0.75)',
    textAlign: 'center',
    lineHeight: fontScale(20),
    marginBottom: verticalScale(20),
  },
  successButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: radiusScale(30),
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(28),
  },
  successButtonText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(14),
    color: '#FFFFFF',
  },
});
