# Logo Placeholder

Place your app logo here as `logo.png`

## Requirements:
- **Size**: 1024x1024 pixels (recommended)
- **Format**: PNG with transparent background
- **Design**: Simple, centered logo that works on light backgrounds

## Usage:

After placing your logo here, run:
```bash
yarn generate-bootsplash
```

This will automatically generate all required splash screen assets for iOS and Android.

## Customization:

To change background color or logo size:
```bash
yarn react-native generate-bootsplash src/assets/logo.png \
  --platforms=android,ios \
  --background=#1E90FF \
  --logo-width=150
```

## Note:
This directory is intentionally left without a logo.png file so you can add your own app's logo when starting a new project.
