/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, FolderPlus, Upload, CheckCircle, Search, Clock, Shield, Database, Bell, Menu, X, ChevronDown } from "lucide-react";
import Footer from "@/components/common/Footer";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  // Process steps for document management
  const processSteps = [
    {
      title: "User Registration",
      description: "Register Members details including enrollment number, department, course, and personal information",
      icon: <FileText size={40} className="text-blue-600" />,
      action: "Register"
    },
    {
      title: "Document Organization",
      description: "Automatic creation of a secure dedicated folder structure for each student to streamline document access",
      icon: <FolderPlus size={40} className="text-emerald-600" />,
      action: "Organize"
    },
    {
      title: "Secure Upload",
      description: "Upload and encrypt important student documents including ID proof, certificates, and academic records",
      icon: <Upload size={40} className="text-indigo-600" />,
      action: "Upload"
    },
    {
      title: "Verification System",
      description: "Multi-step verification by department administrators to ensure document authenticity and compliance",
      icon: <CheckCircle size={40} className="text-amber-600" />,
      action: "Verify"
    },
    {
      title: "Access Controls",
      description: "Granular role-based permissions to control who can view, download or modify  documents",
      icon: <Shield size={40} className="text-violet-600" />,
      action: "Manage"
    },
    {
      title: "Status Tracking",
      description: "Comprehensive tracking system with notifications for pending, upcoming and expired documents",
      icon: <Clock size={40} className="text-rose-600" />,
      action: "Track"
    }
  ];

  // Key features with improved descriptions
  const keyFeatures = [
    {
      title: "Enterprise-Grade Security",
      description: "AES-256 encryption for all stored documents with multi-factor authentication",
      icon: <Shield className="text-blue-600 flex-shrink-0" size={20} />
    },
    {
      title: "Role-Based Access Control",
      description: "Granular permission system with customizable access levels for different departments",
      icon: <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
    },
    {
      title: "Smart Notifications",
      description: "Automated alerts for document expiration, pending approvals, and status changes",
      icon: <Bell className="text-amber-600 flex-shrink-0" size={20} />
    },
    {
      title: "Advanced Search",
      description: "Full-text search capabilities across all document metadata and content",
      icon: <Search className="text-indigo-600 flex-shrink-0" size={20} />
    },
    {
      title: "Document Versioning",
      description: "Complete revision history with the ability to restore previous versions",
      icon: <Database className="text-violet-600 flex-shrink-0" size={20} />
    },
    {
      title: "Comprehensive Audit Trail",
      description: "Detailed logs of all document activities for compliance and security",
      icon: <Clock className="text-rose-600 flex-shrink-0" size={20} />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Enhanced Navbar */}
      <nav className="border-b border-gray-200 bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                  <FileText size={20} className="text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">DocManager<span className="text-blue-600">Pro</span></span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            {/* <div className="hidden md:flex items-center">
              <div className="flex space-x-2">
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    className="text-gray-700 px-3 py-2 flex items-center"
                    onClick={() => toggleDropdown('features')}
                  >
                    Features
                    <ChevronDown size={16} className={`ml-1 transform transition-transform ${activeDropdown === 'features' ? 'rotate-180' : ''}`} />
                  </Button>
                  {activeDropdown === 'features' && (
                    <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600">Secure Document Storage</Link>
                        <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600">Advanced Access Control</Link>
                        <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600">Automated Notifications</Link>
                        <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600">Compliance Reports</Link>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    className="text-gray-700 px-3 py-2 flex items-center"
                    onClick={() => toggleDropdown('solutions')}
                  >
                    Solutions
                    <ChevronDown size={16} className={`ml-1 transform transition-transform ${activeDropdown === 'solutions' ? 'rotate-180' : ''}`} />
                  </Button>
                  {activeDropdown === 'solutions' && (
                    <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600">Academic Institutions</Link>
                        <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600">Enterprise Organizations</Link>
                        <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600">Government Agencies</Link>
                        <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600">Healthcare Facilities</Link>
                      </div>
                    </div>
                  )}
                </div>
                
                <Button variant="ghost" className="text-gray-700 px-3 py-2">About</Button>
                <Button variant="ghost" className="text-gray-700 px-3 py-2">Contact</Button>
              </div>
            </div> */}

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="default" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-medium">
                  Request Demo
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white pb-3 px-4">
            {/* <div className="space-y-1 pt-2 pb-3">
              <div>
                <Button 
                  variant="ghost" 
                  className="w-full text-left flex justify-between items-center px-3 py-2 text-gray-700"
                  onClick={() => toggleDropdown('mobileFeatures')}
                >
                  Features
                  <ChevronDown size={16} className={`transform transition-transform ${activeDropdown === 'mobileFeatures' ? 'rotate-180' : ''}`} />
                </Button>
                {activeDropdown === 'mobileFeatures' && (
                  <div className="pl-6 space-y-1">
                    <Link href="#" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Secure Document Storage</Link>
                    <Link href="#" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Advanced Access Control</Link>
                    <Link href="#" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Automated Notifications</Link>
                    <Link href="#" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Compliance Reports</Link>
                  </div>
                )}
              </div>
              
              <div>
                <Button 
                  variant="ghost" 
                  className="w-full text-left flex justify-between items-center px-3 py-2 text-gray-700"
                  onClick={() => toggleDropdown('mobileSolutions')}
                >
                  Solutions
                  <ChevronDown size={16} className={`transform transition-transform ${activeDropdown === 'mobileSolutions' ? 'rotate-180' : ''}`} />
                </Button>
                {activeDropdown === 'mobileSolutions' && (
                  <div className="pl-6 space-y-1">
                    <Link href="#" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Academic Institutions</Link>
                    <Link href="#" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Enterprise Organizations</Link>
                    <Link href="#" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Government Agencies</Link>
                    <Link href="#" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Healthcare Facilities</Link>
                  </div>
                )}
              </div>
              
              <Button variant="ghost" className="w-full text-left px-3 py-2 text-gray-700">About</Button>
              <Button variant="ghost" className="w-full text-left px-3 py-2 text-gray-700">Contact</Button>
            </div> */}
            <div className="pt-4 pb-2 border-t border-gray-200 flex flex-col space-y-2">
              <Link href="/auth/login">
                <Button variant="ghost" className="w-full justify-center">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="default" className="w-full justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Request Demo
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-16">
        <div className="space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-8">
            <div className="inline-block mb-2">
              {/* <span className="bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-sm font-medium">Enterprise Solution</span> */}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl bg-clip-text sm:pb-2 text-transparent bg-gradient-to-r from-gray-900 to-gray-700 leading-tight">
              Secure Document Management <br className="hidden sm:inline z-50" />System
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Streamline document workflows with our enterprise-grade. <br className="hidden sm:inline" />  Secure, compliant, and efficient.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-6">
              <Link href="/auth/register">
              <Button size="lg" className="text-lg w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Schedule a Demo
              </Button>
              </Link>
              {/* <Link href="/tour" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="text-lg w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                  Take a Tour
                </Button>
              </Link> */}
            </div>
          </div>

          {/* Process Flow Section */}
          <div className="bg-gradient-to-b from-white to-gray-50 py-12 rounded-2xl shadow-sm">
            <div className="text-center mb-12">
              <span className="bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-sm font-medium">Simplified Workflow</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-4">Intelligent Document Management</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Our enterprise platform streamlines document processing with a secure, intuitive workflow
              </p>
            </div>

            {/* Process Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
              {processSteps.map((step, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-all border-gray-200 group">
                  <CardHeader className="pb-2 bg-gradient-to-b from-gray-50 to-white">
                    <div className="flex justify-center mb-4 transform group-hover:scale-110 transition-transform">{step.icon}</div>
                    <CardTitle className="text-xl text-center">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-center text-base min-h-16">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="flex justify-center pb-6">
                    {/* <Button variant="secondary" size="sm" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {step.action}
                    </Button> */}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white shadow-sm rounded-2xl p-12 border border-gray-100">
            <div className="text-center mb-12">
              <span className="bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full text-sm font-medium">Enterprise Features</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-4">Powerful Capabilities</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Comprehensive tools for efficient, secure, and compliant document management
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {keyFeatures.map((feature, i) => (
                <div key={i} className="flex gap-4 p-6 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="mt-1">{feature.icon}</div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* <div className="flex justify-center mt-10">
              <Link href="/features">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  View All Features
                </Button>
              </Link>
            </div> */}
          </div>
          
          {/* CTA Section */}
          {/* <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to transform your document management?</h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
              Join leading institutions that have streamlined their document processes, 
              improved security, and enhanced compliance with DocManagerPro.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Request Demo
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-blue-700">
                Contact Sales
              </Button>
            </div>
          </div> */}
        </div>
      </main>

      {/* Footer */}
      <Footer/>
    </div>
  );
}