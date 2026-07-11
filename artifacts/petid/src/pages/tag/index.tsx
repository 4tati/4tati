import { useParams, Link } from "wouter";
import { useGetPetTag, getGetPetTagQueryKey } from "@workspace/api-client-react";
import { useState, useEffect } from "react";
import { TagUnclaimed } from "./tag-unclaimed";
import { TagPublic } from "./tag-public";
import { TagEdit } from "./tag-edit";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalTags } from "@/hooks/use-local-tags";

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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center space-y-6 bg-background">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
           <Search className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h1 className="text-2xl font-serif font-bold text-foreground">Tag Not Found</h1>
          <p className="text-muted-foreground">This tag hasn't been created yet or doesn't exist.</p>
        </div>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
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
