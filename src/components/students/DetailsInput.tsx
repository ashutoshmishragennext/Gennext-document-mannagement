/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
// import { cn } from "@/lib/utils";

type StudentFolderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data: any) => void;
  organizationId: string;
  parentFolderId?: string;
};

export function StudentFolderDialog({
  open,
  onOpenChange,
  onSuccess,
  organizationId,
  parentFolderId,
}: StudentFolderDialogProps) {
  const [fullName, setFullName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [PassingYear, setPassingYear] = useState<number | null>(null);

  // Reset form fields and errors when the dialog is closed
  const resetForm = () => {
    setFullName("");
    setRollNumber("");
    setDateOfBirth(null);
    setPassingYear(null);
    setErrors({});
    setShowCalendar(false);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!rollNumber.trim()) {
      newErrors.rollNumber = "Roll number is required";
    } else if (!/^[A-Za-z0-9-]+$/.test(rollNumber)) {
      newErrors.rollNumber =
        "Roll number can only contain letters, numbers, and hyphens";
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }

    
    if (!PassingYear) {
      newErrors.PassingYear = "Batch start year is required";
    } else if (PassingYear < 1900 || PassingYear > new Date().getFullYear()) {
      newErrors.PassingYear = "Batch start year must be between 1900 and the current year";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      // Format the data for folder creation
      const studentData = {
        fullName,
        rollNumber,
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
        sessionYear: PassingYear, // Rename this variable to sessionYear throughout
        organizationId: "0cb46f34-0d7d-48f8-8195-e664dbe6dd80",
        createdBy: "de2575c0-4c7d-4171-b420-a67a7e72e48f",
      };
      console.log("student Data", studentData);
  
      // Send POST request to the API endpoint
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
        
      });
      console.log(studentData);
  
      if (!response.ok) {
        throw new Error("Failed to create student");
      }
  
      const data = await response.json();
  
      console.log("Student created:", data.student);
  
      // Call the onSuccess callback with the created student data
      onSuccess(data.student);
  
      // Close the dialog and reset the form
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating student:", error);
      // Optionally, display an error message to the user
      setErrors({ submit: "Failed to create student. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

 // Automatically calculate batch end year if start year is provided
 const handlePassingYearChange = (value: string) => {
  const year = Number(value);
  setPassingYear(year);
};

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm(); // Reset form when dialog is closed
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto mt-16">
        <DialogHeader className="sticky top-0 bg-background pt-4 pb-2 z-10">
          <DialogTitle>Create Student Folder</DialogTitle>
          <DialogDescription>
            Enter student details to create a new folder
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Full Name Field */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter student's full name"
              aria-invalid={!!errors.fullName}
              disabled={isSubmitting}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>

          {/* Roll Number Field */}
          <div className="space-y-2">
            <Label htmlFor="rollNumber">Roll Number</Label>
            <Input
              id="rollNumber"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="Enter student's roll number"
              aria-invalid={!!errors.rollNumber}
              disabled={isSubmitting}
            />
            {errors.rollNumber && (
              <p className="text-sm text-red-500">{errors.rollNumber}</p>
            )}
          </div>

          {/* Date of Birth Field */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <div className="relative">
              <Input
                id="dateOfBirth"
                value={dateOfBirth ? format(dateOfBirth, "PPP") : ""}
                readOnly
                placeholder="Select date of birth"
                aria-invalid={!!errors.dateOfBirth}
                disabled={isSubmitting}
                className="cursor-pointer"
                onClick={() => setShowCalendar(!showCalendar)}
              />
              <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
            </div>
            {showCalendar && (
              <Calendar
                mode="single"
                selected={dateOfBirth || undefined}
                onSelect={(date) => {
                  if (date) {
                    setDateOfBirth(date);
                    setShowCalendar(false);
                  }
                }}
                initialFocus
                disabled={(date) => date > new Date()}
                captionLayout="dropdown"
                fromYear={1900}
                toYear={new Date().getFullYear()}
                className="mt-2 border rounded-lg"
              />
            )}
            {errors.dateOfBirth && (
              <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="PassingYear">Batch Start Year</Label>
            <Input
              id="PassingYear"
              type="number"
              value={PassingYear || ""}
              onChange={(e) => handlePassingYearChange(e.target.value)}
              placeholder="Enter Passing year"
              aria-invalid={!!errors.PassingYear}
              min={1900}
              max={new Date().getFullYear()}
              disabled={isSubmitting}
            />
            {errors.PassingYear && (
              <p className="text-sm text-red-500">{errors.PassingYear}</p>
            )}
          </div>
          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-background pb-4 z-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Folder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}