import { ChevronLeft, Shield, FileText, AlertTriangle, Users, Database, Lock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsConditionsPage() {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'acceptance',
      title: 'การยอมรับข้อกำหนด',
      icon: <FileText className="w-6 h-6" />,
      content: [
        'การใช้งานระบบ PharmaC ถือว่าคุณได้ยอมรับข้อกำหนดและเงื่อนไขทั้งหมดนี้',
        'หากคุณไม่ยอมรับข้อกำหนดใดๆ กรุณาหยุดการใช้งานระบบทันที',
        'เราสงวนสิทธิ์ในการเปลี่ยนแปลงข้อกำหนดเหล่านี้โดยไม่ต้องแจ้งให้ทราบล่วงหน้า'
      ]
    },
    {
      id: 'usage',
      title: 'การใช้งานระบบ',
      icon: <Users className="w-6 h-6" />,
      content: [
        'ระบบ PharmaC ออกแบบมาเพื่อการจัดการร้านขายยาและเภสัชกรรมเท่านั้น',
        'ผู้ใช้งานต้องมีใบอนุญาตที่ถูกต้องตามกฎหมายในการขายยา',
        'ห้ามใช้ระบบในการทำกิจกรรมที่ผิดกฎหมายหรือไม่เหมาะสม',
        'ผู้ใช้งานต้องรับผิดชอบต่อการใช้งานบัญชีของตนเอง'
      ]
    },
    {
      id: 'data',
      title: 'ความปลอดภัยของข้อมูล',
      icon: <Database className="w-6 h-6" />,
      content: [
        'เราจะเก็บรักษาข้อมูลของคุณด้วยมาตรฐานความปลอดภัยสูงสุด',
        'ข้อมูลส่วนบุคคลจะไม่ถูกเปิดเผยแก่บุคคลที่สามโดยไม่ได้รับอนุญาต',
        'ระบบมีการสำรองข้อมูลและการเข้ารหัสเพื่อป้องกันการสูญหาย',
        'ผู้ใช้งานมีสิทธิ์ในการเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคล'
      ]
    },
    {
      id: 'privacy',
      title: 'นโยบายความเป็นส่วนตัว',
      icon: <Lock className="w-6 h-6" />,
      content: [
        'เราเก็บรวบรวมข้อมูลที่จำเป็นสำหรับการให้บริการเท่านั้น',
        'ข้อมูลการใช้งานอาจถูกนำมาวิเคราะห์เพื่อปรับปรุงระบบ',
        'เราไม่ขายหรือให้เช่าข้อมูลส่วนบุคคลแก่บุคคลที่สาม',
        'คุณสามารถขอดูหรือแก้ไขข้อมูลส่วนบุคคลได้ตลอดเวลา'
      ]
    },
    {
      id: 'liability',
      title: 'ข้อจำกัดความรับผิดชอบ',
      icon: <AlertTriangle className="w-6 h-6" />,
      content: [
        'PharmaC ไม่รับผิดชอบต่อความเสียหายที่เกิดจากการใช้งานระบบ',
        'ผู้ใช้งานต้องตรวจสอบความถูกต้องของข้อมูลก่อนการใช้งาน',
        'ระบบอาจมีการหยุดให้บริการชั่วคราวเพื่อการบำรุงรักษา',
        'เราไม่รับประกันการทำงานของระบบที่ปราศจากข้อผิดพลาด 100%'
      ]
    },
    {
      id: 'updates',
      title: 'การอัปเดตและการเปลี่ยนแปลง',
      icon: <RefreshCw className="w-6 h-6" />,
      content: [
        'ระบบจะมีการอัปเดตเป็นระยะๆ เพื่อปรับปรุงประสิทธิภาพ',
        'ฟีเจอร์ใหม่อาจถูกเพิ่มเข้ามาหรือเปลี่ยนแปลงโดยไม่ต้องแจ้งล่วงหน้า',
        'ผู้ใช้งานควรติดตามการเปลี่ยนแปลงและอัปเดตอย่างสม่ำเสมอ',
        'การอัปเดตจะไม่ส่งผลกระทบต่อข้อมูลที่มีอยู่เดิม'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full mr-4 shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => navigate('/settings')}
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ข้อกำหนดและเงื่อนไข</h1>
              <p className="text-sm text-gray-600 mt-1">Terms and Conditions - PharmaC System</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-l-4 border-blue-500">
          <div className="flex items-center mb-4">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">เกี่ยวกับข้อกำหนดนี้</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            ข้อกำหนดและเงื่อนไขนี้ใช้สำหรับการใช้งานระบบจัดการร้านขายยา PharmaC 
            โปรดอ่านและทำความเข้าใจก่อนการใช้งาน การใช้งานระบบถือว่าคุณยอมรับข้อกำหนดทั้งหมด
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>วันที่มีผลบังคับใช้:</strong> 26 สิงหาคม 2568<br />
              <strong>เวอร์ชัน:</strong> 1.0
            </p>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-4">
                    <div className="text-white">
                      {section.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {index + 1}. {section.title}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-gray-700 leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8 border-l-4 border-green-500">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">การติดต่อ</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">ข้อมูลติดต่อ</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                หากมีคำถามเกี่ยวกับข้อกำหนดและเงื่อนไข<br />
                กรุณาติดต่อทีมพัฒนา PharmaC<br />
                <strong>อีเมล:</strong> support@pharmac.com<br />
                <strong>โทรศัพท์:</strong> 02-xxx-xxxx
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">การแจ้งปัญหา</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                หากพบปัญหาการใช้งานหรือข้อผิดพลาด<br />
                สามารถแจ้งได้ผ่านระบบ Support<br />
                ทีมงานจะดำเนินการแก้ไขอย่างรวดเร็ว
              </p>
            </div>
          </div>
        </div>

        {/* Agreement Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/settings')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            ฉันได้อ่านและยอมรับข้อกำหนดแล้ว
          </button>
        </div>
      </div>
    </div>
  );
}
