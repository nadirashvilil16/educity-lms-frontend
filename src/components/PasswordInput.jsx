import { useState } from "react";

export function PasswordInput({ value, onChange, placeholder }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-input auth-input--password">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />
      <button type="button" className="auth-input__eye" onClick={() => setVisible((v) => !v)} aria-label="toggle password visibility">
        {visible ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
            <line x1="3" y1="21" x2="21" y2="3" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        )}
      </button>
    </div>
  );
}
