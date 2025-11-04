import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

export default function AdminVerify() {
  const navigate = useNavigate();
  const ADMIN_PSW = import.meta.env.VITE_ADMIN_PSW;

  useEffect(() => {
    const verifyAdmin = async () => {
      const { value: password } = await Swal.fire({
        title: "Admin Verification",
        input: "password",
        inputLabel: "Enter admin password",
        inputPlaceholder: "Admin password",
        inputAttributes: { autocapitalize: "off", autocorrect: "off" },
        allowOutsideClick: false,
        allowEscapeKey: false,
        confirmButtonText: "Verify",
      });

      if (password === ADMIN_PSW) {
        toast.success("Admin verified!");
        localStorage.setItem("adminVerified", "true"); // <-- store flag
        navigate("/register"); // go to register page
      } else {
        toast.error("Incorrect admin password! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      }
    };

    verifyAdmin();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-700 text-lg">Verifying admin...</p>
    </div>
  );
}
