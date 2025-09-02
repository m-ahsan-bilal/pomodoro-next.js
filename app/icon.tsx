// app/icon.tsx
export default function Icon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-indigo-600 bg-white rounded-full p-1 shadow-lg"
    >
      {/* Clock circle */}
      <circle cx="12" cy="12" r="9" />

      {/* Clock hands */}
      <line x1="12" y1="12" x2="12" y2="8" />
      <line x1="12" y1="12" x2="15" y2="12" />

      {/* Productivity checkmark */}
      <path d="M9 16l2 2 4-4" stroke="green" strokeWidth="2.5" />
    </svg>
  );
}
