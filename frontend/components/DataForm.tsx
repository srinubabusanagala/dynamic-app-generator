import { useState } from "react";
import axios from "axios";

export default function DataForm({ entityName, fields }: { entityName: string, fields: any[] }) {
  const [formData, setFormData] = useState<any>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Dynamically post to the correct entity route
      await axios.post(`https://dynamic-app-generator.onrender.com/api/data/${entityName}`, formData)
      alert("✅ Record Saved Successfully! Refresh the page to see it in the table.");
      setFormData({}); // Clear form
    } catch (error) {
      alert("❌ Error saving data.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-4 capitalize">Create New {entityName}</h3>
      
      <div className="space-y-4">
        {fields.map(f => (
          <div key={f.name}>
            <label className="block text-sm font-semibold text-gray-700 mb-1 capitalize">
              {f.name.replace('_', ' ')} {f.required && <span className="text-red-500">*</span>}
            </label>
            
            <input 
              type={f.type === 'boolean' ? 'checkbox' : 'text'}
              required={f.required}
              // 👇 Updated Tailwind classes for much better visibility
              className={`border border-gray-300 rounded p-3 text-gray-900 text-lg font-medium bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm ${f.type === 'boolean' ? 'w-6 h-6 mt-1 cursor-pointer' : 'w-full max-w-md'}`}
              onChange={e => setFormData({
                ...formData, 
                [f.name]: f.type === 'boolean' ? e.target.checked : e.target.value
              })}
            />
          </div>
        ))}
      </div>

      <button type="submit" className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition duration-200">
        Submit Data
      </button>
    </form>
  );
}