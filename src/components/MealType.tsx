import React, { useState } from "react";
import DinnerIcon from "../img/icon/dinner.avif";
import BreakfastIcon from "../img/icon/breakfast.avif";
import SnackIcon from "../img/icon/snack.avif";
import DessertIcon from "../img/icon/dessert.avif";
import AppetizerIcon from "../img/icon/appetizer.avif";
import SaladIcon from "../img/icon/salad.avif";
import BreadIcon from "../img/icon/bread.avif";
import SoupIcon from "../img/icon/soup.avif";
import BeverageIcon from "../img/icon/beverage.avif";
import SauceIcon from "../img/icon/sauce.avif";
import MarinadeIcon from "../img/icon/marinade.avif";
import DrinkIcon from "../img/icon/drink.avif";
import { useNavigate } from "react-router-dom";

interface MealTypeCardProps {
  icon: string;
  title: string;
  isHidden?: boolean;
}

const MealTypeCard: React.FC<MealTypeCardProps> = ({ icon, title, isHidden }) => {
  const navigate = useNavigate();

  return (
    <button
      className={`" rounded-lg shadow-lg p-4 flex flex-col justify-center items-center bg-gray-700 hover:bg-gray-500 "   ${isHidden ? "hidden" : "block"
        }`}
      onClick={() => navigate(`/search/random/${title.toLowerCase()}`)}
    >
      <img src={icon} alt="dinner" className="w-28" />
      <p className="text-white text-lg font-semibold">{title}</p>
    </button>
  );
};

const MealType: React.FC = () => {
  const [isHidden, setIsHidden] = useState<boolean>(true);

  return (
    <div className="flex flex-col px-8 pt-20 bg-gray-200">
      {/* tittle */}
      <div>
        <h1 className="text-center text-2xl font-bold text-gray-700 ">
          Find By Category
        </h1>
      </div>
      {/*end of tittle */}
      {/* meal category card */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-8 md:px-28  z-10 ">
        <MealTypeCard icon={DinnerIcon} title="Main Course" />
        <MealTypeCard icon={DessertIcon} title="Dessert" />
        <MealTypeCard icon={AppetizerIcon} title="Appetizer" />
        <MealTypeCard icon={SaladIcon} title="Salad" />
        <MealTypeCard icon={BreadIcon} title="Bread" />
        <MealTypeCard
          icon={BreakfastIcon}
          title="Breakfast"
          isHidden={isHidden}
        />
        <MealTypeCard icon={SoupIcon} title="Soup" isHidden={isHidden} />
        <MealTypeCard
          icon={BeverageIcon}
          title="Beverage"
          isHidden={isHidden}
        />
        <MealTypeCard icon={SauceIcon} title="Sauce" isHidden={isHidden} />
        <MealTypeCard
          icon={MarinadeIcon}
          title="Marinade"
          isHidden={isHidden}
        />
        <MealTypeCard icon={SnackIcon} title="Snack" isHidden={isHidden} />
        <MealTypeCard icon={DrinkIcon} title="Drink" isHidden={isHidden} />
      </div>
      {/* end meal category card */}
      <div className="w-full flex justify-center pb-10 mt-6">
        <button
          onClick={() => setIsHidden(!isHidden)}
          className="flex flex-col items-center"
        >
          <h1 className="text-center font-semibold mb-1">
            {isHidden ? "More" : "Less"}
          </h1>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 animate-bounce"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={
                isHidden
                  ? "M19.5 8.25l-7.5 7.5-7.5-7.5"
                  : "M4.5 15.75l7.5-7.5 7.5 7.5"
              }
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MealType;
