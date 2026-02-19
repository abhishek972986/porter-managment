import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Upload } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { templatesAPI } from '@/lib/api';
import { API_BASE_URL, refreshAccessToken, tokenManager } from '@/lib/api-client';

interface DsFormData {
  brigade: string;
  unitName: string;
  financialYear: string;
  brigadeName: string;
  letterNo: string;
  date: string;
  remarks: string;
}

const PDF_GENERATE_URL =
  import.meta.env.VITE_PDF_GENERATE_URL || `${API_BASE_URL}/documents/generate-pdf`;

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-

const hasPdfSignature = (bytes: Uint8Array) =>
  PDF_SIGNATURE.every((value, index) => bytes[index] === value);

const getFileNameFromDisposition = (contentDisposition: string | null) => {
  if (!contentDisposition) return null;
  const match = contentDisposition.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i);
  return match?.[1]?.trim() || null;
};

export const DocumentsPage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfMessage, setPdfMessage] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [dsFormData, setDsFormData] = useState<DsFormData>({
    brigade: '',
    unitName: '',
    financialYear: '',
    brigadeName: '',
    letterNo: '',
    date: '',
    remarks: '',
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: templatesAPI.getAll,
  });

  const handleDsFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDsFormData((prev) => ({ ...prev, [name]: value }));
  };

  const clearDsForm = () => {
    setDsFormData({
      brigade: '',
      unitName: '',
      financialYear: '',
      brigadeName: '',
      letterNo: '',
      date: '',
      remarks: '',
    });
    setPdfMessage(null);
    setPdfError(null);
  };

  const handleGenerateDsPdf = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPdfMessage(null);
    setPdfError(null);
    setIsGeneratingPdf(true);

    try {
      const executeRequest = async () =>
        fetch(PDF_GENERATE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/pdf',
            ...(tokenManager.getAccessToken()
              ? { Authorization: `Bearer ${tokenManager.getAccessToken()}` }
              : {}),
          },
          body: JSON.stringify(dsFormData),
        });

      let response = await executeRequest();

      if (response.status === 401 && tokenManager.getRefreshToken()) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          response = await executeRequest();
        }
      }

      if (!response.ok) {
        let backendMessage = '';
        try {
          const err = await response.json();
          backendMessage = err?.message || err?.error || '';
        } catch {
          backendMessage = await response.text();
        }

        throw new Error(
          backendMessage || `PDF generation failed with status ${response.status}`
        );
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.toLowerCase().includes('application/pdf')) {
        const nonPdfBody = await response.text();
        throw new Error(nonPdfBody || `Expected PDF response but received: ${contentType || 'unknown content type'}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Generated PDF is empty. Please check backend PDF generation.');
      }

      const bytes = new Uint8Array(await blob.arrayBuffer());
      if (!hasPdfSignature(bytes)) {
        throw new Error('Response is not a valid PDF document.');
      }

      const safeUnit = (dsFormData.unitName || 'unit').replace(/\s+/g, '-').toLowerCase();
      const fallbackName = `document-${safeUnit}-${Date.now()}.pdf`;
      const suggestedName = getFileNameFromDisposition(response.headers.get('content-disposition'));
      const fileName = suggestedName || fallbackName;
      const validPdfBlob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(validPdfBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      setPdfMessage('PDF generated and downloaded successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate PDF.';
      setPdfError(message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Generator</h1>
          <p className="text-gray-600 mt-1">Create and manage monthly documents</p>
        </div>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Template
        </Button>
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

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">DS Document PDF Generator</h2>
        <p className="text-sm text-gray-600 mb-6">
          Fill the fields below to generate and download the DS PDF document.
        </p>

        <form onSubmit={handleGenerateDsPdf} className="space-y-4">
          <Select
            name="brigade"
            label="Infantry Brigade *"
            value={dsFormData.brigade}
            onChange={handleDsFieldChange}
            required
            options={[
              { value: '', label: 'Select Brigade' },
              { value: '121 (Independent) Infantry Brigade', label: '121 (Independent) Infantry Brigade' },
              { value: '122 Infantry Brigade', label: '122 Infantry Brigade' },
              { value: '123 Infantry Brigade', label: '123 Infantry Brigade' },
            ]}
          />

          <Select
            name="unitName"
            label="Unit Name *"
            value={dsFormData.unitName}
            onChange={handleDsFieldChange}
            required
            options={[
              { value: '', label: 'Select Unit' },
              { value: 'UnitNameKaraj', label: 'UnitNameKaraj' },
              { value: 'UnitNamePune', label: 'UnitNamePune' },
              { value: 'UnitNameMumbai', label: 'UnitNameMumbai' },
            ]}
          />

          <Select
            name="financialYear"
            label="Financial Year *"
            value={dsFormData.financialYear}
            onChange={handleDsFieldChange}
            required
            options={[
              { value: '', label: 'Select FY' },
              { value: '2024-25', label: '2024-25' },
              { value: '2025-26', label: '2025-26' },
              { value: '2026-27', label: '2026-27' },
            ]}
          />

          <Select
            name="brigadeName"
            label="Brigade Group *"
            value={dsFormData.brigadeName}
            onChange={handleDsFieldChange}
            required
            options={[
              { value: '', label: 'Select Group' },
              { value: 'NAME OF Bde Gp', label: 'NAME OF Bde Gp' },
              { value: 'OTHER Bde Gp', label: 'OTHER Bde Gp' },
            ]}
          />

          <Input
            name="letterNo"
            label="Letter Number *"
            placeholder="e.g., 508/Q/S&S/1 dt 08 Mar 2025"
            value={dsFormData.letterNo}
            onChange={handleDsFieldChange}
            required
          />

          <Input
            type="date"
            name="date"
            label="Date *"
            value={dsFormData.date}
            onChange={handleDsFieldChange}
            required
          />

          <Textarea
            name="remarks"
            label="Remarks"
            placeholder="Optional remarks"
            value={dsFormData.remarks}
            onChange={handleDsFieldChange}
          />

          {pdfMessage && <p className="text-sm text-green-700">{pdfMessage}</p>}
          {pdfError && <p className="text-sm text-red-600">{pdfError}</p>}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={isGeneratingPdf}>
              {isGeneratingPdf ? 'Generating...' : 'Generate & Download PDF'}
            </Button>
            <Button type="button" variant="outline" onClick={clearDsForm} disabled={isGeneratingPdf}>
              Clear
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

