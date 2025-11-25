import React, { useState, useMemo } from 'react';
import { Card, Button, FormField, Icon, Pagination, Modal } from '@/components/ui';
import { v4 as uuidv4 } from 'uuid';

interface Service {
  id: string;
  name: string;
  icon: string;
  protocol: 'TCP' | 'UDP' | 'Any';
  destinationPort: string;
  description: string;
  tags: number;
  whereUsedCount: number;
  status: 'Success';
}

const mockInitialServices: Service[] = [
  { id: '1', name: '66', icon: 'fas fa-cog', protocol: 'TCP', destinationPort: '66', description: 'Not Set', tags: 0, whereUsedCount: 1, status: 'Success' },
  { id: '2', name: '10', icon: 'fas fa-cog', protocol: 'TCP', destinationPort: '10', description: 'Service for port 10', tags: 2, whereUsedCount: 5, status: 'Success' },
  { id: '3', name: '5', icon: 'fas fa-cog', protocol: 'TCP', destinationPort: '5', description: 'Service for port 5', tags: 0, whereUsedCount: 3, status: 'Success' },
  { id: '4', name: '2341', icon: 'fas fa-cog', protocol: 'TCP', destinationPort: '2341', description: 'Service for port 2341', tags: 1, whereUsedCount: 0, status: 'Success' },
  { id: '5', name: '1212', icon: 'fas fa-cog', protocol: 'TCP', destinationPort: '1212', description: 'Service for port 1212', tags: 0, whereUsedCount: 1, status: 'Success' },
  { id: '6', name: '89', icon: 'fas fa-cog', protocol: 'TCP', destinationPort: '89', description: 'Service for port 89', tags: 0, whereUsedCount: 2, status: 'Success' },
  { id: '7', name: '2', icon: 'fas fa-cog', protocol: 'TCP', destinationPort: '2', description: 'Service for port 2', tags: 0, whereUsedCount: 8, status: 'Success' },
  { id: '8', name: '120', icon: 'fas fa-cog', protocol: 'TCP', destinationPort: '120', description: 'Service for port 120', tags: 3, whereUsedCount: 0, status: 'Success' },
  { id: '9', name: 'Active Directory Server', icon: 'fas fa-lock', protocol: 'TCP', destinationPort: '464', description: 'Kerberos password change', tags: 5, whereUsedCount: 12, status: 'Success' },
  { id: '10', name: 'Active Directory Server UDP', icon: 'fas fa-lock', protocol: 'UDP', destinationPort: '464', description: 'Kerberos password change (UDP)', tags: 5, whereUsedCount: 12, status: 'Success' },
  { id: '11', name: 'AD Server', icon: 'fas fa-lock', protocol: 'TCP', destinationPort: '1024', description: 'Active Directory Service', tags: 5, whereUsedCount: 10, status: 'Success' },
];

const AddServiceModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (service: Service) => void; }> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [protocol, setProtocol] = useState<'TCP' | 'UDP' | 'Any'>('TCP');
    const [port, setPort] = useState('');

    const handleSave = () => {
        if (!name || !port) {
            alert('Service Name and Port are required.');
            return;
        }
        onSave({
            id: uuidv4(),
            name,
            icon: 'fas fa-cog', // Default icon for new services
            protocol,
            destinationPort: port,
            description: 'Newly added service',
            tags: 0,
            whereUsedCount: 0,
            status: 'Success',
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Service" footer={
            <><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={handleSave}>Save</Button></>
        }>
            <div className="space-y-4">
                <FormField id="serviceName" label="Service Name" value={name} onChange={e => setName(e.target.value)} required />
                <FormField id="protocol" label="Protocol" as="select" value={protocol} onChange={e => setProtocol(e.target.value as any)}>
                    <option>TCP</option>
                    <option>UDP</option>
                    <option>Any</option>
                </FormField>
                <FormField id="port" label="Destination Port" value={port} onChange={e => setPort(e.target.value)} required placeholder="e.g., 80, 443, 1024-2048"/>
            </div>
        </Modal>
    );
};

const WhereUsedModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    service: Service | null;
}> = ({ isOpen, onClose, service }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    if (!service) return null;

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
    
    const references = service?.whereUsedCount > 0 ? mockReferences.slice(0, service.whereUsedCount) : [];
    const filteredReferences = useMemo(() => {
        if (!searchTerm) return references;
        const lowerSearch = searchTerm.toLowerCase();
        return references.filter(ref => 
            ref.serviceEntity.toLowerCase().includes(lowerSearch) ||
            ref.location.path.join(' ').toLowerCase().includes(lowerSearch) ||
            ref.location.target.toLowerCase().includes(lowerSearch)
        );
    }, [references, searchTerm]);
    
    if (!service) return null;

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
                <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700 -mt-4">
                    <h3 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">
                        Where Used | {service.name}
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="w-64">
                             <FormField
                                id="where-used-search"
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

                {/* Content */}
                <div className="flex-grow mt-4 border rounded-md dark:border-gray-700 flex flex-col overflow-y-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-1/2">Service/Entity</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-1/2">Location</th>
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

export const ServicesPage: React.FC = () => {
    const [services, setServices] = useState<Service[]>(mockInitialServices);
    const [filterTerm, setFilterTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isWhereUsedModalOpen, setIsWhereUsedModalOpen] = useState(false);
    const [selectedServiceForModal, setSelectedServiceForModal] = useState<Service | null>(null);

    const filteredServices = useMemo(() => {
        if (!filterTerm) return services;
        return services.filter(s => s.name.toLowerCase().includes(filterTerm.toLowerCase()));
    }, [services, filterTerm]);

    const paginatedServices = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return filteredServices.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredServices, currentPage, rowsPerPage]);
    
    const handleOpenWhereUsedModal = (service: Service) => {
        setSelectedServiceForModal(service);
        setIsWhereUsedModalOpen(true);
    };
    
    const handleAddService = (service: Service) => {
        setServices(prev => [service, ...prev]);
    };
    
    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <Button onClick={() => setIsAddModalOpen(true)}>ADD SERVICE</Button>
                     <div className="w-72 relative">
                        <FormField
                            id="service-filter"
                            label=""
                            placeholder="Filter by Name, Path and more"
                            value={filterTerm}
                            onChange={(e) => setFilterTerm(e.target.value)}
                            wrapperClassName="!mb-0"
                        />
                        <Icon name="fas fa-bars" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[30%]">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[30%]">Service Entries</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[15%]">Where Used</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-[25%]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                            {paginatedServices.map(service => (
                                <tr key={service.id}>
                                    <td className="px-4 py-3 text-sm font-medium text-[#293c51] dark:text-gray-200">{service.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{service.protocol} (Dest: {service.destinationPort})</td>
                                    <td className="px-4 py-3 text-sm">
                                        <button onClick={() => handleOpenWhereUsedModal(service)} className="text-sky-500 hover:underline">Where Used</button>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                            <Icon name="fas fa-check-circle" />
                                            <span className="font-semibold">{service.status}</span>
                                            <Icon name="fas fa-sync-alt" className="text-sky-500 cursor-pointer" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredServices.length}
                    itemsPerPage={rowsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setRowsPerPage}
                    className="border-t-0 pt-4"
                />
            </Card>
            <AddServiceModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddService} />
            <WhereUsedModal 
                isOpen={isWhereUsedModalOpen}
                onClose={() => setIsWhereUsedModalOpen(false)}
                service={selectedServiceForModal}
            />
        </>
    );
};
