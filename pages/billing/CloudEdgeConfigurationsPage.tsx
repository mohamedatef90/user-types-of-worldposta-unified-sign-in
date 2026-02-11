
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Icon, Stepper, Modal } from '@/components/ui';
import type { CloudEdgeConfiguration } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const CONFIG_STORAGE_KEY = 'cloudEdgeConfigurations';
const WALLET_STORAGE_KEY = 'cloudEdgeWalletBalanceUSD';
const MIN_PAYG_BALANCE = 50;

// --- Lookup Data for Detailed Display ---
const MOCK_REGIONS = [
    { id: 'eu-central-1', name: 'EU (Frankfurt)' },
    { id: 'us-east-1', name: 'EU (Strasbourg)' },
];

const MOCK_TEMPLATES = [
  { id: 'ce-s1', name: 'WP Instance Small', desc: '2 vCPU, 4 GB RAM, 50 GB Boot' },
  { id: 'ce-m1', name: 'WP Instance Medium', desc: '4 vCPU, 8 GB RAM, 100 GB Boot' },
  { id: 'ce-l1', name: 'WP Instance Large', desc: '8 vCPU, 16 GB RAM, 200 GB Boot' },
];

const MOCK_READY_PLANS = [
    { id: 'rp-dev', name: 'Developer Sandbox', desc: '1 vCPU, 2 GB RAM, 40 GB SSD' },
    { id: 'rp-web', name: 'General Web Server', desc: '4 vCPU, 8 GB RAM, 100 GB SSD' },
    { id: 'rp-db', name: 'Database Server', desc: '4 vCPU, 32 GB RAM, 200 GB SSD' },
];

const MOCK_OS = [
    {id: 'ubuntu-22', name: 'Ubuntu 22.04 LTS'},
    {id: 'centos-9', name: 'CentOS Stream 9'},
    {id: 'windows-2022-std', name: 'Windows Server 2022 Standard'},
    {id: 'rocky-9', name: 'Rocky Linux 9'},
];

const MOCK_TESLA_OPTIONS = [
  { id: 'tesla-1x12', label: '1 card, 12 GB' },
  { id: 'tesla-1x24', label: '1 card, 24 GB' },
  { id: 'tesla-2x24', label: '2 cards, 24 GB' },
];

// Helper to generate a detailed description array
const getConfigDetails = (config: CloudEdgeConfiguration): string[] => {
    const details: string[] = [];

    // Region
    const region = MOCK_REGIONS.find(r => r.id === config.deploymentRegion)?.name || config.deploymentRegion;
    if (region) details.push(`Region: ${region}`);

    // Core Specs based on Type
    if (config.type === 'instance') {
        const tpl = MOCK_TEMPLATES.find(t => t.id === config.instanceTemplateId);
        if (tpl) details.push(`Template: ${tpl.name} (${tpl.desc})`);
        if (config.machineType) details.push(`Tier: ${config.machineType}`);
        
        const os = MOCK_OS.find(o => o.id === config.osSoftware)?.name;
        if (os) details.push(`OS: ${os}`);
        
        if (config.provisioningModel === 'spot') details.push('Provisioning: Spot (Discounted)');
        
    } else if (config.type === 'vdc') {
        details.push(`VDC Resources: ${config.vdcCPU} vCPU, ${config.vdcRAM} GB RAM, ${config.vdcFlashStorage} GB Storage`);
    } else if (config.type === 'ready-plan') {
        const plan = MOCK_READY_PLANS.find(p => p.id === config.readyPlanId);
        if (plan) details.push(`Plan: ${plan.name} (${plan.desc})`);
    }

    // GPU
    if (config.gpuEnabled) {
        if (config.gpuFamily === 'tesla') {
            const opt = MOCK_TESLA_OPTIONS.find(o => o.id === config.teslaOptionId)?.label;
            details.push(`GPU: Tesla ${opt}`);
        } else if (config.gpuFamily === 'h100') {
            const slices = config.h100Slices === 8 ? 'Dedicated' : `${config.h100Slices} Slice(s)`;
            details.push(`GPU: H100 (${slices})`);
        }
    }

    // Flash Disk
    if (config.flashDiskEnabled && config.flashDiskGB) {
        details.push(`Extra Storage: ${config.flashDiskGB} GB ${config.flashDiskType} Flash`);
    }

    // Add-ons
    const addons = [];
    if (config.staticPublicIPs) addons.push(`${config.staticPublicIPs} Static IPs`);
    if (config.objectStorageGB) addons.push(`${config.objectStorageGB} GB Object Storage`);
    if (config.advancedBackupGB) addons.push(`${config.advancedBackupGB} GB Backup`);
    if (config.advancedFirewall) addons.push('Advanced Firewall');
    if (config.loadBalancerInstances) addons.push(`${config.loadBalancerInstances} LB Instance(s)`);
    
    if (addons.length > 0) {
        details.push(`Add-ons: ${addons.join(', ')}`);
    }

    // Billing specifics
    if (config.billingMode === 'payg_wallet') {
        if (config.expectedRuntimeHours && config.expectedRuntimeHours < 730) {
            details.push(`Est. Runtime: ${config.expectedRuntimeHours} hrs/mo`);
        }
        if (config.paygCapValue) {
            details.push(`Usage Cap: ${config.paygCapType === 'amount' ? `$${config.paygCapValue}` : `${config.paygCapValue} Hours`}`);
        }
    } else {
        // Subscription term
        details.push(`Term: ${config.subscriptionTermValue} ${config.subscriptionTermUnit}${config.subscriptionTermValue > 1 ? 's' : ''}`);
    }

    return details;
};

interface ConfigurationItemRowProps {
  config: CloudEdgeConfiguration;
  onEdit: (configId: string) => void;
  onRemove: (configId: string) => void;
}

const ConfigurationItemRow: React.FC<ConfigurationItemRowProps> = ({ config, onEdit, onRemove }) => {
  const details = getConfigDetails(config);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-5 border-b last:border-b-0 dark:border-slate-700 animate-fade-in group">
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-bold text-[#293c51] dark:text-gray-100">{config.name}</h3>
          {config.billingMode === 'payg_wallet' ? (
              <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-black uppercase">PAYG</span>
          ) : (
              <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-black uppercase">Subscription</span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-x-4 gap-y-1">
           {details.map((detail, idx) => (
               <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
                  <span>{detail}</span>
               </div>
           ))}
        </div>
      </div>
      
      <div className="flex items-center gap-6 mt-4 md:mt-0 ml-0 md:ml-6 flex-shrink-0">
          <div className="text-right">
              <p className="font-bold text-lg text-[#679a41] dark:text-emerald-400">
                  ${config.unitSubtotalMonthly.toFixed(2)}
              </p>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">per month {config.billingMode === 'payg_wallet' ? '(est.)' : ''}</p>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="ghost" onClick={() => onEdit(config.id)} title="Edit">
                  <Icon name="fas fa-pencil-alt" className="text-gray-400 hover:text-sky-500" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onRemove(config.id)} title="Remove">
                  <Icon name="fas fa-trash-alt" className="text-red-400 hover:text-red-600" />
              </Button>
          </div>
      </div>
    </div>
  );
};

const PaymentStep: React.FC<{
    configurations: CloudEdgeConfiguration[], 
    onBack: () => void, 
    onPay: () => void
}> = ({ configurations, onBack, onPay }) => {
    const [isPaying, setIsPaying] = useState(false);
    const upfrontTotal = configurations.filter(c => c.billingMode !== 'payg_wallet').reduce((sum, config) => sum + config.unitSubtotalMonthly, 0);

    const handlePaymentRedirect = () => {
        setIsPaying(true);
        if (upfrontTotal > 0) {
            window.open('https://stripe.com/', '_blank', 'noopener,noreferrer');
        }
        
        setTimeout(() => {
            onPay();
        }, 2000); 
    };
    
    const isOnlyPayg = upfrontTotal === 0 && configurations.some(c => c.billingMode === 'payg_wallet');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <Card title="Order Summary">
                    <ul className="space-y-4">
                        {configurations.map(config => (
                            <li key={config.id} className="flex justify-between items-start text-sm border-b dark:border-gray-700 pb-2 last:border-0">
                                <div>
                                    <p className="font-medium text-[#293c51] dark:text-gray-200">{config.name} x {config.quantity}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {config.billingMode === 'payg_wallet' ? 'PAYG (Wallet)' : 'Subscription'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {config.type === 'instance' ? 'Virtual Machine' : config.type === 'vdc' ? 'Virtual Data Center' : 'Ready Plan'}
                                    </p>
                                </div>
                                <p className="font-semibold text-gray-700 dark:text-gray-300">${config.unitSubtotalMonthly.toFixed(2)}</p>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-baseline">
                        <span className="text-lg font-bold text-[#293c51] dark:text-gray-100">Total Due Now</span>
                        <span className="text-2xl font-bold text-[#679a41] dark:text-emerald-400">${upfrontTotal.toFixed(2)}</span>
                    </div>
                </Card>
            </div>
            <div>
                 <Card title={isOnlyPayg ? "Deployment Confirmation" : "Payment Details"}>
                    <div className="flex flex-col items-center text-center space-y-6">
                        {isOnlyPayg ? (
                             <div className="space-y-4 w-full">
                                <div className="flex flex-col items-center">
                                    <Icon name="fas fa-wallet" className="text-4xl text-blue-500 mb-2" />
                                    <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                                        No upfront payment is charged.
                                    </p>
                                </div>
                                <div className="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-md border border-blue-100 dark:border-blue-800 text-left">
                                    <p className="font-bold mb-1 flex items-center gap-2">
                                        <Icon name="fas fa-info-circle" /> PAYG Eligibility & Logic:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>You must have a <strong>minimum wallet balance</strong> to be eligible to purchase this configuration.</li>
                                        <li>Usage costs are deducted from your wallet balance hourly.</li>
                                        <li>If your balance falls below the threshold, services may be paused.</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-600 dark:text-gray-400">Continue your payment securely with Stripe Financial.</p>
                                <img 
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png" 
                                    alt="Stripe Logo" 
                                    className="h-12 object-contain"
                                />
                            </>
                        )}
                        
                        <div className="flex items-start text-left text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg w-full">
                            <Icon name="fas fa-lock" className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                            <p>
                                {isOnlyPayg 
                                    ? "Usage is continuously monitored. Ensure your wallet stays topped up to prevent service interruptions."
                                    : "You will be redirected to Stripe to complete your payment. We do not store any of your personal details or credit card information on our servers."}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button type="button" variant="outline" onClick={onBack} disabled={isPaying}>Back</Button>
                        <Button onClick={handlePaymentRedirect} isLoading={isPaying} disabled={isPaying}>
                            {isPaying ? 'Processing...' : (isOnlyPayg ? 'Deploy Resources' : 'Pay with Stripe')}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const ConfirmationStep: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    const orderId = useMemo(() => `WP-CEDGE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, []);
    return (
        <Card className="text-center py-10">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="fas fa-check" className="text-3xl text-green-600 dark:text-green-400"/>
            </div>
            <h2 className="text-2xl font-bold text-[#293c51] dark:text-gray-100">Provisioning Started!</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Your CloudEdge services are now being provisioned.</p>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">Order ID: <span className="font-mono text-gray-700 dark:text-gray-300">{orderId}</span></p>
            <Button onClick={onFinish} className="mt-8">Create New Estimate</Button>
        </Card>
    );
};

export const CloudEdgeConfigurationsContent: React.FC<{
    onAdd?: () => void;
    onEdit?: (configId: string) => void;
}> = ({ onAdd, onEdit }) => {
  const navigate = useNavigate();
  const [configurations, setConfigurations] = useState<CloudEdgeConfiguration[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [selectedBillingMode, setSelectedBillingMode] = useState<'subscription' | 'payg_wallet' | null>(null);

  useEffect(() => {
    const savedConfigs = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (savedConfigs) {
      setConfigurations(JSON.parse(savedConfigs));
    }
    const savedBalance = localStorage.getItem(WALLET_STORAGE_KEY);
    setWalletBalance(savedBalance ? parseFloat(savedBalance) : 200.00);
  }, []);
  
  const handleEditConfiguration = (configId: string) => {
    if (onEdit) {
        onEdit(configId);
    } else {
        navigate(`/app/billing/cloudedge-configurations/edit/${configId}`);
    }
  };
  
  const handleRemoveConfiguration = (configId: string) => {
    const updatedConfigs = configurations.filter(c => c.id !== configId);
    setConfigurations(updatedConfigs);
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updatedConfigs));
  };

  const openAddPage = () => {
    setSelectedBillingMode(null);
    setIsSelectionModalOpen(true);
  }

  const handleConfirmBillingMode = () => {
    if (!selectedBillingMode) return;
    
    setIsSelectionModalOpen(false);
    if (onAdd) {
        onAdd();
    } else {
        navigate('/app/billing/cloudedge-configurations/add', { state: { initialBillingMode: selectedBillingMode } });
    }
  };

  const resetFlow = useCallback(() => {
    setConfigurations([]);
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    setCurrentStep(0);
  }, []);
  
  const handleProceed = () => {
      const hasPayg = configurations.some(c => c.billingMode === 'payg_wallet');
      if (hasPayg && walletBalance < MIN_PAYG_BALANCE) {
          alert(`Insufficient wallet balance for PAYG items. Minimum required: $${MIN_PAYG_BALANCE}. Current: $${walletBalance.toFixed(2)}. Please top up your wallet.`);
          return;
      }
      setCurrentStep(1);
  };
  
  const totalMonthlyEstimate = useMemo(() => {
    return configurations.reduce((sum, config) => sum + config.unitSubtotalMonthly, 0);
  }, [configurations]);
  
  const paygTotal = configurations.filter(c => c.billingMode === 'payg_wallet').reduce((sum, config) => sum + config.unitSubtotalMonthly, 0);
  const upfrontTotal = configurations.filter(c => c.billingMode !== 'payg_wallet').reduce((sum, config) => sum + config.unitSubtotalMonthly, 0);

  const hasPayg = configurations.some(c => c.billingMode === 'payg_wallet');
  const isOnlyPayg = hasPayg && upfrontTotal === 0;

  const steps = [
    { name: 'Configurations and summary' },
    { name: isOnlyPayg ? 'Confirm Deployment' : 'Payment' },
    { name: 'Confirmation' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-[#293c51] dark:text-gray-100 tracking-tight">CloudEdge Configurations</h1>
      
      <div className="w-full md:w-3/4 lg:w-1/2 mx-auto">
        <Stepper steps={steps} currentStep={currentStep} className="my-8" />
      </div>

      {currentStep === 0 && (
        <div className="max-w-5xl mx-auto space-y-6">
            <Card title="Configuration Summary" titleActions={
                <Button onClick={openAddPage} size="sm" leftIconName="fas fa-plus">Add Configuration</Button>
            }>
                <div className="divide-y dark:divide-slate-700">
                    {configurations.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icon name="fas fa-shopping-cart" className="text-2xl text-gray-300" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                                No configurations added yet. Click "Add Configuration" to build your estimate.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="pb-4">
                                {configurations.map(config => (
                                    <ConfigurationItemRow key={config.id} config={config} onEdit={handleEditConfiguration} onRemove={handleRemoveConfiguration} />
                                ))}
                            </div>
                            
                            <div className="pt-8 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pricing Model Breakdown</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Total Upfront (Subscription)</span>
                                                <span className="font-bold text-[#293c51] dark:text-gray-100">${upfrontTotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Estimated Monthly (PAYG)</span>
                                                <span className="font-bold text-[#293c51] dark:text-gray-100">${paygTotal.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 bg-[#679a41]/5 dark:bg-emerald-900/10 rounded-2xl border border-[#679a41]/20 flex flex-col items-center justify-center">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Monthly Estimate</p>
                                        <p className="text-4xl font-black text-[#679a41] dark:text-emerald-400">${totalMonthlyEstimate.toFixed(2)}</p>
                                        {hasPayg && <p className="text-[10px] text-gray-400 mt-2 italic">* PAYG costs vary based on actual hourly usage.</p>}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Card>
                
            {configurations.length > 0 && (
                <div className="flex justify-end pt-4">
                    <Button 
                        onClick={handleProceed} 
                        size="lg"
                        className="px-10 h-14 text-base font-bold shadow-xl shadow-green-500/20"
                        leftIconName={isOnlyPayg ? "fas fa-rocket" : "fas fa-credit-card"}
                        leftIconClassName="w-5 h-5"
                    >
                        {isOnlyPayg ? "Deploy Resources" : "Proceed to Payment"}
                    </Button>
                </div>
            )}
        </div>
    )}

      {currentStep === 1 && (
        <div className="max-w-5xl mx-auto">
            <PaymentStep
                configurations={configurations}
                onBack={() => setCurrentStep(0)}
                onPay={() => setCurrentStep(2)}
            />
        </div>
      )}

      {currentStep === 2 && (
          <div className="max-w-2xl mx-auto">
              <ConfirmationStep onFinish={resetFlow} />
          </div>
      )}

      <Modal 
        isOpen={isSelectionModalOpen} 
        onClose={() => setIsSelectionModalOpen(false)} 
        title="Select Your Preferred Billing Method"
        size="2xl"
        footer={
            <div className="flex justify-end gap-3 w-full">
                <Button variant="ghost" onClick={() => setIsSelectionModalOpen(false)}>Cancel</Button>
                <Button onClick={handleConfirmBillingMode} disabled={!selectedBillingMode} rightIconName="fas fa-arrow-right">Next</Button>
            </div>
        }
      >
        <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
                Choose how you would like to be billed for your new CloudEdge resources. You can switch methods later, but your choice now helps us configure your environment.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subscription Option */}
                <button 
                    onClick={() => setSelectedBillingMode('subscription')}
                    className={`relative flex flex-col items-center p-8 border-2 rounded-2xl transition-all text-center group ${
                        selectedBillingMode === 'subscription' 
                        ? 'border-[#679a41] bg-green-50/50 dark:bg-emerald-900/20 dark:border-emerald-500 ring-1 ring-[#679a41] dark:ring-emerald-500' 
                        : 'border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 bg-white dark:bg-slate-800 shadow-sm'
                    }`}
                >
                    {selectedBillingMode === 'subscription' && (
                        <div className="absolute top-3 right-3 text-[#679a41] dark:text-emerald-400">
                            <Icon name="fas fa-check-circle" className="text-xl" />
                        </div>
                    )}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
                        selectedBillingMode === 'subscription' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'bg-purple-50 dark:bg-purple-900/20'
                    }`}>
                        <Icon name="fas fa-file-invoice-dollar" className={`text-3xl ${selectedBillingMode === 'subscription' ? 'text-[#679a41] dark:text-emerald-400' : 'text-purple-500'}`} />
                    </div>
                    <h3 className="text-xl font-bold text-[#293c51] dark:text-gray-100 mb-2">Subscription</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        Fixed monthly or yearly terms. Best for predictable production workloads and reserved capacity.
                    </p>
                </button>

                {/* PAYG Option */}
                <button 
                    onClick={() => setSelectedBillingMode('payg_wallet')}
                    className={`relative flex flex-col items-center p-8 border-2 rounded-2xl transition-all text-center group ${
                        selectedBillingMode === 'payg_wallet' 
                        ? 'border-[#679a41] bg-green-50/50 dark:bg-emerald-900/20 dark:border-emerald-500 ring-1 ring-[#679a41] dark:ring-emerald-500' 
                        : 'border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 bg-white dark:bg-slate-800 shadow-sm'
                    }`}
                >
                    {selectedBillingMode === 'payg_wallet' && (
                        <div className="absolute top-3 right-3 text-[#679a41] dark:text-emerald-400">
                            <Icon name="fas fa-check-circle" className="text-xl" />
                        </div>
                    )}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
                        selectedBillingMode === 'payg_wallet' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'bg-blue-50 dark:bg-blue-900/20'
                    }`}>
                        <Icon name="fas fa-wallet" className={`text-3xl ${selectedBillingMode === 'payg_wallet' ? 'text-[#679a41] dark:text-emerald-400' : 'text-blue-500'}`} />
                    </div>
                    <h3 className="text-xl font-bold text-[#293c51] dark:text-gray-100 mb-2">Pay-As-You-Go</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        Hourly billing deducted from your wallet. Perfect for dev/test nodes and variable traffic demands.
                    </p>
                </button>
            </div>
            {selectedBillingMode === 'payg_wallet' && (
                <div className="p-4 bg-blue-50 dark:bg-sky-900/20 border border-blue-100 dark:border-sky-800 rounded-xl flex items-start gap-3 animate-fade-in">
                    <Icon name="fas fa-info-circle" className="text-blue-500 mt-0.5" />
                    <p className="text-xs text-blue-800 dark:text-sky-200">
                        <strong>Note:</strong> A minimum wallet balance of <strong>${MIN_PAYG_BALANCE}</strong> is required to deploy PAYG resources. You can top up your wallet in the next steps if needed.
                    </p>
                </div>
            )}
        </div>
      </Modal>
    </div>
  );
};

export const CloudEdgeConfigurationsPage: React.FC = () => {
    return <CloudEdgeConfigurationsContent />;
};
