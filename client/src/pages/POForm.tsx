import React, { useState } from 'react';
import { Bell, User, Calendar, Upload, Image, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SupplierDetailsForm = () => {
  const [supplierDetails, setSupplierDetails] = useState<{
  contactName: string;
  supplier: string;
  taxId: string;
  address: string;
  issueDate: string;
  preparedBy: string;
  businessLogo: string | ArrayBuffer | null;
  comments: string;
}>({
  contactName: 'Sangthong Jintadee',
  supplier: 'SPR-207: SIAM PHARMACEUTICAL CO.,LTD.',
  taxId: '2958102865201',
  address: '123/45 ถนนพันทบุรี แขวงมาบงงพดิญุธร กรุงเทพมหานคร 10140',
  issueDate: '12/09/68',
  preparedBy: 'Laothong Zhongguo',
  businessLogo: null,
  comments: 'Special Instructions............'
});

  const handleInputChange = (field: string, value: string | null) => {
    setSupplierDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (event: { target: { files: any[]; }; }) => {
  const file = event.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result) {
        setSupplierDetails(prev => ({
          ...prev,
          businessLogo: result
        }));
      }
    };
    reader.readAsDataURL(file);
  }
};
  const navigate = useNavigate();

  const handleSaveAndContinue = () => {
    alert('Supplier details saved successfully!');
    console.log('Supplier Details:', supplierDetails);
    navigate('/podoc');
  };

  return (
    <div className="min-h-screen flex"> 
      {/* Main Content */}
      <div className="flex-1">
       
        {/* Form Content */}
        <div className="p-6">
          <h2 className="text-3xl font-light text-gray-800 mb-8">Purchase Order</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Supplier Details */}
            <div className="space-y-6 bg-white p-4">
              <h3 className="text-lg font-medium text-gray-600 mb-4">Supplier Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gray-800"></div>
                    <input
                      type="text"
                      value={supplierDetails.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      className="w-full px-0 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gray-800"></div>
                    <input
                      type="text"
                      value={supplierDetails.supplier}
                      onChange={(e) => handleInputChange('supplier', e.target.value)}
                      className="w-full px-0 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gray-800"></div>
                    <input
                      type="text"
                      value={supplierDetails.taxId}
                      onChange={(e) => handleInputChange('taxId', e.target.value)}
                      className="w-full px-0 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gray-800"></div>
                    <textarea
                      value={supplierDetails.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-0 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-800 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Your Details */}
            <div className="space-y-6 bg-white p-4">
              <h3 className="text-lg font-medium text-gray-600 mb-4">Your Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gray-800"></div>
                    <input
                      type="text"
                      value={supplierDetails.issueDate}
                      onChange={(e) => handleInputChange('issueDate', e.target.value)}
                      className="w-full px-0 py-2 pr-8 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-800"
                    />
                    <Calendar className="absolute right-0 top-2.5 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prepared by <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gray-800"></div>
                    <input
                      type="text"
                      value={supplierDetails.preparedBy}
                      onChange={(e) => handleInputChange('preparedBy', e.target.value)}
                      className="w-full px-0 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Logo
                  </label>
                  <div className="relative">
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gray-800"></div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 mb-2">
                      {supplierDetails.businessLogo ? (
                        <div className="space-y-3">
                          <img 
                            // src={supplierDetails.businessLogo} 
                            alt="Business Logo" 
                            className="mx-auto max-h-20 object-contain"
                          />
                          <button
                            onClick={() => handleInputChange('businessLogo', null)}
                            className="text-red-500 text-sm hover:text-red-700"
                          >
                            Remove Logo
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Image className="w-8 h-8 text-gray-400 mx-auto" />
                          <div>
                            <p className="text-gray-500 text-sm mb-2">Add Business Logo</p>
                            <p className="text-gray-400 text-xs mb-3">Resolution up to 1080x1080px.<br />PNG or JPEG file.</p>
                            <label className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg cursor-pointer transition-colors border border-gray-300">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Logo
                              <input
                                type="file"
                                accept="image/png,image/jpeg"
                                // onChange={handleLogoUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments
                  </label>
                  <div className="relative">
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gray-800"></div>
                    <textarea
                      value={supplierDetails.comments}
                      onChange={(e) => handleInputChange('comments', e.target.value)}
                      rows={2}
                      className="w-full px-0 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-400 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-12 flex justify-center">
            <button 
              onClick={handleSaveAndContinue}
              className="px-16 py-4 bg-green-800 hover:bg-green-900 text-white rounded-lg font-medium transition-colors text-lg"
            >
              Save & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetailsForm;