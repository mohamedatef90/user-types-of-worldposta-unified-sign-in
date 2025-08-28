
import React, { useState } from 'react';
import { PricingCard, ToggleSwitch } from '@/components/ui';
import { PLANS } from '../../pricing/constants';

interface DemoPlanSelectionPageProps {
  onPlanSelect: (planId: string) => void;
}

export const DemoPlanSelectionPage: React.FC<DemoPlanSelectionPageProps> = ({ onPlanSelect }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');

    return (
        <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-lg">
            <section className="text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#293c51] dark:text-gray-100">Choose a Plan to Start Your Demo</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Select any plan to explore the features of the Email Admin Suite.</p>
                    <div className="mt-8 flex justify-center items-center space-x-4">
                        <span className={`font-medium ${billingCycle === 'monthly' ? 'text-[#293c51] dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>Monthly</span>
                        <ToggleSwitch
                            id="billing-cycle-toggle-demo"
                            checked={billingCycle === 'annually'}
                            onChange={(checked) => setBillingCycle(checked ? 'annually' : 'monthly')}
                        />
                        <span className={`font-medium ${billingCycle === 'annually' ? 'text-[#293c51] dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                            Annually
                            <span className="ml-2 px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 dark:text-green-200 dark:bg-green-700 rounded-full">Save up to 17%</span>
                        </span>
                    </div>
                </div>
            </section>

            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
                        {PLANS.map(plan => (
                            <PricingCard key={plan.id} plan={plan} billingCycle={billingCycle} onChoosePlan={onPlanSelect} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
