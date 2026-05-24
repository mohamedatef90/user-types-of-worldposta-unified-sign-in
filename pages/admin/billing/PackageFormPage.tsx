import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { billingStore, Package } from './billingStore';
import { useAuth } from '@/context';

export const PackageFormPage: React.FC = () => {
    const { pkgId } = useParams<{ pkgId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const actorEmail = user?.email || 'admin@worldposta.com';
    const isEditing = !!pkgId;

    const [pkgName, setPkgName] = useState('');
    const [pkgProduct, setPkgProduct] = useState<'cloudedge' | 'postagate'>('cloudedge');
    const [pkgMode, setPkgMode] = useState<'subscription' | 'payg'>('subscription');
    const [pkgPrice, setPkgPrice] = useState<number>(49);
    const [pkgCycle, setPkgCycle] = useState<'1m' | '3m' | '6m' | '1y' | '3y' | '5y'>('1m');
    const [pkgTrial, setPkgTrial] = useState<number | ''>('');
    const [pkgComplimentary, setPkgComplimentary] = useState(false);
    const [pkgFeatureInput, setPkgFeatureInput] = useState('');
    const [featuresList, setFeaturesList] = useState<string[]>([]);
    const [pkgEffectiveDate, setPkgEffectiveDate] = useState('2026-06-01');

    useEffect(() => {
        if (isEditing) {
            const pkg = billingStore.getPackages().find(p => p.id === pkgId);
            if (pkg) {
                setPkgName(pkg.name);
                setPkgProduct(pkg.product);
                setPkgMode(pkg.billingMode);
                setPkgPrice(pkg.price);
                setPkgCycle(pkg.billingCycle || '1m');
                setPkgTrial(pkg.trialDays || '');
                setPkgComplimentary(pkg.isComplimentary);
                setFeaturesList(pkg.features);
                setPkgEffectiveDate(pkg.effectiveDate);
            }
        }
    }, [isEditing, pkgId]);

    const handleAddFeature = () => {
        if (pkgFeatureInput.trim()) {
            setFeaturesList([...featuresList, pkgFeatureInput.trim()]);
            setPkgFeatureInput('');
        }
    };

    const handleRemoveFeature = (index: number) => {
        setFeaturesList(featuresList.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!pkgName.trim()) {
            alert('Package name is required.');
            return;
        }

        const isComplimentaryOverride = pkgComplimentary;
        const actualPrice = isComplimentaryOverride ? 0 : pkgPrice;
        const subCycle = pkgMode === 'subscription' ? pkgCycle : null;
        const trialValue = pkgMode === 'subscription' && pkgTrial !== '' ? Number(pkgTrial) : null;

        const pkgData = {
            name: pkgName,
            product: pkgProduct,
            billingMode: pkgMode,
            price: Number(actualPrice),
            currency: 'USD',
            billingCycle: subCycle,
            trialDays: trialValue,
            isComplimentary: isComplimentaryOverride,
            features: featuresList.length > 0 ? featuresList : ['General Product Allocation License'],
            effectiveDate: pkgEffectiveDate
        };

        if (isEditing && pkgId) {
            billingStore.modifyPackage(pkgId, pkgData, actorEmail);
        } else {
            billingStore.createPackage(pkgData, actorEmail);
        }

        navigate('/app/billing/admin-packages');
    };

    return (
        <div className="p-6 max-w-4xl mx-auto w-full animate-fade-in">
            <div className="mb-8">
                <Link to="/app/billing/admin-packages" className="text-sm text-gray-500 hover:text-[#679a41] font-bold flex items-center gap-2">
                    <i className="fas fa-arrow-left" /> Back to Packages
                </Link>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">
                    {isEditing ? 'Update Service Formula' : 'New Service Formula'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    {isEditing ? 'Modify existing pricing structure' : 'Draft pricing structure synchronized with checkout channels.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                            Product Core Line
                        </label>
                        <select 
                            value={pkgProduct}
                            onChange={(e) => setPkgProduct(e.target.value as any)}
                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white font-medium"
                        >
                            <option value="cloudedge">CloudEdge (VM, VDC, Ready-Plans)</option>
                            <option value="postagate">Postagate (Premium Posta Servers)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                            Billing Core Mode
                        </label>
                        <select 
                            value={pkgMode}
                            onChange={(e) => setPkgMode(e.target.value as any)}
                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white font-medium"
                        >
                            <option value="subscription">Fixed Subscription Cycle</option>
                            <option value="payg">Pay-As-You-Go Metered (PAYG)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                        Package Title
                    </label>
                    <input 
                        type="text" 
                        placeholder="e.g. CloudEdge High CPU NVMe Alpha"
                        value={pkgName}
                        onChange={(e) => setPkgName(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white"
                        required
                    />
                </div>

                {pkgMode === 'subscription' && (
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                Billing Cycle Period
                            </label>
                            <select 
                                value={pkgCycle}
                                onChange={(e) => setPkgCycle(e.target.value as any)}
                                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white font-medium"
                            >
                                <option value="1m">1 Month (Standard)</option>
                                <option value="3m">3 Months</option>
                                <option value="6m">6 Months</option>
                                <option value="1y">1 Year (Annual)</option>
                                <option value="3y">3 Years Enterprise</option>
                                <option value="5y">5 Years Secure Tier</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                Trial Buffer Days
                            </label>
                            <input 
                                type="number" 
                                placeholder="None (Deactivated)"
                                value={pkgTrial}
                                onChange={(e) => setPkgTrial(e.target.value !== '' ? Number(e.target.value) : '')}
                                disabled={pkgComplimentary}
                                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white disabled:opacity-50"
                            />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6 items-center">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                            Complimentary Tier
                        </label>
                        <label className="flex items-center gap-3 bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-700 cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={pkgComplimentary}
                                onChange={(e) => {
                                    setPkgComplimentary(e.target.checked);
                                    if (e.target.checked) setPkgTrial('');
                                }}
                                className="w-5 h-5 text-[#679a41] border-gray-300 rounded focus:ring-[#679a41]"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-bold select-none">
                                Funded / Zero invoicing
                            </span>
                        </label>
                    </div>

                    {!pkgComplimentary && (
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                Pricing Model (USD)
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 font-bold text-sm">
                                    $
                                </span>
                                <input 
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={pkgPrice}
                                    onChange={(e) => setPkgPrice(Number(e.target.value))}
                                    className="w-full pl-8 pr-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-sm font-bold dark:text-white"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                        Effective/Release Date
                    </label>
                    <input 
                        type="date"
                        value={pkgEffectiveDate}
                        onChange={(e) => setPkgEffectiveDate(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white font-medium"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                        Bullet Features Specifications
                    </label>
                    <div className="flex gap-3">
                        <input 
                            type="text" 
                            placeholder="e.g. 5TB Managed Backup space"
                            value={pkgFeatureInput}
                            onChange={(e) => setPkgFeatureInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); }}}
                            className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white"
                        />
                        <button 
                            type="button"
                            onClick={handleAddFeature}
                            className="px-6 bg-slate-900 text-white rounded-lg text-sm font-bold active:scale-95 transition-all"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {featuresList.map((feat, index) => (
                            <span 
                                key={index} 
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#679a41]/10 text-[#679a41] text-xs font-bold"
                            >
                                {feat}
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveFeature(index)}
                                    className="text-[#679a41] hover:text-red-600 transition-colors"
                                >
                                    <i className="fas fa-times-circle" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-slate-700">
                    <Link 
                        to="/app/billing/admin-packages"
                        className="px-6 py-3 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-900 font-semibold"
                    >
                        Cancel
                    </Link>
                    <button 
                        type="submit"
                        className="px-8 py-3 bg-[#679a41] hover:bg-[#5b873a] text-white rounded-lg text-sm font-semibold shadow-sm active:scale-95 transition-all"
                    >
                        {isEditing ? 'Update & Sync' : 'Deploy & Sync'}
                    </button>
                </div>
            </form>
        </div>
    );
};
