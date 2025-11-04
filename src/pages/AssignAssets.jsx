import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { getEmployees } from "../api/employee.js";
import { getAssets } from "../api/asset.js";
import { assignAssets } from "../api/assignment.js";
import { MdOutlineAssignmentInd } from "react-icons/md";

export default function AssignAssets() {
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [type, setType] = useState("assigned");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assignedMap, setAssignedMap] = useState({});
  const [sendEmailFlag, setSendEmailFlag] = useState(true);
  const [showAssigned, setShowAssigned] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, assetRes] = await Promise.all([
        getEmployees(),
        getAssets(),
      ]);

      const employeesData = empRes.data;
      const assetsData = assetRes.data;

      const map = {};
      assetsData.forEach((a) => {
        const empId = a.assignedTo?._id || a.assignedTo || a.employeeId;
        if (empId) {
          if (!map[empId]) map[empId] = [];
          map[empId].push(a);
        }
      });

      const filteredAssets = showAssigned
        ? assetsData
        : assetsData.filter((a) => a.status === "available");

      setEmployees(employeesData);
      setAssets(filteredAssets);
      setAssignedMap(map);
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [showAssigned]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || selectedAssets.length === 0) {
      alert("Please select an employee and at least one asset.");
      return;
    }

    try {
      setSubmitting(true);
      await assignAssets(selectedEmployee, selectedAssets, type, sendEmailFlag);
      alert("✅ Assets assigned successfully!");
      setSelectedAssets([]);
      setSelectedEmployee("");
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("❌ Assignment failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
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
      className="p-6 bg-gray-50 rounded-2xl shadow-md max-w-3xl mx-auto mt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
        Assign Assets
      </h2>

      <motion.form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        whileHover={{ scale: 1.005 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        {/* Employee Select */}
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">
            Select Employee
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            required
            disabled={submitting}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Choose Employee --</option>
            {employees.map((e) => {
              const assignedAssets = assignedMap[e._id] || [];
              const assignedText =
                assignedAssets.length > 0
                  ? assignedAssets.map((a) => a.assetTag || a.name).join(", ")
                  : "No assets assigned";

              return (
                <option key={e._id} value={e._id}>
                  {e.name} — {assignedText}
                </option>
              );
            })}
          </select>
        </div>

        {/* Show Assigned Option */}
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            id="showAssigned"
            checked={showAssigned}
            onChange={(e) => setShowAssigned(e.target.checked)}
            disabled={submitting}
          />
          <label htmlFor="showAssigned" className="text-gray-700 font-medium">
            Show assigned assets too (allow reassignment)
          </label>
        </div>

        {/* Assets Multi-select */}
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">
            Select Assets (Ctrl/Cmd + click for multiple)
          </label>
          <select
            multiple
            value={selectedAssets}
            onChange={(e) =>
              setSelectedAssets(
                [...e.target.selectedOptions].map((o) => o.value)
              )
            }
            required
            disabled={submitting}
            size={6}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {assets.length === 0 ? (
              <option disabled>No available assets</option>
            ) : (
              assets.map((asset) => (
                <option key={asset._id} value={asset._id}>
                  {asset.assetTag} — {asset.name} ({asset.status})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Type Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="font-semibold text-gray-700">
            Assignment Type:
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={submitting}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto"
          >
            <option value="assigned">Permanent</option>
            <option value="tempAssigned">Temporary</option>
          </select>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={sendEmailFlag}
            onChange={(e) => setSendEmailFlag(e.target.checked)}
            id="sendEmail"
          />
          <label htmlFor="sendEmail" className="text-gray-700 font-medium">
            Send Email Notification
          </label>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          disabled={submitting}
          className={`mt-4 px-6 py-2 flex items-center gap-1 justify-center font-semibold rounded-lg shadow transition-all ${
            submitting
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <MdOutlineAssignmentInd size={20} />{" "}
          {submitting ? "Assigning..." : "Assign Assets"}
        </motion.button>
      </motion.form>
    </motion.div>
  );
}
