// useMetadataSearch.ts
import { useState, useCallback } from 'react';

interface MetadataSearchProps {
  userId: string;
  organizationId: string;
}

export const useMetadataSearch = ({ userId, organizationId }: MetadataSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to search with a specific term
  const search = useCallback(async (term?: string) => {
    try {
      setLoading(true);
      setError(null);
      const termToUse = term !== undefined ? term : searchTerm;
      
      // Your API call to search documents
      const response = await fetch(`/api/search?q=${encodeURIComponent(termToUse)}&organizationId=${organizationId}&userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Search request failed');
      }
      
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (err) {
      // setError(err.message || 'An error occurred during search');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, organizationId, userId]);

  // Function to fetch all data without search term
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // API call to get all documents
      const response = await fetch(`/api/documents?organizationId=${organizationId}&userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      setSearchResults(data.documents || []);
    } catch (err) {
      // setError(err.message || 'An error occurred while fetching documents');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, userId]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    loading,
    error,
    search,
    fetchAllData
  };
};