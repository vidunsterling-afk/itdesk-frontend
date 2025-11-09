import { useState } from "react";
import Switch from "react-switch";

export default function Settings() {
  const [settings, setSettings] = useState({
    sidebarExpanded: localStorage.getItem("sidebarExpanded") === "true",
  });

  const toggleSetting = (key) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: !prev[key] };

      // If sidebarExpanded changes, update localStorage for Navbar
      if (key === "sidebarExpanded") {
        localStorage.setItem("sidebarExpanded", newSettings.sidebarExpanded);
      }

      return newSettings;
    });
  };

  const toggles = [{ key: "sidebarExpanded", label: "Lock Sidebar Expanded" }];

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-6">
        {toggles.map((toggle) => (
          <div key={toggle.key} className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">{toggle.label}</span>

            <Switch
              onChange={() => toggleSetting(toggle.key)}
              checked={settings[toggle.key]}
              onColor="#10B981"
              offColor="#D1D5DB"
              onHandleColor="#ffffff"
              offHandleColor="#ffffff"
              handleDiameter={24}
              height={32}
              width={60}
              uncheckedIcon={false}
              checkedIcon={false}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.2)"
              activeBoxShadow="0px 0px 2px 3px #10B981"
              className="react-switch"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
