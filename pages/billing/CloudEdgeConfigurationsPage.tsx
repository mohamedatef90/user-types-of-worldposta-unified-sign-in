import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Icon, Stepper } from '@/components/ui';
import type { CloudEdgeConfiguration } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const CONFIG_STORAGE_KEY = 'cloudEdgeConfigurations';

interface ConfigurationItemCardProps {
  config: CloudEdgeConfiguration;
  onEdit: (configId: string) => void;
  onRemove: (configId: string) => void;
}

const ConfigurationItemCard: React.FC<ConfigurationItemCardProps> = ({ config, onEdit, onRemove }) => {
  return (
    <Card className="mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-[#293c51] dark:text-gray-100">{config.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Type: {config.type} | Qty: {config.quantity} | Term: {`${config.subscriptionTermValue} ${config.subscriptionTermUnit}${config.subscriptionTermValue > 1 ? 's' : ''}`}</p>
        </div>
        <div className="flex space-x-2">
            <Button size="icon" variant="ghost" onClick={() => onEdit(config.id)} title="Edit">
                 <Icon name="fas fa-pencil-alt" aria-label="Edit configuration" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onRemove(config.id)} title="Remove">
                <Icon name="fas fa-trash-alt" className="text-red-500 dark:text-red-400" aria-label="Remove configuration"/>
            </Button>
        </div>
      </div>
      <p className="text-right mt-2 font-semibold text-lg text-[#679a41] dark:text-emerald-400">${config.unitSubtotalMonthly.toFixed(2)} <span className="text-xs text-gray-500 dark:text-gray-400">/mo</span></p>
    </Card>
  );
};

const EstimateSummaryCard: React.FC<{ configurations: CloudEdgeConfiguration[] }> = ({ configurations }) => {
  const totalMonthlyEstimate = useMemo(() => {
    return configurations.reduce((sum, config) => sum + config.unitSubtotalMonthly, 0);
  }, [configurations]);

  if (configurations.length === 0) {
    return (
      <Card title="Estimate Summary">
        <p className="text-gray-500 dark:text-gray-400">No configurations added to estimate.</p>
      </Card>
    );
  }

  return (
    <Card title="Estimate Summary" className="sticky top-20">
      {configurations.map(config => (
        <div key={config.id} className="py-2 border-b dark:border-gray-700 last:border-b-0">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#293c51] dark:text-gray-200">{config.name} (x{config.quantity})</span>
            <span className="text-sm font-medium text-[#293c51] dark:text-gray-100">${config.unitSubtotalMonthly.toFixed(2)}</span>
          </div>
        </div>
      ))}
      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <div className="flex justify-between font-bold text-xl text-[#293c51] dark:text-gray-100">
          <span>Total Monthly Estimate:</span>
          <span>${totalMonthlyEstimate.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
};


const PaymentStep: React.FC<{
    configurations: CloudEdgeConfiguration[], 
    totalAmount: number, 
    onBack: () => void, 
    onPay: () => void
}> = ({ configurations, totalAmount, onBack, onPay }) => {
    const [isPaying, setIsPaying] = useState(false);

    const handlePaymentRedirect = () => {
        setIsPaying(true);
        window.open('https://stripe.com/', '_blank', 'noopener,noreferrer');
        
        setTimeout(() => {
            onPay();
        }, 2000); 
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <Card title="Order Summary">
                    <ul className="space-y-3">
                        {configurations.map(config => (
                            <li key={config.id} className="flex justify-between items-start text-sm">
                                <div>
                                    <p className="font-medium text-[#293c51] dark:text-gray-200">{config.name} x {config.quantity}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{`${config.subscriptionTermValue} ${config.subscriptionTermUnit}${config.subscriptionTermValue > 1 ? 's' : ''}`}</p>
                                </div>
                                <p className="font-semibold text-gray-700 dark:text-gray-300">${config.unitSubtotalMonthly.toFixed(2)}</p>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-baseline">
                        <span className="text-lg font-bold text-[#293c51] dark:text-gray-100">Total</span>
                        <span className="text-2xl font-bold text-[#679a41] dark:text-emerald-400">${totalAmount.toFixed(2)}/mo</span>
                    </div>
                </Card>
            </div>
            <div>
                 <Card title="Payment Details">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">Continue your payment securely with Stripe Financial.</p>
                        <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png" 
                            alt="Stripe Logo" 
                            className="h-12 object-contain"
                        />
                        <div className="flex items-start text-left text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                            <Icon name="fas fa-lock" className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                            <p>
                                You will be redirected to Stripe to complete your payment. We do not store any of your personal details or credit card information on our servers.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button type="button" variant="outline" onClick={onBack} disabled={isPaying}>Back to Configuration</Button>
                        <Button onClick={handlePaymentRedirect} isLoading={isPaying} disabled={isPaying}>
                            {isPaying ? 'Processing...' : 'Pay with Stripe'}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const ConfirmationStep: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    const orderId = useMemo(() => `WP-CEDGE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, []);
    return (
        <Card className="text-center py-10">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="fas fa-check" className="text-3xl text-green-600 dark:text-green-400"/>
            </div>
            <h2 className="text-2xl font-bold text-[#293c51] dark:text-gray-100">Payment Successful!</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Your CloudEdge services are now being provisioned.</p>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">Order ID: <span className="font-mono text-gray-700 dark:text-gray-300">{orderId}</span></p>
            <Button onClick={onFinish} className="mt-8">Create New Estimate</Button>
        </Card>
    );
};


export const CloudEdgeConfigurationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [configurations, setConfigurations] = useState<CloudEdgeConfiguration[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const savedConfigs = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (savedConfigs) {
      setConfigurations(JSON.parse(savedConfigs));
    }
  }, []);
  
  const handleEditConfiguration = (configId: string) => {
    navigate(`/app/billing/cloudedge-configurations/edit/${configId}`);
  };
  
  const handleRemoveConfiguration = (configId: string) => {
    const updatedConfigs = configurations.filter(c => c.id !== configId);
    setConfigurations(updatedConfigs);
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updatedConfigs));
  };

  const openAddPage = () => {
    navigate('/app/billing/cloudedge-configurations/add');
  }

  const totalMonthlyEstimate = useMemo(() => {
    return configurations.reduce((sum, config) => sum + config.unitSubtotalMonthly, 0);
  }, [configurations]);

  const resetFlow = useCallback(() => {
    setConfigurations([]);
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    setCurrentStep(0);
  }, []);

  const steps = [
    { name: 'Summary' },
    { name: 'Payment' },
    { name: 'Confirmation' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">CloudEdge Configurations</h1>
      
      <div className="w-full md:w-3/4 lg:w-1/2 mx-auto">
        <Stepper steps={steps} currentStep={currentStep} className="my-8" />
      </div>

      {currentStep === 0 && (
        <>
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-3/5">
                    <Card>
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                            <h2 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">Your Configurations</h2>
                            <div className="flex items-center gap-4">
                                <Button onClick={openAddPage} leftIconName="fas fa-plus">Add Configuration</Button>
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t dark:border-slate-700">
                            {configurations.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 py-4 text-center">
                                    No configurations added yet. Click "Add Configuration" to get started.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {configurations.map(config => (
                                        <ConfigurationItemCard key={config.id} config={config} onEdit={handleEditConfiguration} onRemove={handleRemoveConfiguration} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
                <div className="lg:w-2/5">
                    <EstimateSummaryCard configurations={configurations} />
                </div>
            </div>
                
            <div className="mt-8 flex justify-end pt-4 border-t dark:border-slate-700">
                <Button 
                    onClick={() => setCurrentStep(1)} 
                    disabled={configurations.length === 0}
                    leftIconName="fas fa-credit-card"
                    leftIconClassName="w-5 h-5"
                >
                    Proceed to Payment
                </Button>
            </div>
        </>
      )}

      {currentStep === 1 && (
        <PaymentStep
            configurations={configurations}
            totalAmount={totalMonthlyEstimate}
            onBack={() => setCurrentStep(0)}
            onPay={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 2 &&(
          <ConfirmationStep onFinish={resetFlow} />
      )}
    </div>
  );
};