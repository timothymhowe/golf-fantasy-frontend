import './floating-text-styles.css';

const FloatingText = ({ children, className = "" }) => {
  return (
    <div className={`floating-text ${className}`}>
      {children}
    </div>
  );
};

export default FloatingText;