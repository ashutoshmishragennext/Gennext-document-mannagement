/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCurrentUser } from "@/hooks/auth";
import { LogOut, Settings } from 'lucide-react';
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from 'react';

interface MetadataField {
  type: string;
  description: string;
}

interface MetadataSchema {
  type: string;
  required: string[];
  properties: Record<string, MetadataField>;
}

interface Metadata {
  id: string;
  documentTypeId: string;
  schema: MetadataSchema;
  version: string;
}

interface DocumentType {
  id: string;
  name: string;
  description: string;
  metadata: Metadata[];
}

const DynamicForm = () => {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const router = useRouter();
  const user = useCurrentUser();

  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
  };

  useEffect(() => {
    // Fetch document types from API
    setUploadedFile("");
    const fetchDocumentTypes = async () => {
      try {
        const res = await fetch("/api/documentstype");
        const data = await res.json();
        setDocumentTypes(data);
      } catch (error) {
        console.error("Error fetching document types:", error);
      }
    };

    fetchDocumentTypes();
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDocumentType || !uploadedFile) {
      alert("Please select a document type and upload a file.");
      return;
    }

    try {
      const response = await fetch("/api/uploadDocument", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id || "your-user-id", // Replace with actual user ID if not using the hook
          documentTypeId: selectedDocumentType,
          documentUrl: uploadedFile.url, // Use the URL returned from UploadThing
          fileKey: uploadedFile.key, // Store the file key for future reference
          metadata: formData,
        }),
      });

      if (response.ok) {
        alert("Document uploaded successfully!");
        router.push("/success"); // Redirect to success page
      } else {
        alert("Failed to upload document.");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
    }
  };

  return (
    <div className="p-6">
      <nav className="bg-white shadow-sm border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">User Dashboard</h1>
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/images/user_alt_icon.png" alt="User" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">User User</span>
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
      <h1 className="text-xl font-bold mb-4">Upload Your Document</h1>

      {/* Document Type Selection */}
      <select
        className="w-full p-2 border rounded mb-4"
        onChange={(e) => setSelectedDocumentType(e.target.value)}
      >
        <option value="">Select Document Type</option>
        {documentTypes.map((doc) => (
          <option key={doc.id} value={doc.id}>
            {doc.name}
          </option>
        ))}
      </select>

      {/* Render Form Fields Based on Selected Document */}
      {selectedDocumentType && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {documentTypes
            .find((doc) => doc.id === selectedDocumentType)
            ?.metadata[0]?.schema?.properties &&
            Object.entries(
              documentTypes.find((doc) => doc.id === selectedDocumentType)
                ?.metadata[0]?.schema?.properties || {}
            ).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <label className="font-semibold">{value.description}:</label>
                <Input
                  type={value.type === "number" ? "number" : "text"}
                  name={key}
                  required={documentTypes
                    .find((doc) => doc.id === selectedDocumentType)
                    ?.metadata[0]?.schema?.required.includes(key)}
                  onChange={handleInputChange}
                />
              </div>
            ))}

          {/* Replace File Upload with UploadThing */}
          <div className="flex flex-col">
            <label className="font-semibold mb-2">Upload Document:</label>
            {/* <UploadButton
              endpoint="documentUploader" // Make sure this endpoint is defined in your uploadthing config
              onClientUploadComplete={(res) => {
                // Save the uploaded file info
                if (res && res.length > 0) {
                  setUploadedFile(res[0]);
                  console.log("File uploaded:", res[0]);
                }
              }}
              onUploadError={(error: Error) => {
                console.error("Upload error:", error);
                alert(`Upload failed: ${error.message}`);
              }}
            /> */}
            {uploadedFile && (
              <div className="mt-2 p-2 bg-green-50 text-green-700 rounded">
                File uploaded: {uploadedFile.name}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={!uploadedFile}
            className={!uploadedFile ? "opacity-50 cursor-not-allowed" : ""}
          >
            Submit
          </Button>
        </form>
      )}
    </div>
  );
};

export default DynamicForm;