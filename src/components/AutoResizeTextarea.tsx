import React, { useEffect, useRef, useState } from "react";

interface AutoResizeTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onSubmit?: () => void;
  disabled?: boolean;
}

function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  className,
  autoFocus,
  onSubmit,
  disabled,
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(hasTouch && isSmallScreen);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isMobile) {
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
      disabled={disabled}
      rows={1}
    />
  );
}

export default AutoResizeTextarea;
