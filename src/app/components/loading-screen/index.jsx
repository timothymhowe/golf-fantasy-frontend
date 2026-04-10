import { SkeletonLayout } from '../hg-layout';

const LoadingScreen = () => {
  return (
    <SkeletonLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div style={{ height: '40px' }} className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BFFF00]" />
        </div>
      </div>
    </SkeletonLayout>
  );
};

export default LoadingScreen;
