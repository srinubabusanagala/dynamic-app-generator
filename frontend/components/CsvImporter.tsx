import { useState } from "react";
import axios from "axios";

export default function CsvImporter({ entityName }: { entityName: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file first.");
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file); // Attach the file

    try {
      await axios.post(`https://dynamic-app-generator.onrender.com/api/csv/${entityName}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert(`✅ CSV successfully imported into ${entityName}! Refresh the page to see the data.`);
      setFile(null);
    } catch (error) {
      alert("❌ Failed to import CSV. Check your file format.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-6 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center">
      <h3 className="text-lg font-bold text-gray-700 mb-2">Bulk Import CSV</h3>
      <p className="text-sm text-gray-500 mb-4">Ensure your column headers match the entity fields exactly.</p>
      
      <div className="flex gap-4 items-center">
        <input 
          type="file" 
          accept=".csv" 
          className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button 
          onClick={handleUpload} 
          disabled={uploading}
          className={`px-4 py-2 rounded font-bold text-white transition-colors ${uploading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {uploading ? "Importing..." : "Upload & Import"}
        </button>
      </div>
    </div>
  );
}