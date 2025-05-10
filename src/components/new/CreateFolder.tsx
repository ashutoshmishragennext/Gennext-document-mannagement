'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
// import { FolderManagement } from '@/components/folder-management';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Folder as FolderIcon,
  ListFilter,
  Search,
  Users
} from 'lucide-react';
import { FolderManagement } from './FolderManagement';

export default function FolderExplorerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  // Hardcoded for the example - in real application this would come from auth context
  const organizationId = "f6cd9156-2346-4d1f-b2fe-3e167f9eeabe";
  setSelectedStudentId('492144c0-8119-4ea1-b238-237b3ffb5abd')
//   const studentId = "f6cd9156-2346-4d1f-b
//   const students = [
//     { id: "student1", name: "John Doe" },
//     { id: "student2", name: "Jane Smith" },
//     { id: "student3", name: "Alex Johnson" },
//   ];
  
  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
          <p className="text-muted-foreground">
            Organize, search, and manage student documents
          </p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents or folders..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              <ListFilter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem>Recent first</DropdownMenuItem>
            <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
            <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Students</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onClick={() => setSelectedStudentId(null)}>
              All Students
            </DropdownMenuItem>
            {/* {students.map((student) => (
              <DropdownMenuItem 
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
              >
                {student.name}
              </DropdownMenuItem>
            ))} */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Tabs defaultValue="folders" className="w-full">
        <TabsList>
          <TabsTrigger value="folders" className="flex items-center gap-1">
            <FolderIcon className="h-4 w-4" />
            Folders
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="folders">
          <Card>
            <CardHeader>
              <CardTitle>
                {/* {selectedStudentId 
                  ? `Folders for ${students.find(s => s.id === selectedStudentId)?.name}`
                  : "All Folders"
                } */}
              </CardTitle>
              <CardDescription>
                {selectedStudentId 
                  ? "Navigate through this student's folder structure" 
                  : "Organize and manage folder structure"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FolderManagement 
                organizationId={organizationId}
                studentId={selectedStudentId || undefined}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                View and manage all documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Document management component would go here */}
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No documents found</p>
                <p className="text-muted-foreground mb-6">
                  {searchQuery 
                    ? `No documents matching "${searchQuery}"`
                    : "Select a folder or upload a new document"
                  }
                </p>
                <Button>Upload Document</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}