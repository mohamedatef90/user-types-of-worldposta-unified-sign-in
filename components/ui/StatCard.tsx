
import React from 'react';
import { Card } from './Card';
import { Icon } from './Icon';

interface StatCardProps {
  title: string;
  metric: string;
  change?: string;
  iconName: string;
  iconColor: string;
  changeType?: 'increase' | 'decrease';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, metric, change, iconName, iconColor, changeType, className }) => {
  const isIncrease = changeType === 'increase';
  const isDecrease = changeType === 'decrease';
  const changeColor = isIncrease ? 'text-green-500 dark:text-green-400' : isDecrease ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400';
  const changeIcon = isIncrease ? 'fas fa-arrow-up' : isDecrease ? 'fas fa-arrow-down' : '';
  
  return (
    <Card className={`p-4 flex items-center justify-between ${className}`}>
        <div className="flex items-center">
            <Icon name={iconName} className={`text-2xl w-8 text-center ${iconColor}`} />
            <div className="ml-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
              <p className="text-xl font-bold text-[#293c51] dark:text-gray-100">{metric}</p>
            </div>
        </div>
        {change && (
          <div className={`flex items-baseline text-sm font-semibold ${changeColor}`}>
            {changeIcon && <Icon name={changeIcon} className="mr-1" />}
            <span>{change}</span>
          </div>
        )}
    </Card>
  );
};
