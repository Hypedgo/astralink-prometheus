'use client';

import NavBar from './NavBar'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function SpinningGlobe() {
    const meshRef = useRef<THREE.Mesh>(null);
    const texture = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg');
    useFrame(() => { if (meshRef.current) meshRef.current.rotation.y += 0.0008; });
    return <mesh ref={meshRef}><sphereGeometry args={[1.8, 64, 64]} /><meshStandardMaterial map={texture} /></mesh>;
}

function SatelliteModel() {
    const { scene } = useGLTF('/satellite-model.glb');
    const groupRef = useRef<THREE.Group>(null);
    useEffect(() => {
        scene.traverse((child: any) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color('#c0c8d0'),
                    metalness: 0.85,
                    roughness: 0.3,
                });
            }
        });
    }, [scene]);
    useFrame(({ clock }) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.002;
            groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.15;
        }
    });
    return <group ref={groupRef} scale={[0.15, 0.15, 0.15]}><primitive object={scene} /></group>;
}

function SpinningMoon() {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame(() => { if (meshRef.current) meshRef.current.rotation.y += 0.0008; });
    return <mesh ref={meshRef}><sphereGeometry args={[1.8, 64, 64]} /><meshStandardMaterial color="#aaaaaa" roughness={0.95} /></mesh>;
}

function SpinningPlanet() {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame(() => { if (meshRef.current) meshRef.current.rotation.y += 0.001; });
    return <mesh ref={meshRef}><sphereGeometry args={[1.8, 64, 64]} /><meshStandardMaterial color="#1a3a5c" roughness={0.6} metalness={0.3} /></mesh>;
}

function Scene({ type }: { type: string }) {
    return (
        <Canvas camera={{ position: [0, 0, 9], fov: 55 }} style={{ background: 'transparent' }} gl={{ alpha: true }}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 3, 5]} intensity={2.5} color="#ffffff" />
            <directionalLight position={[-4, -2, -4]} intensity={0.3} color="#4466ff" />
            <pointLight position={[0, 0, 8]} intensity={0.4} color="#00ff88" />
            <Suspense fallback={null}>
                {type === 'globe' && <SpinningGlobe />}
                {type === 'satellite' && <SatelliteModel />}
                {type === 'moon' && <SpinningMoon />}
                {type === 'plan' && <SpinningPlanet />}
            </Suspense>
        </Canvas>
    );
}

const destinations = [
    { name: 'Mission Control', tag: 'ORBITAL OPERATIONS', description: 'Real-time 3D orbital tracking, space weather monitoring, ISS pass predictions, and live mission readiness scoring. Your command center for everything in orbit.', type: 'globe', href: '/mission-control' },
    { name: 'Sky View', tag: 'STELLAR NAVIGATION', description: 'A live planetarium in your browser. Track stars, constellations, planets, and the ISS position in real time from your exact location on Earth.', type: 'moon', href: '/sky-view' },
    { name: 'Satellites', tag: 'SPACECRAFT TRACKING', description: 'Track active satellites in orbit. View pass predictions, orbital data, and real-time positions for a growing catalog of spacecraft.', type: 'satellite', href: '/satellites' },
    { name: 'Planning', tag: 'MISSION PLANNING', description: 'Plan your observation sessions. Get optimal viewing windows, weather forecasts, and mission readiness scores for upcoming ISS passes.', type: 'plan', href: '/planning' },
];

function PulsingRing({ size }: { size: number }) {
    const [scale, setScale] = useState(1);
    const [opacity, setOpacity] = useState(0.4);
    useEffect(() => {
        const interval = setInterval(() => {
            setScale(s => s >= 1.8 ? 1 : s + 0.01);
            setOpacity(o => o <= 0 ? 0.4 : o - 0.005);
        }, 30);
        return () => clearInterval(interval);
    }, []);
    return (
        <div style={{ position: 'absolute', borderRadius: '50%', width: size, height: size, border: '1px solid rgba(0,255,136,0.3)', transform: `scale(${scale})`, opacity, pointerEvents: 'none', transition: 'none' }} />
    );
}

export default function LandingPage() {
    const [scrollY, setScrollY] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [glitching, setGlitching] = useState(false);
    const heroVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (heroVideoRef.current) heroVideoRef.current.play().catch(() => { });
    }, []);

    const changeDestination = (newIndex: number) => {
        setGlitching(true);
        setTimeout(() => { setActiveIndex(newIndex); setGlitching(false); }, 150);
    };

    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const videoOpacity = Math.max(0, 1 - scrollY / (vh * 0.5));
    const textOpacity = Math.max(0, 1 - scrollY / (vh * 0.25));
    const section2Opacity = Math.min(1, Math.max(0, (scrollY - vh * 0.4) / (vh * 0.3)));
    const section2FadeOut = Math.max(0, 1 - (scrollY - vh * 1.2) / (vh * 0.3));
    const section3Opacity = Math.min(1, Math.max(0, (scrollY - vh * 1.8) / (vh * 0.3)));
    const section3FadeOut = Math.max(0, 1 - (scrollY - vh * 2.8) / (vh * 0.3));
    const section4Opacity = Math.min(1, Math.max(0, (scrollY - vh * 3.2) / (vh * 0.3)));

    const dest = destinations[activeIndex];

    return (
        <div style={{ background: '#000000' }}>

            {/* SECTION 1 — Video hero */}
            <div style={{ height: '130vh', position: 'relative' }}>
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 1, opacity: videoOpacity, transition: 'opacity 0.05s linear' }}>
                    <video ref={heroVideoRef} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                        <source src="/satellite-video.mp4" type="video/mp4" />
                    </video>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.25) 100%)' }}></div>
                </div>
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}><NavBar /></div>
                <div style={{ position: 'fixed', bottom: '80px', left: '60px', zIndex: 50, opacity: textOpacity, transition: 'opacity 0.05s linear', pointerEvents: 'none' }}>
                    <p style={{ fontFamily: '"DM Serif Display", serif', fontSize: '44px', color: '#ffffff', margin: 0, lineHeight: '1.25', maxWidth: '580px', textShadow: '0 2px 30px rgba(0,0,0,0.6)' }}>
                        An updated intelligence<br />for Earth and Space.
                    </p>
                </div>
            </div>

            {/* SECTION 2 — What Is AstraLink */}
            <div style={{ minHeight: '100vh', background: '#000000', position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'row', alignItems: 'center', opacity: Math.min(section2Opacity, section2FadeOut), transition: 'opacity 0.1s linear', overflow: 'hidden' }}>
                <div style={{ width: '50%', padding: '100px 60px 100px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h1 style={{ fontFamily: '"Roboto", sans-serif', fontSize: '56px', fontWeight: '700', color: '#ffffff', margin: '0 0 32px 0', lineHeight: '1.1', letterSpacing: '-1px' }}>What Is AstraLink?</h1>
                    <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '18px', fontWeight: '300', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: '1.8' }}>
                        AstraLink is an aerospace intelligence platform that combines real world space and earth data, AI, and visualization into one single mission support system. What would usually only be available to experts in aerospace or aviation is now available to you with a matter of a few clicks. Jeremiah 33:3
                    </p>
                </div>
                <div style={{ width: '50%', height: '100vh', position: 'relative', flexShrink: 0 }}>
                    <Image src="/what-is-astralink.jpg" alt="What Is AstraLink" fill style={{ objectFit: 'cover' }} />
                </div>
            </div>

            {/* SPACER */}
            <div style={{ height: '40vh', background: '#000000', position: 'relative', zIndex: 20 }}></div>

            {/* SECTION 3 — The Goal */}
            <div style={{ minHeight: '100vh', background: '#000000', position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'row', alignItems: 'center', opacity: Math.min(section3Opacity, section3FadeOut), transition: 'opacity 0.1s linear', overflow: 'hidden' }}>
                <div style={{ width: '50%', padding: '100px 60px 100px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h1 style={{ fontFamily: '"Roboto", sans-serif', fontSize: '56px', fontWeight: '700', color: '#ffffff', margin: '0 0 32px 0', lineHeight: '1.1', letterSpacing: '-1px' }}>The Goal?</h1>
                    <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '18px', fontWeight: '300', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: '1.8' }}>
                        The goal is to provide an interactive mission control system for all. I don't want to gatekeep access or knowledge to only experts but make it available for everyone. The site started off as just an idea of trying to see if I can make a mission brief system for pilots to see if conditions are good enough to fly through. Then the site just took on a life of its own. I will still continue to add and refine things every chance I get. Proverbs 9:10
                    </p>
                </div>
                <div style={{ width: '50%', height: '100vh', position: 'relative', flexShrink: 0, opacity: section3Opacity, transition: 'opacity 0.3s linear' }}>
                    <Image src="/child-aerospace.jpg" alt="The Goal" fill style={{ objectFit: 'cover' }} />
                </div>
            </div>

            {/* SPACER */}
            <div style={{ height: '40vh', background: '#000000', position: 'relative', zIndex: 20 }}></div>

            {/* SECTION 4 — Choose Your Destination */}
            <div style={{ height: '100vh', background: '#000000', position: 'relative', zIndex: 20, opacity: section4Opacity, transition: 'opacity 0.1s linear', overflow: 'hidden' }}>

                {/* Scanlines */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,136,0.012) 3px, rgba(0,255,136,0.012) 4px)', pointerEvents: 'none', zIndex: 1 }}></div>

                {/* Title */}
                <div style={{ position: 'absolute', top: '28px', left: 0, right: 0, textAlign: 'center', zIndex: 10 }}>
                    <div style={{ fontSize: '10px', letterSpacing: '6px', color: 'rgba(0,255,136,0.5)', fontFamily: 'monospace', marginBottom: '6px' }}>// SELECT MISSION MODULE</div>
                    <h1 style={{ fontFamily: '"Audiowide", cursive', fontSize: '30px', color: '#ffffff', margin: 0, letterSpacing: '4px' }}>CHOOSE YOUR DESTINATION</h1>
                </div>

                {/* Left arrow */}
                <button onClick={() => changeDestination((activeIndex - 1 + destinations.length) % destinations.length)}
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '44px', cursor: 'pointer', zIndex: 20, transition: 'all 0.2s', padding: '10px', lineHeight: 1 }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#00ff88'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
                    ‹
                </button>

                {/* Right arrow */}
                <button onClick={() => changeDestination((activeIndex + 1) % destinations.length)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '44px', cursor: 'pointer', zIndex: 20, transition: 'all 0.2s', padding: '10px', lineHeight: 1 }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#00ff88'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
                    ›
                </button>

                {/* Main layout */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 5 }}>

                    {/* LEFT PANEL */}
                    <div style={{ width: '45%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '100px 40px 80px 80px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '76px', left: '56px', width: '44px', height: '44px', borderTop: '2px solid #00ff88', borderLeft: '2px solid #00ff88' }}></div>
                        <div style={{ position: 'absolute', top: '82px', left: '62px', width: '5px', height: '5px', background: '#00ff88', borderRadius: '50%' }}></div>
                        <div style={{ position: 'absolute', bottom: '56px', left: '56px', width: '44px', height: '44px', borderBottom: '2px solid #00ff88', borderLeft: '2px solid #00ff88' }}></div>
                        <div style={{ position: 'absolute', bottom: '62px', left: '62px', width: '5px', height: '5px', background: '#00ff88', borderRadius: '50%' }}></div>

                        <div style={{ opacity: glitching ? 0 : 1, transition: 'opacity 0.1s' }}>
                            <div style={{ fontSize: '10px', letterSpacing: '5px', color: '#00ff88', marginBottom: '4px', fontFamily: 'monospace' }}>{dest.tag}</div>
                            <div style={{ fontSize: '10px', letterSpacing: '3px', color: 'rgba(255,255,255,0.25)', marginBottom: '20px', fontFamily: 'monospace' }}>
                                MODULE {String(activeIndex + 1).padStart(2, '0')} / {String(destinations.length).padStart(2, '0')}
                            </div>
                            <h2 style={{ fontFamily: '"Roboto", sans-serif', fontSize: '50px', fontWeight: '700', color: '#ffffff', margin: '0 0 18px 0', lineHeight: '1.1', letterSpacing: '-1px' }}>{dest.name}</h2>
                            <div style={{ width: '40px', height: '2px', background: '#00ff88', marginBottom: '22px' }}></div>
                            <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', margin: '0 0 36px 0', maxWidth: '400px' }}>{dest.description}</p>
                            <Link href={dest.href}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '13px 26px', background: 'transparent', border: '1px solid #00ff88', color: '#00ff88', fontSize: '11px', fontWeight: '600', letterSpacing: '4px', textTransform: 'uppercase', textDecoration: 'none', width: 'fit-content', transition: 'all 0.2s', fontFamily: 'monospace' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#00ff88'; e.currentTarget.style.color = '#000000'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#00ff88'; }}>
                                INITIATE LAUNCH →
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div style={{ width: '55%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
                        <div style={{ position: 'absolute', top: '76px', right: '56px', width: '44px', height: '44px', borderTop: '2px solid #00ff88', borderRight: '2px solid #00ff88', zIndex: 10 }}></div>
                        <div style={{ position: 'absolute', top: '82px', right: '62px', width: '5px', height: '5px', background: '#00ff88', borderRadius: '50%', zIndex: 10 }}></div>
                        <div style={{ position: 'absolute', bottom: '56px', right: '56px', width: '44px', height: '44px', borderBottom: '2px solid #00ff88', borderRight: '2px solid #00ff88', zIndex: 10 }}></div>
                        <div style={{ position: 'absolute', bottom: '62px', right: '62px', width: '5px', height: '5px', background: '#00ff88', borderRadius: '50%', zIndex: 10 }}></div>

                        <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PulsingRing size={320} />
                            <PulsingRing size={280} />
                        </div>

                        <div style={{ position: 'absolute', left: '10%', right: '10%', height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,255,136,0.15), transparent)', pointerEvents: 'none' }}></div>
                        <div style={{ position: 'absolute', left: '50%', top: '10%', bottom: '10%', width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(0,255,136,0.15), transparent)', pointerEvents: 'none' }}></div>
                        <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>

                        <div style={{ width: '100%', height: '100%', opacity: glitching ? 0.3 : 1, transition: 'opacity 0.1s' }}>
                            <Scene type={dest.type} />
                        </div>
                    </div>
                </div>

                {/* Dots */}
                <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '12px', zIndex: 10 }}>
                    {destinations.map((_, i) => (
                        <button key={i} onClick={() => changeDestination(i)}
                            style={{ width: i === activeIndex ? '28px' : '8px', height: '4px', borderRadius: '2px', background: i === activeIndex ? '#00ff88' : 'rgba(0,255,136,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }}>
                        </button>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes flicker { 0%, 100% { opacity: 1; } 92% { opacity: 1; } 93% { opacity: 0.4; } 94% { opacity: 1; } 96% { opacity: 0.6; } 97% { opacity: 1; } }
            `}</style>

        </div>
    );
}