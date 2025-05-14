/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  ArrowLeft,
  ChevronRight,
  Edit,
  FilePlus,
  Folder,
  FolderOpen,
  FolderPlus,
  Search,
  Trash2
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Types
interface Folder {
  student: any;
  id: string;
  name: string;
  description: string | null;
  studentId: string | null;
  parentFolderId: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  uploadThingFolderId?: string | null;
  isSubfolder?: boolean;
  children?: Folder[];
}

const FolderManagement = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get('organizationId') || '61e8458a-8f55-40c8-8adc-a78b744063c5';
  const studentId = searchParams.get('studentId') ;
  const parentFolderId = searchParams.get('parentFolderId') || null;

  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<Folder[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
 console.log("hiiiiiiiiiiiiiiiiiiiiiiii");
 
  // Fetch folders
  useEffect(() => {
    if (organizationId) {
      fetchFolders();
      if (parentFolderId) {
        fetchCurrentFolder();
      }
    } else {
      setError('Organization ID is required');
      setLoading(false);
    }
  }, [organizationId, studentId, parentFolderId]);

  const fetchCurrentFolder = async () => {
    if (!parentFolderId) return;
    
    try {
      const response = await fetch(`/api/folders/${parentFolderId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch folder details');
      }
      
      const data = await response.json();
      setCurrentFolder(data);
      
      // Build folder path
      buildFolderPath(data);
    } catch (err) {
      console.error('Error fetching current folder:', err);
    }
  };

  const buildFolderPath = async (folder: Folder) => {
    const path: Folder[] = [folder];
    let currentParentId = folder.parentFolderId;
    
    while (currentParentId) {
      try {
        const response = await fetch(`/api/folders/${currentParentId}`);
        if (!response.ok) break;
        
        const parentFolder = await response.json();
        path.unshift(parentFolder);
        currentParentId = parentFolder.parentFolderId;
      } catch (err) {
        console.error('Error building folder path:', err);
        break;
      }
    }
    
    setFolderPath(path);
  };

  const fetchFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params
      const params = new URLSearchParams();
      if (organizationId) params.append('organizationId', organizationId);
      if (studentId) params.append('studentId', studentId);
      if (parentFolderId) params.append('parentFolderId', parentFolderId);
      else params.append('parentFolderId', 'null'); // Explicitly request root folders
      
      const url = `/api/folders?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch folders');
      }
      
      const data = await response.json();
      setFolders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFolder = async (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this folder? This will delete all contents inside.')) {
      return;
    }

    try {
      setDeleteInProgress(folderId);
      const response = await fetch(`/api/folders?id=${folderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete folder');
      }

      // Refresh the folder list
      fetchFolders();

    } catch (err) {
      console.error('Error deleting folder:', err);
      alert('Failed to delete folder');
    } finally {
      setDeleteInProgress(null);
    }
  };

  const navigateToFolder = (folder: Folder) => {
    const url = new URLSearchParams();
    if (organizationId) url.append('organizationId', organizationId);
    if (studentId) url.append('studentId', studentId);
    url.append('parentFolderId', folder.id);
    router.push(`/folders?${url.toString()}`);
  };

  const navigateUp = () => {
    if (folderPath.length <= 1 || !currentFolder?.parentFolderId) {
      // Navigate to root
      const url = new URLSearchParams();
      if (organizationId) url.append('organizationId', organizationId);
      if (studentId) url.append('studentId', studentId);
      router.push(`/folders?${url.toString()}`);
      return;
    }
    
    // Navigate to parent folder
    const parentFolder = folderPath[folderPath.length - 2];
    const url = new URLSearchParams();
    if (organizationId) url.append('organizationId', organizationId);
    if (studentId) url.append('studentId', studentId);
    if (parentFolder.id) url.append('parentFolderId', parentFolder.id);
    router.push(`/folders?${url.toString()}`);
  };

  const navigateToPath = (index: number) => {
    if (index < 0) {
      // Root level
      const url = new URLSearchParams();
      if (organizationId) url.append('organizationId', organizationId);
      if (studentId) url.append('studentId', studentId);
      router.push(`/folders?${url.toString()}`);
      return;
    }
    
    const targetFolder = folderPath[index];
    const url = new URLSearchParams();
    if (organizationId) url.append('organizationId', organizationId);
    if (studentId) url.append('studentId', studentId);
    url.append('parentFolderId', targetFolder.id);
    router.push(`/folders?${url.toString()}`);
  };

  const handleEditFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = new URLSearchParams();
    if (organizationId) url.append('organizationId', organizationId);
    router.push(`/folders/${folderId}/edit?${url.toString()}`);
  };

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
        parentFolderId: parentFolderId || null,
        studentId: studentId,
        organizationId: organizationId,
        createdBy: "current-user-id" // Replace with actual user ID from your auth context
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
      fetchFolders();
      
    } catch (err) {
      console.error('Error creating folder:', err);
      alert('Failed to create folder: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const viewFiles = (folder: Folder) => {
    router.push(`/upload?studentId=${studentId}&folderId=${folder.id}`);
  };

  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Header & Navigation */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">Folder Management</h1>
            {currentFolder && (
              <span className="text-gray-500">
                : {currentFolder.name}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors shadow-sm"
              onClick={() => navigateUp()}
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            <button 
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              onClick={() => setShowCreateModal(true)}
            >
              <FolderPlus size={18} />
              <span>New Folder</span>
            </button>
          </div>
        </div>
        
        {/* Breadcrumb navigation */}
        <div className="flex items-center text-sm">
          <button 
            className="text-blue-600 hover:text-blue-800 transition-colors"
            onClick={() => navigateToPath(-1)}
          >
            Root
          </button>
          {folderPath.map((folder, index) => (
            <div key={folder.id} className="flex items-center">
              <ChevronRight size={16} className="mx-1 text-gray-400" />
              <button 
                className={`hover:text-blue-800 transition-colors ${
                  index === folderPath.length - 1 ? 'text-gray-700 font-medium' : 'text-blue-600'
                }`}
                onClick={() => navigateToPath(index)}
              >
                {folder.name}
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text"
          placeholder="Search folders..."
          className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Folders Display */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      ) : filteredFolders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100">
          <FolderOpen className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No folders found</h3>
          <p className="mt-2 text-gray-500">
            {searchTerm ? 'Try adjusting your search term.' : 'Get started by creating a new folder.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFolders.map((folder) => (
            <div 
              key={folder.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all bg-white hover:bg-gray-50 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start flex-1">
                  <div className="mr-3 mt-1">
                    <FolderOpen className="text-blue-500" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 truncate" title={folder.name}>
                      {folder.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {new Date(folder.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button 
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={(e) => handleEditFolder(folder.id, e)}
                    title="Edit folder"
                    aria-label="Edit folder"
                  >
                    <Edit size={16} className="text-gray-600" />
                  </button>
                  <button 
                    className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                    onClick={(e) => handleDeleteFolder(folder.id, e)}
                    disabled={deleteInProgress === folder.id}
                    title="Delete folder"
                    aria-label="Delete folder"
                  >
                    {deleteInProgress === folder.id ? (
                      <div className="h-4 w-4 border-2 border-t-red-500 border-r-red-500 border-b-red-500 border-l-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 size={16} className="text-red-500" />
                    )}
                  </button>
                </div>
              </div>
              
              {folder.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 pl-8">{folder.description}</p>
              )}
              
              <div className="mt-auto flex gap-2 pt-3 border-t border-gray-100">
                <button 
                  className="flex items-center justify-center gap-1 text-sm py-1.5 flex-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                  onClick={() => navigateToFolder(folder)}
                >
                  <Folder size={14} />
                  <span>Open Folder</span>
                </button>
                <button 
                  className="flex items-center justify-center gap-1 text-sm py-1.5 flex-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                  onClick={() => viewFiles(folder)}
                >
                  <FilePlus size={14} />
                  <span>View Files</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Create New Folder</h3>
            <form onSubmit={createNewFolder}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Folder Name *
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter folder name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter folder description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderManagement;