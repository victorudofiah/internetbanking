// src/pages/Home.js
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-900 to-blue-900 text-white">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-bold mb-6"
      >
        Your Accounts
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["Savings", "Checking", "Investment"].map((acct, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
            className="glass p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="text-sm text-gray-400">{acct} Account</div>
            <div className="text-2xl font-bold mt-2">₦ {Math.floor(Math.random() * 100000)}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
