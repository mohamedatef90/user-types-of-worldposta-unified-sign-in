
import type { User, UserGroup, Invoice, SupportTicket, LogEntry, SupportTicketProduct, InvoiceLineItem, StaffGroup, SmtpLogEntry, KnowledgeBaseArticle, KubernetesCluster, LoadBalancer, FirewallRule, StorageBucket, SecurityAlert, BackupJob, Mailbox, MailboxPlan, DistributionList, SharedContact, Rule, PstLogEntry, RunningTask } from './types';

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
    role: "customer",
    status: 'active',
    creationDate: '2023-05-10T14:48:00Z',
    country: 'US',
    isTrial: false
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
    status: 'active',
    teamManagerId: "user123",
    assignedGroupId: "groupAlphaAdmins",
    creationDate: '2023-06-15T09:20:00Z',
    country: 'US',
    isTrial: false,
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
    status: 'suspended',
    teamManagerId: "user123",
    assignedGroupId: "groupAlphaViewers",
    creationDate: '2023-07-01T11:00:00Z',
    country: 'US',
    isTrial: false,
  },
   "customer.new1@example.com": {
    id: "user-new-1",
    fullName: "Charlie Brown",
    email: "customer.new1@example.com",
    companyName: "Peanuts Comics",
    displayName: "CharlieB",
    passwordHash: "hashedpassword123",
    role: "customer",
    status: 'active',
    avatarUrl: "https://picsum.photos/seed/new-user1/100/100",
    creationDate: '2024-01-20T18:00:00Z',
    country: 'CA',
    isTrial: true,
  },
  "customer.new2@example.com": {
    id: "user-new-2",
    fullName: "Lucy van Pelt",
    email: "customer.new2@example.com",
    companyName: "Psychiatric Help Inc.",
    displayName: "LucyVP",
    passwordHash: "hashedpassword123",
    role: "customer",
    status: 'blocked',
    avatarUrl: "https://picsum.photos/seed/new-user2/100/100",
    creationDate: '2024-02-11T12:30:00Z',
    country: 'GB',
    isTrial: false,
  },
  "customer.new3@example.com": {
    id: "user-new-3",
    fullName: "Linus van Pelt",
    email: "customer.new3@example.com",
    companyName: "Great Pumpkin Believers",
    displayName: "Linus",
    passwordHash: "hashedpassword123",
    role: "customer",
    status: 'active',
    avatarUrl: "https://picsum.photos/seed/new-user3/100/100",
    creationDate: '2024-03-05T08:45:00Z',
    country: 'AU',
    isTrial: true,
  },
  "admin@worldposta.com": {
    id: "admin456",
    fullName: "Admin User",
    email: "admin@worldposta.com",
    companyName: "WorldPosta Admin Dept.",
    displayName: "SysAdmin",
    avatarUrl: "https://picsum.photos/seed/admin456/100/100",
    passwordHash: "hashedpassword_admin",
    role: "admin",
    staffGroupId: "staffGroupAdmins",
    status: 'active',
    creationDate: '2023-01-15T10:00:00Z',
    mfaEnabled: true,
  },
  "reseller@worldposta.com": {
    id: "reseller789",
    fullName: "Reseller Partner",
    email: "reseller@worldposta.com",
    companyName: "Partner Solutions Ltd.",
    displayName: "ResellerPro",
    avatarUrl: "https://picsum.photos/seed/reseller789/100/100",
    passwordHash: "hashedpassword_reseller",
    role: "reseller",
    staffGroupId: "staffGroupSupport",
    status: 'suspended',
    creationDate: '2023-02-20T11:30:00Z',
    mfaEnabled: false,
  },
  "new.user@worldposta.com": { 
    id: "user-new-demo",
    fullName: "New Demo User",
    email: "new.user@worldposta.com",
    companyName: "Demo Corp",
    displayName: "NewDemoUser",
    avatarUrl: "https://picsum.photos/seed/newuserdemo/100/100",
    passwordHash: "hashedpassword",
    role: "customer",
    status: 'active',
    creationDate: '2024-01-01T00:00:00Z',
    country: 'US',
    isTrial: true
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


export const MOCK_ADMIN_PERMISSIONS: string[] = [
    'manage_customers',
    'view_all_billing',
    'manage_all_billing',
    'manage_support_tickets',
    'manage_staff_members',
    'manage_staff_groups',
    'access_system_settings',
    'impersonate_users'
];

export const MOCK_ADMIN_ROLES = MOCK_ADMIN_PERMISSIONS.map(perm => ({
    id: perm,
    label: perm.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    description: `Allows user to ${perm.replace(/_/g, ' ')}.`
}));


export const MOCK_STAFF_GROUPS: StaffGroup[] = [
    {
        id: "staffGroupAdmins",
        name: "Super Administrators",
        description: "Full access to all system features and settings.",
        permissions: MOCK_ADMIN_PERMISSIONS,
    },
    {
        id: "staffGroupSupport",
        name: "Support Team",
        description: "Can manage customer support tickets and view customer information.",
        permissions: ['manage_support_tickets', 'view_all_billing', 'manage_customers'],
    },
    {
        id: "staffGroupBilling",
        name: "Billing Department",
        description: "Manages all aspects of customer and system billing.",
        permissions: ['view_all_billing', 'manage_all_billing'],
    }
];

// Function to get user by ID, used by DashboardPage for "View As" mode
export const getMockUserById = (userId: string): User | undefined => {
  return Object.values(MOCK_USERS).find(u => u.id === userId);
};
// Function to get all customers, used by UserManagementPage and ResellerCustomersPage
export const getAllMockCustomers = (): User[] => {
  return Object.values(MOCK_USERS).filter(u => u.role === 'customer');
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

export const getAllMockStaffGroups = (): StaffGroup[] => {
  return MOCK_STAFF_GROUPS;
};


// --- MOCK DATA FOR PAGES ---
const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);
const inTwoWeeks = new Date(); inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
const lastWeek = new Date(); lastWeek.setDate(lastWeek.getDate() - 7);


export const mockInvoices: Invoice[] = [
    { 
        id: 'INV-2024-004', 
        date: '2024-08-01', 
        amount: 250.00, 
        status: 'Unpaid', 
        url: '#',
        customerId: 'user123',
        customerName: 'Demo Customer Alpha',
        customerAddress: ['123 Innovation Drive', 'Tech City, TX 75001', 'United States'],
        customerEmail: 'customer@worldposta.com',
        billingPeriod: 'Aug 1, 2024 to Sep 1, 2024',
        nextBillingDate: 'Sep 1, 2024',
        subscriptionId: 'sub-cloud-cluster-xyz',
        lineItems: [
            { description: 'CloudEdge - Web Server Cluster', units: 1, amount: 238.10 },
            { description: 'Posta Standard Plan (5 users)', units: 1, amount: 50.00 },
        ],
        subTotal: 288.10,
        tax: { label: 'Tax (8.25%)', amount: 23.77 },
        payments: -61.87, // partial payment? just for example
        amountDue: 250.00,
        paymentDetails: 'Awaiting payment.',
        dueDate: inTwoWeeks.toISOString().split('T')[0],
        packageName: 'Posta Standard Plan',
        type: 'Renewal'
    },
     { 
        id: 'INV-2024-005', 
        date: new Date().toISOString().split('T')[0], 
        amount: 38.00, 
        status: 'Unpaid', 
        url: '#',
        customerId: 'user-new-1',
        customerName: 'Charlie Brown',
        customerAddress: ['123 Peanuts Lane', 'Cartoonville, CA 90210', 'Canada'],
        customerEmail: 'customer.new1@example.com',
        billingPeriod: 'Current',
        nextBillingDate: 'Next Month',
        subscriptionId: 'sub-posta-biz-456',
        lineItems: [{ description: 'Posta Business Plan (10 users)', units: 1, amount: 38.00 }],
        subTotal: 38.00, tax: { label: 'Tax (0%)', amount: 0 }, payments: 0, amountDue: 38.00,
        paymentDetails: 'Awaiting payment.',
        dueDate: nextWeek.toISOString().split('T')[0],
        packageName: 'Posta Business Plan',
        type: 'New Subscription'
    },
    { 
        id: 'INV-2024-006', 
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        amount: 55.00, 
        status: 'Unpaid', 
        url: '#',
        customerId: 'user-new-3',
        customerName: 'Linus van Pelt',
        customerAddress: ['456 Security Blanket Ave', 'Pumpkin Patch, AU 2000', 'Australia'],
        customerEmail: 'customer.new3@example.com',
        billingPeriod: 'Current',
        nextBillingDate: 'Next Month',
        subscriptionId: 'sub-posta-pro-789',
        lineItems: [{ description: 'Posta Pro Plan (10 users)', units: 1, amount: 55.00 }],
        subTotal: 55.00, tax: { label: 'Tax (0%)', amount: 0 }, payments: 0, amountDue: 55.00,
        paymentDetails: 'Awaiting payment.',
        dueDate: lastWeek.toISOString().split('T')[0], // Overdue
        packageName: 'Posta Pro Plan',
        type: 'Upgrade'
    },
    { 
        id: 'INV-2024-007', 
        date: new Date().toISOString().split('T')[0], 
        amount: 18.00, 
        status: 'Unpaid', 
        url: '#',
        customerId: 'user-new-2', // Blocked customer
        customerName: 'Lucy van Pelt',
        customerAddress: ['789 Psychiatric Booth St', 'Doctor In, GB SW1A 0AA', 'United Kingdom'],
        customerEmail: 'customer.new2@example.com',
        billingPeriod: 'Current',
        nextBillingDate: 'Next Month',
        subscriptionId: 'sub-posta-light-101',
        lineItems: [{ description: 'Posta Light Plan (10 users)', units: 1, amount: 18.00 }],
        subTotal: 18.00, tax: { label: 'Tax (0%)', amount: 0 }, payments: 0, amountDue: 18.00,
        paymentDetails: 'Awaiting payment.',
        dueDate: tomorrow.toISOString().split('T')[0],
        packageName: 'Posta Light Plan',
        type: 'Renewal'
    },
    { 
        id: 'INV-2024-003', 
        date: '2024-07-01', 
        amount: 150.00, 
        status: 'Paid', 
        url: '#',
        customerId: 'user123',
        customerName: 'Demo Customer Alpha',
        customerAddress: ['123 Innovation Drive', 'Tech City, TX 75001', 'United States'],
        customerEmail: 'customer@worldposta.com',
        billingPeriod: 'Jul 1, 2024 to Aug 1, 2024',
        nextBillingDate: 'Aug 1, 2024',
        subscriptionId: 'sub-posta-std-abc',
        lineItems: [
            { description: 'Posta Standard Plan (10 users)', units: 1, amount: 100.00 },
            { description: 'Advanced Email Archiving', units: 1, amount: 42.86 },
        ],
        subTotal: 142.86,
        tax: { label: 'Tax (5%)', amount: 7.14 },
        payments: -150.00,
        amountDue: 0.00,
        paymentDetails: '$150.00 was paid on Jul 3, 2024 by Visa card ending 4242.'
    },
];


export const mockSupportTickets: SupportTicket[] = [
    {
        id: 'TKT-58291',
        subject: 'Cannot access my VM',
        product: 'CloudEdge',
        status: 'In Progress',
        lastUpdate: new Date(Date.now() - 3600000).toISOString(),
        description: 'I am unable to SSH into my production web server (prod-web-01). The connection times out. I have confirmed my firewall rules allow port 22 from my IP. Please investigate.',
        customerId: 'user123',
        customerName: 'Demo Customer Alpha',
        priority: 'High',
        department: 'Technical Support',
        requestType: 'Issue',
        comments: [
            { author: 'Demo Customer Alpha', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), content: 'This is urgent, my website is down.' },
            { author: 'Support Staff', timestamp: new Date(Date.now() - 3600000 * 23).toISOString(), content: 'We are looking into the issue and will update you shortly.' },
            { author: 'Demo Customer Alpha', timestamp: new Date(Date.now() - 3600000 * 22).toISOString(), content: 'Still no update? Customers are complaining.' },
            { author: 'Support Staff', timestamp: new Date(Date.now() - 3600000 * 21).toISOString(), content: 'Investigating the core router logs. It appears to be a localized routing loop.' },
            { author: 'Demo Customer Alpha', timestamp: new Date(Date.now() - 3600000 * 20).toISOString(), content: 'Understood. Is there a workaround I can apply on my firewall?' },
            { author: 'Support Staff', timestamp: new Date(Date.now() - 3600000 * 19).toISOString(), content: 'No workaround needed, we are re-routing traffic through the secondary gateway now.' },
            { author: 'Demo Customer Alpha', timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), content: 'The secondary gateway is up, but latency is extremely high.' },
            { author: 'Support Staff', timestamp: new Date(Date.now() - 3600000 * 17).toISOString(), content: 'Latency is expected during the failover convergence. It should stabilize in 5 minutes.' },
            { author: 'Demo Customer Alpha', timestamp: new Date(Date.now() - 3600000 * 16).toISOString(), content: 'Convergence finished. Performance is back to normal. Thank you.' },
            { author: 'Support Staff', timestamp: new Date(Date.now() - 3600000 * 15).toISOString(), content: 'Excellent. We are now investigating why the primary gateway failed.' },
            { author: 'Demo Customer Alpha', timestamp: new Date(Date.now() - 3600000 * 14).toISOString(), content: 'Will there be a post-mortem report for this incident?' },
            { author: 'Support Staff', timestamp: new Date(Date.now() - 3600000 * 13).toISOString(), content: 'Yes, an RCA (Root Cause Analysis) will be provided within 24 hours.' },
            { author: 'Demo Customer Alpha', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), content: 'Great. Please also check the backup replication status, it seems stuck.' },
            { author: 'Support Staff', timestamp: new Date(Date.now() - 3600000 * 11).toISOString(), content: 'Checking backup replication... Fixed. The route change temporarily disrupted the sync.' },
            { author: 'Demo Customer Alpha', timestamp: new Date(Date.now() - 3600000 * 10).toISOString(), content: 'Confirmed. Sync is back online. Closing the follow-up question.' }
        ]
    },
    {
        id: 'TKT-58275',
        subject: 'Invoice Discrepancy',
        product: 'Subscriptions',
        status: 'Resolved',
        lastUpdate: new Date(Date.now() - 86400000 * 2).toISOString(),
        description: 'My last invoice (INV-2024-003) seems to have an incorrect charge. Can you please review it?',
        customerId: 'user123',
        customerName: 'Demo Customer Alpha',
        priority: 'Normal',
        department: 'Billing Department',
        requestType: 'Inquiry'
    }
];

export const MOCK_KB_ARTICLES: KnowledgeBaseArticle[] = [
    { id: 'kb1', category: 'Billing', question: 'How do I update my payment method?', answer: 'You can update your payment method from the Billing Settings page. Navigate to Settings > Billing and you will find an option to add or remove payment methods.', keywords: ['payment', 'credit card', 'billing', 'update'] },
    { id: 'kb2', category: 'CloudEdge', question: 'How can I reset the root password for my Linux VM?', answer: 'To reset the root password, you will need to boot into single-user mode. Please follow the specific instructions for your distribution (e.g., Ubuntu, CentOS) which can be found in our detailed documentation.', keywords: ['ssh', 'password', 'root', 'reset', 'vm'] },
    { id: 'kb3', category: 'Posta Email', question: 'How do I set up my email on Outlook?', answer: 'Please use the following server settings: IMAP server: mail.worldposta.com, SMTP server: smtp.worldposta.com. Use your full email address as the username and your password. Detailed guides are available in our support section.', keywords: ['outlook', 'email', 'configuration', 'setup', 'posta'] },
    { id: 'kb4', category: 'General', question: 'How do I enable Multi-Factor Authentication (MFA)?', answer: 'Navigate to Settings > Security. From there, you can enable MFA and choose your preferred method (Authenticator App or Email). Follow the on-screen instructions to complete the setup.', keywords: ['mfa', 'security', '2fa', 'authentication'] }
];

export const mockSmtpLogs: SmtpLogEntry[] = [
    { id: 'smtp1', timestamp: new Date().toISOString(), from: 'user@external.com', to: 'sales@alpha.inc', subject: 'Inquiry about your services', action: 'PASS', status: 'Passed', details: 'Message-ID: <123@external.com>' },
    { id: 'smtp2', timestamp: new Date(Date.now() - 3600000).toISOString(), from: 'spam@spamdomain.com', to: 'info@alpha.inc', subject: '!!! You WON a PRIZE !!!', action: 'REJECT', status: 'Spam (Confirmed)', details: 'High spam score (15.2)' },
    { id: 'smtp3', timestamp: new Date(Date.now() - 7200000).toISOString(), from: 'marketing@legit.com', to: 'contact@alpha.inc', subject: 'Our latest newsletter', action: 'DELIVER', status: 'Passed', details: 'Message-ID: <abc@legit.com>' },
    { id: 'smtp4', timestamp: new Date(Date.now() - 10800000).toISOString(), from: 'hr@alpha.inc', to: 'archive@alpha.inc', subject: 'FW: Employee Onboarding', action: 'ARCHIVE', status: 'Archived', details: 'Archived by rule: "Internal HR Comms"' },
];

export const mockPostaPackages = [
    { id: 'posta-light', name: 'Posta Light Plan' },
    { id: 'posta-business', name: 'Posta Business Plan' },
    { id: 'posta-pro', name: 'Posta Pro Plan' },
    { id: 'posta-enterprise', name: 'Posta Enterprise Plan' },
];

// --- MOCK DATA for MAILBOXES ---
export const mockMailboxPlans: MailboxPlan[] = ['Posta Light', 'Posta Business', 'Posta Pro', 'Posta Enterprise'];
export const mockMailboxDomains = ['alpha-inc.com', 'betadivision.net', 'gamma-corp.io'];
// Fix: Renamed mockMailboxe to mockMailboxes and added data
export const mockMailboxes: Mailbox[] = [
    { id: 'mbx_001', displayName: 'John Doe', login: 'john.doe@alpha-inc.com', mailboxPlan: 'Posta Business', creationDate: '2023-10-01T10:00:00Z', driveQuota: { usedGB: 25.5, totalGB: 100 }, level: 'Normal', status: 'active', mfaEnabled: true, mailboxType: 'User', firstName: 'John', lastName: 'Doe', initials: 'JD' },
    { id: 'mbx_002', displayName: 'Jane Smith', login: 'jane.smith@alpha-inc.com', mailboxPlan: 'Posta Pro', creationDate: '2023-09-15T11:30:00Z', driveQuota: { usedGB: 150.2, totalGB: 200 }, level: 'VIP', status: 'active', mfaEnabled: false, mailboxType: 'User', firstName: 'Jane', lastName: 'Smith', initials: 'JS' },
    { id: 'mbx_003', displayName: 'Sales Team', login: 'sales@alpha-inc.com', mailboxPlan: 'Posta Light', creationDate: '2023-08-20T09:00:00Z', driveQuota: { usedGB: 8.1, totalGB: 10 }, level: 'Normal', status: 'suspended', mailboxType: 'Shared' },
    { id: 'mbx_004', displayName: 'Conference Room A', login: 'conf.a@alpha-inc.com', mailboxPlan: 'Posta Light', creationDate: '2023-07-01T14:00:00Z', driveQuota: { usedGB: 0.5, totalGB: 10 }, level: 'Normal', status: 'active', mailboxType: 'Room' },
    { id: 'mbx_005', displayName: 'Support Queue', login: 'support@betadivision.net', mailboxPlan: 'Posta Enterprise', creationDate: '2023-11-05T16:45:00Z', driveQuota: { usedGB: 500.0, totalGB: 1024 }, level: 'Admin', status: 'active', mfaEnabled: true, mailboxType: 'Shared' },
    { id: 'mbx_006', displayName: 'Blocked User', login: 'blocked.user@gamma-corp.io', mailboxPlan: 'Posta Business', creationDate: '2023-06-10T12:00:00Z', driveQuota: { usedGB: 12.0, totalGB: 100 }, level: 'Normal', status: 'blocked', mailboxType: 'User' },
];

// Fix: Added mockDistributionLists
export const mockDistributionLists: DistributionList[] = [
    { id: 'dl1', displayName: 'All Employees', primaryEmail: 'all@alpha-inc.com', creationDate: '2023-01-20T10:00:00Z', managerEmail: 'admin@alpha-inc.com' },
    { id: 'dl2', displayName: 'Marketing Team', primaryEmail: 'marketing@alpha-inc.com', creationDate: '2023-02-15T11:30:00Z', managerEmail: 'manager@alpha-inc.com' },
];

// Fix: Added mockSharedContacts
export const mockSharedContacts: SharedContact[] = [
    { id: 'sc1', displayName: 'External Partner Inc.', email: 'contact@partner.com', creationDate: '2023-03-10T09:00:00Z' },
    { id: 'sc2', displayName: 'Vendor Support', email: 'support@vendor.com', creationDate: '2023-04-05T14:20:00Z' },
];

// Fix: Added mockRules
export const mockRules: Rule[] = [
    { id: 'rule1', name: 'Block Spam', description: 'Moves emails with high spam score to Junk folder.', status: 'enabled', creationDate: '2023-01-10T12:00:00Z', lastModified: '2023-10-25T08:30:00Z' },
    { id: 'rule2', name: 'Forward Invoices', description: 'Forwards emails with "invoice" in subject to billing@alpha.inc.', status: 'enabled', creationDate: '2023-02-15T14:00:00Z', lastModified: '2023-09-30T10:00:00Z' },
    { id: 'rule3', name: 'Vacation Auto-Reply (Old)', description: 'Old auto-reply for holidays.', status: 'disabled', creationDate: '2022-12-20T10:00:00Z', lastModified: '2023-01-05T11:00:00Z' },
];

// Fix: Added mockPstLogs
export const mockPstLogs: PstLogEntry[] = [
    { id: 'pst1', email: 'archive-user@alpha.inc', createdBy: 'admin@worldposta.com', createdAt: new Date(Date.now() - 86400000).toISOString(), type: 'Export', status: 'Completed' },
    { id: 'pst2', email: 'new-hire@alpha.inc', createdBy: 'hr@alpha.inc', createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), type: 'Import', status: 'In Progress' },
    { id: 'pst3', email: 'legal-hold@alpha.inc', createdBy: 'admin@worldposta.com', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), type: 'Export', status: 'Failed' },
];

// Fix: Added mockRunningTasks
export const mockRunningTasks: RunningTask[] = [
    { id: 'task1', status: 'Finish', type: 'Create Mailbox', total: 100, failed: 2, done: 98, createdBy: 'admin@worldposta.com', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 'task2', status: 'In Progress', type: 'Update Passwords', total: 50, failed: 0, done: 25, createdBy: 'admin@worldposta.com', createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString() },
    { id: 'task3', status: 'New', type: 'Apply Retention Policy', total: 1254, failed: 0, done: 0, createdBy: 'System', createdAt: new Date().toISOString() },
];


// --- MOCK DATA for NEW PRODUCT PAGES ---
// Fix: Added mockKubernetesClusters
export const mockKubernetesClusters: KubernetesCluster[] = [
    { id: 'k8s-prod-1', name: 'production-cluster', version: '1.28.2', status: 'Running', nodeCount: 5, region: 'US East (N. Virginia)', creationDate: '2023-11-01T10:00:00Z' },
    { id: 'k8s-staging-1', name: 'staging-cluster', version: '1.27.5', status: 'Running', nodeCount: 2, region: 'EU (Frankfurt)', creationDate: '2023-10-15T14:30:00Z' },
    { id: 'k8s-dev-1', name: 'dev-cluster', version: '1.28.2', status: 'Stopped', nodeCount: 1, region: 'US East (N. Virginia)', creationDate: '2023-09-20T09:00:00Z' },
];

// Fix: Added mockLoadBalancers
export const mockLoadBalancers: LoadBalancer[] = [
    { id: 'lb-prod-web', name: 'prod-web-traffic', type: 'L7 Application', status: 'Active', ipAddress: '203.0.113.10' },
    { id: 'lb-internal-db', name: 'internal-database-tcp', type: 'L4 Network', status: 'Active', ipAddress: '10.0.5.25' },
    { id: 'lb-staging-app', name: 'staging-app-services', type: 'L7 Application', status: 'Inactive', ipAddress: '198.51.100.5' },
];

// Fix: Added mockFirewallRules
export const mockFirewallRules: FirewallRule[] = [
    { id: 'fw-allow-ssh', policyName: 'allow-ssh-admin', direction: 'Inbound', protocol: 'TCP', portRange: '22', source: '73.125.88.10/32', action: 'Allow' },
    { id: 'fw-allow-http', policyName: 'allow-http-world', direction: 'Inbound', protocol: 'TCP', portRange: '80', source: '0.0.0.0/0', action: 'Allow' },
    { id: 'fw-allow-https', policyName: 'allow-https-world', direction: 'Inbound', protocol: 'TCP', portRange: '443', source: '0.0.0.0/0', action: 'Allow' },
    { id: 'fw-deny-all-out', policyName: 'deny-all-outbound', direction: 'Outbound', protocol: 'TCP', portRange: '1-65535', source: 'any', action: 'Deny' },
];

// Fix: Added mockStorageBuckets
export const mockStorageBuckets: StorageBucket[] = [
    { id: 'bucket-prod-assets', name: 'prod-assets-public', region: 'US East (N. Virginia)', sizeGB: 256, creationDate: '2023-05-10T12:00:00Z' },
    { id: 'bucket-backup-db', name: 'db-backups-private', region: 'EU (Frankfurt)', sizeGB: 1024, creationDate: '2023-06-15T08:00:00Z' },
];

// Fix: Added mockSecurityAlerts
export const mockSecurityAlerts: SecurityAlert[] = [
    { id: 'alert-1', severity: 'Critical', description: 'Potential ransomware activity detected on prod-db-01', resource: 'prod-db-01', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 'alert-2', severity: 'High', description: 'Multiple failed SSH login attempts from 203.0.113.50', resource: 'prod-web-01', timestamp: new Date(Date.now() - 3600000 * 3).toISOString() },
    { id: 'alert-3', severity: 'Medium', description: 'Unusual outbound traffic to a known malicious IP', resource: 'staging-worker-02', timestamp: new Date(Date.now() - 86400000).toISOString() },
];

// Fix: Added mockBackupJobs
export const mockBackupJobs: BackupJob[] = [
    { id: 'job-1', name: 'Daily DB Backups', resource: 'prod-db-01', schedule: 'Daily at 2:00 AM UTC', lastRunStatus: 'Success', lastRunDate: new Date(Date.now() - 86400000).toISOString() },
    { id: 'job-2', name: 'Weekly Web Server Snapshot', resource: 'prod-web-cluster', schedule: 'Weekly on Sunday at 4:00 AM UTC', lastRunStatus: 'Success', lastRunDate: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 'job-3', name: 'Staging Volume Backup', resource: 'vol-staging-data', schedule: 'Daily at 3:00 AM UTC', lastRunStatus: 'Failed', lastRunDate: new Date(Date.now() - 86400000).toISOString() },
];
