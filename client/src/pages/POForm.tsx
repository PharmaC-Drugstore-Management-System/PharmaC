import React, { useEffect, useState } from 'react';
import { Upload, Image } from 'lucide-react';
import { useNavigate} from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import SignaturePad from '../components/SignaturePad';

const SupplierDetailsForm = () => {
  const location = useLocation();
  const [username, setUsername] = useState('');
  console.log("Username: ",username)

  // Check if dark mode is enabled
  const isDark = document.documentElement.classList.contains('dark');

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

  // State for signatures
  const [signatures, setSignatures] = useState<{
    purchaser: string | null;
  }>({
    purchaser: null
  });

  const handleInputChange = (field: string, value: string | null) => {
    setSupplierDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handler for signature changes
  const handleSignatureChange = (type: 'purchaser', signature: string | null) => {
    setSignatures(prev => ({
      ...prev,
      [type]: signature
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
    purchaserSignature: signatures.purchaser !== null,
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
      purchaserSignature: true,
    });
  };

  const handleSaveAndContinue = () => {
    // validate before continuing
    if (!isFormValid) {
      // mark all fields touched to show errors
      markTouchedAll();
      return;
    }
    const payload = { 
      items: location.state?.selectedOrderItems || [], 
      supplierDetails, 
      signatures,
      total: 0 
    };
    payload.total = payload.items.reduce((s:any,it:any)=> s + ((it.price||it.unitPrice||0) * (it.amount||it.quantity||0)), 0);

    // persist locally so PODoc can show immediately
    try {
      sessionStorage.setItem('podoc_payload', JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save podoc payload to sessionStorage', e);
    }

  // navigate directly to PODoc (remove server PDF save)
  navigate('/podoc', { 
    state: { 
      selectedItems: payload.items, 
      supplierDetails: payload.supplierDetails,
      signatures: payload.signatures
    } 
  });

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
    <div className="min-h-screen flex transition-colors duration-300"
         style={{backgroundColor: isDark ? '#111827' : '#f9fafb'}}>
      {/* Main Content */}
      <div className="flex-1">

        {/* Form Content */}
        <div className="p-6">
          <h2 className="text-3xl font-light mb-8 transition-colors duration-300"
              style={{color: isDark ? 'white' : '#1f2937'}}>Purchase Order</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Supplier Details */}
            <div className="space-y-6 p-4 rounded-lg transition-colors duration-300"
                 style={{backgroundColor: isDark ? '#374151' : 'white'}}>
              <h3 className="text-lg font-medium mb-4 transition-colors duration-300"
                  style={{color: isDark ? '#d1d5db' : '#4b5563'}}>Supplier Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300"
                         style={{color: isDark ? '#e5e7eb' : '#374151'}}>
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute bottom-0 left-0 right-0 h-0.5"
                         style={{backgroundColor: isDark ? '#4b5563' : '#d1d5db'}}></div>
                    <div className="absolute bottom-0 left-0 w-8 h-0.5"
                         style={{backgroundColor: isDark ? 'white' : '#1f2937'}}></div>
                    <input
                      type="text"
                      value={supplierDetails.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      onBlur={() => setTouched(prev => ({ ...prev, contactName: true }))}
                      className="w-full px-0 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 transition-colors duration-300"
                      style={{color: isDark ? 'white' : '#1f2937'}}
                    />
                    {touched.contactName && !validate.contactName ? (
                      <div className="text-red-500 text-xs mt-1">Contact Name is required</div>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300"
                         style={{color: isDark ? '#e5e7eb' : '#374151'}}>
                    Supplier <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute bottom-0 left-0 right-0 h-0.5"
                         style={{backgroundColor: isDark ? '#4b5563' : '#d1d5db'}}></div>
                    <div className="absolute bottom-0 left-0 w-8 h-0.5"
                         style={{backgroundColor: isDark ? 'white' : '#1f2937'}}></div>
                    <input
                      type="text"
                      value={supplierDetails.supplier}
                      onChange={(e) => handleInputChange('supplier', e.target.value)}
                      onBlur={() => setTouched(prev => ({ ...prev, supplier: true }))}
                      className="w-full px-0 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 transition-colors duration-300"
                      style={{color: isDark ? 'white' : '#1f2937'}}
                    />
                    {touched.supplier && !validate.supplier ? (
                      <div className="text-red-500 text-xs mt-1">Supplier is required</div>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300"
                         style={{color: isDark ? '#e5e7eb' : '#374151'}}>
                    Tax ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute bottom-0 left-0 right-0 h-0.5"
                         style={{backgroundColor: isDark ? '#4b5563' : '#d1d5db'}}></div>
                    <div className="absolute bottom-0 left-0 w-8 h-0.5"
                         style={{backgroundColor: isDark ? 'white' : '#1f2937'}}></div>
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
                      className="w-full px-0 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 transition-colors duration-300"
                      style={{color: isDark ? 'white' : '#1f2937'}}
                    />
                    {touched.taxId && !validate.taxId ? (
                      <div className="text-red-500 text-xs mt-1">Tax ID must be 13 digits</div>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300"
                         style={{color: isDark ? '#e5e7eb' : '#374151'}}>
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute bottom-0 left-0 right-0 h-0.5"
                         style={{backgroundColor: isDark ? '#4b5563' : '#d1d5db'}}></div>
                    <div className="absolute bottom-0 left-0 w-8 h-0.5"
                         style={{backgroundColor: isDark ? 'white' : '#1f2937'}}></div>
                    <textarea
                      value={supplierDetails.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
                      rows={3}
                      className="w-full px-0 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none transition-colors duration-300"
                      style={{color: isDark ? 'white' : '#1f2937'}}
                    />
                    {touched.address && !validate.address ? (
                      <div className="text-red-500 text-xs mt-1">Address is required</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Your Details */}
            <div className="space-y-6 p-4 rounded-lg transition-colors duration-300"
                 style={{backgroundColor: isDark ? '#374151' : 'white'}}>
              <h3 className="text-lg font-medium mb-4 transition-colors duration-300"
                  style={{color: isDark ? '#d1d5db' : '#4b5563'}}>Your Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300"
                         style={{color: isDark ? '#e5e7eb' : '#374151'}}>
                    Issue Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute bottom-0 left-0 right-0 h-0.5"
                         style={{backgroundColor: isDark ? '#4b5563' : '#d1d5db'}}></div>
                    <div className="absolute bottom-0 left-0 w-8 h-0.5"
                         style={{backgroundColor: isDark ? 'white' : '#1f2937'}}></div>
                    <input
                      type="date"
                      value={supplierDetails.issueDate}
                      onChange={(e) => handleInputChange('issueDate', e.target.value)}
                      onBlur={() => setTouched(prev => ({ ...prev, issueDate: true }))}
                      className="w-full px-0 py-2 pr-8 bg-transparent border-0 focus:outline-none focus:ring-0 transition-colors duration-300"
                      style={{color: isDark ? 'white' : '#1f2937'}}
                    />
                    {touched.issueDate && !validate.issueDate ? (
                      <div className="text-red-500 text-xs mt-1">Issue Date is required</div>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300"
                         style={{color: isDark ? '#e5e7eb' : '#374151'}}>
                    Prepared by <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute bottom-0 left-0 right-0 h-0.5"
                         style={{backgroundColor: isDark ? '#4b5563' : '#d1d5db'}}></div>
                    <div className="absolute bottom-0 left-0 w-8 h-0.5"
                         style={{backgroundColor: isDark ? 'white' : '#1f2937'}}></div>
                    <input
                      type="text"
                      value={supplierDetails.preparedBy}
                      onChange={(e) => handleInputChange('preparedBy', e.target.value)}
                      onBlur={() => setTouched(prev => ({ ...prev, preparedBy: true }))}
                      className="w-full px-0 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 transition-colors duration-300"
                      style={{color: isDark ? 'white' : '#1f2937'}}
                    />
                    {touched.preparedBy && !validate.preparedBy ? (
                      <div className="text-red-500 text-xs mt-1">Prepared By is required</div>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300"
                         style={{color: isDark ? '#e5e7eb' : '#374151'}}>
                    Business Logo
                  </label>
                  <div className="relative">
                    <div className="absolute bottom-0 left-0 right-0 h-0.5"
                         style={{backgroundColor: isDark ? '#4b5563' : '#d1d5db'}}></div>
                    <div className="absolute bottom-0 left-0 w-8 h-0.5"
                         style={{backgroundColor: isDark ? 'white' : '#1f2937'}}></div>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center mb-2 transition-colors duration-300"
                         style={{
                           borderColor: isDark ? '#4b5563' : '#d1d5db',
                           backgroundColor: isDark ? '#4b5563' : '#f9fafb'
                         }}>
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
                          <Image className="w-8 h-8 mx-auto transition-colors duration-300"
                                 style={{color: isDark ? '#9ca3af' : '#9ca3af'}} />
                          <div>
                            <p className="text-sm mb-2 transition-colors duration-300"
                               style={{color: isDark ? '#9ca3af' : '#6b7280'}}>Add Business Logo</p>
                            <p className="text-xs mb-3 transition-colors duration-300"
                               style={{color: isDark ? '#6b7280' : '#9ca3af'}}>
                              Resolution up to 1080x1080px.<br />PNG or JPEG file.
                            </p>
                            <label className="inline-flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 border"
                                   style={{
                                     backgroundColor: isDark ? '#374151' : 'white',
                                     color: isDark ? '#d1d5db' : '#374151',
                                     borderColor: isDark ? '#4b5563' : '#d1d5db'
                                   }}
                                   onMouseEnter={(e) => {
                                     const target = e.target as HTMLLabelElement;
                                     target.style.backgroundColor = isDark ? '#4b5563' : '#f9fafb';
                                   }}
                                   onMouseLeave={(e) => {
                                     const target = e.target as HTMLLabelElement;
                                     target.style.backgroundColor = isDark ? '#374151' : 'white';
                                   }}>
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
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300"
                         style={{color: isDark ? '#e5e7eb' : '#374151'}}>
                    Comments
                  </label>
                  <div className="relative">
                    <div className="absolute bottom-0 left-0 right-0 h-0.5"
                         style={{backgroundColor: isDark ? '#4b5563' : '#d1d5db'}}></div>
                    <div className="absolute bottom-0 left-0 w-8 h-0.5"
                         style={{backgroundColor: isDark ? 'white' : '#1f2937'}}></div>
                    <textarea
                      value={supplierDetails.comments}
                      onChange={(e) => handleInputChange('comments', e.target.value)}
                      rows={2}
                      className="w-full px-0 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none transition-colors duration-300"
                      style={{color: isDark ? '#9ca3af' : '#9ca3af'}}
                    />
                  </div>
                </div>

                {/* Signatures Section */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-6 transition-colors duration-300"
                      style={{color: isDark ? '#e5e7eb' : '#374151'}}>Digital Signature</h3>
                  <div className="w-full">
                    {/* Purchaser Signature Only */}
                    <div>
                      <SignaturePad
                        onSignatureChange={(sig) => handleSignatureChange('purchaser', sig)}
                        signerName={supplierDetails.preparedBy || username}
                        signerRole="Purchaser"
                        value={signatures.purchaser}
                      />
                      {touched.purchaserSignature && !validate.purchaserSignature && (
                        <p className="mt-1 text-sm text-red-600">Purchaser signature is required</p>
                      )}
                    </div>
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
              className={`px-16 py-4 rounded-lg font-medium transition-colors text-lg ${isFormValid ? 'text-white' : 'cursor-not-allowed'}`}
              style={{
                backgroundColor: isFormValid 
                  ? (isDark ? '#166534' : '#14532d')
                  : (isDark ? '#4b5563' : '#e5e7eb'),
                color: isFormValid 
                  ? 'white' 
                  : (isDark ? '#9ca3af' : '#6b7280')
              }}
              onMouseEnter={(e) => {
                if (isFormValid) {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = isDark ? '#15803d' : '#166534';
                }
              }}
              onMouseLeave={(e) => {
                if (isFormValid) {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = isDark ? '#166534' : '#14532d';
                }
              }}
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