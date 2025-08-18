

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
            { author: 'Demo Customer Alpha', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), content: 'This is urgent, my website is down.' },
            { author: 'Support Staff', timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), content: 'We are looking into the issue and will update you shortly.' }
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
export const mockMailboxes: Mailbox[] = [
  { id: 'mbx_001', displayName: 'Johnathan Doe', login: 'john.doe@alpha-inc.com', mailboxPlan: 'Posta Pro', creationDate: '2023-01-15T10:00:00Z', driveQuota: { usedGB: 15.5, totalGB: 200 }, level: 'Normal', status: 'active' },
  { id: 'mbx_002', displayName: 'Jane Smith', login: 'jane.smith@alpha-inc.com', mailboxPlan: 'Posta Pro', creationDate: '2023-02-20T11:30:00Z', driveQuota: { usedGB: 185.2, totalGB: 200 }, level: 'Admin', status: 'active' },
  { id: 'mbx_003', displayName: 'Peter Jones', login: 'peter.jones@betadivision.net', mailboxPlan: 'Posta Business', creationDate: '2023-03-05T08:45:00Z', driveQuota: { usedGB: 80, totalGB: 100 }, level: 'Normal', status: 'active' },
  { id: 'mbx_004', displayName: 'Mary Williams', login: 'mary.w@alpha-inc.com', mailboxPlan: 'Posta Enterprise', creationDate: '2023-05-10T14:48:00Z', driveQuota: { usedGB: 512, totalGB: 1024 }, level: 'Normal', status: 'suspended' },
  { id: 'mbx_005', displayName: 'David Brown', login: 'david.brown@gamma-corp.io', mailboxPlan: 'Posta Light', creationDate: '2023-06-15T09:20:00Z', driveQuota: { usedGB: 2.1, totalGB: 10 }, level: 'Normal', status: 'active' },
  { id: 'mbx_006', displayName: 'Support Team', login: 'support@alpha-inc.com', mailboxPlan: 'Posta Business', creationDate: '2023-07-01T11:00:00Z', driveQuota: { usedGB: 5, totalGB: 100 }, level: 'Normal', status: 'active' },
  { id: 'mbx_007', displayName: 'Sales Department', login: 'sales@betadivision.net', mailboxPlan: 'Posta Business', creationDate: '2024-01-20T18:00:00Z', driveQuota: { usedGB: 95.8, totalGB: 100 }, level: 'Normal', status: 'active' },
  { id: 'mbx_008', displayName: 'Info Desk', login: 'info@gamma-corp.io', mailboxPlan: 'Posta Light', creationDate: '2024-02-11T12:30:00Z', driveQuota: { usedGB: 9.9, totalGB: 10 }, level: 'Normal', status: 'active' },
  { id: 'mbx_009', displayName: 'Tech Alerts', login: 'alerts@alpha-inc.com', mailboxPlan: 'Posta Light', creationDate: '2024-03-05T08:45:00Z', driveQuota: { usedGB: 1, totalGB: 10 }, level: 'Normal', status: 'suspended' },
  { id: 'mbx_010', displayName: 'Marketing Team', login: 'marketing@betadivision.net', mailboxPlan: 'Posta Pro', creationDate: '2024-04-10T16:00:00Z', driveQuota: { usedGB: 190, totalGB: 200 }, level: 'Normal', status: 'active' },
  { id: 'mbx_011', displayName: 'HR Department', login: 'hr@alpha-inc.com', mailboxPlan: 'Posta Enterprise', creationDate: '2024-05-15T09:00:00Z', driveQuota: { usedGB: 750, totalGB: 1024 }, level: 'Admin', status: 'active' },
  { id: 'mbx_012', displayName: 'CEO Office', login: 'ceo@alpha-inc.com', mailboxPlan: 'Posta Enterprise', creationDate: '2022-12-01T08:00:00Z', driveQuota: { usedGB: 25, totalGB: 1024 }, level: 'Admin', status: 'active' },
];

// --- MOCK DATA for DISTRIBUTION LISTS ---
export const mockDistributionLists: DistributionList[] = [
  { id: 'dl_001', displayName: 'All Employees', primaryEmail: 'all@alpha-inc.com', creationDate: '2023-02-01T10:00:00Z', managerEmail: 'admin@alpha-inc.com' },
  { id: 'dl_002', displayName: 'Marketing Department', primaryEmail: 'marketing@alpha-inc.com', creationDate: '2023-03-15T11:30:00Z', managerEmail: 'jane.smith@alpha-inc.com' },
  { id: 'dl_003', displayName: 'Sales Team US', primaryEmail: 'sales.us@betadivision.net', creationDate: '2023-05-20T08:45:00Z', managerEmail: 'sales.lead@betadivision.net' },
  { id: 'dl_004', displayName: 'Project Titan Members', primaryEmail: 'project.titan@alpha-inc.com', creationDate: '2023-08-10T14:48:00Z', managerEmail: 'project.manager@alpha-inc.com' },
  { id: 'dl_005', displayName: 'Executive Team', primaryEmail: 'exec@gamma-corp.io', creationDate: '2023-09-01T09:20:00Z', managerEmail: 'ceo@gamma-corp.io' },
  { id: 'dl_006', displayName: 'IT Support', primaryEmail: 'it.support@alpha-inc.com', creationDate: '2024-01-11T11:00:00Z', managerEmail: 'it.director@alpha-inc.com' },
  { id: 'dl_007', displayName: 'Announcements', primaryEmail: 'announce@betadivision.net', creationDate: '2024-02-22T18:00:00Z', managerEmail: 'hr@betadivision.net' },
];

// --- MOCK DATA for SHARED CONTACTS ---
export const mockSharedContacts: SharedContact[] = [
    { id: 'sc_001', displayName: 'External Auditor', email: 'auditor@externalfirm.com', creationDate: '2023-04-10T10:00:00Z' },
    { id: 'sc_002', displayName: 'Legal Counsel', email: 'legal@lawoffice.com', creationDate: '2023-05-22T11:30:00Z' },
    { id: 'sc_003', displayName: 'Catering Service', email: 'orders@bestcatering.net', creationDate: '2023-06-15T08:45:00Z' },
    { id: 'sc_004', displayName: 'Building Security', email: 'security@buildingmgmt.com', creationDate: '2023-08-01T14:48:00Z' },
    { id: 'sc_005', displayName: 'IT Support (Vendor)', email: 'support@itvendor.io', creationDate: '2024-01-05T09:20:00Z' },
    { id: 'sc_006', displayName: 'Office Supplies', email: 'supplies@officeshop.com', creationDate: '2024-02-11T12:30:00Z' },
    { id: 'sc_007', displayName: 'Travel Agency', email: 'bookings@globaltravel.co', creationDate: '2024-03-20T18:00:00Z' },
];

// --- MOCK DATA FOR RULES ---
export const mockRules: Rule[] = [
  { id: 'rule1', name: 'anameischanged:frtt', description: 'Forward all incoming mail from user@domain.com to admin@domain.com.', status: 'enabled', creationDate: '2023-01-15T10:00:00Z', lastModified: '2023-01-15T10:00:00Z' },
  { id: 'rule2', name: 'anameischanged:test rule', description: 'Reject emails with "spam" in the subject line.', status: 'enabled', creationDate: '2023-02-20T11:30:00Z', lastModified: '2023-05-10T14:48:00Z' },
  { id: 'rule3', name: 'anameischanged:aign', description: 'Quarantine attachments with .exe or .zip extensions.', status: 'disabled', creationDate: '2023-03-05T08:45:00Z', lastModified: '2023-06-15T09:20:00Z' },
  { id: 'rule4', name: 'anameischanged:test', description: 'Add a prefix "[EXTERNAL]" to all emails from outside the organization.', status: 'enabled', creationDate: '2023-03-10T11:00:00Z', lastModified: '2023-07-01T11:00:00Z' },
  { id: 'rule5', name: 'anameischanged:foward', description: 'Redirect emails for "sales@domain.com" to the sales team distribution list.', status: 'enabled', creationDate: '2023-04-01T12:00:00Z', lastModified: '2023-04-01T12:00:00Z' },
  { id: 'rule6', name: 'anameischanged:re', description: 'Block emails from a specific competitor domain.', status: 'disabled', creationDate: '2023-05-20T18:00:00Z', lastModified: '2023-08-10T16:00:00Z' },
];

export const mockPstLogs: PstLogEntry[] = [
  { id: 'pst1', email: 'Update Mailbox', createdBy: 'anameischanged', createdAt: '2025-08-07T13:03:00Z', type: 'Export', status: 'Completed' },
  { id: 'pst2', email: 'anameischanged.info', createdBy: 'Ola Aldaoshy', createdAt: '2025-08-06T11:27:00Z', type: 'Export', status: 'Completed' },
  { id: 'pst3', email: 'anameischanged.info', createdBy: 'anameischanged', createdAt: '2025-05-12T12:02:00Z', type: 'Import', status: 'Completed' },
  { id: 'pst4', email: 'Update Mailbox', createdBy: 'szidane@roaya.co', createdAt: '2025-04-09T14:09:00Z', type: 'Export', status: 'Failed' },
  { id: 'pst5', email: 'Update Mailbox', createdBy: 'anameischanged', createdAt: '2025-03-19T09:01:00Z', type: 'Export', status: 'In Progress' },
  { id: 'pst6', email: 'update mail box', createdBy: 'anameischanged', createdAt: '2025-02-23T13:48:00Z', type: 'Export', status: 'Completed' },
  { id: 'pst7', email: 'anameischanged.info', createdBy: 'test@res.coma4dbe237-8f9d-4de2-968f-24006b36d890', createdAt: '2025-02-17T12:26:00Z', type: 'Export', status: 'Completed' },
  { id: 'pst8', email: 'anameischanged.info', createdBy: 'mali', createdAt: '2025-02-10T15:21:00Z', type: 'Export', status: 'Completed' },
  { id: 'pst9', email: 'anameischanged.info', createdBy: 'anameischanged', createdAt: '2025-02-04T13:20:00Z', type: 'Import', status: 'Completed' },
  { id: 'pst10', email: 'anameischanged.info', createdBy: 'anameischanged', createdAt: '2025-01-12T08:50:00Z', type: 'Export', status: 'Completed' },
  { id: 'pst11', email: 'anameischanged.info', createdBy: 'anameischanged', createdAt: '2025-01-12T08:47:00Z', type: 'Export', status: 'Completed' },
  { id: 'pst12', email: 'anameischanged.info', createdBy: 'anameischanged', createdAt: '2024-12-23T13:22:00Z', type: 'Export', status: 'Pending' },
  { id: 'pst13', email: 'anameischanged.info', createdBy: 'anameischanged', createdAt: '2024-10-24T15:33:00Z', type: 'Export', status: 'Completed' },
  { id: 'pst14', email: 'anameischanged.info', createdBy: 'anameischanged', createdAt: '2024-09-25T12:42:00Z', type: 'Export', status: 'Completed' },
  { id: 'pst15', email: 'anameischanged.info', createdBy: 'mali', createdAt: '2024-09-24T14:21:00Z', type: 'Export', status: 'Completed' },
  { id: 'pst16', email: 'update mail box', createdBy: 'mali', createdAt: '2024-09-24T12:28:00Z', type: 'Export', status: 'Completed' },
  { id: 'pst17', email: 'anameischanged.info', createdBy: 'mali', createdAt: '2024-09-23T11:36:00Z', type: 'Export', status: 'Completed' },
];

export const mockRunningTasks: RunningTask[] = [
    { id: 'rt1', status: 'Finish', type: 'Bulk reset Passwords', total: 2, failed: 0, done: 2, createdBy: 'Mohamed Ali', createdAt: '2025-06-11T00:00:00Z' },
    { id: 'rt2', status: 'Finish', type: 'Bulk Update Mailboxes Alias', total: 2, failed: 0, done: 2, createdBy: 'Mohamed Ali', createdAt: '2025-05-05T00:00:00Z' },
    { id: 'rt3', status: 'Finish', type: 'Bulk Update Mailboxes Alias', total: 2, failed: 0, done: 2, createdBy: 'Mohamed Ali', createdAt: '2025-05-05T00:00:00Z' },
    { id: 'rt4', status: 'Finish', type: 'Create Mailbox', total: 2, failed: 2, done: 0, createdBy: 'Sara Khalil', createdAt: '2024-12-02T00:00:00Z' },
    { id: 'rt5', status: 'New', type: 'Update Mailbox', total: 1, failed: 0, done: 0, createdBy: 'Developer Admin', createdAt: '2023-10-14T00:00:00Z' },
    { id: 'rt6', status: 'New', type: 'Update Mailbox', total: 1, failed: 0, done: 0, createdBy: 'wp wp', createdAt: '2023-10-14T00:00:00Z' },
    { id: 'rt7', status: 'Finish', type: 'Add Bulk Member', total: 1, failed: 0, done: 1, createdBy: 'Admin User', createdAt: '2023-03-19T00:00:00Z' },
    { id: 'rt8', status: 'In Progress', type: 'Add Bulk Member', total: 1, failed: 0, done: 17, createdBy: 'Admin User', createdAt: '2023-03-19T00:00:00Z' },
    { id: 'rt9', status: 'In Progress', type: 'Add Bulk Member', total: 1, failed: 0, done: 6, createdBy: 'Admin User', createdAt: '2023-03-19T00:00:00Z' },
    { id: 'rt10', status: 'Finish', type: 'Create Mailbox', total: 2, failed: 1, done: 1, createdBy: 'Admin User', createdAt: '2023-01-28T00:00:00Z' },
    { id: 'rt11', status: 'In Progress', type: 'Create Mailbox', total: 2, failed: 0, done: 1, createdBy: 'Admin User', createdAt: '2023-01-28T00:00:00Z' },
    { id: 'rt12', status: 'Finish', type: 'Create Mailbox', total: 2, failed: 0, done: 2, createdBy: 'Admin User', createdAt: '2022-04-10T00:00:00Z' },
    { id: 'rt13', status: 'Finish', type: 'Create Mailbox', total: 1, failed: 1, done: 0, createdBy: 'Admin User', createdAt: '2021-01-14T00:00:00Z' },
    { id: 'rt14', status: 'Finish', type: 'Create Mailbox', total: 1, failed: 0, done: 1, createdBy: 'Admin User', createdAt: '2021-01-14T00:00:00Z' },
    { id: 'rt15', status: 'Finish', type: 'Create Mailbox', total: 3, failed: 1, done: 2, createdBy: 'wp wp', createdAt: '2019-12-16T00:00:00Z' },
    { id: 'rt16', status: 'In Progress', type: 'Create Mailbox', total: 3, failed: 0, done: 1, createdBy: 'Admin User', createdAt: '2023-01-28T00:00:00Z' },
    { id: 'rt17', status: 'New', type: 'Bulk reset Passwords', total: 10, failed: 0, done: 0, createdBy: 'Mohamed Ali', createdAt: '2025-07-01T00:00:00Z' },
    { id: 'rt18', status: 'Finish', type: 'Add Bulk Member', total: 5, failed: 0, done: 5, createdBy: 'Admin User', createdAt: '2023-04-01T00:00:00Z' },
    { id: 'rt19', status: 'In Progress', type: 'Update Mailbox', total: 50, failed: 2, done: 25, createdBy: 'Sara Khalil', createdAt: '2024-11-15T00:00:00Z' },
    { id: 'rt20', status: 'Finish', type: 'Create Mailbox', total: 100, failed: 5, done: 95, createdBy: 'Developer Admin', createdAt: '2023-09-01T00:00:00Z' },
    { id: 'rt21', status: 'New', type: 'Bulk Update Mailboxes Alias', total: 20, failed: 0, done: 0, createdBy: 'wp wp', createdAt: '2023-11-20T00:00:00Z' },
];

// --- NEW MOCK DATA for PRODUCTS ---
export const mockKubernetesClusters: KubernetesCluster[] = [
  { id: 'k8s-prod-1', name: 'production-cluster', version: '1.28.3', status: 'Running', nodeCount: 5, region: 'US East (N. Virginia)', creationDate: '2024-07-15T10:00:00Z' },
  { id: 'k8s-dev-1', name: 'development-sandbox', version: '1.27.5', status: 'Running', nodeCount: 2, region: 'EU (Frankfurt)', creationDate: '2024-06-20T14:30:00Z' },
  { id: 'k8s-staging-1', name: 'staging-cluster', version: '1.28.3', status: 'Creating', nodeCount: 3, region: 'US West (Oregon)', creationDate: new Date().toISOString() },
  { id: 'k8s-legacy-1', name: 'legacy-app-support', version: '1.25.10', status: 'Stopped', nodeCount: 1, region: 'US East (N. Virginia)', creationDate: '2023-11-01T08:00:00Z' },
];

export const mockLoadBalancers: LoadBalancer[] = [
  { id: 'lb-1', name: 'main-web-app-lb', type: 'L7 Application', status: 'Active', ipAddress: '203.0.113.10' },
  { id: 'lb-2', name: 'internal-services-lb', type: 'L4 Network', status: 'Active', ipAddress: '10.0.5.25' },
  { id: 'lb-3', name: 'new-api-gateway-lb', type: 'L7 Application', status: 'Building', ipAddress: 'Pending...' },
];

export const mockFirewallRules: FirewallRule[] = [
  { id: 'fw-1', policyName: 'allow-https', direction: 'Inbound', protocol: 'TCP', portRange: '443', source: '0.0.0.0/0', action: 'Allow' },
  { id: 'fw-2', policyName: 'allow-ssh-admin', direction: 'Inbound', protocol: 'TCP', portRange: '22', source: '73.22.19.101/32', action: 'Allow' },
  { id: 'fw-3', policyName: 'deny-all-outbound', direction: 'Outbound', protocol: 'TCP', portRange: '*', source: '*', action: 'Deny' },
  { id: 'fw-4', policyName: 'allow-icmp', direction: 'Inbound', protocol: 'ICMP', portRange: 'any', source: '0.0.0.0/0', action: 'Allow' },
];

export const mockStorageBuckets: StorageBucket[] = [
  { id: 'sb-1', name: 'app-assets-prod', region: 'US East (N. Virginia)', sizeGB: 1250, creationDate: '2024-01-10T11:00:00Z' },
  { id: 'sb-2', name: 'user-uploads-staging', region: 'EU (Frankfurt)', sizeGB: 320, creationDate: '2024-05-02T18:45:00Z' },
  { id: 'sb-3', name: 'database-backups', region: 'US West (Oregon)', sizeGB: 5800, creationDate: '2023-09-15T05:00:00Z' },
];

export const mockSecurityAlerts: SecurityAlert[] = [
  { id: 'sa-1', severity: 'Critical', description: 'Potential SQL Injection attempt detected on prod-db-01.', resource: 'prod-db-01', timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString() },
  { id: 'sa-2', severity: 'High', description: 'Unusual login pattern detected for user admin@alpha.inc.', resource: 'Authentication Service', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'sa-3', severity: 'Medium', description: 'Port scan detected from IP 198.51.100.45.', resource: 'main-web-app-lb', timestamp: new Date(Date.now() - 3600000 * 6).toISOString() },
  { id: 'sa-4', severity: 'Low', description: 'Legacy TLS version 1.1 used to connect to internal-api.', resource: 'internal-api', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() },
];

export const mockBackupJobs: BackupJob[] = [
  { id: 'bj-1', name: 'daily-prod-db-backup', resource: 'prod-db-01', schedule: 'Daily at 2:00 AM UTC', lastRunStatus: 'Success', lastRunDate: new Date(Date.now() - 86400000).toISOString() },
  { id: 'bj-2', name: 'weekly-web-server-snapshot', resource: 'prod-web-cluster', schedule: 'Weekly on Sunday at 4:00 AM UTC', lastRunStatus: 'Success', lastRunDate: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'bj-3', name: 'archive-storage-bucket-sync', resource: 'app-assets-prod', schedule: 'Monthly on the 1st', lastRunStatus: 'In Progress', lastRunDate: new Date().toISOString() },
  { id: 'bj-4', name: 'dev-vm-backup', resource: 'dev-sandbox-vm', schedule: 'Daily at 5:00 AM UTC', lastRunStatus: 'Failed', lastRunDate: new Date(Date.now() - 86400000).toISOString() },
];