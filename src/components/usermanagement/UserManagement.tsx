/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentUser } from "@/hooks/auth";
import { useCurrentRole } from "@/hooks/auth";
import { format } from "date-fns";
import {
  ArrowLeft,
  Download,
  Plus,
  Search,
  Mail,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  X,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import FolderManagement from "../new/FolderForAdmin";
import { FormEvent, KeyboardEvent } from "react";
import { Textarea } from "../ui/textarea";
import { BarLoader, CircleLoader, DotLoader, RingLoader } from "react-spinners";
import PageLoader from "next/dist/client/page-loader";

// import { toast } from "@/components/ui/use-toast";

// Import FolderManagement component (assuming it's in the correct path)
// import { FolderManagement } from "@/components/folder-management";

// Define the user interface to match the API response
interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: string | null;
  phone: string | null;
  phoneVerified: string | null;
  role: "ADMIN" | "USER";
  organizationId: string;
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
interface UsersResponse {
  users: User[];
  pagination: Pagination;
}

interface FormData {
  name: string;
  description: string;
}

interface OrganizationResponse {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiErrorResponse {
  error: string;
}

// Interface for organization
interface Organization {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [organizationId, setOrganizationId] = useState<string>(
    ""
  );
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  // const [csvFile, setCsvFile] = useState<File | null>(null);
  // const [isUploading, setIsUploading] = useState(false);
  // const [uploadError, setUploadError] = useState<string | null>(null);
  const router = useRouter();
  const user = useCurrentUser();
  const role = useCurrentRole();

  // const [error, setError] = useState('');

  // console.log("users", users);

  // New state for selected user and showing folder management
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showFolderManagement, setShowFolderManagement] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const pageSize = 50;
  const [isSearching, setIsSearching] = useState(false);

  // Fetch users data with pagination
  const fetchUsers = async (page = 1, search = "") => {
    try {
      setIsLoading(true);
      setError(null);

      let url = `/api/users?page=${page}&limit=${pageSize}`;

      // Add search parameter if provided
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      // Add organization filter if not admin
      if (organizationId) {
        url += `&organizationId=${organizationId}`;
      }

      if (!organizationId) {
        return;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data: UsersResponse = await response.json();
      setUsers(data.users);

      // Update pagination information
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
        setTotalUsers(data.pagination.total);
        setCurrentPage(data.pagination.currentPage);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(
        error.message || "Failed to load users. Please try again later."
      );
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // Fetch organizations data
  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/organizations");

      if (!response.ok) {
        throw new Error("Failed to fetch organizations");
      }

      const data = await response.json();

      // Check if data is an array directly (as per your data format)
      if (Array.isArray(data)) {
        setOrganizations(data);
        console.log("organization data" , data);
        
        // Set default organization if there are any
        if (data.length > 0 && !organizationId) {
          setOrganizationId(data[0].id);
        }
      }
       else {
        // Set empty array if data is not in expected format
        setOrganizations([]);
        console.error(
          "Organizations data is undefined or improperly formatted:",
          data
        );
      }
    } catch (error: any) {
      console.error("Error fetching organizations:", error);
      // Set empty array to prevent map errors
      setOrganizations([]);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  } , [])

  useEffect(() => {
    fetchUsers(1);
  }, [organizationId]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    fetchUsers(page, searchQuery);
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        setIsSearching(true);
        fetchUsers(1, searchQuery);
      } else if (searchQuery === "") {
        // Only fetch if search was cleared
        fetchUsers(1, "");
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle row click to navigate to FolderManagement
  // const handleRowClick = (userId: string) => {
  //   setSelectedUserId(userId);
  //   setShowFolderManagement(true);
  // };

  // Handle back button from folder management
  const handleBackFromFolderManagement = () => {
    setShowFolderManagement(false);
    setSelectedUserId(null);
  };

  // Handle sending welcome email with credentials
  const handleSendCredentials = async (userId: string, e: React.MouseEvent) => {
    // Stop propagation to prevent row click
    e.stopPropagation();

    try {
      const response = await fetch(`/api/users/${userId}/send-credentials`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to send credentials");
      }

      toast({
        title: "Success",
        description: "Login credentials sent to user's email.",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error sending credentials:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send credentials",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Handle password reset
  const handleResetPassword = async (userId: string, e: React.MouseEvent) => {
    // Stop propagation to prevent row click
    e.stopPropagation();

    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to reset password");
      }

      toast({
        title: "Success",
        description: "Password reset link sent to user's email.",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Generate a random password
  const generateRandomPassword = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let password = "";
    const length = 12;

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      password += characters.charAt(randomIndex);
    }

    return password;
  };

  // Handle user creation
  const handleCreateUser = async (formData: any) => {
    try {
      // Generate a random password if not provided
      if (!formData.password) {
        formData.password = generateRandomPassword();
      }

      const response = await fetch(`/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          sendEmail: formData.sendEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }

      const newUser = await response.json();
      setUsers((prevUsers) => [...prevUsers, newUser.user]);
      setShowAddForm(false);
      fetchUsers(1);

      toast({
        title: "Success",
        description: `User ${formData.name} created successfully${
          formData.sendEmail ? " and credentials sent to their email" : ""
        }.`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Format date safely
  const formatDate = (dateString: string | null) => {
    try {
      return dateString ? format(new Date(dateString), "dd/MM/yyyy") : "N/A";
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Form for adding users
  const AddUserForm = () => {
      const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
      name: "",
      email: "",
      phone: "",
      role: "USER" as "ADMIN" | "USER",
      organizationId: "",
      password: "",
      sendEmail: true,
    });
      const [organizationUser, setOrganizationUser] = useState<Organization[]>([]);
  const [error, setError] = useState<string | null>(null);


    const [showPopup, setShowPopup] = useState(false);
    const [success, setSuccess] = useState("");

    const [formData2, setFormData2] = useState({
      name: "",
      description: "",
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    };

    const handleSelectChange = (name: string, value: string) => {
      setFormData({
        ...formData,
        [name]: value,
      });
    };

    const handleSwitchChange = (checked: boolean) => {
      setFormData({
        ...formData,
        sendEmail: checked,
      });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        
        setLoading(true)
        await handleCreateUser(formData);
        
      } catch (error) {
        console.log(error);
        
      }
      finally {
                setLoading(false)

      }
    };

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setFormData2((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    };

    const closePopup = () => {
      setShowPopup(false);
      setFormData2({ name: "", description: "" });
      setError("");
      setSuccess("");
    };

    const showPopUpForm = () => {
      setShowPopup(true);
      setError("");
      setSuccess("");
    };

    const fetchOrganizations2 = async () => {
      try {
        const response = await fetch("/api/organizations");

        if (!response.ok) {
          throw new Error("Failed to fetch organizations");
        }

        const data = await response.json();

        // Check if data is an array directly (as per your data format)
        if (Array.isArray(data)) {
          setOrganizationUser(data);

          // Set default organization if there are any
          if (data.length > 0 && !organizationId) {
            handleSelectChange("organizationId", data[0].id)
          }
        }
         else {
          // Set empty array if data is not in expected format
          setOrganizations([]);
          console.error(
            "Organizations data is undefined or improperly formatted:",
            data
          );
        }
      } catch (error: any) {
        console.error("Error fetching organizations:", error);
        // Set empty array to prevent map errors
        setOrganizations([]);
      }
    };

    const handleSubmit2 = async (e: FormEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (!formData2.name.trim()) {
        setError("Organization name is required");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/organizationcreation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData2.name.trim(),
            description: formData2.description.trim() || undefined,
          }),
        });

        const data: OrganizationResponse | ApiErrorResponse =
          await response.json();

        if (!response.ok) {
          throw new Error(
            (data as ApiErrorResponse).error || "Failed to create organization"
          );
        }

        const organization = data as OrganizationResponse;
        setSuccess(
          `Organization "${organization.name}" created successfully with code: ${organization.code}`
        );
        setFormData2({ name: "", description: "" });

        // Close popup after 2 seconds
        setTimeout(() => {
          closePopup();
        }, 2000);

        fetchOrganizations2();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit2(e as any); // Type assertion needed due to event type mismatch
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add New User</h2>
          <Button
            variant="outline"
            onClick={() => setShowAddForm(false)}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to List
          </Button>
        </div>

        {/* Popup Modal */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
              {/* Close Button */}
              <button
                onClick={closePopup}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                <X size={20} />
              </button>

              {/* Header */}
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Create New Organization
              </h2>

              {/* Success Message */}
              {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  {success}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Organization Name *
                  </label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData2.name}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter organization name"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData2.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter organization description (optional)"
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closePopup}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit2}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={loading || !formData2.name.trim()}
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? "Creating..." : "Create Organization"}
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                * Organization code will be auto-generated from the name
              </p>
            </div>
          </div>
        )}

        <div className="border rounded-lg p-6 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="number"
                value={formData.phone || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleSelectChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          {organizationUser && organizationUser.length < 1 && (
            <div className="space-y-2">
              <Label htmlFor="organizationId">Organization 43 *</Label>
              <div className=" flex gap-4 ">
                <Select
                  value={formData.organizationId || organizationId}
                  onValueChange={(value) =>
                    handleSelectChange("organizationId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    { organizations && organizations.length > 0 ? (
                      organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="fdsf" disabled>
                        No organizations available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <div
                  onClick={showPopUpForm}
                  className=" cursor-pointer -mt-1 flex gap-2 bg-slate-800 rounded-lg text-white p-2"
                >
                  Add {<Plus className=" bg-white rounded-full text-black" />}
                </div>
              </div>
            </div>
            )}

            {organizationUser && organizationUser.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="organizationId">Organization *</Label>
              <div className=" flex gap-4 ">
                <Select
                  value={formData.organizationId}
                  onValueChange={(value) =>
                    handleSelectChange("organizationId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    { organizationUser && organizationUser.length > 0 ? (
                      organizationUser.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="fd" disabled>
                        No organizations available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <div
                  onClick={showPopUpForm}
                  className=" cursor-pointer -mt-1 flex gap-2 bg-slate-800 rounded-lg text-white p-2"
                >
                  Add {<Plus className=" bg-white rounded-full text-black" />}
                </div>
              </div>
            </div>
            )}


            <div className="space-y-2">
              <Label htmlFor="password">Password (Optional)</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to generate random password"
              />
              <p className="text-sm text-gray-500">
                If left blank, a secure random password will be generated.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="sendEmail"
                checked={formData.sendEmail}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="sendEmail">
                Send login credentials to user&apos;s email
              </Label>
            </div>

            <Button type="submit" className="w-full">
              { !loading ? 
                "Add User" : 
                "Loading ..."}
            </Button>
          </form>
        </div>
      </div>
    );
  };

  // If folder management is shown, render it with the selected user ID
  if (showFolderManagement && selectedUserId) {
    return (
      <div>
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={handleBackFromFolderManagement}
            className="flex items-center gap-2 mr-4"
          >
            <ArrowLeft size={16} />
            Back to Users
          </Button>

          <h1 className="text-2xl font-bold">Folder Management</h1>
        </div>

        <FolderManagement user={selectedUserId} />
      </div>
    );
  }

  return (
    <div>
      {!showAddForm ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">User Management</h1>
            <div className="flex items-center gap-4">
              {/* Role indicator */}
              <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                {role === "ADMIN" ? "Admin View" : "User View"}
              </div>
              {/* Show Add User button for all users or just for ADMIN role */}
              <Button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors shadow-sm"
              >
                
                <Plus size={16} />
                Add User
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2 items-center w-full max-w-sm">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {role === "ADMIN" &&
                organizations &&
                organizations.length > 0 && (
                  <div className="flex items-center gap-4">
                    <Label
                      htmlFor="organizationFilter"
                      className="whitespace-nowrap"
                    >
                      Organization:
                    </Label>
                    <Select
                      value={organizationId}
                      onValueChange={setOrganizationId}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="All Organizations" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

              <div className="text-sm text-gray-500">
                {isSearching
                  ? "Searching..."
                  : `Showing ${users.length} of ${totalUsers} users`}
              </div>
            </div>

            {isLoading ? (
              <div className="text-center p-6">Loading users...</div>
            ) : error ? (
              <div className="text-center p-6 text-red-500">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email Verified</TableHead>
                      <TableHead>Created Date</TableHead>
                      {/* <TableHead>Actions</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <TableRow
                          key={user.id}
                          // onClick={() => handleRowClick(user.id)}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <TableCell className="font-medium">
                            {user.name}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                user.role === "ADMIN"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell>{user.phone || "N/A"}</TableCell>
                          <TableCell>
                            {user.emailVerified ? (
                              <span className="text-green-600 text-xs">
                                Verified
                              </span>
                            ) : (
                              <span className="text-orange-600 text-xs">
                                Not Verified
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          {/* <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={(e) => handleSendCredentials(user.id, e)}
                                title="Send Login Credentials"
                              >
                                <Mail size={14} className="mr-1" />
                                Send Credentials
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={(e) => handleResetPassword(user.id, e)}
                                title="Reset Password"
                              >
                                <KeyRound size={14} className="mr-1" />
                                Reset Password
                              </Button>
                            </div>
                          </TableCell> */}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">
                          No users found
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
        <AddUserForm />
      )}
    </div>
  );
}
