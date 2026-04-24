import React from "react";

const categories = [
  { name: "All", icon: "🛍️" },
  { name: "Laptop", icon: "💻" },
  { name: "Mobile", icon: "📱" },
  { name: "Electronics", icon: "🔌" },
  { name: "Headphone", icon: "🎧" },
  { name: "Audio", icon: "🔊" },
  { name: "Toys", icon: "🧸" },
  { name: "Fashion", icon: "👕" },
  { name: "Grocery", icon: "🍎" }
];

const CategoryBar = ({ onSelectCategory, activeCategory }) => {
  return (
    <div 
      className="d-flex gap-4 py-4 px-2" 
      style={{ overflowX: "auto", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
    >
      <style>
        {`
          .jimova-category-card { transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1); border: 1px solid #EAEAEA; background: transparent; }
          .jimova-category-wrapper:hover .jimova-category-card { border-color: #111111; transform: translateY(-4px); }
          .jimova-category-wrapper:active .jimova-category-card { transform: scale(0.96) translateY(0); }
          .d-flex::-webkit-scrollbar { display: none; }
        `}
      </style>

      {categories.map((cat, index) => {
        const isActive = activeCategory === cat.name;
        
        return (
          <div
            key={index}
            className="text-center jimova-category-wrapper"
            style={{ minWidth: "90px", cursor: "pointer" }}
            onClick={() => onSelectCategory(cat.name)}
          >
            <div
              className="jimova-category-card d-flex align-items-center justify-content-center"
              style={{ 
                height: "80px", width: "80px", fontSize: "28px", margin: "0 auto", borderRadius: "0px",
                borderColor: isActive ? "#111111" : "#EAEAEA",
                background: isActive ? "#111111" : "transparent"
              }}
            >
              <span style={{ opacity: isActive ? 0.9 : 1, filter: isActive ? "grayscale(1) contrast(2)" : "none" }}>{cat.icon}</span>
            </div>
            <small 
              className="d-block mt-3" 
              style={{ 
                fontWeight: isActive ? "600" : "500", 
                color: isActive ? "#111111" : "#888888",
                fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", transition: "color 0.3s ease" 
              }}
            >
              {cat.name}
            </small>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryBar;