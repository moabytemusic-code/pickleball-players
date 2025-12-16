'use client'

import { useState } from "react";
import { harvestCity } from "../harvest";
import { Download, Terminal, Loader2 } from "lucide-react";

export default function DataImportPage() {
    const [city, setCity] = useState("");
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [success, setSuccess] = useState(false);

    async function handleImport(e: React.FormEvent) {
        e.preventDefault();
        if (!city) return;

        setLoading(true);
        setLogs([]);
        setSuccess(false);
        try {
            const res = await harvestCity(city);
            setLogs(res.logs);
            if (res.success) setSuccess(true);
        } catch (err) {
            console.error(err);
            setLogs(prev => [...prev, "Critical Error calling server action"]);
        }
        setLoading(false);
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Data Import</h1>
                <p className="text-gray-600">Import courts from OpenStreetMap (OSM).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form */}
                <div className="bg-white p-6 rounded-xl shadow border border-gray-200 h-fit">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Download className="w-5 h-5 mr-2" /> New Harvest
                    </h2>
                    <form onSubmit={handleImport} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">City Name</label>
                            <input
                                value={city}
                                onChange={e => setCity(e.target.value)}
                                placeholder="e.g. Chicago, IL"
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2 text-gray-900 bg-white"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Format: "City, State" recommended.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !city}
                            className="w-full flex justify-center items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-green-700 shadow-sm disabled:opacity-50 transition-all"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {loading ? "Harvesting..." : "Start Import"}
                        </button>
                    </form>

                    <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                        <strong>Note:</strong> This runs a Python script on the server. It may take 10-30 seconds depending on the city size and API response times.
                    </div>
                </div>

                {/* Maintenance */}
                <div className="bg-white p-6 rounded-xl shadow border border-gray-200 h-fit">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Terminal className="w-5 h-5 mr-2" /> Database Maintenance
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Scan the database for "Unnamed" courts and attempt to find their real names via reverse geocoding.
                    </p>
                    <button
                        onClick={async () => {
                            setLoading(true);
                            const { refineAllCourts } = await import("../harvest");
                            const res = await refineAllCourts();
                            setLogs(res.logs);
                            setLoading(false);
                        }}
                        disabled={loading}
                        className="w-full flex justify-center items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition-all"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Refine Unnamed Courts
                    </button>
                </div>

                {/* Logs Console */}
                <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden flex flex-col h-[500px]">
                    <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center text-gray-400 text-xs font-mono uppercase">
                        <Terminal className="w-3 h-3 mr-2" /> Import Logs
                    </div>
                    <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1 text-green-400">
                        {logs.length === 0 && !loading && (
                            <span className="text-gray-600">Waiting for command...</span>
                        )}
                        {logs.map((log, i) => (
                            <div key={i} className="break-all whitespace-pre-wrap border-b border-gray-800/30 pb-0.5">
                                {log}
                            </div>
                        ))}
                        {loading && (
                            <div className="animate-pulse">_</div>
                        )}
                        {success && !loading && (
                            <div className="text-blue-400 mt-4 font-bold">Process Complete.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
