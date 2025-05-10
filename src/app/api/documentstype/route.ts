import { db } from '@/db';
import { DocumentTypeMetadataTable, DocumentTypesTable } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all document types or a specific one by ID
export async function GET() {
  try {
    // Fetch all document types
    const documentTypes = await db.select().from(DocumentTypesTable);

    // Fetch metadata for all document types
    const metadataRecords = await db.select().from(DocumentTypeMetadataTable);

    // Map metadata to respective document types
    const documentTypesWithMetadata = documentTypes.map((docType) => ({
      ...docType,
      metadata: metadataRecords.filter(
        (meta) => meta.documentTypeId === docType.id
      ),
    }));

    return NextResponse.json(documentTypesWithMetadata);
  } catch (error) {
    console.error("Error fetching document types with metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch document types" },
      { status: 500 }
    );
  }
}

// POST: Create a new document type with metadata
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      isActive, 
      // isRequired = false, 
      metadataSchema,
      organizationId,
      createdBy,
      // Get user ID from session (this is a placeholder)
      // In production, you would extract this from the session/auth
    } = body;
    
    // Retrieve user ID from auth session or request
    // This is a placeholder - implement proper auth retrieval in your app
    // For now we'll assume you're passing it in the request or have middleware
    // const userId = "de2575c0-4c7d-4171-b420-a67a7e72e48f"; // or from auth context
    
    if (!name) {
      return NextResponse.json({ error: 'Document type name is required' }, { status: 400 });
    }
    
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }
    
    if (!createdBy) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    if (!metadataSchema || typeof metadataSchema !== 'object') {
      return NextResponse.json({ error: 'Metadata schema is required and must be an object' }, { status: 400 });
    }
    
    // Create document type with all required fields
    const [newDocumentType] = await db.insert(DocumentTypesTable)
      .values({
        name,
        description,
        // isRequired: isRequired ?? false,
        isActive: isActive ?? true,
        organizationId,
        createdBy,
      })
      .returning();
      
    // Create metadata schema entry with all required fields
    const [newMetadata] = await db.insert(DocumentTypeMetadataTable)
      .values({
        documentTypeId: newDocumentType.id,
        schema: metadataSchema,
        version: '1.0',
        isActive: true,
        createdBy,
      })
      .returning();
      
    return NextResponse.json({
      ...newDocumentType,
      metadata: [newMetadata]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating document type:', error);
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return NextResponse.json({ error: 'Failed to create document type' }, { status: 500 });
  }
}