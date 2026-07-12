import { Switch, Route } from "wouter";
import { PlusCircle, Search, Hash, ShieldCheck, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreatePetTag } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

export default function Home() {
  const [, setLocation] = useLocation();
  const createTag = useCreatePetTag();
  const [searchId, setSearchId] = useState("");
  const { t } = useLanguage();

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
            {t('appSlogan')}
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
              {createTag.isPending ? t('settingUp') : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> {t('setupNewTag')}
                </span>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs font-semibold uppercase tracking-widest">
              <span className="bg-transparent px-4 text-muted-foreground/60 backdrop-blur-md">{t('orFindExisting')}</span>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3">
            <Input 
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              placeholder={t('tagIdOrUrl')} 
              className="flex-1 h-14 rounded-[20px] bg-background/50 border-white/50 focus-visible:ring-primary/50 text-base"
            />
            <Button type="submit" variant="secondary" className="px-6 h-14 rounded-[20px] bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-transform active:scale-95 shadow-md">
              <Search className="w-5 h-5" />
            </Button>
          </form>
        </motion.div>

      </div>
    </div>
  );
}
