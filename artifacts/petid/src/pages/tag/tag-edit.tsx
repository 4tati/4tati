import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pet, useUpdatePetTag, getGetPetTagQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PhotoUpload } from "@/components/photo-upload";

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
    <div className="min-h-[100dvh] bg-background sm:p-4 pb-12">
      <div className="max-w-xl mx-auto bg-card min-h-[100dvh] sm:min-h-fit sm:rounded-3xl shadow-xl sm:border border-card-border overflow-hidden">
        <div className="px-6 py-6 border-b border-border flex items-center gap-4 bg-card sticky top-0 z-10">
          <Button variant="ghost" size="icon" onClick={onCancel} className="-ml-2 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-serif font-bold">Edit Profile</h1>
            <p className="text-sm text-muted-foreground">Updating {pet.name}'s tag</p>
          </div>
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
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg" 
              disabled={updateTag.isPending || !form.formState.isDirty}
            >
              {updateTag.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
