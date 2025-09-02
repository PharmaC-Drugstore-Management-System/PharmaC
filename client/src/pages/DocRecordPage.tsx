import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Document {
  purchase_document_id: number;
  description: string;
  issue_date: string;
  pdf_filename: string;
  pdf_mime: string;
  signature_fk: number | null;
  po_signature: {
    id: number;
    signer_name: string;
    signature_image: string | null;
    signed_at: string;
  } | null;
  employee: {
    firstname: string;
    lastname: string;
    email: string;
  } | null;
}

export default function DocumentRecord() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPDF, setSelectedPDF] = useState<number | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedDocumentForSignature, setSelectedDocumentForSignature] = useState<number | null>(null);
  const [signatureData, setSignatureData] = useState({
    signer_name: '',
    cert_serial_number: '',
    signature_hash: ''
  });

  const checkme = async () => {
    try {
      const authme = await fetch('http://localhost:5000/api/me', {
        method: 'GET',
        credentials: 'include'
      })
      const data = await authme.json();
      if (authme.status === 401 || authme.status === 403) {
        navigate('/login');
        return;
      }

      console.log('Authme data:', data);
    } catch (error) {
      console.log('Error', error)
    }
  }

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/purchase/pdfs', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDocuments(data.documents);
        }
      } else {
        console.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const openPDFPreview = (documentId: number) => {
    setSelectedPDF(documentId);
    setShowPreviewModal(true);
  }

  const closePDFPreview = () => {
    setShowPreviewModal(false);
    setSelectedPDF(null);
  }

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showPreviewModal) {
        closePDFPreview();
      }
    };

    if (showPreviewModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showPreviewModal]);

  useEffect(() => {
    checkme();
    fetchDocuments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  return (
    <div className="min-h-screen"
         style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#f9fafb'}}>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2"
              style={{color: document.documentElement.classList.contains('dark') ? '#10b981' : '#065f46'}}>Document Records</h1>
          <p style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>All purchase order documents in the system</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                   style={{borderColor: document.documentElement.classList.contains('dark') ? '#10b981' : '#065f46'}}></div>
              <span style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>Loading documents...</span>
            </div>
          </div>
        ) : (
          <>
            {documents.length > 0 && (
              <div className="mb-4">
                <p className="text-sm"
                   style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                  Found {documents.length} document(s)
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.purchase_document_id}
                  className="p-4 rounded-xl shadow hover:shadow-lg transition-all duration-300 cursor-pointer group max-w-sm"
                  style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white'}}
                  onClick={() => openPDFPreview(doc.purchase_document_id)}
                >
                  {/* PDF Icon Display */}
                  <div className="relative h-32 rounded-xl mb-3 overflow-hidden flex items-center justify-center"
                       style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb'}}>
                    {/* PDF Icon */}
                    <div className="text-center">
                      <div className="bg-red-500 text-white p-3 rounded-lg mb-2 inline-block">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium"
                         style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>PDF</p>
                    </div>
                    
                    {/* Signature Indicator */}
                    {doc.po_signature && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1" title={`Signed by: ${doc.po_signature.signer_name}`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors duration-200"></div>
                    
                    {/* Click to view hint */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Click to preview
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-1">
                    <h3 className="font-medium text-xs leading-tight" 
                        style={{
                          color: document.documentElement.classList.contains('dark') ? 'white' : '#1f2937',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                      {doc.description || `PO #${doc.purchase_document_id}`}
                    </h3>
                    <p className="text-xs"
                       style={{color: document.documentElement.classList.contains('dark') ? '#6b7280' : '#9ca3af'}}>
                      {new Date(doc.issue_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })} • {new Date(doc.issue_date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                    <p className="text-xs truncate"
                       style={{color: document.documentElement.classList.contains('dark') ? '#60a5fa' : '#2563eb'}}
                       title={doc.pdf_filename}>
                      📄 {doc.pdf_filename}
                    </p>
                    {doc.po_signature && (
                      <p className="text-xs truncate"
                         style={{color: document.documentElement.classList.contains('dark') ? '#10b981' : '#059669'}}
                         title={`Signed by: ${doc.po_signature.signer_name}`}>
                        ✓ Signed by {doc.po_signature.signer_name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {documents.length === 0 && (
              <div className="text-center py-16">
                <div className="mb-4">
                  <svg className="w-20 h-20 mx-auto" 
                       style={{color: document.documentElement.classList.contains('dark') ? '#4b5563' : '#d1d5db'}}
                       fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2"
                    style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>No documents found</h3>
                <p style={{color: document.documentElement.classList.contains('dark') ? '#6b7280' : '#9ca3af'}}>New documents will appear here when created</p>
              </div>
            )}
          </>
        )}

        {/* PDF Preview Modal */}
        {showPreviewModal && selectedPDF && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closePDFPreview}
          >
            <div 
              className="rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col"
              style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white'}}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b"
                   style={{borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'}}>
                <h2 className="text-lg font-semibold"
                    style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#1f2937'}}>PDF Preview</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(`http://localhost:5000/purchase/pdf/${selectedPDF}`, '_blank')}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors"
                  >
                    Open in New Tab
                  </button>
                  <button
                    onClick={closePDFPreview}
                    className="px-3 py-1 rounded text-sm transition-colors"
                    style={{
                      backgroundColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#9ca3af',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#4b5563' : '#6b7280';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#6b7280' : '#9ca3af';
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
              
              {/* PDF Viewer */}
              <div className="flex-1 overflow-hidden">
                <iframe
                  src={`http://localhost:5000/purchase/pdf/${selectedPDF}`}
                  className="w-full h-full border-0"
                  title="PDF Preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
