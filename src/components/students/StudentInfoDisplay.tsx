/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrentUser } from "@/hooks/auth";
import { useCurrentRole } from "@/hooks/auth"; // Import the useCurrentRole hook
import { format } from "date-fns";
import { ArrowLeft, Download, Plus, Search, Upload, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";

// Define the student interface to match the API response
interface Student {
  id: string;
  fullName: string;
  fatherName: string | null;
  rollNumber: string;
  dateOfBirth: string;
  nationalId: string | null;
  passportNumber: string | null;
  sessionYear: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Define pagination interface
interface Pagination {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// API response interface
interface StudentsResponse {
  students: Student[];
  pagination: Pagination;
}

export function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [organizationId, setOrganizationId] = useState("61e8458a-8f55-40c8-8adc-a78b744063c5");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const router = useRouter();
  const user = useCurrentUser();
  const role = useCurrentRole(); // Get the current user's role
  console.log("role",role);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const pageSize = 50;
  const [isSearching, setIsSearching] = useState(false);

  // Fetch students data with pagination
  const fetchStudents = async (page = 1, search = "") => {
    try {
      setIsLoading(true);
      setError(null);
      
      let url = `/api/students?organizationId=${organizationId}&page=${page}&limit=${pageSize}`;
      
      // Add search parameter if provided
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      // Add createdBy filter if user role is not admin
      if (role === "USER" && user?.id) {
        url += `&createdBy=${user.id}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      
      const data: StudentsResponse = await response.json();
      setStudents(data.students);
      
      // Update pagination information
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
        setTotalStudents(data.pagination.total);
        setCurrentPage(data.pagination.currentPage);
      }
    } catch (error: any) {
      console.error("Error fetching students:", error);
      setError(error.message || "Failed to load students. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchStudents(1);
  }, [organizationId, role, user?.id]); // Add role and user.id to dependencies

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    fetchStudents(page, searchQuery);
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        setIsSearching(true);
        fetchStudents(1, searchQuery);
      } else if (searchQuery === "") {
        // Only fetch if search was cleared
        fetchStudents(1, "");
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleUploadClick = (studentId: string) => {
    setSelectedStudent(studentId);
    router.push(`/upload?studentId=${studentId}`);
  };
  
  const handleView = (studentId: string) => {
    setSelectedStudent(studentId);
    router.push(`/upload?studentId=${studentId}`);
  };
  
  // Handle student creation
  const handleCreateStudent = async (formData: any) => {
    try {
      const response = await fetch(`/api/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          organizationId,
          createdBy: user?.id // Ensure createdBy is set to current user's ID
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create student');
      }
      
      const newStudent = await response.json();
      setStudents(prevStudents => [...prevStudents, newStudent]);
      setShowAddForm(false);
      fetchStudents(1);
    } catch (error: any) {
      console.error('Error creating student:', error);
      alert(error.message || 'Failed to create student');
    }
  };

  // Handle CSV file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async () => {
    if (!csvFile) {
      setUploadError("Please select a CSV file");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('organizationId', organizationId);
      formData.append('userId', user?.id || ''); // Use current user's ID
      
      const response = await fetch('/api/students/bulk-upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload students');
      }
      
      // Show success message
      if (result.results && result.results.failed > 0) {
        // Some records failed, show warning
        setUploadError(`${result.results.success} students added, but ${result.results.failed} failed. Check the console for details.`);
        console.table(result.results.errors);
      } else {
        // All records processed successfully
        alert(`Successfully added ${result.results.success} students!`);
      }
      
      // Reset and refresh
      setCsvFile(null);
      setShowAddForm(false);
      fetchStudents(1);
    } catch (error: any) {
      console.error('Error uploading CSV:', error);
      setUploadError(error.message || "Failed to upload students");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle download sample CSV
  const handleDownloadSample = () => {
    // Create CSV content
    const csvContent = "fullName,rollNumber,dateOfBirth,sessionYear\nJohn Doe,R001,2000-01-01,2024-2025\nJane Smith,R002,2001-02-15,2024-2025";
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      return dateString ? format(new Date(dateString), "dd/MM/yyyy") : "N/A";
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Form for adding students
  const AddStudentForm = () => {
    const [formData, setFormData] = useState({
      fullName: "",
      fatherName: "",
      rollNumber: "",
      dateOfBirth: "",
      sessionYear: "",
      email: "",
      phone: "",
      address: "",
      organizationId: organizationId,
      createdBy: user?.id || "", // Ensure createdBy is set to current user's ID
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateStudent(formData);
    };

    // Get current year for default session year suggestion
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const defaultSessionYear = `${currentYear}-${nextYear}`;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add New Student</h2>
          <Button 
            variant="outline" 
            onClick={() => setShowAddForm(false)}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to List
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Individual Student Form */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Add Individual Student</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input 
                  id="fullName" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherName">Father&apos;s Name</Label>
                <Input 
                  id="fatherName" 
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number *</Label>
                <Input 
                  id="rollNumber" 
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input 
                  id="dateOfBirth" 
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionYear">Session Year *</Label>
                <Input 
                  id="sessionYear" 
                  name="sessionYear"
                  placeholder={defaultSessionYear}
                  value={formData.sessionYear}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <Button type="submit" className="w-full">Add Student</Button>
            </form>
          </div>

          {/* Bulk Upload Form */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Bulk Upload Students</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="csvFile">Upload CSV File</Label>
                <Input 
                  id="csvFile" 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileChange} 
                />
                {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}
              </div>
              
              <div className="flex flex-col gap-4">
                <Button 
                  onClick={handleBulkUpload} 
                  disabled={!csvFile || isUploading}
                  className="w-full"
                >
                  {isUploading ? "Uploading..." : "Upload Students"}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleDownloadSample}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Download Sample CSV
                </Button>
              </div>
              
              <div className="text-sm text-gray-500 mt-2">
                <p>CSV should include columns: fullName, rollNumber, dateOfBirth (YYYY-MM-DD), sessionYear (YYYY-YYYY)</p>
                <p>Optional columns: fatherName, email, phone, address</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {!showAddForm ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Student Management</h1>
            <div className="flex items-center gap-4">
              {/* Role indicator */}
              <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                {role === "ADMIN" ? "Admin View" : "User View"}
              </div>
              <Button 
                onClick={() => setShowAddForm(true)} 
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors shadow-sm"
              >
                <Plus size={16} />
                Add Student
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2 items-center w-full max-w-sm">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search students by name or roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {isSearching ? "Searching..." : `Showing ${students.length} of ${totalStudents} students`}
                {role === "USER" && " (filtered by your user ID)"}
              </div>
            </div>

            {isLoading ? (
              <div className="text-center p-6">Loading students...</div>
            ) : error ? (
              <div className="text-center p-6 text-red-500">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Date of Birth</TableHead>
                      <TableHead>Session Year</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length > 0 ? (
                      students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{formatDate(student.createdAt)}</TableCell>
                          <TableCell className="font-medium">{student.fullName}</TableCell>
                          <TableCell>{student.rollNumber}</TableCell>
                          <TableCell>{formatDate(student.dateOfBirth)}</TableCell>
                          <TableCell>{student.sessionYear || "N/A"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleUploadClick(student.id)}
                              >
                                <Upload size={14} className="mr-1" />
                                Upload
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleView(student.id)}
                              >
                                <Eye size={14} className="mr-1" />
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                          {role === "USER" ? "You haven't created any students yet" : "No students found"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 px-2">
                    <div className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading}
                      >
                        <ChevronLeft size={16} className="mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isLoading}
                      >
                        Next
                        <ChevronRight size={16} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <AddStudentForm />
      )}
    </div>
  );
}