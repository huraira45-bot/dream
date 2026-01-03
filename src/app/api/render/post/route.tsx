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
                    {/* Background Gimmick: Strong Diagonal / Split */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: primaryColor,
                        display: 'flex'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: -200,
                            right: -200,
                            width: 1000,
                            height: 1000,
                            backgroundColor: '#FFFFFF',
                            borderRadius: '200px',
                            transform: 'rotate(-15deg)',
                            display: 'flex'
                        }} />
                    </div>

                    {/* Branding Floating Badge */}
                    <div style={{
                        position: 'absolute',
                        top: 40,
                        left: 40,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        backgroundColor: 'white',
                        padding: '10px 25px',
                        borderRadius: '50px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        zIndex: 100
                    }}>
                        {base64Logo ? (
                            <img src={base64Logo} style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: '8px' }} />
                        ) : null}
                        <span style={{ fontSize: 20, fontWeight: '900', color: primaryColor }}>{businessName}</span>
                    </div>

                    {/* Left Side: Character / Illustration (The "Gimmick") */}
                    <div style={{
                        position: 'absolute',
                        left: 40,
                        top: 150,
                        width: 500,
                        height: 750,
                        display: 'flex',
                        zIndex: 20
                    }}>
                        {base64Image ? (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                position: 'relative'
                            }}>
                                {/* Decorative Ring */}
                                <div style={{
                                    position: 'absolute',
                                    inset: -20,
                                    border: `15px solid ${accentColor}`,
                                    borderRadius: '50px',
                                    opacity: 0.3,
                                    display: 'flex'
                                }} />

                                <img
                                    src={base64Image}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: '40px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                                        border: '10px solid white'
                                    }}
                                />
                            </div>
                        ) : (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: accentColor,
                                borderRadius: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div style={{ fontSize: 100, fontWeight: '900', color: 'white', opacity: 0.5 }}>DREAM</div>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Promotion Content */}
                    <div style={{
                        position: 'absolute',
                        right: 60,
                        top: 250,
                        width: 480,
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 30
                    }}>
                        {/* Eyebrow Text */}
                        <div style={{
                            backgroundColor: accentColor,
                            color: 'white',
                            padding: '8px 20px',
                            borderRadius: '10px',
                            fontSize: 18,
                            fontWeight: '900',
                            alignSelf: 'flex-start',
                            marginBottom: 20,
                            letterSpacing: '0.1em'
                        }}>LIMITED TIME OFFER</div>

                        <div style={{
                            fontSize: headline.length > 30 ? 60 : 85,
                            fontWeight: 900,
                            color: primaryColor,
                            lineHeight: 0.95,
                            marginBottom: 30,
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {headline.split(' ').map((word, i) => (
                                <div key={i} style={{ display: 'flex' }}>{word}</div>
                            ))}
                        </div>

                        <div style={{
                            fontSize: 26,
                            fontWeight: '500',
                            color: '#4B5563',
                            marginBottom: 60,
                            lineHeight: 1.4,
                            display: 'flex'
                        }}>
                            {subheadline}
                        </div>

                        {/* CTA Gimmick */}
                        <div style={{
                            backgroundColor: primaryColor,
                            color: 'white',
                            padding: '30px 60px',
                            borderRadius: '20px',
                            fontSize: 36,
                            fontWeight: '900',
                            display: 'flex',
                            alignSelf: 'flex-start',
                            boxShadow: `0 15px 40px ${primaryColor}40`,
                            position: 'relative'
                        }}>
                            <div style={{ display: 'flex' }}>{cta}</div>
                            {/* Decorative Arrow/Element */}
                            <div style={{
                                position: 'absolute',
                                right: -25,
                                top: -25,
                                width: 50,
                                height: 50,
                                backgroundColor: accentColor,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '5px solid white'
                            }}>
                                <div style={{ width: 20, height: 20, borderTop: '4px solid white', borderRight: '4px solid white', transform: 'rotate(45deg)', marginLeft: -5 }} />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Edge Decoration */}
                    <div style={{
                        position: 'absolute',
                        bottom: 40,
                        right: 60,
                        display: 'flex',
                        color: primaryColor,
                        opacity: 0.3,
                        fontSize: 18,
                        fontWeight: '700',
                        letterSpacing: '0.2em'
                    }}>
                        {new Date().getFullYear()} • DREAM AI GENERATED
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
