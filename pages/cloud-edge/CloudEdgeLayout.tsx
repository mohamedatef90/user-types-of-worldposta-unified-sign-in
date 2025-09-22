import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useLocation, useSearchParams, NavLink, Outlet } from 'react-router-dom';
import { Icon, FormField, Button, ToggleSwitch, DoughnutChart, FloatingAppLauncher, FeedbackSystem, Breadcrumbs } from '@/components/ui';
import { useAuth } from '@/context';
import type { NavItem, ApplicationCardData } from '@/types';
import type { User } from '@/types';
import { getMockUserById } from '@/data';

const getAppLauncherItems = (role: User['role'] | undefined): ApplicationCardData[] => {
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
            iconName: "https://www.worldposta.com/assets/Posta-Logo.png", 
            launchUrl: '/app/email-admin-suite'
        }
    ];

    const customerApps: ApplicationCardData[] = [
        { 
            id: 'billing', 
            name: 'Subscriptions', 
            description: 'Oversee your subscriptions and add new services.', 
            iconName: 'fas fa-wallet', 
            launchUrl: '/app/billing',
        },
        { 
            id: 'invoices', 
            name: 'Invoice History', 
            description: 'View and download past invoices for your records.', 
            iconName: 'fas fa-file-invoice', 
            launchUrl: '/app/invoices',
        },
        {
            id: 'user-management',
            name: 'Users Management',
            description: 'Manage team members, user groups, and their permissions.',
            iconName: 'fas fa-users-cog',
            launchUrl: '/app/team-management',
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
            { id: 'customers', name: 'Customers', description: 'Search, manage, and view customer accounts.', iconName: 'fas fa-users', launchUrl: '/app/admin/users' },
            { id: 'billing', name: 'Billing Overview', description: 'Access and manage billing for all customer accounts.', iconName: 'fas fa-cash-register', launchUrl: '/app/billing' },
            ...baseApps,
        ];
    }
    if (role === 'reseller') {
        return [
            { id: 'customers', name: 'My Customers', description: 'Access and manage your customer accounts.', iconName: 'fas fa-user-friends', launchUrl: '/app/reseller/customers' },
            { id: 'billing', name: 'Reseller Billing', description: 'Manage your billing, commissions, and payment history.', iconName: 'fas fa-file-invoice-dollar', launchUrl: '/app/billing' },
            ...baseApps,
        ];
    }
    return baseApps;
};

interface CloudEdgeSidebarProps {
    isCollapsed: boolean;
}
const CloudEdgeSidebar: React.FC<CloudEdgeSidebarProps> = ({ isCollapsed }) => {
    const location = useLocation();
    const { user } = useAuth();
    const [openSections, setOpenSections] = useState<string[]>([]);
    
    // Style constants from main sidebar
    const baseTextColor = "text-gray-700 dark:text-gray-300";
    const hoverBgColor = "hover:bg-gray-200 dark:hover:bg-slate-700";
    const hoverTextColor = "hover:text-[#679a41] dark:hover:text-emerald-400";
    const activeBgColor = "bg-[#679a41] dark:bg-emerald-600";
    const activeTextColor = "text-white dark:text-white";
    
    const iconBaseColor = "text-[#679a41] dark:text-emerald-400";
    const iconActiveColor = "text-white dark:text-white"; 
    const iconHoverColor = "group-hover:text-[#588836] dark:group-hover:text-emerald-500";
    const faIconBaseClasses = `text-lg ${isCollapsed ? '' : 'mr-3'} transition-colors duration-150 ease-in-out`;


    const getDashboardIcon = () => {
        if (!user) return 'fas fa-th-large'; // fallback
        switch(user.role) {
            case 'admin':
            case 'reseller':
                return 'fas fa-tachometer-alt';
            case 'customer':
            default:
                return 'fas fa-home';
        }
    };

    const sidebarNavItems = [
        { name: 'Dashboard', icon: getDashboardIcon(), path: '/app/cloud-edge' },
        { 
            name: 'Administration', 
            icon: 'fas fa-user-shield', 
            path: '#', 
            collapsible: true, 
            subItems: [
                { name: 'Organizations', icon: 'fas fa-building', path: '/app/cloud-edge/administration/organizations' },
                { name: 'Action Logs', icon: 'fas fa-history', path: '/app/action-logs' },
                { name: 'Tickets', icon: 'fas fa-headset', path: '/app/support' },
            ] 
        },
        { 
            name: 'Organization', 
            icon: 'fas fa-sitemap', 
            path: '#', 
            collapsible: true, 
            subItems: [
                { name: 'Virtual Machines', icon: 'fas fa-desktop', path: '#' },
                { name: 'Reservations', icon: 'fas fa-calendar-check', path: '#' },
                { name: 'Gateways', icon: 'fas fa-dungeon', path: '#' },
                { name: 'NATs', icon: 'fas fa-random', path: '#' },
                { name: 'Route', icon: 'fas fa-route', path: '#', collapsible: true, subItems: [] },
                { name: 'VPN', icon: 'fas fa-user-secret', path: '#', collapsible: true, subItems: [] },
                { 
                    name: 'Firewall', 
                    icon: 'fas fa-fire-alt',
                    path: '/app/cloud-edge/firewall',
                    collapsible: true,
                    subItems: [
                        { name: 'Groups', icon: 'fas fa-users-cog', path: '/app/cloud-edge/firewall/groups' },
                        { name: 'Services', icon: 'fas fa-concierge-bell', path: '/app/cloud-edge/firewall/services' },
                        { name: 'Policies', icon: 'fas fa-file-contract', path: '/app/cloud-edge/firewall/policies' },
                    ]
                },
                { 
                    name: 'Security', 
                    icon: 'fas fa-shield-alt',
                    path: '/app/cloud-edge/security',
                    collapsible: true,
                    subItems: [
                        { name: 'IDS/IPS', path: '/app/cloud-edge/security/ids-ips' },
                        { name: 'Suspicious Traffic', path: '/app/cloud-edge/security/suspicious-traffic' },
                        { name: 'Filtering and Analysis', path: '/app/cloud-edge/security/filtering-analysis' },
                        { name: 'Distributed Firewall', path: '/app/cloud-edge/security/distributed-firewall' },
                        { name: 'Gateway Firewall', path: '/app/cloud-edge/security/gateway-firewall' },
                        { name: 'IDS/IPS & Malware Prevention', path: '/app/cloud-edge/security/ids-ips-malware-prevention' },
                    ]
                },
                { name: 'Reserved IP', icon: 'fas fa-map-marker-alt', path: '#' },
                { name: 'Backup', icon: 'fas fa-save', path: '#', collapsible: true, subItems: [] },
                { name: 'Scheduled Tasks', icon: 'fas fa-calendar-alt', path: '#', collapsible: true, subItems: [] },
                { name: 'Running Tasks', icon: 'fas fa-tasks', path: '#' },
            ]
        },
    ];

    useEffect(() => {
        const currentPath = location.pathname;
        const newOpenSections: string[] = [];
        let foundActive = false;

        // Determine active sections based on path
        for (const item of sidebarNavItems) {
            if ('subItems' in item && item.subItems) {
                const isTopLevelActive = item.subItems.some(sub => {
                    if (sub.path && sub.path !== '#' && currentPath.startsWith(sub.path)) return true;
                    if ('subItems' in sub && sub.subItems) {
                        return sub.subItems.some(subSub => currentPath.startsWith(subSub.path));
                    }
                    return false;
                });

                if (isTopLevelActive) {
                    newOpenSections.push(item.name);
                    // Check for active sub-sections
                    for (const subItem of item.subItems) {
                        if ('subItems' in subItem && subItem.subItems) {
                            if (subItem.subItems.some(sub => currentPath.startsWith(sub.path))) {
                                newOpenSections.push(subItem.name);
                            }
                        }
                    }
                    foundActive = true;
                    break; // Because top-level sections are mutually exclusive
                }
            }
        }

        // Default case for dashboard
        if (!foundActive && (currentPath === '/app/cloud-edge' || currentPath === '/app/cloud-edge/')) {
            newOpenSections.push('Organization');
        }

        setOpenSections(newOpenSections);
    }, [location.pathname]);

    const toggleSection = (sectionName: string) => {
        const organizationSubSections = ['Route', 'VPN', 'Firewall', 'Security', 'Backup', 'Scheduled Tasks'];

        setOpenSections(prev => {
            const isOpening = !prev.includes(sectionName);
            let newSections = [...prev];

            if (isOpening) {
                // Handle top-level exclusivity
                if (sectionName === 'Administration') {
                    // Close Organization and all its children
                    newSections = newSections.filter(name => name !== 'Organization' && !organizationSubSections.includes(name));
                } else if (sectionName === 'Organization') {
                    // Close Administration
                    newSections = newSections.filter(name => name !== 'Administration');
                }

                // Handle sub-level exclusivity within Organization
                if (organizationSubSections.includes(sectionName)) {
                    // Close all other sub-sections
                    newSections = newSections.filter(name => !organizationSubSections.includes(name));
                    // Also ensure parent is open and other top-level is closed
                    if (!newSections.includes('Organization')) newSections.push('Organization');
                    newSections = newSections.filter(name => name !== 'Administration');
                }
                
                // Finally, add the section we're trying to open
                if (!newSections.includes(sectionName)) {
                    newSections.push(sectionName);
                }

            } else { // Closing
                if (sectionName === 'Organization') {
                    // Closing Organization should close all its children
                    newSections = newSections.filter(name => name !== 'Organization' && !organizationSubSections.includes(name));
                } else {
                    // Closing anything else just removes itself
                    newSections = newSections.filter(name => name !== sectionName);
                }
            }
            return newSections;
        });
    };

    const noActiveStateItems = ['Virtual Machines', 'Reservations', 'Gateways', 'NATs', 'Reserved IP', 'Running Tasks'];

    return (
        <aside className={`sticky top-0 h-screen flex-shrink-0 bg-[#f8f8f8] dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`flex items-center p-4 h-16 border-b border-gray-200 dark:border-slate-700 ${isCollapsed ? 'justify-center' : ''}`}>
                <Link to="/app/cloud-edge" className="flex items-center">
                    <img src="https://console.worldposta.com/assets/loginImgs/edgeLogo.png" alt="CloudEdge Logo" className="h-7 w-auto" />
                </Link>
            </div>
            <nav className="flex-grow space-y-1 overflow-y-auto py-4 px-2">
                {sidebarNavItems.map(item => {
                    if ('subItems' in item && item.subItems) { // This is a collapsible section
                        const isSectionOpen = openSections.includes(item.name);
                        const isSectionActive = item.subItems.some(sub => sub.path && sub.path !=='#' && location.pathname.startsWith(sub.path));

                        return (
                            <div key={item.name}>
                                <button onClick={() => toggleSection(item.name)} title={isCollapsed ? item.name : undefined} className={`w-full flex items-center py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out group ${isCollapsed ? 'px-3 justify-center' : 'px-3 justify-between'} ${isSectionActive ? `${activeBgColor} ${activeTextColor} shadow-inner` : `${baseTextColor} ${hoverBgColor} ${hoverTextColor}`}`}>
                                    <div className="flex items-center">
                                        <Icon name={item.icon} fixedWidth className={`${faIconBaseClasses} ${isSectionActive ? iconActiveColor : `${iconBaseColor} ${iconHoverColor}`}`} />
                                        {!isCollapsed && <span className="text-sm">{item.name}</span>}
                                    </div>
                                    {item.collapsible && !isCollapsed && <Icon name="fas fa-chevron-right" className={`w-3 h-3 text-xs transition-transform transform duration-200 ${isSectionOpen ? 'rotate-90' : 'rotate-0'}`} />}
                                </button>
                                {!isCollapsed && (
                                    <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isSectionOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                        <div className="overflow-hidden">
                                            <ul className="pt-1 pl-6 space-y-1">
                                                {item.subItems.map(subItem => {
                                                    if ('subItems' in subItem && subItem.subItems && subItem.collapsible) {
                                                        const isSubSectionOpen = openSections.includes(subItem.name);
                                                        const isSubSectionActive = subItem.subItems.some(subSub => subSub.path && location.pathname.startsWith(subSub.path));
                                                        return (
                                                            <li key={subItem.name}>
                                                                <button onClick={() => toggleSection(subItem.name)} className={`w-full flex items-center justify-between py-2.5 px-3 rounded-md text-sm transition-colors duration-150 ease-in-out group ${isSubSectionActive ? 'font-bold text-[#293c51] dark:text-gray-100' : `font-medium ${baseTextColor}`} ${hoverBgColor} ${hoverTextColor}`}>
                                                                    <div className="flex items-center">
                                                                        {subItem.icon && <Icon name={subItem.icon} fixedWidth className={`${faIconBaseClasses} ${isSubSectionActive ? iconBaseColor : iconBaseColor} ${!isSubSectionActive ? iconHoverColor : ''}`} />}
                                                                        <span>{subItem.name}</span>
                                                                    </div>
                                                                    <Icon name="fas fa-chevron-right" className={`w-3 h-3 text-xs transition-transform transform duration-200 ${isSubSectionOpen ? 'rotate-90' : 'rotate-0'}`} />
                                                                </button>
                                                                <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isSubSectionOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                                                    <div className="overflow-hidden">
                                                                        <ul className="pt-1 pl-6 space-y-1">
                                                                            {subItem.subItems.map(subSubItem => (
                                                                                <li key={subSubItem.name}>
                                                                                    <NavLink to={subSubItem.path} className={({isActive}) => `block py-2 pr-3 pl-5 text-sm font-medium rounded-md ${isActive ? `${activeBgColor} ${activeTextColor}` : `${baseTextColor} ${hoverBgColor} ${hoverTextColor}`}`}>
                                                                                        {subSubItem.name}
                                                                                    </NavLink>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        );
                                                    }

                                                    const isNoActiveStateSubItem = noActiveStateItems.includes(subItem.name);
                                                    if (isNoActiveStateSubItem) {
                                                        return (
                                                            <li key={subItem.name}>
                                                                <a href={subItem.path} className={`flex items-center py-2.5 px-3 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out group ${baseTextColor} ${hoverBgColor} ${hoverTextColor}`}>
                                                                    {subItem.icon && <Icon name={subItem.icon} fixedWidth className={`${faIconBaseClasses} ${iconBaseColor} ${iconHoverColor}`} />}
                                                                    <span>{subItem.name}</span>
                                                                </a>
                                                            </li>
                                                        );
                                                    }

                                                    return (
                                                        <li key={subItem.name}>
                                                            <NavLink to={subItem.path} className={({isActive}) => `flex items-center py-2.5 px-3 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out group ${isActive ? `${activeBgColor} ${activeTextColor}` : `${baseTextColor} ${hoverBgColor} ${hoverTextColor}`}`}>
                                                                {({isActive}) => (<>
                                                                    {subItem.icon && <Icon name={subItem.icon} fixedWidth className={`${faIconBaseClasses} ${isActive ? iconActiveColor : `${iconBaseColor} ${iconHoverColor}`}`} />}
                                                                    <span>{subItem.name}</span>
                                                                </>)}
                                                            </NavLink>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }
                    
                    const isNoActiveStateItem = noActiveStateItems.includes(item.name);

                    if (isNoActiveStateItem) {
                        // Render as a simple link/button without NavLink active state
                        return (
                            <a href={item.path} key={item.name} title={isCollapsed ? item.name : undefined} className={`w-full flex items-center py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out group ${isCollapsed ? 'px-3 justify-center' : 'px-3'} ${baseTextColor} ${hoverBgColor} ${hoverTextColor}`}>
                                <Icon name={item.icon} fixedWidth className={`${faIconBaseClasses} ${iconBaseColor} ${iconHoverColor}`} />
                                {!isCollapsed && <span className="text-sm">{item.name}</span>}
                            </a>
                        );
                    }


                    // This is a direct link with active state
                    return (
                        <NavLink to={item.path} end={item.path === '/app/cloud-edge'} key={item.name} title={isCollapsed ? item.name : undefined} className={({isActive}) => `w-full flex items-center py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out group ${isCollapsed ? 'px-3 justify-center' : 'px-3'} ${isActive ? `${activeBgColor} ${activeTextColor} shadow-inner` : `${baseTextColor} ${hoverBgColor} ${hoverTextColor}`}`}>
                            {({isActive}) => (<>
                                <Icon name={item.icon} fixedWidth className={`${faIconBaseClasses} ${isActive ? iconActiveColor : `${iconBaseColor} ${iconHoverColor}`}`} />
                                {!isCollapsed && <span className="text-sm">{item.name}</span>}
                            </>)}
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
};

const CloudEdgeTopBar: React.FC<{navItems: NavItem[], appItems: ApplicationCardData[], onToggleSidebar: () => void, isSidebarCollapsed: boolean}> = ({navItems, appItems, onToggleSidebar, isSidebarCollapsed}) => {
    const { user } = useAuth();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [cloudSearchTerm, setCloudSearchTerm] = useState('');
    const userMenuRef = useRef<HTMLDivElement>(null);
    const userMenuButtonRef = useRef<HTMLButtonElement>(null);

    const [appLauncherOpen, setAppLauncherOpen] = useState(false);
    const appLauncherRef = useRef<HTMLDivElement>(null);
    const appLauncherButtonRef = useRef<HTMLButtonElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node) &&
                userMenuButtonRef.current && !userMenuButtonRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
             if (appLauncherRef.current && !appLauncherRef.current.contains(event.target as Node) &&
                appLauncherButtonRef.current && !appLauncherButtonRef.current.contains(event.target as Node)) {
                setAppLauncherOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-white dark:bg-slate-800 px-4 h-16 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center">
                 <button
                    onClick={onToggleSidebar}
                    className="mr-4 text-gray-500 dark:text-gray-400 hover:text-[#679a41] dark:hover:text-emerald-400"
                    aria-label="Toggle sidebar"
                >
                    <Icon name={isSidebarCollapsed ? "fas fa-angles-right" : "fas fa-angles-left"} className="text-xl" />
                </button>
                <div className="flex-1 max-w-sm">
                    <FormField id="cloud-search" label="" placeholder="Search..." value={cloudSearchTerm} onChange={(e) => setCloudSearchTerm(e.target.value)} wrapperClassName="!mb-0" />
                </div>
            </div>
            <div className="flex items-center space-x-2">
                 <Button variant="ghost" className="hidden sm:inline-flex items-center">
                    <Icon name="fas fa-building" className="mr-2" />
                    Worldposta
                    <Icon name="fas fa-chevron-down" className="ml-2 text-xs" />
                </Button>
                <div className="relative">
                    <button
                        ref={appLauncherButtonRef}
                        onClick={() => setAppLauncherOpen(!appLauncherOpen)}
                        className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-[#679a41] dark:focus:ring-emerald-400 flex flex-col items-center justify-center w-14 h-14 rounded-md"
                        aria-haspopup="true"
                        aria-expanded={appLauncherOpen}
                        aria-label="Open application launcher"
                    >
                        <Icon name="fa-solid fa-grip" className="text-xl" />
                        <span className="text-xs mt-1">Apps</span>
                    </button>
                    <FloatingAppLauncher
                        isOpen={appLauncherOpen}
                        onClose={() => setAppLauncherOpen(false)}
                        panelRef={appLauncherRef}
                        navItems={navItems}
                        appItems={appItems}
                    />
                </div>
                <div className="relative">
                    <button
                        ref={userMenuButtonRef}
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-[#679a41] dark:focus:ring-emerald-400"
                        aria-haspopup="true" aria-expanded={userMenuOpen}
                    >
                        {user?.avatarUrl ? (
                            <img className="h-8 w-8 rounded-full" src={user.avatarUrl} alt="User avatar" />
                        ) : (
                            <Icon name="fas fa-user-circle" className="h-8 w-8 text-gray-500 dark:text-gray-400 text-3xl" />
                        )}
                        <span className="ml-2 hidden md:inline text-[#293c51] dark:text-gray-200">Hello, {user?.displayName || 'Mine'}</span>
                        <Icon name="fas fa-chevron-down" className={`ml-1 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 text-xs ${userMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </button>
                    {userMenuOpen && (
                        <div ref={userMenuRef} className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-slate-700 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none text-[#293c51] dark:text-gray-200 z-10">
                            <Link to="/app/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600">
                                <Icon name="fas fa-cog" className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" fixedWidth /> Settings
                            </Link>
                            <Link to="/app/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600">
                                <Icon name="fas fa-sign-out-alt" className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" fixedWidth /> Exit CloudEdge
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export const CloudEdgeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('cloudEdgeSidebarCollapsed') === 'true');
    const location = useLocation();
    
    const [searchParams] = useSearchParams();
    const viewAsUserId = searchParams.get('viewAsUser');
    const returnToPath = searchParams.get('returnTo');
    const viewedUser = viewAsUserId ? getMockUserById(viewAsUserId) : null;
    const isViewAsMode = !!(viewAsUserId && returnToPath && viewedUser && user && (user.role === 'admin' || user.role === 'reseller'));
    const isCustomerView = useMemo(() => user?.role === 'customer' && !isViewAsMode, [user, isViewAsMode]);

    useEffect(() => {
        localStorage.setItem('cloudEdgeSidebarCollapsed', String(isSidebarCollapsed));
    }, [isSidebarCollapsed]);
    
    const userNavItems: NavItem[] = useMemo(() => {
        let dashboardPath = '/app/dashboard';
        let dashboardIcon = 'fas fa-home'; // customer default

        if (user?.role === 'admin') {
            dashboardPath = '/app/admin-dashboard';
            dashboardIcon = 'fas fa-home';
        } else if (user?.role === 'reseller') {
            dashboardPath = '/app/reseller-dashboard';
            dashboardIcon = 'fas fa-tachometer-alt';
        }
        
        const items = [
            { name: 'Dashboard', path: dashboardPath, iconName: dashboardIcon },
            { name: 'Settings', path: '/app/settings', iconName: 'fas fa-cog' },
        ];
        
        // Admins don't have a profile page in the main app
        if (user?.role === 'admin') {
            return items.filter(item => item.name !== 'Profile');
        }
        return items;
    }, [user]);

    const appLauncherItems = getAppLauncherItems(user?.role);

    const breadcrumbItems = useMemo(() => {
        const pathnames = location.pathname.split('/').filter(x => x);

        const BREADCRUMB_LABELS: { [key: string]: string } = {
            'cloud-edge': 'CloudEdge',
            'security': 'Security',
            'overview': 'Security Overview',
            'ids-ips': 'IDS/IPS',
            'suspicious-traffic': 'Suspicious Traffic',
            'filtering-analysis': 'Filtering and Analysis',
            'distributed-firewall': 'Distributed Firewall',
            'gateway-firewall': 'Gateway Firewall',
            'ids-ips-malware-prevention': 'IDS/IPS & Malware Prevention',
            'administration': 'Administration',
            'organizations': 'Organizations'
        };

        const getLabel = (value: string) => {
            return BREADCRUMB_LABELS[value] || value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        };

        if (!pathnames.includes('cloud-edge')) return [];

        const crumbs = [{ label: 'Home', path: '/app/cloud-edge' }];
        
        // Slicing from index 2 to skip '/app/cloud-edge'
        const segmentsToProcess = pathnames.slice(2); 

        segmentsToProcess.forEach((value, index) => {
            const to = `/app/cloud-edge/${segmentsToProcess.slice(0, index + 1).join('/')}`;
            const label = getLabel(value);
            crumbs.push({ label, path: to });
        });

        if (crumbs.length > 1) {
            delete crumbs[crumbs.length - 1].path;
        }

        return crumbs;
    }, [location]);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-slate-900 overflow-hidden">
            <CloudEdgeSidebar isCollapsed={isSidebarCollapsed} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <CloudEdgeTopBar 
                    navItems={userNavItems} 
                    appItems={appLauncherItems} 
                    onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
                    isSidebarCollapsed={isSidebarCollapsed}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <Breadcrumbs items={breadcrumbItems} />
                    <Outlet />
                </main>
            </div>
            {isCustomerView && <FeedbackSystem position="default" />}
        </div>
    );
};