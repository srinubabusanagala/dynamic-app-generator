"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "../components/DataTable";
import DataForm from "../components/DataForm";
import CsvImporter from "../components/CsvImporter";

const ViewRegistry: Record<string, React.ElementType> = {
  "data_table": DataTable,
  "creation_form": DataForm,
  "csv_importer": CsvImporter,
};

export default function Home() {
  const [config, setConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 👈 New State for Language Switching
  const [lang, setLang] = useState<"en" | "es">("en"); 

  useEffect(() => {
    axios.get("https://dynamic-app-generator.onrender.com/api/config")      .then((response) => setConfig(response.data.data))
      .catch(() => setError("Failed to connect to backend engine."));
  }, []);

  if (error) return <div className="p-10 text-red-500 font-bold">{error}</div>;
  if (!config) return <div className="p-10 text-gray-500 animate-pulse">Loading App Engine...</div>;

  // 👈 Grab the correct translation dictionary based on current language
  const t = config.translations ? config.translations[lang] : {};

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header with Language Toggle */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900">
            {config.app_name} <span className="text-lg text-gray-500 font-medium bg-gray-200 px-2 py-1 rounded">v{config.version}</span>
          </h1>
          
          <button 
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 font-bold rounded shadow-sm hover:bg-indigo-200 transition-colors"
          >
            {lang === "en" ? "🌐 Switch to Spanish" : "🌐 Switch to English"}
          </button>
        </div>

        {config.entities.map((entity: any, index: number) => (
          <div key={index} className="mb-12">
            
            {/* 👈 Using the dynamic translation for the word "Management" */}
            <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2 mb-6 capitalize">
              {entity.name} {t.management || "Management"}
            </h2>

            <div className="grid gap-8">
              {entity.ui.views.map((viewName: string) => {
                const Component = ViewRegistry[viewName];
                if (!Component) return null;
                return <Component key={viewName} entityName={entity.name} fields={entity.fields} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}