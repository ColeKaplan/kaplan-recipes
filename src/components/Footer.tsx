import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 px-6">
      <div className="container mx-auto flex items-center justify-between flex-wrap">
        {/* Website Name */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold tracking-wide">Kaplan Family Recipes</h1>
        </div>
        {/* Web Info */}
        <div className="text-sm">
          <p>Developed by Cole Kaplan</p>
          <p>Est. 2026</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
