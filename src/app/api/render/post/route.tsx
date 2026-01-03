import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const headline = (searchParams.get('headline') || 'Quality Service').toUpperCase();
        const subheadline = searchParams.get('subheadline') || 'Premium Excellence';
        const cta = (searchParams.get('cta') || 'Order Now').toUpperCase();
        const imgUrl = searchParams.get('imgUrl');
        const primaryColor = searchParams.get('primaryColor') || '#000000';
        const accentColor = searchParams.get('accentColor') || '#FF4D4D';
        const businessName = searchParams.get('businessName') || 'The Brand';

        // Base 1080x1080 canvas
        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#FBCA3E', // Default yellow base like reference
                        fontFamily: 'sans-serif',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Geometric Background Detail (Stripes) */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        height: 60,
                        background: 'repeating-linear-gradient(45deg, #FFD700 0, #FFD700 20px, #FBCA3E 20px, #FBCA3E 40px)',
                    }} />

                    {/* Left Top Corner Brand Box */}
                    <div style={{
                        position: 'absolute',
                        top: 40,
                        left: 40,
                        width: 120,
                        height: 120,
                        backgroundColor: primaryColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 12,
                        transform: 'rotate(-10deg)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ color: 'white', fontSize: 18, fontWeight: 'black', textAlign: 'center' }}>
                            {businessName.slice(0, 8)}
                        </div>
                    </div>

                    {/* Main Content Container (Large Rounded Shape) */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 180,
                            left: 100,
                            width: 600,
                            height: 600,
                            backgroundColor: accentColor,
                            borderRadius: '50px',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '60px',
                            zIndex: 10
                        }}
                    >
                        <div style={{ fontSize: 100, fontWeight: 900, color: '#FFD700', lineHeight: 0.9, letterSpacing: '-0.05em', marginBottom: 10 }}>
                            {headline.split(' ')[0]}
                        </div>
                        <div style={{ fontSize: 72, fontWeight: 700, color: 'white', lineHeight: 0.9, marginBottom: 40 }}>
                            {headline.split(' ').slice(1).join(' ')}
                        </div>

                        <div style={{ fontSize: 28, fontWeight: 500, color: 'white', opacity: 0.9, marginBottom: 40, maxWidth: 400 }}>
                            {subheadline}
                        </div>

                        {/* CTA Button */}
                        <div style={{
                            backgroundColor: 'white',
                            color: accentColor,
                            padding: '20px 40px',
                            borderRadius: '50px',
                            fontSize: 32,
                            fontWeight: 'black',
                            display: 'flex',
                            alignSelf: 'flex-start',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}>
                            {cta}
                        </div>
                    </div>

                    {/* Character/Illustration Layer (Right Side) */}
                    <div
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: 400,
                            width: 600,
                            height: 600,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 20
                        }}
                    >
                        {imgUrl && (
                            <img
                                src={imgUrl}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))'
                                }}
                            />
                        )}
                    </div>

                    {/* Badge Element (Top Right) */}
                    <div style={{
                        position: 'absolute',
                        top: 100,
                        right: 150,
                        width: 180,
                        height: 180,
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '8px solid #f0f0f0',
                        textAlign: 'center',
                        zIndex: 30
                    }}>
                        <div style={{ fontSize: 24, fontWeight: 900, color: accentColor }}>QUALITY</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#333' }}>ASSURED</div>
                    </div>

                    {/* Footer Info Box */}
                    <div style={{
                        position: 'absolute',
                        bottom: 100,
                        left: 60,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        zIndex: 40
                    }}>
                        <div style={{
                            backgroundColor: '#fff',
                            padding: '12px 24px',
                            borderRadius: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            fontSize: 22,
                            fontWeight: 'bold',
                            color: '#333',
                            border: `2px solid ${accentColor}`
                        }}>
                            🏠 Home Delivery Available
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
        return new Response(`Failed to generate image`, { status: 500 });
    }
}
