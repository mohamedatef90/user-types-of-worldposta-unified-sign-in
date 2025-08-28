import React, { useState, useMemo } from 'react';
import { Card, Button, Pagination, Icon } from '@/components/ui';
import type { RunningTask } from '@/types';
// Fix: Import `mockRunningTasks` from data.ts
import { mockRunningTasks } from '@/data';
import { Link } from 'react-router-dom';
import { useAppLayout, useAuth } from '@/context';

const getStatusChipClass = (status: RunningTask['status']) => {
    switch (status) {
        case 'Finish':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'In Progress':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'New':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
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

export const RunningTasksPage: React.FC = () => {
    const { isDomainVerifiedForDemo } = useAppLayout();
    const { user } = useAuth();
    const isNewDemoUser = user?.email === 'new.user@worldposta.com';
    const isDisabled = isNewDemoUser && !isDomainVerifiedForDemo;

    const [tasks] = useState<RunningTask[]>(mockRunningTasks);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    const paginatedTasks = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return tasks.slice(startIndex, startIndex + rowsPerPage);
    }, [tasks, currentPage, rowsPerPage]);

    return (
        <Card>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-100/10">
                    <thead className="bg-gray-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Failed</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Done</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created By</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created At</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-100/10">
                        {isDisabled ? (
                            <VerificationRequiredRow colSpan={8} />
                        ) : paginatedTasks.map((task) => (
                            <tr key={task.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                     <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-md ${getStatusChipClass(task.status)}`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{task.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{task.total}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{task.failed}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{task.done}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{task.createdBy}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <Button variant="outline" size="sm" onClick={() => alert(`Viewing details for task ID: ${task.id}`)} disabled={isDisabled}>
                                        Details
                                    </Button>
                                </td>
                            </tr>
                        ))}
                         {!isDisabled && paginatedTasks.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                    No running tasks found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                 {!isDisabled && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={tasks.length}
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