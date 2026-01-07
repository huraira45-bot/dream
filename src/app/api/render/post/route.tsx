import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

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
        const layout = searchParams.get('layout') || 'magazine';
        const fontFamily = searchParams.get('fontFamily') || 'Montserrat';

        // Font Loading Helper
        // Font Loading Helper (Node.js version using fs)
        // Font Loading Helper (Hyper-Robust)
        const getFont = async (name: string) => {
            const fontFiles: Record<string, string> = {
                'Montserrat': 'Montserrat-Bold.ttf',
                'Playfair Display': 'PlayfairDisplay-Bold.ttf',
                'Bebas Neue': 'BebasNeue-Regular.ttf',
                'Outfit': 'Outfit-Bold.ttf',
                'Inter': 'Inter-Bold.ttf'
            };
            const fileName = fontFiles[name] || fontFiles['Montserrat'];

            // Source 1: Local Filesystem (Fastest)
            try {
                const fontPath = path.join(process.cwd(), 'public', 'fonts', fileName);
                if (fs.existsSync(fontPath)) {
                    const fontData = fs.readFileSync(fontPath);
                    return fontData.buffer.slice(fontData.byteOffset, fontData.byteOffset + fontData.byteLength);
                }
            } catch (fsErr) {
                console.warn(`FS load failed for ${name}:`, fsErr);
            }

            // Source 2: Reliable CDN (Stable Fallback)
            const cdnUrls: Record<string, string> = {
                'Montserrat': 'https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/static/Montserrat-Bold.ttf',
                'Playfair Display': 'https://raw.githubusercontent.com/google/fonts/main/ofl/playfairdisplay/static/PlayfairDisplay-Bold.ttf',
                'Bebas Neue': 'https://raw.githubusercontent.com/google/fonts/main/ofl/bebasneue/BebasNeue-Regular.ttf',
                'Outfit': 'https://raw.githubusercontent.com/google/fonts/main/ofl/outfit/static/Outfit-Bold.ttf',
                'Inter': 'https://raw.githubusercontent.com/google/fonts/main/ofl/inter/static/Inter-Bold.ttf'
            };

            const url = cdnUrls[name] || cdnUrls['Montserrat'];
            try {
                const res = await fetch(url, { signal: AbortSignal.timeout(7000) });
                if (res.ok) return await res.arrayBuffer();
            } catch (fetchErr) {
                console.error(`CDN Fetch failed for ${name}:`, fetchErr);
            }

            // Source 3: Absolute Last Resort (Montserrat from known stable raw URL)
            const fallbackUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/static/Montserrat-Bold.ttf';
            const finalRes = await fetch(fallbackUrl);
            return await finalRes.arrayBuffer();
        };

        const [activeFontData] = await Promise.all([getFont(fontFamily)]);

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

        const BrandPattern = ({ color, opacity = 0.20 }: { color: string, opacity?: number }) => (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', opacity, zIndex: 1 }}>
                {/* Ornate Geometric Elements */}
                <div style={{ position: 'absolute', top: '5%', left: '5%', width: '200px', height: '200px', border: `3px solid ${color}`, borderRadius: '50%', display: 'flex' }}></div>
                <div style={{ position: 'absolute', top: '15%', right: '10%', width: '100px', height: '100px', border: `2px solid ${color}`, borderRadius: '25px', display: 'flex', transform: 'rotate(45deg)' }}></div>
                <div style={{ position: 'absolute', bottom: '20%', left: '15%', width: '150px', height: '150px', border: `4px solid ${color}`, borderRadius: '30px', display: 'flex', transform: 'rotate(-15deg)' }}></div>
                <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '120px', height: '120px', border: `2px solid ${color}`, borderRadius: '50%', display: 'flex' }}></div>

                {/* Dotted Accent Lines (Standard in user references) */}
                <div style={{ position: 'absolute', top: '40%', right: '20%', width: '150px', height: '2px', borderBottom: `2px dashed ${color}`, display: 'flex', opacity: 0.5 }}></div>
                <div style={{ position: 'absolute', bottom: '40%', left: '10%', width: '3px', height: '100px', borderLeft: `2px dashed ${color}`, display: 'flex', opacity: 0.5 }}></div>

                {/* Background Character Space (If high density) */}
                <div style={{ position: 'absolute', top: '30%', left: '40%', width: '300px', height: '300px', border: `1px solid ${color}`, borderRadius: '40px', display: 'flex', opacity: 0.2, transform: 'rotate(15deg)' }}></div>
            </div>
        );

        const BrandFooter = () => (
            <div style={{
                position: 'absolute',
                bottom: 40,
                left: 50,
                right: 50,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 100
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    padding: '8px 20px',
                    borderRadius: '12px',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ width: 8, height: 8, borderRadius: '4px', backgroundColor: accentColor, display: 'flex' }}></div>
                    <span style={{ fontSize: 14, fontWeight: '800', color: 'white' }}>{businessName.toUpperCase()}</span>
                </div>

                <div style={{
                    display: 'flex',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: '8px 15px',
                    borderRadius: '10px',
                    fontSize: 12,
                    fontWeight: '700',
                    color: '#0F172A',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    {businessName.toLowerCase().replace(/\s/g, '')}.com
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

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '60px 70px', backgroundColor: 'white', position: 'relative', zIndex: 20, borderTop: `10px solid ${primaryColor}`, fontFamily }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', paddingBottom: '130px' }}>
                        <div style={{ display: 'flex', fontSize: headline.length > 60 ? 44 : 64, fontWeight: '950', color: '#0F172A', lineHeight: 1.0 }}>{headline}</div>
                        <div style={{ display: 'flex', fontSize: 28, fontWeight: '600', color: '#475569', lineHeight: 1.4, maxWidth: '95%', borderLeft: `8px solid ${accentColor}`, paddingLeft: '25px' }}>{subheadline}</div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '150px', left: '70px', display: 'flex' }}>
                        <div style={{ display: 'flex', backgroundColor: primaryColor, color: '#FFFFFF', padding: '24px 55px', borderRadius: '18px', fontSize: 32, fontWeight: '950' }}>{cta}</div>
                    </div>
                </div>
            </div>
        );

        const renderPoster = () => (
            <div style={{ height: '100%', width: '100%', display: 'flex', background: primaryColor, position: 'relative', padding: '45px' }}>
                <div style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: '60px', display: 'flex', flexDirection: 'column', position: 'relative', border: `14px solid ${accentColor}`, overflow: 'hidden', fontFamily }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(135deg, white 0%, ${accentColor} 300%)`, opacity: 0.5, zIndex: 0 }}></div>
                    <BrandPattern color={primaryColor} opacity={0.15} />

                    {/* Logo Overlay */}
                    <div style={{ position: 'absolute', top: 40, left: 40, display: 'flex', zIndex: 50 }}>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', backgroundColor: '#F8FAFC', padding: '10px 20px', borderRadius: '12px', border: `2.5px solid ${primaryColor}`, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                            {base64Logo && <img src={base64Logo} style={{ width: 30, height: 30, objectFit: 'contain' }} />}
                            <span style={{ fontSize: 16, fontWeight: '900', color: '#0F172A' }}>{businessName}</span>
                        </div>
                    </div>

                    {base64Image ? <img src={base64Image} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} /> : null}

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '80px', justifyContent: 'center', alignItems: 'center', textAlign: 'center', zIndex: 10, gap: '40px' }}>
                        <div style={{ display: 'flex', padding: '25px', backgroundColor: 'white', borderRadius: '35px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                            {base64Logo ? <img src={base64Logo} style={{ width: 140, height: 140, objectFit: 'contain' }} /> : null}
                        </div>
                        <div style={{ display: 'flex', fontSize: 90, fontWeight: '1000', color: '#0F172A', lineHeight: 0.85, textShadow: '0 2px 10px rgba(255,255,255,0.8)' }}>{headline}</div>
                        <div style={{ display: 'flex', fontSize: 36, fontWeight: '800', color: '#1E293B', maxWidth: '85%', lineHeight: 1.2 }}>{subheadline}</div>
                        <div style={{ display: 'flex', backgroundColor: primaryColor, color: 'white', padding: '35px 85px', borderRadius: '25px', fontSize: 44, fontWeight: '950', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>{cta}</div>
                    </div>
                </div>
            </div>
        );

        const geometry = searchParams.get('geometry') || 'cards';

        const renderAdvertisement = () => (
            <div style={{ height: '100%', width: '100%', display: 'flex', background: '#F8FAFC', position: 'relative' }}>
                <BrandPattern color={accentColor} opacity={0.15} />

                {/* Logo Overlay - Top Left per Critic feedback */}
                <div style={{ position: 'absolute', top: 40, left: 40, display: 'flex', zIndex: 100 }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', backgroundColor: 'white', padding: '10px 20px', borderRadius: '12px', border: `2px solid ${accentColor}` }}>
                        {base64Logo && <img src={base64Logo} style={{ width: 30, height: 30, objectFit: 'contain' }} />}
                        <span style={{ fontSize: 16, fontWeight: '950', color: '#0F172A' }}>{businessName}</span>
                    </div>
                </div>

                {/* DYNAMIC GEOMETRY: Ribbons/Splashes to eliminate "Bland" backgrounds */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
                    <div style={{ position: 'absolute', top: '-10%', left: '40%', width: '160%', height: '170%', backgroundColor: primaryColor, transform: 'rotate(30deg)', opacity: 0.4, display: 'flex' }}></div>
                    <div style={{ position: 'absolute', top: '25%', left: '65%', width: '130%', height: '130%', backgroundColor: accentColor, transform: 'rotate(30deg)', opacity: 0.35, display: 'flex' }}></div>

                    {geometry === 'ribbons' && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
                            <div style={{ position: 'absolute', top: '45%', left: '-10%', width: '120%', height: '100px', backgroundColor: primaryColor, transform: 'rotate(-15deg)', opacity: 0.4, display: 'flex' }}></div>
                            <div style={{ position: 'absolute', top: '55%', left: '-10%', width: '120%', height: '80px', backgroundColor: accentColor, transform: 'rotate(-15deg)', opacity: 0.3, display: 'flex' }}></div>
                        </div>
                    )}
                </div>

                <div style={{
                    position: 'absolute',
                    top: '12%',
                    left: '5%',
                    width: '65%',
                    bottom: '18%',
                    background: accentColor,
                    borderRadius: '70px',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '80px 60px',
                    zIndex: 20,
                    border: '4px solid rgba(255,255,255,0.6)',
                    fontFamily
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
                            <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '18px', display: 'flex' }}>
                                {base64Logo && <img src={base64Logo} style={{ width: 60, height: 60, objectFit: 'contain' }} />}
                            </div>
                            <span style={{ fontSize: 32, fontWeight: '1000', color: '#0F172A' }}>{businessName.toUpperCase()}</span>
                        </div>
                        <div style={{ display: 'flex', fontSize: headline.length > 30 ? 70 : 90, fontWeight: '1000', color: '#0F172A', lineHeight: 0.82 }}>{headline}</div>
                        <div style={{ display: 'flex', fontSize: 28, fontWeight: '700', color: 'rgba(15, 23, 42, 0.95)', lineHeight: 1.3, maxWidth: '100%', borderLeft: '11px solid #0F172A', paddingLeft: '30px' }}>{subheadline}</div>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex' }}>
                        <div style={{ display: 'flex', backgroundColor: '#0F172A', color: 'white', padding: '30px 80px', borderRadius: '22px', fontSize: 38, fontWeight: '950' }}>{cta}</div>
                    </div>
                </div>

                {base64Image ? (
                    <div style={{
                        position: 'absolute',
                        right: '-18%',
                        bottom: '10%',
                        width: '75%',
                        height: '80%',
                        display: 'flex',
                        zIndex: 30,
                        transform: 'scale(1.2)'
                    }}>
                        <img src={base64Image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                ) : null}
            </div>
        );

        return new ImageResponse(
            layout === 'advertisement' ? renderAdvertisement() : layout === 'poster' ? renderPoster() : renderMagazine(),
            {
                width: 1080,
                height: 1080,
                fonts: [
                    {
                        name: fontFamily,
                        data: activeFontData,
                        style: 'normal',
                    },
                ],
            }
        );
    } catch (e: any) {
        return new Response(`Error: ${e.message}`, { status: 500 });
    }
}
