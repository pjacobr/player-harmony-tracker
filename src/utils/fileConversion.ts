import heic2any from "heic2any";

export const convertHeicToJpg = async (file: File): Promise<File> => {
  if (file.type === "image/heic" || file.name.toLowerCase().endsWith('.heic')) {
    console.log('Converting HEIC to JPEG...');
    try {
      const jpgBlob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8
      });
      
      const finalBlob = Array.isArray(jpgBlob) ? jpgBlob[0] : jpgBlob;
      const fileName = file.name.replace(/\.heic$/i, '.jpg');
      return new File([finalBlob], fileName, { type: 'image/jpeg' });
    } catch (error) {
      console.error('Error converting HEIC to JPEG:', error);
      throw new Error('Failed to convert HEIC image to JPEG');
    }
  }
  return file;
};