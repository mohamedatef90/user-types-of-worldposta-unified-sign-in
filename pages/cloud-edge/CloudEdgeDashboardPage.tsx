
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Icon, LineChart, MultiSegmentDoughnutChart, StatCard, DashboardCustomizationMenu, Tooltip } from '@/components/ui';
import { useAuth } from '@/context';

// --- WIDGET COMPONENTS ---

const CostBreakdownCard: React.FC = () => {
    const costData = [
        { label: 'Compute', value: 1250.50, color: '#3b82f6' },
        { label: 'Storage', value: 450.25, color: '#10b981' },
        { label: 'Networking', value: 150.75, color: '#f59e0b' },
        { label: 'Licensing', value: 220.00, color: '#8b5cf6' },
    ];
    const totalCost = costData.reduce((sum, item) => sum + item.value, 0);

    return (
        <Card title="Cost Breakdown (This Month)" className="h-full flex flex-col">
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 flex-grow">
                <div className="flex-shrink-0">
                    <MultiSegmentDoughnutChart segments={costData} size={130} strokeWidth={15} showTotal={false} />
                </div>
                <div className="w-full sm:w-auto flex-grow space-y-2 text-sm">
                    {costData.map(segment => {
                        const percentage = totalCost > 0 ? (segment.value / totalCost) * 100 : 0;
                        return (
                            <div key={segment.label} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: segment.color }}></span>
                                    <span className="text-gray-600 dark:text-gray-400">{segment.label}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300 mr-2">${segment.value.toLocaleString()}</span>
                                    <span className="text-xs text-gray-500 w-12 text-right">({percentage.toFixed(1)}%)</span>
                                </div>
                            </div>
                        )
                    })}
                     <div className="pt-2 border-t dark:border-gray-600 flex items-center justify-between font-bold">
                        <span className="text-gray-700 dark:text-gray-200">Total</span>
                        <span>${totalCost.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};


const ResourceUtilizationChart: React.FC = () => {
    const utilizationData = {
        labels: ['-6d', '-5d', '-4d', '-3d', '-2d', 'Yesterday', 'Today'],
        data: [
            { name: 'CPU', color: '#3b82f6', points: [45, 50, 55, 60, 58, 65, 70] },
            { name: 'Memory', color: '#10b981', points: [60, 62, 65, 63, 70, 72, 75] },
            { name: 'Storage', color: '#f59e0b', points: [80, 80, 81, 81, 82, 82, 83] },
        ]
    };
    return (
        <Card title="Resource Utilization Trends (7 Days)">
            <div className="h-64">
                <LineChart data={utilizationData.data} labels={utilizationData.labels} />
            </div>
        </Card>
    );
};

const ActiveServicesCard: React.FC = () => {
    const services = [
        { name: 'Virtual Machines', count: 8, icon: 'fas fa-desktop', path: '#' },
        { name: 'Gateways', count: 2, icon: 'fas fa-dungeon', path: '#' },
        { name: 'Firewall Policies', count: 12, icon: 'fas fa-fire-alt', path: '/app/cloud-edge/firewall/policies' },
        { name: 'Load Balancers', count: 3, icon: 'fas fa-network-wired', path: '/app/networking' },
        { name: 'Backup Jobs', count: 5, icon: 'fas fa-save', path: '/app/backup' },
        { name: 'Kubernetes Clusters', count: 1, icon: 'fas fa-dharmachakra', path: '/app/kubernetes' },
    ];
    return (
        <Card title="Active Services Overview" className="h-full flex flex-col">
            <ul className="space-y-2 flex-grow">
                {services.map(service => (
                    <li key={service.name}>
                        <Link to={service.path} className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors group">
                            <Icon name={service.icon} className="text-xl text-gray-500 dark:text-gray-400 mr-4 w-6 text-center" />
                            <div className="flex-grow">
                                <p className="font-semibold text-sm text-[#293c51] dark:text-gray-100">{service.name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-[#293c51] dark:text-gray-100">{service.count}</span>
                                <Icon name="fas fa-chevron-right" className="text-gray-400 dark:text-gray-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

const SecurityPostureCard: React.FC = () => {
    const recommendations = [
        { text: 'Enable MFA for 2 admin users.', priority: 'High', link: '/app/settings/security' },
        { text: 'Review overly permissive firewall rule "Allow-Any-Any".', priority: 'High', link: '/app/cloud-edge/firewall/policies' },
        { text: 'Apply latest security patches to 1 Linux VM.', priority: 'Medium', link: '#' },
    ];
    return (
        <Card title="Security Posture" className="h-full flex flex-col">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b dark:border-slate-700">
                <div className="text-center">
                    <p className="text-4xl font-bold text-green-500">A-</p>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">RATING</p>
                </div>
                <div className="flex-grow">
                    <p className="font-semibold text-lg text-[#293c51] dark:text-gray-100">Your configuration is looking good.</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Address the recommendations below to improve your score.</p>
                </div>
            </div>
            <div className="flex-grow space-y-2">
                <h4 className="text-sm font-semibold mb-2">Recommendations:</h4>
                <ul className="space-y-2">
                    {recommendations.map((rec, index) => (
                        <li key={index} className="flex items-center text-sm">
                            <span className={`px-2 py-0.5 mr-2 rounded-full text-xs font-semibold ${rec.priority === 'High' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}`}>{rec.priority}</span>
                            <Link to={rec.link} className="text-gray-700 dark:text-gray-300 hover:text-[#679a41] dark:hover:text-emerald-400 hover:underline">{rec.text}</Link>
                        </li>
                    ))}
                </ul>
            </div>
             <div className="mt-4 pt-4 border-t dark:border-slate-700">
                <Button variant="outline" size="sm" fullWidth>View all in Security Center</Button>
            </div>
        </Card>
    );
};

const RecentActivityFeed: React.FC = () => {
    const activities = [
        { icon: 'fas fa-server', text: 'VM "web-prod-03" was created by admin.', time: '15m ago' },
        { icon: 'fas fa-fire-alt', text: 'Firewall policy "Block-External-SSH" was updated.', time: '1h ago' },
        { icon: 'fas fa-user-plus', text: 'New user "jane.doe" was invited to the organization.', time: '3h ago' },
        { icon: 'fas fa-save', text: 'Snapshot created for "db-main-vm".', time: '8h ago' },
        { icon: 'fas fa-exclamation-triangle', text: 'High CPU usage detected on "app-worker-01".', time: 'Yesterday' },
    ];
    return (
        <Card title="Recent Activity" className="h-full flex flex-col">
            <ul className="space-y-3 flex-grow">
                {activities.map((item, index) => (
                    <li key={index} className="flex items-start">
                        <Icon name={item.icon} className="text-lg text-gray-400 dark:text-gray-500 mt-1 mr-3 w-5 text-center" />
                        <div className="flex-grow">
                            <p className="text-sm text-[#293c51] dark:text-gray-200">{item.text}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.time}</p>
                        </div>
                    </li>
                ))}
            </ul>
             <div className="mt-4 pt-4 border-t dark:border-slate-700">
                <Button variant="outline" size="sm" fullWidth>View all Activity Logs</Button>
            </div>
        </Card>
    );
};

const QuickActionsCard: React.FC = () => {
    const actions = [
        { label: 'Deploy VM', icon: 'fas fa-desktop' },
        { label: 'Create VDC', icon: 'fas fa-cloud' },
        { label: 'Manage Firewall', icon: 'fas fa-shield-alt' },
        { label: 'Create Snapshot', icon: 'fas fa-camera' },
        { label: 'Configure Networking', icon: 'fas fa-network-wired' },
        { label: 'Invite User', icon: 'fas fa-user-plus' },
    ];
    return (
        <Card title="Quick Actions" className="h-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {actions.map(action => (
                    <Button key={action.label} variant="outline" className="h-full flex-col py-4">
                        <Icon name={action.icon} className="text-2xl mb-2 text-[#679a41] dark:text-emerald-400" />
                        <span className="text-xs font-semibold">{action.label}</span>
                    </Button>
                ))}
            </div>
        </Card>
    );
};


// --- DASHBOARD LAYOUT ---
interface DashboardCardInfo {
    id: string;
    name: string;
    sizeClass: string;
    minSizeClass?: string;
}

const cardComponentMap: { [key: string]: React.ComponentType<any> } = {
    kpiVm: (props) => <StatCard {...props} title="Active VMs" metric="8" change="+1" changeType="increase" iconName="fas fa-desktop" iconColor="text-blue-500" />,
    kpiCost: (props) => <StatCard {...props} title="Est. Monthly Cost" metric="$2,071.50" change="+ $150" changeType="increase" iconName="fas fa-dollar-sign" iconColor="text-green-500" />,
    kpiAlerts: (props) => <StatCard {...props} title="Critical Alerts" metric="2" iconName="fas fa-exclamation-triangle" iconColor="text-red-500" />,
    utilization: ResourceUtilizationChart,
    costBreakdown: CostBreakdownCard,
    services: ActiveServicesCard,
    security: SecurityPostureCard,
    activity: RecentActivityFeed,
    actions: QuickActionsCard,
};

const ALL_DASHBOARD_CARDS: DashboardCardInfo[] = [
    { id: 'kpiVm', name: 'KPI: Active VMs', sizeClass: 'lg:col-span-4', minSizeClass: 'col-span-1' },
    { id: 'kpiCost', name: 'KPI: Monthly Cost', sizeClass: 'lg:col-span-4', minSizeClass: 'col-span-1' },
    { id: 'kpiAlerts', name: 'KPI: Security Alerts', sizeClass: 'lg:col-span-4', minSizeClass: 'col-span-1' },
    { id: 'utilization', name: 'Resource Utilization', sizeClass: 'lg:col-span-8' },
    { id: 'costBreakdown', name: 'Cost Breakdown', sizeClass: 'lg:col-span-4' },
    { id: 'services', name: 'Active Services', sizeClass: 'lg:col-span-6' },
    { id: 'security', name: 'Security Posture', sizeClass: 'lg:col-span-6' },
    { id: 'activity', name: 'Recent Activity', sizeClass: 'lg:col-span-6' },
    { id: 'actions', name: 'Quick Actions', sizeClass: 'lg:col-span-6' },
];

export const CloudEdgeDashboardPage: React.FC = () => {
    const { user } = useAuth();
    
    const [cardVisibility, setCardVisibility] = useState<{ [key: string]: boolean }>(() => {
        try {
            const stored = localStorage.getItem('cloudEdgeDashboardVisibility');
            return stored ? JSON.parse(stored) : ALL_DASHBOARD_CARDS.reduce((acc, card) => ({...acc, [card.id]: true}), {});
        } catch {
            return ALL_DASHBOARD_CARDS.reduce((acc, card) => ({...acc, [card.id]: true}), {});
        }
    });

    useEffect(() => {
        localStorage.setItem('cloudEdgeDashboardVisibility', JSON.stringify(cardVisibility));
    }, [cardVisibility]);

    const visibleCards = useMemo(() => {
        return ALL_DASHBOARD_CARDS.filter(card => cardVisibility[card.id]);
    }, [cardVisibility]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">
                        CloudEdge Command Center
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Welcome back, {user?.displayName || user?.fullName || 'Admin'}. Here's an overview of your cloud environment.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <DashboardCustomizationMenu
                        allCards={ALL_DASHBOARD_CARDS.map(c => ({ id: c.id, name: c.name }))}
                        visibility={cardVisibility}
                        onVisibilityChange={setCardVisibility}
                        isArrangeMode={false}
                        onToggleArrangeMode={() => {}}
                    />
                    <Button variant="primary" leftIconName="fas fa-plus">Deploy New Resource</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                {visibleCards.map(cardInfo => {
                    const CardComponent = cardComponentMap[cardInfo.id];
                    return (
                        <div key={cardInfo.id} className={`${cardInfo.sizeClass}`}>
                           <CardComponent />
                        </div>
                    )
                })}
            </div>
        </div>
    );
};
