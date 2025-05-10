// // components/DocumentSearch.tsx
// 'use client';

// import { searchDocumentsByKeyword } from '@/app/api/search/route';
// import React, { useState } from 'react';
// // import { searchDocumentsByKeyword } from '@/app/api/search';
// // import { VerificationStatus } from '@/db/schema';

// type SearchResult = {
//   documentId: string;
//   individualId: string;
//   documentUrl: string;
//   originalFilename: string | null;
// //   verificationStatus: VerificationStatus;
//   fullName: string;
//   dateOfBirth: Date | null;
//   nationalId: string | null;
//   extractedText: string | null;
//   keywords: string[] | null;
// };

// export default function DocumentSearch() {
//   const [keyword, setKeyword] = useState('');
//   const [results, setResults] = useState<SearchResult[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSearch = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!keyword.trim()) {
//       setError('Please enter a search keyword');
//       return;
//     }
    
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await searchDocumentsByKeyword(keyword);
//       setResults(data);
//     } catch (err) {
//       setError('Failed to perform search. Please try again.');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="bg-white p-6 rounded-lg shadow">
//         <h2 className="text-xl font-semibold mb-4">Document Keyword Search</h2>
        
//         <form onSubmit={handleSearch} className="flex gap-2">
//           <input
//             type="text"
//             value={keyword}
//             onChange={(e) => setKeyword(e.target.value)}
//             placeholder="Enter keyword to search"
//             className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
//           >
//             {loading ? 'Searching...' : 'Search'}
//           </button>
//         </form>
        
//         {error && (
//           <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
//             {error}
//           </div>
//         )}
//       </div>

//       {results.length > 0 ? (
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-semibold mb-4">Search Results ({results.length})</h3>
//           <div className="space-y-4">
//             {results.map((result) => (
//               <div key={result.documentId} className="border rounded-md p-4 hover:bg-gray-50">
//                 <div className="flex justify-between">
//                   <h4 className="font-medium text-lg">{result.fullName}</h4>
//                   {/* <span className={`px-2 py-1 rounded text-xs ${
//                     result.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
//                     result.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
//                     'bg-yellow-100 text-yellow-800'
//                   }`}>
//                     {result.verificationStatus}
//                   </span> */}
//                 </div>
                
//                 <p className="text-sm text-gray-500 mt-1">
//                   {result.dateOfBirth && `DOB: ${new Date(result.dateOfBirth).toLocaleDateString()}`}
//                   {result.nationalId && ` • ID: ${result.nationalId}`}
//                 </p>
                
//                 <div className="mt-3">
//                   <p className="text-sm font-medium">Document Details:</p>
//                   <p className="text-sm text-gray-700">
//                     {result.originalFilename || 'Unnamed document'}
//                   </p>
                  
//                   <img
//                     src={result.documentUrl} 
//                     // target="_blank" 
//                     // rel="noopener noreferrer"
//                     className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
//                   >
//                     {/* View Document */}
//                   </img>
//                 </div>
                
//                 {result.extractedText && (
//                   <div className="mt-3">
//                     <p className="text-sm font-medium">Excerpt:</p>
//                     <p className="text-sm text-gray-700 mt-1 italic">
//                       {result.extractedText.substring(0, 150)}
//                       {result.extractedText.length > 150 ? '...' : ''}
//                     </p>
//                   </div>
//                 )}
                
//                 {result.keywords && result.keywords.length > 0 && (
//                   <div className="mt-3 flex flex-wrap gap-1">
//                     {result.keywords.map((kw, i) => (
//                       <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
//                         {kw}
//                       </span>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       ) : (
//         !loading && keyword && (
//           <div className="bg-white p-6 rounded-lg shadow text-center">
//             <p className="text-gray-500">No documents found matching &quot;{keyword}&quot;</p>
//           </div>
//         )
//       )}
//     </div>
//   );
// }
import React from 'react'

const Search = () => {
  return (
    <div>Search</div>
  )
}

export default Search