export default function NotFound() {
    // No Firebase imports or client-side code
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white">404</h1>
          <p className="text-xl text-gray-400 mt-4">Page not found</p>
        </div>
      </div>
    );
  }