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

        // Robust Image Fetching at the Edge
        let base64Image = null;
        if (imgUrl && imgUrl.startsWith('http')) {
            try {
                const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(8000) });
                if (imgRes.ok && imgRes.headers.get('content-type')?.startsWith('image/')) {
                    const arrayBuffer = await imgRes.arrayBuffer();
                    // Robust Base64 for Edge
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

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#FBCA3E',
                        fontFamily: 'sans-serif',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Bottom Accent Bar (Solid) */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        height: 80,
                        backgroundColor: primaryColor,
                        display: 'flex'
                    }} />

                    {/* Logo/Brand Box (Flat) */}
                    <div style={{
                        position: 'absolute',
                        top: 50,
                        left: 50,
                        backgroundColor: primaryColor,
                        padding: '15px 30px',
                        borderRadius: '15px',
                        display: 'flex'
                    }}>
                        <div style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                            {businessName.slice(0, 20)}
                        </div>
                    </div>

                    {/* Main Promotion Container (Flat) */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 200,
                            left: 80,
                            width: 650,
                            height: 600,
                            backgroundColor: accentColor,
                            borderRadius: '60px',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '60px',
                            zIndex: 10
                        }}
                    >
                        <div style={{ fontSize: 90, fontWeight: 900, color: '#FBCA3E', lineHeight: 1.0, marginBottom: 10 }}>
                            {headline.split(' ')[0]}
                        </div>
                        <div style={{ fontSize: 60, fontWeight: 700, color: 'white', lineHeight: 1.1, marginBottom: 30 }}>
                            {headline.split(' ').slice(1).join(' ')}
                        </div>

                        <div style={{ fontSize: 24, fontWeight: 500, color: 'white', opacity: 0.95, marginBottom: 40, lineHeight: 1.4 }}>
                            {subheadline}
                        </div>

                        {/* CTA Button (Flat) */}
                        <div style={{
                            backgroundColor: 'white',
                            color: accentColor,
                            padding: '25px 50px',
                            borderRadius: '100px',
                            fontSize: 35,
                            fontWeight: '900',
                            display: 'flex',
                            alignSelf: 'flex-start'
                        }}>
                            {cta}
                        </div>
                    </div>

                    {/* Illustration Area (Flat) */}
                    <div
                        style={{
                            position: 'absolute',
                            right: -50,
                            top: 350,
                            width: 600,
                            height: 600,
                            display: 'flex',
                            zIndex: 20
                        }}
                    >
                        {base64Image ? (
                            <img
                                src={base64Image}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    objectFit: 'contain'
                                }}
                            />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 40, fontWeight: 'bold', transform: 'rotate(-5deg)' }}>
                                PREMIUM • BRAND
                            </div>
                        )}
                    </div>

                    {/* Quality Stamp (Flat Circle) */}
                    <div style={{
                        position: 'absolute',
                        top: 100,
                        right: 120,
                        width: 160,
                        height: 160,
                        backgroundColor: 'white',
                        borderRadius: 80,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `6px solid ${primaryColor}`,
                        zIndex: 30
                    }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: primaryColor }}>100%</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#666' }}>QUALITY</div>
                    </div>

                    {/* Floating Info (Flat) */}
                    <div style={{
                        position: 'absolute',
                        bottom: 120,
                        left: 80,
                        backgroundColor: 'white',
                        padding: '12px 25px',
                        borderRadius: '50px',
                        border: `2px solid ${primaryColor}`,
                        display: 'flex',
                        zIndex: 40
                    }}>
                        <div style={{ fontSize: 20, fontWeight: 'bold', color: primaryColor }}>
                            {businessName.toUpperCase()} • OPEN NOW
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
