# Privacy Policy

**App Name:** CosmIQ  
**Package ID:** com.cosmic.markcon  
**Last Updated:** April 23, 2026  
**Effective Date:** April 23, 2026

---

## 1. Introduction

Welcome to CosmIQ ("we", "our", or "us"). CosmIQ is an astrology and spirituality entertainment app that provides personalised horoscopes, AI-powered cosmic readings, palm reading, love compatibility, and cosmic guides.

This Privacy Policy explains what information we collect, how we use it, who we share it with, and what rights you have. By using CosmIQ, you agree to the practices described in this policy.

> **Important Disclaimer:** CosmIQ is designed for entertainment purposes only. All horoscope readings, palm analyses, love compatibility results, and AI-generated cosmic content are for entertainment and informational purposes and should not be relied upon as factual, scientific, medical, legal, or financial advice.

---

## 2. Information We Collect

### 2.1 Information You Provide Directly

| Data | Required? | Purpose |
|---|---|---|
| **Date of Birth** | Required | To calculate your zodiac sign and generate personalised horoscope readings |
| **Zodiac Sign** | Auto-derived from DOB | Core feature — used throughout the app |
| **Name** | Optional | To personalise AI responses and readings |
| **Gender** | Optional | To personalise content |
| **City & Country** | Optional | To add location context to AI readings |
| **Partner Profiles** | Optional | For love compatibility — stored locally on your device |

Partner profiles include: partner name, birthday, zodiac sign, and optional city/country. These are stored **only on your device** and are not uploaded to our servers.

### 2.2 Palm Photos (Camera Data)

When you use the **Palm Reading** feature:
- The app requests access to your camera
- You take a photo of your palm
- That photo is **sent directly to OpenAI's API** for analysis
- The photo is **not saved** to your camera roll, **not stored** on our servers, and is **not retained** after the session ends
- The photo exists only in temporary memory during the reading session

Because palm images may be considered biometric data under applicable laws, we request your explicit consent before accessing your camera.

### 2.3 Information Collected Automatically

When you use the app, the following may be collected automatically (subject to your consent choices):

- **Device identifiers** — Advertising ID (IDFA on iOS, GAID on Android), device model, OS version, app version, build number
- **App usage events** — screens viewed, buttons tapped, features used, onboarding steps completed
- **Session data** — app open/close times, session duration
- **Crash and error logs** — anonymous crash reports for debugging
- **Install attribution data** — which ad, campaign, or channel led to your app install
- **FCM push token** — to deliver push notifications to your device

### 2.4 Subscription & Purchase Data

We do not collect or store your payment details. All billing is handled entirely by Apple (App Store) or Google (Google Play). We receive only your subscription status (active / expired) via RevenueCat to unlock premium features.

---

## 3. How We Use Your Information

We use your information to:

- Provide and personalise your horoscopes, AI chat, and cosmic readings
- Generate your birth chart and zodiac-based content
- Enable the Palm Reading feature via AI image analysis
- Deliver push notifications (daily horoscope reminders, feature updates)
- Manage your subscription and premium access
- Measure which marketing campaigns bring users to the app
- Track app stability and fix crashes
- Show relevant advertisements (if you are a free-tier user)
- Comply with legal obligations

---

## 4. Third-Party Services & Data Sharing

We work with the following third-party services. Each receives only the data necessary for their function:

### 4.1 AI Processing
| Service | Data Shared | Purpose |
|---|---|---|
| **OpenAI** | Your name, birthday, zodiac sign, city, partner info, palm photo (during reading) | Powers AI chat, cosmic readings, and palm analysis |

OpenAI's privacy policy is available at: https://openai.com/privacy

### 4.2 Analytics & Crash Reporting
| Service | Data Shared | Purpose |
|---|---|---|
| **Firebase Analytics (Google)** | Anonymous user ID, screen views, app events, device type | App usage analytics |
| **Firebase Crashlytics (Google)** | Crash logs, error stack traces, device info | Crash detection and fixing |
| **Sentry** | Error logs, crash reports, session data | Bug fixing and performance monitoring |

### 4.3 Attribution & Marketing Analytics
| Service | Data Shared | Purpose |
|---|---|---|
| **AppsFlyer** | Install source, campaign data, AppsFlyer UID | Measures which ads/campaigns drive installs |
| **Facebook (Meta) SDK** | App events (screen views, purchases, subscriptions), Facebook Anonymous ID | Marketing analytics and campaign measurement |

### 4.4 Subscriptions & Payments
| Service | Data Shared | Purpose |
|---|---|---|
| **RevenueCat** | Subscription status, device info (model, OS, app version), AppsFlyer ID, Facebook Anonymous ID, IDFA/IDFV (after ATT consent) | Subscription management and purchase attribution |

### 4.5 Advertising
| Service | Data Shared | Purpose |
|---|---|---|
| **AppLovin MAX** | Device advertising ID (after consent) | Serves banner, interstitial, and rewarded ads |
| **Google AdMob** | Device advertising ID (after consent) | Ad mediation partner via AppLovin |
| **Unity Ads** | Device advertising ID (after consent) | Ad mediation partner via AppLovin |

### 4.6 Consent Management
| Service | Data Shared | Purpose |
|---|---|---|
| **Usercentrics** | Your consent decision (accepted/declined) | GDPR/CCPA compliant consent management |

### 4.7 No Sale of Personal Data

**We do not sell your personal data to any third party.**

---

## 5. Advertising

CosmIQ is a fully subscription-based app. **Active premium subscribers do not see advertisements.**

Ad infrastructure is integrated (AppLovin MAX with Google AdMob and Unity Ads as mediation partners) but ads are not served to users holding an active subscription. Ads may appear only on paywall or introductory screens prior to subscribing.

On iOS, we display an **App Tracking Transparency (ATT)** prompt before accessing your advertising identifier. If you decline, no advertising ID is collected.

---

## 6. Data Storage & Security

### 6.1 What Is Stored On Your Device
The following data is saved locally on your device using AsyncStorage and Redux Persist:
- Birthday, name, gender, city, country
- Zodiac sign, partner profiles
- Cached horoscope and cosmic data
- Subscription status
- Notification preferences
- Consent choices
- Lesson/guide completion history

This data persists across app restarts for a seamless experience.

### 6.2 What Goes to Our Servers
- API requests for AI-generated content (sending your profile data to generate readings)
- The GPT API key is fetched from our server at app launch

### 6.3 Security Measures
We implement the following measures to protect your data:
- All data in transit is encrypted using **TLS (HTTPS)**
- Firebase and cloud services use **AES-256 encryption at rest**
- Anonymous Firebase authentication — no email or password stored
- No plaintext credentials stored on-device

### 6.4 Data Retention
- **On-device data:** Retained until you delete the app or use the "Delete My Data" option
- **Analytics data (Firebase):** Retained per Google's standard retention policy (up to 14 months)
- **Crash logs (Sentry):** Retained for 90 days
- **Attribution data (AppsFlyer):** Retained per AppsFlyer's policy (up to 7 years for attribution records)
- **After account/data deletion:** All identifiable server-side data deleted within **30 days**

---

## 7. Your Rights & Controls

Depending on your location, you may have the following rights:

### 7.1 All Users
- **Opt out of personalised ads** — via device settings (Limit Ad Tracking on iOS / Opt out of Ads Personalisation on Android)
- **Revoke camera permission** — via device Settings → CosmIQ → Camera
- **Turn off push notifications** — via the Profile screen in the app or device Settings
- **Edit your profile data** — via the Profile screen (name, birthday, city, country)

### 7.2 GDPR (EU/EEA/UK) Users
You have the right to:
- **Access** — request a copy of your personal data
- **Rectification** — correct inaccurate data
- **Erasure ("Right to be Forgotten")** — request deletion of your data
- **Restriction** — limit how we process your data
- **Portability** — receive your data in a portable format
- **Object** — object to processing based on legitimate interests
- **Withdraw consent** — at any time, without affecting prior processing

### 7.3 CCPA (California) Users
You have the right to:
- Know what personal information is collected
- Know whether your personal information is sold or disclosed (it is not)
- Opt out of the sale of personal information (**we do not sell your data**)
- Request deletion of your personal information
- Not be discriminated against for exercising these rights

### 7.4 Delete My Data
To delete your data:
1. Use the **"Delete My Data"** option in the app (Profile screen → Settings)
2. Or email us at: **[your-support-email@cosmiq.app]**

We will process deletion requests within **30 days**.

---

## 8. Children's Privacy

CosmIQ is not directed at children under the age of **13** (or **16** in the EU). We do not knowingly collect personal information from children.

If you believe a child has provided us with personal information, please contact us at **[your-support-email@cosmiq.app]** and we will delete it promptly.

---

## 9. Consent Management (GDPR / ATT)

### iOS — App Tracking Transparency
On iOS 14.5+, we display Apple's ATT permission prompt before accessing your advertising identifier (IDFA). If you decline:
- No advertising ID is collected
- AppsFlyer and Facebook tracking SDKs are not fully initialised
- Only contextual (non-personalised) ads are shown

### All Regions — Usercentrics Consent Banner
In regions that require consent (EU, UK, California, etc.), a consent banner is displayed on first launch via **Usercentrics**. If you decline:
- Tracking SDKs (AppsFlyer, Facebook) are not initialised
- No advertising ID is collected
- Only essential app functionality runs

You can review or change your consent choices at any time in the app settings.

---

## 10. Push Notifications

We use **Firebase Cloud Messaging (FCM)** for remote push notifications and **Notifee** for local scheduled notifications.

Notifications are used for:
- Daily horoscope reminders
- Feature highlights
- Subscription-related alerts

You can disable notifications at any time:
- In the app: Profile screen → Notifications toggle
- In device Settings: Notifications → CosmIQ → turn off

---

## 11. Links to Third-Party Services

Our app links to third-party privacy policies and terms pages. We are not responsible for the privacy practices of external services. We encourage you to review the privacy policies of:
- OpenAI: https://openai.com/privacy
- Google / Firebase: https://policies.google.com/privacy
- Facebook / Meta: https://www.facebook.com/privacy/policy
- AppsFlyer: https://www.appsflyer.com/legal/services-privacy-policy/
- RevenueCat: https://www.revenuecat.com/privacy
- AppLovin: https://www.applovin.com/privacy/
- Sentry: https://sentry.io/privacy/
- Usercentrics: https://usercentrics.com/privacy-policy/

---

## 12. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. When we do:
- The "Last Updated" date at the top of this page will be revised
- For significant changes, we will notify you via a push notification or in-app alert
- Continued use of the app after the effective date constitutes acceptance of the updated policy

We recommend reviewing this policy periodically.

---

## 13. Contact Us

If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:

**Email:** [your-support-email@cosmiq.app]  
**Website:** https://whoop.myappsstudio.com/privacy-policy.html  
**App:** CosmIQ (com.cosmic.markcon)

For GDPR-related requests, please include "GDPR Request" in the subject line.  
For CCPA-related requests, please include "CCPA Request" in the subject line.

---

*This Privacy Policy was last updated on April 23, 2026.*
