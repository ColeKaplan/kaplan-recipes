import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const NavBar: React.FC = () => {


  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data }) => {
      setIsAdmin(!!data.session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="bg-gray-900/60 backdrop-blur-sm text-white py-4 fixed w-full z-40 px-6">
      <div className="container mx-auto flex items-center  justify-between flex-wrap">
        {/* Website Name */}
        <div className="flex items-center flex-shrink-0 mr-6">
          <a href="/" className="text-2xl font-bold tracking-wide">
            Kaplan Family Recipes{isAdmin && ": Admin"}
          </a>
        </div>
        {/* Navbar Menu */}
        <div className="md:flex hidden">
          <a href="/" className="mr-6">
            Home
          </a>
          <Link to={`/search/random/all`} className="mr-6">
            Recipes
          </Link>
          <Link to="/create-recipe" className="mr-6">
            Create Recipe
          </Link>
        </div>
        {/* End of Navbar Menu */}
      </div>
    </nav>
  );
};

export default NavBar;
