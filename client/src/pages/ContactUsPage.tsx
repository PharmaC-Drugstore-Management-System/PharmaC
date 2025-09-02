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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              className="flex items-center justify-center w-10 h-10 bg-green-600 hover:bg-gray-700 rounded-full mr-4 shadow-md hover:shadow-lg transition-all duration-200"
              onClick={() => navigate('/settings')}
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contact Us</h1>
              <p className="text-sm text-gray-600 mt-1">Contact Us - PharmaC Development Team</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Code className="w-8 h-8 text-gray-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">PharmaC Development Team</h2>
          </div>
          <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto">
            We are a team of 3 developers dedicated to creating the best pharmacy management system. 
            With expertise and experience in software development, we are ready to serve and support you throughout your usage.
          </p>
        </div>

        {/* Development Team */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Meet Our Development Team</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {developers.map((dev) => (
              <div key={dev.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
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
                  <div className="absolute top-4 right-4 bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {dev.role}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">{dev.name}</h4>
                  <p className="text-gray-600 font-medium mb-3">{dev.position}</p>
                  <p className="text-gray-700 text-sm mb-4 leading-relaxed">{dev.description}</p>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{dev.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
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
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <Github className="w-4 h-4 text-gray-600" />
                    </a>
                  
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Contact Information</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Company Info */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company Information</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">PharmaC Development</p>
                    <p className="text-gray-700 text-sm">
                      123 Technology Road<br />
                      Technology District, Innovation Zone<br />
                      Bangkok 10400, Thailand
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="text-gray-700">02-xxx-xxxx</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="text-gray-700">contact@pharmac.com</span>
                </div>
              </div>
            </div>

            {/* Support Info */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <p className="font-medium text-gray-900 mb-1">Business Hours</p>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday - Sunday: 9:00 AM - 5:00 PM</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Response Time</p>
                  <p>Email: Within 24 hours</p>
                  <p>Phone: Immediate during business hours</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Supported Languages</p>
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
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            Back to Settings
          </button>
        </div>
      </div>
    </div>
  );
}
