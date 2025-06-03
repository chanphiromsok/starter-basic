import { FieldApi } from "@tanstack/react-form";
import React from "react";
import { cn } from "~/utils/tw";

interface TextControllerProps {
  field: FieldApi<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >;
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  disabled?: boolean;
  required?: boolean;
  className?: string;
  labelClassName?: string;
}

const TextController: React.FC<TextControllerProps> = ({
  field,
  label,
  placeholder,
  type = "text",
  disabled = false,
  required = false,
  className,
  labelClassName,
}) => {
  const isError = field.state.meta.errors.length > 0;
  const isDirty = field.state.meta.isDirty;

  return (
    <div className="w-full">
      <div
        className={cn(
          "border rounded-xl w-full transition-colors",
          // Reduced padding for more compact design
          "px-3 py-2 sm:px-3 sm:py-2",
          "border-border dark:border-dark-border",
          isError && "border-error",
          "focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary"
        )}
      >
        {/* Label */}
        {label && (
          <label
            htmlFor={field.name}
            className={cn(
              "block font-medium text-sm text-text-primary dark:text-dark-primary",
              isError && "text-error",
              isDirty && "text-brand-primary",
              labelClassName
            )}
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        {/* Input */}
        <input
          id={field.name}
          name={field.name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          value={field.state.value || ""}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          className={cn(
            "w-full p-0 border-none outline-none bg-transparent",
            // Smaller, more compact input
            "min-h-[32px]", // Reduced from 44px/40px
            "text-sm", // Consistent text size
            "text-text-primary dark:text-dark-primary font-medium",
            "placeholder:text-text-secondary dark:placeholder:text-dark-secondary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
        />
      </div>

      {/* Error Message Container - Reduced space */}
      <div className="mt-1 min-h-[1rem]">
        {" "}
        {/* Reduced from mt-2 and min-h-[1.25rem] */}
        {isError && (
          <div className="text-xs text-error">
            {" "}
            {/* Reduced from text-sm */}
            {field.state.meta.errors[0]?.message || field.state.meta.errors[0]}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextController;
