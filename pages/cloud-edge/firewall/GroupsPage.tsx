import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, Button, FormField, Icon, Pagination, Modal, Tooltip } from '@/components/ui';
import { v4 as uuidv4 } from 'uuid';

// --- TYPES AND MOCK DATA ---

interface FirewallGroup {
  id: string;
  name: string;
  type: 'IP Addresses Only' | 'Generic';
  description: string;
  tags: number;
  isSystemDefined?: boolean;
  isLocked?: boolean;
}

const mockFirewallGroups: FirewallGroup[] = [
    { id: 'group1', name: 'DefaultMaliciousIpGroup', type: 'IP Addresses Only', description: 'Default Malicious IP group', tags: 0, isSystemDefined: true },
    { id: 'group2', name: 'Edge_NSGroup', type: 'Generic', description: 'NSX group for edge nodes', tags: 0, isLocked: true },
    { id: 'group3', name: 'f31e1b66-29e3-4ff2-a5bc-5233fd1a891a', type: 'Generic', description: 'Auto-generated application group', tags: 2 },
    { id: 'group4', name: 'group from code', type: 'IP Addresses Only', description: 'Group managed via infrastructure-as-code', tags: 1, isSystemDefined: true },
    { id: 'group5', name: 'MCA>Como>org>wdqwd', type: 'Generic', description: 'Group for Como org', tags: 0 },
    { id: 'group6', name: 'MCA>rotest>org>bb', type: 'Generic', description: 'Test group for BB', tags: 0 },
    { id: 'group7', name: 'MCA>protest>org>n', type: 'Generic', description: 'Test group for N', tags: 0 },
    { id: 'group8', name: 'MCA>protest>org>rkjrjg', type: 'Generic', description: 'Test group for RKJRJG', tags: 0 },
    { id: 'group9', name: 'MCA>sso11>sso11>Ahmed Mohamed Ra...', type: 'Generic', description: 'SSO group for Ahmed Mohamed', tags: 0 },
    { id: 'group10', name: 'MCA>sso11>sso11>sa', type: 'Generic', description: 'SSO group for SA', tags: 0 },
    { id: 'group11', name: 'MCA>sso8>sso8>Ahmed Mohamed R', type: 'Generic', description: 'SSO group for Ahmed Mohamed R', tags: 0 },
];

interface Member { [key: string]: string | number; }
interface MemberCategory {
  id: string;
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
}
const mockGroupMemberData: { [key: string]: GroupData } = {
  'DefaultMaliciousIpGroup': {
    id: 'group1', name: 'DefaultMaliciousIpGroup', groupType: 'IPSet',
    memberCategories: [{ id: 'ips', name: 'IP Addresses', count: 14082, members: [{ 'IP Address': '1.2.3.4' }, { 'IP Address': '5.6.7.8' }], headers: ['IP Address'] }]
  },
  'Edge_NSGroup': {
    id: 'group2', name: 'Edge_NSGroup', groupType: 'Generic',
    memberCategories: [{ id: 'vms', name: 'Virtual Machines', count: 4, members: [{ Name: 'edge-01a' }], headers: ['Name'] }]
  },
  'f31e1b66-29e3-4ff2-a5bc-5233fd1a891a': {
    id: 'group3', name: 'f31e1b66-29e3-4ff2-a5bc-5233fd1a891a', groupType: 'Generic',
    memberCategories: [
      { id: 'vms', name: 'Virtual Machines', count: 8, members: [], headers: ['Name'] },
      { id: 'ips', name: 'IP Addresses', count: 2, members: [{ 'IP Address': '192.168.1.10' }], headers: ['IP Address'] }
    ]
  },
  // Add other mappings as needed
};


// --- VIEW MEMBERS MODAL (Adapted from DistributedFirewallPage) ---
const ViewMembersModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    groupData: GroupData | null;
}> = ({ isOpen, onClose, groupData }) => {
    const [activeCategory, setActiveCategory] = useState<MemberCategory | null>(null);

    useEffect(() => {
        if (groupData?.memberCategories) {
            const firstWithMembers = groupData.memberCategories.find(c => c.count > 0);
            setActiveCategory(firstWithMembers || groupData.memberCategories[0]);
        }
    }, [groupData]);

    if (!isOpen || !groupData) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`View Members | ${groupData.name}`} size="4xl" footer={<Button onClick={onClose}>Close</Button>}>
             <div className="flex" style={{minHeight: '400px'}}>
                <div className="w-1/3 border-r border-gray-200 dark:border-slate-700 pr-4">
                    <h3 className="text-sm font-semibold mb-2">Categories</h3>
                    <ul className="space-y-1">
                        {groupData.memberCategories.map(cat => (
                            <li key={cat.id}>
                                <button 
                                    onClick={() => setActiveCategory(cat)}
                                    className={`w-full text-left text-sm p-2 rounded-md flex justify-between items-center ${activeCategory?.id === cat.id ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-slate-700/50'}`}
                                >
                                    <span>{cat.name}</span>
                                    <span>({cat.count})</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="w-2/3 pl-4">
                    {activeCategory && (
                        <>
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
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};

const WhereUsedModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    group: FirewallGroup | null;
}> = ({ isOpen, onClose, group }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    interface WhereUsedReference {
        id: string;
        serviceEntity: string;
        location: {
            path: string[];
            target: string;
        };
    }

    const mockReferences: WhereUsedReference[] = [
        {
            id: 'ref1',
            serviceEntity: 'Distributed Firewall',
            location: {
                path: ['Infrastructure', 'Default Malicious IP Block Rules', 'Malicious IP at Source Rule'],
                target: 'Source'
            }
        },
        {
            id: 'ref2',
            serviceEntity: 'Distributed Firewall',
            location: {
                path: ['Infrastructure', 'Default Malicious IP Block Rules', 'Malicious IP at Destination Rule'],
                target: 'Destination'
            }
        }
    ];
    
    const references = group?.name === 'DefaultMaliciousIpGroup' ? mockReferences : [];
    const filteredReferences = useMemo(() => {
        if (!searchTerm) return references;
        const lowerSearch = searchTerm.toLowerCase();
        return references.filter(ref => 
            ref.serviceEntity.toLowerCase().includes(lowerSearch) ||
            ref.location.path.join(' ').toLowerCase().includes(lowerSearch) ||
            ref.location.target.toLowerCase().includes(lowerSearch)
        );
    }, [references, searchTerm]);
    
    if (!group) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            size="5xl"
            footer={
                <div className="w-full flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total: {filteredReferences.length}</span>
                    <Button onClick={onClose}>CLOSE</Button>
                </div>
            }
        >
            <div className="flex flex-col" style={{ height: '70vh' }}>
                {/* Custom Header */}
                <div className="flex-shrink-0">
                    <div className="flex justify-between items-start pb-4 border-b dark:border-gray-700 -mt-4">
                        <div>
                            <h3 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">
                                Where Used | {group.name}
                            </h3>
                             <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Click on the link to go to the page where the object is used.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-64">
                                <FormField
                                    id="where-used-search-group"
                                    label=""
                                    placeholder="Search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    wrapperClassName="!mb-0"
                                    inputClassName="!py-1.5"
                                />
                            </div>
                            <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700">
                                <Icon name="fas fa-times" className="text-xl text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow mt-4 border rounded-md dark:border-gray-700 flex flex-col overflow-y-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-1/3">Service/Entity</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-2/3">Location</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                            {filteredReferences.length > 0 ? (
                                filteredReferences.map(ref => (
                                    <tr key={ref.id}>
                                        <td className="px-4 py-3 text-sm">{ref.serviceEntity}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex items-center flex-wrap gap-x-1">
                                                <a href="#" className="text-sky-500 hover:underline">
                                                    {ref.location.path.join(' > ')}
                                                </a>
                                                <Icon name="fas fa-chevron-right" className="text-xs text-gray-400 mx-1" />
                                                <span>({ref.location.target})</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2} className="h-full">
                                        <div className="flex flex-col items-center justify-center text-center p-8 text-gray-500 dark:text-gray-400" style={{minHeight: '200px'}}>
                                            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 3l7 7v7l4-4v-3l7-7H3z" />
                                            </svg>
                                            <p className="font-semibold">No References Found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
    );
};


// --- MAIN PAGE COMPONENT ---
export const GroupsPage: React.FC = () => {
    const [groups, setGroups] = useState<FirewallGroup[]>(mockFirewallGroups);
    const [filterTerm, setFilterTerm] = useState('');
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isViewMembersModalOpen, setIsViewMembersModalOpen] = useState(false);
    const [viewingGroupData, setViewingGroupData] = useState<GroupData | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    
    const [isWhereUsedModalOpen, setIsWhereUsedModalOpen] = useState(false);
    const [selectedGroupForModal, setSelectedGroupForModal] = useState<FirewallGroup | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filteredGroups = useMemo(() => {
        if (!filterTerm) return groups;
        return groups.filter(g => g.name.toLowerCase().includes(filterTerm.toLowerCase()));
    }, [groups, filterTerm]);
    
    const handleToggleRow = (id: string) => {
        setExpandedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
    };

    const handleToggleExpandAll = () => {
        if (expandedRows.length === filteredGroups.length) {
            setExpandedRows([]);
        } else {
            setExpandedRows(filteredGroups.map(g => g.id));
        }
    };
    
    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    const handleOpenViewMembers = (groupName: string) => {
        const groupData = mockGroupMemberData[groupName];
        if (groupData) {
            setViewingGroupData(groupData);
            setIsViewMembersModalOpen(true);
        } else {
            setViewingGroupData({
                id: uuidv4(), name: groupName, groupType: 'Generic',
                memberCategories: [{id: 'vms', name: 'Virtual Machines', count: 0, members: [], headers: ['Name']}]
            });
            setIsViewMembersModalOpen(true);
        }
    };

    const handleOpenWhereUsedModal = (group: FirewallGroup) => {
        setSelectedGroupForModal(group);
        setIsWhereUsedModalOpen(true);
    };

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <Button leftIconName="fas fa-plus">ADD GROUP</Button>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={handleToggleExpandAll}>
                            {expandedRows.length === filteredGroups.length ? 'COLLAPSE ALL' : 'EXPAND ALL'}
                        </Button>
                        <div className="w-72 relative">
                            <FormField
                                id="group-filter"
                                label=""
                                placeholder="Filter by Name, Path and more"
                                value={filterTerm}
                                onChange={(e) => setFilterTerm(e.target.value)}
                                wrapperClassName="!mb-0"
                                inputClassName="!pr-8"
                            />
                            <Icon name="fas fa-bars" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[40%]">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[15%]">
                                    <div className="flex items-center">Type <Tooltip text="Type of group"><Icon name="fas fa-info-circle" className="ml-1 text-gray-400" /></Tooltip></div>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[15%]">Compute Members</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[15%]">Where Used</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[15%]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredGroups.map(group => (
                                <React.Fragment key={group.id}>
                                    <tr>
                                        <td className="px-4 py-3 text-sm font-medium text-[#293c51] dark:text-gray-200">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1 text-gray-400">
                                                    <div className="relative" ref={openMenuId === group.id ? menuRef : null}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenMenuId(openMenuId === group.id ? null : group.id);
                                                            }}
                                                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-[#679a41]"
                                                        >
                                                            <Icon name="fas fa-ellipsis-v" className="cursor-pointer" />
                                                        </button>
                                                        {openMenuId === group.id && (
                                                            <div className="absolute left-0 mt-2 w-32 bg-white dark:bg-slate-700 rounded-md shadow-lg z-10 ring-1 ring-black ring-opacity-5 dark:ring-slate-600">
                                                                <ul className="py-1">
                                                                    <li><button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2"><Icon name="fas fa-pencil-alt" /> Edit</button></li>
                                                                    <li><button className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"><Icon name="fas fa-trash-alt" /> Delete</button></li>
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button onClick={() => handleToggleRow(group.id)}>
                                                        <Icon name={expandedRows.includes(group.id) ? "fas fa-chevron-down" : "fas fa-chevron-right"} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {group.isLocked && <Icon name="fas fa-lock" className="text-gray-500" title="Locked"/>}
                                                    <span>{group.name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{group.type}</td>
                                        <td className="px-4 py-3 text-sm"><Button variant="ghost" className="!p-0 !h-auto text-sky-500 hover:underline" onClick={() => handleOpenViewMembers(group.name)}>View Members</Button></td>
                                        <td className="px-4 py-3 text-sm"><Button variant="ghost" className="!p-0 !h-auto text-sky-500 hover:underline" onClick={() => handleOpenWhereUsedModal(group)}>Where Used</Button></td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                <Icon name="fas fa-check-circle" />
                                                <span className="font-semibold">Success</span>
                                                <Icon name="fas fa-sync-alt" className="text-[#679a41] dark:text-emerald-400 cursor-pointer" />
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedRows.includes(group.id) && (
                                        <tr className="bg-gray-50 dark:bg-slate-800/50">
                                            <td colSpan={5} className="p-4">
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <p className="font-semibold text-gray-600 dark:text-gray-300">Description</p>
                                                        <p>{group.description}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-600 dark:text-gray-300">Tags</p>
                                                        <p>{group.tags}</p>
                                                    </div>
                                                    <div>
                                                        <Button variant="ghost" className="!p-0 !h-auto text-sky-500 hover:underline" onClick={() => alert(`Viewing related groups for ${group.name}`)}>VIEW RELATED GROUPS</Button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center py-3 px-4">
                    <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                        <Icon name={`fas fa-sync-alt ${isRefreshing ? 'fa-spin' : ''}`} className="mr-2 text-sky-500" /> REFRESH
                    </Button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">1 - {filteredGroups.length} of {groups.length}</span>
                </div>
            </Card>

            <ViewMembersModal 
                isOpen={isViewMembersModalOpen}
                onClose={() => setIsViewMembersModalOpen(false)}
                groupData={viewingGroupData}
            />
            <WhereUsedModal
                isOpen={isWhereUsedModalOpen}
                onClose={() => setIsWhereUsedModalOpen(false)}
                group={selectedGroupForModal}
            />
        </>
    );
};
