import FolderManager from '@/components/folder/FolderManager'
import React from 'react'

export default function page() {
  const studentId = '...'; // Get this from your auth system or params
  const organizationId = '...'; // Get this from your auth system or params
  const userId = '...';
  return (
    <div><FolderManager 
    studentId={studentId}
    organizationId={organizationId}
    userId={userId}
    /></div>
  )
}
