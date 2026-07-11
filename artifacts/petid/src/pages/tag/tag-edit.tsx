import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pet, useUpdatePetTag, getGetPetTagQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PhotoUpload } from "@/components/photo-upload";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { getStoredMedical, setStoredMedical } from "@/lib/local-medical";

const updateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  species: z.string().min(1, "Species is required"),
  breed: z.string().optional(),
  description: z.string().optional(),
  ownerName: z.string().optional(),
  ownerPhone: z.string().min(1, "Phone number is required"),
  photoObjectPath: z.string().optional(),
  vaccinations: z.string().optional(),
  allergies: z.string().optional(),
  vetName: z.string().optional(),
  vetPhone: z.string().optional(),
});

type UpdateValues = z.infer<typeof updateSchema>;

export function TagEdit({ pet, pin, onCancel, onSaved }: { pet: Pet, pin: string, onCancel: () => void, onSaved: () => void }) {
  const queryClient = useQueryClient();
  const updateTag = useUpdatePetTag();
  const [isLost, setIsLost] = useState(false);
  const { t } = useLanguage();
  
  useEffect(() => {
    setIsLost(localStorage.getItem(`pet_lost_${pet.id}`) === 'true');
  }, [pet.id]);

  const storedMedical = getStoredMedical(pet.id);

  const form = useForm<UpdateValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: pet.name || "",
      species: pet.species || "",
      breed: pet.breed || "",
      description: pet.description || "",
      ownerName: pet.ownerName || "",
      ownerPhone: pet.ownerPhone || "",
      photoObjectPath: pet.photoObjectPath || "",
      vaccinations: storedMedical?.vaccinations || "",
      allergies: storedMedical?.allergies || "",
      vetName: storedMedical?.vetName || "",
      vetPhone: storedMedical?.vetPhone || "",
    }
  });

  const onSubmit = async (data: UpdateValues) => {
    try {
      const updatedPet = await updateTag.mutateAsync({
        tagId: pet.id,
        data: {
          pin,
          name: data.name,
          species: data.species,
          breed: data.breed || undefined,
          description: data.description || undefined,
          ownerName: data.ownerName || undefined,
          ownerPhone: data.ownerPhone,
          photoObjectPath: data.photoObjectPath || undefined,
        }
      });

      // Medical info is UI-only (mocked) and has no backend field yet, so it's
      // persisted locally alongside the real profile update.
      setStoredMedical(pet.id, {
        vaccinations: data.vaccinations || "",
        allergies: data.allergies || "",
        vetName: data.vetName || "",
        vetPhone: data.vetPhone || "",
      });
      
      queryClient.setQueryData(getGetPetTagQueryKey(pet.id), updatedPet);
      toast.success(t('profileUpdated'));
      onSaved();
    } catch (err) {
      toast.error(t('failedUpdate'));
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background sm:p-6 pb-12 font-sans">
      <div className="max-w-2xl mx-auto bg-card min-h-[100dvh] sm:min-h-fit sm:rounded-[32px] shadow-2xl shadow-black/5 sm:border border-white/50 overflow-hidden relative">
        <div className="px-6 py-6 border-b border-border flex items-center gap-4 bg-card/80 backdrop-blur-xl sticky top-0 z-20">
          <Button variant="ghost" size="icon" onClick={onCancel} className="-ml-2 shrink-0 h-12 w-12 rounded-full hover:bg-muted">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-serif font-extrabold tracking-tight">{t('editProfile')}</h1>
            <p className="text-sm font-medium text-muted-foreground">{t('updatingTag', { name: pet.name || '' })}</p>
          </div>
        </div>

        <div className="p-6 sm:p-10 space-y-8">
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between p-6 rounded-[24px] border border-destructive/20 bg-destructive/5 shadow-inner">
             <div className="space-y-1">
                <h3 className="font-bold text-lg text-destructive flex items-center gap-2">
                   <AlertTriangle className="w-5 h-5" /> {t('reportMissing')}
                </h3>
                <p className="text-sm font-medium text-destructive/80">{t('reportMissingDesc')}</p>
             </div>
             <Switch 
                checked={isLost} 
                onCheckedChange={(v) => {
                   setIsLost(v);
                   localStorage.setItem(`pet_lost_${pet.id}`, String(v));
                   toast(v ? t('bannerActivated') : t('bannerRemoved'));
                }} 
             />
           </motion.div>

           <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
               <div className="space-y-10">
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4 text-center">
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

                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
                   <h3 className="text-2xl font-serif font-bold text-foreground">{t('petDetails')}</h3>
                   
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

                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-6 pt-6 border-t border-border">
                   <div>
                     <h3 className="text-2xl font-serif font-bold text-foreground">{t('medicalInfoTitle')}</h3>
                     <p className="text-sm font-medium text-muted-foreground mt-1">{t('medicalInfoDesc')}</p>
                   </div>

                   <FormField
                     control={form.control}
                     name="vaccinations"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="font-semibold text-foreground/80">{t('vaccinationsLabel')}</FormLabel>
                         <FormControl>
                           <Textarea
                             placeholder={t('placeholderVaccinations')}
                             className="min-h-[100px] rounded-[20px] text-lg bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50 resize-none p-4"
                             {...field}
                           />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />

                   <FormField
                     control={form.control}
                     name="allergies"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="font-semibold text-foreground/80">{t('allergiesLabel')}</FormLabel>
                         <FormControl>
                           <Textarea
                             placeholder={t('placeholderAllergies')}
                             className="min-h-[100px] rounded-[20px] text-lg bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50 resize-none p-4"
                             {...field}
                           />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />

                   <div className="grid grid-cols-2 gap-4">
                     <FormField
                       control={form.control}
                       name="vetName"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="font-semibold text-foreground/80">{t('vetNameLabel')}</FormLabel>
                           <FormControl>
                             <Input placeholder={t('placeholderVetName')} className="h-14 rounded-[20px] text-lg bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50" {...field} />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     <FormField
                       control={form.control}
                       name="vetPhone"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="font-semibold text-foreground/80">{t('vetPhoneLabel')}</FormLabel>
                           <FormControl>
                             <Input type="tel" placeholder={t('placeholderVetPhone')} className="h-14 rounded-[20px] text-lg bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50" {...field} />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                   </div>
                 </motion.div>

                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6 pt-6 border-t border-border">
                   <h3 className="text-2xl font-serif font-bold text-foreground">{t('ownerDetails')}</h3>
                   
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
               </div>

               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                 <Button 
                   type="submit" 
                   className="w-full h-16 text-lg font-bold rounded-[20px] shadow-xl transition-transform active:scale-[0.98]" 
                   disabled={updateTag.isPending || !form.formState.isDirty}
                 >
                   {updateTag.isPending ? (
                     <>
                       <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                       {t('saving')}
                     </>
                   ) : (
                     t('saveChanges')
                   )}
                 </Button>
               </motion.div>
             </form>
           </Form>
        </div>
      </div>
    </div>
  );
}
