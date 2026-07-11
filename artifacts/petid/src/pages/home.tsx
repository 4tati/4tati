import { Switch, Route } from "wouter";
import { Link } from "wouter";
import { PlusCircle, Search, Hash, ShieldCheck, Heart, Sparkles, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalTags } from "@/hooks/use-local-tags";
import { useCreatePetTag } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

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
    <div className="min-h-[100dvh] flex flex-col bg-background p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex-1 w-full max-w-lg mx-auto flex flex-col pt-16 sm:pt-24 space-y-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-5"
        >
          <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-primary to-secondary rounded-[24px] flex items-center justify-center mb-8 shadow-xl shadow-primary/20 rotate-3">
            <Heart className="w-10 h-10 text-white fill-white/20" />
          </div>
          <h1 className="text-5xl font-serif text-foreground font-extrabold tracking-tight">4Tati</h1>
          <p className="text-lg text-muted-foreground max-w-[280px] mx-auto font-medium leading-relaxed">
            The premium digital identity for your best friend.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="bg-card/60 backdrop-blur-xl border border-white/40 dark:border-white/10 p-8 rounded-[32px] shadow-2xl shadow-black/5 space-y-8"
        >
          <div className="space-y-4">
            <Button 
              onClick={handleCreate} 
              disabled={createTag.isPending}
              className="w-full h-16 text-lg rounded-[20px] font-semibold bg-foreground text-background hover:bg-foreground/90 transition-transform active:scale-[0.98] shadow-lg"
            >
              {createTag.isPending ? "Setting up..." : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Setup a New Tag
                </span>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs font-semibold uppercase tracking-widest">
              <span className="bg-transparent px-4 text-muted-foreground/60 backdrop-blur-md">Or find existing</span>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3">
            <Input 
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              placeholder="Tag ID or URL" 
              className="flex-1 h-14 rounded-[20px] bg-background/50 border-white/50 focus-visible:ring-primary/50 text-base"
            />
            <Button type="submit" variant="secondary" className="px-6 h-14 rounded-[20px] bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-transform active:scale-95 shadow-md">
              <Search className="w-5 h-5" />
            </Button>
          </form>
        </motion.div>

        {tags.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="space-y-5"
          >
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80 px-2 text-center">Your Pets</h2>
            <div className="space-y-3">
              {tags.map(tag => (
                <Link key={tag.id} href={`/tag/${tag.id}`} className="block">
                  <div className="bg-card/80 backdrop-blur-md border border-white/40 dark:border-white/10 p-5 rounded-[24px] hover:border-primary/50 transition-all hover:shadow-lg flex items-center justify-between group active:scale-[0.98]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Navigation className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-mono text-base font-semibold">{tag.id.slice(0, 8)}...</div>
                        <div className="text-sm text-muted-foreground font-medium">
                          {new Date(tag.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}