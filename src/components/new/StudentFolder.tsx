/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
// import { FolderManagement } from '@/components/folder-management';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRoundCheck, FileText, ArrowLeft } from 'lucide-react';
import { FolderManagement } from './FolderManagement';

interface StudentFoldersPageProps {
  params: {
    studentId: string
  }
}

export default function StudentFoldersPage({ params }: StudentFoldersPageProps) {
  const { studentId } = params;
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  
  // Hardcoded for the example - in real application this would come from auth context
  const organizationId = "0cb46f34-0d7d-48f8-8195-e664dbe6dd80";
  
  const fetchDocuments = async (folderId: string) => {
    setIsLoadingDocuments(true);
    try {
      const response = await fetch(`/api/documents?folderId=${folderId}&studentId=${studentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      // You can add toast notification here
    } finally {
      setIsLoadingDocuments(false);
    }
  };
  
  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId);
    fetchDocuments(folderId);
  };
  
  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" className="flex items-center gap-1 mb-2" asChild>
          <a href="/students">
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </a>
        </Button>
        
        <div className="flex items-center gap-4">
          <UserRoundCheck className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Files</h1>
            <p className="text-muted-foreground">
              Manage folders and documents for this student
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Folders</CardTitle>
              <CardDescription>
                Create and navigate through student folders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FolderManagement
                organizationId={organizationId}
                studentId={studentId}
                onFolderSelect={handleFolderSelect}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                {selectedFolderId 
                  ? "Documents in selected folder" 
                  : "Select a folder to view documents"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedFolderId ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a folder to view documents</p>
                </div>
              ) : isLoadingDocuments ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No documents in this folder</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Upload Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 cursor-pointer"
                    >
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}