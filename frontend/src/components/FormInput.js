// src/components/FormInput.js
import React from "react";

export default function FormInput({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  className = "",
}) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-gray-300 mb-1">{label}</div>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={
          "w-full px-4 py-3 rounded-xl2 border border-transparent bg-gray-900/40 placeholder-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition " +
          className
        }
      />
      {error && <div className="text-sm mt-2 text-red-400">{error}</div>}
    </label>
  );
}
