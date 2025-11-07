import { useState, useEffect } from "react";
import { uploadReport, getReports } from "../api/reportApi";

export default function AttachmentReport() {
  const [parsedData, setParsedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState("upload"); // upload | history
  const [search, setSearch] = useState("");

  // fetch history when switched to history view
  useEffect(() => {
    if (view === "history") fetchHistory();
  }, [view]);

  const fetchHistory = async () => {
    try {
      const res = await getReports();
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\n|\r/).filter((line) => line.includes("|"));

      // first line = headers
      const data = lines.slice(1).map((line) => {
        const cols = line.split("|");
        return {
          mobileNumber: cols[0]?.trim(),
          name: cols[1]?.trim(),
          dataBundle: Number(cols[2]) || 0,
          balance: Number(cols[3]) || 0,
          usage: Number(cols[4]) || 0,
          topupBundle: Number(cols[5]) || 0,
          topupUsage: Number(cols[6]) || 0,
          timestamp: new Date(cols[7]?.trim()),
        };
      });

      setParsedData(data);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!parsedData.length) return alert("No data to upload!");
    setLoading(true);
    try {
      await uploadReport(parsedData);
      alert("✅ Uploaded successfully!");
      setParsedData([]);
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(
    (row) =>
      row.name?.toLowerCase().includes(search.toLowerCase()) ||
      row.mobileNumber?.includes(search)
  );

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <div className="flex justify-between mb-4 items-center">
        <h1 className="text-2xl font-bold">Attachment Report Manager</h1>
        <div className="space-x-2">
          <button
            onClick={() => setView("upload")}
            className={`px-4 py-2 rounded-lg ${
              view === "upload" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => setView("history")}
            className={`px-4 py-2 rounded-lg ${
              view === "history" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* UPLOAD VIEW */}
      {view === "upload" && (
        <div className="p-4 border rounded-lg bg-white shadow">
          <h2 className="text-lg font-semibold mb-2">
            Upload and Preview Attachment Report
          </h2>
          <input
            type="file"
            accept=".html"
            onChange={handleFile}
            className="mb-3"
          />

          {parsedData.length > 0 && (
            <>
              <p className="mb-2">{parsedData.length} records parsed</p>
              <button
                onClick={handleUpload}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg mb-4"
              >
                {loading ? "Uploading..." : "Upload to MongoDB"}
              </button>

              <div className="overflow-auto max-h-[400px] border rounded-lg">
                <table className="min-w-full text-sm border-collapse">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="p-2 border">Mobile</th>
                      <th className="p-2 border">Name</th>
                      <th className="p-2 border">Data</th>
                      <th className="p-2 border">Balance</th>
                      <th className="p-2 border">Usage</th>
                      <th className="p-2 border">Topup</th>
                      <th className="p-2 border">Topup Usage</th>
                      <th className="p-2 border">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((row, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-2 border">{row.mobileNumber}</td>
                        <td className="p-2 border">{row.name}</td>
                        <td className="p-2 border">{row.dataBundle}</td>
                        <td className="p-2 border">{row.balance}</td>
                        <td className="p-2 border">{row.usage}</td>
                        <td className="p-2 border">{row.topupBundle}</td>
                        <td className="p-2 border">{row.topupUsage}</td>
                        <td className="p-2 border">
                          {new Date(row.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* HISTORY VIEW */}
      {view === "history" && (
        <div className="p-4 border rounded-lg bg-white shadow">
          <div className="flex justify-between mb-4 items-center">
            <h2 className="text-lg font-semibold">Upload History</h2>
            <input
              type="text"
              placeholder="Search by name or number"
              className="border rounded-lg px-3 py-1 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filteredHistory.length === 0 ? (
            <p>No records found</p>
          ) : (
            <div className="overflow-auto max-h-[500px] border rounded-lg">
              <table className="min-w-full text-sm border-collapse">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-2 border">Mobile</th>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Data</th>
                    <th className="p-2 border">Balance</th>
                    <th className="p-2 border">Usage</th>
                    <th className="p-2 border">Timestamp</th>
                    <th className="p-2 border">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-2 border">{row.mobileNumber}</td>
                      <td className="p-2 border">{row.name}</td>
                      <td className="p-2 border">{row.dataBundle}</td>
                      <td className="p-2 border">{row.balance}</td>
                      <td className="p-2 border">{row.usage}</td>
                      <td className="p-2 border">
                        {new Date(row.timestamp).toLocaleString()}
                      </td>
                      <td className="p-2 border">
                        {new Date(row.uploadDate).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
