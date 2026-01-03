import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Initiates the Canva OAuth 2.0 PKCE Flow
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
        return NextResponse.json({ error: "Missing businessId in query" }, { status: 400 });
    }

    const clientId = process.env.CANVA_CLIENT_ID;
    const redirectUri = process.env.CANVA_REDIRECT_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/canva/callback`;

    if (!clientId) return NextResponse.json({ error: "Missing Canva Client ID" }, { status: 500 });

    // 1. Generate PKCE Verifier and Challenge
    const codeVerifier = crypto.randomBytes(64).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

    // 2. Store Code Verifier in an HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set("canva_code_verifier", codeVerifier, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 600
    });

    // 3. Construct Authorization URL
    const scopes = ["design:content:read", "design:content:write", "asset:read", "asset:write", "brand_template:read"];
    const authUrl = new URL("https://www.canva.com/api/oauth/v1/authorize");
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", scopes.join(" "));
    authUrl.searchParams.append("code_challenge", codeChallenge);
    authUrl.searchParams.append("code_challenge_method", "S256");
    authUrl.searchParams.append("state", businessId); // Pass businessId to callback

    return NextResponse.redirect(authUrl.toString());
}
