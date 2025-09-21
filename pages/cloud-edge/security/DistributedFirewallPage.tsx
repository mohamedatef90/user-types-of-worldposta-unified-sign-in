// FIX: Import `useEffect` from React to resolve 'Cannot find name' error.
import React, { useState, useMemo, useEffect } from 'react';
import { Button, Icon, ToggleSwitch, FormField, Modal, Card, Pagination } from '@/components/ui';
import { v4 as uuidv4 } from 'uuid';

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

interface Draft {
  id: string;
  name: string;
  locked: boolean;
  savedBy: 'System' | 'User';
  user: string;
  lastModified: string;
  isExpanded: boolean;
}

// --- START: Data for View Members Modal ---
interface Member {
    [key: string]: string | number;
}
interface MemberCategory {
  id: 'vms' | 'ips' | 'nsx' | 'ports' | 'dist-port-groups' | 'dist-ports' | 'vifs';
  name: string;
  count: number;
  members: Member[];
  headers: string[];
}

interface DefinitionCategory {
  id: 'criteria' | 'members' | 'ips' | 'macs' | 'ad';
  name: string;
  count: number;
  members: Member[];
  headers: string[];
}

interface GroupData {
  id: string;
  name: string;
  groupType: 'Generic' | 'IPSet';
  memberCategories: MemberCategory[];
  definitionCategories?: DefinitionCategory[];
}

const mockGroupData: { [key: string]: GroupData } = {
  'Web Servers Group': {
    id: 'f31e1b66-29e3-4ff2-a5bc-5233fd1a891a',
    name: 'Web Servers Group',
    groupType: 'Generic',
    memberCategories: [
      { id: 'vms', name: 'Virtual Machines', count: 0, members: [], headers: ['Name', 'Status'] },
      { id: 'ips', name: 'IP Addresses', count: 2, members: [{ 'IP Addresses': '192.168.100.2' }, { 'IP Addresses': '1.0.0.0' }], headers: ['IP Addresses'] },
      { id: 'nsx', name: 'NSX Segments', count: 1, members: [{ Name: 'web-segment' }], headers: ['Name'] },
      { id: 'ports', name: 'Segment Ports', count: 2, members: [{ Name: 'port-1' }, { Name: 'port-2' }], headers: ['Name'] },
      { id: 'dist-port-groups', name: 'Distributed Port Groups', count: 0, members: [], headers: ['Name'] },
      { id: 'dist-ports', name: 'Distributed Ports', count: 0, members: [], headers: ['Name'] },
      { id: 'vifs', name: 'VIFs', count: 0, members: [], headers: ['Name'] },
    ],
    definitionCategories: [
      { id: 'criteria', name: 'Membership Criteria', count: 1, members: [{ Criteria: 'VM Tag equals "web"' }], headers: ['Criteria'] },
      { id: 'members', name: 'Members', count: 0, members: [], headers: ['Name', 'Type'] },
      { id: 'ips', name: 'IP Addresses', count: 2, members: [{ 'IP Address': '192.168.100.2' }, { 'IP Address': '1.0.0.0' }], headers: ['IP Address'] },
      { id: 'macs', name: 'MAC Addresses', count: 0, members: [], headers: ['MAC Address'] },
      { id: 'ad', name: 'AD Groups', count: 0, members: [], headers: ['Group Name'] }
    ]
  },
  'DB Servers Group': {
      id: 'a1b2c3d4-e5f6-7890-ghij-klmnopqrstuv',
      name: 'DB Servers Group',
      groupType: 'Generic',
      memberCategories: [
          { id: 'vms', name: 'Virtual Machines', count: 1, members: [{ Name: 'db-vm-01', Status: 'Running' }], headers: ['Name', 'Status'] },
          { id: 'ips', name: 'IP Addresses', count: 1, members: [{ 'IP Addresses': '10.10.10.5' }], headers: ['IP Addresses'] },
          { id: 'nsx', name: 'NSX Segments', count: 1, members: [{ Name: 'db-segment' }], headers: ['Name'] },
          { id: 'ports', name: 'Segment Ports', count: 0, members: [], headers: ['Name'] },
          { id: 'dist-port-groups', name: 'Distributed Port Groups', count: 0, members: [], headers: ['Name'] },
          { id: 'dist-ports', name: 'Distributed Ports', count: 0, members: [], headers: ['Name'] },
          { id: 'vifs', name: 'VIFs', count: 0, members: [], headers: ['Name'] },
      ],
      definitionCategories: [
        { id: 'criteria', name: 'Membership Criteria', count: 1, members: [{ Criteria: 'VM Name contains "db"' }], headers: ['Criteria'] },
        { id: 'members', name: 'Members', count: 1, members: [{ Name: 'db-vm-01', Type: 'Virtual Machine' }], headers: ['Name', 'Type'] },
        { id: 'ips', name: 'IP Addresses', count: 1, members: [{ 'IP Address': '10.10.10.5' }], headers: ['IP Address'] },
        { id: 'macs', name: 'MAC Addresses', count: 0, members: [], headers: ['MAC Address'] },
        { id: 'ad', name: 'AD Groups', count: 0, members: [], headers: ['Group Name'] }
    ]
  },
  'App Servers Group': {
      id: 'z9y8x7w6-v5u4-3210-fedc-ba9876543210',
      name: 'App Servers Group',
      groupType: 'Generic',
      memberCategories: [
          { id: 'vms', name: 'Virtual Machines', count: 2, members: [{ Name: 'app-vm-01', Status: 'Running' }, { Name: 'app-vm-02', Status: 'Running' }], headers: ['Name', 'Status'] },
          { id: 'ips', name: 'IP Addresses', count: 0, members: [], headers: ['IP Addresses'] },
          { id: 'nsx', name: 'NSX Segments', count: 0, members: [], headers: ['Name'] },
          { id: 'ports', name: 'Segment Ports', count: 0, members: [], headers: ['Name'] },
          { id: 'dist-port-groups', name: 'Distributed Port Groups', count: 0, members: [], headers: ['Name'] },
          { id: 'dist-ports', name: 'Distributed Ports', count: 0, members: [], headers: ['Name'] },
          { id: 'vifs', name: 'VIFs', count: 0, members: [], headers: ['Name'] },
      ],
      definitionCategories: [
        { id: 'criteria', name: 'Membership Criteria', count: 0, members: [], headers: ['Criteria'] },
        { id: 'members', name: 'Members', count: 2, members: [{ Name: 'app-vm-01', Type: 'Virtual Machine' }, { Name: 'app-vm-02', Type: 'Virtual Machine' }], headers: ['Name', 'Type'] },
        { id: 'ips', name: 'IP Addresses', count: 0, members: [], headers: ['IP Address'] },
        { id: 'macs', name: 'MAC Addresses', count: 0, members: [], headers: ['MAC Address'] },
        { id: 'ad', name: 'AD Groups', count: 0, members: [], headers: ['Group Name'] }
    ]
  },
   'Admin IP Group': {
      id: 'admin-ip-group-id',
      name: 'Admin IP Group',
      groupType: 'IPSet',
      memberCategories: [
          { id: 'vms', name: 'Virtual Machines', count: 0, members: [], headers: ['Name', 'Status'] },
          { id: 'ips', name: 'IP Addresses', count: 1, members: [{ 'IP Addresses': '73.125.88.10' }], headers: ['IP Addresses'] },
          { id: 'nsx', name: 'NSX Segments', count: 0, members: [], headers: ['Name'] },
          { id: 'ports', name: 'Segment Ports', count: 0, members: [], headers: ['Name'] },
          { id: 'dist-port-groups', name: 'Distributed Port Groups', count: 0, members: [], headers: ['Name'] },
          { id: 'dist-ports', name: 'Distributed Ports', count: 0, members: [], headers: ['Name'] },
          { id: 'vifs', name: 'VIFs', count: 0, members: [], headers: ['Name'] },
      ],
      definitionCategories: [
        { id: 'criteria', name: 'Membership Criteria', count: 0, members: [], headers: ['Criteria'] },
        { id: 'members', name: 'Members', count: 0, members: [], headers: ['Name', 'Type'] },
        { id: 'ips', name: 'IP Addresses', count: 1, members: [{ 'IP Address': '73.125.88.10' }], headers: ['IP Address'] },
        { id: 'macs', name: 'MAC Addresses', count: 0, members: [], headers: ['MAC Address'] },
        { id: 'ad', name: 'AD Groups', count: 0, members: [], headers: ['Group Name'] }
    ]
  },
   'Mgmt Group': {
      id: 'mgmt-group-id',
      name: 'Mgmt Group',
      groupType: 'Generic',
      memberCategories: [
          { id: 'vms', name: 'Virtual Machines', count: 3, members: [{ Name: 'mgmt-vm-01', Status: 'Running' }, { Name: 'mgmt-vm-02', Status: 'Running' }, { Name: 'mgmt-vm-03', Status: 'Stopped' }], headers: ['Name', 'Status'] },
          { id: 'ips', name: 'IP Addresses', count: 0, members: [], headers: ['IP Addresses'] },
          { id: 'nsx', name: 'NSX Segments', count: 0, members: [], headers: ['Name'] },
          { id: 'ports', name: 'Segment Ports', count: 0, members: [], headers: ['Name'] },
          { id: 'dist-port-groups', name: 'Distributed Port Groups', count: 0, members: [], headers: ['Name'] },
          { id: 'dist-ports', name: 'Distributed Ports', count: 0, members: [], headers: ['Name'] },
          { id: 'vifs', name: 'VIFs', count: 0, members: [], headers: ['Name'] },
      ],
      definitionCategories: [
        { id: 'criteria', name: 'Membership Criteria', count: 1, members: [{ Criteria: 'VM Name starts with "mgmt-"' }], headers: ['Criteria'] },
        { id: 'members', name: 'Members', count: 0, members: [], headers: ['Name', 'Type'] },
        { id: 'ips', name: 'IP Addresses', count: 0, members: [], headers: ['IP Address'] },
        { id: 'macs', name: 'MAC Addresses', count: 0, members: [], headers: ['MAC Address'] },
        { id: 'ad', name: 'AD Groups', count: 0, members: [], headers: ['Group Name'] }
    ]
  }
};
// --- END: Data for View Members Modal ---

// --- START: Data for Edit Modals ---
const mockAvailableServices = [
    { name: 'HTTP', icon: 'fas fa-globe' },
    { name: 'HTTPS', icon: 'fas fa-lock' },
    { name: 'SSH', icon: 'fas fa-terminal' },
    { name: 'MySQL', icon: 'fas fa-database' },
    { name: 'DHCP-Server', icon: 'fas fa-cog' },
    { name: 'DHCP-Client', icon: 'fas fa-cog' },
    { name: 'IPv6-ICMP Neigh...', icon: 'fas fa-cog' },
    { name: 'Any', icon: 'fas fa-asterisk' },
];

interface SelectableGroup {
    id: string;
    name: string;
    type: 'Generic' | 'IP Addresses Only';
    icon: string;
    description: string;
    tags: string[];
    memberCount: number;
}

const mockAvailableGroupsForSelection: SelectableGroup[] = [
    { id: 'group1', name: 'DefaultMaliciousIpGroup', type: 'IP Addresses Only', icon: 'fas fa-globe-americas', description: 'A list of known malicious IP addresses, updated regularly by the system.', tags: ['security', 'blacklist', 'system'], memberCount: 14082 },
    { id: 'group2', name: 'Edge_NSGroup', type: 'Generic', icon: 'fas fa-lock', description: 'Default NSX group for edge transport nodes.', tags: ['nsx', 'edge', 'infrastructure'], memberCount: 4 },
    { id: 'group3', name: 'f31e1b66-29e3-4ff2-a5bc-5233fd1a891a', type: 'Generic', icon: 'fas fa-cubes', description: 'Auto-generated group for specific application tier.', tags: ['auto-generated'], memberCount: 8 },
    { id: 'group7', name: 'Web Servers Group', type: 'Generic', icon: 'fas fa-cubes', description: 'Contains all virtual machines tagged as "web". Used for applying web traffic rules.', tags: ['web', 'frontend', 'app-tier'], memberCount: 5 },
    { id: 'group8', name: 'DB Servers Group', type: 'Generic', icon: 'fas fa-cubes', description: 'Contains all virtual machines tagged as "database". Used for restricting access to data.', tags: ['database', 'backend', 'data-tier', 'critical'], memberCount: 3 },
    { id: 'group9', name: 'App Servers Group', type: 'Generic', icon: 'fas fa-cubes', description: 'Business logic application servers.', tags: ['app-tier', 'business-logic'], memberCount: 12 },
    { id: 'group10', name: 'Admin IP Group', type: 'IP Addresses Only', icon: 'fas fa-globe-americas', description: 'A static set of IP addresses for administrative access.', tags: ['admin', 'management', 'security'], memberCount: 2 },
    { id: 'group11', name: 'Mgmt Group', type: 'Generic', icon: 'fas fa-cubes', description: 'Group containing all management and infrastructure virtual machines.', tags: ['management', 'infrastructure'], memberCount: 3 },
    { id: 'group12', name: 'Any', type: 'Generic', icon: 'fas fa-asterisk', description: 'Represents any source or destination. Use with caution.', tags: ['any', 'unrestricted'], memberCount: 0 },
];
// --- END: Data for Edit Modals ---

const mockPoliciesData: FirewallPolicy[] = [
    { id: 'policy1', name: 'Web Servers Policy', policyId: '(2)', appliedTo: '2 Groups', status: 'Success', rules: [
        { id: 'rule-web-1', name: 'Allow HTTP', ruleId: '5', sources: 'Any', destinations: 'Web Servers Group', services: [{ name: 'HTTP', icon: 'fas fa-globe' }], contextProfiles: 'None', appliedTo: 'DFW', action: 'Allow', enabled: true },
        { id: 'rule-web-2', name: 'Allow HTTPS', ruleId: '6', sources: 'Any', destinations: 'Web Servers Group', services: [{ name: 'HTTPS', icon: 'fas fa-lock' }], contextProfiles: 'None', appliedTo: 'DFW', action: 'Allow', enabled: true },
    ], isExpanded: false },
    { id: 'policy2', name: 'Database Policy', policyId: '(1)', appliedTo: 'DB Servers Group', status: 'Success', rules: [
        { id: 'rule-db-1', name: 'Allow SQL', ruleId: '7', sources: 'App Servers Group', destinations: 'DB Servers Group', services: [{ name: 'MySQL', icon: 'fas fa-database' }], contextProfiles: 'None', appliedTo: 'DFW', action: 'Allow', enabled: true },
    ], isExpanded: false },
    { id: 'policy3', name: 'hello?!', policyId: '(1)', appliedTo: '1 Groups', status: 'Success', rules: [], isExpanded: false },
    { id: 'policy4', name: 'test', policyId: '(0)', appliedTo: 'DFW', status: 'Success', rules: [], isExpanded: false },
    {
        id: 'policy5', name: 'Default Layer3 Section', policyId: '(3)', appliedTo: 'DFW', status: 'Success', isExpanded: false,
        rules: [
            { id: 'rule1', name: 'Default Rule NDP', ruleId: '3', sources: 'Any', destinations: 'Any', services: [{ name: 'IPv6-ICMP Neigh...', icon: 'fas fa-cog' }, { name: 'IPv6-ICMP Neigh...', icon: 'fas fa-cog' }], contextProfiles: 'None', appliedTo: 'DFW', action: 'Allow', enabled: true },
            { id: 'rule2', name: 'Default Rule DHCP', ruleId: '4', sources: 'Any', destinations: 'Any', services: [{ name: 'DHCP-Server', icon: 'fas fa-cog' }, { name: 'DHCP-Client', icon: 'fas fa-cog' }], contextProfiles: 'None', appliedTo: 'DFW', action: 'Allow', enabled: true },
            { id: 'rule3', name: 'Default Layer3 Rule', ruleId: '2', sources: 'Any', destinations: 'Any', services: [{ name: 'Any', icon: '' }], contextProfiles: 'None', appliedTo: 'DFW', action: 'Allow', enabled: false },
        ]
    },
    { id: 'policy6', name: 'Management Access', policyId: '(2)', appliedTo: 'Mgmt Group', status: 'Success', isExpanded: false,
        rules: [
            { id: 'rule-mgmt-1', name: 'Allow SSH from Admin', ruleId: '8', sources: 'Admin IP Group', destinations: 'Mgmt Group', services: [{ name: 'SSH', icon: 'fas fa-terminal' }], contextProfiles: 'None', appliedTo: 'DFW', action: 'Allow', enabled: true },
            { id: 'rule-mgmt-2', name: 'Deny All Other Mgmt', ruleId: '9', sources: 'Any', destinations: 'Mgmt Group', services: [{ name: 'Any', icon: '' }], contextProfiles: 'None', appliedTo: 'DFW', action: 'Deny', enabled: true },
        ]
    }
];

const mockDraftsData: Draft[] = [
    { id: 'draft1', name: '212-bb62ddb0-fa04-47ea-80ab-afb7a7c0245b', locked: false, savedBy: 'System', user: 'admin', lastModified: 'Sep 18, 2025, 11:20:32 AM', isExpanded: false },
    { id: 'draft2', name: '211-787a9bcf-ff09-498a-a175-37fb086c1356', locked: false, savedBy: 'System', user: 'admin', lastModified: 'Sep 18, 2025, 10:38:13 AM', isExpanded: false },
    { id: 'draft3', name: '210-e77b058e-de29-4aa3-940a-464b0b057d8a', locked: false, savedBy: 'System', user: 'admin', lastModified: 'Sep 18, 2025, 10:38:01 AM', isExpanded: false },
    { id: 'draft4', name: '209-7ef8f73d-9ce7-44b9-800d-bd953a24486a', locked: false, savedBy: 'System', user: 'admin', lastModified: 'Sep 15, 2025, 12:14:18 AM', isExpanded: false },
    { id: 'draft5', name: '208-964a8cf5-d96c-46d0-9fac-9f5c5e42eb07', locked: false, savedBy: 'System', user: 'admin', lastModified: 'Sep 15, 2025, 12:14:05 AM', isExpanded: false },
    { id: 'draft6', name: '207-4d0c6940-f3b0-44be-af06-dadeb456e26b', locked: false, savedBy: 'System', user: 'admin', lastModified: 'Sep 15, 2025, 12:00:24 AM', isExpanded: false },
];

const ViewMembersModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    groupData: GroupData | null;
}> = ({ isOpen, onClose, groupData }) => {
    const [activeMainTab, setActiveMainTab] = useState('effective');
    const [activeCategory, setActiveCategory] = useState<MemberCategory | null>(null);
    const [activeDefinitionCategory, setActiveDefinitionCategory] = useState<DefinitionCategory | null>(null);

    useEffect(() => {
        if (groupData?.memberCategories) {
            const firstWithMembers = groupData.memberCategories.find(c => c.count > 0);
            setActiveCategory(firstWithMembers || groupData.memberCategories[0]);
        }
    }, [groupData]);

    useEffect(() => {
        if (groupData?.definitionCategories) {
            const firstWithMembers = groupData.definitionCategories.find(c => c.count > 0);
            setActiveDefinitionCategory(firstWithMembers || groupData.definitionCategories[0]);
        }
    }, [groupData]);

    if (!isOpen || !groupData) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`View Members | ${groupData.name}`} size="4xl" footer={<Button onClick={onClose}>Close</Button>}>
            <div className="space-y-4 -mt-2">
                <div className="bg-sky-100/50 dark:bg-sky-900/30 border-l-4 border-sky-500 dark:border-sky-400 text-sky-800 dark:text-sky-200 p-3 rounded-r-md text-sm">
                    To edit below content, click <span className="font-semibold">EDIT</span>
                </div>
                <p className="text-sm"><span className="font-semibold">Group Type:</span> {groupData.groupType}</p>
                <div className="border-b border-gray-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveMainTab('effective')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeMainTab === 'effective' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Effective Members
                        </button>
                        {groupData.definitionCategories && (
                        <button onClick={() => setActiveMainTab('definition')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeMainTab === 'definition' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Group Definition
                        </button>
                        )}
                    </nav>
                </div>
                
                {activeMainTab === 'effective' && activeCategory && (
                    <div className="flex" style={{minHeight: '400px'}}>
                        <div className="w-1/3 border-r border-gray-200 dark:border-slate-700 pr-4">
                            <ul className="space-y-1">
                                {groupData.memberCategories.map(cat => (
                                    <li key={cat.id}>
                                        <button 
                                            onClick={() => setActiveCategory(cat)}
                                            className={`w-full text-left text-sm p-2 rounded-md flex justify-between items-center ${activeCategory.id === cat.id ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-slate-700/50'}`}
                                        >
                                            <span>{cat.name}</span>
                                            <span>({cat.count})</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="w-2/3 pl-4">
                            <div className="flex justify-end mb-2">
                                <Button variant="ghost" size="sm" leftIconName="fas fa-sync-alt">REFRESH</Button>
                            </div>
                            <div className="overflow-auto border rounded-lg dark:border-slate-700">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 dark:bg-slate-700">
                                        <tr>
                                            {activeCategory.headers.map(header => (
                                                <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                        {activeCategory.members.length > 0 ? activeCategory.members.map((member, index) => (
                                            <tr key={index}>
                                                {activeCategory.headers.map(header => (
                                                    <td key={header} className="px-4 py-2 text-sm">{member[header]}</td>
                                                ))}
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={activeCategory.headers.length} className="text-center py-4 text-gray-500">No members in this category.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="text-right text-xs text-gray-500 mt-2">
                                1 - {activeCategory.count} of {activeCategory.count}
                            </div>
                        </div>
                    </div>
                )}
                {activeMainTab === 'definition' && activeDefinitionCategory && (
                    <div className="flex" style={{minHeight: '400px'}}>
                        <div className="w-1/3 border-r border-gray-200 dark:border-slate-700 pr-4">
                            <ul className="space-y-1">
                                {groupData.definitionCategories?.map(cat => (
                                    <li key={cat.id}>
                                        <button 
                                            onClick={() => setActiveDefinitionCategory(cat)}
                                            className={`w-full text-left text-sm p-2 rounded-md flex justify-between items-center ${activeDefinitionCategory.id === cat.id ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-slate-700/50'}`}
                                        >
                                            <span>{cat.name}</span>
                                            <span>({cat.count})</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="w-2/3 pl-4">
                            <div className="flex justify-end mb-2">
                                <Button variant="ghost" size="sm" leftIconName="fas fa-sync-alt">REFRESH</Button>
                            </div>
                            <div className="overflow-auto border rounded-lg dark:border-slate-700">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 dark:bg-slate-700">
                                        <tr>
                                            {activeDefinitionCategory.headers.map(header => (
                                                <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                        {activeDefinitionCategory.members.length > 0 ? activeDefinitionCategory.members.map((member, index) => (
                                            <tr key={index}>
                                                {activeDefinitionCategory.headers.map(header => (
                                                    <td key={header} className="px-4 py-2 text-sm">{member[header]}</td>
                                                ))}
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={activeDefinitionCategory.headers.length} className="text-center py-4 text-gray-500">No members in this category.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="text-right text-xs text-gray-500 mt-2">
                                1 - {activeDefinitionCategory.count} of {activeDefinitionCategory.count}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

interface EditSourceDestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newValue: string) => void;
    field: 'sources' | 'destinations';
    currentValue: string;
    ruleName: string;
    onViewMembers: (groupName: string) => void;
    onViewRelatedGroups: (group: SelectableGroup) => void;
    availableGroups: SelectableGroup[];
    onAddGroup: (newGroup: SelectableGroup) => void;
}

const EditSourceDestModal: React.FC<EditSourceDestModalProps> = ({ isOpen, onClose, onSave, field, currentValue, ruleName, onViewMembers, onViewRelatedGroups, availableGroups, onAddGroup }) => {
    const [selected, setSelected] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Groups');
    const [negate, setNegate] = useState(false);
    const [showSelectedOnly, setShowSelectedOnly] = useState(false);
    const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isAddingGroup, setIsAddingGroup] = useState(false);

    interface Tag { id: string; tag: string; scope: string; }
    const [newGroupData, setNewGroupData] = useState({
        groupName: '',
        description: '',
        tags: [{ id: uuidv4(), tag: '', scope: '' }] as Tag[],
    });

    const handleNewGroupDataChange = (field: 'groupName' | 'description', value: string) => {
        setNewGroupData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddTag = () => {
        if (newGroupData.tags.length < 30) {
            setNewGroupData(prev => ({ ...prev, tags: [...prev.tags, { id: uuidv4(), tag: '', scope: '' }] }));
        }
    };
    
    const handleTagChange = (id: string, field: 'tag' | 'scope', value: string) => {
        setNewGroupData(prev => ({ ...prev, tags: prev.tags.map(t => t.id === id ? { ...t, [field]: value } : t) }));
    };

    const handleRemoveTag = (id: string) => {
        setNewGroupData(prev => ({ ...prev, tags: prev.tags.filter(t => t.id !== id) }));
    };

    const handleCancelAddGroup = () => {
        setIsAddingGroup(false);
        setNewGroupData({ groupName: '', description: '', tags: [{ id: uuidv4(), tag: '', scope: '' }] });
    };

    const handleSaveNewGroup = () => {
        if (!newGroupData.groupName.trim()) {
            alert('Group Name is required.');
            return;
        }
        const newGroup: SelectableGroup = {
            id: uuidv4(),
            name: newGroupData.groupName,
            type: 'Generic',
            icon: 'fas fa-cubes',
            description: newGroupData.description,
            tags: newGroupData.tags.filter(t => t.tag.trim()).map(t => t.scope.trim() ? `${t.tag}|${t.scope}` : t.tag),
            memberCount: 0,
        };
        onAddGroup(newGroup);
        setSelected([newGroup.name]);
        handleCancelAddGroup();
    };

    useEffect(() => {
        if (isOpen) {
            setSelected(currentValue && currentValue !== 'Any' ? [currentValue] : []);
            setSearchTerm('');
            setExpandedGroupId(null);
            setIsAddingGroup(false);
            setNewGroupData({ groupName: '', description: '', tags: [{ id: uuidv4(), tag: '', scope: '' }] });
        }
    }, [isOpen, currentValue]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            console.log('Group list refreshed.');
            setIsRefreshing(false);
        }, 1500);
    };

    const handleToggleExpand = (groupId: string) => {
        setExpandedGroupId(prev => (prev === groupId ? null : groupId));
    };

    const filteredGroups = useMemo(() => {
        let groups = availableGroups;
        if (showSelectedOnly) {
            groups = groups.filter(g => selected.includes(g.name));
        }
        if (searchTerm) {
            groups = groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return groups;
    }, [searchTerm, showSelectedOnly, selected, availableGroups]);
    
    const handleSelect = (groupName: string) => {
        setSelected(prev => prev.includes(groupName) ? prev.filter(item => item !== groupName) : [groupName]); // Single select logic
    };

    const handleSave = () => {
        onSave(selected[0] || 'Any');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Set ${field.charAt(0).toUpperCase() + field.slice(1)}`} size="5xl"
            footer={
                <div className="w-full flex justify-between items-center">
                    <div className="flex items-center gap-4">
                         <Button variant="ghost" leftIconName={`fas fa-sync-alt ${isRefreshing ? 'fa-spin' : ''}`} onClick={handleRefresh} disabled={isRefreshing}>REFRESH</Button>
                         <ToggleSwitch id="show-selected" label="Show Only Selected" checked={showSelectedOnly} onChange={setShowSelectedOnly} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={onClose}>CANCEL</Button>
                        <Button variant="primary" onClick={handleSave}>APPLY</Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4 -mt-2 text-sm">
                <p className="text-gray-500 dark:text-gray-400">Rule <Icon name="fas fa-chevron-right" className="text-xs mx-1" /> {ruleName}</p>
                <div className="flex items-center gap-4">
                    <label className="font-medium">Negate Selections</label>
                    <ToggleSwitch id="negate-selections" checked={negate} onChange={setNegate} />
                    <span>{negate ? 'Yes' : 'No'}</span>
                    <span className="text-gray-500 dark:text-gray-400">Negated selections will be shown as Example Group in Rules Grid.</span>
                </div>
                <div className="border-b border-gray-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-6">
                        <button onClick={() => setActiveTab('Groups')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium ${activeTab === 'Groups' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Groups ({selected.length})
                        </button>
                        <button onClick={() => setActiveTab('IP Addresses')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium ${activeTab === 'IP Addresses' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            IP Addresses (0)
                        </button>
                    </nav>
                </div>
                
                <div className="flex justify-between items-center">
                    <Button variant="outline" onClick={() => setIsAddingGroup(prev => !prev)}>{isAddingGroup ? 'CANCEL' : 'ADD GROUP'}</Button>
                    <div className="flex items-center gap-2">
                        <Button variant="outline">EXPAND ALL</Button>
                        <div className="w-72">
                            <FormField id="group-filter" label="" placeholder="Filter by Name, Path and more" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} wrapperClassName="!mb-0" />
                        </div>
                        <Button variant="ghost" size="icon"><Icon name="fas fa-filter" /></Button>
                    </div>
                </div>
                
                {isAddingGroup && (
                    <div className="p-6 my-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg animate-fade-in">
                        <div className="flex items-end gap-x-4 mb-4">
                            <div className="flex-grow">
                                <FormField 
                                    id="newGroupName" 
                                    name="groupName" 
                                    label="Group Name" 
                                    value={newGroupData.groupName} 
                                    onChange={(e) => handleNewGroupDataChange('groupName', e.target.value)}
                                    required
                                    wrapperClassName="!mb-0"
                                />
                            </div>
                            <div className="flex items-center gap-3 pb-2 flex-shrink-0">
                                <span className="text-gray-500 dark:text-gray-400">Generic</span>
                                <Button variant="ghost" className="!p-0 !h-auto text-[#293c51] dark:text-sky-400 hover:underline">Set</Button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                                <FormField 
                                    as="textarea"
                                    id="newGroupDesc" 
                                    name="description" 
                                    label="Description"
                                    rows={3} 
                                    value={newGroupData.description} 
                                    onChange={(e) => handleNewGroupDataChange('description', e.target.value)}
                                    placeholder="Description"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[#293c51] dark:text-gray-300">Tags</label>
                                <div className="space-y-2">
                                    {newGroupData.tags.map((tag, index) => (
                                        <div key={tag.id} className="flex items-center gap-2 border border-gray-300 dark:border-slate-600 rounded-full p-1 pl-3 bg-white dark:bg-slate-800">
                                            <Icon name="fas fa-tag" className="text-gray-400" />
                                            <input type="text" placeholder="Tag" value={tag.tag} onChange={(e) => handleTagChange(tag.id, 'tag', e.target.value)} className="w-full bg-transparent border-0 focus:ring-0 text-[#293c51] dark:text-gray-200 placeholder-gray-500 p-0 h-6" />
                                            <input type="text" placeholder="Scope" value={tag.scope} onChange={(e) => handleTagChange(tag.id, 'scope', e.target.value)} className="w-full bg-transparent border-0 focus:ring-0 text-[#293c51] dark:text-gray-200 placeholder-gray-500 p-0 h-6" />
                                            
                                            <button type="button" onClick={index === 0 ? handleAddTag : () => handleRemoveTag(tag.id)} 
                                                    className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-colors
                                                        ${index === 0 ? 'border-[#293c51] dark:border-sky-500 text-[#293c51] dark:text-sky-500 hover:bg-[#293c51] dark:hover:bg-sky-500 hover:text-white dark:hover:text-white' : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'}`}
                                                    disabled={index === 0 && newGroupData.tags.length >= 30}
                                                    aria-label={index === 0 ? "Add tag" : "Remove tag"}>
                                                <Icon name={index === 0 ? "fas fa-plus" : "fas fa-minus"} className="text-xs" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Max 30 allowed. Click (+) to add.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-6">
                            <Button variant="primary" onClick={handleSaveNewGroup}>SAVE</Button>
                            <Button variant="ghost" onClick={handleCancelAddGroup}>CANCEL</Button>
                        </div>
                    </div>
                )}


                <div className="overflow-auto border rounded-lg dark:border-slate-600" style={{ maxHeight: '400px' }}>
                    <table className="min-w-full">
                        <thead className="bg-gray-100 dark:bg-slate-700 sticky top-0">
                            <tr>
                                <th className="px-2 py-2 w-10"><input type="checkbox" className="rounded" /></th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Compute Members</th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
                            {filteredGroups.map(group => (
                                <React.Fragment key={group.id}>
                                    <tr className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 ${selected.includes(group.name) ? 'bg-sky-100 dark:bg-sky-900/40' : ''}`}>
                                        <td className="px-2 py-1"><input type="checkbox" checked={selected.includes(group.name)} onChange={() => handleSelect(group.name)} className="rounded" /></td>
                                        <td className="px-2 py-1">
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={() => handleToggleExpand(group.id)} className="p-1" aria-expanded={expandedGroupId === group.id}>
                                                    <Icon name={expandedGroupId === group.id ? 'fas fa-chevron-down' : 'fas fa-chevron-right'} className="text-gray-400 w-3 text-center" />
                                                </button>
                                                <Icon name={group.icon} className="text-gray-500" />
                                                <span>{group.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-1">{group.type}</td>
                                        <td className="px-2 py-1">
                                            <Button variant="ghost" className="!p-0 !h-auto text-sky-500 hover:underline" onClick={() => onViewMembers(group.name)}>View Members</Button>
                                        </td>
                                        <td className="px-2 py-1">
                                            <span className="text-xs text-green-600 dark:text-green-400">Success</span>
                                        </td>
                                    </tr>
                                    {expandedGroupId === group.id && (
                                        <tr className="bg-gray-50 dark:bg-slate-700/50">
                                            <td />
                                            <td colSpan={4} className="p-4">
                                                <div className="space-y-3 text-xs">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-500 dark:text-gray-400">DESCRIPTION</h4>
                                                        <p className="text-gray-700 dark:text-gray-300">{group.description}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-500 dark:text-gray-400">TAGS</h4>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                                            {group.tags.map(tag => (
                                                                <span key={tag} className="px-2 py-0.5 bg-gray-200 dark:bg-slate-600 rounded-md">{tag}</span>
                                                            ))}
                                                            <span className="text-gray-500 dark:text-gray-400 italic">({group.memberCount} members in)</span>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="!p-0 !h-auto text-sky-500 hover:underline" onClick={() => onViewRelatedGroups(group)}>View Related Groups</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="text-right text-xs text-gray-500">1 - {filteredGroups.length} of {filteredGroups.length}</div>
            </div>
        </Modal>
    );
};

const AppliedToDisplay: React.FC<{
    value: string;
    onEdit: () => void;
    type: 'policy' | 'rule';
    isReadOnly?: boolean;
}> = ({ value, onEdit, type, isReadOnly = false }) => {
    const isEditable = type === 'policy';

    return (
        <div className="group relative flex items-center gap-2" onDoubleClick={isEditable && !isReadOnly ? onEdit : undefined}>
            <span className="text-gray-500 dark:text-gray-400 font-normal italic text-xs">
                Applied to: {value}
            </span>
            {isEditable && !isReadOnly && (
                <button
                    type="button"
                    onClick={onEdit}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Edit Applied To for ${value}`}
                >
                    <Icon name="fas fa-pencil-alt" className="text-xs text-sky-500" />
                </button>
            )}
        </div>
    );
};

interface EditAppliedToModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (policyId: string, newAppliedTo: string, selectedGroups: SelectableGroup[]) => void;
    policy: FirewallPolicy | null;
}

const EditAppliedToModal: React.FC<EditAppliedToModalProps> = ({ isOpen, onClose, onSave, policy }) => {
    const [selectedGroups, setSelectedGroups] = useState<SelectableGroup[]>([]);
    
    useEffect(() => {
        if (policy) {
            const group = mockAvailableGroupsForSelection.find(g => g.name === policy.appliedTo);
            if (group) {
                setSelectedGroups([group]);
            } else {
                setSelectedGroups([]);
            }
        }
    }, [policy]);

    const handleToggleGroup = (group: SelectableGroup) => {
        setSelectedGroups(prev => {
            const isSelected = prev.some(g => g.id === group.id);
            if (isSelected) {
                return prev.filter(g => g.id !== group.id);
            } else {
                return [...prev, group];
            }
        });
    };

    const handleSave = () => {
        if (!policy) return;
        let newAppliedTo = 'DFW'; // Default
        if (selectedGroups.length === 1) {
            newAppliedTo = selectedGroups[0].name;
        } else if (selectedGroups.length > 1) {
            newAppliedTo = `${selectedGroups.length} Groups`;
        }
        onSave(policy.id, newAppliedTo, selectedGroups);
        onClose();
    };

    if (!isOpen || !policy) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Applied To: ${policy.name}`} size="2xl" footer={
            <>
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </>
        }>
            <div className="space-y-4">
                <p>Select the groups this policy will apply to. If no groups are selected, it will apply to DFW (Distributed Firewall).</p>
                <div className="max-h-96 overflow-y-auto border rounded-md dark:border-slate-600 p-2 space-y-1">
                    {mockAvailableGroupsForSelection.map(group => (
                        <FormField
                            key={group.id}
                            type="checkbox"
                            id={`group-select-${group.id}`}
                            label={group.name}
                            checked={selectedGroups.some(g => g.id === group.id)}
                            onChange={() => handleToggleGroup(group)}
                            wrapperClassName="!mb-0 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                        />
                    ))}
                </div>
            </div>
        </Modal>
    );
};

interface RelatedGroupsModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: SelectableGroup | null;
}

const RelatedGroupsModal: React.FC<RelatedGroupsModalProps> = ({ isOpen, onClose, group }) => {
    if (!isOpen || !group) return null;

    const relatedGroups: any[] = []; // Mocking empty state as per the image

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Related Groups" 
            size="lg"
            footer={<Button onClick={onClose}>CLOSE</Button>}
        >
            <div className="space-y-4 -mt-2">
                <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Group</span>
                    <span className="font-mono text-gray-700 dark:text-gray-300">{group.id}</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 text-xs font-semibold rounded-full">
                        #Groups {relatedGroups.length}
                    </span>
                </div>

                <div className="border rounded-lg dark:border-slate-600 min-h-[300px] flex flex-col">
                    <div className="flex-shrink-0">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 dark:bg-slate-700">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                    <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
                        <Icon name="fas fa-file-magnifying-glass" className="text-6xl text-sky-400/60 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No Related Groups</p>
                    </div>
                    <div className="flex-shrink-0 flex justify-between items-center p-2 border-t dark:border-slate-600 text-sm">
                        <Button variant="ghost" size="sm" leftIconName="fas fa-sync-alt">REFRESH</Button>
                        <span className="text-gray-500 dark:text-gray-400">No Groups</span>
                    </div>
                </div>
            </div>
        </Modal>
    );
};


export const DistributedFirewallPage: React.FC = () => {
    const [filterValue, setFilterValue] = useState('');
    const [activeTab, setActiveTab] = useState('Category Specific Rules');
    const [policies, setPolicies] = useState<FirewallPolicy[]>(mockPoliciesData);
    const [drafts, setDrafts] = useState<Draft[]>(mockDraftsData);
    const [isDeleteDraftModalOpen, setIsDeleteDraftModalOpen] = useState(false);
    const [draftToDelete, setDraftToDelete] = useState<Draft | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isViewMembersModalOpen, setIsViewMembersModalOpen] = useState(false);
    const [viewingGroup, setViewingGroup] = useState<GroupData | null>(null);
    const [editSourceDestModalState, setEditSourceDestModalState] = useState<{ isOpen: boolean; rule: FirewallRule | null; policyId: string | null; field: 'sources' | 'destinations' | null; isNewRule?: boolean }>({ isOpen: false, rule: null, policyId: null, field: null, isNewRule: false });
    const [editAppliedToModalState, setEditAppliedToModalState] = useState<{ isOpen: boolean; policy: FirewallPolicy | null; }>({ isOpen: false, policy: null });
    const [isRelatedGroupsModalOpen, setIsRelatedGroupsModalOpen] = useState(false);
    const [viewingRelatedGroup, setViewingRelatedGroup] = useState<SelectableGroup | null>(null);
    const [availableGroups, setAvailableGroups] = useState<SelectableGroup[]>(mockAvailableGroupsForSelection);
    const [isAddingPolicy, setIsAddingPolicy] = useState(false);
    const [newPolicyName, setNewPolicyName] = useState('');
    const [addingRuleToPolicyId, setAddingRuleToPolicyId] = useState<string | null>(null);

    const initialNewRuleState = {
        name: '',
        sources: 'Any',
        destinations: 'Any',
        services: 'Any',
        action: 'Allow' as 'Allow' | 'Deny' | 'Drop',
        enabled: true,
    };
    const [newRuleForm, setNewRuleForm] = useState(initialNewRuleState);
    const [isTimelineVisible, setIsTimelineVisible] = useState(true);

    const isReadOnly = useMemo(() => ['All Rules', 'Settings'].includes(activeTab), [activeTab]);

    const handleAddRuleClick = () => {
        if (isSinglePolicySelected) {
            const policyId = selectedItems[0];
            setAddingRuleToPolicyId(policyId);
            setNewRuleForm({ ...initialNewRuleState, name: `New Rule in ${policies.find(p => p.id === policyId)?.name || ''}` });
            
            const policy = policies.find(p => p.id === policyId);
            if (policy && !policy.isExpanded) {
                togglePolicy(policyId);
            }
        }
    };

    const handleCancelNewRule = () => {
        setAddingRuleToPolicyId(null);
        setNewRuleForm(initialNewRuleState);
    };

    const handleSaveNewRule = () => {
        if (!addingRuleToPolicyId || !newRuleForm.name.trim()) {
            alert("Rule name is required.");
            return;
        }

        const newRule: FirewallRule = {
            id: uuidv4(),
            ruleId: String(Math.floor(Math.random() * 100) + 10),
            name: newRuleForm.name,
            sources: newRuleForm.sources,
            destinations: newRuleForm.destinations,
            services: [{ name: newRuleForm.services, icon: 'fas fa-asterisk' }],
            contextProfiles: 'None',
            appliedTo: 'DFW',
            action: newRuleForm.action,
            enabled: newRuleForm.enabled,
        };

        setPolicies(prev => prev.map(p => {
            if (p.id === addingRuleToPolicyId) {
                return { ...p, rules: [newRule, ...p.rules] };
            }
            return p;
        }));

        handleCancelNewRule();
    };

    const handleNewRuleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewRuleForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddNewGroup = (newGroup: SelectableGroup) => {
        setAvailableGroups(prev => [newGroup, ...prev]);
    };

    const isSelectionEmpty = selectedItems.length === 0;
    const isSingleSelection = useMemo(() => selectedItems.length === 1, [selectedItems]);
    const isSinglePolicySelected = useMemo(() => {
        if (!isSingleSelection) return false;
        const selectedId = selectedItems[0];
        return policies.some(p => p.id === selectedId);
    }, [isSingleSelection, selectedItems, policies]);

    const handleOpenEditSourceDestModal = (rule: FirewallRule, policyId: string, field: 'sources' | 'destinations') => {
        setEditSourceDestModalState({ isOpen: true, rule, policyId, field, isNewRule: false });
    };

    const handleOpenEditSourceDestModalForNewRule = (field: 'sources' | 'destinations') => {
        if (!addingRuleToPolicyId) return;
        const tempRuleForModal: FirewallRule = {
            id: 'new-rule-temp-id',
            ruleId: '(New)',
            name: newRuleForm.name || 'New Rule',
            sources: newRuleForm.sources,
            destinations: newRuleForm.destinations,
            services: [{ name: newRuleForm.services, icon: '' }],
            contextProfiles: 'None',
            appliedTo: 'DFW',
            action: newRuleForm.action,
            enabled: newRuleForm.enabled,
        };
        setEditSourceDestModalState({
            isOpen: true,
            rule: tempRuleForModal,
            policyId: addingRuleToPolicyId,
            field: field,
            isNewRule: true,
        });
    };
    
    const handleSaveSourceDest = (newValue: string) => {
        if (editSourceDestModalState.isNewRule && editSourceDestModalState.field) {
            setNewRuleForm(prev => ({
                ...prev,
                [editSourceDestModalState.field!]: newValue,
            }));
        } else if (editSourceDestModalState.rule && editSourceDestModalState.policyId && editSourceDestModalState.field) {
            handleRuleUpdate(editSourceDestModalState.policyId, editSourceDestModalState.rule.id, editSourceDestModalState.field, newValue);
        }
        setEditSourceDestModalState({ isOpen: false, rule: null, policyId: null, field: null, isNewRule: false });
    };

    const handleRuleUpdate = (policyId: string, ruleId: string, field: keyof Omit<FirewallRule, 'id' | 'ruleId' | 'enabled'>, value: any) => {
        setPolicies(currentPolicies => currentPolicies.map(p => {
            if (p.id === policyId) {
                return {
                    ...p,
                    rules: p.rules.map(r => {
                        if (r.id === ruleId) {
                            return { ...r, [field]: value };
                        }
                        return r;
                    })
                };
            }
            return p;
        }));
    };
    
    const togglePolicy = (policyId: string) => {
        setPolicies(currentPolicies => currentPolicies.map(p =>
            p.id === policyId ? { ...p, isExpanded: !p.isExpanded } : p
        ));
    };
    
    const toggleDraft = (draftId: string) => {
        setDrafts(currentDrafts => currentDrafts.map(d =>
            d.id === draftId ? { ...d, isExpanded: !d.isExpanded } : d
        ));
    };

    const handleSelect = (id: string) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleToggleRule = (policyId: string, ruleId: string) => {
        setPolicies(currentPolicies => currentPolicies.map(p => {
            if (p.id === policyId) {
                return { ...p, rules: p.rules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r) }
            }
            return p;
        }));
    }

    const handleOpenViewMembersModal = (groupName: string) => {
        const groupData = mockGroupData[groupName];
        if (groupData) {
            setViewingGroup(groupData);
            setEditSourceDestModalState(s => ({...s, isOpen: false})); // Close source/dest modal
            setIsViewMembersModalOpen(true);
        }
    };

    const handleCloseViewMembersModal = () => {
        setIsViewMembersModalOpen(false);
        setEditSourceDestModalState(s => ({...s, isOpen: true})); // Re-open source/dest modal
    }

    const handleOpenEditAppliedToModal = (policy: FirewallPolicy) => {
        setEditAppliedToModalState({ isOpen: true, policy });
    };

    const handleSaveAppliedTo = (policyId: string, newAppliedTo: string) => {
        setPolicies(prev => prev.map(p => 
            p.id === policyId ? { ...p, appliedTo: newAppliedTo } : p
        ));
    };

    const handleOpenRelatedGroupsModal = (group: SelectableGroup) => {
        setViewingRelatedGroup(group);
        setIsRelatedGroupsModalOpen(true);
    };

    const handleSaveNewPolicy = () => {
        if (!newPolicyName.trim()) {
            alert('Policy Name is required.');
            return;
        }
        const newPolicy: FirewallPolicy = {
            id: uuidv4(),
            name: newPolicyName,
            policyId: '(0)',
            appliedTo: 'DFW',
            status: 'Success',
            rules: [],
            isExpanded: true,
        };
        setPolicies(prev => [newPolicy, ...prev]);
        setNewPolicyName('');
        setIsAddingPolicy(false);
    };

    const handleCancelAddPolicy = () => {
        setNewPolicyName('');
        setIsAddingPolicy(false);
    };
    
    const handleOpenDeleteDraftModal = (draft: Draft) => {
        setDraftToDelete(draft);
        setIsDeleteDraftModalOpen(true);
    };
    
    const handleConfirmDeleteDraft = () => {
        if (draftToDelete) {
            setDrafts(prev => prev.filter(d => d.id !== draftToDelete.id));
            setIsDeleteDraftModalOpen(false);
            setDraftToDelete(null);
        }
    };

    const handleResumeDraft = (draft: Draft) => {
        alert(`Resuming draft: ${draft.name}`);
        // In a real app, this would likely switch to the 'Category Specific Rules' tab
        // and load the state from the draft.
        setActiveTab('Category Specific Rules');
    };

    const tabs = [
        { id: 'All Rules', name: 'All Rules' },
        { id: 'Category Specific Rules', name: 'Category Specific Rules' },
        { id: 'Saved Drafts', name: 'Saved Drafts' },
        { id: 'Settings', name: 'Settings' }
    ];
    
    return (
        <div className="bg-white dark:bg-slate-900/50 text-[#293c51] dark:text-gray-200 font-sans rounded-xl shadow-sm">
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-semibold text-[#293c51] dark:text-gray-100">Distributed Firewall</h1>
                    <Button variant="ghost" size="icon">
                        <Icon name="far fa-question-circle" className="text-xl text-gray-400" />
                    </Button>
                </div>

                <div className="flex justify-between items-center pb-3 mb-3 border-b border-gray-200 dark:border-slate-700">
                    <div className="flex space-x-6">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-2 px-1 text-sm font-medium ${activeTab === tab.id ? 'border-b-2 border-[#679a41] dark:border-emerald-500 text-[#679a41] dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 hover:text-[#293c51] dark:hover:text-gray-200'}`}>
                                {tab.name}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" disabled={isReadOnly}>ACTIONS <Icon name="fas fa-chevron-down" className="ml-2 text-xs" /></Button>
                        <Button variant="outline" disabled={isReadOnly}>REVERT</Button>
                        <Button variant="primary" disabled={isReadOnly}>PUBLISH</Button>
                    </div>
                </div>

                <div className="flex items-center space-x-2 py-2 mb-2">
                    <Button variant="outline" size="sm" leftIconName="fas fa-plus-circle" onClick={() => setIsAddingPolicy(true)} disabled={isReadOnly}>ADD POLICY</Button>
                    <Button variant="outline" size="sm" leftIconName="fas fa-plus" disabled={!isSinglePolicySelected || !!addingRuleToPolicyId || isReadOnly} onClick={handleAddRuleClick}>ADD RULE</Button>
                    <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-2"></div>
                    <Button variant="ghost" size="sm" leftIconName="fas fa-clone" disabled={!isSingleSelection || isReadOnly}>CLONE</Button>
                    <Button variant="ghost" size="sm" leftIconName="fas fa-undo" disabled={isReadOnly}>UNDO</Button>
                    <div className="flex-grow"></div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        leftIconName="fas fa-trash-alt" 
                        className="text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 disabled:text-gray-400 disabled:dark:text-gray-500 disabled:hover:bg-transparent"
                        disabled={isSelectionEmpty || isReadOnly}
                    >
                        DELETE
                    </Button>
                </div>

                {activeTab === 'All Rules' && (
                    <div className="my-4 p-3 bg-blue-50 dark:bg-sky-900/30 border-l-4 border-blue-500 dark:border-sky-400 rounded-r-md text-sm text-blue-800 dark:text-sky-200">
                        <Icon name="fas fa-info-circle" className="mr-2" />
                        <strong>View Only Mode:</strong> This is a consolidated view of all firewall rules. To make changes, please go to the 'Category Specific Rules' tab.
                    </div>
                )}
                
                {activeTab === 'Saved Drafts' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
{/* FIX: Add missing 'value' and 'onChange' properties to the FormField component. */}
<FormField id="date-range" label="" as="select" value={'Last 30 days'} onChange={() => {}} wrapperClassName="!mb-0" inputClassName="!py-1.5 !text-sm"><option>Last 30 days</option></FormField>
                               <span className="text-gray-700 dark:text-gray-300">Aug 22, 2025 - Sep 21, 2025</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" leftIconName="fas fa-upload">IMPORT</Button>
                                <div className="flex items-center gap-2">
                                    <label htmlFor="timeline-toggle" className="text-sm font-medium">Timeline</label>
                                    <ToggleSwitch id="timeline-toggle" checked={isTimelineVisible} onChange={setIsTimelineVisible} />
                                </div>
                            </div>
                        </div>

                        {/* FIX: Add missing 'value' and 'onChange' properties to the FormField component. */}
<Card titleActions={<div className="w-72"><FormField id="draft-filter" label="" placeholder="Filter by Name, Path and more" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} wrapperClassName="!mb-0"/></div>}>
                            <div className="flex items-center gap-6">
                                <h3 className="text-lg font-semibold text-[#293c51] dark:text-gray-100">Draft History (50)</h3>
                                <FormField type="checkbox" id="auto-saved" label="Auto saved 50" checked={true} onChange={() => {}} wrapperClassName="!mb-0" />
                                <FormField type="checkbox" id="saved-others" label="Saved by others 0" checked={true} onChange={() => {}} wrapperClassName="!mb-0" />
                                <FormField type="checkbox" id="saved-me" label="Saved by me 0" checked={true} onChange={() => {}} wrapperClassName="!mb-0" />
                            </div>

                            {/* Timeline Graph */}
                            <div className="mt-6 h-32 relative">
                                <div className="absolute bottom-6 left-0 right-0 h-px bg-gray-300 dark:bg-slate-600"></div>
                                <div className="absolute bottom-6 left-[60%] right-[5%] h-2 bg-sky-500/50 rounded-full"></div>
                                <div className="absolute bottom-6 left-[89%] w-1 h-4 -translate-y-1 bg-slate-600 dark:bg-slate-300 rounded-full"></div>

                                <div className="absolute bottom-0 w-full flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>8/23</span><span>8/25</span><span>8/27</span><span>8/29</span><span>8/31</span><span>9/1</span><span>9/3</span><span>9/5</span><span>9/7</span><span>9/9</span><span>9/11</span><span>9/13</span><span>9/15</span><span>9/17</span><span>9/19</span><span>9/21</span>
                                </div>
                                
                                {/* Data points */}
                                <div className="absolute bottom-8 text-gray-600 dark:text-gray-200" style={{left: '65%'}}>
                                    <span className="absolute -top-4 text-xs font-semibold">+39</span>
                                    <div className="w-2 h-2 rounded-full bg-current mb-1"></div>
                                    <div className="w-2 h-2 rounded-full bg-current mb-1"></div>
                                    <div className="w-2 h-2 rounded-full bg-current mb-1"></div>
                                    <div className="w-2 h-2 rounded-full bg-current mb-1"></div>
                                    <div className="w-2 h-2 rounded-full bg-current mb-1"></div>
                                    <div className="w-2 h-2 rounded-full bg-current"></div>
                                </div>
                                 <div className="absolute bottom-8" style={{left: '75%'}}>
                                    <div className="w-2 h-2 rounded-full bg-current mb-1"></div>
                                    <div className="w-2 h-2 rounded-full bg-current"></div>
                                </div>
                                <div className="absolute bottom-8" style={{left: '85%'}}>
                                    <div className="w-2 h-2 rounded-full bg-current mb-1"></div>
                                    <div className="w-2 h-2 rounded-full bg-current mb-1"></div>
                                    <div className="w-2 h-2 rounded-full bg-current"></div>
                                </div>
                            </div>
                        </Card>
                        
                        <Card className="mt-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 dark:bg-slate-700/50">
                                        <tr>
                                            <th className="px-4 py-2 w-10"></th>
                                            <th className="px-4 py-2 w-10"></th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-2/5">Name</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Locked</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Saved By</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">User</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Last Modified Time</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Policy Changes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {drafts.map(draft => (
                                            <tr key={draft.id}>
                                                <td className="px-4 py-2"><button><Icon name="fas fa-ellipsis-v" className="text-gray-400" /></button></td>
                                                <td className="px-4 py-2"><button onClick={() => toggleDraft(draft.id)}><Icon name={draft.isExpanded ? "fas fa-chevron-down" : "fas fa-chevron-right"} className="text-gray-500" /></button></td>
                                                <td className="px-4 py-2 text-sm font-mono">{draft.name}</td>
                                                <td className="px-4 py-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Icon name="fas fa-circle" className={`text-xs ${draft.locked ? 'text-yellow-500' : 'text-gray-400'}`} />
                                                        <span>{draft.locked ? 'Yes' : 'No'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-sm">{draft.savedBy}</td>
                                                <td className="px-4 py-2 text-sm">{draft.user}</td>
                                                <td className="px-4 py-2 text-sm">{draft.lastModified}</td>
                                                <td className="px-4 py-2 text-sm">
                                                    <Button variant="ghost" className="!p-0 !h-auto text-sky-500 hover:underline">VIEW DETAILS</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination currentPage={1} totalItems={100} itemsPerPage={50} onPageChange={()=>{}} onItemsPerPageChange={()=>{}} />
                        </Card>
                    </div>
                )}
                
                {activeTab === 'Settings' && (
                    <Card>
                        <div className="text-center p-10">
                            <Icon name="fas fa-cog" className="text-4xl text-gray-400 dark:text-gray-500 mb-4" />
                            <h1 className="text-2xl font-bold text-[#293c51] dark:text-gray-100">Settings</h1>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">Firewall settings will be available here.</p>
                        </div>
                    </Card>
                )}

                {(activeTab === 'Category Specific Rules' || activeTab === 'All Rules') && (
                    <>
                        {isAddingPolicy && (
                            <Card className="my-4 animate-fade-in">
                                <h3 className="text-lg font-semibold mb-4 text-[#293c51] dark:text-gray-100">New Policy</h3>
                                <div className="max-w-md">
                                    <FormField
                                        id="newPolicyName"
                                        name="newPolicyName"
                                        label="Policy Name"
                                        value={newPolicyName}
                                        onChange={(e) => setNewPolicyName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-4 mt-6 pt-4 border-t dark:border-slate-700">
                                    <Button onClick={handleSaveNewPolicy}>SAVE</Button>
                                    <Button variant="ghost" onClick={handleCancelAddPolicy}>CANCEL</Button>
                                </div>
                            </Card>
                        )}
                        <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                            <table className="min-w-full w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                                <thead className="bg-gray-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[25%]">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[5%]">ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[10%]">Sources</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[10%]">Destinations</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[15%]">Services</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[10%]">Applied To</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[10%]">Action</th>
                                        <th className="relative px-4 py-3 w-[5%]"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {policies.map(policy => (
                                        <React.Fragment key={policy.id}>
                                            <tr className="bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 h-[52px]">
                                                <td className="px-4 py-3 text-sm text-[#293c51] dark:text-gray-200 truncate">
                                                    <div className="flex items-center gap-x-2">
                                                        <Icon name="fas fa-ellipsis-v" className="text-gray-400 cursor-pointer" />
                                                        <button onClick={() => togglePolicy(policy.id)} className="text-gray-500 w-5 text-center flex-shrink-0">
                                                            <Icon name={policy.isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right'} />
                                                        </button>
                                                        <input type="checkbox" checked={selectedItems.includes(policy.id)} onChange={() => handleSelect(policy.id)} disabled={isReadOnly} className="bg-gray-100 border-gray-300 rounded text-sky-500 focus:ring-sky-500 flex-shrink-0" />
                                                        <div className="flex flex-col items-start">
                                                            <div className="flex items-center gap-x-2">
                                                                <span className="font-semibold">{policy.name}</span>
                                                                <span className="text-gray-500 dark:text-gray-400 font-normal">{policy.policyId}</span>
                                                            </div>
                                                            <AppliedToDisplay value={policy.appliedTo} onEdit={() => handleOpenEditAppliedToModal(policy)} type="policy" isReadOnly={isReadOnly} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td colSpan={7} className="px-4 py-3 text-right"></td>
                                            </tr>
                                            {policy.isExpanded && (
                                                <>
                                                    {addingRuleToPolicyId === policy.id && (
                                                        <tr className="bg-sky-50/50 dark:bg-sky-900/20 animate-fade-in">
                                                            <td className="px-4 py-2">
                                                                <div className="flex items-center gap-x-2 pl-6">
                                                                    <Icon name="fas fa-ellipsis-v" className="text-gray-400 invisible" />
                                                                    <Icon name="fas fa-plus" className="text-sky-500" />
                                                                    <FormField id="newRuleName" label="" name="name" value={newRuleForm.name} onChange={handleNewRuleFormChange} placeholder="Enter rule name" wrapperClassName="!mb-0 flex-grow" inputClassName="!py-1" />
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-400">(New)</td>
                                                            <td className="px-4 py-2 text-sm text-sky-500 font-medium truncate group relative cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50" onClick={() => handleOpenEditSourceDestModalForNewRule('sources')}>
                                                                <span>{newRuleForm.sources}</span>
                                                                <Icon name="fas fa-pencil-alt" className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs" />
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-sky-500 font-medium truncate group relative cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50" onClick={() => handleOpenEditSourceDestModalForNewRule('destinations')}>
                                                                <span>{newRuleForm.destinations}</span>
                                                                <Icon name="fas fa-pencil-alt" className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs" />
                                                            </td>
                                                            <td className="px-4 py-2"><FormField id="newRuleServices" label="" name="services" value={newRuleForm.services} onChange={handleNewRuleFormChange} wrapperClassName="!mb-0" inputClassName="!py-1" /></td>
                                                            <td className="px-4 py-2 text-sm">DFW</td>
                                                            <td className="px-4 py-2">
                                                                <div className="flex items-center gap-2">
                                                                    <FormField as="select" label="" id="newRuleAction" name="action" value={newRuleForm.action} onChange={handleNewRuleFormChange} wrapperClassName="!mb-0 flex-grow" inputClassName="!py-1">
                                                                        <option value="Allow">Allow</option>
                                                                        <option value="Deny">Deny</option>
                                                                        <option value="Drop">Drop</option>
                                                                    </FormField>
                                                                    <ToggleSwitch size="sm" id="newRuleEnabled" checked={newRuleForm.enabled} onChange={(checked) => setNewRuleForm(p => ({...p, enabled: checked}))} />
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <Button size="icon" variant="ghost" onClick={handleSaveNewRule} title="Save Rule"><Icon name="fas fa-check" className="text-green-500" /></Button>
                                                                    <Button size="icon" variant="ghost" onClick={handleCancelNewRule} title="Cancel"><Icon name="fas fa-times" className="text-red-500" /></Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {policy.rules.map(rule => (
                                                        <tr key={rule.id} className="h-[52px]">
                                                            <td className="px-4 py-3 text-sm text-[#293c51] dark:text-gray-200 truncate group relative">
                                                                <div className="flex items-center gap-x-2 pl-6">
                                                                    <Icon name="fas fa-ellipsis-v" className="text-gray-400 cursor-pointer -ml-5" />
                                                                    <input type="checkbox" checked={selectedItems.includes(rule.id)} onChange={(e) => { e.stopPropagation(); handleSelect(rule.id); }} disabled={isReadOnly} className="bg-gray-100 border-gray-300 rounded text-sky-500 focus:ring-sky-500 flex-shrink-0" />
                                                                    <div className="flex flex-col items-start">
                                                                        <span>{rule.name}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 truncate">{rule.ruleId}</td>
                                                            <td className={`px-4 py-3 text-sm font-medium truncate group relative ${isReadOnly ? 'text-gray-500 dark:text-gray-400' : 'text-sky-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50'}`} onClick={() => !isReadOnly && handleOpenEditSourceDestModal(rule, policy.id, 'sources')}>
                                                                <span>{rule.sources}</span>
                                                                {!isReadOnly && <Icon name="fas fa-pencil-alt" className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs" />}
                                                            </td>
                                                            <td className={`px-4 py-3 text-sm font-medium truncate group relative ${isReadOnly ? 'text-gray-500 dark:text-gray-400' : 'text-sky-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50'}`} onClick={() => !isReadOnly && handleOpenEditSourceDestModal(rule, policy.id, 'destinations')}>
                                                                <span>{rule.destinations}</span>
                                                                {!isReadOnly && <Icon name="fas fa-pencil-alt" className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs" />}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-sky-500 truncate">{rule.services.map(s => s.name).join(', ')}</td>
                                                            <td className="px-4 py-3 text-sm text-sky-500 font-medium truncate">{rule.appliedTo}</td>
                                                            <td className="px-4 py-3 text-sm font-semibold">
                                                                <div className="flex items-center space-x-2 group relative">
                                                                    <span className={`flex items-center ${rule.action === 'Allow' ? 'text-green-500' : 'text-red-500'}`}>
                                                                        <span className={`w-2 h-2 rounded-full ${rule.action === 'Allow' ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
                                                                        {rule.action}
                                                                    </span>
                                                                    <ToggleSwitch size="sm" id={`toggle-${rule.id}`} checked={rule.enabled} onChange={() => handleToggleRule(policy.id, rule.id)} disabled={isReadOnly} />
                                                                    <Button size="icon" variant="ghost" title="Settings" disabled={isReadOnly} className="text-gray-400 hover:text-sky-500">
            <Icon name="fas fa-cog" />
        </Button>
        <Button size="icon" variant="ghost" title="Statistics" disabled={isReadOnly} className="text-gray-400 hover:text-sky-500">
            <Icon name="fas fa-chart-bar" />
        </Button>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-right"></td>
                                                        </tr>
                                                    ))}
                                                </>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
            {editSourceDestModalState.isOpen && editSourceDestModalState.rule && editSourceDestModalState.field && (
                <EditSourceDestModal
                    isOpen={editSourceDestModalState.isOpen}
                    onClose={() => setEditSourceDestModalState({ isOpen: false, rule: null, policyId: null, field: null, isNewRule: false })}
                    onSave={handleSaveSourceDest}
                    field={editSourceDestModalState.field}
                    currentValue={editSourceDestModalState.rule[editSourceDestModalState.field]}
                    ruleName={editSourceDestModalState.rule.name}
                    onViewMembers={handleOpenViewMembersModal}
                    onViewRelatedGroups={handleOpenRelatedGroupsModal}
                    availableGroups={availableGroups}
                    onAddGroup={handleAddNewGroup}
                />
            )}
            <ViewMembersModal isOpen={isViewMembersModalOpen} onClose={handleCloseViewMembersModal} groupData={viewingGroup} />
             <EditAppliedToModal
                isOpen={editAppliedToModalState.isOpen}
                onClose={() => setEditAppliedToModalState({ isOpen: false, policy: null })}
                onSave={handleSaveAppliedTo}
                policy={editAppliedToModalState.policy}
            />
             <RelatedGroupsModal
                isOpen={isRelatedGroupsModalOpen}
                onClose={() => setIsRelatedGroupsModalOpen(false)}
                group={viewingRelatedGroup}
            />
             <Modal 
                isOpen={isDeleteDraftModalOpen} 
                onClose={() => setIsDeleteDraftModalOpen(false)} 
                title="Delete Draft"
                footer={
                    <>
                        <Button variant="danger" onClick={handleConfirmDeleteDraft}>Delete</Button>
                        <Button variant="ghost" onClick={() => setIsDeleteDraftModalOpen(false)}>Cancel</Button>
                    </>
                }
            >
                <p>Are you sure you want to delete the draft "{draftToDelete?.name}"? This action cannot be undone.</p>
            </Modal>
        </div>
    );
};