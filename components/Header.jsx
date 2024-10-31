import React from "react";
import { useRouter } from "next/router";
import { supabase } from "../config/supabaseClient";

const Header = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Админ</h1>
      <button
        onClick={handleLogout}
        className="bg-purple-800 text-white px-4 py-2 rounded hover:bg-purple-800"
      >
        Гарах
      </button>
    </header>
  );
};

export default Header;
