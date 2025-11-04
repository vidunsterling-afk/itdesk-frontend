import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { getReminders } from "../api/maintenance.js";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaTools } from "react-icons/fa";

export default function MaintenanceCalendar() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const res = await getReminders();
        const formatted = res.data.map((r) => ({
          id: r._id,
          title: `${r.employee?.name || "Unknown"} - ${
            r.asset?.assetTag || "No Tag"
          }`,
          start: r.reminderDate,
          backgroundColor: r.returned ? "#4caf50" : "#f44336", // ✅ green = returned, red = pending
          borderColor: "#ddd",
          textColor: "#fff",
        }));
        setEvents(formatted);
      } catch (err) {
        console.error("Failed to load calendar events", err);
      }
    };
    fetchReminders();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ✅ Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 bg-white shadow-sm rounded-xl p-4 border border-gray-100">
        <div className="flex items-center gap-3">
          <FaTools className="text-blue-600" size={28} />
          <h2 className="text-2xl font-bold text-gray-800">
            Maintenance Calendar
          </h2>
        </div>

        {/* 🔙 Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 mt-3 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-sm"
        >
          <FaArrowLeft size={16} />
          <span>Back to Maintenance</span>
        </button>
      </div>

      {/* ✅ Calendar Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          height="80vh"
          events={events}
          eventClick={(info) => {
            const { title, start } = info.event;
            alert(
              `🔔 Reminder:\n\n${title}\n📅 Date: ${new Date(
                start
              ).toDateString()}`
            );
          }}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek,dayGridDay",
          }}
          buttonText={{
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day",
          }}
        />
      </div>
    </div>
  );
}
