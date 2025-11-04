import { useState, useContext, useEffect } from "react";
import { loginUser } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { getHealth } from "../api/health";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaLaptop, FaServer, FaDatabase } from "react-icons/fa";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [backendStatus, setBackendStatus] = useState("connecting");

  const checkBackend = async () => {
    try {
      const { data } = await getHealth();
      if (data.status === "ok") {
        setBackendStatus("online");
      } else {
        setBackendStatus("offline");
      }
    } catch (err) {
      setBackendStatus("offline");
      console.log(err);
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);
      login(res.data.token);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  // Bounce animation for background icons
  const bounceVariants = {
    animate: {
      y: ["0%", "20%", "0%"],
      x: ["0%", "10%", "-10%", "0%"],
      rotate: [0, 15, -15, 0],
      transition: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 4,
        ease: "easeInOut",
      },
    },
  };

  const icons = [FaLaptop, FaServer, FaDatabase];

  // Animations for form elements
  const formContainerVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.2 + i * 0.1, duration: 0.4 },
    }),
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.6, duration: 0.4 },
    },
  };

  // Map status to color + label
  const statusColors = {
    online: "text-green-500",
    offline: "text-red-500",
    connecting: "text-gray-400",
  };

  const statusLabels = {
    online: "Online",
    offline: "Offline",
    connecting: "Connecting...",
  };

  return (
    <div className="h-screen relative flex items-center justify-center overflow-hidden bg-gray-50">
      {/* Background bouncing icons */}
      {Array.from({ length: 8 }).map((_, i) => {
        const Icon = icons[i % icons.length];
        const size = 30 + Math.random() * 30;
        const top = Math.random() * 90;
        const left = Math.random() * 90;

        return (
          <motion.div
            key={i}
            className="absolute text-gray-300 opacity-40"
            style={{ top: `${top}%`, left: `${left}%`, fontSize: size }}
            variants={bounceVariants}
            animate="animate"
          >
            <Icon />
          </motion.div>
        );
      })}

      {/* Animated Login Form */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md z-10 relative border border-gray-100"
        variants={formContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-2">ITDesk</h2>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={inputVariants} custom={0}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
            />
          </motion.div>

          <motion.div variants={inputVariants} custom={1}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
            />
          </motion.div>

          <motion.button
            type="submit"
            variants={buttonVariants}
            whileHover={{
              scale: 1.02,
              boxShadow: "0px 8px 25px rgba(37,99,235,0.15)",
            }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>Sign In</span>
          </motion.button>
        </motion.form>

        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className="text-gray-600 text-sm">
            Don't have an account?{" "}
            <Link
              to="/verify"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              Register here
            </Link>
          </p>
        </motion.div>
      </motion.div>

      {/* Developer credit */}
      <div className="absolute bottom-8 w-full text-center">
        <motion.div
          className="text-gray-400 text-sm select-none pointer-events-none inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <span>Developed by</span>
          <span className="font-medium text-gray-600">Vidun Hettiarachchi</span>
        </motion.div>
      </div>

      {/* Backend status indicator */}
      <motion.div
        className="absolute top-6 right-6 flex items-center gap-2 cursor-default z-20"
        whileHover="hover"
        initial="rest"
        animate="rest"
      >
        <motion.div
          className={`text-xl ${statusColors[backendStatus]} bg-white/80 backdrop-blur-sm p-2 rounded-xl border border-gray-200`}
          animate={
            backendStatus === "offline"
              ? { scale: [1, 1.2, 1], y: [0, -3, 0] }
              : backendStatus === "connecting"
              ? { scale: [1, 1.1, 1], y: [0, -2, 0] }
              : { scale: [1, 1.05, 1], y: [0, -1.5, 0] }
          }
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 0.8,
            ease: "easeInOut",
          }}
        >
          <FaServer />
        </motion.div>

        {/* Expanding text when hover */}
        <motion.span
          className="text-gray-700 text-sm font-medium bg-white/80 px-3 py-2 rounded-xl shadow-sm backdrop-blur-sm border border-gray-200"
          variants={{
            rest: { opacity: 0, width: 0, marginLeft: 0 },
            hover: {
              opacity: 1,
              width: "auto",
              marginLeft: 8,
              transition: { duration: 0.3 },
            },
          }}
        >
          <span className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === "online"
                  ? "bg-green-500"
                  : backendStatus === "offline"
                  ? "bg-red-500"
                  : "bg-gray-400"
              }`}
            ></span>
            {statusLabels[backendStatus]}
          </span>
        </motion.span>
      </motion.div>
    </div>
  );
}
