import { useState, useEffect } from 'react';

const LoadingScreen = ({ delay = 3000 }) => {
  const [showColdStartMessage, setShowColdStartMessage] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowColdStartMessage(true);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [delay]);

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="text-white text-xl animate-pulse">
        Loading...
      </div>
      
      {showColdStartMessage && (
        <div className="text-sm text-white text-center mt-4 animate-fade-in">
          <p>First connection may take a few moments...</p>
          <p className="mt-1">Our server is warming up!</p>
        </div>
      )}
    </div>
  );
};

export default LoadingScreen;
