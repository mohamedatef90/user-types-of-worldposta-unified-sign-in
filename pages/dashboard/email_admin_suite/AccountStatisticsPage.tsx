import React from 'react';
import { Card, Icon, Button } from '@/components/ui';
import { Link } from 'react-router-dom';
import { useAppLayout, useAuth } from '@/context';

// A simple progress bar component for reuse within this page
const ProgressBar: React.FC<{ value: number; max: number; className?: string }> = ({ value, max, className }) => {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : (value > 0 ? 100 : 0);
    return (
        <div className={`w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 ${className}`}>
            <div className="bg-[#679a41] h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

// A component for displaying key-value pairs, some with progress bars
const InfoRow: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-slate-700 last:border-b-0">
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        <div className="text-sm font-medium text-[#293c51] dark:text-gray-200 text-right flex items-center gap-2">
            {children}
        </div>
    </div>
);

// Component for enabled/disabled status
const StatusIndicator: React.FC<{ enabled: boolean }> = ({ enabled }) => (
    <span className={`font-semibold ${enabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {enabled ? 'Enabled' : 'Disabled'}
    </span>
);

export const AccountStatisticsPage: React.FC = () => {
    const { isDomainVerifiedForDemo } = useAppLayout();
    const { user } = useAuth();
    const isNewDemoUser = user?.email === 'new.user@worldposta.com';
    const isDisabled = isNewDemoUser && !isDomainVerifiedForDemo;

    if (isDisabled) {
        return (
            <Card>
                <div className="text-center py-20">
                    <Icon name="fas fa-lock" className="text-4xl text-yellow-500 mb-4" />
                    <h2 className="text-2xl font-bold text-[#293c51] dark:text-gray-100 mb-2">Domain Verification Required</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Please verify your domain to view account statistics.
                    </p>
                    <Link to="/app/email-admin-suite/orgs-and-domains" className="font-semibold text-[#679a41] dark:text-emerald-400 hover:underline">
                        Verify Your Domain Now
                    </Link>
                </div>
            </Card>
        );
    }
    
    const spaceAddOns = [
        { type: 'Extra Mailboxes', qty: 5, creationDate: 'Jun 19, 2019', status: 'Active' },
        { type: 'Extra Mailboxes', qty: 3, creationDate: 'Jul 16, 2019', status: 'Active' },
        { type: 'Extra Mailboxes', qty: 30, creationDate: 'Mar 31, 2022', status: 'Active' },
        { type: 'Extra Mailboxes', qty: 21, creationDate: 'Jul 25, 2022', status: 'Active' },
        { type: 'Extra Mailboxes', qty: 5, creationDate: 'Sep 14, 2022', status: 'Active' },
        { type: 'Extra Mailboxes', qty: 5, creationDate: 'Oct 11, 2022', status: 'Active' },
        { type: 'Extra Mailboxes', qty: 10, creationDate: 'Nov 3, 2022', status: 'Active' },
        { type: 'Extra Mailboxes', qty: 5, creationDate: 'Dec 16, 2022', status: 'Active' },
        { type: 'Extra Mailboxes', qty: 100, creationDate: 'Oct 15, 2023', status: 'Active' },
        { type: 'Extra Mailboxes', qty: 5, creationDate: 'Dec 10, 2023', status: 'Active' },
        { type: 'Extra Mailboxes', qty: -4, creationDate: 'Nov 11, 2024', status: 'Active' },
        { type: 'Extra Mailboxes', qty: -5, creationDate: 'Nov 12, 2024', status: 'Active' },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Account Statistics</h1>
            
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                    <InfoRow label="Diskspace, MB:">37 of Unlimited</InfoRow>
                    <InfoRow label="Bandwidth, MB:">0 of Unlimited</InfoRow>
                    <InfoRow label="Domains:">25 of Unlimited</InfoRow>
                    <InfoRow label="Sub-Domains:">0 of Unlimited</InfoRow>
                    <InfoRow label="Organizations:">9 of Unlimited</InfoRow>
                    <InfoRow label="Exchange Mailboxes:">
                        <div className="flex items-center gap-2 w-40">
                            <ProgressBar value={25} max={185} />
                            <span>25 of 185</span>
                        </div>
                    </InfoRow>
                    <InfoRow label="Exchange Storage:">2504000 of Unlimited</InfoRow>
                    <InfoRow label="Drive Quota:">1000 GB</InfoRow>
                    <InfoRow label="Active Drive Quota:"><Icon name="far fa-check-square" className="text-lg text-[#679a41]" /></InfoRow>
                </div>
            </Card>

            <section>
                <h2 className="text-2xl font-semibold mb-4 text-[#293c51] dark:text-gray-100">Enterprise</h2>
                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                        <InfoRow label="User:">support1@worldposta.com</InfoRow>
                        <InfoRow label="Hosting Plan:">Enterprise Plan 1TB</InfoRow>
                        <InfoRow label="Created:">Nov 25, 2018</InfoRow>
                        <InfoRow label="Status:">Active</InfoRow>
                    </div>
                </Card>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 text-[#293c51] dark:text-gray-100">Space Add-Ons</h2>
                <Card>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Creation Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                {spaceAddOns.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                        <td className="px-4 py-3 text-sm">{item.type}</td>
                                        <td className="px-4 py-3 text-sm">{item.qty}</td>
                                        <td className="px-4 py-3 text-sm">{item.creationDate}</td>
                                        <td className="px-4 py-3 text-sm">{item.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </section>
            
            <section>
                <h2 className="text-2xl font-semibold mb-4 text-[#293c51] dark:text-gray-100">Space Quotas</h2>
                <div className="space-y-6">
                    <Card title="System">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                            <InfoRow label="Disk space, MB">37 of Unlimited</InfoRow>
                            <InfoRow label="Bandwidth, MB">0 of Unlimited</InfoRow>
                            <InfoRow label="Domains">25 of Unlimited</InfoRow>
                            <InfoRow label="Sub-Domains">0 of Unlimited</InfoRow>
                            <InfoRow label="ODBC DSNs">
                                <div className="flex items-center gap-2 w-40"><ProgressBar value={0} max={0} /><span>0 of 0</span></div>
                            </InfoRow>
                            <InfoRow label="File Manager"><StatusIndicator enabled={false} /></InfoRow>
                            <InfoRow label="Applications Installer"><StatusIndicator enabled={true} /></InfoRow>
                            <InfoRow label="Extra Application Packs"><StatusIndicator enabled={true} /></InfoRow>
                            <InfoRow label="Scheduled Tasks">0 of Unlimited</InfoRow>
                            <InfoRow label="Interval Tasks Allowed"><StatusIndicator enabled={true} /></InfoRow>
                            <InfoRow label="Minimum Tasks Interval, minutes">0 of 'Unlimited'</InfoRow>
                            <InfoRow label="Disable Tenant To Create Top-Level Domain"><StatusIndicator enabled={false} /></InfoRow>
                        </div>
                    </Card>

                    <Card title="Hosted Exchange">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                            <InfoRow label="Consumer Organization Support"><StatusIndicator enabled={false} /></InfoRow>
                            <InfoRow label="Mailbox Storage per Organization, MB">
                                <div className="flex items-center gap-2 w-40"><ProgressBar value={2504000} max={2504000} /><span>2504000 of Unlimited</span></div>
                            </InfoRow>
                            <InfoRow label="Mailboxes per Organization">
                                <div className="flex items-center gap-2 w-40"><ProgressBar value={25} max={185} /><span>25 of 185</span></div>
                            </InfoRow>
                            <InfoRow label="Contacts per Organization">500</InfoRow>
                            <InfoRow label="Distribution Lists per Organization">150</InfoRow>
                            <InfoRow label="Public Folders per Organization">0</InfoRow>
                            <InfoRow label="Mail Enabled Public Folders Allowed"><StatusIndicator enabled={true} /></InfoRow>
                            <InfoRow label="POP3 Access Allowed"><StatusIndicator enabled={false} /></InfoRow>
                            <InfoRow label="IMAP Access Allowed"><StatusIndicator enabled={true} /></InfoRow>
                            <InfoRow label="OWA/HTTP Access Allowed"><StatusIndicator enabled={true} /></InfoRow>
                            <InfoRow label="MAPI Access Allowed"><StatusIndicator enabled={true} /></InfoRow>
                            <InfoRow label="ActiveSync Access Allowed"><StatusIndicator enabled={true} /></InfoRow>
                            <InfoRow label="Keep Deleted Items (Days)">61</InfoRow>
                            <InfoRow label="Maximum Recipients">150</InfoRow>
                            <InfoRow label="Maximum Send Message Size (Kb)">36000</InfoRow>
                            <InfoRow label="Maximum Receive Message Size (Kb)">36000</InfoRow>
                            <InfoRow label="Enable Mailbox Plans Editing"><StatusIndicator enabled={false} /></InfoRow>
                            <InfoRow label="Allow Litigation Hold"><StatusIndicator enabled={false} /></InfoRow>
                            <InfoRow label="Recoverable Items Storage per Organization, MB">
                                <div className="flex items-center gap-2 w-40"><ProgressBar value={0} max={60} /><span>0 of 60</span></div>
                            </InfoRow>
                            <InfoRow label="Disclaimers Allowed"><StatusIndicator enabled={true} /></InfoRow>
                            <InfoRow label="Allow Retention policy"><StatusIndicator enabled={false} /></InfoRow>
                            <InfoRow label="Archiving Mailboxes per Organization">
                                <div className="flex items-center gap-2 w-40"><ProgressBar value={0} max={0} /><span>0 of 0</span></div>
                            </InfoRow>
                            <InfoRow label="Archiving Storage per Organization, MB">
                                <div className="flex items-center gap-2 w-40"><ProgressBar value={0} max={0} /><span>0 of 0</span></div>
                            </InfoRow>
                            <InfoRow label="Shared Mailboxes per Organization">0 of Unlimited</InfoRow>
                            <InfoRow label="Resource Mailboxes per Organization">0 of Unlimited</InfoRow>
                        </div>
                    </Card>

                    <Card title="Hosted Organizations">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                             <InfoRow label="Organizations">9 of Unlimited</InfoRow>
                            <InfoRow label="Users per Organization">
                                <div className="flex items-center gap-2 w-40"><ProgressBar value={25} max={185} /><span>25 of 185</span></div>
                            </InfoRow>
                            <InfoRow label="Domains per Organization">0 of 'Unlimited'</InfoRow>
                            <InfoRow label="Allow to Change UserPrincipalName"><StatusIndicator enabled={true} /></InfoRow>
                            <InfoRow label="Security Groups per Organization">
                                 <div className="flex items-center gap-2 w-40"><ProgressBar value={9} max={0} /><span>9 of 0</span></div>
                            </InfoRow>
                            <InfoRow label="Deleted Users per Organization">
                                 <div className="flex items-center gap-2 w-40"><ProgressBar value={0} max={0} /><span>0 of 0</span></div>
                            </InfoRow>
                            <InfoRow label="Deleted Users Backup Storage Space per Organization, MB">0 of Unlimited</InfoRow>
                        </div>
                    </Card>
                </div>
            </section>
        </div>
    );
};