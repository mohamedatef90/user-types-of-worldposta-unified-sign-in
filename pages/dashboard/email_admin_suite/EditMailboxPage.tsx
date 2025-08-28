

import React, { useState, useMemo, useEffect } from 'react';
import { Card, Button, FormField, Icon, Pagination, Modal, Tooltip, ToggleSwitch, CollapsibleSection } from '@/components/ui';
import type { Mailbox, MailboxPlan, MailboxLevel, MailboxType } from '@/types';
// Fix: Import `mockMailboxes` from data.ts, which now has the correct export.
import { mockMailboxes, mockMailboxPlans, mockMailboxDomains } from '@/data';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const PlaceholderContent: React.FC<{ title: string }> = ({ title }) => (
    <div className="p-10 text-center text-gray-500 dark:text-gray-400">
        <Icon name="fas fa-tools" className="text-3xl mb-4" />
        <p className="font-semibold">{title} settings will be displayed here.</p>
        <p className="text-sm">This feature is currently under development.</p>
    </div>
);

export const EditMailboxPage: React.FC = () => {
    const { mailboxId } = useParams<{ mailboxId: string }>();
    const navigate = useNavigate();
    
    const [mailboxToEdit, setMailboxToEdit] = useState<Mailbox | null>(null);
    const [form, setForm] = useState({
        firstName: '',
        initials: '',
        lastName: '',
        displayName: '',
        note: '',
        mustChangePasswordAtNextLogon: false,
        isSuspended: false,
        isBlocked: false,
        mailboxType: 'User' as MailboxType,
        hideFromAddressBook: false,
        enableArchiving: false,
        mailboxPlan: 'Posta Business' as MailboxPlan,
    });
    const [activeTab, setActiveTab] = useState('general');

    const [aliases, setAliases] = useState([
        { id: 'alias-1', email: '167@anameischanged.info', isPrimary: true },
        { id: 'alias-2', email: '160@anameischanged.info', isPrimary: false },
        { id: 'alias-3', email: 'PM@testtrendmicro.testqq', isPrimary: false },
    ]);
    const [newAliasUser, setNewAliasUser] = useState('');
    const [newAliasDomain, setNewAliasDomain] = useState(mockMailboxDomains[0]);

    // Types for Mail Flow UX enhancement
    type Sender = { id: string; name: string; email: string };
    type SenderListType = 'acceptedSenders' | 'rejectedSenders';
    
    interface SenderModalState {
        isOpen: boolean;
        listType: SenderListType | null;
        senderData: { name: string; email: string };
    }
    const [senderModalState, setSenderModalState] = useState<SenderModalState>({ isOpen: false, listType: null, senderData: { name: '', email: '' } });

    // State for Mail Flow settings
    const [mailFlowSettings, setMailFlowSettings] = useState({
        enableForwarding: false,
        forwardingAddress: '',
        keepForwardedCopy: true,
        acceptMessagesFrom: 'list' as 'all' | 'list',
        acceptedSenders: [
            { id: 'sender-1', name: '161', email: '161@emad.eldeen' }
        ] as Sender[],
        rejectMessagesFrom: 'none' as 'none' | 'list',
        rejectedSenders: [] as Sender[]
    });

    const handleMailFlowChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setMailFlowSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleOpenSenderModal = (listType: SenderListType) => {
        setSenderModalState({ isOpen: true, listType, senderData: { name: '', email: '' } });
    };

    const handleCloseSenderModal = () => {
        setSenderModalState({ isOpen: false, listType: null, senderData: { name: '', email: '' } });
    };

    const handleSaveSender = () => {
        if (!senderModalState.listType || !senderModalState.senderData.email) {
            alert("Email is required.");
            return;
        }
        const { listType, senderData } = senderModalState;
        const newSender: Sender = { ...senderData, id: uuidv4() };

        setMailFlowSettings(prev => ({
            ...prev,
            [listType]: [...prev[listType], newSender]
        }));
        handleCloseSenderModal();
    };
    
    const handleRemoveSender = (listType: SenderListType, senderId: string) => {
        setMailFlowSettings(prev => ({
            ...prev,
            [listType]: prev[listType].filter(sender => sender.id !== senderId)
        }));
    };


    useEffect(() => {
        const mailbox = mockMailboxes.find(m => m.id === mailboxId);
        if (mailbox) {
            setMailboxToEdit(mailbox);
            setForm({
                displayName: mailbox.displayName,
                firstName: mailbox.firstName || '',
                lastName: mailbox.lastName || '',
                initials: mailbox.initials || '',
                note: mailbox.note || '',
                mustChangePasswordAtNextLogon: false, // This state is usually transient
                isSuspended: mailbox.status === 'suspended',
                isBlocked: mailbox.status === 'blocked',
                mailboxType: mailbox.mailboxType || 'User',
                // Mocking these as they don't exist on the type
                hideFromAddressBook: mailbox.id === 'mbx_004', // Just an example
                enableArchiving: mailbox.mailboxPlan === 'Posta Enterprise', // Just an example
                mailboxPlan: mailbox.mailboxPlan,
            });
        } else {
            alert('Mailbox not found.');
            navigate('/app/email-admin-suite/exchange/mailboxes');
        }
    }, [mailboxId, navigate]);

    const handleAddAlias = () => {
        if (!newAliasUser.trim()) {
            alert("Alias name cannot be empty.");
            return;
        }
        const newEmail = `${newAliasUser.trim()}@${newAliasDomain}`;
        if (aliases.some(a => a.email.toLowerCase() === newEmail.toLowerCase())) {
            alert('This alias already exists.');
            return;
        }
        setAliases(prev => [...prev, { id: uuidv4(), email: newEmail, isPrimary: false }]);
        setNewAliasUser('');
    };
    
    const handleSetPrimary = (aliasId: string) => {
        setAliases(prev => prev.map(a => ({
            ...a,
            isPrimary: a.id === aliasId
        })));
    };
    
    const handleDeleteAlias = (aliasId: string) => {
        if (window.confirm("Are you sure you want to delete this alias?")) {
            setAliases(prev => prev.filter(a => a.id !== aliasId));
        }
    };

    const handleSave = () => {
        if (!mailboxToEdit) return;

        let status: Mailbox['status'] = 'active';
        if (form.isBlocked) status = 'blocked';
        else if (form.isSuspended) status = 'suspended';

        const updatedMailbox: Mailbox = {
            ...mailboxToEdit,
            displayName: form.displayName,
            firstName: form.firstName,
            lastName: form.lastName,
            initials: form.initials,
            note: form.note,
            status: status,
            mailboxType: form.mailboxType,
            mailboxPlan: form.mailboxPlan,
        };

        const index = mockMailboxes.findIndex(m => m.id === mailboxId);
        if (index > -1) {
            mockMailboxes[index] = updatedMailbox;
        }
        
        console.log("Saving aliases:", aliases);
        console.log("Saving mail flow settings:", mailFlowSettings);

        alert('Mailbox updated successfully!');
        navigate('/app/email-admin-suite/exchange/mailboxes');
    };

    if (!mailboxToEdit) {
        return <Card><div className="text-center p-8">Loading...</div></Card>;
    }

    const tabs = [
        { id: 'general', label: 'General' },
        { id: 'settings', label: 'Settings' },
        { id: 'emailAddress', label: 'E-mail Address' },
        { id: 'mailFlow', label: 'Mail Flow Settings' },
        { id: 'permissions', label: 'Permissions' },
        { id: 'mobile', label: 'Mobile Devices' },
        { id: 'dlMemberships', label: 'DL Memberships' },
        { id: 'features', label: 'Features' },
    ];
    
    const generalFormContent = (
        <div className="space-y-6">
            <CollapsibleSection title="General Information" initialOpen={true}>
                <div className="space-y-4 p-2">
                   <FormField id="displayName" name="displayName" label="Display Name" value={form.displayName} onChange={(e) => setForm({...form, displayName: e.target.value})} required />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                       <FormField id="email" name="email" label="Email Address" value={mailboxToEdit.login} onChange={() => {}} disabled />
                       <FormField id="loginName" name="loginName" label="Login Name" value={mailboxToEdit.login.split('@')[0]} onChange={() => {}} disabled hint="Login Name cannot be changed."/>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                       <FormField id="firstInitialsLastName" name="firstInitialsLastName" label="First/Initials/Last Name" value={`${form.firstName || ''} ${form.initials || ''} ${form.lastName || ''}`.trim()} onChange={() => {}} disabled />
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => alert('Change Password form would appear here.')}>Change Password</Button>
                            <Button variant="outline" onClick={() => alert('Set Login Name form would appear here.')}>Set Login Name</Button>
                        </div>
                   </div>
                   <FormField id="note" name="note" label="Note" as="textarea" rows={3} value={form.note} onChange={(e) => setForm({...form, note: e.target.value})} />
                   <div className="pt-2 border-t dark:border-slate-600 space-y-2">
                       <FormField type="checkbox" id="mustChangePasswordAtNextLogon" name="mustChangePasswordAtNextLogon" label="User must change password at next logon" checked={form.mustChangePasswordAtNextLogon} onChange={(e) => setForm({...form, mustChangePasswordAtNextLogon: (e.target as HTMLInputElement).checked})}/>
                       <FormField type="checkbox" id="disableUser" name="disableUser" label="Disable user" checked={form.isSuspended} onChange={(e) => setForm({...form, isSuspended: (e.target as HTMLInputElement).checked, isBlocked: false})}/>
                       <FormField type="checkbox" id="accountLockedOut" name="accountLockedOut" label="Account is locked out" checked={form.isBlocked} onChange={(e) => setForm({...form, isBlocked: (e.target as HTMLInputElement).checked, isSuspended: false})}/>
                   </div>
                </div>
            </CollapsibleSection>
             <CollapsibleSection title="Company Information"><PlaceholderContent title="Company Information" /></CollapsibleSection>
             <CollapsibleSection title="Contact Information"><PlaceholderContent title="Contact Information" /></CollapsibleSection>
             <CollapsibleSection title="Address Information"><PlaceholderContent title="Address Information" /></CollapsibleSection>
        </div>
    );

    const settingsTabContent = (
        <div className="space-y-8 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4">
                <FormField
                    type="checkbox"
                    id="hideFromAddressBook"
                    name="hideFromAddressBook"
                    label="Hide from Address Book"
                    checked={form.hideFromAddressBook}
                    onChange={(e) => setForm(f => ({...f, hideFromAddressBook: (e.target as HTMLInputElement).checked}))}
                />
                <FormField
                    type="checkbox"
                    id="disableMailbox"
                    name="isSuspended"
                    label="Disable Mailbox"
                    checked={form.isSuspended}
                    onChange={(e) => setForm(f => ({...f, isSuspended: (e.target as HTMLInputElement).checked, isBlocked: false}))}
                />
                <FormField
                    type="checkbox"
                    id="enableArchiving"
                    name="enableArchiving"
                    label="Enable archiving"
                    checked={form.enableArchiving}
                    onChange={(e) => setForm(f => ({...f, enableArchiving: (e.target as HTMLInputElement).checked}))}
                />
            </div>
            
            <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-4">
                    <label htmlFor="mailboxPlan" className="text-sm text-gray-700 dark:text-gray-300 col-span-1">Mailbox Plan:</label>
                    <select
                        id="mailboxPlan"
                        name="mailboxPlan"
                        value={form.mailboxPlan}
                        onChange={(e) => setForm(f => ({...f, mailboxPlan: e.target.value as MailboxPlan}))}
                        className="col-span-2 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#679a41] dark:focus:ring-emerald-400 focus:border-[#679a41] dark:focus:border-emerald-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    >
                        {mockMailboxPlans.map(plan => <option key={plan} value={plan}>{plan}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-sm text-gray-700 dark:text-gray-300 col-span-1">Mailbox Sizes:</label>
                    <div className="relative w-full bg-gray-200 dark:bg-slate-600 rounded-sm h-5 overflow-hidden border border-gray-300 dark:border-slate-500 col-span-2">
                        <div className="absolute top-0 left-0 h-full bg-gray-300 dark:bg-slate-500" style={{ width: `${(mailboxToEdit.driveQuota.usedGB / mailboxToEdit.driveQuota.totalGB) * 100}%` }}></div>
                        <div className="absolute inset-0 flex items-center px-2">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-200">
                                {Math.round(mailboxToEdit.driveQuota.usedGB * 1024).toLocaleString()} of {(mailboxToEdit.driveQuota.totalGB * 1024).toLocaleString()} MB
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const emailAddressTabContent = (
        <div className="space-y-6 max-w-3xl">
            <div>
                <label className="block text-sm font-medium mb-2 text-[#293c51] dark:text-gray-300">
                    E-mail Address <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Alias Email"
                        value={newAliasUser}
                        onChange={(e) => setNewAliasUser(e.target.value)}
                        className="flex-grow w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#679a41] dark:focus:ring-emerald-400 focus:border-[#679a41] dark:focus:border-emerald-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <span className="text-gray-500 dark:text-gray-400 text-lg">@</span>
                    <select
                        value={newAliasDomain}
                        onChange={(e) => setNewAliasDomain(e.target.value)}
                        className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#679a41] dark:focus:ring-emerald-400 focus:border-[#679a41] dark:focus:border-emerald-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
                    >
                        {mockMailboxDomains.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <Button type="button" variant="outline" onClick={handleAddAlias}>Add</Button>
                </div>
            </div>
    
            <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
                <h4 className="text-md font-semibold mb-2 text-[#293c51] dark:text-gray-200">Email Address</h4>
                <div className="space-y-2">
                    {aliases.map(alias => (
                        <div key={alias.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700/50">
                            <span className="text-sm text-gray-800 dark:text-gray-200">{alias.email}</span>
                            <div className="flex items-center gap-2">
                                {alias.isPrimary ? (
                                    <Icon name="fas fa-check" className="text-green-500 text-lg" title="Primary alias" />
                                ) : (
                                    <>
                                        <Button size="sm" onClick={() => handleSetPrimary(alias.id)}>
                                            Primary
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => handleDeleteAlias(alias.id)} title="Delete alias">
                                            <Icon name="fas fa-trash-alt" className="text-gray-500 hover:text-red-500" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
    
     const RadioCard: React.FC<{
        id: string;
        name: string;
        value: string;
        checked: boolean;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        label: string;
        description: string;
    }> = ({ id, name, value, checked, onChange, label, description }) => (
        <label htmlFor={id} className={`block p-4 border rounded-lg cursor-pointer transition-all ${checked ? 'border-2 border-[#679a41] ring-1 ring-[#679a41]/30 bg-green-50/50 dark:bg-emerald-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
            <div className="flex items-center">
                <input type="radio" id={id} name={name} value={value} checked={checked} onChange={onChange} className="h-4 w-4 text-[#679a41] focus:ring-[#679a41] border-gray-300" />
                <div className="ml-3">
                    <p className="font-semibold text-sm text-[#293c51] dark:text-gray-200">{label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                </div>
            </div>
        </label>
    );
    
    const SenderListItem: React.FC<{
        sender: Sender;
        onRemove: () => void;
    }> = ({ sender, onRemove }) => (
        <div className="flex items-center justify-between p-2 pl-4 bg-gray-100 dark:bg-slate-700/50 rounded-md">
            <div>
                <p className="font-medium text-sm text-[#293c51] dark:text-gray-200">{sender.name || '(No Name)'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{sender.email}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={onRemove} title="Remove Sender">
                <Icon name="fas fa-trash-alt" className="text-gray-500 hover:text-red-500" />
            </Button>
        </div>
    );

    const mailFlowTabContent = (
        <div className="space-y-6 max-w-3xl">
            <CollapsibleSection title="Forwarding" initialOpen={true}>
                <div className="p-2 space-y-4">
                    <FormField type="checkbox" id="enableForwarding" name="enableForwarding" label="Enable Forwarding" checked={mailFlowSettings.enableForwarding} onChange={handleMailFlowChange} />
                    {mailFlowSettings.enableForwarding && (
                        <div className="pl-6 space-y-4">
                            <FormField id="forwardingAddress" name="forwardingAddress" label="Forward email to:" value={mailFlowSettings.forwardingAddress} onChange={handleMailFlowChange} placeholder="Enter email address" />
                            <FormField type="checkbox" id="keepForwardedCopy" name="keepForwardedCopy" label="Keep a copy of forwarded messages in this mailbox" checked={mailFlowSettings.keepForwardedCopy} onChange={handleMailFlowChange} />
                        </div>
                    )}
                </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Message Acceptance" initialOpen={true}>
                <div className="p-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <RadioCard id="accept-all" name="acceptMessagesFrom" value="all" checked={mailFlowSettings.acceptMessagesFrom === 'all'} onChange={handleMailFlowChange} label="All Senders" description="Accept mail from everyone." />
                        <RadioCard id="accept-list" name="acceptMessagesFrom" value="list" checked={mailFlowSettings.acceptMessagesFrom === 'list'} onChange={handleMailFlowChange} label="Only Senders in List" description="Accept mail only from specific senders." />
                    </div>
                    {mailFlowSettings.acceptMessagesFrom === 'list' && (
                        <div className="pt-4 space-y-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => handleOpenSenderModal('acceptedSenders')} leftIconName="fas fa-plus">Add Sender to Accept List</Button>
                            {mailFlowSettings.acceptedSenders.length > 0 ? (
                                <div className="space-y-2 pt-2">
                                    {mailFlowSettings.acceptedSenders.map(s => <SenderListItem key={s.id} sender={s} onRemove={() => handleRemoveSender('acceptedSenders', s.id)} />)}
                                </div>
                            ) : (
                                <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">No senders in accept list.</p>
                            )}
                        </div>
                    )}
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Message Rejection" initialOpen={true}>
                <div className="p-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <RadioCard id="reject-none" name="rejectMessagesFrom" value="none" checked={mailFlowSettings.rejectMessagesFrom === 'none'} onChange={handleMailFlowChange} label="No Senders" description="Do not reject mail from anyone." />
                        <RadioCard id="reject-list" name="rejectMessagesFrom" value="list" checked={mailFlowSettings.rejectMessagesFrom === 'list'} onChange={handleMailFlowChange} label="Senders in List" description="Reject mail from specific senders." />
                    </div>
                    {mailFlowSettings.rejectMessagesFrom === 'list' && (
                        <div className="pt-4 space-y-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => handleOpenSenderModal('rejectedSenders')} leftIconName="fas fa-plus">Add Sender to Reject List</Button>
                            {mailFlowSettings.rejectedSenders.length > 0 ? (
                                <div className="space-y-2 pt-2">
                                    {mailFlowSettings.rejectedSenders.map(s => <SenderListItem key={s.id} sender={s} onRemove={() => handleRemoveSender('rejectedSenders', s.id)} />)}
                                </div>
                            ) : (
                                <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">No senders in reject list.</p>
                            )}
                        </div>
                    )}
                </div>
            </CollapsibleSection>
        </div>
    );
    
    return (
        <div className="space-y-4">
            <div className="mb-4">
                <Button variant="outline" onClick={() => navigate('/app/email-admin-suite/exchange/mailboxes')} leftIconName="fas fa-arrow-left">
                    Back to Mailboxes
                </Button>
            </div>
            <Card>
                 <div className="p-6">
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
                        {activeTab === 'general' && generalFormContent}
                        {activeTab === 'settings' && settingsTabContent}
                        {activeTab === 'emailAddress' && emailAddressTabContent}
                        {activeTab === 'mailFlow' && mailFlowTabContent}
                        {activeTab !== 'general' && activeTab !== 'settings' && activeTab !== 'emailAddress' && activeTab !== 'mailFlow' && <PlaceholderContent title={tabs.find(t => t.id === activeTab)?.label || 'Settings'}/>}
                    </div>
                </div>

                <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-x-2 flex justify-end rounded-b-xl">
                    <Button variant="ghost" onClick={() => navigate('/app/email-admin-suite/exchange/mailboxes')}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </div>
            </Card>

            <Modal
                isOpen={senderModalState.isOpen}
                onClose={handleCloseSenderModal}
                title={`Add Sender to ${senderModalState.listType === 'acceptedSenders' ? 'Accept' : 'Reject'} List`}
                footer={<><Button variant="ghost" onClick={handleCloseSenderModal}>Cancel</Button><Button onClick={handleSaveSender}>Add Sender</Button></>}
            >
                <div className="space-y-4">
                    <FormField id="senderName" name="name" label="Name (Optional)" value={senderModalState.senderData.name} onChange={(e) => setSenderModalState(s => ({ ...s, senderData: { ...s.senderData, name: e.target.value } }))} />
                    <FormField id="senderEmail" name="email" label="Email Address" type="email" value={senderModalState.senderData.email} onChange={(e) => setSenderModalState(s => ({ ...s, senderData: { ...s.senderData, email: e.target.value } }))} required />
                </div>
            </Modal>
        </div>
    );
};