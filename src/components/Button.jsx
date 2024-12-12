import "./Button.css";

const Button = ({ text, onClick, isSelected }) => {
  return (
    <button
      onClick={onClick}
      className={`Button ${isSelected ? "selected" : ""}`}
    >
      {text}
    </button>
  );
};

export default Button;
