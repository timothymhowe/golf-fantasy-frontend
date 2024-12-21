'use client'

import Image from 'next/image'

export function Logo({ className = '', logoSize = 120 }) {
  return (
    <div 
      className={`relative inline-block overflow-hidden ${className}`}
      style={{ 
        width: logoSize,
        height: logoSize,
        aspectRatio: '1/1',
      }}
    >
      <div className="relative w-full h-full">
        <Image
          src="/bg.svg"
          alt="Logo background"
          className="absolute inset-0 w-full h-full"
          width={logoSize}
          height={logoSize}
          priority
        />
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' fill='white'/%3E%3C/svg%3E")`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            maskImage: 'url("/bg.svg")',
            WebkitMaskImage: 'url("/bg.svg")',
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskPosition: 'center center',
            WebkitMaskPosition: 'center center',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            mixBlendMode: 'soft-light',
            opacity: 1,
          }}
        />
      </div>
      <Image
        src="/mg.svg"
        alt="Logo middleground"
        className="absolute inset-0 w-full h-full"
        width={logoSize}
        height={logoSize}
        priority
      />
      <div 
        className="absolute inset-0 w-full h-full"
      >
        <Image
          src="/fg.svg"
          alt="Logo foreground"
          className="absolute inset-0 w-full h-full transition-all duration-200 ease-out peer-hover:translate-y-1 peer-hover:drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
          width={logoSize}
          height={logoSize}
          priority
        />
        <div 
          className="peer absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 hover:cursor-pointer"
          style={{
            // Optional: uncomment to see the hover zone during development
            // backgroundColor: 'rgba(255, 0, 0, 0.2)'
          }}
        />
      </div>
    </div>
  )
}
