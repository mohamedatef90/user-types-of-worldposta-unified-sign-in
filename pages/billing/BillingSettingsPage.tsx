
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, Icon, Modal, FormField } from '@/components/ui';
import { useAuth } from '@/context';
import { mockSubscriptions } from '@/data';
import type { Subscription } from '@/types';
import { InvoiceHistoryPage } from './InvoiceHistoryPage';
import { CloudEdgeConfigurationsContent } from './CloudEdgeConfigurationsPage';
import { EmailAdminSubscriptionsContent } from './EmailAdminSubscriptionsPage';

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

export const BillingSettingsPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'subscriptions');
    const [walletBalance, setWalletBalance] = useState<number>(() => {
        const saved = localStorage.getItem(WALLET_STORAGE_KEY);
        return saved ? parseFloat(saved) : 200.00;
    });
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState<number | ''>('');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const handleManage = (sub: Subscription) => {
        const viewAsUser = searchParams.get('viewAsUser');
        const query = viewAsUser ? `?viewAsUser=${viewAsUser}` : '';
        navigate(`/app/billing/subscriptions/manage/${sub.id}${query}`);
    };

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

    // Sub-component for Payment Methods & Wallet
    const PaymentAndDetailsView = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Wallet Management Card */}
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
                        <p className="text-[10px] text-gray-400 text-center italic">Funds in your wallet are used for PAYG resources.</p>
                    </div>
                </Card>

                {/* Auto-Pay Settings Card */}
                <Card title="Auto-Pay Settings" className="flex flex-col justify-between">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                <Icon name="fas fa-sync" className="text-green-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-[#293c51] dark:text-gray-200 leading-tight">Auto-Renew is Enabled</p>
                                <p className="text-[10px] text-gray-500 mt-1">Automatic charges for active subscriptions.</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-slate-900/30 p-2 rounded border border-gray-100 dark:border-slate-700">
                            Your default payment method will be used automatically on renewal dates.
                        </p>
                    </div>
                    <div className="mt-4">
                        <Button variant="ghost" fullWidth className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs">Disable Auto-Pay</Button>
                    </div>
                </Card>

                {/* Payment Methods Card */}
                <Card title="Payment Methods" className="flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/20">
                            <div className="flex items-center gap-3">
                                <Icon name="fab fa-cc-visa" className="text-2xl text-blue-700" />
                                <div>
                                    <p className="text-sm font-semibold text-[#293c51] dark:text-gray-200">Visa ending in 4242</p>
                                    <p className="text-[10px] text-gray-500">Expires 12/2025</p>
                                </div>
                            </div>
                            <span className="text-[9px] bg-[#679a41]/10 text-[#679a41] px-1.5 py-0.5 rounded font-bold uppercase">Default</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Button variant="outline" fullWidth size="sm" leftIconName="fas fa-plus">Add Method</Button>
                    </div>
                </Card>
            </div>

            {/* Wallet Transaction History */}
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
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{new Date(tx.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-[#293c51] dark:text-gray-200">{tx.description}</div>
                                        <div className="text-[10px] text-gray-400 font-mono uppercase">{tx.id}</div>
                                    </td>
                                    <td className={`px-4 py-3 text-right font-bold ${tx.amount > 0 ? 'text-green-600 dark:text-emerald-400' : 'text-[#293c51] dark:text-gray-200'}`}>
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
                <div className="mt-4 text-center">
                    <Button variant="ghost" size="sm" className="text-sky-500">View All Transactions</Button>
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-6">
                <Card 
                    title="Billing Address" 
                    titleActions={
                        <Button variant="outline" size="sm" leftIconName="fas fa-edit">Update Billing Details</Button>
                    }
                >
                    <div className="text-sm text-gray-600 dark:text-gray-300 p-4 border rounded-lg dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/20">
                        <p className="font-bold text-[#293c51] dark:text-gray-100 mb-1">{user?.companyName || 'Primary Company'}</p>
                        <p>123 Business Rd, Suite 400</p>
                        <p>Tech City, TC 90210, United States</p>
                    </div>
                </Card>
            </div>
        </div>
    );

    const SubscriptionsListView = () => (
        <Card className="animate-fade-in" title="Active Subscriptions" titleActions={
            <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleTabChange('posta')} leftIconName="fas fa-plus">Add Posta</Button>
                <Button size="sm" variant="outline" onClick={() => handleTabChange('provisioning')} leftIconName="fas fa-plus">Add CloudEdge</Button>
            </div>
        }>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-slate-700 font-semibold text-gray-600 dark:text-gray-300">
                        <tr>
                            <th className="px-4 py-3">Service / Product</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Billing Mode</th>
                            <th className="px-4 py-3">Next Renewal</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {mockSubscriptions.map(sub => (
                            <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 group">
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${sub.category === 'cloudedge' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                            <Icon name={sub.category === 'cloudedge' ? 'fas fa-cloud' : 'fas fa-envelope'} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#293c51] dark:text-gray-200">{sub.productName}</p>
                                            <p className="text-xs text-gray-500 uppercase">{sub.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {sub.status}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <Icon name={sub.billingMode === 'payg_wallet' ? 'fas fa-wallet text-blue-500' : 'fas fa-calendar-check text-purple-500'} className="text-xs" />
                                        <span className="capitalize">{sub.billingMode.replace('_', ' ')}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                                    {sub.endDate === 'N/A' ? 'N/A (PAYG)' : new Date(sub.endDate).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <Button size="sm" variant="ghost" onClick={() => handleManage(sub)}>
                                        Manage
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );

    const AdminToolsView = () => (
        <div className="space-y-6 animate-fade-in">
             <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
                    <Icon name="fas fa-user-shield" /> Global Billing Administration
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    These tools affect all customers and system-wide billing logic. Proceed with extreme caution.
                </p>
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
            <Card title="Pending Verifications">
                <p className="text-sm text-gray-500">No bank transfers or manual payments awaiting verification.</p>
            </Card>
        </div>
    );

    const tabs = [
        { id: 'subscriptions', label: 'My Subscriptions', icon: 'fas fa-box-open' },
        { id: 'invoices', label: 'Invoice History', icon: 'fas fa-file-invoice-dollar' },
        { id: 'provisioning', label: 'CloudEdge Provisioning', icon: 'fas fa-server' },
        { id: 'posta', label: 'Posta Subscriptions', icon: 'fas fa-envelope-open-text' },
        { id: 'details', label: 'Payment & Wallet', icon: 'fas fa-wallet' },
        ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin Tools', icon: 'fas fa-tools' }] : [])
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Billing Control Center</h1>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-bold">Wallet Balance</p>
                        <p className="text-2xl font-bold text-[#679a41] dark:text-emerald-400">${walletBalance.toFixed(2)}</p>
                    </div>
                    <Button onClick={() => setIsTopUpModalOpen(true)} variant="secondary" size="sm">Top Up</Button>
                </div>
            </div>

            <div className="border-b border-gray-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
                <nav className="-mb-px flex space-x-8 min-w-max">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all ${
                                activeTab === tab.id
                                    ? 'border-[#679a41] text-[#679a41] dark:border-emerald-400 dark:text-emerald-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            <Icon name={tab.icon} className="text-xs" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-6 min-h-[500px]">
                {activeTab === 'subscriptions' && <SubscriptionsListView />}
                {activeTab === 'invoices' && <InvoiceHistoryPage />}
                {activeTab === 'provisioning' && <CloudEdgeConfigurationsContent />}
                {activeTab === 'posta' && <EmailAdminSubscriptionsContent />}
                {activeTab === 'details' && <PaymentAndDetailsView />}
                {activeTab === 'admin' && <AdminToolsView />}
            </div>

            {/* Top Up Modal */}
            <Modal 
                isOpen={isTopUpModalOpen} 
                onClose={() => setIsTopUpModalOpen(false)} 
                title="Top Up Wallet" 
                size="sm"
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsTopUpModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleTopUp} disabled={!topUpAmount || topUpAmount <= 0}>Add Funds</Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enter the amount you wish to add to your account wallet.</p>
                    <FormField 
                        id="top-up-amount" 
                        label="Amount (USD)" 
                        type="number" 
                        value={topUpAmount} 
                        onChange={(e) => setTopUpAmount(parseFloat(e.target.value) || '')}
                        placeholder="0.00"
                    />
                    <div className="grid grid-cols-3 gap-2">
                        {[20, 50, 100].map(amt => (
                            <Button key={amt} variant="outline" size="sm" onClick={() => setTopUpAmount(amt)}>${amt}</Button>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};
