import { useRef } from "react";
import { usePhotoUpload } from "@/hooks/use-photo-upload";
import { PetPhoto } from "./pet-photo";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  value: string | null;
  onChange: (path: string) => void;
}

export function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, progress } = usePhotoUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const path = await upload(file);
      onChange(path);
    } catch (err) {
      console.error(err);
    }
    
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="relative group rounded-[32px] overflow-hidden aspect-square w-full max-w-xs mx-auto border-4 border-card bg-muted shadow-2xl shadow-black/10">
      <PetPhoto photoObjectPath={value} className="w-full h-full" />
      
      <div className={cn(
        "absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300",
        value && !isUploading ? "opacity-0 group-hover:opacity-100" : "opacity-100"
      )}>
        <input 
          type="file" 
          ref={inputRef}
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <Button 
          type="button"
          variant="secondary" 
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="shadow-xl rounded-full h-14 px-6 text-base font-bold bg-white text-black hover:bg-gray-100 border-0"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              Uploading {progress}%
            </>
          ) : (
            <>
              <Camera className="mr-3 h-5 w-5" />
              {value ? "Change Photo" : "Upload Photo"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}