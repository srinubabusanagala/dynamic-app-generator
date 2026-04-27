import { useEffect, useState } from "react";
import axios from "axios";

export default function DataTable({ entityName, fields }: { entityName: string, fields: any[] }) {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    // Dynamically fetch data for whatever entity this is
    axios.get(`https://dynamic-app-generator.onrender.com/api/data/${entityName}`)
      .then(res => setRecords(res.data.data))
      .catch(err => console.error("Failed to fetch data", err));
  }, [entityName]);

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            {fields.map(f => (
              <th key={f.name} className="py-3 px-4 text-left text-sm uppercase font-semibold">
                {f.name.replace('_', ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr><td colSpan={fields.length} className="text-center p-4 text-gray-500">No data found.</td></tr>
          ) : (
            records.map((row, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                {fields.map(f => (
                  <td key={f.name} className="py-3 px-4 text-gray-700">
                    {/* Convert booleans to Yes/No, otherwise show text */}
                    {f.type === 'boolean' ? (row[f.name] ? '✅ Yes' : '❌ No') : String(row[f.name] || "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}