import React, { useState, useEffect } from "react";
import { createRepair } from "../api/repair.js";
import { getAssets } from "../api/asset.js";

export default function RepairForm({ onCreated }) {
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({
    assetId: "",
    vendor: "",
    reason: "",
    notes: "",
  });
  const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    getAssets()
      .then((res) => setAssets(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createRepair(form);
      setForm({ assetId: "", vendor: "", reason: "", notes: "" });
      setQrUrl(res.data.repair.qrCode); // set QR URL
      onCreated();
    } catch (err) {
      console.error(err);
      alert("Error creating repair");
    }
  };

  const handlePrint = () => {
    if (!qrUrl) return;
    const w = window.open("");
    w.document.write(
      `<img src="${qrUrl}" /><p>Scan this QR to return asset</p>`
    );
    w.print();
    w.close();
  };

  return (
    <div className="space-y-3 p-4 bg-white rounded shadow-md">
      <form onSubmit={handleSubmit} className="space-y-3">
        <select
          name="assetId"
          value={form.assetId}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        >
          <option value="">Select Asset</option>
          {assets.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name} ({a.assetTag})
            </option>
          ))}
        </select>
        <input
          name="vendor"
          value={form.vendor}
          onChange={handleChange}
          placeholder="Vendor"
          className="border p-2 w-full"
          required
        />
        <input
          name="reason"
          value={form.reason}
          onChange={handleChange}
          placeholder="Reason"
          className="border p-2 w-full"
          required
        />
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Notes (optional)"
          className="border p-2 w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Dispatch
        </button>
      </form>

      {qrUrl && (
        <div className="mt-3 flex flex-col items-center gap-2">
          <img src={qrUrl} alt="QR Code" className="w-32 h-32" />
          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
          >
            Print QR
          </button>
        </div>
      )}
    </div>
  );
}
