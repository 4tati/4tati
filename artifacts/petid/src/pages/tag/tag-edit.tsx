import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pet, useUpdatePetTag, getGetPetTagQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PhotoUpload } from "@/components/photo-upload";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

const updateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  species: z.string().min(1, "Species is required"),
  breed: z.string().optional(),
  description: z.string().optional(),
  ownerName: z.string().optional(),
  ownerPhone: z.string().min(1, "Phone number is required"),
  photoObjectPath: z.string().optional(),
});

type UpdateValues = z.infer<typeof updateSchema>;

export function TagEdit({ pet, pin, onCancel, onSaved }: { pet: Pet, pin: string, onCancel: () => void, onSaved: () => void }) {
  const queryClient = useQueryClient();
  const updateTag = useUpdatePetTag();
  const [isLost, setIsLost] = useState(false);
  
  useEffect(() => {
    setIsLost(localStorage.getItem(`pet_lost_${pet.id}`) === 'true');
  }, [pet.id]);

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
      
      queryClient.setQueryData(getGetPetTagQueryKey(pet.id), updatedPet);
      toast.success("Profile updated successfully!");
      onSaved();
    } catch (err) {
      toast.error("Failed to update profile. Please try again.");
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
            <h1 className="text-2xl font-serif font-extrabold tracking-tight">Edit Profile</h1>
            <p className="text-sm font-medium text-muted-foreground">Updating {pet.name}'s tag</p>
          </div>
        </div>

        <div className="p-6 sm:p-10 space-y-8">
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between p-6 rounded-[24px] border border-destructive/20 bg-destructive/5 shadow-inner">
             <div className="space-y-1">
                <h3 className="font-bold text-lg text-destructive flex items-center gap-2">
                   <AlertTriangle className="w-5 h-5" /> Report Missing
                </h3>
                <p className="text-sm font-medium text-destructive/80">Turn this on to display an emergency banner</p>
             </div>
             <Switch 
                checked={isLost} 
                onCheckedChange={(v) => {
                   setIsLost(v);
                   localStorage.setItem(`pet_lost_${pet.id}`, String(v));
                   toast(v ? "Emergency banner activated" : "Emergency banner removed");
                }} 
             />
           </motion.div>

           <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
               <div className="space-y-10">
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4 text-center">
                   <FormLabel className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Pet Photo</FormLabel>
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
                   <h3 className="text-2xl font-serif font-bold text-foreground">Pet Details</h3>
                   
                   <FormField
                     control={form.control}
                     name="name"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="font-semibold text-foreground/80">Pet's Name *</FormLabel>
                         <FormControl>
                           <Input placeholder="e.g. Bella" className="h-14 rounded-[20px] text-lg bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50" {...field} />
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
                           <FormLabel className="font-semibold text-foreground/80">Species *</FormLabel>
                           <FormControl>
                             <Input placeholder="e.g. Dog, Cat" className="h-14 rounded-[20px] text-lg bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50" {...field} />
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
                           <FormLabel className="font-semibold text-foreground/80">Breed</FormLabel>
                           <FormControl>
                             <Input placeholder="e.g. Golden Retriever" className="h-14 rounded-[20px] text-lg bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50" {...field} />
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
                         <FormLabel className="font-semibold text-foreground/80">Description / Medical Needs</FormLabel>
                         <FormControl>
                           <Textarea 
                             placeholder="e.g. Friendly but shy. Needs daily medication." 
                             className="min-h-[120px] rounded-[20px] text-lg bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50 resize-none p-4"
                             {...field} 
                           />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                 </motion.div>

                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6 pt-6 border-t border-border">
                   <h3 className="text-2xl font-serif font-bold text-foreground">Owner Details</h3>
                   
                   <FormField
                     control={form.control}
                     name="ownerName"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="font-semibold text-foreground/80">Your Name</FormLabel>
                         <FormControl>
                           <Input placeholder="e.g. Jane Doe" className="h-14 rounded-[20px] text-lg bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50" {...field} />
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
                         <FormLabel className="font-semibold text-foreground/80">Phone Number *</FormLabel>
                         <FormControl>
                           <Input type="tel" placeholder="e.g. (555) 123-4567" className="h-14 rounded-[20px] text-lg bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/50" {...field} />
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
                       Saving...
                     </>
                   ) : (
                     "Save Changes"
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