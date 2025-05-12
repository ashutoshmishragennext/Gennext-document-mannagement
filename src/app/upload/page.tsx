/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  ArrowLeft,
  FileText,

  LogOut,
  Settings,
  UploadCloud,
  X
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCurrentUser } from "@/hooks/auth";
import { toast } from "@/hooks/use-toast";
import { useUploadThing } from "@/utils/uploadthing";
import Link from "next/link";

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

interface studentDocTypes {
  id: string;
}

interface BulkUploadFile {
  id: string;
  file: File;
  name: string;
  size: string;
  type: string;
  url: string | null;
  uploadedUrl?: string;
  uploaded: boolean;
  tagged: boolean;
  documentId?: string; // Added to track created document ID
}

interface Document {
  id: string;
  filename: string;
  uploadedAt: string;
  mimeType: string;
  documentType: {
    id: string;
    name: string;
  };
  documentTypeId: string;
  updatedAt: string;
  uploadThingUrl: string;
  metadata?: Record<string, any>;
}

const DocumentManagementDashboard = () => {
  // State management
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [selectedIndividual, setSelectedIndividual] = useState<string>("");
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userDocuments, setUserDocuments] = useState<Document[]>([]);
  const [studentDocTypes, setStudentDocTypes] = useState<studentDocTypes[]>([]);
  const [folder, setFolder] = useState<any>([]);
  const [folderId,setFolderId]= useState<any>([]);
 
  // Bulk upload states
  const [bulkFiles, setBulkFiles] = useState<BulkUploadFile[]>([]);
  const [currentTaggingFile, setCurrentTaggingFile] = useState<BulkUploadFile | null>(null);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [uploading, setUploading] = useState(false);

  const searchParams = useSearchParams();
  const user = useCurrentUser();
  const organizationId = "61e8458a-8f55-40c8-8adc-a78b744063c5"; // Example organization ID

  const { startUpload } = useUploadThing("docUploader");

  // Get student ID from query parameter
  useEffect(() => {
    const studentId = searchParams.get("studentId");
    const folderId = searchParams.get("folderId");
    if(folderId){
      setFolderId(folderId);
    }
    if (studentId) {
      setSelectedIndividual(studentId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedIndividual) {
      fetchUserDocuments(selectedIndividual);
    }
  }, [selectedIndividual]);

  // Fetch data on component mount
  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  const studentsDoctype = async () => {
    try {
      if (!selectedIndividual) {
        setStudentDocTypes([]);
      } else {
        const res = await fetch(
          `/api/studentdoctypes?studentId=${selectedIndividual}`
        );
        if (!res.ok) throw new Error("Failed to fetch document types");
        const data = await res.json();
        setStudentDocTypes(data.documentType);
      }
    } catch (error) {
      console.error("Error fetching document types:", error);
      toast({
        title: "Error",
        description: "Failed to load document types",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const studentsFolder = async () => {
      try {
        const res = await fetch(`/api/folders?StudentId=${selectedIndividual}`);
        if (!res.ok) throw new Error("Failed to fetch document types");
        const data = await res.json();
        setFolder(data[0].id);
      } catch (error) {
        console.error("Error fetching document types:", error);
        toast({
          title: "Error",
          description: "Failed to load document types",
          variant: "destructive",
        });
      }
    };
    if (selectedIndividual) {
      studentsFolder();
    }
  }, [selectedIndividual]);

  const fetchDocumentTypes = async () => {
    try {
      const res = await fetch("/api/documentstype");
      if (!res.ok) throw new Error("Failed to fetch document types");
      const data = await res.json();
      setDocumentTypes(data);
    } catch (error) {
      console.error("Error fetching document types:", error);
      toast({
        title: "Error",
        description: "Failed to load document types",
        variant: "destructive",
      });
    }
  };

  const fetchUserDocuments = async (individualId: string) => {
    try {
      const res = await fetch(
        `/api/documents?organizationId=${organizationId}&studentId=${individualId}&folderId=${folderId}`
      );
      if (!res.ok) throw new Error("Failed to fetch user documents");
      const data = await res.json();
      setUserDocuments(data || []);
      studentsDoctype();
    } catch (error) {
      console.error("Error fetching user documents:", error);
      toast({
        title: "Error",
        description: "Failed to load user documents",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBulkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedIndividual) {
      toast({
        title: "Error",
        description: "Please select a student first",
        variant: "destructive",
      });
      return;
    }

    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      const filesArray = Array.from(e.target.files);
      
      try {
        // Create the initial bulk files array
        const newBulkFiles = filesArray.map((file) => ({
          id: file.name + Date.now(),
          file,
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
          url: URL.createObjectURL(file),
          uploaded: false,
          tagged: false,
        }));

        // Add to state immediately to show loading
        setBulkFiles((prevFiles) => [...prevFiles, ...newBulkFiles]);

        // Process files one by one
        for (const file of newBulkFiles) {
          // Upload the file first
          const uploadedUrl = await uploadFileAndGetUrl(file.file);
          
          if (uploadedUrl) {
            // Create document record without document type ID
            const documentData = {
              studentId: selectedIndividual,
              documentTypeId: null, // Initially null, will be updated later
              fileSize: file.size,
              mimeType: file.type,
              uploadThingUrl: uploadedUrl,
              filename: file.name,
              metadata: {},
              folderId: folder,
              organizationId: organizationId,
              uploadedBy: user?.id || "unknown",
              verificationStatus: false, // Set to false until tagged
            };

            // Create document in database
            const documentRes = await fetch("/api/documents", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(documentData),
            });

            if (!documentRes.ok) {
              throw new Error(`Failed to create document record for ${file.name}`);
            }

            const createdDocument = await documentRes.json();
            
            // Update the file in bulk files with document ID and upload status
            setBulkFiles((prevFiles) =>
              prevFiles.map((f) =>
                f.id === file.id ? { 
                  ...f, 
                  uploaded: true, 
                  uploadedUrl: uploadedUrl,
                  documentId: createdDocument.id
                } : f
              )
            );

            toast({
              title: "Success",
              description: `${file.name} uploaded successfully`,
            });
          }
        }

        // Refresh documents after uploads
        await fetchUserDocuments(selectedIndividual);
      } catch (error) {
        console.error("Error uploading files:", error);
        toast({
          title: "Error",
          description: "Failed to upload some files",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return size + " bytes";
    else if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    else return (size / (1024 * 1024)).toFixed(1) + " MB";
  };

  const resetForm = () => {
    setFormData({});
    setSelectedDocumentType("");
  };

  const handleTagDocument = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDocumentType || !selectedIndividual) {
      toast({
        title: "Error",
        description: "Please select a document type",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get the metadata schema ID
      const selectedType = documentTypes.find(
        (doc) => doc.id === selectedDocumentType
      );
      const metadataSchemaId = selectedType?.metadata?.[0]?.id;

      if (!metadataSchemaId) {
        throw new Error("Invalid document type selected");
      }

      if (editingDocument) {
        // Update existing document
        const documentData = {
          id: editingDocument.id,
          studentId: selectedIndividual,
          documentTypeId: selectedDocumentType,
          metadata: formData,
          metadataSchemaId: metadataSchemaId,
          organizationId: organizationId,
          verificationStatus: true,
        };

        const documentRes = await fetch(`/api/documents?id=${editingDocument.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(documentData),
        });

        if (!documentRes.ok) {
          throw new Error("Failed to update document");
        }

        toast({
          title: "Success",
          description: "Document updated successfully",
        });
      } else if (currentTaggingFile) {
        // If we're tagging a file that was already uploaded and has a document ID
        if (currentTaggingFile.documentId) {
          // Update the existing document with the type ID
          const documentData = {
            id: currentTaggingFile.documentId,
            studentId: selectedIndividual,
            documentTypeId: selectedDocumentType,
            metadata: formData,
            metadataSchemaId: metadataSchemaId,
            organizationId: organizationId,
            verificationStatus: true,
          };

          const documentRes = await fetch(`/api/documents?id=${currentTaggingFile.documentId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(documentData),
          });

          if (!documentRes.ok) {
            throw new Error("Failed to update document");
          }

          // Extract keywords for the document
          const keywordsData = {
            documentId: currentTaggingFile.documentId,
            studentId: selectedIndividual,
            extractedText: "Sample extracted text from document",
            keywords: Object.values(formData)
              .filter((v) => typeof v === "string")
              .map((v) => v.toString()),
          };

          const keywordsRes = await fetch("/api/document-keywords", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(keywordsData),
          });

          if (!keywordsRes.ok) {
            console.warn("Failed to create keywords, but document was updated");
          }

          toast({
            title: "Success",
            description: "Document tagged successfully",
          });
        } else {
          // This would be a fallback for files that don't have a document ID yet
          // Create new document record
          const fileUrl = currentTaggingFile?.uploadedUrl || currentTaggingFile?.url || "";
          const properUrl = fileUrl.startsWith("blob:")
            ? await uploadFileAndGetUrl(currentTaggingFile?.file) 
            : fileUrl;

          const documentData = {
            studentId: selectedIndividual,
            documentTypeId: selectedDocumentType,
            fileSize: currentTaggingFile?.size,
            mimeType: currentTaggingFile?.type,
            uploadThingUrl: properUrl,
            filename: currentTaggingFile?.name,
            metadata: formData,
            metadataSchemaId: metadataSchemaId,
            folderId: folder,
            organizationId: organizationId,
            uploadedBy: user?.id || "unknown",
            verificationStatus: true,
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

          // Extract keywords
          const keywordsData = {
            documentId: createdDocument.id,
            studentId: selectedIndividual,
            extractedText: "Sample extracted text from document",
            keywords: Object.values(formData)
              .filter((v) => typeof v === "string")
              .map((v) => v.toString()),
          };

          await fetch("/api/document-keywords", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(keywordsData),
          });

          toast({
            title: "Success",
            description: "Document tagged successfully",
          });
        }

        // Update the bulk files state to mark this file as tagged
        setBulkFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === currentTaggingFile.id ? { ...f, tagged: true } : f
          )
        );
      }

      // Refresh the user documents
      fetchUserDocuments(selectedIndividual);

      resetForm();
      setTagDialogOpen(false);
      setEditingDocument(null);
      setCurrentTaggingFile(null);
    } catch (error) {
      console.error("Error tagging document:", error);
      toast({
        title: "Error",
        description: "Failed to tag document",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFileAndGetUrl = async (file: File | undefined) => {
    try {
      if (!file) return "";

      const result = await startUpload([file]);

      if (result && result.length > 0) {
        return result[0].ufsUrl;
      } else {
        throw new Error("Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      return "";
    }
  };

  // Remove a file from bulk upload
  const removeFile = (id: string) => {
    setBulkFiles((prevFiles) => prevFiles.filter((f) => f.id !== id));
  };

  // Open tag dialog for a specific file
  const openTaggingDialog = (file: BulkUploadFile) => {
    setCurrentTaggingFile(file);
    setEditingDocument(null);
    resetForm(); // Reset form before tagging a new file
    setTagDialogOpen(true);
  };

  // Open edit dialog for existing document
  const openEditDialog = (document: Document) => {
    setEditingDocument(document);
    setCurrentTaggingFile(null);
    // Set the form data from the document metadata
    setFormData(document.metadata || {});
    // Set the document type
    setSelectedDocumentType(document.documentTypeId || "");
    setTagDialogOpen(true);
  };

  // Open document preview
  const openDocumentPreview = (url: string) => {
    setDocumentPreviewUrl(url);
    setPreviewDialogOpen(true);
  };

  // Get the selected document type's metadata schema
  const selectedTypeMetadata = selectedDocumentType
    ? documentTypes.find((doc) => doc.id === selectedDocumentType)
        ?.metadata?.[0]?.schema
    : null;

  const filteredDocuments = documentTypes.filter(
    (doc) => !studentDocTypes.some((studentDoc) => studentDoc.id === doc.id)
  );

  return (
    <div className="p-6">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            Document Management
          </h1>

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
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

      {/* Bulk upload button */}
      <div className="flex justify-between items-center mb-6 mt-4">
        <Link href={"/dashboard"}>
          <button 
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors shadow-sm"
              
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            </Link>
        <Button
          variant="default"
          className="flex items-center gap-2"
          onClick={() => document.getElementById("bulk-file-upload")?.click()}
          disabled={!selectedIndividual || uploading}
        >
          <UploadCloud className="h-4 w-4" />
          {uploading ? "Uploading..." : "Bulk Upload"}
          <input
            id="bulk-file-upload"
            type="file"
            multiple
            className="sr-only"
            onChange={handleBulkFileChange}
            accept="image/*, .pdf, .doc, .docx, .ppt, .pptx"
            disabled={!selectedIndividual || uploading}
          />
        </Button>
      </div>

      {/* Selected Files Preview (when bulk uploading) */}
      {/* {bulkFiles.length > 0 && (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Selected Files ({bulkFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bulkFiles.map((file) => (
                <Card key={file.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {file.type.startsWith("image") ? (
                          <img
                            src={file.url || ""}
                            alt={file.name}
                            className="h-12 w-12 object-cover rounded"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-500" />
                          </div>
                        )}
                        <div className="ml-3">
                          <p className="font-medium text-sm truncate max-w-[150px]">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">{file.size}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeFile(file.id)}
                        disabled={uploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${file.uploaded ? "bg-green-500" : "bg-gray-300"}`}></div>
                      <span className="text-xs text-gray-500">
                        {file.uploaded ? "Uploaded" : "Pending"}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => openTaggingDialog(file)}
                      disabled={!file.uploaded || uploading}
                    >
                      {file.tagged ? "Edit Tags" : "Add Tags"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )} */}

      {/* Document Cards */}
      {!selectedIndividual ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
          <FileText className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-4 text-lg text-gray-500">
            Select an individual to view their documents
          </p>
        </div>
      ) : userDocuments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
          <FileText className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-4 text-lg text-gray-500">
            No documents found for this individual
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {userDocuments.map((doc) => (
            <Card
              key={doc.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <img src={doc.uploadThingUrl} alt="image" className="h-48" />       
                  </div>
                </div>
                <h3 className="font-medium text-lg mb-1 truncate">
                  {doc.filename}
                </h3>
                <div className="flex items-center mb-3">
                  <div className={`h-2 w-2 rounded-full ${doc.documentTypeId ? "bg-green-500" : "bg-yellow-500"} mr-2`}></div>
                  <span className="text-xs text-gray-500">
                    {doc.documentTypeId ? "Tagged" : "Untagged"}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(doc)}
                  >
                    {doc.documentTypeId ? "Edit" : "Add Tags"}
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => openDocumentPreview(doc.uploadThingUrl)}
                  >
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Document Tagging Dialog */}
      <Dialog
        open={tagDialogOpen}
        onOpenChange={(open) => {
          if (!isLoading) setTagDialogOpen(open);
          if (!open) {
            setCurrentTaggingFile(null);
            setEditingDocument(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingDocument
                ? `Edit Document: ${editingDocument.filename}`
                : `Tag Document: ${currentTaggingFile?.name}`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTagDocument}>
            <div className="grid gap-4 py-4">
              {/* Preview */}
              {currentTaggingFile?.type.startsWith("image") &&
                currentTaggingFile?.url && (
                  <div className="border rounded p-2 flex justify-center">
                    <img
                      src={currentTaggingFile.url}
                      alt={currentTaggingFile.name}
                      className="max-h-40 object-contain"
                    />
                  </div>
                )}

              {/* Document Type Selection */}
              <div className="grid gap-4">
                <Label className="font-medium">Document Type</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocumentType(doc.id)}
                      className={`border rounded-md p-3 cursor-pointer ${
                        selectedDocumentType === doc.id
                          ? "border-blue-500 bg-blue-50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={doc.id}
                          name="site_name"
                          value={doc.name}
                          checked={selectedDocumentType === doc.id}
                          className="form-radio"
                        />
                        <label htmlFor={doc.id} className="cursor-pointer">
                          {doc.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isLoading || !selectedDocumentType}
              >
                {isLoading ? "Processing..." : "Save Document Tags"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-screen overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-96 overflow-auto">
            {documentPreviewUrl &&
              (documentPreviewUrl.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={documentPreviewUrl}
                  className="w-full h-full min-h-96" 
                  title="Document Preview"
                />
              ) : documentPreviewUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                <img
                  src={documentPreviewUrl}
                  alt="Document Preview"
                  className="max-w-full h-auto max-h-full mx-auto"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-center p-8">
                  <div>
                    <img src={documentPreviewUrl} alt="Document Preview" />
                    <a
                      href={documentPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline mt-2 inline-block"
                    >
                      Download Document
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentManagementDashboard;