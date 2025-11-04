import { useState, useEffect } from "react";
import {
  getMonths,
  createMonth,
  deleteMonth,
  addAddon,
  updateMonth,
} from "../api/monthApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function MonthData() {
  const [months, setMonths] = useState([]);
  const [form, setForm] = useState({
    month: "",
    provider: "",
    totalUsedGB: 0,
    basePlanGB: 300,
    baseCost: 0,
  });
  const [addonForm, setAddonForm] = useState({
    id: "",
    extraGB: 0,
    cost: 0,
    notes: "",
  });
  const [editForm, setEditForm] = useState(null);
  const [activeTab, setActiveTab] = useState("usage");
  const [loading, setLoading] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [selectedMonthId, setSelectedMonthId] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);

  useEffect(() => {
    fetchMonths();
  }, []);

  const isMonthLocked = (month) => {
    const current = new Date();
    const recordDate = new Date(month.month + "-01");
    return recordDate < new Date(current.getFullYear(), current.getMonth(), 1);
  };

  const handleUnlock = () => {
    const pass = prompt("Enter admin password:");
    if (pass === "sterling") {
      alert("Unlocked ✅ You can now edit or delete old records");
      setAdminUnlocked(true);
    } else {
      alert("❌ Wrong password");
    }
  };

  const fetchMonths = async () => {
    try {
      setTableLoading(true);
      const res = await getMonths();
      setMonths(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTableLoading(false);
    }
  };

  // ➕ Create new month
  const handleCreate = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await createMonth(form);
      setForm({ month: "", provider: "", totalUsedGB: 0 });
      fetchMonths();
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Failed to add month");
      }
    } finally {
      setLoading(false);
    }
  };

  // ➕ Add addon
  const handleAddAddon = async (e) => {
    e.preventDefault();
    if (!addonForm.id) return alert("Select a month first");
    try {
      await addAddon(addonForm.id, {
        extraGB: Number(addonForm.extraGB),
        cost: Number(addonForm.cost),
        notes: addonForm.notes,
      });
      setAddonForm({ id: "", extraGB: 0, cost: 0, notes: "" });
      fetchMonths();
    } catch (err) {
      console.error(err);
      alert("Failed to add addon");
    }
  };

  // ✏️ Update month record
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm) return;
    try {
      await updateMonth(editForm._id, {
        provider: editForm.provider,
        basePlanGB: Number(editForm.basePlanGB),
        baseCost: Number(editForm.baseCost),
        totalUsedGB: Number(editForm.totalUsedGB),
      });
      setEditForm(null);
      fetchMonths();
    } catch (err) {
      console.error(err);
      alert("Failed to update record");
    }
  };

  // ❌ Delete record
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await deleteMonth(id);
      fetchMonths();
    } catch (err) {
      console.error(err);
      alert("Failed to delete record");
    }
  };

  // Computed totals
  const computedMonths = months.map((m) => {
    const addonsTotalGB = m.addons.reduce((a, b) => a + b.extraGB, 0);
    const addonsTotalCost = m.addons.reduce((a, b) => a + b.cost, 0);
    return {
      ...m,
      totalGB: (m.basePlanGB || 300) + addonsTotalGB,
      totalCost: (m.baseCost || 0) + addonsTotalCost,
      addonsTotalGB,
      addonsTotalCost,
    };
  });

  const providerColors = {
    "SLT/FIBRE": "#3b82f6",
    "SLT/FIBRE/SMT": "#6366f1",
    Dialog: "#f59e0b",
    Mobitel: "#10b981",
  };

  const chartData = computedMonths.map((m) => ({
    ...m,
    label: `${m.month} (${m.provider})`,
  }));

  const printReport = () => {
    if (!selectedMonthId.length)
      return alert("Please select one or more months to print");

    const selectedData = computedMonths.filter((m) =>
      selectedMonthId.includes(m._id)
    );

    if (!selectedData.length) return alert("No valid data found");

    const reportWindow = window.open("", "_blank", "width=900,height=1000");

    const allReportsHTML = selectedData
      .map(
        (monthData) => `
      <div class="report-container">
        <div class="header">
          <div>
            <div class="title">ITdesk Internet Usage Report</div>
            <div>${monthData.month}</div>
            <div style="font-size:13px;">Provider: <b>${
              monthData.provider
            }</b></div>
          </div>
          <img src="/sterling_logo.png" alt="company_logo">
        </div>

        <div class="section">
          <h3>Plan Details</h3>
          <div>Base Plan: <b>${monthData.basePlanGB} GB</b></div>
          <div>Base Cost: <b>Rs. ${monthData.baseCost}</b></div>
          <div>Used GB: <b>${monthData.totalUsedGB}</b></div>
          <div>Add-ons: +<b>${monthData.addonsTotalGB} GB</b> / Rs. <b>${
          monthData.addonsTotalCost
        }</b></div>
        </div>

        <div class="summary">
          <div><b>Total Data:</b> ${monthData.totalGB} GB</div>
          <div><b>Total Cost:</b> Rs. ${monthData.totalCost}</div>
        </div>

        <div class="footer">
          Generated on ${new Date().toLocaleString()}<br>
          © ITdesk Internet Usage Tracker
        </div>
      </div>
    `
      )
      .join("");

    const htmlContent = `
    <html>
      <head>
        <title>Internet Usage Reports</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #f8fafc;
            margin: 0;
            padding: 20px;
          }
          .report-container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 700px;
            margin: 40px auto;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 10px;
          }
          .header img {
            height: 60px;
          }
          .title {
            color: #1e40af;
            font-size: 22px;
            font-weight: 700;
          }
          .section {
            margin-top: 25px;
            padding: 15px;
            background: #f1f5f9;
            border-radius: 8px;
          }
          .section h3 {
            margin: 0 0 10px;
            color: #1e3a8a;
          }
          .summary {
            font-size: 16px;
            margin-top: 15px;
            padding: 12px;
            background: #dbeafe;
            border-left: 4px solid #3b82f6;
            border-radius: 6px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        ${allReportsHTML}
        <script>window.print();</script>
      </body>
    </html>
  `;

    reportWindow.document.open();
    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
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
          onClick={() => setActiveTab("usage")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            activeTab === "usage"
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-300"
          }`}
        >
          Usage
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

      {/* USAGE TAB */}
      {activeTab === "usage" && (
        <>
          {/* Add Month Form */}
          <motion.form
            onSubmit={handleCreate}
            className="flex flex-col sm:flex-row sm:flex-wrap gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8"
            whileHover={{ scale: 1.005 }}
          >
            <div className="flex flex-col flex-1 min-w-[150px]">
              <label className="font-semibold text-gray-700 mb-1">Month</label>
              <input
                type="month"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
                required
                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <div className="flex flex-col flex-1 min-w-[150px]">
              <label className="font-semibold text-gray-700 mb-1">
                Provider
              </label>
              <select
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                required
              >
                <option value="">Select Provider</option>
                <option value="SLT/FIBRE">SLT/FIBRE</option>
                <option value="SLT/FIBRE/SMT">SLT/FIBRE/SMT</option>
                <option value="Dialog">Dialog</option>
                <option value="Mobitel">Mobitel</option>
              </select>
            </div>

            <div className="flex flex-col flex-1 min-w-[100px]">
              <label className="font-semibold text-gray-700 mb-1">
                Base GB (default 300)
              </label>
              <input
                type="number"
                value={form.basePlanGB}
                onChange={(e) =>
                  setForm({ ...form, basePlanGB: e.target.value })
                }
                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <div className="flex flex-col flex-1 min-w-[100px]">
              <label className="font-semibold text-gray-700 mb-1">
                Base Cost (Rs.30,000)
              </label>
              <input
                type="number"
                value={form.baseCost}
                onChange={(e) => setForm({ ...form, baseCost: e.target.value })}
                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              />
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
              {loading ? "Saving..." : "Add Month"}
            </motion.button>
          </motion.form>

          {/* Add-on Form */}
          <motion.form
            onSubmit={handleAddAddon}
            className="flex flex-col sm:flex-row sm:flex-wrap gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8"
            whileHover={{ scale: 1.005 }}
          >
            <div className="flex flex-col flex-1 min-w-[150px]">
              <label className="font-semibold text-gray-700 mb-1">
                Select Month
              </label>
              <select
                value={addonForm.id}
                onChange={(e) =>
                  setAddonForm({ ...addonForm, id: e.target.value })
                }
                required
                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="">-- Select --</option>
                {months.map((m) => (
                  <option
                    key={m._id}
                    value={m._id}
                    disabled={isMonthLocked(m) && !adminUnlocked}
                  >
                    {m.month} ({m.provider}){" "}
                    {isMonthLocked(m) && !adminUnlocked ? "🔒" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col flex-1 min-w-[100px]">
              <label className="font-semibold text-gray-700 mb-1">
                Extra GB
              </label>
              <input
                type="number"
                value={addonForm.extraGB}
                onChange={(e) =>
                  setAddonForm({ ...addonForm, extraGB: e.target.value })
                }
                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <div className="flex flex-col flex-1 min-w-[100px]">
              <label className="font-semibold text-gray-700 mb-1">
                Cost (Rs)
              </label>
              <input
                type="number"
                value={addonForm.cost}
                onChange={(e) =>
                  setAddonForm({ ...addonForm, cost: e.target.value })
                }
                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <div className="flex flex-col flex-1 min-w-[200px]">
              <label className="font-semibold text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                value={addonForm.notes}
                onChange={(e) =>
                  setAddonForm({ ...addonForm, notes: e.target.value })
                }
                placeholder="E.g. Extra pack"
                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              className="mt-2 px-6 py-2 font-semibold rounded-lg shadow bg-green-600 text-white hover:bg-green-700 transition-all"
            >
              Add Add-on
            </motion.button>
          </motion.form>

          {/* Table */}
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
              <table className="min-w-full border border-gray-200 rounded-lg bg-white">
                <thead className="bg-gray-100 text-gray-700 font-semibold">
                  <tr>
                    <th className="py-3 px-4 text-left">Month</th>
                    <th className="py-3 px-4 text-left">Provider</th>
                    <th className="py-3 px-4 text-left">Base Plan</th>
                    <th className="py-3 px-4 text-left">Used GB</th>
                    <th className="py-3 px-4 text-left">Add-ons</th>
                    <th className="py-3 px-4 text-left">Total Data</th>
                    <th className="py-3 px-4 text-left">Total Cost</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {computedMonths.length ? (
                    computedMonths.map((m) => (
                      <tr
                        key={m._id}
                        className="border-t hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                      >
                        <td className="py-3 px-4">{m.month}</td>
                        <td className="py-3 px-4">{m.provider}</td>
                        <td className="py-3 px-4">
                          {m.basePlanGB}GB / Rs.{m.baseCost}
                        </td>
                        <td className="py-3 px-4">{m.totalUsedGB}GB</td>
                        <td className="py-3 px-4 text-gray-700">
                          +{m.addonsTotalGB}GB / Rs.{m.addonsTotalCost}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {m.totalGB}GB
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          Rs.{m.totalCost}
                        </td>
                        <td className="py-3 px-4 flex justify-center gap-2 items-center">
                          {isMonthLocked(m) && !adminUnlocked ? (
                            <>
                              <button
                                onClick={handleUnlock}
                                className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 flex items-center gap-1"
                              >
                                🔒 Locked
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditForm(m)}
                                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(m._id)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-6 text-center text-gray-500 italic"
                      >
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* REPORTS TAB */}
      {activeTab === "reports" && (
        <motion.div
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Monthly Internet Usage & Cost
          </h2>

          <div className="flex items-center gap-3 mb-4">
            <select
              multiple
              value={selectedMonthId}
              onChange={(e) =>
                setSelectedMonthId(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="border px-3 py-2 rounded-lg outline-none min-h-[100px]"
            >
              {computedMonths.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.month} - {m.provider}
                </option>
              ))}
            </select>

            <button
              onClick={printReport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Download PDF
            </button>
          </div>

          {computedMonths.length ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#6b7280", fontSize: 14 }}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    tick={{ fill: "#6b7280", fontSize: 14 }}
                    label={{
                      value: "GB",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#374151",
                      fontSize: 14,
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: "#6b7280", fontSize: 14 }}
                    label={{
                      value: "Cost (Rs)",
                      angle: 90,
                      position: "insideRight",
                      fill: "#374151",
                      fontSize: 14,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#f9fafb",
                      borderRadius: 8,
                    }}
                    itemStyle={{ color: "#111827", fontWeight: 600 }}
                    formatter={(value, name) => {
                      if (name === "Total GB") return [`${value} GB`, name];
                      if (name === "Total Cost") return [`Rs.${value}`, name];
                      return [value, name];
                    }}
                  />

                  <Legend
                    verticalAlign="top"
                    wrapperStyle={{ paddingBottom: 20 }}
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-gray-700 font-medium">{value}</span>
                    )}
                  />

                  {/* Bars for Total GB */}
                  <Bar
                    yAxisId="left"
                    dataKey="totalGB"
                    name="Total GB"
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-gb-${index}`}
                        fill={providerColors[entry.provider] || "#3b82f6"}
                      />
                    ))}
                  </Bar>

                  {/* Bars for Total Cost */}
                  <Bar
                    yAxisId="right"
                    dataKey="totalCost"
                    name="Total Cost"
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-cost-${index}`}
                        fill={providerColors[entry.provider] || "#10b981"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 italic text-center mt-8">
              No usage data available. Add some months to view reports.
            </p>
          )}
        </motion.div>
      )}

      {/* EDIT MODAL */}
      {editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              ✏️ Edit Month ({editForm.month})
            </h3>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-1">
                  Provider
                </label>
                <input
                  type="text"
                  value={editForm.provider}
                  onChange={(e) =>
                    setEditForm({ ...editForm, provider: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2"
                  placeholder="Provider"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-1">
                  Base GB
                </label>
                <input
                  type="number"
                  value={editForm.basePlanGB}
                  onChange={(e) =>
                    setEditForm({ ...editForm, basePlanGB: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2"
                  placeholder="Base GB"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-1">
                  Base Cost (Rs)
                </label>
                <input
                  type="number"
                  value={editForm.baseCost}
                  onChange={(e) =>
                    setEditForm({ ...editForm, baseCost: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2"
                  placeholder="Base Cost"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-1">
                  Used GB
                </label>
                <input
                  type="number"
                  value={editForm.totalUsedGB}
                  onChange={(e) =>
                    setEditForm({ ...editForm, totalUsedGB: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2"
                  placeholder="Used GB"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setEditForm(null)}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
