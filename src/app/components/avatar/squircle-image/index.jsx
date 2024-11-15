import React, { useState } from "react";
import { ClipLoader } from "react-spinners";

/**
 * SquircleImage component displays an image with rounded square corners and loading state
 * Uses SVG clipPath for the squircle shape and includes a loading spinner
 * 
 * @param {Object} props
 * @param {string} props.photoUrl - URL of the image to display
 * @param {string} [props.alt] - Alt text for the image
 * @returns {JSX.Element} A squircle-shaped image with loading state
 */
const SquircleImage = ({ 
  photoUrl, 
  alt = "Player photo" 
}) => {
  console.log("SquircleImage received photoUrl:", photoUrl);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Handle image load error
  const handleError = (e) => {
    console.error("Image load error:", e);
    setError(true);
    setLoading(false);
  };

  // Handle image load success
  const handleLoad = () => {
    console.log("Image loaded successfully");
    setLoading(false);
  };

  return (
    <div className="relative w-24 h-[100px] rounded-[31px] shadow-md pointer-events-none">
      {/* Define the squircle shape */}
      <svg className="absolute w-full h-full">
        <defs>
          <clipPath id="squircle">
            <path
              d="M21,0 C26.5,0 30,3.5 30,9 L30,21 C30,26.5 26.5,30 21,30 L9,30 C3.5,30 0,26.5 0,21 L0,9 C0,3.5 3.5,0 9,0 L21,0 Z"
              transform="scale(3.2)"
            />
          </clipPath>
        </defs>
      </svg>

      {/* Loading spinner */}
      {loading && (
        <div className="absolute w-full h-full flex items-center justify-center">
          <ClipLoader 
            color={"#123abc"} 
            loading={loading} 
            size={15} 
            aria-label="Loading image"
          />
        </div>
      )}

      {/* Image with squircle clip path */}
      <img
        src={error ? "/portrait_placeholder_75.png" : photoUrl}
        alt={alt}
        className={`absolute w-24 h-[100px] object-cover top-[4px] ${
          loading ? "hidden" : ""
        }`}
        style={{
          clipPath: "url(#squircle)",
          backgroundImage:
            "linear-gradient(to right, rgba(211,211,225,0.5), rgba(105,105,125,0.5))",
        }}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export default SquircleImage;
