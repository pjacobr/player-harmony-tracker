import { Button } from "@/components/ui/button";

interface UploadButtonProps {
  isAnalyzing: boolean;
  onFileSelect: (file: File) => void;
}

export const UploadButton = ({ isAnalyzing, onFileSelect }: UploadButtonProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <Button
      disabled={isAnalyzing}
      className="relative"
      variant="outline"
    >
      {isAnalyzing ? "Analyzing..." : "Upload Screenshot"}
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleChange}
        accept="image/*"
        disabled={isAnalyzing}
      />
    </Button>
  );
};