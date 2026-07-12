import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

const TourList = lazy(() => import("./pages/TourList"));
const TourDetail = lazy(() => import("./pages/TourDetail"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const CreateTour = lazy(() => import("./pages/CreateTour"));

function PageSkeleton() {
  return (
    <div className="pt-24 pb-20">
      <div className="mx-auto max-w-6xl animate-pulse px-4 lg:px-6">
        <div className="mb-6 h-8 w-48 rounded bg-gray-200" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-primary-100 bg-white p-5">
              <div className="mb-2 h-5 w-3/4 rounded bg-gray-200" />
              <div className="mb-2 h-4 w-1/2 rounded bg-gray-200" />
              <div className="mb-4 h-4 w-2/3 rounded bg-gray-200" />
              <div className="flex justify-between">
                <div className="h-5 w-24 rounded bg-gray-200" />
                <div className="h-5 w-20 rounded-full bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-light">
          <Navbar />
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route path="/" element={<TourList />} />
              <Route path="/tours/:id" element={<TourDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/tours/new" element={<AdminRoute><CreateTour /></AdminRoute>} />
            </Routes>
          </Suspense>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
