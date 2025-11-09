import { useEffect, useState } from "react";
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  unassignAssets,
  exportEmployeesExcel,
} from "../api/employee.js";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FaTrash,
  FaEdit,
  FaTimes,
  FaCheck,
  FaTimesCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { IoAddCircle } from "react-icons/io5";
import { GrDocumentDownload } from "react-icons/gr";
import { getProfile } from "../api/auth.js";
import Swal from "sweetalert2";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", department: "" });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleExport = async () => {
    try {
      const res = await exportEmployeesExcel();

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "employees_assets.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Exported successfully");
    } catch (err) {
      console.error(err);
      toast.error("Export failed");
    }
  };

  // Add Employee via top form
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await addEmployee(form);
      toast.success("Employee added successfully");
      setForm({ name: "", email: "", department: "" });
      fetchEmployees();
    } catch (err) {
      console.error(err);
      toast.error("Add employee failed");
    }
  };

  const handleSubmit = async (id) => {
    try {
      await updateEmployee(id, form);
      toast.success("Employee updated successfully");
      setEditingId(null);
      setForm({ name: "", email: "", department: "" });
      fetchEmployees();
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  const handleEdit = (emp) => {
    setEditingId(emp._id);
    setForm({ name: emp.name, email: emp.email, department: emp.department });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", email: "", department: "" });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the employee.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteEmployee(id);
      toast.success("Employee deleted successfully");
      fetchEmployees();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const handleUnassign = async (employeeId, assetIds, type) => {
    const result = await Swal.fire({
      title: "Confirm Unassign",
      text: "Are you sure you want to unassign this asset?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, unassign it!",
    });
    if (!result.isConfirmed) return;
    try {
      await unassignAssets(employeeId, assetIds, type);
      toast.success("Asset unassigned successfully");
      fetchEmployees();
    } catch (err) {
      console.error(err);
      toast.error("Unassign failed");
    }
  };

  return (
    <div className="p-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-6 text-gray-800"
      >
        Employees
      </motion.h2>

      {/* Add Employee Form */}
      {profile?.isAdmin && (
        <motion.form
          onSubmit={handleAdd}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1"
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1"
          />
          <input
            placeholder="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            required
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1"
          />
          <button
            type="submit"
            className="px-6 py-2 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
          >
            <IoAddCircle size={30} /> Add Employee
          </button>
        </motion.form>
      )}
      <button
        onClick={handleExport}
        className="px-4 py-2 mb-4 flex items-center gap-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        <GrDocumentDownload /> Export
      </button>

      <input
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-1/3"
      />

      {loading ? (
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
      ) : (
        <motion.div className="overflow-x-auto bg-white shadow-md rounded-xl">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left whitespace-nowrap">Name</th>
                <th className="p-3 text-left whitespace-nowrap">Email</th>
                <th className="p-3 text-left whitespace-nowrap">Department</th>
                <th className="p-3 text-left whitespace-nowrap">
                  Assigned Assets
                </th>
                <th className="p-3 text-left whitespace-nowrap">
                  Temporary Assets
                </th>
                {profile?.isAdmin && (
                  <th className="p-3 text-left whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {employees
                .filter((emp) =>
                  emp.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((emp, i) => (
                  <tr
                    key={emp._id}
                    className={`border-t hover:bg-gray-200 transition-colors duration-200 cursor-pointer ${
                      i % 2 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    {/* Inline edit fields */}
                    <td className="p-3 whitespace-nowrap">
                      {editingId === emp._id ? (
                        <input
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          className="px-2 py-1 border rounded w-full"
                        />
                      ) : (
                        emp.name
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {editingId === emp._id ? (
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                          className="px-2 py-1 border rounded w-full"
                        />
                      ) : (
                        emp.email
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {editingId === emp._id ? (
                        <input
                          value={form.department}
                          onChange={(e) =>
                            setForm({ ...form, department: e.target.value })
                          }
                          className="px-2 py-1 border rounded w-full"
                        />
                      ) : (
                        emp.department
                      )}
                    </td>

                    {/* Assigned Assets */}
                    <td className="p-3">
                      {emp.assigned.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {emp.assigned.map((a) => (
                            <div
                              key={a._id}
                              className="flex justify-between items-center gap-2 bg-green-50 px-2 py-1 rounded"
                            >
                              <span className="text-sm whitespace-nowrap">
                                {a.assetTag} ({a.name})
                              </span>
                              {profile?.isAdmin && (
                                <button
                                  onClick={() =>
                                    handleUnassign(emp._id, [a._id], "assigned")
                                  }
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FaTimes />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Temporary Assets */}
                    <td className="p-3">
                      {emp.tempAssigned.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {emp.tempAssigned.map((a) => (
                            <div
                              key={a._id}
                              className="flex justify-between items-center gap-2 bg-yellow-50 px-2 py-1 rounded"
                            >
                              <span className="text-sm whitespace-nowrap">
                                {a.assetTag} ({a.name})
                              </span>
                              {profile?.isAdmin && (
                                <button
                                  onClick={() =>
                                    handleUnassign(
                                      emp._id,
                                      [a._id],
                                      "tempAssigned"
                                    )
                                  }
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FaTimes />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Actions */}
                    {profile?.isAdmin && (
                      <td className="p-3 whitespace-nowrap flex gap-2">
                        {editingId === emp._id ? (
                          <>
                            <button
                              onClick={() => handleSubmit(emp._id)}
                              className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md"
                            >
                              <FaCheck /> Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex items-center gap-1 px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded-md"
                            >
                              <FaTimesCircle /> Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(emp)}
                              className="flex items-center gap-1 px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded-md"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(emp._id)}
                              className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md"
                            >
                              <FaTrash /> Delete
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
