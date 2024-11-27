import React, { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import Image from "next/image";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    // Start loading state when photoUrl changes
    setLoading(true);
    
    if (!photoUrl) {
      setImageUrl("/portrait_placeholder_75.png");
      setLoading(false);
    } else {
      // Verify the image exists before setting it
      const img = new window.Image();
      img.src = photoUrl;
      
      img.onload = () => {
        setImageUrl(photoUrl);
        setLoading(false);
        setError(false);
      };
      
      img.onerror = () => {
        console.error("Failed to load image:", photoUrl);
        setImageUrl("/portrait_placeholder_75.png");
        setError(true);
        setLoading(false);
      };
    }
  }, [photoUrl]);

  const handleError = () => {
    console.error("Image load error, falling back to placeholder");
    setError(true);
    setImageUrl("/portrait_placeholder_75.png");
    setLoading(false);
  };

  return (
    <div className="relative w-24 h-[100px] rounded-[31px] shadow-md pointer-events-none">
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

      {imageUrl && (
        <Image
          src={imageUrl}
          alt={alt}
          width={250}
          height={100}
          className={`absolute w-24 h-[100px] object-cover top-[4px]`}
          style={{
            clipPath: "url(#squircle)",
            backgroundImage:
              "linear-gradient(to right, rgba(211,211,225,0.5), rgba(105,105,125,0.5))",
          }}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default SquircleImage;
