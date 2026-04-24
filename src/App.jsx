import React, { useState } from "react";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import AddProduct from "./components/AddProduct";
import Product from "./components/Product";
import UpdateProduct from "./components/UpdateProduct";
import Order from "./components/Order";
import SearchResults from "./components/SearchResults";
import Auth from "./components/Auth"; // ✦ ADDED: Imported the Auth component ✦
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { ToastContainer } from "react-toastify";

function App() {
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <BrowserRouter>
      {/* react-toastify global container */}
      <ToastContainer autoClose={2000} hideProgressBar={true} />
      
      <Navbar onSelectCategory={handleCategorySelect} />

      <div className="min-vh-100 bg-light">
        <Routes>
          <Route path="/" element={<Home selectedCategory={selectedCategory} />} />
          <Route path="/add_product" element={<AddProduct />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/product/update/:id" element={<UpdateProduct />} />
          <Route path="/orders" element={<Order />} />
          <Route path="/search-results" element={<SearchResults />} />
          
          {/* ✦ ADDED: The missing route that connects your Navbar to the Auth page ✦ */}
          <Route path="/login" element={<Auth />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;