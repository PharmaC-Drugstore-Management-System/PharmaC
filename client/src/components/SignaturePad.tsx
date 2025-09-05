import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Check, RotateCcw } from 'lucide-react';

interface SignaturePadProps {
    onSignatureChange: (signature: string | null) => void;
    signerName: string;
    signerRole: string;
    required?: boolean;
    value?: string | null;
    disabled?: boolean;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
    onSignatureChange,
    signerName,
    signerRole,
    required = false,
    value = null,
    disabled = false
}) => {
    const sigPad = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);
    const [deviceInfo, setDeviceInfo] = useState<any>(null);
    const [hasSignature, setHasSignature] = useState(false);

    // Check if dark mode is enabled
    const isDark = document.documentElement.classList.contains('dark');

    useEffect(() => {
        // Capture device fingerprint
        setDeviceInfo({
            userAgent: navigator.userAgent,
            screen: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timestamp: new Date().toISOString()
        });

        // Load existing signature if provided
        if (value && sigPad.current) {
            sigPad.current.fromDataURL(value);
            setIsEmpty(false);
            setHasSignature(true);
        }
    }, [value]);

    const clear = () => {
        if (disabled) return;
        
        sigPad.current?.clear();
        setIsEmpty(true);
        setHasSignature(false);
        onSignatureChange(null);
    };

    const handleEnd = () => {
        if (disabled) return;
        
        if (sigPad.current && !sigPad.current.isEmpty()) {
            setIsEmpty(false);
            setHasSignature(true);
            // Auto-save when signature is completed
            const signatureData = sigPad.current.toDataURL('image/png');
            onSignatureChange(signatureData);
        }
    };

    const handleBegin = () => {
        if (disabled) return;
        setIsEmpty(false);
    };

    return (
        <div className={`border-2 rounded-lg p-6 transition-colors w-full`}
             style={{
               borderColor: hasSignature 
                 ? (isDark ? '#10b981' : '#86efac')
                 : (isDark ? '#4b5563' : '#d1d5db'),
               backgroundColor: hasSignature 
                 ? (isDark ? '#064e3b' : '#f0fdf4')
                 : (isDark ? '#374151' : 'white')
             }}>
            <div className="mb-4">
                <label className="block text-lg font-medium transition-colors duration-300"
                       style={{color: isDark ? '#e5e7eb' : '#374151'}}>
                    Digital Signature {required && <span className="text-red-500">*</span>}
                </label>
                <p className="text-sm mt-2 transition-colors duration-300"
                   style={{color: isDark ? '#9ca3af' : '#6b7280'}}>
                    {signerName} - {signerRole}
                </p>
                {hasSignature && (
                    <p className="text-sm mt-2 flex items-center gap-1"
                       style={{color: isDark ? '#10b981' : '#059669'}}>
                        <Check className="w-4 h-4" />
                        Signature captured
                    </p>
                )}
            </div>
            
            <div className={`border rounded-lg overflow-hidden w-full ${disabled ? 'opacity-50' : ''}`} 
                 style={{ 
                   height: '200px',
                   borderColor: isDark ? '#4b5563' : '#e5e7eb'
                 }}>
                <SignatureCanvas
                    ref={sigPad}
                    canvasProps={{
                        className: `signature-canvas ${disabled ? 'pointer-events-none' : ''}`,
                        style: { 
                          width: '100%', 
                          height: '100%',
                          backgroundColor: isDark ? '#f9fafb' : '#f9fafb'
                        }
                    }}
                    onEnd={handleEnd}
                    onBegin={handleBegin}
                />
            </div>
            
            <div className="flex justify-between items-center mt-4">
                <div className="text-sm transition-colors duration-300"
                     style={{color: isDark ? '#9ca3af' : '#9ca3af'}}>
                    {disabled ? 'View only' : 'Sign above'}
                </div>
                {!disabled && (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={clear}
                            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors duration-200 border"
                            style={{
                              color: isDark ? '#d1d5db' : '#4b5563',
                              borderColor: isDark ? '#4b5563' : '#d1d5db',
                              backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              const target = e.target as HTMLButtonElement;
                              target.style.backgroundColor = isDark ? '#4b5563' : '#f9fafb';
                              target.style.color = isDark ? 'white' : '#1f2937';
                            }}
                            onMouseLeave={(e) => {
                              const target = e.target as HTMLButtonElement;
                              target.style.backgroundColor = 'transparent';
                              target.style.color = isDark ? '#d1d5db' : '#4b5563';
                            }}
                        >
                            <RotateCcw className="w-4 h-4" />
                            Clear
                        </button>
                       
                    </div>
                )}
            </div>

            {/* Device Info for Security */}
            {deviceInfo && !disabled && (
                <div className="mt-4 text-xs border-t pt-3 transition-colors duration-300"
                     style={{
                       color: isDark ? '#6b7280' : '#9ca3af',
                       borderColor: isDark ? '#4b5563' : '#e5e7eb'
                     }}>
                    <div>Device: {deviceInfo.screen} | {deviceInfo.timezone}</div>
                    <div>Time: {new Date(deviceInfo.timestamp).toLocaleString()}</div>
                </div>
            )}
        </div>
    );
};

export default SignaturePad;
