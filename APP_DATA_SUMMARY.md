# CosmIQ App — What's Inside (Plain English)

---

## What the App Does

CosmIQ is an astrology and spirituality app. It gives users:
- Daily & weekly horoscopes
- AI-powered cosmic readings and chat
- Palm reading (photo-based)
- Love compatibility matching
- Cosmic guides / lessons
- Push notification reminders
- Subscription-based premium access

---

## What Information the App Collects From Users

### During Sign-Up / Onboarding
| What | Why |
|---|---|
| **Birthday** | To calculate your zodiac sign and give personalised readings |
| **Zodiac sign** | Derived automatically from birthday |
| **Name** | Optional — used to personalise AI responses |
| **Gender** | Optional — used for personalisation |
| **City & Country** | Optional — used to add location context to readings |

### Love Match Feature
- Users can add **partner profiles** (partner name, birthday, zodiac sign, city/country)
- These are stored locally on the device only

### Palm Reading Feature
- The app opens your **camera** to take a photo of your palm
- That photo is sent directly to **OpenAI** (the company behind ChatGPT) for analysis
- The photo is **not saved** to your gallery, not stored on our servers, and not kept after the session

---

## Who Receives Your Data (Third Parties)

| Company | What They Get | Why |
|---|---|---|
| **OpenAI** | Your name, birthday, zodiac sign, city, partner info, and palm photos | Powers the AI chat and palm reading features |
| **Firebase (Google)** | Anonymous user ID, app events, screen views, crash logs | App analytics and crash reporting |
| **AppsFlyer** | Install source (which ad/link brought you to the app) | Measures marketing effectiveness |
| **Facebook (Meta)** | App events — screens visited, buttons tapped, subscription activity | Marketing analytics |
| **RevenueCat** | Subscription status, device info (model, OS version, app version) | Manages subscriptions and purchases |
| **AppLovin** | Device identifier (after permission granted) | Serves ads inside the app |
| **Google AdMob** | Device identifier | Ad partner inside AppLovin |
| **Unity Ads** | Device identifier | Ad partner inside AppLovin |
| **Sentry** | Crash reports and error logs | Bug fixing and stability |
| **Usercentrics** | Whether you accepted or declined tracking | Manages your privacy consent |

---

## What is Stored on Your Device

All of the below is saved on-device (not on our servers):

- Your birthday, name, gender, city, country
- Your zodiac sign
- Partner profiles you added
- Whether you completed onboarding
- Whether you're a subscriber
- Your daily/weekly horoscope (cached so it loads fast)
- Notification preferences
- App rating prompt history
- Your privacy consent choice (accepted / declined)
- Lesson completion progress (Cosmic Guides)

---

## What the App Does NOT Collect

- No email address
- No passwords (login is anonymous via Firebase)
- No phone number
- No GPS / precise location (city and country are typed in by the user)
- No contacts
- No health data
- No microphone access
- No profile photos or avatars (just a default icon)

---

## Ads

The app **does show ads**. The ad network is **AppLovin MAX**, which uses:
- **Google AdMob** as a partner
- **Unity Ads** as a partner

After you grant tracking permission (ATT on iPhone), advertisers can use your device's advertising ID to show you relevant ads.

---

## Subscriptions & Payments

- Payments are handled entirely by the **App Store / Google Play**
- Subscription management is handled by **RevenueCat**
- The app checks for a subscription entitlement called **"Premium_Access"**
- No card details ever touch the app — all billing goes through Apple or Google

---

## Push Notifications

- The app uses **Firebase Cloud Messaging (FCM)** for remote push notifications
- Local scheduled notifications are managed by **Notifee**
- You can toggle notifications on/off from the Profile screen
- The app will ask your permission before sending any notifications

---

## Privacy Consent

- The app uses **Usercentrics** — a consent management tool
- In regions that require it (e.g. EU/GDPR), a consent banner is shown before any tracking starts
- On iPhone, an **App Tracking Transparency (ATT)** prompt is shown before your advertising ID is accessed
- If you decline, tracking SDKs (AppsFlyer, Facebook) are **not initialised**

---

## Summary in One Paragraph

CosmIQ collects your birthday and optionally your name, gender, and location to power personalised horoscopes and AI chat. It uses your camera for palm reading, sending photos to OpenAI for analysis — photos are never saved. The app is anonymous (no account or email needed). It shows ads via AppLovin, tracks installs via AppsFlyer, logs app events to Firebase and Facebook, manages subscriptions via RevenueCat, and reports crashes via Sentry. All sensitive tracking requires your consent first.

---

*Last updated: April 2026*
