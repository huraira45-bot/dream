import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const businessId = searchParams.get("state");
    const error = searchParams.get("error");
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");
        const businessId = searchParams.get("state") || "global"; // state handles businessId
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (error) {
            console.error(`Canva OAuth Error Callback: ${error} - ${errorDescription}`);
            return NextResponse.json({ error: `Auth Error: ${error}`, details: errorDescription }, { status: 400 });
        }

        if (!code) {
            console.error("Canva OAuth Callback: Missing authorization code.");
            return NextResponse.json({ error: "Missing code" }, { status: 400 });
        }

        const clientId = process.env.CANVA_CLIENT_ID?.trim();
        const clientSecret = process.env.CANVA_CLIENT_SECRET?.trim();
        const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
        const envRedirectUri = process.env.CANVA_REDIRECT_URL?.trim();

        const redirectUri = envRedirectUri || (appUrl ? `${appUrl}/api/auth/canva/callback` : undefined);

        if (!clientId || !clientSecret || !redirectUri) {
            console.error("CRITICAL: Canva credentials or Redirect URI missing in callback.");
            return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
        }

        // 1. Retrieve the code verifier from the cookie
        const cookieStore = await cookies();
        const codeVerifier = cookieStore.get("canva_code_verifier")?.value;

        if (!codeVerifier) {
            console.error("Canva OAuth Callback: Missing code_verifier cookie. (Possbily expired or cross-domain issue)");
            return NextResponse.json({ error: "Missing session (code verifier). Please try again." }, { status: 400 });
        }

        // 2. Exchange code for access token
        console.log(`Exchanging code for token... (RedirectURI: ${redirectUri})`);
        const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const response = await fetch("https://api.canva.com/rest/v1/oauth/token", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${basicAuth}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code,
                redirect_uri: redirectUri,
                code_verifier: codeVerifier
            })
        });

        if (!response.ok) {
            const errBody = await response.json();
            console.error("Canva Token Exchange Failed:", JSON.stringify(errBody));
            return NextResponse.json({ error: "Token Exchange Failed", details: errBody }, { status: response.status });
        }

        const tokens = await response.json();
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

        console.log("-----------------------------------------");
        console.log("🔑 CANVA GLOBAL TOKEN GENERATED!");
        console.log("-----------------------------------------");

        // 3. Save tokens to Global Settings
        await (prisma as any).globalSetting.upsert({
            where: { id: "platform-settings" },
            create: {
                id: "platform-settings",
                canvaAccessToken: tokens.access_token,
                canvaRefreshToken: tokens.refresh_token,
                canvaTokenExpiresAt: expiresAt
            },
            update: {
                canvaAccessToken: tokens.access_token,
                canvaRefreshToken: tokens.refresh_token,
                canvaTokenExpiresAt: expiresAt
            }
        });

        // 4. Clean up cookie
        cookieStore.delete("canva_code_verifier");

        // 5. Redirect back
        const targetUrl = businessId === "global"
            ? `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?canva=success`
            : `${process.env.NEXT_PUBLIC_APP_URL}/admin/business/${businessId}?canva=success`;

        return NextResponse.redirect(targetUrl);

    } catch (err: any) {
        console.error("Canva OAuth Callback Exception:", err);
        return NextResponse.json({
            error: "Internal Server Error in Callback",
            message: err.message
        }, { status: 500 });
    }
}
