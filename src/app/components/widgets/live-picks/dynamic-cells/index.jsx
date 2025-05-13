import { useState, useEffect, useMemo } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import Image from "next/image";
import { getCountryCode } from '@/utils/countryUtils';

/**
 * Gets the golfer's photo URL from Firebase Storage
 */
const getGolferPhotoUrl = async (datagolf_id) => {
  if (!datagolf_id) {
    return "/portrait_placeholder_75.png";
  }

  try {
    const storage = getStorage();
    const photoRef = ref(storage, `headshots/thumbnails/${datagolf_id}_headshot_200x200.png`);
    const url = await getDownloadURL(photoRef);
    return url;
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      console.log(`Valid golfer ID ${datagolf_id} but no photo found in storage`);
    }
    return "/portrait_placeholder_75.png";
  }
};

// Add this function at the top with other utilities
const getColorFromCode = (code) => {
  // Define a set of muted but distinct colors (around 50% saturation)
  const colors = [    '#D35D9C', // muted pink
    '#75D35D', // muted lime
    '#5DB5D3', // muted cyan
    '#D3B55D', // muted gold
    '#A65DD3',  // muted violet
    '#D35D5D', // muted red
    '#5D9178', // muted green
    '#D38D5D', // muted orange
    '#5D7CD3', // muted blue
    '#8F5DD3', // muted purple

  ];

  // Create a consistent hash from the course code
  const hash = code.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Use the hash to pick a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const GolferCell = ({ golfer, isLoading }) => {
  const [photoUrl, setPhotoUrl] = useState("/portrait_placeholder_75.png");
  
  useEffect(() => {
    if (golfer?.datagolf_id) {
      getGolferPhotoUrl(golfer.datagolf_id).then(setPhotoUrl);
    }
  }, [golfer?.datagolf_id]);

  // Memoize the country code conversion
  const countryCode = useMemo(() => 
    golfer?.country ? getCountryCode(golfer.country) : null,
    [golfer?.country]
  );

  // Memoize the flag URL creation
  const flagUrl = useMemo(() => 
    countryCode ? `https://flagcdn.com/108x81/${countryCode}.png` : null,
    [countryCode]
  );

  // Memoize the course color to prevent recalculation
  const courseColor = useMemo(() => 
    golfer?.course_code ? getColorFromCode(golfer.course_code) : null,
    [golfer?.course_code]
  );

  // Add this to see what data we have
  console.log('Golfer data:', golfer);

  if (isLoading) {
    return <div className="animate-pulse bg-white/10 h-6 w-32 rounded" />;
  }

  return (
    <div className="flex items-center space-x-1">
      {/* Photo container with flag icon */}
      <div className="w-[45px] h-[45px] flex-shrink-0 my-[-2px] relative overflow-hidden">
        <Image 
          width={200}
          height={200}
          src={photoUrl} 
          alt={`${golfer?.first_name} ${golfer?.last_name}`}
          className="h-[60px] w-full object-cover object-[center_top] overflow-hidden"
          loading="lazy"
        />
        {/* Flag icon overlay */}
        {flagUrl && (
          <div className="absolute bottom-0 left-0 h-3 w-4 m-[1px]">
            <img
              src={flagUrl}
              alt=""
              className="h-full w-full"
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Name container */}
        <div className="flex flex-col justify-center min-w-[100px]">
          <span className="text-sm font-medium text-white/90 text-left">
            {golfer?.last_name + "," || "-"}
          </span>
          <span className="text-[10px] text-white/70 text-left">
            {golfer?.first_name || ""}
          </span>
        </div>

        {/* Course code badge */}
        {/* TODO: Implement check in parent component for multiple courses, only display if multiple courses exist */}
        {golfer?.course_code && (
          <div 
            className="px-1 py-[2px] mx-1 bg-[#2A2A2A] rounded-sm text-[9px] font-medium tracking-wide text-opacity-25 w-[20px] text-center"
            style={{ 
              color: courseColor,
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
              textShadow: '0 0 8px rgba(0,0,0,0.2)'
            }}
          >
            {golfer.course_code}
          </div>
        )}
      </div>
    </div>
  );
};

// Add display name for debugging
GolferCell.displayName = 'GolferCell';