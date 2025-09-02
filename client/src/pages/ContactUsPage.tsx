import { ChevronLeft, Mail, Phone, MapPin, Github, Linkedin, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ContactUsPage() {
  const navigate = useNavigate();

  const developers = [
    {
      id: 1,
      name: 'Kampol Suwannatham',
      position: 'Full Stack Developer',
      role: 'Junior Developer',
      image: '/images/developers/mond_dev.png', 
      email: 'kampol.suwannatham@gmail.com',
      phone: '091-946-3346',
      github: 'https://github.com/llSaiMonDll',
      
      description: 'Specialized in React, TypeScript and UI/UX Design'
    },
    {
      id: 2,
      name: 'Ratchada Prompong',
      position: 'Full Stack Developer',
      role: 'Junior Developer',
      image: '/images/developers/ink_dev.png', 
      email: 'dev2@pharmac.com',
      phone: '082-xxx-xxxx',
      github: '#',
      description: 'Specialized in Node.js, Database and API Development'
    },
    {
      id: 3,
      name: 'Issadame Damero',
      position: 'Full Stack Developer',
      role: 'Junior Developer',
      image: '/images/developers/neo_dev.png', 
      email: 'dev3@pharmac.com',
      phone: '083-xxx-xxxx',
      github: '#',
      description: 'Specialized in Full Stack Development and DevOps'
    }
  ];

  return (
    <div className="min-h-screen"
         style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#f9fafb'}}>
      {/* Header */}
      <div className="shadow-sm border-b"
           style={{
             backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
             borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
           }}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              className="flex items-center justify-center w-10 h-10 rounded-full mr-4 shadow-md transition-all duration-200"
              style={{
                backgroundColor: document.documentElement.classList.contains('dark') ? '#059669' : '#16a34a',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#047857' : '#15803d';
                target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#059669' : '#16a34a';
                target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              }}
              onClick={() => navigate('/settings')}
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold"
                  style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                Contact Us
              </h1>
              <p className="text-sm mt-1"
                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563'}}>
                Contact Us - PharmaC Development Team
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="rounded-lg shadow-md p-8 mb-8 text-center"
             style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white'}}>
          <div className="flex items-center justify-center mb-4">
            <Code className="w-8 h-8 mr-3"
                  style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563'}} />
            <h2 className="text-2xl font-bold"
                style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
              PharmaC Development Team
            </h2>
          </div>
          <p className="leading-relaxed max-w-3xl mx-auto"
             style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
            We are a team of 3 developers dedicated to creating the best pharmacy management system. 
            With expertise and experience in software development, we are ready to serve and support you throughout your usage.
          </p>
        </div>

        {/* Development Team */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-6 text-center"
              style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
            Meet Our Development Team
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {developers.map((dev) => (
              <div key={dev.id} 
                   className="rounded-lg shadow-md overflow-hidden transition-all duration-300"
                   style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white'}}
                   onMouseEnter={(e) => {
                     const target = e.target as HTMLDivElement;
                     target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                   }}
                   onMouseLeave={(e) => {
                     const target = e.target as HTMLDivElement;
                     target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                   }}>
                {/* Profile Image */}
                <div className="relative">
                  <div className="w-full h-64 bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                    <img
                      src={dev.image}
                      alt={dev.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full flex flex-col items-center justify-center text-white">
                              <div class="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3">
                                <span class="text-2xl font-bold">${dev.name.charAt(0)}</span>
                              </div>
                              <p class="text-sm">Photo coming soon</p>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                  <div className="absolute top-4 right-4 text-white px-3 py-1 rounded-full text-xs font-medium"
                       style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#4b5563'}}>
                    {dev.role}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="p-6">
                  <h4 className="text-xl font-bold mb-1"
                      style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                    {dev.name}
                  </h4>
                  <p className="font-medium mb-3"
                     style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563'}}>
                    {dev.position}
                  </p>
                  <p className="text-sm mb-4 leading-relaxed"
                     style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                    {dev.description}
                  </p>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm"
                         style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563'}}>
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{dev.email}</span>
                    </div>
                    <div className="flex items-center text-sm"
                         style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563'}}>
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{dev.phone}</span>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex space-x-3">
                    <a
                      href={dev.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full transition-colors"
                      style={{
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f3f4f6'
                      }}
                      onMouseEnter={(e) => {
                        const target = e.target as HTMLAnchorElement;
                        target.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb';
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as HTMLAnchorElement;
                        target.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#4b5563' : '#f3f4f6';
                      }}
                    >
                      <Github className="w-4 h-4"
                              style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563'}} />
                    </a>
                  
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="rounded-lg shadow-md p-8"
             style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white'}}>
          <h3 className="text-xl font-semibold mb-6 text-center"
              style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
            Contact Information
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Company Info */}
            <div>
              <h4 className="font-semibold mb-4"
                  style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                Company Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 mt-0.5"
                          style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563'}} />
                  <div>
                    <p className="font-medium"
                       style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                      PharmaC Development
                    </p>
                    <p className="text-sm"
                       style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                      123 Technology Road<br />
                      Technology District, Innovation Zone<br />
                      Bangkok 10400, Thailand
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3"
                         style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563'}} />
                  <span style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                    02-xxx-xxxx
                  </span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3"
                        style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563'}} />
                  <span style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                    contact@pharmac.com
                  </span>
                </div>
              </div>
            </div>

            {/* Support Info */}
            <div>
              <h4 className="font-semibold mb-4"
                  style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                Support
              </h4>
              <div className="space-y-3 text-sm"
                   style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                <div>
                  <p className="font-medium mb-1"
                     style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                    Business Hours
                  </p>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday - Sunday: 9:00 AM - 5:00 PM</p>
                </div>
                <div>
                  <p className="font-medium mb-1"
                     style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                    Response Time
                  </p>
                  <p>Email: Within 24 hours</p>
                  <p>Phone: Immediate during business hours</p>
                </div>
                <div>
                  <p className="font-medium mb-1"
                     style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                    Supported Languages
                  </p>
                  <p>Thai, English</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/settings')}
            className="font-semibold px-8 py-3 rounded-lg shadow-md transition-all duration-200"
            style={{
              backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#4b5563',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#374151' : '#374151';
              target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#4b5563' : '#4b5563';
              target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            Back to Settings
          </button>
        </div>
      </div>
    </div>
  );
}
