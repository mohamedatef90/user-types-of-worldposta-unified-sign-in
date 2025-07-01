


export interface User {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  role: 'customer' | 'admin' | 'reseller'; // Added role
  displayName?: string;
  phoneNumber?: string;
  avatarUrl?: string; // URL to placeholder image
  teamManagerId?: string; // ID of the primary customer managing this user
  assignedGroupId?: string; // ID of the UserGroup this user belongs to
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Array of permission key strings
  teamManagerId: string; // ID of the customer who owns/manages this group
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (details: Omit<User, 'id' | 'avatarUrl' | 'displayName' | 'phoneNumber' | 'role' | 'teamManagerId' | 'assignedGroupId'> & {password: string}) => Promise<void>;
  logout: () => void;
  updateProfile: (details: Partial<Pick<User, 'fullName' | 'companyName' | 'displayName' | 'phoneNumber'>>) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
}

export interface NavItem {
  name: string;
  path: string;
  iconName?: string; // For Font Awesome class
  iconUrl?: string;  // For image URL
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SECURITY = 'security', 
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: Date;
}

export interface ProductPortal {
  id: string;
  name: string;
  description: string;
  iconBgColor: string;
  url: string; // Could be external or internal path
}

// Data for the Floating App Launcher and Dashboard Cards
export interface ApplicationCardData {
  id:string;
  name: string;
  description: string;
  iconName: string; 
  launchUrl: string;
}

// Types for Email Admin Subscription Management
export interface EmailPlanFeature {
  id: string;
  name: string;
  included: boolean; // Or could be a string describing the limit
}

export type EmailPlanDuration = 'monthly' | '3months' | '6months' | 'yearly';

export interface EmailPlan {
  id: string;
  name: string;
  basePriceMonthly: number; // Price for monthly, other durations will be calculated
  features: string[];
  description?: string;
}

export interface EmailCartItem {
  plan: EmailPlan;
  quantity: number;
  duration: EmailPlanDuration;
  advancedRulesEnabled: boolean;
  calculatedPrice: number;
}

// Types for CloudEdge Configuration Management
export type CloudEdgeComponentType = 'instance' | 'vdc' | 'ready-plan';
export type SubscriptionTermUnit = 'hr' | 'week' | 'month' | 'year';
export type MachineType = 'performance-01' | 'performance-02' | 'performance-03';
export type ProvisioningModel = 'regular' | 'spot';

export interface InstanceTemplate {
  id: string;
  name: string;
  cpu: number;
  ramGB: number;
  bootDiskGB: number;
  priceMonthly: number; // Optional: if templates have fixed prices
  description: string; // e.g., "2 vCPU / 4 GB RAM / 50 GB Boot Disk"
}

export interface GPUType {
  id: string;
  name: string;
  priceMonthly: number;
}

export interface CloudEdgeConfiguration {
  id: string; // Unique ID for this configuration item
  name: string;
  type: CloudEdgeComponentType;
  deploymentRegion: string;
  subscriptionTermValue: number;
  subscriptionTermUnit: SubscriptionTermUnit;
  machineType?: MachineType; // For instance
  quantity: number;
  
  // Instance specific
  instanceTemplateId?: string;
  
  // VDC specific
  vdcCPU?: number;         // cores
  vdcRAM?: number;         // GB
  vdcFlashStorage?: number; // GB
  
  // Ready Plan specific
  readyPlanId?: string;
    
  // Advanced & Optional
  osSoftware?: string;
  provisioningModel?: ProvisioningModel;
  confidentialVM?: boolean;
  addGPUs?: boolean;
  gpuType?: string;
  gpuCount?: number;

  // Other Configurable Resources
  staticPublicIPs?: number;
  objectStorageGB?: number; // GB
  advancedBackupGB?: number; // GB
  trendMicroEndpoints?: number;
  windowsServerLicenses?: number;
  linuxEnterpriseLicenses?: number;
  cortexXDREndpoints?: number;
  loadBalancerInstances?: number;
  
  // Add-ons (Monthly)
  advancedFirewall?: boolean;
  enhancedMonitoring?: boolean;

  unitSubtotalMonthly: number; // Calculated subtotal for this configuration item
}

export interface StepperStep {
  name: string;
  status?: 'completed' | 'current' | 'upcoming'; // Optional: for visual indication
}

// New type for ticket attachments
export interface TicketAttachment {
  name: string;
  type: string;
  size: number;
  dataUrl: string; // base64 representation
}

// New type for comments
export interface SupportTicketComment {
  author: string; // e.g., 'Customer Name', 'Support Staff'
  timestamp: string; // ISO String
  content: string;
  attachments?: TicketAttachment[];
}

// Type for Support Tickets
export interface SupportTicket {
  id: string; // e.g., 'TKT-12345'
  subject: string;
  product: 'CloudEdge' | 'Posta Email' | 'Subscriptions' | 'General Inquiry';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  lastUpdate: string; // ISO String
  description: string; 
  attachments?: TicketAttachment[];
  customerId?: string; // ID of the customer who opened the ticket
  customerName?: string; // Name of the customer for display
  comments?: SupportTicketComment[];
}


// Type for Action Logs
export interface LogEntry {
  id:string;
  timestamp: string; // ISO string format for date and time
  action: string; // Description of the action performed
  resource: string; // Identifier for the resource affected (e.g., VM name, Mailbox ID, Domain)
  performedBy: string; // User ID/email or 'System' if automated
  status: 'Success' | 'Failed' | 'Pending User Action' | 'Pending System Action' | 'Information' | 'Warning'; // Status of the action
  details?: string; // Optional additional details or error messages
}