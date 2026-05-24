import { User } from '../../../types';

export interface Package {
  id: string;
  name: string;
  product: 'cloudedge' | 'postagate';
  billingMode: 'subscription' | 'payg';
  price: number; // in USD
  currency: string;
  billingCycle: '1m' | '3m' | '6m' | '1y' | '3y' | '5y' | null;
  trialDays: number | null;
  isComplimentary: boolean;
  features: string[];
  status: 'active' | 'archived' | 'deleted';
  createdAt: string;
  effectiveDate: string;
}

export interface SubscriptionAddOn {
  id: string;
  name: string;
  price: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired';
}

export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  packageId: string;
  packageName: string;
  product: 'cloudedge' | 'postagate';
  status: 'active' | 'trial' | 'suspended' | 'expired' | 'pending' | 'cancelled';
  billingMode: 'subscription' | 'payg';
  startDate: string;
  currentCycleStart: string;
  currentCycleEnd: string;
  trialEndsAt: string | null;
  price: number;
  isComplimentary: boolean;
  addOns: SubscriptionAddOn[];
  createdAt: string;
  suspendedAt: string | null;
  expiredAt: string | null;
  lastModifiedAt: string;
  lastModifiedBy: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  subscriptionId: string;
  status: 'paid' | 'unpaid' | 'overdue' | 'voided' | 'refunded';
  billingMode: 'subscription' | 'payg';
  issueDate: string;
  dueDate: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  stripeChargeId: string | null;
  isSuspended: boolean; // bypass dunning
  lineItems: InvoiceLineItem[];
  refundReason?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: 'subscription' | 'invoice' | 'package' | 'addon';
  entityId: string;
  metadata: any;
  reason: string | null;
  timestamp: string;
}

// Keys for localStorage
const PACKAGES_KEY = 'wp_billing_packages';
const SUBS_KEY = 'wp_billing_subscriptions';
const INVOICES_KEY = 'wp_billing_invoices';
const AUDIT_KEY = 'wp_billing_audit_logs';

// Initial Mock data matching the product descriptions
const INITIAL_PACKAGES: Package[] = [
  {
    id: 'pkg-ce-pro',
    name: 'CloudEdge Pro 50GB',
    product: 'cloudedge',
    billingMode: 'subscription',
    price: 89.00,
    currency: 'USD',
    billingCycle: '1m',
    trialDays: 14,
    isComplimentary: false,
    features: ['50GB NVMe Disk', '4 vCPU Cores', '8GB Optimized RAM', '1 Gbps Port'],
    status: 'active',
    createdAt: '2026-01-10T12:00:00Z',
    effectiveDate: '2026-01-15T00:00:00Z',
  },
  {
    id: 'pkg-pg-adv',
    name: 'Postagate Advanced',
    product: 'postagate',
    billingMode: 'subscription',
    price: 125.00,
    currency: 'USD',
    billingCycle: '1m',
    trialDays: 30,
    isComplimentary: false,
    features: ['Unlimited Mailboxes', 'Anti-Spam Filter Engine', 'DKIM/SPF Signing UI', 'TLS Security Suite'],
    status: 'active',
    createdAt: '2026-01-11T12:00:00Z',
    effectiveDate: '2026-01-20T00:00:00Z',
  },
  {
    id: 'pkg-ce-payg',
    name: 'Flexible Instances (PAYG)',
    product: 'cloudedge',
    billingMode: 'payg',
    price: 0,
    currency: 'USD',
    billingCycle: null,
    trialDays: null,
    isComplimentary: false,
    features: ['On-Demand CPU Tiers', 'Metered Storage & Network', 'Live Sizing Modifiers', 'GPU Optional Slices'],
    status: 'active',
    createdAt: '2026-01-12T12:00:00Z',
    effectiveDate: '2026-01-25T00:00:00Z',
  },
  {
    id: 'pkg-pg-ent',
    name: 'Postagate Enterprise Mail',
    product: 'postagate',
    billingMode: 'subscription',
    price: 450.00,
    currency: 'USD',
    billingCycle: '1y',
    trialDays: null,
    isComplimentary: false,
    features: ['Dedicated Virtual IP Routing', 'Full Log Search Archiving', 'Enterprise Level 24/7 SLA', 'Data Vault Policies'],
    status: 'active',
    createdAt: '2026-01-14T12:00:00Z',
    effectiveDate: '2026-02-01T00:00:00Z',
  }
];

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-001',
    customerId: 'cust-acme',
    customerName: 'Acme Corp',
    customerEmail: 'customer@worldposta.com',
    packageId: 'pkg-ce-pro',
    packageName: 'CloudEdge Pro 50GB',
    product: 'cloudedge',
    status: 'active',
    billingMode: 'subscription',
    startDate: '2026-02-01T00:00:00Z',
    currentCycleStart: '2026-05-01T00:00:00Z',
    currentCycleEnd: '2026-06-01T00:00:00Z',
    trialEndsAt: null,
    price: 89.00,
    isComplimentary: false,
    addOns: [
      { id: 'add-optip', name: 'Static Public IP Slice', price: 10.00, startDate: '2026-02-01', endDate: '2026-06-01', status: 'active' }
    ],
    createdAt: '2026-02-01T00:00:00Z',
    suspendedAt: null,
    expiredAt: null,
    lastModifiedAt: '2026-05-01T10:00:00Z',
    lastModifiedBy: 'm.atefm20@gmail.com'
  },
  {
    id: 'sub-002',
    customerId: 'cust-startup',
    customerName: 'Startup Inc',
    customerEmail: 'startup@inc.com',
    packageId: 'pkg-pg-adv',
    packageName: 'Postagate Advanced',
    product: 'postagate',
    status: 'active',
    billingMode: 'subscription',
    startDate: '2026-03-15T00:00:00Z',
    currentCycleStart: '2026-05-15T00:00:00Z',
    currentCycleEnd: '2026-06-15T00:00:00Z',
    trialEndsAt: null,
    price: 125.00,
    isComplimentary: false,
    addOns: [],
    createdAt: '2026-03-15T00:00:00Z',
    suspendedAt: null,
    expiredAt: null,
    lastModifiedAt: '2026-05-15T12:00:00Z',
    lastModifiedBy: 'm.atefm20@gmail.com'
  },
  {
    id: 'sub-003',
    customerId: 'cust-devstudios',
    customerName: 'Dev Studios',
    customerEmail: 'dev@studios.com',
    packageId: 'pkg-ce-payg',
    packageName: 'Flexible Instances (PAYG)',
    product: 'cloudedge',
    status: 'suspended',
    billingMode: 'payg',
    startDate: '2026-01-20T00:00:00Z',
    currentCycleStart: '2026-05-01T00:00:00Z',
    currentCycleEnd: '2026-06-01T00:00:00Z',
    trialEndsAt: null,
    price: 120.00, // Accumulated metered dues
    isComplimentary: false,
    addOns: [],
    createdAt: '2026-01-20T00:00:00Z',
    suspendedAt: '2026-05-10T09:00:00Z',
    expiredAt: null,
    lastModifiedAt: '2026-05-10T09:00:00Z',
    lastModifiedBy: 'm.atefm20@gmail.com'
  },
  {
    id: 'sub-004',
    customerId: 'cust-atef',
    customerName: 'Atef Holdings Ltd',
    customerEmail: 'm.atefm20@gmail.com',
    packageId: 'pkg-pg-ent',
    packageName: 'Postagate Enterprise Mail',
    product: 'postagate',
    status: 'expired',
    billingMode: 'subscription',
    startDate: '2026-01-01T00:00:00Z',
    currentCycleStart: '2026-01-01T00:00:00Z',
    currentCycleEnd: '2026-05-01T00:00:00Z',
    trialEndsAt: null,
    price: 450.00,
    isComplimentary: false,
    addOns: [],
    createdAt: '2026-01-01T00:00:00Z',
    suspendedAt: null,
    expiredAt: '2026-05-08T00:00:00Z',
    lastModifiedAt: '2026-05-08T00:00:00Z',
    lastModifiedBy: 'system'
  }
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-acme-01',
    invoiceNumber: 'WP-2026-0001',
    customerId: 'cust-acme',
    customerName: 'Acme Corp',
    customerEmail: 'customer@worldposta.com',
    subscriptionId: 'sub-001',
    status: 'paid',
    billingMode: 'subscription',
    issueDate: '2026-05-01',
    dueDate: '2026-05-15',
    billingPeriodStart: '2026-05-01',
    billingPeriodEnd: '2026-06-01',
    subtotal: 99.00,
    tax: 0.00,
    discount: 0.00,
    totalAmount: 99.00,
    stripeChargeId: 'ch_stripe_pay987',
    isSuspended: false,
    lineItems: [
      { description: 'CloudEdge Pro 50GB Base Fee', quantity: 1, unitPrice: 89.00, subtotal: 89.00 },
      { description: 'Static Public IP Slice Addon', quantity: 1, unitPrice: 10.00, subtotal: 10.00 }
    ],
    createdAt: '2026-05-01T00:01:00Z'
  },
  {
    id: 'inv-dev-02',
    invoiceNumber: 'WP-2026-0002',
    customerId: 'cust-devstudios',
    customerName: 'Dev Studios',
    customerEmail: 'dev@studios.com',
    subscriptionId: 'sub-003',
    status: 'overdue',
    billingMode: 'payg',
    issueDate: '2026-05-01',
    dueDate: '2026-05-08',
    billingPeriodStart: '2026-04-01',
    billingPeriodEnd: '2026-05-01',
    subtotal: 120.00,
    tax: 0.00,
    discount: 0.00,
    totalAmount: 120.00,
    stripeChargeId: null,
    isSuspended: false,
    lineItems: [
      { description: 'Flexible Instances On-Demand Compute Hours', quantity: 2400, unitPrice: 0.05, subtotal: 120.00 }
    ],
    createdAt: '2026-05-01T00:05:00Z'
  },
  {
    id: 'inv-startup-03',
    invoiceNumber: 'WP-2026-0003',
    customerId: 'cust-startup',
    customerName: 'Startup Inc',
    customerEmail: 'startup@inc.com',
    subscriptionId: 'sub-002',
    status: 'paid',
    billingMode: 'subscription',
    issueDate: '2026-05-15',
    dueDate: '2026-05-29',
    billingPeriodStart: '2026-05-15',
    billingPeriodEnd: '2026-06-15',
    subtotal: 125.00,
    tax: 0.00,
    discount: 0.00,
    totalAmount: 125.00,
    stripeChargeId: 'ch_stripe_pay456',
    isSuspended: false,
    lineItems: [
      { description: 'Postagate Advanced Subscription Core Engine', quantity: 1, unitPrice: 125.00, subtotal: 125.00 }
    ],
    createdAt: '2026-05-15T00:01:00Z'
  },
  {
    id: 'inv-atef-04',
    invoiceNumber: 'WP-2026-0004',
    customerId: 'cust-atef',
    customerName: 'Atef Holdings Ltd',
    customerEmail: 'm.atefm20@gmail.com',
    subscriptionId: 'sub-004',
    status: 'unpaid',
    billingMode: 'subscription',
    issueDate: '2026-05-01',
    dueDate: '2026-05-15',
    billingPeriodStart: '2026-01-01',
    billingPeriodEnd: '2026-05-01',
    subtotal: 450.00,
    tax: 0.00,
    discount: 0.00,
    totalAmount: 450.00,
    stripeChargeId: null,
    isSuspended: false,
    lineItems: [
      { description: 'Postagate Enterprise Mail Annual Allocation', quantity: 1, unitPrice: 450.00, subtotal: 450.00 }
    ],
    createdAt: '2026-05-01T00:10:00Z'
  }
];

const INITIAL_AUDITS: AuditLog[] = [
  {
    id: 'aud-001',
    actorEmail: 'system',
    actorRole: 'System Cron',
    action: 'sub.expired',
    entityType: 'subscription',
    entityId: 'sub-004',
    metadata: { before: 'active', after: 'expired' },
    reason: 'Grace period threshold crossed (Invoice WP-2026-0004 unresolved after 7 days)',
    timestamp: '2026-05-08T00:00:00Z'
  },
  {
    id: 'aud-002',
    actorEmail: 'm.atefm20@gmail.com',
    actorRole: 'super_admin',
    action: 'sub.suspended',
    entityType: 'subscription',
    entityId: 'sub-003',
    metadata: { before: 'active', after: 'suspended' },
    reason: 'Unpaid collection follow up on aging PAYG',
    timestamp: '2026-05-10T09:00:00Z'
  }
];

// Local state class
class BillingStore {
  private getStorageItem<T>(key: string, initial: T): T {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : initial;
    } catch {
      return initial;
    }
  }

  private setStorageItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage write failed:', e);
    }
  }

  // Packages API
  getPackages(): Package[] {
    return this.getStorageItem<Package[]>(PACKAGES_KEY, INITIAL_PACKAGES);
  }

  savePackages(packages: Package[]) {
    this.setStorageItem(PACKAGES_KEY, packages);
  }

  createPackage(pkg: Omit<Package, 'id' | 'createdAt' | 'status'>, actor: string): Package {
    const packages = this.getPackages();
    const newPkg: Package = {
      ...pkg,
      id: `pkg-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    packages.unshift(newPkg);
    this.savePackages(packages);

    this.logAction(
      actor,
      'super_admin',
      'package.created',
      'package',
      newPkg.id,
      { title: newPkg.name, price: newPkg.price },
      'New Package Definition Created'
    );
    return newPkg;
  }

  archivePackage(id: string, actor: string) {
    const packages = this.getPackages();
    const pkg = packages.find(p => p.id === id);
    if (pkg) {
      pkg.status = 'archived';
      this.savePackages(packages);
      this.logAction(
        actor,
        'super_admin',
        'package.archived',
        'package',
        id,
        { before: 'active', after: 'archived' },
        'Package archived from active catalogues'
      );
    }
  }

  deletePackage(id: string, actor: string) {
    const packages = this.getPackages();
    const index = packages.findIndex(p => p.id === id);
    if (index !== -1) {
      const deleted = packages.splice(index, 1);
      this.savePackages(packages);
      this.logAction(
        actor,
        'super_admin',
        'package.deleted',
        'package',
        id,
        null,
        `Package ${deleted[0].name} deleted`
      );
    }
  }

  modifyPackage(id: string, pkgData: Partial<Omit<Package, 'id' | 'createdAt' | 'status'>>, actor: string) {
    const packages = this.getPackages();
    const pkg = packages.find(p => p.id === id);
    if (pkg) {
      const updatedPkg = { ...pkg, ...pkgData };
      const index = packages.findIndex(p => p.id === id);
      packages[index] = updatedPkg;
      this.savePackages(packages);
      this.logAction(
        actor,
        'super_admin',
        'package.modified',
        'package',
        id,
        { before: pkg, after: updatedPkg },
        'Package details modified'
      );
      return updatedPkg;
    }
  }

  // Subscriptions API
  getSubscriptions(): Subscription[] {
    return this.getStorageItem<Subscription[]>(SUBS_KEY, INITIAL_SUBSCRIPTIONS);
  }

  saveSubscriptions(subs: Subscription[]) {
    this.setStorageItem(SUBS_KEY, subs);
  }

  assignSubscription(sub: Omit<Subscription, 'id' | 'createdAt' | 'lastModifiedAt' | 'lastModifiedBy' | 'addOns' | 'suspendedAt' | 'expiredAt'>, actor: string): Subscription {
    const subs = this.getSubscriptions();
    const newSub: Subscription = {
      ...sub,
      id: `sub-${Date.now().toString().slice(-4)}`,
      addOns: [],
      createdAt: new Date().toISOString(),
      suspendedAt: null,
      expiredAt: null,
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: actor
    };
    subs.unshift(newSub);
    this.saveSubscriptions(subs);

    // Auto-create initial invoice for non-complimentary
    if (!newSub.isComplimentary && newSub.price > 0) {
      this.createInvoiceFromSubscription(newSub);
    }

    this.logAction(
      actor,
      'super_admin',
      'sub.created',
      'subscription',
      newSub.id,
      { company: newSub.customerName, plan: newSub.packageName },
      'Direct Administration Subscription Assignment'
    );
    return newSub;
  }

  modifySubscriptionStatus(id: string, status: Subscription['status'], reason: string, actor: string) {
    const subs = this.getSubscriptions();
    const sub = subs.find(s => s.id === id);
    if (sub) {
      const before = sub.status;
      sub.status = status;
      sub.lastModifiedAt = new Date().toISOString();
      sub.lastModifiedBy = actor;

      if (status === 'suspended') {
        sub.suspendedAt = new Date().toISOString();
      } else if (status === 'expired') {
        sub.expiredAt = new Date().toISOString();
      } else if (status === 'active') {
        sub.suspendedAt = null;
        sub.expiredAt = null;
      }

      this.saveSubscriptions(subs);
      this.logAction(
        actor,
        'super_admin',
        `sub.${status}`,
        'subscription',
        id,
        { before, after: status },
        reason
      );
    }
  }

  extendSubscription(id: string, extensionDays: number, reason: string, actor: string) {
    const subs = this.getSubscriptions();
    const sub = subs.find(s => s.id === id);
    if (sub) {
      const beforeDate = sub.currentCycleEnd;
      const currentEnd = new Date(sub.currentCycleEnd);
      currentEnd.setDate(currentEnd.getDate() + extensionDays);
      sub.currentCycleEnd = currentEnd.toISOString();
      sub.lastModifiedAt = new Date().toISOString();
      sub.lastModifiedBy = actor;

      // Also restore to active if expired or suspended temporarily
      if (sub.status === 'expired') {
        sub.status = 'active';
        sub.expiredAt = null;
      }

      this.saveSubscriptions(subs);
      this.logAction(
        actor,
        'super_admin',
        'sub.extended',
        'subscription',
        id,
        { before: beforeDate, after: sub.currentCycleEnd, addedDays: extensionDays },
        reason
      );
    }
  }

  upgradeSubscription(id: string, newPackage: Package, reason: string, actor: string) {
    const subs = this.getSubscriptions();
    const sub = subs.find(s => s.id === id);
    if (sub) {
      const beforePlan = sub.packageName;
      const beforePrice = sub.price;

      sub.packageId = newPackage.id;
      sub.packageName = newPackage.name;
      sub.price = newPackage.price;
      sub.product = newPackage.product;
      sub.billingMode = newPackage.billingMode;
      sub.lastModifiedAt = new Date().toISOString();
      sub.lastModifiedBy = actor;

      // Write changes
      this.saveSubscriptions(subs);

      // Trigger automatic pro-rated invoice if applicable
      if (!sub.isComplimentary && newPackage.price > 0) {
        this.createInvoiceFromSubscription(sub, 'Upgrade');
      }

      this.logAction(
        actor,
        'super_admin',
        'sub.upgraded',
        'subscription',
        id,
        { before: beforePlan, after: newPackage.name, beforePrice, afterPrice: newPackage.price },
        reason
      );
    }
  }

  addSubscriptionAddon(id: string, addonName: string, addonPrice: number, durationDays: number, reason: string, actor: string) {
    const subs = this.getSubscriptions();
    const sub = subs.find(s => s.id === id);
    if (sub) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);

      const newAddon: SubscriptionAddOn = {
        id: `add-${Date.now().toString().slice(-4)}`,
        name: addonName,
        price: addonPrice,
        startDate: new Date().toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        status: 'active'
      };

      sub.addOns.push(newAddon);
      sub.lastModifiedAt = new Date().toISOString();
      sub.lastModifiedBy = actor;

      this.saveSubscriptions(subs);

      // Create separate addon line item on next generation, or live pro-rated billing
      this.logAction(
        actor,
        'super_admin',
        'addon.added',
        'subscription',
        id,
        { addon: newAddon },
        reason
      );
    }
  }

  // Invoices API
  getInvoices(): Invoice[] {
    return this.getStorageItem<Invoice[]>(INVOICES_KEY, INITIAL_INVOICES);
  }

  saveInvoices(invoices: Invoice[]) {
    this.setStorageItem(INVOICES_KEY, invoices);
  }

  createInvoiceFromSubscription(sub: Subscription, type: 'New Subscription' | 'Renewal' | 'Upgrade' = 'New Subscription') {
    const invoices = this.getInvoices();
    const issueDate = new Date().toISOString().split('T')[0];
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + 14); // 14-day standard terms
    const dueDate = dueDateObj.toISOString().split('T')[0];

    // calculate addon totals
    const addonLines = sub.addOns.map(add => ({
      description: `${add.name} Allocation`,
      quantity: 1,
      unitPrice: add.price,
      subtotal: add.price
    }));

    const baseLines = [{
      description: `${sub.packageName} Base Fee (${type})`,
      quantity: 1,
      unitPrice: sub.price,
      subtotal: sub.price
    }];

    const lineItems = [...baseLines, ...addonLines];
    const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0);

    const newInvoice: Invoice = {
      id: `inv-${Date.now().toString().slice(-5)}`,
      invoiceNumber: `WP-2026-${(invoices.length + 1).toString().padStart(4, '0')}`,
      customerId: sub.customerId,
      customerName: sub.customerName,
      customerEmail: sub.customerEmail,
      subscriptionId: sub.id,
      status: 'unpaid',
      billingMode: sub.billingMode,
      issueDate,
      dueDate,
      billingPeriodStart: sub.currentCycleStart.split('T')[0],
      billingPeriodEnd: sub.currentCycleEnd.split('T')[0],
      subtotal,
      tax: 0,
      discount: 0,
      totalAmount: subtotal,
      stripeChargeId: null,
      isSuspended: false,
      lineItems,
      createdAt: new Date().toISOString()
    };

    invoices.unshift(newInvoice);
    this.saveInvoices(invoices);
  }

  modifyInvoiceStatus(id: string, status: Invoice['status'], reason: string, actor: string, optionals?: any) {
    const invoices = this.getInvoices();
    const inv = invoices.find(i => i.id === id);
    if (inv) {
      const before = inv.status;
      inv.status = status;

      if (status === 'refunded') {
        inv.refundReason = reason;
      }

      if (optionals?.stripeChargeId) {
        inv.stripeChargeId = optionals.stripeChargeId;
      }

      this.saveInvoices(invoices);

      // If overdue / unpaid invoices get manual markings representing payment, restore subscription status!
      if (status === 'paid') {
        const subs = this.getSubscriptions();
        const linkedSub = subs.find(s => s.id === inv.subscriptionId);
        if (linkedSub && (linkedSub.status === 'suspended' || linkedSub.status === 'expired')) {
          linkedSub.status = 'active';
          linkedSub.suspendedAt = null;
          linkedSub.expiredAt = null;
          this.saveSubscriptions(subs);
        }
      }

      this.logAction(
        actor,
        'super_admin',
        `invoice.${status}`,
        'invoice',
        id,
        { before, after: status, invoiceNumber: inv.invoiceNumber, amount: inv.totalAmount },
        reason
      );
    }
  }

  toggleDunningBypass(id: string, actor: string): boolean {
    const invoices = this.getInvoices();
    const inv = invoices.find(i => i.id === id);
    if (inv) {
      inv.isSuspended = !inv.isSuspended;
      this.saveInvoices(invoices);
      this.logAction(
        actor,
        'super_admin',
        inv.isSuspended ? 'invoice.suspended' : 'invoice.reissued',
        'invoice',
        id,
        { isSuspended: inv.isSuspended },
        inv.isSuspended ? 'Bypassing automated dunning reminders' : 'Resumed automated dunning schedule'
      );
      return inv.isSuspended;
    }
    return false;
  }

  // Audit Logs API
  getAuditLogs(): AuditLog[] {
    return this.getStorageItem<AuditLog[]>(AUDIT_KEY, INITIAL_AUDITS);
  }

  logAction(
    actor: string,
    role: string,
    action: string,
    entityType: AuditLog['entityType'],
    entityId: string,
    metadata: any,
    reason: string | null
  ) {
    const logs = this.getAuditLogs();
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      actorEmail: actor,
      actorRole: role,
      action,
      entityType,
      entityId,
      metadata,
      reason,
      timestamp: new Date().toISOString()
    };
    logs.unshift(log);
    this.setStorageItem(AUDIT_KEY, logs);
  }
}

export const billingStore = new BillingStore();
