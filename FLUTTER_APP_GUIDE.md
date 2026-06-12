# Ranganadibeta Flutter App & Play Store Deployment Guide

This document outlines the complete plan and step-by-step guide for building the Ranganadibeta mobile application in Flutter based on the latest portal updates, and successfully publishing it to the Google Play Store.

---

## Part 1: Flutter App Development Strategy

Based on the latest portal updates, the mobile app needs to interact with the existing PHP backend (`https://ranganadibeta.com/api/`) and replicate the core functionalities of the web platform for Citizens.

### 1. Key Features Needed
*   **Authentication:** Login, Signup, and JWT Token management.
*   **Dashboard:** View latest published Announcements (Publicly available).
*   **Grievances:** Ability for citizens to submit and track their complaints.
*   **Surveys/Feedback:** Submit custom surveys and general feedback.
*   **Profile Management:** View and update citizen profile details.

### 2. Recommended Tech Stack
*   **Framework:** Flutter (latest stable version)
*   **State Management:** Provider or Riverpod (for managing auth state and user data)
*   **Networking:** `http` or `dio` package (for API requests)
*   **Local Storage:** `shared_preferences` or `flutter_secure_storage` (for JWT token storage)
*   **Routing:** `go_router` (for robust navigation)

### 3. Step-by-Step Implementation Guide

#### Step 3.1: Initialize the Project
```bash
flutter create ranganadibeta_app
cd ranganadibeta_app
```

#### Step 3.2: Configure the API Client
Create a networking service that handles the JWT token.
*   The base URL should be: `https://ranganadibeta.com/api`
*   Ensure every request (except Login/Signup/Public Announcements) includes the `Authorization: Bearer <TOKEN>` header.

#### Step 3.3: Implement Authentication
1.  **Login Screen:** Takes Mobile Number/Email and Password. Hits `/api/auth.php`.
2.  **Storage:** Save the returned JWT token securely using `flutter_secure_storage`.
3.  **Auto-Login:** On app start, check if the token exists and is valid.

#### Step 3.4: Build the Main Screens
*   **Home Screen (Announcements):** Hit `/api/announcements.php` (GET request). Display them in a beautiful ListView matching the orange theme of the website.
*   **Grievance Screen:** Form to submit a complaint. Send a POST request to `/api/complaints.php`.
*   **Profile Screen:** Fetch user details from local storage/token payload or an API endpoint.

#### Step 3.5: UI/UX Guidelines
*   **Primary Color:** Orange (`#ea580c` / `Colors.orange[800]`)
*   **Typography:** Google Fonts (e.g., Inter or Poppins)
*   **Components:** Use rounded corners, soft shadows, and clean cards to match the web portal's modern aesthetic.

---

## Part 2: Google Play Store Deployment Guide

Once your Flutter app is ready, thoroughly tested, and built, follow these steps to publish it.

### Phase 1: Preparing the App for Release

> [!WARNING]
> Ensure all your API endpoints are pointing to the live production server (`https://ranganadibeta.com`) before building the release version!

1.  **Update App Version:**
    Open `pubspec.yaml` and update the version (e.g., `version: 1.0.0+1`). Every time you upload a new update, the `+1` (build number) must increase.

2.  **Add App Icons:**
    Use a package like `flutter_launcher_icons` to generate the Ranganadibeta logo for Android.

3.  **Create a Keystore:**
    You must sign your app for the Play Store. Run this command in your terminal (keep the password safe!):
    ```bash
    keytool -genkey -v -keystore c:\Users\USER_NAME\upload-keystore.jks -storetype JKS -keyalg RSA -keysize 2048 -validity 10000 -alias upload
    ```

4.  **Configure Signing in Gradle:**
    Create a file named `android/key.properties` and add your keystore details:
    ```properties
    storePassword=<password_from_previous_step>
    keyPassword=<password_from_previous_step>
    keyAlias=upload
    storeFile=c:/Users/USER_NAME/upload-keystore.jks
    ```
    *(Update your `android/app/build.gradle` to use this config as per standard Flutter docs).*

5.  **Build the App Bundle (AAB):**
    Google requires the `.aab` format instead of `.apk` for the Play Store.
    ```bash
    flutter build appbundle
    ```
    *The file will be generated at `build/app/outputs/bundle/release/app-release.aab`.*

### Phase 2: Google Play Console Setup

1.  **Create a Developer Account:**
    Go to the [Google Play Console](https://play.google.com/console) and pay the one-time $25 registration fee.
2.  **Create App:**
    Click "Create App". Name it "Ranganadibeta", select "App", "Free", and accept declarations.
3.  **Store Presence:**
    Go to **Grow > Store Presence > Main store listing**.
    *   **Short Description:** A brief 80-character pitch.
    *   **Full Description:** Detail the features (Grievances, Announcements, Surveys).
    *   **Graphics:** Upload your High-res Icon (512x512), Feature Graphic (1024x500), and Phone Screenshots.
4.  **App Content Declarations:**
    Go through the "App content" section on the bottom left menu:
    *   Privacy Policy (You need a URL on your website hosting your privacy policy).
    *   Ads (Select "No").
    *   Data Safety (Declare what data you collect: Name, Phone, Location, etc.).
    *   Government Apps (If this is officially affiliated with a government entity, declare it and provide proof. If it's a private political/social app, declare it accordingly).

### Phase 3: Rollout and Publishing

1.  **Create a Release:**
    Go to **Release > Production**. Click "Create new release".
2.  **Upload App Bundle:**
    Upload the `.aab` file you generated in Step 5.
3.  **Release Notes:**
    Add notes about what's in this version (e.g., "Initial release of the Ranganadibeta platform").
4.  **Review and Rollout:**
    Save, click "Review Release", and then **Start rollout to Production**.

> [!NOTE]
> Google Play review can take anywhere from a few hours to 7 days for a new app. Keep an eye on your email for any rejection notices and address them promptly.
