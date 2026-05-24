
import React, { useState, useMemo } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { Icon } from '@/components/ui';
import { useAuth } from '@/context';

interface NavSubItem {
  name: string;
  path: string;
}

interface NavItemWithSubItems {
  name: string;
  icon: string;
  subItems: NavSubItem[];
}

interface PostaGateSidebarProps {
    isCollapsed: boolean;
    isOpen: boolean;
    onClose: () => void;
}

export const PostaGateSidebar: React.FC<PostaGateSidebarProps> = ({ isCollapsed, isOpen, onClose }) => {
    const { user } = useAuth();
    const location = useLocation();
    const [openSections, setOpenSections] = useState<string[]>([]);

    const baseTextColor = "text-gray-700 dark:text-gray-300";
    const hoverBgColor = "hover:bg-gray-200 dark:hover:bg-slate-700";
    const hoverTextColor = "hover:text-[#679a41] dark:hover:text-emerald-400";
    const activeBgColor = "bg-[#679a41] dark:bg-emerald-600";
    const activeTextColor = "text-white dark:text-white";
    
    const iconBaseColor = "text-[#679a41] dark:text-emerald-400";
    const iconActiveColor = "text-white dark:text-white"; 
    const iconHoverColor = "group-hover:text-[#588836] dark:group-hover:text-emerald-500";
    
    const navItems = useMemo(() => {
        const items: (NavSubItem & { icon: string } | NavItemWithSubItems)[] = [
            { name: 'Dashboard', path: '/app/posta-gate', icon: 'fas fa-tachometer-alt' },
            { name: 'Get Started', path: '/app/posta-gate/get-started', icon: 'fas fa-rocket' },
            { name: 'Security Policies', path: '/app/posta-gate/policies', icon: 'fas fa-shield-alt' },
            { name: 'Quarantine', path: '/app/posta-gate/quarantine', icon: 'fas fa-biohazard' },
            { name: 'Blocked Senders', path: '/app/posta-gate/blocked-senders', icon: 'fas fa-user-slash' },
            { name: 'Protected Users', path: '/app/posta-gate/protected-users', icon: 'fas fa-user-shield' },
            { name: 'Domain Settings', path: '/app/posta-gate/domain-settings', icon: 'fas fa-globe' },
            { 
                name: 'Advanced', 
                icon: 'fas fa-cogs', 
                subItems: [
                    { name: 'Advanced Config', path: '/app/posta-gate/advanced/config' },
                    { name: 'API Access', path: '/app/posta-gate/advanced/api' },
                ] 
            },
        ];
        return items;
    }, []);

    const toggleSection = (name: string) => {
        setOpenSections(prev => 
            prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
        );
    };

    return (
        <>
        {isOpen && (
            <div className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden" onClick={onClose} aria-hidden="true"></div>
        )}
        <aside className={`fixed top-0 left-0 z-40 h-screen bg-[#f8f8f8] dark:bg-slate-800 flex-shrink-0 flex flex-col border-r dark:border-slate-700 transition-all duration-300 ease-in-out
                       ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                       lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen 
                       ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`flex items-center justify-between p-4 h-16 border-b border-gray-200 dark:border-slate-700 ${isCollapsed ? 'lg:justify-center' : ''}`}>
                <Link to="/app/posta-gate" className="flex items-center gap-2">
                    <img 
                        src="https://i.postimg.cc/Y4GWHh1r/Asset-1-4x.png" 
                        alt="Posta Gate Logo" 
                        className="h-8 w-auto"
                        referrerPolicy="no-referrer"
                    />
                    {!isCollapsed && <span className="font-bold text-[#679a41] text-lg tracking-tight">Posta Gate</span>}
                </Link>
                <button onClick={onClose} className={`lg:hidden ${baseTextColor} ${hoverTextColor}`}>
                    <Icon name="fas fa-times" className="text-xl" />
                </button>
            </div>
            <nav className="flex-grow py-4 px-2 overflow-y-auto">
                <ul className="space-y-1">
                    {navItems.map(item => {
                        const hasSubItems = 'subItems' in item;
                        const isSectionOpen = openSections.includes(item.name);

                        if (hasSubItems) {
                            return (
                                <li key={item.name}>
                                    <button 
                                        onClick={() => toggleSection(item.name)}
                                        className={`w-full flex items-center py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out group ${isCollapsed ? 'px-3 justify-center' : 'px-3'} ${baseTextColor} ${hoverBgColor} ${hoverTextColor}`}
                                    >
                                        <Icon name={item.icon} fixedWidth className={`text-lg ${isCollapsed ? '' : 'mr-3'} ${iconBaseColor} ${iconHoverColor}`} />
                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-grow text-left">{item.name}</span>
                                                <Icon name={isSectionOpen ? "fas fa-chevron-down" : "fas fa-chevron-right"} className="text-[10px] ml-1" />
                                            </>
                                        )}
                                    </button>
                                    {!isCollapsed && isSectionOpen && (
                                        <ul className="mt-1 ml-9 space-y-1 border-l border-gray-200 dark:border-slate-700">
                                            {(item as NavItemWithSubItems).subItems.map(subItem => (
                                                <li key={subItem.name}>
                                                    <NavLink 
                                                        to={subItem.path}
                                                        className={({isActive}) => `block py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${isActive ? `text-[#679a41] dark:text-emerald-400 bg-gray-100 dark:bg-slate-700/50` : `${baseTextColor} ${hoverTextColor}`}`}
                                                    >
                                                        {subItem.name}
                                                    </NavLink>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            );
                        }

                        return (
                            <li key={item.name}>
                                <NavLink 
                                    to={(item as any).path} 
                                    title={isCollapsed ? item.name : undefined}
                                    end={(item as any).path === '/app/posta-gate'}
                                    className={({isActive}) => `flex items-center py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out group ${isCollapsed ? 'px-3 justify-center' : 'px-3'} ${isActive ? `${activeBgColor} ${activeTextColor}` : `${baseTextColor} ${hoverBgColor} ${hoverTextColor}`}`}
                                >
                                    {({isActive}) => (<>
                                        <Icon name={(item as any).icon} fixedWidth className={`text-lg ${isCollapsed ? '' : 'mr-3'} ${isActive ? iconActiveColor : iconBaseColor} ${isActive ? '' : iconHoverColor}`} />
                                        {!isCollapsed && <span>{item.name}</span>}
                                    </>)}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <div className="flex-shrink-0 mt-auto py-2 px-2">
                <hr className="my-2 border-gray-300 dark:border-slate-600" />
                {!isCollapsed && (
                    <div className="space-y-1">
                        <Link to="/app/dashboard" className={`w-full text-left flex items-center p-3 rounded-md text-sm font-medium ${baseTextColor} ${hoverBgColor} ${hoverTextColor}`}>
                            <Icon name="fas fa-sign-out-alt" fixedWidth className={`mr-3 text-lg ${iconBaseColor}`} />
                            Exit Product
                        </Link>
                    </div>
                )}
            </div>
        </aside>
        </>
    );
};


