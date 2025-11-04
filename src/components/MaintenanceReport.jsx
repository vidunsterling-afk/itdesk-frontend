import { useEffect, useState } from "react";
import { getReport } from "../api/maintenance.js";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaClipboardList,
  FaChevronDown,
  FaFileExcel,
} from "react-icons/fa";
import { getReportExport } from "../api/maintenance.js";
export default function MaintenanceReportPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openEmployee, setOpenEmployee] = useState(null);
  const navigate = useNavigate();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getReport();
      setReports(res.data);
    } catch (err) {
      console.error("Error fetching report:", err);
      alert("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString() : "—";

  // ✅ group reports by employee
  const grouped = reports.reduce((acc, r) => {
    const name = r.employee?.name || "Unknown Employee";
    if (!acc[name]) acc[name] = [];
    acc[name].push(r);
    return acc;
  }, {});

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 bg-white shadow-sm rounded-xl p-4 border border-gray-100 print:hidden">
        <div className="flex items-center gap-3">
          <FaClipboardList className="text-blue-600" size={28} />
          <h2 className="text-2xl font-bold text-gray-800">
            Maintenance Report
          </h2>
        </div>

        <div className="flex gap-3">
          <button
            onClick={async () => {
              try {
                const res = await getReportExport();
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "maintenance_reports.xlsx");
                document.body.appendChild(link);
                link.click();
                link.remove();
              } catch (err) {
                console.error("Export failed:", err);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-all duration-200"
          >
            <FaFileExcel />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all duration-200"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        {loading ? (
          <p className="text-gray-500 text-center py-10 text-lg">
            Loading report...
          </p>
        ) : reports.length === 0 ? (
          <p className="text-gray-500 text-center py-10 text-lg">
            No returned maintenance records yet.
          </p>
        ) : (
          <div className="space-y-4">
            {Object.keys(grouped).map((emp) => (
              <div
                key={emp}
                className="border rounded-lg overflow-hidden shadow-sm"
              >
                <button
                  onClick={() =>
                    setOpenEmployee(openEmployee === emp ? null : emp)
                  }
                  className="w-full flex justify-between items-center bg-blue-50 px-4 py-3 text-left font-semibold text-gray-800 hover:bg-blue-100 transition"
                >
                  <span>{emp}</span>
                  <FaChevronDown
                    className={`transition-transform ${
                      openEmployee === emp ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openEmployee === emp && (
                  <div className="overflow-x-auto transition-all duration-300">
                    <table className="min-w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-blue-600 text-white text-left">
                          <th className="p-3">Asset</th>
                          <th className="p-3">Reminder Date</th>
                          <th className="p-3">Returned At</th>
                          <th className="p-3">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grouped[emp].map((r) => (
                          <tr
                            key={r._id}
                            className="border-b hover:bg-blue-50 transition-colors"
                          >
                            <td className="p-3 text-gray-800">
                              {r.asset?.assetTag} ({r.asset?.name})
                            </td>
                            <td className="p-3 text-gray-600">
                              {formatDate(r.reminderDate)}
                            </td>
                            <td className="p-3 text-gray-600">
                              {formatDate(r.returnedAt)}
                            </td>
                            <td className="p-3 text-gray-700">
                              {r.notes || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
