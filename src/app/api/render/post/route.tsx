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
        const layout = searchParams.get('layout') || 'magazine'; // magazine | poster | clean

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

        const renderMagazine = () => (
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
                            {businessName}
                        </div>
                    </div>
                </div>
            </div>
        );

        const renderPoster = () => (
            <div style={{ height: '100%', width: '100%', display: 'flex', backgroundColor: primaryColor, position: 'relative', overflow: 'hidden', padding: '40px' }}>
                <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '40px', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                    {base64Image ? <img src={base64Image} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.1 }} /> : null}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '80px', justifyContent: 'center', alignItems: 'center', textAlign: 'center', zIndex: 10 }}>
                        {base64Logo ? <img src={base64Logo} style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: '40px' }} /> : null}
                        <div style={{ fontSize: 90, fontWeight: '900', color: primaryColor, lineHeight: 1, marginBottom: '40px' }}>{headline}</div>
                        <div style={{ fontSize: 32, fontWeight: '500', color: '#4B5563', marginBottom: '60px' }}>{subheadline}</div>
                        <div style={{ backgroundColor: accentColor, color: 'white', padding: '30px 80px', borderRadius: '100px', fontSize: 40, fontWeight: '900' }}>{cta}</div>
                    </div>
                </div>
            </div>
        );

        const geometry = searchParams.get('geometry') || 'cards';

        const renderAdvertisement = () => (
            <div style={{ height: '100%', width: '100%', display: 'flex', backgroundColor: '#F8FAFC', position: 'relative', overflow: 'hidden' }}>
                {/* Background Ribbons / Geometry */}
                {geometry === 'ribbons' && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
                        <div style={{ position: 'absolute', top: '-10%', left: '60%', width: '100%', height: '150%', backgroundColor: primaryColor, transform: 'rotate(25deg)', opacity: 0.1 }}></div>
                        <div style={{ position: 'absolute', top: '20%', left: '70%', width: '80%', height: '100%', backgroundColor: accentColor, transform: 'rotate(25deg)', opacity: 0.05 }}></div>
                        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '100%', height: '40%', backgroundColor: primaryColor, transform: 'rotate(-5deg)', opacity: 0.05 }}></div>
                    </div>
                )}

                {/* Central / Left Card */}
                <div style={{
                    position: 'absolute',
                    top: '15%',
                    left: '8%',
                    width: '60%',
                    bottom: '15%',
                    backgroundColor: accentColor,
                    borderRadius: '50px',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '60px',
                    boxShadow: '0 40px 100px -20px rgba(0,0,0,0.15)',
                    zIndex: 20
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {base64Logo ? <img src={base64Logo} style={{ width: 60, height: 60, objectFit: 'contain' }} /> : null}
                            <span style={{ fontSize: 24, fontWeight: '900', color: 'white', letterSpacing: '0.1em' }}>{businessName}</span>
                        </div>

                        <div style={{
                            fontSize: headline.length > 30 ? 60 : 80,
                            fontWeight: '900',
                            color: 'white',
                            lineHeight: 1,
                            textShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}>
                            {headline}
                        </div>

                        <div style={{
                            fontSize: 28,
                            fontWeight: '600',
                            color: 'rgba(255,255,255,0.9)',
                            lineHeight: 1.4,
                            maxWidth: '90%'
                        }}>
                            {subheadline}
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{
                            backgroundColor: 'white',
                            color: accentColor,
                            padding: '24px 60px',
                            borderRadius: '20px',
                            fontSize: 32,
                            fontWeight: '900',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}>
                            {cta}
                        </div>
                    </div>
                </div>

                {/* Overlapping Hero Image (3D Character) */}
                {base64Image ? (
                    <div style={{
                        position: 'absolute',
                        right: '-5%',
                        bottom: '5%',
                        width: '55%',
                        height: '75%',
                        display: 'flex',
                        zIndex: 30
                    }}>
                        <img
                            src={base64Image}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.3))'
                            }}
                        />
                    </div>
                ) : null}
            </div>
        );

        return new ImageResponse(
            layout === 'advertisement' ? renderAdvertisement() : layout === 'poster' ? renderPoster() : renderMagazine(),
            {
                width: 1080,
                height: 1080,
            }
        );
    } catch (e: any) {
        return new Response(`Error: ${e.message}`, { status: 500 });
    }
}
