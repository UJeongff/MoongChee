import "./Category.css";

const Category = ({ categoryName, isSelected, onClick }) => {
  return (
    <div
      className={`category-item ${isSelected ? "selected" : ""}`}
      onClick={onClick}
    >
      {categoryName}
    </div>
  );
};

export default Category;
