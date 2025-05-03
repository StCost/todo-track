import { useState, useEffect, useRef } from 'react';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  placeholder?: string;
}

const EditableText = ({ 
  value, 
  onSave, 
  className = "", 
  placeholder = "Enter text...",
}: EditableTextProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (text.trim()) {
      onSave(text.trim());
    } else {
      setText(value);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setText(value);
    }
  };

  return isEditing ? (
    <input
      ref={inputRef}
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`px-1 py-0.5 bg-transparent border border-blue-400 focus:outline-none rounded shadow-[0_0_5px_rgba(59,130,246,0.5)] ${className}`}
      placeholder={placeholder}
    />
  ) : (
    <div
      onClick={handleClick}
      className={`px-1 py-0.5 cursor-pointer hover:text-blue-500 ${className}`}
    >
      {value}
    </div>
  );
};

export default EditableText; 