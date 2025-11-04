import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  getReminders,
  markReturned,
  createReminder,
  deleteReminder,
} from "../api/maintenance.js";
import { getEmployees } from "../api/employee.js";
import { getAssets } from "../api/asset.js";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaTrash, FaCalendarCheck } from "react-icons/fa";
import { TbReport } from "react-icons/tb";

export default function EmployeeMaintenance() {
  const [reminders, setReminders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({
    employeeId: "",
    assetId: "",
    reminderDate: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchReminders = async () => {
    try {
      const res = await getReminders();
      setReminders(res.data);
    } catch (err) {
      console.error("Error fetching reminders:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, assetRes] = await Promise.all([
          getEmployees(),
          getAssets(),
        ]);
        setEmployees(empRes.data);
        setAssets(assetRes.data);
        await fetchReminders();
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      await createReminder(form);
      setForm({ employeeId: "", assetId: "", reminderDate: "", notes: "" });
      await fetchReminders();
    } catch (err) {
      console.error(err);
      alert("Failed to create reminder");
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (id) => {
    if (!window.confirm("Mark asset as returned?")) return;
    try {
      await markReturned(id);
      await fetchReminders();
    } catch {
      alert("Failed to mark returned");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reminder?")) return;
    try {
      await deleteReminder(id);
      fetchReminders();
    } catch {
      alert("Failed to delete reminder");
    }
  };

  const employeesWithMaintenance = reminders
    .filter((r) => !r.returned)
    .map((r) => r.employee?._id);
  const assetsWithMaintenance = reminders
    .filter((r) => !r.returned)
    .map((r) => r.asset?._id);

  if (fetching)
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-[60vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <motion.p
          className="text-gray-500 text-lg mt-4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Loading data...
        </motion.p>
      </motion.div>
    );

  return (
    <motion.div
      className="p-6 bg-gray-50 rounded-2xl shadow-md max-w-6xl mx-auto mt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 bg-white shadow-sm rounded-xl p-4 border border-gray-100">
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2 sm:pb-0 sm:border-none">
          Employee Asset Maintenance
        </h2>

        {/* Action Icons */}
        <div className="flex items-center gap-4 mt-3 sm:mt-0">
          <Link
            to="/maintenance-calendar"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-all duration-200"
            title="View Maintenance Calendar"
          >
            <FaCalendarAlt size={26} />
            <span className="hidden sm:inline font-medium">Calendar</span>
          </Link>

          <Link
            to="/maintenance-report"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-all duration-200"
            title="View Maintenance Report"
          >
            <TbReport size={28} />
            <span className="hidden sm:inline font-medium">Report</span>
          </Link>
        </div>
      </div>

      {/* Form Section */}
      <motion.form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row sm:flex-wrap gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8"
        whileHover={{ scale: 1.005 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        {/* Employee Select */}
        <div className="flex flex-col flex-1 min-w-[220px]">
          <label className="font-semibold text-gray-700 mb-1">
            Select Employee
          </label>
          <select
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            required
            disabled={loading}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Choose Employee --</option>

            {/* Employees with no maintenance */}
            <optgroup label="Available">
              {employees
                .filter((e) => !employeesWithMaintenance.includes(e._id))
                .map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.name}
                  </option>
                ))}
            </optgroup>

            {/* Employees with maintenance */}
            <optgroup label="Has Maintenance" disabled>
              {employees
                .filter((e) => employeesWithMaintenance.includes(e._id))
                .map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.name} – Under Maintenance
                  </option>
                ))}
            </optgroup>
          </select>
        </div>

        {/* Asset Select */}
        <div className="flex flex-col flex-1 min-w-[220px]">
          <label className="font-semibold text-gray-700 mb-1">
            Select Asset
          </label>
          <select
            value={form.assetId}
            onChange={(e) => setForm({ ...form, assetId: e.target.value })}
            required
            disabled={loading}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Choose Asset --</option>

            <optgroup label="Available">
              {assets
                .filter(
                  (a) =>
                    (a.category === "Laptop" || a.category === "PC") &&
                    !assetsWithMaintenance.includes(a._id)
                )
                .map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.assetTag} ({a.name}){" "}
                    {a.assignedTo?.name
                      ? `– Assigned to ${a.assignedTo.name}`
                      : ""}
                  </option>
                ))}
            </optgroup>

            <optgroup label="Under Maintenance" disabled>
              {assets
                .filter(
                  (a) =>
                    (a.category === "Laptop" || a.category === "PC") &&
                    assetsWithMaintenance.includes(a._id)
                )
                .map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.assetTag} ({a.name}) – Under Maintenance
                  </option>
                ))}
            </optgroup>
          </select>
        </div>

        {/* Date */}
        <div className="flex flex-col flex-1 min-w-[180px]">
          <label className="font-semibold text-gray-700 mb-1">
            Reminder Date
          </label>
          <input
            type="date"
            value={form.reminderDate}
            onChange={(e) => setForm({ ...form, reminderDate: e.target.value })}
            required
            disabled={loading}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col flex-1 min-w-[200px]">
          <label className="font-semibold text-gray-700 mb-1">Notes</label>
          <input
            placeholder="Enter notes..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            disabled={loading}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Submit */}
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
          {loading ? "Saving..." : "Create Reminder"}
        </motion.button>
      </motion.form>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden bg-white">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-4 text-left">Employee</th>
              <th className="py-3 px-4 text-left">Asset</th>
              <th className="py-3 px-4 text-left">Reminder Date</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reminders.length > 0 ? (
              reminders.map((r) => (
                <tr
                  key={r._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4">{r.employee?.name || "N/A"}</td>
                  <td className="py-3 px-4">
                    {r.asset?.assetTag} ({r.asset?.name})
                  </td>
                  <td className="py-3 px-4">
                    {new Date(r.reminderDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    {r.returned ? (
                      <span className="text-green-600 font-medium">
                        ✅ Returned
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-medium">
                        🕒 Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 flex text-center space-x-2">
                    {!r.returned && (
                      <button
                        onClick={() => handleReturn(r._id)}
                        className="px-3 py-1 flex items-center gap-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        <FaCalendarCheck /> Returned
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="px-3 py-1 flex items-center gap-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="py-6 text-center text-gray-500 italic"
                >
                  No reminders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
