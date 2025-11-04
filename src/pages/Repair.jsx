import React, { useState, useEffect } from "react";
import { fetchRepairs, deleteRepair } from "../api/repair.js";
import RepairList from "../components/RepairList.jsx";
import RepairForm from "../components/RepairForm.jsx";
import ReturnRepairModal from "../components/ReturnRepairModal.jsx";

export default function Repair() {
  const [allRepairs, setAllRepairs] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [tab, setTab] = useState("all");
  const [selectedRepair, setSelectedRepair] = useState(null);

  const loadRepairs = async () => {
    try {
      const res = await fetchRepairs();
      setAllRepairs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRepairs();
  }, []);

  useEffect(() => {
    if (tab === "all") setRepairs(allRepairs);
    else setRepairs(allRepairs.filter((r) => r.status === tab));
  }, [tab, allRepairs]);

  const handleReturn = (repair) => setSelectedRepair(repair);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteRepair(id);
        setAllRepairs(allRepairs.filter((r) => r._id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete repair");
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Repair Management</h1>

      <RepairForm onCreated={loadRepairs} />

      <div className="flex gap-4 border-b">
        {["all", "dispatched", "returned"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 ${
              tab === t ? "border-b-2 border-blue-600 font-semibold" : ""
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <RepairList
        repairs={repairs}
        onReturn={handleReturn}
        onDelete={handleDelete}
      />

      {selectedRepair && (
        <ReturnRepairModal
          repair={selectedRepair}
          repairs={repairs}
          onClose={() => setSelectedRepair(null)}
          onReturned={loadRepairs}
        />
      )}
    </div>
  );
}
