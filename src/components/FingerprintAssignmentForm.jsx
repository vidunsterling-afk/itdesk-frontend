import { useState, useEffect } from "react";
import { assignFingerprint } from "../api/attendanceApi";
import { getEmployees } from "../api/employee";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

const FingerprintAssignmentForm = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [assignedBy, setAssignedBy] = useState("IT Department");
  const [sendTo, setSendTo] = useState("both");
  const [loading, setLoading] = useState(false);

  // Fetch employees when component loads
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error("Failed to load employees", error);
        toast.error("⚠️ Failed to load employees");
      }
    };
    fetchEmployees();
  }, []);

  // When employee is selected, auto-fill their details
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

    try {
      const emp = employees.find((e) => e._id === selectedEmployee);
      await assignFingerprint({
        employeeName: emp?.name,
        employeeEmail,
        employeeId,
        assignedBy,
        sendTo,
      });
      toast.success("Email(s) sent successfully!");
      setSelectedEmployee("");
      setEmployeeEmail("");
      setEmployeeId("");
      setSendTo("both");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send emails.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="p-6 bg-gray-50 rounded-2xl shadow-md max-w-2xl mx-auto mt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Toaster position="top-right" />

      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Assign Employee to Fingerprint System
      </h2>

      <motion.form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        whileHover={{ scale: 1.005 }}
      >
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

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={employeeEmail}
            readOnly
            className="border rounded-lg px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Employee ID</label>
          <input
            type="text"
            onChange={(e) => setEmployeeId(e.target.value)}
            className="border rounded-lg px-4 py-2 bg-gray-100 text-gray-600"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Assigned By</label>
          <input
            type="text"
            value={assignedBy}
            onChange={(e) => setAssignedBy(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Send To Options */}
        <div className="mt-2">
          <label className="block font-medium text-gray-700 mb-2">
            Send Email To:
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="radio"
                value="employee"
                checked={sendTo === "employee"}
                onChange={(e) => setSendTo(e.target.value)}
              />
              Employee
            </label>
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="radio"
                value="hr"
                checked={sendTo === "hr"}
                onChange={(e) => setSendTo(e.target.value)}
              />
              HR
            </label>
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="radio"
                value="both"
                checked={sendTo === "both"}
                onChange={(e) => setSendTo(e.target.value)}
              />
              Both
            </label>
          </div>
        </div>

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
      </motion.form>
    </motion.div>
  );
};

export default FingerprintAssignmentForm;
