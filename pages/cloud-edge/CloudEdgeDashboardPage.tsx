
import React, { useState } from 'react';
import { Card, Button, ToggleSwitch, DoughnutChart, Icon } from '@/components/ui';
import { useAuth } from '@/context';

const EmptyState: React.FC<{ icon: string; title: string; description: string; className?: string }> = ({ icon, title, description, className }) => (
    <div className={`text-center py-8 text-gray-500 dark:text-gray-400 flex flex-col justify-center items-center ${className}`}>
        <Icon name={icon} className="text-4xl mb-3 text-gray-400 dark:text-gray-500" />
        <h5 className="font-semibold text-lg text-[#293c51] dark:text-gray-300">{title}</h5>
        <p className="text-sm">{description}</p>
    </div>
);


export const CloudEdgeDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const isNewUser = user?.email === 'new.user@worldposta.com';

    const [mfaEnabled, setMfaEnabled] = useState(false);
    
    const overviewStats = isNewUser ? {
        virtualMachines: 0, organizations: 0, creationDate: "Today",
        gateways: 0, reservations: 0, users: 1,
    } : {
        virtualMachines: 2, organizations: 2, creationDate: "18/06/2023",
        gateways: 2, reservations: 1, users: 2,
    };
    
    const recentVMs = isNewUser ? [] : [
        { id: 1, logo: 'https://cdn.worldvectorlogo.com/logos/suse.svg', name: 'VM name', org: 'Worldposta', status: 'Active', memory: '64/GB', cores: '12/CPU', disk: '256/GB' },
        { id: 2, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Windows_logo_-_2012.svg/1024px-Windows_logo_-_2012.svg.png', name: 'VM name', org: 'Worldposta', status: 'Active', memory: '64/GB', cores: '12/CPU', disk: '256/GB' },
        { id: 3, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Logo-ubuntu_cof-orange-hex.svg/2048px-Logo-ubuntu_cof-orange-hex.svg.png', name: 'VM name', org: 'Worldposta', status: 'Deactivated', memory: '64/GB', cores: '12/CPU', disk: '256/GB' },
        { id: 4, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Tux.svg/1200px-Tux.svg.png', name: 'VM name', org: 'Worldposta', status: 'Deactivated', memory: '64/GB', cores: '12/CPU', disk: '256/GB' },
    ];
    
    const actionLogs = isNewUser ? [] : [
        { action: 'User login', initiator: 'mine', target: 'worldposta-admin', date: '09/02/2025 01:31 PM' },
        { action: 'User login', initiator: 'mine', target: 'worldposta-admin', date: '09/02/2025 01:30 PM' },
        { action: 'VM Create', initiator: 'mine', target: 'ubuntu-dev-clone', date: '09/02/2025 11:54 AM' },
        { action: 'VM Stop', initiator: 'mine', target: 'ubuntu-dev', date: '09/02/2025 11:52 AM' },
    ];

    const usageChartData = isNewUser ? {
        bars: [0, 0, 0, 0, 0, 0, 0],
        linePath: "M 20 140 L 290 140"
    } : {
        bars: [50, 40, 60, 55, 75, 60, 85],
        linePath: "M 20 75 L 65 87 L 110 63 L 155 69 L 200 45 L 245 63 L 290 27"
    };

    const doughnutChartData = isNewUser ? {
        ram: { percentage: 0, total: 0, used: 0 },
        cores: { percentage: 0, total: 0, used: 0 },
        disk: { percentage: 0, total: 0, used: 0 },
        secure: { percentage: 0 },
    } : {
        ram: { percentage: 45, total: 419, used: 192 },
        cores: { percentage: 84, total: 100, used: 76 },
        disk: { percentage: 96, total: 6000, used: 5600 },
        secure: { percentage: 35 },
    };


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card>
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold text-[#293c51] dark:text-gray-100">Welcome to CloudEdge!</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>Virtual Machines: <span className="font-semibold text-[#293c51] dark:text-gray-200">{overviewStats.virtualMachines}</span></span>
                        <span>Gateways: <span className="font-semibold text-[#293c51] dark:text-gray-200">{overviewStats.gateways}</span></span>
                        <span>Organizations: <span className="font-semibold text-[#293c51] dark:text-gray-200">{overviewStats.organizations}</span></span>
                        <span>Reservations: <span className="font-semibold text-[#293c51] dark:text-gray-200">{overviewStats.reservations}</span></span>
                        <span>Creation Date: <span className="font-semibold text-[#293c51] dark:text-gray-200">{overviewStats.creationDate}</span></span>
                        <span>Users: <span className="font-semibold text-[#293c51] dark:text-gray-200">{overviewStats.users}</span></span>
                    </div>
                </Card>
                <Card title="CloudEdge Smart Actions" className="h-full">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button variant="outline" className="h-auto py-3"><Icon name="fas fa-desktop" className="text-green-500 mr-3 text-2xl" />New VM</Button>
                        <Button variant="outline" className="h-auto py-3"><Icon name="fas fa-user-plus" className="text-green-500 mr-3 text-2xl" />New User</Button>
                        <Button variant="outline" className="h-auto py-3"><Icon name="fas fa-cloud-download-alt" className="text-green-500 mr-3 text-2xl" />New Reservation</Button>
                        <div className="flex items-center justify-center border border-gray-200 dark:border-slate-700 rounded-md p-3">
                            <Icon name="fas fa-shield-alt" className="text-green-500 mr-3 text-2xl" />
                            <span className="font-semibold mr-4">MFA</span>
                            <ToggleSwitch id="mfa-toggle" checked={mfaEnabled} onChange={setMfaEnabled} />
                        </div>
                    </div>
                </Card>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card title="Resources" className="lg:col-span-3">
                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                         <div>
                            <div className="flex justify-between items-center mb-2">
                                 <h4 className="font-semibold">Recent Virtual Machines</h4>
                                 {!isNewUser && <a href="#" className="text-sm text-[#679a41] dark:text-emerald-400 hover:underline">See More</a>}
                            </div>
                            {recentVMs.length > 0 ? (
                                <div className="space-y-3">
                                    {recentVMs.map(vm => (
                                        <div key={vm.id} className="p-3 border dark:border-slate-700 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <img src={vm.logo} alt={`${vm.name} logo`} className="h-8 w-8 mr-3 object-contain" />
                                                    <div>
                                                        <p className="font-bold text-sm">{vm.name}</p>
                                                        <p className="text-xs text-gray-500">Org Name: {vm.org}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${vm.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>{vm.status}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2 text-gray-500 dark:text-gray-400">
                                                <span>Memory: {vm.memory}</span>
                                                <span>Cores: {vm.cores}</span>
                                                <span>Disk: {vm.disk}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon="fas fa-desktop" title="No Virtual Machines Found" description="Get started by creating your first VM using the 'New VM' smart action." className="h-full" />
                            )}
                         </div>
                         <div>
                            <h4 className="font-semibold mb-2">Resources Usage</h4>
                            <div className="relative h-48 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2 flex items-end justify-around overflow-hidden">
                                {isNewUser ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                        <Icon name="fas fa-chart-bar" className="text-3xl text-gray-400 dark:text-gray-500 mb-2"/>
                                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Your Usage Will Appear Here</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Usage data will be populated once you deploy and run resources.</p>
                                    </div>
                                ) : (
                                    <>
                                        {[25, 50, 75].map(top => (
                                            <div key={top} className="absolute left-0 right-0 border-t border-dashed border-gray-300 dark:border-slate-600" style={{bottom: `${top}%`}} />
                                        ))}
                                        {usageChartData.bars.map((h, i) => (
                                            <div key={i} className={`w-3/5 rounded-t-md ${i === usageChartData.bars.length - 1 ? 'bg-slate-500 dark:bg-slate-400' : 'bg-gray-200 dark:bg-slate-600'}`} style={{height: `${h}%`}}></div>
                                        ))}
                                        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 310 150">
                                            <path d={usageChartData.linePath} stroke="#679a41" fill="none" strokeWidth="2.5" strokeLinecap="round"/>
                                        </svg>
                                    </>
                                )}
                            </div>
                            {!isNewUser && (
                                <>
                                    <p className="text-2xl font-bold mt-2">30%</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Your sales performance is 30% better compare to last month</p>
                                </>
                            )}
                         </div>
                     </div>
                </Card>
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <div className="grid grid-cols-2 gap-4 h-full">
                           <div className="flex flex-col items-center justify-start text-center">
                                <h4 className="font-semibold mb-1">RAM Usage</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total: {doughnutChartData.ram.total}GB, Used: {doughnutChartData.ram.used}GB</p>
                                <DoughnutChart percentage={doughnutChartData.ram.percentage} color="#679a41" className="my-2" size={100} />
                           </div>
                           <div className="flex flex-col items-center justify-start text-center">
                                <h4 className="font-semibold mb-1">Cores Usage</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total: {doughnutChartData.cores.total} Cores, Used: {doughnutChartData.cores.used} Cores</p>
                                <DoughnutChart percentage={doughnutChartData.cores.percentage} color="#f59e0b" className="my-2" size={100} />
                           </div>
                           <div className="flex flex-col items-center justify-start text-center">
                                <h4 className="font-semibold mb-1">Flash Disk</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total: {doughnutChartData.disk.total}GB, Used: {doughnutChartData.disk.used}GB</p>
                                <DoughnutChart percentage={doughnutChartData.disk.percentage} color="#ef4444" className="my-2" size={100} />
                           </div>
                           <div className="flex flex-col items-center justify-start text-center">
                                <h4 className="font-semibold mb-1">Secure Access</h4>
                                <a href="#" className="text-xs text-blue-500 hover:underline">Upgrade Protection</a>
                                <DoughnutChart percentage={doughnutChartData.secure.percentage} gradientId="secure-access-gradient" className="my-2" size={100} />
                           </div>
                        </div>
                    </Card>
                </div>
            </div>

            <Card title="Action Logs">
                 {actionLogs.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b dark:border-slate-700">
                                <tr>
                                    <th className="text-left py-2 px-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Action</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Initiator</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Target</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {actionLogs.map((log, i) => (
                                    <tr key={i} className="border-b dark:border-slate-700 last:border-0">
                                        <td className="py-3 px-3 text-sm">{log.action}</td>
                                        <td className="py-3 px-3 text-sm">{log.initiator}</td>
                                        <td className="py-3 px-3 text-sm">{log.target}</td>
                                        <td className="py-3 px-3 text-sm text-gray-500 dark:text-gray-400">{log.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState icon="fas fa-history" title="No Recent Activity" description="Your actions will be logged here as you use the service." />
                )}
            </Card>
        </div>
    )
};
