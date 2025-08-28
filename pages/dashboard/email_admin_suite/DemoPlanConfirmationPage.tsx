

import React, { useState, useEffect } from 'react';
import { Card, Button, Icon } from '@/components/ui';
import { PLANS } from '../../pricing/constants';
import type { PricingPlan } from '@/types';

interface DemoPlanConfirmationPageProps {
  onContinue: () => void;
}

export const DemoPlanConfirmationPage: React.FC<DemoPlanConfirmationPageProps> = ({ onContinue }) => {
    const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

    useEffect(() => {
        const planId = sessionStorage.getItem('demoUserPlanId');
        if (planId) {
            const plan = PLANS.find(p => p.id === planId);
            setSelectedPlan(plan || null);
        }
    }, []);

    if (!selectedPlan) {
        return (
            <Card>
                <div className="text-center p-10">
                    <p>No plan selected. Please go back and choose a plan.</p>
                </div>
            </Card>
        );
    }
    
    return (
        <Card>
            <div className="text-center p-10">
                <Icon name="fas fa-check-circle" className="text-5xl text-green-500 mb-4" />
                <h2 className="text-2xl font-bold">You've selected the <span className="text-[#679a41] dark:text-emerald-400">{selectedPlan.name}</span>!</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    You can now explore the features of the Email Admin Suite with this plan's capabilities.
                </p>
                <Button onClick={onContinue} className="mt-8" size="lg">
                    Continue to Dashboard
                </Button>
            </div>
        </Card>
    );
};