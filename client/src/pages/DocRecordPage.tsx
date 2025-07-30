import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export default function DocumentRecord() {
  const navigate = useNavigate();
  const documents = [
    { name: "PO #1", image: "assets/medicine.png" },
    { name: "PO #2", image: "../assets/medicine.png" },
    { name: "PO #3", image: "../assets/medicine.png" },
  ];

  const checkme = async () => {
    try {
      const authme = await fetch('http://localhost:5000/api/me', {
        method: 'GET',
        credentials: 'include'
      })
      const data = await authme.json();
      if (authme.status === 401) {
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
    <div >
      <h1 className="text-2xl font-bold mb-4 text-green-800 p-4">Document Recorded</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="bg-white p-3 rounded-xl border shadow hover:shadow-md transition cursor-pointer"
            onClick={() => window.open(doc.image, "_blank")}
          >
            <img
              src={doc.image}
              alt={doc.name}
              className="rounded-xl w-full h-auto object-cover"
            />
            <p className="mt-2 text-center text-sm text-gray-600">{doc.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
