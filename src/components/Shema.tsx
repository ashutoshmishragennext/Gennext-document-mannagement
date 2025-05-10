/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2Icon, PlusIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { signOut } from "next-auth/react";
import { Settings, LogOut } from 'lucide-react';
import { useSession } from "next-auth/react"; // Add this import

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  isRequired: z.boolean().default(false),
  metadataFields: z.array(z.object({
    fieldName: z.string().min(1, { message: "Field name is required" }),
    fieldType: z.enum(["string", "number", "boolean", "date"]),
    required: z.boolean().default(false),
    description: z.string().optional(),
    options: z.array(z.string()).optional(),
  })).min(1, { message: "At least one metadata field is required" }),
});

type FormValues = z.infer<typeof formSchema>;

const DocumentTypeForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession(); // Get session data
  
  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
      isRequired: false,
      metadataFields: [
        { fieldName: '', fieldType: 'string', required: false, description: '', options: [] }
      ],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'metadataFields',
  });
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    // Convert form data to the format expected by the API
    const metadataSchema = {
      type: 'object',
      required: data.metadataFields
        .filter(field => field.required)
        .map(field => field.fieldName),
      properties: data.metadataFields.reduce((acc, field) => {
        const schemaProperty: any = {
          type: field.fieldType,
          description: field.description || `${field.fieldName} field`,
        };
        
        // Add enum options if needed
        if (field.options && field.options.length > 0) {
          schemaProperty.enum = field.options;
        }
        
        return {
          ...acc,
          [field.fieldName]: schemaProperty
        };
      }, {}),
    };
    
    try {
      // Get organization ID from the session or from somewhere in your app
      const organizationId = '61e8458a-8f55-40c8-8adc-a78b744063c5';
      
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }
      
      const response = await fetch('/api/documentstype', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          isActive: data.isActive,
          isRequired: data.isRequired,
          metadataSchema,
          organizationId,
          createdBy: session?.user?.id, // Include the user ID
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create document type');
      }
      
      const result = await response.json();
      
      // Handle success (add toast notification here if you implement it)
      console.log('Document type created:', result);
      
      // Reset form
      form.reset();
    } catch (error) {
      console.error('Error creating document type:', error);
      // Handle error (add toast notification here if you implement it)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <nav className="bg-white shadow-sm border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">User Dashboard</h1>
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/images/user_alt_icon.png" alt="User" />
                  <AvatarFallback>
                    {session?.user?.name?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{session?.user?.name || 'User'}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-1">
                <button className="w-full flex items-center gap-2 rounded-lg p-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <Settings className="h-4 w-4" />
                  Profile Settings
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 rounded-lg p-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </nav>
      <CardHeader>
        <CardTitle>Create Document Type</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Document Type Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Document Type Name*</Label>
              <Input 
                id="name"
                placeholder="E.g., PASSPORT, AADHAAR, DRIVING_LICENSE"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                placeholder="Provide a description for this document type"
                {...form.register('description')}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={form.watch('isActive')}
                onCheckedChange={(checked) => form.setValue('isActive', checked)}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isRequired"
                checked={form.watch('isRequired')}
                onCheckedChange={(checked) => form.setValue('isRequired', checked)}
              />
              <Label htmlFor="isRequired">Required Document</Label>
            </div>
          </div>
          
          {/* Metadata Fields Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Metadata Schema</h3>
            <p className="text-sm text-gray-500">Define the fields that should be collected for this document type.</p>
            
            {fields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`metadataFields.${index}.fieldName`}>Field Name*</Label>
                    <Input
                      id={`metadataFields.${index}.fieldName`}
                      placeholder="E.g., documentNumber, expiryDate"
                      {...form.register(`metadataFields.${index}.fieldName`)}
                    />
                    {form.formState.errors.metadataFields?.[index]?.fieldName && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.metadataFields[index]?.fieldName?.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor={`metadataFields.${index}.fieldType`}>Field Type*</Label>
                    <Select
                      onValueChange={(value) => form.setValue(`metadataFields.${index}.fieldType` as any, value)}
                      defaultValue={field.fieldType}
                    >
                      <SelectTrigger id={`metadataFields.${index}.fieldType`}>
                        <SelectValue placeholder="Select field type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Yes/No</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor={`metadataFields.${index}.description`}>Field Description</Label>
                    <Input
                      id={`metadataFields.${index}.description`}
                      placeholder="Description for this field"
                      {...form.register(`metadataFields.${index}.description`)}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-6">
                    <Checkbox
                      id={`metadataFields.${index}.required`}
                      checked={form.watch(`metadataFields.${index}.required`)}
                      onCheckedChange={(checked) => 
                        form.setValue(`metadataFields.${index}.required` as any, !!checked)
                      }
                    />
                    <Label htmlFor={`metadataFields.${index}.required`}>Required Field</Label>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (fields.length > 1) {
                        remove(index);
                      }
                    }}
                    disabled={fields.length <= 1}
                  >
                    <Trash2Icon className="h-4 w-4 mr-1" />
                    Remove Field
                  </Button>
                </div>
              </Card>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ 
                fieldName: '', 
                fieldType: 'string', 
                required: false, 
                description: '',
                options: []
              })}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Metadata Field
            </Button>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Document Type'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DocumentTypeForm;