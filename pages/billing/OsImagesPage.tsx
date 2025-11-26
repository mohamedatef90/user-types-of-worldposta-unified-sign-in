
import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Icon, Button, FormField } from '@/components/ui';

interface OsImage {
  id: string;
  name: string;
  icon: string;
  iconClasses?: string;
  versions: string[];
  selectedVersion: string;
}

const osImagesData: OsImage[] = [
    {
      id: 'win-server', name: 'Windows Server', icon: 'fab fa-windows', iconClasses: 'text-blue-500',
      versions: ['2022 Datacenter', '2019 Datacenter', '2016 Standard'], selectedVersion: '2022 Datacenter'
    },
    {
      id: 'ubuntu', name: 'Ubuntu Server', icon: 'fab fa-ubuntu', iconClasses: 'text-orange-500',
      versions: ['24.04 LTS', '22.04 LTS', '20.04 LTS'], selectedVersion: '24.04 LTS'
    },
    {
      id: 'rhel', name: 'Red Hat Enterprise Linux', icon: 'fab fa-redhat', iconClasses: 'text-red-600',
      versions: ['9', '8', '7'], selectedVersion: '9'
    },
    {
      id: 'centos', name: 'CentOS Stream', icon: 'fab fa-centos', iconClasses: 'text-purple-600',
      versions: ['9', '8'], selectedVersion: '9'
    },
    {
      id: 'debian', name: 'Debian', icon: 'fab fa-debian', iconClasses: 'text-red-500',
      versions: ['12 (Bookworm)', '11 (Bullseye)'], selectedVersion: '12 (Bookworm)'
    },
    {
      id: 'fedora', name: 'Fedora Server', icon: 'fab fa-fedora', iconClasses: 'text-blue-700',
      versions: ['40', '39'], selectedVersion: '40'
    },
    {
      id: 'almalinux', name: 'AlmaLinux', icon: 'fab fa-linux', iconClasses: 'text-green-600',
      versions: ['9', '8'], selectedVersion: '9'
    },
    {
      id: 'rocky', name: 'Rocky Linux', icon: 'fab fa-linux', iconClasses: 'text-teal-600',
      versions: ['9', '8'], selectedVersion: '9'
    },
    {
      id: 'sles', name: 'SUSE Linux Enterprise', icon: 'fab fa-suse', iconClasses: 'text-green-500',
      versions: ['15 SP6', '15 SP5'], selectedVersion: '15 SP6'
    },
    {
      id: 'freebsd', name: 'FreeBSD', icon: 'fab fa-freebsd', iconClasses: 'text-red-700',
      versions: ['14.1', '13.3'], selectedVersion: '14.1'
    },
    {
      id: 'oracle', name: 'Oracle Linux', icon: 'fab fa-linux', iconClasses: 'text-red-800',
      versions: ['9', '8'], selectedVersion: '9'
    },
    {
      id: 'arch', name: 'Arch Linux', icon: 'fab fa-linux', iconClasses: 'text-sky-600',
      versions: ['Latest'], selectedVersion: 'Latest'
    },
    {
      id: 'alpine', name: 'Alpine Linux', icon: 'fab fa-linux', iconClasses: 'text-blue-900',
      versions: ['3.20', '3.19'], selectedVersion: '3.20'
    },
    {
      id: 'kali', name: 'Kali Linux', icon: 'fab fa-linux', iconClasses: 'text-black dark:text-white',
      versions: ['2024.2', '2024.1'], selectedVersion: '2024.1'
    },
    {
      id: 'pfsense', name: 'pfSense', icon: 'fas fa-shield-alt', iconClasses: 'text-red-700',
      versions: ['Plus 24.03', 'CE 2.7.2'], selectedVersion: 'Plus 24.03'
    },
    {
      id: 'truenas', name: 'TrueNAS CORE', icon: 'fas fa-server', iconClasses: 'text-blue-800',
      versions: ['13.0-U6.1', '13.0-U5.3'], selectedVersion: '13.0-U6.1'
    },
    {
      id: 'photon', name: 'VMware Photon OS', icon: 'fas fa-compact-disc', iconClasses: 'text-indigo-600',
      versions: ['5.0', '4.0'], selectedVersion: '5.0'
    },
    {
      id: 'cloudlinux', name: 'CloudLinux OS', icon: 'fab fa-linux', iconClasses: 'text-green-700',
      versions: ['9', '8'], selectedVersion: '9'
    },
    {
      id: 'openmediavault', name: 'OpenMediaVault', icon: 'fas fa-hdd', iconClasses: 'text-gray-600',
      versions: ['7 (Sandworm)', '6 (Shaitan)'], selectedVersion: '7 (Sandworm)'
    },
    {
      id: 'vyos', name: 'VyOS', icon: 'fas fa-network-wired', iconClasses: 'text-purple-700',
      versions: ['1.4 (Sagitta)', '1.3 (Equuleus)'], selectedVersion: '1.4 (Sagitta)'
    }
];

export const OsImagesPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { configId } = location.state || {};
    const [osImages, setOsImages] = useState<OsImage[]>(osImagesData);

    const returnPath = useMemo(() => (
        configId 
        ? `/app/billing/cloudedge-configurations/edit/${configId}`
        : '/app/billing/cloudedge-configurations/add'
    ), [configId]);

    const handleSelectImage = (image: OsImage) => {
        const selectedBlueprint = `${image.name} ${image.selectedVersion}`;
        navigate(returnPath, { 
            state: { 
                selectedOs: { id: image.id, name: selectedBlueprint } 
            },
            replace: true 
        });
    };

    const handleVersionChange = (imageId: string, event: React.ChangeEvent<HTMLSelectElement>) => {
        event.stopPropagation();
        const selectedVersion = event.target.value;
        setOsImages(currentImages =>
            currentImages.map(img =>
                img.id === imageId ? { ...img, selectedVersion } : img
            )
        );
    };

    const OsTabContent = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {osImages.map(image => (
                <div key={image.id} onClick={() => handleSelectImage(image)} className="group border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm hover:shadow-md hover:border-[#679a41] dark:hover:border-emerald-400 transition-all duration-300 flex flex-col cursor-pointer">
                    <div className="h-32 flex items-center justify-center p-4 bg-gray-50 dark:bg-slate-800/50 rounded-t-lg">
                        <Icon name={image.icon} className={`${image.iconClasses || ''} text-6xl`} />
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                        <h3 className="font-bold text-md text-[#293c51] dark:text-gray-200 group-hover:text-[#679a41] dark:group-hover:text-emerald-400 transition-colors">{image.name}</h3>
                        <div className="mt-4 flex-grow">
                            <FormField 
                                id={`${image.id}-version`}
                                label="Version"
                                as="select"
                                value={image.selectedVersion}
                                onChange={(e) => handleVersionChange(image.id, e as any)}
                                onClick={(e: any) => e.stopPropagation()}
                                inputClassName="text-sm"
                                wrapperClassName="!mb-0"
                            >
                                {image.versions.map(version => <option key={version} value={version}>{version}</option>)}
                            </FormField>
                        </div>
                        <div className="mt-4">
                            <Button fullWidth>Select</Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold text-[#293c51] dark:text-gray-200">Select an OS Image</h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Choose a starting point for your new virtual machine.</p>
                </div>
                <Button variant="outline" onClick={() => navigate(returnPath)} leftIconName="fas fa-arrow-left">Back to Configuration</Button>
            </div>

            <div className="border-b border-gray-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors border-[#679a41] dark:border-emerald-400 text-[#679a41] dark:text-emerald-400`}
                    >
                        OS Images
                    </button>
                </nav>
            </div>

            <OsTabContent />
        </div>
    );
};
