// 'use client';

// import { useState, useEffect } from 'react';
// import { signOut, useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// // import { FolderTree } from '@/components/FolderTree';
// // import { DocumentList } from '@/components/DocumentList';
// // import { CreateFolderDialog } from '@/components/CreateFolderDialog';
// // import { UploadDocumentDialog } from '@/components/UploadDocumentDialog';
// import { FolderTree } from '@/components/new/FolderTree';
// import { DocumentList } from '@/components/new/DocumnetList';
// import { UploadDocumentDialog } from '@/components/new/UploadDocumentDialog';
// import { CreateFolderDialog } from '@/components/new/CereateFolderDialog';
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { LogOut, Settings } from 'lucide-react';

// export default function Dashboard() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
//   const [isUploadDocumentOpen, setIsUploadDocumentOpen] = useState(false);
//   const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
//   const [organizationId, setOrganizationId] = useState<string | null>(null);
//   const [studentId, setStudentId] = useState<string | null>(null);

//    const handleLogout = async () => {
//       await signOut({ redirectTo: "/auth/login" });
//     };

//   // Redirect if not authenticated
//   useEffect(() => {
//     if (status === 'unauthenticated') {
//       router.push('/login');
//     }
    
//     // For demo purposes - in a real app, you would get these from your auth context
//     if (status === 'authenticated') {
//       setOrganizationId('org-123');
//       setStudentId('student-123');
//     }
//   }, [status, router]);

//   if (status === 'loading') {
//     return <div className="flex items-center justify-center h-screen">Loading...</div>;
//   }

//   if (!session) {
//     return null;
//   }

//   const handleFolderSelect = (folderId: string) => {
//     setSelectedFolderId(folderId);
//   };

//   return (
//     <div className="container mx-auto p-4">
//         <nav className="bg-white shadow-sm border-b px-6 py-3">
//                     <div className="flex items-center justify-between">
//                       <h1 className="text-2xl font-semibold text-gray-800">User Dashboard</h1>
                      
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
//                             <Avatar className="h-8 w-8">
//                               <AvatarImage src="/images/user_alt_icon.png" alt="User" />
//                               <AvatarFallback>AD</AvatarFallback>
//                             </Avatar>
//                             <span className="text-sm font-medium text-gray-700">User User</span>
//                           </button>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-56" align="end">
//                           <div className="space-y-1">
//                             <button className="w-full flex items-center gap-2 rounded-lg p-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
//                               <Settings className="h-4 w-4" />
//                               Profile Settings
//                             </button>
//                             <button 
//                               onClick={handleLogout}
//                               className="w-full flex items-center gap-2 rounded-lg p-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
//                             >
//                               <LogOut className="h-4 w-4" />
//                               Logout
//                             </button>
//                           </div>
//                         </PopoverContent>
//                       </Popover>
//                     </div>
//                   </nav>
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Document Management</h1>
//         <div className="space-x-2">
//           <Button onClick={() => setIsCreateFolderOpen(true)}>
//             Create Folder
//           </Button>
//           <Button onClick={() => setIsUploadDocumentOpen(true)}>
//             Upload Document
//           </Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="md:col-span-1 border rounded-lg p-4">
//           <h2 className="text-lg font-semibold mb-4">Folders</h2>
//           {organizationId && (
//             <FolderTree 
//               organizationId={organizationId} 
//               studentId={studentId}
//               onFolderSelect={handleFolderSelect}
//             />
//           )}
//         </div>
        
//         <div className="md:col-span-3 border rounded-lg p-4">
//           <h2 className="text-lg font-semibold mb-4">Documents</h2>
//           {organizationId && selectedFolderId && (
//             <DocumentList
//               folderId={selectedFolderId} 
//               organizationId={organizationId}
//             />
//           )}
//           {!selectedFolderId && (
//             <div className="text-center p-8 text-gray-500">
//               Select a folder to view documents
//             </div>
//           )}
//         </div>
//       </div>

//       {isCreateFolderOpen && organizationId && (
//         <CreateFolderDialog
//           open={isCreateFolderOpen}
//           onOpenChange={setIsCreateFolderOpen}
//           organizationId={organizationId}
//           studentId={studentId || undefined}
//           parentFolderId={selectedFolderId || undefined}
//           onSuccess={() => {
//             // Refetch folders
//           }}
//         />
//       )}

//       {isUploadDocumentOpen && organizationId && (
//         <UploadDocumentDialog
//           open={isUploadDocumentOpen}
//           onOpenChange={setIsUploadDocumentOpen}
//           organizationId={organizationId}
//           studentId={studentId || ''}
//           folderId={selectedFolderId || ''}
//           onSuccess={() => {
//             // Refetch documents
//           }}
//         />
//       )}
//     </div>
//   );
// }


/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
// import { UploadDocumentDialog } from '@/components/new/UploadDocumentDialog';
import FolderManagement from '@/components/new/Folder';
import UploadDocumentDialog from '@/components/new/UploadDocumentDialog';
import { StudentFolderDialog } from '@/components/students/DetailsInput';
import { StudentManagement } from '@/components/students/StudentInfoDisplay';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  File,
  FolderOpen,
  LogOut,
  Menu,
  Settings,
  Users
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/auth';
import Dashboard1 from '@/components/new/Dashboard';
import DocumentTypeForm from '@/components/Shema';
import { UserManagement } from '@/components/usermanagement/UserManagement';
import FolderLoader from '@/components/new/Loader';
// import { FolderManagement } from '@/components/new/FolderManagement';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadDocumentOpen, setIsUploadDocumentOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const user = useCurrentUser();
  // console.log("user",user?.name);
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeComponent, setActiveComponent] = useState('documents');

  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
  };

  // Redirect if not authenticatedclear
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    // For demo purposes - in a real app, you would get these from your auth context
    if (status === 'authenticated') {
      setOrganizationId('org-123');
      setStudentId('student-123');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <FolderLoader text="Processing your documents" />
    </div>;;
  }

  if (!session) {
    return null;
  }

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Navigation items for sidebar
  const navItems = [
    { id: 'documents', label: 'Documents', icon: <File className="h-5 w-5" /> },
    { id: 'user', label: 'User', icon: <Users className="h-5 w-5" /> },
    //  { id: 'folders', label: 'Folders', icon: <FolderOpen className="h-5 w-5" /> },
    { id: 'create schema', label: 'Create', icon: <File className="h-5 w-5" /> },
    
    // { id: 'folders', label: 'Folders', icon: <FolderOpen className="h-5 w-5" /> },
    // { id: 'activity', label: 'Activity', icon: <Activity className="h-5 w-5" /> },
  ];

  // Render the appropriate component based on sidebar selection
  const renderMainContent = () => {
    switch (activeComponent) {
      case 'documents':
        return (
          <div className="space-y-6">

            <Dashboard1/>
           
          </div>
        );
      case 'user':
        return (
         <UserManagement/>
        
        );
        case 'create schema':
          return (
            <DocumentTypeForm/>
          
          );
        
      case 'folders':
        return (
             <FolderManagement/>
        );
      case 'activity':
        return (
          <div>
            <h1 className="text-2xl font-bold mb-6">Recent Activity</h1>
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Activity Log</h2>
              {/* Activity logs and timeline */}
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center p-8 text-gray-500">
            Select an option from the sidebar
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Document Management System</h1>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                {/* <Avatar className="h-8 w-8">
                  <AvatarImage src="/images/user_alt_icon.png" alt="User" />
                  
                </Avatar> */}
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
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

      <div className="flex">
        {/* Sidebar */}
        <div 
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } bg-white border-r transition-all duration-300 ease-in-out h-[calc(100vh-64px)] flex flex-col justify-between`}
        >
          <div>
            <div className="flex justify-end p-2">
              <button 
                onClick={toggleSidebar} 
                className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>
            </div>
            <ul className="space-y-2 px-3 py-4">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveComponent(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeComponent === item.id
                        ? 'bg-gray-100 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon}
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 overflow-auto">
          {renderMainContent()}
        </div>
      </div>

      {/* Dialogs */}
      {isCreateFolderOpen && organizationId && (
  <StudentFolderDialog
    open={isCreateFolderOpen}
    onOpenChange={setIsCreateFolderOpen}
    organizationId={organizationId}
    parentFolderId={selectedFolderId || undefined}
    onSuccess={(folderData) => {
      // Here you would typically refresh the folder list
      console.log('Student folder created:', folderData);
      
      // For a real app, you'd want to update your folder state or refetch the folder list
      // For example:
      // refetchFolders();
      // OR
      // setFolders(prev => [...prev, folderData]);
      
      // You might also want to select the newly created folder
      setSelectedFolderId(folderData.id);
    }}
  />
)}

      {isUploadDocumentOpen && organizationId && (
        <UploadDocumentDialog
          // open={isUploadDocumentOpen}
          // onOpenChange={setIsUploadDocumentOpen}
          // organizationId={organizationId}
          // studentId={studentId || ''}
          // folderId={selectedFolderId || ''}
          // onSuccess={() => {
          //   // Refetch documents
          // }}
        />
      )}
    </div>
  );
}