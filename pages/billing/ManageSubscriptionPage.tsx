import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, Icon, FormField, Modal, ToggleSwitch, SliderInput, Tooltip } from '@/components/ui';
import { mockSubscriptions, MOCK_USERS, mockMailboxPlans, mockInvoices } from '@/data';
import type { Subscription, Invoice, InvoiceLineItem } from '@/types';
import { useAuth } from '@/context';
import { PLANS } from '../pricing/constants';
import { v4 as uuidv4 } from 'uuid';

const WALLET_STORAGE_KEY = 'cloudEdgeWalletBalanceUSD';

interface ManageSubscriptionContentProps {
    subscription: Subscription;
    view: 'modal' | 'page';
    onClose?: () => void;
}

// Mock CloudEdge Plans for Upgrade
const CLOUDEDGE_UPGRADE_OPTIONS = [
    { id: 'type-i', name: 'Type I (Standard)', priceMonthly: 150.00, priceYearly: 1500.00, specs: '4 vCPU, 16 GB RAM' },
    { id: 'type-ii', name: 'Type II (High Performance)', priceMonthly: 280.00, priceYearly: 2800.00, specs: '8 vCPU, 32 GB RAM, GPU Capable' },
    { id: 'type-iii', name: 'Type III (Enterprise)', priceMonthly: 500.00, priceYearly: 5000.00, specs: '16 vCPU, 64 GB RAM, Dedicated IOPS' },
];

export const ManageSubscriptionContent: React.FC<ManageSubscriptionContentProps> = ({ subscription, view, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [activeTab, setActiveTab] = useState<'overview' | 'upgrade' | 'downgrade' | 'addons' | 'renew' | 'payg_wallet' | 'top_up' | 'admin_tools'>('overview');
    const [walletBalance, setWalletBalance] = useState<number>(0);
    
    // Add-on State
    const [postaAddonUsers, setPostaAddonUsers] = useState<number>(0);
    const [ceAddonDisk, setCeAddonDisk] = useState<number>(0);
    const [ceAddonGpu, setCeAddonGpu] = useState<boolean>(false);
    const [ceAddonIps, setCeAddonIps] = useState<number>(0);
    const [ceAddonBackup, setCeAddonBackup] = useState<number>(0);
    
    // Top Up State
    const [topUpAmount, setTopUpAmount] = useState<number | ''>('');
    const [isTopUpProcessing, setIsTopUpProcessing] = useState(false);

    // Upgrade State
    const [selectedUpgradePlanId, setSelectedUpgradePlanId] = useState<string>('');
    const [upgradeBillingCycle, setUpgradeBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [upgradeEffectiveDate, setUpgradeEffectiveDate] = useState<'immediate' | 'next_cycle'>('immediate');
    
    // Renew State
    const [renewCycle, setRenewCycle] = useState<'monthly' | 'yearly'>('monthly');

    // Admin Tools State
    const [adminStartDate, setAdminStartDate] = useState('');
    const [adminEndDate, setAdminEndDate] = useState('');
    const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
    const [discountValue, setDiscountValue] = useState<number | ''>('');

    const isPayg = subscription.billingMode === 'payg_wallet';

    useEffect(() => {
        const saved = localStorage.getItem(WALLET_STORAGE_KEY);
        setWalletBalance(saved ? parseFloat(saved) : 200.00);
    }, []);

    // Initialize admin dates
    useEffect(() => {
        if (subscription) {
             const start = new Date(subscription.subscribeDate);
             if (!isNaN(start.getTime())) {
                 setAdminStartDate(start.toISOString().split('T')[0]);
             } else {
                 setAdminStartDate('');
             }

             if (subscription.endDate && subscription.endDate !== 'N/A' && subscription.endDate.toLowerCase() !== 'continuous') {
                 const end = new Date(subscription.endDate);
                 if (!isNaN(end.getTime())) {
                     setAdminEndDate(end.toISOString().split('T')[0]);
                 } else {
                     setAdminEndDate('');
                 }
             } else {
                 setAdminEndDate('');
             }
        }
    }, [subscription]);

    // Set default selected plan based on current subscription when tab changes
    useEffect(() => {
        if (activeTab === 'upgrade') {
            if (subscription.category === 'cloudedge') {
                const currentPlan = CLOUDEDGE_UPGRADE_OPTIONS.find(p => p.name.includes(subscription.infraTier || 'Type I'));
                let options = CLOUDEDGE_UPGRADE_OPTIONS;
                if (subscription.infraTier === 'Type I') {
                    options = options.filter(p => !p.name.includes('Type II'));
                }
                const nextPlan = options.find(p => p.priceMonthly > (currentPlan?.priceMonthly || 0));
                setSelectedUpgradePlanId(nextPlan?.id || options[0].id);
            } else if (subscription.category === 'posta') {
                const currentPlan = PLANS.find(p => p.name === subscription.productName);
                const nextPlan = PLANS.find(p => p.priceMonthly > (currentPlan?.priceMonthly || 0));
                setSelectedUpgradePlanId(nextPlan?.id || PLANS[0].id);
            }
        }
    }, [activeTab, subscription]);

    // --- Invoice Generation Helper ---
    const generateAndNavigateToInvoice = (
        type: 'New Subscription' | 'Renewal' | 'Upgrade' | 'Add-on' | 'Wallet Top-up',
        lineItems: InvoiceLineItem[],
        totalAmount: number,
        dueDateDays = 0,
        status: 'Paid' | 'Unpaid' = 'Unpaid'
    ) => {
        const newInvoiceId = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const invoiceDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + dueDateDays);

        let finalLineItems = [...lineItems];
        if (type !== 'Wallet Top-up' && type !== 'Renewal') {
             if (finalLineItems.length > 0) {
                 const contextString = `Service: ${subscription.productName} [${subscription.id}]`;
                 finalLineItems[0].description = `${finalLineItems[0].description}\n${contextString}`;
             }
        }

        const newInvoice: Invoice = {
            id: newInvoiceId,
            date: invoiceDate.toISOString(),
            amount: totalAmount,
            status: status,
            url: '#',
            customerId: user?.id || 'unknown',
            customerName: user?.companyName || user?.fullName || 'Valued Customer',
            customerAddress: ['123 Cloud Way', 'Tech City, TC 10101', user?.country || 'USA'], 
            customerEmail: user?.email || '',
            billingPeriod: 'Immediate Action',
            nextBillingDate: 'N/A', 
            subscriptionId: subscription.id,
            lineItems: finalLineItems,
            subTotal: totalAmount,
            tax: { label: 'Tax (0%)', amount: 0 },
            payments: status === 'Paid' ? totalAmount : 0,
            amountDue: status === 'Paid' ? 0 : totalAmount,
            paymentDetails: status === 'Paid' ? 'Paid via Wallet/Credit Card' : 'Payment Due upon Receipt',
            dueDate: dueDate.toISOString(),
            packageName: subscription.productName,
            type: type === 'Add-on' || type === 'Wallet Top-up' ? 'New Subscription' : type 
        };

        mockInvoices.unshift(newInvoice);
        if (onClose) onClose(); 
        navigate(`/app/invoices/${newInvoiceId}`);
    };

    const handleProcessTopUp = () => {
        if (typeof topUpAmount === 'number' && topUpAmount > 0) {
            setIsTopUpProcessing(true);
            setTimeout(() => {
                const newBalance = walletBalance + topUpAmount;
                setWalletBalance(newBalance);
                localStorage.setItem(WALLET_STORAGE_KEY, newBalance.toString());
                setIsTopUpProcessing(false);
                const lineItems: InvoiceLineItem[] = [{ description: 'Wallet Funds Addition', units: 1, amount: topUpAmount }];
                lineItems[0].description += `\nTransaction Reference: ${uuidv4().substring(0,8).toUpperCase()}`;
                generateAndNavigateToInvoice('Wallet Top-up', lineItems, topUpAmount, 0, 'Paid');
            }, 1500);
        }
    };

    const handleConfirmRenewal = (cost: number, newEndDate: Date) => {
        let specs = '';
        if (subscription.category === 'cloudedge') {
            const plan = CLOUDEDGE_UPGRADE_OPTIONS.find(p => p.name.includes(subscription.infraTier || ''));
            specs = plan ? plan.specs : (subscription.infraTier === 'Type I' ? '4 vCPU, 16 GB RAM' : '8 vCPU, 32 GB RAM, GPU Capable');
            specs += ' | Region: EU (Frankfurt)';
        } else if (subscription.category === 'posta') {
             const plan = PLANS.find(p => p.name === subscription.productName);
             if (plan && plan.features.length > 0) specs = `Includes: ${plan.features.slice(0, 3).join(', ')}`;
        }

        const description = [
            `Subscription Renewal: ${subscription.productName} [${subscription.id}]`,
            specs ? `Specs: ${specs}` : '',
            `Renewal Period: ${renewCycle === 'monthly' ? '1 Month' : '1 Year'} Extension`,
            `New Expiration Date: ${newEndDate.toLocaleDateString()}`
        ].filter(Boolean).join('\n');

        const lineItems: InvoiceLineItem[] = [{ description, units: 1, amount: cost }];
        generateAndNavigateToInvoice('Renewal', lineItems, cost, 7, 'Unpaid');
    };

    const handleConfirmAddons = () => {
        const lineItems: InvoiceLineItem[] = [];
        let total = 0;

        if (subscription.category === 'posta') {
            const cost = postaAddonUsers * 5.50;
            lineItems.push({
                description: `Add-on Licenses: Posta User Seats\nPlan: ${subscription.productName}`,
                units: postaAddonUsers,
                amount: cost
            });
            total += cost;
        } else {
            if (ceAddonDisk > 0) {
                const diskCost = ceAddonDisk * 0.15;
                lineItems.push({ description: `Resource Expansion: Flash Disk (NVMe)\nCapacity: ${ceAddonDisk} GB`, units: 1, amount: diskCost });
                total += diskCost;
            }
            if (ceAddonGpu) {
                const gpuCost = 150.00;
                lineItems.push({ description: `Hardware Attachment: GPU Acceleration Module`, units: 1, amount: gpuCost });
                total += gpuCost;
            }
            if (ceAddonIps > 0) {
                const ipCost = ceAddonIps * 4.00;
                lineItems.push({ description: `Network Resource: Static Public IPs`, units: ceAddonIps, amount: ipCost });
                total += ipCost;
            }
            if (ceAddonBackup > 0) {
                const backupCost = ceAddonBackup * 0.05;
                lineItems.push({ description: `Data Protection: Advanced Backup (Veeam)\nQuota: ${ceAddonBackup} GB`, units: 1, amount: backupCost });
                total += backupCost;
            }
        }

        if (total > 0) generateAndNavigateToInvoice('Add-on', lineItems, total, 0, 'Unpaid');
        else alert("Please select resources to add.");
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr || dateStr === 'N/A' || dateStr === 'N/a') return 'Continuous';
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? 'Continuous' : date.toLocaleDateString();
    };

    const handleOpenInFullPage = () => {
        const viewAsUser = searchParams.get('viewAsUser');
        const query = viewAsUser ? `?viewAsUser=${viewAsUser}` : '';
        navigate(`/app/billing/subscriptions/manage/${subscription.id}${query}`);
        if (onClose) onClose();
    };

    const renderOverview = () => {
        if (subscription.category === 'cloudedge') {
             const specs = [
                 { label: 'Infrastructure Tier', value: subscription.infraTier || 'Type I' },
                 { label: 'Region', value: 'EU (Frankfurt)' },
                 { label: 'Compute', value: '4 vCPU, 16 GB RAM' },
                 { label: 'Storage', value: '100 GB NVMe SSD' },
                 { label: 'Network', value: '1 Static IP, 1 Gbps Uplink' },
                 { label: 'Provisioning', value: 'Regular' },
             ];
            return (
                <div className="space-y-6 animate-fade-in">
                    {isPayg && (
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg border border-purple-500/30">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Icon name="fas fa-magic" /> Switch to Subscription & Save</h3>
                                    <p className="text-purple-100 text-sm max-w-xl leading-relaxed">Convert now to lock in price protection and save up to <strong>20%</strong> on your resources.</p>
                                </div>
                                <Button onClick={() => setActiveTab('upgrade')} className="bg-white text-purple-700 hover:bg-gray-100 border-none font-bold whitespace-nowrap">Convert Now</Button>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {specs.map((spec, index) => (
                            <div key={index} className="p-4 bg-gray-50 dark:bg-slate-700/30 rounded-lg border border-gray-200 dark:border-slate-600">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">{spec.label}</p>
                                <p className="text-lg font-medium text-[#293c51] dark:text-gray-100 mt-1">{spec.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        const postaSpecs = [
             { label: 'Plan Level', value: subscription.productName },
             { label: 'Active Licenses', value: '10 Users' },
             { label: 'Storage Quota', value: subscription.productName.includes('Enterprise') ? '1 TB / User' : '100 GB / User' },
             { label: 'Domains', value: subscription.productName.includes('Enterprise') ? 'Unlimited' : '5 Hosted Domains' },
        ];
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {postaSpecs.map((spec, index) => (
                        <div key={index} className="p-4 bg-gray-50 dark:bg-slate-700/30 rounded-lg border border-gray-200 dark:border-slate-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">{spec.label}</p>
                            <p className="text-lg font-medium text-[#293c51] dark:text-gray-100 mt-1">{spec.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderRenew = () => {
        let currentPlan: any = null;
        if (subscription.category === 'posta') currentPlan = PLANS.find(p => p.name === subscription.productName);
        else currentPlan = CLOUDEDGE_UPGRADE_OPTIONS.find(p => p.name.includes(subscription.infraTier || ''));
        
        const basePrice = currentPlan ? currentPlan.priceMonthly : 100;
        const yearlyPrice = currentPlan ? (currentPlan.priceYearly || basePrice * 12 * 0.83) : basePrice * 12;
        const currentEndDate = new Date(subscription.endDate);
        const newEndDate = new Date(currentEndDate);
        let cost = 0;

        if (renewCycle === 'monthly') { newEndDate.setMonth(newEndDate.getMonth() + 1); cost = basePrice; }
        else { newEndDate.setFullYear(newEndDate.getFullYear() + 1); cost = yearlyPrice; }

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="p-4 bg-gray-50 dark:bg-slate-700/30 rounded-lg border border-gray-200 dark:border-slate-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Current Expiration</p>
                        <p className="text-lg font-medium text-[#293c51] dark:text-gray-100 mt-1">{currentEndDate.toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-slate-700/30 rounded-lg border border-gray-200 dark:border-slate-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">New Expiration</p>
                        <p className="text-lg font-medium text-green-600 dark:text-green-400 mt-1">{newEndDate.toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div onClick={() => setRenewCycle('monthly')} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${renewCycle === 'monthly' ? 'border-[#679a41] bg-green-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'}`}>
                        <div className="flex justify-between font-bold mb-2"><span>Monthly</span>{renewCycle === 'monthly' && <Icon name="fas fa-check-circle" className="text-[#679a41]" />}</div>
                        <p className="text-2xl font-bold">${basePrice.toFixed(2)}</p>
                    </div>
                    <div onClick={() => setRenewCycle('yearly')} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${renewCycle === 'yearly' ? 'border-[#679a41] bg-green-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'}`}>
                        <div className="flex justify-between font-bold mb-2"><span>Yearly</span>{renewCycle === 'yearly' && <Icon name="fas fa-check-circle" className="text-[#679a41]" />}</div>
                        <p className="text-2xl font-bold">${yearlyPrice.toFixed(2)} <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full ml-1">SAVE ~15%</span></p>
                    </div>
                </div>
                <div className="flex justify-end pt-4"><Button size="lg" onClick={() => handleConfirmRenewal(cost, newEndDate)}>Process Renewal</Button></div>
            </div>
        );
    };

    const renderAddons = () => {
        let total = 0;
        if (subscription.category === 'posta') { total = postaAddonUsers * 5.50; }
        else {
            total += ceAddonDisk * 0.15;
            total += ceAddonGpu ? 150.00 : 0;
            total += ceAddonIps * 4.00;
            total += ceAddonBackup * 0.05;
        }

        const AddonCard: React.FC<{ title: string; icon: string; children: React.ReactNode; badge?: string; priceText: string }> = ({ title, icon, children, badge, priceText }) => (
            <div className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-[#679a41] dark:text-emerald-400">
                            <Icon name={icon} className="text-xl" />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#293c51] dark:text-gray-100">{title}</h4>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{priceText}</p>
                        </div>
                    </div>
                    {badge && <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase">{badge}</span>}
                </div>
                {children}
            </div>
        );

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                <div className="lg:col-span-2 space-y-6">
                    {subscription.category === 'posta' ? (
                        <>
                            <AddonCard title="Additional Mailboxes" icon="fas fa-user-plus" priceText="$5.50 / user / mo" badge="Popular">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">Scale your organization with additional high-capacity user licenses.</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex-grow">
                                        <SliderInput id="posta-users" label="User Seats" value={postaAddonUsers} onChange={setPostaAddonUsers} min={0} max={500} step={5} unit="Users" />
                                    </div>
                                    <div className="w-20 text-center p-2 bg-gray-50 dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600 font-bold">
                                        +{postaAddonUsers}
                                    </div>
                                </div>
                            </AddonCard>
                            <div className="bg-blue-50 dark:bg-sky-900/10 p-4 rounded-xl border border-blue-100 dark:border-sky-800 flex items-start gap-3">
                                <Icon name="fas fa-info-circle" className="text-blue-500 mt-1" />
                                <div className="text-sm text-blue-800 dark:text-sky-300">
                                    <p className="font-bold mb-1">Parallel Subscription Logic</p>
                                    <p>These seats will be added as a separate billing line item. You can have 100 annual seats and add 10 monthly seats here for temporary staff.</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AddonCard title="Flash Disk Expansion" icon="fas fa-hdd" priceText="$0.15 / GB / mo">
                                <SliderInput id="ce-disk" label="Additional Storage" value={ceAddonDisk} onChange={setCeAddonDisk} min={0} max={2000} step={50} unit="GB" />
                                <p className="text-[10px] text-gray-500 italic mt-1">High-speed NVMe storage for your application data.</p>
                            </AddonCard>
                            <AddonCard title="Static Public IPs" icon="fas fa-map-marker-alt" priceText="$4.00 / IP / mo">
                                <div className="flex items-center gap-3 mt-4">
                                    <Button variant="outline" size="sm" onClick={() => setCeAddonIps(Math.max(0, ceAddonIps - 1))}><Icon name="fas fa-minus"/></Button>
                                    <span className="flex-grow text-center font-bold text-lg">{ceAddonIps} IP{ceAddonIps !== 1 ? 's' : ''}</span>
                                    <Button variant="outline" size="sm" onClick={() => setCeAddonIps(ceAddonIps + 1)}><Icon name="fas fa-plus"/></Button>
                                </div>
                            </AddonCard>
                            <AddonCard title="Veeam Advanced Backup" icon="fas fa-shield-alt" priceText="$0.05 / GB / mo">
                                <SliderInput id="ce-backup" label="Backup Quota" value={ceAddonBackup} onChange={setCeAddonBackup} min={0} max={5000} step={100} unit="GB" />
                            </AddonCard>
                            <AddonCard title="GPU Acceleration" icon="fas fa-microchip" priceText="$150.00 Flat / mo" badge="Performance">
                                <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                    <span className="text-sm font-medium">Enable NVIDIA H100</span>
                                    <ToggleSwitch id="gpu-toggle-addon" checked={ceAddonGpu} onChange={setCeAddonGpu} size="md" />
                                </div>
                            </AddonCard>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <Card title="Impact Summary" className="sticky top-20 border-2 border-gray-100 dark:border-slate-700">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                {subscription.category === 'posta' && postaAddonUsers > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Posta User Seats (x{postaAddonUsers})</span>
                                        <span className="font-semibold">+${(postaAddonUsers * 5.50).toFixed(2)}</span>
                                    </div>
                                )}
                                {subscription.category === 'cloudedge' && (
                                    <>
                                        {ceAddonDisk > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Flash Storage ({ceAddonDisk}GB)</span><span className="font-semibold">+${(ceAddonDisk * 0.15).toFixed(2)}</span></div>}
                                        {ceAddonIps > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Static IPs (x{ceAddonIps})</span><span className="font-semibold">+${(ceAddonIps * 4.00).toFixed(2)}</span></div>}
                                        {ceAddonBackup > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Backup Quota ({ceAddonBackup}GB)</span><span className="font-semibold">+${(ceAddonBackup * 0.05).toFixed(2)}</span></div>}
                                        {ceAddonGpu && <div className="flex justify-between text-sm"><span className="text-gray-500">GPU Acceleration</span><span className="font-semibold">+$150.00</span></div>}
                                    </>
                                )}
                            </div>

                            <div className="pt-4 border-t dark:border-gray-700 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">New Monthly Total</span>
                                    <span className="text-xl font-bold text-[#679a41] dark:text-emerald-400">+${total.toFixed(2)}</span>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-center">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Due Now (Prorated)</p>
                                    <p className="text-2xl font-extrabold text-[#293c51] dark:text-gray-100">${(total * 0.5).toFixed(2)}</p>
                                    <p className="text-[9px] text-gray-400 mt-1 italic">Calculated based on 15 days remaining in cycle.</p>
                                </div>
                                <Button fullWidth size="lg" disabled={total === 0} onClick={handleConfirmAddons} className="shadow-lg shadow-green-500/20">
                                    Apply Resources
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    };

    const renderUpgrade = () => {
        const isPosta = subscription.category === 'posta';
        let availablePlans: any[] = [];
        let currentPlanPrice = 0;
        let currentPlanName = subscription.productName;

        if (isPosta) {
            availablePlans = PLANS.map(p => ({
                id: p.id,
                name: p.name,
                priceMonthly: p.priceMonthly,
                priceYearly: p.priceAnnually,
                features: p.features.slice(0, 3)
            }));
            const currentPlanObj = PLANS.find(p => p.name === subscription.productName);
            currentPlanPrice = currentPlanObj ? currentPlanObj.priceMonthly : 0;
        } else {
            availablePlans = CLOUDEDGE_UPGRADE_OPTIONS;
            if (subscription.infraTier === 'Type I') availablePlans = availablePlans.filter(p => !p.name.includes('Type II'));
            const currentPlanObj = CLOUDEDGE_UPGRADE_OPTIONS.find(p => p.name.includes(subscription.infraTier || ''));
            currentPlanPrice = currentPlanObj ? currentPlanObj.priceMonthly : 150.00;
        }

        const selectedPlan = availablePlans.find(p => p.id === selectedUpgradePlanId);
        const newPrice = selectedPlan ? (upgradeBillingCycle === 'monthly' ? selectedPlan.priceMonthly : (selectedPlan.priceYearly / 12)) : 0;
        const newRecurringTotal = selectedPlan ? (upgradeBillingCycle === 'monthly' ? selectedPlan.priceMonthly : selectedPlan.priceYearly) : 0;
        const prorationRatio = 0.5;
        let immediateCharge = isPayg ? newRecurringTotal : (upgradeEffectiveDate === 'immediate' ? (upgradeBillingCycle === 'monthly' ? Math.max(0, newPrice - currentPlanPrice) * prorationRatio : newRecurringTotal - (currentPlanPrice * prorationRatio)) : 0);
        
        return (
            <div className="space-y-8 animate-fade-in">
                {isPayg && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-4 rounded-r-md">
                        <p className="text-sm font-bold text-purple-800 dark:text-purple-200">Convert to Subscription</p>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">This will stop hourly wallet deductions and start recurring billing.</p>
                    </div>
                )}
                
                {/* 1. Plan Selection */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-[#293c51] dark:text-gray-100 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#679a41] text-white flex items-center justify-center text-xs">1</span>
                        Choose New Plan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {availablePlans.map(plan => {
                            const isSelected = plan.id === selectedUpgradePlanId;
                            const isCurrent = plan.name === currentPlanName || (subscription.infraTier && plan.name.includes(subscription.infraTier));
                            return (
                                <div key={plan.id} onClick={() => !isCurrent && setSelectedUpgradePlanId(plan.id)} className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col ${isCurrent ? 'opacity-50 grayscale cursor-default border-gray-200 bg-gray-50' : isSelected ? 'border-[#679a41] bg-green-50 shadow-md ring-1 ring-[#679a41]/50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-[#293c51] dark:text-gray-100">{plan.name}</h4>
                                        {isSelected && <Icon name="fas fa-check-circle" className="text-[#679a41]" />}
                                    </div>
                                    <p className="text-2xl font-bold text-[#293c51] dark:text-gray-100 mt-2">${(upgradeBillingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly/12).toFixed(2)}/mo</p>
                                    <div className="text-xs text-gray-500 mt-2 line-clamp-2">{plan.specs || (plan.features ? plan.features.join(', ') : 'Enterprise Grade')}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 2. Billing Cycle */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#293c51] dark:text-gray-100 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#679a41] text-white flex items-center justify-center text-xs">2</span>
                            Select Billing Cycle
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setUpgradeBillingCycle('monthly')} className={`p-4 rounded-xl border-2 transition-all flex flex-col gap-1 ${upgradeBillingCycle === 'monthly' ? 'border-[#679a41] bg-green-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'}`}>
                                <span className="font-bold text-sm">Monthly</span>
                                <span className="text-xs text-gray-500">Billed every month</span>
                            </button>
                            <button onClick={() => setUpgradeBillingCycle('yearly')} className={`relative p-4 rounded-xl border-2 transition-all flex flex-col gap-1 ${upgradeBillingCycle === 'yearly' ? 'border-[#679a41] bg-green-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'}`}>
                                <span className="font-bold text-sm">Yearly</span>
                                <span className="text-xs text-gray-500">Save up to 15%</span>
                                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">BEST VALUE</span>
                            </button>
                        </div>
                    </div>

                    {/* 3. Effective Date */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#293c51] dark:text-gray-100 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#679a41] text-white flex items-center justify-center text-xs">3</span>
                            Select Effective Date
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setUpgradeEffectiveDate('immediate')} className={`p-4 rounded-xl border-2 transition-all flex flex-col gap-1 ${upgradeEffectiveDate === 'immediate' ? 'border-[#679a41] bg-green-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'}`}>
                                <span className="font-bold text-sm">Immediate</span>
                                <span className="text-xs text-gray-500">Update now (prorated)</span>
                            </button>
                            <button onClick={() => setUpgradeEffectiveDate('next_cycle')} className={`p-4 rounded-xl border-2 transition-all flex flex-col gap-1 ${upgradeEffectiveDate === 'next_cycle' ? 'border-[#679a41] bg-green-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'}`}>
                                <span className="font-bold text-sm">Next Cycle</span>
                                <span className="text-xs text-gray-500">Apply at next renewal</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. Upgrade Summary */}
                <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 text-[#293c51] dark:text-gray-100">Upgrade Summary</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">New Plan: <span className="font-semibold text-[#293c51] dark:text-gray-100">{selectedPlan?.name || 'Not selected'}</span></span>
                            <span className="font-bold text-[#679a41] dark:text-emerald-400">
                                {upgradeBillingCycle === 'monthly' ? `$${(selectedPlan?.priceMonthly || 0).toFixed(2)}/mo` : `$${(selectedPlan?.priceYearly || 0).toFixed(2)}/yr`}
                            </span>
                        </div>
                        <div className="pt-4 border-t dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-center sm:text-left">
                                <p className="text-xs text-gray-500 uppercase font-bold">Immediate Charge (Prorated)</p>
                                <p className="text-3xl font-extrabold text-[#293c51] dark:text-gray-100">${immediateCharge.toFixed(2)}</p>
                            </div>
                            <Button size="lg" disabled={!selectedPlan} onClick={() => alert('Processing Upgrade...')}>Confirm Upgrade & Secure Pay</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderDowngrade = () => (
        <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm text-orange-800 dark:text-orange-300">Downgrades take effect at the end of the current billing cycle ({formatDate(subscription.endDate)}).</p>
            </div>
            <Button variant="outline" fullWidth>Schedule Downgrade</Button>
        </div>
    );

    const renderWallet = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-end border-b pb-4 dark:border-slate-700">
                <div><p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Current Balance</p><p className="text-4xl font-bold text-[#679a41] dark:text-emerald-400">${walletBalance.toFixed(2)}</p></div>
                <Button variant="secondary" onClick={() => setActiveTab('top_up')}>Top Up Wallet</Button>
            </div>
        </div>
    );

    const renderTopUp = () => (
        <div className="space-y-6 max-w-lg animate-fade-in">
            <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border">
                <p className="text-xs font-semibold text-gray-500 uppercase">Current Balance</p>
                <p className="text-3xl font-bold">${walletBalance.toFixed(2)}</p>
            </div>
            <FormField id="top-up-amt" label="Top Up Amount ($)" type="number" value={topUpAmount} onChange={e => setTopUpAmount(parseFloat(e.target.value) || '')} />
            <Button fullWidth onClick={handleProcessTopUp} disabled={!topUpAmount || isTopUpProcessing} isLoading={isTopUpProcessing}>Proceed to Payment</Button>
        </div>
    );

    const renderAdminTools = () => (
        <div className="space-y-6 animate-fade-in">
             <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-red-800 dark:text-red-300 flex items-center gap-2"><Icon name="fas fa-user-shield" /> Admin Control Zone</h3>
                <p className="text-sm">Advanced lifecycle management tools.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => alert('Force Suspended')}>Force Suspend</Button>
                <Button variant="danger" onClick={() => alert('Force Terminated')}>Force Terminate</Button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#293c51] dark:text-gray-100">{subscription.productName}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: {subscription.id} • Status: <span className="uppercase font-semibold">{subscription.status}</span></p>
                </div>
                {view === 'modal' && (
                    <Button variant="ghost" onClick={handleOpenInFullPage} leftIconName="fas fa-external-link-alt">Open Full Page</Button>
                )}
            </div>

            <div className="border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'upgrade', label: 'Upgrade' },
                        ...(user?.role !== 'customer' ? [{ id: 'downgrade', label: 'Downgrade' }] : []),
                        { id: 'addons', label: 'Add-ons & Resources' },
                        ...(subscription.billingMode === 'payg_wallet' ? [{ id: 'payg_wallet', label: 'Wallet' }] : []),
                        ...(subscription.billingMode === 'subscription' ? [{ id: 'renew', label: 'Renewal' }] : []),
                        ...(user?.role === 'admin' || user?.role === 'reseller' ? [{ id: 'admin_tools', label: 'Admin Tools' }] : []),
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all ${activeTab === tab.id ? 'border-[#679a41] text-[#679a41] dark:border-emerald-400 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{tab.label}</button>
                    ))}
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'upgrade' && renderUpgrade()}
                {activeTab === 'downgrade' && renderDowngrade()}
                {activeTab === 'addons' && renderAddons()}
                {activeTab === 'payg_wallet' && renderWallet()}
                {activeTab === 'top_up' && renderTopUp()}
                {activeTab === 'admin_tools' && renderAdminTools()}
                {activeTab === 'renew' && renderRenew()}
            </div>
        </div>
    );
};

export const ManageSubscriptionPage: React.FC = () => {
    const { subscriptionId } = useParams<{ subscriptionId: string }>();
    const navigate = useNavigate();
    const subscription = useMemo(() => mockSubscriptions.find(s => s.id === subscriptionId), [subscriptionId]);

    if (!subscription) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">Subscription Not Found</h2>
                <Button onClick={() => navigate('/app/billing')} className="mt-4">Back to Billing</Button>
            </div>
        );
    }

    return (
        <Card>
            <div className="mb-4">
                <Button variant="ghost" onClick={() => navigate('/app/billing')} leftIconName="fas fa-arrow-left">Back to Subscriptions</Button>
            </div>
            <ManageSubscriptionContent subscription={subscription} view="page" />
        </Card>
    );
};