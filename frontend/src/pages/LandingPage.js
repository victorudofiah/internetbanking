// src/pages/LandingPage.js
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white bg-gradient-to-br from-blue-900 to-indigo-900">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-bold mb-6 drop-shadow-lg text-center"
      >
        Welcome to Internet Bank
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="text-lg text-center max-w-xl mb-8"
      >
        Fast, Secure, and Reliable Online Banking. Manage your accounts, transfer funds, and track transactions all in one place.
      </motion.p>

      <motion.div
        className="flex gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        <a href="/login" className="btn-gradient px-6 py-3 text-lg font-semibold">
          Login
        </a>
        <a href="/register" className="btn-gradient px-6 py-3 text-lg font-semibold">
          Register
        </a>
      </motion.div>
    </div>
  );
}
