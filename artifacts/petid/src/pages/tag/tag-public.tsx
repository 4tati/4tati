import { Pet } from "@workspace/api-client-react";
import { PetPhoto } from "@/components/pet-photo";
import { Phone, User, Lock, Heart, Home, Stethoscope, Image as ImageIcon, Gamepad2, AlertTriangle, Syringe, Bone, Activity, Navigation, MessageCircle, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVerifyPetPin } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

type TabType = "home" | "medical" | "gallery" | "owner" | "play";

export function TagPublic({ pet, onUnlock }: { pet: Pet, onUnlock: (pin: string) => void }) {
  const [showUnlock, setShowUnlock] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [isLost, setIsLost] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Read local mock state for LOST status
    setIsLost(localStorage.getItem(`pet_lost_${pet.id}`) === 'true');
  }, [pet.id]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          const id = visibleEntries[0].target.id.replace('section-', '') as TabType;
          setActiveTab(id);
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -20% 0px",
        threshold: [0.1, 0.5, 0.9]
      }
    );

    const sections = ['home', 'medical', 'gallery', 'owner', 'play'].map(id => document.getElementById(`section-${id}`));
    sections.forEach(sec => {
      if (sec) observer.observe(sec);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: TabType) => {
    setActiveTab(id);
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const whatsappLink = pet.ownerPhone ? `https://wa.me/${pet.ownerPhone.replace(/\D/g, '')}` : "#";

  return (
    <div className="min-h-[100dvh] bg-background font-sans relative pb-32">
      
      {/* Floating Sticky Actions */}
      <div className="fixed bottom-28 right-4 flex flex-col gap-4 z-40">
         {pet.ownerPhone && (
           <>
             <motion.a 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                href={whatsappLink} 
                target="_blank" rel="noopener noreferrer"
                className="w-14 h-14 bg-[#25D366] text-white rounded-[20px] flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-110 active:scale-95 transition-transform"
             >
                <MessageCircle className="w-7 h-7" />
             </motion.a>
             <motion.a 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}
                href={`tel:${pet.ownerPhone}`} 
                className="w-14 h-14 bg-foreground text-background rounded-[20px] flex items-center justify-center shadow-lg shadow-black/20 hover:scale-110 active:scale-95 transition-transform"
             >
                <Phone className="w-7 h-7" />
             </motion.a>
           </>
         )}
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-[45vh] sm:h-[500px]">
        <PetPhoto photoObjectPath={pet.photoObjectPath} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
        
        {isLost && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-6 left-6 right-6 bg-destructive text-white px-5 py-4 rounded-[20px] flex items-center justify-center gap-3 shadow-2xl shadow-destructive/40 z-10"
          >
             <AlertTriangle className="w-6 h-6 animate-pulse" />
             <span className="font-extrabold tracking-widest text-lg uppercase">{t('missingPet')}</span>
          </motion.div>
        )}

        <div className="absolute bottom-8 left-6 right-6 text-white">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl font-serif font-extrabold mb-2 tracking-tight"
          >
            {pet.name}
          </motion.h1>
          <motion.p 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.1 }}
             className="text-xl font-medium text-white/90 capitalize drop-shadow-md"
          >
            {pet.breed ? `${pet.breed} • ${pet.species}` : (pet.species || t('unknown'))}
          </motion.p>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-6 py-8 space-y-24">
         <section id="section-home" className="max-w-2xl mx-auto scroll-mt-24">
            <HomeTab pet={pet} onUnlock={() => setShowUnlock(true)} />
         </section>

         <section id="section-medical" className="max-w-2xl mx-auto scroll-mt-24">
            <MedicalTab />
         </section>

         <section id="section-gallery" className="max-w-2xl mx-auto scroll-mt-24">
            <GalleryTab pet={pet} />
         </section>

         <section id="section-owner" className="max-w-2xl mx-auto scroll-mt-24">
            <OwnerTab pet={pet} />
         </section>

         <section id="section-play" className="max-w-2xl mx-auto scroll-mt-24 pb-20">
            <PlayTab pet={pet} />
         </section>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[500px] bg-background/80 backdrop-blur-2xl border border-border/50 shadow-2xl rounded-[32px] p-2 flex items-center justify-between z-50">
         <NavItem icon={Home} label={t('navHome')} isActive={activeTab === 'home'} onClick={() => scrollTo('home')} />
         <NavItem icon={Stethoscope} label={t('navMedical')} isActive={activeTab === 'medical'} onClick={() => scrollTo('medical')} />
         <NavItem icon={ImageIcon} label={t('navGallery')} isActive={activeTab === 'gallery'} onClick={() => scrollTo('gallery')} />
         <NavItem icon={User} label={t('navOwner')} isActive={activeTab === 'owner'} onClick={() => scrollTo('owner')} />
         <NavItem icon={Heart} label={t('navPlay')} isActive={activeTab === 'play'} onClick={() => scrollTo('play')} />
      </div>
      
      <UnlockDialog 
        petId={pet.id} 
        open={showUnlock} 
        onOpenChange={setShowUnlock} 
        onSuccess={onUnlock} 
      />
    </div>
  );
}

// --- Tabs Content ---

function HomeTab({ pet, onUnlock }: { pet: Pet, onUnlock: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-8">
      {pet.description && (
        <div className="bg-muted/50 p-6 rounded-[24px] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary rounded-l-[24px]" />
          <p className="text-foreground leading-relaxed text-lg font-medium">"{pet.description}"</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-card border border-border p-5 rounded-[24px] shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{t('speciesLabel')}</h4>
            <p className="text-lg font-semibold text-foreground capitalize">{pet.species || t('unknown')}</p>
         </div>
         <div className="bg-card border border-border p-5 rounded-[24px] shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{t('statusLabel')}</h4>
            <p className="text-lg font-semibold text-accent flex items-center gap-1">
               <ShieldCheck className="w-5 h-5" /> {t('statusSecured')}
            </p>
         </div>
      </div>

      <div className="pt-8 flex justify-center pb-2">
        <button 
          onClick={onUnlock}
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-full hover:bg-muted"
        >
          <Lock className="w-4 h-4" />
          {t('ownerLogin')}
        </button>
      </div>
    </div>
  );
}

function MedicalTab() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-serif font-extrabold tracking-tight">{t('medicalHistory')}</h2>
      
      <div className="space-y-4">
         <div className="bg-card border border-border p-5 rounded-[24px] shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0">
               <Syringe className="w-6 h-6 text-blue-500" />
            </div>
            <div>
               <h3 className="font-bold text-lg">{t('vaccinationsTitle')}</h3>
               <p className="text-muted-foreground font-medium mt-1">{t('vaccinationsDesc')}</p>
            </div>
         </div>

         <div className="bg-card border border-border p-5 rounded-[24px] shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center shrink-0">
               <AlertTriangle className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
               <h3 className="font-bold text-lg">{t('allergiesTitle')}</h3>
               <p className="text-muted-foreground font-medium mt-1">{t('allergiesDesc')}</p>
            </div>
         </div>

         <div className="bg-card border border-border p-5 rounded-[24px] shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
               <Stethoscope className="w-6 h-6 text-primary" />
            </div>
            <div>
               <h3 className="font-bold text-lg">{t('primaryVetTitle')}</h3>
               <p className="text-muted-foreground font-medium mt-1 whitespace-pre-line">{t('primaryVetDesc')}</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function GalleryTab({ pet }: { pet: Pet }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-serif font-extrabold tracking-tight">{t('galleryTitle')}</h2>
      <div className="grid grid-cols-2 gap-3">
         <div className="aspect-square rounded-[24px] overflow-hidden bg-muted shadow-sm">
           <PetPhoto photoObjectPath={pet.photoObjectPath} className="w-full h-full object-cover" />
         </div>
         {/* Mock gallery tiles */}
         <div className="aspect-square rounded-[24px] overflow-hidden bg-primary/5 flex items-center justify-center shadow-sm">
            <ImageIcon className="w-10 h-10 text-primary/30" />
         </div>
         <div className="aspect-square rounded-[24px] overflow-hidden bg-secondary/5 flex items-center justify-center shadow-sm">
            <ImageIcon className="w-10 h-10 text-secondary/30" />
         </div>
         <div className="aspect-square rounded-[24px] overflow-hidden bg-accent/5 flex items-center justify-center shadow-sm">
            <ImageIcon className="w-10 h-10 text-accent/30" />
         </div>
      </div>
    </div>
  );
}

function OwnerTab({ pet }: { pet: Pet }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-serif font-extrabold tracking-tight">{t('ownerContactTitle')}</h2>
      
      <div className="bg-card border border-border p-6 rounded-[32px] shadow-xl text-center space-y-6 mt-4">
         <div className="w-20 h-20 bg-muted rounded-[24px] mx-auto flex items-center justify-center shadow-inner rotate-3">
            <User className="w-10 h-10 text-muted-foreground" />
         </div>
         
         <div className="space-y-1">
            <h3 className="text-2xl font-bold">{pet.ownerName || t('petParent')}</h3>
            <p className="text-muted-foreground font-medium">{t('lovingOwnerOf')} {pet.name}</p>
         </div>

         <div className="pt-6 border-t border-border flex flex-col gap-3">
            <a href={`tel:${pet.ownerPhone}`} className="w-full h-16 bg-primary text-white rounded-[20px] flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
               <Phone className="w-6 h-6" />
               <span className="font-bold text-lg tracking-wide">{pet.ownerPhone}</span>
            </a>
         </div>
      </div>
    </div>
  );
}

function PlayTab({ pet }: { pet: Pet }) {
  const [happiness, setHappiness] = useState(30);
  const { t } = useLanguage();

  return (
    <div className="space-y-8 flex flex-col items-center text-center">
       <div className="space-y-2">
         <h2 className="text-3xl font-serif font-extrabold tracking-tight">{t('playtimeTitle')}</h2>
         <p className="text-muted-foreground font-medium">{t('playtimeDesc', { name: pet.name || '' })}</p>
       </div>

       <div className="w-48 h-48 rounded-full bg-secondary/10 flex items-center justify-center relative shadow-inner p-2 border-4 border-white dark:border-white/10 shadow-2xl">
          <motion.div 
             animate={{ scale: happiness > 80 ? [1, 1.1, 1] : 1, rotate: happiness > 80 ? [0, 5, -5, 0] : 0 }}
             transition={{ duration: 0.5 }}
             className="w-full h-full rounded-full overflow-hidden bg-muted"
          >
             <PetPhoto photoObjectPath={pet.photoObjectPath} className="w-full h-full object-cover" />
          </motion.div>
          
          <AnimatePresence>
             {happiness > 50 && (
                <motion.div initial={{ y: 0, opacity: 1, scale: 0.5 }} animate={{ y: -60, opacity: 0, scale: 1.5 }} exit={{ opacity: 0 }} className="absolute top-0 right-0">
                   <Heart className="w-10 h-10 text-destructive fill-destructive" />
                </motion.div>
             )}
          </AnimatePresence>
       </div>

       <div className="w-full max-w-sm space-y-3">
          <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-muted-foreground">
             <span>{t('moodLabel')}</span>
             <span>{happiness}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-5 overflow-hidden border border-border shadow-inner p-1">
             <motion.div 
                className={cn("h-full rounded-full", happiness > 70 ? "bg-accent" : happiness > 30 ? "bg-secondary" : "bg-primary")} 
                animate={{ width: `${happiness}%` }} 
             />
          </div>
       </div>

       <div className="flex gap-4 w-full max-w-sm pt-4">
          <Button onClick={() => setHappiness(Math.min(100, happiness + 15))} className="flex-1 h-16 rounded-[20px] text-lg font-bold shadow-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 active:scale-95">
             <Bone className="mr-2 w-6 h-6" /> {t('treatBtn')}
          </Button>
          <Button onClick={() => setHappiness(Math.min(100, happiness + 25))} className="flex-1 h-16 rounded-[20px] text-lg font-bold shadow-lg active:scale-95">
             <Activity className="mr-2 w-6 h-6" /> {t('playBtn')}
          </Button>
       </div>
    </div>
  );
}

// --- Nav Item ---

function NavItem({ icon: Icon, label, isActive, onClick }: { icon: any, label: string, isActive: boolean, onClick: () => void }) {
   return (
      <button 
         onClick={onClick}
         className={cn(
            "flex flex-col items-center justify-center w-16 h-16 rounded-[24px] transition-all relative",
            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
         )}
      >
         {isActive && (
            <motion.div layoutId="nav-pill" className="absolute inset-0 bg-primary/10 rounded-[24px]" />
         )}
         <Icon className={cn("w-6 h-6 mb-1 relative z-10", isActive && "fill-primary/20")} />
         <span className="text-[10px] font-bold tracking-wider relative z-10">{label}</span>
      </button>
   )
}


// --- Unlock Dialog ---

function UnlockDialog({ petId, open, onOpenChange, onSuccess }: { petId: string, open: boolean, onOpenChange: (open: boolean) => void, onSuccess: (pin: string) => void }) {
  const [pin, setPin] = useState("");
  const verifyPin = useVerifyPetPin();
  const [error, setError] = useState("");
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;
    
    try {
      const res = await verifyPin.mutateAsync({ tagId: petId, data: { pin } });
      if (res.valid) {
        onSuccess(pin);
        onOpenChange(false);
        setPin("");
        setError("");
      } else {
        setError(t('incorrectPin'));
      }
    } catch (err) {
      setError(t('failedVerifyPin'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) {
        setPin("");
        setError("");
      }
    }}>
      <DialogContent className="sm:max-w-md rounded-[32px] p-8 bg-card border border-border">
        <DialogHeader className="space-y-3">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
             <Lock className="w-8 h-8 text-foreground" />
          </div>
          <DialogTitle className="text-2xl font-serif text-center">{t('ownerAccess')}</DialogTitle>
          <DialogDescription className="text-center font-medium text-base">
            {t('enterPinDesc')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8 pt-6">
          <div className="space-y-3">
            <Input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="••••"
              value={pin}
              onChange={e => { setPin(e.target.value); setError(""); }}
              className="text-center text-4xl tracking-[0.5em] h-20 font-mono bg-muted/50 border-transparent rounded-[24px] focus-visible:bg-background"
              autoFocus
            />
            {error && <p className="text-sm font-bold text-destructive text-center">{error}</p>}
          </div>
          <Button type="submit" className="w-full h-16 text-lg font-bold rounded-[20px] shadow-xl" disabled={verifyPin.isPending || pin.length < 4}>
            {verifyPin.isPending ? t('verifying') : t('unlockProfile')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
