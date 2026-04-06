
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button, Card, FormField, CollapsibleSection, SliderInput, Icon } from '@/components/ui';
import type { CloudEdgeConfiguration, InstanceTemplate, GPUType, CloudEdgeComponentType, MachineType, ProvisioningModel, SubscriptionTermUnit } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';

const CONFIG_STORAGE_KEY = 'cloudEdgeConfigurations';

// --- MOCK DATA & HELPERS (moved from original page) ---

const mockRegions = [
    { id: 'eu-central-1', name: 'EU (Frankfurt)' },
    { id: 'us-east-1', name: 'US East (N. Virginia)' },
    { id: 'us-west-2', name: 'US West (Oregon)' },
];

const mockInstanceTemplates: InstanceTemplate[] = [
  { id: 'ce-s1', name: 'WP Instance Small (CE-S1)', cpu: 2, ramGB: 4, bootDiskGB: 50, priceMonthly: 20, description: '2 vCPU / 4 GB RAM / 50 GB Boot Disk' },
  { id: 'ce-m1', name: 'WP Instance Medium (CE-M1)', cpu: 4, ramGB: 8, bootDiskGB: 100, priceMonthly: 40, description: '4 vCPU / 8 GB RAM / 100 GB Boot Disk' },
  { id: 'ce-l1', name: 'WP Instance Large (CE-L1)', cpu: 8, ramGB: 16, bootDiskGB: 200, priceMonthly: 80, description: '8 vCPU / 16 GB RAM / 200 GB Boot Disk' },
];

const mockGPUTypes: GPUType[] = [
  { id: 'gpu-h100s', name: 'GPU Shared H100', priceMonthly: 150 },
  { id: 'gpu-h100d', name: 'GPU Dedicated H100', priceMonthly: 400 },
];

const mockOSSoftware = [
    {id: 'ubuntu-22', name: 'Ubuntu 22.04 LTS'},
    {id: 'centos-9', name: 'CentOS Stream 9'},
    {id: 'windows-2022-std', name: 'Windows Server 2022 Standard'},
    {id: 'rocky-9', name: 'Rocky Linux 9'},
];

const topOsChoices = [
    { id: 'ubuntu-22', name: 'Ubuntu 22.04 LTS' },
    { id: 'windows-2022-std', name: 'Windows Server 2022 Standard' },
    { id: 'centos-9', name: 'CentOS Stream 9' },
];


interface ReadyPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  specs: { cpu: number; ramGB: number; storageGB: number; storageType: string; }
}

const mockReadyPlans: ReadyPlan[] = [
    { id: 'rp-dev', name: 'Developer Sandbox', description: 'A small, cost-effective environment for testing and development.', priceMonthly: 15, specs: { cpu: 1, ramGB: 2, storageGB: 40, storageType: 'Balanced SSD' } },
    { id: 'rp-web', name: 'General Web Server', description: 'A balanced configuration suitable for hosting most websites and web applications.', priceMonthly: 50, specs: { cpu: 4, ramGB: 8, storageGB: 100, storageType: 'Balanced SSD' } },
    { id: 'rp-db', name: 'Database Server', description: 'High memory and performance storage for demanding database workloads.', priceMonthly: 120, specs: { cpu: 4, ramGB: 32, storageGB: 200, storageType: 'Performance SSD' } },
];

const PRICE_CPU_CORE_MONTHLY = 10;
const PRICE_RAM_GB_MONTHLY = 5;
const PRICE_FLASH_GB_MONTHLY = 0.10;
const PRICE_STATIC_IP_MONTHLY = 4;
const PRICE_OBJECT_STORAGE_GB_MONTHLY = 0.02;
const PRICE_ADVANCED_BACKUP_GB_MONTHLY = 0.05;
const PRICE_TREND_MICRO_ENDPOINT_MONTHLY = 5;
const PRICE_WINDOWS_LICENSE_MONTHLY = 20;
const PRICE_LINUX_LICENSE_MONTHLY = 10;
const PRICE_CORTEX_XDR_ENDPOINT_MONTHLY = 8;
const PRICE_LOAD_BALANCER_INSTANCE_MONTHLY = 18;
const PRICE_ADVANCED_FIREWALL_MONTHLY = 25;
const PRICE_ENHANCED_MONITORING_MONTHLY = 10;

const calculateCloudEdgeSubtotal = (config: Partial<CloudEdgeConfiguration>): number => {
    let subtotal = 0;
    if (config.type === 'instance' && config.instanceTemplateId && config.quantity) {
        const template = mockInstanceTemplates.find(t => t.id === config.instanceTemplateId);
        if (template) subtotal += template.priceMonthly * config.quantity;
    } else if (config.type === 'vdc' && config.quantity) {
        if (config.vdcCPU) subtotal += config.vdcCPU * PRICE_CPU_CORE_MONTHLY * config.quantity;
        if (config.vdcRAM) subtotal += config.vdcRAM * PRICE_RAM_GB_MONTHLY * config.quantity;
        if (config.vdcFlashStorage) subtotal += config.vdcFlashStorage * PRICE_FLASH_GB_MONTHLY * config.quantity;
    }
    if (config.addGPUs && config.gpuType && config.gpuCount) {
        const gpu = mockGPUTypes.find(g => g.id === config.gpuType);
        if (gpu) subtotal += gpu.priceMonthly * config.gpuCount * (config.quantity || 1);
    }
    const qtyMultiplier = config.type === 'instance' ? (config.quantity || 1) : 1;
    if(config.staticPublicIPs) subtotal += config.staticPublicIPs * PRICE_STATIC_IP_MONTHLY * (config.type === 'vdc' ? 1 : qtyMultiplier);
    if(config.objectStorageGB) subtotal += config.objectStorageGB * PRICE_OBJECT_STORAGE_GB_MONTHLY;
    if(config.advancedBackupGB) subtotal += config.advancedBackupGB * PRICE_ADVANCED_BACKUP_GB_MONTHLY;
    if(config.trendMicroEndpoints) subtotal += config.trendMicroEndpoints * PRICE_TREND_MICRO_ENDPOINT_MONTHLY * qtyMultiplier;
    if(config.windowsServerLicenses) subtotal += config.windowsServerLicenses * PRICE_WINDOWS_LICENSE_MONTHLY * qtyMultiplier;
    if(config.linuxEnterpriseLicenses) subtotal += config.linuxEnterpriseLicenses * PRICE_LINUX_LICENSE_MONTHLY * qtyMultiplier;
    if(config.cortexXDREndpoints) subtotal += config.cortexXDREndpoints * PRICE_CORTEX_XDR_ENDPOINT_MONTHLY * qtyMultiplier;
    if(config.loadBalancerInstances) subtotal += config.loadBalancerInstances * PRICE_LOAD_BALANCER_INSTANCE_MONTHLY;
    if (config.advancedFirewall) subtotal += PRICE_ADVANCED_FIREWALL_MONTHLY * (config.type === 'vdc' ? 1 : qtyMultiplier) ;
    if (config.enhancedMonitoring) subtotal += PRICE_ENHANCED_MONITORING_MONTHLY * (config.type === 'vdc' ? 1 : qtyMultiplier);
    if (config.provisioningModel === 'spot') subtotal *= 0.30;
    return subtotal;
};

const ReadyPlanCard: React.FC<{ plan: ReadyPlan, isSelected: boolean, onSelect: () => void }> = ({ plan, isSelected, onSelect }) => (
    <button onClick={onSelect} className={`text-left border-2 rounded-lg p-4 transition-all h-full flex flex-col ${isSelected ? 'border-[#679a41] ring-2 ring-[#679a41]/50 bg-green-50 dark:bg-emerald-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
        <h4 className="font-bold text-[#293c51] dark:text-gray-100">{plan.name}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 flex-grow">{plan.description}</p>
        <div className="mt-2 pt-2 border-t border-dashed dark:border-gray-700">
            <p className="text-sm font-semibold text-[#679a41] dark:text-emerald-400">${plan.priceMonthly.toFixed(2)}<span className="text-xs font-normal text-gray-500 dark:text-gray-400">/mo</span></p>
        </div>
    </button>
);

const RadioCard = ({ id, name, value, checked, onChange, label, iconName, tooltipText, showTooltip = true }: { id: string, name: string, value: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label: string, iconName: string, tooltipText: string, showTooltip?: boolean}) => (
    <div className="h-full">
        <label htmlFor={id} className={`relative block p-4 border-2 rounded-lg cursor-pointer transition-all h-full flex items-center justify-center text-center ${checked ? 'border-[#679a41] ring-2 ring-[#679a41]/50 bg-green-50 dark:bg-emerald-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
            <input type="radio" id={id} name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
            <div className="flex items-center justify-center gap-2">
                <Icon name={iconName} className="text-2xl text-[#679a41] dark:text-emerald-400" />
                <span className="font-semibold text-sm text-[#293c51] dark:text-gray-200">{label}</span>
                {showTooltip && (
                     <div className="group relative flex items-center">
                        <Icon name="fas fa-info-circle" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 dark:bg-black rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                            {tooltipText}
                        </div>
                    </div>
                )}
            </div>
        </label>
    </div>
);

// --- MAIN PAGE COMPONENT ---

export const AddCloudEdgeConfigurationPage: React.FC = () => {
    const navigate = useNavigate();
    const { configId } = useParams<{ configId: string }>();
    const location = useLocation();
    const isEditing = !!configId;

    const [config, setConfig] = useState<Partial<CloudEdgeConfiguration>>({
        type: 'instance',
        quantity: 1,
        subscriptionTermValue: 1,
        subscriptionTermUnit: 'month',
        deploymentRegion: 'eu-central-1', // Default region
        provisioningModel: 'regular',
        machineType: 'performance-01',
    });
    const [currentSubtotal, setCurrentSubtotal] = useState(0);
    const [pageStep, setPageStep] = useState(1);
    const [individualNames, setIndividualNames] = useState<string[]>([]);
    const [isAdvancedSectionOpen, setIsAdvancedSectionOpen] = useState(false);

    useEffect(() => {
        if (isEditing) {
            const savedConfigs = localStorage.getItem(CONFIG_STORAGE_KEY);
            if (savedConfigs) {
                const configs: CloudEdgeConfiguration[] = JSON.parse(savedConfigs);
                const configToEdit = configs.find(c => c.id === configId);
                if (configToEdit) {
                    setConfig(configToEdit);
                } else {
                    alert('Configuration not found.');
                    navigate('/app/billing/cloudedge-configurations');
                }
            }
        } else {
            // Reset for 'add' mode
            setConfig({
                type: 'instance',
                quantity: 1,
                subscriptionTermValue: 1,
                subscriptionTermUnit: 'month',
                deploymentRegion: 'eu-central-1',
                provisioningModel: 'regular',
                machineType: 'performance-01',
            });
        }
    }, [configId, isEditing, navigate]);

    useEffect(() => {
        if (location.state?.selectedOs) {
            setConfig(prev => ({ ...prev, osSoftware: location.state.selectedOs.id }));
            setIsAdvancedSectionOpen(true);
            const currentPath = configId ? `/app/billing/cloudedge-configurations/edit/${configId}` : '/app/billing/cloudedge-configurations/add';
            navigate(currentPath, { replace: true, state: {} });
        }
    }, [location.state, navigate, configId]);

    useEffect(() => {
        let subtotal = 0;
        if (config.type === 'ready-plan') {
            const plan = mockReadyPlans.find(p => p.id === config.readyPlanId);
            if (plan) subtotal = plan.priceMonthly;
        } else {
            subtotal = calculateCloudEdgeSubtotal({ ...config, quantity: 1 });
        }
        setCurrentSubtotal(subtotal);
    }, [config]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        const newConfig = { ...config };
        (newConfig as any)[name] = type === 'checkbox' ? checked : (e.target as HTMLInputElement).type === 'number' ? parseFloat(value) || 0 : value;

        if(name === 'type') {
            newConfig.instanceTemplateId = undefined;
            newConfig.vdcCPU = undefined;
            newConfig.vdcRAM = undefined;
            newConfig.vdcFlashStorage = undefined;
            newConfig.readyPlanId = undefined;
        }
        setConfig(newConfig);
    };

    const handleOsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'see-all') {
            navigate('/app/billing/cloudedge-configurations/os-images', { state: { configId } });
        } else {
            setConfig(prev => ({ ...prev, osSoftware: value }));
        }
    };

    const handleReadyPlanSelect = (plan: ReadyPlan) => {
        setConfig(prev => ({ ...prev, instanceTemplateId: undefined, vdcCPU: undefined, readyPlanId: plan.id, name: prev.name || plan.name }));
    };
    
    const handleSliderChange = (name: keyof CloudEdgeConfiguration, value: number) => {
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveConfiguration = (configToSave: CloudEdgeConfiguration) => {
        const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
        const configs: CloudEdgeConfiguration[] = saved ? JSON.parse(saved) : [];
        const existingIndex = configs.findIndex(c => c.id === configToSave.id);
        if (existingIndex > -1) {
            configs[existingIndex] = configToSave;
        } else {
            configs.push(configToSave);
        }
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configs));
    };
    
    const handleSaveMultipleConfigurations = (configsToSave: CloudEdgeConfiguration[]) => {
        const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
        const configs: CloudEdgeConfiguration[] = saved ? JSON.parse(saved) : [];
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify([...configs, ...configsToSave]));
    };

    const handleSubmit = () => {
        if (!config.name || !config.type || !config.deploymentRegion || (config.quantity || 0) < 1 || (config.subscriptionTermValue || 0) < 1) {
            alert("Please fill all required fields: Name, Type, Region, Subscription Term, and Quantity.");
            return;
        }
        if (config.type === 'ready-plan' && !config.readyPlanId) {
            alert("Please select a Ready Plan.");
            return;
        }

        const quantity = config.quantity || 1;
        if (quantity > 1 && !isEditing) {
            setIndividualNames(Array.from({ length: quantity }, (_, i) => `${config.name || 'Config'}-${i + 1}`));
            setPageStep(2);
        } else {
            const finalConfig: CloudEdgeConfiguration = {
                id: configId || uuidv4(),
                ...config,
                name: config.name || 'Unnamed Config',
                type: config.type || 'instance',
                deploymentRegion: config.deploymentRegion || mockRegions[0].id,
                subscriptionTermValue: config.subscriptionTermValue || 1,
                subscriptionTermUnit: config.subscriptionTermUnit || 'month',
                quantity: config.quantity || 1,
                unitSubtotalMonthly: currentSubtotal * (config.quantity || 1),
            };
            handleSaveConfiguration(finalConfig);
            navigate('/app/billing/cloudedge-configurations');
        }
    };
    
    const handleIndividualNameChange = (index: number, newName: string) => {
        setIndividualNames(prev => {
            const updated = [...prev];
            updated[index] = newName;
            return updated;
        });
    };

    const handleFinalSubmit = () => {
        if (individualNames.some(name => name.trim() === '')) {
            alert("Configuration names cannot be empty.");
            return;
        }
        
        const newConfigs: CloudEdgeConfiguration[] = individualNames.map(name => ({
            id: uuidv4(),
            ...(config as Omit<CloudEdgeConfiguration, 'id' | 'name' | 'quantity' | 'unitSubtotalMonthly'>),
            name: name,
            quantity: 1,
            unitSubtotalMonthly: currentSubtotal,
        }));
        handleSaveMultipleConfigurations(newConfigs);
        navigate('/app/billing/cloudedge-configurations');
    };

    const selectedTemplate = useMemo(() => {
        if (config.type === 'instance' && config.instanceTemplateId) {
            return mockInstanceTemplates.find(t => t.id === config.instanceTemplateId);
        }
        return null;
    }, [config.type, config.instanceTemplateId]);

    const isOsInTopChoices = useMemo(() => {
        return topOsChoices.some(os => os.id === config.osSoftware);
    }, [config.osSoftware]);

    const selectedOsName = useMemo(() => {
        if (!config.osSoftware) return '';
        const allOsOptions = [...mockOSSoftware, ...topOsChoices];
        const choice = allOsOptions.find(os => os.id === config.osSoftware);
        return choice ? choice.name : config.osSoftware;
    }, [config.osSoftware]);


  return (
    <Card>
        {pageStep === 1 && (
            <form onSubmit={e => {e.preventDefault(); handleSubmit();}}>
                <div className="space-y-6">
                    <div className="flex justify-between items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">
                            {isEditing ? "Edit CloudEdge Configuration" : "Add New CloudEdge Configuration"}
                        </h3>
                        <div className="w-64">
                            <FormField id="deploymentRegion" name="deploymentRegion" label="Deployment Region" as="select" value={config.deploymentRegion || ""} onChange={handleChange} required wrapperClassName="!mb-0">
                                {mockRegions.map(r => (<option key={r.id} value={r.id} disabled={r.id !== 'eu-central-1'}>{r.name}</option>))}
                            </FormField>
                        </div>
                    </div>

                    <fieldset><legend className="block text-sm font-medium mb-2 text-[#293c51] dark:text-gray-300">Configuration Type</legend>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <RadioCard id="type-instance" name="type" value="instance" checked={config.type === 'instance'} onChange={handleChange} label="Instances" iconName="fas fa-server" tooltipText="Deploy one or more pre-defined virtual machine instances." />
                            <RadioCard id="type-vdc" name="type" value="vdc" checked={config.type === 'vdc'} onChange={handleChange} label="VDC" iconName="fas fa-cloud" tooltipText="Create a Virtual Data Center with a custom pool of resources (CPU, RAM, Storage)." />
                            <RadioCard id="type-ready-plan" name="type" value="ready-plan" checked={config.type === 'ready-plan'} onChange={handleChange} label="Ready Plans" iconName="fas fa-bolt" tooltipText="" showTooltip={false} />
                        </div>
                    </fieldset>

                    <div className="text-center mt-2 text-sm">
                        <a href="#" onClick={(e) => { e.preventDefault(); alert('Helpful information about the differences between Instances, VDCs, and Ready Plans would be displayed here.'); }} className="text-[#679a41] dark:text-emerald-400 hover:underline">
                            Click here to know the difference between types
                        </a>
                    </div>

                    <FormField id="configName" name="name" label="Configuration Name" value={config.name || ''} onChange={handleChange} placeholder="e.g., My Web Server Cluster" required />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField id="subscriptionTermValue" name="subscriptionTermValue" label="Subscription Term" type="number" value={config.subscriptionTermValue || 1} onChange={handleChange} min={1} required />
                        <FormField id="subscriptionTermUnit" name="subscriptionTermUnit" label="Duration" as="select" value={config.subscriptionTermUnit || 'month'} onChange={handleChange}>
                            <option value="hr">Hour(s)</option><option value="week">Week(s)</option><option value="month">Month(s)</option><option value="year">Year(s)</option>
                        </FormField>
                        <FormField id="quantity" name="quantity" label="Quantity" type="number" value={config.quantity || 1} onChange={handleChange} min={1} required disabled={isEditing} />
                    </div>
                    
                    {config.type === 'instance' && (
                        <FormField id="machineType" name="machineType" label="Infra type" as="select" value={config.machineType || 'performance-01'} onChange={handleChange}>
                            <option value="performance-01">Performance 01</option><option value="performance-02">Performance 02</option><option value="performance-03">Performance 03</option>
                        </FormField>
                    )}

                    {config.type === 'instance' && (
                    <>
                        <FormField id="instanceTemplateId" name="instanceTemplateId" label="Instance Template" as="select" value={config.instanceTemplateId || ''} onChange={handleChange} required={config.type === 'instance'}>
                            <option value="">Select a template...</option>
                            {mockInstanceTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </FormField>
                        {selectedTemplate && <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">Template provides: {selectedTemplate.description}</p>}
                    </>
                    )}
                    
                    {config.type === 'vdc' && (
                    <>
                        <FormField id="machineType" name="machineType" label="Infra type" as="select" value={config.machineType || 'performance-01'} onChange={handleChange}>
                            <option value="performance-01">Performance 01</option><option value="performance-02">Performance 02</option><option value="performance-03">Performance 03</option>
                        </FormField>
                        <CollapsibleSection title="Core Compute Resources (VDC)" initialOpen={true}>
                            <SliderInput id="vdcCPU" label="CPU Cores" value={config.vdcCPU || 2} onChange={(v) => handleSliderChange('vdcCPU',v)} min={2} max={64} step={1} unit="Cores" pricePerUnit={PRICE_CPU_CORE_MONTHLY}/>
                            <SliderInput id="vdcRAM" label="RAM" value={config.vdcRAM || 4} onChange={(v) => handleSliderChange('vdcRAM',v)} min={4} max={256} step={1} unit="GB" pricePerUnit={PRICE_RAM_GB_MONTHLY}/>
                            <SliderInput id="vdcFlashStorage" label="Flash Disk Storage" value={config.vdcFlashStorage || 50} onChange={(v) => handleSliderChange('vdcFlashStorage',v)} min={50} max={10000} step={10} unit="GB" pricePerUnit={PRICE_FLASH_GB_MONTHLY}/>
                        </CollapsibleSection>
                    </>
                    )}

                    {config.type === 'ready-plan' && (
                        <>
                            <FormField id="machineType" name="machineType" label="Infra type" as="select" value={config.machineType || 'performance-01'} onChange={handleChange}>
                                <option value="performance-01">Performance 01</option><option value="performance-02">Performance 02</option><option value="performance-03">Performance 03</option>
                            </FormField>
                            <div className="mt-4"><h4 className="font-medium mb-2 text-[#293c51] dark:text-gray-200">Select a Ready Plan</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {mockReadyPlans.map(plan => <ReadyPlanCard key={plan.id} plan={plan} isSelected={config.readyPlanId === plan.id} onSelect={() => handleReadyPlanSelect(plan)} />)}
                                </div>
                            </div>
                        </>
                    )}
                    
                    {config.type !== 'ready-plan' && (
                        <>
                            <CollapsibleSection 
                                title="Advanced Settings & Optional Resources"
                                isOpen={isAdvancedSectionOpen}
                                onToggle={() => setIsAdvancedSectionOpen(prev => !prev)}
                            >
                                <div className="mb-4">
                                    <FormField
                                        id="osSoftware"
                                        name="osSoftware"
                                        label="Operating System / Software"
                                        as="select"
                                        value={config.osSoftware || ''}
                                        onChange={handleOsChange}
                                    >
                                        <option value="">Default (based on template or VDC policy)</option>
                                        {topOsChoices.map(os => (
                                            <option key={os.id} value={os.id}>{os.name}</option>
                                        ))}
                                        {!isOsInTopChoices && config.osSoftware && (
                                            <option value={config.osSoftware}>{selectedOsName}</option>
                                        )}
                                        <option value="see-all">See more choices...</option>
                                    </FormField>
                                    <div className="text-left mt-1">
                                        <Link to="/app/billing/cloudedge-configurations/os-images" state={{ configId }} className="text-sm text-[#679a41] dark:text-emerald-400 hover:underline">
                                            See all images
                                        </Link>
                                    </div>
                                </div>
                                <FormField id="provisioningModel" name="provisioningModel" label="Provisioning Model" as="select" value={config.provisioningModel || 'regular'} onChange={handleChange}>
                                    <option value="regular">Regular (On-demand)</option><option value="spot">Spot/Preemptible (Up to 70% Disc.)</option>
                                </FormField>
                                <FormField type="checkbox" id="confidentialVM" name="confidentialVM" label="Enable Confidential VM Service" checked={!!config.confidentialVM} onChange={handleChange} hint="Note: Compatibility and pricing vary."/>
                                <FormField type="checkbox" id="addGPUs" name="addGPUs" label="Add GPUs" checked={!!config.addGPUs} onChange={handleChange} />
                                {config.addGPUs && (
                                    <div className="pl-4 border-l-2 dark:border-slate-600">
                                        <FormField id="gpuType" name="gpuType" label="GPU Type" as="select" value={config.gpuType || ''} onChange={handleChange}>
                                            <option value="">Select GPU Type...</option>{mockGPUTypes.map(gpu => <option key={gpu.id} value={gpu.id}>{gpu.name} (+${gpu.priceMonthly}/mo)</option>)}
                                        </FormField>
                                        <FormField id="gpuCount" name="gpuCount" label="GPU Count" type="number" value={config.gpuCount || 1} onChange={handleChange} min={1} />
                                    </div>
                                )}
                            </CollapsibleSection>
                            
                            <CollapsibleSection title="Other Configurable Resources">
                                <SliderInput id="staticPublicIPs" label="Static Public IPs" value={config.staticPublicIPs || 0} onChange={(v) => handleSliderChange('staticPublicIPs',v)} min={0} max={10} step={1} pricePerUnit={PRICE_STATIC_IP_MONTHLY} unit="IPs"/>
                                <SliderInput id="objectStorageGB" label="Object Storage" value={config.objectStorageGB || 0} onChange={(v) => handleSliderChange('objectStorageGB',v)} min={0} max={10000} step={100} pricePerUnit={PRICE_OBJECT_STORAGE_GB_MONTHLY} unit="GB"/>
                                <SliderInput id="advancedBackupGB" label="Advanced Backup by Veeam (Protected)" value={config.advancedBackupGB || 0} onChange={(v) => handleSliderChange('advancedBackupGB',v)} min={0} max={10000} step={100} pricePerUnit={PRICE_ADVANCED_BACKUP_GB_MONTHLY} unit="GB"/>
                                <SliderInput id="trendMicroEndpoints" label="Trend Micro Deep Security" value={config.trendMicroEndpoints || 0} onChange={(v) => handleSliderChange('trendMicroEndpoints',v)} min={0} max={100} step={1} pricePerUnit={PRICE_TREND_MICRO_ENDPOINT_MONTHLY} unit="Endpoints"/>
                                <SliderInput id="windowsServerLicenses" label="Windows Server Licenses (Add-on)" value={config.windowsServerLicenses || 0} onChange={(v) => handleSliderChange('windowsServerLicenses',v)} min={0} max={100} step={1} pricePerUnit={PRICE_WINDOWS_LICENSE_MONTHLY} unit="Licenses"/>
                                <SliderInput id="linuxEnterpriseLicenses" label="Linux Enterprise Licenses (Add-on)" value={config.linuxEnterpriseLicenses || 0} onChange={(v) => handleSliderChange('linuxEnterpriseLicenses',v)} min={0} max={100} step={1} pricePerUnit={PRICE_LINUX_LICENSE_MONTHLY} unit="Licenses"/>
                                <SliderInput id="cortexXDREndpoints" label="Cortex XDR Endpoint Protection" value={config.cortexXDREndpoints || 0} onChange={(v) => handleSliderChange('cortexXDREndpoints',v)} min={0} max={100} step={1} pricePerUnit={PRICE_CORTEX_XDR_ENDPOINT_MONTHLY} unit="Endpoints"/>
                                <SliderInput id="loadBalancerInstances" label="Load Balancer Instances" value={config.loadBalancerInstances || 0} onChange={(v) => handleSliderChange('loadBalancerInstances',v)} min={0} max={5} step={1} pricePerUnit={PRICE_LOAD_BALANCER_INSTANCE_MONTHLY} unit="Instances"/>
                            </CollapsibleSection>

                            <CollapsibleSection title="Add-ons (Monthly)">
                                <FormField type="checkbox" id="advancedFirewall" name="advancedFirewall" label={`Advanced Firewall Service (+$${PRICE_ADVANCED_FIREWALL_MONTHLY.toFixed(2)})`} checked={!!config.advancedFirewall} onChange={handleChange}/>
                                <FormField type="checkbox" id="enhancedMonitoring" name="enhancedMonitoring" label={`Enhanced Monitoring Suite (+$${PRICE_ENHANCED_MONITORING_MONTHLY.toFixed(2)})`} checked={!!config.enhancedMonitoring} onChange={handleChange}/>
                            </CollapsibleSection>
                        </>
                    )}

                    <div className="mt-6 pt-4 border-t dark:border-gray-700">
                        <p className="text-lg font-semibold text-right text-[#293c51] dark:text-gray-100">
                            Unit Subtotal (Monthly Estimate): ${currentSubtotal.toFixed(2)}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6 pt-4 border-t dark:border-gray-700">
                    <Button variant="ghost" type="button" onClick={() => navigate('/app/billing/cloudedge-configurations')}>Cancel</Button>
                    <Button type="submit">{isEditing ? "Save Changes" : "Next"}</Button>
                </div>
            </form>
        )}

        {pageStep === 2 && (
            <div>
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-[#293c51] dark:text-gray-100">Name Your {config.quantity} Configurations</h3>
                    <p className="text-sm text-gray-500">The base name is "{config.name}". You can customize each one below.</p>
                    <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-2 border-t border-b py-4 dark:border-gray-600">
                        {individualNames.map((name, index) => (
                            <FormField key={index} id={`config-name-${index}`} label={`Configuration #${index + 1} Name`} value={name} onChange={e => handleIndividualNameChange(index, e.target.value)} required />
                        ))}
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6 pt-4 border-t dark:border-gray-700">
                    <Button variant="outline" type="button" onClick={() => setPageStep(1)}>Back</Button>
                    <Button type="button" onClick={handleFinalSubmit}>Add {config.quantity} Configurations</Button>
                </div>
            </div>
        )}
    </Card>
  );
};