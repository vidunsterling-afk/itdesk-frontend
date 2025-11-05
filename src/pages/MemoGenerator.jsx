import { useState, useEffect, useRef } from "react";
import { getEmployees } from "../api/employee";
import { getAssets } from "../api/asset";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";
import { CiMemoPad } from "react-icons/ci";

export default function MemoGenerator() {
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employeeAssets, setEmployeeAssets] = useState([]);
  const memoRef = useRef();
  const [loading, setLoading] = useState(true);
  const [manualAssets, setManualAssets] = useState([]);
  const [extraItems, setExtraItems] = useState([]);

  const addManualAsset = () => {
    setManualAssets([
      ...manualAssets,
      { assetTag: "", name: "", serialNumber: "" },
    ]);
  };

  const updateManualAsset = (index, field, value) => {
    const updated = [...manualAssets];
    updated[index][field] = value;
    setManualAssets(updated);
  };

  const removeManualAsset = (index) => {
    const updated = [...manualAssets];
    updated.splice(index, 1);
    setManualAssets(updated);
  };

  const addExtraItem = () => {
    setExtraItems([...extraItems, { item: "", description: "", remarks: "" }]);
  };

  const updateExtraItem = (index, field, value) => {
    const updated = [...extraItems];
    updated[index][field] = value;
    setExtraItems(updated);
  };

  const removeExtraItem = (index) => {
    const updated = [...extraItems];
    updated.splice(index, 1);
    setExtraItems(updated);
  };

  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem("memoDataFinal");
    return (
      JSON.parse(saved) || {
        date: new Date().toLocaleDateString(),
        title: "MEMORANDUM",
        from: "Junior Executive - IT",
        body: "Please acknowledge the receipt of following items, which is provided to you during your service at Sterling Steels (Pvt) Ltd.",
        closing:
          "It is your responsibility to use the above items in a manner and according to company ethics & to handover those in a good condition while leaving company role & responsibility.",
        senderSignature: "Vidun Hettiarachchi",
        senderDesignation: "Junior Executive - IT",
        policyNote:
          "I have read, understood and acknowledge the company IT Policy. I will comply with the guidelines set out in the company IT Policy and understand that failure to do so might result in disciplinary or legal actions.\n\nPlease sign by accepting the above conditions.",
      }
    );
  });

  // Fetch employees & assets
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [empRes, assetRes] = await Promise.all([
          getEmployees(),
          getAssets(),
        ]);
        setEmployees(empRes.data);
        setAssets(assetRes.data);
      } catch (err) {
        toast.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Save form to localStorage
  useEffect(() => {
    localStorage.setItem("memoDataFinal", JSON.stringify(form));
  }, [form]);

  // Filter employee assets
  useEffect(() => {
    if (selectedEmployee) {
      const emp = employees.find((e) => e._id === selectedEmployee);
      if (emp) {
        const assigned = assets.filter((a) => a.assignedTo?._id === emp._id);
        setEmployeeAssets(assigned);
      }
    } else {
      setEmployeeAssets([]);
    }
  }, [selectedEmployee, employees, assets]);

  // Print function
  const handlePrint = () => {
    if (!memoRef.current) return;

    const printWindow = window.open("", "_blank", "width=1000,height=800");

    // Get the selected employee data
    const selectedEmp = employees.find((e) => e._id === selectedEmployee);
    const firstName = selectedEmp?.name.split(" ")[0] || "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>IT Asset Memorandum - ${
            selectedEmp?.name || "Employee"
          }</title>
          <meta charset="utf-8">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@300;400;600;700&display=swap" rel="stylesheet">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Source Serif Pro', serif;
              margin: 40px;
              color: #1f2937;
              background: white;
              line-height: 1.6;
              font-size: 14px;
              font-weight: 400;
            }
            
            .memo-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            
            /* Header Styles */
            .memo-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #1d4ed8;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            
            .logo-container img {
              height: 60px;
            }
            
            .date-container {
              text-align: right;
            }
            
            .date-label {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 4px;
              font-weight: 500;
            }
            
            .date-value {
              font-size: 14px;
              font-weight: 600;
              color: #1f2937;
            }
            
            /* Title Styles */
            .memo-title {
              text-align: center;
              font-weight: 700;
              font-size: 26px;
              color: #1d4ed8;
              margin-bottom: 35px;
              letter-spacing: 1px;
              text-transform: uppercase;
            }
            
            /* Employee Info Styles */
            .to-section {
              margin-bottom: 25px;
              position: relative;
            }
            
            .to-label {
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 8px;
              font-size: 15px;
            }
            
            .to-name {
              border-bottom: 1px solid #d1d5db;
              padding-bottom: 4px;
              font-weight: 500;
              min-height: 24px;
            }
            
            .employee-info {
              margin-bottom: 25px;
            }
            
            .info-row {
              display: flex;
              align-items: flex-end;
              margin-bottom: 15px;
              position: relative;
            }
            
            .info-label {
              font-weight: 600;
              color: #1f2937;
              min-width: 120px;
              font-size: 15px;
            }
            
            .info-value {
              border-bottom: 1px solid #d1d5db;
              padding-bottom: 4px;
              flex: 1;
              margin-left: 15px;
              font-weight: 500;
              min-height: 24px;
            }
            
            .salutation {
              margin-bottom: 25px;
              font-size: 15px;
              font-weight: 500;
            }
            
            /* Body Text */
            .memo-body {
              margin-bottom: 30px;
              line-height: 1.7;
              font-size: 15px;
              text-align: justify;
            }
            
            /* Table Styles */
            .asset-table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
              font-size: 13px;
              border: 1px solid #d1d5db;
            }
            
            .asset-table th {
              background-color: #f8fafc;
              border: 1px solid #d1d5db;
              padding: 12px;
              font-weight: 600;
              text-align: left;
              color: #374151;
              font-size: 13px;
            }
            
            .asset-table td {
              border: 1px solid #d1d5db;
              padding: 12px;
              color: #4b5563;
              font-size: 13px;
            }
            
            .asset-table tr:nth-child(even) {
              background-color: #f9fafb;
            }
            
            .section-title {
              font-weight: 600;
              margin-top: 40px;
              margin-bottom: 15px;
              color: #1d4ed8;
              font-size: 16px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
            }
            
            /* Closing Section */
            .closing-section {
              margin: 35px 0;
              line-height: 1.7;
              font-size: 15px;
              text-align: justify;
            }
            
            /* Signature Sections */
            .sender-signature {
              margin: 60px 0 50px 0;
            }
            
            .signature-line {
              border-top: 1px solid #374151;
              width: 300px;
              margin-bottom: 10px;
            }
            
            .sender-name {
              font-weight: 600;
              font-size: 15px;
              margin-bottom: 4px;
              color: #1f2937;
            }
            
            .sender-designation {
              font-size: 14px;
              color: #6b7280;
              font-weight: 500;
            }
            
            /* Policy Section */
            .policy-section {
              margin: 40px 0;
              font-size: 14px;
              color: #4b5563;
              white-space: pre-line;
              line-height: 1.6;
              text-align: justify;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
            
            /* Receiver Signature */
            .receiver-section {
              display: flex;
              justify-content: space-between;
              margin: 80px 0 50px 0;
            }
            
            .signature-box {
              text-align: center;
            }
            
            .signature-box-line {
              border-top: 1px solid #374151;
              width: 280px;
              height: 1px;
              margin-bottom: 10px;
            }
            
            .signature-label {
              font-size: 13px;
              color: #6b7280;
              font-weight: 500;
            }
            
            /* Footer */
            .memo-footer {
              text-align: center;
              margin-top: 60px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
              font-style: italic;
            }
            
            /* Text Styling */
            .bold {
              font-weight: 600;
            }
            
            .text-sm {
              font-size: 13px;
            }
            
            .mb-4 {
              margin-bottom: 16px;
            }
            
            @media print {
              body {
                margin: 25px;
              }
              
              .memo-container {
                max-width: 100%;
              }
              
              .asset-table {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="memo-container">
            <!-- Header -->
            <div class="memo-header">
              <div class="logo-container">
                <img src="/sterling_logo.png" alt="Sterling Steels Logo" onerror="this.style.display='none'">
              </div>
              <div class="date-container">
                <div class="date-label">Date</div>
                <div class="date-value">${form.date}</div>
              </div>
            </div>
            
            <!-- Title -->
            <div class="memo-title">
              ${form.title}
            </div>
            
            <!-- Employee Information -->
            <div class="employee-info">
              <div class="info-row">
                <div class="info-label">To:</div>
                <div class="info-value">${
                  selectedEmp?.name || "Selected Employee"
                }</div>
              </div>
              <div class="info-row">
                <div class="info-label">Department:</div>
                <div class="info-value">${selectedEmp?.department || "-"}</div>
              </div>
              <div class="info-row">
                <div class="info-label">From:</div>
                <div class="info-value">${form.from}</div>
              </div>
            </div>
            
            <div class="salutation">
              Dear ${firstName},
            </div>
            
            <!-- Body -->
            <div class="memo-body">
              ${form.body.replace(/\n/g, "<br>")}
            </div>
            
            <!-- Asset Table -->
            ${
              employeeAssets.length > 0 || manualAssets.length > 0
                ? `
              <div class="section-title">ASSETS PROVIDED</div>
              <table class="asset-table">
                <thead>
                  <tr>
                    <th width="50">#</th>
                    <th>Asset Tag</th>
                    <th>Asset Name</th>
                    <th>Serial Number</th>
                  </tr>
                </thead>
                <tbody>
                  ${[...employeeAssets, ...manualAssets]
                    .map(
                      (asset, index) => `
                    <tr>
                      <td style="text-align: center;">${index + 1}</td>
                      <td>${asset.assetTag || "-"}</td>
                      <td>${asset.name || "-"}</td>
                      <td>${asset.serialNumber || "-"}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            `
                : ""
            }

            <!-- Custom Table -->
            ${
              extraItems.length > 0
                ? `
              <div class="section-title">EXTRA ITEMS</div>
              <table class="asset-table">
                <thead>
                  <tr>
                    <th width="50">#</th>
                    <th>Item</th>
                    <th>Description</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  ${extraItems
                    .map(
                      (a, i) => `
                      <tr>
                        <td style="text-align: center;">${i + 1}</td>
                        <td>${a.item || "-"}</td>
                        <td>${a.description || "-"}</td>
                        <td>${a.remarks || "-"}</td>
                      </tr>
                    `
                    )
                    .join("")}
                </tbody>
              </table>
            `
                : ""
            }
            
            <!-- Closing -->
            <div class="closing-section">
              ${form.closing.replace(/\n/g, "<br>")}
            </div>
            
            <!-- Sender Signature -->
            <div class="sender-signature">
              <div class="signature-line"></div>
              <div class="sender-name">${form.senderSignature}</div>
              <div class="sender-designation">${form.senderDesignation}</div>
            </div>
            
            <!-- Policy Section -->
            <div class="policy-section">
              ${form.policyNote.replace(/\n/g, "<br>")}
            </div>
            
            <!-- Receiver Signature -->
            <div class="receiver-section">
              <div class="signature-box">
                <div class="signature-box-line"></div>
                <div class="signature-label">EMPLOYEE SIGNATURE</div>
              </div>
              <div class="signature-box">
                <div class="signature-box-line"></div>
                <div class="signature-label">DATE</div>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="memo-footer">
              Sterling is a trademark of Sterling Steels Private Limited
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl border border-gray-300 mt-8 mb-16"
    >
      {/* Toolbar */}
      <div className="flex justify-between items-center px-6 py-3 border-b bg-gray-50">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <CiMemoPad size={30} /> Asset Memorandum Creator
        </h2>
        <button
          onClick={handlePrint}
          disabled={!selectedEmployee}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          Print / Save PDF
        </button>
      </div>

      {/* Memo content */}
      <div className="p-10 text-[15px] leading-relaxed" ref={memoRef}>
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-blue-700 pb-3 mb-6">
          <img
            src="/sterling_logo.png"
            alt="Sterling Steels Logo"
            className="h-14"
          />
          <div className="text-right">
            <label className="text-sm text-gray-600 block">Date</label>
            <input
              type="text"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="border-b border-gray-400 text-right focus:outline-none focus:border-blue-500 bg-transparent px-2 py-1"
              placeholder="Enter date"
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center font-bold text-2xl text-blue-700 mb-6">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="text-center focus:outline-none w-full bg-transparent font-bold uppercase tracking-wide"
            placeholder="MEMORANDUM"
          />
        </div>

        {/* Employee selection */}
        <div className="mb-6 relative">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 block mb-2">To:</label>
            <div className="flex items-center gap-2">
              {loading && (
                <FaSpinner className="animate-spin text-blue-500 text-lg ml-2" />
              )}
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                disabled={loading}
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 disabled:bg-gray-100"
              >
                {loading ? (
                  <option disabled>Loading employees...</option>
                ) : (
                  <>
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} — {emp.department}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {selectedEmployee && (
          <>
            {/* Employee info */}
            <div className="mb-6 space-y-4">
              <div className="flex items-end">
                <label className="font-semibold min-w-32">Department:</label>
                <div className="border-b border-gray-400 flex-1 ml-4 py-1">
                  {employees.find((e) => e._id === selectedEmployee)
                    ?.department || "-"}
                </div>
              </div>
              <div className="flex items-end">
                <label className="font-semibold min-w-32">From:</label>
                <input
                  type="text"
                  value={form.from}
                  onChange={(e) => setForm({ ...form, from: e.target.value })}
                  className="border-b border-gray-400 focus:outline-none focus:border-blue-500 bg-transparent px-2 py-1 ml-4 flex-1"
                  placeholder="Junior Executive - IT"
                />
              </div>
            </div>

            <p className="mb-6 text-lg">
              Dear{" "}
              <span className="font-semibold">
                {
                  employees
                    .find((e) => e._id === selectedEmployee)
                    ?.name.split(" ")[0]
                }
              </span>
              ,
            </p>

            {/* Body */}
            <div className="mb-6">
              <label className="text-sm text-gray-600 block mb-2">Body:</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 resize-vertical"
                rows={4}
                placeholder="Enter memorandum body text..."
              />
            </div>

            {/* Asset Table */}
            {employeeAssets.length > 0 && (
              <div className="mb-6">
                <label className="text-sm text-gray-600 block mb-2">
                  Assigned Assets:
                </label>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border-b border-gray-300 p-3 text-left font-semibold w-12">
                          #
                        </th>
                        <th className="border-b border-gray-300 p-3 text-left font-semibold">
                          Asset Tag
                        </th>
                        <th className="border-b border-gray-300 p-3 text-left font-semibold">
                          Asset Name
                        </th>
                        <th className="border-b border-gray-300 p-3 text-left font-semibold">
                          Serial Number
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeAssets.map((a, i) => (
                        <tr key={a._id} className="hover:bg-gray-50">
                          <td className="border-b border-gray-200 p-3 text-center">
                            {i + 1}
                          </td>
                          <td className="border-b border-gray-200 p-3">
                            {a.assetTag}
                          </td>
                          <td className="border-b border-gray-200 p-3">
                            {a.name}
                          </td>
                          <td className="border-b border-gray-200 p-3">
                            {a.serialNumber || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Manual asset entries */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-600">
                  Add Manual Assets:
                </label>
                <button
                  type="button"
                  onClick={addManualAsset}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
                >
                  + Add Row
                </button>
              </div>

              {manualAssets.length > 0 && (
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border-b border-gray-300 p-3 text-left font-semibold w-12">
                          #
                        </th>
                        <th className="border-b border-gray-300 p-3 text-left font-semibold">
                          Asset Tag
                        </th>
                        <th className="border-b border-gray-300 p-3 text-left font-semibold">
                          Asset Name
                        </th>
                        <th className="border-b border-gray-300 p-3 text-left font-semibold">
                          Serial Number
                        </th>
                        <th className="border-b border-gray-300 p-3 text-left font-semibold">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {manualAssets.map((a, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="border-b border-gray-200 p-3 text-center">
                            {i + 1}
                          </td>
                          <td className="border-b border-gray-200 p-3">
                            <input
                              type="text"
                              value={a.assetTag}
                              onChange={(e) =>
                                updateManualAsset(i, "assetTag", e.target.value)
                              }
                              className="w-full border-b border-gray-300 focus:outline-none bg-transparent px-1 py-0.5"
                            />
                          </td>
                          <td className="border-b border-gray-200 p-3">
                            <input
                              type="text"
                              value={a.name}
                              onChange={(e) =>
                                updateManualAsset(i, "name", e.target.value)
                              }
                              className="w-full border-b border-gray-300 focus:outline-none bg-transparent px-1 py-0.5"
                            />
                          </td>
                          <td className="border-b border-gray-200 p-3">
                            <input
                              type="text"
                              value={a.serialNumber}
                              onChange={(e) =>
                                updateManualAsset(
                                  i,
                                  "serialNumber",
                                  e.target.value
                                )
                              }
                              className="w-full border-b border-gray-300 focus:outline-none bg-transparent px-1 py-0.5"
                            />
                          </td>
                          <td className="border-b border-gray-200 p-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeManualAsset(i)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Extra Items Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-600">
                  Extra Additions:
                </label>
                <button
                  type="button"
                  onClick={addExtraItem}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
                >
                  + Add Item
                </button>
              </div>

              {extraItems.length > 0 && (
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border-b border-gray-300 p-3 text-left font-semibold w-12">
                          #
                        </th>
                        <th className="border-b border-gray-300 p-3 text-left font-semibold">
                          Item
                        </th>
                        <th className="border-b border-gray-300 p-3 text-left font-semibold">
                          Description
                        </th>
                        <th className="border-b border-gray-300 p-3 text-left font-semibold">
                          Remarks
                        </th>
                        <th className="border-b border-gray-300 p-3 text-left font-semibold">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {extraItems.map((a, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="border-b border-gray-200 p-3 text-center">
                            {i + 1}
                          </td>
                          <td className="border-b border-gray-200 p-3">
                            <input
                              type="text"
                              value={a.item}
                              onChange={(e) =>
                                updateExtraItem(i, "item", e.target.value)
                              }
                              className="w-full border-b border-gray-300 focus:outline-none bg-transparent px-1 py-0.5"
                            />
                          </td>
                          <td className="border-b border-gray-200 p-3">
                            <input
                              type="text"
                              value={a.description}
                              onChange={(e) =>
                                updateExtraItem(
                                  i,
                                  "description",
                                  e.target.value
                                )
                              }
                              className="w-full border-b border-gray-300 focus:outline-none bg-transparent px-1 py-0.5"
                            />
                          </td>
                          <td className="border-b border-gray-200 p-3">
                            <input
                              type="text"
                              value={a.remarks}
                              onChange={(e) =>
                                updateExtraItem(i, "remarks", e.target.value)
                              }
                              className="w-full border-b border-gray-300 focus:outline-none bg-transparent px-1 py-0.5"
                            />
                          </td>
                          <td className="border-b border-gray-200 p-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeExtraItem(i)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Closing */}
            <div className="mb-8">
              <label className="text-sm text-gray-600 block mb-2">
                Closing Statement:
              </label>
              <textarea
                value={form.closing}
                onChange={(e) => setForm({ ...form, closing: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 resize-vertical"
                rows={3}
                placeholder="Enter closing statement..."
              />
            </div>

            {/* Sender Signature */}
            <div className="mb-10 space-y-3">
              <div className="flex items-center space-x-4">
                <div className="w-48 border-t border-gray-400"></div>
              </div>
              <div>
                <input
                  type="text"
                  value={form.senderSignature}
                  onChange={(e) =>
                    setForm({ ...form, senderSignature: e.target.value })
                  }
                  className="border-b border-gray-400 focus:outline-none focus:border-blue-500 bg-transparent px-2 py-1 font-semibold w-64"
                  placeholder="Sender Name"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={form.senderDesignation}
                  onChange={(e) =>
                    setForm({ ...form, senderDesignation: e.target.value })
                  }
                  className="border-b border-gray-400 focus:outline-none focus:border-blue-500 bg-transparent px-2 py-1 text-sm text-gray-600 w-64"
                  placeholder="Sender Designation"
                />
              </div>
            </div>

            {/* Policy */}
            <div className="mb-10">
              <label className="text-sm text-gray-600 block mb-2">
                Policy Note:
              </label>
              <textarea
                value={form.policyNote}
                onChange={(e) =>
                  setForm({ ...form, policyNote: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md p-3 text-gray-700 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 resize-vertical bg-gray-50"
                rows={5}
                placeholder="Enter policy note..."
              />
            </div>

            {/* Receiver Signature */}
            <div className="flex justify-between mt-10 pt-6 border-t border-gray-300">
              <div className="text-center">
                <div className="w-48 border-t border-gray-400 mx-auto mb-2"></div>
                <span className="text-sm text-gray-600">
                  Employee Signature
                </span>
              </div>
              <div className="text-center">
                <div className="w-48 border-t border-gray-400 mx-auto mb-2"></div>
                <span className="text-sm text-gray-600">Date</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-10 text-xs text-gray-500 italic border-t pt-4">
              Sterling is a trademark of Sterling Steels Private Limited
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
