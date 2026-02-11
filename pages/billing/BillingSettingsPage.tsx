
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, Icon, Modal, FormField } from '@/components/ui';
import { useAuth } from '@/context';
import { mockSubscriptions } from '@/data';
import type { Subscription } from '@/types';
import { InvoiceHistoryPage } from './InvoiceHistoryPage';

const WALLET_STORAGE_KEY = 'cloudEdgeWalletBalanceUSD';

interface WalletTransaction {
    id: string;
    date: string;
    type: 'top_up' | 'usage_deduction' | 'refund';
    amount: number;
    description: string;
    status: 'completed' | 'pending' | 'failed';
}

const mockWalletTransactions: WalletTransaction[] = [
    { id: 'TX-1001', date: new Date().toISOString(), type: 'top_up', amount: 200.00, description: 'Wallet Top Up via Visa (...4242)', status: 'completed' },
    { id: 'TX-0998', date: new Date(Date.now() - 86400000).toISOString(), type: 'usage_deduction', amount: -12.50, description: 'Hourly Usage: CloudEdge - Production Cluster', status: 'completed' },
    { id: 'TX-0995', date: new Date(Date.now() - 172800000).toISOString(), type: 'usage_deduction', amount: -12.50, description: 'Hourly Usage: CloudEdge - Production Cluster', status: 'completed' },
    { id: 'TX-0990', date: new Date(Date.now() - 259200000).toISOString(), type: 'top_up', amount: 50.00, description: 'Wallet Top Up via PayPal', status: 'completed' },
    { id: 'TX-0850', date: new Date(Date.now() - 604800000).toISOString(), type: 'usage_deduction', amount: -45.00, description: 'Monthly Add-on: Premium Support', status: 'completed' },
];

export const PaymentAndDetailsView: React.FC = () => {
    const { user } = useAuth();
    const [walletBalance, setWalletBalance] = useState<number>(() => {
        const saved = localStorage.getItem(WALLET_STORAGE_KEY);
        return saved ? parseFloat(saved) : 200.00;
    });
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState<number | ''>('');

    const handleTopUp = () => {
        if (typeof topUpAmount === 'number' && topUpAmount > 0) {
            const newBalance = walletBalance + topUpAmount;
            setWalletBalance(newBalance);
            localStorage.setItem(WALLET_STORAGE_KEY, newBalance.toString());
            setTopUpAmount('');
            setIsTopUpModalOpen(false);
            alert(`Success! $${topUpAmount.toFixed(2)} has been added to your wallet.`);
        }
    };

    const handleManageStripe = () => {
        window.open('https://stripe.com/', '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-[#293c51] dark:text-gray-100 flex items-center gap-2 mb-4">
                            <Icon name="fas fa-wallet" className="text-[#679a41] dark:text-emerald-400" />
                            My Wallet
                        </h3>
                        <div className="p-4 bg-gray-50 dark:bg-slate-900/40 rounded-xl border border-gray-100 dark:border-slate-700 text-center">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Current Balance</p>
                            <p className="text-4xl font-extrabold text-[#679a41] dark:text-emerald-400 mt-2">${walletBalance.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="mt-6 space-y-2">
                        <Button fullWidth onClick={() => setIsTopUpModalOpen(true)} leftIconName="fas fa-plus-circle">Top Up Wallet</Button>
                    </div>
                </Card>

                <Card title="Auto-Pay Settings" className="flex flex-col justify-between">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                <Icon name="fas fa-sync" className="text-green-600" />
                            </div>
                            <p className="font-semibold text-sm">Auto-Renew Enabled</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Button variant="ghost" fullWidth className="text-red-600 hover:bg-red-50 text-xs">Disable Auto-Pay</Button>
                    </div>
                </Card>

                <Card title="Payment Methods" className="flex flex-col justify-between">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 text-center">Your saved payment methods are managed securely through Stripe.</p>
                        <div className="flex items-center justify-center p-6 border rounded-lg dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/20">
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png" 
                                alt="Stripe Logo" 
                                className="h-10 object-contain"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <Button variant="outline" fullWidth size="sm" leftIconName="fas fa-external-link-alt" onClick={handleManageStripe}>Manage in Stripe</Button>
                    </div>
                </Card>
            </div>

            <Card title="Wallet Transaction History">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-slate-700 font-semibold text-gray-600 dark:text-gray-300">
                            <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                <th className="px-4 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {mockWalletTransactions.map(tx => (
                                <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                                    <td className="px-4 py-3 text-gray-500">{new Date(tx.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 font-medium">{tx.description}</td>
                                    <td className={`px-4 py-3 text-right font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-[#293c51] dark:text-gray-200'}`}>
                                        {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal 
                isOpen={isTopUpModalOpen} 
                onClose={() => setIsTopUpModalOpen(false)} 
                title="Top Up Wallet" 
                size="sm"
                footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setIsTopUpModalOpen(false)}>Cancel</Button><Button onClick={handleTopUp} disabled={!topUpAmount || topUpAmount <= 0}>Add Funds</Button></div>}
            >
                <div className="space-y-4">
                    <FormField id="top-up-amount" label="Amount (USD)" type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(parseFloat(e.target.value) || '')} placeholder="0.00" />
                </div>
            </Modal>
        </div>
    );
};

export const SubscriptionsListView: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<'cloudedge' | 'posta' | null>(null);

    const handleManage = (sub: Subscription) => {
        const viewAsUser = searchParams.get('viewAsUser');
        const query = viewAsUser ? `?viewAsUser=${viewAsUser}` : '';
        navigate(`/app/billing/subscriptions/manage/${sub.id}${query}`);
    };

    const handleConfirmSelection = () => {
        if (!selectedProduct) return;
        
        setIsAddProductModalOpen(false);
        if (selectedProduct === 'cloudedge') {
            navigate('/app/billing/provisioning');
        } else {
            navigate('/app/billing/posta');
        }
    };

    return (
        <>
            <Card className="animate-fade-in" title="My Active Subscriptions" titleActions={
                <Button size="sm" variant="primary" onClick={() => { setSelectedProduct(null); setIsAddProductModalOpen(true); }} leftIconName="fas fa-plus">deploy new product subscription</Button>
            }>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-slate-700 font-semibold text-gray-600 dark:text-gray-300">
                            <tr>
                                <th className="px-4 py-4">Service & Plan</th>
                                <th className="px-4 py-4">Status</th>
                                <th className="px-4 py-4">Billing Model</th>
                                <th className="px-4 py-4">Term / Expiration</th>
                                <th className="px-4 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {mockSubscriptions.map(sub => {
                                const isCloud = sub.category === 'cloudedge';
                                // Structure name based on best practice: Brand > Category > Specific Instance/Plan
                                const brandName = "WorldPosta";
                                const categoryName = isCloud ? "CloudEdge" : "Posta Email";
                                
                                return (
                                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 group transition-colors">
                                        <td className="px-4 py-5">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isCloud ? 'bg-blue-50 text-blue-600 dark:bg-sky-900/30' : 'bg-green-50 text-[#679a41] dark:bg-emerald-900/30'}`}>
                                                    <Icon name={isCloud ? 'fas fa-cloud' : 'fas fa-envelope'} className="text-lg" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">
                                                        {brandName} {categoryName}
                                                    </p>
                                                    <p className="font-bold text-base text-[#293c51] dark:text-gray-100 leading-tight">
                                                        {sub.productName}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5 align-middle">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-5 align-middle">
                                            <div className="flex items-center gap-2">
                                                <Icon name={sub.billingMode === 'payg_wallet' ? 'fas fa-wallet text-blue-500' : 'fas fa-calendar-check text-[#679a41]'} className="text-xs" />
                                                <span className="text-gray-700 dark:text-gray-300 font-medium capitalize">{sub.billingMode.replace('_', ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5 align-middle">
                                            <div className="text-sm">
                                                {sub.endDate === 'N/A' ? (
                                                    <span className="text-gray-400 italic">Continuous</span>
                                                ) : (
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-[#293c51] dark:text-gray-200">{new Date(sub.endDate).toLocaleDateString()}</span>
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold">Auto-renewal active</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-5 text-right align-middle">
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={() => handleManage(sub)}
                                                rightIconName="fas fa-chevron-right"
                                                rightIconClassName="text-[10px]"
                                            >
                                                Manage
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal 
                isOpen={isAddProductModalOpen} 
                onClose={() => setIsAddProductModalOpen(false)} 
                title="Deploy New Infrastructure"
                size="2xl"
                footer={
                    <div className="flex justify-end gap-3 w-full">
                        <Button variant="ghost" onClick={() => setIsAddProductModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmSelection} disabled={!selectedProduct} rightIconName="fas fa-arrow-right">Next</Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Select a core WorldPosta service to expand your digital infrastructure.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button 
                            onClick={() => setSelectedProduct('cloudedge')}
                            className={`relative flex flex-col items-center p-8 border-2 rounded-2xl transition-all group ${
                                selectedProduct === 'cloudedge' 
                                ? 'border-[#679a41] bg-green-50/50 dark:bg-emerald-900/20 dark:border-emerald-500 ring-1 ring-[#679a41] dark:ring-emerald-500 shadow-md' 
                                : 'border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 bg-white dark:bg-slate-800 shadow-sm'
                            }`}
                        >
                            {selectedProduct === 'cloudedge' && (
                                <div className="absolute top-3 right-3 text-[#679a41] dark:text-emerald-400">
                                    <Icon name="fas fa-check-circle" className="text-xl" />
                                </div>
                            )}
                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center mb-6 transition-transform group-hover:scale-110 p-2">
                                <img src="https://console.worldposta.com/assets/loginImgs/edgeLogo.png" alt="CloudEdge Logo" className="w-full h-auto object-contain" />
                            </div>
                            <h3 className="text-xl font-bold text-[#293c51] dark:text-gray-100 mb-2 text-center">CloudEdge</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-center">
                                Scalable VMs and virtual data centers with mission-critical performance.
                            </p>
                        </button>

                        <button 
                            onClick={() => setSelectedProduct('posta')}
                            className={`relative flex flex-col items-center p-8 border-2 rounded-2xl transition-all group ${
                                selectedProduct === 'posta' 
                                ? 'border-[#679a41] bg-green-50/50 dark:bg-emerald-900/20 dark:border-emerald-500 ring-1 ring-[#679a41] dark:ring-emerald-500 shadow-md' 
                                : 'border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 bg-white dark:bg-slate-800 shadow-sm'
                            }`}
                        >
                            {selectedProduct === 'posta' && (
                                <div className="absolute top-3 right-3 text-[#679a41] dark:text-emerald-400">
                                    <Icon name="fas fa-check-circle" className="text-xl" />
                                </div>
                            )}
                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center mb-6 transition-transform group-hover:scale-110 p-2">
                                <img src="https://www.worldposta.com/assets/Posta-Logo.png" alt="Posta Logo" className="w-full h-auto object-contain" />
                            </div>
                            <h3 className="text-xl font-bold text-[#293c51] dark:text-gray-100 mb-2 text-center">Posta Email</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-center">
                                Enterprise secure email hosting with 1TB mailboxes and collaboration tools.
                            </p>
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export const AdminToolsView: React.FC = () => (
    <div className="space-y-6 animate-fade-in">
         <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
                <Icon name="fas fa-user-shield" /> Global Billing Administration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Button variant="outline" className="justify-start text-left h-auto py-4 px-6 border-red-200 hover:bg-red-50">
                    <div>
                        <p className="font-bold">Adjust System Rates</p>
                        <p className="text-xs opacity-70">Update base prices for CPU, RAM, and Storage tiers.</p>
                    </div>
                </Button>
                <Button variant="outline" className="justify-start text-left h-auto py-4 px-6 border-red-200 hover:bg-red-50">
                    <div>
                        <p className="font-bold">Global Promo Codes</p>
                        <p className="text-xs opacity-70">Manage discounts applicable across all products.</p>
                    </div>
                </Button>
            </div>
        </div>
    </div>
);

export const BillingSettingsPage: React.FC = () => {
    return <div className="p-4">Please navigate using the sidebar.</div>;
};
