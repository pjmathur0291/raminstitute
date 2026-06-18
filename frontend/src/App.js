import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "@/components/PublicLayout";
import HomePage from "@/pages/Home";
import AboutPage from "@/pages/About";
import CoursesPage from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import PlacementsPage from "@/pages/Placements";
import ScholarshipsPage from "@/pages/Scholarships";
import CampusLifePage from "@/pages/CampusLife";
import GalleryPage from "@/pages/Gallery";
import BlogPage from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import ContactPage from "@/pages/Contact";
import ApplyPage from "@/pages/Apply";

import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminLeads from "@/pages/admin/AdminLeads";
import AdminCourses from "@/pages/admin/AdminCourses";
import AdminBlog from "@/pages/admin/AdminBlog";
import AdminApplications from "@/pages/admin/AdminApplications";

import { initAnalytics } from "@/lib/analytics";

function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <p className="text-gold-600 uppercase tracking-widest text-xs font-bold">404</p>
      <h1 className="font-display text-5xl font-bold text-burgundy-700 mt-2 mb-4">Page not found</h1>
      <p className="text-gray-600 mb-6">The page you're looking for has moved or doesn't exist.</p>
      <a href="/" className="btn-burgundy">Go to Homepage</a>
    </div>
  );
}

function Privacy() {
  return (
    <div className="container-x py-20 max-w-3xl prose">
      <h1 className="font-display text-4xl font-bold text-burgundy-700 mb-4">Privacy Policy</h1>
      <p className="text-gray-700">RIHM respects your privacy. Information you submit through our forms is used solely for admissions counselling, scholarship eligibility checks and academic communication. We do not sell your data. Contact admissions@ram.institute to request data deletion.</p>
    </div>
  );
}
function Terms() {
  return (
    <div className="container-x py-20 max-w-3xl prose">
      <h1 className="font-display text-4xl font-bold text-burgundy-700 mb-4">Terms of Use</h1>
      <p className="text-gray-700">By using this website you agree to receive admissions communication via call, SMS, WhatsApp and email from Shri Ram Institute of Hotel Management Dehradun, overriding any DND/NDNC registry. Content on this website is © RIHM.</p>
    </div>
  );
}

export default function App() {
  useEffect(() => { initAnalytics(); }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:slug" element={<CourseDetail />} />
            <Route path="/placements" element={<PlacementsPage />} />
            <Route path="/scholarships" element={<ScholarshipsPage />} />
            <Route path="/campus-life" element={<CampusLifePage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/apply" element={<ApplyPage />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="blog" element={<AdminBlog />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}
