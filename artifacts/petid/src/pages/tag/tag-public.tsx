import { Pet } from "@workspace/api-client-react";
import { PetPhoto } from "@/components/pet-photo";
import { Phone, User, Lock } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVerifyPetPin } from "@workspace/api-client-react";

export function TagPublic({ pet, onUnlock }: { pet: Pet, onUnlock: (pin: string) => void }) {
  const [showUnlock, setShowUnlock] = useState(false);
  
  return (
    <div className="min-h-[100dvh] bg-background sm:p-4">
      <div className="max-w-md mx-auto bg-card min-h-[100dvh] sm:min-h-fit sm:rounded-3xl shadow-xl sm:border border-card-border overflow-hidden pb-10">
        <div className="aspect-square w-full">
           <PetPhoto photoObjectPath={pet.photoObjectPath} className="w-full h-full" />
        </div>
        
        <div className="px-6 py-8 space-y-8 -mt-6 bg-card relative rounded-t-3xl border-t border-card-border">
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-serif font-bold text-foreground">{pet.name}</h1>
            <p className="text-lg text-muted-foreground capitalize">
              {pet.breed ? `${pet.breed} ${pet.species}` : pet.species}
            </p>
          </div>
          
          {pet.description && (
            <div className="bg-secondary/30 p-6 rounded-2xl text-center">
              <p className="text-foreground leading-relaxed italic font-serif">"{pet.description}"</p>
            </div>
          )}
          
          <div className="space-y-4 pt-4 border-t border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground text-center">Owner Contact</h2>
            
            <a href={`tel:${pet.ownerPhone}`} className="block">
              <div className="bg-primary text-primary-foreground p-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-primary/90 transition-colors active:scale-[0.98] shadow-md shadow-primary/20">
                <Phone className="w-6 h-6" />
                <span className="text-lg font-medium">{pet.ownerPhone}</span>
              </div>
            </a>
            
            {pet.ownerName && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground pt-2">
                <User className="w-4 h-4" />
                <span className="font-medium text-foreground">{pet.ownerName}</span>
              </div>
            )}
          </div>
          
          <div className="pt-12 text-center">
            <button 
              onClick={() => setShowUnlock(true)}
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
            >
              <Lock className="w-3 h-3" />
              Owner? Unlock to edit
            </button>
          </div>
        </div>
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

function UnlockDialog({ petId, open, onOpenChange, onSuccess }: { petId: string, open: boolean, onOpenChange: (open: boolean) => void, onSuccess: (pin: string) => void }) {
  const [pin, setPin] = useState("");
  const verifyPin = useVerifyPetPin();
  const [error, setError] = useState("");

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
        setError("Incorrect PIN");
      }
    } catch (err) {
      setError("Failed to verify PIN. Please try again.");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Unlock Profile</DialogTitle>
          <DialogDescription>
            Enter the PIN you set when creating this tag to edit the profile.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter PIN"
              value={pin}
              onChange={e => { setPin(e.target.value); setError(""); }}
              className="text-center text-3xl tracking-[0.5em] h-16 font-mono bg-background"
              autoFocus
            />
            {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
          </div>
          <Button type="submit" className="w-full h-14 text-lg" disabled={verifyPin.isPending || pin.length < 4}>
            {verifyPin.isPending ? "Verifying..." : "Unlock"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
