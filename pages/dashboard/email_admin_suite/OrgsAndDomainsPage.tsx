import React, { useState, useMemo, useEffect } from 'react';
import { Card, Stepper, FormField, Button, Icon, Tooltip, ToggleSwitch } from '@/components/ui';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context';
import { useSearchParams, Link } from 'react-router-dom';
import { useAppLayout } from '@/context';

interface DomainInfo {
    id: string;
    domainName: string;
    organizationName: string;
    creationDate: string;
    subDomainCount: number;
    isMxVerified: boolean;
    isSpfVerified: boolean;
    healthStatus: 'healthy' | 'warning' | 'unhealthy';
}

interface Organization {
    id: string;
    name: string;
    description: string;
    primaryDomain: string;
    domains: DomainInfo[];
}

type VerificationStatus = 'success' | 'warning' | 'error' | 'pending';

const StatusIcon = ({ status }: { status: VerificationStatus }) => {
    const currentStatus: VerificationStatus = status;
    switch (currentStatus) {
        case 'success':
            return <Icon name="fas fa-check-circle" className="text-green-500 text-lg" title="Record verified" />;
        case 'warning':
            return <Icon name="fas fa-exclamation-triangle" className="text-yellow-500 text-lg" title="Record has issues" />;
        case 'error':
            return <Icon name="fas fa-times-circle" className="text-red-500 text-lg" title="Record missing or incorrect" />;
        case 'pending':
        default:
            return <Icon name="fas fa-clock" className="text-gray-300 text-lg" title="Verification pending" />;
    }
};

const DNSRecordRow: React.FC<{type: string, name: string, value: string, priority?: number, status?: VerificationStatus}> = ({type, name, value, priority, status = 'pending' as VerificationStatus}) => {
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
        <tr className="border-b dark:border-gray-700 last:border-b-0 text-[#293c51] dark:text-gray-200">
            <td className="px-4 py-3 text-sm font-semibold">{type}</td>
            <td className="px-4 py-3 text-sm font-mono">{name}</td>
            <td className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                    <span className="font-mono break-all">{value}{priority && ` (Priority: ${priority})`}</span>
                    <Button size="icon" variant="ghost" onClick={() => handleCopy(priority ? `${value} (Priority: ${priority})` : value)} title="Copy value">
                        <Icon name={copied ? "fas fa-check" : "far fa-copy"} className={copied ? "text-green-500" : ""} />
                    </Button>
                </div>
            </td>
            <td className="px-4 py-3 text-center">
                <StatusIcon status={status} />
            </td>
        </tr>
    );
};

const MXRecordDisplayRow: React.FC<{host: string, ttl: string, priority: number, value: string, status: VerificationStatus}> = ({host, ttl, priority, value, status}) => {
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
        <tr className="border-b dark:border-gray-700 last:border-b-0 text-[#293c51] dark:text-gray-200">
            <td className="px-4 py-4 text-sm font-mono">{host}</td>
            <td className="px-4 py-4 text-sm font-mono">{ttl}</td>
            <td className="px-4 py-4 text-sm font-semibold">MX</td>
            <td className="px-4 py-4 text-sm text-center">{priority}</td>
            <td className="px-4 py-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                    <span className="font-mono break-all">{value}</span>
                    <Button size="icon" variant="ghost" onClick={() => handleCopy(value)} title="Copy value">
                        <Icon name={copied ? "fas fa-check" : "far fa-copy"} className={copied ? "text-green-500" : ""} />
                    </Button>
                </div>
            </td>
            <td className="px-4 py-4 text-center">
                <StatusIcon status={status} />
            </td>
        </tr>
    );
};

const GenericDNSDisplayRow: React.FC<{host: string, type: string, value: string, status: VerificationStatus}> = ({host, type, value, status}) => {
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
        <tr className="border-b dark:border-gray-700 last:border-b-0 text-[#293c51] dark:text-gray-200">
            <td className="px-4 py-4 text-sm font-mono w-1/4">{host}</td>
            <td className="px-4 py-4 text-sm font-semibold w-1/6">{type}</td>
            <td className="px-4 py-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                    <span className="font-mono break-all">{value}</span>
                    <Button size="icon" variant="ghost" onClick={() => handleCopy(value)} title="Copy value">
                        <Icon name={copied ? "fas fa-check" : "far fa-copy"} className={copied ? "text-green-500" : ""} />
                    </Button>
                </div>
            </td>
            <td className="px-4 py-4 text-center">
                <StatusIcon status={status} />
            </td>
        </tr>
    );
};

const SPFRecordRow: React.FC<{host: string, value: string, status: VerificationStatus}> = ({host, value, status}) => {
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
        <tr className="border-b dark:border-gray-700 last:border-b-0 text-[#293c51] dark:text-gray-200">
            <td className="px-4 py-4 text-sm font-mono w-1/4">{host}</td>
            <td className="px-4 py-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                    <span className="font-mono break-all">{value}</span>
                    <Button size="icon" variant="ghost" onClick={() => handleCopy(value)} title="Copy value">
                        <Icon name={copied ? "fas fa-check" : "far fa-copy"} className={copied ? "text-green-500" : ""} />
                    </Button>
                </div>
            </td>
            <td className="px-4 py-4 text-center">
                <StatusIcon status={status} />
            </td>
        </tr>
    );
};

export const OrgsAndDomainsPage: React.FC = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const isNewDemoUser = user?.email === 'new.user@worldposta.com';
    const DOMAIN_STORAGE_KEY = 'demoUserDomains';

    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    
    const view = (searchParams.get('view') as 'table' | 'stepper' | 'dns' | 'org-settings') || 'table';
    const selectedDomainId = searchParams.get('domainId');

    const steps = [
        { name: 'Verify Domain' },
        { name: 'Configure DNS' }
    ];

    const [formState, setFormState] = useState({
        domainToConfigure: '',
        organizationName: '',
    });
    const [domainVerificationStatus, setDomainVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');
    const [mxVerificationStatus, setMxVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');

    // Enhanced Demo Data
    useEffect(() => {
        if (!isNewDemoUser) {
            const demoOrgs: Organization[] = [
                {
                    id: '1', name: 'Alpha Solutions Group', description: 'Primary business entity for Alpha Solutions operations.', primaryDomain: 'alphasolutions.info', domains: [
                        { id: 'd1', domainName: 'alphasolutions.info', organizationName: 'Alpha Solutions Group', creationDate: 'Jan 12, 2018', subDomainCount: 2, isMxVerified: true, isSpfVerified: true, healthStatus: 'healthy' },
                        { id: 'd2', domainName: 'core-tech.test', organizationName: 'Alpha Solutions Group', creationDate: 'Nov 18, 2019', subDomainCount: 0, isMxVerified: true, isSpfVerified: true, healthStatus: 'healthy' },
                        { id: 'd3', domainName: 'pharmagen.com', organizationName: 'Alpha Solutions Group', creationDate: 'Jul 29, 2021', subDomainCount: 1, isMxVerified: true, isSpfVerified: true, healthStatus: 'healthy' },
                        { id: 'd4', domainName: 'staging-env.io', organizationName: 'Alpha Solutions Group', creationDate: 'Sep 9, 2021', subDomainCount: 0, isMxVerified: false, isSpfVerified: false, healthStatus: 'warning' },
                        { id: 'd5', domainName: 'rwanda-ops.net', organizationName: 'Alpha Solutions Group', creationDate: 'Jun 29, 2022', subDomainCount: 0, isMxVerified: true, isSpfVerified: true, healthStatus: 'healthy' },
                        { id: 'd6', domainName: 'nour-logistics.net', organizationName: 'Alpha Solutions Group', creationDate: 'Jun 29, 2022', subDomainCount: 0, isMxVerified: true, isSpfVerified: true, healthStatus: 'healthy' },
                        { id: 'd7', domainName: 'hds-global.com', organizationName: 'Alpha Solutions Group', creationDate: 'Oct 17, 2022', subDomainCount: 0, isMxVerified: true, isSpfVerified: true, healthStatus: 'healthy' },
                        { id: 'd8', domainName: 'ed-holdings.co', organizationName: 'Alpha Solutions Group', creationDate: 'Dec 11, 2022', subDomainCount: 0, isMxVerified: false, isSpfVerified: false, healthStatus: 'unhealthy' },
                    ]
                },
                { id: '2', name: 'Beta Innovations', description: 'Research and development division focusing on next-gen cloud tech.', primaryDomain: 'betainnovations.com', domains: [
                    { id: 'd9', domainName: 'betainnovations.com', organizationName: 'Beta Innovations', creationDate: 'Mar 15, 2023', subDomainCount: 0, isMxVerified: true, isSpfVerified: true, healthStatus: 'healthy' }
                ] },
                { id: '3', name: 'Tooli Global', description: 'Logistics and supply chain management services.', primaryDomain: 'tooliglobal.net', domains: [] },
                { id: '4', name: 'MyTest Enterprise', description: 'QA and Testing organization for internal benchmarks.', primaryDomain: 'mytest-qa.io', domains: [] },
            ];
            setOrganizations(demoOrgs);
            setActiveOrgId('1');
        }
    }, [isNewDemoUser]);

    useEffect(() => {
        if (isNewDemoUser) {
            try {
                const storedDomains = localStorage.getItem(DOMAIN_STORAGE_KEY);
                const loadedDomains = storedDomains ? JSON.parse(storedDomains) : [];
                if (loadedDomains.length > 0) {
                    setOrganizations([{
                        id: 'demo-org',
                        name: loadedDomains[0].organizationName || loadedDomains[0].domainName,
                        description: 'Demo User Organization',
                        primaryDomain: loadedDomains[0].domainName,
                        domains: loadedDomains
                    }]);
                    setActiveOrgId('demo-org');
                    if (!searchParams.get('view')) setSearchParams({ view: 'table' });
                } else {
                    if (!searchParams.get('view')) setSearchParams({ view: 'stepper' });
                }
            } catch (e) {
                console.error("Failed to load domains from localStorage", e);
                setSearchParams({ view: 'stepper' });
            }
        }
    }, [isNewDemoUser, searchParams, setSearchParams]);

    const activeOrg = useMemo(() => {
        return organizations.find(o => o.id === activeOrgId) || null;
    }, [organizations, activeOrgId]);

    const selectedDomainForDns = useMemo(() => {
        if (!selectedDomainId) return null;
        for (const org of organizations) {
            const dom = org.domains.find(d => d.id === selectedDomainId);
            if (dom) return dom;
        }
        return null;
    }, [organizations, selectedDomainId]);

    const handleStartAddProcess = () => {
        setCurrentStep(0);
        setFormState({ domainToConfigure: '', organizationName: '' });
        setDomainVerificationStatus('idle');
        setMxVerificationStatus('idle');
        setSearchParams({ view: 'stepper' });
    };

    const handleVerifyDomain = () => {
        if (!formState.domainToConfigure.trim() || !formState.organizationName.trim()) {
            alert('Please enter a domain and organization name.');
            return;
        }
        setDomainVerificationStatus('verifying');
        setTimeout(() => {
            setDomainVerificationStatus('success');
            setTimeout(() => setCurrentStep(1), 1000);
        }, 1500);
    };

    const handleVerifyMx = () => {
        setMxVerificationStatus('verifying');
        setTimeout(() => {
            setMxVerificationStatus('success');
            setTimeout(() => addOrUpdateDomain(true), 1000);
        }, 1500);
    };

    const handleSkipMx = () => addOrUpdateDomain(false);

    const addOrUpdateDomain = (mxVerified: boolean) => {
        const newDomain: DomainInfo = {
            id: uuidv4(),
            domainName: formState.domainToConfigure,
            organizationName: formState.organizationName || formState.domainToConfigure,
            creationDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            subDomainCount: 0,
            isMxVerified: mxVerified,
            isSpfVerified: mxVerified,
            healthStatus: mxVerified ? 'healthy' : 'warning',
        };

        if (isNewDemoUser) {
            localStorage.setItem(DOMAIN_STORAGE_KEY, JSON.stringify([newDomain]));
            setOrganizations([{ id: 'demo-org', name: newDomain.organizationName, description: 'Demo Organization', primaryDomain: newDomain.domainName, domains: [newDomain] }]);
            setActiveOrgId('demo-org');
            window.dispatchEvent(new CustomEvent('domainStateChange'));
        } else {
            if (activeOrgId) {
                setOrganizations(prev => prev.map(o => o.id === activeOrgId ? { ...o, domains: [...o.domains, newDomain] } : o));
            } else {
                const newOrgId = uuidv4();
                setOrganizations(prev => [...prev, { id: newOrgId, name: newDomain.organizationName, description: '', primaryDomain: newDomain.domainName, domains: [newDomain] }]);
                setActiveOrgId(newOrgId);
            }
        }
        setSearchParams({ view: 'table' });
    }

    const handleHealthClick = (domain: DomainInfo) => {
        setSearchParams({ view: 'dns', domainId: domain.id });
    };

    const handleBackToTable = () => {
        setSearchParams({ view: 'table' });
    };

    const handleViewOrgSettings = () => {
        setSearchParams({ view: 'org-settings' });
    };

    const DNSConfigView = ({ domain, onBack, isVerified, onVerify, isVerifying, onSkip }: { domain: DomainInfo | null, onBack: () => void, isVerified?: boolean, onVerify?: () => void, isVerifying?: boolean, onSkip?: () => void }) => {
        const domainNameDisplay = domain ? domain.domainName : (formState.domainToConfigure || 'your domain');
        const hStatus: 'healthy' | 'warning' | 'unhealthy' = domain ? domain.healthStatus : (isVerified ? 'healthy' : 'warning');
        
        const [verifyingSections, setVerifyingSections] = useState<Record<string, boolean>>({});

        const handleVerifySection = (sectionId: string) => {
            setVerifyingSections(prev => ({ ...prev, [sectionId]: true }));
            setTimeout(() => {
                setVerifyingSections(prev => ({ ...prev, [sectionId]: false }));
            }, 1500);
        };

        // Logic mapping:
        // Healthy: All Success
        // Warning (CHECK): Mixed (some success, some warning)
        // Unhealthy (VERIFY NOW): All Error
        const getRecStatus = (index: number): VerificationStatus => {
            if (hStatus === 'healthy') return 'success' as VerificationStatus;
            if (hStatus === 'unhealthy') return 'error' as VerificationStatus;
            // For mixed status (warning/CHECK)
            return (index % 2 === 0 ? 'success' : 'warning') as VerificationStatus;
        };

        return (
            <div className="space-y-10 animate-fade-in pb-12">
                <div className="text-center space-y-4">
                    <h3 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">
                        DNS Configuration for {domainNameDisplay}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                        Update your domain's DNS records to authenticate your email and direct it to WorldPosta's servers.
                    </p>
                </div>

                {/* MX RECORDS SECTION */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#679a41] text-white flex items-center justify-center text-sm font-bold">1</div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">
                                Configure MX Records: Essential for receiving emails
                            </p>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleVerifySection('mx')} 
                            isLoading={verifyingSections['mx']}
                            disabled={hStatus === 'healthy'}
                            leftIconName="fas fa-check-double"
                        >
                            Verify
                        </Button>
                    </div>
                    <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <table className="min-w-full text-left">
                            <thead className="bg-gray-50 dark:bg-slate-800/50">
                                <tr className="text-[10px] text-gray-400 uppercase font-bold tracking-widest border-b dark:border-slate-800">
                                    <th className="px-6 py-4">NAME/HOST/ALIAS</th>
                                    <th className="px-6 py-4">TIME TO LIVE (TTL*)</th>
                                    <th className="px-6 py-4">RECORD TYPE</th>
                                    <th className="px-6 py-4 text-center">PRIORITY</th>
                                    <th className="px-6 py-4">VALUE/ANSWER/DESTINATION</th>
                                    <th className="px-6 py-4 text-center">STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                <MXRecordDisplayRow host="Blank or @" ttl="3600" priority={5} value="wp-secure-cloudmail01.worldposta.com" status={getRecStatus(0)} />
                                <MXRecordDisplayRow host="Blank or @" ttl="3600" priority={5} value="wp-secure-cloudmail02.worldposta.com" status={getRecStatus(1)} />
                                <MXRecordDisplayRow host="Blank or @" ttl="3600" priority={5} value="wp-secure-cloudmail03.worldposta.com" status={getRecStatus(2)} />
                                <MXRecordDisplayRow host="Blank or @" ttl="3600" priority={5} value="wp-secure-cloudmail04.worldposta.com" status={getRecStatus(3)} />
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SPF RECORD SECTION */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#679a41] text-white flex items-center justify-center text-sm font-bold">2</div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">
                                Configure SPF Record: Prevents others from spoofing your domain
                            </p>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleVerifySection('spf')} 
                            isLoading={verifyingSections['spf']}
                            disabled={hStatus === 'healthy'}
                            leftIconName="fas fa-check-double"
                        >
                            Verify
                        </Button>
                    </div>
                    <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <table className="min-w-full text-left">
                            <thead className="bg-gray-50 dark:bg-slate-800/50">
                                <tr className="text-[10px] text-gray-400 uppercase font-bold tracking-widest border-b dark:border-slate-800">
                                    <th className="px-6 py-4">HOST/DOMAIN</th>
                                    <th className="px-6 py-4">SPF VALUE / TXT VALUE</th>
                                    <th className="px-6 py-4 text-center">STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                <SPFRecordRow host="@" value="v=spf1 mx include:_spf.worldposta.com -all" status={getRecStatus(4)} />
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* DKIM RECORD SECTION */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#679a41] text-white flex items-center justify-center text-sm font-bold">3</div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">
                                Configure DKIM Record: Cryptographic signing for outbound mail
                            </p>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleVerifySection('dkim')} 
                            isLoading={verifyingSections['dkim']}
                            disabled={hStatus === 'healthy'}
                            leftIconName="fas fa-check-double"
                        >
                            Verify
                        </Button>
                    </div>
                    <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <table className="min-w-full text-left">
                            <thead className="bg-gray-50 dark:bg-slate-800/50">
                                <tr className="text-[10px] text-gray-400 uppercase font-bold tracking-widest border-b dark:border-slate-800">
                                    <th className="px-6 py-4">NAME/HOST/ALIAS</th>
                                    <th className="px-6 py-4 w-1/6">RECORD TYPE</th>
                                    <th className="px-6 py-4">VALUE/ANSWER/DESTINATION</th>
                                    <th className="px-6 py-4 text-center">STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                <GenericDNSDisplayRow host="worldposta._domainkey" type="CNAME" value="dkim.worldposta.com" status={getRecStatus(5)} />
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* DMARC RECORD SECTION */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#679a41] text-white flex items-center justify-center text-sm font-bold">4</div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">
                                Configure DMARC Record: Instructions for receiving servers
                            </p>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleVerifySection('dmarc')} 
                            isLoading={verifyingSections['dmarc']}
                            disabled={hStatus === 'healthy'}
                            leftIconName="fas fa-check-double"
                        >
                            Verify
                        </Button>
                    </div>
                    <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <table className="min-w-full text-left">
                            <thead className="bg-gray-50 dark:bg-slate-800/50">
                                <tr className="text-[10px] text-gray-400 uppercase font-bold tracking-widest border-b dark:border-slate-800">
                                    <th className="px-6 py-4">NAME/HOST/ALIAS</th>
                                    <th className="px-6 py-4 w-1/6">RECORD TYPE</th>
                                    <th className="px-6 py-4">VALUE/ANSWER/DESTINATION</th>
                                    <th className="px-6 py-4 text-center">STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                <GenericDNSDisplayRow host="_dmarc" type="TXT" value="v=DMARC1; p=quarantine; rua=mailto:dmarc@worldposta.com" status={getRecStatus(6)} />
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4 pt-8">
                     {onVerify && (
                        <Button onClick={onVerify} isLoading={isVerifying} disabled={isVerified} size="lg" className="px-12 font-bold shadow-lg shadow-green-500/20">
                            {isVerified ? 'Records Verified!' : 'Verify All DNS Records'}
                        </Button>
                    )}
                    <div className="flex gap-4">
                        {onSkip && <Button variant="ghost" onClick={onSkip}>Skip for now</Button>}
                        <Button variant="ghost" onClick={onBack} leftIconName="fas fa-arrow-left">Back to Domains</Button>
                    </div>
                </div>
            </div>
        );
    };

    const OrgSettingsView = () => {
        if (!activeOrg) return null;
        const [orgName, setOrgName] = useState(activeOrg.name);
        const [orgDesc, setOrgDesc] = useState(activeOrg.description);

        const handleSave = () => {
            setOrganizations(prev => prev.map(o => o.id === activeOrgId ? { ...o, name: orgName, description: orgDesc } : o));
            handleBackToTable();
        };

        return (
            <div className="max-w-3xl mx-auto py-8 space-y-8 animate-fade-in">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-[#293c51] dark:text-gray-100">Organization Settings</h2>
                    <Button variant="ghost" onClick={handleBackToTable} leftIconName="fas fa-arrow-left">Back</Button>
                </div>
                
                <Card title="Identification">
                    <div className="space-y-4">
                        <FormField id="org-name-edit" label="Organization Name" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
                        <FormField id="org-desc-edit" label="Description" as="textarea" rows={3} value={orgDesc} onChange={(e) => setOrgDesc(e.target.value)} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField id="org-id-display" label="Organization ID" value={activeOrg.id} onChange={() => {}} disabled />
                            <FormField id="org-primary-dom" label="Primary Domain" value={activeOrg.primaryDomain} onChange={() => {}} disabled />
                        </div>
                    </div>
                </Card>

                <Card title="Danger Zone" className="border-red-100 dark:border-red-900/50">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold text-red-600 dark:text-red-400">Delete Organization</p>
                            <p className="text-sm text-gray-500">Permanently remove this organization and all its data. This cannot be undone.</p>
                        </div>
                        <Button variant="danger" size="sm">Delete</Button>
                    </div>
                </Card>

                <div className="flex justify-end pt-4 border-t dark:border-slate-700">
                    <Button onClick={handleSave} size="lg" className="px-8 font-bold">Save Organization Changes</Button>
                </div>
            </div>
        );
    };

    const StepperView = () => (
        <div className="p-6">
            <div className="w-full md:w-3/4 mx-auto mb-10">
                <Stepper steps={steps} currentStep={currentStep} />
            </div>
            <div className="mt-8 max-w-5xl mx-auto">
                {currentStep === 0 ? (
                    <div className="space-y-6 text-center">
                        <h3 className="text-xl font-bold text-[#293c51] dark:text-gray-100">Verify Domain Ownership</h3>
                        <div className="max-w-md mx-auto bg-gray-50 dark:bg-slate-800/50 p-6 rounded-xl space-y-4 text-left border border-gray-200 dark:border-slate-700">
                            <FormField id="domainToConfigure" label="Domain Name" value={formState.domainToConfigure} onChange={(e) => setFormState({...formState, domainToConfigure: e.target.value.toLowerCase()})} placeholder="yourdomain.com" required />
                            <FormField id="organizationName" label="Organization Name" value={formState.organizationName} onChange={(e) => setFormState({...formState, organizationName: e.target.value})} required />
                        </div>
                        <Card className="text-left bg-gray-50/50 shadow-sm border border-gray-100 dark:border-slate-700">
                             <p className="text-sm mb-4 text-[#293c51] dark:text-gray-300 font-medium">Add this TXT record to your DNS settings:</p>
                             <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead className="bg-gray-100/50 dark:bg-slate-700/50">
                                        <tr className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                                            <th className="px-4 py-2 text-left">Type</th>
                                            <th className="px-4 py-2 text-left">Name</th>
                                            <th className="px-4 py-2 text-left">Value</th>
                                            <th className="px-4 py-2 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-slate-700">
                                        <DNSRecordRow type="TXT" name="@" value={`wp-verification-${uuidv4().substring(0,8)}`} status="pending" />
                                    </tbody>
                                </table>
                             </div>
                        </Card>
                        <div className="flex justify-center gap-3">
                            <Button variant="ghost" onClick={handleBackToTable}>Cancel</Button>
                            <Button onClick={handleVerifyDomain} isLoading={domainVerificationStatus === 'verifying'} disabled={!formState.domainToConfigure.trim() || domainVerificationStatus === 'success'}>
                                {domainVerificationStatus === 'success' ? 'Verified!' : 'Verify Now'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <DNSConfigView domain={null} onBack={handleBackToTable} isVerified={mxVerificationStatus === 'success'} onVerify={handleVerifyMx} isVerifying={mxVerificationStatus === 'verifying'} onSkip={handleSkipMx} />
                )}
            </div>
        </div>
    );

    const TableView = () => (
        <div className="flex flex-col lg:flex-row gap-8 items-start animate-fade-in">
            {/* Left Sidebar: Organizations as list tabs */}
            <div className="w-full lg:w-72 flex-shrink-0">
                <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
                    {organizations.map(org => (
                        <button
                            key={org.id}
                            onClick={() => setActiveOrgId(org.id)}
                            className={`w-full text-left px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-200
                                ${activeOrgId === org.id 
                                    ? 'bg-[#679a41] text-white shadow-md' 
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-400 dark:hover:bg-slate-700'}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="truncate">{org.name}</span>
                                {activeOrgId === org.id && <Icon name="fas fa-chevron-right" className="text-[10px] opacity-70" />}
                            </div>
                        </button>
                    ))}
                    {organizations.length === 0 && <p className="text-center text-xs text-gray-400 py-6 italic">No organizations found</p>}
                </div>
            </div>

            {/* Right Side: Domains */}
            <div className="flex-grow w-full">
                <div className="overflow-x-auto bg-white dark:bg-slate-900/40 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-800/50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-5 text-left">Domain Name</th>
                                <th className="px-6 py-5 text-left">Creation Date</th>
                                <th className="px-6 py-5 text-left">Subdomain</th>
                                <th className="px-6 py-5 text-left">Health check</th>
                                <th className="px-6 py-5 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {activeOrg && activeOrg.domains.length > 0 ? (
                                activeOrg.domains.map(domain => (
                                    <tr key={domain.id} className="text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50/30 dark:hover:bg-slate-800/20 transition-colors group">
                                        <td className="px-6 py-5 font-medium">{domain.domainName}</td>
                                        <td className="px-6 py-5 text-gray-500">{domain.creationDate || '-'}</td>
                                        <td className="px-6 py-5 text-gray-500">{domain.subDomainCount || '-'}</td>
                                        <td className="px-6 py-5">
                                            <button 
                                                onClick={() => handleHealthClick(domain)}
                                                className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-wider transition-opacity hover:opacity-80 focus:outline-none"
                                            >
                                                {domain.healthStatus === 'healthy' ? (
                                                    <div className="flex items-center gap-2 text-[#679a41]">
                                                        <Icon name="fas fa-check-circle" className="text-sm" />
                                                        <span className="underline decoration-dotted">HEALTH OK</span>
                                                    </div>
                                                ) : domain.healthStatus === 'warning' ? (
                                                    <div className="flex items-center gap-2 text-yellow-500">
                                                        <Icon name="fas fa-exclamation-triangle" className="text-sm" />
                                                        <span className="underline decoration-dotted">CHECK</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-red-500">
                                                        <Icon name="fas fa-exclamation-circle" className="text-sm" />
                                                        <span className="underline decoration-dotted">VERIFY NOW</span>
                                                    </div>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="text-gray-300 hover:text-[#293c51] dark:hover:text-white p-2 transition-colors">
                                                <Icon name="fas fa-ellipsis-v" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-24">
                                        <div className="flex flex-col items-center justify-center opacity-40">
                                            <Icon name="fas fa-globe" className="text-4xl mb-3 text-gray-400" />
                                            <p className="text-sm font-medium italic text-gray-500">
                                                {activeOrg ? 'No domains found in this organization' : 'Select an organization to view active domains'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const titleActions = (
        <div className="flex items-center gap-3">
            <Button variant="primary" className="!bg-[#679a41] !border-none text-white text-xs px-5 py-2 font-bold shadow-sm" leftIconName="fas fa-plus" onClick={handleStartAddProcess}>
                Add Domain
            </Button>
            <Button variant="outline" className="text-xs px-5 py-2 font-bold shadow-sm text-[#679a41] border-[#679a41] hover:bg-[#679a41]/10 dark:text-emerald-400 dark:border-emerald-400 dark:hover:bg-emerald-400/10" onClick={handleViewOrgSettings}>
                View Organization
            </Button>
        </div>
    );

    return (
        <Card title="Organizations" titleActions={titleActions} className="!p-8 shadow-lg border border-gray-100 dark:border-slate-800">
            {view === 'stepper' && <StepperView />}
            {view === 'table' && <TableView />}
            {view === 'dns' && <div className="max-w-5xl mx-auto"><DNSConfigView domain={selectedDomainForDns} onBack={handleBackToTable} /></div>}
            {view === 'org-settings' && <OrgSettingsView />}
        </Card>
    );
};