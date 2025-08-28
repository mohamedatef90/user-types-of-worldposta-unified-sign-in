


import React, { useState, useMemo } from 'react';
import { Card, Button, Icon, Pagination } from '@/components/ui';
import type { PstLogEntry } from '@/types';
// Fix: Import `mockPstLogs` from data.ts
import { mockPstLogs } from '@/data';
import { Link } from 'react-router-dom';
import { useAppLayout, useAuth } from '@/context';

const getStatusChipClass = (status: PstLogEntry['status']) => {
    switch (status) {
        case 'Completed':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'In Progress':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'Failed':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case 'Pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

const VerificationRequiredRow: React.FC<{ colSpan: number }> = ({ colSpan }) => (
    <tr>
        <td colSpan={colSpan} className="text-center py-10">
            <Icon name="fas fa-lock" className="text-3xl text-yellow-500 mb-3" />
            <p className="font-semibold text-lg text-[#293c51] dark:text-gray-200">Domain Verification Required</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Please verify your domain to access this feature.
                <Link to="/app/email-admin-suite/orgs-and-domains" className="ml-2 font-semibold text-[#679a41] dark:text-emerald-400 hover:underline">
                    Verify Now
                </Link>
            </p>
        </td>
    </tr>
);

export const PstLogsPage: React.FC = () => {
    const { isDomainVerifiedForDemo } = useAppLayout();
    const { user } = useAuth();
    const isNewDemoUser = user?.email === 'new.user@worldposta.com';
    const isDisabled = isNewDemoUser && !isDomainVerifiedForDemo;

    const [logs, setLogs] = useState<PstLogEntry[]>(mockPstLogs);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(15);

    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return logs.slice(startIndex, startIndex + rowsPerPage);
    }, [logs, currentPage, rowsPerPage]);

    const handleDelete = (logId: string) => {
        if (window.confirm('Are you sure you want to delete this log entry?')) {
            setLogs(currentLogs => currentLogs.filter(log => log.id !== logId));
        }
    };
    
    const handleDownload = (logId: string) => {
        alert(`Downloading PST file for log entry: ${logId}`);
    };

    return (
        <Card title="PST Logs">
            <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-y-700">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created By</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {isDisabled ? (
                            <VerificationRequiredRow colSpan={6} />
                        ) : paginatedLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/20">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-gray-200">{log.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.createdBy}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusChipClass(log.status)}`}>
                                        {log.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => handleDownload(log.id)} className="text-[#679a41] dark:text-emerald-400 hover:underline p-0" disabled={isDisabled}>
                                            Download
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => handleDelete(log.id)} title="Delete Log" disabled={isDisabled}>
                                            <Icon name="fas fa-trash-alt" className="text-gray-400 hover:text-red-500" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!isDisabled && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={logs.length}
                        itemsPerPage={rowsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(value) => {
                            setRowsPerPage(value);
                            setCurrentPage(1);
                        }}
                    />
                )}
            </div>
        </Card>
    );
};