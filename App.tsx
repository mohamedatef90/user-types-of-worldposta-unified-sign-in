
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
    OsImagesPage,
    BlogDetailsPage
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


const AppLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    
    const isEmailAdminSuite = location.pathname.startsWith('/app/email-admin-suite');

    const [isDesktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(() => {
        const storageKey = isEmailAdminSuite ? 'emailAdminSidebarCollapsed' : 'sidebarCollapsed';
        return localStorage.getItem(storageKey) === 'true';
    });

    // Sync collapse state when switching context
    useEffect(() => {
        const storageKey = isEmailAdminSuite ? 'emailAdminSidebarCollapsed' : 'sidebarCollapsed';
        const storedValue = localStorage.getItem(storageKey) === 'true';
        setDesktopSidebarCollapsed(storedValue);
    }, [isEmailAdminSuite]);

    const [isSearchPanelOpen, setSearchPanelOpen] = useState(false);

    const isNewDemoUser = user?.email === 'new.user@worldposta.com';
    
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
    
    const planSelectedForDemo = useMemo(() => {
        if (isNewDemoUser) {
            return sessionStorage.getItem('demoUserPlanSelected') === 'true';
        }
        return true; 
    }, [isNewDemoUser, planSelectionVersion]);

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
        updateBannerStatus();
        window.addEventListener('domainStateChange', updateBannerStatus);
        return () => {
            window.removeEventListener('domainStateChange', updateBannerStatus);
        };
    }, [location.pathname, updateBannerStatus]);

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
        return user ? getNavItems(user.role) : [];
    }, [user]);
    
    const appLauncherItems = useMemo(() => getAppLauncherItems(user?.role), [user]);

    const breadcrumbItems = useMemo(() => {
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
            'exchange': 'Exchange',
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

        if (isViewAsMode && viewedUser && returnToPath) {
            const adminHomePath = user.role === 'admin' ? '/app/admin-dashboard' : '/app/reseller-dashboard';
            const crumbs = [{ label: 'Dashboard', path: adminHomePath }];

            let returnLabel = getLabel(returnToPath.split('/').pop() || '');
            crumbs.push({ label: returnLabel, path: returnToPath });
            
            const customerDashboardPath = `/app/dashboard?viewAsUser=${viewAsUserId}&returnTo=${encodeURIComponent(returnToPath)}`;
            crumbs.push({ label: viewedUser.fullName, path: customerDashboardPath });
            
            let segmentsToProcess = pathnames.slice(1);
            if (segmentsToProcess[0] === 'dashboard') segmentsToProcess = segmentsToProcess.slice(1);

            segmentsToProcess.forEach((value, index) => {
                const to = `/app/${pathnames.slice(1, index + 2).join('/')}?viewAsUser=${viewAsUserId}&returnTo=${encodeURIComponent(returnToPath)}`;
                let label = getLabel(value);
                crumbs.push({ label, path: to });
            });
            
            if (crumbs.length > 1) {
                delete crumbs[crumbs.length - 1].path;
            }
            return crumbs;
        }

        if (pathnames[0] !== 'app') return [];

        let homePath = '/app/dashboard';
        if (user?.role === 'admin') homePath = '/app/admin-dashboard';
        if (user?.role === 'reseller') homePath = '/app/reseller-dashboard';
        if (isEmailAdminSuite) homePath = '/app/email-admin-suite';

        const crumbs = [{ label: 'Home', path: homePath }];
        
        let segmentsToProcess = pathnames.slice(1);
        if (segmentsToProcess[0] === 'dashboard' || segmentsToProcess[0] === 'admin-dashboard' || segmentsToProcess[0] === 'reseller-dashboard') {
            segmentsToProcess = segmentsToProcess.slice(1);
        }

        segmentsToProcess.forEach((value, index) => {
            // Filter out suite sub-folders for cleaner crumbs
            if (isEmailAdminSuite && (value === 'exchange' || value === 'admin') && index < segmentsToProcess.length - 1) {
                return;
            }
            const to = `/app/${pathnames.slice(1, index + 2).join('/')}`;
            let label = getLabel(value);
            if (label !== 'App' && label !== 'Home') {
                 crumbs.push({ label, path: to });
            }
        });

        if (crumbs.length > 1) {
            delete crumbs[crumbs.length - 1].path;
        }
        return crumbs;
    }, [location, user, isViewAsMode, viewedUser, returnToPath, isEmailAdminSuite, viewAsUserId]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

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
                        {location.pathname !== '/app/admin-dashboard' && 
                         location.pathname !== '/app/email-admin-suite' && 
                         location.pathname !== '/app/dashboard' &&
                         location.pathname !== '/app/reseller-dashboard' &&
                         <Breadcrumbs items={breadcrumbItems} />}
                        <Routes>
                            <Route element={<ProtectedRoute user={user} isAuthenticated={true} isLoading={false} />}>
                                <Route path="/dashboard" element={<DashboardPage />} />
                                <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
                                <Route path="/reseller-dashboard" element={<ResellerDashboardPage />} />
                                <Route path="/team-management" element={<CustomerTeamManagementPage />} />
                                <Route path="/team-management/add" element={<AddTeamUserPage />} />
                                <Route path="/team-management/edit/:userId" element={<EditTeamUserPage />} />
                                <Route path="/billing" element={<BillingSettingsPage />} />
                                <Route path="/billing/email-subscriptions" element={<EmailAdminSubscriptionsPage />} />
                                <Route path="/billing/email-configurations" element={<EmailConfigurationsPage />} />
                                <Route path="/billing/cloudedge-configurations" element={<CloudEdgeConfigurationsPage />} />
                                <Route path="/billing/cloudedge-configurations/add" element={<AddCloudEdgeConfigurationPage />} />
                                <Route path="/billing/cloudedge-configurations/edit/:configId" element={<AddCloudEdgeConfigurationPage />} />
                                <Route path="/billing/cloudedge-configurations/os-images" element={<OsImagesPage />} />
                                <Route path="/invoices" element={<InvoiceRouterPage />}>
                                    <Route index element={<InvoiceHistoryPage />} />
                                    <Route path=":invoiceId" element={<InvoiceDetailPage />} />
                                </Route>
                                <Route path="/support" element={<SupportPage />} />
                                <Route path="/admin/support" element={<SupportPage />} />
                                <Route path="/action-logs" element={<ActionLogsPage />} />
                                <Route path="/notifications" element={<AllNotificationsPage />} />
                                <Route path="/blogs-center" element={<BlogsCenterPage />} />
                                <Route path="/blogs-center/:blogId" element={<BlogDetailsPage />} />
                                <Route path="/settings" element={<SettingsRouterPage />}>
                                    <Route index element={<ProfilePage />} />
                                    <Route path="account" element={<AccountSettingsPage />} />
                                    <Route path="security" element={<SecuritySettingsPage />} />
                                </Route>

                                <Route path="/admin/users" element={<UserManagementPage />} />
                                <Route path="/admin/users/add" element={<AddCustomerPage />} />
                                <Route path="/admin/staff" element={<StaffManagementPage />} />
                                <Route path="/admin/support/create" element={<CreateTicketPage />} />
                                
                                <Route path="/reseller/customers" element={<ResellerCustomersPage />} />
                                <Route path="/reseller/program" element={<ResellerProgramPage />} />

                                <Route path="/cloud-edge" element={<CloudEdgeDashboardPage />} />
                                <Route path="/cloud-edge/firewall/groups" element={<GroupsPage />} />
                                <Route path="/cloud-edge/firewall/policies" element={<PoliciesPage />} />
                                <Route path="/cloud-edge/firewall/services" element={<ServicesPage />} />
                                <Route path="/cloud-edge/security/distributed-firewall" element={<DistributedFirewallPage />} />
                                <Route path="/cloud-edge/security/gateway-firewall" element={<GatewayFirewallPage />} />
                                <Route path="/cloud-edge/security/ids-ips-malware-prevention" element={<IdsIpsMalwarePreventionPage />} />
                                <Route path="/kubernetes" element={<KubernetesPage />} />
                                <Route path="/networking" element={<NetworkingPage />} />
                                <Route path="/storage" element={<StoragePage />} />
                                <Route path="/monitoring" element={<MonitoringPage />} />
                                <Route path="/backup" element={<BackupPage />} />

                                <Route path="/email-admin-suite" element={<EmailAdminSuiteDashboardPage />} />
                                <Route path="/email-admin-suite/orgs-and-domains" element={<OrgsAndDomainsPage />} />
                                <Route path="/email-admin-suite/exchange/mailboxes" element={<MailboxesPage />} />
                                <Route path="/email-admin-suite/exchange/mailboxes/edit/:mailboxId" element={<EditMailboxPage />} />
                                <Route path="/email-admin-suite/exchange/distribution-lists" element={<DistributionListsPage />} />
                                <Route path="/email-admin-suite/exchange/shared-contacts" element={<SharedContactsPage />} />
                                <Route path="/email-admin-suite/exchange/shared-contacts/edit/:contactId" element={<EditSharedContactPage />} />
                                <Route path="/email-admin-suite/exchange/rules" element={<RulesPage />} />
                                <Route path="/email-admin-suite/exchange/rules/add" element={<RuleDetailsPage />} />
                                <Route path="/email-admin-suite/exchange/rules/edit/:ruleId" element={<RuleDetailsPage />} />
                                <Route path="/email-admin-suite/exchange/account-statistics" element={<AccountStatisticsPage />} />
                                <Route path="/email-admin-suite/exchange/smtp-logs" element={<EmailAdminSmtpLogsPage />} />
                                <Route path="/email-admin-suite/exchange/pst-logs" element={<PstLogsPage />} />
                                <Route path="/email-admin-suite/exchange/bulk-module" element={<BulkModulePage />} />
                                <Route path="/email-admin-suite/exchange/running-tasks" element={<RunningTasksPage />} />
                                <Route path="/email-admin-suite/old-version" element={<OldVersionPage />} />
                                <Route path="/email-admin-suite/exchange/mailbox-plans" element={<PlaceholderPage />} />
                                <Route path="/email-admin-suite/admin/background-tasks" element={<PlaceholderPage />} />
                                <Route path="/email-admin-suite/admin/lists" element={<PlaceholderPage />} />
                                <Route path="/email-admin-suite/admin/sister-companies" element={<PlaceholderPage />} />
                                <Route path="/email-admin-suite/admin/ip-lists" element={<PlaceholderPage />} />
                                <Route path="/email-admin-suite/migrations" element={<PlaceholderPage />} />
                                <Route path="/email-admin-suite/migrations/add" element={<PlaceholderPage />} />
                                <Route path="/email-admin-suite/tickets" element={<PlaceholderPage />} />
                                <Route path="/email-admin-suite/tickets/new" element={<PlaceholderPage />} />
                                <Route path="/email-admin-suite/admin/billing" element={<DemoBillingPage />} />
                            </Route>
                        </Routes>
                    </main>
                </div>
                {isCustomerView && !isEmailAdminSuite && <FeedbackSystem position="raised" />}
                <Chatbot />
            </div>
        </AppLayoutContext.Provider>
    );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/email-verification" element={<EmailVerificationPage />} />
          <Route path="/posta-pricing" element={<PostaPricingPage />} />
          <Route path="/app/*" element={<AppLayout />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
