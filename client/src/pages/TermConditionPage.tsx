import { ChevronLeft, Shield, FileText, AlertTriangle, Users, Database, Lock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function TermsConditionsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const sections = [
    {
      id: 'acceptance',
      title: t('acceptanceOfTerms'),
      icon: <FileText className="w-6 h-6" />,
      content: [
        t('acceptanceContent1'),
        t('acceptanceContent2'),
        t('acceptanceContent3')
      ]
    },
    {
      id: 'usage',
      title: t('systemUsage'),
      icon: <Users className="w-6 h-6" />,
      content: [
        t('usageContent1'),
        t('usageContent2'),
        t('usageContent3'),
        t('usageContent4')
      ]
    },
    {
      id: 'data',
      title: t('dataSecurity'),
      icon: <Database className="w-6 h-6" />,
      content: [
        t('dataContent1'),
        t('dataContent2'),
        t('dataContent3'),
        t('dataContent4')
      ]
    },
    {
      id: 'privacy',
      title: t('privacyPolicy'),
      icon: <Lock className="w-6 h-6" />,
      content: [
        t('privacyContent1'),
        t('privacyContent2'),
        t('privacyContent3'),
        t('privacyContent4')
      ]
    },
    {
      id: 'liability',
      title: t('limitationOfLiability'),
      icon: <AlertTriangle className="w-6 h-6" />,
      content: [
        t('liabilityContent1'),
        t('liabilityContent2'),
        t('liabilityContent3'),
        t('liabilityContent4')
      ]
    },
    {
      id: 'updates',
      title: t('updatesAndChanges'),
      icon: <RefreshCw className="w-6 h-6" />,
      content: [
        t('updatesContent1'),
        t('updatesContent2'),
        t('updatesContent3'),
        t('updatesContent4')
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
                {t('termsAndConditions')}
              </h1>
              <p className="text-sm mt-1"
                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563'}}>
                {t('termsSystemSubtitle')}
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
              {t('aboutTheseTerms')}
            </h2>
          </div>
          <p className="leading-relaxed"
             style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
            {t('termsIntroduction')}
          </p>
          <div className="mt-4 p-4 rounded-lg"
               style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#1e3a8a' : '#dbeafe'}}>
            <p className="text-sm"
               style={{color: document.documentElement.classList.contains('dark') ? '#93c5fd' : '#1e40af'}}>
              <strong>{t('effectiveDate')}:</strong> August 26, 2025<br />
              <strong>{t('termsVersion')}:</strong> 1.0
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
            {t('contactInformation')}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2"
                  style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                {t('contactDetails')}
              </h4>
              <p className="text-sm leading-relaxed"
                 style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                {t('termsContactText').split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    {index < t('termsContactText').split('\n').length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2"
                  style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                {t('issueReporting')}
              </h4>
              <p className="text-sm leading-relaxed"
                 style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                {t('issueReportingText').split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    {index < t('issueReportingText').split('\n').length - 1 && <br />}
                  </span>
                ))}
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
            {t('readAndAcceptTerms')}
          </button>
        </div>
      </div>
    </div>
  );
}
