import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pet, useClaimPetTag, getGetPetTagQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck, Loader2, Sparkles, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PhotoUpload } from "@/components/photo-upload";

const claimSchema = z.object({
  name: z.string().min(1, "Name is required"),
  species: z.string().min(1, "Species is required"),
  breed: z.string().optional(),
  description: z.string().optional(),
  ownerName: z.string().optional(),
  ownerPhone: z.string().min(1, "Phone number is required"),
  photoObjectPath: z.string().optional(),
  pin: z.string().min(4, "PIN must be at least 4 characters").max(8, "PIN can't be longer than 8 characters"),
});

type ClaimValues = z.infer<typeof claimSchema>;

export function TagUnclaimed({ pet }: { pet: Pet }) {
  const queryClient = useQueryClient();
  const claimTag = useClaimPetTag();
  const { t } = useLanguage();
  
  const form = useForm<ClaimValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      name: "",
      species: "",
      breed: "",
      description: "",
      ownerName: "",
      ownerPhone: "",
      photoObjectPath: "",
      pin: "",
    }
  });

  const onSubmit = async (data: ClaimValues) => {
    try {
      await claimTag.mutateAsync({
        tagId: pet.id,
        data: {
          ...data,
          breed: data.breed || undefined,
          description: data.description || undefined,
          ownerName: data.ownerName || undefined,
          photoObjectPath: data.photoObjectPath || undefined,
        }
      });
      
      toast.success(t('profileCreated'));
      queryClient.invalidateQueries({ queryKey: getGetPetTagQueryKey(pet.id) });
    } catch (err) {
      toast.error(t('failedClaim'));
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background sm:p-6 pb-12 font-sans selection:bg-primary/20">
      <div className="max-w-2xl mx-auto bg-card min-h-[100dvh] sm:min-h-fit sm:rounded-[32px] shadow-2xl shadow-black/5 sm:border border-white/50 overflow-hidden relative">
        <div className="bg-foreground px-6 py-12 text-background text-center space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 mix-blend-overlay" />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="w-20 h-20 bg-white/10 rounded-[24px] flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20 rotate-3"
          >
            <Sparkles className="w-10 h-10 text-secondary" />
          </motion.div>
          <motion.h1 
            initial={{ y: 10, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.1 }}
            className="text-4xl font-serif font-extrabold tracking-tight relative z-10"
          >
            {t('welcomeTitle')}
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.2 }}
            className="text-background/80 text-lg max-w-sm mx-auto font-medium relative z-10"
          >
            {t('welcomeDesc')}
          </motion.p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 sm:p-10 space-y-10">
            <div className="space-y-10">
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3 }}
                className="space-y-4 text-center"
              >
                <FormLabel className="text-muted-foreground font-bold uppercase tracking-widest text-xs">{t('petProfilePhoto')}</FormLabel>
                <FormField
                  control={form.control}
                  name="photoObjectPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <PhotoUpload 
                          value={field.value || null} 
                          onChange={field.onChange} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
                <h3 className="text-2xl font-serif font-bold text-foreground">{t('aboutThem')}</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-foreground/80">{t('petsName')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('placeholderName')} className="h-14 rounded-[20px] text-lg bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="species"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-foreground/80">{t('speciesReq')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('placeholderSpecies')} className="h-14 rounded-[20px] text-lg bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="breed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-foreground/80">{t('breed')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('placeholderBreed')} className="h-14 rounded-[20px] text-lg bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-foreground/80">{t('bioSpecialNeeds')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('placeholderBio')} 
                          className="min-h-[120px] rounded-[20px] text-lg bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50 resize-none p-4"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-6 pt-6 border-t border-border">
                <h3 className="text-2xl font-serif font-bold text-foreground">{t('ownerContact')}</h3>
                
                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-foreground/80">{t('yourName')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('placeholderOwner')} className="h-14 rounded-[20px] text-lg bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ownerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-foreground/80">{t('phoneNumber')}</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder={t('placeholderPhone')} className="h-14 rounded-[20px] text-lg bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-secondary/10 p-6 rounded-[24px] border border-secondary/20 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center shrink-0">
                    <Lock className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{t('secureProfile')}</h3>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                      {t('secureProfileDesc')}
                    </p>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          type="password" 
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder={t('createPinPlaceholder')} 
                          className="h-16 bg-background font-mono tracking-[0.3em] text-center text-xl rounded-[20px] border-secondary/30 focus-visible:ring-secondary/50"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <Button 
                type="submit" 
                className="w-full h-16 text-lg font-bold rounded-[20px] shadow-xl shadow-primary/20 transition-transform active:scale-[0.98]" 
                disabled={claimTag.isPending}
              >
                {claimTag.isPending ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  t('createProfile')
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      </div>
    </div>
  );
}
