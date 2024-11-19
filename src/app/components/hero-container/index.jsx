import Image from 'next/image';

const HeroContainer = ({ children }) => {
  return (
    <div className="relative w-full flex items-center justify-center">
      {/* Background Image Container - fixed height */}
      <div className="w-full max-w-[1000px] h-[600px] relative">
        <Image
          src="/golf-login-bg.jpg"
          alt="Background"
          width={1000}
          height={600}
          className="object-cover rounded-3xl"
          priority
          style={{
            width: '100%',
            height: '600px'  // Fixed height
          }}
        />
        
        {/* Noise Overlay */}
        <div 
          className="absolute inset-0 rounded-3xl"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='linear' slope='3' intercept='-1'/%3E%3CfeFuncG type='linear' slope='3' intercept='-1'/%3E%3CfeFuncB type='linear' slope='3' intercept='-1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noiseFilter)' fill='white'/%3E%3C/svg%3E")`,

            backgroundRepeat: 'repeat',
            opacity: '.95',
            mixBlendMode: 'overlay'
          }}
        />
      </div>

      {/* Content */}
      <div className="absolute z-10">
        {children}
      </div>
    </div>
  );
};

export default HeroContainer;