import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const businessId = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin/business/${businessId}?error=canva_denied`);
    }

    if (!code || !businessId) {
        return NextResponse.json({ error: "Missing required OAuth parameters" }, { status: 400 });
    }

    // 1. Get the code verifier from the cookie
    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get("canva_code_verifier")?.value;

    if (!codeVerifier) {
        return NextResponse.json({ error: "Missing code verifier (session expired)" }, { status: 400 });
    }

    const clientId = process.env.CANVA_CLIENT_ID;
    const clientSecret = process.env.CANVA_CLIENT_SECRET;
    const redirectUri = process.env.CANVA_REDIRECT_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/canva/callback`;

    if (!clientId || !clientSecret) {
        return NextResponse.json({ error: "Server credential configuration error" }, { status: 500 });
    }

    try {
        // 2. Exchange code for tokens
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
            const errData = await response.json();
            throw new Error(`Canva Token Error: ${JSON.stringify(errData)}`);
        }

        const tokens = await response.json();
        // tokens include: access_token, refresh_token, expires_in, etc.

        // 3. Save tokens to the business
        await prisma.business.update({
            where: { id: businessId },
            data: {
                canvaAccessToken: tokens.access_token,
                canvaRefreshToken: tokens.refresh_token
            } as any
        });

        // 4. Redirect back to business detail page
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin/business/${businessId}?canva=success`);

    } catch (err: any) {
        console.error("Canva OAuth Error:", err.message);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin/business/${businessId}?error=canva_token_failure`);
    }
}
