import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAssetById } from "../api/asset";

export default function AssetView() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await getAssetById(id);
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
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="max-w-xl w-full bg-white shadow-lg rounded-xl p-6 border-t-4 border-blue-600">
        <div className="flex items-center mb-4">
          <img src="/sterling_logo.png" alt="Logo" className="h-10 mr-3" />
          <h1 className="text-2xl font-bold text-blue-600">
            Asset Information
          </h1>
        </div>

        <table className="w-full text-sm border border-gray-300 rounded-lg">
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
              <tr key={label} className="border-t">
                <td className="font-semibold p-2 bg-gray-100 w-1/3">{label}</td>
                <td className="p-2">{value || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-center text-xs text-gray-500 mt-6 italic">
          Sterling Steels IT Department
        </div>
      </div>
    </div>
  );
}
