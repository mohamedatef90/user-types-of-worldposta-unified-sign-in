
import React, { useState, useEffect, useMemo } from 'react';
import { Card, FormField, Icon } from '@/components/ui';
import { PLANS } from '../../pricing/constants';
import type { PricingPlan } from '@/types';

export const DemoPlanDetailsPage: React.FC = () => {
    const [viewedPlanId, setViewedPlanId] = useState<string>('');

    useEffect(() => {
        const initialPlanId = sessionStorage.getItem('demoUserPlanId');
        if (initialPlanId) {
            setViewedPlanId(initialPlanId);
        } else if (PLANS.length > 0) {
            // Fallback to the first plan if nothing is in session storage
            setViewedPlanId(PLANS[0].id);
        }
    }, []);

    const viewedPlan = useMemo(() => {
        if (!viewedPlanId) return null;
        return PLANS.find(p => p.id === viewedPlanId) || null;
    }, [viewedPlanId]);

    return (
        <Card>
            <div className="p-4 md:p-6">
                <h1 className="text-2xl md:text-3xl font-bold text-center text-[#293c51] dark:text-gray-100 mb-2">
                    Plan Details
                </h1>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                    You've selected a plan for your demo. You can view its details below or select another plan to compare features.
                </p>
                <div className="max-w-md mx-auto mb-8">
                    <FormField
                        id="plan-selector"
                        name="plan-selector"
                        label="Select a Plan to View"
                        as="select"
                        value={viewedPlanId}
                        onChange={(e) => setViewedPlanId(e.target.value)}
                        inputClassName="text-lg py-2"
                    >
                        {PLANS.map(plan => (
                            <option key={plan.id} value={plan.id}>{plan.name}</option>
                        ))}
                    </FormField>
                </div>
                
                {viewedPlan ? (
                    <div className="animate-fade-in">
                        <div className="text-center mb-6 p-6 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                            <h2 className="text-2xl font-bold text-[#293c51] dark:text-gray-100">{viewedPlan.name}</h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">{viewedPlan.description}</p>
                            <div className="my-4">
                                <span className="text-4xl font-extrabold text-[#293c51] dark:text-gray-100">${viewedPlan.priceMonthly.toFixed(2)}</span>
                                <span className="ml-1.5 text-base text-gray-500 dark:text-gray-400">/user/month</span>
                            </div>
                        </div>

                        <h3 className="text-xl font-semibold text-center mb-4 text-[#293c51] dark:text-gray-100">Included Features</h3>
                        <div className="overflow-x-auto border rounded-lg dark:border-slate-700">
                             <table className="min-w-full">
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                    {viewedPlan.features.map((feature, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                <div className="flex items-start">
                                                    <Icon name="far fa-check-circle" className="text-[#679a41] dark:text-emerald-400 mt-1 mr-3 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <p>Please select a plan from the dropdown to see its details.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};
