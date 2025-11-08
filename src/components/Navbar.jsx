import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import {
  FaTachometerAlt,
  FaUsers,
  FaLaptop,
  FaCogs,
  FaTasks,
  FaSignOutAlt,
  FaBoxOpen,
  FaTags,
  FaClock,
  FaChevronDown,
  FaChevronRight,
  FaUserCog,
} from "react-icons/fa";
import { MdOutline4gPlusMobiledata } from "react-icons/md";
import { RiFingerprintLine } from "react-icons/ri";
import { CgMicrosoft } from "react-icons/cg";
import { FaMapLocation, FaUsersRectangle } from "react-icons/fa6";
import { CiMemoPad } from "react-icons/ci";
import { LuCalendarClock } from "react-icons/lu";
import { GiAutoRepair } from "react-icons/gi";
import { MdCellWifi } from "react-icons/md";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import { getProfile, getServerPing } from "../api/auth.js";

function TopProfileNav() {
  // eslint-disable-next-line no-unused-vars
  const [show, setShow] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const seeds = ["Liam", "Jade", "Adrian", "Sarah", "Aidan"];
  const [seed, setSeed] = useState("");
  const [profile, setProfile] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timer;

    const resetTimer = () => {
      setIsVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => setIsVisible(false), 3000);
    };

    window.addEventListener("keydown", resetTimer);
    window.addEventListener("scroll", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, []);

  useEffect(() => {
    const userProfile = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data);
      } catch (err) {
        toast.error(`Failed to fetch profile: ${err}`);
      }
    };

    userProfile();
  }, []);

  useEffect(() => {
    const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
    setSeed(randomSeed);
  }, []);

  const src = `https://api.dicebear.com/9.x/open-peeps/svg?seed=${seed}`;

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll && currentScroll > 50) {
        setShow(false);
      } else {
        setShow(true);
      }
      setLastScroll(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  return (
    <motion.div
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: isVisible ? 0 : -120,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
      }}
      transition={{ type: "spring", stiffness: 250, damping: 25 }}
      className="fixed top-4 right-10 z-50"
    >
      <div className="bg-gray-800 text-white rounded-full px-6 py-2 flex items-center gap-3 shadow-lg cursor-pointer hover:bg-gray-700 transition-all">
        <img
          src={src}
          alt="Profile"
          className="w-8 h-8 rounded-full border-2 border-blue-500"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-sm">
            {profile?.username || "Guest"}
          </span>
          <span className="text-xs text-gray-300">
            {profile ? (profile.isAdmin ? "Administrator" : "User") : ""}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Navbar({ setIsExpanded, defaultExpanded = false }) {
  const { user, logout } = useContext(AuthContext);
  const [showPing, setShowPing] = useState(false);
  const [ping, setPing] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(defaultExpanded);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timeLeftExpanded, setTimeLeftExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data);
      } catch (err) {
        toast.error(`Failed to fetch profile: ${err}`);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchPing = async () => {
      try {
        const data = await getServerPing();
        if (data) setPing(data.latency);
      } catch {
        setPing(null);
      }
    };

    fetchPing();

    const interval = setInterval(() => {
      setShowPing((prev) => !prev);
      fetchPing();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decode = jwtDecode(token);
    const expiry = decode.exp * 1000;
    const updateTimer = () => {
      const now = Date.now();
      const diff = expiry - now;
      if (diff <= 0) {
        setTimeLeft("Session expired");
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const getClockColor = () => {
    if (!timeLeft || timeLeft === "Session expired") return "text-red-500";

    const [minutesPart] = timeLeft.split("m");
    const minutes = parseInt(minutesPart) || 0;

    if (minutes > 30) return "text-green-400";
    if (minutes > 10) return "text-yellow-400";
    return "text-red-500";
  };

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsExpanded(false);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const navStructure = [
    {
      id: "dashboard",
      type: "single",
      path: "/dashboard",
      label: "Dashboard",
      icon: <FaTachometerAlt />,
    },
    {
      id: "management",
      type: "section",
      label: "Management",
      icon: <FaUsersRectangle />,
      children: [
        {
          path: "/usermanagement",
          label: "User Management",
          icon: <FaUserCog />,
          adminOnly: true, // restricted
        },
      ],
    },
    {
      id: "employees-assets",
      type: "section",
      label: "Employee & Assets",
      icon: <FaUsers />,
      children: [
        { path: "/employees", label: "Employees", icon: <FaUsers /> },
        { path: "/assets", label: "Assets", icon: <FaBoxOpen /> },
        { path: "/assign-assets", label: "Assign Assets", icon: <FaTasks /> },
      ],
    },
    {
      id: "it-resources",
      type: "section",
      label: "IT Resources",
      icon: <FaLaptop />,
      children: [
        { path: "/software", label: "Software", icon: <FaLaptop /> },
        { path: "/data", label: "Data", icon: <MdCellWifi /> },
        { path: "/m365", label: "M365", icon: <CgMicrosoft /> },
      ],
    },
    {
      id: "maintenance",
      type: "section",
      label: "Operations",
      icon: <GiAutoRepair />,
      children: [
        { path: "/repair", label: "Repair", icon: <GiAutoRepair /> },
        {
          path: "/employee-maintenance",
          label: "Maintenance",
          icon: <FaCogs />,
        },
        {
          path: "/bill-reminder",
          label: "Reminders",
          icon: <LuCalendarClock />,
        },
        {
          path: "/attendance",
          label: "Fingerprint",
          icon: <RiFingerprintLine />,
        },
        {
          path: "/datar",
          label: "D Report",
          icon: <MdOutline4gPlusMobiledata />,
        },
      ],
    },
    {
      id: "documents",
      type: "section",
      label: "Documents",
      icon: <CiMemoPad />,
      children: [
        { path: "/tags", label: "Tags", icon: <FaTags /> },
        { path: "/memo", label: "Memorandum", icon: <CiMemoPad /> },
      ],
    },
  ];

  const isNavItemActive = (path, children = []) => {
    if (path) return location.pathname.startsWith(path);
    return children.some((child) => location.pathname.startsWith(child.path));
  };

  const renderNavItem = (item, level = 0) => {
    const isActive = isNavItemActive(item.path, item.children);
    const isExpanded = expandedSections[item.id];
    const hasChildren = item.type === "section" && item.children;
    const pl = level * 12 + 12;

    if (item.type === "single") {
      const isRestricted = item.adminOnly && !profile?.isAdmin;
      return (
        <Link
          key={item.path}
          to={isRestricted ? "#" : item.path}
          onClick={(e) => {
            if (isRestricted) {
              e.preventDefault();
              Swal.fire({
                icon: "error",
                title: "Access Denied",
                text: "Admin Only!",
                confirmButtonColor: "#d33",
              });
            }
          }}
          className={`relative flex items-center gap-3 px-3 py-2 h-10 rounded-lg font-medium transition-all duration-200 group overflow-hidden ${
            isActive && !isRestricted
              ? "bg-blue-600 text-white shadow-lg"
              : "text-gray-300 hover:bg-gray-800 hover:text-blue-400"
          } ${isRestricted ? "text-red-500 hover:bg-gray-900" : ""}`}
          style={{ paddingLeft: `${pl}px` }}
        >
          <span className="text-lg flex-shrink-0">{item.icon}</span>
          <AnimatePresence>
            {isHovered && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {isActive && !isRestricted && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-r-md"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </Link>
      );
    }

    if (item.type === "section" && hasChildren) {
      return (
        <div key={item.id}>
          <button
            onClick={() => isHovered && toggleSection(item.id)}
            className={`relative flex items-center justify-between w-full px-3 py-2 h-10 rounded-lg font-medium transition-all duration-200 group overflow-hidden ${
              isActive
                ? "bg-blue-600 text-white shadow-lg"
                : "text-gray-300 hover:bg-gray-800 hover:text-blue-400"
            }`}
            style={{ paddingLeft: `${pl}px` }}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {isHovered && (
              <motion.span
                initial={{ opacity: 0, rotate: -90 }}
                animate={{
                  opacity: 1,
                  rotate: isExpanded ? 0 : -90,
                }}
                transition={{ duration: 0.2 }}
                className="text-sm"
              >
                <FaChevronDown />
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {isHovered && isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-1 mt-1">
                  {item.children.map((child) =>
                    renderNavItem({ ...child, type: "single" }, level + 1)
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return null;
  };

  const expanded = isHovered;

  return (
    <>
      <TopProfileNav />

      <motion.aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        initial={{ width: defaultExpanded ? 240 : 80 }}
        animate={{ width: expanded ? 240 : 80 }}
        transition={{
          type: "spring",
          stiffness: 180,
          damping: 15,
          mass: 0.8,
        }}
        className="fixed top-0 left-0 h-screen bg-gray-900 text-white flex flex-col shadow-xl z-50"
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-800">
          <AnimatePresence mode="wait">
            {expanded ? (
              <motion.h1
                key="text-logo"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="text-2xl font-bold text-white tracking-wide"
              >
                IT Desk
              </motion.h1>
            ) : (
              <motion.div
                key="icon-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="text-2xl"
              >
                <img src="/sterling_logo.png" alt="Logo" width="35" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 flex flex-col p-4 gap-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {navStructure.map((item) => renderNavItem(item))}
        </nav>

        <div className="p-4 border-t border-gray-800 flex flex-col gap-2">
          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-3 w-full h-10 px-3 rounded-md bg-gray-700 hover:bg-gray-600 transition-all"
          >
            <FaCogs className="text-lg flex-shrink-0" />
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full h-10 px-3 rounded-md bg-red-600 hover:bg-red-700 transition-all"
          >
            <FaSignOutAlt className="text-lg flex-shrink-0" />
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      <motion.div
        className="fixed bottom-4 right-4 bg-gray-800 text-white text-sm shadow-lg cursor-pointer flex items-center z-[9999] overflow-hidden rounded-full"
        onMouseEnter={() => setTimeLeftExpanded(true)}
        onMouseLeave={() => setTimeLeftExpanded(false)}
        animate={{
          width: timeLeftExpanded ? 170 : 44,
          height: 44,
        }}
        transition={{
          type: "spring",
          stiffness: 240,
          damping: 20,
        }}
        whileHover={{
          scale: 1.05,
          boxShadow: "0px 4px 20px rgba(255, 255, 255, 0.2)",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-11 h-11 flex items-center justify-center bg-gray-800 flex-shrink-0"
        >
          <AnimatePresence mode="wait">
            {showPing ? (
              <motion.span
                key="ping"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[10px] font-bold"
              >
                {ping !== null ? `${ping}ms` : "..."}
              </motion.span>
            ) : (
              <motion.span
                key="clock"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <FaClock
                  className={`text-lg transition-colors duration-500 ${getClockColor()}`}
                />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={false}
          animate={{
            opacity: timeLeftExpanded ? 1 : 0,
            x: timeLeftExpanded ? 0 : 10,
          }}
          transition={{
            opacity: {
              duration: 0.25,
              ease: "easeOut",
              delay: timeLeftExpanded ? 0.1 : 0,
            },
            x: { duration: 0.25, ease: "easeOut" },
          }}
          className="whitespace-nowrap pl-2 pr-4"
        >
          <span className="font-semibold">{timeLeft}</span> left
        </motion.div>
      </motion.div>
    </>
  );
}
