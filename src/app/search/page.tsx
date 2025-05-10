/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import Tesseract from "tesseract.js";
import dynamic from "next/dynamic";

// Dynamically import react-json-view to avoid SSR issues
const ReactJson = dynamic(() => import("react-json-view"), { ssr: false });

const OCRExtract = () => {
  const [image, setImage] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Handle Image Upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      extractTextFromImage(file);
    }
  };

  // Extract Text using OCR

  const extractTextFromImage = async (file: File) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      if (reader.result) {
        const result = await Tesseract.recognize(reader.result as string, "eng");
        const extractedText = result.data.text;
  
        // Improved regex to extract key details
        const nameMatch = extractedText.match(/Name\s*\n([A-Z\s]+)/i);
        const numberMatch = extractedText.match(/[A-Z0-9]{10}/); // PAN number format
        const fatherNameMatch = extractedText.match(/Father's Name\s*\n([A-Z\s]+)/i);
        const dobMatch = extractedText.match(/Date of Birth\s*\n([\d-]+)/i);
  
        setExtractedData({
          name: nameMatch ? nameMatch[1].trim() : "Not Found",
          number: numberMatch ? numberMatch[0].trim() : "Not Found",
          fatherName: fatherNameMatch ? fatherNameMatch[1].trim() : "Not Found",
          dob: dobMatch ? dobMatch[1].trim() : "Not Found",
        });
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };
  

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4 p-2 border rounded" />

      {image && <img src={URL.createObjectURL(image)} alt="Uploaded" className="w-64 h-auto mb-4 border rounded shadow" />}

      {loading && <p className="text-blue-600">Extracting text... Please wait.</p>}

      {extractedData && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Extracted Data:</h2>
          <ReactJson src={extractedData} theme="monokai" collapsed={false} displayDataTypes={false} />
        </div>
      )}
    </div>
  );
};

export default OCRExtract;
