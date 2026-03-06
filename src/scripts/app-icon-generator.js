/*
 * Auto-generate Android + iOS app icons from a single PNG,
 * similar in spirit to IconKitchen.
 *
 * - Input:  src/assets/AppLogo/app_logo.png
 * - Output:
 *   - Android adaptive + legacy icons
 *   - iOS AppIcon.appiconset (auto-detects iOS app folder)
 *
 * Requires:
 *   npm install sharp fs-extra prompt-sync
 * TO RUN THIS SCRIPT: node src/scripts/app-icon-generator.js

 */

const sharp = require("sharp");
const fs = require("fs-extra");
const path = require("path");
const prompt = require("prompt-sync")();  // Add prompt-sync for user input

// PROJECT_ROOT should be the repository root (two levels above src/scripts)
const PROJECT_ROOT = path.join(__dirname, "..", "..");
const SRC_ICON = path.join(PROJECT_ROOT, "src/assets/AppLogo/app_logo.png");

// ---------- Helpers ----------

// Detect iOS app name by finding *.xcodeproj inside /ios
function detectIosAppIconPath() {
  const iosRoot = path.join(PROJECT_ROOT, "ios");
  if (!fs.existsSync(iosRoot)) {
    throw new Error("ios folder not found at ./ios");
  }

  const entries = fs.readdirSync(iosRoot);
  const xcodeproj = entries.find(e => e.endsWith(".xcodeproj"));
  if (!xcodeproj) {
    throw new Error("No .xcodeproj found in ./ios. Set IOS_PATH manually.");
  }

  const appName = xcodeproj.replace(".xcodeproj", "");
  return path.join(iosRoot, appName, "Images.xcassets", "AppIcon.appiconset");
}

// Get approximate dominant color by resizing to 1x1 and reading that pixel
async function getAverageColorHex(inputPath) {
  const img = sharp(inputPath);
  const { data } = await img
    .resize(1, 1, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const [r, g, b] = data;
  const toHex = v => v.toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Generate square icon with safe padding (for adaptive & legacy)
// size = final size; visible content shrunk based on padding percentage to avoid round crop
// paddingPercent = percentage of padding (0-50), default 18% matches Android adaptive safe zone
async function generatePaddedSquare(input, output, size, backgroundColor = null, paddingPercent = 18) {
  // Calculate safe zone: if padding is 18%, content is 64% of size (100 - 2*18 = 64)
  const contentPercent = (100 - (paddingPercent * 2)) / 100;
  const safe = Math.floor(size * contentPercent);

  const pad = Math.floor((size - safe) / 2);
  const padExtra = size - safe - pad; // handle odd differences

  // Use provided background color or transparent
  const bgColor = backgroundColor || { r: 0, g: 0, b: 0, alpha: 0 };

  await sharp(input)
    .resize(safe, safe, { fit: "contain", background: bgColor })
    .extend({
      top: pad,
      bottom: padExtra,
      left: pad,
      right: padExtra,
      background: bgColor
    })
    .png()
    .toFile(output);
}

// Generate circular icon for legacy ic_launcher_round.png (pre-API 26 devices)
async function generateCircularIcon(input, output, size, backgroundColor, paddingPercent = 18) {
  const contentPercent = (100 - (paddingPercent * 2)) / 100;
  const safe = Math.floor(size * contentPercent);
  const pad = Math.floor((size - safe) / 2);
  const padExtra = size - safe - pad;

  // Create circular mask SVG
  const circleMask = Buffer.from(`
    <svg width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
    </svg>
  `);

  // Create background circle SVG with the specified color
  const r = backgroundColor.r || 0;
  const g = backgroundColor.g || 0;
  const b = backgroundColor.b || 0;
  const a = backgroundColor.alpha !== undefined ? backgroundColor.alpha : 1;

  const bgCircle = Buffer.from(`
    <svg width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="rgba(${r},${g},${b},${a})"/>
    </svg>
  `);

  // Resize the icon with padding
  const iconBuffer = await sharp(input)
    .resize(safe, safe, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: pad,
      bottom: padExtra,
      left: pad,
      right: padExtra,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  // Composite: background circle + icon, then apply circular mask
  await sharp(bgCircle)
    .composite([
      { input: iconBuffer, gravity: 'center' }
    ])
    .composite([
      { input: circleMask, blend: 'dest-in' }
    ])
    .png()
    .toFile(output);
}

// Generate circular icon with gradient background for legacy round icons
async function generateCircularIconWithGradient(input, output, size, colors, paddingPercent = 18) {
  const contentPercent = (100 - (paddingPercent * 2)) / 100;
  const safe = Math.floor(size * contentPercent);
  const pad = Math.floor((size - safe) / 2);
  const padExtra = size - safe - pad;

  // Create circular mask SVG
  const circleMask = Buffer.from(`
    <svg width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
    </svg>
  `);

  // Create gradient background circle SVG
  const gradientSvg = `
    <svg width="${size}" height="${size}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          ${colors.map((c, i) => {
            const offset = colors.length === 1 ? 0 : (i / (colors.length - 1)) * 100;
            const r = parseInt(c.hex.substring(1, 3), 16);
            const g = parseInt(c.hex.substring(3, 5), 16);
            const b = parseInt(c.hex.substring(5, 7), 16);
            const opacity = c.opacity / 100;
            return `<stop offset="${offset}%" stop-color="rgb(${r},${g},${b})" stop-opacity="${opacity}"/>`;
          }).join('\n          ')}
        </linearGradient>
      </defs>
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="url(#grad)"/>
    </svg>
  `;

  const gradientBuffer = Buffer.from(gradientSvg);

  // Resize the icon with padding
  const iconBuffer = await sharp(input)
    .resize(safe, safe, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: pad,
      bottom: padExtra,
      left: pad,
      right: padExtra,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  // Composite: gradient circle background + icon, then apply circular mask
  await sharp(gradientBuffer)
    .composite([
      { input: iconBuffer, gravity: 'center' }
    ])
    .composite([
      { input: circleMask, blend: 'dest-in' }
    ])
    .png()
    .toFile(output);
}

// Generate icon with gradient background
async function generateIconWithGradient(input, output, size, colors, paddingPercent = 18) {
  const contentPercent = (100 - (paddingPercent * 2)) / 100;
  const safe = Math.floor(size * contentPercent);
  const pad = Math.floor((size - safe) / 2);
  const padExtra = size - safe - pad;

  // Create gradient background
  const gradientSvg = `
    <svg width="${size}" height="${size}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          ${colors.map((c, i) => {
            const offset = colors.length === 1 ? 0 : (i / (colors.length - 1)) * 100;
            const r = parseInt(c.hex.substring(1, 3), 16);
            const g = parseInt(c.hex.substring(3, 5), 16);
            const b = parseInt(c.hex.substring(5, 7), 16);
            const opacity = c.opacity / 100;
            return `<stop offset="${offset}%" stop-color="rgb(${r},${g},${b})" stop-opacity="${opacity}"/>`;
          }).join('\n          ')}
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)"/>
    </svg>
  `;

  // First create the gradient background
  const gradientBuffer = Buffer.from(gradientSvg);
  
  // Resize icon
  const iconBuffer = await sharp(input)
    .resize(safe, safe, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: pad,
      bottom: padExtra,
      left: pad,
      right: padExtra,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  // Composite icon over gradient
  await sharp(gradientBuffer)
    .composite([{ input: iconBuffer, gravity: 'center' }])
    .png()
    .toFile(output);
}

// ---------- Config ----------

const ANDROID_RES_PATH = path.join(PROJECT_ROOT, "android", "app", "src", "main", "res");

// Android legacy launcher sizes
const ANDROID_LEGACY_SIZES = {
  "mipmap-mdpi": 48,
  "mipmap-hdpi": 72,
  "mipmap-xhdpi": 96,
  "mipmap-xxhdpi": 144,
  "mipmap-xxxhdpi": 192
};

// Android adaptive foreground sizes (common pattern)
const ANDROID_FG_SIZES = {
  "mipmap-mdpi": 108,
  "mipmap-hdpi": 162,
  "mipmap-xhdpi": 216,
  "mipmap-xxhdpi": 324,
  "mipmap-xxxhdpi": 432
};

// iOS icon definitions (Xcode expects these)
const IOS_ICONS = [
  // iPhone notification
  { idiom: "iphone", size: "20x20", scale: "2x", filename: "Icon-20@2x.png", px: 40 },
  { idiom: "iphone", size: "20x20", scale: "3x", filename: "Icon-20@3x.png", px: 60 },
  // iPhone settings & spotlight
  { idiom: "iphone", size: "29x29", scale: "2x", filename: "Icon-29@2x.png", px: 58 },
  { idiom: "iphone", size: "29x29", scale: "3x", filename: "Icon-29@3x.png", px: 87 },
  { idiom: "iphone", size: "40x40", scale: "2x", filename: "Icon-40@2x.png", px: 80 },
  { idiom: "iphone", size: "40x40", scale: "3x", filename: "Icon-40@3x.png", px: 120 },
  // iPhone app icon
  { idiom: "iphone", size: "60x60", scale: "2x", filename: "Icon-60@2x.png", px: 120 },
  { idiom: "iphone", size: "60x60", scale: "3x", filename: "Icon-60@3x.png", px: 180 },
  // App Store icon
  {
    idiom: "ios-marketing",
    size: "1024x1024",
    scale: "1x",
    filename: "Icon-1024.png",
    px: 1024
  }
];

// ---------- Main ----------

async function run() {
  if (!fs.existsSync(SRC_ICON)) {
    console.error("❌ Source icon not found at:", SRC_ICON);
    process.exit(1);
  }

  console.log("🎨 Using source icon:", SRC_ICON);

  // Detect iOS AppIcon path
  let IOS_APPICON_PATH;
  try {
    IOS_APPICON_PATH = detectIosAppIconPath();
  } catch (e) {
    console.error("❌", e.message);
    process.exit(1);
  }

  console.log("📁 iOS AppIcon path:", IOS_APPICON_PATH);

  // Ask for number of colors for gradient or solid background
  const numColorsInput = prompt('How many colors do you want? (1 for solid, 2+ for gradient, or press Enter to auto-detect): ');
  
  let colors = [];
  
  if (numColorsInput && parseInt(numColorsInput) > 0) {
    const numColors = parseInt(numColorsInput);
    console.log(`🎨 Creating ${numColors === 1 ? 'solid' : 'gradient'} background with ${numColors} color(s)`);
    
    for (let i = 0; i < numColors; i++) {
      const colorInput = prompt(`Color ${i + 1} (hex code): `);
      const opacityInput = prompt(`Color ${i + 1} opacity in % (0-100): `);
      
      // Ensure the color starts with #
      let colorHex = colorInput.trim().startsWith('#') ? colorInput.trim() : `#${colorInput.trim()}`;
      let opacity = parseInt(opacityInput);
      
      // Clamp opacity between 0 and 100
      opacity = Math.max(0, Math.min(100, opacity));
      
      // Convert percentage to hex (00-FF)
      const alphaHex = Math.round((opacity / 100) * 255).toString(16).padStart(2, '0').toUpperCase();
      
      colors.push({
        hex: colorHex,
        opacity: opacity,
        alphaHex: alphaHex,
        fullHex: `#${alphaHex}${colorHex.substring(1)}` // Android format: #AARRGGBB
      });
      
      console.log(`  → Color ${i + 1}: ${colorHex} with ${opacity}% opacity (${colors[i].fullHex})`);
    }
  } else {
    // Auto-detect single color
    const bgHex = await getAverageColorHex(SRC_ICON);
    console.log("🎯 Auto-detected background color:", bgHex);
    colors.push({
      hex: bgHex,
      opacity: 100,
      alphaHex: 'FF',
      fullHex: `#FF${bgHex.substring(1)}`
    });
  }

  // ---------- ANDROID PADDING ----------
  console.log("\n📐 Android Icon Padding Configuration");
  console.log("   Padding adds space around the logo inside the icon.");
  console.log("   Default: 18% (matches Android adaptive icon safe zone)");
  console.log("   0% = Logo fills entire icon (may be clipped on round launchers)");
  console.log("   25% = Larger padding, smaller logo");
  
  const paddingInput = prompt('Enter Android padding percentage (0-40, or press Enter for 18%): ');
  let androidPadding = 18; // Default
  
  if (paddingInput && paddingInput.trim() !== '') {
    const parsed = parseInt(paddingInput);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 40) {
      androidPadding = parsed;
    } else {
      console.log("⚠️  Invalid padding value. Using default 18%");
    }
  }
  
  console.log(`✅ Using ${androidPadding}% padding for Android icons`);

  // ---------- iOS PADDING ----------
  console.log("\n📐 iOS Icon Padding Configuration");
  console.log("   Padding adds space around the logo inside the icon.");
  console.log("   Default: 10% (iOS icons are typically less padded than Android)");
  console.log("   0% = Logo fills entire icon");
  console.log("   20% = Larger padding, smaller logo");
  
  const iosPaddingInput = prompt('Enter iOS padding percentage (0-40, or press Enter for 10%): ');
  let iosPadding = 10; // Default for iOS
  
  if (iosPaddingInput && iosPaddingInput.trim() !== '') {
    const parsed = parseInt(iosPaddingInput);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 40) {
      iosPadding = parsed;
    } else {
      console.log("⚠️  Invalid padding value. Using default 10%");
    }
  }
  
  console.log(`✅ Using ${iosPadding}% padding for iOS icons`);

  // ---------- ANDROID LEGACY ICONS ----------
  console.log("\n=== ANDROID: Legacy ic_launcher & ic_launcher_round ===");

  for (const folder of Object.keys(ANDROID_LEGACY_SIZES)) {
    const size = ANDROID_LEGACY_SIZES[folder];
    const outDir = path.join(ANDROID_RES_PATH, folder);
    await fs.ensureDir(outDir);

    const legacyPath = path.join(outDir, "ic_launcher.png");
    const roundPath = path.join(outDir, "ic_launcher_round.png");

    // For legacy icons, bake the gradient/color into the PNG to avoid odd backgrounds
    if (colors.length === 1) {
      // Solid color background
      const r = parseInt(colors[0].hex.substring(1, 3), 16);
      const g = parseInt(colors[0].hex.substring(3, 5), 16);
      const b = parseInt(colors[0].hex.substring(5, 7), 16);
      const alpha = colors[0].opacity / 100;
      
      // Square icon for ic_launcher.png
      await generatePaddedSquare(SRC_ICON, legacyPath, size, { r, g, b, alpha }, androidPadding);
      // Circular icon for ic_launcher_round.png (proper round icon for pre-API 26)
      await generateCircularIcon(SRC_ICON, roundPath, size, { r, g, b, alpha }, androidPadding);
    } else {
      // Gradient background - bake it into the PNG
      await generateIconWithGradient(SRC_ICON, legacyPath, size, colors, androidPadding);
      // Circular gradient icon for ic_launcher_round.png
      await generateCircularIconWithGradient(SRC_ICON, roundPath, size, colors, androidPadding);
    }

    console.log(`→ ${folder}: ${size}px (legacy square + round circular with ${androidPadding}% padding)`);
  }

  // ---------- ANDROID ADAPTIVE FOREGROUND ----------
  console.log("\n=== ANDROID: Adaptive foreground (padded, no crop) ===");

  for (const folder of Object.keys(ANDROID_FG_SIZES)) {
    const size = ANDROID_FG_SIZES[folder];
    const outDir = path.join(ANDROID_RES_PATH, folder);
    await fs.ensureDir(outDir);

    const fgPath = path.join(outDir, "ic_launcher_foreground.png");
    await generatePaddedSquare(SRC_ICON, fgPath, size, null, androidPadding);

    console.log(`→ ${folder}: ${size}px foreground (${androidPadding}% padding)`);
  }

  // Create background drawable (gradient or solid color)
  const drawableDir = path.join(ANDROID_RES_PATH, "drawable");
  await fs.ensureDir(drawableDir);
  
  if (colors.length === 1) {
    // Solid color - add to colors.xml
    const valuesDir = path.join(ANDROID_RES_PATH, "values");
    await fs.ensureDir(valuesDir);

    const colorsPath = path.join(valuesDir, "colors.xml");
    let existingColors = "";
    
    // Read existing colors.xml if it exists
    if (fs.existsSync(colorsPath)) {
      existingColors = await fs.readFile(colorsPath, "utf8");
    }

    // Check if ic_launcher_background already exists
    if (existingColors.includes('name="ic_launcher_background"')) {
      // Update existing color
      existingColors = existingColors.replace(
        /<color name="ic_launcher_background">[^<]*<\/color>/,
        `<color name="ic_launcher_background">${colors[0].fullHex}</color>`
      );
      await fs.writeFile(colorsPath, existingColors, "utf8");
    } else if (existingColors.includes("<resources>")) {
      // Add to existing resources
      existingColors = existingColors.replace(
        "</resources>",
        `    <color name="ic_launcher_background">${colors[0].fullHex}</color>\n</resources>`
      );
      await fs.writeFile(colorsPath, existingColors, "utf8");
    } else {
      // Create new file
      const colorsXml = `
<resources>
    <color name="ic_launcher_background">${colors[0].fullHex}</color>
</resources>
`.trim() + "\n";
      await fs.writeFile(colorsPath, colorsXml, "utf8");
    }
    
    console.log(`→ Solid color background: ${colors[0].fullHex}`);
  } else {
    // Gradient - create gradient drawable
    const gradientColorsXml = colors.map((c, i) => 
      i === 0 ? `        android:startColor="${c.fullHex}"` :
      i === colors.length - 1 ? `        android:endColor="${c.fullHex}"` :
      `        android:centerColor="${c.fullHex}"`
    ).join('\n');
    
    const gradientXml = `
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <gradient
        android:angle="270"
        android:type="linear"
${gradientColorsXml} />
</shape>
`.trim() + "\n";

    await fs.writeFile(
      path.join(drawableDir, "ic_launcher_background_gradient.xml"),
      gradientXml,
      "utf8"
    );
    
    console.log(`→ Gradient background created with ${colors.length} colors`);
  }

  // adaptive icon XML
  const anydpiDir = path.join(ANDROID_RES_PATH, "mipmap-anydpi-v26");
  await fs.ensureDir(anydpiDir);

  const backgroundDrawable = colors.length === 1 
    ? "@color/ic_launcher_background"
    : "@drawable/ic_launcher_background_gradient";

  const adaptiveXml = `
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="${backgroundDrawable}" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
    <monochrome android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
`.trim() + "\n";

  // Write both ic_launcher.xml and ic_launcher_round.xml (Android handles round masking for API 26+)
  await fs.writeFile(path.join(anydpiDir, "ic_launcher.xml"), adaptiveXml, "utf8");
  await fs.writeFile(path.join(anydpiDir, "ic_launcher_round.xml"), adaptiveXml, "utf8");

  console.log("→ Android adaptive icon XML (ic_launcher.xml + ic_launcher_round.xml) with monochrome support generated.");

  // ---------- iOS ICONS ----------
  console.log("\n=== iOS: AppIcon.appiconset ===");

  await fs.ensureDir(IOS_APPICON_PATH);

  for (const icon of IOS_ICONS) {
    const outPath = path.join(IOS_APPICON_PATH, icon.filename);
    
    // iOS App Store requires icons WITHOUT alpha channel
    // Use the same background color/gradient as Android
    if (colors.length === 1) {
      // Solid color background
      const r = parseInt(colors[0].hex.substring(1, 3), 16);
      const g = parseInt(colors[0].hex.substring(3, 5), 16);
      const b = parseInt(colors[0].hex.substring(5, 7), 16);
      
      // Calculate padding
      const contentPercent = (100 - (iosPadding * 2)) / 100;
      const safe = Math.floor(icon.px * contentPercent);
      const pad = Math.floor((icon.px - safe) / 2);
      const padExtra = icon.px - safe - pad;
      
      await sharp(SRC_ICON)
        .resize(safe, safe, { fit: "contain", background: { r, g, b, alpha: 1 } })
        .extend({
          top: pad,
          bottom: padExtra,
          left: pad,
          right: padExtra,
          background: { r, g, b, alpha: 1 }
        })
        .flatten({ background: { r, g, b } }) // Remove alpha channel for App Store
        .png()
        .toFile(outPath);
    } else {
      // Gradient background - create gradient SVG and composite
      const size = icon.px;
      const contentPercent = (100 - (iosPadding * 2)) / 100;
      const safe = Math.floor(size * contentPercent);
      const pad = Math.floor((size - safe) / 2);
      const padExtra = size - safe - pad;
      
      const gradientSvg = `
        <svg width="${size}" height="${size}">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              ${colors.map((c, i) => {
                const offset = colors.length === 1 ? 0 : (i / (colors.length - 1)) * 100;
                const r = parseInt(c.hex.substring(1, 3), 16);
                const g = parseInt(c.hex.substring(3, 5), 16);
                const b = parseInt(c.hex.substring(5, 7), 16);
                const opacity = c.opacity / 100;
                return `<stop offset="${offset}%" stop-color="rgb(${r},${g},${b})" stop-opacity="${opacity}"/>`;
              }).join('\n              ')}
            </linearGradient>
          </defs>
          <rect width="${size}" height="${size}" fill="url(#grad)"/>
        </svg>
      `;
      
      const gradientBuffer = Buffer.from(gradientSvg);
      
      // Resize icon with padding
      const iconBuffer = await sharp(SRC_ICON)
        .resize(safe, safe, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .extend({
          top: pad,
          bottom: padExtra,
          left: pad,
          right: padExtra,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();
      
      // Composite icon over gradient and flatten (remove alpha)
      await sharp(gradientBuffer)
        .composite([{ input: iconBuffer, gravity: 'center' }])
        .flatten({ background: { r: 255, g: 255, b: 255 } }) // Flatten to remove alpha
        .png()
        .toFile(outPath);
    }
    
    console.log(`→ ${icon.filename} (${icon.px}px) with ${iosPadding}% padding`);
  }

  const contentsJson = {
    images: IOS_ICONS.map(icon => ({
      idiom: icon.idiom,
      size: icon.size,
      scale: icon.scale,
      filename: icon.filename
    })),
    info: {
      version: 1,
      author: "xcode"
    }
  };

  await fs.writeJson(path.join(IOS_APPICON_PATH, "Contents.json"), contentsJson, {
    spaces: 2
  });

  console.log("\n✅ Done. Android + iOS icons generated with custom padding and background colors.");
}

run().catch(err => {
  console.error("💥 Error:", err);
  process.exit(1);
});
