import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Initiates the Canva OAuth 2.0 PKCE Flow
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get("businessId") || "global"; // Default to global if not provided

        const clientId = process.env.CANVA_CLIENT_ID?.trim();
        const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
        const envRedirectUri = process.env.CANVA_REDIRECT_URL?.trim();

        const redirectUri = envRedirectUri || (appUrl ? `${appUrl}/api/auth/canva/callback` : undefined);

        console.log(`Canva Login Init: businessId=${businessId}, clientId=${clientId ? 'SET' : 'MISSING'}, redirectUri=${redirectUri}`);

        if (!clientId || !redirectUri) {
            console.error("CRITICAL: CANVA_CLIENT_ID or Redirect URI is missing.");
            return NextResponse.json({ error: "Missing configuration" }, { status: 500 });
        }

        // 1. Generate PKCE Verifier and Challenge
        const codeVerifier = crypto.randomBytes(64).toString('base64url');
        const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

        // 2. Store Code Verifier in an HttpOnly cookie
        const cookieStore = await cookies();
        cookieStore.set("canva_code_verifier", codeVerifier, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'lax',
            path: '/',
            maxAge: 600
        });

        // 3. Construct Authorization URL
        const scopes = ["design:content:read", "design:content:write", "asset:read", "asset:write", "brand_template:read"];
        const authUrl = new URL("https://www.canva.com/api/oauth/authorize");
        authUrl.searchParams.append("response_type", "code");
        authUrl.searchParams.append("client_id", clientId);
        authUrl.searchParams.append("redirect_uri", redirectUri);
        authUrl.searchParams.append("scope", scopes.join(" "));
        authUrl.searchParams.append("code_challenge", codeChallenge);
        authUrl.searchParams.append("code_challenge_method", "S256");
        authUrl.searchParams.append("state", businessId);

        console.log(`Redirecting to Canva Auth: ${authUrl.origin}${authUrl.pathname}?client_id=${clientId}&...`);
        return NextResponse.redirect(authUrl.toString());
    } catch (error: any) {
        console.error("CANVA_LOGIN_ERROR:", error);
        return NextResponse.json({
            error: "Internal Server Error in Login Route",
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        }, { status: 500 });
    }
}
