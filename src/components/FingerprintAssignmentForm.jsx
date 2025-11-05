import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { assignFingerprint, getFingerprintLogs } from "../api/attendanceApi";
import { getEmployees } from "../api/employee";

const FingerprintAssignmentPage = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [assignedBy, setAssignedBy] = useState("IT Department");
  const [sendTo, setSendTo] = useState("both");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error("Failed to load employees", error);
        toast.error("Failed to load employees");
      }
    };
    fetchEmployees();
  }, []);

  // Fetch logs
  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const { data } = await getFingerprintLogs();
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch logs", error);
      toast.error("Unable to load logs");
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Auto-fill details when employee selected
  useEffect(() => {
    if (selectedEmployee) {
      const emp = employees.find((e) => e._id === selectedEmployee);
      if (emp) {
        setEmployeeEmail(emp.email || "");
        setEmployeeId(emp.employeeId || "");
      }
    } else {
      setEmployeeEmail("");
      setEmployeeId("");
    }
  }, [selectedEmployee, employees]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const emp = employees.find((e) => e._id === selectedEmployee);
    const payload = {
      employeeName: emp?.name,
      employeeEmail,
      employeeId,
      assignedBy,
      sendTo,
    };

    try {
      await assignFingerprint(payload);
      toast.success("Email(s) sent successfully!");
      setSelectedEmployee("");
      setEmployeeEmail("");
      setEmployeeId("");
      setSendTo("both");
    } catch (error) {
      console.error("Axios error:", error.response?.data || error.message);
      toast.error("Failed to send emails.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Toaster position="top-right" />

      {/* --- FORM SECTION --- */}
      <motion.div
        className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Assign Employee to Fingerprint System
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Employee Selection */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1">
              Select Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">-- Select Employee --</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={employeeEmail}
              readOnly
              className="border rounded-lg px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* Employee ID */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1">
              Employee ID
            </label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="border rounded-lg px-4 py-2 bg-gray-100 text-gray-600"
            />
          </div>

          {/* Assigned By */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1">
              Assigned By
            </label>
            <input
              type="text"
              value={assignedBy}
              onChange={(e) => setAssignedBy(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Send To */}
          <div className="mt-2">
            <label className="block font-medium text-gray-700 mb-2">
              Send Email To:
            </label>
            <div className="flex gap-4">
              {["employee", "hr", "both"].map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <input
                    type="radio"
                    value={option}
                    checked={sendTo === option}
                    onChange={(e) => setSendTo(e.target.value)}
                  />
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className={`mt-4 px-6 py-2 font-semibold rounded-lg shadow text-white transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Sending..." : "Send Email(s)"}
          </motion.button>
        </form>
      </motion.div>

      {/* --- LOG TABLE SECTION --- */}
      <motion.div
        className="bg-white rounded-2xl shadow-md border border-gray-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Fingerprint & Email Logs
          </h2>
          <button
            onClick={fetchLogs}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>

        {logsLoading ? (
          <div className="text-center text-gray-600 py-10">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center text-gray-600 py-10">
            No logs found yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Employee Name</th>
                  <th className="px-4 py-2 text-left">Employee ID</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Sent To</th>
                  <th className="px-4 py-2 text-left">Assigned By</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr
                    key={log._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{log.employeeName}</td>
                    <td className="px-4 py-2">{log.employeeId}</td>
                    <td className="px-4 py-2">{log.employeeEmail}</td>
                    <td className="px-4 py-2 capitalize">{log.sendTo}</td>
                    <td className="px-4 py-2">{log.assignedBy}</td>
                    <td className="px-4 py-2">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          log.status === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {(log.status = "success")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FingerprintAssignmentPage;
