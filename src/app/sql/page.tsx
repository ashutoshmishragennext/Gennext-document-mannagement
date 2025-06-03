"use client"
import React, { useState, useEffect } from 'react';
import { Search, Edit3, Save, X, Database, FileText, AlertCircle, Upload, Download } from 'lucide-react';

const SqlTextEditor = () => {
  const [sqlData, setSqlData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editedContent, setEditedContent] = useState({});
  const [loading, setLoading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [originalSqlStructure, setOriginalSqlStructure] = useState('');

  // Parse SQL INSERT statements from full dump file
  const parseSqlFile = (sqlContent) => {
    const data = [];
    
    // Extract the INSERT statement section
    const insertSectionRegex = /INSERT INTO `gene_page_data`[^;]+;/g;
    const insertStatements = sqlContent.match(insertSectionRegex);
    
    if (!insertStatements || insertStatements.length === 0) {
      console.error('No INSERT statements found');
      return [];
    }

    // Process each INSERT statement
    insertStatements.forEach(statement => {
      // Extract the VALUES portion
      const valuesMatch = statement.match(/VALUES\s*\((.*)\);?$/s);
      if (!valuesMatch) return;
      
      // Split into individual records (handling both ), ( and ),( cases)
      const records = valuesMatch[1].split(/\s*\),\s*\(\s*/);
      
      records.forEach((record, index) => {
        // Clean up the record string
        let cleanRecord = record.trim();
        if (cleanRecord.startsWith('(')) cleanRecord = cleanRecord.substring(1);
        if (cleanRecord.endsWith(')')) cleanRecord = cleanRecord.substring(0, cleanRecord.length - 1);
        if (cleanRecord.endsWith(';')) cleanRecord = cleanRecord.substring(0, cleanRecord.length - 1);
        
        // Parse individual values
        const values = [];
        let currentValue = '';
        let inQuotes = false;
        let quoteChar = '';
        let escapeNext = false;
        
        for (let i = 0; i < cleanRecord.length; i++) {
          const char = cleanRecord[i];
          
          if (escapeNext) {
            currentValue += char;
            escapeNext = false;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            currentValue += char;
            continue;
          }
          
          if (!inQuotes && (char === "'" || char === '"')) {
            inQuotes = true;
            quoteChar = char;
            continue;
          }
          
          if (inQuotes && char === quoteChar) {
            inQuotes = false;
            quoteChar = '';
            continue;
          }
          
          if (!inQuotes && char === ',') {
            values.push(currentValue.trim());
            currentValue = '';
            continue;
          }
          
          currentValue += char;
        }
        
        if (currentValue.trim()) {
          values.push(currentValue.trim());
        }
        
        if (values.length >= 9) {
          data.push({
            ID: parseInt(values[0]) || index + 1,
            unique_id: values[1] || '',
            gene: values[2] || '',
            condition_name: values[3] || '',
            display_condition: values[4] || '',
            condition_desc: values[5] || '',
            heading1: values[6] || '',
            heading_desc1: values[7] || '',
            heading_desc2: values[8] || ''
          });
        }
      });
    });
    
    return data;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const content = await readFileAsText(file);
      setOriginalSqlStructure(content);
      
      const parsedData = parseSqlFile(content);
      setSqlData(parsedData);
      setFilteredData(parsedData);
      setFileUploaded(true);
      
      console.log(`Parsed ${parsedData.length} records from SQL file`);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading SQL file. Please make sure it\'s a valid SQL file.');
    }
    setLoading(false);
  };

  // Helper function to read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  // Filter data based on search term
  useEffect(() => {
    const filtered = sqlData.filter(item => 
      item.gene.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.condition_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.unique_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.condition_desc.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, sqlData]);

  const handleEdit = (item) => {
    setEditingItem(item.ID);
    setEditedContent({
      condition_desc: item.condition_desc,
      heading_desc1: item.heading_desc1,
      heading_desc2: item.heading_desc2,
      condition_name: item.condition_name,
      display_condition: item.display_condition
    });
  };

  const handleSave = async (itemId) => {
    setLoading(true);
    
    // Update the data
    const updatedData = sqlData.map(item => 
      item.ID === itemId 
        ? { ...item, ...editedContent }
        : item
    );
    
    setSqlData(updatedData);
    setFilteredData(updatedData.filter(item => 
      item.gene.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.condition_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.unique_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.condition_desc.toLowerCase().includes(searchTerm.toLowerCase())
    ));
    
    setEditingItem(null);
    setEditedContent({});
    setLoading(false);
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditedContent({});
  };

  const escapeSQL = (str) => {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/\\/g, "\\\\");
  };

  const generateUpdatedSql = () => {
    let sqlOutput = "INSERT INTO `gene_page_data` \n\n";
    sqlOutput += "(`ID`, `unique_id`, `gene`, `condition_name`, `display_condition`, `condition_desc`, `heading1`, `heading_desc1`, `heading_desc2`) VALUES\n";
    
    sqlData.forEach((item, index) => {
      const isLast = index === sqlData.length - 1;
      sqlOutput += `(${item.ID}, '${escapeSQL(item.unique_id)}', '${escapeSQL(item.gene)}', '${escapeSQL(item.condition_name)}', '${escapeSQL(item.display_condition)}',\n\n '${escapeSQL(item.condition_desc)}',\n \n  '${escapeSQL(item.heading1)}',\n\n '${escapeSQL(item.heading_desc1)}', '${escapeSQL(item.heading_desc2)}')${isLast ? ';' : ','}\n`;
    });
    
    return sqlOutput;
  };

  const downloadUpdatedSql = () => {
    const sqlContent = generateUpdatedSql();
    const blob = new Blob([sqlContent], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'updated_gene_page_data.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadOriginalSql = () => {
    const blob = new Blob([originalSqlStructure], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'original_gene_page_data.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetData = () => {
    if (originalSqlStructure) {
      const parsedData = parseSqlFile(originalSqlStructure);
      setSqlData(parsedData);
      setFilteredData(parsedData);
      setEditingItem(null);
      setEditedContent({});
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SQL Text Editor</h1>
                <p className="text-gray-600">Upload and edit your gene page data SQL file</p>
              </div>
            </div>
            
            {fileUploaded && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={resetData}
                  className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={downloadOriginalSql}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Original SQL</span>
                </button>
                <button
                  onClick={downloadUpdatedSql}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Export Updated SQL</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* File Upload */}
        {!fileUploaded && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <div className="text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload SQL File</h3>
              <p className="text-gray-600 mb-6">Select your gene_page_data.sql file to start editing</p>
              
              <label className="relative cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Choose SQL File</span>
                <input
                  type="file"
                  accept=".sql,.txt,*/*,"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing SQL file...</p>
          </div>
        )}

        {/* Search Bar */}
        {fileUploaded && sqlData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by gene, condition, or unique ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="text-sm text-gray-600">
                {filteredData.length} of {sqlData.length} records
              </div>
            </div>
          </div>
        )}

        {/* Data Cards */}
        {fileUploaded && (
          <div className="space-y-6">
            {filteredData.map((item) => (
              <div key={item.ID} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Card Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        ID: {item.ID}
                      </span>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {item.unique_id}
                      </span>
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {item.gene}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.condition_name}</h3>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {editingItem === item.ID ? (
                    // Edit Mode
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Condition Name
                        </label>
                        <input
                          type="text"
                          value={editedContent.condition_name || ''}
                          onChange={(e) => setEditedContent({...editedContent, condition_name: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Display Condition
                        </label>
                        <input
                          type="text"
                          value={editedContent.display_condition || ''}
                          onChange={(e) => setEditedContent({...editedContent, display_condition: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Condition Description
                        </label>
                        <textarea
                          value={editedContent.condition_desc || ''}
                          onChange={(e) => setEditedContent({...editedContent, condition_desc: e.target.value})}
                          rows={4}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Benefits/Effects Description
                        </label>
                        <textarea
                          value={editedContent.heading_desc1 || ''}
                          onChange={(e) => setEditedContent({...editedContent, heading_desc1: e.target.value})}
                          rows={6}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Food Source Table / Additional Content
                        </label>
                        <textarea
                          value={editedContent.heading_desc2 || ''}
                          onChange={(e) => setEditedContent({...editedContent, heading_desc2: e.target.value})}
                          rows={8}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleSave(item.ID)}
                          disabled={loading}
                          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                          <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="space-y-4">
                      {item.display_condition && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Display Condition</h4>
                          <p className="text-gray-900 leading-relaxed font-medium">{item.display_condition}</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Condition Description</h4>
                        <p className="text-gray-900 leading-relaxed">{item.condition_desc}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Benefits/Effects Description</h4>
                        <div className="text-gray-900 leading-relaxed bg-gray-50 p-4 rounded-lg">
                          {item.heading_desc1.length > 300 
                            ? `${item.heading_desc1.substring(0, 300)}...` 
                            : item.heading_desc1
                          }
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Content</h4>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-gray-600 text-sm">
                            {item.heading_desc2.includes('<table') ? 'HTML Table Data' : 
                             item.heading_desc2.length > 100 ? `${item.heading_desc2.substring(0, 100)}...` : 
                             item.heading_desc2 || 'No additional content'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          onClick={() => handleEdit(item)}
                          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>Edit Content</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {fileUploaded && filteredData.length === 0 && sqlData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search terms or clear the search to see all data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SqlTextEditor;