import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicAssetById } from "../api/asset";

export default function AssetView() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await getPublicAssetById(id);
        setAsset(res.data);
      } catch (err) {
        console.error("Failed to fetch asset:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-600 text-lg">
        Loading asset info...
      </p>
    );

  if (!asset)
    return (
      <p className="text-center mt-20 text-red-500 text-lg">
        Asset not found or inaccessible.
      </p>
    );

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-4 sm:p-6 border-t-4 border-blue-600">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center justify-center sm:justify-start">
            <img
              src="/sterling_logo.png"
              alt="Logo"
              className="h-10 sm:h-12 mr-2 sm:mr-3"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-blue-600 text-center sm:text-left">
              Asset Information
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 italic text-center sm:text-right">
            Public view
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm sm:text-base">
            <tbody>
              {[
                ["Asset Tag", asset.assetTag],
                ["Name", asset.name],
                ["Category", asset.category],
                ["Brand", asset.brand],
                ["Model", asset.model],
                ["Serial Number", asset.serialNumber],
                ["Purchase Date", formatDate(asset.purchaseDate)],
                ["Warranty Expiry", formatDate(asset.warrantyExpiry)],
                ["Location", asset.location],
                ["Status", asset.status],
                ["Assigned To", asset.assignedTo?.name || "-"],
                ["Email", asset.assignedTo?.email || "-"],
                ["Department", asset.assignedTo?.department || "-"],
                ["Remarks", asset.remarks],
              ].map(([label, value]) => (
                <tr
                  key={label}
                  className="border-b last:border-b-0 hover:bg-gray-50 transition"
                >
                  <td className="font-semibold p-2 sm:p-3 bg-gray-100 w-1/3 whitespace-nowrap">
                    {label}
                  </td>
                  <td className="p-2 sm:p-3 break-words">{value || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] sm:text-xs text-gray-500 mt-6 italic">
          Sterling Steels IT Department
        </div>
      </div>
    </div>
  );
}
