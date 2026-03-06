# App Icon - Automated Generation

Place your app icon here as `app_logo.png` and run the generation command.

## Requirements:
- **Filename**: Must be named `app_logo.png` (exactly)
- **Size**: 1024x1024 pixels (recommended)
- **Format**: PNG
- **Design**: Square icon with no transparency (for best results)
- **Safe Zone**: Keep important content within center 80% (avoid edges)

## Usage:

After placing your app icon here, run:
```bash
yarn generate-app-icon
```

This will automatically generate and place all required app icon sizes for:
- **Android**: All mipmap sizes (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- **iOS**: All required AppIcon sizes in Images.xcassets

## What Gets Generated:

### Android
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`
- Round icons for all densities

### iOS
- `ios/YourAppName/Images.xcassets/AppIcon.appiconset/`
- All required sizes (20pt, 29pt, 40pt, 60pt, 76pt, 83.5pt, 1024pt)
- Includes @2x and @3x variants

## Design Tips:

### ✅ Do:
- Use simple, recognizable design
- Keep important elements centered
- Use solid backgrounds (avoid transparency)
- Test on both light and dark backgrounds
- Use high contrast colors
- Make it look good at small sizes (20x20)

### ❌ Don't:
- Don't use text (hard to read at small sizes)
- Don't use photos (won't scale well)
- Don't make it too detailed
- Don't use thin lines (will disappear at small sizes)

## Example Workflow:

```bash
# 1. Design your icon (1024x1024)
# 2. Save as app_logo.png in this folder
# 3. Generate all sizes
yarn generate-app-icon

# 4. Verify (optional)
# Android: Check android/app/src/main/res/mipmap-*
# iOS: Open Xcode and check Images.xcassets/AppIcon

# 5. Rebuild your app
yarn android  # or yarn ios
```

## Updating Icon Later:

Simply replace `app_logo.png` with your new icon and run `yarn generate-app-icon` again!

## Note:
This folder is intentionally left without an `app_logo.png` file so you can add your own when starting a new project.
