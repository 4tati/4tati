import { useRequestUploadUrl } from "@workspace/api-client-react";
import { useState } from "react";
import { compressImage } from "@/lib/image-compress";

export function usePhotoUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const requestUrl = useRequestUploadUrl();

  const upload = async (file: File): Promise<string> => {
    setIsUploading(true);
    setProgress(0);
    try {
      // Resize/compress before uploading so photos load fast both now and
      // every time the profile page is opened later.
      const uploadFile = await compressImage(file);

      const { uploadURL, objectPath } = await requestUrl.mutateAsync({
        data: { name: uploadFile.name, size: uploadFile.size, contentType: uploadFile.type }
      });

      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(true);
          else reject(new Error("Upload failed"));
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        
        xhr.open("PUT", uploadURL);
        xhr.setRequestHeader("Content-Type", uploadFile.type);
        xhr.send(uploadFile);
      });

      await uploadPromise;
      return objectPath;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return { upload, isUploading, progress };
}
