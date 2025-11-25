
import React from 'react';

export interface BlogPost {
  id: string;
  thumbnail: string;
  title: string;
  subtitle: string;
  tags: string[];
  date: string;
  author: string;
  content: React.ReactNode;
}

export const CONTENT_1 = (
  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
    <p className="text-lg font-medium">
      Security researchers have recently disclosed a critical zero-day vulnerability affecting a widely used server framework.
      The vulnerability, identified as CVE-2023-XXXX, allows remote code execution without authentication.
    </p>
    <h3 className="text-xl font-bold text-[#293c51] dark:text-gray-100 mt-6 mb-2">The Vulnerability Explained</h3>
    <p>
      The flaw exists in the way the library handles specific user-supplied input strings. 
      By crafting a malicious payload, an attacker can trigger a deserialization error that executes the injected code.
    </p>
    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 my-4">
      <p className="text-red-800 dark:text-red-200 font-semibold">Immediate Action Required:</p>
      <p className="text-sm text-red-700 dark:text-red-300">
        All instances of the library must be updated to version 2.15.0 or later immediately.
      </p>
    </div>
    <h3 className="text-xl font-bold text-[#293c51] dark:text-gray-100 mt-6 mb-2">Impact Assessment</h3>
    <p>
      Systems exposed to the internet are at highest risk. Internal systems may also be vulnerable to lateral movement. 
      Review your WAF logs for suspicious patterns matching the exploit signature.
    </p>
  </div>
);

export const CONTENT_2 = (
  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
    <p className="text-lg font-medium">
      Generative AI is transforming the cyber threat landscape. Phishing campaigns are becoming indistinguishable from legitimate communications, 
      bypassing traditional filters and human detection.
    </p>
    <h3 className="text-xl font-bold text-[#293c51] dark:text-gray-100 mt-6 mb-2">AI-Generated Lures</h3>
    <p>
      Attackers use LLMs to generate context-aware emails that reference real recent events or internal company news. 
      These emails lack the grammatical errors and generic greetings typical of older phishing attempts.
    </p>
    <img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1470&auto=format&fit=crop" alt="AI Phishing" className="w-full h-64 object-cover rounded-lg my-4 shadow-md" />
    <h3 className="text-xl font-bold text-[#293c51] dark:text-gray-100 mt-6 mb-2">Defense in Depth</h3>
    <ul className="list-disc pl-5 space-y-2">
      <li>Implement FIDO2 authentication keys to eliminate password theft risks.</li>
      <li>Use AI-driven email security solutions that analyze sender behavior, not just content.</li>
      <li>Conduct continuous security awareness training with simulated AI-generated attacks.</li>
    </ul>
  </div>
);

export const CONTENT_3 = (
  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
    <p className="text-lg font-medium">
      As we move into 2024, cloud security strategies must evolve to address the complexities of multi-cloud environments and serverless architectures.
    </p>
    <h3 className="text-xl font-bold text-[#293c51] dark:text-gray-100 mt-6 mb-2">Identity is the New Perimeter</h3>
    <p>
      With the dissolution of the traditional network perimeter, Identity and Access Management (IAM) has become the primary control plane. 
      Enforcing Least Privilege access and just-in-time (JIT) permissions is paramount.
    </p>
    <h3 className="text-xl font-bold text-[#293c51] dark:text-gray-100 mt-6 mb-2">Data Sovereignty & Compliance</h3>
    <p>
      New regulations require stricter controls over where data resides and who can access it. 
      Implementing robust encryption and key management (BYOK) ensures you remain in control of your data, even in the public cloud.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-bold text-blue-800 dark:text-blue-300">CSPM</h4>
            <p className="text-sm mt-1">Cloud Security Posture Management tools are essential for visibility.</p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-bold text-green-800 dark:text-green-300">CNAPP</h4>
            <p className="text-sm mt-1">Cloud-Native Application Protection Platforms unify security tools.</p>
        </div>
    </div>
  </div>
);

export const CONTENT_4 = (
  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
    <p className="text-lg font-medium">
      We are thrilled to announce major updates to the WorldPosta ecosystem, bringing enhanced performance, smarter tools, and expanded global reach to our CloudEdge and Email Admin Suite.
    </p>
    
    <h3 className="text-xl font-bold text-[#293c51] dark:text-gray-100 mt-6 mb-2">CloudEdge: New Regions & AI Integration</h3>
    <p>
      CloudEdge has expanded its footprint with two new availability zones in <strong>Tokyo</strong> and <strong>São Paulo</strong>, offering lower latency for our Asian and South American customers. 
      Additionally, we've integrated AI-driven resource optimization, which automatically suggests rightsizing for your VMs to reduce costs.
    </p>
    
    <div className="my-6 p-4 bg-gray-100 dark:bg-slate-800 rounded-lg border-l-4 border-[#679a41]">
        <h4 className="font-bold text-[#293c51] dark:text-gray-100">Feature Spotlight: Auto-Scaling Groups</h4>
        <p className="text-sm mt-1">
            Now available in beta: Define policies to automatically scale your compute resources in and out based on real-time demand.
        </p>
    </div>

    <h3 className="text-xl font-bold text-[#293c51] dark:text-gray-100 mt-6 mb-2">Email Admin Suite 2.0</h3>
    <p>
      The Email Admin Suite has received a significant overhaul. The new <strong>Bulk Operations Module</strong> allows administrators to manage thousands of mailboxes simultaneously with CSV imports.
    </p>
    <ul className="list-disc pl-5 space-y-2">
      <li><strong>Smart Search:</strong> Find any setting, user, or log entry instantly with our new global search.</li>
      <li><strong>Enhanced Audit Logs:</strong> Granular tracking of all administrative actions for compliance.</li>
      <li><strong>Dark Mode:</strong> Fully supported across all admin interfaces.</li>
    </ul>
    
    <p className="mt-4">
      These updates are live today for all customers. Check your dashboard for the "New" indicators to explore these features.
    </p>
  </div>
);

export const DEMO_BLOGS: BlogPost[] = [
  {
    id: '1',
    thumbnail: 'https://i.pinimg.com/1200x/73/d7/42/73d7426cf54e1e5f6dd5165e9da30c2e.jpg',
    title: 'Critical Zero-Day Vulnerability Patched',
    subtitle: 'Security researchers have identified and patched a critical vulnerability affecting thousands of servers worldwide. Update your systems immediately.',
    tags: ['Security', 'Zero-Day', 'Patch'],
    date: 'Oct 24, 2023',
    author: 'Sarah Jenkins',
    content: CONTENT_1
  },
  {
    id: '2',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1470&auto=format&fit=crop',
    title: 'The Rise of AI-Driven Phishing Attacks',
    subtitle: 'How artificial intelligence is being used to create more convincing phishing campaigns and actionable strategies to detect and stop them.',
    tags: ['AI', 'Phishing', 'Cybersecurity'],
    date: 'Oct 20, 2023',
    author: 'Michael Chang',
    content: CONTENT_2
  },
  {
    id: '3',
    thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070&auto=format&fit=crop',
    title: 'Cloud Security Best Practices for 2024',
    subtitle: 'A comprehensive guide to securing your cloud infrastructure in the upcoming year, focusing on IAM, encryption, and monitoring.',
    tags: ['Cloud', 'Best Practices', '2024'],
    date: 'Oct 15, 2023',
    author: 'Alex Drayson',
    content: CONTENT_3
  },
  {
    id: '4',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
    title: 'What\'s New in WorldPosta and CloudEdge',
    subtitle: 'Introducing advanced AI integration, expanded CloudEdge regions, and the all-new Email Admin Suite bulk operations module.',
    tags: ['Product Update', 'CloudEdge', 'Posta'],
    date: 'Nov 01, 2024',
    author: 'WorldPosta Team',
    content: CONTENT_4
  }
];
