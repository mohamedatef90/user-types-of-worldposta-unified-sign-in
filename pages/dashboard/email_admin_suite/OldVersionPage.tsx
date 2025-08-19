import React from 'react';
import { Card, Icon } from '@/components/ui';
import { Link } from 'react-router-dom';

// Copied from EmailAdminSuiteDashboardPage.tsx for the "At a Glance" section
const MiniStatCard: React.FC<{ title: string; metric: string; iconName: string; iconColor: string; }> = ({ title, metric, iconName, iconColor }) => (
    <div className="bg-gray-50/50 dark:bg-slate-700/25 p-4 rounded-xl flex items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${iconColor.replace('text-', 'bg-').replace('-500', '-100 dark:bg-opacity-20')} `}>
            <Icon name={iconName} className={`text-2xl ${iconColor}`} />
        </div>
        <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-[#293c51] dark:text-gray-100">{metric}</p>
        </div>
    </div>
);

const StatsGrid: React.FC = () => (
    <Card title="At a Glance">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow content-start">
            <MiniStatCard title="Total Mailboxes" metric="1,254" iconName="fas fa-envelope" iconColor="text-blue-500" />
            <MiniStatCard title="Domains Managed" metric="12" iconName="fas fa-sitemap" iconColor="text-green-500" />
            <MiniStatCard title="Threats Blocked (24h)" metric="209" iconName="fas fa-flag" iconColor="text-red-500" />
            <MiniStatCard title="Overall Health" metric="99.8%" iconName="fas fa-heart" iconColor="text-indigo-500" />
        </div>
    </Card>
);

interface DashboardItemProps {
    icon: string;
    label: string;
    description: string;
    path: string;
}

const DashboardItem: React.FC<DashboardItemProps> = ({ icon, label, description, path }) => (
    <Link to={path} className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors group">
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-slate-700 rounded-lg mr-4">
            <Icon name={icon} className="text-xl text-[#679a41] dark:text-emerald-400" />
        </div>
        <div>
            <p className="font-semibold text-sm text-[#293c51] dark:text-gray-100 group-hover:text-[#679a41] dark:group-hover:text-emerald-400">{label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    </Link>
);

interface DashboardSectionProps {
    title: string;
    children: React.ReactNode;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ title, children }) => (
    <Card className="bg-white/70 dark:bg-slate-800/70">
        <h2 className="text-xl font-bold text-[#293c51] dark:text-gray-100 mb-4 pb-3 border-b border-gray-200 dark:border-slate-700">{title}</h2>
        <div className="space-y-2">
            {children}
        </div>
    </Card>
);

const exchangeItems = [
    { icon: 'fas fa-envelope', label: 'Mailboxes', path: '/app/email-admin-suite/exchange/mailboxes', description: 'Create, edit, and manage user mailboxes.' },
    { icon: 'fas fa-users', label: 'Distribution Lists', path: '/app/email-admin-suite/exchange/distribution-lists', description: 'Group recipients into a single email address.' },
    { icon: 'fas fa-address-book', label: 'Shared Contacts', path: '/app/email-admin-suite/exchange/shared-contacts', description: 'Manage external contacts for your organization.' },
    { icon: 'fas fa-cubes', label: 'Bulk Module', path: '/app/email-admin-suite/exchange/bulk-module', description: 'Perform mass operations on mailboxes.' },
    { icon: 'fas fa-file-alt', label: 'Rules', path: '/app/email-admin-suite/exchange/rules', description: 'Set up rules to manage mail flow.' },
    { icon: 'fas fa-server', label: 'Mailbox Plans', path: '/app/email-admin-suite/exchange/mailbox-plans', description: 'Define and manage mailbox service tiers.' },
    { icon: 'fas fa-tasks', label: 'Running Tasks', path: '/app/email-admin-suite/exchange/running-tasks', description: 'Monitor the progress of ongoing tasks.' },
    { icon: 'fas fa-clipboard-list', label: 'SMTP Logs', path: '/app/email-admin-suite/exchange/smtp-logs', description: 'Track email delivery and troubleshoot issues.' },
];

const adminItems = [
    { icon: 'fas fa-file-invoice-dollar', label: 'Billing', path: '/app/email-admin-suite/admin/billing', description: 'View and manage billing information.' },
    { icon: 'fas fa-users', label: 'Users', path: '/app/email-admin-suite/admin/users', description: 'Manage administrative users for this suite.' },
    { icon: 'fas fa-user-shield', label: 'Permissions Groups', path: '/app/email-admin-suite/admin/permission-groups', description: 'Define roles and permissions for admins.' },
    { icon: 'fas fa-clipboard-check', label: 'Background Tasks', path: '/app/email-admin-suite/admin/background-tasks', description: 'Review the history of completed tasks.' },
    { icon: 'fas fa-history', label: 'Action Logs', path: '/app/email-admin-suite/admin/action-logs', description: 'Audit all administrative actions performed.' },
    { icon: 'fas fa-list-ul', label: 'White & Black Lists', path: '/app/email-admin-suite/admin/lists', description: 'Manage sender-based email filtering lists.' },
    { icon: 'fas fa-network-wired', label: 'White & Black IPs', path: '/app/email-admin-suite/admin/ip-lists', description: 'Control email flow based on IP addresses.' },
];

const orgItems = [
    { icon: 'fas fa-chart-bar', label: 'Account Statistics', path: '/app/email-admin-suite/exchange/account-statistics', description: 'View usage statistics and resource allocation.' },
    { icon: 'fas fa-sitemap', label: 'Organizations & Domains', path: '/app/email-admin-suite/orgs-and-domains', description: 'Manage domains for your email service.' },
];

const migrationItems = [
    { icon: 'fas fa-cloud-upload-alt', label: 'Migrations', path: '/app/email-admin-suite/migrations', description: 'Manage email migrations from other providers.' },
    { icon: 'fas fa-folder-plus', label: 'Add Migration', path: '/app/email-admin-suite/migrations/add', description: 'Start a new email migration process.' },
];

const ticketItems = [
    { icon: 'fas fa-comments', label: 'Tickets', path: '/app/email-admin-suite/tickets', description: 'View and manage your support tickets.' },
    { icon: 'fas fa-comment-medical', label: 'New Ticket', path: '/app/email-admin-suite/tickets/new', description: 'Create a new support ticket.' },
];

export const OldVersionPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <StatsGrid />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <DashboardSection title="Exchange Email">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                            {exchangeItems.map(item => <DashboardItem key={item.label} {...item} />)}
                        </div>
                    </DashboardSection>
                    <DashboardSection title="Admin & Billing">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                            {adminItems.map(item => <DashboardItem key={item.label} {...item} />)}
                        </div>
                    </DashboardSection>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <DashboardSection title="Organizations">
                        {orgItems.map(item => <DashboardItem key={item.label} {...item} />)}
                    </DashboardSection>
                    <DashboardSection title="Migrations">
                        {migrationItems.map(item => <DashboardItem key={item.label} {...item} />)}
                    </DashboardSection>
                    <DashboardSection title="Tickets">
                        {ticketItems.map(item => <DashboardItem key={item.label} {...item} />)}
                    </DashboardSection>
                </div>
            </div>
        </div>
    );
};
