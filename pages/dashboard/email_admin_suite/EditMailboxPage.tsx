import React, { useState, useMemo, useEffect } from 'react';
import { Card, Button, FormField, Icon, Pagination, Modal, Tooltip, ToggleSwitch, CollapsibleSection } from '@/components/ui';
import type { Mailbox, MailboxPlan, MailboxLevel, MailboxType } from '@/types';
import { mockMailboxes, mockMailboxPlans, mockMailboxDomains } from '@/data';
import { useNavigate, useParams } from 'react-router-dom';

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
    });
    const [activeTab, setActiveTab] = useState('general');

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
            });
        } else {
            alert('Mailbox not found.');
            navigate('/app/email-admin-suite/exchange/mailboxes');
        }
    }, [mailboxId, navigate]);

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
            mailboxType: form.mailboxType
        };

        const index = mockMailboxes.findIndex(m => m.id === mailboxId);
        if (index > -1) {
            mockMailboxes[index] = updatedMailbox;
        }

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
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                       <FormField id="email" name="email" label="Email Address" value={mailboxToEdit.login} onChange={() => {}} disabled />
                       <FormField id="loginName" name="loginName" label="Login Name" value={mailboxToEdit.login.split('@')[0]} onChange={() => {}} disabled hint="Login Name cannot be changed."/>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
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
                        {activeTab !== 'general' && <PlaceholderContent title={tabs.find(t => t.id === activeTab)?.label || 'Settings'}/>}
                    </div>
                </div>
                <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-x-2 flex justify-end rounded-b-xl">
                    <Button variant="ghost" onClick={() => navigate('/app/email-admin-suite/exchange/mailboxes')}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </div>
            </Card>
        </div>
    );
};
