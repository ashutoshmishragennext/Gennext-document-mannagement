"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {  uploadthingClient } from "@/utils/uploadthingClient";
import { File, Folder, MoreHorizontal, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";

interface FolderType {
  id: string;
  name: string;
  description: string | null;
  parentFolderId: string | null;
  uploadThingFolderId: string;
  studentId: string;
  organizationId: string | never | null;
  createdAt: string;
  createdBy: string;
}

interface FileType {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  createdAt: string;
}

interface FolderManagerProps {
  studentId: string;
  organizationId: string ;
  userId: string; // Current user ID for createdBy
}

export default function FolderManager({
  studentId,
  organizationId,
  userId,
}: FolderManagerProps) {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [files, setFiles] = useState<FileType[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FolderType | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch folders based on current context
  const fetchFolders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        organizationId,
        studentId,
        ...(currentFolder
          ? { parentFolderId: currentFolder.id }
          : { parentFolderId: "" }),
      });

      const response = await fetch(`/api/folders?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch folders");
      }

      const data = await response.json();
      setFolders(data);
      setIsLoading(false);
    } catch (err) {
      setError("Error loading folders");
      setIsLoading(false);
      console.error("Error fetching folders:", err);
    }
  };

  // Fetch files for the current folder
  const fetchFiles = async () => {
    if (!currentFolder?.uploadThingFolderId) {
      setFiles([]);
      return;
    }

    try {
      const filesData = await uploadthingClient.listFiles(
        currentFolder.uploadThingFolderId
      );
      setFiles(filesData);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Error loading files");
    }
  };

  // Initial load and when folder changes
  useEffect(() => {
    fetchFolders();
  }, [studentId, organizationId, currentFolder?.id]);

  // Load files when current folder changes
  useEffect(() => {
    fetchFiles();
  }, [currentFolder]);

  // Create a new folder
  const createFolder = async () => {
    if (!newFolderName.trim()) {
      setError("Folder name cannot be empty");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newFolderName,
          parentFolderId: currentFolder?.id || null,
          studentId,
          organizationId,
          createdBy: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create folder");
      }

      // Reset and refresh
      setNewFolderName("");
      setIsCreatingFolder(false);
      fetchFolders();
    } catch (err) {
      console.error("Error creating folder:", err);
      setError("Failed to create folder");
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to a folder
  const navigateToFolder = (folder: FolderType) => {
    setCurrentFolder(folder);
  };

  // Navigate up to parent folder
  const navigateUp = async () => {
    if (!currentFolder) return;

    if (currentFolder.parentFolderId) {
      try {
        const params = new URLSearchParams({
          organizationId,
          id: currentFolder.parentFolderId,
        });

        const response = await fetch(`/api/folders?${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch parent folder");
        }

        const data = await response.json();
        if (data.length > 0) {
          setCurrentFolder(data[0]);
        } else {
          setCurrentFolder(null);
        }
      } catch (err) {
        console.error("Error navigating up:", err);
        setCurrentFolder(null);
      }
    } else {
      setCurrentFolder(null);
    }
  };

  // Delete a folder
  const deleteFolder = async (folderId: string) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/folders?id=${folderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete folder");
      }

      fetchFolders();
    } catch (err) {
      console.error("Error deleting folder:", err);
      setError("Failed to delete folder");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          onClick={() => setCurrentFolder(null)}
          disabled={!currentFolder}
        >
          Root
        </Button>

        {currentFolder && (
          <>
            <span>/</span>
            <Button variant="outline" onClick={navigateUp}>
              {currentFolder.name}
            </Button>
          </>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Folder actions */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => setIsCreatingFolder(true)}
          disabled={isCreatingFolder}
        >
          <Plus className="w-4 h-4 mr-2" /> New Folder
        </Button>

        {currentFolder && (
          <div>
            {/* <UploadDropzone
              endpoint="docUploader"
              onClientUploadComplete={() => {
                // After upload, refresh files
                fetchFiles();
                // You could update the files in the database here if needed
              }}
              onUploadError={(error: Error) => {
                setError(`Upload error: ${error.message}`);
              }}
            /> */}
          </div>
        )}
      </div>

      {/* New folder form */}
      {isCreatingFolder && (
        <div className="flex items-center space-x-2">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="flex-1"
          />
          <Button onClick={createFolder} disabled={isLoading}>
            Create
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setIsCreatingFolder(false);
              setNewFolderName("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Folders list */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Folders</h3>

        {isLoading ? (
          <div>Loading folders...</div>
        ) : folders.length === 0 ? (
          <div className="text-gray-500">No folders found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer flex justify-between items-center"
              >
                <div
                  className="flex items-center space-x-2"
                  onClick={() => navigateToFolder(folder)}
                >
                  <Folder className="w-5 h-5 text-blue-500" />
                  <span>{folder.name}</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFolder(folder.id);
                      }}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Files list */}
      {currentFolder && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Files</h3>

          {files.length === 0 ? (
            <div className="text-gray-500">No files in this folder</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {files.map((file) => (
                <a
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <File className="w-5 h-5 text-green-500" />
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {Math.round(file.size / 1024)} KB
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
