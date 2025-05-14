/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronDown,
  ChevronRight,
  FilePlus,
  Folder,
  FolderOpen,
  Loader2,
  MoreVertical,
  Plus,
  Trash2
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

interface Folder {
  id: string;
  name: string;
  description: string | null;
  parentFolderId: string | null;
  studentId: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  children?: Folder[];
  _count?: {
    children: number;
  };
}

const FolderManagement = ( {user}:any) => {
    // console.log("userId",usersId);
    
  const router = useRouter();
  const searchParams = useSearchParams();
//   const organizationId = searchParams.get('organizationId') || '61e8458a-8f55-40c8-8adc-a78b744063c5';
  const urlParentFolderId = searchParams.get('parentFolderId');
  // const studentId = searchParams.get('studentId') || 'd32bc0de-540b-40d5-afb3-da864f3f4c33';

  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [displayedFolderId, setDisplayedFolderId] = useState<string | null>(urlParentFolderId);
  const [loading, setLoading] = useState(true);
  const [childrenLoading, setChildrenLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<Folder[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [targetParentId, setTargetParentId] = useState<string | null>(null);
  const [studentId ,setStudentId]= useState<any>();
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [organizationId,setOrganizationId]= useState<any>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [childFolders, setChildFolders] = useState<Record<string, Folder[]>>({});
//   const user = useCurrentUser();

  useEffect(()=>{
 
    
    async function  fetchStudent() {
        setLoading(true);
        const response1 = await fetch(`/api/students?id=${user}`)
      
        
        const student =await response1.json();

        setOrganizationId(student.students[0].organizationId)
        setStudentId(student.students[0].id);
        setLoading(false)
       
     }
    fetchStudent();
  },[])
  
  console.log("organization",organizationId);
  

  // Fetch folders and build path
  const fetchData = useCallback(async () => {
    if (!organizationId) {
      setError('Organization ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch folders
      const params = new URLSearchParams();
      params.append('organizationId', organizationId);
      if (studentId) params.append('studentId', studentId);
      params.append('parentFolderId', displayedFolderId || 'null');
      setLoading(true)
      const foldersResponse = await fetch(`/api/folders?${params.toString()}`);
      if (!foldersResponse.ok) throw new Error('Failed to fetch folders');
      const foldersData = await foldersResponse.json();
      setFolders(Array.isArray(foldersData) ? foldersData : []);
      setLoading(false)
      // Fetch current folder if displayedFolderId exists
      if (displayedFolderId) {
        setLoading(true)
        const folderResponse = await fetch(`/api/folders/${displayedFolderId}`);
        if (!folderResponse.ok) throw new Error('Failed to fetch folder details');
        const folderData = await folderResponse.json();
        setCurrentFolder(folderData);
        await buildFolderPath(folderData);
        setLoading(false)
      } else {
        setCurrentFolder(null);
        setFolderPath([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [organizationId, displayedFolderId, studentId]);

  // Build folder path hierarchy
  const buildFolderPath = async (folder: Folder) => {
    const path: Folder[] = [folder];
    let currentParentId = folder.parentFolderId;
    
    while (currentParentId) {
      try {
      
        setLoading(true)
        const response = await fetch(`/api/folders/${currentParentId}`);
        if (!response.ok) break;
        
        const parentFolder = await response.json();
        path.unshift(parentFolder);
        currentParentId = parentFolder.parentFolderId;
        setLoading(false)
      } catch (err) {
        console.error('Error building folder path:', err);
        break;
      }
    }
    
    setFolderPath(path);
  };

  useEffect(() => {
    
    fetchData();
  }, [fetchData]);

  // Effect to sync URL params with displayed folder state
  useEffect(() => {
    setDisplayedFolderId(urlParentFolderId);
  }, [urlParentFolderId]);

  // Fetch child folders when expanding a folder
  const fetchChildFolders = async (folderId: string) => {
    if (childFolders[folderId]?.length > 0) {
      return; // Already loaded
    }

    try {
      setChildrenLoading(prev => ({ ...prev, [folderId]: true }));
      
      const params = new URLSearchParams();
      params.append('organizationId', organizationId);
      if (studentId) params.append('studentId', studentId);
      params.append('parentFolderId', folderId);
        setLoading(true)
      const response = await fetch(`/api/folders?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch subfolders');
      
      const data = await response.json();
      setChildFolders(prev => ({
        ...prev,
        [folderId]: Array.isArray(data) ? data : []
      }));
      setLoading(false)
    } catch (err) {
      console.error('Error fetching child folders:', err);
    } finally {
      setChildrenLoading(prev => ({ ...prev, [folderId]: false }));
    }
  };

  // Create new folder
  const createNewFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFolderName.trim()) {
      alert("Folder name is required");
      return;
    }
    
    try {
      const newFolder = {
        name: newFolderName.trim(),
        description: newFolderDescription.trim() || null,
        parentFolderId: targetParentId || displayedFolderId || null,
        studentId: studentId || null,
        organizationId: organizationId,
        createdBy: user, 
      };
      
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFolder),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create folder');
      }
      
      // Clear form and close modal
      setNewFolderName('');
      setNewFolderDescription('');
      setShowCreateModal(false);
      
      // Refresh folders
      if (targetParentId) {
        // If creating a subfolder, refresh child folders
        await fetchChildFolders(targetParentId);
        if (!expandedFolders[targetParentId]) {
          setExpandedFolders(prev => ({ ...prev, [targetParentId]: true }));
        }
      } else {
        // If creating a folder at current level, refresh all folders
        fetchData();
      }
      
      // Reset target parent
      setTargetParentId(null);
    } catch (err) {
      console.error('Error creating folder:', err);
      alert('Failed to create folder: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Delete folder
  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/folders?id=${folderToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete folder');
      }

      // Find the parent of deleted folder
      const parentId = findFolderParent(folderToDelete);
      
      // Refresh the folder list
      if (parentId && parentId !== displayedFolderId) {
        // Refresh child folders of parent
        await fetchChildFolders(parentId);
      } else {
        // Refresh main folder list
        fetchData();
      }
      
      setDeleteDialogOpen(false);
      setFolderToDelete(null);
    } catch (err) {
      console.error('Error deleting folder:', err);
      alert('Failed to delete folder');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to find the parent of a folder
  const findFolderParent = (folderId: string): string | null => {
    // Check in main folders
    const mainFolder = folders.find(f => f.id === folderId);
    if (mainFolder) return displayedFolderId;
    
    // Check in child folders
    for (const parentId in childFolders) {
      if (childFolders[parentId].some(f => f.id === folderId)) {
        return parentId;
      }
    }
    
    return null;
  };

  // Navigation functions
  const navigateToFolder = (folderId: string, updateURL = true) => {
    if (updateURL) {
      // Update URL for external navigation (breadcrumbs, etc.)
      const params = new URLSearchParams();
      if (organizationId) params.append('organizationId', organizationId);
      if (studentId) params.append('studentId', studentId);
      params.append('parentFolderId', folderId);
      router.push(`/folders?${params.toString()}`);
    } else {
      // In-place navigation (just update the state)
      setDisplayedFolderId(folderId);
      
      // Fetch folder data and update the UI
      (async () => {
        try {
          setLoading(true);
          
          // Fetch folder details
          const folderResponse = await fetch(`/api/folders/${folderId}`);
          if (!folderResponse.ok) throw new Error('Failed to fetch folder details');
          const folderData = await folderResponse.json();
          setCurrentFolder(folderData);
          
          // Fetch child folders
          const params = new URLSearchParams();
          params.append('organizationId', organizationId);
          if (studentId) params.append('studentId', studentId);
          params.append('parentFolderId', folderId || 'null');
          
          const foldersResponse = await fetch(`/api/folders?${params.toString()}`);
          if (!foldersResponse.ok) throw new Error('Failed to fetch folders');
          const foldersData = await foldersResponse.json();
          setFolders(Array.isArray(foldersData) ? foldersData : []);
          
          // Build folder path
          await buildFolderPath(folderData);
        } catch (err) {
          console.error('Error navigating to folder:', err);
          setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
          setLoading(false);
        }
      })();
    }
  };

  const navigateUp = (updateURL = true) => {
    if (!currentFolder?.parentFolderId) {
      if (updateURL) {
        // Navigate to root
        const params = new URLSearchParams();
        if (organizationId) params.append('organizationId', organizationId);
        if (studentId) params.append('studentId', studentId);
        router.push(`/folders?${params.toString()}`);
      } else {
        setDisplayedFolderId(null);
        setCurrentFolder(null);
        setFolderPath([]);
        fetchData();
      }
      return;
    }
    
    // Navigate to parent folder
    const parentFolder = folderPath[folderPath.length - 2];
    if (updateURL) {
      const params = new URLSearchParams();
      if (organizationId) params.append('organizationId', organizationId);
      if (studentId) params.append('studentId', studentId);
      params.append('parentFolderId', parentFolder.id);
      router.push(`/folders?${params.toString()}`);
    } else {
      navigateToFolder(parentFolder.id, false);
    }
  };

  const navigateToPath = (index: number, updateURL = true) => {
    if (index < 0) {
      if (updateURL) {
        const params = new URLSearchParams();
        if (organizationId) params.append('organizationId', organizationId);
        if (studentId) params.append('studentId', studentId);
        router.push(`/folders?${params.toString()}`);
      } else {
        setDisplayedFolderId(null);
        setCurrentFolder(null);
        setFolderPath([]);
        fetchData();
      }
      return;
    }
    
    if (index >= 0 && index < folderPath.length) {
      if (updateURL) {
        const params = new URLSearchParams();
        if (organizationId) params.append('organizationId', organizationId);
        if (studentId) params.append('studentId', studentId);
        params.append('parentFolderId', folderPath[index].id);
        router.push(`/folders?${params.toString()}`);
      } else {
        navigateToFolder(folderPath[index].id, false);
      }
    }
  };

  const viewFiles = (folderId: string) => {
    router.push(`/upload?studentId=${studentId}&folderId=${folderId}`);
  };

  const toggleFolderExpansion = async (folderId: string) => {
    const isExpanded = expandedFolders[folderId];
    
    // If we're expanding and don't have children loaded yet, fetch them
    if (!isExpanded && (!childFolders[folderId] || childFolders[folderId].length === 0)) {
      await fetchChildFolders(folderId);
    }
    
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle add subfolder
  const handleAddSubfolder = (folderId: string) => {
    setTargetParentId(folderId);
    setNewFolderName('');
    setNewFolderDescription('');
    setShowCreateModal(true);
  };

  // Render folder tree recursively
  const renderFolderTree = (folder: Folder, depth = 0) => {
    const hasChildren = folder._count?.children && folder._count.children > 0;
    const isExpanded = expandedFolders[folder.id];
    const childrenItems = childFolders[folder.id] || [];

    return (
      <div key={folder.id} className="ml-4">
        <div 
          className={`flex items-center py-2 px-3 rounded-md hover:bg-gray-100 ${depth === 0 ? 'font-medium' : ''}`}
        >
          {hasChildren ? (
            <button 
              className="mr-2 text-muted-foreground"
              onClick={() => toggleFolderExpansion(folder.id)}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="w-6 mr-2"></div>
          )}
          <FolderOpen 
            className="h-5 w-5 text-primary mr-2 cursor-pointer"
            onClick={() => navigateToFolder(folder.id, false)} // In-place navigation (no URL update)
          />
          <span 
            className="flex-1 truncate cursor-pointer"
            onClick={() => navigateToFolder(folder.id, false)} // In-place navigation (no URL update)
          >
            {folder.name}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => viewFiles(folder.id)}>
                <FilePlus className="mr-2 h-4 w-4" />
                View Files
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigateToFolder(folder.id, false)}> {/* In-place navigation */}
                <FolderOpen className="mr-2 h-4 w-4" />
                Open Folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddSubfolder(folder.id)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Subfolder
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => {
                  setFolderToDelete(folder.id);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {isExpanded && (
          <div className="border-l-2 border-gray-200 ml-3 pl-2">
            {childrenLoading[folder.id] ? (
              <div className="flex items-center py-2 px-3">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : childrenItems.length > 0 ? (
              childrenItems.map(child => renderFolderTree(child, depth + 1))
            ) : (
              <div className="flex items-center py-2 px-3 text-sm text-muted-foreground">
                No subfolders
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {currentFolder ? currentFolder.name : 'My Folders'}
            
          </h1>
          <Button onClick={() => {
            setTargetParentId(null);
            setNewFolderName('');
            setNewFolderDescription('');
            setShowCreateModal(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  navigateToPath(-1, false); // In-place navigation
                }}
                className="hover:text-primary"
              >
                Root
              </BreadcrumbLink>
            </BreadcrumbItem>
            {folderPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToPath(index, false); // In-place navigation
                    }}
                    className={index === folderPath.length - 1 ? "font-medium text-primary" : "hover:text-primary"}
                  >
                    {folder.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Content */}
      <div className="border rounded-lg p-4 bg-white">
        {loading && !folders.length ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-2">
                <Skeleton className="h-5 w-5 rounded-sm" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            {error}
          </div>
        ) : folders.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No folders found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating a new folder.
            </p>
            <Button className="mt-4" onClick={() => {
              setTargetParentId(null);
              setShowCreateModal(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {currentFolder && (
              <div 
                className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => navigateUp(false)} // In-place navigation (no URL update)
              >
                <Folder className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-muted-foreground">.. (Parent Directory)</span>
              </div>
            )}
            
            {folders.filter(f => f.parentFolderId === (currentFolder?.id || null)).map(folder => 
              renderFolderTree(folder)
            )}
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              {targetParentId ? (
                // Find the target folder's name
                `Inside "${
                  displayedFolderId === targetParentId
                    ? currentFolder?.name
                    : folders.find(f => f.id === targetParentId)?.name ||
                      Object.values(childFolders)
                        .flat()
                        .find(f => f.id === targetParentId)?.name ||
                      'Selected Folder'
                }"`
              ) : currentFolder ? (
                `Inside "${currentFolder.name}"`
              ) : (
                'In your root directory'
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createNewFolder} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Folder Name *</Label>
              <Input
                id="name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                placeholder="Enter folder description"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => {
                  setShowCreateModal(false);
                  setTargetParentId(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Create Folder</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the folder and all its contents. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteFolder}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FolderManagement;