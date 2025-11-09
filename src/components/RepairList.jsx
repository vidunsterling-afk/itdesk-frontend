import { useState, useEffect } from "react";
import { getProfile } from "../api/auth";
import toast from "react-hot-toast";

export default function RepairList({ repairs, onReturn, onDelete }) {
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
  const handlePrintQr = (qrUrl) => {
    if (!qrUrl) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Gate Pass QR</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              font-family: sans-serif;
            }
            img {
              width: 250px;
              height: 250px;
              margin-bottom: 16px;
            }
            p {
              font-size: 16px;
              color: #333;
            }
          </style>
        </head>
        <body>
          <img src="${qrUrl}" alt="QR Code" />
          <p>Scan this QR to return asset</p>
        </body>
      </html>
    `);
    printWindow.document.close();

    printWindow.onload = () => {
      const checkImg = () => {
        const img = printWindow.document.querySelector("img");
        if (img && img.complete) {
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
          }, 300);
        } else {
          setTimeout(checkImg, 100);
        }
      };
      checkImg();
    };
  };

  return (
    <div className="overflow-x-auto border rounded-lg shadow-sm">
      <table className="min-w-full table-auto divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[
              "Asset",
              "Vendor",
              "Gate Pass",
              "Status",
              "Dispatch Date",
              "Return Date",
              ...(profile?.isAdmin ? ["Actions"] : []),
            ].map((heading) => (
              <th
                key={heading}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {repairs.map((r) => (
            <tr
              key={r._id}
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              <td className="px-4 py-3">{r.asset?.name || "-"}</td>
              <td className="px-4 py-3">{r.vendor}</td>
              <td className="px-4 py-3 flex items-center gap-2">
                {r.gatePassNumber}
                {r.qrCode && (
                  <button
                    onClick={() => handlePrintQr(r.qrCode)}
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs"
                  >
                    Print QR
                  </button>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    r.status === "dispatched"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-3">
                {new Date(r.dispatchDate).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                {r.returnDate
                  ? new Date(r.returnDate).toLocaleDateString()
                  : "-"}
              </td>
              {profile?.isAdmin && (
                <td className="px-4 py-3 flex gap-2">
                  {r.status === "dispatched" && (
                    <button
                      onClick={() => onReturn(r)}
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors duration-150"
                    >
                      Return
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(r._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors duration-150"
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
          {repairs.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                No repairs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
