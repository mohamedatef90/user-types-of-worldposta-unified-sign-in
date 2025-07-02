
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate, Routes, Route, Outlet, Navigate, useLocation, NavLink, useSearchParams } from 'react-router-dom';
import { 
    FormField, Button, Card, Spinner, Icon,
    Modal, AuthLayout, Footer, SearchableSelect
} from './ui';
import { useAuth, useTheme, getMockUserById, getAllMockCustomers, getAllMockInternalUsers, getUsersForTeam, getGroupsForTeam, MOCK_USER_GROUPS, MOCK_PERMISSIONS, useAppLayout } from './App'; 
import type { User, AppNotification, LogEntry, UserGroup, ApplicationCardData, SupportTicket, SupportTicketComment, TicketAttachment } from './types';
import { NotificationType } from './types';
import { v4 as uuidv4 } from 'uuid';


export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Account name and password are required.');
      return;
    }
    try {
      await login(email, password); 
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleRoleLogin = async (roleEmail: string, rolePass: string) => {
    setError('');
    try {
      await login(roleEmail, rolePass);
    } catch (err: any) {
      setError(err.message || `Demo login for ${roleEmail} failed.`);
    }
  };
  
  const handleDeviceLogin = () => {
    alert("Device login flow initiated (conceptual).");
  };

  return (
    <AuthLayout 
        formTitle="Welcome Back" 
        formSubtitle="Sign in to your WorldPosta account." 
        isLoginPage={true}
        onDeviceLogin={handleDeviceLogin}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField 
            id="email" 
            label="Account Name" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Enter your account name" 
            required 
        />
        <FormField 
            id="password" 
            label="Password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Enter your password" 
            required 
            showPasswordToggle={true}
        />
        
        <div className="flex items-center justify-between text-sm">
            <FormField
                type="checkbox"
                id="rememberMe"
                label="Remember me"
                value="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe((e.target as HTMLInputElement).checked)}
                wrapperClassName="mb-0" 
            />
            <a href="#" className="font-medium text-[#679a41] hover:text-[#588836] dark:text-emerald-400 dark:hover:text-emerald-500 hover:underline">
              Forgot password?
            </a>
        </div>

        {error && <p className="text-sm text-center text-red-600 dark:text-red-400">{error}</p>}
        
        <Button type="submit" fullWidth isLoading={isLoading} size="lg" className="!mt-6">
          Sign In
        </Button>
      </form>
      <div className="mt-4 space-y-2">
        <Button onClick={() => handleRoleLogin('customer@worldposta.com', 'password')} variant="outline" size="md" fullWidth isLoading={isLoading}>
          Login as Customer (Demo)
        </Button>
        <Button onClick={() => handleRoleLogin('admin@worldposta.com', 'password_admin')} variant="outline" size="md" fullWidth isLoading={isLoading}>
          Login as Admin (Demo)
        </Button>
        <Button onClick={() => handleRoleLogin('reseller@worldposta.com', 'password_reseller')} variant="outline" size="md" fullWidth isLoading={isLoading}>
          Login as Reseller (Demo)
        </Button>
      </div>
    </AuthLayout>
  );
};

export const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !companyName || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await signup({ fullName, email, companyName, password });
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <AuthLayout 
        formTitle="Create an account" 
        formSubtitle="Get started with WorldPosta services" 
        isLoginPage={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField id="fullName" label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required 
            placeholder="Enter your full name"/>
        <FormField id="email" label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} required 
            placeholder="you@example.com"/>
        <FormField id="companyName" label="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} required 
            placeholder="Your company's name"/>
        <FormField id="password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required showPasswordToggle={true}
            placeholder="Create a strong password"/>
        <FormField id="confirmPassword" label="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required showPasswordToggle={true}
            placeholder="Confirm your password"/>
        {error && <p className="text-sm text-center text-red-600 dark:text-red-400">{error}</p>}
        <Button type="submit" fullWidth isLoading={isLoading} size="lg" className="!mt-6">
          Create Account
        </Button>
      </form>
    </AuthLayout>
  );
};

export const EmailVerificationPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <AuthLayout formTitle="Verify Your Email" formSubtitle="One last step to secure your account." isLoginPage={false}>
            <div className="text-center space-y-6">
                <p className="text-gray-600 dark:text-gray-400">
                    A verification email has been sent to your email address. Please check your inbox and follow the instructions to complete your registration.
                </p>
                <Button onClick={() => navigate('/login')} fullWidth size="lg">
                    Continue to Login
                </Button>
                <button className="text-sm text-[#679a41] hover:text-[#588836] dark:text-emerald-400 dark:hover:text-emerald-500 hover:underline">
                    Didn't receive email? Resend verification
                </button>
            </div>
        </AuthLayout>
    );
};

const ApplicationCard: React.FC<ApplicationCardData & { cardSize?: string }> = ({ name, description, iconName, launchUrl, cardSize }) => {
  const navigate = useNavigate();
  const handleLaunch = () => {
    if (launchUrl.startsWith('http')) {
      window.open(launchUrl, '_blank');
    } else if (launchUrl.startsWith('/')) {
      navigate(launchUrl);
    } else {
       if (launchUrl === '#email-admin-subs') {
        navigate('/app/billing/email-subscriptions'); 
      } else if (launchUrl === '#cloudedge-configs') {
        navigate('/app/billing/cloudedge-configurations'); 
      } else {
        alert(`Action for: ${name}`);
      }
    }
  };

  const isImageUrl = iconName.startsWith('http') || iconName.startsWith('/');

  return (
    <Card className={`flex flex-col h-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-lg border border-gray-300/70 dark:border-slate-600/50 rounded-xl p-6 transition-all hover:border-gray-400 dark:hover:border-slate-500 ${cardSize}`}>
      <div className="flex-grow">
        <div className="flex items-center space-x-3 mb-3">
          {isImageUrl ? (
            <img src={iconName} alt={`${name} icon`} className="h-8 w-auto" />
          ) : (
            <Icon name={iconName} className="text-2xl text-[#679a41] dark:text-emerald-400" />
          )}
          <h3 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">{name}</h3>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{description}</p>
      </div>
      <div className="mt-auto">
         <hr className="my-4 border-gray-200/50 dark:border-gray-700/50" />
        <Button variant="primary" fullWidth onClick={handleLaunch}>
          Launch Application
        </Button>
      </div>
    </Card>
  );
};

export const DashboardPage: React.FC = () => { // This is the Customer Dashboard
  const { user: loggedInUser } = useAuth();
  const [searchParams] = useSearchParams();
  const viewAsUserId = searchParams.get('viewAsUser');
  const returnToPath = searchParams.get('returnTo');
  
  const [targetUser, setTargetUser] = useState<User | null>(null);

  useEffect(() => {
    if (viewAsUserId) {
      const userToView = getMockUserById(viewAsUserId);
      setTargetUser(userToView || null);
    } else {
      setTargetUser(null);
    }
  }, [viewAsUserId]);
  
  let allPortals: (ApplicationCardData & { section: 'product' | 'application' })[] = [
    { 
      id: 'cloudedge', 
      name: 'CloudEdge', 
      description: 'Manage your cloud infrastructure, VMs, and network resources efficiently.', 
      iconName: "https://console.worldposta.com/assets/loginImgs/edgeLogo.png", 
      launchUrl: 'https://console.worldposta.com/auth/login',
      section: 'product',
    },
    { 
      id: 'emailadmin', 
      name: 'Email Admin Suite', 
      description: 'Administer your email services, mailboxes, users, and domains with ease.', 
      iconName: "https://www.worldposta.com/assets/Posta-Logo.png", 
      launchUrl: 'https://tools.worldposta.com/login',
      section: 'product',
    },
    { 
      id: 'billing', 
      name: 'Subscriptions', 
      description: 'Oversee your subscriptions and add new services.', 
      iconName: 'fas fa-wallet', 
      launchUrl: '/app/billing',
      section: 'application',
    },
    { 
      id: 'invoices', 
      name: 'Invoice History', 
      description: 'View and download past invoices for your records.', 
      iconName: 'fas fa-file-invoice', 
      launchUrl: '/app/invoices',
      section: 'application',
    },
    {
      id: 'user-management',
      name: 'User Management',
      description: 'Manage team members, user groups, and their permissions.',
      iconName: 'fas fa-users-cog',
      launchUrl: '/app/team-management',
      section: 'application',
    },
    {
      id: 'support',
      name: 'Support Center',
      description: 'Access knowledge base or create support tickets with our team.',
      iconName: 'fas fa-headset',
      launchUrl: '/app/support',
      section: 'application',
    },
  ];

  // If a reseller is viewing a customer dashboard, hide their own billing/invoices.
  if (loggedInUser?.role === 'reseller' && viewAsUserId) {
    allPortals = allPortals.filter(p => p.id !== 'billing' && p.id !== 'invoices');
  }

  // The User Management card should only be visible to customers, similar to the sidebar link.
  const userToDisplay = viewAsUserId ? targetUser : loggedInUser;
  if (userToDisplay?.role !== 'customer') {
      allPortals = allPortals.filter(p => p.id !== 'user-management');
  }

  const productPortals = allPortals.filter(p => p.section === 'product');
  const applicationPortals = allPortals.filter(p => p.section === 'application');
  
  return (
    <div className="space-y-6">
      {viewAsUserId && returnToPath && targetUser && (
        <Card className="bg-blue-50 dark:bg-sky-900/40 border border-blue-200 dark:border-sky-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Icon name="fas fa-eye" className="text-blue-600 dark:text-sky-400 mr-3 text-lg" />
              <p className="text-sm font-medium text-blue-800 dark:text-sky-200">
                You are currently viewing the dashboard as <span className="font-bold">{targetUser.fullName}</span>.
              </p>
            </div>
            <Link to={returnToPath}>
              <Button variant="outline" size="sm">
                <Icon name="fas fa-times-circle" className="mr-2" />
                Exit View As Mode
              </Button>
            </Link>
          </div>
        </Card>
      )}

      <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">
        Welcome, <span className="text-[#679a41] dark:text-emerald-400">{userToDisplay?.displayName || userToDisplay?.fullName || 'User'}</span>!
      </h1>
      
      <div className="space-y-8">
        {productPortals.length > 0 && (
            <div>
            <h2 className="text-2xl font-semibold mb-4 text-[#293c51] dark:text-gray-200">Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {productPortals.map(app => <ApplicationCard key={app.id} {...app} cardSize="md:col-span-1" />)}
            </div>
            </div>
        )}

        {applicationPortals.length > 0 && (
            <div>
            <h2 className="text-2xl font-semibold mb-4 text-[#293c51] dark:text-gray-200">Applications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {applicationPortals.map(app => <ApplicationCard key={app.id} {...app} />)}
            </div>
            </div>
        )}
      </div>
    </div>
  );
};


export const AdminDashboardPage: React.FC = () => {
    const adminApps: (ApplicationCardData & {section: 'product' | 'application'})[] = [
        {
            id: 'customers',
            name: 'Customers',
            description: 'Search, manage, and view customer accounts and their dashboards.',
            iconName: 'fas fa-users',
            launchUrl: '/app/admin/users',
            section: 'application'
        },
        {
            id: 'billing',
            name: 'Billing Overview',
            description: 'Access and manage billing for all customer accounts.',
            iconName: 'fas fa-cash-register',
            launchUrl: '/app/billing',
            section: 'application'
        }
    ];
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminApps.map(app => <ApplicationCard key={app.id} {...app} />)}
            </div>
        </div>
    );
};

export const ResellerDashboardPage: React.FC = () => {
    const resellerApps: (ApplicationCardData & {section: 'product' | 'application'})[] = [
        {
            id: 'customers',
            name: 'My Customers',
            description: 'Access and manage your customer accounts and view their dashboards.',
            iconName: 'fas fa-user-friends',
            launchUrl: '/app/reseller/customers',
            section: 'application'
        },
        {
            id: 'billing',
            name: 'Reseller Billing',
            description: 'Manage your billing, commissions, and payment history.',
            iconName: 'fas fa-file-invoice-dollar',
            launchUrl: '/app/billing',
            section: 'application'
        }
    ];
     return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Reseller Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resellerApps.map(app => <ApplicationCard key={app.id} {...app} />)}
            </div>
        </div>
    );
};

const UserListTable: React.FC<{ users: User[], searchTerm: string, onUserSelect: (userId: string) => void }> = ({ users, searchTerm, onUserSelect }) => {
    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-slate-800">
                <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Full Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company Name</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-white">{user.fullName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.companyName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button size="sm" onClick={() => onUserSelect(user.id)}>
                                    View Dashboard
                                </Button>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan={4} className="text-center py-4 text-gray-500 dark:text-gray-400">No users found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export const UserManagementPage: React.FC = () => { // For Admins
    const [searchTerm, setSearchTerm] = useState('');
    const customers = useMemo(() => getAllMockCustomers(), []);
    const navigate = useNavigate();
    
    const handleViewDashboard = (userId: string) => {
        navigate(`/app/dashboard?viewAsUser=${userId}&returnTo=/app/admin/users`);
    };

    return (
        <Card title="Customer Accounts">
            <div className="flex justify-between items-center mb-4">
                <div className="w-full max-w-xs">
                    <FormField id="search-customer" label="" placeholder="Search customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Button leftIconName="fas fa-user-plus">Invite New User</Button>
            </div>
            <UserListTable users={customers} searchTerm={searchTerm} onUserSelect={handleViewDashboard} />
        </Card>
    );
};


export const ResellerCustomersPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const customers = useMemo(() => getAllMockCustomers(), []); // In real app, filter by reseller's managed customers
    const navigate = useNavigate();

    const handleViewDashboard = (userId: string) => {
        navigate(`/app/dashboard?viewAsUser=${userId}&returnTo=/app/reseller/customers`);
    };

    return (
        <Card title="My Customers">
            <div className="mb-4">
                <FormField id="search-reseller-customer" label="" placeholder="Search your customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <UserListTable users={customers} searchTerm={searchTerm} onUserSelect={handleViewDashboard} />
        </Card>
    );
};

export const StaffManagementPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const internalUsers = useMemo(() => getAllMockInternalUsers(), []);

    const filteredUsers = internalUsers.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card title="Staff & Permissions">
            <div className="flex justify-between items-center mb-4">
                <div className="w-full max-w-xs">
                    <FormField id="search-staff" label="" placeholder="Search staff members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Button leftIconName="fas fa-plus">Add Staff Member</Button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-slate-800">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Full Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUsers.length > 0 ? filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-white">{user.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">{user.role}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Button size="sm" variant="outline">Edit Permissions</Button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="text-center py-4 text-gray-500 dark:text-gray-400">No staff found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export const AdminRouterPage: React.FC = () => {
    return (
        <div>
            <Outlet />
        </div>
    );
};

export const SettingsRouterPage: React.FC = () => {
    const { toggleTheme, ThemeIconComponent } = useTheme();

    const settingsNavItems = [
        { name: "Account", path: "account", iconName: "fas fa-user-circle" },
        { name: "Security", path: "security", iconName: "fas fa-shield-alt" },
        { name: "Notifications", path: "notifications", iconName: "fas fa-bell" },
    ];
    
    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4 lg:w-1/5">
                <Card className="p-4">
                    <h2 className="text-lg font-semibold mb-4 text-[#293c51] dark:text-gray-100">Settings</h2>
                    <nav className="space-y-1">
                        {settingsNavItems.map(item => (
                             <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) => `flex items-center px-3 py-2 text-sm font-medium rounded-md ${ isActive ? 'bg-[#679a41] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700' }`}
                            >
                                <Icon name={item.iconName} className="mr-3 w-5" />
                                <span>{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>
                    <hr className="my-4 dark:border-gray-600"/>
                    <div className="px-3 py-2">
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
                            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600">
                                <ThemeIconComponent className="text-lg text-gray-500 dark:text-gray-400" />
                            </button>
                        </label>
                    </div>
                </Card>
            </div>
            <div className="md:w-3/4 lg:w-4/5">
                <Outlet />
            </div>
        </div>
    );
};

export const ProfilePage: React.FC = () => {
    return <Navigate to="/app/settings/account" replace />;
};

export const AccountSettingsPage: React.FC = () => {
    const { user, updateProfile, isLoading, changePassword } = useAuth();
    const [formState, setFormState] = useState({
        fullName: user?.fullName || '',
        displayName: user?.displayName || '',
        email: user?.email || '',
        companyName: user?.companyName || '',
        phoneNumber: user?.phoneNumber || ''
    });
     const [passState, setPassState] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassState({ ...passState, [e.target.name]: e.target.value });
    };
    
    const handleInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { email, ...updateData } = formState; // exclude email
        updateProfile(updateData);
    };

    const handlePassSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passState.newPassword !== passState.confirmNewPassword) {
            alert("New passwords do not match.");
            return;
        }
        changePassword(passState.oldPassword, passState.newPassword);
        setPassState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    };


    return (
        <div className="space-y-6">
            <Card title="Account Information">
                <form onSubmit={handleInfoSubmit} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField id="fullName" name="fullName" label="Full Name" value={formState.fullName} onChange={handleInfoChange} />
                        <FormField id="displayName" name="displayName" label="Display Name" value={formState.displayName} onChange={handleInfoChange} />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField id="email" name="email" label="Email" value={formState.email} onChange={handleInfoChange} disabled />
                        <FormField id="companyName" name="companyName" label="Company Name" value={formState.companyName} onChange={handleInfoChange} />
                     </div>
                     <FormField id="phoneNumber" name="phoneNumber" label="Phone Number" type="tel" value={formState.phoneNumber} onChange={handleInfoChange} />
                     <div className="flex justify-end">
                         <Button type="submit" isLoading={isLoading}>Save Changes</Button>
                     </div>
                </form>
            </Card>
            <Card title="Change Password">
                 <form onSubmit={handlePassSubmit} className="space-y-4">
                    <FormField id="oldPassword" name="oldPassword" label="Old Password" type="password" value={passState.oldPassword} onChange={handlePassChange} showPasswordToggle/>
                    <FormField id="newPassword" name="newPassword" label="New Password" type="password" value={passState.newPassword} onChange={handlePassChange} showPasswordToggle/>
                    <FormField id="confirmNewPassword" name="confirmNewPassword" label="Confirm New Password" type="password" value={passState.confirmNewPassword} onChange={handlePassChange} showPasswordToggle/>
                    <div className="flex justify-end">
                         <Button type="submit" isLoading={isLoading}>Change Password</Button>
                     </div>
                </form>
            </Card>
        </div>
    );
};

export const SecuritySettingsPage: React.FC = () => {
    const { user } = useAuth();
    const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
    const [isMfaEnabled, setIsMfaEnabled] = useState(false);
    const [mfaMethod, setMfaMethod] = useState<'app' | 'email'>('app');
    const [verificationCode, setVerificationCode] = useState('');

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/WorldPosta:${user?.email}?secret=JBSWY3DPEHPK3PXP&issuer=WorldPosta`;
    const setupKey = "JBSW Y3DP EHPK 3PXP";

    const mockLoginLogs = [
        { id: 1, date: new Date().toISOString(), ip: '192.168.1.10', location: 'New York, USA', device: 'Chrome on macOS', status: 'Success' },
        { id: 2, date: new Date(Date.now() - 3600000 * 5).toISOString(), ip: '10.0.0.5', location: 'London, UK', device: 'Firefox on Windows', status: 'Success' },
        { id: 3, date: new Date(Date.now() - 3600000 * 25).toISOString(), ip: '203.0.113.19', location: 'Tokyo, Japan', device: 'Safari on iOS', status: 'Failed' },
        { id: 4, date: new Date(Date.now() - 3600000 * 48).toISOString(), ip: '198.51.100.22', location: 'Sydney, Australia', device: 'Chrome on Android', status: 'Success' },
    ];
    
    const handleEnableMfa = () => {
        // Here you would typically verify the code
        if (mfaMethod === 'app' && verificationCode.length !== 6) {
            alert("Please enter a valid 6-digit verification code.");
            return;
        }
        setIsMfaEnabled(true);
        setIsMfaModalOpen(false);
        setVerificationCode('');
        alert(`MFA via ${mfaMethod === 'app' ? 'Authenticator App' : 'Email'} has been enabled.`);
    };

    const MfaModalContent = () => (
        <div className="space-y-4">
            <fieldset>
                <legend className="text-sm font-medium text-gray-900 dark:text-gray-200">Choose a verification method</legend>
                <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                        <input id="mfa-app" name="mfa-method" type="radio" checked={mfaMethod === 'app'} onChange={() => setMfaMethod('app')} className="h-4 w-4 text-[#679a41] border-gray-300 focus:ring-[#679a41]"/>
                        <label htmlFor="mfa-app" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">Authenticator App</label>
                    </div>
                    <div className="flex items-center">
                        <input id="mfa-email" name="mfa-method" type="radio" checked={mfaMethod === 'email'} onChange={() => setMfaMethod('email')} className="h-4 w-4 text-[#679a41] border-gray-300 focus:ring-[#679a41]"/>
                        <label htmlFor="mfa-email" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">Email Authentication</label>
                    </div>
                </div>
            </fieldset>

            <div className="mt-4 pt-4 border-t dark:border-slate-600">
                {mfaMethod === 'app' && (
                    <div className="text-center space-y-4">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">1. Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy).</p>
                            <img src={qrCodeUrl} alt="MFA QR Code" className="mx-auto my-4 p-2 bg-white rounded-lg" />
                            <p className="text-sm text-gray-500 dark:text-gray-500">Or manually enter this setup key:</p>
                            <p className="font-mono text-lg bg-gray-100 dark:bg-slate-700 p-2 rounded-md inline-block my-2">{setupKey}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">2. Enter the 6-digit code from your app to verify.</p>
                            <div className="max-w-xs mx-auto mt-2">
                                <FormField id="verificationCode" label="" type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="123456" maxLength={6} />
                            </div>
                        </div>
                    </div>
                )}
                {mfaMethod === 'email' && (
                    <div className="text-center">
                        <Icon name="fas fa-envelope-circle-check" className="text-4xl text-blue-500 mb-4"/>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            If you enable email authentication, we will send a unique security code to your registered email address <strong className="text-gray-800 dark:text-gray-200">{user?.email}</strong> each time you sign in.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <Card title="Multi-Factor Authentication (MFA)">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Add an extra layer of security to your account.
                        </p>
                        <div className={`mt-2 text-sm font-semibold flex items-center gap-2 ${isMfaEnabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            <Icon name={isMfaEnabled ? "fas fa-shield-halved" : "fas fa-shield-slash"} />
                            Status: {isMfaEnabled ? 'Enabled' : 'Disabled'}
                        </div>
                    </div>
                    <Button onClick={() => setIsMfaModalOpen(true)}>
                        {isMfaEnabled ? 'Manage MFA' : 'Setup MFA'}
                    </Button>
                </div>
            </Card>

            <Card title="Recent Login Activity">
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-slate-800">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">IP Address</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Location</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Device/Browser</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {mockLoginLogs.map(log => (
                                <tr key={log.id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(log.date).toLocaleString()}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">{log.ip}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.location}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.device}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.status === 'Success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                isOpen={isMfaModalOpen}
                onClose={() => setIsMfaModalOpen(false)}
                title="Setup Multi-Factor Authentication"
                size="2xl"
                footer={
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsMfaModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleEnableMfa}>
                            {mfaMethod === 'app' ? 'Verify & Enable' : 'Enable Email MFA'}
                        </Button>
                    </div>
                }
            >
                <MfaModalContent />
            </Modal>
        </div>
    );
};

export const NotificationSettingsPage: React.FC = () => (
    <Card title="Notification Settings">
        <p className="text-gray-600 dark:text-gray-400">Conceptual page for managing email and push notification preferences.</p>
    </Card>
);

export const SystemSettingsPage: React.FC = () => (
    <Card title="System Settings">
        <p className="text-gray-600 dark:text-gray-400">Conceptual page for system-wide configurations, such as branding, default permissions, etc.</p>
    </Card>
);

interface Subscription {
  id: string;
  productName: string;
  subscribeDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'expired';
  manageUrl: string;
}

const SubscriptionCard: React.FC<{ subscription: Subscription }> = ({ subscription }) => {
  const navigate = useNavigate();

  const getStatusChip = (status: 'active' | 'pending' | 'expired') => {
    const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    switch (status) {
      case 'active':
        return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>Active</span>;
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>Pending</span>;
      case 'expired':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>Expired</span>;
      default:
        return null;
    }
  };

  const handleAction = (url: string) => {
      navigate(url);
  };

  return (
    <Card className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-[#293c51] dark:text-gray-100">{subscription.productName}</h3>
          <div className="flex flex-wrap text-sm text-gray-500 dark:text-gray-400 mt-1 gap-x-4 gap-y-1">
            <span>Subscribed: {new Date(subscription.subscribeDate).toLocaleDateString()}</span>
            <span>Renews/Ends: {new Date(subscription.endDate).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center mt-4 md:mt-0 md:ml-6 gap-2 flex-shrink-0">
          {getStatusChip(subscription.status)}
          {subscription.status === 'pending' && <Button size="sm" variant="outline" onClick={() => handleAction(subscription.manageUrl)}>Edit</Button>}
          {subscription.status === 'active' && <Button size="sm" onClick={() => handleAction(subscription.manageUrl)}>Manage</Button>}
          {subscription.status === 'expired' && <Button size="sm" onClick={() => handleAction(subscription.manageUrl)}>Renew</Button>}
        </div>
      </div>
    </Card>
  );
};


export const BillingSettingsPage: React.FC = () => {
  const billingApps: (ApplicationCardData & { section: 'product' | 'application' })[] = [
    {
      id: 'email-subs',
      name: 'Posta Email Subscriptions',
      description: 'Manage licenses, plans, and advanced features for your Posta email services.',
      iconName: 'fas fa-envelope-open-text',
      launchUrl: '/app/billing/email-subscriptions',
      section: 'application',
    },
    {
      id: 'cloudedge-configs',
      name: 'CloudEdge Configurations',
      description: 'Configure and get estimates for your virtual data centers and instances.',
      iconName: 'fas fa-server',
      launchUrl: '/app/billing/cloudedge-configurations',
      section: 'application',
    },
  ];

  const mockSubscriptions: Subscription[] = [
    { id: 'sub1', productName: 'Posta Standard Plan (10 users)', subscribeDate: '2024-01-15', endDate: '2025-01-15', status: 'active', manageUrl: '/app/billing/email-subscriptions' },
    { id: 'sub2', productName: 'CloudEdge - Web Server Cluster', subscribeDate: '2024-06-01', endDate: '2024-07-01', status: 'pending', manageUrl: '/app/billing/cloudedge-configurations' },
    { id: 'sub3', productName: 'Posta Basic Plan (5 users)', subscribeDate: '2023-05-20', endDate: '2024-05-20', status: 'expired', manageUrl: '/app/billing/email-subscriptions' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Subscriptions</h1>
      <p className="text-gray-600 dark:text-gray-400">
        From here you can manage your existing subscriptions or add new services for your account.
      </p>

      <div>
        <h2 className="text-2xl font-semibold text-[#293c51] dark:text-gray-200 mb-4">Manage & Add Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {billingApps.map(app => <ApplicationCard key={app.id} {...app} />)}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-[#293c51] dark:text-gray-200 mb-4">My Subscriptions</h2>
        {mockSubscriptions.length > 0 ? (
          <div className="space-y-4">
            {mockSubscriptions.map(sub => <SubscriptionCard key={sub.id} subscription={sub} />)}
          </div>
        ) : (
          <Card>
            <p className="text-center text-gray-500 dark:text-gray-400">You have no active subscriptions.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export const InvoiceHistoryPage: React.FC = () => {
    const mockInvoices = [
        { id: 'INV-2024-003', date: '2024-07-01', amount: 150.00, status: 'Paid', url: '#' },
        { id: 'INV-2024-002', date: '2024-06-01', amount: 145.50, status: 'Paid', url: '#' },
        { id: 'INV-2024-001', date: '2024-05-01', amount: 145.50, status: 'Paid', url: '#' },
    ];

    return (
        <Card title="Invoice History">
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-slate-800">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Invoice ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {mockInvoices.map(invoice => (
                            <tr key={invoice.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-white">{invoice.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{invoice.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${invoice.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{invoice.status}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <Button size="sm" variant="outline" onClick={() => window.open(invoice.url, '_blank')}>Download PDF</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const LogTable: React.FC<{ title: string, logs: LogEntry[] }> = ({ title, logs }) => {
    const getStatusChipClass = (status: LogEntry['status']) => {
        switch (status) {
            case 'Success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'Pending User Action':
            case 'Pending System Action':
            case 'Warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Information': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };
    return (
        <Card title={title}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date & Time</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Action</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Resource/Details</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Performed By</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {logs.map((log) => (
                            <tr key={log.id}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-gray-200">{log.action}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.resource}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.performedBy}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusChipClass(log.status)}`}>
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const mockCloudEdgeLogs: LogEntry[] = [
    { id: 'ce1', timestamp: new Date(Date.now() - 3600000).toISOString(), action: 'VM Started', resource: 'prod-web-01', performedBy: 'admin@worldposta.com', status: 'Success' },
    { id: 'ce2', timestamp: new Date(Date.now() - 7200000).toISOString(), action: 'Firewall Rule Updated', resource: 'default-fw', performedBy: 'System', status: 'Success' },
    { id: 'ce3', timestamp: new Date(Date.now() - 10800000).toISOString(), action: 'Snapshot Creation Failed', resource: 'db-main-vm', performedBy: 'backup-job', status: 'Failed' },
  ];
const mockPostaLogs: LogEntry[] = [
    { id: 'po1', timestamp: new Date(Date.now() - 4000000).toISOString(), action: 'Mailbox Created', resource: 'new.user@alpha.inc', performedBy: 'customer@worldposta.com', status: 'Success' },
    { id: 'po2', timestamp: new Date(Date.now() - 8000000).toISOString(), action: 'Spam Filter Updated', resource: 'alpha.inc domain', performedBy: 'admin@worldposta.com', status: 'Information' },
    { id: 'po3', timestamp: new Date(Date.now() - 12000000).toISOString(), action: 'Password Reset', resource: 'user@alpha.inc', performedBy: 'customer@worldposta.com', status: 'Pending User Action' },
  ];
  
const mockSubscriptionLogs: LogEntry[] = [
    { id: 'sub1', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), action: 'Subscription Added', resource: 'Posta Standard Plan (10 users)', performedBy: 'customer@worldposta.com', status: 'Success' },
    { id: 'sub2', timestamp: new Date(Date.now() - 26 * 3600000).toISOString(), action: 'Payment Method Updated', resource: 'Visa ending in 4242', performedBy: 'customer@worldposta.com', status: 'Information' },
    { id: 'sub3', timestamp: new Date(Date.now() - 50 * 3600000).toISOString(), action: 'Auto-renewal Failed', resource: 'CloudEdge - Web Server', performedBy: 'System', status: 'Failed' },
  ];

const mockUserManagementLogs: LogEntry[] = [
    { id: 'um1', timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), action: 'User Invited', resource: 'charlie.new@alpha.inc', performedBy: 'customer@worldposta.com', status: 'Pending User Action' },
    { id: 'um2', timestamp: new Date(Date.now() - 32 * 3600000).toISOString(), action: 'Group Permissions Updated', resource: 'Team Administrators', performedBy: 'customer@worldposta.com', status: 'Success' },
    { id: 'um3', timestamp: new Date(Date.now() - 72 * 3600000).toISOString(), action: 'User Removed from Group', resource: 'beta.user@alpha.inc from Viewers', performedBy: 'customer@worldposta.com', status: 'Success' },
  ];

const mockSupportLogs: LogEntry[] = [
    { id: 'sup1', timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), action: 'Ticket Created', resource: 'TKT-58291: Cannot access my VM', performedBy: 'customer@worldposta.com', status: 'Information' },
    { id: 'sup2', timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), action: 'Support Staff Replied', resource: 'TKT-58291', performedBy: 'Support Staff', status: 'Information' },
    { id: 'sup3', timestamp: new Date(Date.now() - 100 * 3600000).toISOString(), action: 'Ticket Resolved', resource: 'TKT-58275: Invoice Discrepancy', performedBy: 'Support Staff', status: 'Success' },
  ];

const mockInvoiceLogs: LogEntry[] = [
    { id: 'inv1', timestamp: new Date().toISOString(), action: 'Invoice Downloaded', resource: 'INV-2024-003', performedBy: 'customer@worldposta.com', status: 'Information' },
    { id: 'inv2', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), action: 'Payment Succeeded', resource: 'Invoice INV-2024-002', performedBy: 'System', status: 'Success' },
];

const logSources = {
  cloudEdge: { title: "CloudEdge Action Logs", logs: mockCloudEdgeLogs, type: 'product', name: 'CloudEdge' },
  posta: { title: "Posta Action Logs", logs: mockPostaLogs, type: 'product', name: 'Posta Email' },
  subscriptions: { title: "Subscription Action Logs", logs: mockSubscriptionLogs, type: 'application', name: 'Subscriptions' },
  userManagement: { title: "User Management Action Logs", logs: mockUserManagementLogs, type: 'application', name: 'User Management' },
  support: { title: "Support Center Action Logs", logs: mockSupportLogs, type: 'application', name: 'Support Center' },
  invoices: { title: "Invoice Action Logs", logs: mockInvoiceLogs, type: 'application', name: 'Invoice History' },
};

const ActionLogAdvancedSearchPanel: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    filters: any;
    onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSearchableSelectChange: (name: string, value: string) => void;
    onSearch: () => void;
    onClear: () => void;
    allLogEntries: (LogEntry & { sourceKey: string })[];
}> = ({ isOpen, onClose, filters, onFilterChange, onSearchableSelectChange, onSearch, onClear, allLogEntries }) => {
    
    const searchOptions = useMemo(() => {
        return {
            actions: [...new Set(allLogEntries.map(log => log.action))].sort(),
            users: [...new Set(allLogEntries.map(log => log.performedBy))].sort(),
            statuses: [...new Set(allLogEntries.map(log => log.status))].sort(),
            products: Object.values(logSources).filter(s => s.type === 'product').map(s => s.name),
            applications: Object.values(logSources).filter(s => s.type === 'application').map(s => s.name),
        };
    }, [allLogEntries]);

    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={panelRef}
                className={`fixed top-0 right-0 h-auto max-h-[calc(100vh-2rem)] my-4 mr-4 w-full max-w-sm bg-[#f8f8f8] dark:bg-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col rounded-lg ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="advanced-search-title"
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                    <h3 id="advanced-search-title" className="text-lg font-semibold text-[#293c51] dark:text-gray-100">Advanced Search</h3>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-slate-700" aria-label="Close menu">
                        <Icon name="fas fa-times" className="text-xl" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    <FormField id="objectName" name="objectName" label="Object Name" value={filters.objectName} onChange={onFilterChange} placeholder="e.g., prod-web-01" />
                    <SearchableSelect id="action" label="Action" value={filters.action} onChange={(value) => onSearchableSelectChange('action', value)} options={searchOptions.actions.map(o => ({ value: o, label: o }))} placeholder="Search actions..."/>
                    <SearchableSelect id="user" label="User" value={filters.user} onChange={(value) => onSearchableSelectChange('user', value)} options={searchOptions.users.map(o => ({ value: o, label: o }))} placeholder="Search users..." />
                    <FormField as="select" id="product" name="product" label="Product" value={filters.product} onChange={onFilterChange}><option value="">All Products</option>{searchOptions.products.map(o => <option key={o} value={o}>{o}</option>)}</FormField>
                    <FormField as="select" id="application" name="application" label="Application" value={filters.application} onChange={onFilterChange}><option value="">All Applications</option>{searchOptions.applications.map(o => <option key={o} value={o}>{o}</option>)}</FormField>
                    <FormField as="select" id="status" name="status" label="Status" value={filters.status} onChange={onFilterChange}><option value="">All Statuses</option>{searchOptions.statuses.map(o => <option key={o} value={o}>{o}</option>)}</FormField>
                    <FormField id="dateFrom" name="dateFrom" label="From" type="date" value={filters.dateFrom} onChange={onFilterChange} />
                    <FormField id="dateTo" name="dateTo" label="To" type="date" value={filters.dateTo} onChange={onFilterChange} />
                </div>
                
                <div className="p-4 border-t dark:border-slate-600 flex-shrink-0">
                    <div className="flex space-x-2">
                        <Button onClick={onSearch} leftIconName="fas fa-search" fullWidth>Search</Button>
                        <Button onClick={onClear} variant="outline" fullWidth>Clear</Button>
                    </div>
                </div>
            </div>
        </>
    );
};


export const ActionLogsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'applications' | 'advanced'>('products');
  const initialFilters = useMemo(() => ({
    objectName: '', action: '', user: '', product: '', application: '', status: '', dateFrom: '', dateTo: '',
  }), []);
  const [searchFilters, setSearchFilters] = useState(initialFilters);
  const [searchResults, setSearchResults] = useState<{ [key: string]: { title: string, logs: LogEntry[] } } | null>(null);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const { setSearchPanelOpen } = useAppLayout();

  useEffect(() => {
    setSearchPanelOpen(isSearchPanelOpen);
  }, [isSearchPanelOpen, setSearchPanelOpen]);


  const allLogData = useMemo(() => {
    const allLogEntries = Object.entries(logSources).flatMap(([key, source]) => 
        source.logs.map(log => ({ ...log, sourceKey: key }))
    );
    const productLogs = Object.entries(logSources).filter(([, s]) => s.type === 'product').map(([,s]) => ({title: s.title, logs: s.logs}));
    const applicationLogs = Object.entries(logSources).filter(([, s]) => s.type === 'application').map(([,s]) => ({title: s.title, logs: s.logs}));
    return { productLogs, applicationLogs, allLogEntries };
  }, []);

  const handleTabClick = (tab: 'products' | 'applications' | 'advanced') => {
    setActiveTab(tab);
    if (tab === 'advanced') {
      setIsSearchPanelOpen(true);
    } else {
      setIsSearchPanelOpen(false);
      setSearchFilters(initialFilters);
      setSearchResults(null);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSearchFilters(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  const handleSearchableSelectChange = (name: string, value: string) => {
      setSearchFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = useCallback(() => {
    let filtered = allLogData.allLogEntries.filter(log => {
      const sourceInfo = logSources[log.sourceKey as keyof typeof logSources];

      if (searchFilters.objectName && !log.resource.toLowerCase().includes(searchFilters.objectName.toLowerCase())) return false;
      if (searchFilters.action && log.action !== searchFilters.action) return false;
      if (searchFilters.user && log.performedBy !== searchFilters.user) return false;
      if (searchFilters.status && log.status !== searchFilters.status) return false;
      if (searchFilters.product && (sourceInfo.type !== 'product' || sourceInfo.name !== searchFilters.product)) return false;
      if (searchFilters.application && (sourceInfo.type !== 'application' || sourceInfo.name !== searchFilters.application)) return false;
      if (searchFilters.dateFrom && new Date(log.timestamp) < new Date(searchFilters.dateFrom)) return false;
      if (searchFilters.dateTo && new Date(log.timestamp).getTime() > new Date(searchFilters.dateTo).setHours(23,59,59,999)) return false;

      return true;
    });

    const grouped = filtered.reduce((acc, log) => {
        const key = log.sourceKey;
        if (!acc[key]) {
            acc[key] = { title: logSources[key as keyof typeof logSources].title, logs: [] };
        }
        acc[key].logs.push(log);
        return acc;
    }, {} as { [key: string]: { title: string, logs: LogEntry[] } });
    
    setSearchResults(grouped);
  }, [searchFilters, allLogData.allLogEntries]);
  
  const handleClear = useCallback(() => {
    setSearchFilters(initialFilters);
    setSearchResults(null);
  }, [initialFilters]);

  const handleSearchFromPanel = useCallback(() => {
      handleSearch();
      setIsSearchPanelOpen(false);
  }, [handleSearch]);

  const handleClearFromPanel = useCallback(() => {
      handleClear();
      setIsSearchPanelOpen(false);
  }, [handleClear]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Action Logs</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Review recent activities and changes made to your services and account settings.
      </p>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button onClick={() => handleTabClick('products')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'products' ? 'border-[#679a41] text-[#679a41]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}>
            Products
          </button>
          <button onClick={() => handleTabClick('applications')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'applications' ? 'border-[#679a41] text-[#679a41]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}>
            Applications
          </button>
          <button onClick={() => handleTabClick('advanced')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'advanced' ? 'border-[#679a41] text-[#679a41]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}>
            Advanced Search
          </button>
        </nav>
      </div>
      
        <div className="space-y-8">
            {activeTab === 'products' && (
                <>
                  {allLogData.productLogs.map(logSet => <LogTable key={logSet.title} title={logSet.title} logs={logSet.logs} />)}
                </>
            )}
            {activeTab === 'applications' && (
                <>
                   {allLogData.applicationLogs.map(logSet => <LogTable key={logSet.title} title={logSet.title} logs={logSet.logs} />)}
                </>
            )}
            {activeTab === 'advanced' && (
                <div className="space-y-8">
                    {searchResults === null && (
                        <Card><p className="text-center text-gray-500 dark:text-gray-400 py-8">Click the "Advanced Search" tab to open the filter panel and start a new search.</p></Card>
                    )}
                    {searchResults !== null && Object.keys(searchResults).length === 0 && (
                        <Card><p className="text-center text-gray-500 dark:text-gray-400 py-8">No logs found matching your criteria.</p></Card>
                    )}
                    {searchResults && Object.values(searchResults).map((data) => (
                         data.logs.length > 0 && <LogTable key={data.title} title={data.title} logs={data.logs} />
                    ))}
                </div>
            )}
        </div>
        
        <ActionLogAdvancedSearchPanel
            isOpen={isSearchPanelOpen}
            onClose={() => setIsSearchPanelOpen(false)}
            filters={searchFilters}
            onFilterChange={handleFilterChange}
            onSearchableSelectChange={handleSearchableSelectChange}
            onSearch={handleSearchFromPanel}
            onClear={handleClearFromPanel}
            allLogEntries={allLogData.allLogEntries}
        />
    </div>
  );
};

export const CustomerTeamManagementPage: React.FC = () => {
    const { user: teamManager } = useAuth();
    const [activeTab, setActiveTab] = useState<'users' | 'groups'>('users');
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
    
    const teamUsers = useMemo(() => teamManager ? getUsersForTeam(teamManager.id) : [], [teamManager]);
    const teamGroups = useMemo(() => teamManager ? getGroupsForTeam(teamManager.id) : [], [teamManager]);

    const handleOpenUserModal = (user: User | null = null) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    };

    const handleOpenGroupModal = (group: UserGroup | null = null) => {
        setEditingGroup(group);
        setIsGroupModalOpen(true);
    };
    
    const AddEditTeamUserModal: React.FC = () => (
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={editingUser ? "Edit Team User" : "Add Team User"}>
        <p>Form to add/edit user details (name, email) and assign to a group would go here.</p>
        <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
            <Button>Save</Button>
        </div>
      </Modal>
    );
    const AddEditUserGroupModal: React.FC = () => (
       <Modal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} title={editingGroup ? "Edit User Group" : "Create User Group"}>
        <p>Form to edit group name, description, and a checklist of permissions would go here.</p>
         <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsGroupModalOpen(false)}>Cancel</Button>
            <Button>Save</Button>
        </div>
      </Modal>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100 mb-4">Team & Permissions Management</h1>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('users')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-[#679a41] text-[#679a41]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}>
                        Team Users ({teamUsers.length})
                    </button>
                    <button onClick={() => setActiveTab('groups')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'groups' ? 'border-[#679a41] text-[#679a41]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}>
                        User Groups ({teamGroups.length})
                    </button>
                </nav>
            </div>
            
            <div className="mt-6">
                {activeTab === 'users' && (
                    <Card titleActions={<Button leftIconName="fas fa-user-plus" onClick={() => handleOpenUserModal()}>Add Team User</Button>}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Assigned Group</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamUsers.map(user => {
                                        const group = teamGroups.find(g => g.id === user.assignedGroupId);
                                        return (
                                            <tr key={user.id} className="bg-white dark:bg-slate-800">
                                                <td className="px-4 py-4 text-sm text-[#293c51] dark:text-gray-200">{user.fullName}</td>
                                                <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                                                <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{group?.name || 'N/A'}</td>
                                                <td className="px-4 py-4 text-right">
                                                    <Button size="sm" variant="ghost" onClick={() => handleOpenUserModal(user)}>Edit</Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
                {activeTab === 'groups' && (
                    <Card titleActions={<Button leftIconName="fas fa-plus-circle" onClick={() => handleOpenGroupModal()}>Create Group</Button>}>
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Group Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Members</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Permissions</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamGroups.map(group => {
                                        const memberCount = teamUsers.filter(u => u.assignedGroupId === group.id).length;
                                        return (
                                            <tr key={group.id} className="bg-white dark:bg-slate-800">
                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-medium text-[#293c51] dark:text-gray-200">{group.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{group.description}</p>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{memberCount}</td>
                                                <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="flex flex-wrap gap-1">
                                                        {group.permissions.map(p => <span key={p} className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full px-2 py-0.5">{p.replace(/_/g, ' ')}</span>)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <Button size="sm" variant="ghost" onClick={() => handleOpenGroupModal(group)}>Edit</Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
            {isUserModalOpen && <AddEditTeamUserModal />}
            {isGroupModalOpen && <AddEditUserGroupModal />}
        </div>
    );
};

export const ResellerProgramPage: React.FC = () => (
    <Card title="Reseller Program">
        <p className="text-gray-600 dark:text-gray-400">Information about the WorldPosta Reseller Program. Commission rates, marketing materials, and support resources.</p>
    </Card>
);

let mockSupportTickets: SupportTicket[] = [
    { 
        id: 'TKT-58291', 
        subject: 'Cannot access my VM', 
        product: 'CloudEdge', 
        status: 'In Progress', 
        lastUpdate: new Date(Date.now() - 3600000 * 2).toISOString(), 
        description: 'I have been trying to SSH into my main web server VM for the past hour and it keeps timing out. The VM appears to be running in the portal.',
        customerId: 'user123',
        customerName: 'Demo Customer Alpha',
        comments: [
            { author: 'Demo Customer Alpha', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), content: 'I have been trying to SSH into my main web server VM for the past hour and it keeps timing out. The VM appears to be running in the portal.'},
            { author: 'Support Staff', timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), content: 'We are looking into the network rules for your VM. We suspect a firewall issue and will update you shortly.'}
        ],
        internalComments: [
            { author: 'Admin User', timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(), content: 'This looks like a network ACL misconfiguration on our end. I am investigating.' }
        ]
    },
    { 
        id: 'TKT-58288', 
        subject: 'Question about email forwarding', 
        product: 'Posta Email', 
        status: 'Open', 
        lastUpdate: new Date(Date.now() - 3600000 * 5).toISOString(), 
        description: 'How do I set up an email forward from info@mycompany.com to my personal email address? I looked in the settings but could not find the option.',
        customerId: 'user-new-1',
        customerName: 'Charlie Brown',
        comments: [
             { author: 'Charlie Brown', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), content: 'How do I set up an email forward from info@mycompany.com to my personal email address? I looked in the settings but could not find the option.'}
        ]
    },
    { 
        id: 'TKT-58275', 
        subject: 'Invoice Discrepancy', 
        product: 'Subscriptions', 
        status: 'Resolved', 
        lastUpdate: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), 
        description: 'My last invoice seems higher than expected. Can you please provide a breakdown of the charges for the "CloudEdge" line item?',
        customerId: 'user-new-2',
        customerName: 'Lucy van Pelt'
    },
    { 
        id: 'TKT-58270', 
        subject: 'Feature Request: Dark Mode in Email Admin', 
        product: 'General Inquiry', 
        status: 'Closed', 
        lastUpdate: new Date(Date.now() - 3600000 * 24 * 7).toISOString(), 
        description: 'It would be great if the Email Admin Suite had a dark mode option. It would be easier on the eyes.',
        customerId: 'user-new-3',
        customerName: 'Linus van Pelt'
    },
];

const getSupportTicketStatusChip = (status: SupportTicket['status']) => {
    const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    switch (status) {
        case 'Open': return <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`}>Open</span>;
        case 'In Progress': return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>In Progress</span>;
        case 'Resolved': return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>Resolved</span>;
        case 'Closed': return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>Closed</span>;
        default: return null;
    }
};

export const SupportPage: React.FC = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [activeTicketTab, setActiveTicketTab] = useState<'conversation' | 'internal'>('conversation');
    const [newTicket, setNewTicket] = useState({ 
        product: 'General Inquiry' as SupportTicket['product'], 
        subject: '', 
        description: '' 
    });

    const [newTicketAttachments, setNewTicketAttachments] = useState<File[]>([]);
    const [newComment, setNewComment] = useState('');
    const [newInternalComment, setNewInternalComment] = useState('');
    const [newCommentAttachments, setNewCommentAttachments] = useState<File[]>([]);
    const [newStatus, setNewStatus] = useState<SupportTicket['status']>('Open');
    const commentFileInputRef = useRef<HTMLInputElement>(null);

    const allowedFileTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const processFiles = (files: File[]): Promise<TicketAttachment[]> => {
        const filePromises = files.map(file => {
            return new Promise<TicketAttachment>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        dataUrl: reader.result as string,
                    });
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });
        return Promise.all(filePromises);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFiles: React.Dispatch<React.SetStateAction<File[]>>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            const validFiles = selectedFiles.filter(file => allowedFileTypes.includes(file.type));
            if (validFiles.length !== selectedFiles.length) {
                alert('Some files were not supported and have been ignored. Accepted types: JPEG, PNG, PDF.');
            }
            setFiles(prev => [...prev, ...validFiles]);
        }
    };
    
    useEffect(() => {
        if (user?.role === 'customer') {
            setTickets(mockSupportTickets.filter(t => t.customerId === user.id));
        } else { // Admin and Reseller see all tickets
            setTickets(mockSupportTickets);
        }
    }, [user]);
    
    const handleViewTicket = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setNewStatus(ticket.status);
        setNewComment('');
        setNewInternalComment('');
        setNewCommentAttachments([]);
        setActiveTicketTab('conversation'); // Reset to default tab
        setIsViewModalOpen(true);
    };

    const handleDeleteComment = (ticketId: string, commentTimestamp: string, commentType: 'public' | 'internal') => {
        if (!window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
            return;
        }

        const ticketToUpdate = tickets.find(t => t.id === ticketId);
        if (!ticketToUpdate) return;

        let updatedTicket: SupportTicket;

        if (commentType === 'public') {
            updatedTicket = {
                ...ticketToUpdate,
                comments: ticketToUpdate.comments?.filter(c => c.timestamp !== commentTimestamp)
            };
        } else { // internal
            updatedTicket = {
                ...ticketToUpdate,
                internalComments: ticketToUpdate.internalComments?.filter(c => c.timestamp !== commentTimestamp)
            };
        }
        
        const newTickets = tickets.map(t => t.id === ticketId ? updatedTicket : t);
        setTickets(newTickets);
        
        if (selectedTicket?.id === ticketId) {
            setSelectedTicket(updatedTicket);
        }

        const mockIndex = mockSupportTickets.findIndex(t => t.id === ticketId);
        if (mockIndex !== -1) {
            mockSupportTickets[mockIndex] = updatedTicket;
        }
    };

    const handleUpdateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket || (!newComment.trim() && newCommentAttachments.length === 0)) return;

        const processedAttachments = await processFiles(newCommentAttachments);

        const newCommentObject: SupportTicketComment = {
            author: user?.fullName || 'Staff Member',
            timestamp: new Date().toISOString(),
            content: newComment.trim(),
            attachments: processedAttachments.length > 0 ? processedAttachments : undefined
        };

        const updatedTicketData: SupportTicket = {
            ...selectedTicket,
            status: newStatus,
            lastUpdate: new Date().toISOString(),
            comments: [...(selectedTicket.comments || []), newCommentObject]
        };
        
        const newTickets = tickets.map(t => t.id === updatedTicketData.id ? updatedTicketData : t);
        setTickets(newTickets);
        
        const mockIndex = mockSupportTickets.findIndex(t => t.id === updatedTicketData.id);
        if (mockIndex !== -1) {
            mockSupportTickets[mockIndex] = updatedTicketData;
        }

        setIsViewModalOpen(false);
        setSelectedTicket(null);
    };

    const handleAddInternalComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket || !newInternalComment.trim()) return;

        const newCommentObject: SupportTicketComment = {
            author: user?.fullName || 'Staff Member',
            timestamp: new Date().toISOString(),
            content: newInternalComment.trim(),
        };

        const updatedTicketData: SupportTicket = {
            ...selectedTicket,
            internalComments: [...(selectedTicket.internalComments || []), newCommentObject]
        };
        
        const newTickets = tickets.map(t => t.id === updatedTicketData.id ? updatedTicketData : t);
        setTickets(newTickets);
        setSelectedTicket(updatedTicketData);
        
        const mockIndex = mockSupportTickets.findIndex(t => t.id === updatedTicketData.id);
        if (mockIndex !== -1) {
            mockSupportTickets[mockIndex] = updatedTicketData;
        }

        setNewInternalComment('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewTicket(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newTicket.subject.trim() || !newTicket.description.trim()) {
            alert("Please fill out both subject and description.");
            return;
        }

        const processedAttachments = await processFiles(newTicketAttachments);

        const newTicketData: SupportTicket = {
            id: `TKT-${Math.floor(Math.random() * 90000) + 10000}`,
            subject: newTicket.subject,
            product: newTicket.product,
            status: 'Open',
            lastUpdate: new Date().toISOString(),
            description: newTicket.description,
            attachments: processedAttachments.length > 0 ? processedAttachments : undefined,
            customerId: user?.id,
            customerName: user?.fullName,
            comments: [{ 
                author: user?.fullName || 'Customer', 
                content: newTicket.description, 
                timestamp: new Date().toISOString(),
                attachments: processedAttachments.length > 0 ? processedAttachments : undefined
            }]
        };
        const newTickets = [newTicketData, ...tickets];
        setTickets(newTickets);
        mockSupportTickets.unshift(newTicketData);
        
        setIsCreateModalOpen(false);
        setNewTicket({ product: 'General Inquiry', subject: '', description: '' });
        setNewTicketAttachments([]);
        alert('Support ticket created successfully!');
    };
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Support Center</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Track your support tickets or create a new one.
                    </p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} leftIconName="fas fa-plus-circle">
                    Create New Ticket
                </Button>
            </div>

            <Card title="My Support Tickets">
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-slate-800">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ticket ID</th>
                                {(user?.role === 'admin' || user?.role === 'reseller') &&
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer</th>
                                }
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Last Update</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {tickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-[#679a41] dark:text-emerald-400">{ticket.id}</td>
                                    {(user?.role === 'admin' || user?.role === 'reseller') &&
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ticket.customerName}</td>
                                    }
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-white">{ticket.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ticket.product}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getSupportTicketStatusChip(ticket.status)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(ticket.lastUpdate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <Button size="sm" variant="outline" onClick={() => handleViewTicket(ticket)}>View</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create a New Support Ticket" size="2xl">
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                    <FormField id="product" name="product" label="Related Product/Service" as="select" value={newTicket.product} onChange={handleInputChange} required >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="CloudEdge">CloudEdge</option>
                        <option value="Posta Email">Posta Email</option>
                        <option value="Subscriptions">Subscriptions</option>
                    </FormField>
                    <FormField id="subject" name="subject" label="Subject" value={newTicket.subject} onChange={handleInputChange} placeholder="e.g., Unable to connect to my database" required maxLength={100}/>
                    <FormField id="description" name="description" label="Description" as="textarea" value={newTicket.description} onChange={handleInputChange} placeholder="Please provide as much detail as possible..." required rows={6} maxLength={2000}/>
                    
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1 text-[#293c51] dark:text-gray-300">Attachments</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <Icon name="fas fa-paperclip" className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                    <label htmlFor="file-upload-new" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-[#679a41] dark:text-emerald-400 hover:text-[#588836] dark:hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#679a41]">
                                        <span>Upload files</span>
                                        <input id="file-upload-new" name="file-upload-new" type="file" multiple className="sr-only" onChange={(e) => handleFileChange(e, setNewTicketAttachments)} accept=".jpg,.jpeg,.png,.pdf" />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, PDF. For videos, please upload to CloudSpace and share the link in the description.</p>
                            </div>
                        </div>
                        {newTicketAttachments.length > 0 && (
                            <div className="mt-3 text-sm">
                                <h4 className="font-medium text-[#293c51] dark:text-gray-300">Selected files:</h4>
                                <ul className="list-disc pl-5 mt-1 space-y-1">
                                    {newTicketAttachments.map((file, index) => (
                                        <li key={index} className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                            <span>{file.name} ({formatBytes(file.size)})</span>
                                            <button type="button" onClick={() => setNewTicketAttachments(files => files.filter((_, i) => i !== index))} className="text-red-500 hover:text-red-700">
                                                <Icon name="fas fa-times-circle" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Submit Ticket</Button>
                    </div>
                </form>
            </Modal>
            
            {selectedTicket && (
                <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Ticket Details: ${selectedTicket.id}`} size="3xl">
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4 -mr-2">
                        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                            <h3 className="font-semibold text-lg text-[#293c51] dark:text-gray-100">{selectedTicket.subject}</h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t dark:border-slate-600">
                               <span><strong>Product:</strong> {selectedTicket.product}</span>
                               <span><strong>Customer:</strong> {selectedTicket.customerName}</span>
                               <span><strong>Status:</strong> {getSupportTicketStatusChip(selectedTicket.status)}</span>
                            </div>
                        </div>

                         <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                                <button onClick={() => setActiveTicketTab('conversation')} className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTicketTab === 'conversation' ? 'border-[#679a41] text-[#679a41]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}>
                                    <Icon name="fas fa-comments" />
                                    Conversation History
                                </button>
                                {(user?.role === 'admin' || user?.role === 'reseller') && (
                                    <button onClick={() => setActiveTicketTab('internal')} className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTicketTab === 'internal' ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}>
                                        <Icon name="fas fa-user-shield" />
                                        Internal Notes
                                    </button>
                                )}
                            </nav>
                        </div>
                        
                        <div className="mt-4">
                            {activeTicketTab === 'conversation' && (
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        {selectedTicket.comments?.map((comment, index) => (
                                            <div key={index} className="relative group p-3 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700">
                                                <div className="flex justify-between items-center text-xs mb-1">
                                                    <span className="font-bold text-[#293c51] dark:text-gray-200">{comment.author}</span>
                                                    <span className="text-gray-500 dark:text-gray-400">{new Date(comment.timestamp).toLocaleString()}</span>
                                                </div>
                                                {comment.content && <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>}
                                                {comment.attachments && comment.attachments.length > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-dashed dark:border-slate-600">
                                                        <ul className="flex flex-wrap gap-2">
                                                            {comment.attachments.map((att, attIndex) => (
                                                                <li key={attIndex}>
                                                                    <a href={att.dataUrl} download={att.name} className="text-sm text-[#679a41] dark:text-emerald-400 hover:underline flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-slate-700 rounded-md">
                                                                        <Icon name="fas fa-file-alt" /> {att.name}
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {(user?.role === 'admin' || user?.role === 'reseller') && (
                                                    <Button size="icon" variant="ghost" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Comment" onClick={() => handleDeleteComment(selectedTicket.id, comment.timestamp, 'public')}>
                                                        <Icon name="fas fa-trash-alt" className="text-red-500" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        {!selectedTicket.comments?.length && <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">No comments yet.</p>}
                                    </div>

                                    <form onSubmit={handleUpdateTicket} className="space-y-4 pt-4 border-t dark:border-slate-600">
                                        <FormField as="textarea" name="newComment" id="newComment" label="Add a Reply" value={newComment} onChange={(e) => setNewComment(e.target.value)} rows={4} placeholder="Type your response here..." />
                                        <div>
                                            <Button type="button" variant="outline" size="sm" onClick={() => commentFileInputRef.current?.click()} leftIconName="fas fa-paperclip">
                                              Attach Files
                                            </Button>
                                            <input ref={commentFileInputRef} id="file-upload-comment" name="file-upload-comment" type="file" multiple className="sr-only" onChange={(e) => handleFileChange(e, setNewCommentAttachments)} accept=".jpg,.jpeg,.png,.pdf" />
                                        </div>
                                        {newCommentAttachments.length > 0 && (
                                            <div className="mt-2 text-sm">
                                                <ul className="list-disc pl-5 mt-1 space-y-1">
                                                    {newCommentAttachments.map((file, index) => (
                                                        <li key={index} className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                                            <span>{file.name} ({formatBytes(file.size)})</span>
                                                            <button type="button" onClick={() => setNewCommentAttachments(files => files.filter((_, i) => i !== index))} className="text-red-500 hover:text-red-700"><Icon name="fas fa-times-circle" /></button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {(user?.role === 'admin' || user?.role === 'reseller') && (
                                            <FormField as="select" name="newStatus" id="newStatus" label="Change Status" value={newStatus} onChange={(e) => setNewStatus(e.target.value as SupportTicket['status'])}>
                                                <option value="Open">Open</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Resolved">Resolved</option>
                                                <option value="Closed">Closed</option>
                                            </FormField>
                                        )}
                                        <div className="flex justify-end space-x-2 pt-2">
                                            <Button type="button" variant="ghost" onClick={() => setIsViewModalOpen(false)}>Cancel</Button>
                                            <Button type="submit" disabled={!newComment.trim() && newCommentAttachments.length === 0}>
                                                {user?.role === 'admin' || user?.role === 'reseller' ? 'Update Ticket' : 'Add Reply'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                             {activeTicketTab === 'internal' && (user?.role === 'admin' || user?.role === 'reseller') && (
                                <div className="space-y-4">
                                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                                        {selectedTicket.internalComments?.map((comment, index) => (
                                            <div key={`internal-${index}`} className="relative group p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/50">
                                                <div className="flex justify-between items-center text-xs mb-1">
                                                    <span className="font-bold text-yellow-800 dark:text-yellow-300">{comment.author}</span>
                                                    <span className="text-yellow-600 dark:text-yellow-400">{new Date(comment.timestamp).toLocaleString()}</span>
                                                </div>
                                                {comment.content && <p className="text-sm text-yellow-900 dark:text-yellow-200 whitespace-pre-wrap">{comment.content}</p>}
                                                <Button size="icon" variant="ghost" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Internal Note" onClick={() => handleDeleteComment(selectedTicket.id, comment.timestamp, 'internal')}>
                                                     <Icon name="fas fa-trash-alt" className="text-red-500" />
                                                </Button>
                                            </div>
                                        ))}
                                        {!selectedTicket.internalComments?.length && <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">No internal notes yet.</p>}
                                    </div>
                                    <form onSubmit={handleAddInternalComment} className="space-y-2 pt-4 border-t dark:border-slate-600">
                                        <FormField as="textarea" name="newInternalComment" id="newInternalComment" label="Add an Internal Note" value={newInternalComment} onChange={(e) => setNewInternalComment(e.target.value)} rows={3} placeholder="Type an internal note..." />
                                        <div className="flex justify-end">
                                            <Button type="submit" variant="secondary" size="sm" disabled={!newInternalComment.trim()}>
                                                Add Note
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export const AllNotificationsPage: React.FC = () => (
    <Card title="All Notifications">
        <p className="text-gray-600 dark:text-gray-400">A full list of all your past notifications will be displayed here.</p>
    </Card>
);

export const NotFoundPage: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <Icon name="fas fa-exclamation-triangle" className="text-5xl text-yellow-500 mb-4"/>
        <h1 className="text-4xl font-bold text-[#293c51] dark:text-gray-100">404 - Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">The page you are looking for does not exist.</p>
        <Link to="/app/dashboard" className="mt-6">
            <Button>Go to Dashboard</Button>
        </Link>
    </div>
);