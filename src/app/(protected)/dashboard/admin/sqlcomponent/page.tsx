// "use client"
// import React, { useState, useEffect } from 'react';
// import { Search, Upload, Download, Edit3, Save, X } from 'lucide-react';

// // Type definitions
// interface GenePageDescRecord {
//   id: number;
//   originalId: number;
//   uniqueid: string;
//   gene: string;
//   condition_name: string;
//   gene_desc: string;
// }

// interface EditForm extends Partial<GenePageDescRecord> {}

// // Highlight text utility function
// const highlightText = (text: string | number, searchTerm: string): React.ReactNode => {
//   if (!text || !searchTerm) return text;
  
//   const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
//   return text.toString().split(regex).map((part, i) => 
//     regex.test(part) ? (
//       <span key={i} className="bg-yellow-200">{part}</span>
//     ) : (
//       part
//     )
//   );
// };

// const SQLFileEditor: React.FC = () => {
//   const [sqlData, setSqlData] = useState<GenePageDescRecord[]>([]);
//   const [filteredData, setFilteredData] = useState<GenePageDescRecord[]>([]);
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [editingRow, setEditingRow] = useState<number | null>(null);
//   const [editForm, setEditForm] = useState<EditForm>({});
//   const [fileName, setFileName] = useState<string>('');

//   // File upload handler
//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setFileName(file.name);
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const content = e.target?.result as string;
//         parseSQLFile(content);
//       };
//       reader.readAsText(file);
//     }
//   };

//   // Parse SQL file and extract data
//   const parseSQLFile = (content: string): void => {
//     try {
//       // Extract INSERT statements for gene_page_desc table
//       const insertStart = content.indexOf('INSERT INTO `gene_page_desc`');
//       if (insertStart === -1) {
//         alert('No gene_page_desc table found in the SQL file.');
//         return;
//       }
      
//       // Find the complete INSERT statement
//       const insertSection = content.substring(insertStart);
//       const insertEnd = insertSection.indexOf(');') + 2;
//       const fullInsert = insertSection.substring(0, insertEnd);
      
//       // Extract values section
//       const valuesStart = fullInsert.indexOf('VALUES') + 6;
//       const valuesSection = fullInsert.substring(valuesStart).replace(/^\s*\n/, '').replace(/;\s*$/, '');
      
//       // Split by ),( to get individual records
//       const recordMatches = valuesSection.split(/\),\s*\(/);
      
//       const parsedData: GenePageDescRecord[] = recordMatches.map((record, index) => {
//         // Clean up the record string
//         let cleanRecord = record.trim();
//         if (cleanRecord.startsWith('(')) cleanRecord = cleanRecord.substring(1);
//         if (cleanRecord.endsWith(')')) cleanRecord = cleanRecord.substring(0, cleanRecord.length - 1);
        
//         const values = parseValuesString(cleanRecord);
        
//         return {
//           id: index + 1,
//           originalId: parseInt(values[0] || '0') || (index + 1),
//           uniqueid: values[1] || '',
//           gene: values[2] || '',
//           condition_name: values[3] || '',
//           gene_desc: values[4] || ''
//         };
//       });
      
//       setSqlData(parsedData);
//       setFilteredData(parsedData);
//     } catch (error) {
//       console.error('Error parsing SQL file:', error);
//       alert('Error parsing SQL file. Please check the file format.');
//     }
//   };

//   // Parse values string from SQL INSERT
//   const parseValuesString = (valuesString: string): string[] => {
//     const values: string[] = [];
//     let current = '';
//     let inQuotes = false;
    
//     for (let i = 0; i < valuesString.length; i++) {
//       const char = valuesString[i];
//       const nextChar = valuesString[i + 1];
      
//       if (char === "'" && nextChar === "'") {
//         // Handle escaped quotes
//         current += "'";
//         i++; // Skip next quote
//         continue;
//       }
      
//       if (char === "'") {
//         inQuotes = !inQuotes;
//         continue;
//       }
      
//       if (char === ',' && !inQuotes) {
//         values.push(current.trim());
//         current = '';
//         continue;
//       }
      
//       current += char;
//     }
    
//     if (current.trim()) {
//       values.push(current.trim());
//     }
    
//     return values;
//   };

//   // Search functionality
//   useEffect(() => {
//     if (searchTerm === '') {
//       setFilteredData(sqlData);
//     } else {
//       const filtered = sqlData.filter(row =>
//         Object.values(row).some(value =>
//           value.toString().toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       );
//       setFilteredData(filtered);
//     }
//   }, [searchTerm, sqlData]);

//   // Edit handlers
//   const startEdit = (row: GenePageDescRecord): void => {
//     setEditingRow(row.id);
//     setEditForm({...row});
//   };

//   const cancelEdit = (): void => {
//     setEditingRow(null);
//     setEditForm({});
//   };

//   const saveEdit = (): void => {
//     const updatedData = sqlData.map(row => 
//       row.id === editingRow ? { ...row, ...editForm } as GenePageDescRecord : row
//     );
//     setSqlData(updatedData);
//     setEditingRow(null);
//     setEditForm({});
//   };

//   const handleInputChange = (field: keyof GenePageDescRecord, value: string | number): void => {
//     setEditForm(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   // Render HTML content safely with highlighting
//   const renderHTMLContent = (content: string): React.ReactNode => {
//     if (!content) return null;
    
//     // If there's a search term, highlight it in the HTML content
//     if (searchTerm) {
//       const highlightedContent = content.replace(
//         new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
//         match => `<span class="bg-yellow-200">${match}</span>`
//       );
//       return (
//         <div 
//           className="prose prose-sm max-w-none"
//           dangerouslySetInnerHTML={{ __html: highlightedContent }}
//         />
//       );
//     }
    
//     return (
//       <div 
//         className="prose prose-sm max-w-none"
//         dangerouslySetInnerHTML={{ __html: content }}
//       />
//     );
//   };

//   // Generate SQL file for download
//   const generateSQLFile = (): string => {
//     // Keep original SQL structure and format
//     let sqlContent = `-- phpMyAdmin SQL Dump
// -- version 5.2.1
// -- https://www.phpmyadmin.net/
// --
// -- Host: 127.0.0.1
// -- Generation Time: ${new Date().toLocaleDateString('en-US', { 
//       year: 'numeric', 
//       month: 'short', 
//       day: '2-digit' 
//     })} at ${new Date().toLocaleTimeString('en-US', { 
//       hour12: false, 
//       hour: '2-digit', 
//       minute: '2-digit' 
//     })} AM
// -- Server version: 10.4.28-MariaDB
// -- PHP Version: 7.3.33

// SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
// START TRANSACTION;
// SET time_zone = "+00:00";


// /*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
// /*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
// /*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
// /*!40101 SET NAMES utf8mb4 */;

// --
// -- Database: \`pensive_nmcgenetics\`
// --

// -- --------------------------------------------------------

// --
// -- Table structure for table \`gene_page_desc\`
// --

// CREATE TABLE \`gene_page_desc\` (
//   \`ID\` int(11) NOT NULL,
//   \`uniqueid\` varchar(20) NOT NULL,
//   \`gene\` varchar(20) NOT NULL,
//   \`condition_name\` varchar(200) NOT NULL,
//   \`gene_desc\` text NOT NULL
// ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

// --
// -- Dumping data for table \`gene_page_desc\`
// --

// `;

//     // Generate INSERT statements exactly like original format
//     sqlData.forEach((row, index) => {
//       const escapeString = (str: string | number): string => {
//         if (!str) return "''";
//         return "'" + str.toString().replace(/'/g, "\\'").replace(/\r\n/g, '\\r\\n').replace(/\n/g, '\\n') + "'";
//       };
      
//       const values = [
//         row.originalId || (index + 1),
//         escapeString(row.uniqueid),
//         escapeString(row.gene),
//         escapeString(row.condition_name),
//         escapeString(row.gene_desc)
//       ].join(', ');
      
//       if (index === 0) {
//         sqlContent += `INSERT INTO \`gene_page_desc\` (\`ID\`, \`uniqueid\`, \`gene\`, \`condition_name\`, \`gene_desc\`) VALUES\n(${values})`;
//       } else {
//         sqlContent += `,\n(${values})`;
//       }
//     });
    
//     sqlContent += ';\n';

//     return sqlContent;
//   };

//   // Download functionality
//   const downloadFile = (): void => {
//     const sqlContent = generateSQLFile();
//     const blob = new Blob([sqlContent], { type: 'text/sql' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = fileName || 'gene_page_desc.sql';
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-8">Gene Page Description Editor</h1>
        
//         {/* File Upload Section */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <div className="flex items-center gap-4">
//             <label className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors">
//               <Upload size={20} />
//               Upload SQL File
//               <input
//                 type="file"
//                 accept=".sql,.txt"
//                 onChange={handleFileUpload}
//                 className="hidden"
//               />
//             </label>
            
//             {sqlData.length > 0 && (
//               <button
//                 onClick={downloadFile}
//                 className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
//               >
//                 <Download size={20} />
//                 Download SQL
//               </button>
//             )}
//           </div>
          
//           {fileName && (
//             <p className="mt-2 text-sm text-gray-600">
//               Loaded: {fileName} ({sqlData.length} records)
//             </p>
//           )}
//         </div>

//         {/* Search Section */}
//         {sqlData.length > 0 && (
//           <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//             <div className="flex items-center gap-2">
//               <Search size={20} className="text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search in all fields..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             {searchTerm && (
//               <p className="mt-2 text-sm text-gray-600">
//                 Found {filteredData.length} of {sqlData.length} records
//               </p>
//             )}
//           </div>
//         )}

//         {/* Data Display */}
//         {filteredData.length > 0 && (
//           <div className="space-y-6">
//             {filteredData.map((row) => (
//               <div key={row.id} className="bg-white rounded-lg shadow-md p-6">
//                 <div className="flex justify-between items-start mb-4">
//                   <div>
//                     <h3 className="text-xl font-semibold text-gray-900">
//                       {editingRow === row.id ? (
//                         <input
//                           type="text"
//                           value={editForm.condition_name || ''}
//                           onChange={(e) => handleInputChange('condition_name', e.target.value)}
//                           className="text-xl font-semibold border-b-2 border-blue-500 bg-transparent focus:outline-none w-full"
//                         />
//                       ) : (
//                         highlightText(row.condition_name, searchTerm)
//                       )}
//                     </h3>
//                     <p className="text-gray-600 mt-2">
//                       <span className="font-medium">Gene:</span> {editingRow === row.id ? (
//                         <input
//                           type="text"
//                           value={editForm.gene || ''}
//                           onChange={(e) => handleInputChange('gene', e.target.value)}
//                           className="border-b border-gray-300 bg-transparent focus:outline-none ml-1"
//                         />
//                       ) : (
//                         highlightText(row.gene, searchTerm)
//                       )}
//                     </p>
//                     <p className="text-gray-600">
//                       <span className="font-medium">Unique ID:</span> {editingRow === row.id ? (
//                         <input
//                           type="text"
//                           value={editForm.uniqueid || ''}
//                           onChange={(e) => handleInputChange('uniqueid', e.target.value)}
//                           className="border-b border-gray-300 bg-transparent focus:outline-none ml-1"
//                         />
//                       ) : (
//                         highlightText(row.uniqueid, searchTerm)
//                       )}
//                     </p>
//                   </div>
                  
//                   <div className="flex gap-2">
//                     {editingRow === row.id ? (
//                       <>
//                         <button
//                           onClick={saveEdit}
//                           className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
//                         >
//                           <Save size={16} />
//                           Save
//                         </button>
//                         <button
//                           onClick={cancelEdit}
//                           className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
//                         >
//                           <X size={16} />
//                           Cancel
//                         </button>
//                       </>
//                     ) : (
//                       <button
//                         onClick={() => startEdit(row)}
//                         className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
//                       >
//                         <Edit3 size={16} />
//                         Edit
//                       </button>
//                     )}
//                   </div>
//                 </div>

//                 <div className="space-y-4">
//                   <div>
//                     <h4 className="font-medium text-gray-700 mb-2">Gene Description:</h4>
//                     {editingRow === row.id ? (
//                       <textarea
//                         value={editForm.gene_desc || ''}
//                         onChange={(e) => handleInputChange('gene_desc', e.target.value)}
//                         className="w-full h-32 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="Enter gene description..."
//                       />
//                     ) : (
//                       <div className="text-gray-600 whitespace-pre-wrap">
//                         {highlightText(row.gene_desc, searchTerm)}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {filteredData.length === 0 && sqlData.length > 0 && (
//           <div className="bg-white rounded-lg shadow-md p-6 text-center">
//             <p className="text-gray-600">No records found matching your search.</p>
//           </div>
//         )}

//         {sqlData.length === 0 && (
//           <div className="bg-white rounded-lg shadow-md p-6 text-center">
//             <p className="text-gray-600">Upload a SQL file to get started.</p>
//             <p className="text-sm text-gray-500 mt-2">
//               Supported format: gene_page_desc table with columns: ID, uniqueid, gene, condition_name, gene_desc
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SQLFileEditor;

import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page