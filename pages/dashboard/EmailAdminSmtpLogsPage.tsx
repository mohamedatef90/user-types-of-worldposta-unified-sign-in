
import React, { useState, useMemo, useEffect } from 'react';
import { Card, FormField, Button, Icon, CollapsibleSection, LineChart, BarChart, MultiSegmentDoughnutChart, StatCard, Pagination, Modal, Spinner } from '@/components/ui';
import { mockSmtpLogs, mockMailboxDomains } from '@/data';
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
    
    // Global filter for the statistics section
    const [globalPeriod, setGlobalPeriod] = useState('1w');
    // Domain filter
    const [selectedDomain, setSelectedDomain] = useState('ALL');

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
    
    // Scale factor based on period (weeks) and domain (simulate filtering)
    const scaleFactor = useMemo(() => {
        const weekScale = parseInt(globalPeriod[0]);
        const domainScale = selectedDomain === 'ALL' ? 1.0 : 0.35; // Simulate filtered data
        return weekScale * domainScale;
    }, [globalPeriod, selectedDomain]);

    const mailFlowData = useMemo(() => {
        const weeks = parseInt(globalPeriod[0]);
        const days = weeks * 7;
        const domainMultiplier = selectedDomain === 'ALL' ? 1 : 0.3;
        
        const labels: string[] = [];
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }

        const generatePoints = (base: number[]) => {
            const result = [];
            for (let i = 0; i < days; i++) {
                const baseVal = base[i % base.length] * domainMultiplier;
                result.push(Math.max(0, Math.floor(baseVal + Math.floor(Math.random() * (400 * domainMultiplier)) - (200 * domainMultiplier))));
            }
            return result;
        };

        const baseTotal = [2500, 1500, 3200, 3100, 4200, 3800, 4000];
        const baseLegit = [2200, 1400, 2800, 2900, 3800, 3500, 3600];
        const baseThreats = [100, 120, 150, 130, 180, 160, 170];

        return {
            labels,
            data: [
                { name: 'Total Emails', color: '#3b82f6', points: generatePoints(baseTotal) },
                { name: 'Legitimate', color: '#10b981', points: generatePoints(baseLegit) },
                { name: 'Threats', color: '#ef4444', points: generatePoints(baseThreats) },
            ]
        };
    }, [globalPeriod, selectedDomain]);

    const emailClassificationData = useMemo(() => [
        { label: 'Delivered', value: Math.floor(2943 * scaleFactor), color: '#22c55e' },
        { label: 'Spam Quarantine', value: Math.floor(121 * scaleFactor), color: '#f59e0b' },
        { label: 'Released', value: Math.floor(1 * scaleFactor), color: '#3b82f6' },
        { label: 'Blocked', value: 0, color: '#ef4444' },
        { label: 'Virus Blocked', value: 0, color: '#991b1b' },
        { label: 'Attachment Blocked', value: 0, color: '#b91c1c' },
    ], [scaleFactor]);

    const todaySummary = useMemo(() => {
        const domainMultiplier = selectedDomain === 'ALL' ? 1.0 : 0.25;
        return {
            Blocked: 0,
            Released: Math.floor(1 * domainMultiplier),
            Delivered: Math.floor(51 * domainMultiplier),
            TotalMails: Math.floor(53 * domainMultiplier),
            VirusBlocked: 0,
            SpamQuarantine: Math.floor(1 * domainMultiplier),
            AttachmentBlocked: 0
        };
    }, [selectedDomain]);

    // Update: Filtered based on selected domain
    const topActiveUsers = useMemo(() => {
        const data = [
            { initials: 'DO', name: 'diyaaoda@roaya.co', count: 10, risk: 'low risk' },
            { initials: 'AY', name: 'a.younis@roaya.co', count: 8, risk: 'low risk' },
            { initials: 'AH', name: 'a.hossam@roaya.co', count: 8, risk: 'low risk' },
            { initials: 'OD', name: 'o.diyaa@roaya.co', count: 6, risk: 'low risk' },
            { initials: 'AE', name: 'a.elbeltagy@roaya.co', count: 3, risk: 'low risk' },
            { initials: 'JD', name: 'john.doe@alpha-inc.com', count: 5, risk: 'medium' },
            { initials: 'JS', name: 'jane.smith@alpha-inc.com', count: 4, risk: 'low risk' },
        ];
        
        return data.filter(u => selectedDomain === 'ALL' || u.name.endsWith(`@${selectedDomain}`))
                   .slice(0, 5)
                   .map(u => ({ ...u, count: Math.floor(u.count * (selectedDomain === 'ALL' ? 1.0 : 0.4)) }));
    }, [selectedDomain]);

    const internalContributors = useMemo(() => {
        const data = [
            { initials: 'DO', name: 'diyaaoda@roaya.co', count: 435, risk: 'low risk' },
            { initials: 'AA', name: 'aali@roaya.co', count: 315, risk: 'low risk' },
            { initials: 'AH', name: 'a.hossam@roaya.co', count: 309, risk: 'low risk' },
            { initials: 'AY', name: 'a.younis@roaya.co', count: 307, risk: 'low risk' },
            { initials: 'OD', name: 'o.diyaa@roaya.co', count: 272, risk: 'low risk' },
            { initials: 'JD', name: 'john.doe@alpha-inc.com', count: 120, risk: 'low risk' },
            { initials: 'JS', name: 'jane.smith@alpha-inc.com', count: 98, risk: 'low risk' },
        ];
        
        return data.filter(u => selectedDomain === 'ALL' || u.name.endsWith(`@${selectedDomain}`))
                   .slice(0, 5)
                   .map(u => ({ ...u, count: Math.floor(u.count * scaleFactor) }));
    }, [scaleFactor, selectedDomain]);

    const externalContributors = useMemo(() => {
        const data = [
            { initials: 'NC', name: 'notifications@tasks.clickup.com', count: 703, status: 'external' },
            { initials: 'CX', name: 'cortex@xdr.paloaltonetworks.com', count: 667, status: 'external' },
            { initials: 'NS', name: 'noreply@site24x7.com', count: 553, status: 'external' },
            { initials: 'JW', name: 'jira@worldposta.atlassian.net', count: 171, status: 'external' },
            { initials: 'WS', name: 'wp-support@roaya.co', count: 72, status: 'external' },
            { initials: 'G', name: 'support@google.com', count: 45, status: 'external' },
        ];
        
        // External contributors are not filtered by the domain suffix, but their interaction counts scale
        return data.slice(0, 5).map(u => ({ ...u, count: Math.floor(u.count * scaleFactor) }));
    }, [scaleFactor]);

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
        if (status === 'active') return 'bg-green-100 text-green-700';
        if (status === 'external') return 'bg-blue-100 text-blue-700';
        return 'bg-yellow-100 text-yellow-700';
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
                <div className="space-y-8">
                    {/* TODAY SUMMARY SECTION */}
                    <div>
                        <div className="mb-4 flex justify-between items-center gap-4">
                            <h2 className="text-xl font-bold text-[#293c51] dark:text-gray-100 shrink-0">Today's Summary</h2>
                            <div className="w-full sm:w-64">
                                <FormField
                                    id="domain-select-global"
                                    label=""
                                    as="select"
                                    value={selectedDomain}
                                    onChange={(e) => setSelectedDomain(e.target.value)}
                                    inputClassName="!py-2 !text-sm font-medium shadow-sm border border-gray-300 dark:border-slate-700 rounded-lg"
                                    wrapperClassName="!mb-0"
                                >
                                    <option value="ALL">All emails in current domain</option>
                                    {mockMailboxDomains.map(d => <option key={d} value={d}>{d}</option>)}
                                </FormField>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                            <StatCard className="!p-3" title="Total Mails" metric={isDisabled ? "0" : todaySummary.TotalMails.toLocaleString()} iconName="fas fa-envelope" iconColor="text-indigo-500" />
                            <StatCard className="!p-3" title="Delivered" metric={isDisabled ? "0" : todaySummary.Delivered.toLocaleString()} iconName="fas fa-check-circle" iconColor="text-green-500" />
                            <StatCard className="!p-3" title="Released" metric={isDisabled ? "0" : todaySummary.Released.toLocaleString()} iconName="fas fa-paper-plane" iconColor="text-emerald-500" />
                            <StatCard className="!p-3" title="Spam Quarantine" metric={isDisabled ? "0" : todaySummary.SpamQuarantine.toLocaleString()} iconName="fas fa-shield-virus" iconColor="text-yellow-500" />
                            <StatCard className="!p-3" title="Blocked" metric={isDisabled ? "0" : todaySummary.Blocked.toLocaleString()} iconName="fas fa-ban" iconColor="text-red-500" />
                            <StatCard className="!p-3" title="Virus Blocked" metric={isDisabled ? "0" : todaySummary.VirusBlocked.toLocaleString()} iconName="fas fa-biohazard" iconColor="text-red-700" />
                            <StatCard className="!p-3" title="Attachment Blocked" metric={isDisabled ? "0" : todaySummary.AttachmentBlocked.toLocaleString()} iconName="fas fa-paperclip" iconColor="text-red-400" />
                        </div>
                    </div>

                    {/* PERIODICAL ANALYSIS SECTION (Grouped Cards) */}
                    <div className="bg-white/30 dark:bg-slate-800/20 p-6 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-[#293c51] dark:text-gray-100 flex items-center gap-2">
                                    <Icon name="fas fa-calendar-alt" className="text-[#679a41] dark:text-emerald-400" />
                                    Periodical Analysis {selectedDomain !== 'ALL' && <span className="text-sm font-normal text-gray-500">- Filtered by {selectedDomain}</span>}
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Reviewing metrics across the selected time period</p>
                            </div>
                            <div className="w-full sm:w-48">
                                <FormField
                                    id="global-period-select"
                                    label=""
                                    as="select"
                                    value={globalPeriod}
                                    onChange={(e) => setGlobalPeriod(e.target.value)}
                                    inputClassName="!py-2 !text-sm font-medium shadow-sm"
                                    wrapperClassName="!mb-0"
                                >
                                    <option value="1w">Last 1 Week</option>
                                    <option value="2w">Last 2 Weeks</option>
                                    <option value="3w">Last 3 Weeks</option>
                                    <option value="4w">Last 4 Weeks</option>
                                </FormField>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <Card title="Email Traffic Trends" className="lg:col-span-3">
                                <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">Email volume and security metrics</p>
                                <LineChart data={isDisabled ? [] : mailFlowData.data} labels={mailFlowData.labels} />
                            </Card>

                            <Card title="Email Classification" className="lg:col-span-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">Distribution of email types</p>
                                <div className="flex flex-col items-center">
                                    <MultiSegmentDoughnutChart segments={isDisabled ? [] : emailClassificationData} showTotal={false} strokeWidth={25} size={180} />
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
                                        <div className="pt-2 border-t dark:border-gray-600 flex items-center justify-between font-bold">
                                            <span className="text-gray-700 dark:text-gray-200">Total Mails</span>
                                            <span>{isDisabled ? "0" : Math.floor(3065 * scaleFactor).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card title="Internal Contributors" className="lg:col-span-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">Active internal senders and recipients</p>
                                <div className="space-y-2">
                                    {isDisabled ? (
                                        <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                                            <Icon name="fas fa-lock" className="mb-2 text-xl" />
                                            <p>Data unavailable. Verify domain to see contributors.</p>
                                        </div>
                                    ) : internalContributors.length > 0 ? internalContributors.map((user, index) => (
                                        <div key={index} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm mr-3">{user.initials}</div>
                                            <div className="flex-grow">
                                                <p className="font-semibold text-[#293c51] dark:text-gray-100 truncate max-w-[150px] sm:max-w-full">{user.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"><Icon name="fas fa-envelope" className="mr-1"/> {user.count.toLocaleString()} Mails</p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskTagClass(user.risk)}`}>{user.risk}</span>
                                            </div>
                                            <span className="ml-4 w-6 text-right font-bold text-gray-400 dark:text-gray-500">{index + 1}</span>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                                            No contributors found for this domain.
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <Card title="External Contributors" className="lg:col-span-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">Active external domains and automated systems</p>
                                <div className="space-y-2">
                                    {isDisabled ? (
                                        <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                                            <Icon name="fas fa-lock" className="mb-2 text-xl" />
                                            <p>Data unavailable. Verify domain to see contributors.</p>
                                        </div>
                                    ) : externalContributors.map((user, index) => (
                                        <div key={index} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm mr-3">{user.initials}</div>
                                            <div className="flex-grow">
                                                <p className="font-semibold text-[#293c51] dark:text-gray-100 truncate max-w-[150px] sm:max-w-full">{user.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"><Icon name="fas fa-external-link-alt" className="mr-1"/> {user.count.toLocaleString()} Mails</p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusTagClass(user.status || 'active')}`}>{user.status || 'Active'}</span>
                                            </div>
                                            <span className="ml-4 w-6 text-right font-bold text-gray-400 dark:text-gray-500">{index + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* SEPARATE ROW FOR TOP CONTRIBUTORS TODAY */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Top Contributors Today">
                            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">Users with the highest email traffic today</p>
                            <div className="space-y-2">
                                {isDisabled ? (
                                    <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                                        <Icon name="fas fa-lock" className="mb-2 text-xl" />
                                        <p>Data unavailable. Verify domain to see contributors.</p>
                                    </div>
                                ) : topActiveUsers.length > 0 ? topActiveUsers.map((user, index) => (
                                    <div key={index} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#679a41] text-white flex items-center justify-center font-bold text-sm mr-3">{user.initials}</div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-[#293c51] dark:text-gray-100 truncate max-w-[150px] sm:max-w-full">{user.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"><Icon name="fas fa-paper-plane" className="mr-1"/> {user.count.toLocaleString()} Mails Today</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskTagClass(user.risk)}`}>{user.risk}</span>
                                        </div>
                                        <span className="ml-4 w-6 text-right font-bold text-gray-400 dark:text-gray-500">{index + 1}</span>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                                        No active users found for this domain today.
                                    </div>
                                )}
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
