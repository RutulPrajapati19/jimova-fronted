import React, { useState, useEffect } from "react";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import AddProduct from "./components/AddProduct";
import Product from "./components/Product";
import UpdateProduct from "./components/UpdateProduct";
import Order from "./components/Order";
import SearchResults from "./components/SearchResults";
import Auth from "./components/Auth";
import OrderSuccess from "./components/OrderSuccess";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import AdminPanel from "./components/AdminPanel";
import AdminLogin from "./components/AdminLogin";
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { ToastContainer } from "react-toastify";
import PaymentSuccess from "./pages/PaymentSuccess";

const pingBackend = () => {
  fetch("https://jimova-backend-1.onrender.com/api/products").catch(() => {});
};

// Reactive hook — re-reads localStorage whenever storage event fires
const useUserRole = () => {
  const [role, setRole] = useState(() => localStorage.getItem("userRole"));

  useEffect(() => {
    const sync = () => setRole(localStorage.getItem("userRole"));
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return role;
};

// Protects /admin — redirects to /admin/login if not ADMIN
const AdminRoute = ({ children }) => {
  const role = useUserRole();
  if (role !== "ADMIN") return <Navigate to="/admin/login" replace />;
  return children;
};

// If already logged in as ADMIN, skip /admin/login
const AdminLoginRoute = ({ children }) => {
  const role = useUserRole();
  if (role === "ADMIN") return <Navigate to="/admin" replace />;
  return children;
};

const Layout = ({ selectedCategory, onSelectCategory }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar onSelectCategory={onSelectCategory} />}
      <div className={isAdmin ? "" : "min-vh-100 bg-light"}>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/" element={<Home selectedCategory={selectedCategory} />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Order />} />
          <Route path="/search-results" element={<SearchResults />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />

          {/* Legacy routes */}
          <Route path="/add_product" element={<AddProduct />} />
          <Route path="/product/update/:id" element={<UpdateProduct />} />

          {/* ── Admin routes ── */}
          <Route
            path="/admin/login"
            element={
              <AdminLoginRoute>
                <AdminLogin />
              </AdminLoginRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
};

function App() {
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    pingBackend();
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer autoClose={2000} hideProgressBar={true} />
      <Layout
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />
    </BrowserRouter>
  );
}

export default App;