import React from 'react';
import { Card } from './Card';
import { Icon } from './Icon';

interface StatCardProps {
  title: string;
  metric: string;
  change?: string;
  iconName: string;
  iconBgColor: string;
  changeType?: 'increase' | 'decrease';
}

export const StatCard: React.FC<StatCardProps> = ({ title, metric, change, iconName, iconBgColor, changeType }) => {
  const isIncrease = changeType === 'increase';
  const isDecrease = changeType === 'decrease';
  const changeColor = isIncrease ? 'text-green-500 dark:text-green-400' : isDecrease ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400';
  const changeIcon = isIncrease ? 'fas fa-arrow-up' : 'fas fa-arrow-down' : '';
  
  return (
    <Card className="p-4 flex items-center">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${iconBgColor}`}>
          <Icon name={iconName} className="text-white text-2xl" />
        </div>
        <div className="ml-4 flex-grow">
          <p className="text-3xl font-bold text-[#293c51] dark:text-gray-100">{metric}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        </div>
        {change && (
          <div className={`flex items-center text-sm font-semibold ${changeColor}`}>
            {changeIcon && <Icon name={changeIcon} className="mr-1 text-xs" />}
            <span>{change}</span>
          </div>
        )}
    </Card>
  );
};
