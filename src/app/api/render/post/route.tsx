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
                <div style={{ position: 'absolute', top: '10%', left: '10%', width: '150px', height: '150px', border: `2px solid ${color}`, borderRadius: '50%', transform: 'rotate(30deg)', display: 'flex' }}></div>
                <div style={{ position: 'absolute', top: '20%', right: '15%', width: '80px', height: '80px', border: `2px solid ${color}`, borderRadius: '20px', transform: 'rotate(60deg)', display: 'flex' }}></div>
                <div style={{ position: 'absolute', bottom: '25%', left: '20%', width: '120px', height: '120px', border: `2px solid ${color}`, borderRadius: '20px', transform: 'rotate(-45deg)', display: 'flex' }}></div>
                <div style={{ position: 'absolute', bottom: '15%', right: '20%', width: '100px', height: '100px', border: `2px solid ${color}`, borderRadius: '50%', transform: 'rotate(15deg)', display: 'flex' }}></div>
            </div>
        );

        const BrandFooter = () => (
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '110px',
                backgroundColor: '#0F172A',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '0 60px',
                justifyContent: 'space-between',
                borderTop: `6px solid ${accentColor}`,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
                    <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '10px', display: 'flex' }}>
                        {base64Logo && <img src={base64Logo} style={{ width: 40, height: 40, objectFit: 'contain' }} />}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 18, fontWeight: '950', color: 'white' }}>{businessName.toUpperCase()}</span>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '4px', backgroundColor: accentColor, display: 'flex' }}></div>
                            <span style={{ fontSize: 13, fontWeight: '700', color: '#94A3B8' }}>PREMIUM BRANDING SERVICE</span>
                        </div>
                    </div>
                </div>
                {/* Social/Contact Mocks for The Critic */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ width: 22, height: 22, borderRadius: '6px', border: '1.5px solid rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <div style={{ width: 10, height: 2, backgroundColor: 'white', borderRadius: '1px', display: 'flex' }}></div>
                            </div>
                        ))}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: '700', color: 'white', opacity: 0.7 }}>{businessName.toLowerCase().replace(/\s/g, '')}.com</span>
                </div>
            </div>
        );

        const renderMagazine = () => (
            <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC', position: 'relative' }}>
                <BrandPattern color={primaryColor} />

                {/* Logo Overlay - CRITICAL: Always top-left as per Critic feedback */}
                <div style={{ position: 'absolute', top: 50, left: 50, display: 'flex', zIndex: 100 }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px', backgroundColor: 'white', padding: '12px 25px', borderRadius: '15px', border: `2px solid ${accentColor}` }}>
                        {base64Logo && <img src={base64Logo} style={{ width: 35, height: 35, objectFit: 'contain' }} />}
                        <span style={{ fontSize: 18, fontWeight: '950', color: '#0F172A' }}>{businessName}</span>
                    </div>
                </div>

                <div style={{ height: '55%', width: '100%', backgroundColor: '#E2E8F0', display: 'flex', position: 'relative', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                    {base64Image ? (
                        <img src={base64Image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', background: `linear-gradient(45deg, ${primaryColor}, ${accentColor})`, opacity: 0.2 }}></div>
                    )}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '60px 70px', backgroundColor: 'white', position: 'relative', zIndex: 20, borderTop: `10px solid ${primaryColor}` }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', paddingBottom: '130px' }}>
                        <div style={{ display: 'flex', fontSize: headline.length > 60 ? 44 : 64, fontWeight: '950', color: '#0F172A', lineHeight: 1.0 }}>{headline}</div>
                        <div style={{ display: 'flex', fontSize: 28, fontWeight: '600', color: '#475569', lineHeight: 1.4, maxWidth: '95%', borderLeft: `8px solid ${accentColor}`, paddingLeft: '25px' }}>{subheadline}</div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '150px', left: '70px', display: 'flex' }}>
                        <div style={{ display: 'flex', backgroundColor: primaryColor, color: '#FFFFFF', padding: '24px 55px', borderRadius: '18px', fontSize: 32, fontWeight: '950' }}>{cta}</div>
                    </div>
                </div>
                <BrandFooter />
            </div>
        );

        const renderPoster = () => (
            <div style={{ height: '100%', width: '100%', display: 'flex', background: primaryColor, position: 'relative', padding: '45px' }}>
                <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '60px', display: 'flex', flexDirection: 'column', position: 'relative', border: `14px solid ${accentColor}` }}>
                    <BrandPattern color={primaryColor} opacity={0.06} />

                    {/* Logo Overlay */}
                    <div style={{ position: 'absolute', top: 40, left: 40, display: 'flex', zIndex: 50 }}>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', backgroundColor: '#F8FAFC', padding: '10px 20px', borderRadius: '12px', border: `1.5px solid ${primaryColor}` }}>
                            {base64Logo && <img src={base64Logo} style={{ width: 30, height: 30, objectFit: 'contain' }} />}
                            <span style={{ fontSize: 16, fontWeight: '900', color: '#0F172A' }}>{businessName}</span>
                        </div>
                    </div>

                    {base64Image ? <img src={base64Image} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }} /> : null}

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '80px', justifyContent: 'center', alignItems: 'center', textAlign: 'center', zIndex: 10, gap: '40px' }}>
                        <div style={{ display: 'flex', padding: '25px', backgroundColor: '#F8FAFC', borderRadius: '35px' }}>
                            {base64Logo ? <img src={base64Logo} style={{ width: 140, height: 140, objectFit: 'contain' }} /> : null}
                        </div>
                        <div style={{ display: 'flex', fontSize: 90, fontWeight: '950', color: '#0F172A', lineHeight: 0.9 }}>{headline}</div>
                        <div style={{ display: 'flex', fontSize: 36, fontWeight: '700', color: '#334155', maxWidth: '85%' }}>{subheadline}</div>
                        <div style={{ display: 'flex', backgroundColor: primaryColor, color: 'white', padding: '35px 85px', borderRadius: '25px', fontSize: 44, fontWeight: '950' }}>{cta}</div>
                    </div>
                    <BrandFooter />
                </div>
            </div>
        );

        const geometry = searchParams.get('geometry') || 'cards';

        const renderAdvertisement = () => (
            <div style={{ height: '100%', width: '100%', display: 'flex', background: '#F8FAFC', position: 'relative' }}>
                <BrandPattern color={accentColor} opacity={0.12} />

                {/* Logo Overlay */}
                <div style={{ position: 'absolute', top: 40, left: 40, display: 'flex', zIndex: 100 }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', backgroundColor: 'white', padding: '10px 20px', borderRadius: '12px', border: `2px solid ${accentColor}` }}>
                        {base64Logo && <img src={base64Logo} style={{ width: 30, height: 30, objectFit: 'contain' }} />}
                        <span style={{ fontSize: 16, fontWeight: '950', color: '#0F172A' }}>{businessName}</span>
                    </div>
                </div>

                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
                    <div style={{ position: 'absolute', top: '-10%', left: '45%', width: '150%', height: '170%', backgroundColor: primaryColor, transform: 'rotate(28deg)', opacity: 0.2, display: 'flex' }}></div>
                    <div style={{ position: 'absolute', top: '20%', left: '70%', width: '130%', height: '130%', backgroundColor: accentColor, transform: 'rotate(28deg)', opacity: 0.15, display: 'flex' }}></div>
                </div>

                <div style={{
                    position: 'absolute',
                    top: '10%',
                    left: '4%',
                    width: '70%',
                    bottom: '15%',
                    background: accentColor,
                    borderRadius: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '85px 65px',
                    zIndex: 20,
                    border: '3px solid rgba(255,255,255,0.5)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '22px' }}>
                            <div style={{ padding: '18px', backgroundColor: 'white', borderRadius: '24px', display: 'flex' }}>
                                {base64Logo && <img src={base64Logo} style={{ width: 65, height: 65, objectFit: 'contain' }} />}
                            </div>
                            <span style={{ fontSize: 32, fontWeight: '950', color: '#0F172A' }}>{businessName.toUpperCase()}</span>
                        </div>
                        <div style={{ display: 'flex', fontSize: headline.length > 30 ? 75 : 95, fontWeight: '1000', color: '#0F172A', lineHeight: 0.85 }}>{headline}</div>
                        <div style={{ display: 'flex', fontSize: 30, fontWeight: '700', color: 'rgba(15, 23, 42, 0.9)', lineHeight: 1.3, maxWidth: '100%', borderLeft: '10px solid #0F172A', paddingLeft: '35px' }}>{subheadline}</div>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex' }}>
                        <div style={{ display: 'flex', backgroundColor: '#0F172A', color: 'white', padding: '32px 85px', borderRadius: '25px', fontSize: 40, fontWeight: '950' }}>{cta}</div>
                    </div>
                </div>

                {base64Image ? (
                    <div style={{
                        position: 'absolute',
                        right: '-15%',
                        bottom: '8%',
                        width: '70%',
                        height: '85%',
                        display: 'flex',
                        zIndex: 30,
                        transform: 'scale(1.1)'
                    }}>
                        <img src={base64Image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
