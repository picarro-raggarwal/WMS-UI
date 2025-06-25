/// <reference types="react" />
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";

const cylinderSchema = z.object({
  id: z.string().min(1, "Cylinder ID is required"),
  productionNumber: z.string().min(1, "Production number is required"),
  type: z.enum(["Standard", "Zero"]),
  gasType: z.string().min(1, "Gas type is required"),
  concentration: z.string().min(1, "Concentration is required"),
  certificationDate: z.string().min(1, "Certification date is required"),
  expirationDate: z.string().min(1, "Expiration date is required"),
  blendTolerance: z.string().min(1, "Blend tolerance is required"),
  analyticalAccuracy: z.string().min(1, "Analytical accuracy is required"),
});

interface AddCylinderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: z.infer<typeof cylinderSchema>) => void;
}

export const AddCylinderDialog: React.ComponentType<AddCylinderDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const form = useForm<z.infer<typeof cylinderSchema>>({
    resolver: zodResolver(cylinderSchema),
    defaultValues: {
      type: "Standard",
    },
  });

  const handleSubmit = (data: z.infer<typeof cylinderSchema>) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Gas Cylinder</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cylinder ID</FormLabel>
                    <FormControl>
                      <Input placeholder="CC-XXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productionNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Production Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter production number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Zero">Zero</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gasType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gas Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Multi-Component, N2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="concentration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concentration</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1.00 ppm / 100 ppb" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="certificationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certification Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="blendTolerance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blend Tolerance</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 20% Relative" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="analyticalAccuracy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Analytical Accuracy</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 10% Relative" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Cylinder</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
