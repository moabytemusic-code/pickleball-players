"use client"

import { Mail, CheckCircle, Clock, Download, Search } from 'lucide-react'
import { useState } from 'react'

interface Registration {
    user_id: string;
    event_id: string;
    created_at: string;
    payment_status: string;
    profiles: {
        id: string;
        email?: string;
        first_name?: string;
        last_name?: string;
    } | null;
}

interface RegistrationsTableProps {
    registrations: Registration[];
}

export function RegistrationsTable({ registrations }: RegistrationsTableProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredRegistrations = registrations.filter(reg => {
        const name = `${reg.profiles?.first_name || ''} ${reg.profiles?.last_name || ''}`.toLowerCase();
        const email = (reg.profiles?.email || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return name.includes(search) || email.includes(search);
    });

    const downloadCsv = () => {
        const headers = ['First Name', 'Last Name', 'Email', 'Payment Status', 'Registered Date'];
        const rows = filteredRegistrations.map(reg => [
            reg.profiles?.first_name || '',
            reg.profiles?.last_name || '',
            reg.profiles?.email || '',
            reg.payment_status,
            new Date(reg.created_at).toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'attendees.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-medium text-gray-900">Attendees ({filteredRegistrations.length})</h3>

                <div className="flex gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search attendees..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={downloadCsv}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        CSV
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Player
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date Registered
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Payment
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRegistrations.map((reg) => (
                            <tr key={reg.user_id + reg.event_id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {reg.profiles?.first_name
                                            ? `${reg.profiles.first_name} ${reg.profiles.last_name || ''}`
                                            : 'Unknown User'
                                        }
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                        {reg.profiles?.email || 'No email provided'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(reg.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {reg.payment_status === 'paid' ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <CheckCircle className="w-3 h-3 mr-1" /> Paid
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            <Clock className="w-3 h-3 mr-1" /> Pending
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredRegistrations.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    {registrations.length === 0 ? "No registrations yet." : "No matching attendees found."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
