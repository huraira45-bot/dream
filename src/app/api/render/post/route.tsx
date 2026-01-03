import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const headline = searchParams.get('headline') || 'Premium Brand';
        const cta = searchParams.get('cta') || 'Contact Us Today';
        const imgUrl = searchParams.get('imgUrl');
        const primaryColor = searchParams.get('primaryColor') || '#000000';
        const accentColor = searchParams.get('accentColor') || '#FF4D4D';
        const businessName = searchParams.get('businessName') || 'Our Business';

        // Base 1080x1080 canvas
        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fff',
                        fontFamily: 'sans-serif',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Background Image */}
                    {imgUrl && (
                        <img
                            src={imgUrl}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    )}

                    {/* Gradient Overlay for Readability */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)',
                        }}
                    />

                    {/* Branding Bar (Top) */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 40,
                            left: 40,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 15,
                        }}
                    >
                        <div
                            style={{
                                width: 12,
                                height: 40,
                                backgroundColor: primaryColor,
                                borderRadius: 4
                            }}
                        />
                        <span style={{
                            fontSize: 32,
                            fontWeight: 'bold',
                            color: 'white',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}>
                            {businessName}
                        </span>
                    </div>

                    {/* Content (Bottom) */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 80,
                            left: 80,
                            right: 80,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 24,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 72,
                                fontWeight: 900,
                                color: 'white',
                                lineHeight: 1.1,
                                letterSpacing: '-0.02em',
                                textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                textTransform: 'uppercase'
                            }}
                        >
                            {headline}
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                            }}
                        >
                            <div
                                style={{
                                    padding: '24px 48px',
                                    backgroundColor: accentColor,
                                    color: 'white',
                                    fontSize: 32,
                                    fontWeight: 'bold',
                                    borderRadius: 16,
                                    display: 'flex',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                                }}
                            >
                                {cta}
                            </div>
                        </div>
                    </div>

                    {/* Decorative Element */}
                    <div
                        style={{
                            position: 'absolute',
                            top: -100,
                            right: -100,
                            width: 300,
                            height: 300,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${accentColor}33 0%, transparent 70%)`,
                        }}
                    />
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
