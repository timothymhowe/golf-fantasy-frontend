import React, { useState } from "react";
import Image from "next/image";
import "./avatar-styles.css";

const Avatar = ({ avatarUrl, displayName }) => {
  const [imageError, setImageError] = useState(false);
  const defaultAvatar = "https://via.placeholder.com/100";

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="flex items-center justify-center mt-8">
      <div className="relative">
        <Image
          src={!imageError ? avatarUrl || defaultAvatar : defaultAvatar}
          alt={displayName || "User Avatar"}
          onError={handleImageError}
          width={100}
          height={100}
          className="rounded-full h-20 w-20 border-2 border-white avatar-img object-cover"
        />
       
      </div>
    </div>
  );
};

export default Avatar;
