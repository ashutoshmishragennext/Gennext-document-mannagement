'use client';

import { useState, useEffect } from 'react';
import { File, Eye, Trash2, Tag, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
// import { useToast } from '@/components/ui/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

interface DocumentListProps {
  folderId: string;
  organizationId: string;
}

interface Document {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  uploadThingUrl: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface DocumentTag {
  id: string;
  tag: Tag;
}

export function DocumentList({ folderId, organizationId }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [documentTags, setDocumentTags] = useState<Record<string, DocumentTag[]>>({});
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  // const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
//   const { toast } = useToast();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/documents?folderId=${folderId}&organizationId=0cb46f34-0d7d-48f8-8195-e664dbe6dd80`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        
        const data = await response.json();
        setDocuments(data);
        
        // Fetch tags for each document
        for (const doc of data) {
          fetchDocumentTags(doc.id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents');
        setLoading(false);
      }
    };

    const fetchAvailableTags = async () => {
      try {
        const response = await fetch(`/api/tags?organizationId=0cb46f34-0d7d-48f8-8195-e664dbe6dd80`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        
        const data = await response.json();
        setAvailableTags(data);
      } catch (err) {
        console.error('Error fetching tags:', err);
      }
    };

    fetchDocuments();
    fetchAvailableTags();
  }, [folderId, organizationId]);

  const fetchDocumentTags = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/tags`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch document tags');
      }
      
      const data = await response.json();
      setDocumentTags(prev => ({
        ...prev,
        [documentId]: data
      }));
    } catch (err) {
      console.error(`Error fetching tags for document ${documentId}:`, err);
    }
  };

  const handlePreview = (url: string) => {
    setPreviewUrl(url);
  };

  const handleClosePreview = () => {
    setPreviewUrl(null);
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast({
        title: 'Document deleted',
        description: 'The document has been deleted successfully.',
      });
    } catch (err) {
      console.error('Error deleting document:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete the document.',
        variant: 'destructive',
      });
    }
  };

  const toggleTag = async (documentId: string, tagId: string) => {
    const hasTag = documentTags[documentId]?.some(dt => dt.tag.id === tagId);
    
    try {
      if (hasTag) {
        // Remove tag
        const response = await fetch(`/api/documents/${documentId}/tags?tagId=${tagId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove tag');
        }
      } else {
        // Add tag
        const response = await fetch(`/api/documents/${documentId}/tags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tagId }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to add tag');
        }
      }
      
      // Refresh document tags
      fetchDocumentTags(documentId);
    } catch (err) {
      console.error('Error toggling tag:', err);
      toast({
        title: 'Error',
        description: hasTag ? 'Failed to remove tag' : 'Failed to add tag',
        variant: 'destructive',
      });
    }
  };

  const verifyDocument = async (documentId: string, verificationStatus: 'VERIFIED' | 'REJECTED', rejectionReason?: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationStatus,
          rejectionReason,
          organizationId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update verification status');
      }
      
      // Update document in the list
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, verificationStatus } 
          : doc
      ));
      
      toast({
        title: `Document ${verificationStatus.toLowerCase()}`,
        description: `The document has been ${verificationStatus.toLowerCase()} successfully.`,
      });
    } catch (err) {
      console.error('Error updating verification status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update verification status.',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      {documents.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          No documents in this folder
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Size</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Tags</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <File className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="truncate max-w-[200px]">{doc.filename}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatFileSize(doc.fileSize)}</td>
                  <td className="px-4 py-3 text-gray-600">{doc.mimeType}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {documentTags[doc.id]?.map(dt => (
                        <Badge key={dt.id} style={{ backgroundColor: dt.tag.color }}>
                          {dt.tag.name}
                        </Badge>
                      ))}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                            <Tag className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {availableTags.map(tag => {
                            const hasTag = documentTags[doc.id]?.some(dt => dt.tag.id === tag.id);
                            return (
                              <DropdownMenuItem
                                key={tag.id}
                                onClick={() => toggleTag(doc.id, tag.id)}
                              >
                                <div className="flex items-center w-full justify-between">
                                  <div className="flex items-center">
                                    <div 
                                      className="w-3 h-3 rounded-full mr-2" 
                                      style={{ backgroundColor: tag.color }}
                                    />
                                    <span>{tag.name}</span>
                                  </div>
                                  {hasTag && <Check className="w-4 h-4 ml-2" />}
                                </div>
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {doc.verificationStatus === 'PENDING' && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Pending
                        </Badge>
                      )}
                      {doc.verificationStatus === 'VERIFIED' && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Verified
                        </Badge>
                      )}
                      {doc.verificationStatus === 'REJECTED' && (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          Rejected
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePreview(doc.uploadThingUrl)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {doc.verificationStatus === 'PENDING' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-600"
                            onClick={() => verifyDocument(doc.id, 'VERIFIED')}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600"
                            onClick={() => verifyDocument(doc.id, 'REJECTED', 'Document rejected')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!previewUrl} onOpenChange={handleClosePreview}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[70vh] overflow-auto">
            {previewUrl && (
              <iframe 
                src={previewUrl} 
                className="w-full h-[500px] border rounded"
                title="Document Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
