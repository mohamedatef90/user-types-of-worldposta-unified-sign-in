import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button, Icon, ToggleSwitch, FormField, Modal, Card, Pagination, Tooltip } from '@/components/ui';
import { v4 as uuidv4 } from 'uuid';

// --- INTERFACES ---

interface FirewallRule {
  id: string;
  name: string;
  ruleId: string;
  sources: string;
  destinations: string;
  services: { name: string; icon: string }[];
  contextProfiles: string;
  appliedTo: string;
  action: 'Allow' | 'Deny' | 'Drop';
  enabled: boolean;
}

interface FirewallPolicy {
  id: string;
  name: string;
  policyId: string;
  appliedTo: string;
  status: 'Success';
  rules: FirewallRule[];
  isExpanded: boolean;
}

// --- MOCK DATA ---

const mockPoliciesData: FirewallPolicy[] = [
    { id: 'policy1', name: 'Web Servers Policy', policyId: '(2)', appliedTo: '2 Groups', status: 'Success', rules: [
        { id: 'rule-web-1', name: 'Allow HTTP', ruleId: '5', sources: 'Any', destinations: 'Web Servers Group', services: [{ name: 'HTTP', icon: 'fas fa-globe' }], contextProfiles: 'None', appliedTo: 'DFW', action: 'Allow', enabled: true },
        { id: 'rule-web-2', name: 'Allow HTTPS', ruleId: '6', sources: 'Any', destinations: 'Web Servers Group', services: [{ name: 'HTTPS', icon: 'fas fa-lock' }], contextProfiles: 'None', appliedTo: 'DFW', action: 'Allow', enabled: true },
    ], isExpanded: true },
    { id: 'policy2', name: 'Database Policy', policyId: '(1)', appliedTo: 'DB Servers Group', status: 'Success', rules: [
        { id: 'rule-db-1', name: 'Allow SQL', ruleId: '7', sources: 'App Servers Group', destinations: 'DB Servers Group', services: [{ name: 'MySQL', icon: 'fas fa-database' }], contextProfiles: 'None', appliedTo: 'DFW', action: 'Allow', enabled: true },
    ], isExpanded: true },
    {
        id: 'policy5', name: 'Default Layer3 Section', policyId: '(3)', appliedTo: 'DFW', status: 'Success', isExpanded: true,
        rules: [
            { id: 'rule1', name: 'Default Rule NDP', ruleId: '3', sources: 'Any', destinations: 'Any', services: [{ name: 'IPv6-ICMP Neigh...', icon: 'fas fa-cog' }, { name: 'IPv6-ICMP Neigh...', icon: 'fas fa-cog' }], contextProfiles: 'None', appliedTo: 'DFW', action: 'Allow', enabled: true },
            { id: 'rule2', name: 'Default Rule DHCP', ruleId: '4', sources: 'Any', destinations: 'Any', services: [{ name: 'DHCP-Server', icon: 'fas fa-cog' }, { name: 'DHCP-Client', icon: 'fas fa-cog' }], contextProfiles: 'None', appliedTo: 'DFW', action: 'Allow', enabled: true },
            { id: 'rule3', name: 'Default Layer3 Rule', ruleId: '2', sources: 'Any', destinations: 'Any', services: [{ name: 'Any', icon: '' }], contextProfiles: 'None', appliedTo: 'DFW', action: 'Allow', enabled: false },
        ]
    },
];

const mockAvailableServices = [
    { name: 'HTTP', icon: 'fas fa-globe' },
    { name: 'HTTPS', icon: 'fas fa-lock' },
    { name: 'SSH', icon: 'fas fa-terminal' },
    { name: 'MySQL', icon: 'fas fa-database' },
    { name: 'Any', icon: 'fas fa-asterisk' },
];

const mockAvailableGroups = [
    'Any', 'Web Servers Group', 'DB Servers Group', 'App Servers Group', 'Admin IP Group', 'Mgmt Group'
];

// --- MAIN COMPONENT ---

export const DistributedFirewallPage: React.FC = () => {
    const [policies, setPolicies] = useState<FirewallPolicy[]>(mockPoliciesData);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isAddPolicyModalOpen, setIsAddPolicyModalOpen] = useState(false);
    const [newPolicyName, setNewPolicyName] = useState('');
    const [addingRuleToPolicyId, setAddingRuleToPolicyId] = useState<string | null>(null);
    const [newRuleForm, setNewRuleForm] = useState<Partial<Omit<FirewallRule, 'id'>>>({
        name: '',
        sources: 'Any',
        destinations: 'Any',
        services: [],
        appliedTo: 'DFW',
        action: 'Allow',
        enabled: true,
    });
    
    // States for editing modals
    const [editingCell, setEditingCell] = useState<{ policyId: string; ruleId: string; field: 'sources' | 'destinations' | 'appliedTo' | 'services' } | null>(null);

    const togglePolicy = (policyId: string) => {
        setPolicies(currentPolicies => currentPolicies.map(p =>
            p.id === policyId ? { ...p, isExpanded: !p.isExpanded } : p
        ));
    };

    const handleSelect = (id: string) => {
        setSelectedItems(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(id)) {
                newSelection.delete(id);
            } else {
                newSelection.add(id);
            }
            return Array.from(newSelection);
        });
    };

    const handleSavePolicy = () => {
        if (!newPolicyName.trim()) return;
        const newPolicy: FirewallPolicy = {
            id: uuidv4(),
            name: newPolicyName,
            policyId: `(${Math.floor(Math.random() * 10)})`,
            appliedTo: 'DFW',
            status: 'Success',
            rules: [],
            isExpanded: true,
        };
        setPolicies(prev => [newPolicy, ...prev]);
        setIsAddPolicyModalOpen(false);
        setNewPolicyName('');
        setAddingRuleToPolicyId(newPolicy.id); // Trigger add rule form
    };

    const handleSaveRule = () => {
        if (!addingRuleToPolicyId || !newRuleForm.name?.trim()) return;
        const newRule: FirewallRule = {
            id: uuidv4(),
            ruleId: `(${Math.floor(Math.random() * 100)})`,
            name: newRuleForm.name,
            sources: newRuleForm.sources || 'Any',
            destinations: newRuleForm.destinations || 'Any',
            services: newRuleForm.services || [],
            contextProfiles: 'None',
            appliedTo: newRuleForm.appliedTo || 'DFW',
            action: newRuleForm.action || 'Allow',
            enabled: newRuleForm.enabled !== undefined ? newRuleForm.enabled : true,
        };
        setPolicies(prev => prev.map(p => p.id === addingRuleToPolicyId ? { ...p, rules: [...p.rules, newRule] } : p));
        setAddingRuleToPolicyId(null);
        setNewRuleForm({});
    };

    const handleDeleteSelected = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedItems.length} selected item(s)?`)) {
            setPolicies(prev => {
                const policiesToDelete = new Set(selectedItems.filter(id => id.startsWith('policy')));
                const updatedPolicies = prev.filter(p => !policiesToDelete.has(p.id));
                return updatedPolicies.map(p => ({
                    ...p,
                    rules: p.rules.filter(r => !selectedItems.includes(r.id))
                }));
            });
            setSelectedItems([]);
        }
    };
    
    const handleSaveCell = (policyId: string, ruleId: string, field: 'sources' | 'destinations' | 'appliedTo' | 'services', value: any) => {
        setPolicies(prev => prev.map(p => {
            if (p.id === policyId) {
                return { ...p, rules: p.rules.map(r => r.id === ruleId ? { ...r, [field]: value } : r) };
            }
            return p;
        }));
        setEditingCell(null);
    };

    const EditableCell: React.FC<{ value: string; onEdit: () => void }> = ({ value, onEdit }) => (
        <button onClick={onEdit} className="group w-full flex items-center justify-between text-left p-1 rounded hover:bg-gray-100/50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-sky-500">
            <span className="truncate text-sky-500">{value}</span>
            <Icon name="fas fa-pencil-alt" className="text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs ml-2" />
        </button>
    );

    const ServicesCell: React.FC<{ services: { name: string; icon: string }[], onEdit: () => void }> = ({ services, onEdit }) => (
         <button onClick={onEdit} className="group w-full flex items-center gap-2 text-left p-1 rounded hover:bg-gray-100/50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-sky-500">
            <div className="flex items-center gap-1.5 flex-wrap">
                {services.map((s, i) => (
                    <div key={i} className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                        <Icon name={s.icon} className="text-xs text-gray-500 dark:text-gray-400" />
                        <span className="text-xs font-medium text-sky-600 dark:text-sky-400">{s.name}</span>
                    </div>
                ))}
            </div>
             <Icon name="fas fa-pencil-alt" className="text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs ml-auto" />
        </button>
    );


    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold">Distributed Firewall</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setIsAddPolicyModalOpen(true)} leftIconName="fas fa-plus-circle">ADD POLICY</Button>
                    <Button variant="danger" onClick={handleDeleteSelected} disabled={selectedItems.length === 0} leftIconName="fas fa-trash-alt">DELETE</Button>
                    <Button variant="primary">PUBLISH</Button>
                </div>
            </div>
            
            <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                <table className="min-w-full w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[20%]">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[15%]">Sources</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[15%]">Destinations</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[15%]">Services</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[15%]">Applied To</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[10%]">Action</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[10%]">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {policies.map(policy => (
                            <React.Fragment key={policy.id}>
                                <tr className="bg-gray-100 dark:bg-slate-700/50">
                                    <td className="px-4 py-2" colSpan={7}>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => togglePolicy(policy.id)}><Icon name={policy.isExpanded ? "fas fa-chevron-down" : "fas fa-chevron-right"} /></button>
                                            <input type="checkbox" checked={selectedItems.includes(policy.id)} onChange={() => handleSelect(policy.id)} />
                                            <span className="font-semibold">{policy.name}</span>
                                            <span className="text-xs text-gray-500">{policy.policyId}</span>
                                            <Icon name="fas fa-check-circle" className="text-green-500" />
                                            <button><Icon name="fas fa-sync-alt" className="text-xs text-sky-500" /></button>
                                        </div>
                                    </td>
                                </tr>
                                {policy.isExpanded && (
                                    <>
                                        {policy.rules.map(rule => (
                                            <tr key={rule.id}>
                                                <td className="px-4 py-2 pl-12">
                                                     <div className="flex items-center gap-2">
                                                        <input type="checkbox" checked={selectedItems.includes(rule.id)} onChange={() => handleSelect(rule.id)} />
                                                        <span className="truncate w-24 text-sm">{rule.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 text-sm"><EditableCell value={rule.sources} onEdit={() => setEditingCell({ policyId: policy.id, ruleId: rule.id, field: 'sources' })}/></td>
                                                <td className="px-2 py-1 text-sm"><EditableCell value={rule.destinations} onEdit={() => setEditingCell({ policyId: policy.id, ruleId: rule.id, field: 'destinations' })}/></td>
                                                <td className="px-2 py-1 text-sm"><ServicesCell services={rule.services} onEdit={() => setEditingCell({ policyId: policy.id, ruleId: rule.id, field: 'services' })}/></td>
                                                <td className="px-2 py-1 text-sm"><EditableCell value={rule.appliedTo} onEdit={() => setEditingCell({ policyId: policy.id, ruleId: rule.id, field: 'appliedTo' })}/></td>
                                                <td className="px-2 py-1 text-sm w-24">{rule.action}</td>
                                                <td className="px-4 py-2 text-center">
                                                     <div className="flex items-center justify-center gap-3">
                                                        <Icon name="fas fa-cog" className="text-gray-400 cursor-pointer" />
                                                        <Icon name="fas fa-history" className="text-gray-400 cursor-pointer" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {addingRuleToPolicyId === policy.id && (
                                            <tr className="bg-gray-50 dark:bg-slate-700/30">
                                                <td className="px-4 py-2 pl-12"><FormField id="new-name" label="" wrapperClassName="!mb-0" value={newRuleForm.name || ''} onChange={(e) => setNewRuleForm(f => ({...f, name: e.target.value}))} placeholder="Rule Name"/></td>
                                                <td className="px-2 py-1"><EditableCell value={newRuleForm.sources || ''} onEdit={() => alert("Configure after saving")} /></td>
                                                <td className="px-2 py-1"><EditableCell value={newRuleForm.destinations || ''} onEdit={() => alert("Configure after saving")} /></td>
                                                <td className="px-2 py-1"><ServicesCell services={newRuleForm.services || []} onEdit={() => alert("Configure after saving")} /></td>
                                                <td className="px-2 py-1"><EditableCell value={newRuleForm.appliedTo || ''} onEdit={() => alert("Configure after saving")} /></td>
                                                <td className="px-2 py-1">
                                                    <FormField as="select" id="new-action" label="" wrapperClassName="!mb-0" value={newRuleForm.action} onChange={e => setNewRuleForm(f => ({...f, action: e.target.value as any}))}>
                                                        <option>Allow</option><option>Deny</option><option>Drop</option>
                                                    </FormField>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button size="sm" onClick={handleSaveRule}>Save</Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setAddingRuleToPolicyId(null)}>Cancel</Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <Modal isOpen={isAddPolicyModalOpen} onClose={() => setIsAddPolicyModalOpen(false)} title="Add New Policy" footer={<><Button variant="ghost" onClick={() => setIsAddPolicyModalOpen(false)}>Cancel</Button><Button onClick={handleSavePolicy}>Save</Button></>}>
                <FormField id="new-policy-name" label="Policy Name" value={newPolicyName} onChange={e => setNewPolicyName(e.target.value)} required />
            </Modal>

            <Modal isOpen={!!editingCell && (editingCell.field === 'sources' || editingCell.field === 'destinations' || editingCell.field === 'appliedTo')} onClose={() => setEditingCell(null)} title={`Set ${editingCell?.field}`}>
                <div className="space-y-4">
                    <p>Select a group for the {editingCell?.field}.</p>
                    <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                        {mockAvailableGroups.map(group => (
                             <button key={group} onClick={() => handleSaveCell(editingCell!.policyId, editingCell!.ruleId, editingCell!.field, group)} className="block w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700">{group}</button>
                        ))}
                    </div>
                </div>
            </Modal>

            <Modal isOpen={!!editingCell && editingCell.field === 'services'} onClose={() => setEditingCell(null)} title="Set Services">
                <div className="space-y-4">
                     <p>Select services for the rule.</p>
                     <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                        {mockAvailableServices.map(service => (
                             <button key={service.name} onClick={() => handleSaveCell(editingCell!.policyId, editingCell!.ruleId, editingCell!.field, [service])} className="block w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700">{service.name}</button>
                        ))}
                    </div>
                </div>
            </Modal>

        </Card>
    );
};
