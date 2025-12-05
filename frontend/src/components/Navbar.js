import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-brand-500 text-white shadow-lg p-4 flex justify-between items-center">
      <div className="text-2xl font-bold">BankingApp</div>
      <div className="space-x-4">
        <Link
          to="/login"
          className="bg-accent-500 hover:bg-accent-400 text-white px-4 py-2 rounded-xl2 transition"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="bg-white text-brand-500 hover:bg-gray-100 px-4 py-2 rounded-xl2 transition"
        >
          Register
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
