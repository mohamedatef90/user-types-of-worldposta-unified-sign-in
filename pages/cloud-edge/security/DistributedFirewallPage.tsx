
import React, { useState, useMemo, useEffect, useRef } from 'react';
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

interface AppliedToDisplayProps {
    value: string;
    onEdit: () => void;
    isReadOnly?: boolean;
};

const AppliedToDisplay: React.FC<AppliedToDisplayProps> = ({ value, onEdit, isReadOnly = false }) => {
    return (
        <div className="group relative flex items-center gap-2" onDoubleClick={!isReadOnly ? onEdit : undefined}>
            <span className="text-gray-500 dark:text-gray-400 font-normal italic text-xs">
                Applied to: {value}
            </span>
            {!isReadOnly && (
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

interface EditServicesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newServices: { name: string; icon: string }[]) => void;
    currentServices: { name: string; icon: string }[];
    ruleName: string;
}

const EditServicesModal: React.FC<EditServicesModalProps> = ({ isOpen, onClose, onSave, currentServices, ruleName }) => {
    const [selected, setSelected] = useState<{ name: string; icon: string }[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSelected(currentServices);
            setSearchTerm('');
        }
    }, [isOpen, currentServices]);

    const handleToggle = (service: { name: string; icon: string }) => {
        setSelected(prev => 
            prev.some(s => s.name === service.name)
            ? prev.filter(s => s.name !== service.name)
            : [...prev, service]
        );
    };
    
    const handleSave = () => {
        onSave(selected);
        onClose();
    };

    const filteredServices = useMemo(() => {
        return mockAvailableServices.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm]);

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Set Services for ${ruleName}`} size="2xl"
            footer={<><Button variant="outline" onClick={onClose}>CANCEL</Button><Button variant="primary" onClick={handleSave}>APPLY</Button></>}
        >
            <div className="space-y-4">
                <FormField id="service-search" label="" placeholder="Filter services..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} wrapperClassName="!mb-0" />
                <div className="max-h-80 overflow-y-auto border rounded-md dark:border-slate-600 p-2 space-y-1">
                    {filteredServices.map(service => (
                        <FormField
                            key={service.name}
                            type="checkbox"
                            id={`service-${service.name}`}
                            label={service.name}
                            checked={selected.some(s => s.name === service.name)}
                            onChange={() => handleToggle(service)}
                            wrapperClassName="!mb-0 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                        />
                    ))}
                </div>
            </div>
        </Modal>
    );
};

interface EditRuleAppliedToModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (policyId: string, ruleId: string, newAppliedTo: string) => void;
    rule: FirewallRule | null;
    policy: FirewallPolicy | null;
}

const EditRuleAppliedToModal: React.FC<EditRuleAppliedToModalProps> = ({ isOpen, onClose, onSave, rule, policy }) => {
    const [selectedGroups, setSelectedGroups] = useState<SelectableGroup[]>([]);
    
    useEffect(() => {
        if (rule) {
            const group = mockAvailableGroupsForSelection.find(g => g.name === rule.appliedTo);
            setSelectedGroups(group ? [group] : []);
        }
    }, [rule]);

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
        if (!policy || !rule) return;
        let newAppliedTo = 'DFW'; // Default
        if (selectedGroups.length === 1) {
            newAppliedTo = selectedGroups[0].name;
        } else if (selectedGroups.length > 1) {
            newAppliedTo = `${selectedGroups.length} Groups`;
        }
        onSave(policy.id, rule.id, newAppliedTo);
        onClose();
    };

    if (!isOpen || !rule) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Applied To: ${rule.name}`} size="2xl" footer={
            <>
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </>
        }>
            <div className="space-y-4">
                <p>Select the groups this rule will apply to. If no groups are selected, it will apply to DFW (Distributed Firewall).</p>
                <div className="max-h-96 overflow-y-auto border rounded-md dark:border-slate-600 p-2 space-y-1">
                    {mockAvailableGroupsForSelection.map(group => (
                        <FormField
                            key={group.id}
                            type="checkbox"
                            id={`rule-group-select-${group.id}`}
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
export const DistributedFirewallPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Policies');
    const [draftsFilter, setDraftsFilter] = useState('');
    const [draftsFilterBy, setDraftsFilterBy] = useState('all');

    return (
        <div className="bg-white dark:bg-slate-900/50 text-[#293c51] dark:text-gray-200 font-sans rounded-xl shadow-sm">
            <div className="p-6">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200 dark:border-slate-700">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#293c51] dark:text-gray-100">Distributed Firewall</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="font-medium text-sm">Service Status</span>
                        <ToggleSwitch id="service-status-toggle" checked={true} onChange={() => {}} />
                    </div>
                </div>

                <div className="border-b border-gray-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('Policies')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'Policies' ? 'border-[#679a41] dark:border-emerald-500 text-[#679a41] dark:text-emerald-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-[#293c51] dark:hover:text-gray-200'}`}
                        >
                            Policies
                        </button>
                        <button
                            onClick={() => setActiveTab('Saved Drafts')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'Saved Drafts' ? 'border-[#679a41] dark:border-emerald-500 text-[#679a41] dark:text-emerald-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-[#293c51] dark:hover:text-gray-200'}`}
                        >
                            Saved Drafts
                        </button>
                    </nav>
                </div>
                
                {activeTab === 'Saved Drafts' && (
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm">IMPORT</Button>
                                <Button variant="outline" size="sm">EXPORT</Button>
                                <Button variant="outline" size="sm" className="text-red-600 border-red-500 hover:bg-red-50">DELETE</Button>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-40">
                                    <FormField as="select" id="drafts-filter-by" label="" wrapperClassName="!mb-0" inputClassName="!py-1.5" value={draftsFilterBy} onChange={(e) => setDraftsFilterBy(e.target.value)}>
                                        <option value="all">Filter By</option>
                                        <option value="name">Name</option>
                                        <option value="user">User</option>
                                    </FormField>
                                </div>
                                <div className="w-72">
                                    <FormField id="drafts-filter" label="" placeholder="Filter by Name, Path and more" wrapperClassName="!mb-0" inputClassName="!py-1.5" value={draftsFilter} onChange={(e) => setDraftsFilter(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};
