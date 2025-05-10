/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CheckCircle, Cloud, FileText, Folder, Upload } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const Dashboard1   = () => {
  // Sample data - replace with your actual data
  const [totalDocuments, setTotalDocuments] = useState(10234);
  const [pendingDocuments, setPendingDocuments] = useState(1245);
  const [storageUsed, setStorageUsed] = useState(15); // in GB
  const [storageTotal, setStorageTotal] = useState(50); // in GB
  
  const monthlyUploadsData = [
    { name: 'Jan', documents: 250 },
    { name: 'Feb', documents: 320 },
    { name: 'Mar', documents: 450 },
    { name: 'Apr', documents: 380 },
    { name: 'May', documents: 500 },
    { name: 'Jun', documents: 700 },
    { name: 'Jul', documents: 650 },
    { name: 'Aug', documents: 800 },
    { name: 'Sep', documents: 600 },
    { name: 'Oct', documents: 450 },
    { name: 'Nov', documents: 550 },
    { name: 'Dec', documents: 400 },
  ];

  const documentCategoryDistribution = [
    { name: 'Academic', value: 4500 },
    { name: 'Financial', value: 2000 },
    { name: 'Medical', value: 1500 },
    { name: 'Personal', value: 1000 },
    { name: 'Other', value: 1000 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Document Management Dashboard</h1>
        
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 flex items-start space-x-4">
            <div className="p-3 rounded-full bg-blue-100">
              <FileText className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Documents</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalDocuments}</h2>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" /> 15% increase from last month
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 flex items-start space-x-4">
            <div className="p-3 rounded-full bg-orange-100">
              <Upload className="h-7 w-7 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pending Documents</p>
              <h2 className="text-3xl font-bold text-gray-800">{pendingDocuments}</h2>
              <p className="text-xs text-yellow-600 mt-1">Documents awaiting approval</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 flex items-start space-x-4">
            <div className="p-3 rounded-full bg-green-100">
              <Cloud className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Storage Usage</p>
              <h2 className="text-3xl font-bold text-gray-800">{storageUsed} GB</h2>
              <p className="text-xs text-gray-500 mt-1">{storageUsed}/{storageTotal} GB used</p>
              <div className="mt-2 w-full bg-gray-200 h-2 rounded-full">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(storageUsed / storageTotal) * 100}%` }}></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 flex items-start space-x-4">
            <div className="p-3 rounded-full bg-purple-100">
              <Folder className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Top Category</p>
              <h2 className="text-lg font-bold text-gray-800">Academic</h2>
              <p className="text-xs text-green-600 mt-1">Most documents stored</p>
            </div>
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Uploads Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Document Uploads</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyUploadsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                    }}
                    formatter={(value: any) => [`${value} documents`, 'Uploads']}
                  />
                  <Bar dataKey="documents" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Document Category Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Distribution by Category</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={documentCategoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }:any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {documentCategoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value} documents`, 'Category']}
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Recent Document Uploads Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Recent Document Uploads</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Uploaded</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[{ id: 1, document: 'Transcript.pdf', student: 'Abigail Johnson', date: 'Oct 15, 2023', status: 'Approved' },
                   { id: 2, document: 'Medical Report.pdf', student: 'Michael Chen', date: 'Oct 12, 2023', status: 'Pending' },
                   { id: 3, document: 'Course Registration.pdf', student: 'Sophia Martinez', date: 'Oct 10, 2023', status: 'Approved' },
                   { id: 4, document: 'Fee Payment.pdf', student: 'William Taylor', date: 'Oct 8, 2023', status: 'Approved' },
                   { id: 5, document: 'Scholarship Application.pdf', student: 'Emma Wilson', date: 'Oct 5, 2023', status: 'Pending' }
                ].map((upload) => (
                  <tr key={upload.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{upload.document}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{upload.student}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{upload.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${upload.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {upload.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard1;
