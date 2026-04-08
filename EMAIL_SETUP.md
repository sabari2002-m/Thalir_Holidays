# Email Notification Setup for Thalir Holidays

## Free Alternative: Telegram Notifications (Recommended)

If SendGrid credits are exhausted, you can receive booking alerts for free in Telegram.

### 1. Create Telegram Bot
1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Complete bot creation and copy the bot token

### 2. Get Your Chat ID
1. Send any message to your new bot in Telegram
2. Open this URL in browser (replace BOT_TOKEN):
   `https://api.telegram.org/botBOT_TOKEN/getUpdates`
3. Find `"chat":{"id": ... }` and copy that numeric id

### 3. Add Environment Variables
In your `.env` (local) and Render Environment (production), add:
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### 4. Behavior
- App tries SendGrid first (if configured)
- If SendGrid is unavailable/fails, app automatically falls back to Telegram
- If only Telegram is configured, booking notifications are still delivered

## 📧 Gmail App Password Setup

To enable email notifications, you need to create a Gmail App Password:

### Step 1: Enable 2-Step Verification
1. Go to https://myaccount.google.com/security
2. Click on **2-Step Verification** (you must enable this first)
3. Follow the prompts to set it up using your phone number

### Step 2: Create App Password
1. After enabling 2-Step Verification, go to https://myaccount.google.com/apppasswords
2. Sign in to your Google account: **sabarimanickaraj269@gmail.com**
3. Click **"Select app"** and choose **"Mail"**
4. Click **"Select device"** and choose **"Other (Custom name)"**
5. Type: **"Thalir Holidays Website"**
6. Click **"Generate"**
7. Google will show you a 16-character password like: `abcd efgh ijkl mnop`
8. **COPY THIS PASSWORD** (you won't see it again!)

### Step 3: Update .env File
1. Open the `.env` file in your project folder
2. Replace `your_app_password_here` with your 16-character app password (remove spaces):
   ```
   EMAIL_PASS=abcdefghijklmnop
   ```
3. Save the file

### Step 4: Test Locally
1. Restart your server: `npm start`
2. Submit a test booking on your website
3. Check your email: **sabarimanickaraj269@gmail.com**
4. You should receive a notification email with booking details!

### Step 5: Deploy to Render
1. Go to your Render dashboard: https://render.com
2. Find your **Thalir Holidays** service
3. Click on **"Environment"** in the left menu
4. Add these environment variables:
   - `EMAIL_USER` = `sabarimanickaraj269@gmail.com`
   - `EMAIL_PASS` = `your_16_character_app_password`
   - `NOTIFICATION_EMAIL` = `sabarimanickaraj269@gmail.com`
   - `NOTIFICATION_PHONE` = `7904004742`
5. Click **"Save Changes"**
6. Render will automatically redeploy your app

## 📱 What You'll Receive

Every time a customer submits a booking, you'll get an email with:
- ✅ Customer name, email, and phone number
- ✅ Selected package and destination
- ✅ Travel date and number of travelers
- ✅ Special requests
- ✅ Booking ID and timestamp
- ✅ Phone number: **7904004742** (displayed in email footer)

## 🔒 Security Notes

- **NEVER** share your app password publicly
- **NEVER** commit the `.env` file to GitHub (it's already in `.gitignore`)
- Only use the app password in Render's environment variables
- You can revoke the app password anytime from Google Account settings

## ✅ Data Persistence

Your booking data is stored permanently in `database.sqlite` and will **NEVER** be automatically deleted unless you:
1. Manually click the delete button in the admin panel
2. Delete the `database.sqlite` file yourself

The database persists across server restarts and deployments!

## 📞 Contact Information

- Email: sabarimanickaraj269@gmail.com
- Phone: 7904004742
- Admin Username: Vettai
- Admin Password: VettaiHoildays

---

**Need Help?** If emails aren't working, check:
1. App password is correct in `.env` and Render
2. 2-Step Verification is enabled on Gmail
3. Check spam/junk folder
4. Check server logs for error messages
