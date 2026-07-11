import { useParams, Link } from "wouter";
import { useGetPetTag, getGetPetTagQueryKey } from "@workspace/api-client-react";
import { useState, useEffect } from "react";
import { TagUnclaimed } from "./tag-unclaimed";
import { TagPublic } from "./tag-public";
import { TagEdit } from "./tag-edit";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalTags } from "@/hooks/use-local-tags";
import { motion } from "framer-motion";

export default function Tag() {
  const params = useParams();
  const tagId = params.id as string;
  const [unlockPin, setUnlockPin] = useState<string | null>(null);
  const { addTag } = useLocalTags();

  const { data: pet, isLoading, error } = useGetPetTag(tagId, {
    query: {
      enabled: !!tagId,
      queryKey: getGetPetTagQueryKey(tagId),
      retry: false
    }
  });

  // Track the tag if it exists, so owner can find it later easily
  useEffect(() => {
    if (pet) {
      addTag(pet.id);
    }
  }, [pet, addTag]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center space-y-8 bg-background relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-destructive/10 blur-[100px] rounded-full pointer-events-none" />
        
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 bg-card border border-border shadow-xl rounded-full flex items-center justify-center">
           <Search className="w-10 h-10 text-muted-foreground" />
        </motion.div>
        
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-3 max-w-sm">
          <h1 className="text-3xl font-serif font-extrabold text-foreground tracking-tight">Tag Not Found</h1>
          <p className="text-lg text-muted-foreground font-medium">This tag hasn't been created yet or doesn't exist.</p>
        </motion.div>
        
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Link href="/">
            <Button className="h-14 px-8 rounded-[20px] text-lg font-semibold shadow-lg">Back to Home</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!pet.claimed) {
    return <TagUnclaimed pet={pet} />;
  }

  if (unlockPin) {
    return <TagEdit pet={pet} pin={unlockPin} onCancel={() => setUnlockPin(null)} onSaved={() => setUnlockPin(null)} />;
  }

  return <TagPublic pet={pet} onUnlock={setUnlockPin} />;
}