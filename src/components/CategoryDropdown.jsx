import { useEffect, useState } from "react";
import { getItems } from "../api/settings.js";

export default function CategoryDropdown({ type, value, onChange }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!type) return;

    const fetchItems = async () => {
      try {
        const fetchedItems = await getItems(type);
        setItems(Array.isArray(fetchedItems) ? fetchedItems : []);
      } catch (err) {
        console.error(`Failed to fetch items for ${type}:`, err);
        setItems([]);
      }
    };

    fetchItems();
  }, [type]);

  // Only render dropdown if there are items
  if (!items.length)
    return (
      <select disabled className="border rounded px-2 py-1">
        <option>No items available</option>
      </select>
    );

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded px-2 py-1"
    >
      {items.map((item) => (
        <option key={item._id || item} value={item.name || item}>
          {item.name || item}
        </option>
      ))}
    </select>
  );
}
