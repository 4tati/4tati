import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pet, useClaimPetTag, getGetPetTagQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";

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
  
  const form = useForm<ClaimValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      name: "",
      species: "dog",
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
      
      toast.success("Profile created and locked!");
      queryClient.invalidateQueries({ queryKey: getGetPetTagQueryKey(pet.id) });
    } catch (err) {
      toast.error("Failed to claim tag. It might already be claimed.");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background sm:p-4 pb-12">
      <div className="max-w-xl mx-auto bg-card min-h-[100dvh] sm:min-h-fit sm:rounded-3xl shadow-xl sm:border border-card-border overflow-hidden">
        <div className="bg-primary px-6 py-10 text-primary-foreground text-center space-y-3">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-serif font-bold">Setup New Tag</h1>
          <p className="text-primary-foreground/80 text-sm max-w-sm mx-auto">
            Add your pet's details below. This information will be visible to anyone who scans the tag.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <FormLabel className="text-muted-foreground font-semibold uppercase tracking-wider text-xs">Pet Photo</FormLabel>
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
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-serif font-medium border-b border-border pb-2">Pet Details</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pet's Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Bella" {...field} />
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
                        <FormLabel>Species *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Dog, Cat" {...field} />
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
                        <FormLabel>Breed</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Golden Retriever" {...field} />
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
                      <FormLabel>Description / Medical Needs</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g. Friendly but shy. Needs daily medication." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-serif font-medium border-b border-border pb-2">Owner Details</h3>
                
                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Jane Doe" {...field} />
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
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="e.g. (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-secondary/30 p-5 rounded-2xl border border-secondary border-dashed space-y-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground">Secure Profile</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Set a PIN to lock this profile. You'll need it later if you want to update these details.
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
                          placeholder="Create a 4-8 digit PIN" 
                          className="bg-background font-mono tracking-widest text-center"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg" 
              disabled={claimTag.isPending}
            >
              {claimTag.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & Lock Profile"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

// Temporary lock icon import since it was missing
import { Lock } from "lucide-react";
