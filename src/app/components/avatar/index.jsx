import React from "react";
import "./avatar-styles.css";

const Avatar = ({ avatarUrl, displayName }) => {
  return (
    <div className="flex items-center justify-center mt-8">
      <a href="#user">
          <img
            src={avatarUrl || "https://via.placeholder.com/100"}
            alt={displayName || "User Avatar"}
            className="rounded-full h-20 w-20 border-2 border-white avatar-img"
          />
      </a>
    </div>
  );
};

export default Avatar;
