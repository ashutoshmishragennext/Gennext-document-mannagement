/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import {
  LogOut,
  Settings,
  UploadCloud
} from "lucide-react";
import { signOut } from "next-auth/react";
import React, { useEffect, useState } from 'react';

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import DocumentSearch from "@/components/Search";
import { useCurrentUser } from "@/hooks/auth";
import { toast } from '@/hooks/use-toast';
import { UploadButton } from "@/utils/uploadthing";

// Interface definitions
interface DocumentType {
  id: string;
  name: string;
  description?: string;
  organizationId?: string;
  metadata?: Metadata[];
}

interface Metadata {
  id: string;
  documentTypeId: string;
  schema: MetadataSchema;
  version: string;
}

interface MetadataSchema {
  type: string;
  required: string[];
  properties: Record<string, MetadataField>;
}

interface MetadataField {
  type: string;
  description: string;
}

interface Individual {
  id: string;
  fullName: string;
}

const UploadDocumentDialog = () => {
  // State management
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [selectedIndividual, setSelectedIndividual] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [originalFilename, setOriginalFilename] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isDirectUpload, setIsDirectUpload] = useState(false);
   console.log(isDirectUpload);
   

  const user = useCurrentUser();
  const organizationId = "0cb46f34-0d7d-48f8-8195-e664dbe6dd80"; // Example organization ID

  // Fetch data on component mount
  useEffect(() => {
    fetchDocumentTypes();
    fetchIndividuals();
  }, []);

  const fetchDocumentTypes = async () => {
    try {
      const res = await fetch("/api/documentstype");
      if (!res.ok) throw new Error("Failed to fetch document types");
      const data = await res.json();
      setDocumentTypes(data);
    } catch (error) {
      console.error("Error fetching document types:", error);
      toast({
        title: 'Error',
        description: 'Failed to load document types',
        variant: 'destructive',
      });
    }
  };

  const fetchIndividuals = async () => {
    try {
      const res = await fetch(`/api/students?organizationId=0cb46f34-0d7d-48f8-8195-e664dbe6dd80`);
      if (!res.ok) throw new Error("Failed to fetch individuals");
      const data = await res.json();
      setIndividuals(data.students);
    } catch (error) {
      console.error("Error fetching individuals:", error);
      toast({
        title: 'Error',
        description: 'Failed to load individuals',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setOriginalFilename(selectedFile.name);
    }
  };

  const resetForm = () => {
    setFormData({});
    setFile(null);
    setFileUrl(null);
    setOriginalFilename(null);
    setSelectedDocumentType('');
    setSelectedIndividual('');
    setUploadProgress(0);
    setIsLoading(false);
  };

  const handleDirectUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !selectedDocumentType || !selectedIndividual) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const uploadSimulation = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(uploadSimulation);
            return prev;
          }
          return prev + 5;
        });
      }, 200);
      
      // Create form data for the file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('organizationId', organizationId);
      formData.append('individualId', selectedIndividual);
      formData.append('documentTypeId', selectedDocumentType);
      formData.append('folderId', 'cfd51367-77f2-4881-acc4-f11c8ffb0d34');
      
      // Make the upload request
      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formData,
      // });
      
      clearInterval(uploadSimulation);
      
      // if (!response.ok) {
      //   throw new Error('Failed to upload document');
      // }
      
      setUploadProgress(100);
      
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });
      
      resetForm();
      setUploadDialogOpen(false);
    } catch (err) {
      console.error('Error uploading document:', err);
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadthing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!fileUrl || !selectedDocumentType || !selectedIndividual) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Get the metadata schema ID
    const selectedType = documentTypes.find(doc => doc.id === selectedDocumentType);
    const metadataSchemaId = selectedType?.metadata?.[0]?.id;
    
    if (!metadataSchemaId) {
      toast({
        title: 'Error',
        description: 'Invalid document type selected',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Create the document record
      
     
      
      // fileSize,
      // mimeType,
      // uploadThingFileId,
  
      
    

      
      const documentData = {
        studentId: selectedIndividual,
        documentTypeId: selectedDocumentType,
         fileSize:'7kb',
      mimeType:"done",
      // uploadThingFileId:"b5fd6e47-54b4-4cfb-9a5a-48efbbe2c8c8",
        uploadThingUrl: fileUrl,
        filename: originalFilename || "uploaded-document",
        metadata: formData,
        metadataSchemaId: metadataSchemaId,
        folderId: 'cfd51367-77f2-4881-acc4-f11c8ffb0d34',
        organizationId: organizationId,
        uploadedBy:'de2575c0-4c7d-4171-b420-a67a7e72e48f',
        verificationStatus:true,
      };

      const documentRes = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(documentData),
      });

      if (!documentRes.ok) {
        throw new Error("Failed to create document record");
      }

      const createdDocument = await documentRes.json();
      console.log("295");
      console.log(createdDocument);
      
      
    
      // Step 2: Extract keywords
      const keywordsData = {
        documentId: createdDocument.id,
        studentId: selectedIndividual,
        extractedText: "Sample extracted text from document",
        keywords: Object.values(formData)
          .filter(v => typeof v === "string")
          .map(v => v.toString())
      };
  console.log("307");
  
      const keywordsRes = await fetch("/api/document-keywords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(keywordsData),
      });

      if (!keywordsRes.ok) {
        console.warn("Failed to create keywords, but document was uploaded");
      }

      toast({
        title: 'Success',
        description: 'Document uploaded and indexed successfully',
      });
      
      resetForm();
    } catch (error) {
      console.error("Error uploading document:", error);
      console.log("329");
      
      toast({
        title: 'Error',
        description: 'Failed to process document',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get the selected document type's metadata schema
  const selectedTypeMetadata = selectedDocumentType 
    ? documentTypes.find(doc => doc.id === selectedDocumentType)?.metadata?.[0]?.schema 
    : null;

  return (
    <div className="p-6">
      <nav className="bg-white shadow-sm border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            Document Management Dashboard
          </h1>

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/images/user_alt_icon.png" alt={user?.name || "User"} />
                  <AvatarFallback>{user?.name?.substring(0, 2) || "U"}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || "User"}
                </span>
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

      <div className="flex space-x-8 mt-8">
        {/* Document Upload Section */}
        <div className="w-1/2">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold">Upload Document</h1>
            <Button onClick={() => {
              setUploadDialogOpen(true);
              setIsDirectUpload(true);
            }}>
              Quick Upload
            </Button>
          </div>

          <form onSubmit={handleUploadthing} className="space-y-6">
            {/* Individual Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Select Individual</label>
              <Select
                value={selectedIndividual}
                onValueChange={setSelectedIndividual}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Individual" />
                </SelectTrigger>
                <SelectContent>
                  {individuals.map((individual) => (
                    <SelectItem key={individual.id} value={individual.id}>
                      {individual.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document Type Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Document Type</label>
              <Select
                value={selectedDocumentType}
                onValueChange={setSelectedDocumentType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Document Type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name} - {doc.description || "No description"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Upload Document</label>
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res.length > 0) {
                    setFileUrl(res[0].serverData.fileUrl);
                    setOriginalFilename(res[0].name);
                    toast({
                      title: 'Success',
                      description: 'File uploaded successfully',
                    });
                  }
                }}
                onUploadError={(error) => {
                  console.error("Upload error:", error);
                  toast({
                    title: 'Error',
                    description: 'Failed to upload file',
                    variant: 'destructive',
                  });
                }}
              />
              {fileUrl && (
                <div className="text-sm text-green-600">
                  ✓ File uploaded: {originalFilename}
                </div>
              )}
            </div>

            {/* Dynamic Metadata Fields */}
            {selectedTypeMetadata && (
              <div className="space-y-4 border p-4 rounded-md bg-gray-50">
                <h3 className="font-medium">Document Information</h3>
                
                {Object.entries(selectedTypeMetadata.properties || {}).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {value.description}
                      {selectedTypeMetadata.required?.includes(key) && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <Input
                      type={value.type === "number" ? "number" : "text"}
                      name={key}
                      value={formData[key] || ""}
                      required={selectedTypeMetadata.required?.includes(key)}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !fileUrl || !selectedDocumentType || !selectedIndividual}
            >
              {isLoading ? "Processing..." : "Submit Document"}
            </Button>
          </form>
        </div>

        {/* Document Search Section */}
        <div className="w-1/2 py-8 px-4">
          <h1 className="text-2xl font-bold mb-6">Document Search</h1>
          <DocumentSearch />
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog 
        open={uploadDialogOpen} 
        onOpenChange={(open) => {
          if (!isLoading) setUploadDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDirectUpload}>
            <div className="grid gap-4 py-4">
              {/* Individual Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="individual" className="text-right">
                  Individual
                </Label>
                <Select
                  value={selectedIndividual}
                  onValueChange={setSelectedIndividual}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select individual" />
                  </SelectTrigger>
                  <SelectContent>
                    {individuals.map((individual) => (
                      <SelectItem key={individual.id} value={individual.id}>
                        {individual.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Document Type Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="documentType" className="text-right">
                  Document Type
                </Label>
                <Select
                  value={selectedDocumentType}
                  onValueChange={setSelectedDocumentType}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  File
                </Label>
                <div className="col-span-3">
                  {file ? (
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFile(null)}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-md p-6 text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-500">
                          Upload a file
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          PDF, DOC, DOCX, JPG, PNG up to 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Upload Progress */}
              {uploadProgress > 0 && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right text-sm col-span-1">
                    {uploadProgress}%
                  </div>
                  <div className="col-span-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isLoading || !file || !selectedDocumentType || !selectedIndividual}
              >
                {isLoading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadDocumentDialog;