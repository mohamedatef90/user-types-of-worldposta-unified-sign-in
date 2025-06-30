



import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import type { User, AuthContextType, NavItem, UserGroup, ApplicationCardData } from './types';
import { Navbar, Sidebar, Spinner, Breadcrumbs, Footer, Icon, FloatingAppLauncher } from './ui'; 
import { LoginPage, SignupPage, EmailVerificationPage, DashboardPage, ProfilePage, SettingsRouterPage, AdminRouterPage, ResellerProgramPage, SupportPage, NotFoundPage, AllNotificationsPage, AccountSettingsPage, SecuritySettingsPage, BillingSettingsPage, NotificationSettingsPage, UserManagementPage, SystemSettingsPage, InvoiceHistoryPage, AdminDashboardPage, ResellerDashboardPage, ActionLogsPage, ResellerCustomersPage, StaffManagementPage, CustomerTeamManagementPage } from './views';
import EmailAdminSubscriptionsPage from './EmailAdminSubscriptionsPage'; 
import CloudEdgeConfigurationsPage from './CloudEdgeConfigurationsPage'; 


// Mock User Data
export const MOCK_USERS: { [email: string]: User & { passwordHash: string } } = {
  "customer@worldposta.com": { 
    id: "user123",
    fullName: "Demo Customer Alpha",
    email: "customer@worldposta.com",
    companyName: "Alpha Inc.",
    displayName: "DemoCustomerA",
    phoneNumber: "555-1234",
    avatarUrl: "https://picsum.photos/seed/customer123/100/100",
    passwordHash: "hashedpassword123", 
    role: "customer"
  },
   "customer2@worldposta.com": {
    id: "user777",
    fullName: "Beta User (Team Alpha)",
    email: "customer2@worldposta.com",
    companyName: "Alpha Inc.",
    displayName: "BetaUser",
    avatarUrl: "https://picsum.photos/seed/customer777/100/100",
    passwordHash: "hashedpassword777",
    role: "customer",
    teamManagerId: "user123",
    assignedGroupId: "groupAlphaAdmins"
  },
  "customer3@worldposta.com": {
    id: "user888",
    fullName: "Gamma Client (Team Alpha)",
    email: "customer3@worldposta.com",
    companyName: "Alpha Inc.",
    displayName: "GammaClient",
    avatarUrl: "https://picsum.photos/seed/customer888/100/100",
    passwordHash: "hashedpassword888",
    role: "customer",
    teamManagerId: "user123",
    assignedGroupId: "groupAlphaViewers"
  },
   "customer.new1@example.com": {
    id: "user-new-1",
    fullName: "Charlie Brown",
    email: "customer.new1@example.com",
    companyName: "Peanuts Comics",
    displayName: "CharlieB",
    passwordHash: "hashedpassword123",
    role: "customer",
    avatarUrl: "https://picsum.photos/seed/new-user1/100/100",
  },
  "customer.new2@example.com": {
    id: "user-new-2",
    fullName: "Lucy van Pelt",
    email: "customer.new2@example.com",
    companyName: "Psychiatric Help Inc.",
    displayName: "LucyVP",
    passwordHash: "hashedpassword123",
    role: "customer",
    avatarUrl: "https://picsum.photos/seed/new-user2/100/100",
  },
  "customer.new3@example.com": {
    id: "user-new-3",
    fullName: "Linus van Pelt",
    email: "customer.new3@example.com",
    companyName: "Great Pumpkin Believers",
    displayName: "Linus",
    passwordHash: "hashedpassword123",
    role: "customer",
    avatarUrl: "https://picsum.photos/seed/new-user3/100/100",
  },
  "admin@worldposta.com": {
    id: "admin456",
    fullName: "Admin User",
    email: "admin@worldposta.com",
    companyName: "WorldPosta Admin Dept.",
    displayName: "SysAdmin",
    avatarUrl: "https://picsum.photos/seed/admin456/100/100",
    passwordHash: "hashedpassword_admin",
    role: "admin"
  },
  "reseller@worldposta.com": {
    id: "reseller789",
    fullName: "Reseller Partner",
    email: "reseller@worldposta.com",
    companyName: "Partner Solutions Ltd.",
    displayName: "ResellerPro",
    avatarUrl: "https://picsum.photos/seed/reseller789/100/100",
    passwordHash: "hashedpassword_reseller",
    role: "reseller"
  }
};

// Mock User Groups for customer@worldposta.com (user123)
export const MOCK_USER_GROUPS: UserGroup[] = [
  { 
    id: "groupAlphaAdmins", 
    name: "Team Administrators", 
    description: "Full access to manage team services and users.",
    permissions: ["view_billing", "manage_services", "admin_team_users", "view_action_logs"],
    teamManagerId: "user123"
  },
  {
    id: "groupAlphaViewers",
    name: "Service Viewers",
    description: "Can view services and logs, but cannot make changes.",
    permissions: ["view_services", "view_action_logs"],
    teamManagerId: "user123"
  },
  {
    id: "groupBillingManagers",
    name: "Billing Managers",
    description: "Can view and manage billing aspects.",
    permissions: ["view_billing", "manage_billing"],
    teamManagerId: "user123"
  }
];

export const MOCK_PERMISSIONS: string[] = [
  'view_billing', 
  'manage_billing', 
  'view_services', 
  'manage_services', 
  'admin_team_users', 
  'view_action_logs'
];


// Function to get user by ID, used by DashboardPage for "View As" mode
export const getMockUserById = (userId: string): User | undefined => {
  return Object.values(MOCK_USERS).find(u => u.id === userId);
};
// Function to get all customers, used by UserManagementPage and ResellerCustomersPage
export const getAllMockCustomers = (): User[] => {
  return Object.values(MOCK_USERS).filter(u => u.role === 'customer' && !u.teamManagerId); // Only primary customers
};
// Function to get all internal users (admins/resellers)
export const getAllMockInternalUsers = (): User[] => {
  return Object.values(MOCK_USERS).filter(u => u.role === 'admin' || u.role === 'reseller');
};
// Function to get users for a specific team manager
export const getUsersForTeam = (teamManagerId: string): User[] => {
  return Object.values(MOCK_USERS).filter(u => u.teamManagerId === teamManagerId);
};
// Function to get groups for a specific team manager
export const getGroupsForTeam = (teamManagerId: string): UserGroup[] => {
  return MOCK_USER_GROUPS.filter(g => g.teamManagerId === teamManagerId);
};


const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Theme Context
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  ThemeIconComponent: React.FC<{className?: string}>; 
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const storedTheme = localStorage.getItem('worldpostaTheme') as 'light' | 'dark' | null;
    return storedTheme || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('worldpostaTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const ThemeIconComponent: React.FC<{className?: string}> = ({className}) => {
    const iconName = theme === 'light' ? "fas fa-moon" : "fas fa-sun";
    return <Icon name={iconName} className={className} />;
  };


  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, ThemeIconComponent }}>
      {children}
    </ThemeContext.Provider>
  );
};


const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('worldpostaUser');
    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    const foundUser = MOCK_USERS[email.toLowerCase()];

    let expectedPassword = "";
    if (foundUser?.role === 'customer') expectedPassword = "password"; // Default password for all customers for demo
    else if (foundUser?.role === 'admin') expectedPassword = "password_admin";
    else if (foundUser?.role === 'reseller') expectedPassword = "password_reseller";
    
    // Check against password for specific demo users, or generic 'password' for other customers
    const userPasswordHash = foundUser?.passwordHash; // In real app, compare pass with userPasswordHash
    const isPasswordCorrect = (pass === expectedPassword) || (foundUser?.role === 'customer' && pass === "password");


    if (foundUser && isPasswordCorrect) { 
      const { passwordHash, ...userData } = foundUser;
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('worldpostaUser', JSON.stringify(userData));
      
      // Role-based redirection
      if (userData.role === 'admin') {
        navigate('/app/admin-dashboard');
      } else if (userData.role === 'reseller') {
        navigate('/app/reseller-dashboard');
      } else { // customer or default
        navigate('/app/dashboard');
      }
    } else {
      alert(`Invalid credentials. (Hint for customer@worldposta.com: password)`);
    }
    setIsLoading(false);
  }, [navigate]);

  const signup = useCallback(async (details: Omit<User, 'id' | 'avatarUrl' | 'displayName' | 'phoneNumber' | 'role' | 'teamManagerId' | 'assignedGroupId'> & {password: string}) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (MOCK_USERS[details.email.toLowerCase()]) {
      alert("User with this email already exists.");
      setIsLoading(false);
      return;
    }
    const newUser: User = {
      id: `user${Date.now()}`,
      fullName: details.fullName,
      email: details.email,
      companyName: details.companyName,
      role: 'customer', // Default role for new signups
      avatarUrl: `https://picsum.photos/seed/newUser${Date.now()}/100/100`,
    };
    MOCK_USERS[details.email.toLowerCase()] = { ...newUser, passwordHash: `hashed${details.password}` }; // Store with a mock hash
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('worldpostaUser', JSON.stringify(newUser));
    navigate('/email-verification'); 
    setIsLoading(false);
  }, [navigate]);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('worldpostaUser');
    navigate('/login');
  }, [navigate]);

  const updateProfile = useCallback(async (details: Partial<Pick<User, 'fullName' | 'companyName' | 'displayName' | 'phoneNumber'>>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (user) {
      const updatedUser = { ...user, ...details };
      setUser(updatedUser);
      localStorage.setItem('worldpostaUser', JSON.stringify(updatedUser));
      MOCK_USERS[user.email.toLowerCase()] = { ...MOCK_USERS[user.email.toLowerCase()], ...updatedUser };
      alert("Profile updated successfully!");
    }
    setIsLoading(false);
  }, [user]);

  const changePassword = useCallback(async (oldPass: string, newPass: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let currentExpectedOldPass = "password"; // Default for customers
     if (user?.role === 'admin') currentExpectedOldPass = "password_admin";
     else if (user?.role === 'reseller') currentExpectedOldPass = "password_reseller";

    if (user && oldPass === currentExpectedOldPass) { 
       MOCK_USERS[user.email.toLowerCase()].passwordHash = `hashed${newPass}`;
       alert("Password changed successfully!");
    } else {
       alert("Failed to change password. Old password incorrect.");
    }
    setIsLoading(false);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, signup, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-[#fcfcfc] dark:bg-gray-900"><Spinner size="lg" /></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const generateBreadcrumbItems = (pathname: string, userRole?: User['role']): { label: string; path?: string }[] => {
  const pathSegments = pathname.split('/').filter(segment => segment && segment !== 'app');
  
  let baseDashboardLabel = 'Dashboard';
  let baseDashboardPath = '/app/dashboard';

  if (userRole === 'admin' && pathname === '/app/admin-dashboard') {
    return [{ label: 'Admin Dashboard'}];
  } else if (userRole === 'reseller' && pathname === '/app/reseller-dashboard') {
     return [{ label: 'Reseller Dashboard'}];
  } else if (pathname === '/app/dashboard') {
    return [{ label: 'Dashboard' }];
  }


  const breadcrumbs: { label: string; path?: string }[] = [{ label: baseDashboardLabel, path: baseDashboardPath }];
  if (userRole === 'admin' && pathSegments.length > 0 && pathSegments[0] !== 'admin-dashboard' ) {
     breadcrumbs[0] = { label: 'Admin Dashboard', path: '/app/admin-dashboard'};
  } else if (userRole === 'reseller' && pathSegments.length > 0 && pathSegments[0] !== 'reseller-dashboard' && pathSegments[0] !== 'dashboard') {
     breadcrumbs[0] = { label: 'Reseller Dashboard', path: '/app/reseller-dashboard'};
  }


  let currentPath = '/app';

  pathSegments.forEach((segment, index) => {
    if ((segment.toLowerCase() === 'dashboard' && userRole !== 'admin' && userRole !== 'reseller') ||
        (segment.toLowerCase() === 'admin-dashboard' && userRole === 'admin') ||
        (segment.toLowerCase() === 'reseller-dashboard' && userRole === 'reseller')) {
      currentPath += `/${segment}`; 
      if (index === 0 && pathSegments.length === 1) return;
      if (index === 0 && pathSegments.length > 1) return;
    }
    
    currentPath += `/${segment}`;
    let label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    
    if (segment.toLowerCase() === 'email-subscriptions') label = 'Email Subscriptions';
    if (segment.toLowerCase() === 'cloudedge-configurations') label = 'CloudEdge Configurations';
    if (segment.toLowerCase() === 'settings') label = 'Settings';
    if (segment.toLowerCase() === 'admin') { 
        label = 'Admin Panel'; 
    }
    if (segment.toLowerCase() === 'users' && breadcrumbs.some(b => b.label.includes('Admin'))) {
        label = 'Customer Accounts'; 
    }
    if (segment.toLowerCase() === 'staff-management' && breadcrumbs.some(b => b.label.includes('Admin'))) {
        label = 'Staff & Permissions';
    }
     if (segment.toLowerCase() === 'system' && breadcrumbs.some(b => b.label.includes('Admin'))) {
        label = 'System Settings';
    }
     if (segment.toLowerCase() === 'customers' && breadcrumbs.some(b => b.label.includes('Reseller'))) {
        label = 'My Customers';
    }
    if (segment.toLowerCase() === 'invoices') label = 'Invoice History';
    if (segment.toLowerCase() === 'action-logs') label = 'Action Logs';
    if (segment.toLowerCase() === 'team-management') label = 'Team Management';


    if (breadcrumbs.length > 0 && breadcrumbs[breadcrumbs.length -1].label === label && breadcrumbs[breadcrumbs.length -1].path === currentPath) {
        return;
    }
    if (breadcrumbs.length > 1 && breadcrumbs[breadcrumbs.length -1].label === "Admin Panel" && breadcrumbs[breadcrumbs.length -1].path === "/app/admin" && index < pathSegments.length -1) {
        breadcrumbs.pop();
    }


    breadcrumbs.push({
      label: label,
      path: (index === pathSegments.length - 1 && breadcrumbs.length > (breadcrumbs[0].label === label ? 0 :1) ) ? undefined : currentPath 
    });
  });
    return breadcrumbs.filter((crumb, idx, arr) => {
        if (crumb.label === 'Admin Panel' && crumb.path === '/app/admin' && idx < arr.length - 1) {
            return false;
        }
        return true;
    });
};


const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const location = useLocation();

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: user?.role === 'admin' ? '/app/admin-dashboard' : user?.role === 'reseller' ? '/app/reseller-dashboard' : '/app/dashboard', iconName: "fas fa-home" },
    { name: 'Billings', path: '/app/billing', iconName: "far fa-credit-card" },
    { name: 'Invoice History', path: '/app/invoices', iconName: "fas fa-file-invoice-dollar" },
    
    ...(user?.role === 'admin' ? [
        { name: 'Customer Accounts', path: '/app/admin/users', iconName: "fas fa-users" },
        { name: 'Staff & Permissions', path: '/app/admin/staff-management', iconName: "fas fa-user-shield" },
        { name: 'System Settings', path: '/app/admin/system', iconName: "fas fa-cogs" }
      ] : []), 
    
    ...(user?.role === 'customer' ? [
        { name: 'User Management', path: '/app/team-management', iconName: "fas fa-users-cog" },
        { name: 'Action Logs', path: '/app/action-logs', iconName: "fas fa-history" },
    ] : []),
    { name: 'Support Center', path: '/app/support', iconName: "fas fa-headset" },
    
    ...(user?.role === 'reseller' ? [{ name: 'Reseller Program', path: '/app/reseller', iconName: "fas fa-briefcase" }] : []),
  ];
  
  const getAppLauncherItems = (role: User['role'] | undefined): ApplicationCardData[] => {
    const baseApps: ApplicationCardData[] = [
        { 
            id: 'cloudedge', 
            name: 'CloudEdge Pro', 
            description: '',
            iconName: "https://console.worldposta.com/assets/loginImgs/edgeLogo.png", 
            launchUrl: 'https://console.worldposta.com/auth/login' 
        },
        { 
            id: 'emailadmin', 
            name: 'Email Admin Suite', 
            description: '',
            iconName: "https://www.worldposta.com/assets/Posta-Logo.png", 
            launchUrl: 'https://tools.worldposta.com/login'
        }
    ];

    if (role === 'customer') {
        return [
            ...baseApps,
            { id: 'billing', name: 'Billing Center', description: '', iconName: 'fas fa-wallet', launchUrl: '/app/billing' },
            { id: 'action-logs', name: 'Action Logs', description: '', iconName: 'fas fa-history', launchUrl: '/app/action-logs' },
        ];
    }
    if (role === 'admin') {
        return [
            { id: 'customers', name: 'Customers', description: '', iconName: 'fas fa-users', launchUrl: '/app/admin/users' },
            { id: 'billing', name: 'Billing Overview', description: '', iconName: 'fas fa-cash-register', launchUrl: '/app/billing' },
            ...baseApps,
        ];
    }
    if (role === 'reseller') {
        return [
            { id: 'customers', name: 'My Customers', description: '', iconName: 'fas fa-user-friends', launchUrl: '/app/reseller/customers' },
            { id: 'billing', name: 'Reseller Billing', description: '', iconName: 'fas fa-file-invoice-dollar', launchUrl: '/app/billing' },
            ...baseApps,
        ];
    }
    return baseApps;
  };

  const appLauncherItems = getAppLauncherItems(user?.role);
  
  const handleToggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);
  const handleCloseMobileSidebar = () => setMobileSidebarOpen(false);
  const handleToggleDesktopSidebar = () => setDesktopSidebarCollapsed(!desktopSidebarCollapsed);

  const breadcrumbItems = generateBreadcrumbItems(location.pathname, user?.role);

  return (
    <div className="flex h-screen bg-[#fcfcfc] dark:bg-gray-900 overflow-hidden">
      <Sidebar 
        navItems={navItems} 
        isOpen={mobileSidebarOpen} 
        isCollapsed={desktopSidebarCollapsed} 
        onClose={handleCloseMobileSidebar} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar 
          user={user} 
          onLogout={logout} 
          onToggleMobileSidebar={handleToggleMobileSidebar}
          onToggleDesktopSidebar={handleToggleDesktopSidebar}
          sidebarCollapsed={desktopSidebarCollapsed}
        />
        <main className={`flex-1 overflow-x-hidden overflow-y-auto bg-[#fcfcfc] dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-all duration-300 ease-in-out`}>
          <Breadcrumbs items={breadcrumbItems} />
          {children}
        </main>
        <Footer />
      </div>
      <FloatingAppLauncher navItems={navItems} appItems={appLauncherItems} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/email-verification" element={<EmailVerificationPage />} />
          
          <Route path="/app/*" element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="admin-dashboard" element={<AdminDashboardPage />} />
                  <Route path="reseller-dashboard" element={<ResellerDashboardPage />} />
                   <Route path="reseller/customers" element={<ResellerCustomersPage />} /> 
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="action-logs" element={<ActionLogsPage />} />
                  <Route path="team-management" element={<CustomerTeamManagementPage />} />
                  
                  <Route path="settings" element={<SettingsRouterPage />}>
                    <Route index element={<Navigate to="account" replace />} /> 
                    <Route path="account" element={<AccountSettingsPage />} />
                    <Route path="security" element={<SecuritySettingsPage />} />
                    <Route path="notifications" element={<NotificationSettingsPage />} />
                  </Route>

                  <Route path="billing">
                    <Route index element={<BillingSettingsPage />} />
                    <Route path="email-subscriptions" element={<EmailAdminSubscriptionsPage />} />
                    <Route path="cloudedge-configurations" element={<CloudEdgeConfigurationsPage />} />
                  </Route>
                  
                  <Route path="invoices" element={<InvoiceHistoryPage />} />

                  <Route path="admin" element={<AdminRouterPage />}>
                     <Route index element={<Navigate to="users" replace />} /> 
                     <Route path="users" element={<UserManagementPage />} /> 
                     <Route path="staff-management" element={<StaffManagementPage />} />
                     <Route path="system" element={<SystemSettingsPage />} />
                  </Route>
                  <Route path="reseller" element={<ResellerProgramPage />} /> 
                  <Route path="support" element={<SupportPage />} />
                  <Route path="notifications" element={<AllNotificationsPage />} />
                  
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} /> 
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;