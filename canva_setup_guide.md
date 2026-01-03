# Canva Connect Integration Guide 🎨

Follow these steps to set up and authorize Canva Connect for our application.

## 1. Create an Integration in the Canva Developer Portal
1. Go to the [Canva Developer Portal](https://www.canva.com/developers/integrations).
2. Click **"Create an integration"**.
3. Choose **"Private"** if this is for your internal team, or **"Public"** if you want to publish it later.
4. Give your integration a name (e.g., "Dream Social Manager").

## 2. Obtain Credentials
1. In your integration settings, navigate to the **"Credentials"** section.
2. Copy your **Client ID**.
3. Generate and copy your **Client Secret**.
   > [!IMPORTANT]
   > The Client Secret is only displayed once. Store it securely!

## 3. Configure Authentication
1. Go to the **"Authentication"** section.
2. Add your **Redirect URL**:
   - For local development: `http://localhost:3000/api/auth/canva/callback`
3. Select the required **Scopes**:
   - `design:content:read`
   - `design:content:write`
   - `asset:read`
   - `asset:write`
   - `brand_template:read` (Required for Autofill)

## 4. Setting up the Autofill API
Our application is now configured to use the **Autofill API**. This allows us to take a "Brand Template" from your Canva account and programmatically fill it with AI-generated text and images.

### How the Autofill Logic Works
![Canva Autofill API Reference](file:///C:/Users/ServerDeskop/.gemini/antigravity/brain/df3ff4dd-7acf-4ea2-9d43-0c66fcff35d5/canva_autofill_api_ref_1767422394085.png)

1. **Find your Brand Template ID**: In Canva, open the template you want to use and copy the ID from the URL.
2. **Add ID to Dashboard**: Paste this ID into the **Canva Connect** section of the Business Dashboard.
3. **Generate**: When you click "Generate Branded Campaign", the AI will populate the template fields (Headline, CTA, etc.) automatically.

## 5. Environment Variables
Add these to your `.env` file:
```env
CANVA_CLIENT_ID=your_client_id
CANVA_CLIENT_SECRET=your_client_secret
CANVA_API_KEY=your_access_token_or_secret
```

> [!TIP]
> Use the [Canva Connect API Starter Kit](https://github.com/canva/canva-connect-api-starter-kit) for a reference implementation of the OAuth flow.
