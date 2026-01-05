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

        const BrandPattern = ({ color, opacity = 0.08 }: { color: string, opacity?: number }) => (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', opacity, zIndex: 1 }}>
                <div style={{ position: 'absolute', top: '10%', left: '10%', width: '150px', height: '150px', border: `2px solid ${color}`, borderRadius: '50%', transform: 'rotate(30deg)' }}></div>
                <div style={{ position: 'absolute', top: '20%', right: '15%', width: '80px', height: '80px', border: `2px solid ${color}`, borderRadius: '20px', transform: 'rotate(60deg)' }}></div>
                <div style={{ position: 'absolute', bottom: '25%', left: '20%', width: '120px', height: '120px', border: `2px solid ${color}`, borderRadius: '20px', transform: 'rotate(-45deg)' }}></div>
                <div style={{ position: 'absolute', bottom: '15%', right: '20%', width: '100px', height: '100px', border: `2px solid ${color}`, borderRadius: '50%', transform: 'rotate(15deg)' }}></div>
            </div>
        );

        const BrandFooter = () => (
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '100px',
                backgroundColor: '#0F172A',
                display: 'flex',
                alignItems: 'center',
                padding: '0 60px',
                justifyContent: 'space-between',
                borderTop: `6px solid ${accentColor}`,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '10px', display: 'flex' }}>
                        {base64Logo && <img src={base64Logo} style={{ width: 35, height: 35, objectFit: 'contain' }} />}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 18, fontWeight: '950', color: 'white' }}>{businessName.toUpperCase()}</span>
                        <span style={{ fontSize: 12, fontWeight: '700', color: accentColor }}>OFFICIAL BRAND POST</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: accentColor }}></div>
                    <span style={{ fontSize: 16, fontWeight: '800', color: '#94A3B8' }}>PREMIUM QUALITY</span>
                </div>
            </div>
        );

        const renderMagazine = () => (
            <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC', position: 'relative' }}>
                <BrandPattern color={primaryColor} />
                <div style={{ height: '52%', width: '100%', backgroundColor: '#E2E8F0', display: 'flex', position: 'relative', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                    {base64Image ? (
                        <img src={base64Image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', background: `linear-gradient(45deg, ${primaryColor}, ${accentColor})`, opacity: 0.2 }}></div>
                    )}
                    <div style={{ position: 'absolute', top: 40, left: 40, backgroundColor: 'white', padding: '15px 30px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px', border: `2px solid ${accentColor}` }}>
                        {base64Logo && <img src={base64Logo} style={{ width: 40, height: 40, objectFit: 'contain' }} />}
                        <span style={{ fontSize: 20, fontWeight: '900', color: '#0F172A' }}>{businessName}</span>
                    </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '60px 80px', backgroundColor: 'white', position: 'relative', zIndex: 20, borderTop: `8px solid ${primaryColor}` }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', paddingBottom: '120px' }}>
                        <div style={{ fontSize: headline.length > 60 ? 42 : headline.length > 30 ? 58 : 74, fontWeight: '950', color: '#0F172A', lineHeight: 1.05 }}>{headline}</div>
                        <div style={{ fontSize: 30, fontWeight: '600', color: '#475569', lineHeight: 1.4, maxWidth: '95%', borderLeft: `6px solid ${accentColor}`, paddingLeft: '25px' }}>{subheadline}</div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '150px', left: '80px', display: 'flex' }}>
                        <div style={{ backgroundColor: primaryColor, color: '#FFFFFF', padding: '24px 60px', borderRadius: '20px', fontSize: 34, fontWeight: '950' }}>{cta}</div>
                    </div>
                </div>
                <BrandFooter />
            </div>
        );

        const renderPoster = () => (
            <div style={{ height: '100%', width: '100%', display: 'flex', background: primaryColor, position: 'relative', padding: '50px' }}>
                <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '50px', display: 'flex', flexDirection: 'column', position: 'relative', border: `12px solid ${accentColor}` }}>
                    <BrandPattern color={primaryColor} opacity={0.04} />
                    {base64Image ? <img src={base64Image} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.12 }} /> : null}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '80px', justifyContent: 'center', alignItems: 'center', textAlign: 'center', zIndex: 10 }}>
                        <div style={{ padding: '25px', backgroundColor: '#F8FAFC', borderRadius: '30px', marginBottom: '50px' }}>
                            {base64Logo ? <img src={base64Logo} style={{ width: 120, height: 120, objectFit: 'contain' }} /> : null}
                        </div>
                        <div style={{ fontSize: 95, fontWeight: '950', color: '#0F172A', lineHeight: 0.95, marginBottom: '50px' }}>{headline}</div>
                        <div style={{ fontSize: 34, fontWeight: '600', color: '#475569', marginBottom: '70px', maxWidth: '85%' }}>{subheadline}</div>
                        <div style={{ backgroundColor: primaryColor, color: 'white', padding: '35px 90px', borderRadius: '24px', fontSize: 42, fontWeight: '950' }}>{cta}</div>
                    </div>
                    <BrandFooter />
                </div>
            </div>
        );

        const geometry = searchParams.get('geometry') || 'cards';

        const renderAdvertisement = () => (
            <div style={{ height: '100%', width: '100%', display: 'flex', background: '#F8FAFC', position: 'relative' }}>
                <BrandPattern color={accentColor} opacity={0.1} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
                    <div style={{ position: 'absolute', top: '-15%', left: '50%', width: '140%', height: '160%', backgroundColor: primaryColor, transform: 'rotate(25deg)', opacity: 0.18 }}></div>
                    <div style={{ position: 'absolute', top: '25%', left: '65%', width: '120%', height: '120%', backgroundColor: accentColor, transform: 'rotate(25deg)', opacity: 0.15 }}></div>
                    <div style={{ position: 'absolute', bottom: '-20%', left: '-15%', width: '120%', height: '50%', backgroundColor: primaryColor, transform: 'rotate(-8deg)', opacity: 0.12 }}></div>
                </div>

                <div style={{
                    position: 'absolute',
                    top: '8%',
                    left: '4%',
                    width: '68%',
                    bottom: '12%',
                    background: accentColor,
                    borderRadius: '70px',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '90px 70px',
                    zIndex: 20,
                    border: '2px solid rgba(255,255,255,0.4)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '45px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                            <div style={{ padding: '18px', backgroundColor: 'white', borderRadius: '24px', display: 'flex' }}>
                                {base64Logo && <img src={base64Logo} style={{ width: 60, height: 60, objectFit: 'contain' }} />}
                            </div>
                            <span style={{ fontSize: 28, fontWeight: '950', color: '#0F172A' }}>{businessName.toUpperCase()}</span>
                        </div>
                        <div style={{ fontSize: headline.length > 30 ? 70 : 90, fontWeight: '950', color: '#0F172A', lineHeight: 0.9 }}>{headline}</div>
                        <div style={{ fontSize: 32, fontWeight: '700', color: 'rgba(15, 23, 42, 0.85)', lineHeight: 1.25, maxWidth: '98%', borderLeft: '8px solid #0F172A', paddingLeft: '35px' }}>{subheadline}</div>
                    </div>
                    <div style={{ marginTop: 'auto' }}>
                        <div style={{ backgroundColor: '#0F172A', color: 'white', padding: '30px 80px', borderRadius: '24px', fontSize: 38, fontWeight: '950', display: 'flex', width: 'fit-content' }}>{cta}</div>
                    </div>
                </div>

                {/* Overlapping Hero Image */}
                {base64Image ? (
                    <div style={{
                        position: 'absolute',
                        right: '-12%',
                        bottom: '5%',
                        width: '65%',
                        height: '85%',
                        display: 'flex',
                        zIndex: 30,
                        transform: 'scale(1.15)'
                    }}>
                        <img
                            src={base64Image}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 50px 80px rgba(0,0,0,0.4))'
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
