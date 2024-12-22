import { useState, useEffect } from 'react';
import { SkeletonLayout } from '../hg-layout';

const LoadingScreen = ({ delay = 3000 }) => {
  const [showColdStartMessage, setShowColdStartMessage] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowColdStartMessage(true);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [delay]);

  return (
    <SkeletonLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div style={{ height: '40px' }} className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BFFF00]" />
      </div>
        
        {showColdStartMessage && (
          <div className="text-sm text-white/50 text-center mt-4 animate-fade-in">
            <p>First connection may take a few moments...</p>
            <p className="mt-1">Our server is warming up!</p>
          </div>
        )}
      </div>
    </SkeletonLayout>
  );
};

export default LoadingScreen;
