// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Switch } from '@/components/ui/switch';
// import { Textarea } from '@/components/ui/textarea';
// import { AlertCircle, CheckCircle2 } from 'lucide-react';
// import { useState } from 'react';

// export default function OrganizationForm() {
//   const [formData, setFormData] = useState({
//     name: '',
//     code: '',
//     description: '',
//     isActive: true
//   });
  
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null

//   const handleChange = (e :any) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === 'checkbox' ? checked : value
//     });
//   };

//   const handleSwitchChange = (checked: any) => {
//     setFormData({
//       ...formData,
//       isActive: checked
//     });
//   };

//   const handleSubmit = async (e: { preventDefault: () => void; }) => {
//     e.preventDefault();
//     setIsSubmitting(true);
    
//     try {
//       // This is where you would make an API call to create the organization
//       // Example: await createOrganization(formData);
      
//       console.log('Submitting organization:', formData);
      
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       setSubmitStatus('success');
//       // Reset form after successful submission
//       setFormData({
//         name: '',
//         code: '',
//         description: '',
//         isActive: true
//       });
//     } catch (error) {
//       console.error('Error creating organization:', error);
//       setSubmitStatus('error');
//     } finally {
//       setIsSubmitting(false);
//       // Clear status after 3 seconds
//       setTimeout(() => setSubmitStatus(null), 3000);
//     }
//   };

//   return (
//     <Card className="w-full max-w-lg mx-auto">
//       <CardHeader>
//         <CardTitle className="text-2xl font-bold">Create Organization</CardTitle>
//         <CardDescription>Add a new organization to the system</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="space-y-2">
//             <Label htmlFor="name">Organization Name *</Label>
//             <Input 
//               id="name" 
//               name="name" 
//               value={formData.name} 
//               onChange={handleChange} 
//               placeholder="Enter organization name" 
//               required 
//             />
//           </div>
          
//           <div className="space-y-2">
//             <Label htmlFor="code">Organization Code *</Label>
//             <Input 
//               id="code" 
//               name="code" 
//               value={formData.code} 
//               onChange={handleChange} 
//               placeholder="Enter unique organization code" 
//               required 
//             />
//             <p className="text-sm text-gray-500">This code must be unique and will be used as an identifier</p>
//           </div>
          
//           <div className="space-y-2">
//             <Label htmlFor="description">Description</Label>
//             <Textarea 
//               id="description" 
//               name="description" 
//               value={formData.description} 
//               onChange={handleChange} 
//               placeholder="Provide a description of the organization" 
//               rows={4}
//             />
//           </div>
          
//           <div className="flex items-center justify-between">
//             <div className="space-y-0.5">
//               <Label htmlFor="isActive">Active Status</Label>
//               <p className="text-sm text-gray-500">Is this organization currently active?</p>
//             </div>
//             <Switch 
//               id="isActive" 
//               name="isActive" 
//               checked={formData.isActive} 
//               onCheckedChange={handleSwitchChange}
//             />
//           </div>
          
//           <Button 
//             type="submit" 
//             className="w-full"
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? 'Creating...' : 'Create Organization'}
//           </Button>
          
//           {submitStatus === 'success' && (
//             <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-2 rounded">
//               <CheckCircle2 className="h-5 w-5" />
//               <span>Organization created successfully!</span>
//             </div>
//           )}
          
//           {submitStatus === 'error' && (
//             <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-2 rounded">
//               <AlertCircle className="h-5 w-5" />
//               <span>Failed to create organization. Please try again.</span>
//             </div>
//           )}
//         </form>
//       </CardContent>
//     </Card>
//   );
// }

import React from 'react'

const OrganizationForm = () => {
  return (
    <div>OrganizationForm</div>
  )
}

export default OrganizationForm