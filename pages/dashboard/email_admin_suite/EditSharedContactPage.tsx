import React, { useState, useEffect } from 'react';
import { Card, Button, FormField, Icon } from '@/components/ui';
import type { SharedContact } from '@/types';
import { mockSharedContacts } from '@/data';
import { useNavigate, useParams } from 'react-router-dom';

export const EditSharedContactPage: React.FC = () => {
    const { contactId } = useParams<{ contactId: string }>();
    const navigate = useNavigate();

    const [contact, setContact] = useState<SharedContact | null>(null);
    const [form, setForm] = useState({ displayName: '', email: '' });
    const [activeTab, setActiveTab] = useState('view');
    
    const [restrictions, setRestrictions] = useState({
      requireAuthentication: false,
      acceptFrom: 'all' as 'all' | 'list',
      rejectFrom: 'none' as 'none' | 'list',
    });


    useEffect(() => {
        const contactToEdit = mockSharedContacts.find(c => c.id === contactId);
        if (contactToEdit) {
            setContact(contactToEdit);
            setForm({
                displayName: contactToEdit.displayName,
                email: contactToEdit.email,
            });
            // In a real app, you would fetch and set the delivery restrictions here.
        } else {
            alert('Shared contact not found.');
            navigate('/app/email-admin-suite/exchange/shared-contacts');
        }
    }, [contactId, navigate]);

    const handleSave = () => {
        if (!contact) return;
        
        const updatedContact: SharedContact = {
            ...contact,
            displayName: form.displayName,
            email: form.email,
        };

        const index = mockSharedContacts.findIndex(c => c.id === contactId);
        if (index > -1) {
            mockSharedContacts[index] = updatedContact;
        }

        alert('Shared contact updated successfully!');
        navigate('/app/email-admin-suite/exchange/shared-contacts');
    };

    const handleRestrictionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setRestrictions(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRestrictionsSubmit = () => {
        console.log('Submitting delivery restrictions:', restrictions);
        alert('Message delivery restrictions have been updated.');
        navigate('/app/email-admin-suite/exchange/shared-contacts');
    };


    if (!contact) {
        return <Card><div className="text-center p-8">Loading...</div></Card>;
    }

    const tabs = [
        { id: 'view', label: 'View' },
        { id: 'deliveryRestrictions', label: 'Message Delivery Restrictions' }
    ];

    const viewTabContent = (
        <div className="space-y-4 max-w-lg">
            <FormField 
                id="displayName" 
                name="displayName" 
                label="Display Name" 
                value={form.displayName} 
                onChange={(e) => setForm({...form, displayName: e.target.value})} 
                required 
            />
            <FormField 
                id="email" 
                name="email" 
                label="Email Address" 
                type="email" 
                value={form.email} 
                onChange={(e) => setForm({...form, email: e.target.value})} 
                required 
            />
        </div>
    );
    
    const deliveryRestrictionsTabContent = (
      <div className="space-y-6 max-w-2xl">
        <FormField
          type="checkbox"
          id="requireAuthentication"
          name="requireAuthentication"
          label="Require that all senders are authenticated"
          checked={restrictions.requireAuthentication}
          onChange={handleRestrictionsChange}
        />
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#293c51] dark:text-gray-300">Accept Messages From</label>
          <div className="flex items-center space-x-8">
            <label className="flex items-center cursor-pointer">
              <input type="radio" name="acceptFrom" value="all" checked={restrictions.acceptFrom === 'all'} onChange={handleRestrictionsChange} className="h-4 w-4 text-[#679a41] focus:ring-[#679a41] border-gray-300"/>
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">All senders</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="radio" name="acceptFrom" value="list" checked={restrictions.acceptFrom === 'list'} onChange={handleRestrictionsChange} className="h-4 w-4 text-[#679a41] focus:ring-[#679a41] border-gray-300"/>
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Only senders in the following list</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#293c51] dark:text-gray-300">Reject Messages From</label>
          <div className="flex items-center space-x-8">
            <label className="flex items-center cursor-pointer">
              <input type="radio" name="rejectFrom" value="none" checked={restrictions.rejectFrom === 'none'} onChange={handleRestrictionsChange} className="h-4 w-4 text-[#679a41] focus:ring-[#679a41] border-gray-300"/>
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">No senders</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="radio" name="rejectFrom" value="list" checked={restrictions.rejectFrom === 'list'} onChange={handleRestrictionsChange} className="h-4 w-4 text-[#679a41] focus:ring-[#679a41] border-gray-300"/>
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Senders in the following list</span>
            </label>
          </div>
        </div>

        <div className="flex justify-start space-x-2 pt-4">
            <Button onClick={handleRestrictionsSubmit}>Submit</Button>
            <Button variant="outline" onClick={() => navigate('/app/email-admin-suite/exchange/shared-contacts')}>Cancel</Button>
        </div>
      </div>
    );
    
    return (
        <div className="space-y-4">
            <div className="mb-4">
                <Button variant="outline" onClick={() => navigate('/app/email-admin-suite/exchange/shared-contacts')} leftIconName="fas fa-arrow-left">
                    Back to Shared Contacts
                </Button>
            </div>
            <Card>
                <div className="p-6">
                    <div className="border-b border-gray-200 dark:border-slate-700">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
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
                        {activeTab === 'view' && viewTabContent}
                        {activeTab === 'deliveryRestrictions' && deliveryRestrictionsTabContent}
                    </div>
                </div>
                {activeTab === 'view' && (
                  <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-x-2 flex justify-end rounded-b-xl">
                      <Button variant="ghost" onClick={() => navigate('/app/email-admin-suite/exchange/shared-contacts')}>Cancel</Button>
                      <Button onClick={handleSave}>Save Changes</Button>
                  </div>
                )}
            </Card>
        </div>
    );
};