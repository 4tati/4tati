import { Switch, Route } from "wouter";
import { Link } from "wouter";
import { PlusCircle, Search, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalTags } from "@/hooks/use-local-tags";
import { useCreatePetTag } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function Home() {
  const { tags } = useLocalTags();
  const [, setLocation] = useLocation();
  const createTag = useCreatePetTag();
  const [searchId, setSearchId] = useState("");

  const handleCreate = async () => {
    try {
      const pet = await createTag.mutateAsync();
      setLocation(`/tag/${pet.id}`);
    } catch (error) {
      console.error("Failed to create tag", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      // Handle either full URL or just the ID
      let id = searchId.trim();
      try {
        const url = new URL(id);
        const parts = url.pathname.split('/');
        const tagIndex = parts.indexOf('tag');
        if (tagIndex !== -1 && parts[tagIndex + 1]) {
          id = parts[tagIndex + 1];
        }
      } catch (e) {
        // Not a valid URL, treat as ID
      }
      setLocation(`/tag/${id}`);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background p-4 sm:p-8 font-sans">
      <div className="flex-1 w-full max-w-lg mx-auto flex flex-col pt-12 sm:pt-20 space-y-12">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <Hash className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-serif text-foreground font-semibold">PetID Tags</h1>
          <p className="text-lg text-muted-foreground max-w-sm mx-auto leading-relaxed">
            A personal ID service for your pet's collar. Tap the tag to see their profile, call their owner, and help them get home safe.
          </p>
        </div>

        <div className="bg-card border border-card-border p-6 rounded-3xl shadow-sm space-y-6">
          <Button 
            onClick={handleCreate} 
            disabled={createTag.isPending}
            className="w-full h-14 text-lg"
          >
            {createTag.isPending ? "Setting up..." : "Setup a New Tag"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">or find an existing one</span>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <Input 
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              placeholder="Tag ID or URL" 
              className="flex-1"
            />
            <Button type="submit" variant="secondary" className="px-4">
              <Search className="w-5 h-5" />
            </Button>
          </form>
        </div>

        {tags.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-2">Your Setup Tags</h2>
            <div className="space-y-2">
              {tags.map(tag => (
                <Link key={tag.id} href={`/tag/${tag.id}`} className="block">
                  <div className="bg-card border border-border p-4 rounded-2xl hover:border-primary/50 transition-colors flex items-center justify-between group active:scale-[0.98]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Hash className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-mono text-sm font-medium">{tag.id.slice(0, 8)}...</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(tag.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
