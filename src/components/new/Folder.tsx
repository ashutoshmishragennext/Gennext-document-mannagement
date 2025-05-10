/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/folders/page.tsx
"use client";

import { Folder, FolderOpen, Plus, Search } from 'lucide-react';
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
}

const FolderManagement = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const organizationId = searchParams.get('organizationId');
  const organizationId = '61e8458a-8f55-40c8-8adc-a78b744063c5';
  const studentId = searchParams.get('studentId');

  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);

  // Fetch folders
  useEffect(() => {
    if (organizationId) {
      fetchFolders();
    } else {
      setError('Organization ID is required');
      setLoading(false);
    }
  }, [organizationId, studentId]);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params
      const params = new URLSearchParams();
      if (organizationId) params.append('organizationId', organizationId);
      if (studentId) params.append('studentId', studentId);
      console.log("student id",studentId);
      
      const response = await fetch(`/api/folders?StudentId=24958967-de67-478f-90a7-15458bc2b2aa`);
      
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
    
    if (!confirm('Are you sure you want to delete this folder?')) {
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
    if (folder.parentFolderId) {
      // Navigate to subfolder
      const url = new URLSearchParams();
      if (organizationId) url.append('organizationId', organizationId);
      if (studentId) url.append('studentId', studentId);
      url.append('parentFolderId', folder.id);
      router.push(`/folders?${url.toString()}`);
    } else {
      // Navigate to folder details
      // router.push(`/upload?studentId=${folder.student.id}`);
      router.push(`/upload?studentId=24958967-de67-478f-90a7-15458bc2b2aa`);
      
    }
  };

  const handleEditFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = new URLSearchParams();
    if (organizationId) url.append('organizationId', organizationId);
    router.push(`/folders/${folderId}/edit?${url.toString()}`);
  };

  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Folder Management</h1>
        <button 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          onClick={() => {
            const url = new URLSearchParams();
            if (organizationId) url.append('organizationId', organizationId);
            if (studentId) url.append('studentId', studentId);
            router.push(`/folders/create?${url.toString()}`);
          }}
        >
          <Plus size={18} />
          <span>New Folder</span>
        </button>
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
        <div className="space-y-3">
          {filteredFolders.map((folder) => (
            <div 
              key={folder.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer bg-white hover:bg-gray-50"
              onClick={() => navigateToFolder(folder)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <FolderOpen className="text-blue-500" size={24} />
                  </div>
                  <div>
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
                
                {/* <div className="flex gap-2">
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={(e) => handleEditFolder(folder.id, e)}
                    title="Edit folder"
                    aria-label="Edit folder"
                  >
                    <Edit size={16} className="text-gray-600" />
                  </button>
                  <button 
                    className="p-2 hover:bg-red-50 rounded-full transition-colors"
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
                </div> */}
              </div>
              
              {/* {folder.description && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-2 pl-10">{folder.description}</p>
              )} */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FolderManagement;