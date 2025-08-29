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
        <div className={`border-2 ${hasSignature ? 'border-green-300 bg-green-50' : 'border-gray-300'} rounded-lg p-6 bg-white transition-colors w-full`}>
            <div className="mb-4">
                <label className="block text-lg font-medium text-gray-700">
                    Digital Signature {required && <span className="text-red-500">*</span>}
                </label>
                <p className="text-sm text-gray-500 mt-2">
                    {signerName} - {signerRole}
                </p>
                {hasSignature && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Signature captured
                    </p>
                )}
            </div>
            
            <div className={`border border-gray-200 rounded-lg overflow-hidden w-full ${disabled ? 'opacity-50' : ''}`} style={{ height: '200px' }}>
                <SignatureCanvas
                    ref={sigPad}
                    canvasProps={{
                        className: `signature-canvas ${disabled ? 'pointer-events-none' : 'bg-gray-50'}`,
                        style: { width: '100%', height: '100%' }
                    }}
                    onEnd={handleEnd}
                    onBegin={handleBegin}
                />
            </div>
            
            <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-400">
                    {disabled ? 'View only' : 'Sign above'}
                </div>
                {!disabled && (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={clear}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Clear
                        </button>
                       
                    </div>
                )}
            </div>

            {/* Device Info for Security */}
            {deviceInfo && !disabled && (
                <div className="mt-4 text-xs text-gray-400 border-t pt-3">
                    <div>Device: {deviceInfo.screen} | {deviceInfo.timezone}</div>
                    <div>Time: {new Date(deviceInfo.timestamp).toLocaleString()}</div>
                </div>
            )}
        </div>
    );
};

export default SignaturePad;
