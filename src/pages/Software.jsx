import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  addSoftware,
  getSoftware,
  updateSoftware,
  deleteSoftware,
} from "../api/software.js";
import { getEmployees } from "../api/employee.js";
import { FaEdit, FaTrash, FaCheck, FaTimesCircle } from "react-icons/fa";
import { getProfile } from "../api/auth.js";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function Software() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    vendor: "",
    licenseKey: "",
    assignedTo: null,
    purchaseDate: "",
    expiryDate: "",
    renewalCycle: "yearly",
    cost: "",
    paymentMethod: "",
    notes: "",
    autoRenew: true,
  });

  const [softwareList, setSoftwareList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // Fetch employees & software
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, softRes] = await Promise.all([
          getEmployees(),
          getSoftware(),
        ]);
        setEmployees(empRes.data);
        setSoftwareList(softRes.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateSoftware(editingId, {
          ...form,
          assignedTo: form.assignedTo || null,
        });
        toast.success("Software updated");
      } else {
        await addSoftware({ ...form, assignedTo: form.assignedTo || null });
        toast.success("Software added");
      }

      setForm({
        name: "",
        category: "",
        vendor: "",
        licenseKey: "",
        assignedTo: null,
        purchaseDate: "",
        expiryDate: "",
        renewalCycle: "yearly",
        cost: "",
        paymentMethod: "",
        notes: "",
        autoRenew: true,
      });
      setEditingId(null);
      const res = await getSoftware();
      setSoftwareList(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    }
  };

  const handleEdit = (software) => {
    setForm({ ...software, assignedTo: software.assignedTo?._id || null });
    setEditingId(software._id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      name: "",
      category: "",
      vendor: "",
      licenseKey: "",
      assignedTo: null,
      purchaseDate: "",
      expiryDate: "",
      renewalCycle: "yearly",
      cost: "",
      paymentMethod: "",
      notes: "",
      autoRenew: true,
    });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this software?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        await deleteSoftware(id);
        setSoftwareList(softwareList.filter((s) => s._id !== id));
      } catch (err) {
        console.error(err);
        alert("Delete failed");
      }
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
        Software / Licenses
      </motion.h2>

      {/* Form */}
      {profile?.isAdmin && (
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-xl p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {[
            "name",
            "category",
            "vendor",
            "licenseKey",
            "assignedTo",
            "purchaseDate",
            "expiryDate",
            "renewalCycle",
            "cost",
            "paymentMethod",
            "notes",
          ].map((field) => (
            <div key={field} className="flex flex-col">
              <label className="mb-1 text-gray-700 font-semibold text-sm">
                {field
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </label>
              {field === "assignedTo" ? (
                <select
                  value={form.assignedTo || ""}
                  onChange={(e) =>
                    setForm({ ...form, assignedTo: e.target.value || null })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                >
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              ) : field === "renewalCycle" ? (
                <select
                  value={form.renewalCycle}
                  onChange={(e) =>
                    setForm({ ...form, renewalCycle: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                >
                  <option value="none">None</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              ) : field === "notes" ? (
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors resize-none"
                />
              ) : field === "autoRenew" ? null : (
                <input
                  type={
                    ["purchaseDate", "expiryDate"].includes(field)
                      ? "date"
                      : field === "cost"
                      ? "number"
                      : "text"
                  }
                  value={form[field] || ""}
                  onChange={(e) =>
                    setForm({ ...form, [field]: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                />
              )}
            </div>
          ))}

          {/* Auto Renew */}
          <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-3">
            <input
              type="checkbox"
              checked={form.autoRenew}
              onChange={(e) =>
                setForm({ ...form, autoRenew: e.target.checked })
              }
            />
            <span className="text-gray-700 font-semibold">Auto Renew</span>
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2 lg:col-span-3 flex justify-end mt-2">
            <button
              type="submit"
              disabled={!!editingId}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
            >
              {editingId ? "Update Software" : "Add Software"}
            </button>
          </div>
        </motion.form>
      )}

      {/* Table */}
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
        <div className="overflow-x-auto bg-white shadow-md rounded-xl">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left whitespace-nowrap">Name</th>
                <th className="p-3 text-left whitespace-nowrap">Vendor</th>
                <th className="p-3 text-left whitespace-nowrap">Expiry</th>
                <th className="p-3 text-left whitespace-nowrap">Assigned To</th>
                <th className="p-3 text-left whitespace-nowrap">Status</th>
                {profile?.isAdmin && (
                  <th className="p-3 text-left whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {softwareList.map((s, i) => (
                <tr
                  key={s._id}
                  className={`border-t hover:bg-gray-50 ${
                    i % 2 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="p-3 whitespace-nowrap">
                    {editingId === s._id ? (
                      <input
                        value={form.name || ""}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        className="px-2 py-1 border rounded w-full"
                      />
                    ) : (
                      s.name
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {editingId === s._id ? (
                      <input
                        value={form.vendor || ""}
                        onChange={(e) =>
                          setForm({ ...form, vendor: e.target.value })
                        }
                        className="px-2 py-1 border rounded w-full"
                      />
                    ) : (
                      s.vendor
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {editingId === s._id ? (
                      <input
                        type="date"
                        value={form.expiryDate?.split("T")[0] || ""}
                        onChange={(e) =>
                          setForm({ ...form, expiryDate: e.target.value })
                        }
                        className="px-2 py-1 border rounded w-full"
                      />
                    ) : (
                      new Date(s.expiryDate).toLocaleDateString()
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {editingId === s._id ? (
                      <select
                        value={form.assignedTo || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            assignedTo: e.target.value || null,
                          })
                        }
                        className="px-2 py-1 border rounded w-full"
                      >
                        <option value="">Unassigned</option>
                        {employees.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      s.assignedTo?.name || "-"
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {new Date(s.expiryDate) < new Date() ? "Expired" : "Active"}
                  </td>
                  {profile?.isAdmin && (
                    <td className="p-3 whitespace-nowrap flex gap-2">
                      {editingId === s._id ? (
                        <>
                          <button
                            onClick={handleSubmit}
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
                            onClick={() => handleEdit(s)}
                            className="flex items-center gap-1 px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded-md"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(s._id)}
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
              {softwareList.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-3">
                    No software records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
