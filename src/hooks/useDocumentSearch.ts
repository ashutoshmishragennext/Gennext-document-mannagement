
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';

type SearchParams = {
  organizationId: string;
  panNumber?: string;
  aadharNumber?: string;
  nationalId?: string;
  passportNumber?: string;
  driversLicense?: string;
  fullName?: string;
  documentTypeId?: string;
  metadata?: Record<string, any>;
  keyword?: string;
  page?: number;
  limit?: number;
};

type DocumentSearchResult = {
  documents: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  isLoading: boolean;
  error: string | null;
};

export function useDocumentSearch(initialParams: SearchParams) {
  const [searchParams, setSearchParams] = useState<SearchParams>(initialParams);
  const [result, setResult] = useState<DocumentSearchResult>({
    documents: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    isLoading: false,
    error: null,
  });

  const search = async (params: Partial<SearchParams> = {}) => {
    // Update search parameters
    const updatedParams = { ...searchParams, ...params };
    setSearchParams(updatedParams);
    setResult(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Build URL with search parameters
      const queryParams = new URLSearchParams();
      Object.entries(updatedParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'metadata') {
          queryParams.append(key, String(value));
        }
      });

      // Handle metadata specially
      if (updatedParams.metadata && Object.keys(updatedParams.metadata).length > 0) {
        queryParams.append('metadata', JSON.stringify(updatedParams.metadata));
      }

      // Make API request
      const response = await fetch(`/api/documents/search?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search documents');
      }

      const data = await response.json();
      
      setResult({
        documents: data.documents,
        pagination: data.pagination,
        isLoading: false,
        error: null,
      });

      return data;
    } catch (error) {
      setResult(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }));
      return null;
    }
  };

  // Initial search on mount
  useEffect(() => {
    search();
  },);

  // Function to change page
  const changePage = (page: number) => {
    search({ page });
  };

  // Function to change search terms
  const updateSearch = (newParams: Partial<SearchParams>) => {
    // Reset to page 1 when changing search terms
    search({ ...newParams, page: 1 });
  };

  return {
    ...result,
    search,
    changePage,
    updateSearch,
    searchParams,
  };
}