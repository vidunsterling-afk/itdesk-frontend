import React, { useState, useEffect } from "react";
import { fetchRepairs, deleteRepair } from "../api/repair.js";
import RepairList from "../components/RepairList.jsx";
import RepairForm from "../components/RepairForm.jsx";
import ReturnRepairModal from "../components/ReturnRepairModal.jsx";
import { getProfile } from "../api/auth.js";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function Repair() {
  const [allRepairs, setAllRepairs] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [tab, setTab] = useState("all");
  const [selectedRepair, setSelectedRepair] = useState(null);
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

  const loadRepairs = async () => {
    try {
      const res = await fetchRepairs();
      setAllRepairs(res.data);
    } catch (err) {
      toast.error(err);
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
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteRepair(id);
        setAllRepairs(allRepairs.filter((r) => r._id !== id));
        toast.success("Repair deleted successfully.");
      } catch (err) {
        toast.error(`Failed to delete repair: ${err}.`);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Repair Management</h1>

      {profile?.isAdmin && <RepairForm onCreated={loadRepairs} />}

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
