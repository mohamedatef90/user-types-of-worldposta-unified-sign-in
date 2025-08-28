
import React, { useState, useEffect } from 'react';
import { Card, Button, Icon } from '@/components/ui';
import { PLANS } from '../../pricing/constants';
import type { PricingPlan } from '@/types';
import { useNavigate } from 'react-router-dom';

export const DemoBillingPage: React.FC = () => {
    const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const planId = sessionStorage.getItem('demoUserPlanId');
        if (planId) {
            const plan = PLANS.find(p => p.id === planId);
            setSelectedPlan(plan || null);
        }
    }, []);

    const handleActivate = () => {
        // This will navigate to the main subscription page for the selected plan
        if (selectedPlan) {
            navigate(`/app/billing/email-subscriptions?plan=${selectedPlan.id}`);
        }
    };

    if (!selectedPlan) {
        return (
            <Card>
                <div className="text-center p-10">
                    <Icon name="fas fa-info-circle" className="text-3xl text-blue-500 mb-4" />
                    <h2 className="text-xl font-bold">No Plan Selected</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Please go back to the dashboard to select a demo plan first.
                    </p>
                    <Button onClick={() => navigate('/app/email-admin-suite')} className="mt-6">
                        Back to Dashboard
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Current Plan (Free Trial)">
            <div className="p-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h3 className="text-2xl font-bold text-green-800 dark:text-green-300">{selectedPlan.name}</h3>
                        <p className="text-green-700 dark:text-green-400 mt-1">{selectedPlan.description}</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <Button onClick={handleActivate} size="lg">
                            <Icon name="fas fa-bolt" className="mr-2" />
                            Activate Now
                        </Button>
                    </div>
                </div>
                 <div className="mt-4 pt-4 border-t border-green-300 dark:border-green-600/50">
                    <h4 className="font-semibold mb-2 text-green-800 dark:text-green-300">Trial Plan Features:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-green-700 dark:text-green-400">
                        {selectedPlan.features.filter(f => !f.startsWith('Everything in')).slice(0, 5).map(feature => (
                            <li key={feature}>{feature}</li>
                        ))}
                         {selectedPlan.features.length > 5 && <li>And more...</li>}
                    </ul>
                </div>
            </div>
        </Card>
    );
};
