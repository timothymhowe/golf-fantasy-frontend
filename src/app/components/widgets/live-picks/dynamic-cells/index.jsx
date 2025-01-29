import { useState, useEffect } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import Image from "next/image";
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';

// Initialize the library with English language support
countries.registerLocale(en);

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

export const GolferCell = ({ golfer, isLoading }) => {
  const [photoUrl, setPhotoUrl] = useState("/portrait_placeholder_75.png");
  
  useEffect(() => {
    if (golfer?.datagolf_id) {
      getGolferPhotoUrl(golfer.datagolf_id).then(setPhotoUrl);
    }
  }, [golfer?.datagolf_id]);

  if (isLoading) {
    return <div className="animate-pulse bg-white/10 h-6 w-32 rounded" />;
  }

  const getCountryCode = (alpha3Code) => {
    // Special cases for UK countries and others that might not be standard ISO
    const specialCases = {
      'ENG': 'gb-eng',
      'SCO': 'gb-sct',
      'NIR': 'gb-nir',
      'WAL': 'gb-wls',
    };

    if (specialCases[alpha3Code]) {
      return specialCases[alpha3Code];
    }

    return countries.alpha3ToAlpha2(alpha3Code)?.toLowerCase();
  };

  const countryCode = getCountryCode(golfer?.country);
  const flagUrl = countryCode ? `https://flagcdn.com/108x81/${countryCode}.png` : null;

  return (
    <div className="flex items-center justify-end space-x-1">
      <div className="flex flex-col items-end leading-tight relative min-w-[100px]">
        <div className="pl-2 relative z-10">
          <span className="text-sm font-medium text-white/90">
            {golfer?.last_name + "," || "-"}
          </span>
          <span className="block text-[10px] text-white/70">
            {golfer?.first_name || ""}
          </span>
        </div>
      </div>

      {/* Photo container with flag icon */}
      <div className="w-[45px] h-[45px]  flex-shrink-0 my-[-2px] relative overflow-hidden">
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
          <div className="absolute bottom-0 right-0 h-3 w-4 m-[1px]">
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
    </div>
  );
};