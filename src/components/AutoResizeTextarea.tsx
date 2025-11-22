import React, { useEffect, useRef } from "react";

interface AutoResizeTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onSubmit?: () => void;
}

function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  className,
  autoFocus,
  onSubmit,
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (onSubmit) {
        onSubmit();
      }
    }
  };

  useEffect(() => {
    handleInput();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      autoFocus={autoFocus}
      rows={1}
    />
  );
}

export default AutoResizeTextarea;

