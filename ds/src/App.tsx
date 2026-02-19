import { useState, useEffect } from 'react';

interface FormData {
  brigade: string;
  unitName: string;
  financialYear: string;
  brigadeName: string;
  letterNo: string;
  date: string;
  remarks: string;
}

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-

const hasPdfSignature = (bytes: Uint8Array) =>
  PDF_SIGNATURE.every((value, index) => bytes[index] === value);

const getFileNameFromDisposition = (contentDisposition: string | null) => {
  if (!contentDisposition) return null;
  const match = contentDisposition.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i);
  return match?.[1]?.trim() || null;
};

const App = () => {
  const [formData, setFormData] = useState<FormData>({
    brigade: '',
    unitName: '',
    financialYear: '',
    brigadeName: '',
    letterNo: '',
    date: '',
    remarks: '',
  });

  const [savedForms, setSavedForms] = useState<(FormData & { id: number; timestamp: string })[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('militaryForms');
    if (saved) {
      setSavedForms(JSON.parse(saved));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const downloadPDF = async (form: FormData & { id: number; timestamp: string }) => {
    try {
      // Call backend API to generate PDF
      const response = await fetch('http://localhost:3001/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/pdf',
        },
        body: JSON.stringify({
          brigade: form.brigade,
          unitName: form.unitName,
          financialYear: form.financialYear,
          brigadeName: form.brigadeName,
          letterNo: form.letterNo,
          date: form.date,
          remarks: form.remarks,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.toLowerCase().includes('application/pdf')) {
        const nonPdfBody = await response.text();
        throw new Error(nonPdfBody || `Expected PDF response but received: ${contentType || 'unknown content type'}`);
      }

      // Get PDF blob from response
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Generated PDF is empty. Please check backend PDF generation.');
      }

      const bytes = new Uint8Array(await blob.arrayBuffer());
      if (!hasPdfSignature(bytes)) {
        throw new Error('Response is not a valid PDF document.');
      }
      
      // Create download link and trigger download
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      const a = document.createElement('a');
      const safeUnit = (form.unitName || 'unit').replace(/\s+/g, '-');
      const fallbackName = `document-${safeUnit}-${Date.now()}.pdf`;
      const suggestedName = getFileNameFromDisposition(response.headers.get('content-disposition'));
      a.href = url;
      a.download = suggestedName || fallbackName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to generate PDF. Please make sure the backend server is running on port 3001.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = { ...formData, id: Date.now(), timestamp: new Date().toLocaleString() };
    const updatedForms = [...savedForms, newEntry];
    setSavedForms(updatedForms);
    localStorage.setItem('militaryForms', JSON.stringify(updatedForms));
    downloadPDF(newEntry);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setFormData({ brigade: '', unitName: '', financialYear: '', brigadeName: '', letterNo: '', date: '', remarks: '' });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {showSuccess && (
        <div className="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl z-50 flex items-center gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span className="font-medium">Form saved successfully!</span>
        </div>
      )}

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
          <div className="bg-blue-100 p-3 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Fill Details</h2>
            <p className="text-sm text-gray-500">Complete the form below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Infantry Brigade *</label>
            <select name="brigade" value={formData.brigade} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800">
              <option value="">Select Brigade</option>
              <option value="121 (Independent) Infantry Brigade">121 (Independent) Infantry Brigade</option>
              <option value="122 Infantry Brigade">122 Infantry Brigade</option>
              <option value="123 Infantry Brigade">123 Infantry Brigade</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Unit Name *</label>
            <select name="unitName" value={formData.unitName} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800">
              <option value="">Select Unit</option>
              <option value="UnitNameKaraj">UnitNameKaraj</option>
              <option value="UnitNamePune">UnitNamePune</option>
              <option value="UnitNameMumbai">UnitNameMumbai</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Financial Year *</label>
            <select name="financialYear" value={formData.financialYear} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800">
              <option value="">Select FY</option>
              <option value="2024-25">2024-25</option>
              <option value="2025-26">2025-26</option>
              <option value="2026-27">2026-27</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Brigade Group *</label>
            <select name="brigadeName" value={formData.brigadeName} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800">
              <option value="">Select Group</option>
              <option value="NAME OF Bde Gp">NAME OF Bde Gp</option>
              <option value="OTHER Bde Gp">OTHER Bde Gp</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Letter Number *</label>
            <input type="text" name="letterNo" value={formData.letterNo} placeholder="e.g., 508/Q/S&S/1 dt 08 Mar 2025" onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
          </div>

        

          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Submit
            </button>
            <button type="button" onClick={() => setFormData({ brigade: '', unitName: '', financialYear: '', brigadeName: '', letterNo: '', date: '', remarks: '' })} className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200">
              Clear
            </button>
            <a href="/view-data.html" className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              View Saved Forms
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
