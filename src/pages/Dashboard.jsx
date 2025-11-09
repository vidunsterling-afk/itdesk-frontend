import { useEffect, useState, useMemo, useCallback } from "react";
import { getAssets } from "../api/asset.js";
import { getEmployees } from "../api/employee.js";
import { getSoftware } from "../api/software.js";
import { getReminders } from "../api/maintenance.js";
import { getPendingBillCount, getBills } from "../api/bill.js";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FaBoxOpen,
  FaUsers,
  FaLaptopCode,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import { RiBillFill } from "react-icons/ri";
import React from "react";
import Swal from "sweetalert2";

export default function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [software, setSoftware] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeAssetFilter, setActiveAssetFilter] = useState("All");
  const [activeEmployeeFilter, setActiveEmployeeFilter] = useState("All");
  const [activeSoftwareFilter, setActiveSoftwareFilter] = useState("All");
  const [activeBillFilter, setActiveBillFilter] = useState("All");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetRes, empRes, softRes, remRes, billsRes, pendingRes] =
        await Promise.all([
          getAssets(),
          getEmployees(),
          getSoftware(),
          getReminders(),
          getBills(),
          getPendingBillCount(),
        ]);

      setAssets(assetRes.data);
      setEmployees(empRes.data);
      setSoftware(
        softRes.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
      setBills(billsRes.data);
      setPendingCount(pendingRes.data.count);

      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      const events = remRes.data
        .filter((r) => {
          const d = new Date(r.reminderDate);
          return d >= startOfWeek && d <= endOfWeek;
        })
        .map((r) => ({
          id: r._id,
          title: `${r.employee?.name || "Unknown"} - ${r.asset?.assetTag}`,
          start: r.reminderDate,
          color: r.returned ? "#4caf50" : "#f44336",
          textColor: "#fff",
        }));

      setReminders(events);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      alert("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = useCallback((info) => {
    Swal.fire({
      title: "🔔 Reminder",
      html: `
      <strong>${info.event.title}</strong><br/>
      <span style="color: gray;">${new Date(
        info.event.start
      ).toLocaleString()}</span>
    `,
      icon: "info",
      confirmButtonText: "Got it!",
      confirmButtonColor: "#3085d6",
      background: "#f9fafb",
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
    });
  }, []);

  // --- Memoized counts ---
  const assetCounts = useMemo(() => {
    const types = ["Laptop", "PC", "Dongle", "Other"];
    const obj = { All: assets.length };
    types.forEach((t) => {
      obj[t] = assets.filter((a) => a.category === t).length;
    });
    return obj;
  }, [assets]);

  const employeeCounts = useMemo(
    () => ({
      All: employees.length,
      Assigned: employees.filter((e) => e.assignedAssets?.length > 0).length,
      Unassigned: employees.filter((e) => !e.assignedAssets?.length).length,
    }),
    [employees]
  );

  const today = useMemo(() => new Date(), []);
  const softwareWithStatus = useMemo(
    () =>
      software.map((s) => ({
        ...s,
        isExpired: new Date(s.expiryDate) < today,
      })),
    [software, today]
  );

  const softwareCounts = useMemo(
    () => ({
      All: software.length,
      Active: software.filter((s) => new Date(s.expiryDate) >= today).length,
      Expired: software.filter((s) => new Date(s.expiryDate) < today).length,
    }),
    [software, today]
  );

  const billCounts = useMemo(
    () => ({
      All: pendingCount,
      Overdue: bills.filter((b) => !b.paid && new Date(b.dueDate) < today)
        .length,
      NonOverdue: bills.filter((b) => !b.paid && new Date(b.dueDate) >= today)
        .length,
    }),
    [pendingCount, bills, today]
  );

  // --- Callback handlers ---
  const handleAssetFilter = useCallback(
    (type) => setActiveAssetFilter(type),
    []
  );
  const handleEmployeeFilter = useCallback(
    (status) => setActiveEmployeeFilter(status),
    []
  );
  const handleSoftwareFilter = useCallback(
    (status) => setActiveSoftwareFilter(status),
    []
  );
  const handleBillFilter = useCallback(
    (status) => setActiveBillFilter(status),
    []
  );

  useEffect(() => {
    fetchData();
  }, []);

  const latest = (arr, count = 5) => arr.slice(0, count);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  // --- Memoized Table Components ---
  const AssetsTable = React.memo(({ data }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-left">
            <th className="p-3">Asset Tag</th>
            <th className="p-3">Name</th>
            <th className="p-3">Category</th>
            <th className="p-3">Status</th>
            <th className="p-3">Assigned To</th>
          </tr>
        </thead>
        <tbody>
          {data.map((a, i) => (
            <tr
              key={a._id}
              className={`border-t hover:bg-gray-200 transition-colors duration-200 cursor-pointer ${
                i % 2 ? "bg-gray-50" : "bg-white"
              }`}
            >
              <td className="p-3">{a.assetTag}</td>
              <td className="p-3">{a.name}</td>
              <td className="p-3">{a.category}</td>
              <td className="p-3">
                {a.status === "Available" ? (
                  <FaCheckCircle
                    className="text-green-500 text-lg"
                    title="Available"
                  />
                ) : (
                  <FaClock
                    className="text-yellow-500 text-lg"
                    title="Assigned"
                  />
                )}
              </td>
              <td className="p-3">{a.assignedTo?.name || "-"}</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center p-3 text-gray-500">
                No assets found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ));

  const EmployeesTable = React.memo(({ data }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-left">
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Department</th>
          </tr>
        </thead>
        <tbody>
          {data.map((emp, i) => (
            <tr
              key={emp._id}
              className={`border-t hover:bg-gray-200 transition-colors duration-200 cursor-pointer ${
                i % 2 ? "bg-gray-50" : "bg-white"
              }`}
            >
              <td className="p-3">{emp.name}</td>
              <td className="p-3">{emp.email}</td>
              <td className="p-3">{emp.department}</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center p-3 text-gray-500">
                No employees found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ));

  const SoftwareTable = React.memo(({ data }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-left">
            <th className="p-3">Name</th>
            <th className="p-3">Vendor</th>
            <th className="p-3">Expiry</th>
            <th className="p-3">Assigned To</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((s, i) => (
            <tr
              key={s._id}
              className={`border-t hover:bg-gray-200 transition-colors duration-200 cursor-pointer ${
                i % 2 ? "bg-gray-50" : "bg-white"
              }`}
            >
              <td className="p-3">{s.name}</td>
              <td className="p-3">{s.vendor}</td>
              <td className="p-3">
                {new Date(s.expiryDate).toLocaleDateString()}
              </td>
              <td className="p-3">{s.assignedTo?.name || "-"}</td>
              <td className="p-3">
                {s.isExpired ? (
                  <FaTimesCircle
                    className="text-red-500 text-lg"
                    title="Expired"
                  />
                ) : (
                  <FaCheckCircle
                    className="text-green-500 text-lg"
                    title="Active"
                  />
                )}
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center p-3 text-gray-500">
                No software found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ));

  return (
    <div className="p-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold mb-6 text-gray-800"
      >
        Dashboard Overview
      </motion.h2>

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
        <>
          {/* Summary Cards with Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {/* Assets */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="flex flex-col gap-3 p-6 rounded-2xl shadow-lg bg-blue-100"
            >
              <div className="flex justify-between items-center">
                <FaBoxOpen className="text-blue-500 text-3xl" />
                <span className="text-2xl font-bold text-gray-700">
                  {assetCounts[activeAssetFilter] || 0}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Assets</h3>
              <div className="flex gap-2 mt-2 flex-wrap">
                {Object.keys(assetCounts).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleAssetFilter(type)}
                    className={`px-2 py-1 rounded-full text-sm font-medium ${
                      activeAssetFilter === type
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-100"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Employees */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.2}
              className="flex flex-col gap-3 p-6 rounded-2xl shadow-lg bg-green-100"
            >
              <div className="flex justify-between items-center">
                <FaUsers className="text-green-500 text-3xl" />
                <span className="text-2xl font-bold text-gray-700">
                  {employeeCounts[activeEmployeeFilter] || 0}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Employees</h3>
              <div className="flex gap-2 mt-2 flex-wrap">
                {Object.keys(employeeCounts).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleEmployeeFilter(status)}
                    className={`px-2 py-1 rounded-full text-sm font-medium ${
                      activeEmployeeFilter === status
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-green-100"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Software */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.4}
              className="flex flex-col gap-3 p-6 rounded-2xl shadow-lg bg-purple-100"
            >
              <div className="flex justify-between items-center">
                <FaLaptopCode className="text-purple-500 text-3xl" />
                <span className="text-2xl font-bold text-gray-700">
                  {softwareCounts[activeSoftwareFilter] || 0}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Software</h3>
              <div className="flex gap-2 mt-2 flex-wrap">
                {Object.keys(softwareCounts).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleSoftwareFilter(status)}
                    className={`px-2 py-1 rounded-full text-sm font-medium ${
                      activeSoftwareFilter === status
                        ? "bg-purple-500 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-purple-100"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Bill Reminders */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.6}
              className="flex flex-col gap-3 p-6 rounded-2xl shadow-lg bg-red-100"
            >
              <div className="flex justify-between items-center">
                <RiBillFill className="text-red-500 text-3xl" />
                <span className="text-2xl font-bold text-gray-700">
                  {billCounts[activeBillFilter] || 0}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Bill Reminders
              </h3>
              <div className="flex gap-2 mt-2 flex-wrap">
                {Object.keys(billCounts).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleBillFilter(status)}
                    className={`px-2 py-1 rounded-full text-sm font-medium ${
                      activeBillFilter === status
                        ? "bg-red-500 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-red-100"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Weekly Calendar */}
          <div className="bg-white shadow-lg rounded-2xl p-6 mb-10 w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Weekly Reminders
              </h3>
            </div>
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridWeek"
              events={reminders}
              eventClick={handleEventClick}
              height={400}
              headerToolbar={{
                start: "title",
                center: "",
                end: "prev,next today",
              }}
            />
          </div>

          {/* Latest Data Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.8}
              className="bg-white shadow-lg rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Latest Assets
              </h3>
              <AssetsTable data={latest(assets)} />
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="bg-white shadow-lg rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Latest Employees
              </h3>
              <EmployeesTable data={latest(employees)} />
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1.2}
              className="bg-white shadow-lg rounded-2xl p-6 lg:col-span-2"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Latest Software
              </h3>
              <SoftwareTable data={latest(softwareWithStatus)} />
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
