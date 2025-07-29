export default function DocumentRecord() {
  const documents = [
    { name: "PO #1", image: "assets/medicine.png" },
    { name: "PO #2", image: "../assets/medicine.png" },
    { name: "PO #3", image: "../assets/medicine.png" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-green-800">Document Recorded</h1>
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
