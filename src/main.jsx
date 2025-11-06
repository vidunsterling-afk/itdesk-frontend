import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import SplashScreen from "./components/SplashScreen.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

function Root() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasShown = sessionStorage.getItem("splashShown");

    if (!hasShown) {
      const timer = setTimeout(() => {
        sessionStorage.setItem("splashShown", "true");
        setLoading(false);
      }, 3000); // same as splash duration
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <SplashScreen />;

  return <App />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>
);

// ✅ optional: keeps fast refresh happy
export default Root;
