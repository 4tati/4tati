import { useRef } from "react";
import { usePhotoUpload } from "@/hooks/use-photo-upload";
import { PetPhoto } from "./pet-photo";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";

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
    <div className="relative group rounded-2xl overflow-hidden aspect-square w-full max-w-sm mx-auto border-4 border-card-border">
      <PetPhoto photoObjectPath={value} className="w-full h-full" />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
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
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="shadow-xl"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading {progress}%
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              {value ? "Change Photo" : "Upload Photo"}
            </>
          )}
        </Button>
      </div>
      
      {/* Show uploading overlay even when not hovered if active */}
      {isUploading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
           <Button type="button" variant="secondary" size="sm" disabled className="shadow-xl">
             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             Uploading {progress}%
           </Button>
        </div>
      )}
    </div>
  );
}
