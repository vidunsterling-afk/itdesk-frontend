// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { FaLaptopCode } from "react-icons/fa"; // you can replace this icon with anything

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="fixed inset-0 flex items-center justify-center bg-black text-white z-50 overflow-hidden"
        >
          {/* Subtle glow behind icon */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0.2 }}
            animate={{
              scale: [0.6, 1.2, 0.9],
              opacity: [0.2, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute w-72 h-72 bg-blue-500/30 blur-3xl rounded-full"
          />

          {/* Center icon */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative z-10 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
              className="flex items-center justify-center"
            >
              <FaLaptopCode className="text-6xl text-blue-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
            </motion.div>
          </motion.div>

          {/* Fade-out overlay */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 2.3, duration: 0.9 }}
            className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
