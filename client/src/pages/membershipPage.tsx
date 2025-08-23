import { useEffect, useState } from "react";
import {
  Trophy,
  Crown,
  Users,
  User,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit3,
  UserPlus,
  Calendar,
  Badge,
  Gift,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Member {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  joinDate: string;
  score: number;
  rank: number;
  membershipType: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

export default function MemberManagementPage() {
  const [members, setMembers] = useState<Member[]>([
    {
      id: 1,
      name: "John Kumho",
      phone: "089-123-4567",
      email: "john.kumho@email.com",
      address: "123 ถนนสุขุมวิท กรุงเทพฯ",
      joinDate: "2024-01-15",
      score: 120,
      rank: 1,
      membershipType: 'Gold',
    },
    {
      id: 2,
      name: "Smith Mitharlai",
      phone: "087-234-5678",
      email: "smith.m@email.com",
      address: "456 ถนนรัชดาภิเษก กรุงเทพฯ",
      joinDate: "2024-02-20",
      score: 80,
      rank: 2,
      membershipType: 'Silver',
    },
    {
      id: 3,
      name: "Thatatorn Jalearnkrit",
      phone: "081-345-6789",
      email: "thatatorn.j@email.com",
      address: "789 ถนนลาดพร้าว กรุงเทพฯ",
      joinDate: "2024-03-10",
      score: 30,
      rank: 3,
      membershipType: 'Bronze',
    },
    {
      id: 4,
      name: "Sumitha Naksombut",
      phone: "082-456-7890",
      email: "sumitha.n@email.com",
      address: "321 ถนนพระราม 4 กรุงเทพฯ",
      joinDate: "2024-04-05",
      score: 12,
      rank: 4,
      membershipType: 'Bronze',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showRankingSection, setShowRankingSection] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    membershipType: "Bronze" as const,
  });

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMembershipColor = (type: string) => {
    switch (type) {
      case 'Platinum':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      case 'Gold':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
      case 'Silver':
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
      case 'Bronze':
        return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddMember = () => {
    if (newMember.name && newMember.phone && newMember.email) {
      const newId = Math.max(...members.map(m => m.id)) + 1;
      const currentDate = new Date().toISOString().split('T')[0];
      
      setMembers([...members, {
        id: newId,
        ...newMember,
        joinDate: currentDate,
        score: 0,
        rank: members.length + 1,
      }]);
      
      setNewMember({
        name: "",
        phone: "",
        email: "",
        address: "",
        membershipType: "Bronze",
      });
      
      setShowAddMemberModal(false);
    }
  };
  const navigate = useNavigate();
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


  useEffect(() => {
    checkme()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-1 h-8 bg-green-600 mr-2"></div>
            <h2 className="text-xl font-bold text-black">
              จัดการสมาชิก
            </h2>
          </div>
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            เพิ่มสมาชิกใหม่
          </button>
        </div>
        <p className="text-gray-600 mt-1">รายชื่อลูกค้าที่เป็นสมาชิกทั้งหมด</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">สมาชิกทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{members.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Badge className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Gold Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.filter(m => m.membershipType === 'Gold').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">สมาชิกใหม่เดือนนี้</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.filter(m => {
                  const joinMonth = new Date(m.joinDate).getMonth();
                  const currentMonth = new Date().getMonth();
                  return joinMonth === currentMonth;
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Gift className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">คะแนนรวม</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.reduce((sum, m) => sum + m.score, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหาสมาชิก (ชื่อ, เบอร์โทร, อีเมล)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">รายชื่อสมาชิก</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                ทั้งหมด {filteredMembers.length} คน
              </span>
              <button
                onClick={() => setShowRankingSection(!showRankingSection)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Trophy className="w-4 h-4" />
                {showRankingSection ? 'ซ่อน' : 'แสดง'}อันดับ
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สมาชิก
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ข้อมูลติดต่อ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ที่อยู่
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่สมัคร
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ระดับสมาชิก
                </th>
                {showRankingSection && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    คะแนน/อันดับ
                  </th>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {member.id.toString().padStart(3, "0")}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center gap-1 mb-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {member.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        {member.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      <MapPin className="w-3 h-3 text-gray-400 inline mr-1" />
                      {member.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(member.joinDate).toLocaleDateString('th-TH')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMembershipColor(member.membershipType)}`}>
                      {member.membershipType}
                    </span>
                  </td>
                  {showRankingSection && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900">{member.score} คะแนน</div>
                        <div className="text-xs text-gray-500">อันดับ #{member.rank}</div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-blue-600 hover:text-blue-800 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Small Ranking Section (when expanded) */}
      {showRankingSection && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            อันดับสมาชิกยอดเยี่ยม
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {members.slice(0, 3).map((member, index) => (
              <div key={member.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.score} คะแนน</div>
                </div>
                {index === 0 && <Crown className="w-4 h-4 text-yellow-500 ml-2" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">เพิ่มสมาชิกใหม่</h3>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="08X-XXX-XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                <textarea
                  value={newMember.address}
                  onChange={(e) => setNewMember({...newMember, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="กรอกที่อยู่"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ระดับสมาชิก</label>
                <select
                  value={newMember.membershipType}
                  onChange={(e) => setNewMember({...newMember, membershipType: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddMember}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                เพิ่มสมาชิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
