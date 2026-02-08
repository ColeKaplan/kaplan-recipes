import React from "react";
import MealType from "../components/MealType";
import HeroSection from "../components/HeroSection";
import PopularFoods from "../components/PopularFoods";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const Home: React.FC = () => {
  return (
    <>
      <NavBar />
      <HeroSection />
      <div className="">
        <MealType />
      </div>

      <PopularFoods />
      <Footer />
    </>
  );
};

export default Home;
