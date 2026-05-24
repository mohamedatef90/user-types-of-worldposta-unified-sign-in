import React, { useState, useEffect } from 'react';
import { billingStore, Invoice } from './billingStore';
import { useAuth } from '@/context';

export const AdminInvoicesPage: React.FC = () => {
    const { user } = userAuthSafe();
    const actorEmail = user?.email || 'admin@worldposta.com';

    // State
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | Invoice['status']>('all');
    
    // Modal & Drawer State
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    
    // Form States
    const [refundReason, setRefundReason] = useState('Service credit agreement modification');
    const [stripeRefundId, setStripeRefundId] = useState('re_stripe_ref123abc');

    useEffect(() => {
        refreshState();
    }, []);

    const refreshState = () => {
        setInvoices(billingStore.getInvoices());
    };

    // Helper for fallback auth
    function userAuthSafe() {
        try {
            return useAuth();
        } catch {
            return { user: { email: 'admin@worldposta.com', role: 'super_admin' } };
        }
    }

    const handleMarkAsPaid = (invId: string) => {
        if (confirm('Verify whether payment has been authorized manually. This restores delinquent accounts immediately.')) {
            billingStore.modifyInvoiceStatus(
                invId, 
                'paid', 
                'In-person authorization or direct bank transfer confirmation wire.', 
                actorEmail,
                { stripeChargeId: `ch_manual_wire_${Math.floor(Math.random()*10000)}` }
            );
            refreshState();
            // sync drawer state
            const updated = billingStore.getInvoices().find(i => i.id === invId);
            if (updated) setSelectedInvoice(updated);
        }
    };

    const handleVoid = (invId: string) => {
        if (confirm('Voiding will mark this invoice as zero and disable any collection attempts. Proceed?')) {
            billingStore.modifyInvoiceStatus(invId, 'voided', 'Erroneous billing generation cycle modification', actorEmail);
            refreshState();
            const updated = billingStore.getInvoices().find(i => i.id === invId);
            if (updated) setSelectedInvoice(updated);
        }
    };

    const handleToggleDunning = (invId: string) => {
        billingStore.toggleDunningBypass(invId, actorEmail);
        refreshState();
        // sync drawer
        const updated = billingStore.getInvoices().find(i => i.id === invId);
        if (updated) setSelectedInvoice(updated);
    };

    const triggerRefund = (inv: Invoice) => {
        setSelectedInvoice(inv);
        setIsRefundModalOpen(true);
    };

    const submitRefund = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedInvoice && refundReason) {
            billingStore.modifyInvoiceStatus(
                selectedInvoice.id, 
                'refunded', 
                refundReason, 
                actorEmail, 
                { stripeChargeId: stripeRefundId }
            );
            setIsRefundModalOpen(false);
            refreshState();
            // sync drawer
            const updated = billingStore.getInvoices().find(i => i.id === selectedInvoice.id);
            if (updated) setSelectedInvoice(updated);
        }
    };

    // Filtered Invoices
    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              inv.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' ? true : inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6 max-w-[98%] mx-auto w-full animate-fade-in">
            {/* Header section */}
            <div className="mb-8">
                <span className="text-xs uppercase font-extrabold text-[#679a41] tracking-widest bg-[#679a41]/10 px-2.5 py-1 rounded-full">
                    Financial Ledger
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">Global Customer Invoices</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
                    Full system access to dunning overrides, refunds, voids, and payments. Automated Stripe integrations are tokenized.
                </p>
            </div>

            {/* Filter Navigation Options Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {(['all', 'paid', 'unpaid', 'overdue', 'refunded', 'voided'] as const).map((st) => (
                        <button 
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${statusFilter === st ? 'bg-[#679a41] text-white shadow-sm' : 'bg-gray-100 text-gray-500 dark:bg-slate-900 hover:bg-gray-200 dark:text-gray-300'}`}
                        >
                            {st} ({invoices.filter(i => st === 'all' ? true : i.status === st).length})
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <i className="fas fa-search text-xs" />
                    </span>
                    <input 
                        type="text"
                        placeholder="Search invoices, company name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#679a41]"
                    />
                </div>
            </div>

            {/* Invoices List Panel Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 text-left">
                        <thead className="bg-gray-50 dark:bg-slate-900/50">
                            <tr className="text-xs font-extrabold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                                <th className="px-4 py-4">Invoice Reference</th>
                                <th className="px-4 py-4">Customer Wallet Profile</th>
                                <th className="px-4 py-4">Pricing Model</th>
                                <th className="px-4 py-4">Issue / Due Timeline</th>
                                <th className="px-4 py-4">Total Amount (USD)</th>
                                <th className="px-4 py-4">Dunning Automation</th>
                                <th className="px-4 py-4">Payment Health</th>
                                <th className="px-4 py-4 text-right">Ledger Console</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700 text-sm">
                            {filteredInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-900/20">
                                    <td className="px-6 py-4 whitespace-nowrap font-extrabold text-[#679a41] dark:text-emerald-400">
                                        {inv.invoiceNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-gray-100">{inv.customerName}</p>
                                            <p className="text-xs text-gray-400 font-medium">{inv.customerEmail}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-xs bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded font-bold uppercase">
                                            {inv.billingMode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 font-semibold">
                                        <div className="space-y-0.5">
                                            <p>Issued: {inv.issueDate}</p>
                                            <p className={inv.status === 'overdue' ? 'text-red-500 font-extrabold' : ''}>Due: {inv.dueDate}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="font-black text-slate-900 dark:text-white text-base">${inv.totalAmount.toFixed(2)}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {inv.isSuspended ? (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                Suspended / Paused
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700 uppercase">
                                                Active Alerts
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold border uppercase ${
                                            inv.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 
                                            inv.status === 'unpaid' ? 'bg-gray-50 text-gray-600 border-gray-200' : 
                                            inv.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-200' : 
                                            'bg-slate-100 text-slate-700 border-slate-205'
                                        }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button 
                                            onClick={() => setSelectedInvoice(inv)}
                                            className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DETAILED PAYMENT RECORD PANEL OVERLAYS */}
            {selectedInvoice && (
                <div className="fixed inset-y-0 right-0 z-50 max-w-xl w-full bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 shadow-2xl flex flex-col justify-between transform transition duration-300 ease-in-out p-6 overflow-y-auto">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-700">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Invoice Details</h2>
                                <p className="text-xs text-gray-400">Comprehensive Stripe record coordinates.</p>
                            </div>
                            <button 
                                onClick={() => setSelectedInvoice(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-500"
                            >
                                <i className="fas fa-times" />
                            </button>
                        </div>

                        {/* Invoice Metadata Box */}
                        <div className="bg-gray-50 dark:bg-slate-900/60 p-4 rounded-xl border border-gray-100 dark:border-slate-700 mt-5 space-y-3.5">
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Number</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">{selectedInvoice.invoiceNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider font-semibold">Entity Ref ID</span>
                                <span className="text-xs text-slate-500 font-mono select-all font-bold">{selectedInvoice.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Customer Organization</span>
                                <span className="text-xs font-extrabold text-slate-800 dark:text-gray-300">{selectedInvoice.customerName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Timeline Period</span>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                    {selectedInvoice.billingPeriodStart} to {selectedInvoice.billingPeriodEnd}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Stripe Charge Reference</span>
                                <span className="text-xs text-indigo-500 font-mono select-all font-black">
                                    {selectedInvoice.stripeChargeId || 'no_charge_token_associated'}
                                </span>
                            </div>
                        </div>

                        {/* Line Items specification */}
                        <div className="mt-6">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-2">Itemized Invoice Charges</h3>
                            <div className="divide-y divide-gray-100 dark:divide-slate-700 border border-gray-100 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                                {selectedInvoice.lineItems.map((item, idx) => (
                                    <div key={idx} className="p-3 flex justify-between justify-items-center">
                                        <div>
                                            <p className="text-xs font-extrabold text-slate-800 dark:text-gray-200">{item.description}</p>
                                            <p className="text-[10px] text-gray-400">Quantity: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                                        </div>
                                        <span className="text-xs font-black text-slate-800 dark:text-white self-center">${item.subtotal.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals Summary */}
                        <div className="mt-5 space-y-1.5 border-t border-gray-100 dark:border-slate-700 pt-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                            <div className="flex justify-between">
                                <span className="font-bold">Subtotal</span>
                                <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold">Estimated Platform Surcharges / Tax</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-gray-50">
                                <span>Total Invoiced Amount</span>
                                <span>${selectedInvoice.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Transaction history logs */}
                        <div className="mt-6 bg-gray-50/55 dark:bg-slate-900/30 p-3 rounded-lg border border-dashed text-xs space-y-2">
                            <p className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Stripe Inbound Audit Events Logs</p>
                            <div className="flex justify-between text-[10px] text-gray-400">
                                <span>{selectedInvoice.createdAt || selectedInvoice.issueDate}</span>
                                <span className="text-green-600 font-bold">● Invoice Finalized</span>
                            </div>
                            {selectedInvoice.status === 'paid' && (
                                <div className="flex justify-between text-[10px] text-gray-400">
                                    <span>{selectedInvoice.issueDate}</span>
                                    <span className="text-emerald-500 font-black">● Automated Card Charge Success</span>
                                </div>
                            )}
                            {selectedInvoice.status === 'refunded' && (
                                <div className="flex flex-col text-[10px] text-gray-400 border-t pt-2 mt-1 gap-1">
                                    <div className="flex justify-between">
                                        <span>Refund Executed</span>
                                        <span className="text-amber-500 font-black">● Stripe Refund Resolved</span>
                                    </div>
                                    <p className="italic text-slate-500 bg-amber-50 dark:bg-amber-950/20 p-1.5 rounded">
                                        Reason: {selectedInvoice.refundReason}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Controls Footer of Drawer */}
                    <div className="border-t border-gray-100 dark:border-slate-700 pt-4 space-y-2.5 bg-white dark:bg-slate-800">
                        <div className="grid grid-cols-2 gap-2">
                            {selectedInvoice.status !== 'paid' && selectedInvoice.status !== 'voided' && selectedInvoice.status !== 'refunded' && (
                                <button 
                                    onClick={() => handleMarkAsPaid(selectedInvoice.id)}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition"
                                >
                                    Force Mark As Paid
                                </button>
                            )}
                            
                            {selectedInvoice.status === 'paid' && (
                                <button 
                                    onClick={() => triggerRefund(selectedInvoice)}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow transition"
                                >
                                    Stripe Refund Void
                                </button>
                            )}

                            {selectedInvoice.status !== 'voided' && selectedInvoice.status !== 'paid' && selectedInvoice.status !== 'refunded' && (
                                <button 
                                    onClick={() => handleVoid(selectedInvoice.id)}
                                    className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition"
                                >
                                    Void Invoice
                                </button>
                            )}

                            <button 
                                onClick={() => handleToggleDunning(selectedInvoice.id)}
                                className="px-4 py-2 border border-slate-200 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition"
                            >
                                {selectedInvoice.isSuspended ? 'Resume Dunning Alerts' : 'Pause Dunning Email Alerts'}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center italic">
                            All Stripe manual overrides execute audit logging trails with the active admin account coordinates.
                        </p>
                    </div>
                </div>
            )}

            {/* STRIPE REFUND MODAL */}
            {isRefundModalOpen && selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-65 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl max-w-sm w-full p-6">
                        <h2 className="text-lg font-extrabold text-slate-800 dark:text-white mb-2">Process Stripe Refund</h2>
                        <p className="text-xs text-gray-400 mb-4">Are you sure you want to refund `${selectedInvoice.totalAmount.toFixed(2)}` for {selectedInvoice.customerName}?</p>
                        
                        <form onSubmit={submitRefund} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Stripe Refund Reference Token</label>
                                <input 
                                    type="text" required
                                    value={stripeRefundId} onChange={(e) => setStripeRefundId(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-indigo-500 font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Refund Action Reason Notice</label>
                                <input 
                                    type="text" required placeholder="Service outage credit or downgrades reimbursement"
                                    value={refundReason} onChange={(e) => setRefundReason(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-gray-800 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setIsRefundModalOpen(false)} className="px-3.5 py-1.5 text-xs text-gray-500 font-semibold">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-amber-500 text-white rounded-lg font-bold text-xs shadow hover:bg-amber-600 transition">Authorize Stripe Refund</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
