import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { billingStore, Package } from './billingStore';
import { useAuth } from '@/context';

export const PackagesManagementPage: React.FC = () => {
    const { user } = useAuth();
    const actorEmail = user?.email || 'admin@worldposta.com';

    // State
    const [packages, setPackages] = useState<Package[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [productFilter, setProductFilter] = useState<'all' | 'cloudedge' | 'postagate'>('all');
    
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    
    useEffect(() => {
        setPackages(billingStore.getPackages());
    }, []);

    const refreshList = () => {
        setPackages(billingStore.getPackages());
    };

    const handleArchive = (id: string) => {
        if (confirm('Are you sure you want to archive this package? New customers will not be able to join it, but historical subscriptions will stay intact.')) {
            billingStore.archivePackage(id, actorEmail);
            refreshList();
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to permanently delete this package template from history?')) {
            billingStore.deletePackage(id, actorEmail);
            refreshList();
        }
    };

    // Filtered Packages
    const filteredPackages = packages.filter(pkg => {
        const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              pkg.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesProduct = productFilter === 'all' ? true : pkg.product === productFilter;
        return matchesSearch && matchesProduct;
    });

    return (
        <div className="p-6 max-w-[98%] mx-auto w-full animate-fade-in">
            {/* Header section with brand accent */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <span className="text-xs uppercase font-extrabold text-[#679a41] tracking-widest bg-[#679a41]/10 px-2.5 py-1 rounded-full">
                        Admin Suite — Version 1.0
                    </span>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">Packages Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
                        Define product licenses, subscription pricing matrices, and oncheck trial allowances for both CloudEdge resources and Postagate.
                    </p>
                </div>
                <Link 
                    to="/app/billing/admin-packages/new"
                    className="flex items-center gap-2 px-5 py-3 bg-[#679a41] hover:bg-[#5b873a] text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all duration-150"
                >
                    <i className="fas fa-plus" />
                    Create New Package
                </Link>
            </div>

            {/* Quick Summary Counts */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Active Templates</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                        {packages.filter(p => p.status === 'active').length}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">CloudEdge Packages</p>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                        {packages.filter(p => p.product === 'cloudedge').length}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Postagate Packages</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">
                        {packages.filter(p => p.product === 'postagate').length}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Archived Tiers</p>
                    <p className="text-2xl font-black text-amber-500 mt-1">
                        {packages.filter(p => p.status === 'archived').length}
                    </p>
                </div>
            </div>

            {/* Filters Navigation Panel */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex rounded-lg bg-gray-100 dark:bg-slate-900 p-1 w-full md:w-auto">
                    <button 
                        onClick={() => setProductFilter('all')}
                        className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-md transition-all ${productFilter === 'all' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        All Products
                    </button>
                    <button 
                        onClick={() => setProductFilter('cloudedge')}
                        className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-md transition-all ${productFilter === 'cloudedge' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        CloudEdge
                    </button>
                    <button 
                        onClick={() => setProductFilter('postagate')}
                        className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-md transition-all ${productFilter === 'postagate' ? 'bg-[#679a41] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        Postagate
                    </button>
                </div>

                <div className="relative w-full md:w-80">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <i className="fas fa-search" />
                    </span>
                    <input 
                        type="text"
                        placeholder="Search formulas, keys & features..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#679a41]/50 focus:border-[#679a41]"
                    />
                </div>
            </div>

            {/* Packages Core Grid/List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                {filteredPackages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400">
                        <i className="fas fa-box-open text-4xl mb-3 text-gray-300" />
                        <p className="text-sm font-medium">No matching packages found.</p>
                        <p className="text-xs text-gray-400 mt-1">Try expanding your filters or search coordinates.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 text-left">
                            <thead className="bg-gray-50 dark:bg-slate-900/50">
                                <tr className="text-xs font-extrabold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                                    <th className="px-4 py-4">Package Identity & Highlights</th>
                                    <th className="px-4 py-4">Core Model</th>
                                    <th className="px-4 py-4">Standard Rate</th>
                                    <th className="px-4 py-4">Activation Date</th>
                                    <th className="px-4 py-4">System Status</th>
                                    <th className="px-4 py-4 text-right">Console Controls</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700 text-sm">
                                {filteredPackages.map((pkg) => (
                                    <tr key={pkg.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-900/20 transition-all">
                                        <td className="px-4 py-4 max-w-xs md:max-w-md">
                                            <div className="flex gap-3 items-start">
                                                <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${pkg.product === 'cloudedge' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-emerald-100 text-[#679a41] dark:bg-emerald-950/40'}`}>
                                                    <i className={pkg.product === 'cloudedge' ? 'fas fa-cloud' : 'fas fa-server'} />
                                                </div>
                                                <div>
                                                    <p className="font-extrabold text-slate-900 dark:text-white">{pkg.name}</p>
                                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                                        {pkg.features.slice(0, 3).map((feat, ix) => (
                                                            <span key={ix} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                                                                {feat}
                                                            </span>
                                                        ))}
                                                        {pkg.features.length > 3 && (
                                                            <span className="text-[10px] text-gray-400 font-bold px-1.5 self-center">
                                                                +{pkg.features.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold leading-none border uppercase ${pkg.billingMode === 'subscription' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/10 dark:text-purple-300 dark:border-purple-800' : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/10 dark:text-indigo-300 dark:border-indigo-800'}`}>
                                                {pkg.billingMode}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {pkg.isComplimentary ? (
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400">Complimentary</span>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-800 dark:text-white text-base">
                                                        ${pkg.price.toFixed(2)}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-semibold uppercase">
                                                        {pkg.billingMode === 'payg' ? 'Metered Unit' : `${pkg.billingCycle === '1m' ? 'Monthly' : pkg.billingCycle === '1y' ? 'Annual' : `${pkg.billingCycle} cycle`}`}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                                            {new Date(pkg.effectiveDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </td>
                                        <td className="px-4 py-4">
                                            {pkg.status === 'active' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    Active Catalog
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                    Archived
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-right relative">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === pkg.id ? null : pkg.id)}
                                                className="text-gray-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                            >
                                                <i className="fas fa-ellipsis-v" />
                                            </button>
                                            
                                            {openMenuId === pkg.id && (
                                                <div className="absolute right-6 mt-2 z-20 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 py-1 text-left">
                                                    {pkg.status === 'active' && (
                                                        <>
                                                            <Link 
                                                                to={`/app/billing/admin-packages/edit/${pkg.id}`}
                                                                className="block px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                                                onClick={() => setOpenMenuId(null)}
                                                            >
                                                                Edit
                                                            </Link>
                                                            <button 
                                                                onClick={() => { handleArchive(pkg.id); setOpenMenuId(null); }}
                                                                className="block w-full text-left px-4 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors"
                                                            >
                                                                Archive
                                                            </button>
                                                        </>
                                                    )}
                                                    <button 
                                                        onClick={() => { handleDelete(pkg.id); setOpenMenuId(null); }}
                                                        className="block w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
