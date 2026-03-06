import { StyleSheet } from 'react-native';
import { AppTheme } from '../../theme';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Create styles function that accepts theme
 * This allows dynamic theming based on device color scheme
 */
const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingIndicator: {
    color: theme.colors.primary,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fonts.sizes.md,
    fontFamily: theme.fonts.families.poppinsRegular,
    color: theme.colors.textSecondary,
  },

  // Header
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fonts.sizes.xxl,
    fontFamily: theme.fonts.families.poppinsBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fonts.sizes.md,
    fontFamily: theme.fonts.families.poppinsRegular,
    color: theme.colors.textSecondary,
  },

  // Content
  content: {
    flex: 1,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: theme.fonts.sizes.lg,
    fontFamily: theme.fonts.families.poppinsRegular,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },

  // Button
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.base,
    ...theme.shadows.base,
  },
  buttonText: {
    fontSize: theme.fonts.sizes.md,
    fontFamily: theme.fonts.families.poppinsSemiBold,
    color: theme.colors.white,
    textAlign: 'center',
  },

  // Item
  item: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.base,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  itemText: {
    fontSize: theme.fonts.sizes.md,
    fontFamily: theme.fonts.families.poppinsRegular,
    color: theme.colors.text,
  },
});

/**
 * Hook to get styles with current theme
 * Usage: const styles = useStyles();
 */
export const useStyles = () => {
  const theme = useTheme();
  return createStyles(theme);
};

// Export createStyles for custom usage
export default createStyles;
