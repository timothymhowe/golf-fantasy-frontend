import React, { useState } from "react";
import { ClipLoader } from "react-spinners";
// import "./squircle-image-styles.css"

const SquircleImage = ({ photoUrl }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative w-24 h-[100px] rounded-[31px] shadow-md pointer-events-none">
      <svg className="absolute w-full h-full ">
        <defs>
          <clipPath id="squircle">
            <path
              d="M21,0 C26.5,0 30,3.5 30,9 L30,21 C30,26.5 26.5,30 21,30 L9,30 C3.5,30 0,26.5 0,21 L0,9 C0,3.5 3.5,0 9,0 L21,0 Z"
              transform="scale(3.2)"
            ></path>
          </clipPath>
        </defs>
      </svg>
      <svg  className="absolute h-full w-full ">
        <defs>
            <path
              d="M21,0 C26.5,0 30,3.5 30,9 L30,21 C30,26.5 26.5,30 21,30 L9,30 C3.5,30 0,26.5 0,21 L0,9 C0,3.5 3.5,0 9,0 L21,0 Z"
              transform="scale(3.2)"
            ></path>
        </defs>
      </svg>

      {loading && (
        <div className="absolute w-full h-full flex items-center justify-center">
          <ClipLoader color={"#123abc"} loading={loading} size={15} />
        </div>
      )}
      <img
        src={photoUrl}
        alt="Player"
        className={`absolute w-24 h-[100px] object-cover top-[4px]${
          loading ? "hidden" : ""
        }`}
        style={{
          clipPath: "url(#squircle)",
          backgroundImage:
            "linear-gradient(to right, rgba(211,211,225,0.5), rgba(105,105,125,0.5))",
        }}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

export default SquircleImage;
