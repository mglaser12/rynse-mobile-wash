
// Import uuid at the top level of the file
import { v4 as uuidv4 } from 'uuid';

// Helper function to convert base64 to Blob
export const base64ToBlob = (base64: string) => {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};

// Upload a vehicle image to storage
export const uploadVehicleImageToStorage = async (base64Image: string, supabase: any): Promise<{ path: string | null; error: Error | null }> => {
  const fileName = `${uuidv4()}.jpg`;
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('vehicle-images')
    .upload(`public/${fileName}`, base64ToBlob(base64Image), {
      contentType: 'image/jpeg',
      cacheControl: '3600'
    });

  if (uploadError) {
    console.error("Error uploading image:", uploadError);
    return { path: null, error: uploadError };
  } else if (uploadData) {
    const { data } = supabase.storage.from('vehicle-images').getPublicUrl(uploadData.path);
    return { path: data.publicUrl, error: null };
  }

  return { path: null, error: null };
};
