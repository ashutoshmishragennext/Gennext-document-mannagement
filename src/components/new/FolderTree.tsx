// src/components/FolderTree.tsx
'use client';

import { useState, useEffect } from 'react';
import { Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface FolderTreeProps {
  organizationId: string;
  studentId: string | null;
  onFolderSelect: (folderId: string) => void;
}

interface FolderItem {
  id: string;
  name: string;
  parentFolderId: string | null;
  studentId: string;
  organizationId: string;
}

export function FolderTree({ organizationId, studentId, onFolderSelect }: FolderTreeProps) {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRootFolders = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          organizationId:"0cb46f34-0d7d-48f8-8195-e664dbe6dd80",
        });
        
        if (studentId) {
          params.append('studentId', '492144c0-8119-4ea1-b238-237b3ffb5abd');
        }
        
        const response = await fetch(`/api/folders?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch folders');
        }
        
        const data = await response.json();
        setFolders(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching folders:', err);
        setError('Failed to load folders');
        setLoading(false);
      }
    };

    fetchRootFolders();
  }, [organizationId, studentId]);

  const toggleFolder = async (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));

    // Fetch subfolders if expanding for the first time
    if (!expandedFolders[folderId]) {
      try {
        const params = new URLSearchParams({
          organizationId: organizationId,
          parentFolderId: folderId,
        });
        
        if (studentId) {
          params.append('studentId', '492144c0-8119-4ea1-b238-237b3ffb5abd');
        }
        
        const response = await fetch(`/api/folders?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch subfolders');
        }
        
        const data = await response.json();
        
        // Merge fetched subfolders with existing folders
        setFolders(prev => {
          const existingFolderIds = new Set(prev.map(f => f.id));
          const newFolders = data.filter((f: FolderItem) => !existingFolderIds.has(f.id));
          return [...prev, ...newFolders];
        });
      } catch (err) {
        console.error('Error fetching subfolders:', err);
        setError('Failed to load subfolders');
      }
    }
  };

  const handleFolderClick = (folderId: string) => {
    setSelectedFolder(folderId);
    onFolderSelect(folderId);
  };

  const renderFolderTree = (parentId: string | null = null) => {
    const folderItems = folders.filter(folder => folder.parentFolderId === parentId);
    
    if (folderItems.length === 0) {
      return null;
    }
    
    return (
      <ul className={`${parentId ? 'ml-4' : ''} space-y-1`}>
        {folderItems.map(folder => (
          <li key={folder.id}>
            <div 
              className={`flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer ${
                selectedFolder === folder.id ? 'bg-blue-100' : ''
              }`}
            >
              <button 
                className="w-6 h-6 flex items-center justify-center"
                onClick={() => toggleFolder(folder.id)}
              >
                {expandedFolders[folder.id] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              <Folder className="w-4 h-4 mr-2 text-blue-600" />
              <span 
                className="truncate"
                onClick={() => handleFolderClick(folder.id)}
              >
                {folder.name}
              </span>
            </div>
            {expandedFolders[folder.id] && renderFolderTree(folder.id)}
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="overflow-auto max-h-[600px]">
      {renderFolderTree()}
      {folders.length === 0 && (
        <div className="text-gray-500 text-center p-4">
          No folders found
        </div>
      )}
    </div>
  );
}