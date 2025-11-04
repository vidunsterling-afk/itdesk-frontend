import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaLaptop } from "react-icons/fa";

const FLOOR_PLAN_WIDTH = 1200;

export default function FloorPlanEditorStyled() {
  const [assets, setAssets] = useState([]);
  const [adding, setAdding] = useState(false);
  const containerRef = useRef(null);

  const handleClick = (e) => {
    if (!adding) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setAssets([
      ...assets,
      {
        id: Date.now(),
        name: "New Asset",
        x,
        y,
        width: 40,
        height: 40,
      },
    ]);
  };

  const handleDragStop = (id, x, y) => {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, x, y } : a)));
  };

  return (
    <div className="flex flex-col items-center p-6">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setAdding(!adding)}
        className={`mb-6 px-4 py-2 rounded-xl font-medium text-white transition-colors ${
          adding
            ? "bg-red-500 hover:bg-red-600"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {adding ? "Cancel Add" : "Add Asset"}
      </motion.button>

      <motion.div
        ref={containerRef}
        onClick={handleClick}
        className="relative border rounded-2xl shadow-lg overflow-hidden bg-gray-50"
        style={{
          width: FLOOR_PLAN_WIDTH,
          height: FLOOR_PLAN_WIDTH * 0.5625,
        }}
      >
        {/* Floor Plan PNG */}
        <img
          src="/Floor_Plan.png"
          alt="Floor Plan"
          className="w-full h-full object-contain"
        />

        {/* Assets */}
        {assets.map((asset) => (
          <Rnd
            key={asset.id}
            size={{ width: asset.width, height: asset.height }}
            position={{ x: asset.x, y: asset.y }}
            bounds="parent"
            onDragStop={(e, d) => handleDragStop(asset.id, d.x, d.y)}
          >
            <motion.div
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="w-full h-full flex items-center justify-center text-white text-xl cursor-grab bg-blue-500 rounded-full shadow-md"
              title={asset.name}
            >
              <FaLaptop />
            </motion.div>
          </Rnd>
        ))}
      </motion.div>

      <div className="mt-6 w-full max-w-4xl bg-white rounded-xl shadow p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Asset Coordinates
        </h3>
        <pre className="text-sm text-gray-600">
          {JSON.stringify(assets, null, 2)}
        </pre>
      </div>
    </div>
  );
}
