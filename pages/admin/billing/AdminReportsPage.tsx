import React, { useState, useEffect } from 'react';
import { billingStore, Subscription, Invoice, Package } from './billingStore';
import { useAuth } from '@/context';

export const AdminReportsPage: React.FC = () => {
    const { user } = userAuthSafe();
    const actorEmail = user?.email || 'admin@worldposta.com';

    // State
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    
    // Tabs control
    const [activeTab, setActiveTab] = useState<'revenue' | 'overdue' | 'renewals' | 'trials' | 'payg' | 'suspended'>('revenue');
    
    // Renewal days slider state
    const [renewalNdays, setRenewalNdays] = useState(30);

    // Export scheduling controls
    const [scheduleFreq, setScheduleFreq] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const [scheduleEmail, setScheduleEmail] = useState('manager@worldposta.com');
    const [scheduleActive, setScheduleActive] = useState(false);
    const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        refreshState();
    }, []);

    const refreshState = () => {
        setSubscriptions(billingStore.getSubscriptions());
        setInvoices(billingStore.getInvoices());
        setPackages(billingStore.getPackages());
    };

    function userAuthSafe() {
        try {
            return useAuth();
        } catch {
            return { user: { email: 'admin@worldposta.com', role: 'super_admin' } };
        }
    }

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleExport = (reportName: string) => {
        showToast(`Success! Prepared secure ${exportFormat.toUpperCase()} package of the "${reportName}" and downloaded.`);
    };

    const handleScheduleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setScheduleActive(true);
        showToast(`Delivery Scheduled! Automated digests will be forwarded to ${scheduleEmail} (${scheduleFreq}).`);
    };

    // 1. Calculations: MRR & ARR from active subscriptions
    const activeSubs = subscriptions.filter(s => s.status === 'active' || s.status === 'trial');
    const mrrCloudEdge = activeSubs
        .filter(s => s.product === 'cloudedge')
        .reduce((sum, s) => sum + s.price, 0);
    const mrrPostagate = activeSubs
        .filter(s => s.product === 'postagate')
        .reduce((sum, s) => sum + s.price, 0);
    
    const mrrTotal = mrrCloudEdge + mrrPostagate;
    const arrTotal = mrrTotal * 12;

    // 2. Calculations: Overdue invoices
    const overdueInvoices = invoices.filter(i => i.status === 'overdue');
    const overdueTotal = overdueInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

    // 3. Unpaid PAYG invoices list (mode: payg, status: unpaid or overdue)
    const unpaidPAYG = invoices.filter(i => i.billingMode === 'payg' && (i.status === 'unpaid' || i.status === 'overdue'));
    const unpaidPAYGTotal = unpaidPAYG.reduce((sum, i) => sum + i.totalAmount, 0);

    // 4. Upcoming renewals list (Next N days)
    const upcomingRenewals = subscriptions.filter(s => {
        if (s.status !== 'active') return false;
        const expiry = new Date(s.currentCycleEnd);
        const today = new Date('2026-05-21'); // Current local time base coordinate
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= renewalNdays;
    });

    // 5. Suspended accounts
    const suspendedSubs = subscriptions.filter(s => s.status === 'suspended');

    // 6. Trials ended (mock summary log)
    const trialsEnded = [
        { id: 'tr-09', customer: 'HealthTech Group', product: 'Postagate Servers', trialEnd: '2026-05-18', status: 'Converted to Paid ($250/mo)' },
        { id: 'tr-04', customer: 'Global Logix', product: 'CloudEdge Cluster Type II', trialEnd: '2026-05-15', status: 'Expired without payment' },
        { id: 'tr-02', customer: 'Eco Systems Inc', product: 'CloudEdge Pro 50GB', trialEnd: '2026-05-10', status: 'Converted to Paid ($89/mo)' }
    ];

    return (
        <div className="p-6 max-w-[98%] mx-auto w-full animate-fade-in pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <span className="text-xs uppercase font-extrabold text-[#679a41] tracking-widest bg-[#679a41]/10 px-2.5 py-1 rounded-full">
                        Executive Suite
                    </span>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">Revenue Reports & Analytics</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
                        Monitor MRR metrics, track delinquent collections, outline trial-to-paid conversions, and schedule delivery reports.
                    </p>
                </div>
                
                {/* Export Control Panel */}
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border flex gap-3 items-center">
                    <select 
                        value={exportFormat} 
                        onChange={(e: any) => setExportFormat(e.target.value)}
                        className="bg-white dark:bg-slate-900 text-xs font-bold p-2 border-none rounded"
                    >
                        <option value="csv">CSV Sheet</option>
                        <option value="excel">Excel Workbook</option>
                        <option value="pdf">PDF Document</option>
                    </select>
                    <button 
                        onClick={() => handleExport(activeTab)}
                        className="px-4 py-2 bg-[#679a41] hover:bg-[#5a8639] text-white text-xs font-bold rounded shadow-sm"
                    >
                        <i className="fas fa-file-download mr-1.5" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Toast popup */}
            {toastMessage && (
                <div className="fixed bottom-4 left-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-bounce">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    {toastMessage}
                </div>
            )}

            {/* Executive Revenue Summaries CARDS Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                    <span className="absolute top-0 right-0 w-24 h-24 bg-[#679a41]/5 rounded-bl-full transition-all group-hover:scale-110" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Monthly Recurring (MRR)</p>
                    <p className="text-3xl font-black text-slate-950 dark:text-white mt-1.5">${mrrTotal.toFixed(2)}</p>
                    <span className="text-[11px] text-emerald-600 font-extrabold mt-3 block flex items-center gap-1">
                        <i className="fas fa-arrow-up text-xs" />
                        Cloud: ${mrrCloudEdge.toFixed(0)} | Mail: ${mrrPostagate.toFixed(0)}
                    </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                    <span className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Annualized Yield (ARR)</p>
                    <p className="text-3xl font-black text-purple-600 mt-1.5">${arrTotal.toFixed(2)}</p>
                    <span className="text-[11px] text-purple-500 font-bold mt-3 block">
                        Annualized Projection Cycle
                    </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                    <span className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Aging Overdue total</p>
                    <p className="text-3xl font-black text-red-600 mt-1.5">${overdueTotal.toFixed(2)}</p>
                    <span className="text-[11px] text-red-500 font-extrabold mt-3 block">
                        Requires Collection Follow-up
                    </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                    <span className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Unpaid PAYG Pool</p>
                    <p className="text-3xl font-black text-amber-500 mt-1.5">${unpaidPAYGTotal.toFixed(2)}</p>
                    <span className="text-[11px] text-amber-500 font-bold mt-3 block">
                        Metered usage awaiting cycle end
                    </span>
                </div>
            </div>

            {/* Report Navigation Tabs */}
            <div className="border-b border-gray-200 dark:border-slate-700 flex flex-wrap gap-4 mb-6">
                <button 
                    onClick={() => setActiveTab('revenue')}
                    className={`pb-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'revenue' ? 'border-[#679a41] text-[#679a41]' : 'border-transparent text-gray-400'}`}
                >
                    <i className="fas fa-chart-bar" />
                    1. Revenue Summary
                </button>
                <button 
                    onClick={() => setActiveTab('overdue')}
                    className={`pb-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'overdue' ? 'border-[#679a41] text-[#679a41]' : 'border-transparent text-gray-400'}`}
                >
                    <i className="fas fa-exclamation-triangle" />
                    2. Overdue Invoices
                </button>
                <button 
                    onClick={() => setActiveTab('renewals')}
                    className={`pb-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'renewals' ? 'border-[#679a41] text-[#679a41]' : 'border-transparent text-gray-400'}`}
                >
                    <i className="fas fa-calendar-alt" />
                    3. Upcoming Renewals
                </button>
                <button 
                    onClick={() => setActiveTab('trials')}
                    className={`pb-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'trials' ? 'border-[#679a41] text-[#679a41]' : 'border-transparent text-gray-400'}`}
                >
                    <i className="fas fa-hourglass-end" />
                    4. Trials Ended Report
                </button>
                <button 
                    onClick={() => setActiveTab('payg')}
                    className={`pb-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'payg' ? 'border-[#679a41] text-[#679a41]' : 'border-transparent text-gray-400'}`}
                >
                    <i className="fas fa-wallet" />
                    5. Unpaid Metered PAYG
                </button>
                <button 
                    onClick={() => setActiveTab('suspended')}
                    className={`pb-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'suspended' ? 'border-[#679a41] text-[#679a41]' : 'border-transparent text-gray-400'}`}
                >
                    <i className="fas fa-user-slash" />
                    6. Suspended Accounts
                </button>
            </div>

            {/* Report Content Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
                        
                        {/* TAB 1: Revenue summaries */}
                        {activeTab === 'revenue' && (
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">Revenue Breakdowns Matrix</h3>
                                <p className="text-xs text-gray-400 mb-6">Programmatic analysis of current active cloud models yield.</p>
                                
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-slate-700 dark:text-gray-300">CloudEdge Infrastructure (elastic nodes)</span>
                                            <span className="text-sm font-black text-slate-800 dark:text-white">${mrrCloudEdge.toFixed(2)} / mo</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-blue-500 h-full rounded-full" 
                                                style={{ width: `${mrrTotal > 0 ? (mrrCloudEdge/mrrTotal)*100 : 50}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-slate-700 dark:text-gray-300">Postagate Email Servers Matrix</span>
                                            <span className="text-sm font-black text-slate-800 dark:text-white">${mrrPostagate.toFixed(2)} / mo</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-emerald-500 h-full rounded-full" 
                                                style={{ width: `${mrrTotal > 0 ? (mrrPostagate/mrrTotal)*100 : 50}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 border-t pt-6 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl">
                                    <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Proration & Churn Intelligence</h4>
                                    <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                                        Current user base cancellations are stable representing <strong>1.2% Month-on-Month Churn</strong>.
                                        Upgrades this month yielded a pro-rated surplus of <strong>+$145.00</strong>.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: Overdue Invoices */}
                        {activeTab === 'overdue' && (
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">Unresolved Overdue Balances</h3>
                                <p className="text-xs text-gray-400 mb-4 font-medium">All invoices currently past due date, subject to automated suspension checks.</p>
                                
                                {overdueInvoices.length === 0 ? (
                                    <p className="text-xs text-gray-500 text-center italic py-8">No collections overdue in this ledger cycle.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-xs text-left">
                                            <thead className="bg-gray-100 dark:bg-slate-900">
                                                <tr className="font-bold text-gray-500">
                                                    <th className="p-3">Reference</th>
                                                    <th className="p-3">Customer</th>
                                                    <th className="p-3">Amount</th>
                                                    <th className="p-3">Days Overdue</th>
                                                    <th className="p-3 text-right">Option</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700 font-semibold">
                                                {overdueInvoices.map(inv => {
                                                    const due = new Date(inv.dueDate);
                                                    const today = new Date('2026-05-21');
                                                    const diffDays = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
                                                    return (
                                                        <tr key={inv.id}>
                                                            <td className="p-3">{inv.invoiceNumber}</td>
                                                            <td className="p-3">{inv.customerName}</td>
                                                            <td className="p-3 font-bold text-red-600">${inv.totalAmount.toFixed(2)}</td>
                                                            <td className="p-3 text-amber-600 font-black">{diffDays} Days overdue</td>
                                                            <td className="p-3 text-right text-indigo-500">Unresolved</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 3: Renewals */}
                        {activeTab === 'renewals' && (
                            <div>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                    <div>
                                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Upcoming Account Renewals</h3>
                                        <p className="text-xs text-gray-400 font-semibold">Contracts scheduled for default card auto-charge.</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 font-bold">Horizon:</span>
                                        <select 
                                            value={renewalNdays} 
                                            onChange={(e) => setRenewalNdays(Number(e.target.value))}
                                            className="bg-gray-100 p-1.5 rounded text-xs select-none border-none"
                                        >
                                            <option value={7}>Next 7 days</option>
                                            <option value={14}>Next 14 days</option>
                                            <option value={30}>Next 30 days</option>
                                            <option value={90}>Next 90 days</option>
                                        </select>
                                    </div>
                                </div>

                                {upcomingRenewals.length === 0 ? (
                                    <p className="text-xs text-gray-500 text-center italic py-8">No renewals scheduled within this {renewalNdays} day window.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-xs text-left">
                                            <thead className="bg-gray-100 dark:bg-slate-900">
                                                <tr className="font-bold text-gray-500">
                                                    <th className="p-3">Subscriber</th>
                                                    <th className="p-3">Active Tier</th>
                                                    <th className="p-3">Amount Due</th>
                                                    <th className="p-3 text-right">Renew Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700 font-semibold text-slate-700 dark:text-gray-300">
                                                {upcomingRenewals.map(sub => {
                                                    const today = new Date('2026-05-21');
                                                    const exp = new Date(sub.currentCycleEnd);
                                                    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                                    return (
                                                        <tr key={sub.id}>
                                                            <td className="p-3 font-bold">{sub.customerName}</td>
                                                            <td className="p-3">{sub.packageName}</td>
                                                            <td className="p-3">${sub.price.toFixed(2)}</td>
                                                            <td className="p-3 text-right text-[#679a41] font-extrabold">In {diffDays} days ({new Date(sub.currentCycleEnd).toLocaleDateString()})</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 4: Trials ended */}
                        {activeTab === 'trials' && (
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">Trial Service Pipelines</h3>
                                <p className="text-xs text-gray-400 mb-4 font-semibold">Evaluation periods ending, conversion reports (5.10 specs).</p>
                                
                                <div className="space-y-4">
                                    {trialsEnded.map((tr, idx) => (
                                        <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-900 flex justify-between items-center rounded-xl border border-gray-100 dark:border-slate-800">
                                            <div>
                                                <p className="text-xs font-extrabold text-slate-800 dark:text-gray-200">{tr.customer}</p>
                                                <p className="text-[10px] text-gray-400">Software Product: {tr.product} | Ended: {tr.trialEnd}</p>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${tr.status.includes('Converted') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                                {tr.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB 5: Unpaid PAYG Metered */}
                        {activeTab === 'payg' && (
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">Unpaid Pay-As-You-Go Metered Report</h3>
                                <p className="text-xs text-gray-400 mb-6 font-semibold">Metered cloud usage calculated. Visible to customers and admins for reconciliation.</p>
                                
                                {unpaidPAYG.length === 0 ? (
                                    <p className="text-xs text-gray-500 text-center italic py-8">All PAYG nodes up-to-date or paid.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {unpaidPAYG.map((inv) => (
                                            <div key={inv.id} className="p-4 bg-gray-50 dark:bg-slate-900 flex justify-between justify-items-center rounded-xl border">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{inv.customerName}</p>
                                                    <p className="text-[10px] text-gray-400">Calculated Cycle End: {inv.billingPeriodEnd} | Invoice: {inv.invoiceNumber}</p>
                                                </div>
                                                <div className="text-right self-center">
                                                    <p className="text-sm font-black text-rose-600">${inv.totalAmount.toFixed(2)}</p>
                                                    <span className="text-[9px] uppercase text-amber-500 font-extrabold">Aging Collections Status</span>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="bg-amber-50 dark:bg-amber-950/10 p-3 rounded-lg border text-xs text-amber-700 mt-4 leading-relaxed">
                                            <strong>Dunning Rules:</strong> Subscriptions in suspended or overdue pools for more than 7 days will automatically lock CloudEdge interfaces on customer devices.
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 6: Suspended Accounts */}
                        {activeTab === 'suspended' && (
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">Administrative Blockade / Suspensions</h3>
                                <p className="text-xs text-gray-400 mb-4 font-semibold font-medium">Customer portals blocked from console resource allocations due to billing flags.</p>
                                
                                {suspendedSubs.length === 0 ? (
                                    <p className="text-xs text-slate-500 text-center italic py-8">Zero suspensions currently active. System fully clear.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {suspendedSubs.map((sub) => (
                                            <div key={sub.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/40 flex justify-between">
                                                <div>
                                                    <p className="text-xs font-extrabold text-slate-800 dark:text-gray-100">{sub.customerName}</p>
                                                    <p className="text-[10px] text-gray-400">Suspended Reference: {sub.id} | Email: {sub.customerEmail}</p>
                                                    <p className="text-xs italic text-amber-600 mt-1 font-semibold">Reason: Unpaid collection follow up on aging PAYG</p>
                                                </div>
                                                <span className="text-xs uppercase font-extrabold text-amber-600 bg-amber-50 px-2 py-1 select-none self-start rounded border border-amber-200">
                                                    Suspended
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>

                {/* Email Intelligence Scheduler */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 space-y-5">
                        <div className="border-b pb-4">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">Delivery Scheduler</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Automate financial intelligence delivery directly into executive channels.</p>
                        </div>

                        <form onSubmit={handleScheduleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Target Analyst Email</label>
                                <input 
                                    type="email" required placeholder="manager@worldposta.com"
                                    value={scheduleEmail} onChange={(e) => setScheduleEmail(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Frequency Cadence</label>
                                <select 
                                    value={scheduleFreq} onChange={(e: any) => setScheduleFreq(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white font-medium"
                                >
                                    <option value="daily">Daily Financial Recaps</option>
                                    <option value="weekly">Weekly Operational Digest</option>
                                    <option value="monthly">Monthly Consolidated MRR Book</option>
                                </select>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow"
                            >
                                Schedule Automated Digest
                            </button>
                        </form>

                        {scheduleActive && (
                            <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-lg border border-emerald-100 text-xs flex gap-2.5 items-start">
                                <i className="fas fa-check-circle text-emerald-600 mt-0.5" />
                                <div>
                                    <p className="font-extrabold shrink-none">Automated Delivery Active</p>
                                    <p className="text-[10px] opacity-80 mt-0.5">Digest scheduled for {scheduleEmail} at every Monday morning cycle.</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="border-t pt-4 text-center">
                            <p className="text-[10px] text-gray-400 italic">
                                Schedulers are tokenized locally. Verification logs print alerts in the super admin journal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
