import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const UpdateProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [image, setImage] = useState();
  const [updateProduct, setUpdateProduct] = useState({
    id: null,
    name: "",
    description: "",
    brand: "",
    price: "",
    category: "",
    releaseDate: "",
    productAvailable: false,
    stockQuantity: "",
  });

  const [imageChanged, setImageChanged] = useState(false);
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/product/${id}`
        );

        setProduct(response.data);

        console.log(response.data,'update product response')
      
        const responseImage = await axios.get(
          `${baseUrl}/api/product/${id}/image`,
          { responseType: "blob" }
        );
       const imageFile = await converUrlToFile(responseImage.data,response.data.imageName)
        setImage(imageFile);     
        setUpdateProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    console.log("image Updated", image);
  }, [image]);

  const navigate = useNavigate();

  const converUrlToFile = async(blobData, fileName) => {
    const file = new File([blobData], fileName, { type: blobData.type });
    return file;
  }
 
  const handleSubmit = async(e) => {
    setLoading(true);
    e.preventDefault();
    console.log("images", image)
    console.log("productsdfsfsf", updateProduct)
    const updatedProduct = new FormData();
    if (imageChanged && image) {
      updatedProduct.append("imageFile", image);
    } else {
      // Send null or empty value when no image is selected by user
      updatedProduct.append("imageFile", null);
    }
    
    updatedProduct.append(
      "product",
      new Blob([JSON.stringify(updateProduct)], { type: "application/json" })
    );
  
  console.log("formData : ", updatedProduct)
    axios
      .put(`${baseUrl}/api/product/${id}`, updatedProduct, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log("Product updated successfully:", updatedProduct);
        toast.success("product updated successfully")
      })
      .catch((error) => {
        console.error("Error updating product:", error);
        console.log("product unsuccessfull update",updateProduct)
        toast.error("Failed to update product. Please try again.");
      }).finally(()=>{
        setLoading(false)
        navigate('/')
      }
      );
  };
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateProduct({
      ...updateProduct,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setImageChanged(true); // Mark that user has selected a new image
    }
  };
  
  if (!product.id) {
    return (
      <div className="container mt-5 pt-5">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
          <div className="spinner-border" style={{ color: "#111111" }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }
return (
  <>
    <style>
      {`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&display=swap');
        .luxury-serif { font-family: 'Playfair Display', serif; }

        .luxury-input { transition: all 0.4s ease; }
        .luxury-input:focus { border-color: #111111 !important; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }

        .luxury-btn { transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1); position: relative; z-index: 1; overflow: hidden; }
        .luxury-btn::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 100%; background-color: transparent; border: 1px solid #111111; z-index: -1; transform: translateY(100%); transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1); }
        .luxury-btn:hover:not(:disabled)::after { transform: translateY(0); }
        .luxury-btn:hover:not(:disabled) { color: #111111 !important; background: transparent !important; }
        .luxury-btn:active:not(:disabled) { transform: scale(0.98); }
      `}
    </style>

    <div style={{
      padding: "100px 6% 120px",
      background: "#FCFCFC", 
      minHeight: "100vh",
      fontFamily: "'Inter', -apple-system, sans-serif"
    }}>
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          
          {/* ✦ EDITORIAL HERO HEADER */}
          <div style={{ marginBottom: "48px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ width: "16px", height: "1px", background: "#C5A059" }}></span>
              <span style={{ fontSize: "10px", fontWeight: "600", color: "#C5A059", letterSpacing: "2px", textTransform: "uppercase" }}>
                Administration
              </span>
            </div>
            <h1 className="luxury-serif" style={{ fontSize: "44px", fontWeight: "400", letterSpacing: "-0.5px", color: "#111111", margin: 0 }}>
              Update Product<span style={{ color: "#C5A059", fontStyle: "italic" }}>.</span>
            </h1>
            <p style={{ marginTop: "12px", color: "#666666", fontSize: "14px", fontWeight: "400", letterSpacing: "0.5px", margin: 0 }}>
              Modify product details, pricing, and inventory for the collection.
            </p>
          </div>

          {/* ✦ LUXURY FORM CARD */}
          <div style={{
            background: "#FFFFFF",
            borderRadius: "0px",
            padding: "48px",
            border: "1px solid #EAEAEA",
            boxShadow: "0 20px 40px rgba(0,0,0,0.02)"
          }}>
            
            <form className="row g-4" noValidate validated={validated.toString()} onSubmit={handleSubmit}>
              
              {/* NAME */}
              <div className="col-md-6">
                <label htmlFor="name" style={{ fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px", display: "block" }}>
                  Product Name
                </label>
                <input
                  type="text"
                  className="luxury-input"
                  placeholder={product.name}
                  value={updateProduct.name}
                  onChange={handleChange}
                  name="name"
                  id="name"
                  required
                  style={{
                    width: "100%", padding: "16px", borderRadius: "0px",
                    border: `1px solid ${validated && errors.name ? '#D32F2F' : '#EAEAEA'}`,
                    background: "#FAFAFA", fontSize: "14px", color: "#111111", outline: "none"
                  }}
                />
                {errors.name && <div style={{ color: "#D32F2F", fontSize: "11px", marginTop: "8px", fontWeight: "500", letterSpacing: "0.5px" }}>{errors.name}</div>}
              </div>
              
              {/* BRAND */}
              <div className="col-md-6">
                <label htmlFor="brand" style={{ fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px", display: "block" }}>
                  Brand
                </label>
                <input
                  type="text"
                  className="luxury-input"
                  name="brand"
                  placeholder={product.brand}
                  value={updateProduct.brand}
                  onChange={handleChange}
                  id="brand"
                  required
                  style={{
                    width: "100%", padding: "16px", borderRadius: "0px",
                    border: `1px solid ${validated && errors.brand ? '#D32F2F' : '#EAEAEA'}`,
                    background: "#FAFAFA", fontSize: "14px", color: "#111111", outline: "none"
                  }}
                />
                {errors.brand && <div style={{ color: "#D32F2F", fontSize: "11px", marginTop: "8px", fontWeight: "500", letterSpacing: "0.5px" }}>{errors.brand}</div>}
              </div>
              
              {/* DESCRIPTION */}
              <div className="col-12">
                <label htmlFor="description" style={{ fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px", display: "block" }}>
                  Description
                </label>
                <textarea
                  className="luxury-input"
                  placeholder={product.description}
                  value={updateProduct.description}
                  name="description"
                  onChange={handleChange}
                  id="description"
                  rows="4"
                  required
                  style={{
                    width: "100%", padding: "16px", borderRadius: "0px",
                    border: `1px solid ${validated && errors.description ? '#D32F2F' : '#EAEAEA'}`,
                    background: "#FAFAFA", fontSize: "14px", color: "#111111", outline: "none", resize: "vertical"
                  }}
                />
                {errors.description && <div style={{ color: "#D32F2F", fontSize: "11px", marginTop: "8px", fontWeight: "500", letterSpacing: "0.5px" }}>{errors.description}</div>}
              </div>
              
              {/* PRICE */}
              <div className="col-md-4">
                <label htmlFor="price" style={{ fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px", display: "block" }}>
                  Price (₹)
                </label>
                <div style={{
                  display: "flex", alignItems: "center", background: "#FAFAFA", borderRadius: "0px",
                  border: `1px solid ${validated && errors.price ? '#D32F2F' : '#EAEAEA'}`, padding: "0 16px", transition: "border-color 0.4s ease"
                }} className="luxury-input">
                  <span className="luxury-serif" style={{ fontSize: "16px", color: "#111111" }}>₹</span>
                  <input
                    type="number"
                    onChange={handleChange}
                    value={updateProduct.price}
                    placeholder={product.price}
                    name="price"
                    id="price"
                    min="0.01"
                    step="0.01"
                    required
                    style={{
                      width: "100%", padding: "16px 8px", border: "none", background: "transparent",
                      fontSize: "14px", color: "#111111", outline: "none"
                    }}
                  />
                </div>
                {errors.price && <div style={{ color: "#D32F2F", fontSize: "11px", marginTop: "8px", fontWeight: "500", letterSpacing: "0.5px" }}>{errors.price}</div>}
              </div>
              
              {/* CATEGORY */}
              <div className="col-md-4">
                <label htmlFor="category" style={{ fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px", display: "block" }}>
                  Category
                </label>
                <select
                  className="luxury-input"
                  value={updateProduct.category}
                  onChange={handleChange}
                  name="category"
                  id="category"
                  required
                  style={{
                    width: "100%", padding: "16px", borderRadius: "0px",
                    border: `1px solid ${validated && errors.category ? '#D32F2F' : '#EAEAEA'}`,
                    background: "#FAFAFA", fontSize: "14px", color: "#111111", outline: "none", cursor: "pointer",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111111%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                    backgroundRepeat: "no-repeat", backgroundPosition: "right 16px top 50%", backgroundSize: "10px auto"
                  }}
                >
                  <option value="">Select category</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Headphone">Headphone</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Toys">Toys</option>
                  <option value="Fashion">Fashion</option>
                </select>
                {errors.category && <div style={{ color: "#D32F2F", fontSize: "11px", marginTop: "8px", fontWeight: "500", letterSpacing: "0.5px" }}>{errors.category}</div>}
              </div>

              {/* STOCK QUANTITY */}
              <div className="col-md-4">
                <label htmlFor="stockQuantity" style={{ fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px", display: "block" }}>
                  Stock Qty
                </label>
                <input
                  type="number"
                  className="luxury-input"
                  onChange={handleChange}
                  placeholder={product.stockQuantity}
                  value={updateProduct.stockQuantity}
                  name="stockQuantity"
                  id="stockQuantity"
                  min="0"
                  required
                  style={{
                    width: "100%", padding: "16px", borderRadius: "0px",
                    border: `1px solid ${validated && errors.stockQuantity ? '#D32F2F' : '#EAEAEA'}`,
                    background: "#FAFAFA", fontSize: "14px", color: "#111111", outline: "none"
                  }}
                />
                {errors.stockQuantity && <div style={{ color: "#D32F2F", fontSize: "11px", marginTop: "8px", fontWeight: "500", letterSpacing: "0.5px" }}>{errors.stockQuantity}</div>}
              </div>
              
              {/* RELEASE DATE */}
              <div className="col-md-6">
                <label htmlFor="releaseDate" style={{ fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px", display: "block" }}>
                  Release Date
                </label>
                <input
                  type="date"
                  className="luxury-input"
                  value={updateProduct.releaseDate ? updateProduct.releaseDate.slice(0,10) : ''}
                  name="releaseDate"
                  onChange={handleChange}
                  id="releaseDate"
                  required
                  style={{
                    width: "100%", padding: "16px", borderRadius: "0px",
                    border: `1px solid ${validated && errors.releaseDate ? '#D32F2F' : '#EAEAEA'}`,
                    background: "#FAFAFA", fontSize: "14px", color: "#111111", outline: "none", letterSpacing: "1px"
                  }}
                />
                {errors.releaseDate && <div style={{ color: "#D32F2F", fontSize: "11px", marginTop: "8px", fontWeight: "500", letterSpacing: "0.5px" }}>{errors.releaseDate}</div>}
              </div>
              
              {/* IMAGE */}
              <div className="col-md-6">
                <label htmlFor="imageFile" style={{ fontSize: "10px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px", display: "block" }}>
                  Product Image
                </label>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  {image && (
                    <div style={{
                      width: "60px", height: "60px", background: "#F8F8F8", borderRadius: "0px",
                      display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden",
                      border: "1px solid #EAEAEA", flexShrink: 0
                    }}>
                      <img
                        src={image ? URL.createObjectURL(image) : ""}
                        alt={product.name}
                        style={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain" }}
                      />
                    </div>
                  )}
                  <div style={{ flexGrow: 1 }}>
                    <input
                      type="file"
                      className="luxury-input"
                      onChange={handleImageChange}
                      id="imageFile"
                      accept="image/png, image/jpeg"
                      style={{
                        width: "100%", padding: "13px 16px", borderRadius: "0px",
                        border: `1px solid ${validated && errors.image ? '#D32F2F' : '#EAEAEA'}`,
                        background: "#FAFAFA", fontSize: "12px", color: "#666666", outline: "none", cursor: "pointer"
                      }}
                    />
                    <div style={{ fontSize: "10px", color: "#999999", marginTop: "8px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "1px" }}>
                      Leave empty to keep current image
                    </div>
                  </div>
                </div>
                {errors.image && <div style={{ color: "#D32F2F", fontSize: "11px", marginTop: "8px", fontWeight: "500", letterSpacing: "0.5px" }}>{errors.image}</div>}
              </div>
              
              {/* PRODUCT AVAILABLE (CHECKBOX) */}
              <div className="col-12" style={{ marginTop: "24px" }}>
                <div style={{ 
                  display: "flex", alignItems: "center", gap: "16px", background: "transparent",
                  padding: "16px 0", borderBottom: "1px solid #EAEAEA"
                }}>
                  <input
                    type="checkbox"
                    name="productAvailable"
                    id="productAvailable"
                    checked={updateProduct.productAvailable}
                    onChange={(e) =>
                      setUpdateProduct({ ...updateProduct, productAvailable: e.target.checked })
                    }
                    style={{
                      width: "20px", height: "20px", cursor: "pointer", accentColor: "#111111"
                    }}
                  />
                  <label htmlFor="productAvailable" style={{ fontSize: "12px", fontWeight: "600", color: "#111111", cursor: "pointer", margin: 0, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                    Product is available for sale
                  </label>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="col-12" style={{ marginTop: "48px", display: "flex", gap: "16px" }}>
                
                {loading ? (
                  <button
                    type="button"
                    disabled
                    style={{
                      padding: "16px 32px", borderRadius: "0px", border: "1px solid #EAEAEA",
                      background: "#FAFAFA", color: "#999999", fontSize: "11px", fontWeight: "600",
                      textTransform: "uppercase", letterSpacing: "1.5px", display: "flex", alignItems: "center", gap: "12px"
                    }}
                  >
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: "12px", height: "12px" }}></span>
                    Updating...
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className="luxury-btn"
                    style={{
                      padding: "16px 40px", borderRadius: "0px", border: "1px solid #111111",
                      background: "#111111", color: "#FFFFFF", fontSize: "11px", fontWeight: "600",
                      textTransform: "uppercase", letterSpacing: "1.5px", cursor: "pointer"
                    }}
                  >
                    Update Product
                  </button>
                )}
                
                <button 
                  type="button" 
                  onClick={() => navigate('/')}
                  style={{
                    padding: "16px 40px", borderRadius: "0px", border: "1px solid #EAEAEA",
                    background: "transparent", color: "#111111", fontSize: "11px", fontWeight: "600",
                    textTransform: "uppercase", letterSpacing: "1.5px", cursor: "pointer", transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#111111";
                    e.target.style.color = "#FFFFFF";
                    e.target.style.borderColor = "#111111";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.color = "#111111";
                    e.target.style.borderColor = "#EAEAEA";
                  }}
                  onMouseDown={(e) => e.target.style.transform = "scale(0.96)"}
                  onMouseUp={(e) => e.target.style.transform = "scale(1)"}
                >
                  Cancel
                </button>

              </div>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  </>
);
};

export default UpdateProduct;