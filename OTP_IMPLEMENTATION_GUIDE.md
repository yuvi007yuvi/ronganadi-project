# Email Verification via OTP Implementation Guide

This guide outlines the standard architecture and implementation steps for verifying user email addresses using a One-Time Password (OTP).

## 1. System Components

*   **Database:** To temporarily store the OTP, its expiration time, and associate it with a user or email address.
*   **Email Service Provider (ESP):** A service like SendGrid, AWS SES, Mailgun, or standard SMTP to send the email.
*   **Backend API:** To generate the OTP, send it, and verify it.
*   **Frontend UI:** To collect the email address, prompt for the OTP, and display the result.

## 2. Database Schema Design

You will need a table to store OTPs. Here is an example schema:

```sql
CREATE TABLE email_otps (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
*(Alternatively, you can store the OTP directly in the `users` table if the user is already created, or use an in-memory database like Redis for faster access and automatic expiration).*

## 3. Workflow Steps

### Step 1: User Requests Verification (or Registers)
1.  The user enters their email address on the frontend.
2.  The frontend sends a `POST` request to `/api/auth/request-otp` with the email.

### Step 2: Backend Generates and Stores OTP
1.  **Generate OTP:** Generate a random numeric string (usually 4 to 6 digits).
    *   *Security Note:* Use a cryptographically secure random number generator, not standard `Math.random()`.
2.  **Calculate Expiration:** Set an expiration time (e.g., 5 to 10 minutes from now).
3.  **Invalidate Old OTPs:** Mark any previous unverified OTPs for this email as expired to prevent abuse.
4.  **Save to DB:** Insert the new OTP record into your database.

### Step 3: Backend Sends the Email
1.  Construct an email template containing the OTP. Keep it simple and clear.
2.  Use your Email Service Provider to send the email to the user's address.
3.  Return a success response to the frontend (do not include the OTP in the response).

### Step 4: User Enters OTP
1.  The user checks their email, copies the OTP, and enters it into the frontend form.
2.  The frontend sends a `POST` request to `/api/auth/verify-otp` with the `email` and the `otp_code`.

### Step 5: Backend Verifies OTP
1.  Fetch the latest OTP record from the database for the given `email`.
2.  **Validation Checks:**
    *   Does the record exist?
    *   Does the provided `otp_code` match the stored `otp_code`?
    *   Is the current time before `expires_at`?
    *   Is `is_verified` still `false`?
3.  **Success:**
    *   Mark the OTP record as `is_verified = true`.
    *   Update the user's status in the main `users` table to indicate their email is verified.
    *   Return a success response (and optionally authenticate the user by returning a JWT or session token).
4.  **Failure:**
    *   Return an appropriate error message (e.g., "Invalid OTP", "OTP Expired").

## 4. Security Best Practices

> [!WARNING]
> Security is critical in OTP flows. Ensure you implement the following protections.

*   **Rate Limiting:** Strongly limit how often a user can request an OTP (e.g., max 3 requests per 5 minutes per IP/Email) to prevent email spamming and enumeration attacks.
*   **Brute-Force Protection:** Limit the number of failed verification attempts (e.g., max 3-5 failed attempts). After the limit is reached, invalidate the OTP and force them to request a new one.
*   **Short Expiration:** OTPs should expire quickly (5-10 minutes maximum).
*   **Secure Generation:** Use CSPRNG (Cryptographically Secure Pseudo-Random Number Generator) for creating the OTPs.
*   **Do Not Log OTPs:** Never write plaintext OTPs into your application logs.
