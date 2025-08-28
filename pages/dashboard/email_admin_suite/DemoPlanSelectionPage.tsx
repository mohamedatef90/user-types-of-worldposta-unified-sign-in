import React, { useState, useMemo } from 'react';
import { Button, Card, FormField, Icon, ToggleSwitch } from '@/components/ui';
import { PLANS } from '../../pricing/constants';
import type { PricingPlan } from '@/types';

interface DemoPlanSelectionPageProps {
  onPlanSelect: (planId: string) => void;
}

export const DemoPlanSelectionPage: React.FC<DemoPlanSelectionPageProps> = ({ onPlanSelect }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');
    const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
        // Initialize state from sessionStorage if a plan was selected from the pricing page
        return sessionStorage.getItem('demoUserPlanId') || '';
    });

    const selectedPlan = useMemo(() => {
        if (!selectedPlanId) return null;
        return PLANS.find(p => p.id === selectedPlanId) || null;
    }, [selectedPlanId]);

    const handleSelectPlan = () => {
        if (selectedPlan) {
            onPlanSelect(selectedPlan.id);
        }
    };

    const getPrice = (plan: PricingPlan) => {
        return billingCycle === 'annually' ? plan.priceAnnuallyPerMonth : plan.priceMonthly;
    };

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
                <div className="container mx-auto px-4 max-w-3xl">
                    <FormField
                        id="plan-select"
                        name="plan-select"
                        label=""
                        as="select"
                        value={selectedPlanId}
                        onChange={(e) => setSelectedPlanId(e.target.value)}
                        inputClassName="text-center text-lg"
                    >
                        <option value="">-- Choose a plan to see details --</option>
                        {PLANS.map(plan => (
                            <option key={plan.id} value={plan.id}>{plan.name}</option>
                        ))}
                    </FormField>

                    {selectedPlan && (
                        <Card className="mt-8 animate-fade-in">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">{selectedPlan.name}</h2>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">{selectedPlan.description}</p>
                                <div className="my-4">
                                    <span className="text-5xl font-extrabold text-[#293c51] dark:text-gray-100">${getPrice(selectedPlan).toFixed(2)}</span>
                                    <span className="ml-1.5 text-lg text-gray-500 dark:text-gray-400">/user/month</span>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {billingCycle === 'annually' ? 'Billed annually' : 'Billed monthly'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                                <h3 className="text-xl font-semibold text-center mb-4 text-[#293c51] dark:text-gray-100">What's Included</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <tbody className="bg-white dark:bg-slate-800">
                                            {selectedPlan.features.map((feature, index) => (
                                                <tr key={index} className="border-b border-gray-200 dark:border-slate-700 last:border-b-0">
                                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
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

                            <Button
                                onClick={handleSelectPlan}
                                className="mt-8"
                                fullWidth
                                size="lg"
                                variant={selectedPlan.isRecommended ? 'primary' : 'secondary'}
                            >
                                Choose {selectedPlan.name}
                            </Button>
                        </Card>
                    )}
                </div>
            </section>
        </div>
    );
};
