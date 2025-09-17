// FIX: Import `useEffect` from React to resolve 'Cannot find name' error.
import React, { useState, useMemo, useEffect } from 'react';
import { Button, Icon, ToggleSwitch, FormField, Modal } from '@/components/ui';

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
}

const mockAvailableGroupsForSelection: SelectableGroup[] = [
    { id: 'group1', name: 'DefaultMaliciousIpGroup', type: 'IP Addresses Only', icon: 'fas fa-globe-americas' },
    { id: 'group2', name: 'Edge_NSGroup', type: 'Generic', icon: 'fas fa-lock' },
    { id: 'group3', name: 'f31e1b66-29e3-4ff2-a5bc-5233fd1a891a', type: 'Generic', icon: 'fas fa-cubes' },
    { id: 'group4', name: 'group from code', type: 'IP Addresses Only', icon: 'fas fa-globe-americas' },
    { id: 'group5', name: 'MCA>Como>org>wdqwd', type: 'Generic', icon: 'fas fa-cubes' },
    { id: 'group6', name: 'MCA>rotest>org>bb', type: 'Generic', icon: 'fas fa-cubes' },
    { id: 'group7', name: 'Web Servers Group', type: 'Generic', icon: 'fas fa-cubes' },
    { id: 'group8', name: 'DB Servers Group', type: 'Generic', icon: 'fas fa-cubes' },
    { id: 'group9', name: 'App Servers Group', type: 'Generic', icon: 'fas fa-cubes' },
    { id: 'group10', name: 'Admin IP Group', type: 'IP Addresses Only', icon: 'fas fa-globe-americas' },
    { id: 'group11', name: 'Mgmt Group', type: 'Generic', icon: 'fas fa-cubes' },
    { id: 'group12', name: 'Any', type: 'Generic', icon: 'fas fa-asterisk' },
];
// --- END: Data for Edit Modals ---

const mockPoliciesData: FirewallPolicy[] = [
    { id: 'policy1', name: 'Web Servers Policy', policyId: '(2)', appliedTo: '2 Groups', status: 'Success', rules: [
        { id: 'rule-web-1', name: 'Allow HTTP', ruleId: '5', sources: 'Any', destinations: 'Web Servers Group', services: [{ name: 'HTTP', icon: 'fas fa-globe' }], contextProfiles: 'None', appliedTo: 'DFW', action: 'Allow', enabled: true },
        { id: 'rule-web-2', name: 'Allow HTTPS', ruleId: '6', sources: 'Any', destinations: 'Web Servers Group', services: [{ name: 'HTTPS', icon: 'fas fa-lock' }], contextProfiles: 'None', appliedTo: 'DFW', action: 'Allow', enabled: true },
    ], isExpanded: false },
    { id: 'policy2', name: 'Database Policy', policyId: '(1)', appliedTo: '1 Groups', status: 'Success', rules: [
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
    { id: 'draft1', name: '209-7ef8f73d-9ce7-44b9-800d-bd953a24486a', locked: false, savedBy: 'System', user: 'admin', lastModified: 'Sep 15, 2025, 12:14:18 AM', isExpanded: false },
    { id: 'draft2', name: '208-964a8cf5-d96c-46d0-9fac-9f5c5e42eb07', locked: false, savedBy: 'System', user: 'admin', lastModified: 'Sep 15, 2025, 12:14:05 AM', isExpanded: false },
    { id: 'draft3', name: '207-4d0c6940-f3b0-44be-af06-dadeb456e26b', locked: false, savedBy: 'System', user: 'admin', lastModified: 'Sep 15, 2025, 12:00:24 AM', isExpanded: false },
    { id: 'draft4', name: '206-89bf214c-45ab-402c-b8bb-8ae6b2df7457', locked: false, savedBy: 'System', user: 'admin', lastModified: 'Sep 14, 2025, 11:58:09 PM', isExpanded: false },
    { id: 'draft5', name: '205-38129c0a-f548-4d9c-a656-7558d03584c0', locked: false, savedBy: 'System', user: 'admin', lastModified: 'Sep 14, 2025, 11:57:55 PM', isExpanded: false },
    { id: 'draft6', name: '204-d561a2ad-5dd4-4565-8723-4421a70a8177', locked: false, savedBy: 'System', user: 'admin', lastModified: 'Sep 14, 2025, 11:54:34 PM', isExpanded: false },
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
}

const EditSourceDestModal: React.FC<EditSourceDestModalProps> = ({ isOpen, onClose, onSave, field, currentValue, ruleName, onViewMembers }) => {
    const [selected, setSelected] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Groups');
    const [negate, setNegate] = useState(false);
    const [showSelectedOnly, setShowSelectedOnly] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelected(currentValue ? [currentValue] : []);
            setSearchTerm('');
        }
    }, [isOpen, currentValue]);

    const filteredGroups = useMemo(() => {
        let groups = mockAvailableGroupsForSelection;
        if (showSelectedOnly) {
            groups = groups.filter(g => selected.includes(g.name));
        }
        if (searchTerm) {
            groups = groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return groups;
    }, [searchTerm, showSelectedOnly, selected]);
    
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
                         <Button variant="ghost" leftIconName="fas fa-sync-alt">REFRESH</Button>
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
                    <Button variant="outline">ADD GROUP</Button>
                    <div className="flex items-center gap-2">
                        <Button variant="outline">EXPAND ALL</Button>
                        <div className="w-72">
                            <FormField id="group-filter" label="" placeholder="Filter by Name, Path and more" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} wrapperClassName="!mb-0" />
                        </div>
                        <Button variant="ghost" size="icon"><Icon name="fas fa-filter" /></Button>
                    </div>
                </div>

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
                                <tr key={group.id} className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 ${selected.includes(group.name) ? 'bg-sky-100 dark:bg-sky-900/40' : ''}`}>
                                    <td className="px-2 py-1"><input type="checkbox" checked={selected.includes(group.name)} onChange={() => handleSelect(group.name)} className="rounded" /></td>
                                    <td className="px-2 py-1">
                                        <div className="flex items-center gap-2">
                                            <Icon name="fas fa-ellipsis-v" className="text-gray-400 cursor-pointer" />
                                            <Icon name="fas fa-chevron-right" className="text-gray-400" />
                                            <Icon name="fas fa-cubes" className="text-gray-500" />
                                            <Icon name={group.icon} className="text-gray-500" />
                                            <span>{group.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-1">{group.type}</td>
                                    <td className="px-2 py-1">
                                        <Button variant="ghost" className="!p-0 !h-auto text-sky-500 hover:underline" onClick={() => onViewMembers(group.name)}>View Members</Button>
                                    </td>
                                    <td className="px-2 py-1">
                                        <div className="flex items-center gap-2 text-green-500">
                                            <Icon name="fas fa-check-circle" />
                                            <span>Success</span>
                                            <Icon name="fas fa-sync-alt" className="text-gray-400 cursor-pointer" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="text-right text-xs text-gray-500">1 - {filteredGroups.length} of {filteredGroups.length}</div>
            </div>
        </Modal>
    );
};

export const DistributedFirewallPage: React.FC = () => {
    const [filterValue, setFilterValue] = useState('');
    const [activeTab, setActiveTab] = useState('Category Specific Rules');
    const [policies, setPolicies] = useState<FirewallPolicy[]>(mockPoliciesData);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isViewMembersModalOpen, setIsViewMembersModalOpen] = useState(false);
    const [viewingGroup, setViewingGroup] = useState<GroupData | null>(null);
    const [editSourceDestModalState, setEditSourceDestModalState] = useState<{ isOpen: boolean; rule: FirewallRule | null; policyId: string | null; field: 'sources' | 'destinations' | null }>({ isOpen: false, rule: null, policyId: null, field: null });
    
    const isSelectionEmpty = selectedItems.length === 0;

    const handleOpenEditSourceDestModal = (rule: FirewallRule, policyId: string, field: 'sources' | 'destinations') => {
        setEditSourceDestModalState({ isOpen: true, rule, policyId, field });
    };

    const handleSaveSourceDest = (newValue: string) => {
        if (editSourceDestModalState.rule && editSourceDestModalState.policyId && editSourceDestModalState.field) {
            handleRuleUpdate(editSourceDestModalState.policyId, editSourceDestModalState.rule.id, editSourceDestModalState.field, newValue);
        }
        setEditSourceDestModalState({ isOpen: false, rule: null, policyId: null, field: null });
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
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-2 px-1 text-sm font-medium ${activeTab === tab.id ? 'border-b-2 border-sky-500 text-sky-600' : 'text-gray-500 hover:text-[#293c51]'}`}>
                                {tab.name}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline">ACTIONS <Icon name="fas fa-chevron-down" className="ml-2 text-xs" /></Button>
                        <Button variant="outline">REVERT</Button>
                        <Button variant="primary">PUBLISH</Button>
                    </div>
                </div>

                <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                    <table className="min-w-full w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[30%]">Name</th>
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
                                        <td className="px-4 py-3 text-sm font-semibold text-[#293c51] dark:text-gray-200 truncate">
                                            <div className="flex items-center gap-x-2">
                                                <Icon name="fas fa-ellipsis-v" className="text-gray-400 cursor-pointer" />
                                                <button onClick={() => togglePolicy(policy.id)} className="text-gray-500 w-5 text-center flex-shrink-0">
                                                    <Icon name={policy.isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right'} />
                                                </button>
                                                <input type="checkbox" checked={selectedItems.includes(policy.id)} onChange={() => handleSelect(policy.id)} className="bg-gray-100 border-gray-300 rounded text-sky-500 focus:ring-sky-500 flex-shrink-0" />
                                                <span>{policy.name}</span>
                                                <span className="text-gray-500 dark:text-gray-400 font-normal">{policy.policyId}</span>
                                            </div>
                                        </td>
                                        <td colSpan={7} className="px-4 py-3 text-right"></td>
                                    </tr>
                                    {policy.isExpanded && policy.rules.map(rule => (
                                        <tr key={rule.id} className="h-[52px]">
                                            <td className="px-4 py-3 text-sm text-[#293c51] dark:text-gray-200 truncate group relative">
                                                <div className="flex items-center gap-x-2 pl-6">
                                                    <Icon name="fas fa-ellipsis-v" className="text-gray-400 cursor-pointer -ml-5" />
                                                    <input type="checkbox" checked={selectedItems.includes(rule.id)} onChange={(e) => { e.stopPropagation(); handleSelect(rule.id); }} className="bg-gray-100 border-gray-300 rounded text-sky-500 focus:ring-sky-500 flex-shrink-0" />
                                                    <span>{rule.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 truncate">{rule.ruleId}</td>
                                            <td className="px-4 py-3 text-sm text-sky-500 font-medium truncate group relative cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50" onClick={() => handleOpenEditSourceDestModal(rule, policy.id, 'sources')}>
                                                <span>{rule.sources}</span>
                                                <Icon name="fas fa-pencil-alt" className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs" />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-sky-500 font-medium truncate group relative cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50" onClick={() => handleOpenEditSourceDestModal(rule, policy.id, 'destinations')}>
                                                <span>{rule.destinations}</span>
                                                <Icon name="fas fa-pencil-alt" className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs" />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-sky-500 truncate">{rule.services.map(s => s.name).join(', ')}</td>
                                            <td className="px-4 py-3 text-sm text-[#293c51] dark:text-gray-300 truncate">{rule.appliedTo}</td>
                                            <td className="px-4 py-3 text-sm font-semibold">
                                                <div className="flex items-center space-x-2 group relative">
                                                    <span className="flex items-center text-green-500">
                                                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                                        {rule.action}
                                                    </span>
                                                    <ToggleSwitch size="sm" id={`toggle-${rule.id}`} checked={rule.enabled} onChange={() => handleToggleRule(policy.id, rule.id)} />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right"></td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {editSourceDestModalState.isOpen && editSourceDestModalState.rule && editSourceDestModalState.field && (
                <EditSourceDestModal
                    isOpen={editSourceDestModalState.isOpen}
                    onClose={() => setEditSourceDestModalState({ isOpen: false, rule: null, policyId: null, field: null })}
                    onSave={handleSaveSourceDest}
                    field={editSourceDestModalState.field}
                    currentValue={editSourceDestModalState.rule[editSourceDestModalState.field]}
                    ruleName={editSourceDestModalState.rule.name}
                    onViewMembers={handleOpenViewMembersModal}
                />
            )}
            <ViewMembersModal isOpen={isViewMembersModalOpen} onClose={handleCloseViewMembersModal} groupData={viewingGroup} />
        </div>
    );
};
