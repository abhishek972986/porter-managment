import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { templatesAPI, reportsAPI } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const DocumentsPage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: templatesAPI.getAll,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Generator</h1>
          <p className="text-gray-600 mt-1">Create and manage monthly documents</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            defaultValue={format(new Date(), 'yyyy-MM')}
            id="nominal-month"
            className="px-3 py-2 border rounded"
          />
          <Button
            onClick={async () => {
              try {
                const monthInput = (document.getElementById('nominal-month') as HTMLInputElement)
                  .value;
                if (!monthInput) return toast.error('Select a month');
                const blob = await reportsAPI.downloadNominalRoll(monthInput);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Nominal_Roll_${monthInput}.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                toast.success('Nominal roll downloaded');
              } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                toast.error(msg || 'Download failed');
              }
            }}
          >
            Download Nominal Roll
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Templates List */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Templates</h2>
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    <div className="flex gap-2 mt-2">
                      {template.placeholders.map((ph) => (
                        <span
                          key={ph}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {ph}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {templates.length === 0 && (
              <p className="text-center text-gray-500 py-8">No templates available</p>
            )}
          </div>
        </Card>

        {/* Preview & Configuration */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Template Preview</h2>
          {selectedTemplate ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div
                  dangerouslySetInnerHTML={{
                    __html: templates.find((t) => t.id === selectedTemplate)?.content || '',
                  }}
                />
              </div>
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Field Mapping</h3>
                {templates
                  .find((t) => t.id === selectedTemplate)
                  ?.placeholders.map((placeholder) => (
                    <div key={placeholder} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 flex-1">{placeholder}</span>
                      <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                        <option>Select field</option>
                        <option>Porter Name</option>
                        <option>Total Cost</option>
                        <option>Month</option>
                        <option>Manual Entry</option>
                      </select>
                    </div>
                  ))}
              </div>
              <Button className="w-full">Generate Document</Button>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">
              Select a template to preview and configure
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

