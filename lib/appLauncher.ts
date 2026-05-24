import type { User, ApplicationCardData } from '@/types';

export const getAppLauncherItems = (role: User['role'] | undefined): ApplicationCardData[] => {
    const baseApps: ApplicationCardData[] = [
        {
            id: 'website',
            name: 'WorldPosta.com',
            description: 'Visit the main WorldPosta website for news and service information.',
            iconName: 'https://www.worldposta.com/assets/Newhomeimgs/vds-vs-vms/icons/Asset%201.png',
            launchUrl: '/'
        },
        { 
            id: 'cloudedge', 
            name: 'CloudEdge', 
            description: 'Manage your cloud infrastructure, VMs, and network resources efficiently.',
            iconName: "https://console.worldposta.com/assets/loginImgs/edgeLogo.png", 
            launchUrl: '/app/cloud-edge' 
        },
        { 
            id: 'emailadmin', 
            name: 'Email Admin Suite', 
            description: 'Administer your email services, mailboxes, users, and domains with ease.',
            iconName: "https://www.worldposta.com/assets/Posta-Logo.avif", 
            launchUrl: '/app/email-admin-suite'
        },
        { 
            id: 'postagate', 
            name: 'Posta Gate', 
            description: 'AI-powered email security gateway to stop phishing, malware, and BEC.',
            iconName: "https://i.postimg.cc/Y4GWHh1r/Asset-1-4x.png", 
            launchUrl: '/app/posta-gate'
        }
    ];

    const customerApps: ApplicationCardData[] = [
        { 
            id: 'billing', 
            name: 'Billing and Subscriptions', 
            description: 'Oversee your subscriptions and add new services.', 
            iconName: 'fas fa-wallet', 
            launchUrl: '/app/billing',
        },
        { 
            id: 'invoices', 
            name: 'Invoice History', 
            description: 'View and download past invoices for your records.', 
            iconName: 'fas fa-file-invoice', 
            launchUrl: '/app/billing/invoices',
        },
        {
            id: 'support',
            name: 'Support Center',
            description: 'Access knowledge base or create support tickets with our team.',
            iconName: 'fas fa-headset',
            launchUrl: '/app/support',
        },
        {
            id: 'action-logs',
            name: 'Action Logs',
            description: 'Review a detailed history of all activities and events on your account.',
            iconName: 'fas fa-history',
            launchUrl: '/app/action-logs',
        },
    ];

    if (role === 'customer') {
        return [...baseApps, ...customerApps];
    }
    if (role === 'admin') {
        return [
            { id: 'billing', name: 'Billings', description: 'Access and manage billing for all customer accounts.', iconName: 'fas fa-cash-register', launchUrl: '/app/billing' },
            ...baseApps,
        ];
    }
    if (role === 'reseller') {
        return [
            { id: 'billing', name: 'Reseller Billing', description: 'Manage your billing, commissions, and payment history.', iconName: 'fas fa-file-invoice-dollar', launchUrl: '/app/billing' },
            ...baseApps,
        ];
    }
    return baseApps;
};
