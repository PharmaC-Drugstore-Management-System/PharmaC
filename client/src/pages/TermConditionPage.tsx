import { ChevronLeft, Shield, FileText, AlertTriangle, Users, Database, Lock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsConditionsPage() {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: <FileText className="w-6 h-6" />,
      content: [
        'By using the PharmaC system, you agree to accept all these terms and conditions',
        'If you do not agree to any of these terms, please stop using the system immediately',
        'We reserve the right to change these terms without prior notice'
      ]
    },
    {
      id: 'usage',
      title: 'System Usage',
      icon: <Users className="w-6 h-6" />,
      content: [
        'PharmaC system is designed exclusively for pharmacy and pharmaceutical management',
        'Users must have valid legal licenses to sell pharmaceuticals',
        'Using the system for illegal or inappropriate activities is prohibited',
        'Users are responsible for the security of their own accounts'
      ]
    },
    {
      id: 'data',
      title: 'Data Security',
      icon: <Database className="w-6 h-6" />,
      content: [
        'We will protect your data with the highest security standards',
        'Personal data will not be disclosed to third parties without authorization',
        'The system includes data backup and encryption to prevent loss',
        'Users have the right to access, modify, or delete personal data'
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: <Lock className="w-6 h-6" />,
      content: [
        'We collect only data necessary for service provision',
        'Usage data may be analyzed to improve the system',
        'We do not sell or rent personal data to third parties',
        'You can request to view or modify personal data at any time'
      ]
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      icon: <AlertTriangle className="w-6 h-6" />,
      content: [
        'PharmaC is not responsible for damages caused by system usage',
        'Users must verify data accuracy before using the system',
        'The system may have temporary service interruptions for maintenance',
        'We do not guarantee 100% error-free system operation'
      ]
    },
    {
      id: 'updates',
      title: 'Updates and Changes',
      icon: <RefreshCw className="w-6 h-6" />,
      content: [
        'The system will be updated periodically to improve performance',
        'New features may be added or changed without prior notice',
        'Users should regularly monitor changes and updates',
        'Updates will not affect existing data'
      ]
    }
  ];

  return (
    <div className="min-h-screen"
         style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#f3f4f6'}}>
      {/* Header */}
      <div className="shadow-sm border-b"
           style={{
             backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
             borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
           }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              className="flex items-center justify-center w-10 h-10 rounded-full mr-4 shadow-lg transition-all duration-200"
              style={{
                backgroundColor: document.documentElement.classList.contains('dark') ? '#059669' : '#16a34a',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
              }}
              onClick={() => navigate('/settings')}
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold"
                  style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                Terms and Conditions
              </h1>
              <p className="text-sm mt-1"
                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563'}}>
                Terms and Conditions - PharmaC System
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="rounded-2xl shadow-lg p-8 mb-8 border-l-4"
             style={{
               backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
               borderColor: document.documentElement.classList.contains('dark') ? '#3b82f6' : '#3b82f6'
             }}>
          <div className="flex items-center mb-4">
            <Shield className="w-8 h-8 mr-3"
                    style={{color: document.documentElement.classList.contains('dark') ? '#60a5fa' : '#2563eb'}} />
            <h2 className="text-xl font-semibold"
                style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
              About These Terms
            </h2>
          </div>
          <p className="leading-relaxed"
             style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
            These terms and conditions apply to the use of the PharmaC pharmacy management system. 
            Please read and understand them before using the system. Using the system means you accept all these terms.
          </p>
          <div className="mt-4 p-4 rounded-lg"
               style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#1e3a8a' : '#dbeafe'}}>
            <p className="text-sm"
               style={{color: document.documentElement.classList.contains('dark') ? '#93c5fd' : '#1e40af'}}>
              <strong>Effective Date:</strong> August 26, 2025<br />
              <strong>Version:</strong> 1.0
            </p>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="rounded-2xl shadow-lg overflow-hidden transition-all duration-300"
              style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white'}}
              onMouseEnter={(e) => {
                const target = e.target as HTMLDivElement;
                target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLDivElement;
                target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div className="px-6 py-4 border-b"
                   style={{
                     background: document.documentElement.classList.contains('dark') 
                       ? 'linear-gradient(to right, #4b5563, #6b7280)' 
                       : 'linear-gradient(to right, #f9fafb, #f3f4f6)',
                     borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb'
                   }}>
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4"
                       style={{
                         background: document.documentElement.classList.contains('dark') 
                           ? 'linear-gradient(to right, #3b82f6, #6366f1)' 
                           : 'linear-gradient(to right, #3b82f6, #6366f1)'
                       }}>
                    <div className="text-white">
                      {section.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold"
                        style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                      {index + 1}. {section.title}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                           style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#60a5fa' : '#3b82f6'}}></div>
                      <p className="leading-relaxed"
                         style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                        {item}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="rounded-2xl shadow-lg p-8 mt-8 border-l-4"
             style={{
               backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
               borderColor: document.documentElement.classList.contains('dark') ? '#10b981' : '#10b981'
             }}>
          <h3 className="text-xl font-semibold mb-4"
              style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
            Contact Information
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2"
                  style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                Contact Details
              </h4>
              <p className="text-sm leading-relaxed"
                 style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                If you have questions about these terms and conditions<br />
                Please contact the PharmaC development team<br />
                <strong>Email:</strong> support@pharmac.com<br />
                <strong>Phone:</strong> 02-xxx-xxxx
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2"
                  style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                Issue Reporting
              </h4>
              <p className="text-sm leading-relaxed"
                 style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                If you encounter usage problems or errors<br />
                You can report them through the Support system<br />
                Our team will address issues promptly
              </p>
            </div>
          </div>
        </div>

        {/* Agreement Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/settings')}
            className="font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-200"
            style={{
              background: document.documentElement.classList.contains('dark') 
                ? 'linear-gradient(to right, #3b82f6, #6366f1)' 
                : 'linear-gradient(to right, #2563eb, #6366f1)',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = document.documentElement.classList.contains('dark') 
                ? 'linear-gradient(to right, #1d4ed8, #4f46e5)' 
                : 'linear-gradient(to right, #1d4ed8, #4f46e5)';
              target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = document.documentElement.classList.contains('dark') 
                ? 'linear-gradient(to right, #3b82f6, #6366f1)' 
                : 'linear-gradient(to right, #2563eb, #6366f1)';
              target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
          >
            I have read and accept these terms
          </button>
        </div>
      </div>
    </div>
  );
}
