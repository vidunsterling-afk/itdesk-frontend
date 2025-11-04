import React, { useState, useRef, useEffect } from "react";
import { markReturned } from "../api/repair.js";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

export default function ReturnRepairModal({
  repair,
  onClose,
  onReturned,
  repairs,
}) {
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const scannerInstanceRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!repair) return;

    const formData = new FormData();
    formData.append("notes", notes);
    if (file) formData.append("proofImage", file);

    try {
      await markReturned(repair._id, formData);
      onReturned();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error marking returned");
    }
  };

  const handleScanSuccess = async (decodedText) => {
    console.log("🟢 QR Decoded Text:", decodedText);
    console.log("🔍 Available Repairs:", repairs);

    stopScanning();

    if (!repairs || repairs.length === 0) {
      console.warn("⚠️ No repairs loaded — cannot match QR");
      alert("No repair data available. Please refresh.");
      return;
    }

    // Extract the ID (assuming it’s the last part of the URL)
    const idMatch = decodedText.match(/[0-9a-fA-F]{24}$/);
    const qrId = idMatch ? idMatch[0] : decodedText.trim();
    console.log("🧩 Extracted QR ID:", qrId);

    // Try to find a matching repair
    const matched = repairs.find((r) => r._id === qrId);
    console.log("🔎 Matched Repair:", matched ? matched._id : "❌ None");

    if (matched) {
      try {
        console.log("📤 Sending markReturned request for:", matched._id);
        const formData = new FormData();
        formData.append("notes", "Scanned QR return");

        await markReturned(matched._id, formData);

        console.log("✅ Successfully marked as returned");
        onReturned();
        onClose();
        alert(`✅ ${matched.asset?.name} marked as returned`);
      } catch (err) {
        console.error("❌ Backend error while marking returned:", err);
        alert("Error updating repair via scan");
      }
    } else {
      console.warn("⚠️ QR not recognized or does not match any repair");
      alert("❌ QR not recognized or already returned");
    }
  };

  const handleScanError = (err) => {
    // Only show real camera errors, ignore NotFoundException spam
    if (err && !err.includes("NotFoundException")) {
      console.warn("QR Scan Error:", err);
      setErrorMsg("Error accessing camera or scanning QR.");
    }
  };

  const startScanning = () => {
    setErrorMsg("");
    setIsScanning(true);
  };

  useEffect(() => {
    if (isScanning) {
      scannerInstanceRef.current = new Html5QrcodeScanner(
        "html5qr-scanner",
        {
          fps: 10,
          qrbox: 250,
          rememberLastUsedCamera: false,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        },
        false
      );

      scannerInstanceRef.current.render(handleScanSuccess, handleScanError);
    }

    return () => {
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.clear().catch(console.error);
        scannerInstanceRef.current = null;
      }
    };
  }, [isScanning]);

  const stopScanning = () => {
    setIsScanning(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96 relative">
        <h2 className="text-lg font-semibold mb-3">
          {isScanning
            ? "Scan QR to Return Asset"
            : `Return Asset: ${repair?.asset?.name}`}
        </h2>

        {isScanning ? (
          <div className="space-y-3">
            <div id="html5qr-scanner" className="w-full h-64" />
            {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
            <button
              onClick={stopScanning}
              className="mt-2 bg-red-500 text-white px-3 py-1 rounded w-full"
            >
              Stop Scanning
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              className="border p-2 w-full rounded"
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              accept="image/png, image/jpeg"
              className="w-full"
            />
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={startScanning}
                className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                Scan QR
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-green-600 text-white"
                >
                  Return
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
