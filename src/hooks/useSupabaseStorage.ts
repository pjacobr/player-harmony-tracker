import { supabase } from "@/integrations/supabase/client";

export const useSupabaseStorage = () => {
  const uploadScreenshot = async (file: File) => {
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `screenshot-${timestamp}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('File uploaded successfully:', uploadData);

    const { data: { publicUrl } } = supabase.storage
      .from('screenshots')
      .getPublicUrl(uploadData.path);

    console.log('Public URL generated:', publicUrl);
    return publicUrl;
  };

  return { uploadScreenshot };
};