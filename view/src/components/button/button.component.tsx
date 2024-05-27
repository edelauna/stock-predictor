import React from "react";

export const Button = ({
  onClick,
  children,
  disabled = false,
}: {
  onClick: () => void;
  children: React.ReactNode | string;
  disabled?: boolean;
}) => {
  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="flex items-center justify-center m-[10px]">
        {children}
      </div>
    </button>
  );
};
