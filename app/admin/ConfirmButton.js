'use client';

export default function ConfirmButton({ message, children }) {
  return (
    <button
      type="submit"
      className="a-btn danger"
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
