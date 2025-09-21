import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button, Icon, ToggleSwitch, FormField, Modal, Card } from '@/components/ui';
import { v4 as uuidv4 } from 'uuid';

interface FirewallRule {
  id: string;
  name: string;
  ruleId: string;
  sources: string;
  destinations: string;
  services: { name: string; icon: string }[];
  profiles: string;
  appliedTo: string;
  action: 'Allow' | 'Drop' | 'Reject';
  enabled: boolean;
}

interface FirewallPolicy {
  id: string;
  name: string;
  policyId: string;
  rules: FirewallRule[];
  isExpanded: boolean;
}

const mockGatewayPoliciesData: FirewallPolicy[] = [
    { id: 'gw-policy1', name: 'T1 Pre-Rules', policyId: '(1)', rules: [
        { id: 'gw-rule1-1', name: 'Allow SSH to Jumpbox', ruleId: '101', sources: 'Admin-IP-Set', destinations: 'Jumpbox-VM', services: [{ name: 'SSH', icon: 'fas fa-terminal' }], profiles: 'None', appliedTo: 'Tier1-Gateway-01', action: 'Allow', enabled: true },
        { id: 'gw-rule1-2', name: 'Drop Invalid States', ruleId: '102', sources: 'Any', destinations: 'Any', services: [{ name: 'Any', icon: 'fas fa-asterisk' }], profiles: 'None', appliedTo: 'Tier1-Gateway-01', action: 'Drop', enabled: true },
    ], isExpanded: true },
    { id: 'gw-policy2', name: 'Default Tier1 Rules', policyId: '(3)', rules: [
        { id: 'gw-rule2-1', name: 'Allow Web Inbound', ruleId: '103', sources: 'Any', destinations: 'Web-VIP', services: [{ name: 'HTTPS', icon: 'fas fa-lock' }], profiles: 'None', appliedTo: 'Tier1-Gateway-01', action: 'Allow', enabled: true },
        { id: 'gw-rule2-2', name: 'Allow App to DB Outbound', ruleId: '104', sources: 'App-Subnet', destinations: 'DB-Subnet-CIDR', services: [{ name: 'MySQL', icon: 'fas fa-database' }], profiles: 'None', appliedTo: 'Tier1-Gateway-01', action: 'Allow', enabled: true },
        { id: 'gw-rule2-3', name: 'Deny All Other Outbound', ruleId: '105', sources: 'Any', destinations: 'Any', services: [{ name: 'Any', icon: 'fas fa-asterisk' }], profiles: 'None', appliedTo: 'Tier1-Gateway-01', action: 'Reject', enabled: false },
    ], isExpanded: true },
    { id: 'gw-policy3', name: 'Emergency Block', policyId: '(0)', rules: [], isExpanded: true },
];

// --- NEW: Types and Data for Settings Tab ---
interface GatewaySetting {
  id: string;
  gatewayName: string;
  type: string;
  gatewayFirewallEnabled: boolean;
  identityFirewallEnabled: boolean;
}

const mockGatewaySettings: GatewaySetting[] = [
    { id: 'gw1', gatewayName: 'MCA>Como>org>cms basic plan', type: 'Tier1', gatewayFirewallEnabled: true, identityFirewallEnabled: false },
    { id: 'gw2', gatewayName: 'MCA>Como>org>ok', type: 'Tier1', gatewayFirewallEnabled: true, identityFirewallEnabled: false },
    { id: 'gw3', gatewayName: 'MCA>Como>org>reeeeeeeee...', type: 'Tier1', gatewayFirewallEnabled: true, identityFirewallEnabled: false },
    { id: 'gw4', gatewayName: 'MCA>Como>org>res', type: 'Tier1', gatewayFirewallEnabled: true, identityFirewallEnabled: false },
    { id: 'gw5', gatewayName: 'MCA>Como>org>res56', type: 'Tier1', gatewayFirewallEnabled: true, identityFirewallEnabled: false },
    { id: 'gw6', gatewayName: 'MCA>Como>org>tc', type: 'Tier1', gatewayFirewallEnabled: true, identityFirewallEnabled: false },
    { id: 'gw7', gatewayName: 'MCA>compepe>org1>ct', type: 'Tier1', gatewayFirewallEnabled: true, identityFirewallEnabled: false },
    { id: 'gw8', gatewayName: 'MCA>custeff>vvb>res', type: 'Tier1', gatewayFirewallEnabled: true, identityFirewallEnabled: false },
    { id: 'gw9', gatewayName: 'MCA>ggg>hhh>dfdf', type: 'Tier1', gatewayFirewallEnabled: true, identityFirewallEnabled: false },
    { id: 'gw10', gatewayName: 'MCA>hjj>jk>bhjk', type: 'Tier1', gatewayFirewallEnabled: true, identityFirewallEnabled: false },
    ...Array.from({ length: 38 }, (_, i) => ({
        id: `gw${i + 11}`,
        gatewayName: `MCA>Como>org>generated-item-${i+1}`,
        type: 'Tier1',
        gatewayFirewallEnabled: true,
        identityFirewallEnabled: false
    }))
];

// --- NEW: Component for Settings Tab ---
const GatewaySpecificSettings: React.FC = () => {
    const [settings, setSettings] = useState<GatewaySetting[]>(mockGatewaySettings);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [filter, setFilter] = useState('');

    const DropdownButton: React.FC<{
        label: string;
        options: string[];
        onSelect: (option: string) => void;
        disabled: boolean;
    }> = ({ label, options, onSelect, disabled }) => {
        const [isOpen, setIsOpen] = useState(false);
        const wrapperRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        return (
            <div className="relative inline-block text-left" ref={wrapperRef}>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={disabled}
                    className="dark:border-slate-600 dark:hover:bg-slate-700"
                >
                    {label}
                    <Icon name="fas fa-chevron-down" className="ml-2 text-xs" />
                </Button>

                {isOpen && (
                    <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 dark:ring-slate-700 z-10">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                            {options.map(option => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        onSelect(option);
                                        setIsOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                                    role="menuitem"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };
    
    const handleBulkAction = (action: 'on' | 'off', feature: 'Gateway Firewall' | 'Identity Firewall' | 'Both Features') => {
        if (selectedIds.length === 0) return;

        setSettings(currentSettings =>
            currentSettings.map(s => {
                if (selectedIds.includes(s.id)) {
                    const newValue = action === 'on';
                    const updatedSetting = { ...s };
                    if (feature === 'Gateway Firewall' || feature === 'Both Features') {
                        updatedSetting.gatewayFirewallEnabled = newValue;
                    }
                    if (feature === 'Identity Firewall' || feature === 'Both Features') {
                        updatedSetting.identityFirewallEnabled = newValue;
                    }
                    return updatedSetting;
                }
                return s;
            })
        );
        setSelectedIds([]);
    };

    const handleToggle = (id: string, field: 'gatewayFirewallEnabled' | 'identityFirewallEnabled') => {
        setSettings(currentSettings => 
            currentSettings.map(s => s.id === id ? { ...s, [field]: !s[field] } : s)
        );
    };

    const handleSelectOne = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredSettings.map(s => s.id));
        } else {
            setSelectedIds([]);
        }
    };

    const filteredSettings = useMemo(() => {
        if (!filter) return settings;
        return settings.filter(s => s.gatewayName.toLowerCase().includes(filter.toLowerCase()));
    }, [settings, filter]);

    const isAllSelected = selectedIds.length === filteredSettings.length && filteredSettings.length > 0;
    const turnOnOffOptions = ['Gateway Firewall', 'Identity Firewall', 'Both Features'];

    return (
        <Card>
            <h2 className="text-xl font-semibold mb-4 text-[#293c51] dark:text-gray-100">Gateway Specific Settings</h2>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 text-yellow-800 dark:text-yellow-300 p-3 rounded-md flex items-start gap-3 mb-4">
                <Icon name="fas fa-exclamation-triangle" className="mt-1 flex-shrink-0" />
                <div className="text-sm">
                    <p>You need to have atleast one Active Directory configured for the identity firewall to work. AD configuration is not present on the system. You can configure AD under Active Directory and turn on the Event Log Source under Identity Firewall.</p>
                    <div className="mt-2">
                        <a href="#" className="font-semibold underline hover:no-underline mr-4">Configure AD</a>
                        <a href="#" className="font-semibold underline hover:no-underline">Turn on Event Log Source</a>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                     <DropdownButton
                        label="TURN ON"
                        options={turnOnOffOptions}
                        onSelect={(option) => handleBulkAction('on', option as any)}
                        disabled={selectedIds.length === 0}
                    />
                    <DropdownButton
                        label="TURN OFF"
                        options={turnOnOffOptions}
                        onSelect={(option) => handleBulkAction('off', option as any)}
                        disabled={selectedIds.length === 0}
                    />
                </div>
                <div className="w-full max-w-xs relative">
                    <FormField
                        id="filter"
                        label=""
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Filter by Name, Path and more"
                        inputClassName="!pr-8"
                        wrapperClassName="!mb-0"
                    />
                     <Icon name="fas fa-bars" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            <div className="overflow-x-auto border rounded-lg dark:border-slate-700">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-2 w-10 text-left"><input type="checkbox" className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 rounded-sm focus:ring-sky-500 text-sky-500" checked={isAllSelected} onChange={handleSelectAll} /></th>
                            <th className="p-2 text-left font-semibold text-gray-600 dark:text-gray-300">Gateway Name</th>
                            <th className="p-2 text-left font-semibold text-gray-600 dark:text-gray-300">Type</th>
                            <th className="p-2 text-left font-semibold text-gray-600 dark:text-gray-300">Gateway Firewall</th>
                            <th className="p-2 text-left font-semibold text-gray-600 dark:text-gray-300">Identity Firewall</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {filteredSettings.map(item => (
                            <tr key={item.id}>
                                <td className="p-2"><input type="checkbox" className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 rounded-sm focus:ring-sky-500 text-sky-500" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} /></td>
                                <td className="p-2 text-gray-800 dark:text-gray-200">{item.gatewayName}</td>
                                <td className="p-2 text-gray-600 dark:text-gray-300">{item.type}</td>
                                <td className="p-2">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                        <ToggleSwitch
                                            size="sm"
                                            id={`gwf-${item.id}`}
                                            checked={item.gatewayFirewallEnabled}
                                            onChange={() => handleToggle(item.id, 'gatewayFirewallEnabled')}
                                        />
                                        <span>{item.gatewayFirewallEnabled ? 'On' : 'Off'}</span>
                                    </div>
                                </td>
                                <td className="p-2">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                        <ToggleSwitch
                                            size="sm"
                                            id={`idf-${item.id}`}
                                            checked={item.identityFirewallEnabled}
                                            onChange={() => handleToggle(item.id, 'identityFirewallEnabled')}
                                        />
                                        <span>{item.identityFirewallEnabled ? 'On' : 'Off'}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-4">
                <Button variant="ghost" size="sm" className="text-sky-500 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/50" leftIconName="fas fa-sync-alt">REFRESH</Button>
                <span className="text-gray-500 dark:text-gray-400">1 - {filteredSettings.length} of {settings.length}</span>
            </div>
        </Card>
    );
};

const ActionDropdown: React.FC<{
    currentAction: 'Allow' | 'Drop' | 'Reject';
    onActionChange: (newAction: 'Allow' | 'Drop' | 'Reject') => void;
}> = ({ currentAction, onActionChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const actions: ('Allow' | 'Drop' | 'Reject')[] = ['Allow', 'Drop', 'Reject'];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getActionClasses = (action: 'Allow' | 'Drop' | 'Reject') => {
        switch (action) {
            case 'Allow': return { text: 'text-green-500', bg: 'bg-green-500' };
            case 'Drop': return { text: 'text-yellow-500', bg: 'bg-yellow-500' };
            case 'Reject': return { text: 'text-red-500', bg: 'bg-red-500' };
        }
    };

    const currentActionClasses = getActionClasses(currentAction);

    return (
        <div ref={dropdownRef} className="relative inline-block text-left">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center w-full rounded-md px-2 py-1 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-sky-500">
                <span className={`flex items-center ${currentActionClasses.text}`}>
                    <span className={`w-2 h-2 rounded-full ${currentActionClasses.bg} mr-2`}></span>
                    {currentAction}
                </span>
                <Icon name="fas fa-chevron-down" className="ml-2 -mr-1 h-4 w-4 text-gray-400" />
            </button>
            {isOpen && (
                <div className="origin-top-left absolute left-0 mt-2 w-32 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 dark:ring-slate-700 z-10">
                    <div className="py-1" role="menu">
                        {actions.map(action => {
                            const actionClasses = getActionClasses(action);
                            return (
                                <button key={action} onClick={() => { onActionChange(action); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700" role="menuitem">
                                    <span className={`flex items-center ${actionClasses.text}`}>
                                        <span className={`w-2 h-2 rounded-full ${actionClasses.bg} mr-2`}></span>
                                        {action}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const GatewaySpecificRules: React.FC = () => {
    const [policies, setPolicies] = useState<FirewallPolicy[]>(mockGatewayPoliciesData);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isAddingPolicy, setIsAddingPolicy] = useState(false);
    const [newPolicyName, setNewPolicyName] = useState('');
    const [addingRuleToPolicyId, setAddingRuleToPolicyId] = useState<string | null>(null);
    const [newRuleForm, setNewRuleForm] = useState({ name: '' });
    
    const isReadOnly = false;

    const togglePolicy = (policyId: string) => {
        setPolicies(currentPolicies => currentPolicies.map(p =>
            p.id === policyId ? { ...p, isExpanded: !p.isExpanded } : p
        ));
    };
    
    const handleToggleRule = (policyId: string, ruleId: string) => {
        setPolicies(currentPolicies => currentPolicies.map(p => {
            if (p.id === policyId) {
                return { ...p, rules: p.rules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r) }
            }
            return p;
        }));
    };

    const handleRuleActionChange = (policyId: string, ruleId: string, newAction: 'Allow' | 'Drop' | 'Reject') => {
        setPolicies(prev => prev.map(p => {
            if (p.id === policyId) {
                return { ...p, rules: p.rules.map(r => r.id === ruleId ? { ...r, action: newAction } : r) };
            }
            return p;
        }));
    };
    
    const handleSelect = (id: string) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    
    const isSinglePolicySelected = useMemo(() => {
        if (selectedItems.length !== 1) return false;
        return policies.some(p => p.id === selectedItems[0]);
    }, [selectedItems, policies]);

    const handleAddRuleClick = () => {
        if (isSinglePolicySelected) {
            setAddingRuleToPolicyId(selectedItems[0]);
        }
    };
    
    const EditableCell: React.FC<{ value: string; onSave: (newValue: string) => void }> = ({ value, onSave }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [currentValue, setCurrentValue] = useState(value);
        
        const handleSave = () => {
            onSave(currentValue);
            setIsEditing(false);
        };
        
        if (isEditing) {
            return (
                <div className="flex items-center gap-1">
                    <FormField id="edit-cell" label="" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} wrapperClassName="!mb-0 flex-grow" inputClassName="!py-1" />
                    <Button size="icon" variant="ghost" onClick={handleSave}><Icon name="fas fa-check" className="text-green-500" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}><Icon name="fas fa-times" className="text-red-500" /></Button>
                </div>
            );
        }

        return (
            <div className="group relative cursor-pointer" onDoubleClick={() => setIsEditing(true)}>
                <span>{value}</span>
                <Icon name="fas fa-pencil-alt" className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-sky-500" />
            </div>
        );
    };

    return (
        <div className="mt-4">
            <div className="flex items-center space-x-2 py-2 mb-2">
                <Button variant="outline" size="sm" leftIconName="fas fa-plus-circle" onClick={() => setIsAddingPolicy(true)}>ADD POLICY</Button>
                <Button variant="outline" size="sm" leftIconName="fas fa-plus" onClick={handleAddRuleClick} disabled={!isSinglePolicySelected || !!addingRuleToPolicyId}>ADD RULE</Button>
            </div>
            
            {/* Table structure as before, with the logic for new rules and policies */}
            <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                <table className="min-w-full w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                    {/* ... thead ... */}
                     <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[25%]">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[5%]">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[10%]">Sources</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[10%]">Destinations</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[10%]">Services</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[10%]">Profiles</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[20%]">Applied To</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[15%]">Action</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[10%]"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {policies.map(policy => (
                            <React.Fragment key={policy.id}>
                                <tr className="bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 h-[52px]">
                                    <td className="px-4 py-3 text-sm text-[#293c51] dark:text-gray-200 truncate">
                                        <div className="flex items-center gap-x-2">
                                            <button onClick={() => togglePolicy(policy.id)} className="text-gray-500 w-5 text-center flex-shrink-0">
                                                <Icon name={policy.isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right'} />
                                            </button>
                                            <input type="checkbox" checked={selectedItems.includes(policy.id)} onChange={() => handleSelect(policy.id)} disabled={isReadOnly} className="bg-gray-100 border-gray-300 rounded text-sky-500 focus:ring-sky-500 flex-shrink-0" />
                                            <div className="flex items-center gap-x-2">
                                                <span className="font-semibold">{policy.name}</span>
                                                <span className="text-gray-500 dark:text-gray-400 font-normal">{policy.policyId}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td colSpan={8}></td>
                                </tr>
                                {policy.isExpanded && policy.rules.map(rule => (
                                    <tr key={rule.id} className="h-[52px]">
                                        <td className="px-4 py-3 text-sm text-[#293c51] dark:text-gray-200 truncate group relative">
                                            <div className="flex items-center gap-x-2 pl-6">
                                                <input type="checkbox" checked={selectedItems.includes(rule.id)} onChange={(e) => { e.stopPropagation(); handleSelect(rule.id); }} disabled={isReadOnly} className="bg-gray-100 border-gray-300 rounded text-sky-500 focus:ring-sky-500 flex-shrink-0" />
                                                <EditableCell value={rule.name} onSave={(newValue) => {}} />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 truncate">{rule.ruleId}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-sky-500 truncate"><EditableCell value={rule.sources} onSave={(newValue) => {}} /></td>
                                        <td className="px-4 py-3 text-sm font-medium text-sky-500 truncate"><EditableCell value={rule.destinations} onSave={(newValue) => {}} /></td>
                                        <td className="px-4 py-3 text-sm text-sky-500 truncate"><EditableCell value={rule.services.map(s => s.name).join(', ')} onSave={(newValue) => {}} /></td>
                                        <td className="px-4 py-3 text-sm text-sky-500 truncate"><EditableCell value={rule.profiles} onSave={(newValue) => {}} /></td>
                                        <td className="px-4 py-3 text-sm text-sky-500 font-medium truncate"><EditableCell value={rule.appliedTo} onSave={(newValue) => {}} /></td>
                                        <td className="px-4 py-3 text-sm font-semibold">
                                            <ActionDropdown currentAction={rule.action} onActionChange={(newAction) => handleRuleActionChange(policy.id, rule.id, newAction)} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end items-center gap-1">
                                                <ToggleSwitch size="sm" id={`toggle-${rule.id}`} checked={rule.enabled} onChange={() => handleToggleRule(policy.id, rule.id)} />
                                                <Button size="icon" variant="ghost" title="Settings" className="text-gray-400 hover:text-sky-500">
                                                    <Icon name="fas fa-cog" />
                                                </Button>
                                                <Button size="icon" variant="ghost" title="Statistics" className="text-gray-400 hover:text-sky-500">
                                                    <Icon name="fas fa-chart-bar" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const GatewayFirewallPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Rules');

    const tabs = [
        { id: 'Rules', name: 'Gateway Specific Rules' },
        { id: 'Settings', name: 'Settings' }
    ];

    return (
        <div className="bg-white dark:bg-slate-900/50 text-[#293c51] dark:text-gray-200 font-sans rounded-xl shadow-sm">
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-semibold text-[#293c51] dark:text-gray-100">Gateway Firewall</h1>
                </div>
                
                <div className="border-b border-gray-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-[#679a41] dark:border-emerald-500 text-[#679a41] dark:text-emerald-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-[#293c51] dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-slate-600'}`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {activeTab === 'Rules' && <GatewaySpecificRules />}
                {activeTab === 'Settings' && (
                    <div className="mt-4">
                        <GatewaySpecificSettings />
                    </div>
                )}
            </div>
        </div>
    );
};