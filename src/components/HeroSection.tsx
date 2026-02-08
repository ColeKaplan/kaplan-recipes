import React from "react";
import SearchBar from "./SearchBar";

const HeroSection: React.FC = () => {

  const scrollDown = () => {
    window.scrollTo({
      top: window.innerHeight - 64,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center  min-h-screen bg-hero-background bg-cover bg-center bg-no-repeat">
      {/* Web Name */}
      <div className="text-white text-center md:block hidden md:mt-6">
        <h1 className="text-7xl font-bold">Search</h1>
        {/* <h1 className="text-2xl font-semibold">Your Best Cooking Companion</h1> */}
      </div>
      <SearchBar />

      {/* Scroll Down Indicator */}
      <button
        onClick={scrollDown}
        className="absolute bottom-6 flex flex-col items-center text-white opacity-80 hover:opacity-100 transition animate-bounce"
        aria-label="Scroll for more"
      >
        <span className="text-sm tracking-wide mb-1">Explore</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>
  );
};

export default HeroSection;
