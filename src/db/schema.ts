import { InferModel, relations } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  uniqueIndex,
  boolean,
  jsonb
} from "drizzle-orm/pg-core";

// ===== ENUMS =====
export const UserRole = pgEnum("user_role", ["ADMIN", "USER"]);
export const VerificationStatus = pgEnum("verification_status", ["PENDING", "APPROVED", "REJECTED"]);

// ===== ORGANIZATIONS =====
export const OrganizationsTable = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    code: text("code").notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("organizations_code_key").on(table.code),
    index("organizations_name_idx").on(table.name),
  ]
);

export type Organization = InferModel<typeof OrganizationsTable>;
export type NewOrganization = InferModel<typeof OrganizationsTable, "insert">;

// ===== USERS =====
export const UsersTable = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: timestamp("email_verified", { mode: "date" }),
    password: text("password").notNull(),
    phone: text("phone"),
    phoneVerified: timestamp("phone_verified", { mode: "date" }),
    role: UserRole("role").default("USER").notNull(),
    organizationId: uuid("organization_id").references(() => OrganizationsTable.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_email_key").on(table.email),
    index("users_name_email_phone_idx").on(
      table.name,
      table.email,
      table.phone
    ),
    index("users_organization_idx").on(table.organizationId),
  ]
);

export type User = InferModel<typeof UsersTable>;
export type NewUser = InferModel<typeof UsersTable, "insert">;

// ===== STUDENTS =====
export const StudentsTable = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    // Student identification
    fullName: text("full_name").notNull(),
    // fatherName: text("father_name"),
    // rollNumber: text("roll_number").notNull(),
    // dateOfBirth: timestamp("date_of_birth", { mode: "date" }),
    // courseName: text("course_name"),
    // branchName: text("branch_name"),
     

    // Optional identifiers
    // nationalId: text("national_id"),
    // passportNumber: text("passport_number"),
    // sessionYear: text("session_year"),
    // Contact information
    email: text("email"),
    phone: text("phone"),
    // address: text("address"),
    // Metadata
    organizationId: uuid("organization_id").references(() => OrganizationsTable.id).notNull(),
    createdBy: uuid("created_by").references(() => UsersTable.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // Unique roll number within an organization
    // uniqueIndex("students_org_roll_key").on(table.organizationId, table.rollNumber),
    index("students_full_name_idx").on(table.fullName),
    // index("students_father_name_idx").on(table.fatherName),
    // index("students_roll_number_idx").on(table.rollNumber),
    // index("students_national_id_idx").on(table.nationalId),
    // index("students_passport_number_idx").on(table.passportNumber),
    index("students_organization_idx").on(table.organizationId),
  ]
);

export type Student = InferModel<typeof StudentsTable>;
export type NewStudent = InferModel<typeof StudentsTable, "insert">;

// ===== DOCUMENT TYPES =====
export const DocumentTypesTable = pgTable(
  "document_types",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(), // e.g., "Birth Certificate", "Transcript", "ID Card"
    description: text("description"),
    // isRequired: boolean("is_required").default(false).notNull(), // Whether this document is mandatory
    isActive: boolean("is_active").default(true).notNull(),
    organizationId: uuid("organization_id").references(() => OrganizationsTable.id).notNull(),
    createdBy: uuid("created_by").references(() => UsersTable.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("document_types_name_org_key").on(table.name, table.organizationId),
    index("document_types_organization_idx").on(table.organizationId),
  ]
);

export type DocumentType = InferModel<typeof DocumentTypesTable>;
export type NewDocumentType = InferModel<typeof DocumentTypesTable, "insert">;

// ===== DOCUMENT TYPE METADATA =====
export const DocumentTypeMetadataTable = pgTable(
  "document_type_metadata",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    documentTypeId: uuid("document_type_id")
      .references(() => DocumentTypesTable.id, { onDelete: "cascade" })
      .notNull(),
    // The schema defines what metadata fields are required for this document type
    schema: jsonb("schema").notNull(),
    version: text("version").default("1.0"),
    isActive: boolean("is_active").default(true).notNull(),
    createdBy: uuid("created_by").references(() => UsersTable.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("document_type_metadata_document_type_idx").on(table.documentTypeId),
  ]
);

export type DocumentTypeMetadata = InferModel<typeof DocumentTypeMetadataTable>;
export type NewDocumentTypeMetadata = InferModel<typeof DocumentTypeMetadataTable, "insert">;

// ===== FOLDERS =====
// First define the table without the self-reference relation
export const FoldersTable = pgTable(
  "folders",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    description: text("description"),
    parentFolderId: uuid("parent_folder_id"), // Just define the column type
    studentId: uuid("student_id").references(() => StudentsTable.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id").references(() => OrganizationsTable.id).notNull(),
    createdBy: uuid("created_by").references(() => UsersTable.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    uploadThingFolderId: text("uploadthing_folder_id"),
  },
  (table) => [
    uniqueIndex("folders_name_parent_student_org_key").on(
      table.name, 
      table.parentFolderId, 
      table.studentId, 
      table.organizationId
    ),
    index("folders_parent_idx").on(table.parentFolderId),
    index("folders_student_idx").on(table.studentId),
    index("folders_organization_idx").on(table.organizationId),
  ]
);
export type Folder = InferModel<typeof FoldersTable>;
export type NewFolder = InferModel<typeof FoldersTable, "insert">;

// Then define the relations separately
export const foldersRelations = relations(FoldersTable, ({ one }) => ({
  parentFolder: one(FoldersTable, {
    fields: [FoldersTable.parentFolderId],
    references: [FoldersTable.id],
  }),
}));

// ===== TAGS =====
export const TagsTable = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color").default("#3b82f6"), // Default blue color
    organizationId: uuid("organization_id").references(() => OrganizationsTable.id).notNull(),
    createdBy: uuid("created_by").references(() => UsersTable.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("tags_name_org_key").on(table.name, table.organizationId),
    index("tags_organization_idx").on(table.organizationId),
  ]
);

export type Tag = InferModel<typeof TagsTable>;
export type NewTag = InferModel<typeof TagsTable, "insert">;

// ===== DOCUMENTS =====
export const DocumentsTable = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    studentId: uuid("student_id").references(() => StudentsTable.id, { onDelete: "cascade" }).notNull(),
    folderId: uuid("folder_id").references(() => FoldersTable.id).notNull(),
    documentTypeId: uuid("document_type_id").references(() => DocumentTypesTable.id),
    filename: text("filename").notNull(),
    fileSize: text("file_size").notNull(),
    mimeType: text("mime_type").notNull(),
    uploadThingFileId: text("uploadthing_file_id"), // Store UploadThing File ID here
    uploadThingUrl: text("uploadthing_url").notNull(),
    metadata: jsonb("metadata").default({}).notNull(),
    metadataSchemaId: uuid("metadata_schema_id").references(() => DocumentTypeMetadataTable.id),
    verificationStatus: VerificationStatus("verification_status").default("PENDING").notNull(),
    verifiedBy: uuid("verified_by").references(() => UsersTable.id),
    verifiedAt: timestamp("verified_at"),
    rejectionReason: text("rejection_reason"),
    organizationId: uuid("organization_id").references(() => OrganizationsTable.id).notNull(),
    uploadedBy: uuid("uploaded_by").references(() => UsersTable.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("documents_student_idx").on(table.studentId),
    index("documents_folder_idx").on(table.folderId),
    index("documents_document_type_idx").on(table.documentTypeId),
    index("documents_verification_status_idx").on(table.verificationStatus),
    index("documents_organization_idx").on(table.organizationId),
    uniqueIndex("documents_uploadthing_id_key").on(table.uploadThingFileId),
    uniqueIndex("documents_student_doc_type_org_key").on(
      table.studentId, 
      table.documentTypeId,
      table.organizationId
    ),
  ]
);


export type Document = InferModel<typeof DocumentsTable>;
export type NewDocument = InferModel<typeof DocumentsTable, "insert">;

// ===== DOCUMENT TAGS JUNCTION =====
export const DocumentTagsTable = pgTable(
  "document_tags",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    documentId: uuid("document_id").references(() => DocumentsTable.id, { onDelete: "cascade" }).notNull(),
    tagId: uuid("tag_id").references(() => TagsTable.id, { onDelete: "cascade" }).notNull(),
    addedBy: uuid("added_by").references(() => UsersTable.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("document_tags_doc_tag_key").on(table.documentId, table.tagId),
    index("document_tags_document_idx").on(table.documentId),
    index("document_tags_tag_idx").on(table.tagId),
  ]
);

export type DocumentTag = InferModel<typeof DocumentTagsTable>;
export type NewDocumentTag = InferModel<typeof DocumentTagsTable, "insert">;

// ===== FOLDER TAGS JUNCTION =====
export const FolderTagsTable = pgTable(
  "folder_tags",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    folderId: uuid("folder_id").references(() => FoldersTable.id, { onDelete: "cascade" }).notNull(),
    tagId: uuid("tag_id").references(() => TagsTable.id, { onDelete: "cascade" }).notNull(),
    addedBy: uuid("added_by").references(() => UsersTable.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("folder_tags_folder_tag_key").on(table.folderId, table.tagId),
    index("folder_tags_folder_idx").on(table.folderId),
    index("folder_tags_tag_idx").on(table.tagId),
  ]
);

export type FolderTag = InferModel<typeof FolderTagsTable>;
export type NewFolderTag = InferModel<typeof FolderTagsTable, "insert">;

// ===== DOCUMENT SEARCH KEYWORDS =====
export const DocumentSearchKeywordsTable = pgTable(
  "document_search_keywords",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    documentId: uuid("document_id").references(() => DocumentsTable.id, { onDelete: "cascade" }).notNull(),
    studentId: uuid("student_id").references(() => StudentsTable.id, { onDelete: "cascade" }).notNull(),
    extractedText: text("extracted_text"),
    keywords: text("keywords").array(),  // Define the array of keywords
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("document_search_document_idx").on(table.documentId),
    index("document_search_student_idx").on(table.studentId),
    // Create the index without specifying "using" and rely on the default index method
    index("document_search_keywords_idx").on(table.keywords),
  ]
);

export type NewDocumentSearchKeywords = InferModel<typeof DocumentSearchKeywordsTable, "insert">;

// ===== VERIFICATION HISTORY =====
export const VerificationHistoryTable = pgTable(
  "verification_history",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    documentId: uuid("document_id").references(() => DocumentsTable.id, { onDelete: "cascade" }).notNull(),
    status: VerificationStatus("status").notNull(),
    comment: text("comment"),
    verifiedBy: uuid("verified_by").references(() => UsersTable.id).notNull(),
    organizationId: uuid("organization_id").references(() => OrganizationsTable.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("verification_history_document_idx").on(table.documentId),
    index("verification_history_organization_idx").on(table.organizationId),
  ]
);

export type VerificationHistory = InferModel<typeof VerificationHistoryTable>;
export type NewVerificationHistory = InferModel<typeof VerificationHistoryTable, "insert">;

// ===== SEARCH HISTORY =====
export const SearchHistoryTable = pgTable(
  "search_history",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    searchTerm: text("search_term").notNull(),
    searchParams: jsonb("search_params"),
    searchedBy: uuid("searched_by").references(() => UsersTable.id).notNull(),
    organizationId: uuid("organization_id").references(() => OrganizationsTable.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("search_history_searched_by_idx").on(table.searchedBy),
    index("search_history_organization_idx").on(table.organizationId),
  ]
);

export type SearchHistory = InferModel<typeof SearchHistoryTable>;
export type NewSearchHistory = InferModel<typeof SearchHistoryTable, "insert">;

// ===== AUTH & VERIFICATION TABLES =====
export const EmailVerificationTokenTable = pgTable(
  "email_verification_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    email: text("email").notNull(),
    token: uuid("token").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("email_verification_tokens_email_token_key").on(
      table.email,
      table.token
    ),
    uniqueIndex("email_verification_tokens_token_key").on(table.token),
  ]
);

export type EmailVerificationToken = InferModel<typeof EmailVerificationTokenTable>;
export type NewEmailVerificationToken = InferModel<typeof EmailVerificationTokenTable, "insert">;

export const PhoneVerificationTable = pgTable(
  "phone_verification_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    phone: text("phone").notNull(),
    otp: text("otp").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("phone_verification_tokens_phone_otp_key").on(
      table.phone,
      table.otp
    ),
    uniqueIndex("phone_verification_tokens_otp_key").on(table.otp),
  ]
);

export type PhoneVerificationToken = InferModel<typeof PhoneVerificationTable>;
export type NewPhoneVerificationToken = InferModel<typeof PhoneVerificationTable, "insert">;

export const PasswordResetTokenTable = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    email: text("email").notNull(),
    token: uuid("token").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("password_reset_tokens_email_token_key").on(
      table.email,
      table.token
    ),
    uniqueIndex("password_reset_tokens_token_key").on(table.token),
  ]
);

export type PasswordResetToken = InferModel<typeof PasswordResetTokenTable>;
export type NewPasswordResetToken = InferModel<typeof PasswordResetTokenTable, "insert">;