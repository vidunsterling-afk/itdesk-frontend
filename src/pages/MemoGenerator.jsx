import { useState, useEffect, useRef } from "react";
import { getEmployees } from "../api/employee";
import { getAssets } from "../api/asset";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function MemoGenerator() {
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employeeAssets, setEmployeeAssets] = useState([]);
  const memoRef = useRef(); // Ref for printing

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
        const [empRes, assetRes] = await Promise.all([
          getEmployees(),
          getAssets(),
        ]);
        setEmployees(empRes.data);
        setAssets(assetRes.data);
      } catch (err) {
        toast.error("Failed to load data", err);
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

    // Clone the memo
    const clone = memoRef.current.cloneNode(true);

    // Replace inputs, textareas, selects with text spans
    clone.querySelectorAll("input, textarea, select").forEach((el) => {
      const span = document.createElement("span");

      // Preserve line breaks for textareas
      if (el.tagName === "TEXTAREA") {
        span.innerHTML = el.value.replace(/\n/g, "<br>");
      } else if (el.tagName === "SELECT") {
        // Show selected option text, fallback to empty
        span.textContent = el.selectedOptions[0]?.text || "";
      } else {
        span.textContent = el.value;
      }

      // Add some styling to keep spacing
      span.style.whiteSpace = "pre-line";
      el.parentNode.replaceChild(span, el);
    });

    const content = clone.innerHTML;
    const printWindow = window.open("", "_blank", "width=900,height=700");

    printWindow.document.write(`
    <html>
      <head>
        <title>Print Memo</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { margin: 20px; font-family: sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 8px; }
          th { background-color: #f0f0f0; }
          .whitespace-pre-line { white-space: pre-line; }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `);

    printWindow.document.close();

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
      <div className="flex justify-between items-center px-6 py-3 border-b bg-gray-50 print:hidden">
        <h2 className="text-lg font-semibold text-gray-800">
          🧾 IT Asset Memorandum Creator
        </h2>
        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Print / Save PDF
        </button>
      </div>

      {/* Memo content */}
      <div className="p-10 text-[15px] leading-relaxed" ref={memoRef}>
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-blue-700 pb-3 mb-6">
          <img src="/sterling_logo.png" alt="Logo" className="h-14" />
          <div className="text-right">
            <label className="text-sm text-gray-600 block">Date</label>
            <input
              type="text"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="border-b border-gray-400 text-right focus:outline-none"
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center font-bold text-2xl text-blue-700 underline mb-6">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="text-center focus:outline-none w-full bg-transparent"
          />
        </div>

        {/* Employee selection */}
        <div className="mb-4 flex flex-row items-center gap-2">
          <label className="text-sm text-gray-600">To:</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="border-b border-gray-400 w-full focus:outline-none bg-transparent"
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name} — {emp.department}
              </option>
            ))}
          </select>
        </div>

        {selectedEmployee && (
          <>
            {/* Employee info */}
            <div className="mb-4">
              <p>
                <strong>Department:</strong>{" "}
                {employees.find((e) => e._id === selectedEmployee)
                  ?.department || "-"}
              </p>
              <p>
                <strong>From:</strong>{" "}
                <input
                  type="text"
                  value={form.from}
                  onChange={(e) => setForm({ ...form, from: e.target.value })}
                  className="border-b border-gray-400 w-1/2 focus:outline-none bg-transparent"
                />
              </p>
            </div>

            <p className="mb-4">
              Dear{" "}
              {
                employees
                  .find((e) => e._id === selectedEmployee)
                  ?.name.split(" ")[0]
              }
              ,
            </p>

            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:ring focus:ring-blue-200"
              rows={3}
            />

            {/* Asset Table */}
            {employeeAssets.length > 0 && (
              <table className="w-full border-collapse mb-4 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 p-2 w-12">#</th>
                    <th className="border border-gray-400 p-2">Asset Tag</th>
                    <th className="border border-gray-400 p-2">Asset Name</th>
                    <th className="border border-gray-400 p-2">
                      Serial Number
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employeeAssets.map((a, i) => (
                    <tr key={a._id}>
                      <td className="border border-gray-300 p-2 text-center">
                        {i + 1}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {a.assetTag}
                      </td>
                      <td className="border border-gray-300 p-2">{a.name}</td>
                      <td className="border border-gray-300 p-2">
                        {a.serialNumber || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Closing */}
            <textarea
              value={form.closing}
              onChange={(e) => setForm({ ...form, closing: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 mb-8 focus:ring focus:ring-blue-200"
              rows={3}
            />

            {/* Sender Signature */}
            <div className="text-left mb-10 whitespace-pre-line">
              <p>....................................................</p>
              <input
                type="text"
                value={form.senderSignature}
                onChange={(e) =>
                  setForm({ ...form, senderSignature: e.target.value })
                }
                className="text-left focus:outline-none bg-transparent font-medium block"
              />
              <input
                type="text"
                value={form.senderDesignation}
                onChange={(e) =>
                  setForm({ ...form, senderDesignation: e.target.value })
                }
                className="text-left focus:outline-none bg-transparent font-medium block"
              />
            </div>

            {/* Policy */}
            <textarea
              value={form.policyNote}
              onChange={(e) => setForm({ ...form, policyNote: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 mb-10 text-gray-700 text-[14px] italic focus:ring focus:ring-blue-200"
              rows={5}
            />

            {/* Receiver Signature */}
            <div className="flex justify-between mt-10">
              <div className="text-center">
                ........................................
                <br />
                <span className="text-sm">Employee Signature</span>
              </div>
              <div className="text-center">
                ........................................
                <br />
                <span className="text-sm">Date</span>
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
