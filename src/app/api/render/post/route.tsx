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
                const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(8000) });
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
                    {/* Top Branding Bar */}
                    <div style={{
                        height: 120,
                        width: '100%',
                        backgroundColor: primaryColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 50px'
                    }}>
                        <div style={{ display: 'flex', color: 'white', fontSize: 32, fontWeight: '900', alignItems: 'center', gap: '20px' }}>
                            {base64Logo ? (
                                <img src={base64Logo} style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: '10px' }} />
                            ) : null}
                            {businessName.toUpperCase()}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        {/* Background Visual (Illustration or Flat Color) */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#F9FAFB'
                        }}>
                            {base64Image ? (
                                <img
                                    src={base64Image}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        opacity: 0.15,
                                        filter: 'grayscale(100%)'
                                    }}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', backgroundColor: accentColor, opacity: 0.05 }} />
                            )}
                        </div>

                        {/* Centered Presentation Card */}
                        <div style={{
                            margin: 'auto',
                            width: 800,
                            backgroundColor: 'white',
                            borderRadius: '40px',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '60px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                            border: `2px solid ${primaryColor}20`,
                            zIndex: 10
                        }}>
                            <div style={{
                                fontSize: headline.length > 30 ? 50 : 70,
                                fontWeight: 900,
                                color: primaryColor,
                                lineHeight: 1.1,
                                marginBottom: 30,
                                textAlign: 'center'
                            }}>
                                {headline}
                            </div>

                            <div style={{
                                fontSize: 28,
                                fontWeight: 500,
                                color: '#4B5563',
                                textAlign: 'center',
                                marginBottom: 50,
                                lineHeight: 1.5
                            }}>
                                {subheadline}
                            </div>

                            <div style={{
                                backgroundColor: accentColor,
                                color: 'white',
                                padding: '25px 60px',
                                borderRadius: '100px',
                                fontSize: 32,
                                fontWeight: '900',
                                display: 'flex',
                                alignSelf: 'center',
                                boxShadow: `0 10px 20px ${accentColor}40`
                            }}>
                                <div style={{ display: 'flex' }}>{cta}</div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Utility Bar */}
                    <div style={{
                        height: 100,
                        width: '100%',
                        backgroundColor: '#F3F4F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderTop: '1px solid #E5E7EB'
                    }}>
                        <div style={{ display: 'flex', color: '#9CA3AF', fontSize: 20, fontWeight: '700', letterSpacing: '0.1em' }}>
                            EXCLUSIVE OFFER • {new Date().getFullYear()} • DREAM AI
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
