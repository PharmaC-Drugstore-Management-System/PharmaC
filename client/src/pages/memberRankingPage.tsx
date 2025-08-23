import { useEffect, useState } from "react";
import {
  Trophy,
  Medal,
  Crown,
  Star,
  Users,
  TrendingUp,
  Award,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MembershipRanking() {
  const [members] = useState([
    {
      id: 1,
      name: "John kumho",
      score: 120,
      rank: 1,
    },
    {
      id: 2,
      name: "Smith Mitharlai",
      score: 80,
      rank: 2,
    },
    {
      id: 3,
      name: "Thatatorn Jalearnkrit",
      score: 30,
      rank: 3,
    },
    {
      id: 4,
      name: "Sumitha Naksombut",
      score: 12,
      rank: 4,
    },
  ]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <Star className="w-5 h-5 text-blue-500" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-500";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-400";
      case 3:
        return "bg-gradient-to-r from-amber-500 to-amber-600";
      default:
        return "bg-gradient-to-r from-blue-400 to-blue-500";
    }
  };

  const getScoreColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-700 font-bold";
      case 2:
        return "text-gray-700 font-semibold";
      case 3:
        return "text-amber-700 font-semibold";
      default:
        return "text-blue-700 font-medium";
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
    
        <div className="mb-8">

          <div className="flex items-center mb-6">
            <div className="w-1 h-8 bg-green-600 mr-2"></div>
            <h2 className="text-xl font-bold" style={{ color: "black" }}>
              Member Ranking
            </h2>
          </div>
          <p className="text-gray-600 mt-1">Member ranking by points</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Total Members
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {members.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Highest Score
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...members.map((m) => m.score))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Average Score
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(
                    members.reduce((sum, m) => sum + m.score, 0) /
                    members.length
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ranking Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Member Rankings
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Trophy className="w-4 h-4" />
                <span>Sorted by Score</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className={`hover:bg-gray-50 transition-colors ${member.rank === 1 ? "bg-yellow-50" : ""
                      }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${getRankColor(
                            member.rank
                          )}`}
                        >
                          {member.rank}
                        </div>
                        {getRankIcon(member.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <div
                            className={`text-sm font-medium text-gray-900 ${member.rank === 1 ? "text-yellow-800" : ""
                              }`}
                          >
                            {member.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Member #{member.id.toString().padStart(3, "0")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <span
                          className={`text-lg font-semibold ${getScoreColor(
                            member.rank
                          )}`}
                        >
                          {member.score}
                        </span>
                        <Star
                          className={`w-4 h-4 ${member.rank === 1
                              ? "text-yellow-500"
                              : "text-gray-400"
                            }`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
            Top 3 Champions
          </h3>
          <div className="flex justify-center items-end space-x-4">
            {/* 2nd Place */}
            <div className="text-center">
              <div className="w-20 h-16 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg flex items-center justify-center mb-2">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {members[1]?.name}
              </div>
              <div className="text-xs text-gray-500">
                {members[1]?.score} pts
              </div>
            </div>

            {/* 1st Place */}
            <div className="text-center">
              <div className="w-24 h-20 bg-gradient-to-t from-yellow-400 to-yellow-500 rounded-t-lg flex items-center justify-center mb-2">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div className="text-sm font-bold text-gray-900">
                {members[0]?.name}
              </div>
              <div className="text-xs text-yellow-700 font-semibold">
                {members[0]?.score} pts
              </div>
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className="w-20 h-12 bg-gradient-to-t from-amber-500 to-amber-600 rounded-t-lg flex items-center justify-center mb-2">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {members[2]?.name}
              </div>
              <div className="text-xs text-gray-500">
                {members[2]?.score} pts
              </div>
            </div>
          </div>
        </div>
     
    </div>
  );
}
