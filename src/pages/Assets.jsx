import { useEffect, useState } from "react";
import {
  getAssets,
  addAsset,
  updateAsset,
  deleteAsset,
  downloadAssetsExcel,
} from "../api/asset.js";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaTrash, FaEdit, FaCheck, FaTimesCircle } from "react-icons/fa";
import { GrDocumentDownload } from "react-icons/gr";
import toast, { Toaster } from "react-hot-toast";
import { IoAddCircle, IoPrint } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import { BsQrCode } from "react-icons/bs";

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({
    assetTag: "",
    name: "",
    category: "",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    warrantyExpiry: "",
    location: "",
    remarks: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [qrAsset, setQrAsset] = useState(null);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await getAssets();
      setAssets(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await addAsset(form);
      toast.success("Asset added successfully");
      setForm({
        assetTag: "",
        name: "",
        category: "",
        brand: "",
        model: "",
        serialNumber: "",
        purchaseDate: "",
        warrantyExpiry: "",
        location: "",
        remarks: "",
      });
      fetchAssets();
    } catch (err) {
      console.error(err);
      toast.error("Add asset failed");
    }
  };

  const handleDownload = async () => {
    try {
      const response = await downloadAssetsExcel();

      // Create a blob link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "assets_report.xlsx"); // File name
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download report:", err);
    }
  };

  const handleSubmit = async (id) => {
    try {
      await updateAsset(id, form);
      toast.success("Asset updated successfully");
      setEditingId(null);
      setForm({
        assetTag: "",
        name: "",
        category: "",
        brand: "",
        model: "",
        serialNumber: "",
        purchaseDate: "",
        warrantyExpiry: "",
        location: "",
        remarks: "",
      });
      fetchAssets();
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  const handleEdit = (asset) => {
    setEditingId(asset._id);
    setForm({
      ...asset,
      purchaseDate: asset.purchaseDate?.split("T")[0],
      warrantyExpiry: asset.warrantyExpiry?.split("T")[0],
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      assetTag: "",
      name: "",
      category: "",
      brand: "",
      model: "",
      serialNumber: "",
      purchaseDate: "",
      warrantyExpiry: "",
      location: "",
      remarks: "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this asset?")) return;
    try {
      await deleteAsset(id);
      toast.success("Asset deleted successfully");
      fetchAssets();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const handlePrint = (asset) => {
    const printWindow = window.open("", "_blank", "width=700,height=800");

    const formatDate = (date) =>
      date ? new Date(date).toLocaleDateString() : "-";
    const assignedName = asset.assignedTo?.name || "-";
    const assignedEmail = asset.assignedTo?.email || "-";
    const assignedDept = asset.assignedTo?.department || "-";

    const calculateAge = (date) => {
      if (!date) return "-";
      const now = new Date();
      const purchase = new Date(date);
      let years = now.getFullYear() - purchase.getFullYear();
      let months = now.getMonth() - purchase.getMonth();
      let days = now.getDate() - purchase.getDate();
      if (days < 0) {
        months -= 1;
        days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      return `${years}y ${months}m ${days}d`;
    };

    const age = calculateAge(asset.purchaseDate);

    printWindow.document.write(`
    <html>
      <head>
        <title>Asset Card - ${asset.name}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f0f2f5;
            margin: 0;
            padding: 20px;
          }
          .card {
            max-width: 650px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 15px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            padding: 30px;
            border-top: 6px solid #2563eb;
          }
          .card-header {
            display: flex;
            align-items: center;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .card-header img {
            height: 55px;
            margin-right: 15px;
          }
          .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between; /* Push logo left, title right */
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }

          .card-header img.logo {
            height: 55px;
          }

          .card-header h2 {
            font-size: 24px;
            color: #2563eb;
            margin: 0;
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 10px 12px;
            border: 1px solid #ccc;
            text-align: left;
          }
          th {
            background-color: #2563eb;
            color: white;
            font-weight: 600;
          }
          tr:nth-child(even) td {
            background-color: #f9f9f9;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 13px;
            color: #555;
            font-style: italic;
          }
          @media print {
            body { background: white; }
            .card { box-shadow: none; border-top: 6px solid #2563eb; }
          }
        </style>
      </head>
      <body>
          <div class="card">
            <div class="card-header">
            <img src="/sterling_logo.png" alt="Sterling Logo" class="logo">
            <h2>Asset Information</h2>
          </div>
          <table>
            <tr><th>Field</th><th>Value</th></tr>
            <tr><td>Asset Tag</td><td>${asset.assetTag || "-"}</td></tr>
            <tr><td>Name</td><td>${asset.name || "-"}</td></tr>
            <tr><td>Category</td><td>${asset.category || "-"}</td></tr>
            <tr><td>Brand</td><td>${asset.brand || "-"}</td></tr>
            <tr><td>Model</td><td>${asset.model || "-"}</td></tr>
            <tr><td>Serial Number</td><td>${asset.serialNumber || "-"}</td></tr>
            <tr><td>Purchase Date</td><td>${formatDate(
              asset.purchaseDate
            )}</td></tr>
            <tr><td>Warranty Expiry</td><td>${formatDate(
              asset.warrantyExpiry
            )}</td></tr>
            <tr><td>Location</td><td>${asset.location || "-"}</td></tr>
            <tr><td>Status</td><td>${asset.status || "-"}</td></tr>
            <tr><td>Assigned To</td><td>${assignedName}</td></tr>
            <tr><td>Email</td><td>${assignedEmail}</td></tr>
            <tr><td>Department</td><td>${assignedDept}</td></tr>
            <tr><td>Remarks</td><td>${asset.remarks || "-"}</td></tr>
            <tr><td>Age</td><td>${age}</td></tr>
          </table>
          <div class="footer">
            Sterling Steels IT Department
          </div>
        </div>
        <script>
          window.onload = () => window.print();
        </script>
      </body>
    </html>
  `);
    printWindow.document.close();
  };

  const requiredFields = ["assetTag", "name", "category", "serialNumber"];

  return (
    <>
      <div className="p-6">
        <Toaster position="top-right" reverseOrder={false} />

        <div className="flex justify-between items-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-6 text-gray-800"
          >
            Assets
          </motion.h2>
          <div>
            <motion.button
              onClick={handleDownload}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
              }}
              className="px-4 py-2 mb-4 flex items-center gap-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <GrDocumentDownload /> Export
            </motion.button>
          </div>
        </div>

        {/* Add Asset Form */}
        <motion.form
          onSubmit={handleAdd}
          className="bg-white shadow-lg rounded-xl p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {[
            "assetTag",
            "name",
            "category",
            "brand",
            "model",
            "serialNumber",
            "purchaseDate",
            "warrantyExpiry",
            "location",
            "remarks",
          ].map((field) => (
            <div key={field} className="flex flex-col">
              <label className="mb-1 text-gray-700 font-semibold text-sm">
                {field
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </label>
              <input
                type={
                  ["purchaseDate", "warrantyExpiry"].includes(field)
                    ? "date"
                    : "text"
                }
                placeholder={field}
                value={form[field] || ""}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                required={requiredFields.includes(field)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
              />
            </div>
          ))}

          {/* Submit Button */}
          <div className="sm:col-span-2 lg:col-span-3 flex justify-end mt-2">
            <button
              type="submit"
              disabled={!!editingId}
              className="px-6 py-2 flex items-center gap-1 text-white font-semibold rounded-lg shadow-md transition-all 
             bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
            >
              {editingId ? (
                <>
                  <MdEdit size={30} /> Update Asset
                </>
              ) : (
                <>
                  <IoAddCircle size={30} /> Add Asset
                </>
              )}
            </button>
          </div>
        </motion.form>

        <input
          type="text"
          placeholder="Search assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-1/3"
        />

        {/* Assets Table */}
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
                  <th className="p-3 text-left whitespace-nowrap">Asset Tag</th>
                  <th className="p-3 text-left whitespace-nowrap">Name</th>
                  <th className="p-3 text-left whitespace-nowrap">Category</th>
                  <th className="p-3 text-left whitespace-nowrap">
                    Serial Number
                  </th>
                  <th className="p-3 text-left whitespace-nowrap">Status</th>
                  <th className="p-3 text-left whitespace-nowrap">
                    Assigned To
                  </th>
                  <th className="p-3 text-left whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets
                  .filter(
                    (a) =>
                      a.assetTag
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      a.category
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      a.serialNumber
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      a.status
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      a.assignedTo?.name
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((a, i) => (
                    <tr
                      key={a._id}
                      className={`border-t hover:bg-gray-200 transition-colors duration-200 cursor-pointer ${
                        i % 2 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="p-3 whitespace-nowrap flex items-center gap-2">
                        <BsQrCode
                          className="text-blue-600 cursor-pointer hover:text-blue-800"
                          size={20}
                          onClick={() => setQrAsset(a)}
                        />
                        {editingId === a._id ? (
                          <input
                            value={form.assetTag || ""}
                            onChange={(e) =>
                              setForm({ ...form, assetTag: e.target.value })
                            }
                            className="px-2 py-1 border rounded w-full"
                          />
                        ) : (
                          a.assetTag
                        )}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        {editingId === a._id ? (
                          <input
                            value={form.name || ""}
                            onChange={(e) =>
                              setForm({ ...form, name: e.target.value })
                            }
                            className="px-2 py-1 border rounded w-full"
                          />
                        ) : (
                          a.name
                        )}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        {editingId === a._id ? (
                          <input
                            value={form.category || ""}
                            onChange={(e) =>
                              setForm({ ...form, category: e.target.value })
                            }
                            className="px-2 py-1 border rounded w-full"
                          />
                        ) : (
                          a.category
                        )}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        {editingId === a._id ? (
                          <input
                            value={form.serialNumber || ""}
                            onChange={(e) =>
                              setForm({ ...form, serialNumber: e.target.value })
                            }
                            className="px-2 py-1 border rounded w-full"
                          />
                        ) : (
                          a.serialNumber
                        )}
                      </td>

                      <td className="p-3 whitespace-nowrap">{a.status}</td>
                      <td className="p-3 whitespace-nowrap">
                        {a.assignedTo?.name || "-"}
                      </td>

                      <td className="p-3 whitespace-nowrap flex gap-2">
                        {editingId === a._id ? (
                          <>
                            <button
                              onClick={() => handleSubmit(a._id)}
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
                              onClick={() => handleEdit(a)}
                              className="flex items-center gap-1 px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded-md"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(a._id)}
                              className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md"
                            >
                              <FaTrash /> Delete
                            </button>
                            <button
                              onClick={() => handlePrint(a)}
                              className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                            >
                              <IoPrint /> Print
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>

      {qrAsset && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setQrAsset(null)}
        >
          <div
            className="bg-white p-6 rounded-xl shadow-lg relative flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-center">
              QR Code - {qrAsset.name}
            </h2>

            <div className="flex justify-center mb-4">
              <img src={qrAsset.qrCode} alt="QR Code" className="w-64 h-64" />
            </div>

            <div className="flex gap-4">
              {/* Copy JSON Button */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(qrAsset, null, 2)
                  );
                  toast.success("Asset JSON copied!");
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Copy JSON
              </button>

              {/* Print QR Button */}
              <button
                onClick={() => {
                  const printWindow = window.open(
                    "",
                    "_blank",
                    "width=400,height=400"
                  );
                  printWindow.document.write(`
              <html>
                <head>
                  <title>QR Code - ${qrAsset.name}</title>
                  <style>
                    body { text-align: center; font-family: Arial, sans-serif; padding: 20px; }
                    img { margin-top: 20px; width: 300px; height: 300px; }
                  </style>
                </head>
                <body>
                  <h2>${qrAsset.name} - QR Code</h2>
                  <img src="${qrAsset.qrCode}" />
                  <script>
                    window.onload = () => window.print();
                  </script>
                </body>
              </html>
            `);
                  printWindow.document.close();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Print QR
              </button>

              {/* Close Button */}
              <button
                onClick={() => setQrAsset(null)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
