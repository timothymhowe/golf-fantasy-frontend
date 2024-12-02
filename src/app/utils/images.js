import { getStorage, ref, getDownloadURL } from "firebase/storage";

// Cache for photo URLs to avoid repeated fetches
const photoCache = new Map();

export const getGolferPhotoUrl = async (datagolf_id) => {
  if (!datagolf_id) {
    return "/portrait_placeholder_75.png";
  }

  // Check cache first
  if (photoCache.has(datagolf_id)) {
    return photoCache.get(datagolf_id);
  }

  try {
    const storage = getStorage();
    const photoRef = ref(storage, `headshots/thumbnails/${datagolf_id}_headshot_100x100.png`);
    const url = await getDownloadURL(photoRef);
    photoCache.set(datagolf_id, url); // Cache the successful result
    return url;
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      console.log(`Valid golfer ID ${datagolf_id} but no photo found in storage`);
    }
    const placeholderUrl = "/portrait_placeholder_75.png";
    photoCache.set(datagolf_id, placeholderUrl); // Cache the fallback too
    return placeholderUrl;
  }
};