import { useState, useCallback } from "react";

const LOCAL_STORAGE_KEY = "petid_created_tags";

export interface LocalTag {
  id: string;
  createdAt: number;
}

export function useLocalTags() {
  const [tags, setTags] = useState<LocalTag[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse local tags", e);
    }
    return [];
  });

  const addTag = useCallback((id: string) => {
    setTags((prev) => {
      // Don't add duplicates
      if (prev.some(t => t.id === id)) return prev;
      
      const newTags = [{ id, createdAt: Date.now() }, ...prev];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTags));
      } catch (e) {
        console.error("Failed to save local tags", e);
      }
      return newTags;
    });
  }, []);

  return { tags, addTag };
}
