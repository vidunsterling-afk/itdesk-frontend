import { useEffect, useState } from "react";
import {
  getBills,
  createBill,
  payBill,
  deleteBill,
  getReports,
} from "../api/bill";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { getProfile } from "../api/auth";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function BillManager() {
  const [bills, setBills] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState("bills"); // 'bills' or 'reports'
  const [form, setForm] = useState({
    name: "",
    reminderDate: "",
    priority: "Medium",
    recurring: false,
  });
  const [loading, setLoading] = useState(false);
  const baseURL = import.meta.env.VITE_BACKEND_URI;
  const [profile, setProfile] = useState(null);

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

  // Fetch bills
  const fetchBills = async () => {
    try {
      const res = await getBills();
      setBills(res.data);
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
  };

  // Fetch reports
  const fetchReports = async () => {
    try {
      const res = await getReports();
      setReports(res.data);
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
  };

  // Auto-refresh
  useEffect(() => {
    fetchBills();
    fetchReports();
    const interval = setInterval(() => {
      fetchBills();
      fetchReports();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await createBill(form);
      toast.success("Bill created successfully.");
      setForm({
        name: "",
        reminderDate: "",
        priority: "Medium",
        recurring: false,
      });
      fetchBills();
      setActiveTab("bills");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create bill");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (id) => {
    try {
      await payBill(id);
      toast.success("Bill paid successfully.");
      fetchBills();
      fetchReports();
    } catch (err) {
      console.error(err);
      toast.error("Failed to pay bill");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this bill?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
    });

    if (result.isConfirmed) {
      try {
        await deleteBill(id);
        await fetchBills();
        await fetchReports();
        toast.success("Bill deleted successfully");
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete bill");
      }
    }
  };

  return (
    <motion.div
      className="p-6 bg-gray-50 rounded-2xl shadow-md max-w-6xl mx-auto mt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("bills")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            activeTab === "bills"
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-300"
          }`}
        >
          Bills
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            activeTab === "reports"
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-300"
          }`}
        >
          Reports
        </button>
      </div>

      {/* Bills Section */}
      {activeTab === "bills" && (
        <>
          {/* Form */}
          {profile?.isAdmin && (
            <motion.form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row sm:flex-wrap gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8"
              whileHover={{ scale: 1.005 }}
            >
              <div className="flex flex-col flex-1 min-w-[180px]">
                <label className="font-semibold text-gray-700 mb-1">
                  Bill Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex flex-col flex-1 min-w-[180px]">
                <label className="font-semibold text-gray-700 mb-1">
                  Reminder Date
                </label>
                <input
                  type="date"
                  value={form.reminderDate}
                  onChange={(e) =>
                    setForm({ ...form, reminderDate: e.target.value })
                  }
                  required
                  className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex flex-col flex-1 min-w-[140px]">
                <label className="font-semibold text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                  className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.recurring}
                  onChange={(e) =>
                    setForm({ ...form, recurring: e.target.checked })
                  }
                />
                <span className="text-gray-700">Recurring</span>
              </div>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                disabled={loading}
                className={`mt-2 px-6 py-2 font-semibold rounded-lg shadow text-white transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Saving..." : "Create Bill"}
              </motion.button>
            </motion.form>
          )}

          {/* Bills Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden bg-white">
              <thead className="bg-gray-100 text-gray-700 font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">Bill</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Priority</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  {profile?.isAdmin && (
                    <th className="py-3 px-4 text-center">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {bills.length ? (
                  bills.map((b) => (
                    <tr
                      key={b._id}
                      className="border-t hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                    >
                      <td className="py-3 px-4">{b.name}</td>
                      <td className="py-3 px-4">
                        {new Date(b.reminderDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">{b.priority}</td>
                      <td className="py-3 px-4">
                        {b.status === "Paid" ? (
                          <span className="text-green-600 font-medium">
                            ✅ Paid
                          </span>
                        ) : (
                          <span className="text-yellow-600 font-medium">
                            🕒 Pending
                          </span>
                        )}
                      </td>
                      {profile?.isAdmin && (
                        <td className="py-3 px-4 flex justify-center gap-2">
                          {b.status !== "Paid" && (
                            <button
                              onClick={() => handlePay(b._id)}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                            >
                              Pay
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(b._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-6 text-center text-gray-500 italic"
                    >
                      No bills found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Reports Section */}
      {activeTab === "reports" && (
        <div className="overflow-x-auto">
          {/* Export Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => window.open(`${baseURL}/api/bills/export-excel`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Export to Excel
            </button>
          </div>

          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden bg-white">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="py-3 px-4 text-left">Bill</th>
                <th className="py-3 px-4 text-left">Paid Date</th>
                <th className="py-3 px-4 text-left">Priority</th>
              </tr>
            </thead>
            <tbody>
              {reports.length ? (
                reports.map((r) => (
                  <tr
                    key={r._id}
                    className="border-t hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                  >
                    <td className="py-3 px-4">{r.name}</td>
                    <td className="py-3 px-4">
                      {new Date(
                        r.paidDate || r.reminderDate
                      ).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{r.priority}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="py-6 text-center text-gray-500 italic"
                  >
                    No paid bills yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
