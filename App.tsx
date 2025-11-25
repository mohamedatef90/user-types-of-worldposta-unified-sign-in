
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet, useSearchParams, Link } from 'react-router-dom';
import { AuthProvider, ThemeProvider, useAuth, AppLayoutContext } from '@/context';
import type { User, AuthContextType, NavItem, UserGroup, ApplicationCardData } from '@/types';
import { Navbar, Sidebar, Spinner, Breadcrumbs, Footer, Icon, Button, Chatbot, FeedbackSystem } from '@/components/ui'; 
import { getMockUserById } from '@/data';
import { 
    LandingPage, 
    LoginPage, 
    SignupPage, 
    EmailVerificationPage, 
    DashboardPage,
    AdminDashboardPage,
    ResellerDashboardPage,
    UserManagementPage,
    AddCustomerPage,
    ResellerCustomersPage,
    StaffManagementPage,
    AdminRouterPage,
    InvoiceRouterPage,
    SettingsRouterPage,
    ProfilePage,
    AccountSettingsPage,
    SecuritySettingsPage,
    BillingSettingsPage,
    EmailConfigurationsPage,
    InvoiceHistoryPage,
    InvoiceDetailPage,
    ActionLogsPage,
    CustomerTeamManagementPage,
    AddTeamUserPage,
    EditTeamUserPage,
    ResellerProgramPage,
    SupportPage,
    NotFoundPage,
    AllNotificationsPage,
    CloudEdgeLayout,
    CloudEdgeDashboardPage,
    EmailAdminSubscriptionsPage,
    CloudEdgeConfigurationsPage,
    AddCloudEdgeConfigurationPage,
    PostaPricingPage,
    CreateTicketPage,
    EmailAdminSmtpLogsPage,
    EmailAdminSidebar,
    EmailAdminSuiteDashboardPage,
    PlaceholderPage,
    OrgsAndDomainsPage,
    MailboxesPage,
    EditMailboxPage,
    DistributionListsPage,
    SharedContactsPage,
    EditSharedContactPage,
    RulesPage,
    RuleDetailsPage,
    AccountStatisticsPage,
    PstLogsPage,
    BulkModulePage,
    RunningTasksPage,
    OldVersionPage,
    KubernetesPage,
    NetworkingPage,
    StoragePage,
    MonitoringPage,
    BackupPage,
    DemoBillingPage,
    DistributedFirewallPage,
    GatewayFirewallPage,
    GroupsPage,
    PoliciesPage,
    ServicesPage,
    IdsIpsMalwarePreventionPage,
    BlogsCenterPage,
    BlogDetailsPage // Added import
} from '@/pages';


const ProtectedRoute: React.FC<{
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    allowedRoles?: User['role'][];
}> = ({ user, isAuthenticated, isLoading, allowedRoles }) => {
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="w-full h-screen flex justify-center items-center bg-gray-100 dark:bg-slate-900">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/app/dashboard" replace />;
    }

    return <Outlet />;
};

const getNavItems = (role: User['role']): NavItem[] => {
  switch (role) {
    case 'admin':
      return [
        { name: 'Dashboard', path: '/app/admin-dashboard', iconName: 'fas fa-home' },
        { name: 'Admins Management', path: '/app/admin/staff', iconName: 'fas fa-user-tie' },
        { name: 'Customers', path: '/app/admin/users', iconName: 'fas fa-users' },
        { name: 'Billings', path: '/app/billing', iconName: 'fas fa-file-invoice-dollar' },
        { name: 'Support Center', path: '/app/admin/support', iconName: 'fas fa-headset' },
      ];
    case 'reseller':
      return [
        { name: 'Dashboard', path: '/app/reseller-dashboard', iconName: 'fas fa-tachometer-alt' },
        { name: 'My Customers', path: '/app/reseller/customers', iconName: 'fas fa-user-friends' },
        { name: 'My Program', path: '/app/reseller/program', iconName: 'fas fa-award' },
        { name: 'Subscriptions', path: '/app/billing', iconName: 'fas fa-file-invoice-dollar' },
        { name: 'Support', path: '/app/support', iconName: 'fas fa-headset' },
      ];
    case 'customer':
    default:
      return [
        { name: 'Dashboard', path: '/app/dashboard', iconName: 'fas fa-home' },
        { name: 'Users Management', path: '/app/team-management', iconName: 'fas fa-users-cog' },
      ];
  }
};

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
            description: 'Manage mailboxes, security, and settings for your email services.',
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
        // Removed User Management from launcher as requested for dashboard
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
        {
            id: 'blogs-center',
            name: 'Blogs Center',
            description: 'Access the latest security news, updates, and expert insights.',
            iconName: 'fas fa-newspaper',
            launchUrl: '/app/blogs-center',
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


const AppLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isDesktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(() => {
        const isEmailAdmin = location.pathname.startsWith('/app/email-admin-suite');
        const storageKey = isEmailAdmin ? 'emailAdminSidebarCollapsed' : 'sidebarCollapsed';
        return localStorage.getItem(storageKey) === 'true';
    });
    const [isSearchPanelOpen, setSearchPanelOpen] = useState(false);

    const isEmailAdminSuite = location.pathname.startsWith('/app/email-admin-suite');
    const isNewDemoUser = user?.email === 'new.user@worldposta.com';
    
    // State for the new status banner in Email Admin Suite
    const [isStatusBannerVisible, setStatusBannerVisible] = useState(true);
    const [domainStatus, setDomainStatus] = useState({ isDomainVerified: false, isMxSpfVerified: false });
    const [planSelectionVersion, setPlanSelectionVersion] = useState(0);

    useEffect(() => {
        const handlePlanSelected = () => {
            setPlanSelectionVersion(v => v + 1);
        };
        window.addEventListener('planSelectedForDemo', handlePlanSelected);
        return () => {
            window.removeEventListener('planSelectedForDemo', handlePlanSelected);
        };
    }, []);
    
    // Memoize the check for demo user plan selection to avoid showing status bar on plan page
    const planSelectedForDemo = useMemo(() => {
        if (isNewDemoUser) {
            return sessionStorage.getItem('demoUserPlanSelected') === 'true';
        }
        return true; // Default to true for non-demo users or if not applicable
    }, [isNewDemoUser, planSelectionVersion]); // Re-check when plan selection event fires

    const showStatusBar = isEmailAdminSuite && isStatusBannerVisible && isNewDemoUser && planSelectedForDemo;

    const updateBannerStatus = useCallback(() => {
        if (isNewDemoUser) {
            try {
                const storedDomains = localStorage.getItem('demoUserDomains');
                if (storedDomains) {
                    const domains = JSON.parse(storedDomains);
                    if (domains.length > 0) {
                        const firstDomain = domains[0];
                        setDomainStatus({
                            isDomainVerified: firstDomain.isDomainVerified,
                            isMxSpfVerified: firstDomain.isMxVerified,
                        });
                    } else {
                        setDomainStatus({ isDomainVerified: false, isMxSpfVerified: false });
                    }
                } else {
                    setDomainStatus({ isDomainVerified: false, isMxSpfVerified: false });
                }
            } catch (e) {
                console.error("Failed to parse domains from localStorage", e);
                setDomainStatus({ isDomainVerified: false, isMxSpfVerified: false });
            }
        }
    }, [isNewDemoUser]);

    useEffect(() => {
        updateBannerStatus(); // Initial check on mount and location change
    
        window.addEventListener('domainStateChange', updateBannerStatus);
        
        return () => {
            window.removeEventListener('domainStateChange', updateBannerStatus);
        };
    }, [location, updateBannerStatus]);

    useEffect(() => {
        const storageKey = isEmailAdminSuite ? 'emailAdminSidebarCollapsed' : 'sidebarCollapsed';
        localStorage.setItem(storageKey, String(isDesktopSidebarCollapsed));
    }, [isDesktopSidebarCollapsed, isEmailAdminSuite]);

    const viewAsUserId = searchParams.get('viewAsUser');
    const returnToPath = searchParams.get('returnTo');
    const viewedUser = viewAsUserId ? getMockUserById(viewAsUserId) : null;
    const isViewAsMode = !!(viewAsUserId && returnToPath && viewedUser && user && (user.role === 'admin' || user.role === 'reseller'));
    const isCustomerView = useMemo(() => user?.role === 'customer' && !isViewAsMode, [user, isViewAsMode]);

    
    const navItems = useMemo(() => {
        // Always show the logged-in user's navigation items.
        return user ? getNavItems(user.role) : [];
    }, [user]);
    
    const appLauncherItems = useMemo(() => getAppLauncherItems(user?.role), [user]);

    const breadcrumbItems = useMemo(() => {
        const viewAsUserId = searchParams.get('viewAsUser');
        const returnToPath = searchParams.get('returnTo');
        const pathnames = location.pathname.split('/').filter(x => x);

        const BREADCRUMB_LABELS: { [key: string]: string } = {
            'admin': 'Admin',
            'users': 'Customer Management',
            'staff': 'Admins Management',
            'system': 'System Settings',
            'team-management': 'Users Management',
            'add': 'Add User',
            'edit': 'Edit User',
            'billing': 'Billings',
            'email-subscriptions': 'Email Subscriptions',
            'email-configurations': 'Email Configurations',
            'cloudedge-configurations': 'CloudEdge Configurations',
            'invoices': 'Invoices',
            'action-logs': 'Action Logs',
            'support': 'Support Center',
            'create': 'Create Ticket',
            'settings': 'Settings',
            'account': 'Account Settings',
            'security': 'Security Settings',
            'notifications': 'Notifications',
            'reseller': 'Reseller',
            'customers': 'My Customers',
            'program': 'My Program',
            'email-admin-suite': 'Email Admin Suite',
            'kubernetes': 'Kubernetes',
            'networking': 'Networking',
            'storage': 'Storage',
            'monitoring': 'Monitoring & Security',
            'backup': 'Backup & DR',
            'mailboxes': 'Mailboxes',
            'distribution-lists': 'Distribution Lists',
            'shared-contacts': 'Shared Contacts',
            'rules': 'Rules',
            'bulk-module': 'Bulk Module',
            'blogs-center': 'Blogs Center',
        };
        
        const getLabel = (value: string) => {
            return BREADCRUMB_LABELS[value] || value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        };

        // "View As" mode breadcrumbs for admin/reseller
        if (viewAsUserId && returnToPath && user && (user.role === 'admin' || user.role === 'reseller')) {
            const viewedUser = getMockUserById(viewAsUserId);
            if (!viewedUser) return [];

            const adminHomePath = user.role === 'admin' ? '/app/admin-dashboard' : '/app/reseller-dashboard';
            const crumbs = [{ label: 'Dashboard', path: adminHomePath }];

            let returnLabel = getLabel(returnToPath.split('/').pop() || '');
            crumbs.push({ label: returnLabel, path: returnToPath });
            
            const customerDashboardPath = `/app/dashboard?viewAsUser=${viewAsUserId}&returnTo=${encodeURIComponent(returnToPath)}`;
            crumbs.push({ label: viewedUser.fullName, path: customerDashboardPath });
            
            let segmentsToProcess = pathnames.slice(1);
            if (
                segmentsToProcess.length === 3 &&
                segmentsToProcess[0] === 'team-management' &&
                segmentsToProcess[1] === 'edit'
            ) {
                segmentsToProcess = segmentsToProcess.slice(0, 2);
            }

            segmentsToProcess.forEach((value, index) => {
                if (value === 'dashboard') return; 

                const to = `/app/${pathnames.slice(1, index + 2).join('/')}?viewAsUser=${viewAsUserId}&returnTo=${encodeURIComponent(returnToPath)}`;
                let label = getLabel(value);
                if (value === 'add' && segmentsToProcess[index - 1] === 'cloudedge-configurations') {
                    label = 'Add Configuration';
                }
                crumbs.push({ label, path: to });
            });
            
            if (crumbs.length > 1) {
                delete crumbs[crumbs.length - 1].path;
            }

            return crumbs;
        }

        // Original breadcrumb logic for other cases
        if (pathnames[0] !== 'app') return [];

        let homePath = '/app/dashboard';
        if (user?.role === 'admin') homePath = '/app/admin-dashboard';
        if (user?.role === 'reseller') homePath = '/app/reseller-dashboard';
        if (isEmailAdminSuite) homePath = '/app/email-admin-suite';

        const crumbs = [{ label: 'Home', path: homePath }];
        
        let segmentsToProcess = pathnames.slice(1);
        if (
            (segmentsToProcess.length === 3 &&
            segmentsToProcess[0] === 'team-management' &&
            segmentsToProcess[1] === 'edit') ||
            (segmentsToProcess.length === 5 && segmentsToProcess[3] === 'edit') ||
             (segmentsToProcess.length > 2 && segmentsToProcess[segmentsToProcess.length - 2] === 'edit')
        ) {
            segmentsToProcess = segmentsToProcess.slice(0, -1);
        }

        segmentsToProcess.forEach((value, index) => {
            if (value === 'admin' || value.endsWith('-dashboard')) return;

            // When in email admin suite, if a view is selected, remove the container tab.
            if (isEmailAdminSuite && (value === 'exchange' || value === 'admin') && index < segmentsToProcess.length - 1) {
                return;
            }

            const to = `/app/${pathnames.slice(1, index + 2).join('/')}`;
            let label = getLabel(value);
            if (value === 'add' && segmentsToProcess[index - 1] === 'cloudedge-configurations') {
                label = 'Add Configuration';
            }
            if (label !== 'Dashboard' && label !== 'App' && label !== 'Home') {
                 crumbs.push({ label, path: to });
            }
        });

        if (crumbs.length > 1) {
            delete crumbs[crumbs.length - 1].path;
        }

        return crumbs;
    }, [location, user, searchParams, isEmailAdminSuite]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Special layout for CloudEdge
    if (location.pathname.startsWith('/app/cloud-edge')) {
        return (
            <CloudEdgeLayout>
                <Outlet />
            </CloudEdgeLayout>
        );
    }
    
    const appLayoutContextValue = {
        setSearchPanelOpen,
        isDomainVerifiedForDemo: domainStatus.isDomainVerified,
    };

    return (
        <AppLayoutContext.Provider value={appLayoutContextValue}>
            <div className={`flex h-screen bg-gray-100 dark:bg-slate-900 overflow-hidden`}>
                {isEmailAdminSuite ? (
                    <EmailAdminSidebar 
                         isCollapsed={isDesktopSidebarCollapsed}
                         isOpen={isMobileSidebarOpen} 
                         onClose={() => setMobileSidebarOpen(false)}
                    />
                ) : (
                    <Sidebar 
                        navItems={navItems}
                        isOpen={isMobileSidebarOpen}
                        isCollapsed={isDesktopSidebarCollapsed}
                        onClose={() => setMobileSidebarOpen(false)}
                    />
                )}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Navbar
                        user={user}
                        onLogout={logout}
                        onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
                        onToggleDesktopSidebar={() => setDesktopSidebarCollapsed(prev => !prev)}
                        sidebarCollapsed={isDesktopSidebarCollapsed}
                        navItems={navItems}
                        appItems={appLauncherItems}
                        isViewAsMode={isViewAsMode}
                        viewedUser={viewedUser}
                        returnToPath={returnToPath}
                    />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                        {showStatusBar && (!domainStatus.isDomainVerified || !domainStatus.isMxSpfVerified) && (
                            <div className={`p-4 mb-4 rounded-md flex items-start justify-between ${
                                !domainStatus.isDomainVerified
                                    ? 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700/50 dark:text-red-300'
                                    : 'bg-yellow-50 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700/50 dark:text-yellow-300'
                            }`}>
                                <div className="flex items-start">
                                    <Icon name={!domainStatus.isDomainVerified ? 'fas fa-exclamation-circle' : 'fas fa-exclamation-triangle'} className="mr-3 mt-1" />
                                    <div>
                                    <p className="font-semibold">
                                        {!domainStatus.isDomainVerified ? 'Action Required: Domain setup is incomplete' : 'Action Required: Configure mail flow'}
                                    </p>
                                    <p className="text-sm">
                                        {!domainStatus.isDomainVerified
                                        ? 'Verify your domain to start using email services.'
                                        : 'Your domain is verified, but mail flow is not configured. Finish your setup to receive emails.'}
                                        {' '}
                                        <Link to="/app/email-admin-suite/orgs-and-domains" className="font-semibold underline hover:no-underline">
                                        {!domainStatus.isDomainVerified ? 'Verify Now' : 'Configure Now'}
                                        </Link>
                                    </p>
                                    </div>
                                </div>
                                <button onClick={() => setStatusBannerVisible(false)} className="ml-4 -mt-1 -mr-1 p-1 rounded-md hover:bg-black/10">
                                    <Icon name="fas fa-times" className="text-sm" />
                                </button>
                            </div>
                        )}
                        {location.pathname !== '/app/admin-dashboard' && location.pathname !== '/app/email-admin-suite' && <Breadcrumbs items={breadcrumbItems} />}
                        <Outlet />
                    </main>
                </div>
                {isCustomerView && !isEmailAdminSuite && <FeedbackSystem position="raised" />}
                <Chatbot />
            </div>
        </AppLayoutContext.Provider>
    );
};


const AppIndexRedirect: React.FC = () => {
    const { user } = useAuth();
  
    // This component is rendered within ProtectedRoute, so user should exist.
    if (!user) {
      // This is a fallback, should not be reached in normal flow.
      return <Navigate to="/login" replace />; 
    }
  
    switch (user.role) {
      case 'admin':
        return <Navigate to="/app/admin-dashboard" replace />;
      case 'reseller':
        return <Navigate to="/app/reseller-dashboard" replace />;
      case 'customer':
      default:
        return <Navigate to="/app/dashboard" replace />;
    }
};

const AppRoutes: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    
    return (
        <Routes>
            {/* Root route logic: Redirect to /app if authenticated, else show LandingPage */}
            <Route path="/" element={isAuthenticated ? <Navigate to="/app" replace /> : <LandingPage />} />
            
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/email-verification" element={<EmailVerificationPage />} />
            <Route path="/posta-pricing" element={<PostaPricingPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute user={user} isAuthenticated={isAuthenticated} isLoading={isLoading} />}>
                <Route path="/app" element={<AppLayout />}>
                    <Route index element={<AppIndexRedirect />} />
                    
                    {/* Customer Routes */}
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="blogs-center" element={<BlogsCenterPage />} />
                    <Route path="blogs-center/:blogId" element={<BlogDetailsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="billing" element={<BillingSettingsPage />} />
                    <Route path="billing/email-subscriptions" element={<EmailAdminSubscriptionsPage />} />
                    <Route path="billing/email-configurations" element={<EmailConfigurationsPage />} />
                    <Route path="billing/cloudedge-configurations" element={<CloudEdgeConfigurationsPage />} />
                    <Route path="billing/cloudedge-configurations/add" element={<AddCloudEdgeConfigurationPage />} />
                    <Route path="billing/cloudedge-configurations/edit/:configId" element={<AddCloudEdgeConfigurationPage />} />
                    <Route path="invoices" element={<InvoiceRouterPage />}>
                        <Route index element={<InvoiceHistoryPage />} />
                        <Route path=":invoiceId" element={<InvoiceDetailPage />} />
                    </Route>
                    <Route path="action-logs" element={<ActionLogsPage />} />
                    <Route path="team-management">
                        <Route index element={<CustomerTeamManagementPage />} />
                        <Route path="add" element={<AddTeamUserPage />} />
                        <Route path="edit/:userId" element={<EditTeamUserPage />} />
                    </Route>
                    <Route path="support" element={<SupportPage />} />

                    {/* NEW Product Routes */}
                    <Route path="kubernetes" element={<KubernetesPage />} />
                    <Route path="networking" element={<NetworkingPage />} />
                    <Route path="storage" element={<StoragePage />} />
                    <Route path="monitoring" element={<MonitoringPage />} />
                    <Route path="backup" element={<BackupPage />} />

                    {/* Settings Routes */}
                    <Route path="settings" element={<SettingsRouterPage />}>
                        <Route index element={<Navigate to="account" replace />} />
                        <Route path="account" element={<AccountSettingsPage />} />
                        <Route path="security" element={<SecuritySettingsPage />} />
                    </Route>
                     <Route path="notifications" element={<AllNotificationsPage />} />

                    {/* Admin Routes */}
                     <Route path="admin" element={<AdminRouterPage />}>
                        <Route index element={<Navigate to="/app/admin-dashboard" replace />} />
                        <Route path="users" element={<UserManagementPage />} />
                        <Route path="users/add" element={<AddCustomerPage />} />
                        <Route path="staff" element={<StaffManagementPage />} />
                        <Route path="support" element={<Outlet />}>
                            <Route index element={<SupportPage />} />
                            <Route path="create" element={<CreateTicketPage />} />
                        </Route>
                    </Route>
                    <Route path="admin-dashboard" element={<AdminDashboardPage />} />
                    
                    {/* Reseller Routes */}
                    <Route path="reseller" element={<Outlet />}>
                         <Route index element={<Navigate to="/app/reseller-dashboard" replace />} />
                         <Route path="customers" element={<ResellerCustomersPage />} />
                         <Route path="program" element={<ResellerProgramPage />} />
                    </Route>
                    
                    {/* CloudEdge Route (Based on AppLayout) */}
                    <Route path="cloud-edge">
                        <Route index element={<CloudEdgeDashboardPage />} />
                        <Route path="firewall/groups" element={<GroupsPage />} />
                        <Route path="firewall/policies" element={<PoliciesPage />} />
                        <Route path="firewall/services" element={<ServicesPage />} />
                        <Route path="security/ids-ips" element={<PlaceholderPage />} />
                        <Route path="security/suspicious-traffic" element={<PlaceholderPage />} />
                        <Route path="security/filtering-analysis" element={<PlaceholderPage />} />
                        <Route path="security/distributed-firewall" element={<DistributedFirewallPage />} />
                        <Route path="security/gateway-firewall" element={<GatewayFirewallPage />} />
                        <Route path="security/ids-ips-malware-prevention" element={<IdsIpsMalwarePreventionPage />} />
                        <Route path="administration/organizations" element={<PlaceholderPage />} />
                    </Route>
                    
                    {/* Email Admin Suite Routes */}
                    <Route path="email-admin-suite">
                        <Route index element={<EmailAdminSuiteDashboardPage />} />
                        <Route path="orgs-and-domains" element={<OrgsAndDomainsPage />} />
                        <Route path="exchange/mailboxes" element={<MailboxesPage />} />
                        <Route path="exchange/mailboxes/edit/:mailboxId" element={<EditMailboxPage />} />
                        <Route path="exchange/distribution-lists" element={<DistributionListsPage />} />
                        <Route path="exchange/shared-contacts" element={<SharedContactsPage />} />
                        <Route path="exchange/shared-contacts/edit/:contactId" element={<EditSharedContactPage />} />
                        <Route path="exchange/bulk-module" element={<BulkModulePage />} />
                        <Route path="exchange/running-tasks" element={<RunningTasksPage />} />
                        <Route path="exchange/mailbox-plans" element={<PlaceholderPage />} />
                        <Route path="exchange/smtp-logs" element={<EmailAdminSmtpLogsPage />} />
                        <Route path="exchange/pst-logs" element={<PstLogsPage />} />
                        <Route path="exchange/rules" element={<RulesPage />} />
                        <Route path="exchange/rules/add" element={<RuleDetailsPage />} />
                        <Route path="exchange/rules/edit/:ruleId" element={<RuleDetailsPage />} />
                        <Route path="exchange/account-statistics" element={<AccountStatisticsPage />} />
                        <Route path="admin/billing" element={user?.email === 'new.user@worldposta.com' ? <DemoBillingPage /> : <PlaceholderPage />} />
                        <Route path="admin/users" element={<PlaceholderPage />} />
                        <Route path="admin/permission-groups" element={<PlaceholderPage />} />
                        <Route path="admin/background-tasks" element={<PlaceholderPage />} />
                        <Route path="admin/action-logs" element={<PlaceholderPage />} />
                        <Route path="admin/lists" element={<PlaceholderPage />} />
                        <Route path="admin/sister-companies" element={<PlaceholderPage />} />
                        <Route path="admin/ip-lists" element={<PlaceholderPage />} />
                        <Route path="migrations" element={<PlaceholderPage />} />
                        <Route path="migrations/add" element={<PlaceholderPage />} />
                        <Route path="old-version" element={<OldVersionPage />} />
                        <Route path="tickets" element={<PlaceholderPage />} />
                        <Route path="tickets/new" element={<PlaceholderPage />} />
                    </Route>

                </Route>
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

const MainApp: React.FC = () => (
    <ThemeProvider>
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    </ThemeProvider>
);

export default MainApp;
