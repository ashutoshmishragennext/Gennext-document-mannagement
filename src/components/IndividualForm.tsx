// "use client"
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { AlertCircle, CheckCircle2 } from 'lucide-react';
// import { useState } from 'react';
// // import { Calendar } from '@/components/ui/calendar';
// import { Popover, PopoverTrigger } from '@/components/ui/popover';
// // import { format } from 'date-fns';

// export default function IndividualForm() {
//   const [organizations] = useState([
//     { id: '1', name: 'Organization A' },
//     { id: '2', name: 'Organization B' },
//     { id: '3', name: 'Organization C' },
//   ]);
  
//   const [formData, setFormData] = useState({
//     fullName: '',
//     dateOfBirth: null,
//     nationalId: '',
//     passportNumber: '',
//     driversLicense: '',
//     taxId: '',
//     email: '',
//     phone: '',
//     address: '',
//     organizationId: '',
//   });
  
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitStatus, setSubmitStatus] = useState(null);
//   const [activeTab, setActiveTab] = useState('essential');

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };



//   const handleOrganizationChange = (value) => {
//     setFormData({
//       ...formData,
//       organizationId: value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
    
//     try {
//       // This would be your API call
//       // await createIndividual(formData);
      
//       console.log('Submitting individual:', formData);
      
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       setSubmitStatus('success');
//       setFormData({
//         fullName: '',
//         dateOfBirth: null,
//         nationalId: '',
//         passportNumber: '',
//         driversLicense: '',
//         taxId: '',
//         email: '',
//         phone: '',
//         address: '',
//         organizationId: '',
//       });
//     } catch (error) {
//       console.error('Error creating individual:', error);
//       setSubmitStatus('error');
//     } finally {
//       setIsSubmitting(false);
//       setTimeout(() => setSubmitStatus(null), 3000);
//     }
//   };

//   // Check if at least one ID field is filled
//   const hasAtLeastOneId = formData.nationalId || formData.passportNumber || 
//                           formData.driversLicense || formData.taxId;

//   return (
//     <Card className="w-full max-w-2xl mx-auto">
//       <CardHeader>
//         <CardTitle className="text-2xl font-bold">Register Individual</CardTitle>
//         <CardDescription>Add a new individual to the document management system</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <Tabs defaultValue="essential" value={activeTab} onValueChange={setActiveTab}>
//             <TabsList className="grid grid-cols-3 w-full mb-6">
//               <TabsTrigger value="essential">Essential Info</TabsTrigger>
//               <TabsTrigger value="identification">ID Documents</TabsTrigger>
//               <TabsTrigger value="contact">Contact Details</TabsTrigger>
//             </TabsList>
            
//             <TabsContent value="essential" className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="fullName">Full Name *</Label>
//                 <Input 
//                   id="fullName" 
//                   name="fullName" 
//                   value={formData.fullName} 
//                   onChange={handleChange} 
//                   placeholder="Enter full legal name" 
//                   required 
//                 />
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="dateOfBirth">Date of Birth</Label>
//                 <Popover>
//                   <PopoverTrigger asChild>
//                     {/* <Button
//                       variant="outline"
//                       className="w-full justify-start text-left font-normal"
//                     >
//                       <CalendarIcon className="mr-2 h-4 w-4" />
//                       {formData.dateOfBirth ? format(formData.dateOfBirth, 'PPP') : 'Select date of birth'}
//                     </Button> */}
//                   </PopoverTrigger>
//                   {/* <PopoverContent className="w-auto p-0">
//                     <Calendar
//                       mode="single"
//                       selected={formData.dateOfBirth}
//                       onSelect={handleDateChange}
//                       initialFocus
//                     />
//                   </PopoverContent> */}
//                 </Popover>
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="organization">Organization *</Label>
//                 <Select 
//                   required
//                   onValueChange={handleOrganizationChange}
//                   value={formData.organizationId}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select organization" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {organizations.map(org => (
//                       <SelectItem key={org.id} value={org.id}>
//                         {org.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
              
//               <Button 
//                 type="button" 
//                 className="w-full mt-4"
//                 onClick={() => setActiveTab('identification')}
//               >
//                 Next: ID Documents
//               </Button>
//             </TabsContent>
            
//             <TabsContent value="identification" className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="nationalId">National ID</Label>
//                 <Input 
//                   id="nationalId" 
//                   name="nationalId" 
//                   value={formData.nationalId} 
//                   onChange={handleChange} 
//                   placeholder="Enter national ID number" 
//                 />
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="passportNumber">Passport Number</Label>
//                 <Input 
//                   id="passportNumber" 
//                   name="passportNumber" 
//                   value={formData.passportNumber} 
//                   onChange={handleChange} 
//                   placeholder="Enter passport number" 
//                 />
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="driversLicense">Driver`&apos;`s License</Label>
//                 <Input 
//                   id="driversLicense" 
//                   name="driversLicense" 
//                   value={formData.driversLicense} 
//                   onChange={handleChange} 
//                   placeholder="Enter driver's license number" 
//                 />
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="taxId">Tax ID</Label>
//                 <Input 
//                   id="taxId" 
//                   name="taxId" 
//                   value={formData.taxId} 
//                   onChange={handleChange} 
//                   placeholder="Enter tax ID number" 
//                 />
//               </div>
              
//               {!hasAtLeastOneId && (
//                 <div className="text-amber-600 bg-amber-50 p-3 rounded text-sm">
//                   At least one form of identification is recommended
//                 </div>
//               )}
              
//               <div className="flex justify-between gap-4 mt-4">
//                 <Button 
//                   type="button" 
//                   variant="outline"
//                   className="w-full" 
//                   onClick={() => setActiveTab('essential')}
//                 >
//                   Previous
//                 </Button>
//                 <Button 
//                   type="button" 
//                   className="w-full"
//                   onClick={() => setActiveTab('contact')}
//                 >
//                   Next: Contact Details
//                 </Button>
//               </div>
//             </TabsContent>
            
//             <TabsContent value="contact" className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="email">Email Address</Label>
//                 <Input 
//                   id="email" 
//                   name="email" 
//                   type="email"
//                   value={formData.email} 
//                   onChange={handleChange} 
//                   placeholder="Enter email address" 
//                 />
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="phone">Phone Number</Label>
//                 <Input 
//                   id="phone" 
//                   name="phone" 
//                   value={formData.phone} 
//                   onChange={handleChange} 
//                   placeholder="Enter phone number" 
//                 />
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="address">Address</Label>
//                 <Input 
//                   id="address" 
//                   name="address" 
//                   value={formData.address} 
//                   onChange={handleChange} 
//                   placeholder="Enter address" 
//                 />
//               </div>
              
//               <div className="flex justify-between gap-4 mt-4">
//                 <Button 
//                   type="button" 
//                   variant="outline"
//                   className="w-full" 
//                   onClick={() => setActiveTab('identification')}
//                 >
//                   Previous
//                 </Button>
//                 <Button 
//                   type="submit" 
//                   className="w-full"
//                   disabled={isSubmitting || !formData.fullName || !formData.organizationId}
//                 >
//                   {isSubmitting ? 'Submitting...' : 'Register Individual'}
//                 </Button>
//               </div>
//             </TabsContent>
//           </Tabs>
          
//           {submitStatus === 'success' && (
//             <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded">
//               <CheckCircle2 className="h-5 w-5" />
//               <span>Individual registered successfully!</span>
//             </div>
//           )}
          
//           {submitStatus === 'error' && (
//             <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded">
//               <AlertCircle className="h-5 w-5" />
//               <span>Failed to register individual. Please try again.</span>
//             </div>
//           )}
//         </form>
//       </CardContent>
//     </Card>
//   );
// }
import React from 'react'

const IndividualForm = () => {
  return (
    <div>IndividualForm</div>
  )
}

export default IndividualForm