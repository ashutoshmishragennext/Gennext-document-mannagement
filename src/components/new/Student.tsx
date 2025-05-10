import { useState, useEffect } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, Box, CircularProgress } from '@mui/material';
import { AiOutlineUpload } from 'react-icons/ai';
import { useRouter } from 'next/navigation';

type Student = {
  id: string;
  fullName: string;
  fatherName: string | null;
  rollNumber: string;
  dateOfBirth: string;
  nationalId: string | null;
  passportNumber: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
};

const Page = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(data.students);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleUploadClick = (studentId: string) => {
    router.push(`/upload?studentId=${studentId}`);
  };

  return (
    <Box sx={{ maxWidth: '1000px', margin: '0 auto', padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
        <Button variant="contained" color="primary">
          Add Student
        </Button>
      </Box>

      {isLoading && <CircularProgress size={50} sx={{ display: 'block', margin: 'auto' }} />}

      {!isLoading && students.length > 0 ? (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="students table">
            <TableHead>
              <TableRow>{/* Remove whitespace between table cells */}
                <TableCell>Full Name</TableCell>
                <TableCell>Roll Number</TableCell>
                <TableCell>Date of Birth</TableCell>
                <TableCell>Upload</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{/* Remove whitespace between rows */}
              {students.map((student) => (
                <TableRow key={student.id}>{/* Remove whitespace between table cells */}
                  <TableCell>{student.fullName}</TableCell>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell>{new Date(student.dateOfBirth).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleUploadClick(student.id)} color="primary">
                      <AiOutlineUpload size={24} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : !isLoading && students.length === 0 ? (
        <Typography variant="body1" sx={{ color: 'gray', textAlign: 'center' }}>
          No students available.
        </Typography>
      ) : null}
    </Box>
  );
};

export default Page;