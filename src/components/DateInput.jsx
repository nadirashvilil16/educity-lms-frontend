import { useState } from "react";

// native <input type="date"> can't show a custom placeholder, so we render as
// text (with our own placeholder) until focused, then swap to a real date field
export function DateInput({ value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  const showAsDate = focused || value;

  return (
    <input
      type={showAsDate ? "date" : "text"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}
