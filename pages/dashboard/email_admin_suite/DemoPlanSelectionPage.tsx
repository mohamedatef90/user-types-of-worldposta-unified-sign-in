import React, { useState, useMemo, useEffect } from 'react';
import { Button, Card, FormField, Icon } from '@/components/ui';
import { PLANS } from '../../pricing/constants';
import type { PricingPlan } from '@/types';

interface DemoPlanSelectionPageProps {
  onPlanSelect: (planId: string) => void;
}

export const DemoPlanSelectionPage: React.FC<DemoPlanSelectionPageProps> = ({ onPlanSelect }) => {
    const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
        return sessionStorage.getItem('demoUserPlanId') || '';
    });
    
    // Auto-select the recommended plan if none is pre-selected
    useEffect(() => {
        if (!selectedPlanId) {
            const recommendedPlan = PLANS.find(p => p.isRecommended);
            if (recommendedPlan) {
                setSelectedPlanId(recommendedPlan.id);
            }
        }
    }, [selectedPlanId]);


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
        return plan.priceMonthly;
    };

    return (
        <div className="bg-gray-50 dark:bg-slate-900/50 p-6 md:p-8 rounded-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                {/* Left Column: Controls */}
                <div className="lg:sticky lg:top-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#293c51] dark:text-gray-100">Choose a Plan to Start Your Demo</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Select any plan to explore the features of the Email Admin Suite.</p>
                    
                    <div className="mt-8">
                        <FormField
                            id="plan-select"
                            name="plan-select"
                            label="Select a Plan"
                            as="select"
                            value={selectedPlanId}
                            onChange={(e) => setSelectedPlanId(e.target.value)}
                            inputClassName="text-lg"
                        >
                            <option value="">-- Choose a plan --</option>
                            {PLANS.map(plan => (
                                <option key={plan.id} value={plan.id}>{plan.name}</option>
                            ))}
                        </FormField>
                    </div>
                </div>

                {/* Right Column: Plan Details */}
                <div>
                    {selectedPlan ? (
                        <Card className="animate-fade-in">
                             <div className="text-center">
                                <h2 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">{selectedPlan.name}</h2>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">{selectedPlan.description}</p>
                                <div className="my-4">
                                    <span className="text-5xl font-extrabold text-[#293c51] dark:text-gray-100">${getPrice(selectedPlan).toFixed(2)}</span>
                                    <span className="ml-1.5 text-lg text-gray-500 dark:text-gray-400">/user/month</span>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Billed monthly
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
                    ) : (
                        <Card className="h-full flex items-center justify-center min-h-[400px] border-2 border-dashed dark:border-gray-700">
                            <div className="text-center text-gray-500 dark:text-gray-400">
                                <Icon name="fas fa-hand-pointer" className="text-4xl mb-4" />
                                <p className="font-semibold">Select a plan to see its details</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};