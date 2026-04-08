import React, { useState, useMemo, useEffect } from 'react';
import { Card, Button, FormField, Icon, Pagination, Modal } from '@/components/ui';
import type { DistributionList } from '@/types';
// Fix: Import `mockDistributionLists` from data.ts
import { mockMailboxDomains, mockDistributionLists, mockMailboxes } from '@/data';
import { v4 as uuidv4 } from 'uuid';
import { Link, useNavigate } from 'react-router-dom';
import { useAppLayout, useAuth } from '@/context';
import type { Mailbox } from '@/types';

interface DlFilters {
    displayName: string;
    domain: string;
    dateFrom: string;
    dateTo: string;
}

const initialDlFilters: DlFilters = {
    displayName: '',
    domain: 'ALL',
    dateFrom: '',
    dateTo: '',
};

const AddDistributionListPanel: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (list: DistributionList) => void;
}> = ({ isOpen, onClose, onAdd }) => {
    const [form, setForm] = useState({
        displayName: '',
        emailUser: '',
        emailDomain: mockMailboxDomains[0],
        managerEmail: '',
        note: '',
        hideFromAddressBook: false,
    });

    const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
    const [managerSearchTerm, setManagerSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            setForm({
                displayName: '',
                emailUser: '',
                emailDomain: mockMailboxDomains[0],
                managerEmail: '',
                note: '',
                hideFromAddressBook: false,
            });
        }
    }, [isOpen]);

    const filteredMailboxes = mockMailboxes.filter(m => 
        m.login.toLowerCase().includes(managerSearchTerm.toLowerCase()) ||
        m.displayName.toLowerCase().includes(managerSearchTerm.toLowerCase())
    );

    const handleSave = () => {
        if (!form.displayName || !form.emailUser) {
            alert("Display Name and Email Address are required.");
            return;
        }

        const newList: DistributionList = {
            id: uuidv4(),
            displayName: form.displayName,
            primaryEmail: `${form.emailUser}@${form.emailDomain}`,
            creationDate: new Date().toISOString(),
            managerEmail: form.managerEmail,
        };

        onAdd(newList);
        onClose();
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/60 z-[44]" onClick={onClose} aria-hidden="true" />}
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#f8f8f8] dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 z-[45] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold">Add Distribution List</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><Icon name="fas fa-times" /></button>
                </div>
                <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                    <div className="space-y-4">
                        <FormField 
                            id="displayName" 
                            name="displayName" 
                            label="Display Name" 
                            value={form.displayName} 
                            onChange={(e) => setForm({...form, displayName: e.target.value})} 
                            required 
                            placeholder="e.g. Marketing Team"
                        />
                        <div className="mb-4">
                            <label htmlFor="emailUser" className="block text-sm font-medium mb-1 text-[#293c51] dark:text-gray-300">
                                Primary Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center">
                                <input 
                                    id="emailUser" 
                                    name="emailUser" 
                                    type="text" 
                                    value={form.emailUser} 
                                    onChange={(e) => setForm({...form, emailUser: e.target.value})} 
                                    placeholder="marketing"
                                    className="w-full px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#679a41] border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white" 
                                />
                                <span className="inline-flex items-center px-3 border-t border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 text-sm">@</span>
                                <select 
                                    name="emailDomain" 
                                    value={form.emailDomain} 
                                    onChange={(e) => setForm({...form, emailDomain: e.target.value})} 
                                    className="px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-[#679a41] border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
                                >
                                    {mockMailboxDomains.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-end gap-2 mb-4">
                            <div className="flex-1">
                                <FormField 
                                    id="managerEmail" 
                                    name="managerEmail" 
                                    label="Manager Email" 
                                    type="email" 
                                    value={form.managerEmail} 
                                    onChange={(e) => setForm({...form, managerEmail: e.target.value})} 
                                    placeholder="Select a manager..." 
                                    readOnly
                                />
                            </div>
                            <Button 
                                variant="outline" 
                                className="mb-4" 
                                onClick={() => setIsManagerModalOpen(true)}
                                title="Select Manager"
                            >
                                <Icon name="fas fa-search" />
                            </Button>
                        </div>
                        <FormField 
                            id="note" 
                            name="note" 
                            label="Note" 
                            as="textarea" 
                            rows={3} 
                            value={form.note} 
                            onChange={(e) => setForm({...form, note: e.target.value})} 
                            placeholder="Optional notes about this list..."
                        />
                        <FormField 
                            type="checkbox" 
                            id="hideFromAddressBook" 
                            name="hideFromAddressBook" 
                            label="Hide from Address Book" 
                            checked={form.hideFromAddressBook} 
                            onChange={(e) => setForm({...form, hideFromAddressBook: (e.target as HTMLInputElement).checked})} 
                        />
                    </div>
                </div>
                <div className="flex-shrink-0 p-4 border-t bg-white dark:bg-slate-800 dark:border-slate-700 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Create List</Button>
                </div>
            </div>

            <Modal
                isOpen={isManagerModalOpen}
                onClose={() => setIsManagerModalOpen(false)}
                title="Select Manager Email"
                size="2xl"
            >
                <div className="space-y-4">
                    <div className="relative">
                        <Icon name="fas fa-search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search mailboxes..."
                            className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-[#679a41]"
                            value={managerSearchTerm}
                            onChange={(e) => setManagerSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto border rounded-md dark:border-slate-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Display Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
                                {filteredMailboxes.length > 0 ? (
                                    filteredMailboxes.map((mailbox) => (
                                        <tr key={mailbox.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{mailbox.displayName}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{mailbox.login}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="text-[#679a41] dark:text-emerald-400"
                                                    onClick={() => {
                                                        setForm({ ...form, managerEmail: mailbox.login });
                                                        setIsManagerModalOpen(false);
                                                    }}
                                                >
                                                    Select
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No mailboxes found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button variant="ghost" onClick={() => setIsManagerModalOpen(false)}>Close</Button>
                </div>
            </Modal>
        </>
    );
};

const DlFilterPanel: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: DlFilters) => void;
    onClear: () => void;
    currentFilters: DlFilters;
}> = ({ isOpen, onClose, onApply, onClear, currentFilters }) => {
    const [localFilters, setLocalFilters] = useState<DlFilters>(currentFilters);
    useEffect(() => { if (isOpen) setLocalFilters(currentFilters); }, [isOpen, currentFilters]);
    const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setLocalFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleApply = () => { onApply(localFilters); onClose(); };
    const handleClear = () => { onClear(); onClose(); };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/60 z-[44]" onClick={onClose} aria-hidden="true" />}
            <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#f8f8f8] dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 z-[45] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold">Filter Distribution Lists</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><Icon name="fas fa-times" /></button>
                </div>
                <div className="flex-grow p-6 space-y-4">
                    <FormField id="displayName" name="displayName" label="Display Name" value={localFilters.displayName} onChange={handleLocalChange} placeholder="Search by name..." />
                    <FormField as="select" id="domain" name="domain" label="Domain" value={localFilters.domain} onChange={handleLocalChange}>
                        <option value="ALL">All Domains</option>
                        {mockMailboxDomains.map(d => <option key={d} value={d}>{d}</option>)}
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField id="dateFrom" name="dateFrom" label="From" type="date" value={localFilters.dateFrom} onChange={handleLocalChange} />
                        <FormField id="dateTo" name="dateTo" label="To" type="date" value={localFilters.dateTo} onChange={handleLocalChange} />
                    </div>
                </div>
                <div className="flex-shrink-0 p-4 border-t bg-white dark:bg-slate-800 dark:border-slate-700 flex justify-end gap-2">
                    <Button variant="ghost" onClick={handleClear}>Clear</Button>
                    <Button onClick={handleApply}>Apply</Button>
                </div>
            </div>
        </>
    );
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

export const DistributionListsPage: React.FC = () => {
    const navigate = useNavigate();
    const { isDomainVerifiedForDemo } = useAppLayout();
    const { user } = useAuth();
    const isNewDemoUser = user?.email === 'new.user@worldposta.com';
    const isDisabled = isNewDemoUser && !isDomainVerifiedForDemo;

    const [distributionLists, setDistributionLists] = useState<DistributionList[]>(mockDistributionLists);
    const [filters, setFilters] = useState<DlFilters>(initialDlFilters);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);

    // State for selections and bulk actions
    const [selectedLists, setSelectedLists] = useState<string[]>([]);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

    const filteredLists = useMemo(() => {
        return distributionLists.filter(list => {
            const domain = list.primaryEmail.split('@')[1];
            if (filters.displayName && !list.displayName.toLowerCase().includes(filters.displayName.toLowerCase())) return false;
            if (filters.domain !== 'ALL' && domain !== filters.domain) return false;
            const creationDate = new Date(list.creationDate);
            if (filters.dateFrom && creationDate < new Date(filters.dateFrom)) return false;
            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (creationDate > toDate) return false;
            }
            return true;
        }).sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
    }, [distributionLists, filters]);

    const paginatedLists = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return filteredLists.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredLists, currentPage, rowsPerPage]);

    useEffect(() => { setCurrentPage(1); }, [filters, rowsPerPage]);

    const handleOpenAddPanel = () => {
        setIsAddPanelOpen(true);
    };

    const handleAddList = (newList: DistributionList) => {
        setDistributionLists(prev => [newList, ...prev]);
        // Also update mockDistributionLists to simulate persistence if needed, 
        // though usually we'd use a context or API.
        mockDistributionLists.unshift(newList);
        alert("Distribution List created successfully!");
    };

    const handleOpenEditPanel = (list: DistributionList) => {
        navigate(`edit/${list.id}`);
    };

    // --- Bulk Action Logic ---
    const handleSelectOne = (listId: string, checked: boolean) => {
        setSelectedLists(prev => checked ? [...prev, listId] : prev.filter(id => id !== listId));
    };

    const handleSelectAll = (checked: boolean) => {
        const pageIds = paginatedLists.map(l => l.id);
        if (checked) {
            setSelectedLists(prev => [...new Set([...prev, ...pageIds])]);
        } else {
            setSelectedLists(prev => prev.filter(id => !pageIds.includes(id)));
        }
    };

    const areAllOnPageSelected = useMemo(() => {
        if (paginatedLists.length === 0) return false;
        return paginatedLists.every(l => selectedLists.includes(l.id));
    }, [paginatedLists, selectedLists]);
    
    const handleConfirmBulkDelete = () => {
        setDistributionLists(prev => prev.filter(l => !selectedLists.includes(l.id)));
        setSelectedLists([]);
        setIsBulkDeleteModalOpen(false);
    };
    
    const DefaultToolbar = () => (
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsFilterPanelOpen(true)} leftIconName="fas fa-filter" disabled={isDisabled}>Filters & Search</Button>
            <Button leftIconName="fas fa-plus-circle" onClick={handleOpenAddPanel} disabled={isDisabled}>Add Distribution List</Button>
        </div>
    );
    
    const BulkActionsToolbar = () => (
        <div className="w-full flex justify-between items-center bg-blue-50 dark:bg-sky-900/30 p-2 rounded-lg">
            <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-blue-800 dark:text-sky-300">{selectedLists.length} selected</span>
                <div className="h-6 w-px bg-blue-200 dark:bg-sky-700"></div>
                <Button size="sm" variant="ghost" onClick={() => setIsBulkDeleteModalOpen(true)} leftIconName="fas fa-trash-alt" className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50" disabled={isDisabled}>Delete</Button>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setSelectedLists([])} title="Clear selection"><Icon name="fas fa-times" className="text-gray-500" /></Button>
        </div>
    );
    
    return (
        <>
            <Card title="Distribution Lists" titleActions={selectedLists.length > 0 ? <BulkActionsToolbar /> : <DefaultToolbar />}>
                <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left w-4">
                                    <input type="checkbox" onChange={(e) => handleSelectAll(e.target.checked)} checked={areAllOnPageSelected} className="rounded" disabled={isDisabled} />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Display Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Primary Email Address</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Manager Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Creation Date</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {isDisabled ? (
                                <VerificationRequiredRow colSpan={6} />
                            ) : paginatedLists.map(list => (
                                <tr key={list.id} className={selectedLists.includes(list.id) ? 'bg-blue-50/50 dark:bg-sky-900/20' : ''}>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <input type="checkbox" onChange={(e) => handleSelectOne(list.id, e.target.checked)} checked={selectedLists.includes(list.id)} className="rounded" />
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">{list.displayName}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{list.primaryEmail}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{list.managerEmail || 'N/A'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{new Date(list.creationDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                                        <div className="flex justify-end items-center">
                                            <Button size="icon" variant="ghost" onClick={() => handleOpenEditPanel(list)} title="Edit" disabled={isDisabled}><Icon name="fas fa-pencil-alt" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!isDisabled && <Pagination currentPage={currentPage} totalItems={filteredLists.length} itemsPerPage={rowsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setRowsPerPage} />}
                </div>
            </Card>

            <Modal isOpen={isBulkDeleteModalOpen} onClose={() => setIsBulkDeleteModalOpen(false)} title="Delete Distribution Lists" footer={<><Button variant="danger" onClick={handleConfirmBulkDelete}>Delete</Button><Button variant="ghost" onClick={() => setIsBulkDeleteModalOpen(false)}>Cancel</Button></>}>
                <p>Are you sure you want to delete {selectedLists.length} selected list(s)? This action cannot be undone.</p>
            </Modal>
            
            <DlFilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} onApply={setFilters} onClear={() => setFilters(initialDlFilters)} currentFilters={filters} />
            <AddDistributionListPanel isOpen={isAddPanelOpen} onClose={() => setIsAddPanelOpen(false)} onAdd={handleAddList} />
        </>
    );
};