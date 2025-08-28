import React, { useState, useMemo, useEffect } from 'react';
import { Card, FormField, Button, Icon, CollapsibleSection, LineChart, BarChart, MultiSegmentDoughnutChart, StatCard, Pagination, Modal, Spinner } from '@/components/ui';
import { mockSmtpLogs } from '@/data';
import type { SmtpLogEntry, SmtpLogAction, SmtpLogStatus, AIAnalysisResult } from '@/types';
import { GoogleGenAI, Type } from "@google/genai";
import { Link } from 'react-router-dom';
import { useAppLayout, useAuth } from '@/context';


let ai: GoogleGenAI | null = null;
try {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
} catch (e) {
  console.error("Gemini API key not found. AI features will be disabled.", e);
}


const SMTP_ACTIONS: SmtpLogAction[] = ['PASS', 'DELIVER', 'ARCHIVE', 'QUARANTINE', 'REJECT'];
const SMTP_STATUSES: SmtpLogStatus[] = ['Passed', 'Archived', 'Rejected (Data)', 'Rejected (Block)', 'Spam (Confirmed)', 'Spam (Scam)', 'Rejected (Suspect)', 'User Invalid'];

interface Filters {
    from: string;
    to: string;
    subject: string;
    action: SmtpLogAction | 'ALL';
    dateFrom: string;
    dateTo: string;
    statuses: SmtpLogStatus[];
}

const initialFilters: Filters = {
    from: '',
    to: '',
    subject: '',
    action: 'ALL',
    dateFrom: '',
    dateTo: '',
    statuses: [],
};

// Mock data for new dashboard widgets
const topThreatSources = [
    { ip: '192.168.1.100', location: 'Unknown', attempts: 45, risk: 'High' },
    { ip: '203.0.113.5', location: 'Russia', attempts: 38, risk: 'Critical' },
    { ip: '198.51.100.2', location: 'China', attempts: 32, risk: 'High' },
    { ip: '172.16.0.50', location: 'Nigeria', attempts: 28, risk: 'Medium' },
    { ip: '10.0.0.15', location: 'Brazil', attempts: 21, risk: 'Medium' },
];

const threatDistributionData = [
    { label: 'Phishing', value: 800, color: '#f59e0b' },
    { label: 'Malware', value: 400, color: '#ef4444' },
    { label: 'Spam', value: 1500, color: '#3b82f6' },
    { label: 'Spoofing', value: 147, color: '#8b5cf6' },
];

const topActiveUsers = [
    { initials: 'AD', name: 'Administrator', email: 'administrator@fzeo.online', sent: 2847, received: 3201, status: 'active', risk: 'low risk' },
    { initials: 'IO', name: 'Islam Odaa', email: 'eng.islam.odaa@gmail.com', sent: 1523, received: 2156, status: 'active', risk: 'medium risk' },
    { initials: 'ST', name: 'Support Team', email: 'support@fzeo.online', sent: 3421, received: 1876, status: 'active', risk: 'low risk' },
    { initials: 'SE', name: 'Security Team', email: 'security@fzeo.online', sent: 892, received: 445, status: 'monitoring', risk: 'low risk' },
    { initials: 'SA', name: 'Sales Team', email: 'sales@fzeo.online', sent: 2105, received: 3442, status: 'active', risk: 'high risk' },
];

const liveActivityFeed = [
    { icon: 'fas fa-shield-alt', type: 'critical', title: 'Phishing attempt blocked', description: 'Suspicious email from external domain blocked', time: '2 minutes ago', user: 'administrator@fzeo.online' },
    { icon: 'fas fa-envelope-open-text', type: 'info', title: 'Bulk email processed', description: '127 emails successfully delivered to gmail-smtp-in.l.google.com', time: '5 minutes ago' },
    { icon: 'fas fa-shield-virus', type: 'info', title: 'Spam filter updated', description: 'New malware signatures added to detection engine', time: '12 minutes ago' },
    { icon: 'fas fa-user-secret', type: 'warning', title: 'Unusual login pattern', description: 'Login from a new device in a different country', time: '28 minutes ago', user: 'sales@fzeo.online' },
];


interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (newFilters: Filters) => void;
    onClear: () => void;
    currentFilters: Filters;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, onApply, onClear, currentFilters }) => {
    const [localFilters, setLocalFilters] = useState<Filters>(currentFilters);

    useEffect(() => {
        if (isOpen) {
            setLocalFilters(currentFilters);
        }
    }, [isOpen, currentFilters]);
    
    const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (status: SmtpLogStatus, checked: boolean) => {
        setLocalFilters(prev => {
            const newStatuses = checked
                ? [...prev.statuses, status]
                : prev.statuses.filter(s => s !== status);
            return { ...prev, statuses: newStatuses };
        });
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleClear = () => {
        onClear();
        onClose();
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/60 z-[59]" onClick={onClose} aria-hidden="true" />}
            <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#f8f8f8] dark:bg-slate-800 shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                    <h2 id="filter-panel-title" className="text-lg font-semibold text-[#293c51] dark:text-gray-100 flex items-center">
                        <Icon name="fas fa-filter" className="mr-2" />
                        Filter SMTP Logs
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-slate-700" aria-label="Close filters">
                        <Icon name="fas fa-times" className="text-xl" />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField id="from" name="from" label="Email From" value={localFilters.from} onChange={handleLocalChange} placeholder="user@example.com" />
                        <FormField id="to" name="to" label="Email To" value={localFilters.to} onChange={handleLocalChange} placeholder="recipient@example.com" />
                    </div>
                    <FormField id="subject" name="subject" label="Subject" value={localFilters.subject} onChange={handleLocalChange} placeholder="e.g., Invoice, Report" />
                    <FormField as="select" id="action" name="action" label="Action" value={localFilters.action} onChange={handleLocalChange}>
                        <option value="ALL">All Actions</option>
                        {SMTP_ACTIONS.map(action => <option key={action} value={action}>{action}</option>)}
                    </FormField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField id="dateFrom" name="dateFrom" label="Date From" type="date" value={localFilters.dateFrom} onChange={handleLocalChange} />
                        <FormField id="dateTo" name="dateTo" label="Date To" type="date" value={localFilters.dateTo} onChange={handleLocalChange} />
                    </div>

                    <CollapsibleSection title="Filter by Status" initialOpen={true}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-2">
                            {SMTP_STATUSES.map(status => (
                                <FormField
                                    key={status}
                                    type="checkbox"
                                    id={`status-${status}`}
                                    name={status}
                                    label={status}
                                    checked={localFilters.statuses.includes(status)}
                                    onChange={(e) => handleStatusChange(status, (e.target as HTMLInputElement).checked)}
                                />
                            ))}
                        </div>
                    </CollapsibleSection>
                </div>

                <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-x-2 flex justify-end">
                    <Button variant="outline" onClick={handleClear}>Clear Filters</Button>
                    <Button onClick={handleApply}>Apply Filters</Button>
                </div>
            </div>
        </>
    );
};

const VerificationRequiredRow: React.FC<{ colSpan: number }> = ({ colSpan }) => (
    <tr>
        <td colSpan={colSpan} className="text-center py-10">
            <Icon name="fas fa-lock" className="text-3xl text-yellow-500 mb-3" />
            <p className="font-semibold text-lg text-[#293c51] dark:text-gray-200">Domain Verification Required</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Please verify your domain to access this feature.
                <Link to="/app/email-admin-suite/orgs-and-domains" className="ml-2 font-semibold text-[#679a41] dark:text-emerald-400 hover:underline">
                    Verify Now
                </Link>
            </p>
        </td>
    </tr>
);


export const EmailAdminSmtpLogsPage: React.FC = () => {
    const { isDomainVerifiedForDemo } = useAppLayout();
    const { user } = useAuth();
    const isNewDemoUser = user?.email === 'new.user@worldposta.com';
    const isDisabled = isNewDemoUser && !isDomainVerifiedForDemo;

    const [activeTab, setActiveTab] = useState('statistics');
    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [logs] = useState<SmtpLogEntry[]>(mockSmtpLogs);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const handleApplyFilters = (newFilters: Filters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters(initialFilters);
        setCurrentPage(1);
    };

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            if (filters.from && !log.from.toLowerCase().includes(filters.from.toLowerCase())) return false;
            if (filters.to && !log.to.toLowerCase().includes(filters.to.toLowerCase())) return false;
            if (filters.subject && !log.subject.toLowerCase().includes(filters.subject.toLowerCase())) return false;
            if (filters.action !== 'ALL' && log.action !== filters.action) return false;
            if (filters.statuses.length > 0 && !filters.statuses.includes(log.status)) return false;

            const logDate = new Date(log.timestamp);
            if (filters.dateFrom && logDate < new Date(filters.dateFrom)) return false;
            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (logDate > toDate) return false;
            }
            return true;
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [logs, filters]);

    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return filteredLogs.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredLogs, currentPage, rowsPerPage]);
    
    const mailFlowData = useMemo(() => ({
        labels: ['Jul 16', 'Jul 17', 'Jul 18', 'Jul 19', 'Jul 20', 'Jul 21', 'Jul 22'],
        data: [
            { name: 'Total Emails', color: '#3b82f6', points: [2500, 1500, 3200, 3100, 4200, 3800, 4000] },
            { name: 'Legitimate', color: '#10b981', points: [2200, 1400, 2800, 2900, 3800, 3500, 3600] },
            { name: 'Threats', color: '#ef4444', points: [100, 120, 150, 130, 180, 160, 170] },
        ]
    }), []);
    
    const emailClassificationData = useMemo(() => [
        { label: 'Legitimate', value: 124998, color: '#22c55e' },
        { label: 'Spam', value: 1500, color: '#f59e0b' },
        { label: 'Phishing', value: 800, color: '#ef4444' },
        { label: 'Quarantined', value: 400, color: '#8b5cf6' },
    ], []);

    // Helper functions for rendering tags
    const getRiskTagClass = (risk: string) => {
        switch (risk.toLowerCase()) {
            case 'critical': return 'bg-red-600 text-white';
            case 'high': return 'bg-yellow-500 text-white';
            case 'medium': return 'bg-blue-500 text-white';
            case 'low risk': return 'bg-green-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };
    const getStatusTagClass = (status: string) => {
        return status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
    };

    const getFeedIconClass = (type: string) => {
        switch (type) {
            case 'critical': return 'bg-red-100 text-red-600';
            case 'warning': return 'bg-yellow-100 text-yellow-600';
            case 'info':
            default: return 'bg-blue-100 text-blue-600';
        }
    };
    
    const getStatusChipClass = (status: SmtpLogStatus) => {
        const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
        switch (status) {
            case 'Passed':
                return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
            case 'Archived':
                return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`;
            case 'Rejected (Data)':
            case 'Rejected (Block)':
            case 'Spam (Confirmed)':
            case 'Spam (Scam)':
                return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
            case 'Rejected (Suspect)':
                return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`;
            case 'User Invalid':
                return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
            default:
                return baseClasses;
        }
    };

    const handleAnalyzeLogs = async () => {
        if (!ai) {
            alert("AI features are not available. Please check your API key.");
            return;
        }
        setIsAnalysisModalOpen(true);
        setIsAnalyzing(true);
        setAnalysisResult(null);
        setAnalysisError(null);

        try {
            const logsToAnalyze = filteredLogs.slice(0, 30);
            const logsString = logsToAnalyze.map(log => 
                `Time: ${log.timestamp}, From: ${log.from}, To: ${log.to}, Subject: ${log.subject}, Action: ${log.action}, Status: ${log.status}, Details: ${log.details}`
            ).join('\n');

            if (logsString.trim() === '') {
                setAnalysisResult({
                    summary: "There are no logs in the current view to analyze.",
                    trends: [],
                    securityEvents: [],
                    recommendations: ["Try adjusting your filters to see some data."]
                });
                setIsAnalyzing(false);
                return;
            }

            const prompt = `As a senior email security analyst, analyze the following SMTP log data. Provide a concise summary, identify key trends, point out notable security events, and give actionable recommendations. The data is:\n\n${logsString}`;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING, description: "A brief, high-level summary of the log data." },
                            trends: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Observable patterns or trends, like repeated senders or high volume from an IP." },
                            securityEvents: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific, noteworthy security-related events like blocked phishing attempts." },
                            recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable steps an administrator should consider based on the analysis." }
                        }
                    }
                }
            });

            const resultText = response.text.trim();
            const resultJson = JSON.parse(resultText);
            setAnalysisResult(resultJson);

        } catch (error) {
            console.error("Error analyzing logs with Gemini:", error);
            setAnalysisError("Failed to analyze logs. The AI service may be unavailable. Please try again later.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const AnalysisModalContent = () => {
        if (isAnalyzing) {
            return (
                <div className="text-center py-10">
                    <Spinner size="lg" />
                    <p className="mt-4 text-lg font-semibold text-[#293c51] dark:text-gray-200">Analyzing Logs...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">The AI is identifying patterns and anomalies.</p>
                </div>
            );
        }

        if (analysisError) {
            return (
                <div className="text-center py-10">
                     <Icon name="fas fa-exclamation-triangle" className="text-4xl text-red-500 mb-4" />
                    <p className="mt-4 text-lg font-semibold text-red-600 dark:text-red-400">Analysis Failed</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{analysisError}</p>
                    <Button onClick={handleAnalyzeLogs}>Try Again</Button>
                </div>
            );
        }

        if (analysisResult) {
            return (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <h4 className="font-semibold text-lg flex items-center gap-2 text-[#293c51] dark:text-gray-100"><Icon name="fas fa-file-alt" /> Executive Summary</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 pl-6">{analysisResult.summary}</p>
                    </div>
                    {analysisResult.trends.length > 0 && <div>
                        <h4 className="font-semibold text-lg flex items-center gap-2 text-[#293c51] dark:text-gray-100"><Icon name="fas fa-chart-line" /> Key Trends</h4>
                        <ul className="list-disc list-inside pl-6 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            {analysisResult.trends.map((item, i) => <li key={`trend-${i}`}>{item}</li>)}
                        </ul>
                    </div>}
                     {analysisResult.securityEvents.length > 0 && <div>
                        <h4 className="font-semibold text-lg flex items-center gap-2 text-[#293c51] dark:text-gray-100"><Icon name="fas fa-shield-alt" /> Notable Security Events</h4>
                        <ul className="list-disc list-inside pl-6 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            {analysisResult.securityEvents.map((item, i) => <li key={`event-${i}`}>{item}</li>)}
                        </ul>
                    </div>}
                     {analysisResult.recommendations.length > 0 && <div>
                        <h4 className="font-semibold text-lg flex items-center gap-2 text-[#293c51] dark:text-gray-100"><Icon name="fas fa-lightbulb" /> Recommendations</h4>
                        <ul className="list-disc list-inside pl-6 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            {analysisResult.recommendations.map((item, i) => <li key={`rec-${i}`}>{item}</li>)}
                        </ul>
                    </div>}
                </div>
            )
        }
        return null;
    }


    return (
        <div className="space-y-6">
            <div role="tablist" className="inline-flex space-x-1 p-1 bg-gray-200/50 dark:bg-slate-700/50 rounded-lg">
                <button
                    role="tab"
                    aria-selected={activeTab === 'statistics'}
                    onClick={() => setActiveTab('statistics')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#679a41] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                        activeTab === 'statistics'
                            ? 'bg-white dark:bg-slate-800 text-[#679a41] dark:text-emerald-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-[#293c51] dark:hover:text-gray-100'
                    }`}
                >
                    Statistics
                </button>
                <button
                    role="tab"
                    aria-selected={activeTab === 'logs'}
                    onClick={() => setActiveTab('logs')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#679a41] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                        activeTab === 'logs'
                            ? 'bg-white dark:bg-slate-800 text-[#679a41] dark:text-emerald-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-[#293c51] dark:hover:text-gray-100'
                    }`}
                >
                    SMTP Logs
                </button>
            </div>
            
            {activeTab === 'statistics' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <StatCard title="Total Emails" metric={isDisabled ? "0" : "127,845"} change={isDisabled ? "N/A" : "+12.5%"} changeType="increase" iconName="fas fa-envelope" iconColor="text-indigo-500" />
                        <StatCard title="Security Score" metric={isDisabled ? "N/A" : "98.2%"} change={isDisabled ? "N/A" : "+2.1%"} changeType="increase" iconName="fas fa-shield-alt" iconColor="text-green-500" />
                        <StatCard title="Threats Blocked" metric={isDisabled ? "0" : "2,847"} change={isDisabled ? "N/A" : "-15.3%"} changeType="decrease" iconName="fas fa-exclamation-triangle" iconColor="text-yellow-500" />
                        <StatCard title="Legitimate Emails" metric={isDisabled ? "0" : "124,998"} change={isDisabled ? "N/A" : "+14.2%"} changeType="increase" iconName="fas fa-check-circle" iconColor="text-green-500" />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card title="Email Traffic Trends" className="lg:col-span-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">Daily email volume and security metrics over the past week</p>
                            <LineChart data={isDisabled ? [] : mailFlowData.data} labels={mailFlowData.labels} />
                        </Card>

                        <Card title="Email Classification" className="lg:col-span-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">Distribution of email types processed today</p>
                            <div className="flex flex-col items-center">
                                <MultiSegmentDoughnutChart segments={isDisabled ? [] : emailClassificationData} showTotal={false} strokeWidth={25} size={200} />
                                <div className="mt-4 w-full space-y-2 text-sm">
                                    {emailClassificationData.map(segment => (
                                        <div key={segment.label} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <span className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: segment.color }}></span>
                                                <span className="text-gray-600 dark:text-gray-400">{segment.label}</span>
                                            </div>
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">{isDisabled ? "0" : segment.value.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                        
                        <Card title="Threat Distribution" className="lg:col-span-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">{isDisabled ? "0" : threatDistributionData.reduce((sum, item) => sum + item.value, 0).toLocaleString()} threats detected today</p>
                            <BarChart data={isDisabled ? [] : threatDistributionData} />
                        </Card>

                        <Card title="Top Threat Sources" className="lg:col-span-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">Most active suspicious IP addresses</p>
                            <div className="space-y-2">
                                {isDisabled ? (
                                    <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                                        <Icon name="fas fa-lock" className="mb-2 text-xl" />
                                        <p>Data unavailable. Verify domain to see threat sources.</p>
                                    </div>
                                ) : topThreatSources.map((source, index) => (
                                    <div key={index} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                        <div className="flex-grow">
                                            <p className="font-semibold text-[#293c51] dark:text-gray-100">{source.ip}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{source.location} • {source.attempts} attempts</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskTagClass(source.risk)}`}>{source.risk}</span>
                                        <Button size="icon" variant="ghost" onClick={() => alert(`Blocking IP: ${source.ip}`)} title={`Block ${source.ip}`} className="ml-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                                            <Icon name="fas fa-ban" />
                                        </Button>
                                        <span className="ml-2 w-6 text-right font-bold text-gray-400 dark:text-gray-500">{index + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card title="Top Active Users" className="lg:col-span-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">Most active email users and their activity patterns</p>
                            <div className="space-y-2">
                                {isDisabled ? (
                                    <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                                        <Icon name="fas fa-lock" className="mb-2 text-xl" />
                                        <p>Data unavailable. Verify domain to see active users.</p>
                                    </div>
                                ) : topActiveUsers.map((user, index) => (
                                    <div key={index} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm mr-3">{user.initials}</div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-[#293c51] dark:text-gray-100">{user.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"><Icon name="fas fa-arrow-up"/> {user.sent} sent <Icon name="fas fa-arrow-down" className="ml-2"/> {user.received} received</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusTagClass(user.status)}`}>{user.status}</span>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskTagClass(user.risk)}`}>{user.risk}</span>
                                        </div>
                                        <span className="ml-4 w-6 text-right font-bold text-gray-400 dark:text-gray-500">{index + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card title="Live Activity Feed" className="lg:col-span-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">Real-time security events and email processing updates</p>
                            <div className="space-y-3">
                                {isDisabled ? (
                                    <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                                        <Icon name="fas fa-lock" className="mb-2 text-xl" />
                                        <p>Feed is offline. Verify domain to enable.</p>
                                    </div>
                                ) : liveActivityFeed.map((item, index) => (
                                    <div key={index} className="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${getFeedIconClass(item.type)}`}>
                                            <Icon name={item.icon} />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-[#293c51] dark:text-gray-100">
                                                {item.title} 
                                                <span className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full ${getRiskTagClass(item.type)} capitalize`}>{item.type}</span>
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                                            <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mt-1 gap-4">
                                                <span><Icon name="far fa-clock" className="mr-1" />{item.time}</span>
                                                {item.user && <span><Icon name="far fa-user" className="mr-1" />{item.user}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            )}
            
            {activeTab === 'logs' && (
                <Card 
                    title="SMTP Log Explorer"
                    titleActions={
                         <div className="flex items-center gap-2">
                             <Button onClick={() => setIsFilterPanelOpen(true)} leftIconName="fas fa-filter" variant="outline" disabled={isDisabled}>
                                Filter Logs
                            </Button>
                            <Button
                                onClick={handleAnalyzeLogs}
                                leftIconName="fas fa-wand-magic-sparkles"
                                disabled={isAnalyzing || !ai || isDisabled}
                                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-transparent hover:shadow-lg hover:shadow-purple-500/50 transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out"
                            >
                                Analyze with AI
                            </Button>
                         </div>
                    }
                >
                    <div>
                        <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Timestamp</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">From</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">To</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Subject</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Action</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {isDisabled ? (
                                        <VerificationRequiredRow colSpan={6} />
                                    ) : paginatedLogs.map(log => {
                                        return (
                                            <tr key={log.id}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-[#293c51] dark:text-gray-200">{log.from}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-[#293c51] dark:text-gray-200">{log.to}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{log.subject}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold">{log.action}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <span className={getStatusChipClass(log.status)}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {!isDisabled && filteredLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                                No logs match your filter criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                             {!isDisabled && <Pagination
                                currentPage={currentPage}
                                totalItems={filteredLogs.length}
                                itemsPerPage={rowsPerPage}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={(value) => {
                                    setRowsPerPage(value);
                                    setCurrentPage(1);
                                }}
                            />}
                        </div>
                    </div>
                </Card>
            )}
            
            <FilterPanel 
                isOpen={isFilterPanelOpen}
                onClose={() => setIsFilterPanelOpen(false)}
                onApply={handleApplyFilters}
                onClear={clearFilters}
                currentFilters={filters}
            />

            <Modal
                isOpen={isAnalysisModalOpen}
                onClose={() => setIsAnalysisModalOpen(false)}
                title="AI Log Analysis"
                size="2xl"
                footer={<Button variant="ghost" onClick={() => setIsAnalysisModalOpen(false)}>Close</Button>}
            >
                <AnalysisModalContent />
            </Modal>
        </div>
    );
};