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

        const BrandFooter = () => (
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '80px',
                backgroundColor: 'rgba(255,255,255,0.95)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 60px',
                justifyContent: 'space-between',
                borderTop: `1px solid ${primaryColor}20`,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {base64Logo && <img src={base64Logo} style={{ width: 30, height: 30, objectFit: 'contain' }} />}
                    <span style={{ fontSize: 16, fontWeight: '900', color: primaryColor, letterSpacing: '0.05em' }}>{businessName}</span>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '6px', backgroundColor: primaryColor, opacity: 0.1 }}></div>
                    <div style={{ width: 24, height: 24, borderRadius: '6px', backgroundColor: primaryColor, opacity: 0.1 }}></div>
                    <span style={{ fontSize: 14, fontWeight: '700', color: '#64748B', letterSpacing: '0.1em' }}>PREMIUM SERVICE</span>
                </div>
            </div>
        );

        const renderMagazine = () => (
            <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
                <div style={{ height: '55%', width: '100%', backgroundColor: '#F1F5F9', display: 'flex', position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
                    {base64Image ? <img src={base64Image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ fontSize: 120, fontWeight: '900', color: primaryColor, opacity: 0.1 }}>{businessName[0]}</div>}
                    <div style={{ position: 'absolute', top: 40, left: 40, backgroundColor: 'white', padding: '12px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0' }}>
                        {base64Logo && <img src={base64Logo} style={{ width: 32, height: 32, objectFit: 'contain' }} />}
                        <span style={{ fontSize: 18, fontWeight: '800', color: '#1E293B' }}>{businessName}</span>
                    </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '60px 80px', backgroundColor: 'white', position: 'relative', paddingBottom: '140px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ fontSize: headline.length > 60 ? 42 : headline.length > 30 ? 54 : 68, fontWeight: '900', color: '#111827', lineHeight: 1.15, letterSpacing: '-0.02em' }}>{headline}</div>
                        <div style={{ fontSize: 26, fontWeight: '500', color: '#4B5563', lineHeight: 1.5, maxWidth: '90%' }}>{subheadline}</div>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ backgroundColor: primaryColor, color: '#FFFFFF', padding: '22px 50px', borderRadius: '16px', fontSize: 30, fontWeight: '900', boxShadow: `0 12px 20px -5px ${primaryColor}50` }}>{cta}</div>
                    </div>
                </div>
                <BrandFooter />
            </div>
        );

        const renderPoster = () => (
            <div style={{ height: '100%', width: '100%', display: 'flex', background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`, position: 'relative', overflow: 'hidden', padding: '40px' }}>
                <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '40px', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', paddingBottom: '80px' }}>
                    {base64Image ? <img src={base64Image} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }} /> : null}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '80px', justifyContent: 'center', alignItems: 'center', textAlign: 'center', zIndex: 10 }}>
                        {base64Logo ? <img src={base64Logo} style={{ width: 100, height: 100, objectFit: 'contain', marginBottom: '40px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' }} /> : null}
                        <div style={{ fontSize: 90, fontWeight: '900', color: primaryColor, lineHeight: 1, marginBottom: '40px' }}>{headline}</div>
                        <div style={{ fontSize: 32, fontWeight: '500', color: '#4B5563', marginBottom: '60px', opacity: 0.8 }}>{subheadline}</div>
                        <div style={{ backgroundColor: accentColor, color: 'white', padding: '30px 80px', borderRadius: '100px', fontSize: 40, fontWeight: '900', boxShadow: `0 20px 40px -10px ${accentColor}60` }}>{cta}</div>
                    </div>
                    <BrandFooter />
                </div>
            </div>
        );

        const geometry = searchParams.get('geometry') || 'cards';

        const renderAdvertisement = () => (
            <div style={{ height: '100%', width: '100%', display: 'flex', background: `linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)`, position: 'relative', overflow: 'hidden' }}>
                {/* Background Ribbons / Geometry */}
                {geometry === 'ribbons' && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
                        <div style={{ position: 'absolute', top: '-10%', left: '55%', width: '120%', height: '150%', backgroundColor: primaryColor, transform: 'rotate(25deg)', opacity: 0.15 }}></div>
                        <div style={{ position: 'absolute', top: '20%', left: '70%', width: '100%', height: '100%', backgroundColor: accentColor, transform: 'rotate(25deg)', opacity: 0.1 }}></div>
                        <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: '100%', height: '40%', backgroundColor: primaryColor, transform: 'rotate(-5deg)', opacity: 0.08 }}></div>
                    </div>
                )}

                {/* Left Content Card */}
                <div style={{
                    position: 'absolute',
                    top: '10%',
                    left: '5%',
                    width: '65%',
                    bottom: '15%',
                    background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}ee 100%)`,
                    borderRadius: '60px',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '80px 60px',
                    boxShadow: '0 50px 100px -30px rgba(0,0,0,0.25)',
                    zIndex: 20,
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '20px', display: 'flex', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)' }}>
                                {base64Logo ? <img src={base64Logo} style={{ width: 50, height: 50, objectFit: 'contain' }} /> : null}
                            </div>
                            <span style={{ fontSize: 26, fontWeight: '950', color: 'white', letterSpacing: '0.05em' }}>{businessName.toUpperCase()}</span>
                        </div>

                        <div style={{
                            fontSize: headline.length > 30 ? 65 : 85,
                            fontWeight: '950',
                            color: 'white',
                            lineHeight: 0.95,
                            textShadow: '0 10px 30px rgba(0,0,0,0.15)',
                            letterSpacing: '-0.03em'
                        }}>
                            {headline}
                        </div>

                        <div style={{
                            fontSize: 30,
                            fontWeight: '600',
                            color: 'rgba(255,255,255,0.95)',
                            lineHeight: 1.3,
                            maxWidth: '95%',
                            borderLeft: '6px solid white',
                            paddingLeft: '30px'
                        }}>
                            {subheadline}
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                        <div style={{
                            backgroundColor: 'white',
                            color: accentColor,
                            padding: '28px 70px',
                            borderRadius: '24px',
                            fontSize: 36,
                            fontWeight: '950',
                            display: 'flex',
                            width: 'fit-content',
                            boxShadow: '0 20px 50px -10px rgba(0,0,0,0.2)',
                            letterSpacing: '0.02em'
                        }}>
                            {cta}
                        </div>
                    </div>
                </div>

                {/* Overlapping Hero Image */}
                {base64Image ? (
                    <div style={{
                        position: 'absolute',
                        right: '-8%',
                        bottom: '5%',
                        width: '60%',
                        height: '80%',
                        display: 'flex',
                        zIndex: 30,
                        transform: 'scale(1.1)'
                    }}>
                        <img
                            src={base64Image}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.35))'
                            }}
                        />
                    </div>
                ) : null}
                <BrandFooter />
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
