import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FaExclamationTriangle } from "react-icons/fa";
import { getUsers, updateUser, deleteUser, registerUser } from "../api/auth";
import Swal from "sweetalert2";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    isAdmin: false,
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
      toast.error(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setForm({
      username: user.username,
      email: user.email,
      password: "",
      isAdmin: user.isAdmin,
    });
  };

  const handleUpdate = async () => {
    try {
      await updateUser(selectedUser._id, form);
      toast.success("User updated successfully!");
      setSelectedUser(null);
      setForm({ username: "", email: "", password: "", isAdmin: false });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleAddUser = async () => {
    try {
      await registerUser(form);
      toast.success("User added successfully!");
      setForm({ username: "", email: "", password: "", isAdmin: false });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add user");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the user.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u._id !== id));
      toast.success("User deleted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading)
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-[60vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <motion.p className="text-gray-500 text-lg mt-4">
          Loading users...
        </motion.p>
      </motion.div>
    );

  if (error)
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center bg-red-100 text-red-700 rounded-full w-40 h-40 shadow-lg p-4">
          <FaExclamationTriangle className="text-4xl mb-2 animate-pulse" />
          <span className="text-center font-semibold">{error}</span>
        </div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">
        User Management
      </h2>

      {/* Add/Edit User Form */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-6 bg-white shadow rounded-lg border"
      >
        <h3 className="text-xl font-medium mb-4">
          {selectedUser ? "Edit User" : "Add New User"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="password"
            placeholder={selectedUser ? "Leave blank to keep" : "Password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="p-2 border rounded"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isAdmin}
              onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })}
            />
            Admin
          </label>
        </div>
        <div className="flex gap-2">
          {selectedUser ? (
            <>
              <button
                onClick={handleUpdate}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleAddUser}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add User
            </button>
          )}
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="overflow-x-auto bg-white shadow-md rounded-xl">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left">Username</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Admin</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {users.map((user, i) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className={`border-t hover:bg-gray-50 transition-colors ${
                      i % 2 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="p-3">{user.username}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.isAdmin ? "Yes" : "No"}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="text-center text-gray-500 p-4">No users found</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
