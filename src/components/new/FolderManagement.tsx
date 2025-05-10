'use client';

import { useEffect, useState } from 'react';
import { Folder, ChevronRight, Plus, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { CreateFolderDialog } from './CereateFolderDialog';
// import { CreateFolderDialog } from './create-folder-dialog';

interface FolderType {
  id: string;
  name: string;
  description: string | null;
  parentFolderId: string | null;
  studentId: string | null;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface FolderManagementProps {
  organizationId: string;
  studentId?: string;
  initialParentFolderId?: string | null;
  onFolderSelect?: (folderId: string) => void;
}

export function FolderManagement({
  organizationId,
  studentId,
  initialParentFolderId = null,
  onFolderSelect
}: FolderManagementProps) {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(initialParentFolderId);
  const [parentFolderStack, setParentFolderStack] = useState<{id: string | null, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>('Root');

  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      let url = `/api/folders?organizationId=${organizationId}`;
      
      if (studentId) {
        url += `&studentId=${studentId}`;
      }
      
      if (currentFolderId) {
        url += `&parentFolderId=${currentFolderId}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }
      
      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load folders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, [organizationId, studentId, currentFolderId]);

  const handleFolderClick = (folder: FolderType) => {
    // Save current folder to the stack for breadcrumb navigation
    setParentFolderStack([...parentFolderStack, { 
      id: currentFolderId, 
      name: currentPath 
    }]);
    
    // Update current folder
    setCurrentFolderId(folder.id);
    setCurrentPath(folder.name);
    
    // Call the onFolderSelect callback if provided
    if (onFolderSelect) {
      onFolderSelect(folder.id);
    }
  };

  const handleBackClick = () => {
    if (parentFolderStack.length > 0) {
      const lastFolder = parentFolderStack.pop();
      if (lastFolder) {
        setCurrentFolderId(lastFolder.id);
        setCurrentPath(lastFolder.name);
        setParentFolderStack([...parentFolderStack]);
        
        // Call the onFolderSelect callback if provided
        if (onFolderSelect && lastFolder.id) {
          onFolderSelect(lastFolder.id);
        }
      }
    }
  };

  const handleCreateSuccess = () => {
    fetchFolders();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {parentFolderStack.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBackClick}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <div className="text-sm font-medium">
            {currentPath}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          New Folder
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : folders.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Folder className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No folders found</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="mt-4 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Create your first folder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <Card
              key={folder.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleFolderClick(folder)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">{folder.name}</CardTitle>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              {folder.description && (
                <CardContent className="pb-2">
                  <CardDescription className="line-clamp-2">{folder.description}</CardDescription>
                </CardContent>
              )}
              <CardFooter className="pt-2 text-xs text-muted-foreground">
                Created: {new Date(folder.createdAt).toLocaleDateString()}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <CreateFolderDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        organizationId={organizationId}
        studentId={studentId}
        // parentFolderId={currentFolderId}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}