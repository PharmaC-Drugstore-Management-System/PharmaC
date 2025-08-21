import React, { useEffect, useState } from 'react';
import { Upload, Image } from 'lucide-react';
import { useNavigate} from 'react-router-dom';
import { useLocation } from 'react-router-dom'

const SupplierDetailsForm = () => {
  const location = useLocation();
  const [username, setUsername] = useState('');
  console.log("Username: ",username)

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
    contactName: '',
    supplier: '',
    taxId: '',
    address: '',
    issueDate: '',
    preparedBy: `${username}`,
    businessLogo: null,
    comments: ''
  });

  const handleInputChange = (field: string, value: string | null) => {
    setSupplierDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // basic validation: only allow png/jpeg and limit to 2MB
      const allowed = ['image/png', 'image/jpeg'];
      const maxBytes = 2 * 1024 * 1024; // 2MB
      if (!allowed.includes(file.type)) {
        console.warn('Unsupported file type');
        return;
      }
      if (file.size > maxBytes) {
        console.warn('File too large');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string | null;
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
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = {
    contactName: (supplierDetails.contactName || '').toString().trim().length > 0,
    supplier: (supplierDetails.supplier || '').toString().trim().length > 0,
    taxId: (supplierDetails.taxId || '').toString().trim().length === 13,
    address: (supplierDetails.address || '').toString().trim().length > 0,
    issueDate: (supplierDetails.issueDate || '').toString().trim().length > 0,
    preparedBy: (supplierDetails.preparedBy || '').toString().trim().length > 0,
  };

  const isFormValid = Object.values(validate).every(Boolean);

  const markTouchedAll = () => {
    setTouched({
      contactName: true,
      supplier: true,
      taxId: true,
      address: true,
      issueDate: true,
      preparedBy: true,
    });
  };

  const handleSaveAndContinue = () => {
    // validate before continuing
    if (!isFormValid) {
      // mark all fields touched to show errors
      markTouchedAll();
      return;
    }
    const payload = { items: location.state?.selectedOrderItems || [], supplierDetails, total: 0 };
    payload.total = payload.items.reduce((s:any,it:any)=> s + ((it.price||it.unitPrice||0) * (it.amount||it.quantity||0)), 0);

    // persist locally so PODoc can show immediately
    try {
      sessionStorage.setItem('podoc_payload', JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save podoc payload to sessionStorage', e);
    }

  // navigate directly to PODoc (remove server PDF save)
  navigate('/podoc', { state: { selectedItems: payload.items, supplierDetails: payload.supplierDetails } });

  };

  const checkme = async () => {
    try {
      const authme = await fetch('http://localhost:5000/api/me', {
        method: 'GET',
        credentials: 'include'
      })
      const data = await authme.json();
      const fullName = data.user.firstname + " " + data.user.lastname;
      setUsername(fullName);
      setSupplierDetails(prev => ({
        ...prev,
        preparedBy: prev.preparedBy && prev.preparedBy.trim() !== '' ? prev.preparedBy : fullName
      }));
      if (authme.status === 401 || authme.status === 403) {
        navigate('/login');
        return;
      }

      console.log('Authme data:', data);
    } catch (error) {
      console.log('Error', error)

    }
  }


  useEffect(() => {
    checkme()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
                      onBlur={() => setTouched(prev => ({ ...prev, contactName: true }))}
                      className="w-full px-0 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-800"
                    />
                    {touched.contactName && !validate.contactName ? (
                      <div className="text-red-500 text-xs mt-1">Contact Name is required</div>
                    ) : null}
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
                      onBlur={() => setTouched(prev => ({ ...prev, supplier: true }))}
                      className="w-full px-0 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-800"
                    />
                    {touched.supplier && !validate.supplier ? (
                      <div className="text-red-500 text-xs mt-1">Supplier is required</div>
                    ) : null}
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
                      inputMode="numeric"
                      pattern="\d*"
                      value={supplierDetails.taxId}
                      maxLength={13}
                      onKeyDown={(e: any) => {
                        const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];
                        if (allowedKeys.includes(e.key)) return;
                        if (e.key.length === 1 && /\D/.test(e.key)) e.preventDefault();
                      }}
                      onChange={(e: any) => {
                        const digits = (e.target.value || '').toString().replace(/\D/g, '').slice(0, 13);
                        handleInputChange('taxId', digits);
                      }}
                      onPaste={(e: any) => {
                        e.preventDefault();
                        const paste = (e.clipboardData || (window as any).clipboardData)?.getData('text') || '';
                        const digits = (paste || '').toString().replace(/\D/g, '').slice(0, 13);
                        handleInputChange('taxId', digits);
                      }}
                      onBlur={() => setTouched(prev => ({ ...prev, taxId: true }))}
                      className="w-full px-0 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-800"
                    />
                    {touched.taxId && !validate.taxId ? (
                      <div className="text-red-500 text-xs mt-1">Tax ID must be 13 digits</div>
                    ) : null}
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
                      onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
                      rows={3}
                      className="w-full px-0 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-800 resize-none"
                    />
                    {touched.address && !validate.address ? (
                      <div className="text-red-500 text-xs mt-1">Address is required</div>
                    ) : null}
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
                      type="date"
                      value={supplierDetails.issueDate}
                      onChange={(e) => handleInputChange('issueDate', e.target.value)}
                      onBlur={() => setTouched(prev => ({ ...prev, issueDate: true }))}
                      className="w-full px-0 py-2 pr-8 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-800"
                    />
                    {touched.issueDate && !validate.issueDate ? (
                      <div className="text-red-500 text-xs mt-1">Issue Date is required</div>
                    ) : null}
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
                      onBlur={() => setTouched(prev => ({ ...prev, preparedBy: true }))}
                      className="w-full px-0 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-800"
                    />
                    {touched.preparedBy && !validate.preparedBy ? (
                      <div className="text-red-500 text-xs mt-1">Prepared By is required</div>
                    ) : null}
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
                          {typeof supplierDetails.businessLogo === 'string' ? (
                            <img
                              src={supplierDetails.businessLogo}
                              alt="Business Logo"
                              className="mx-auto max-h-20 object-contain"
                            />
                          ) : null}
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
                                onChange={handleLogoUpload}
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
              disabled={!isFormValid}
              className={`px-16 py-4 rounded-lg font-medium transition-colors text-lg ${isFormValid ? 'bg-green-800 hover:bg-green-900 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
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