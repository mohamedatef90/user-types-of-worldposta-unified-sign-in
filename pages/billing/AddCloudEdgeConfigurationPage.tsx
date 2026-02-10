
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button, Card, FormField, CollapsibleSection, SliderInput, Icon, Modal, ToggleSwitch } from '@/components/ui';
import type { CloudEdgeConfiguration, InstanceTemplate, MachineType } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';

const CONFIG_STORAGE_KEY = 'cloudEdgeConfigurations';
const WALLET_STORAGE_KEY = 'cloudEdgeWalletBalanceUSD';

// --- PRICING CONSTANTS ---
const PRICE_H100_SLICE_12GB_MONTHLY = 120.00;
const H100_SLICE_OPTIONS = [1, 2, 4, 8];

const mockTeslaGpuOptions = [
  { id: 'tesla-1x12', label: '1 card, 12 GB', priceMonthly: 150.00 },
  { id: 'tesla-1x24', label: '1 card, 24 GB', priceMonthly: 280.00 },
  { id: 'tesla-2x24', label: '2 cards, 24 GB', priceMonthly: 500.00 },
];

const PRICE_CPU_CORE_MONTHLY = 10;
const PRICE_RAM_GB_MONTHLY = 5;
const PRICE_FLASH_GB_MONTHLY = 0.10;
const PRICE_STATIC_IP_MONTHLY = 4.00;
const PRICE_OBJECT_STORAGE_GB_MONTHLY = 0.02;
const PRICE_ADVANCED_BACKUP_GB_MONTHLY = 0.05;
const PRICE_FLASH_DISK_SSD_GB_MONTHLY = 0.15;
const PRICE_FLASH_DISK_NVME_GB_MONTHLY = 0.30;

// --- MOCK OPTIONS ---
const mockRegions = [
    { id: 'eu-central-1', name: 'EU (Frankfurt)', flag: '🇩🇪' },
    { id: 'us-east-1', name: 'EU (Strasbourg)', flag: '🇫🇷' },
];

const mockInstanceTemplates: InstanceTemplate[] = [
  { id: 'ce-s1', name: 'Micro (CE-S1)', cpu: 2, ramGB: 4, bootDiskGB: 50, priceMonthly: 20, description: 'Best for web proxies & lightweight apps' },
  { id: 'ce-m1', name: 'Standard (CE-M1)', cpu: 4, ramGB: 8, bootDiskGB: 100, priceMonthly: 40, description: 'Production balanced workloads' },
  { id: 'ce-l1', name: 'Power (CE-L1)', cpu: 8, ramGB: 16, bootDiskGB: 200, priceMonthly: 80, description: 'Demanding databases & analytics' },
];

interface ReadyPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
}

const mockReadyPlans: ReadyPlan[] = [
    { id: 'rp-starter', name: 'Starter Node', description: '1 vCPU, 2GB RAM, 40GB SSD', priceMonthly: 15 },
    { id: 'rp-business', name: 'Business Hub', description: '4 vCPU, 8GB RAM, 100GB SSD', priceMonthly: 50 },
    { id: 'rp-enterprise', name: 'Enterprise Core', description: '8 vCPU, 32GB RAM, 500GB NVMe', priceMonthly: 120 },
];

const topOsChoices = [
    { id: 'ubuntu-24', name: 'Ubuntu 24.04 LTS', icon: 'fab fa-ubuntu' },
    { id: 'win-2022', name: 'Windows Server 2022', icon: 'fab fa-windows' },
    { id: 'rhel-9', name: 'RHEL 9', icon: 'fab fa-redhat' },
];

const nicOptions = [
    { id: '1', name: '1 NIC (Default)' },
    { id: '2', name: '2 NICs' },
    { id: '4', name: '4 NICs' },
    { id: '8', name: '8 NICs' },
];

// --- HELPER COMPONENTS ---

const SectionHeader: React.FC<{ step: number; title: string; subtitle?: string }> = ({ step, title, subtitle }) => (
    <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
            <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#679a41] text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-green-500/20">
                {step}
            </span>
            <h3 className="text-xl font-bold text-[#293c51] dark:text-gray-100">{title}</h3>
        </div>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">{subtitle}</p>}
    </div>
);

interface VisualCardProps {
    active?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    icon: string;
    title: string;
    description: string;
    price?: number;
    statusBadge?: string;
}

const VisualCard = ({ active, disabled, onClick, icon, title, description, price, statusBadge }: VisualCardProps) => (
    <div 
        onClick={!disabled ? onClick : undefined}
        className={`relative flex flex-col p-5 border-2 rounded-xl transition-all duration-300 group ${
            disabled 
            ? 'border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/20 opacity-50 grayscale cursor-not-allowed'
            : active 
                ? 'cursor-pointer border-[#679a41] bg-green-50/30 dark:bg-emerald-900/10 ring-1 ring-[#679a41]/30 shadow-md' 
                : 'cursor-pointer border-gray-200 dark:border-slate-700 hover:border-[#679a41]/50 hover:bg-gray-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-800'
        }`}
    >
        {statusBadge && (
            <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-[9px] font-bold uppercase tracking-wider border border-purple-200 dark:border-purple-800 shadow-sm z-10">
                {statusBadge}
            </div>
        )}
        <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${active ? 'bg-[#679a41] text-white shadow-lg shadow-green-500/30' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-slate-600'}`}>
                <Icon name={icon} className="text-2xl" />
            </div>
            {price && (
                <div className="text-right">
                    <span className="block font-bold text-[#679a41] dark:text-emerald-400 text-lg">${price}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">/ month</span>
                </div>
            )}
        </div>
        <h4 className={`font-bold text-sm mb-1 ${active ? 'text-[#293c51] dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{description}</p>
        
        {active && !disabled && (
            <div className="absolute bottom-2 right-2">
                <Icon name="fas fa-check-circle" className="text-[#679a41] text-sm" />
            </div>
        )}
    </div>
);

const PriceBreakdownRow = ({ label, value, subValue }: { label: string, value: string | number, subValue?: string }) => (
    <div className="flex justify-between items-start py-2 border-b border-gray-100 dark:border-slate-700 last:border-0 group">
        <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">{label}</span>
            {subValue && <span className="text-[10px] text-gray-400 italic">{subValue}</span>}
        </div>
        <span className="font-bold text-sm text-[#293c51] dark:text-gray-100">{value}</span>
    </div>
);

// --- MAIN CONFIGURATOR ---

export const AddCloudEdgeConfigurationPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { configId } = useParams<{ configId: string }>();
    const isEditing = !!configId;

    const initialBillingMode = (location.state as any)?.initialBillingMode || 'payg_wallet';

    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [pageStep, setPageStep] = useState(1);
    const [individualNames, setIndividualNames] = useState<string[]>([]);
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
    const [modalTopUpAmount, setModalTopUpAmount] = useState<number | ''>('');

    const [config, setConfig] = useState<Partial<CloudEdgeConfiguration & { nics: string }>>({
        type: 'instance',
        quantity: 1,
        deploymentRegion: 'eu-central-1',
        billingMode: initialBillingMode,
        machineType: 'Type I',
        instanceTemplateId: 'ce-s1',
        readyPlanId: 'rp-starter',
        expectedRuntimeHours: 730,
        gpuEnabled: false,
        gpuFamily: 'h100',
        h100Slices: 1,
        flashDiskEnabled: false,
        flashDiskType: 'SSD',
        flashDiskGB: 0,
        staticPublicIPs: 1,
        objectStorageGB: 0,
        advancedBackupGB: 0,
        nics: '1',
        subscriptionTermValue: 1,
        subscriptionTermUnit: 'month'
    });

    useEffect(() => {
        const savedBalance = localStorage.getItem(WALLET_STORAGE_KEY);
        setWalletBalance(savedBalance ? parseFloat(savedBalance) : 200.00);

        if (isEditing) {
            const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
            if (saved) {
                const found = JSON.parse(saved).find((c: any) => c.id === configId);
                if (found) setConfig(found);
            }
        }
    }, [configId, isEditing]);

    const handleTopUp = (amount: number) => {
        const newBalance = walletBalance + amount;
        setWalletBalance(newBalance);
        localStorage.setItem(WALLET_STORAGE_KEY, newBalance.toString());
    };

    const handleFinalSubmit = () => {
        finalizeSave(individualNames);
    };

    const calculateSubtotal = useCallback(() => {
        let total = 0;
        if (config.type === 'instance') {
            const tpl = mockInstanceTemplates.find(t => t.id === config.instanceTemplateId);
            if (tpl) total += tpl.priceMonthly;

            if (config.gpuEnabled) {
                if (config.gpuFamily === 'tesla') {
                    total += mockTeslaGpuOptions.find(o => o.id === config.teslaOptionId)?.priceMonthly || 0;
                } else {
                    total += (config.h100Slices || 0) * PRICE_H100_SLICE_12GB_MONTHLY;
                }
            }
        } else if (config.type === 'vdc') {
            total += (config.vdcCPU || 0) * PRICE_CPU_CORE_MONTHLY;
            total += (config.vdcRAM || 0) * PRICE_RAM_GB_MONTHLY;
            total += (config.vdcFlashStorage || 0) * PRICE_FLASH_GB_MONTHLY;
        } else {
            total += mockReadyPlans.find(p => p.id === config.readyPlanId)?.priceMonthly || 0;
        }

        total += (config.staticPublicIPs || 0) * PRICE_STATIC_IP_MONTHLY;
        total += (config.objectStorageGB || 0) * PRICE_OBJECT_STORAGE_GB_MONTHLY;
        total += (config.advancedBackupGB || 0) * PRICE_ADVANCED_BACKUP_GB_MONTHLY;

        if (config.flashDiskEnabled) {
            const rate = config.flashDiskType === 'NVMe' ? PRICE_FLASH_DISK_NVME_GB_MONTHLY : PRICE_FLASH_DISK_SSD_GB_MONTHLY;
            total += (config.flashDiskGB || 0) * rate;
        }

        if (config.billingMode === 'payg_wallet' && config.type === 'instance') {
            const hourly = total / 730;
            return hourly * (config.expectedRuntimeHours || 730);
        }

        return total;
    }, [config]);

    const subtotal = useMemo(() => calculateSubtotal(), [calculateSubtotal]);
    const grandTotal = subtotal * (config.quantity || 1);

    const handleUpdate = (updates: Partial<CloudEdgeConfiguration & { nics: string }>) => {
        setConfig(prev => ({ ...prev, ...updates }));
    };

    const handleSave = () => {
        if (!config.name) { alert("Please name your configuration."); return; }
        
        if ((config.quantity || 1) > 1 && !isEditing) {
            setIndividualNames(Array.from({ length: config.quantity! }, (_, i) => `${config.name}-${i + 1}`));
            setPageStep(2);
        } else {
            finalizeSave(individualNames.length > 0 ? individualNames : [config.name!]);
        }
    };

    const finalizeSave = (names: string[]) => {
        const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
        const existing = saved ? JSON.parse(saved) : [];
        
        const newConfigs = names.map(name => ({
            ...config,
            id: isEditing ? configId : uuidv4(),
            name,
            quantity: 1,
            unitSubtotalMonthly: subtotal,
            creationDate: new Date().toISOString()
        }));

        const updated = isEditing 
            ? existing.map((c: any) => c.id === configId ? newConfigs[0] : c)
            : [...existing, ...newConfigs];

        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
        navigate('/app/billing/cloudedge-configurations');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b dark:border-slate-700 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#293c51] dark:text-gray-100 tracking-tight">
                        {isEditing ? 'Modify Cloud Configuration' : 'Deploy New Infrastructure'}
                    </h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Configure your mission-critical CloudEdge environment.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => navigate(-1)} leftIconName="fas fa-arrow-left">Exit Configurator</Button>
                    {!isEditing && <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 hidden md:block"></div>}
                    {!isEditing && (
                        <div className="px-3 py-1 bg-green-50 dark:bg-emerald-900/20 text-[#679a41] dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#679a41] animate-pulse"></span>
                            Live Estimator Active
                        </div>
                    )}
                </div>
            </header>

            {pageStep === 1 ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* LEFT PANEL: CONFIGURATOR */}
                    <div className="lg:col-span-8 space-y-12 pb-24">
                        {/* Step 1: Base Type */}
                        <section>
                            <SectionHeader 
                                step={1} 
                                title="Resource Architecture" 
                                subtitle="Select the underlying model for your cloud resources." 
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <VisualCard 
                                    active={config.type === 'instance'}
                                    onClick={() => handleUpdate({ type: 'instance' })}
                                    icon="fas fa-server"
                                    title="Elastic Instances"
                                    description="Scalable VMs with customizable vCPU and RAM ratios."
                                />
                                <VisualCard 
                                    active={config.type === 'vdc'}
                                    disabled={config.billingMode === 'payg_wallet'}
                                    statusBadge={config.billingMode === 'payg_wallet' ? 'Subscription Only' : undefined}
                                    onClick={() => handleUpdate({ type: 'vdc', billingMode: 'subscription' })}
                                    icon="fas fa-cloud"
                                    title="Virtual Data Center"
                                    description="Private resource pool with dedicated isolation."
                                />
                                <VisualCard 
                                    active={config.type === 'ready-plan'}
                                    disabled={config.billingMode === 'payg_wallet'}
                                    statusBadge={config.billingMode === 'payg_wallet' ? 'Subscription Only' : undefined}
                                    onClick={() => handleUpdate({ type: 'ready-plan', billingMode: 'subscription' })}
                                    icon="fas fa-bolt"
                                    title="Ready-To-Run Plans"
                                    description="Curated high-performance VM bundles for quick launch."
                                />
                            </div>
                        </section>

                        {/* Step 2: Primary Specs */}
                        <section className="space-y-8">
                            <SectionHeader 
                                step={2} 
                                title="Core Configuration" 
                                subtitle="Define your resource naming, location, and billing cycle." 
                            />
                            
                            <Card className="!bg-gray-50/50 dark:!bg-slate-900/20 border-gray-100 dark:border-slate-800">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                    <FormField id="configName" label="Environment Label" value={config.name || ''} onChange={e => handleUpdate({ name: e.target.value })} placeholder="e.g. Production-Backend-Stack" required />
                                    <FormField id="region" label="Primary Region" as="select" value={config.deploymentRegion} onChange={e => handleUpdate({ deploymentRegion: e.target.value })}>
                                        {mockRegions.map(r => <option key={r.id} value={r.id}>{r.flag} {r.name}</option>)}
                                    </FormField>
                                    
                                    {config.billingMode === 'subscription' && (
                                        <>
                                            <FormField 
                                                id="subTerm" 
                                                label="Contract Duration" 
                                                type="number" 
                                                value={config.subscriptionTermValue || 1} 
                                                onChange={e => handleUpdate({ subscriptionTermValue: parseInt(e.target.value) || 1 })} 
                                                min={1} 
                                            />
                                            <FormField 
                                                id="subUnit" 
                                                label="Unit" 
                                                as="select" 
                                                value={config.subscriptionTermUnit} 
                                                onChange={e => handleUpdate({ subscriptionTermUnit: e.target.value as any })}
                                            >
                                                <option value="month">Month(s)</option>
                                                <option value="year">Year(s)</option>
                                            </FormField>
                                        </>
                                    )}

                                    {config.billingMode === 'payg_wallet' && config.type === 'instance' && (
                                        <div className="md:col-span-2">
                                            <FormField 
                                                id="runtime" 
                                                label="Estimated Monthly Runtime" 
                                                type="number" 
                                                value={config.expectedRuntimeHours || 730} 
                                                onChange={e => handleUpdate({ expectedRuntimeHours: parseInt(e.target.value) || 0 })} 
                                                min={1} 
                                                max={730}
                                                hint="Average month: 730 hours. Used for real-time cost estimation."
                                            />
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {config.type === 'instance' && (
                                <div className="space-y-6">
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight ml-1">Select Hardware Blueprint</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        {mockInstanceTemplates.map(t => (
                                            <VisualCard 
                                                key={t.id}
                                                active={config.instanceTemplateId === t.id}
                                                onClick={() => handleUpdate({ instanceTemplateId: t.id })}
                                                icon="fas fa-microchip"
                                                title={t.name}
                                                price={t.priceMonthly}
                                                description={t.description}
                                            />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end p-6 bg-white dark:bg-slate-800 border rounded-xl shadow-sm">
                                        <FormField id="tier" label="Service Tier" as="select" value={config.machineType} onChange={e => handleUpdate({ machineType: e.target.value as MachineType })}>
                                            <option value="Type I">Type I (Standard - Shared Resources)</option>
                                            <option value="Type II">Type II (Premium - Dedicated Resources)</option>
                                        </FormField>
                                        <FormField id="qty" label="Instance Quantity" type="number" value={config.quantity || 1} onChange={e => handleUpdate({ quantity: Math.max(1, parseInt(e.target.value) || 1) })} disabled={isEditing} />
                                    </div>
                                </div>
                            )}

                            {config.type === 'vdc' && (
                                <Card className="space-y-8 !p-8 border-none bg-white dark:bg-slate-800 shadow-sm">
                                    <SliderInput id="cpu" label="Reserved CPU Capacity" value={config.vdcCPU || 4} onChange={v => handleUpdate({ vdcCPU: v })} min={2} max={64} step={1} unit="Cores" pricePerUnit={PRICE_CPU_CORE_MONTHLY} />
                                    <SliderInput id="ram" label="Reserved System RAM" value={config.vdcRAM || 8} onChange={v => handleUpdate({ vdcRAM: v })} min={4} max={256} step={4} unit="GB" pricePerUnit={PRICE_RAM_GB_MONTHLY} />
                                    <SliderInput id="storage" label="High Performance Storage" value={config.vdcFlashStorage || 100} onChange={v => handleUpdate({ vdcFlashStorage: v })} min={50} max={5000} step={50} unit="GB" pricePerUnit={PRICE_FLASH_GB_MONTHLY} />
                                </Card>
                            )}

                            {config.type === 'ready-plan' && (
                                <div className="space-y-6">
                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        {mockReadyPlans.map(p => (
                                            <VisualCard 
                                                key={p.id}
                                                active={config.readyPlanId === p.id}
                                                onClick={() => handleUpdate({ readyPlanId: p.id })}
                                                icon="fas fa-layer-group"
                                                title={p.name}
                                                price={p.priceMonthly}
                                                description={p.description}
                                            />
                                        ))}
                                    </div>
                                    <div className="max-w-xs">
                                        <FormField id="qty-rp" label="Cluster Nodes" type="number" value={config.quantity || 1} onChange={e => handleUpdate({ quantity: Math.max(1, parseInt(e.target.value) || 1) })} disabled={isEditing} />
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Step 3: Performance & Base Options */}
                        <section className="space-y-6">
                            <SectionHeader 
                                step={3} 
                                title="Acceleration & Network" 
                                subtitle="Fine-tune your environment with GPU modules and networking interfaces." 
                            />
                            
                            {config.type === 'instance' && (
                                <CollapsibleSection title="High-Compute Acceleration (NVIDIA GPU)" initialOpen={config.gpuEnabled}>
                                    <div className="space-y-4 pt-3">
                                        <div className={`flex justify-between items-center p-6 rounded-2xl border transition-all ${config.gpuEnabled ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200' : 'bg-gray-50/50 dark:bg-slate-800/40 border-gray-100'}`}>
                                            <div>
                                                <p className="font-bold text-base text-[#293c51] dark:text-gray-100">Hardware Acceleration</p>
                                                <p className="text-xs text-gray-500 mt-1">Requires Type II Infrastructure. Enable for AI, ML, or Rendering workloads.</p>
                                            </div>
                                            <ToggleSwitch id="gpu" checked={!!config.gpuEnabled} onChange={v => handleUpdate({ gpuEnabled: v })} disabled={config.machineType === 'Type I'} />
                                        </div>
                                        {config.gpuEnabled && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in p-4 bg-white dark:bg-slate-800 border rounded-xl shadow-sm">
                                                <FormField id="family" label="GPU Processor Series" as="select" value={config.gpuFamily} onChange={e => handleUpdate({ gpuFamily: e.target.value as any })}>
                                                    <option value="h100">NVIDIA H100 (High-End Slices)</option>
                                                    <option value="tesla">NVIDIA Tesla (Mid-Range Bundles)</option>
                                                </FormField>
                                                {config.gpuFamily === 'h100' ? (
                                                    <FormField id="slices" label="Multi-Instance GPU (MIG) Slices" as="select" value={config.h100Slices} onChange={e => handleUpdate({ h100Slices: parseInt(e.target.value) })}>
                                                        {H100_SLICE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt} Slice ({opt * 12}GB Dedicated VRAM)</option>)}
                                                    </FormField>
                                                ) : (
                                                    <FormField id="tesla" label="Tesla Acceleration Bundle" as="select" value={config.teslaOptionId} onChange={e => handleUpdate({ teslaOptionId: e.target.value })}>
                                                        <option value="">Choose acceleration level...</option>
                                                        {mockTeslaGpuOptions.map(o => <option key={o.id} value={o.id}>{o.label} - ${o.priceMonthly}/mo</option>)}
                                                    </FormField>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CollapsibleSection>
                            )}

                            <CollapsibleSection title="Software Stack & Virtual Networking" initialOpen={true}>
                                <div className="space-y-8 pt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {topOsChoices.map(os => (
                                            <button 
                                                key={os.id} 
                                                type="button"
                                                onClick={() => handleUpdate({ osSoftware: os.id })}
                                                className={`flex items-center gap-4 p-4 border rounded-xl transition-all ${config.osSoftware === os.id ? 'border-[#679a41] bg-green-50/50 dark:bg-emerald-900/10 shadow-sm ring-1 ring-[#679a41]/20' : 'bg-white dark:bg-slate-800 hover:border-gray-300'}`}
                                            >
                                                <Icon name={os.icon} className={`text-2xl ${config.osSoftware === os.id ? 'text-[#679a41]' : 'text-gray-400'}`} />
                                                <span className={`text-sm font-bold ${config.osSoftware === os.id ? 'text-[#293c51] dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>{os.name}</span>
                                            </button>
                                        ))}
                                        <Link to="/app/billing/cloudedge-configurations/os-images" className="flex items-center justify-center p-4 border-2 border-dashed rounded-xl text-xs font-bold text-[#679a41] dark:text-emerald-400 hover:bg-green-50/50 dark:hover:bg-emerald-900/10 transition-colors uppercase tracking-widest">
                                            More Blueprints
                                        </Link>
                                    </div>
                                    
                                    <div className="bg-gray-50/50 dark:bg-slate-900/20 p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Icon name="fas fa-network-wired" className="text-[#679a41]" />
                                            <h4 className="font-bold text-sm">Network Configuration</h4>
                                        </div>
                                        <div className="max-w-md">
                                            <FormField 
                                                id="nic-select" 
                                                label="Network Interfaces (vNICs)" 
                                                as="select" 
                                                value={config.nics} 
                                                onChange={e => handleUpdate({ nics: e.target.value })}
                                                hint="Assign multiple NICs for complex VLAN or isolated network requirements."
                                            >
                                                {nicOptions.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                                            </FormField>
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleSection>

                            <CollapsibleSection title="Storage Expansion & Secondary Disks">
                                <div className="space-y-4 pt-3">
                                    <div className={`flex justify-between items-center p-6 border rounded-2xl transition-all ${config.flashDiskEnabled ? 'bg-[#679a41]/5 dark:bg-emerald-900/10 border-[#679a41]/20' : 'bg-gray-50/50 dark:bg-slate-800/40 border-gray-100'}`}>
                                        <div className="flex items-center gap-4">
                                            <Icon name="fas fa-database" className={`text-xl ${config.flashDiskEnabled ? 'text-[#679a41]' : 'text-gray-400'}`} />
                                            <div>
                                                <p className="text-sm font-bold text-[#293c51] dark:text-gray-100">Attach Volume</p>
                                                <p className="text-xs text-gray-500">Mount a separate high-speed block storage volume.</p>
                                            </div>
                                        </div>
                                        <ToggleSwitch id="fdisk" checked={!!config.flashDiskEnabled} onChange={v => handleUpdate({ flashDiskEnabled: v })} />
                                    </div>
                                    {config.flashDiskEnabled && (
                                        <div className="animate-fade-in p-8 bg-white dark:bg-slate-800 border rounded-xl shadow-sm space-y-8">
                                            <FormField id="dtype" label="Block Storage Protocol" as="select" value={config.flashDiskType} onChange={e => handleUpdate({ flashDiskType: e.target.value as any })}>
                                                <option value="SSD">Standard Performance (SSD)</option>
                                                <option value="NVMe">Ultra Performance (NVMe)</option>
                                            </FormField>
                                            <SliderInput id="fsize" label="Volume Capacity" value={config.flashDiskGB || 0} onChange={v => handleUpdate({ flashDiskGB: v })} min={0} max={2000} step={50} unit="GB" pricePerUnit={config.flashDiskType === 'NVMe' ? PRICE_FLASH_DISK_NVME_GB_MONTHLY : PRICE_FLASH_DISK_SSD_GB_MONTHLY} />
                                        </div>
                                    )}
                                </div>
                            </CollapsibleSection>
                        </section>

                        {/* Step 4: Additional Resources */}
                        <section className="space-y-6">
                            <SectionHeader 
                                step={4} 
                                title="Enterprise Extensions" 
                                subtitle="Add managed services for storage, connectivity, and data protection." 
                            />
                            <Card className="space-y-10 !p-8 border-gray-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-800">
                                <SliderInput 
                                    id="ips-addon" 
                                    label="Static Public IPv4 Addresses" 
                                    value={config.staticPublicIPs || 0} 
                                    onChange={v => handleUpdate({ staticPublicIPs: v })} 
                                    min={0} max={64} step={1} unit="IPs" 
                                    pricePerUnit={PRICE_STATIC_IP_MONTHLY}
                                />
                                <SliderInput 
                                    id="obj-storage" 
                                    label="Managed S3-Compatible Object Storage" 
                                    value={config.objectStorageGB || 0} 
                                    onChange={v => handleUpdate({ objectStorageGB: v })} 
                                    min={0} max={10000} step={100} unit="GB" 
                                    pricePerUnit={PRICE_OBJECT_STORAGE_GB_MONTHLY}
                                />
                                <SliderInput 
                                    id="adv-backup" 
                                    label="WorldPosta Data Guard (Veeam Powered)" 
                                    value={config.advancedBackupGB || 0} 
                                    onChange={v => handleUpdate({ advancedBackupGB: v })} 
                                    min={0} max={5000} step={100} unit="GB" 
                                    pricePerUnit={PRICE_ADVANCED_BACKUP_GB_MONTHLY}
                                />
                            </Card>
                        </section>
                    </div>

                    {/* RIGHT PANEL: SUMMARY & EXECUTION */}
                    <div className="lg:col-span-4">
                        <Card className="sticky top-24 border-2 border-[#679a41]/10 dark:border-slate-700 shadow-xl overflow-hidden !p-0">
                            <div className="p-6 bg-gray-50 dark:bg-slate-800/80 border-b dark:border-slate-700">
                                <h3 className="text-xl font-bold text-[#293c51] dark:text-gray-100 flex items-center gap-2">
                                    <Icon name="fas fa-receipt" className="text-[#679a41]" />
                                    Deployment Summary
                                </h3>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <PriceBreakdownRow label="Resource Model" value={config.type === 'instance' ? 'Standard Instance' : config.type === 'vdc' ? 'Virtual Data Center' : 'Ready Plan'} />
                                    <PriceBreakdownRow label="Deployment Target" value={mockRegions.find(r => r.id === config.deploymentRegion)?.name || '-'} />
                                    <PriceBreakdownRow 
                                        label="Billing Model" 
                                        value={config.billingMode === 'payg_wallet' ? 'PAYG (Wallet)' : 'Subscription'} 
                                        subValue={config.billingMode === 'payg_wallet' ? 'Charged hourly from balance' : 'Billed upfront recurringly'}
                                    />
                                    {config.billingMode === 'subscription' && (
                                        <PriceBreakdownRow label="Commitment Term" value={`${config.subscriptionTermValue} ${config.subscriptionTermUnit}${config.subscriptionTermValue! > 1 ? 's' : ''}`} />
                                    )}
                                    <PriceBreakdownRow label="Infrastructure Tier" value={config.machineType || '-'} />
                                </div>

                                <div className="pt-6 border-t dark:border-slate-700">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Unit Base Total</span>
                                        <div className="text-right">
                                            <span className="text-3xl font-extrabold text-[#679a41] dark:text-emerald-400">${subtotal.toFixed(2)}</span>
                                            <span className="text-[10px] text-gray-400 block font-bold">/ MONTHLY</span>
                                        </div>
                                    </div>
                                    {config.billingMode === 'payg_wallet' && (
                                        <p className="text-[11px] text-gray-400 italic text-right mt-1">~ ${(subtotal/730).toFixed(4)} per hour</p>
                                    )}
                                </div>

                                {config.quantity! > 1 && (
                                    <div className="flex justify-between items-center p-3 bg-[#679a41]/5 dark:bg-emerald-900/10 rounded-xl border border-[#679a41]/20">
                                        <span className="text-sm font-bold text-[#679a41] dark:text-emerald-400">Total Deployment (x{config.quantity})</span>
                                        <span className="font-extrabold text-lg text-[#293c51] dark:text-gray-100">${grandTotal.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="pt-6">
                                    {config.billingMode === 'payg_wallet' && (
                                        <div className={`p-5 rounded-2xl mb-6 text-center shadow-inner transition-all ${grandTotal > walletBalance ? 'bg-red-50 dark:bg-red-900/20 border border-red-200' : 'bg-blue-50 dark:bg-sky-900/10 border border-blue-100'}`}>
                                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Available Funds</p>
                                            <p className={`text-2xl font-black ${grandTotal > walletBalance ? 'text-red-600' : 'text-blue-600 dark:text-sky-400'}`}>
                                                ${walletBalance.toFixed(2)}
                                            </p>
                                            {grandTotal > walletBalance && (
                                                <button type="button" onClick={() => setIsTopUpModalOpen(true)} className="inline-flex items-center gap-2 text-xs text-red-700 dark:text-red-400 font-black uppercase tracking-tighter mt-3 bg-white dark:bg-red-900/40 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 transition-colors">
                                                    <Icon name="fas fa-plus-circle" /> Top Up Required
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <Button 
                                        fullWidth 
                                        size="lg" 
                                        onClick={handleSave}
                                        disabled={!config.name || (config.billingMode === 'payg_wallet' && grandTotal > walletBalance)}
                                        className="h-14 text-base shadow-xl shadow-green-500/30 font-bold uppercase tracking-widest"
                                    >
                                        {isEditing ? 'Save Configuration' : (config.quantity! > 1 ? 'Configure Multi-Node' : 'Validate & Deploy')}
                                    </Button>
                                    
                                    {!isEditing && (
                                        <p className="text-[10px] text-gray-400 text-center mt-4 px-4 leading-normal">
                                            By deploying, you agree to WorldPosta's SLA and the selected billing model. Resource allocation begins immediately.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            ) : (
                /* STEP 2: BULK NAMING */
                <div className="max-w-2xl mx-auto py-12">
                    <Card className="animate-fade-in shadow-2xl overflow-hidden !p-0">
                        <div className="p-8 bg-[#679a41] text-white">
                            <h3 className="text-2xl font-black mb-1">Identify Your Nodes</h3>
                            <p className="text-white/80 text-sm">Assign a unique hostname or label to each of your {config.quantity} nodes.</p>
                        </div>
                        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {individualNames.map((name, idx) => (
                                <FormField 
                                    key={idx}
                                    id={`name-${idx}`}
                                    label={`Instance Node #${idx + 1}`}
                                    value={name}
                                    onChange={e => {
                                        const newNames = [...individualNames];
                                        newNames[idx] = e.target.value;
                                        setIndividualNames(newNames);
                                    }}
                                    required
                                    placeholder={`e.g. cloud-node-0${idx + 1}`}
                                    wrapperClassName="!mb-0"
                                />
                            ))}
                        </div>
                        <div className="p-8 border-t bg-gray-50 dark:bg-slate-800/50 flex justify-between gap-4">
                            <Button variant="ghost" onClick={() => setPageStep(1)}>Return to Config</Button>
                            <Button onClick={handleFinalSubmit} className="shadow-lg shadow-green-500/20 px-10">Confirm All & Provision</Button>
                        </div>
                    </Card>
                </div>
            )}

            <Modal 
                isOpen={isTopUpModalOpen} 
                onClose={() => setIsTopUpModalOpen(false)} 
                title="Account Balance Top Up" 
                size="sm"
            >
                <div className="space-y-6 pt-2">
                    <div className="p-4 bg-blue-50 dark:bg-sky-900/20 text-blue-800 dark:text-sky-200 text-sm rounded-xl flex gap-3 items-start">
                        <Icon name="fas fa-info-circle" className="mt-1" />
                        <p>Funds are used immediately for Pay-As-You-Go resource consumption. Subscriptions are billed separately.</p>
                    </div>
                    <FormField 
                        id="topup-amt" 
                        label="Recharge Amount (USD)" 
                        type="number" 
                        placeholder="50.00" 
                        value={modalTopUpAmount}
                        onChange={(e) => setModalTopUpAmount(parseFloat(e.target.value) || '')}
                    />
                    <div className="flex flex-col gap-2">
                         <Button fullWidth onClick={() => { 
                            const amount = typeof modalTopUpAmount === 'number' ? modalTopUpAmount : 50;
                            handleTopUp(amount); 
                            setIsTopUpModalOpen(false); 
                        }} size="lg">Add Credits to Wallet</Button>
                        <Button variant="ghost" fullWidth onClick={() => setIsTopUpModalOpen(false)}>Cancel</Button>
                    </div>
                    <div className="text-center">
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-[#679a41] hover:underline">View Billing Documentation</a>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
