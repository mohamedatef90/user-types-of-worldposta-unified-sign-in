
import React, { useState, useMemo, useEffect, useRef } from 'react';
// FIX: Import Tooltip component to resolve 'Cannot find name' error.
import { Card, Stepper, FormField, Button, Icon, Tooltip } from '@/components/ui';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context';

interface DomainInfo {
    id: string;
    domainName: string;
    organizationName: string;
    creationDate: string;
    subDomainCount: number;
    isDomainVerified: boolean;
    isMxVerified: boolean;
    isSpfVerified: boolean;
}

const DNSRecordRow: React.FC<{type: string, name: string, value: string, priority?: number}> = ({type, name, value, priority}) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        }, (err) => {
            alert('Failed to copy text.');
        });
    };

    return (
        <tr className="border-b dark:border-gray-700 last:border-b-0">
            <td className="px-4 py-3 text-sm font-semibold">{type}</td>
            <td className="px-4 py-3 text-sm font-mono">{name}</td>
            <td className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                    <span className="font-mono break-all">{value}{priority && ` (Priority: ${priority})`}</span>
                    <Button size="icon" variant="ghost" onClick={() => handleCopy(priority ? `${value} (Priority: ${priority})` : value)} title="Copy value">
                        <Icon name={copied ? "fas fa-check" : "far fa-copy"} className={copied ? "text-green-500" : ""} />
                    </Button>
                </div>
            </td>
        </tr>
    );
};

const MXRecordDisplayRow: React.FC<{value: string}> = ({value}) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }, (err) => {
            alert('Failed to copy text.');
        });
    };
    return (
        <tr className="border-b dark:border-gray-700 last:border-b-0">
            <td className="px-4 py-3 text-sm font-mono">Blank or @</td>
            <td className="px-4 py-3 text-sm font-mono">3600</td>
            <td className="px-4 py-3 text-sm font-semibold">MX</td>
            <td className="px-4 py-3 text-sm text-center">5</td>
            <td className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                    <span className="font-mono break-all">{value}</span>
                    <Button size="icon" variant="ghost" onClick={() => handleCopy(value)} title="Copy value">
                        <Icon name={copied ? "fas fa-check" : "far fa-copy"} className={copied ? "text-green-500" : ""} />
                    </Button>
                </div>
            </td>
        </tr>
    );
};

const SPFRecordRow: React.FC<{host: string, value: string}> = ({host, value}) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }, (err) => {
            alert('Failed to copy text.');
        });
    };
    return (
        <tr className="border-b dark:border-gray-700 last:border-b-0">
            <td className="px-4 py-3 text-sm font-mono">{host}</td>
            <td className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                    <span className="font-mono break-all">{value}</span>
                    <Button size="icon" variant="ghost" onClick={() => handleCopy(value)} title="Copy value">
                        <Icon name={copied ? "fas fa-check" : "far fa-copy"} className={copied ? "text-green-500" : ""} />
                    </Button>
                </div>
            </td>
        </tr>
    );
};


export const OrgsAndDomainsPage: React.FC = () => {
    const { user } = useAuth();
    const isNewDemoUser = user?.email === 'new.user@worldposta.com';
    const DOMAIN_STORAGE_KEY = 'demoUserDomains';

    const [domains, setDomains] = useState<DomainInfo[]>([]);
    const [view, setView] = useState<'table' | 'stepper'>('table');
    const [currentStep, setCurrentStep] = useState(0);
    
    const [formState, setFormState] = useState({
        domainToConfigure: '',
        organizationName: '',
    });
    const orgNameManuallyEdited = useRef(false);
    const [domainVerificationStatus, setDomainVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');
    const [mxVerificationStatus, setMxVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');
    const [isOrgNameEditable, setIsOrgNameEditable] = useState(false);

    // Load domains from localStorage on initial render for the demo user
    useEffect(() => {
        if (isNewDemoUser) {
            try {
                const storedDomains = localStorage.getItem(DOMAIN_STORAGE_KEY);
                const loadedDomains = storedDomains ? JSON.parse(storedDomains) : [];
                setDomains(loadedDomains);
                if (loadedDomains.length === 0) {
                    setView('stepper');
                }
            } catch (e) {
                console.error("Failed to load domains from localStorage", e);
                setView('stepper');
            }
        }
    }, [isNewDemoUser]);

    // Save domains to localStorage whenever they change and notify the app
    useEffect(() => {
        if (isNewDemoUser) {
            try {
                localStorage.setItem(DOMAIN_STORAGE_KEY, JSON.stringify(domains));
                window.dispatchEvent(new CustomEvent('domainStateChange'));
            } catch (e) {
                console.error("Failed to save domains to localStorage", e);
            }
        }
    }, [domains, isNewDemoUser]);

    const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDomain = e.target.value.toLowerCase();
        // Only update the domain here. The onBlur event will handle the org name.
        setFormState(prev => ({
            ...prev,
            domainToConfigure: newDomain,
        }));
        // If the user clears the domain field, allow auto-update to resume.
        if (newDomain.trim() === '') {
            orgNameManuallyEdited.current = false;
        }
    };
    
    const handleDomainBlur = () => {
        // Only update org name automatically if it hasn't been manually edited
        if (!orgNameManuallyEdited.current) {
            setFormState(prev => ({
                ...prev,
                organizationName: prev.domainToConfigure.trim()
            }));
        }
    };
    
    const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState(prev => ({ ...prev, organizationName: e.target.value }));
        if (!orgNameManuallyEdited.current) {
            orgNameManuallyEdited.current = true;
        }
    };


    const steps = [
        { name: 'Verify Domain' },
        { name: 'Configure MX & SPF' },
    ];
    
    const verificationCode = useMemo(() => `wp-domain-verification=${uuidv4()}`, []);
    
    const resetStepper = () => {
        setCurrentStep(0);
        setFormState({ domainToConfigure: '', organizationName: '' });
        orgNameManuallyEdited.current = false;
        setDomainVerificationStatus('idle');
        setMxVerificationStatus('idle');
        setIsOrgNameEditable(false);
    }

    const handleStartAddProcess = () => {
        resetStepper();
        setView('stepper');
    };
    
    const handleCancelStepper = () => {
        if (domains.length > 0) {
            setView('table');
        }
    }

    const handleVerifyDomain = () => {
        if (!formState.domainToConfigure.trim() || !formState.organizationName.trim()) {
            alert('Please enter a domain and organization name.');
            return;
        }
        setDomainVerificationStatus('verifying');
        setTimeout(() => {
            setDomainVerificationStatus('success');
            setTimeout(() => setCurrentStep(1), 1500);
        }, 2000);
    };
    
    const handleVerifyMx = () => {
        setMxVerificationStatus('verifying');
        setTimeout(() => {
            setMxVerificationStatus('success');
            setTimeout(() => addOrUpdateDomain(true), 1500);
        }, 2000);
    };
    
    const handleSkipMx = () => {
        addOrUpdateDomain(false);
    }

    const handleVerifyNowClick = (domainToVerify: DomainInfo) => {
        resetStepper();
        setFormState({
            domainToConfigure: domainToVerify.domainName,
            organizationName: domainToVerify.organizationName
        });
        setDomainVerificationStatus('success'); // Mark step 1 as already complete
        setCurrentStep(1);
        setView('stepper');
    };
    
    const addOrUpdateDomain = (mxVerified: boolean) => {
        setDomains(prevDomains => {
            const existingIndex = prevDomains.findIndex(d => d.domainName === formState.domainToConfigure);
            if (existingIndex > -1) {
                // Update existing
                const updatedDomains = [...prevDomains];
                updatedDomains[existingIndex].isMxVerified = mxVerified;
                updatedDomains[existingIndex].isSpfVerified = mxVerified;
                return updatedDomains;
            } else {
                // Add new
                const newDomain: DomainInfo = {
                    id: uuidv4(),
                    domainName: formState.domainToConfigure,
                    organizationName: formState.organizationName || formState.domainToConfigure,
                    creationDate: new Date().toISOString(),
                    subDomainCount: 0,
                    isDomainVerified: true,
                    isMxVerified: mxVerified,
                    isSpfVerified: mxVerified,
                };
                return [...prevDomains, newDomain];
            }
        });
        setView('table');
    }

    const StepperView = () => (
        <>
            <div className="w-full md:w-1/2 lg:w-1/2 mx-auto">
                <Stepper steps={steps} currentStep={currentStep} className="my-8" />
            </div>
            <div className="mt-8 max-w-4xl mx-auto">
                {currentStep === 0 && (
                    <div className="space-y-6 text-center">
                        <h3 className="text-xl font-semibold">Add Your Domain and Organization</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">To use your domain with WorldPosta, you first need to prove that you own it.</p>
                        <div className="max-w-md mx-auto bg-gray-50 dark:bg-slate-800/50 p-6 rounded-lg space-y-4 text-left">
                            <FormField
                                id="domainToConfigure"
                                name="domainToConfigure"
                                label="Domain Name"
                                value={formState.domainToConfigure}
                                onChange={handleDomainChange}
                                onBlur={handleDomainBlur}
                                placeholder="e.g., yourcompany.com"
                                required
                            />
                             <div>
                                <label htmlFor="organizationName" className="block text-sm font-medium mb-1 text-[#293c51] dark:text-gray-300">
                                    Organization Name <span className="text-red-500 dark:text-red-400">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="organizationName"
                                        name="organizationName"
                                        value={formState.organizationName}
                                        onChange={handleOrgNameChange}
                                        placeholder="e.g., Your Company Inc."
                                        required
                                        disabled={!isOrgNameEditable && !!formState.domainToConfigure.trim()}
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#679a41] dark:focus:ring-emerald-400 focus:border-[#679a41] dark:focus:border-emerald-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:bg-gray-100 disabled:dark:bg-slate-800/50 disabled:cursor-not-allowed"
                                    />
                                    {!isOrgNameEditable && !!formState.domainToConfigure.trim() && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsOrgNameEditable(true);
                                                orgNameManuallyEdited.current = true;
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Card>
                            <p className="text-sm text-left mb-4">Add the following TXT record to your domain's DNS settings:</p>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-slate-700/50"><tr><th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th><th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name/Host</th><th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Value/Target</th></tr></thead>
                                    <tbody><DNSRecordRow type="TXT" name="@" value={verificationCode} /></tbody>
                                </table>
                            </div>
                        </Card>
                         <div className="flex justify-center gap-2">
                             {domains.length > 0 && <Button variant="ghost" onClick={handleCancelStepper}>Cancel</Button>}
                             <Button 
                                onClick={handleVerifyDomain} 
                                isLoading={domainVerificationStatus === 'verifying'} 
                                disabled={!formState.domainToConfigure.trim() || !formState.organizationName.trim() || domainVerificationStatus === 'verifying' || domainVerificationStatus === 'success'}>
                                {domainVerificationStatus === 'success' ? 'Verified!' : 'Verify Domain'}
                             </Button>
                         </div>
                    </div>
                )}

                {currentStep === 1 && (
                     <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-center">Configure MX & SPF Records for {formState.domainToConfigure}</h3>
                         <p className="text-center text-sm text-gray-500 dark:text-gray-400">Update your domain's DNS records to direct your email to WorldPosta's servers.</p>
                        <Card>
                            <p className="text-sm text-left mb-4">MX records are essential to receive emails in your domain. the MX records for your domain should be:</p>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-slate-700/50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name/Host/Alias</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Time to Live (TTL*)</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Record Type</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Priority</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Value/Answer/Destination</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <MXRecordDisplayRow value="wp-secure-cloudmail01.worldposta.com" />
                                        <MXRecordDisplayRow value="wp-secure-cloudmail02.worldposta.com" />
                                        <MXRecordDisplayRow value="wp-secure-cloudmail03.worldposta.com" />
                                        <MXRecordDisplayRow value="wp-secure-cloudmail04.worldposta.com" />
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                        <Card>
                            <p className="text-sm text-left mb-4 font-semibold">2. then add the following SPF values (OR TXT in some providers):</p>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-slate-700/50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Host/Domain</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">SPF Value / TXT value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <SPFRecordRow host="@" value="v=spf1 mx include:_spf.worldposta.com -all" />
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                        <div className="text-center">
                            {mxVerificationStatus === 'idle' && ( <Button onClick={handleVerifyMx} leftIconName="fas fa-check-double">Verify DNS Records</Button> )}
                            {mxVerificationStatus === 'verifying' && (<div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400"><Icon name="fas fa-circle-notch fa-spin fa-sm" /> Verifying records...</div>)}
                            {mxVerificationStatus === 'success' && (<div className="p-4 bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700 rounded-lg inline-flex items-center gap-2"><Icon name="fas fa-check-circle" className="text-green-500" /><span className="text-sm font-semibold text-green-700 dark:text-green-300">MX & SPF records verified successfully!</span></div>)}
                            {mxVerificationStatus === 'failed' && (<div className="p-4 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-lg inline-block"><div className="flex items-center gap-2"><Icon name="fas fa-times-circle" className="text-red-500" /><span className="text-sm font-semibold text-red-700 dark:text-red-400">Verification failed.</span></div><Button onClick={handleVerifyMx} variant="outline" size="sm" className="mt-2">Try Again</Button></div>)}
                        </div>
                        <div className="flex justify-between items-center mt-8">
                            <Button variant="ghost" onClick={() => setCurrentStep(0)}>Back</Button>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={handleSkipMx}>Skip for now</Button>
                                <Button onClick={() => addOrUpdateDomain(true)} disabled={mxVerificationStatus !== 'success'}>Finish</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
    
    const StatusIcon: React.FC<{ verified: boolean }> = ({ verified }) => (
        // FIX: Replaced div with Tooltip component as it was missing.
        <Tooltip text={verified ? 'Verified' : 'Not Verified'}>
            <Icon 
                name={verified ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'}
                className={verified ? 'text-green-500' : 'text-yellow-500'}
            />
        </Tooltip>
    );

    const TableView = () => (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Tooltip text={isNewDemoUser && domains.length > 0 ? "The demo only supports one domain." : "Add a new domain"}>
                    <div className="inline-block">
                        <Button onClick={handleStartAddProcess} leftIconName="fas fa-plus" disabled={isNewDemoUser && domains.length > 0}>Add Domain</Button>
                    </div>
                </Tooltip>
            </div>
            {domains.length === 0 ? (
                 <div className="text-center py-10 border-2 border-dashed rounded-lg dark:border-gray-600">
                    <Icon name="fas fa-globe" className="text-4xl text-gray-400 mb-3" />
                    <h3 className="text-lg font-semibold text-[#293c51] dark:text-gray-100">No Domains Added Yet</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Click 'Add Domain' to start your email setup.</p>
                </div>
            ) : (
                 <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700/50">
                             <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Domain Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Creation Date</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sub Domain</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Domain Verified</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">MX Verified</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">SPF Verified</th>
                             </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                            {domains.map(d => (
                                <tr key={d.id}>
                                    <td className="px-4 py-3 text-sm font-semibold">{d.domainName}</td>
                                    <td className="px-4 py-3 text-sm">{new Date(d.creationDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-sm text-center">{d.subDomainCount}</td>
                                    <td className="px-4 py-3 text-center"><StatusIcon verified={d.isDomainVerified} /></td>
                                    <td className="px-4 py-3 text-center">
                                        {/* FIX: Changed button variant from "link" to "ghost" and added link-like styling. */}
                                        {d.isMxVerified ? <StatusIcon verified={true} /> : <Button variant="ghost" size="sm" onClick={() => handleVerifyNowClick(d)} className="text-[#679a41] dark:text-emerald-400 hover:underline p-0 h-auto">Verify Now</Button>}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                         {/* FIX: Changed button variant from "link" to "ghost" and added link-like styling. */}
                                         {d.isSpfVerified ? <StatusIcon verified={true} /> : <Button variant="ghost" size="sm" onClick={() => handleVerifyNowClick(d)} className="text-[#679a41] dark:text-emerald-400 hover:underline p-0 h-auto">Verify Now</Button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const NonDemoUserView = () => (
         <div className="text-center py-10">
            <Icon name="fas fa-sitemap" className="text-4xl text-gray-400 mb-3" />
            <h3 className="text-lg font-semibold text-[#293c51] dark:text-gray-100">Domain Management</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This is a placeholder for the standard domain management interface.</p>
        </div>
    );

    return (
        <Card title="Organizations and Domains">
            {isNewDemoUser ? (view === 'stepper' ? <StepperView /> : <TableView />) : <NonDemoUserView />}
        </Card>
    );
};
