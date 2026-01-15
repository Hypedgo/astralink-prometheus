'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function LandingPage() {
    const [stage, setStage] = useState<'enter' | 'video' | 'white' | 'opening'>('enter');
    const [eyeOpen, setEyeOpen] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Initialize AOS animations
        if (typeof window !== 'undefined') {
            AOS.init({
                duration: 1000,
                once: true
            });
        }
    }, []);

    const handleEnter = () => {
        setStage('video');
        setTimeout(() => {
            if (videoRef.current) {
                // Try to play with audio - browser allows after user click
                videoRef.current.muted = false;
                videoRef.current.play().catch((error) => {
                    console.log('Autoplay with audio failed, trying muted:', error);
                    // Fallback: play muted if audio fails
                    if (videoRef.current) {
                        videoRef.current.muted = true;
                        videoRef.current.play();
                    }
                });
            }
        }, 100);
    };

    const handleSkipVideo = () => {
        if (videoRef.current) {
            videoRef.current.pause();
        }
        handleVideoEnd();
    };

    const handleVideoEnd = () => {
        setStage('white');

        setTimeout(() => {
            setStage('opening');
            animateEyeOpen();
        }, 300);
    };

    const animateEyeOpen = () => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 1.5;
            setEyeOpen(progress);

            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 30);
    };

    return (
        <>
            {/* STAGE 1: ENTER Screen */}
            {stage === 'enter' && (
                <div
                    onClick={handleEnter}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: '#000000',
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: '60px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            color: 'rgba(255, 255, 255, 0.4)',
                            fontSize: '11px',
                            letterSpacing: '4px',
                            marginBottom: '16px',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                        }}>
                            Space Operations Platform
                        </div>
                        <div style={{
                            color: '#ffffff',
                            fontSize: '48px',
                            letterSpacing: '12px',
                            fontWeight: '800',
                            textTransform: 'uppercase'
                        }}>
                            ASTRALINK
                        </div>
                        <div style={{
                            color: 'rgba(255, 255, 255, 0.3)',
                            fontSize: '12px',
                            letterSpacing: '6px',
                            marginTop: '12px',
                            fontWeight: '300',
                            textTransform: 'uppercase'
                        }}>
                            Prometheus
                        </div>
                    </div>

                    <div style={{
                        fontSize: '24px',
                        letterSpacing: '8px',
                        fontWeight: '300',
                        color: '#00ff88',
                        textTransform: 'uppercase',
                        animation: 'pulse 2s ease-in-out infinite'
                    }}>
                        Enter
                    </div>

                    <div style={{
                        position: 'absolute',
                        bottom: '60px',
                        color: 'rgba(255, 255, 255, 0.3)',
                        fontSize: '11px',
                        letterSpacing: '3px',
                        fontWeight: '300',
                        textTransform: 'uppercase'
                    }}>
                        Click to continue
                    </div>
                </div>
            )}

            {/* STAGE 2: VIDEO */}
            {stage === 'video' && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: '#000000',
                    zIndex: 9999
                }}>
                    <video
                        ref={videoRef}
                        onEnded={handleVideoEnd}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                        playsInline
                    >
                        <source src="/intro-video.mov" type="video/quicktime" />
                    </video>

                    <button
                        onClick={handleSkipVideo}
                        style={{
                            position: 'absolute',
                            bottom: '40px',
                            right: '40px',
                            padding: '12px 24px',
                            background: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '6px',
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '12px',
                            fontWeight: '600',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            zIndex: 60
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        }}
                    >
                        Skip →
                    </button>
                </div>
            )}

            {/* STAGE 3: WHITE FLASH */}
            {stage === 'white' && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: '#ffffff',
                    zIndex: 9999
                }}></div>
            )}

            {/* STAGE 4: Main Site with Bootstrap Layout */}
            {stage === 'opening' && (
                <>
                    {/* Fixed Header - Bootstrap Style */}
                    <header className="fixed-top" style={{
                        background: 'rgba(0, 0, 0, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderBottom: '1px solid rgba(0, 255, 136, 0.1)',
                        padding: '20px 0',
                        zIndex: 1000
                    }}>
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="col-6">
                                    <Link href="/" style={{
                                        color: '#ffffff',
                                        fontSize: '24px',
                                        fontWeight: '800',
                                        letterSpacing: '4px',
                                        textDecoration: 'none'
                                    }}>
                                        ASTRALINK
                                    </Link>
                                </div>
                                <div className="col-6 text-end">
                                    <nav style={{ display: 'inline-flex', gap: '40px' }}>
                                        <Link href="/mission-control" style={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            letterSpacing: '1px',
                                            textTransform: 'uppercase',
                                            transition: 'color 0.3s'
                                        }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#00ff88'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                                        >
                                            Mission Control
                                        </Link>
                                        <Link href="/sky-view" style={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            letterSpacing: '1px',
                                            textTransform: 'uppercase',
                                            transition: 'color 0.3s'
                                        }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#00ff88'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                                        >
                                            Sky View
                                        </Link>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Hero Section - Bootstrap Grid */}
                    <section style={{
                        background: '#000000',
                        minHeight: '100vh',
                        paddingTop: '120px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Grid Background */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `
                linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px)
              `,
                            backgroundSize: '50px 50px'
                        }}></div>

                        <div className="container position-relative">
                            <div className="row align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>

                                {/* Left Column - Content */}
                                <div className="col-lg-6 order-2 order-lg-1" data-aos="fade-right">
                                    <div style={{
                                        fontSize: '12px',
                                        color: 'rgba(0, 255, 136, 0.7)',
                                        letterSpacing: '3px',
                                        marginBottom: '20px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase'
                                    }}>
                                        Space Operations Platform
                                    </div>

                                    <h1 style={{
                                        fontSize: '72px',
                                        fontWeight: '900',
                                        color: '#ffffff',
                                        lineHeight: '1.1',
                                        marginBottom: '30px',
                                        letterSpacing: '-2px'
                                    }}>
                                        Mission Intelligence<br />
                                        <span style={{ color: '#00ff88' }}>Redefined</span>
                                    </h1>

                                    <p style={{
                                        fontSize: '18px',
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        lineHeight: '1.8',
                                        marginBottom: '40px',
                                        maxWidth: '500px'
                                    }}>
                                        Real-time satellite tracking, orbital forecasting, and space weather analysis
                                        for professional observation operations.
                                    </p>

                                    <Link
                                        href="/mission-control"
                                        style={{
                                            display: 'inline-block',
                                            padding: '18px 50px',
                                            background: 'linear-gradient(135deg, #00ff88, #00cc66)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#000000',
                                            fontSize: '14px',
                                            fontWeight: '700',
                                            letterSpacing: '2px',
                                            textTransform: 'uppercase',
                                            textDecoration: 'none',
                                            transition: 'all 0.3s',
                                            boxShadow: '0 10px 40px rgba(0, 255, 136, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 15px 50px rgba(0, 255, 136, 0.5)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 255, 136, 0.3)';
                                        }}
                                    >
                                        Launch Platform
                                    </Link>
                                </div>

                                {/* Right Column - Visual */}
                                <div className="col-lg-6 order-1 order-lg-2" data-aos="fade-left" data-aos-delay="200">
                                    <div style={{
                                        position: 'relative',
                                        padding: '40px'
                                    }}>
                                        {/* Glowing orb effect */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: '400px',
                                            height: '400px',
                                            background: 'radial-gradient(circle, rgba(0, 255, 136, 0.2) 0%, transparent 70%)',
                                            borderRadius: '50%',
                                            filter: 'blur(40px)'
                                        }}></div>

                                        <img
                                            src="/api/placeholder/600/600"
                                            alt="Satellite Visualization"
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                                position: 'relative',
                                                zIndex: 2
                                            }}
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </section>

                    {/* Features Section - Bootstrap Grid (3 Columns) */}
                    <section style={{
                        background: '#000000',
                        padding: '100px 0',
                        borderTop: '1px solid rgba(0, 255, 136, 0.1)'
                    }}>
                        <div className="container">

                            <div className="row mb-5" data-aos="fade-up">
                                <div className="col-12 text-center">
                                    <h2 style={{
                                        fontSize: '48px',
                                        fontWeight: '800',
                                        color: '#ffffff',
                                        marginBottom: '20px'
                                    }}>
                                        Comprehensive Operations Suite
                                    </h2>
                                    <p style={{
                                        fontSize: '18px',
                                        color: 'rgba(255, 255, 255, 0.5)',
                                        maxWidth: '600px',
                                        margin: '0 auto'
                                    }}>
                                        Everything you need for satellite observation and mission planning
                                    </p>
                                </div>
                            </div>

                            <div className="row g-4">

                                {/* Feature 1 */}
                                <div className="col-lg-4" data-aos="fade-up" data-aos-delay="100">
                                    <Link href="/mission-control" style={{ textDecoration: 'none' }}>
                                        <div style={{
                                            background: 'rgba(255, 255, 255, 0.02)',
                                            border: '1px solid rgba(0, 255, 136, 0.1)',
                                            borderRadius: '16px',
                                            padding: '40px',
                                            height: '100%',
                                            transition: 'all 0.3s',
                                            cursor: 'pointer'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(0, 255, 136, 0.05)';
                                                e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.3)';
                                                e.currentTarget.style.transform = 'translateY(-8px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                                e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.1)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌍</div>
                                            <h3 style={{
                                                fontSize: '24px',
                                                fontWeight: '700',
                                                color: '#00ff88',
                                                marginBottom: '15px'
                                            }}>
                                                Mission Control
                                            </h3>
                                            <p style={{
                                                fontSize: '15px',
                                                color: 'rgba(255, 255, 255, 0.6)',
                                                lineHeight: '1.7',
                                                margin: 0
                                            }}>
                                                Real-time 3D orbital tracking, space weather monitoring, and live telemetry dashboard with mission readiness scoring
                                            </p>
                                        </div>
                                    </Link>
                                </div>

                                {/* Feature 2 */}
                                <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
                                    <Link href="/sky-view" style={{ textDecoration: 'none' }}>
                                        <div style={{
                                            background: 'rgba(255, 255, 255, 0.02)',
                                            border: '1px solid rgba(0, 255, 136, 0.1)',
                                            borderRadius: '16px',
                                            padding: '40px',
                                            height: '100%',
                                            transition: 'all 0.3s',
                                            cursor: 'pointer'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(0, 255, 136, 0.05)';
                                                e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.3)';
                                                e.currentTarget.style.transform = 'translateY(-8px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                                e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.1)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌌</div>
                                            <h3 style={{
                                                fontSize: '24px',
                                                fontWeight: '700',
                                                color: '#00ff88',
                                                marginBottom: '15px'
                                            }}>
                                                Sky View
                                            </h3>
                                            <p style={{
                                                fontSize: '15px',
                                                color: 'rgba(255, 255, 255, 0.6)',
                                                lineHeight: '1.7',
                                                margin: 0
                                            }}>
                                                Live ISS tracking, 27-star catalog, constellation lines, meteor showers, aurora effects, and telescopic zoom mode
                                            </p>
                                        </div>
                                    </Link>
                                </div>

                                {/* Feature 3 */}
                                <div className="col-lg-4" data-aos="fade-up" data-aos-delay="300">
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid rgba(0, 255, 136, 0.1)',
                                        borderRadius: '16px',
                                        padding: '40px',
                                        height: '100%',
                                        transition: 'all 0.3s',
                                        opacity: 0.5
                                    }}>
                                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🛰️</div>
                                        <h3 style={{
                                            fontSize: '24px',
                                            fontWeight: '700',
                                            color: '#00ff88',
                                            marginBottom: '15px'
                                        }}>
                                            Coming Soon
                                        </h3>
                                        <p style={{
                                            fontSize: '15px',
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            lineHeight: '1.7',
                                            margin: 0
                                        }}>
                                            Advanced satellite operations, pass predictions, and mission planning tools
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </section>

                    {/* Stats Section - Bootstrap Grid (4 Columns) */}
                    <section style={{
                        background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 0, 0, 0) 100%)',
                        padding: '100px 0',
                        borderTop: '1px solid rgba(0, 255, 136, 0.1)'
                    }}>
                        <div className="container">
                            <div className="row g-4 text-center">

                                <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
                                    <div>
                                        <div style={{
                                            fontSize: '64px',
                                            fontWeight: '900',
                                            color: '#00ff88',
                                            marginBottom: '10px'
                                        }}>
                                            4
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            letterSpacing: '2px',
                                            textTransform: 'uppercase'
                                        }}>
                                            Satellites Tracked
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
                                    <div>
                                        <div style={{
                                            fontSize: '64px',
                                            fontWeight: '900',
                                            color: '#00ff88',
                                            marginBottom: '10px'
                                        }}>
                                            24/7
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            letterSpacing: '2px',
                                            textTransform: 'uppercase'
                                        }}>
                                            Real-Time Tracking
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="300">
                                    <div>
                                        <div style={{
                                            fontSize: '64px',
                                            fontWeight: '900',
                                            color: '#00ff88',
                                            marginBottom: '10px'
                                        }}>
                                            27
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            letterSpacing: '2px',
                                            textTransform: 'uppercase'
                                        }}>
                                            Star Catalog
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="400">
                                    <div>
                                        <div style={{
                                            fontSize: '64px',
                                            fontWeight: '900',
                                            color: '#00ff88',
                                            marginBottom: '10px'
                                        }}>
                                            LIVE
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            letterSpacing: '2px',
                                            textTransform: 'uppercase'
                                        }}>
                                            Space Weather
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </section>

                    {/* Eye Opening Overlay */}
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 10000,
                        pointerEvents: 'none'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '50%',
                            background: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 85%, rgba(255,255,255,0.8) 95%, transparent 100%)',
                            transform: `translateY(-${eyeOpen}%)`,
                            transition: 'transform 0.05s ease-out',
                            filter: 'blur(1px)'
                        }}></div>

                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '50%',
                            background: 'linear-gradient(to top, #ffffff 0%, #ffffff 85%, rgba(255,255,255,0.8) 95%, transparent 100%)',
                            transform: `translateY(${eyeOpen}%)`,
                            transition: 'transform 0.05s ease-out',
                            filter: 'blur(1px)'
                        }}></div>

                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 100%)',
                            opacity: 1 - (eyeOpen / 100),
                            transition: 'opacity 0.05s linear'
                        }}></div>
                    </div>
                </>
            )}

            <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
        </>
    );
}