import { useState, useEffect } from "react";
import { createTag, getTags, deleteTag } from "../api/tag";
import { getEmployees } from "../api/employee";
import { getAssets } from "../api/asset";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { getProfile } from "../api/auth";
import { FaTrash, FaPlusCircle, FaTags, FaPrint } from "react-icons/fa";

export default function TagManager() {
  const [tags, setTags] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({
    assetCode: "",
    selectedAsset: "",
    username: "",
    serialNumber: "",
    purchaseDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
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

  // Load data
  const loadData = async () => {
    try {
      setTableLoading(true);
      const [tagsRes, empRes, assetRes] = await Promise.all([
        getTags(),
        getEmployees(),
        getAssets(),
      ]);
      setTags(tagsRes.data || []);
      setEmployees(empRes.data || []);
      setAssets(assetRes.data || []);
    } catch (err) {
      toast.error("Failed to load data", err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Autofill from selected asset
  useEffect(() => {
    const selected = assets.find((a) => a.assetTag === form.selectedAsset);
    if (selected) {
      setForm((prev) => ({
        ...prev,
        serialNumber: selected.serialNumber || "",
        purchaseDate: selected.purchaseDate?.split("T")[0] || "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        serialNumber: "",
        purchaseDate: "",
      }));
    }
  }, [form.selectedAsset, assets]);

  // Create tag
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.assetCode.trim()) {
      toast.error("Please enter a new Asset Code for the tag");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        assetCode: form.assetCode,
        username: form.username || "Not Assigned",
        serialNumber: form.serialNumber,
        purchaseDate: form.purchaseDate,
      };
      const { data: newTag } = await createTag(payload);
      setTags((prev) => [...prev, newTag]);
      toast.success("Tag created successfully!");
      setForm({
        assetCode: "",
        selectedAsset: "",
        username: "",
        serialNumber: "",
        purchaseDate: "",
      });
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create tag");
    } finally {
      setLoading(false);
    }
  };

  // Delete tag
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure you want to delete this tag?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setTags((prev) => prev.filter((t) => t._id !== id));
      await deleteTag(id);
      toast.success("Tag deleted");
      await loadData();
    } catch {
      toast.error("Failed to delete tag");
    }
  };

  // ✨ Print Function - Opens in New Tab
  const handlePrint = () => {
    const newWindow = window.open("", "_blank");
    const printContent = `
    <html>
      <head>
        <title>Asset Tag Labels</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }

          body {
            font-family: 'Poppins', Arial, sans-serif;
            background: #f8f9fa;
            color: #222;
            -webkit-print-color-adjust: exact;
            margin: 0;
            padding: 10mm;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: flex-start;
          }

          h1 {
            width: 100%;
            text-align: center;
            font-size: 20px;
            color: #333;
            margin-bottom: 15px;
          }

          .tag-card {
            width: 48%;
            background: #fff;
            border: 1px solid #ccc;
            border-radius: 10px;
            padding: 10px 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.08);
            box-sizing: border-box;
            margin-bottom: 12px;
            page-break-inside: avoid;
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 110px;
            overflow: hidden;
          }

          .tag-code {
            font-size: 15px;
            font-weight: 700;
            color: #0d6efd;
            border-bottom: 1px dashed #ddd;
            margin-bottom: 6px;
            padding-bottom: 3px;
          }

          .tag-line {
            font-size: 13px;
            margin: 2px 0;
            color: #333;
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .footer {
            width: 100%;
            text-align: center;
            font-size: 11px;
            color: #777;
            margin-top: 20px;
          }

          @media print {
            body {
              background: white;
            }
          }
        </style>
      </head>
      <body>
        <h1>🏷️ Asset Tag Labels</h1>
        ${tags
          .map(
            (tag) => `
          <div class="tag-card">
            <div class="tag-code">${tag.assetCode}</div>
            <div class="tag-line">👤 ${tag.username}</div>
            <div class="tag-line">🔢 ${tag.serialNumber}</div>
            <div class="tag-line">📅 ${new Date(
              tag.purchaseDate
            ).toLocaleDateString()}</div>
          </div>`
          )
          .join("")}
        <div class="footer">Generated on ${new Date().toLocaleString()}</div>
      </body>
    </html>
  `;

    newWindow.document.write(printContent);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print(); // Open print preview
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6 border border-gray-100"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaTags className="text-blue-600" /> Tag Manager
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={handlePrint}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow hover:bg-green-700"
          >
            <FaPrint /> Print Tags
          </motion.button>
        </div>

        {/* Tag Form */}
        {profile?.isAdmin && (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          >
            <input
              type="text"
              placeholder="New Tag Asset Code"
              value={form.assetCode}
              onChange={(e) => setForm({ ...form, assetCode: e.target.value })}
              required
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={form.selectedAsset}
              onChange={(e) =>
                setForm({ ...form, selectedAsset: e.target.value })
              }
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Existing Asset</option>
              {assets.map((a) => (
                <option key={a._id} value={a.assetTag}>
                  {a.assetTag} — {a.name}
                </option>
              ))}
            </select>

            <select
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select User</option>
              {employees.map((e) => (
                <option key={e._id} value={e.name}>
                  {e.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Serial Number"
              value={form.serialNumber}
              readOnly
              className="border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
            />

            <input
              type="date"
              value={form.purchaseDate}
              readOnly
              className="border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
            />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="col-span-full flex justify-center items-center gap-2 bg-blue-600 text-white py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all"
            >
              <FaPlusCircle /> {loading ? "Adding..." : "Add Tag"}
            </motion.button>
          </form>
        )}

        {/* Tag Table */}
        {tableLoading ? (
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 border-b">Tag Asset Code</th>
                  <th className="p-3 border-b">Username</th>
                  <th className="p-3 border-b">Serial Number</th>
                  <th className="p-3 border-b">Purchase Date</th>
                  <th className="p-3 border-b text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <motion.tr
                      key={tag._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                    >
                      <td className="p-3 border-b">{tag.assetCode}</td>
                      <td className="p-3 border-b">{tag.username}</td>
                      <td className="p-3 border-b">{tag.serialNumber}</td>
                      <td className="p-3 border-b">
                        {new Date(tag.purchaseDate).toLocaleDateString()}
                      </td>
                      <td className="p-3 border-b text-center">
                        <button
                          onClick={() => handleDelete(tag._id)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-500 py-4">
                      No tags found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
