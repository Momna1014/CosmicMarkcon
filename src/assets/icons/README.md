# Social Sign-In Icons

This folder contains logo icons for social sign-in buttons.

## Required Icons

### 1. Google Logo (`google-logo.png`)
- **Size**: 512x512px (will be scaled to 24x24 in UI)
- **Format**: PNG with transparent background
- **Download**: [Google Brand Resources](https://about.google/brand-resources/)
- **File name**: `google-logo.png`

### 2. Apple Logo (`apple-logo.png`)
- **Size**: 512x512px (will be scaled to 24x24 in UI)
- **Format**: PNG with transparent background
- **Download**: [Apple Marketing Resources](https://developer.apple.com/app-store/marketing/guidelines/)
- **File name**: `apple-logo.png`

## Quick Setup

### Option 1: Download Official Logos
1. Download Google logo: https://about.google/brand-resources/
2. Download Apple logo: https://developer.apple.com/design/resources/
3. Rename and place in this folder

### Option 2: Use React Native Vector Icons (Alternative)
Install vector icons:
```bash
yarn add react-native-vector-icons
```

Update button component to use icon fonts instead of images.

## Current Files
```
src/assets/icons/
├── google-logo.png     (⚠️ Need to add)
├── apple-logo.png      (⚠️ Need to add)
└── README.md           (✅ This file)
```

## Usage in Components

```typescript
import GoogleLogo from '../assets/icons/google-logo.png';
import AppleLogo from '../assets/icons/apple-logo.png';

<Image source={GoogleLogo} style={{width: 24, height: 24}} />
<Image source={AppleLogo} style={{width: 24, height: 24}} />
```

## Temporary Placeholder

If you don't have logos yet, you can:
1. Use colored squares as placeholders
2. Use text labels only (remove icon prop)
3. Use emoji (⚠️ not recommended for production)

---

**Note**: Make sure to follow brand guidelines when using official logos!
