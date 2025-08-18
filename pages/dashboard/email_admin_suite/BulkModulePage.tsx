import React from 'react';
import { Card, Button } from '@/components/ui';

export const BulkModulePage: React.FC = () => {
  const sections = [
    {
      title: 'Create Bulk Mailboxes',
      description: 'Complex password with minimum 8 characters required',
    },
    {
      title: 'Update Bulk Mailboxes Excel',
    },
    {
      title: 'Create Bulk Distribution Lists',
    },
    {
      title: 'Create Bulk Contacts',
    },
    {
      title: 'update Bulk MailBoxes Passwords', // Casing from image
    },
  ];

  const handleDownload = (action: string) => {
    alert(`Downloading template for: ${action}`);
  };

  const handleUpload = (action: string) => {
    // This would typically open a file picker
    alert(`Uploading file for: ${action}`);
  };

  return (
    <Card>
        <h1 className="text-2xl font-bold text-[#679a41] dark:text-emerald-400 mb-6">Bulk Module</h1>
        <div className="space-y-8">
            {sections.map((section, index) => (
                <div key={index} className="border-b dark:border-slate-700 pb-6 last:border-b-0 last:pb-0">
                    <h2 className="text-xl font-semibold text-[#293c51] dark:text-gray-100 mb-4">{section.title}</h2>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => handleDownload(section.title)} leftIconName="fas fa-download">Download</Button>
                        <Button variant="outline" onClick={() => handleUpload(section.title)} leftIconName="fas fa-upload">Upload</Button>
                    </div>
                    {section.description && (
                        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{section.description}</p>
                    )}
                </div>
            ))}
        </div>
    </Card>
  );
};
