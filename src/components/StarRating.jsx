const StarRating = ({ value = 0, onChange = null, size = 20 }) => {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onChange && onChange(star)}
          style={{
            fontSize: size,
            cursor: onChange ? "pointer" : "default",
            color: star <= value ? "#F59E0B" : "#D1D5DB",
            lineHeight: 1,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => onChange && (e.target.style.color = "#F59E0B")}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;