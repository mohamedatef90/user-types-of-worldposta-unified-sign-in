import React, { useState, useEffect } from 'react';
import { billingStore, Subscription, Package } from './billingStore';
import { useAuth } from '@/context';

export const AdminSubscriptionsPage: React.FC = () => {
    const { user } = useAuth();
    const actorEmail = user?.email || 'admin@worldposta.com';

    // State
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | Subscription['status']>('all');
    const [productFilter, setProductFilter] = useState<'all' | 'cloudedge' | 'postagate'>('all');

    // Modals control
    const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isStatusReasonModalOpen, setIsStatusReasonModalOpen] = useState(false);
    const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);

    // Form inputs for modals
    // 1. Assign Form state
    const [assignCustomerName, setAssignCustomerName] = useState('');
    const [assignCustomerEmail, setAssignCustomerEmail] = useState('');
    const [assignCustomerId, setAssignCustomerId] = useState('');
    const [assignPackageId, setAssignPackageId] = useState('');
    const [assignComplimentary, setAssignComplimentary] = useState(false);
    const [assignReason, setAssignReason] = useState('New corporate contract');

    // 2. Status toggle feedback
    const [targetStatus, setTargetStatus] = useState<Subscription['status']>('suspended');
    const [statusReason, setStatusReason] = useState('');

    // 3. Extend cycles
    const [extendDays, setExtendDays] = useState(30);
    const [extendReason, setExtendReason] = useState('Customer resolution compensation');

    // 4. Upgrade plan
    const [upgradePackageId, setUpgradePackageId] = useState('');
    const [upgradeReason, setUpgradeReason] = useState('Customer upgraded via account sales representative');

    // 5. Add-on state
    const [addonName, setAddonName] = useState('Ultra Advanced DDoS Shielding');
    const [addonPrice, setAddonPrice] = useState(25.0);
    const [addonDuration, setAddonDuration] = useState(90);

    useEffect(() => {
        refreshState();
    }, []);

    const refreshState = () => {
        setSubscriptions(billingStore.getSubscriptions());
        setPackages(billingStore.getPackages().filter(p => p.status === 'active'));
    };

    const handleAssignSubscription = (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignCustomerName || !assignCustomerEmail || !assignPackageId) {
            alert('Please check form fields, customer name, email, and package coordinates.');
            return;
        }

        const pkgObj = packages.find(p => p.id === assignPackageId);
        if (!pkgObj) return;

        const custId = assignCustomerId ? assignCustomerId : `cust-${Date.now().toString().slice(-4)}`;

        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 30); // 30 day cycle

        billingStore.assignSubscription({
            customerId: custId,
            customerName: assignCustomerName,
            customerEmail: assignCustomerEmail,
            packageId: pkgObj.id,
            packageName: pkgObj.name,
            product: pkgObj.product,
            status: 'active',
            billingMode: pkgObj.billingMode,
            startDate: start.toISOString(),
            currentCycleStart: start.toISOString(),
            currentCycleEnd: end.toISOString(),
            trialEndsAt: null,
            price: assignComplimentary ? 0 : pkgObj.price,
            isComplimentary: assignComplimentary,
        }, actorEmail);

        // Reset
        setAssignCustomerName('');
        setAssignCustomerEmail('');
        setAssignCustomerId('');
        setAssignPackageId('');
        setIsAssignModalOpen(false);

        refreshState();
    };

    const triggerStatusChange = (sub: Subscription, nextStatus: Subscription['status']) => {
        setSelectedSub(sub);
        setTargetStatus(nextStatus);
        setStatusReason(nextStatus === 'suspended' ? 'Payment delinquency cycle' : 'Renewal invoice confirmed manually');
        setIsStatusReasonModalOpen(true);
    };

    const submitStatusChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedSub) {
            billingStore.modifySubscriptionStatus(selectedSub.id, targetStatus, statusReason, actorEmail);
            setIsStatusReasonModalOpen(false);
            setSelectedSub(null);
            refreshState();
        }
    };

    const triggerExtend = (sub: Subscription) => {
        setSelectedSub(sub);
        setIsExtendModalOpen(true);
    };

    const submitExtension = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedSub) {
            billingStore.extendSubscription(selectedSub.id, extendDays, extendReason, actorEmail);
            setIsExtendModalOpen(false);
            setSelectedSub(null);
            refreshState();
        }
    };

    const triggerUpgrade = (sub: Subscription) => {
        setSelectedSub(sub);
        const firstAvailable = packages.find(p => p.id !== sub.packageId);
        setUpgradePackageId(firstAvailable?.id || '');
        setIsUpgradeModalOpen(true);
    };

    const submitUpgrade = (e: React.FormEvent) => {
        e.preventDefault();
        const pkgObj = packages.find(p => p.id === upgradePackageId);
        if (selectedSub && pkgObj) {
            billingStore.upgradeSubscription(selectedSub.id, pkgObj, upgradeReason, actorEmail);
            setIsUpgradeModalOpen(false);
            setSelectedSub(null);
            refreshState();
        }
    };

    const triggerAddon = (sub: Subscription) => {
        setSelectedSub(sub);
        setIsAddonModalOpen(true);
    };

    const submitAddon = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedSub && addonName) {
            billingStore.addSubscriptionAddon(selectedSub.id, addonName, addonPrice, addonDuration, 'Manual Admin Addon Attachment', actorEmail);
            setIsAddonModalOpen(false);
            setSelectedSub(null);
            refreshState();
        }
    };

    // Filters logic
    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesSearch = sub.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              sub.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              sub.packageName.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' ? true : sub.status === statusFilter;
        const matchesProduct = productFilter === 'all' ? true : sub.product === productFilter;
        return matchesSearch && matchesStatus && matchesProduct;
    });

    return (
        <div className="p-6 max-w-[98%] mx-auto w-full animate-fade-in">
            {/* Page Title & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <span className="text-xs uppercase font-extrabold text-[#679a41] tracking-widest bg-[#679a41]/10 px-2.5 py-1 rounded-full">
                        Global Tracker
                    </span>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Subscriptions & Term Services</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
                        Monitor live account tiers, execute proration updates, and allocate custom add-ons or expiration offsets.
                    </p>
                </div>
                <button 
                    onClick={() => {
                        if (packages.length === 0) {
                            alert('Define an active pricing package template first.');
                            return;
                        }
                        setAssignPackageId(packages[0].id);
                        setIsAssignModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-[#679a41] hover:bg-[#5b873a] text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all"
                >
                    <i className="fas fa-plus" />
                    Assign Service Plan
                </button>
            </div>

            {/* Quick Filter Controls */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <button 
                        onClick={() => setStatusFilter('all')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${statusFilter === 'all' ? 'bg-[#679a41] text-white' : 'bg-gray-100 text-gray-600 dark:bg-slate-900 dark:text-gray-300 hover:bg-gray-200'}`}
                    >
                        All Statuses ({subscriptions.length})
                    </button>
                    <button 
                        onClick={() => setStatusFilter('active')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${statusFilter === 'active' ? 'bg-[#679a41] text-white' : 'bg-gray-100 text-gray-600 dark:bg-slate-900 dark:text-gray-300'}`}
                    >
                        Active ({subscriptions.filter(s => s.status === 'active').length})
                    </button>
                    <button 
                        onClick={() => setStatusFilter('suspended')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${statusFilter === 'suspended' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-slate-900 dark:text-gray-300'}`}
                    >
                        Suspended ({subscriptions.filter(s => s.status === 'suspended').length})
                    </button>
                    <button 
                        onClick={() => setStatusFilter('expired')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${statusFilter === 'expired' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-slate-900 dark:text-gray-300'}`}
                    >
                        Expired ({subscriptions.filter(s => s.status === 'expired').length})
                    </button>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <select 
                        value={productFilter} 
                        onChange={(e: any) => setProductFilter(e.target.value)}
                        className="bg-gray-100 dark:bg-slate-900 border-none rounded-lg text-xs font-bold p-2.5 text-gray-600 dark:text-gray-300"
                    >
                        <option value="all">All Products</option>
                        <option value="cloudedge">CloudEdge</option>
                        <option value="postagate">Postagate</option>
                    </select>
                    
                    <input 
                        type="text"
                        placeholder="Search company, emails..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-3 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#679a41]"
                    />
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 text-left">
                        <thead className="bg-gray-50 dark:bg-slate-900/50">
                            <tr className="text-xs font-extrabold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                                <th className="px-4 py-4">Customer Info</th>
                                <th className="px-4 py-4">Package Tier</th>
                                <th className="px-4 py-4">Sub-billing Mode</th>
                                <th className="px-4 py-4">Current Cycle Thresholds</th>
                                <th className="px-4 py-4 text-center">Active Add-ons</th>
                                <th className="px-4 py-4">Status</th>
                                <th className="px-4 py-4 text-right">Console Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700 text-sm">
                            {filteredSubscriptions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-900/20">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div>
                                            <p className="font-extrabold text-slate-800 dark:text-gray-100">{sub.customerName}</p>
                                            <p className="text-xs text-gray-400 font-medium">{sub.customerEmail}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="font-bold text-slate-800 dark:text-gray-200">{sub.packageName}</p>
                                        <p className="text-[10px] text-gray-400 lowercase italic">Reference: {sub.id}</p>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold leading-none uppercase ${sub.billingMode === 'subscription' ? 'bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-950/20' : 'bg-indigo-50 text-indigo-700'}`}>
                                            {sub.billingMode}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 font-semibold">
                                        <div className="space-y-0.5">
                                            <p>Start: {new Date(sub.startDate).toLocaleDateString()}</p>
                                            <p className="text-amber-600 dark:text-amber-400">End: {new Date(sub.currentCycleEnd).toLocaleDateString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center whitespace-nowrap">
                                        {sub.addOns.length === 0 ? (
                                            <span className="text-xs text-gray-400 italic">None</span>
                                        ) : (
                                            <div className="inline-flex gap-1.5">
                                                {sub.addOns.map((add) => (
                                                    <span key={add.id} className="px-2 py-0.5 bg-sky-50 dark:bg-sky-950/20 text-sky-600 text-xs font-extrabold rounded border border-sky-100 dark:border-sky-900" title={`Exp: ${add.endDate}`}>
                                                        {add.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                                            sub.status === 'active' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900' : 
                                            sub.status === 'trial' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                            sub.status === 'suspended' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30' :
                                            'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30'
                                        }`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-1.5">
                                            {sub.status === 'active' ? (
                                                <button 
                                                    onClick={() => triggerStatusChange(sub, 'suspended')}
                                                    className="px-2 py-1 border border-amber-200 dark:border-amber-800 text-amber-600 rounded text-xs font-bold hover:bg-amber-50"
                                                >
                                                    Suspend
                                                </button>
                                            ) : sub.status === 'suspended' || sub.status === 'expired' ? (
                                                <button 
                                                    onClick={() => triggerStatusChange(sub, 'active')}
                                                    className="px-2 py-1 border border-green-200 dark:border-green-800 text-green-600 rounded text-xs font-bold hover:bg-green-50"
                                                >
                                                    Reactivate
                                                </button>
                                            ) : null}

                                            <button 
                                                onClick={() => triggerExtend(sub)}
                                                className="px-2 py-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-gray-300 rounded text-xs font-bold hover:bg-slate-50"
                                            >
                                                Extend Expiry
                                            </button>

                                            <button 
                                                onClick={() => triggerUpgrade(sub)}
                                                className="px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-white rounded text-xs font-bold"
                                            >
                                                Upgrade Plan
                                            </button>

                                            <button 
                                                onClick={() => triggerAddon(sub)}
                                                title="Allocate Add-on"
                                                className="px-2.5 py-1 text-slate-500 hover:text-[#679a41] rounded text-sm font-bold"
                                            >
                                                <i className="fas fa-puzzle-piece" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 1. ASSIGN PLAN MODAL */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl max-w-lg w-full p-6">
                        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2">Assign Platform Plan</h2>
                        <p className="text-xs text-gray-500 mb-4">Direct customer onboarding subscription template.</p>
                        
                        <form onSubmit={handleAssignSubscription} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Customer Name</label>
                                <input 
                                    type="text" required placeholder="e.g. Initech Engineering"
                                    value={assignCustomerName} onChange={(e) => setAssignCustomerName(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Customer Email</label>
                                <input 
                                    type="email" required placeholder="e.g. admin@initech.co"
                                    value={assignCustomerEmail} onChange={(e) => setAssignCustomerEmail(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Select Billing Package Template</label>
                                <select 
                                    value={assignPackageId} onChange={(e) => setAssignPackageId(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white font-medium"
                                >
                                    {packages.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - ${p.price.toFixed(2)} / {p.billingCycle || 'PAYG'}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <input 
                                    type="checkbox" checked={assignComplimentary} onChange={(e) => setAssignComplimentary(e.target.checked)}
                                    className="w-4 h-4 text-[#679a41] border-gray-300 rounded focus:ring-[#679a41]"
                                />
                                <span className="text-xs text-gray-700 dark:text-gray-300 font-bold">Complimentary Allocation (Excludes MRR and invoicing)</span>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-[#679a41] text-white rounded-lg text-sm font-semibold hover:bg-[#5b873a]">Onboard Subscriber</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. STATUS REASON REASON MODAL */}
            {isStatusReasonModalOpen && selectedSub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl max-w-md w-full p-6">
                        <h2 className="text-lg font-extrabold text-slate-800 dark:text-white mb-2">Change Service Status</h2>
                        <p className="text-xs text-gray-500 mb-4">You are transitioning {selectedSub.customerName} to <span className="font-extrabold text-red-600 dark:text-red-400 uppercase">{targetStatus}</span>.</p>
                        
                        <form onSubmit={submitStatusChange} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Administrative Reason Note</label>
                                <textarea 
                                    required rows={3} placeholder="Please give reference coordinates or citation reasons..."
                                    value={statusReason} onChange={(e) => setStatusReason(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsStatusReasonModalOpen(false)} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg font-semibold text-sm">Commit Override</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. EXTEND CYCLES MODAL */}
            {isExtendModalOpen && selectedSub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl max-w-md w-full p-6">
                        <h2 className="text-lg font-extrabold text-slate-800 dark:text-white mb-2">Offset Cycle Expiry</h2>
                        <p className="text-xs text-gray-500 mb-4">Extend active duration of customer plan without extra invoice allocation charges.</p>
                        
                        <form onSubmit={submitExtension} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Extension Days Offset</label>
                                <input 
                                    type="number" required min="1"
                                    value={extendDays} onChange={(e) => setExtendDays(Number(e.target.value))}
                                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white font-extrabold text-center text-lg text-emerald-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1 font-semibold">Extension Context Reason</label>
                                <input 
                                    type="text" required placeholder="Context / Goodwill / SLA Agreement Support"
                                    value={extendReason} onChange={(e) => setExtendReason(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsExtendModalOpen(false)} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-[#679a41] text-white rounded-lg font-semibold text-sm">Apply Cycles Days</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 4. UPGRADE PLAN MODAL */}
            {isUpgradeModalOpen && selectedSub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl max-w-md w-full p-6">
                        <h2 className="text-lg font-extrabold text-slate-800 dark:text-white mb-1">Upgrade / Transform Subscription</h2>
                        <p className="text-xs text-gray-500 mb-4">Select the new billing package. Proration calculations will be calculated and billed automatically.</p>
                        
                        <form onSubmit={submitUpgrade} className="space-y-4">
                            <div>
                                <p className="text-xs bg-gray-50 dark:bg-slate-900 p-3 rounded-lg text-gray-600 dark:text-gray-300">
                                    Current Plan: <strong className="text-slate-900 dark:text-white">{selectedSub.packageName} (${selectedSub.price.toFixed(2)})</strong>
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Target Platform Package</label>
                                <select 
                                    value={upgradePackageId} onChange={(e) => setUpgradePackageId(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white font-medium"
                                >
                                    {packages.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - ${p.price.toFixed(2)}/mo</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Change Context Reason</label>
                                <input 
                                    type="text" required placeholder="e.g. Upgrade authorized by CEO"
                                    value={upgradeReason} onChange={(e) => setUpgradeReason(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsUpgradeModalOpen(false)} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-purple-600 text-white rounded-lg font-semibold text-sm">Commit Switch</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 5. ADD-ON MODAL */}
            {isAddonModalOpen && selectedSub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl max-w-md w-full p-6">
                        <h2 className="text-lg font-extrabold text-slate-800 dark:text-white mb-2">Attach Premium Add-on</h2>
                        <p className="text-xs text-gray-500 mb-4">Create add-ons attachable with independent pricing & duration boundaries (5.9 specs).</p>
                        
                        <form onSubmit={submitAddon} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Addon Name</label>
                                <input 
                                    type="text" required value={addonName} onChange={(e) => setAddonName(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Price (USD)</label>
                                    <input 
                                        type="number" required min="0" value={addonPrice} onChange={(e) => setAddonPrice(Number(e.target.value))}
                                        className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Active Duration (Days)</label>
                                    <input 
                                        type="number" required min="1" value={addonDuration} onChange={(e) => setAddonDuration(Number(e.target.value))}
                                        className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setIsAddonModalOpen(false)} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-[#679a41] text-white rounded-lg font-semibold text-sm">Deploy Addon Segment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
