import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Helper to strip emojis and non-standard characters that crash Satori
function sanitizeText(text: string): string {
    return text.replace(/[^\x00-\x7F]/g, "").trim();
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const headline = sanitizeText(searchParams.get('headline') || 'Quality Service').toUpperCase();
        const subheadline = sanitizeText(searchParams.get('subheadline') || 'Premium Excellence');
        const cta = sanitizeText(searchParams.get('cta') || 'Order Now').toUpperCase();
        const imgUrl = searchParams.get('imgUrl');
        const primaryColor = searchParams.get('primaryColor') || '#000000';
        const accentColor = searchParams.get('accentColor') || '#FF4D4D';
        const businessName = sanitizeText(searchParams.get('businessName') || 'The Brand');
        const logoUrl = searchParams.get('logoUrl');

        // Robust Image Fetching at the Edge
        let base64Image = null;
        if (imgUrl && imgUrl.startsWith('http')) {
            try {
                // Increased timeout for Pollinations AI / External Assets
                const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(15000) });
                if (imgRes.ok && imgRes.headers.get('content-type')?.startsWith('image/')) {
                    const arrayBuffer = await imgRes.arrayBuffer();
                    const uint8 = new Uint8Array(arrayBuffer);
                    let binary = '';
                    for (let i = 0; i < uint8.length; i++) {
                        binary += String.fromCharCode(uint8[i]);
                    }
                    const base64String = btoa(binary);
                    base64Image = `data:${imgRes.headers.get('content-type')};base64,${base64String}`;
                }
            } catch (err) {
                console.error("Image Fetch Failed:", err);
            }
        }

        let base64Logo = null;
        if (logoUrl && logoUrl.startsWith('http')) {
            try {
                const logoRes = await fetch(logoUrl, { signal: AbortSignal.timeout(5000) });
                if (logoRes.ok && logoRes.headers.get('content-type')?.startsWith('image/')) {
                    const arrayBuffer = await logoRes.arrayBuffer();
                    const uint8 = new Uint8Array(arrayBuffer);
                    let binary = '';
                    for (let i = 0; i < uint8.length; i++) {
                        binary += String.fromCharCode(uint8[i]);
                    }
                    const base64String = btoa(binary);
                    base64Logo = `data:${logoRes.headers.get('content-type')};base64,${base64String}`;
                }
            } catch (err) {
                console.error("Logo Fetch Failed:", err);
            }
        }

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#FFFFFF',
                        fontFamily: 'sans-serif',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Top Segment: Visual Character/Illustration */}
                    <div style={{
                        height: '55%',
                        width: '100%',
                        backgroundColor: '#F8FAFC',
                        display: 'flex',
                        position: 'relative',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderBottom: `8px solid ${primaryColor}`
                    }}>
                        {base64Image ? (
                            <img
                                src={base64Image}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '20px'
                            }}>
                                <div style={{ fontSize: 120, fontWeight: '900', color: primaryColor, opacity: 0.1 }}>{businessName[0]}</div>
                                <div style={{ fontSize: 24, fontWeight: '900', color: primaryColor, opacity: 0.3, letterSpacing: '0.2em' }}>DREAM STUDIO</div>
                            </div>
                        )}

                        {/* Branding Overlay (Top Left) */}
                        <div style={{
                            position: 'absolute',
                            top: 40,
                            left: 40,
                            backgroundColor: 'white',
                            padding: '12px 24px',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #E2E8F0'
                        }}>
                            {base64Logo ? (
                                <img src={base64Logo} style={{ width: 32, height: 32, objectFit: 'contain' }} />
                            ) : null}
                            <span style={{ fontSize: 18, fontWeight: '800', color: '#1E293B' }}>{businessName}</span>
                        </div>
                    </div>

                    {/* Bottom Segment: Messaging */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '60px 80px',
                        backgroundColor: 'white',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{
                                fontSize: headline.length > 60 ? 42 : headline.length > 30 ? 54 : 68,
                                fontWeight: '900',
                                color: '#111827',
                                lineHeight: 1.15,
                                letterSpacing: '-0.02em',
                                display: 'flex',
                                flexWrap: 'wrap'
                            }}>
                                {headline}
                            </div>

                            <div style={{
                                fontSize: 26,
                                fontWeight: '500',
                                color: '#4B5563',
                                lineHeight: 1.5,
                                maxWidth: '90%',
                                display: 'flex'
                            }}>
                                {subheadline}
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '20px'
                        }}>
                            {/* CTA Button */}
                            <div style={{
                                backgroundColor: primaryColor,
                                color: '#FFFFFF',
                                padding: '22px 50px',
                                borderRadius: '16px',
                                fontSize: 30,
                                fontWeight: '900',
                                display: 'flex',
                                boxShadow: `0 12px 20px -5px ${primaryColor}50`
                            }}>
                                {cta}
                            </div>

                            {/* Minimal Identity Badge */}
                            <div style={{
                                display: 'flex',
                                color: '#9CA3AF',
                                fontSize: 18,
                                fontWeight: '700',
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase'
                            }}>
                                {businessName} • {new Date().getFullYear()}
                            </div>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1080,
                height: 1080,
            }
        );
    } catch (e: any) {
        return new Response(`Error: ${e.message}`, { status: 500 });
    }
}
