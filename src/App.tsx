import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import AISummary from "./pages/AISummary";
import Education from "./pages/Education";
import Health from "./pages/Health";
import Admin from "./pages/Admin";
import AdminManagement from "./pages/AdminManagement";
import Certificates from "./pages/Certificates";
import CertificateVerification from "./pages/CertificateVerification";
import CourseManagement from "./pages/CourseManagement";
import CourseDetail from "./pages/CourseDetail";
import LessonView from "./pages/LessonView";
import Community from "./pages/Community";
import Nutrition from "./pages/Nutrition";
import Settings from "./pages/Settings";
import Subscription from "./pages/Subscription";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="ai-summary" element={<AISummary />} />
            <Route path="education" element={<Education />} />
            <Route path="health" element={<Health />} />
            <Route path="nutrition" element={<Nutrition />} />
            <Route path="community" element={<Community />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="settings" element={<Settings />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="certificate-verification" element={<CertificateVerification />} />
            <Route path="course-management" element={<CourseManagement />} />
            <Route path="course/:slug" element={<CourseDetail />} />
            <Route path="lesson/:lessonId" element={<LessonView />} />
            <Route path="admin" element={<Admin />} />
            <Route path="admin/manage" element={<AdminManagement />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
