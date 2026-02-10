
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button, Card, FormField, CollapsibleSection, SliderInput, Icon, Modal } from '@/components/ui';
import type { CloudEdgeConfiguration, InstanceTemplate, GPUType, CloudEdgeComponentType, MachineType, ProvisioningModel, SubscriptionTermUnit } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';

const CONFIG_STORAGE_KEY = 'cloudEdgeConfigurations';
const WALLET_STORAGE_KEY = 'cloudEdgeWalletBalanceUSD';

// --- CONSTANTS ---
const DEFAULT_RUNTIME_HOURS = 730;

// GPU Pricing
const PRICE_H100_SLICE_12GB_MONTHLY = 120.00;
const H100_SLICE_OPTIONS = [0, 1, 2, 4, 8];

const mockTeslaGpuOptions = [
  { id: 'tesla-1x12', label: '1 card, 12 GB', cards: 1, vramGB: 12, priceMonthly: 150.00 },
  { id: 'tesla-1x24', label: '1 card, 24 GB', cards: 1, vramGB: 24, priceMonthly: 280.00 },
  { id: 'tesla-2x24', label: '2 cards, 24 GB', cards: 2, vramGB: 48, priceMonthly: 500.00 },
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

// Flash Disk Pricing
const PRICE_FLASH_DISK_SSD_GB_MONTHLY = 0.15;
const PRICE_FLASH_DISK_NVME_GB_MONTHLY = 0.30;

// --- MOCK DATA ---

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

const mockRegions = [
    { id: 'eu-central-1', name: 'EU (Frankfurt)' },
    { id: 'us-east-1', name: 'EU (Strasbourg)' },
];

const mockInstanceTemplates: InstanceTemplate[] = [
  { id: 'ce-s1', name: 'WP Instance Small (CE-S1)', cpu: 2, ramGB: 4, bootDiskGB: 50, priceMonthly: 20, description: '2 vCPU / 4 GB RAM / 50 GB Boot Disk' },
  { id: 'ce-m1', name: 'WP Instance Medium (CE-M1)', cpu: 4, ramGB: 8, bootDiskGB: 100, priceMonthly: 40, description: '4 vCPU / 8 GB RAM / 100 GB Boot Disk' },
  { id: 'ce-l1', name: 'WP Instance Large (CE-L1)', cpu: 8, ramGB: 16, bootDiskGB: 200, priceMonthly: 80, description: '8 vCPU / 16 GB RAM / 200 GB Boot Disk' },
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

/**
 * Calculates unit subtotal (for ONE unit) based on monthly or estimated hourly logic.
 */
const calculateCloudEdgeSubtotal = (config: Partial<CloudEdgeConfiguration>): number => {
    let subtotal = 0;
    
    if (config.type === 'instance') {
        const template = mockInstanceTemplates.find(t => t.id === config.instanceTemplateId);
        if (template) {
            subtotal = template.priceMonthly;
        }
    } else if (config.type === 'vdc') {
        if (config.vdcCPU) subtotal += config.vdcCPU * PRICE_CPU_CORE_MONTHLY;
        if (config.vdcRAM) subtotal += config.vdcRAM * PRICE_RAM_GB_MONTHLY;
        if (config.vdcFlashStorage) subtotal += config.vdcFlashStorage * PRICE_FLASH_GB_MONTHLY;
    } else if (config.type === 'ready-plan') {
        const plan = mockReadyPlans.find(p => p.id === config.readyPlanId);
        if (plan) {
            subtotal = plan.priceMonthly;
        }
    }

    // GPU Pricing (Monthly base)
    let gpuPriceMonthly = 0;
    if (config.machineType === 'Type II' && config.gpuEnabled) {
        if (config.gpuFamily === 'tesla') {
            const opt = mockTeslaGpuOptions.find(o => o.id === config.teslaOptionId);
            if (opt) gpuPriceMonthly = opt.priceMonthly;
        } else {
            gpuPriceMonthly = (config.h100Slices || 0) * PRICE_H100_SLICE_12GB_MONTHLY;
        }
    }

    // Handle PAYG Wallet Instance Logic
    if (config.type === 'instance' && config.billingMode === 'payg_wallet') {
        const hourlyBase = subtotal / 730;
        const hourlyGpu = gpuPriceMonthly / 730;
        const totalHourly = hourlyBase + hourlyGpu;
        subtotal = totalHourly * (config.expectedRuntimeHours || DEFAULT_RUNTIME_HOURS);
    } else {
        // Standard monthly subtotal
        subtotal += gpuPriceMonthly;
    }

    // Flash Disk Add-on
    if (config.flashDiskEnabled && (config.flashDiskGB || 0) > 0) {
        const rate = (config.flashDiskType === 'NVMe') ? PRICE_FLASH_DISK_NVME_GB_MONTHLY : PRICE_FLASH_DISK_SSD_GB_MONTHLY;
        const diskCost = (config.flashDiskGB || 0) * rate;
        
        if (config.type === 'instance') {
            // Calculated as part of hourly or monthly
             if (config.billingMode === 'payg_wallet') {
                 const hourlyDisk = diskCost / 730;
                 subtotal += hourlyDisk * (config.expectedRuntimeHours || DEFAULT_RUNTIME_HOURS);
             } else {
                 subtotal += diskCost;
             }
        } else {
            // Per configuration (single pool)
            subtotal += diskCost / (config.quantity || 1);
        }
    }

    // Common Add-ons (Calculated as monthly estimates for subtotal visibility)
    if(config.staticPublicIPs) subtotal += config.staticPublicIPs * PRICE_STATIC_IP_MONTHLY;
    if(config.objectStorageGB) subtotal += config.objectStorageGB * PRICE_OBJECT_STORAGE_GB_MONTHLY;
    if(config.advancedBackupGB) subtotal += config.advancedBackupGB * PRICE_ADVANCED_BACKUP_GB_MONTHLY;
    if(config.trendMicroEndpoints) subtotal += config.trendMicroEndpoints * PRICE_TREND_MICRO_ENDPOINT_MONTHLY;
    if(config.windowsServerLicenses) subtotal += config.windowsServerLicenses * PRICE_WINDOWS_LICENSE_MONTHLY;
    if(config.linuxEnterpriseLicenses) subtotal += config.linuxEnterpriseLicenses * PRICE_LINUX_LICENSE_MONTHLY;
    if(config.cortexXDREndpoints) subtotal += config.cortexXDREndpoints * PRICE_CORTEX_XDR_ENDPOINT_MONTHLY;
    if(config.loadBalancerInstances) subtotal += config.loadBalancerInstances * PRICE_LOAD_BALANCER_INSTANCE_MONTHLY;
    if(config.advancedFirewall) subtotal += PRICE_ADVANCED_FIREWALL_MONTHLY;
    if(config.enhancedMonitoring) subtotal += PRICE_ENHANCED_MONITORING_MONTHLY;

    if (config.provisioningModel === 'spot') subtotal *= 0.30;
    
    return subtotal;
};

const ReadyPlanCard: React.FC<{ plan: ReadyPlan, isSelected: boolean, onSelect: () => void }> = ({ plan, isSelected, onSelect }) => (
    <button onClick={onSelect} className={`text-left border-2 rounded-lg p-4 transition-all h-full flex flex-col ${isSelected ? 'border-[#679a41] ring-2 ring-[#679a41]/50 bg-green-50 dark:bg-emerald-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-slate-500'}`}>
        <h4 className="font-bold text-[#293c51] dark:text-gray-100">{plan.name}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 flex-grow">{plan.description}</p>
        <div className="mt-2 pt-2 border-t border-dashed dark:border-gray-700">
            <p className="text-sm font-semibold text-[#679a41] dark:text-emerald-400">${plan.priceMonthly.toFixed(2)}<span className="text-xs font-normal text-gray-500 dark:text-gray-400">/mo</span></p>
        </div>
    </button>
);

const RadioCard = ({ id, name, value, checked, onChange, label, iconName, tooltipText, showTooltip = true, disabled = false }: { id: string, name: string, value: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label: string, iconName: string, tooltipText: string, showTooltip?: boolean, disabled?: boolean}) => (
    <div className={`h-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <label htmlFor={id} className={`relative block p-4 border-2 rounded-lg transition-all h-full flex items-center justify-center text-center ${disabled ? 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 cursor-not-allowed' : 'cursor-pointer'} ${checked ? 'border-[#679a41] ring-2 ring-[#679a41]/50 bg-green-50 dark:bg-emerald-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-slate-500'}`}>
            <input type="radio" id={id} name={name} value={value} checked={checked} onChange={onChange} className="sr-only" disabled={disabled} />
            <div className="flex items-center justify-center gap-2">
                <Icon name={iconName} className={`text-2xl ${checked ? 'text-[#679a41] dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`} />
                <span className={`font-semibold text-sm ${checked ? 'text-[#293c51] dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>{label}</span>
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

const TopUpModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    currentBalance: number;
    onTopUp: (amount: number) => void;
    suggestedAmount?: number;
}> = ({ isOpen, onClose, currentBalance, onTopUp, suggestedAmount }) => {
    const [amount, setAmount] = useState<number | ''>('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Pre-fill with suggested amount if greater than 0, formatted to 2 decimals
            setAmount(suggestedAmount && suggestedAmount > 0 ? Number(suggestedAmount.toFixed(2)) : '');
        }
    }, [isOpen, suggestedAmount]);

    const handlePreset = (val: number) => setAmount(val);

    const handleSubmit = () => {
        if (typeof amount === 'number' && amount > 0) {
            setIsProcessing(true);
            setTimeout(() => {
                onTopUp(amount);
                setIsProcessing(false);
                onClose();
            }, 1000);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Top Up Wallet" size="sm">
            <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-center border border-gray-100 dark:border-slate-600">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Balance</p>
                    <p className="text-3xl font-bold text-[#293c51] dark:text-gray-100 mt-1">${currentBalance.toFixed(2)}</p>
                </div>
                
                {suggestedAmount && suggestedAmount > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-md text-center">
                        <p className="text-xs text-blue-800 dark:text-blue-300">
                            <Icon name="fas fa-info-circle" className="mr-1" />
                            Suggested amount to cover estimated deficit: <span className="font-bold">${suggestedAmount.toFixed(2)}</span>
                        </p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Select Amount</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[20, 50, 100].map(val => (
                            <button
                                key={val}
                                type="button"
                                onClick={() => handlePreset(val)}
                                className={`py-2 px-3 rounded-md text-sm font-semibold transition-all
                                    ${amount === val 
                                        ? 'ring-2 ring-[#679a41] bg-green-50 text-[#679a41] dark:bg-emerald-900/20 dark:ring-emerald-500 dark:text-emerald-400' 
                                        : 'border border-gray-200 dark:border-slate-600 hover:border-[#679a41] dark:hover:border-emerald-500 text-gray-700 dark:text-gray-300'}`}
                            >
                                ${val}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <label htmlFor="custom-amount" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Or Custom Amount</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                            id="custom-amount"
                            type="number"
                            min="1"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className="w-full pl-7 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#679a41] dark:focus:ring-emerald-400 bg-white dark:bg-slate-700 dark:text-white placeholder-gray-400"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button fullWidth onClick={handleSubmit} disabled={!amount || amount <= 0 || isProcessing} isLoading={isProcessing}>
                        {isProcessing ? 'Processing...' : 'Add Funds'}
                    </Button>
                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3 flex items-center justify-center gap-1">
                        <Icon name="fas fa-lock" /> Secure payment via Stripe
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export const AddCloudEdgeConfigurationContent: React.FC<{
    configId?: string;
    onClose?: () => void;
}> = ({ configId, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isEditing = !!configId;
    
    const initialBillingMode = location.state?.initialBillingMode;
    const isBillingModeLocked = !!initialBillingMode; // Only lock if coming from the add flow popup

    // Wallet Balance state
    const [walletBalance, setWalletBalance] = useState<number>(() => {
        const saved = localStorage.getItem(WALLET_STORAGE_KEY);
        return saved ? parseFloat(saved) : 200.00;
    });
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

    const [config, setConfig] = useState<Partial<CloudEdgeConfiguration>>({
        type: 'instance',
        quantity: 1,
        subscriptionTermValue: 1,
        subscriptionTermUnit: 'month',
        deploymentRegion: 'eu-central-1',
        provisioningModel: 'regular',
        machineType: 'Type I',
        billingMode: 'payg_wallet',
        expectedRuntimeHours: 730,
        gpuEnabled: false,
        gpuFamily: 'h100',
        h100Slices: 0,
        flashDiskEnabled: false,
        flashDiskType: 'SSD',
        flashDiskGB: 0,
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
                    if (onClose) onClose();
                    else navigate('/app/billing/cloudedge-configurations');
                }
            }
        } else if (initialBillingMode) {
            // Check if user came from the selection modal
            setConfig(prev => ({
                ...prev,
                billingMode: initialBillingMode,
                // If PAYG, default to instance. If Sub, default to instance (or could be VDC/Ready Plan but let's stick to simple default)
                type: 'instance',
                // If PAYG, ensure expected hours set. If Sub, ensure term set.
                expectedRuntimeHours: initialBillingMode === 'payg_wallet' ? 730 : undefined,
                subscriptionTermValue: initialBillingMode === 'subscription' ? 1 : undefined,
                subscriptionTermUnit: initialBillingMode === 'subscription' ? 'month' : undefined,
            }));
        } else {
            // Default initialization
            setConfig({
                type: 'instance',
                quantity: 1,
                subscriptionTermValue: 1,
                subscriptionTermUnit: 'month',
                deploymentRegion: 'eu-central-1',
                provisioningModel: 'regular',
                machineType: 'Type I',
                billingMode: 'payg_wallet',
                expectedRuntimeHours: 730,
                gpuEnabled: false,
                gpuFamily: 'h100',
                h100Slices: 0,
                flashDiskEnabled: false,
                flashDiskType: 'SSD',
                flashDiskGB: 0,
            });
        }
    }, [configId, isEditing, navigate, onClose, initialBillingMode]);

    useEffect(() => {
        if (location.state?.selectedOs) {
            setConfig(prev => ({ ...prev, osSoftware: location.state.selectedOs.id }));
            setIsAdvancedSectionOpen(true);
            const currentPath = configId ? `/app/billing/cloudedge-configurations/edit/${configId}` : '/app/billing/cloudedge-configurations/add';
            navigate(currentPath, { replace: true, state: { ...location.state, selectedOs: undefined } }); // Keep initialBillingMode if present in state, remove OS
        }
    }, [location.state, navigate, configId]);

    useEffect(() => {
        const subtotal = calculateCloudEdgeSubtotal(config);
        setCurrentSubtotal(subtotal);
    }, [config]);

    const handleTopUp = (amount: number) => {
        const newBalance = walletBalance + amount;
        setWalletBalance(newBalance);
        localStorage.setItem(WALLET_STORAGE_KEY, newBalance.toString());
    };

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
            
            // Clear flash disk on type change
            newConfig.flashDiskEnabled = false;
            newConfig.flashDiskType = 'SSD';
            newConfig.flashDiskGB = 0;

            if (value === 'instance') {
                // If switching to instance, prefer payg_wallet unless explicitly set otherwise or locked
                if (!isBillingModeLocked) {
                    newConfig.billingMode = 'payg_wallet';
                    newConfig.expectedRuntimeHours = 730;
                } else {
                    // Keep existing locked mode, just ensure defaults
                     if (config.billingMode === 'payg_wallet') {
                        newConfig.expectedRuntimeHours = 730;
                     } else {
                        newConfig.subscriptionTermValue = newConfig.subscriptionTermValue || 1;
                        newConfig.subscriptionTermUnit = newConfig.subscriptionTermUnit || 'month';
                     }
                }
            } else {
                // VDC and Ready Plans are subscription only
                newConfig.billingMode = 'subscription';
                newConfig.subscriptionTermValue = newConfig.subscriptionTermValue || 1;
                newConfig.subscriptionTermUnit = newConfig.subscriptionTermUnit || 'month';
            }
        }

        if (name === 'machineType' && value === 'Type I') {
            newConfig.gpuEnabled = false;
            newConfig.gpuFamily = 'h100';
            newConfig.teslaOptionId = undefined;
            newConfig.h100Slices = 0;
        }

        if (name === 'gpuEnabled' && !checked) {
            newConfig.teslaOptionId = undefined;
            newConfig.h100Slices = 0;
        }

        if (name === 'gpuFamily') {
            if (value === 'tesla') {
                newConfig.h100Slices = 0;
            } else {
                newConfig.teslaOptionId = undefined;
                newConfig.h100Slices = 0;
            }
        }

        if (name === 'billingMode') {
             if (value === 'payg_wallet') {
                newConfig.expectedRuntimeHours = newConfig.expectedRuntimeHours || 730;
                newConfig.subscriptionTermValue = undefined; 
                newConfig.subscriptionTermUnit = undefined;
             } else {
                newConfig.expectedRuntimeHours = undefined;
                newConfig.subscriptionTermValue = newConfig.subscriptionTermValue || 1;
                newConfig.subscriptionTermUnit = newConfig.subscriptionTermUnit || 'month';
             }
        }

        if (name === 'flashDiskEnabled' && !checked) {
            newConfig.flashDiskGB = 0;
            newConfig.flashDiskType = 'SSD';
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
        setConfig(prev => ({ ...prev, readyPlanId: plan.id }));
    };

    const handleSubmit = () => {
        if (!config.name || !config.type || !config.deploymentRegion || (config.quantity || 0) < 1) {
            alert("Please fill all required basic fields.");
            return;
        }
        
        const needsTerm = config.type === 'vdc' || config.type === 'ready-plan' || (config.type === 'instance' && config.billingMode === 'subscription');
        if (needsTerm && (config.subscriptionTermValue || 0) < 1) {
            alert("Please specify a Subscription Term.");
            return;
        }

        if (config.gpuEnabled) {
            if (config.gpuFamily === 'tesla' && !config.teslaOptionId) {
                alert("Please select a Tesla GPU option.");
                return;
            }
            if (config.gpuFamily === 'h100' && (!config.h100Slices || config.h100Slices < 1)) {
                alert("Please select at least 1 H100 slice.");
                return;
            }
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
                unitSubtotalMonthly: currentSubtotal,
            };
            
            const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
            const configs: CloudEdgeConfiguration[] = saved ? JSON.parse(saved) : [];
            const existingIndex = configs.findIndex(c => c.id === finalConfig.id);
            if (existingIndex > -1) configs[existingIndex] = finalConfig;
            else configs.push(finalConfig);
            
            localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configs));
            if (onClose) onClose();
            else navigate('/app/billing/cloudedge-configurations');
        }
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
        
        const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
        const configs: CloudEdgeConfiguration[] = saved ? JSON.parse(saved) : [];
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify([...configs, ...newConfigs]));
        if (onClose) onClose();
        else navigate('/app/billing/cloudedge-configurations');
    };

    const needsSubscriptionTerm = useMemo(() => 
        config.type === 'vdc' || config.type === 'ready-plan' || (config.type === 'instance' && config.billingMode === 'subscription'),
    [config.type, config.billingMode]);

    const gpuAllowed = useMemo(() => 
        config.machineType === 'Type II' && (config.type === 'instance' || config.type === 'ready-plan' || config.type === 'vdc'),
    [config.machineType, config.type]);

    const isOsInTopChoices = useMemo(() => {
        return topOsChoices.some(os => os.id === config.osSoftware);
    }, [config.osSoftware]);

    const selectedOsName = useMemo(() => {
        if (!config.osSoftware) return '';
        const allOsOptions = [...mockOSSoftware, ...topOsChoices];
        const choice = allOsOptions.find(os => os.id === config.osSoftware);
        return choice ? choice.name : config.osSoftware;
    }, [config.osSoftware]);

    const estimatedTotal = currentSubtotal * (config.quantity || 1);
    const balanceWarning = config.billingMode === 'payg_wallet' && estimatedTotal > walletBalance;
    const deficitAmount = balanceWarning ? Math.max(0, estimatedTotal - walletBalance) : 0;

  return (
    <Card>
        {pageStep === 1 && (
            <form onSubmit={e => {e.preventDefault(); handleSubmit();}}>
                <div className="space-y-6">
                    <div className="flex justify-between items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">
                                {isEditing ? "Edit CloudEdge Configuration" : "Add New CloudEdge Configuration"}
                            </h3>
                            <a 
                                href="https://worldposta.com/calculator" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-[#679a41] dark:hover:text-emerald-400 transition-colors"
                                title="Open Price Calculator for Estimate"
                            >
                                <Icon name="fas fa-info-circle" />
                            </a>
                        </div>
                        <div className="w-64">
                            <FormField id="deploymentRegion" name="deploymentRegion" label="Deployment Region" as="select" value={config.deploymentRegion || ""} onChange={handleChange} required wrapperClassName="!mb-0">
                                {mockRegions.map(r => (<option key={r.id} value={r.id} disabled={r.id !== 'eu-central-1'}>{r.name}</option>))}
                            </FormField>
                        </div>
                    </div>

                    <fieldset><legend className="block text-sm font-medium mb-2 text-[#293c51] dark:text-gray-300">Configuration Type</legend>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <RadioCard 
                                id="type-instance" 
                                name="type" 
                                value="instance" 
                                checked={config.type === 'instance'} 
                                onChange={handleChange} 
                                label="Instances" 
                                iconName="fas fa-server" 
                                tooltipText="Deploy one or more pre-defined virtual machine instances." 
                            />
                            <RadioCard 
                                id="type-vdc" 
                                name="type" 
                                value="vdc" 
                                checked={config.type === 'vdc'} 
                                onChange={handleChange} 
                                label="VDC" 
                                iconName="fas fa-cloud" 
                                tooltipText="Create a Virtual Data Center with a custom pool of resources (CPU, RAM, Storage)."
                                disabled={initialBillingMode === 'payg_wallet'} 
                            />
                            <RadioCard 
                                id="type-ready-plan" 
                                name="type" 
                                value="ready-plan" 
                                checked={config.type === 'ready-plan'} 
                                onChange={handleChange} 
                                label="Ready Plans" 
                                iconName="fas fa-bolt" 
                                tooltipText="" 
                                showTooltip={false}
                                disabled={initialBillingMode === 'payg_wallet'}
                            />
                        </div>
                        {initialBillingMode === 'payg_wallet' && (
                            <p className="text-xs text-gray-500 mt-1">VDC and Ready Plans are available for Subscription only.</p>
                        )}
                    </fieldset>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-3">
                            <FormField id="configName" name="name" label="Configuration Name" value={config.name || ''} onChange={handleChange} placeholder="e.g., My Web Server Cluster" required wrapperClassName="!mb-0" />
                        </div>
                        <FormField id="quantity" name="quantity" label="Quantity" type="number" value={config.quantity || 1} onChange={handleChange} min={1} required disabled={isEditing} wrapperClassName="!mb-0" />
                    </div>
                    
                    {config.type === 'instance' && (
                        <div className="space-y-4">
                            <div className={`grid grid-cols-1 ${!isBillingModeLocked ? 'md:grid-cols-2' : ''} gap-4`}>
                                <FormField id="machineType" name="machineType" label="Infra Tier" as="select" value={config.machineType || 'Type I'} onChange={handleChange}>
                                    <option value="Type I">Type I</option><option value="Type II">Type II</option>
                                </FormField>
                                {!isBillingModeLocked && (
                                    <FormField 
                                        id="billingMode" 
                                        name="billingMode" 
                                        label="Billing Mode" 
                                        as="select" 
                                        value={config.billingMode || 'payg_wallet'} 
                                        onChange={handleChange}
                                    >
                                        <option value="payg_wallet">PAYG (Wallet)</option>
                                        <option value="subscription">Subscription</option>
                                    </FormField>
                                )}
                            </div>

                            {/* Move Subscription Term under Billing Mode for Instances */}
                            {config.billingMode === 'subscription' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-slate-800/40 rounded-lg animate-fade-in border border-gray-100 dark:border-slate-700">
                                    <FormField id="subscriptionTermValue" name="subscriptionTermValue" label="Subscription Term" type="number" value={config.subscriptionTermValue || 1} onChange={handleChange} min={1} required wrapperClassName="!mb-0" />
                                    <FormField id="subscriptionTermUnit" name="subscriptionTermUnit" label="Duration" as="select" value={config.subscriptionTermUnit || 'month'} onChange={handleChange} wrapperClassName="!mb-0">
                                        <option value="hr">Hour(s)</option><option value="week">Week(s)</option><option value="month">Month(s)</option><option value="year">Year(s)</option>
                                    </FormField>
                                </div>
                            )}

                            {config.billingMode === 'payg_wallet' && (
                                <FormField 
                                    id="expectedRuntimeHours" 
                                    name="expectedRuntimeHours" 
                                    label="Expected runtime (hours/month) — estimate only" 
                                    type="number" 
                                    min={1} 
                                    max={730} 
                                    value={config.expectedRuntimeHours || 730} 
                                    onChange={handleChange} 
                                    hint="Default is 730 hours (full month)."
                                />
                            )}
                            
                            <div className={`grid grid-cols-1 ${gpuAllowed ? 'md:grid-cols-2' : ''} gap-4 items-start`}>
                                <FormField id="instanceTemplateId" name="instanceTemplateId" label="Instance Template" as="select" value={config.instanceTemplateId || ''} onChange={handleChange} required={config.type === 'instance'} wrapperClassName="!mb-0">
                                    <option value="">Select a template...</option>
                                    {mockInstanceTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </FormField>

                                {gpuAllowed && (
                                    <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                                        <FormField 
                                            type="checkbox" 
                                            id="gpuEnabled" 
                                            name="gpuEnabled" 
                                            label="Add GPU Acceleration" 
                                            checked={!!config.gpuEnabled} 
                                            onChange={handleChange} 
                                            wrapperClassName="!mb-0"
                                        />
                                        {config.gpuEnabled && (
                                            <div className="mt-4 space-y-4 animate-fade-in">
                                                <FormField 
                                                    as="select" 
                                                    id="gpuFamily" 
                                                    name="gpuFamily" 
                                                    label="GPU Family" 
                                                    value={config.gpuFamily || 'h100'} 
                                                    onChange={handleChange}
                                                >
                                                    <option value="tesla">Nvidia Tesla (Card bundles)</option>
                                                    <option value="h100">Nvidia H100 (12GB slices)</option>
                                                </FormField>

                                                {config.gpuFamily === 'tesla' ? (
                                                    <FormField 
                                                        as="select" 
                                                        id="teslaOptionId" 
                                                        name="teslaOptionId" 
                                                        label="Tesla GPU Option" 
                                                        value={config.teslaOptionId || ''} 
                                                        onChange={handleChange}
                                                        hint="Tesla GPUs are selected as fixed card bundles."
                                                        required={config.gpuEnabled}
                                                    >
                                                        <option value="">-- Select an option --</option>
                                                        {mockTeslaGpuOptions.map(opt => (
                                                            <option key={opt.id} value={opt.id}>{opt.label} (+${opt.priceMonthly.toFixed(2)}/mo)</option>
                                                        ))}
                                                    </FormField>
                                                ) : (
                                                    <FormField 
                                                        as="select" 
                                                        id="h100Slices" 
                                                        name="h100Slices" 
                                                        label="H100 Slices (12 GB each)" 
                                                        value={config.h100Slices || 0} 
                                                        onChange={handleChange}
                                                        hint="H100 is selected in 12 GB slices."
                                                        required={config.gpuEnabled}
                                                    >
                                                        {H100_SLICE_OPTIONS.map(opt => (
                                                            <option key={opt} value={opt}>{opt === 0 ? 'None' : (opt === 8 ? 'Dedicated' : `${opt} Slice${opt > 1 ? 's' : ''}`) + ` (${opt * 12} GB) (+${(opt * PRICE_H100_SLICE_12GB_MONTHLY).toFixed(2)}/mo)`}</option>
                                                        ))}
                                                    </FormField>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {config.type === 'vdc' && (
                        <div className="space-y-4">
                            <FormField id="machineType" name="machineType" label="Infra Tier" as="select" value={config.machineType || 'Type I'} onChange={handleChange}>
                                <option value="Type I">Type I</option><option value="Type II">Type II</option>
                            </FormField>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField id="subscriptionTermValue" name="subscriptionTermValue" label="Subscription Term" type="number" value={config.subscriptionTermValue || 1} onChange={handleChange} min={1} required />
                                <FormField id="subscriptionTermUnit" name="subscriptionTermUnit" label="Duration" as="select" value={config.subscriptionTermUnit || 'month'} onChange={handleChange}>
                                    <option value="hr">Hour(s)</option><option value="week">Week(s)</option><option value="month">Month(s)</option><option value="year">Year(s)</option>
                                </FormField>
                            </div>

                            <CollapsibleSection title="Core Compute Resources (VDC)" initialOpen={true}>
                                <SliderInput id="vdcCPU" label="CPU Cores" value={config.vdcCPU || 2} onChange={(v) => setConfig(p => ({...p, vdcCPU: v}))} min={2} max={64} step={1} unit="Cores" pricePerUnit={PRICE_CPU_CORE_MONTHLY}/>
                                <SliderInput id="vdcRAM" label="RAM" value={config.vdcRAM || 4} onChange={(v) => setConfig(p => ({...p, vdcRAM: v}))} min={4} max={256} step={1} unit="GB" pricePerUnit={PRICE_RAM_GB_MONTHLY}/>
                                <SliderInput id="vdcFlashStorage" label="Flash Disk Storage" value={config.vdcFlashStorage || 50} onChange={(v) => setConfig(p => ({...p, vdcFlashStorage: v}))} min={50} max={10000} step={10} unit="GB" pricePerUnit={PRICE_FLASH_GB_MONTHLY}/>
                            </CollapsibleSection>
                        </div>
                    )}

                    {config.type === 'ready-plan' && (
                        <div className="space-y-4">
                            <FormField id="machineType" name="machineType" label="Infra Tier" as="select" value={config.machineType || 'Type I'} onChange={handleChange}>
                                <option value="Type I">Type I</option><option value="Type II">Type II</option>
                            </FormField>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField id="subscriptionTermValue" name="subscriptionTermValue" label="Subscription Term" type="number" value={config.subscriptionTermValue || 1} onChange={handleChange} min={1} required />
                                <FormField id="subscriptionTermUnit" name="subscriptionTermUnit" label="Duration" as="select" value={config.subscriptionTermUnit || 'month'} onChange={handleChange}>
                                    <option value="hr">Hour(s)</option><option value="week">Week(s)</option><option value="month">Month(s)</option><option value="year">Year(s)</option>
                                </FormField>
                            </div>

                            <div className="mt-4"><h4 className="font-medium mb-2 text-[#293c51] dark:text-gray-200">Select a Ready Plan</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {mockReadyPlans.map(plan => <ReadyPlanCard key={plan.id} plan={plan} isSelected={config.readyPlanId === plan.id} onSelect={() => handleReadyPlanSelect(plan)} />)}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <CollapsibleSection 
                        title="Advanced Settings & Optional Resources"
                        isOpen={isAdvancedSectionOpen}
                        onToggle={() => setIsAdvancedSectionOpen(prev => !prev)}
                    >
                        <div className="space-y-4">
                            <div>
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

                            <FormField
                                id="gateway"
                                name="gateway"
                                label="Gateway"
                                as="select"
                                value={(config as any).gateway || 'NIC Card'}
                                onChange={handleChange}
                            >
                                <option value="NIC Card">NIC Card</option>
                            </FormField>

                            {gpuAllowed && config.type !== 'instance' && (
                                <div className="pt-4 border-t dark:border-slate-700 space-y-4">
                                    <FormField 
                                        type="checkbox" 
                                        id="gpuEnabled" 
                                        name="gpuEnabled" 
                                        label="Add GPU Acceleration (per configuration)" 
                                        checked={!!config.gpuEnabled} 
                                        onChange={handleChange} 
                                    />
                                    {config.gpuEnabled && (
                                        <div className="pl-6 border-l-2 dark:border-slate-700 space-y-4 animate-fade-in">
                                            <FormField 
                                                as="select" 
                                                id="gpuFamily" 
                                                name="gpuFamily" 
                                                label="GPU Family" 
                                                value={config.gpuFamily || 'h100'} 
                                                onChange={handleChange}
                                            >
                                                <option value="tesla">Nvidia Tesla (Card bundles)</option>
                                                <option value="h100">Nvidia H100 (12GB slices)</option>
                                            </FormField>

                                            {config.gpuFamily === 'tesla' ? (
                                                <FormField 
                                                    as="select" 
                                                    id="teslaOptionId" 
                                                    name="teslaOptionId" 
                                                    label="Tesla GPU Option" 
                                                    value={config.teslaOptionId || ''} 
                                                    onChange={handleChange}
                                                    hint="Tesla GPUs are selected as fixed card bundles."
                                                    required={config.gpuEnabled}
                                                >
                                                    <option value="">-- Select an option --</option>
                                                    {mockTeslaGpuOptions.map(opt => (
                                                        <option key={opt.id} value={opt.id}>{opt.label} (+${opt.priceMonthly.toFixed(2)}/mo)</option>
                                                    ))}
                                                </FormField>
                                            ) : (
                                                <FormField 
                                                    as="select" 
                                                    id="h100Slices" 
                                                    name="h100Slices" 
                                                    label="H100 Slices (12 GB each)" 
                                                    value={config.h100Slices || 0} 
                                                    onChange={handleChange}
                                                    hint="H100 is selected in 12 GB slices."
                                                    required={config.gpuEnabled}
                                                >
                                                    {H100_SLICE_OPTIONS.map(opt => (
                                                        <option key={opt} value={opt}>{opt === 0 ? 'None' : (opt === 8 ? 'Dedicated' : `${opt} Slice${opt > 1 ? 's' : ''}`) + ` (${opt * 12} GB) (+${(opt * PRICE_H100_SLICE_12GB_MONTHLY).toFixed(2)}/mo)`}</option>
                                                    ))}
                                                </FormField>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Other Configurable Resources" initialOpen={true}>
                        <div className="space-y-4">
                            <FormField 
                                type="checkbox" 
                                id="flashDiskEnabled" 
                                name="flashDiskEnabled" 
                                label="Add Flash Disk (GB-month)" 
                                checked={!!config.flashDiskEnabled} 
                                onChange={handleChange} 
                            />
                            {config.flashDiskEnabled && (
                                <div className="pl-6 border-l-2 dark:border-slate-700 space-y-4 animate-fade-in">
                                    <FormField 
                                        as="select" 
                                        id="flashDiskType" 
                                        name="flashDiskType" 
                                        label="Flash Disk Type" 
                                        value={config.flashDiskType || 'SSD'} 
                                        onChange={handleChange}
                                    >
                                        <option value="SSD">SSD (Balanced)</option>
                                        <option value="NVMe">NVMe (Performance)</option>
                                    </FormField>
                                    <SliderInput 
                                        id="flashDiskGB" 
                                        label="Flash Disk Size" 
                                        value={config.flashDiskGB || 0} 
                                        onChange={(v) => setConfig(p => ({...p, flashDiskGB: v}))} 
                                        min={0} max={10000} step={10} 
                                        unit="GB"
                                        pricePerUnit={config.flashDiskType === 'NVMe' ? PRICE_FLASH_DISK_NVME_GB_MONTHLY : PRICE_FLASH_DISK_SSD_GB_MONTHLY}
                                    />
                                    <p className="text-xs text-gray-500 italic">Flash Disk is billed by allocated GB-month. NVMe is higher performance than SSD.</p>
                                </div>
                            )}

                            <hr className="dark:border-slate-700" />

                            <SliderInput id="staticPublicIPs" label="Static Public IPs" value={config.staticPublicIPs || 0} onChange={(v) => setConfig(p => ({...p, staticPublicIPs: v}))} min={0} max={10} step={1} pricePerUnit={PRICE_STATIC_IP_MONTHLY} unit="IPs"/>
                            <SliderInput id="objectStorageGB" label="Object Storage" value={config.objectStorageGB || 0} onChange={(v) => setConfig(p => ({...p, objectStorageGB: v}))} min={0} max={10000} step={100} pricePerUnit={PRICE_OBJECT_STORAGE_GB_MONTHLY} unit="GB-month"/>
                            <SliderInput id="advancedBackupGB" label="Advanced Backup (Veeam)" value={config.advancedBackupGB || 0} onChange={(v) => setConfig(p => ({...p, advancedBackupGB: v}))} min={0} max={10000} step={100} pricePerUnit={PRICE_ADVANCED_BACKUP_GB_MONTHLY} unit="GB-month"/>
                        </div>
                    </CollapsibleSection>

                    <div className="mt-6 pt-4 border-t dark:border-gray-700 flex flex-col items-end">
                        <div className="flex items-center gap-4 mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Wallet balance: <span className="font-bold text-[#293c51] dark:text-white">${walletBalance.toFixed(2)}</span></span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setIsTopUpModalOpen(true)} className="!text-xs h-7">Top Up</Button>
                        </div>
                        {balanceWarning && (
                            <p className="text-xs text-red-500 font-semibold mb-2">
                                Warning: Estimated usage exceeds wallet balance. PAYG resources may pause unless you top up.
                            </p>
                        )}
                        <div className="text-right space-y-1">
                            <p className="text-lg font-semibold text-[#293c51] dark:text-gray-100">
                                Unit Subtotal ({config.billingMode === 'payg_wallet' ? 'Monthly Est.' : 'Monthly'}): ${currentSubtotal.toFixed(2)}
                            </p>
                            {config.gpuEnabled && (
                                <p className="text-xs text-[#679a41] dark:text-emerald-400 font-medium">
                                    GPU: {config.gpuFamily === 'tesla' 
                                        ? `Nvidia Tesla — ${mockTeslaGpuOptions.find(o => o.id === config.teslaOptionId)?.label || 'Not Selected'}`
                                        : `Nvidia H100 — ${config.h100Slices === 8 ? 'Dedicated' : `${config.h100Slices || 0} slices`} (${(config.h100Slices || 0) * 12} GB)`}
                                </p>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-2 text-right italic text-balance">
                            {config.billingMode === 'payg_wallet' 
                                ? "PAYG usage is deducted from your wallet. If wallet reaches $0, PAYG resources pause until top-up. Subscription services remain unaffected." 
                                : "Subscriptions are billed recurringly and remain active regardless of wallet balance."}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6 pt-4 border-t dark:border-gray-700">
                    <Button variant="ghost" type="button" onClick={onClose ? onClose : () => navigate('/app/billing/cloudedge-configurations')}>Cancel</Button>
                    <Button type="submit">Next</Button>
                </div>
            </form>
        )}

        {pageStep === 2 && (
            <div>
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-[#293c51] dark:text-gray-100">Name Your {config.quantity} Configurations</h3>
                    <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-2 border-t border-b py-4 dark:border-gray-600">
                        {individualNames.map((name, index) => (
                            <FormField key={index} id={`config-name-${index}`} label={`Configuration #${index + 1} Name`} value={name} onChange={e => {
                                const updated = [...individualNames];
                                updated[index] = e.target.value;
                                setIndividualNames(updated);
                            }} required />
                        ))}
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6 pt-4 border-t dark:border-gray-700">
                    <Button variant="outline" type="button" onClick={() => setPageStep(1)}>Back</Button>
                    <Button type="button" onClick={handleFinalSubmit}>Add {config.quantity} Configurations</Button>
                </div>
            </div>
        )}

        <TopUpModal 
            isOpen={isTopUpModalOpen} 
            onClose={() => setIsTopUpModalOpen(false)} 
            currentBalance={walletBalance} 
            onTopUp={handleTopUp}
            suggestedAmount={deficitAmount > 0 ? deficitAmount : undefined}
        />
    </Card>
  );
};

export const AddCloudEdgeConfigurationPage: React.FC = () => {
    const { configId } = useParams<{ configId: string }>();
    const navigate = useNavigate();
    return <AddCloudEdgeConfigurationContent 
        configId={configId}
        onClose={() => navigate('/app/billing/cloudedge-configurations')}
    />;
};
