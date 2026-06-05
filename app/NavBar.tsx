'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function NavBar() {
    const pathname = usePathname()

    const links = [
        { href: '/mission-control', label: 'MISSION CONTROL' },
        { href: '/sky-view', label: 'SKY VIEW' },
        { href: '/satellites', label: 'SATELLITES' },
        { href: '/planning', label: 'PLANNING' },
    ]

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, height: '56px',
            background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)',
            borderBottom: '1px solid rgba(34,211,238,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 2px', zIndex: 2000
        }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <Image src="/logo.png" alt="AstraLink" width={600} height={170} style={{ objectFit: 'contain' }} />
            </Link>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {links.map(link => {
                    const active = pathname === link.href
                    return (
                        <Link key={link.href} href={link.href} style={{
                            color: active ? '#22d3ee' : 'rgba(255,255,255,0.6)',
                            textDecoration: 'none', fontSize: '12px', fontWeight: 600,
                            letterSpacing: '1.5px', fontFamily: 'monospace',
                            padding: '8px 16px',
                            border: active ? '1px solid rgba(34,211,238,0.5)' : '1px solid rgba(255,255,255,0.1)',
                            background: active ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.03)',
                            borderRadius: '4px', transition: 'all 0.2s',
                            position: 'relative'
                        }}
                            onMouseEnter={(e) => {
                                if (!active) {
                                    e.currentTarget.style.color = '#ffffff'
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!active) {
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                                }
                            }}>
                            {link.label}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}