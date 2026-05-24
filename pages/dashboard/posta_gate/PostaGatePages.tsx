
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Icon, FormField, Button } from '@/components/ui';

export const PostaGateMailLogPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Mail Log / Threat Intelligence</h2>
                <Button variant="outline" leftIconName="fas fa-download">Export CSV</Button>
            </div>
            
            <Card>
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex-1 min-w-[200px]">
                        <FormField id="search" label="Search" placeholder="Search by subject, sender, or recipient..." onChange={() => {}} />
                    </div>
                    <div className="w-48">
                        <FormField id="verdict" label="Verdict" as="select" onChange={() => {}}>
                            <option>All Verdicts</option>
                            <option>Clean</option>
                            <option>Phishing</option>
                            <option>Malware</option>
                            <option>Spam</option>
                        </FormField>
                    </div>
                    <div className="w-48">
                        <FormField id="date" label="Date Range" as="select" onChange={() => {}}>
                            <option>Last 24 Hours</option>
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>Custom Range</option>
                        </FormField>
                    </div>
                </div>

                <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-700 text-gray-500 uppercase text-[10px] font-bold">
                            <tr>
                                <th className="px-4 py-3">Verdict</th>
                                <th className="px-4 py-3">Time</th>
                                <th className="px-4 py-3">From</th>
                                <th className="px-4 py-3">To</th>
                                <th className="px-4 py-3">Subject</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {[
                                { verdict: 'Phishing', time: '10:42:15', from: 'cfo@w0rldp0sta.com', to: 'finance@acme.com', subject: 'Urgent: Wire Transfer Request' },
                                { verdict: 'Clean', time: '10:40:05', from: 'newsletter@tech-news.com', to: 'it@acme.com', subject: 'Weekly Tech Digest' },
                                { verdict: 'Malware', time: '10:38:20', from: 'invoice@shipping.net', to: 'hr@acme.com', subject: 'Your Invoice #12345' },
                                { verdict: 'Spam', time: '10:35:12', from: 'promo@cheap-flights.biz', to: 'sales@acme.com', subject: 'Unbeatable flight deals!' },
                            ].map((m, i) => (
                                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            m.verdict === 'Phishing' ? 'bg-red-100 text-red-700' :
                                            m.verdict === 'Malware' ? 'bg-red-900 text-red-100' :
                                            m.verdict === 'Spam' ? 'bg-amber-100 text-amber-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {m.verdict}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{m.time}</td>
                                    <td className="px-4 py-3 font-medium">{m.from}</td>
                                    <td className="px-4 py-3">{m.to}</td>
                                    <td className="px-4 py-3 truncate max-w-[200px]">{m.subject}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="text-blue-600 hover:underline">Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export const PostaGateForensicsPage: React.FC = () => (
    <div className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
            <Link to="/app/posta-gate/mail-log" className="text-gray-500 hover:text-blue-600">
                <Icon name="fas fa-arrow-left" />
            </Link>
            <h2 className="text-xl font-bold">Threat Forensics</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card className="border-l-4 border-red-600">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Verdict</div>
                            <div className="flex items-center gap-2">
                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide">Phishing</span>
                                <span className="text-sm text-gray-400">98% Confidence</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Scan Time</div>
                            <div className="text-sm font-mono">1,240ms</div>
                        </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800">
                        <div className="font-bold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                            <Icon name="fas fa-robot" />
                            Blocked because:
                        </div>
                        <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 ml-6 list-disc">
                            <li>Display name impersonates CFO (Ahmed Rashid)</li>
                            <li>Sending domain is 4 days old (created 10 Apr 2026)</li>
                            <li>Link redirects to credential harvesting page</li>
                            <li>DMARC fail — domain not aligned</li>
                            <li>Urgency language detected ("urgent wire transfer")</li>
                        </ul>
                    </div>
                </Card>

                <Card title="Message Overview">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-gray-500 mb-1">From</div>
                                <div className="font-medium">cfo@w0rldp0sta.com</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">To</div>
                                <div className="font-medium">finance@acme.com</div>
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Subject</div>
                            <div className="font-medium text-lg">Urgent: Wire Transfer Request</div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="space-y-6">
                <Card title="Actions" className="sticky top-6">
                    <div className="space-y-3">
                        <Button variant="danger" className="w-full" leftIconName="fas fa-user-slash">Block Sender</Button>
                        <Button variant="outline" className="w-full" leftIconName="fas fa-paper-plane">Release to Inbox</Button>
                        <Button variant="outline" className="w-full" leftIconName="fas fa-flag">Report False Positive</Button>
                        <hr className="my-2 dark:border-slate-700" />
                        <Button variant="ghost" className="w-full" leftIconName="fas fa-file-pdf">Export Forensic PDF</Button>
                    </div>
                </Card>
            </div>
        </div>
    </div>
);

export const PostaGatePolicyBuilderPage: React.FC = () => {
    const policies = [
        { id: 1, name: 'Block Executables', direction: 'Inbound', status: 'Active' },
        { id: 2, name: 'DLP - Financial Data', direction: 'Outbound', status: 'Active' },
        { id: 3, name: 'Allow IT Domain', direction: 'Both', status: 'Inactive' },
        { id: 4, name: 'Spam Filtering - Aggressive', direction: 'Inbound', status: 'Active' },
    ];

    const [openMenuId, setOpenMenuId] = React.useState<number | null>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const DefaultToolbar = () => (
        <div className="flex items-center gap-2">
            <Button variant="outline" leftIconName="fas fa-filter">
                Filters & Search
            </Button>
            <Button leftIconName="fas fa-plus-circle">Create Policy</Button>
        </div>
    );

    return (
        <div className="space-y-6">            
            <Card title="Security Policies" titleActions={<DefaultToolbar />}>
                <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left w-4">
                                    <input type="checkbox" className="rounded" />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Direction</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {policies.map((policy) => (
                                <tr key={policy.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <input type="checkbox" className="rounded" />
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-gray-200">{policy.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{policy.direction}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                            policy.status === 'Active' 
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300'
                                        }`}>
                                            {policy.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                                        <div className="relative inline-block" ref={openMenuId === policy.id ? menuRef : null}>
                                            <button 
                                                onClick={() => setOpenMenuId(openMenuId === policy.id ? null : policy.id)}
                                                className="text-gray-400 hover:text-[#293c51] dark:hover:text-white p-2 transition-colors focus:outline-none"
                                            >
                                                <Icon name="fas fa-ellipsis-v" />
                                            </button>
                                            {openMenuId === policy.id && (
                                                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
                                                    <div className="py-1">
                                                        <button 
                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 w-full text-left"
                                                        >
                                                            <Icon name="fas fa-pencil-alt" className="mr-3 w-4 text-gray-400" />
                                                            Edit Policy
                                                        </button>
                                                        <button 
                                                            className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                                                        >
                                                            <Icon name="fas fa-trash-alt" className="mr-3 w-4 text-red-500" />
                                                            Delete Policy
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export const PostaGateQuarantinePage: React.FC = () => (
    <div className="space-y-6">
        <h2 className="text-xl font-bold">Quarantine Center</h2>
        <Card className="p-10 text-center text-gray-500">
            <Icon name="fas fa-biohazard" className="text-5xl mb-4 text-blue-500" />
            <p>Management of quarantined emails for admins and users will appear here.</p>
        </Card>
    </div>
);

export const PostaGateReportsPage: React.FC = () => (
    <div className="space-y-6">
        <h2 className="text-xl font-bold">Reports & Compliance</h2>
        <Card className="p-10 text-center text-gray-500">
            <Icon name="fas fa-chart-bar" className="text-5xl mb-4 text-blue-500" />
            <p>Executive summaries and compliance audit reports will appear here.</p>
        </Card>
    </div>
);

export const PostaGateGetStartedPage: React.FC = () => (
    <div className="max-w-2xl mx-auto py-12">
        <Card className="p-8">
            <div className="text-center mb-8">
                <Icon name="fas fa-rocket" className="text-5xl text-blue-500 mb-4" />
                <h2 className="text-2xl font-bold">Welcome to Posta Gate</h2>
                <p className="text-gray-500">Let's get your email security set up in under 15 minutes.</p>
            </div>
            <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">1</div>
                    <div>
                        <div className="font-bold">Verify Domain</div>
                        <div className="text-sm text-gray-500">Enter your email domain to protect.</div>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg opacity-50">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-500 font-bold">2</div>
                    <div>
                        <div className="font-bold">Update MX Records</div>
                        <div className="text-sm text-gray-500">Point your mail flow to Posta Gate.</div>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg opacity-50">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-500 font-bold">3</div>
                    <div>
                        <div className="font-bold">Sync Users</div>
                        <div className="text-sm text-gray-500">Connect LDAP or Azure AD.</div>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg opacity-50">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-500 font-bold">4</div>
                    <div>
                        <div className="font-bold">Select Policy</div>
                        <div className="text-sm text-gray-500">Pick a security posture template.</div>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg opacity-50">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-500 font-bold">5</div>
                    <div>
                        <div className="font-bold">Test & Launch</div>
                        <div className="text-sm text-gray-500">Send a test phish and go live.</div>
                    </div>
                </div>
                <Button className="w-full py-6 text-lg">Start Onboarding</Button>
            </div>
        </Card>
    </div>
);

export const PostaGateMSPConsolePage: React.FC = () => (
    <div className="space-y-6">
        <h2 className="text-xl font-bold">MSP Tenant Console</h2>
        <Card className="p-10 text-center text-gray-500">
            <Icon name="fas fa-users-cog" className="text-5xl mb-4 text-blue-500" />
            <p>Multi-tenant management for MSPs will appear here.</p>
        </Card>
    </div>
);

export const PostaGateSettingsPage: React.FC = () => (
    <div className="space-y-6">
        <h2 className="text-xl font-bold">Settings & Configuration</h2>
        <Card className="p-10 text-center text-gray-500">
            <Icon name="fas fa-cog" className="text-5xl mb-4 text-blue-500" />
            <p>Domain, user, and integration settings will appear here.</p>
        </Card>
    </div>
);
