import { useEffect, useState } from "react";
import {
  getM365Usage,
  refreshM365Usage,
  getLastSync,
  getHighUsageAlerts,
  getInactiveUsers,
  getTopStorageUsers,
  getGrowthTrends,
} from "../api/m365Api";
import { toast } from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { IoSyncOutline } from "react-icons/io5";
import { FaChartLine, FaUsers } from "react-icons/fa6";
import { GoAlertFill } from "react-icons/go";
import { FaUserSlash } from "react-icons/fa";
import { MdDataUsage } from "react-icons/md";
import { IoBarChart } from "react-icons/io5";

export default function M365Dashboard() {
  const [data, setData] = useState([]);
  const [lastSync, setLastSync] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [highUsage, setHighUsage] = useState([]);
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [topStorage, setTopStorage] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  let isSyncOld = lastSync
    ? (Date.now() - new Date(lastSync).getTime()) / (1000 * 60 * 60 * 12) > 1
    : false;

  const formatGB = (mb) => ((mb || 0) / 1024).toFixed(2);

  const fetchData = async () => {
    try {
      const res = await getM365Usage();
      setData(res.data || []);

      const syncRes = await getLastSync();
      setLastSync(syncRes.data.lastSync || null);

      const highRes = await getHighUsageAlerts();
      setHighUsage(highRes.data?.data || []);

      const inactiveRes = await getInactiveUsers();
      setInactiveUsers(inactiveRes.data?.data || []);

      const topRes = await getTopStorageUsers();
      setTopStorage(topRes.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch Microsoft 365 data.");
    }
  };

  const fetchGrowthTrends = async (user) => {
    try {
      if (!user) return setGrowthData([]);
      const res = await getGrowthTrends(user);
      const rawData = res.data?.data || [];
      setGrowthData(
        rawData.map((d) => ({
          date: new Date(d.reportDate).toLocaleDateString(),
          mailboxGB: parseFloat(formatGB(d.mailboxUsedMB)),
          onedriveGB: parseFloat(formatGB(d.onedriveUsedMB)),
        }))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch growth trends.");
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      toast.loading("Refreshing data...", { id: "refresh" });
      await refreshM365Usage();
      await fetchData();
      toast.success("Data refreshed successfully", { id: "refresh" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh data", { id: "refresh" });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchGrowthTrends(selectedUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Microsoft 365 Dashboard
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Last Sync:{" "}
              {lastSync ? new Date(lastSync).toLocaleString() : "N/A"}
            </p>
            {isSyncOld && (
              <p className="text-red-500 text-sm mt-1 font-medium">
                Last sync is over 12 hours old. Please re-sync.
              </p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`px-6 py-3 rounded-xl text-white font-medium transition-all duration-200 flex items-center gap-2 ${
              refreshing
                ? "bg-gray-400 cursor-not-allowed"
                : isSyncOld
                ? "bg-red-600 hover:bg-red-700 hover:shadow-lg transform hover:-translate-y-0.5"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
            }`}
          >
            <span className={`${refreshing ? "animate-spin" : ""}`}>
              <IoSyncOutline />
            </span>
            {refreshing ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <span className="text-2xl">
                <FaUsers />
              </span>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Users</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">
                {data.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <span className="text-2xl">
                <GoAlertFill />
              </span>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">
                High Usage Alerts
              </p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">
                {highUsage.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <span className="text-2xl">
                <FaUserSlash />
              </span>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Inactive Users
              </p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">
                {inactiveUsers.length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Table */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-xl text-gray-800 flex items-center gap-2">
            <span className="text-2xl">
              <MdDataUsage />
            </span>
            User Usage Overview
          </h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {data.length} users
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-left text-sm font-semibold text-gray-700 rounded-l-xl">
                  User
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  Mailbox (GB)
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  OneDrive (Used / Total GB)
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700 rounded-r-xl">
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody>
              {data.length ? (
                data.map((u) => (
                  <tr
                    key={u.userPrincipalName}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="p-4 font-medium text-gray-900">
                      {u.displayName || u.userPrincipalName}
                    </td>
                    <td className="p-4 text-gray-700">
                      {formatGB(u.mailboxUsedMB)}
                    </td>
                    <td className="p-4 text-gray-700">
                      <div className="flex items-center gap-2">
                        <span>{formatGB(u.onedriveUsedMB)}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-500">
                          {formatGB(u.onedriveTotalMB)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {u.lastActivityDate ? (
                        new Date(u.lastActivityDate).toLocaleDateString()
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📭</span>
                      <p>No data available</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* High Usage */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">
              <GoAlertFill />
            </span>
            <h3 className="font-semibold text-lg text-gray-800">
              High Usage Alerts
            </h3>
            {highUsage.length > 0 && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                {highUsage.length} alerts
              </span>
            )}
          </div>
          <div className="space-y-3">
            {highUsage.length ? (
              highUsage.map((u) => (
                <div
                  key={u.userPrincipalName}
                  className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
                >
                  <span className="font-medium text-gray-800 truncate">
                    {u.displayName || u.userPrincipalName}
                  </span>
                  <span className="text-red-600 font-semibold whitespace-nowrap">
                    {formatGB(u.mailboxUsedMB)} / {formatGB(u.mailboxQuotaMB)}{" "}
                    GB
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">
                  <GoAlertFill />
                </span>
                No high usage users
              </div>
            )}
          </div>
        </div>

        {/* Inactive Users */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">
              <FaUserSlash />
            </span>
            <h3 className="font-semibold text-lg text-gray-800">
              Inactive Users
            </h3>
            {inactiveUsers.length > 0 && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                60+ days
              </span>
            )}
          </div>
          <div className="space-y-3">
            {inactiveUsers.length ? (
              inactiveUsers.map((u) => (
                <div
                  key={u.userPrincipalName}
                  className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-100 hover:bg-yellow-100 transition-colors"
                >
                  <span className="font-medium text-gray-800 truncate">
                    {u.displayName || u.userPrincipalName}
                  </span>
                  <span className="text-gray-500 text-sm whitespace-nowrap">
                    {u.lastActivityDate
                      ? new Date(u.lastActivityDate).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">
                  <FaUsers />
                </span>
                All users active
              </div>
            )}
          </div>
        </div>

        {/* Top Storage Users */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">
              <IoBarChart />
            </span>
            <h3 className="font-semibold text-lg text-gray-800">
              Top OneDrive Storage Users
            </h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topStorage.length ? (
              topStorage.map((u, index) => (
                <div
                  key={u.userPrincipalName}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {u.displayName || u.userPrincipalName}
                      </p>
                      <p className="text-blue-600 font-semibold text-sm">
                        {formatGB(u.onedriveUsedMB)} GB
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="md:col-span-3 text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">📁</span>
                No storage data available
              </div>
            )}
          </div>
        </div>

        {/* Growth Trends Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">
              <FaChartLine />
            </span>
            <h3 className="font-semibold text-lg text-gray-800">
              Storage Growth Trends
            </h3>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User to Analyze
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full max-w-md border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Choose a user...</option>
              {data.map((u) => (
                <option key={u.userPrincipalName} value={u.userPrincipalName}>
                  {u.displayName || u.userPrincipalName}
                </option>
              ))}
            </select>
          </div>

          {growthData.length ? (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={growthData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: "14px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mailboxGB"
                    stroke="#1D4ED8"
                    name="Mailbox (GB)"
                    strokeWidth={3}
                    dot={{ fill: "#1D4ED8", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="onedriveGB"
                    stroke="#10B981"
                    name="OneDrive (GB)"
                    strokeWidth={3}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <span className="text-5xl mb-4 block">📊</span>
              <p className="text-gray-500 text-lg font-medium">
                Select a user to view growth trends
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Visualize mailbox and OneDrive storage changes over time
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
