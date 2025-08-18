

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Icon, Pagination, Modal, ToggleSwitch } from '@/components/ui';
import { mockRules } from '@/data';
import type { Rule } from '@/types';

const RuleInfoModal: React.FC<{ rule: Rule | null; isOpen: boolean; onClose: () => void; }> = ({ rule, isOpen, onClose }) => {
    if (!rule) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Rule Information" size="lg" footer={<Button onClick={onClose}>Close</Button>}>
            <div className="space-y-3">
                <div><strong className="font-semibold text-gray-700 dark:text-gray-300">Name:</strong> <span className="text-gray-600 dark:text-gray-400">{rule.name}</span></div>
                <div><strong className="font-semibold text-gray-700 dark:text-gray-300">Description:</strong> <p className="text-gray-600 dark:text-gray-400">{rule.description}</p></div>
                <div><strong className="font-semibold text-gray-700 dark:text-gray-300">Status:</strong> <span className={`capitalize font-medium ${rule.status === 'enabled' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{rule.status}</span></div>
                <div><strong className="font-semibold text-gray-700 dark:text-gray-300">Created:</strong> <span className="text-gray-600 dark:text-gray-400">{new Date(rule.creationDate).toLocaleString()}</span></div>
                <div><strong className="font-semibold text-gray-700 dark:text-gray-300">Last Modified:</strong> <span className="text-gray-600 dark:text-gray-400">{new Date(rule.lastModified).toLocaleString()}</span></div>
            </div>
        </Modal>
    );
};


export const RulesPage: React.FC = () => {
    const navigate = useNavigate();
    const [rules, setRules] = useState<Rule[]>(mockRules);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [infoModalRule, setInfoModalRule] = useState<Rule | null>(null);
    const [statusChangeInfo, setStatusChangeInfo] = useState<{ rule: Rule, newStatus: Rule['status'] } | null>(null);

    const paginatedRules = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return rules.slice(startIndex, startIndex + rowsPerPage);
    }, [rules, currentPage, rowsPerPage]);

    const handleAddRule = () => {
        navigate('/app/email-admin-suite/exchange/rules/add');
    };

    const handleEditRule = (ruleId: string) => {
        navigate(`/app/email-admin-suite/exchange/rules/edit/${ruleId}`);
    };

    const handleStatusChangeRequest = (rule: Rule, newStatus: Rule['status']) => {
        setStatusChangeInfo({ rule, newStatus });
    };

    const handleConfirmStatusChange = () => {
        if (statusChangeInfo) {
            setRules(prevRules => 
                prevRules.map(rule => 
                    rule.id === statusChangeInfo.rule.id ? { ...rule, status: statusChangeInfo.newStatus, lastModified: new Date().toISOString() } : rule
                )
            );
            setStatusChangeInfo(null);
        }
    };
    
    return (
        <>
            <Card title="Rules" titleActions={<Button leftIconName="fas fa-plus-circle" onClick={handleAddRule}>Add Rule</Button>}>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-gray-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 dark:text-gray-200 w-1/4">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 dark:text-gray-200">Description</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800 dark:text-gray-200">Enabled</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-800 dark:text-gray-200">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {paginatedRules.map(rule => (
                                <tr key={rule.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{rule.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{rule.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <ToggleSwitch
                                            id={`toggle-${rule.id}`}
                                            checked={rule.status === 'enabled'}
                                            onChange={(checked) => handleStatusChangeRequest(rule, checked ? 'enabled' : 'disabled')}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Button size="icon" variant="ghost" title="Info" onClick={() => setInfoModalRule(rule)}>
                                                <Icon name="fas fa-info-circle" className="text-gray-500"/>
                                            </Button>
                                            <Button size="icon" variant="ghost" title="Edit" onClick={() => handleEditRule(rule.id)}>
                                                <Icon name="fas fa-pencil-alt" className="text-gray-500"/>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end items-center py-3 px-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <label htmlFor="rowsPerPage" className="text-sm text-gray-600 dark:text-gray-400">View of</label>
                        <select
                            id="rowsPerPage"
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-sm p-1.5 focus:ring-2 focus:ring-[#679a41] dark:focus:ring-emerald-400"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </Card>

            <RuleInfoModal
                isOpen={!!infoModalRule}
                onClose={() => setInfoModalRule(null)}
                rule={infoModalRule}
            />

            {statusChangeInfo && (
                 <Modal
                    isOpen={!!statusChangeInfo}
                    onClose={() => setStatusChangeInfo(null)}
                    title="Confirm Status Change"
                    size="md"
                    footer={
                        <>
                            <Button variant="primary" onClick={handleConfirmStatusChange}>Confirm</Button>
                            <Button variant="ghost" onClick={() => setStatusChangeInfo(null)}>Cancel</Button>
                        </>
                    }
                >
                    <p>
                        Are you sure you want to <strong>{statusChangeInfo.newStatus}</strong> the rule "{statusChangeInfo.rule.name}"?
                    </p>
                </Modal>
            )}
        </>
    );
};