import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, FormField, Icon, Modal } from '@/components/ui';
import { mockDistributionLists, mockMailboxDomains } from '@/data';
import type { DistributionList } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const EditDistributionListPage: React.FC = () => {
    const { dlId } = useParams<{ dlId: string }>();
    const navigate = useNavigate();
    const isEditing = !!dlId;

    const [form, setForm] = useState({
        displayName: '',
        emailUser: '',
        emailDomain: mockMailboxDomains[0],
        managerEmail: '',
        note: '',
        hideFromAddressBook: false,
    });

    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        if (isEditing) {
            const list = mockDistributionLists.find(l => l.id === dlId);
            if (list) {
                const [user, domain] = list.primaryEmail.split('@');
                setForm({
                    displayName: list.displayName,
                    emailUser: user,
                    emailDomain: domain,
                    managerEmail: list.managerEmail || '',
                    note: '', // Mocking note as it's not in the type
                    hideFromAddressBook: false, // Mocking as it's not in the type
                });
            } else {
                alert('Distribution List not found!');
                navigate('/app/email-admin-suite/exchange/distribution-lists');
            }
        }
    }, [isEditing, dlId, navigate]);

    const handleSave = () => {
        if (!form.displayName || !form.emailUser) {
            alert("Display Name and Email Address are required.");
            return;
        }

        const listData: DistributionList = {
            id: dlId || uuidv4(),
            displayName: form.displayName,
            primaryEmail: `${form.emailUser}@${form.emailDomain}`,
            creationDate: isEditing ? (mockDistributionLists.find(l => l.id === dlId)?.creationDate || new Date().toISOString()) : new Date().toISOString(),
            managerEmail: form.managerEmail,
        };

        if (isEditing) {
            const index = mockDistributionLists.findIndex(l => l.id === dlId);
            if (index > -1) {
                mockDistributionLists[index] = listData;
            }
        } else {
            mockDistributionLists.unshift(listData);
        }

        alert(`Distribution List ${isEditing ? 'updated' : 'created'} successfully!`);
        navigate('/app/email-admin-suite/exchange/distribution-lists');
    };

    const tabs = [
        { id: 'general', label: 'General' },
        { id: 'settings', label: 'Settings' },
        { id: 'emailAddress', label: 'E-mail Address' },
        { id: 'members', label: 'Members' },
        { id: 'memberOf', label: 'Member Of' },
        { id: 'deliveryManagement', label: 'Delivery Management' },
        { id: 'messageApproval', label: 'Message Approval' },
        { id: 'emailOptions', label: 'Email Options' },
        { id: 'mailTip', label: 'MailTip' },
        { id: 'groupDelegation', label: 'Group Delegation' },
    ];

    const PlaceholderContent: React.FC<{ title: string }> = ({ title }) => (
        <div className="p-10 text-center text-gray-500 dark:text-gray-400">
            <Icon name="fas fa-tools" className="text-3xl mb-4" />
            <p className="font-semibold">{title} settings will be displayed here.</p>
            <p className="text-sm">This feature is currently under development.</p>
        </div>
    );

    const generalTabContent = (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#293c51] dark:text-gray-200 border-b pb-2 mb-4 dark:border-slate-700">
                    General Information
                </h3>
                <div className="space-y-4 p-2">
                    <FormField 
                        id="displayName" 
                        name="displayName" 
                        label="Display Name" 
                        value={form.displayName} 
                        onChange={(e) => setForm({...form, displayName: e.target.value})} 
                        required 
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
                    <FormField 
                        id="managerEmail" 
                        name="managerEmail" 
                        label="Manager Email" 
                        type="email" 
                        value={form.managerEmail} 
                        onChange={(e) => setForm({...form, managerEmail: e.target.value})} 
                        placeholder="manager@example.com" 
                    />
                    <FormField 
                        id="note" 
                        name="note" 
                        label="Note" 
                        as="textarea" 
                        rows={3} 
                        value={form.note} 
                        onChange={(e) => setForm({...form, note: e.target.value})} 
                    />
                </div>
            </div>
        </div>
    );

    const settingsTabContent = (
        <div className="space-y-4 p-2">
            <FormField 
                type="checkbox" 
                id="hideFromAddressBook" 
                name="hideFromAddressBook" 
                label="Hide from Address Book" 
                checked={form.hideFromAddressBook} 
                onChange={(e) => setForm({...form, hideFromAddressBook: (e.target as HTMLInputElement).checked})} 
            />
            <PlaceholderContent title="Advanced Settings" />
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="mb-4">
                <Button variant="outline" onClick={() => navigate('/app/email-admin-suite/exchange/distribution-lists')} leftIconName="fas fa-arrow-left">
                    Back to Distribution Lists
                </Button>
            </div>
            <Card>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-[#293c51] dark:text-gray-100 mb-6">
                        {isEditing ? 'Edit Distribution List' : 'New Distribution List'}
                    </h2>
                    
                    <div className="border-b border-gray-200 dark:border-slate-700">
                        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none ${
                                        activeTab === tab.id
                                            ? 'border-[#679a41] text-[#679a41] dark:border-emerald-400 dark:text-emerald-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="pt-6">
                        {activeTab === 'general' && generalTabContent}
                        {activeTab === 'settings' && settingsTabContent}
                        {activeTab !== 'general' && activeTab !== 'settings' && <PlaceholderContent title={tabs.find(t => t.id === activeTab)?.label || 'Settings'}/>}
                    </div>
                </div>

                <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-x-2 flex justify-end rounded-b-xl">
                    <Button variant="ghost" onClick={() => navigate('/app/email-admin-suite/exchange/distribution-lists')}>Cancel</Button>
                    <Button onClick={handleSave}>{isEditing ? 'Save Changes' : 'Create List'}</Button>
                </div>
            </Card>
        </div>
    );
};
