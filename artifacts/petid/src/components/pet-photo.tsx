import { Camera, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PetPhotoProps {
  photoObjectPath: string | null;
  className?: string;
}

export function PetPhoto({ photoObjectPath, className }: PetPhotoProps) {
  if (photoObjectPath) {
    const src = `${import.meta.env.BASE_URL}api/storage${photoObjectPath}`;
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <img 
          src={src} 
          alt="Pet" 
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}>
      <ImageIcon className="w-1/3 h-1/3 opacity-20" />
    </div>
  );
}
