

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, FormField, Icon, Modal } from '@/components/ui';
// Fix: Import `mockRules` from data.ts
import { mockRules } from '@/data';
import type { Rule } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// --- Types and Constants ---
type CriterionType = 'condition' | 'action' | 'exception';

interface RuleItem {
    id: string;
    type: string;
    value: string | string[];
}

const conditionOptions = [
    'The sender is...',
    'The recipient is...',
    'The subject or body includes...',
    'Any attachment content includes...',
    'The sender is member of...',
    'The recipient is member of...',
    'The sender address includes...',
    'The recipient address includes...',
    'The sender domain is...',
    'The recipient domain is...',
    'The Attachment Found...',
    'Message Type Match..'
];

const actionOptions = [
    'Forward the message for approval to...',
    'Redirect the message to...',
    'Reject the message with the explanation...',
    'Delete the message without notifying anyone...',
    'Bcc the message to...',
    'Append the disclaimer...'
];

const mockMembers = [
    'john.doe@alpha-inc.com',
    'jane.smith@alpha-inc.com',
    'sales@alpha-inc.com (Group)',
    'support@betadivision.net (Group)',
    'peter.jones@betadivision.net',
    'mary.w@alpha-inc.com',
    'hr@alpha-inc.com (Group)',
    'ceo@alpha-inc.com'
];

// --- Helper Components ---

const AddItemDropdown: React.FC<{ items: string[], onSelect: (item: string) => void, buttonText: string }> = ({ items, onSelect, buttonText }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                leftIconName="fas fa-plus"
                fullWidth
            >
                {buttonText}
            </Button>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-700 shadow-lg rounded-md border dark:border-slate-600 max-h-60 overflow-y-auto">
                    {items.map(item => (
                        <button
                            key={item}
                            type="button"
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600"
                            onClick={() => {
                                onSelect(item);
                                setIsOpen(false);
                            }}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const RuleItemDisplay: React.FC<{ item: RuleItem, onEdit: () => void, onDelete: () => void }> = ({ item, onEdit, onDelete }) => (
    <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700/50 p-2 rounded-md">
        <div className="flex-grow">
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.type}</p>
            <p className="text-sm font-medium text-[#293c51] dark:text-gray-200 truncate">
                {Array.isArray(item.value) ? item.value.join(', ') : item.value}
            </p>
        </div>
        <Button size="icon" variant="ghost" onClick={onEdit}><Icon name="fas fa-pencil-alt" /></Button>
        <Button size="icon" variant="ghost" onClick={onDelete}><Icon name="fas fa-trash-alt" className="text-red-500" /></Button>
    </div>
);


// --- Main Component ---

export const RuleDetailsPage: React.FC = () => {
    const { ruleId } = useParams<{ ruleId: string }>();
    const navigate = useNavigate();
    const isEditing = !!ruleId;

    const [ruleName, setRuleName] = useState('');
    const [conditions, setConditions] = useState<RuleItem[]>([]);
    const [actions, setActions] = useState<RuleItem[]>([]);
    const [exceptions, setExceptions] = useState<RuleItem[]>([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{ title: string, currentItem: RuleItem, onSave: (item: RuleItem) => void } | null>(null);
    const [modalValue, setModalValue] = useState<string[]>([]);
    const [modalSearch, setModalSearch] = useState('');

    useEffect(() => {
        if (isEditing) {
            const rule = mockRules.find(r => r.id === ruleId);
            if (rule) {
                setRuleName(rule.name);
                // Mock loading of rule items
                setConditions([{ id: uuidv4(), type: 'The recipient is...', value: ['jane.smith@alpha-inc.com'] }]);
                setActions([{ id: uuidv4(), type: 'Forward the message for approval to...', value: ['admin@alpha-inc.com'] }]);
                setExceptions([{ id: uuidv4(), type: 'The sender is member of...', value: ['hr@alpha-inc.com (Group)'] }]);
            } else {
                alert('Rule not found!');
                navigate('/app/email-admin-suite/exchange/rules');
            }
        }
    }, [isEditing, ruleId, navigate]);

    const openModal = (type: CriterionType, itemType: string, existingItem?: RuleItem) => {
        const itemToEdit: RuleItem = existingItem || { id: uuidv4(), type: itemType, value: [] };
        setModalConfig({
            title: `Select: ${itemType}`,
            currentItem: itemToEdit,
            onSave: (newItem) => {
                const updater = (setter: React.Dispatch<React.SetStateAction<RuleItem[]>>) => {
                    setter(prev => {
                        const existing = prev.find(i => i.id === newItem.id);
                        return existing ? prev.map(i => i.id === newItem.id ? newItem : i) : [...prev, newItem];
                    });
                };
                if (type === 'condition') updater(setConditions);
                else if (type === 'action') updater(setActions);
                else if (type === 'exception') updater(setExceptions);
                setIsModalOpen(false);
            }
        });
        setModalValue(Array.isArray(itemToEdit.value) ? itemToEdit.value : [itemToEdit.value]);
        setModalSearch('');
        setIsModalOpen(true);
    };

    const handleDelete = (type: CriterionType, id: string) => {
        const updater = (setter: React.Dispatch<React.SetStateAction<RuleItem[]>>) => setter(prev => prev.filter(item => item.id !== id));
        if (type === 'condition') updater(setConditions);
        else if (type === 'action') updater(setActions);
        else if (type === 'exception') updater(setExceptions);
    };

    const handleSave = () => {
        alert(`Rule '${ruleName}' ${isEditing ? 'updated' : 'created'} successfully!`);
        navigate('/app/email-admin-suite/exchange/rules');
    };

    const filteredMembers = useMemo(() => mockMembers.filter(m => m.toLowerCase().includes(modalSearch.toLowerCase())), [modalSearch]);

    return (
        <div className="space-y-4">
            <div className="mb-4">
                <Button variant="outline" onClick={() => navigate('/app/email-admin-suite/exchange/rules')} leftIconName="fas fa-arrow-left">
                    Back to Rules List
                </Button>
            </div>
            <Card>
                <form className="p-6 space-y-8" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <h2 className="text-2xl font-bold text-[#293c51] dark:text-gray-100">{isEditing ? 'Edit Rule' : 'New Rule'}</h2>
                    <FormField id="ruleName" name="ruleName" label="Rule Name" value={ruleName} onChange={(e) => setRuleName(e.target.value)} required />

                    {/* Conditions Section */}
                    <div className="space-y-3 p-4 border rounded-lg dark:border-slate-700">
                        <h3 className="font-semibold text-lg text-[#293c51] dark:text-gray-200">Apply this rule if...</h3>
                        {conditions.map(item => <RuleItemDisplay key={item.id} item={item} onEdit={() => openModal('condition', item.type, item)} onDelete={() => handleDelete('condition', item.id)} />)}
                        <AddItemDropdown items={conditionOptions} onSelect={(itemType) => openModal('condition', itemType)} buttonText="Add condition" />
                    </div>

                    {/* Actions Section */}
                    <div className="space-y-3 p-4 border rounded-lg dark:border-slate-700">
                        <h3 className="font-semibold text-lg text-[#293c51] dark:text-gray-200">Do the following...</h3>
                        {actions.map(item => <RuleItemDisplay key={item.id} item={item} onEdit={() => openModal('action', item.type, item)} onDelete={() => handleDelete('action', item.id)} />)}
                        <AddItemDropdown items={actionOptions} onSelect={(itemType) => openModal('action', itemType)} buttonText="Add action" />
                    </div>

                    {/* Exceptions Section */}
                    <div className="space-y-3 p-4 border rounded-lg dark:border-slate-700">
                        <h3 className="font-semibold text-lg text-[#293c51] dark:text-gray-200">Except if...</h3>
                        {exceptions.map(item => <RuleItemDisplay key={item.id} item={item} onEdit={() => openModal('exception', item.type, item)} onDelete={() => handleDelete('exception', item.id)} />)}
                        <AddItemDropdown items={conditionOptions} onSelect={(itemType) => openModal('exception', itemType)} buttonText="Add exception" />
                    </div>

                    <div className="flex justify-end space-x-2 pt-6 border-t dark:border-slate-700">
                        <Button type="button" variant="ghost" onClick={() => navigate('/app/email-admin-suite/exchange/rules')}>Cancel</Button>
                        <Button type="submit">{isEditing ? 'Save Changes' : 'Create Rule'}</Button>
                    </div>
                </form>
            </Card>

            {modalConfig && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalConfig.title} size="lg"
                    footer={
                        <>
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button onClick={() => modalConfig.onSave({ ...modalConfig.currentItem, value: modalValue })}>Save</Button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <FormField id="modalSearch" name="modalSearch" label="Search" value={modalSearch} onChange={(e) => setModalSearch(e.target.value)} />
                        <div className="max-h-60 overflow-y-auto border rounded-md dark:border-slate-600 p-2 space-y-1">
                            {filteredMembers.map(member => (
                                <FormField
                                    key={member}
                                    type="checkbox"
                                    id={`member-${member}`}
                                    label={member}
                                    checked={modalValue.includes(member)}
                                    onChange={(e) => {
                                        const checked = (e.target as HTMLInputElement).checked;
                                        setModalValue(prev => checked ? [...prev, member] : prev.filter(m => m !== member));
                                    }}
                                    wrapperClassName="!mb-0 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                                />
                            ))}
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Selected:</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{modalValue.join(', ') || 'None'}</p>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};