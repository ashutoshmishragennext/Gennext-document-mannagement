/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useState } from 'react';

const UploadPage = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [documents, setDocuments] = useState<any[]>([]); // Store the uploaded files
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(files); // Store the selected files
    }
  };

  const handleUploadFiles = async () => {
    if (selectedFiles) {
      setIsUploading(true);

      // Simulate a file upload process (you can implement actual upload logic here)
      const uploadedDocs = Array.from(selectedFiles).map((file) => ({
        id: file.name + Date.now(),
        filename: file.name,
        mimeType: file.type,
        uploadThingUrl: URL.createObjectURL(file), // Generate local URL for preview
      }));

      setDocuments(uploadedDocs); // Update documents state with the uploaded files
      setIsUploading(false); // Stop the loading state
    }
  };

  return (
    <Box sx={{ maxWidth: '900px', margin: 'auto', padding: 3 }}>
      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        Upload Documents
      </Typography>

      {/* File Selection */}
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        accept="image/*, .pdf, .doc, .docx, .ppt, .pptx"
        style={{ marginBottom: '20px' }}
      />

      {/* Upload Button */}
      <Button variant="contained" color="primary" onClick={handleUploadFiles} disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Upload'}
      </Button>

      {/* Loading Indicator */}
      {isUploading && <CircularProgress size={50} sx={{ display: 'block', margin: '20px auto' }} />}

      {/* Display Uploaded Documents */}
      {documents.length > 0 && (
        <Box sx={{ marginTop: 3 }}>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Uploaded Documents
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {documents.map((doc) => (
              <Box key={doc.id} sx={{ margin: 1, border: '1px solid #ddd', borderRadius: '8px', padding: 2, width: '120px', textAlign: 'center' }}>
                {doc.mimeType.startsWith('image') ? (
                  <img src={doc.uploadThingUrl} alt={doc.filename} style={{ width: '100%', height: 'auto', borderRadius: '5px' }} />
                ) : (
                  <Typography variant="body2" sx={{ textAlign: 'center' }}>
                    📄 {doc.filename}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ fontSize: '12px', color: 'gray' }}>
                  {doc.filename}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UploadPage;
