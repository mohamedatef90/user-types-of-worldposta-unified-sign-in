
import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Icon } from './Icon';
import { useAuth } from '@/context';

interface BillingSidebarProps {
    isCollapsed: boolean;
    isOpen: boolean;
    onClose: () => void;
}

export const BillingSidebar: React.FC<BillingSidebarProps> = ({ isCollapsed, isOpen, onClose }) => {
    const { user } = useAuth();
    const location = useLocation();

    const baseTextColor = "text-gray-700 dark:text-gray-300";
    const hoverBgColor = "hover:bg-gray-200 dark:hover:bg-slate-700";
    const hoverTextColor = "hover:text-[#679a41] dark:hover:text-emerald-400";
    const activeBgColor = "bg-[#679a41] dark:bg-emerald-600";
    const activeTextColor = "text-white dark:text-white";
    
    const iconBaseColor = "text-[#679a41] dark:text-emerald-400";
    const iconActiveColor = "text-white dark:text-white"; 
    const iconHoverColor = "group-hover:text-[#588836] dark:group-hover:text-emerald-500";

    const navItems = [
        { name: 'My Subscriptions', path: '/app/billing/subscriptions', icon: 'fas fa-box-open' },
        { name: 'Invoice History', path: '/app/billing/invoices', icon: 'fas fa-file-invoice-dollar' },
        { name: 'Payment & Wallet', path: '/app/billing/wallet', icon: 'fas fa-wallet' },
        ...(user?.role === 'admin' ? [{ name: 'Admin Tools', path: '/app/billing/admin', icon: 'fas fa-tools' }] : [])
    ];

    return (
        <>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden" 
                    onClick={onClose}
                    aria-hidden="true"
                ></div>
            )}
            <aside className={`fixed top-0 left-0 z-40 h-screen bg-[#f8f8f8] dark:bg-slate-800 flex-shrink-0 flex flex-col border-r dark:border-slate-700 transition-all duration-300 ease-in-out
                           ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                           lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen 
                           ${isCollapsed ? 'w-20' : 'w-64'}`}>
                <div className={`flex items-center justify-between p-4 h-16 border-b border-gray-200 dark:border-slate-700 ${isCollapsed ? 'lg:justify-center' : ''}`}>
                    <Link to="/app/billing" className="flex items-center gap-2">
                        <Icon name="fas fa-credit-card" className="text-xl text-[#679a41]" />
                        {!isCollapsed && <span className="font-bold text-[#293c51] dark:text-gray-100">Billing and Subscriptions</span>}
                    </Link>
                    <button onClick={onClose} className={`lg:hidden ${baseTextColor} ${hoverTextColor}`}>
                        <Icon name="fas fa-times" className="text-xl" />
                    </button>
                </div>
                <nav className="flex-grow py-4 px-2 overflow-y-auto">
                    <ul className="space-y-1">
                        {navItems.map(item => (
                            <li key={item.name}>
                                <NavLink 
                                    to={item.path} 
                                    title={isCollapsed ? item.name : undefined}
                                    className={({isActive}) => `flex items-center py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out group ${isCollapsed ? 'px-3 justify-center' : 'px-3'} ${isActive ? `${activeBgColor} ${activeTextColor}` : `${baseTextColor} ${hoverBgColor} ${hoverTextColor}`}`}
                                >
                                    {({isActive}) => (<>
                                        <Icon name={item.icon} fixedWidth className={`text-lg ${isCollapsed ? '' : 'mr-3'} ${isActive ? iconActiveColor : iconBaseColor} ${isActive ? '' : iconHoverColor}`} />
                                        {!isCollapsed && <span>{item.name}</span>}
                                    </>)}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="flex-shrink-0 mt-auto py-2 px-2">
                    <hr className="my-2 border-gray-300 dark:border-slate-600" />
                    {!isCollapsed && (
                        <Link to="/app/dashboard" className={`w-full text-left flex items-center p-3 rounded-md text-sm font-medium ${baseTextColor} ${hoverBgColor} ${hoverTextColor}`}>
                            <Icon name="fas fa-sign-out-alt" fixedWidth className={`mr-3 text-lg ${iconBaseColor}`} />
                            Exit to Dashboard
                        </Link>
                    )}
                </div>
            </aside>
        </>
    );
};
