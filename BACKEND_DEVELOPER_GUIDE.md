# BACKEND DEVELOPER GUIDE - PRIVACY & COMPLIANCE REQUIREMENTS

**Project**: Cosmiq  
**Date**: April 22, 2026  
**Documents**: Privacy Policy & Terms and Conditions

---

## EXECUTIVE SUMMARY

This document provides essential information for backend developers to ensure compliance with App Store and Play Store guidelines, as well as privacy regulations (GDPR, CCPA).

---

## 1. DATA COLLECTION OVERVIEW

### 1.1 Personal Data We Collect

**REQUIRED FIELD:**
- ✅ **Date of Birth** - Used for horoscope calculations and zodiac determination

**OPTIONAL FIELDS:**
- Name (for personalization)
- Gender identity (for personalized readings)
- Birth location (city, country) (for astrological charts)
- Email (for account creation)
- Social login data (Google, Facebook, Apple)

**MEDIA DATA:**
- Palm images (photos of hands) - Stored temporarily for analysis
- Chat messages with AI Oracle

**TECHNICAL DATA:**
- Device information (type, OS, device ID)
- Usage analytics (screens viewed, features used)
- Advertising ID (IDFA/GAID)
- Location (city/country level only)
- IP address, log data, crash reports

### 1.2 Data Retention Policy

| Data Type | Retention Period | Notes |
|-----------|-----------------|-------|
| Active user data | While account is active | - |
| Palm images | 90 days after analysis | Then automatically deleted |
| Chat history | 12 months | Or until account deletion |
| Analytics data | 24 months (aggregated) | Anonymized after period |
| Deleted account data | 30 days maximum | Permanent deletion |

**ACTION REQUIRED**: Implement automated deletion jobs for:
- Palm images older than 90 days
- Chat history older than 12 months
- Deleted account data after 30 days

---

## 2. BACKEND API REQUIREMENTS

### 2.1 User Data Endpoints

**Required Endpoints:**

```
POST /api/auth/register
POST /api/auth/login
POST /api/users/profile
PUT /api/users/profile
DELETE /api/users/account

GET /api/horoscope/daily
POST /api/palm-reading/analyze
POST /api/chat/send-message
GET /api/chat/history
POST /api/compatibility/calculate
```

### 2.2 Data Privacy Endpoints

**GDPR/CCPA Compliance Endpoints (REQUIRED):**

```
GET /api/users/export-data        # GDPR Right to Data Portability
DELETE /api/users/delete-account  # GDPR Right to Erasure
GET /api/users/data-summary       # GDPR Right to Access
PUT /api/users/privacy-preferences # GDPR Right to Object
```

**Response Format for Export Data:**
```json
{
  "user_id": "uuid",
  "personal_data": {
    "name": "John Doe",
    "email": "john@example.com",
    "birth_date": "1990-01-15",
    "zodiac_sign": "Capricorn",
    "gender": "male",
    "location": {
      "city": "New York",
      "country": "USA"
    }
  },
  "usage_data": {
    "account_created": "2026-01-01T00:00:00Z",
    "last_login": "2026-04-22T10:30:00Z",
    "subscription_status": "premium"
  },
  "content_data": {
    "chat_messages": [...],
    "palm_readings": [...]
  },
  "export_date": "2026-04-22T12:00:00Z"
}
```

### 2.3 Data Security Requirements

**MANDATORY:**
- ✅ All API endpoints MUST use HTTPS/TLS 1.2+
- ✅ Encrypt sensitive data at rest (AES-256)
- ✅ Hash passwords with bcrypt or Argon2
- ✅ Implement rate limiting to prevent abuse
- ✅ Use JWT or secure session tokens with expiration
- ✅ Validate and sanitize all user inputs
- ✅ Implement CORS properly
- ✅ Store palm images in secure, encrypted storage (S3 with encryption)
- ✅ Delete palm images after 90 days (automated job)

**Database Security:**
```sql
-- Example: Encrypt sensitive fields
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE ENCRYPTED,
    name VARCHAR(255) ENCRYPTED,
    birth_date DATE ENCRYPTED,
    password_hash VARCHAR(255),
    created_at TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
```

---

## 3. THIRD-PARTY SERVICE INTEGRATION

### 3.1 Services Used in App

| Service | Purpose | Data Shared | Privacy Policy Required |
|---------|---------|-------------|-------------------------|
| Firebase | Analytics, Auth, Messaging | User ID, device info, usage data | ✅ Yes |
| Facebook SDK | Login, Analytics | User ID, email, profile | ✅ Yes |
| Google Sign-In | Authentication | User ID, email, profile | ✅ Yes |
| Apple Sign-In | Authentication | User ID, email | ✅ Yes |
| AppLovin MAX | Advertising | Device ID, Ad ID, usage data | ✅ Yes |
| AppsFlyer | Attribution | Device ID, install data | ✅ Yes |
| RevenueCat | Subscriptions | User ID, purchase data | ✅ Yes |
| Sentry | Error tracking | Crash logs, device info | ✅ Yes |

### 3.2 Backend Communication with Third-Party Services

**Required:**
- Use server-side SDK keys (NOT exposed in client)
- Implement webhook handlers for RevenueCat subscription events
- Log third-party API errors to Sentry
- Implement retry logic with exponential backoff

---

## 4. USER CONSENT MANAGEMENT

### 4.1 Consent Types

**GDPR Consent Required for EEA Users:**
- Data processing consent (essential)
- Analytics tracking consent (optional)
- Marketing/advertising consent (optional)
- Third-party data sharing consent (optional)

### 4.2 Backend Consent Storage

**Database Schema:**
```sql
CREATE TABLE user_consents (
    user_id UUID REFERENCES users(id),
    consent_type VARCHAR(50), -- 'essential', 'analytics', 'advertising', 'marketing'
    consented BOOLEAN,
    consent_date TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    gdpr_applies BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (user_id, consent_type)
);
```

### 4.3 Consent API Endpoints

```
POST /api/users/consent
GET /api/users/consent
PUT /api/users/consent/:type
```

**Example Request:**
```json
{
  "consents": {
    "essential": true,
    "analytics": true,
    "advertising": false,
    "marketing": false
  },
  "gdpr_applies": true,
  "ip_address": "1.2.3.4",
  "user_agent": "Mozilla/5.0..."
}
```

---

## 5. PALM READING IMAGE HANDLING

### 5.1 Image Upload Security

**Requirements:**
- ✅ Validate file type (JPEG, PNG only)
- ✅ Check file size (max 10MB)
- ✅ Scan for malware/viruses
- ✅ Strip EXIF metadata (GPS, device info)
- ✅ Store in encrypted cloud storage (AWS S3 with encryption)
- ✅ Generate unique, non-guessable filenames (UUID)
- ✅ Set appropriate access permissions (private)

**API Endpoint:**
```
POST /api/palm-reading/upload
Content-Type: multipart/form-data

Response:
{
  "image_id": "uuid",
  "image_url": "https://secure-storage.example.com/palm-images/{uuid}.jpg",
  "expires_at": "2026-07-21T00:00:00Z", // 90 days
  "analysis_status": "pending"
}
```

### 5.2 Automated Deletion Job

**Cron Job (runs daily):**
```python
# Example Python pseudocode
def delete_expired_palm_images():
    # Find images older than 90 days
    expired_images = db.query(
        "SELECT id, storage_path FROM palm_images "
        "WHERE created_at < NOW() - INTERVAL '90 days'"
    )
    
    for image in expired_images:
        # Delete from cloud storage
        s3_client.delete_object(image.storage_path)
        
        # Delete database record
        db.execute("DELETE FROM palm_images WHERE id = ?", image.id)
        
        # Log deletion for audit
        audit_log.info(f"Deleted palm image: {image.id}")
```

---

## 6. AI CHAT MESSAGE HANDLING

### 6.1 Chat Data Storage

**Requirements:**
- Store chat history for 12 months
- Associate messages with user accounts
- Encrypt sensitive messages
- Implement message deletion
- Support export for GDPR compliance

**Database Schema:**
```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    role VARCHAR(10), -- 'user' or 'assistant'
    content TEXT ENCRYPTED,
    timestamp TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL,
    INDEX idx_user_timestamp (user_id, timestamp)
);
```

### 6.2 Chat API Endpoints

```
POST /api/chat/send         # Send message to AI
GET /api/chat/history       # Get chat history
DELETE /api/chat/message/:id # Delete specific message
DELETE /api/chat/clear      # Clear all chat history
```

### 6.3 AI Integration

**Backend Flow:**
1. Receive user message
2. Validate and sanitize input
3. Check subscription status (free vs premium limits)
4. Call AI API (OpenAI, Claude, etc.)
5. Store both user message and AI response
6. Return AI response to client
7. Implement rate limiting (e.g., 10 messages/hour for free users)

---

## 7. SUBSCRIPTION MANAGEMENT

### 7.1 RevenueCat Integration

**Required Webhook Endpoints:**

```
POST /api/webhooks/revenuecat/purchase       # New purchase
POST /api/webhooks/revenuecat/renewal        # Subscription renewal
POST /api/webhooks/revenuecat/cancellation   # Subscription cancelled
POST /api/webhooks/revenuecat/refund         # Refund issued
POST /api/webhooks/revenuecat/expiration     # Subscription expired
```

**Webhook Signature Verification:**
```python
import hmac
import hashlib

def verify_revenuecat_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
```

### 7.2 Subscription Status Endpoint

```
GET /api/users/subscription

Response:
{
  "status": "active|cancelled|expired|trial",
  "plan": "weekly|monthly|yearly|lifetime",
  "expires_at": "2026-05-22T00:00:00Z",
  "auto_renew": true,
  "trial_ends_at": null,
  "features": {
    "unlimited_chat": true,
    "advanced_palm_reading": true,
    "ad_free": true
  }
}
```

---

## 8. COMPLIANCE CHECKLIST

### 8.1 GDPR Compliance (EU Users)

- [ ] Implement explicit consent collection
- [ ] Provide clear privacy policy
- [ ] Enable data export (Right to Data Portability)
- [ ] Enable account deletion (Right to Erasure)
- [ ] Enable data correction (Right to Rectification)
- [ ] Implement data minimization (only collect necessary data)
- [ ] Document legal basis for processing
- [ ] Appoint Data Protection Officer (if required)
- [ ] Report data breaches within 72 hours
- [ ] Implement cookie consent banner (if using cookies)

### 8.2 CCPA Compliance (California Users)

- [ ] Disclose data collection practices
- [ ] Enable opt-out of data sale (Do Not Sell)
- [ ] Provide data access mechanism
- [ ] Enable account deletion
- [ ] Do not discriminate against users who exercise rights
- [ ] Verify user identity before data requests

### 8.3 App Store Requirements (iOS)

- [ ] Complete App Privacy section in App Store Connect
- [ ] Declare all data types collected
- [ ] Provide Privacy Policy link in app metadata
- [ ] Implement App Tracking Transparency (ATT) prompt
- [ ] Include PrivacyInfo.xcprivacy manifest
- [ ] Declare third-party SDK data usage

### 8.4 Play Store Requirements (Android)

- [ ] Complete Data Safety section in Google Play Console
- [ ] Declare data collection and sharing practices
- [ ] Provide Privacy Policy link
- [ ] Request permissions appropriately (runtime permissions)
- [ ] Declare advertising ID usage

---

## 9. ERROR HANDLING AND LOGGING

### 9.1 Security Logging

**Log the following for security audits:**
- Failed login attempts (rate limiting trigger)
- Account creation and deletion
- Password changes
- Consent updates
- Data export requests
- API authentication failures
- Suspicious activity patterns

**Do NOT log:**
- Passwords (even hashed)
- Full credit card numbers
- Social security numbers
- Full authentication tokens

### 9.2 Error Responses

**Standardized Error Format:**
```json
{
  "error": {
    "code": "INVALID_BIRTH_DATE",
    "message": "Birth date must be in the past",
    "status": 400,
    "timestamp": "2026-04-22T12:00:00Z",
    "request_id": "uuid"
  }
}
```

---

## 10. TESTING REQUIREMENTS

### 10.1 Privacy Testing Checklist

- [ ] Test data export functionality
- [ ] Test account deletion (all data removed)
- [ ] Test palm image deletion after 90 days
- [ ] Test chat history deletion after 12 months
- [ ] Test GDPR consent flow
- [ ] Test rate limiting on API endpoints
- [ ] Test permission validations
- [ ] Test encryption of sensitive data
- [ ] Verify third-party integrations comply with privacy policy

### 10.2 Security Testing

- [ ] Penetration testing
- [ ] SQL injection testing
- [ ] XSS vulnerability testing
- [ ] CSRF protection testing
- [ ] API authentication testing
- [ ] Rate limiting testing
- [ ] File upload validation testing

---

## 11. DEPLOYMENT CHECKLIST

### Before Production Launch:

- [ ] Privacy Policy and Terms published and accessible
- [ ] SSL/TLS certificates installed and valid
- [ ] Database encryption enabled
- [ ] Backup and disaster recovery plan in place
- [ ] Monitoring and alerting configured (Sentry, etc.)
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Environment variables secured (no hardcoded secrets)
- [ ] Automated deletion jobs scheduled
- [ ] Webhook endpoints secured with signature verification
- [ ] Log retention policy configured
- [ ] GDPR/CCPA compliance verified
- [ ] Security audit completed

---

## 12. IMPORTANT BACKEND APIS TO IMPLEMENT

### Priority 1 (Must Have):

1. **User Authentication**
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/logout
   - POST /api/auth/refresh-token

2. **User Profile**
   - GET /api/users/profile
   - PUT /api/users/profile
   - DELETE /api/users/account

3. **Horoscope**
   - GET /api/horoscope/daily
   - GET /api/horoscope/weekly
   - GET /api/horoscope/monthly

4. **Love Compatibility**
   - POST /api/compatibility/calculate

5. **Palm Reading**
   - POST /api/palm-reading/upload
   - POST /api/palm-reading/analyze
   - GET /api/palm-reading/history

6. **AI Chat**
   - POST /api/chat/send
   - GET /api/chat/history
   - DELETE /api/chat/clear

7. **Subscription**
   - GET /api/users/subscription
   - POST /api/webhooks/revenuecat/*

### Priority 2 (GDPR Compliance):

8. **Privacy & Compliance**
   - GET /api/users/export-data
   - DELETE /api/users/delete-account
   - POST /api/users/consent
   - GET /api/users/consent

---

## 13. CONTACT INFORMATION

**For Privacy Policy & Terms Updates:**
- Update both documents when data collection practices change
- Notify users of material changes
- Maintain version history

**Legal Contact:**
- Email: [your-legal-email@domain.com]
- Privacy Officer: [your-privacy-email@domain.com]

---

## 14. QUICK REFERENCE

### Data Retention Summary:
- **Palm Images**: 90 days → Auto-delete
- **Chat History**: 12 months → Auto-delete
- **Analytics**: 24 months → Anonymize
- **Deleted Accounts**: 30 days → Permanent deletion

### Encryption Standards:
- **Data in Transit**: TLS 1.2+
- **Data at Rest**: AES-256
- **Passwords**: bcrypt or Argon2

### Required Compliance:
- ✅ GDPR (EU users)
- ✅ CCPA (California users)
- ✅ App Store Guidelines
- ✅ Play Store Guidelines
- ✅ Children's Privacy (COPPA - no users under 13)

---

## NEXT STEPS FOR BACKEND DEVELOPER

1. **Read both Privacy Policy and Terms & Conditions documents thoroughly**
2. **Implement all required API endpoints (Section 12)**
3. **Set up automated deletion jobs (Section 5.2)**
4. **Configure third-party service integrations (Section 3)**
5. **Implement GDPR compliance endpoints (Section 2.2)**
6. **Set up security measures (Section 2.3)**
7. **Complete testing checklist (Section 10)**
8. **Review deployment checklist before launch (Section 11)**

---

**Document Version**: 1.0  
**Last Updated**: April 22, 2026  
**Prepared for**: Backend Development Team
