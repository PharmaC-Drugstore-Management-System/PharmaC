import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
interface Document {
  purchase_document_id: number;
  description: string;
  issue_date: string;
  pdf_filename: string;
  pdf_mime: string;
  signature_fk: number | null;
  po_signature: {
    id: number;
    signer_name: string;
    signature_image: string | null;
    signed_at: string;
  } | null;
  employee: {
    firstname: string;
    lastname: string;
    email: string;
  } | null;
}

export default function DocumentRecord() {
  const API_URL = import.meta.env.VITE_API_URL;
  // SERVER_URL for static files (uploads) - remove /api suffix
  const SERVER_URL = API_URL.startsWith('http') ? API_URL.replace('/api', '') : '';
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "po_number">(
    "date_desc"
  );
  const [filterSigned, setFilterSigned] = useState<
    "all" | "signed" | "unsigned"
  >("all");

  // Bulk Actions states
  const [selectedDocuments, setSelectedDocuments] = useState<Set<number>>(
    new Set()
  );
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<number | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Helper function to convert signature image URLs
  const getSignatureImageUrl = (signatureUrl: string | null): string => {
    if (!signatureUrl) return '';
    
    // If it's a localhost URL, extract the path
    if (signatureUrl.includes('://localhost') || signatureUrl.includes('://127.0.0.1')) {
      try {
        const url = new URL(signatureUrl);
        return SERVER_URL + url.pathname;
      } catch (e) {
        console.warn('Failed to parse signature URL:', signatureUrl, e);
        return signatureUrl;
      }
    }
    
    // If it's already a relative path starting with /uploads, prepend SERVER_URL if needed
    if (signatureUrl.startsWith('/uploads')) {
      return SERVER_URL + signatureUrl;
    }
    
    // Otherwise return as-is
    return signatureUrl;
  };

  const checkme = async () => {
    try {
      const authme = await fetch(`${API_URL}/me`, {
        method: "GET",
        credentials: "include",
      });
      const data = await authme.json();
      if (authme.status === 401 || authme.status === 403) {
        navigate("/login");
        return;
      }

      console.log("Authme data:", data);
    } catch (error) {
      console.log("Error", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/purchase/pdfs`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDocuments(data.documents);
        }
      } else {
        console.error("Failed to fetch documents");
        // GET request - show error alert only
        Swal.fire({
          title: "Error!",
          text: `Failed to fetch documents Error code : ${response.status}`,
          icon: "error",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      // GET request - show error alert only
      Swal.fire({
        title: "Error!",
        text: "Network error occurred. Please try again.",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openPDFPreview = (documentId: number) => {
    setSelectedPDF(documentId);
    setShowPreviewModal(true);
  };

  const closePDFPreview = () => {
    setShowPreviewModal(false);
    setSelectedPDF(null);
  };

  // Filter and Sort Functions
  const applyFiltersAndSort = () => {
    let filtered = [...documents];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.purchase_document_id.toString().includes(searchTerm) ||
          doc.pdf_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.po_signature?.signer_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply signature filter
    if (filterSigned === "signed") {
      filtered = filtered.filter((doc) => doc.po_signature !== null);
    } else if (filterSigned === "unsigned") {
      filtered = filtered.filter((doc) => doc.po_signature === null);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return (
            new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime()
          );
        case "date_asc":
          return (
            new Date(a.issue_date).getTime() - new Date(b.issue_date).getTime()
          );
        case "po_number":
          return a.purchase_document_id - b.purchase_document_id;
        default:
          return 0;
      }
    });

    setFilteredDocuments(filtered);
  };

  // Bulk Actions Functions
  const toggleDocumentSelection = (docId: number) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocuments(newSelected);
  };

  const selectAllDocuments = () => {
    if (selectedDocuments.size === filteredDocuments.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(
        new Set(filteredDocuments.map((doc) => doc.purchase_document_id))
      );
    }
  };

  const bulkDownload = async () => {
    if (selectedDocuments.size === 0) return;

    setBulkActionLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/purchase/documents/bulk-download`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentIds: Array.from(selectedDocuments),
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `purchase_documents_${
          new Date().toISOString().split("T")[0]
        }.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        Swal.fire({
          title: "Success!",
          text: `Downloaded ${selectedDocuments.size} documents`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        setSelectedDocuments(new Set());
      }
    } catch (error) {
      console.error("Bulk download error:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to download documents",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const bulkDelete = async () => {
    if (selectedDocuments.size === 0) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `This will delete ${selectedDocuments.size} documents permanently!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setBulkActionLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/purchase/documents/bulk-delete`,
          {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              documentIds: Array.from(selectedDocuments),
            }),
          }
        );

        if (response.ok) {
          await fetchDocuments(); // Refresh the list
          setSelectedDocuments(new Set());
          Swal.fire({
            title: "Deleted!",
            text: `${selectedDocuments.size} documents have been deleted.`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error("Bulk delete error:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete documents",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
      } finally {
        setBulkActionLoading(false);
      }
    }
  };

  const bulkShare = async () => {
    if (selectedDocuments.size === 0) return;

    setBulkActionLoading(true);
    try {
      const response = await fetch(`${API_URL}/purchase/documents/bulk-share`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentIds: Array.from(selectedDocuments),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await navigator.clipboard.writeText(data.shareLink);
          Swal.fire({
            title: "Share Link Created!",
            text: "Link copied to clipboard. Valid for 24 hours.",
            icon: "success",
            timer: 3000,
            showConfirmButton: false,
          });
          setSelectedDocuments(new Set());
        }
      }
    } catch (error) {
      console.error("Bulk share error:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to create share link",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showPreviewModal) {
        closePDFPreview();
      }
    };

    if (showPreviewModal) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [showPreviewModal]);

  useEffect(() => {
    checkme();
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply filters when documents or filter criteria change
  useEffect(() => {
    applyFiltersAndSort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents, searchTerm, sortBy, filterSigned]);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: document.documentElement.classList.contains("dark")
          ? "#111827"
          : "#f9fafb",
      }}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              color: document.documentElement.classList.contains("dark")
                ? "#10b981"
                : "#065f46",
            }}
          >
            {t("documentRecords")}
          </h1>
          <p
            style={{
              color: document.documentElement.classList.contains("dark")
                ? "#9ca3af"
                : "#6b7280",
            }}
          >
            {t("allPurchaseOrderDocuments")}
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div
          className="mb-6 p-4 rounded-lg"
          style={{
            backgroundColor: document.documentElement.classList.contains("dark")
              ? "#374151"
              : "white",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <label
                className="block text-sm font-medium mb-2"
                style={{
                  color: document.documentElement.classList.contains("dark")
                    ? "#d1d5db"
                    : "#374151",
                }}
              >
                🔍 {t("search")}
              </label>
              <input
                type="text"
                placeholder={
                  t("searchByDocNumber") +
                  ", " +
                  t("filename") +
                  ", " +
                  t("signerName")
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                style={{
                  backgroundColor: document.documentElement.classList.contains(
                    "dark"
                  )
                    ? "#4b5563"
                    : "white",
                  borderColor: document.documentElement.classList.contains(
                    "dark"
                  )
                    ? "#6b7280"
                    : "#d1d5db",
                  color: document.documentElement.classList.contains("dark")
                    ? "#f3f4f6"
                    : "#1f2937",
                }}
              />
            </div>

            {/* Sort Options */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{
                  color: document.documentElement.classList.contains("dark")
                    ? "#d1d5db"
                    : "#374151",
                }}
              >
                📊 {t("sortBy")}
              </label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "date_desc" | "date_asc" | "po_number"
                  )
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                style={{
                  backgroundColor: document.documentElement.classList.contains(
                    "dark"
                  )
                    ? "#4b5563"
                    : "white",
                  borderColor: document.documentElement.classList.contains(
                    "dark"
                  )
                    ? "#6b7280"
                    : "#d1d5db",
                  color: document.documentElement.classList.contains("dark")
                    ? "#f3f4f6"
                    : "#1f2937",
                }}
              >
                <option value="date_desc">{t("dateNewestFirst")}</option>
                <option value="date_asc">{t("dateOldestFirst")}</option>
                <option value="po_number">{t("poNumber")}</option>
              </select>
            </div>

            {/* Signature Filter */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{
                  color: document.documentElement.classList.contains("dark")
                    ? "#d1d5db"
                    : "#374151",
                }}
              >
                ✍️ {t("signatureStatus")}
              </label>
              <select
                value={filterSigned}
                onChange={(e) =>
                  setFilterSigned(
                    e.target.value as "all" | "signed" | "unsigned"
                  )
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                style={{
                  backgroundColor: document.documentElement.classList.contains(
                    "dark"
                  )
                    ? "#4b5563"
                    : "white",
                  borderColor: document.documentElement.classList.contains(
                    "dark"
                  )
                    ? "#6b7280"
                    : "#d1d5db",
                  color: document.documentElement.classList.contains("dark")
                    ? "#f3f4f6"
                    : "#1f2937",
                }}
              >
                <option value="all">{t("allDocuments")}</option>
                <option value="signed">{t("signedOnly")}</option>
                <option value="unsigned">{t("unsignedOnly")}</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedDocuments.size > 0 && (
            <div
              className="border-t pt-4"
              style={{
                borderColor: document.documentElement.classList.contains("dark")
                  ? "#4b5563"
                  : "#e5e7eb",
              }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="text-sm font-medium"
                  style={{
                    color: document.documentElement.classList.contains("dark")
                      ? "#d1d5db"
                      : "#374151",
                  }}
                >
                  {selectedDocuments.size} {t("selected")}
                </span>

                <button
                  onClick={bulkDownload}
                  disabled={bulkActionLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm flex items-center gap-2"
                >
                  {bulkActionLoading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  )}
                  {t("download")}
                </button>

                <button
                  onClick={bulkShare}
                  disabled={bulkActionLoading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm flex items-center gap-2"
                >
                  {bulkActionLoading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                  )}
                  {t("share")}
                </button>

                <button
                  onClick={bulkDelete}
                  disabled={bulkActionLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm flex items-center gap-2"
                >
                  {bulkActionLoading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                  {t("delete")}
                </button>

                <button
                  onClick={() => setSelectedDocuments(new Set())}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor:
                      document.documentElement.classList.contains("dark")
                        ? "#6b7280"
                        : "#f3f4f6",
                    color: document.documentElement.classList.contains("dark")
                      ? "#f3f4f6"
                      : "#374151",
                  }}
                >
                  {t("clearSelection")}
                </button>
              </div>
            </div>
          )}

          {/* Select All Checkbox */}
          {filteredDocuments.length > 0 && (
            <div
              className="border-t pt-4 mt-4"
              style={{
                borderColor: document.documentElement.classList.contains("dark")
                  ? "#4b5563"
                  : "#e5e7eb",
              }}
            >
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    selectedDocuments.size === filteredDocuments.length &&
                    filteredDocuments.length > 0
                  }
                  onChange={selectAllDocuments}
                  className="mr-3 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span
                  className="text-sm font-medium"
                  style={{
                    color: document.documentElement.classList.contains("dark")
                      ? "#d1d5db"
                      : "#374151",
                  }}
                >
                  {selectedDocuments.size === filteredDocuments.length &&
                  filteredDocuments.length > 0
                    ? t("deselectAll")
                    : t("selectAll")}{" "}
                  ({filteredDocuments.length} {t("documents")})
                </span>
              </label>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                style={{
                  borderColor: document.documentElement.classList.contains(
                    "dark"
                  )
                    ? "#10b981"
                    : "#065f46",
                }}
              ></div>
              <span
                style={{
                  color: document.documentElement.classList.contains("dark")
                    ? "#9ca3af"
                    : "#6b7280",
                }}
              >
                {t("loadingDocuments")}
              </span>
            </div>
          </div>
        ) : (
          <>
            {filteredDocuments.length > 0 && (
              <div className="mb-4">
                <p
                  className="text-sm"
                  style={{
                    color: document.documentElement.classList.contains("dark")
                      ? "#9ca3af"
                      : "#6b7280",
                  }}
                >
                  {t("showingDocuments", {
                    count: filteredDocuments.length,
                    total: documents.length,
                  })}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.purchase_document_id}
                  className={`p-4 rounded-xl shadow hover:shadow-lg transition-all duration-300 group max-w-sm relative ${
                    selectedDocuments.has(doc.purchase_document_id)
                      ? "ring-2 ring-emerald-500"
                      : ""
                  }`}
                  style={{
                    backgroundColor:
                      document.documentElement.classList.contains("dark")
                        ? "#374151"
                        : "white",
                  }}
                >
                  {/* Checkbox for individual selection */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.has(doc.purchase_document_id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleDocumentSelection(doc.purchase_document_id);
                      }}
                      className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                      style={{
                        accentColor: document.documentElement.classList.contains("dark") 
                          ? "#10b981" 
                          : "#059669"
                      }}
                    />
                  </div>

                  {/* PDF Icon or Signature Image Display */}
                  <div
                    className="relative h-32 rounded-xl mb-3 overflow-hidden flex items-center justify-center cursor-pointer"
                    style={{
                      backgroundColor:
                        document.documentElement.classList.contains("dark")
                          ? "#4b5563"
                          : "#f9fafb",
                    }}
                    onClick={() => openPDFPreview(doc.purchase_document_id)}
                  >
                    {/* Show Signature Image if available, otherwise show PDF Icon */}
                    {doc.po_signature && doc.po_signature.signature_image ? (
                      <>
                        {/* Signature Image */}
                        <img
                          src={getSignatureImageUrl(doc.po_signature.signature_image)}
                          alt="Purchaser Signature"
                          className="w-full h-full object-contain p-2"
                        />
                        {/* Signed Badge */}
                        <div
                          className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1"
                          title={t("signedBy", {
                            name: doc.po_signature.signer_name,
                          })}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        {/* Label */}
                        <div
                          className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs text-center py-1 rounded"
                        >
                          Purchaser Signature
                        </div>
                      </>
                    ) : (
                      <>
                        {/* PDF Icon for unsigned documents */}
                        <div className="text-center">
                          <div className="bg-red-500 text-white p-3 rounded-lg mb-2 inline-block">
                            <svg
                              className="w-8 h-8"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <p
                            className="text-xs font-medium"
                            style={{
                              color: document.documentElement.classList.contains(
                                "dark"
                              )
                                ? "#9ca3af"
                                : "#6b7280",
                            }}
                          >
                            PDF
                          </p>
                        </div>
                      </>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors duration-200"></div>

                    {/* Click to view hint */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {t("clickToPreview")}
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    {/* Document Title */}
                    <h3
                      className="font-medium text-xs leading-tight"
                      style={{
                        color: document.documentElement.classList.contains(
                          "dark"
                        )
                          ? "white"
                          : "#1f2937",
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {doc.description || `PO #${doc.purchase_document_id}`}
                    </h3>

                    {/* PO Number Badge */}
                    <div className="flex justify-center">
                      <span
                        className="px-2 py-1 text-xs rounded-full"
                        style={{
                          backgroundColor:
                            document.documentElement.classList.contains("dark")
                              ? "#1f2937"
                              : "#f3f4f6",
                          color: document.documentElement.classList.contains(
                            "dark"
                          )
                            ? "#60a5fa"
                            : "#2563eb",
                        }}
                      >
                        PO #{doc.purchase_document_id}
                      </span>
                    </div>

                    {/* Date and Time */}
                    <p
                      className="text-xs"
                      style={{
                        color: document.documentElement.classList.contains(
                          "dark"
                        )
                          ? "#6b7280"
                          : "#9ca3af",
                      }}
                    >
                      📅{" "}
                      {new Date(doc.issue_date).toLocaleDateString("th-TH", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: document.documentElement.classList.contains(
                          "dark"
                        )
                          ? "#6b7280"
                          : "#9ca3af",
                      }}
                    >
                      🕐{" "}
                      {new Date(doc.issue_date).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    {/* File Info */}
                    <p
                      className="text-xs truncate"
                      style={{
                        color: document.documentElement.classList.contains(
                          "dark"
                        )
                          ? "#60a5fa"
                          : "#2563eb",
                      }}
                      title={doc.pdf_filename}
                    >
                      📄{" "}
                      {doc.pdf_filename.length > 15
                        ? doc.pdf_filename.substring(0, 15) + "..."
                        : doc.pdf_filename}
                    </p>

                   

                    {/* Signature Status */}
                    {doc.po_signature ? (
                      <div className="space-y-1">
                        <p
                          className="text-xs truncate"
                          style={{
                            color: document.documentElement.classList.contains(
                              "dark"
                            )
                              ? "#10b981"
                              : "#059669",
                          }}
                          title={doc.po_signature.signer_name}
                        >
                          ✅ {doc.po_signature.signer_name}
                        </p>
                        <p
                          className="text-xs"
                          style={{
                            color: document.documentElement.classList.contains(
                              "dark"
                            )
                              ? "#10b981"
                              : "#059669",
                          }}
                        >
                          🕐{" "}
                          {new Date(
                            doc.po_signature.signed_at
                          ).toLocaleDateString("th-TH")}
                        </p>
                      </div>
                    ) : (
                      <p
                        className="text-xs"
                        style={{
                          color: document.documentElement.classList.contains(
                            "dark"
                          )
                            ? "#f59e0b"
                            : "#d97706",
                        }}
                      >
                        ⏳ {t("awaitingSignature")}
                      </p>
                    )}

                    {/* MIME Type */}
                    <p
                      className="text-xs"
                      style={{
                        color: document.documentElement.classList.contains(
                          "dark"
                        )
                          ? "#6b7280"
                          : "#9ca3af",
                      }}
                    >
                      🔗 {doc.pdf_mime}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {filteredDocuments.length === 0 && documents.length > 0 && (
              <div className="text-center py-16">
                <div className="mb-4">
                  <svg
                    className="w-20 h-20 mx-auto"
                    style={{
                      color: document.documentElement.classList.contains("dark")
                        ? "#4b5563"
                        : "#d1d5db",
                    }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                  </svg>
                </div>
                <h3
                  className="text-lg font-medium mb-2"
                  style={{
                    color: document.documentElement.classList.contains("dark")
                      ? "#9ca3af"
                      : "#6b7280",
                  }}
                >
                  {t("noMatchingDocuments")}
                </h3>
                <p
                  style={{
                    color: document.documentElement.classList.contains("dark")
                      ? "#6b7280"
                      : "#9ca3af",
                  }}
                >
                  {t("tryDifferentFilters")}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSortBy("date_desc");
                    setFilterSigned("all");
                  }}
                  className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  {t("clearFilters")}
                </button>
              </div>
            )}

            {documents.length === 0 && (
              <div className="text-center py-16">
                <div className="mb-4">
                  <svg
                    className="w-20 h-20 mx-auto"
                    style={{
                      color: document.documentElement.classList.contains("dark")
                        ? "#4b5563"
                        : "#d1d5db",
                    }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3
                  className="text-lg font-medium mb-2"
                  style={{
                    color: document.documentElement.classList.contains("dark")
                      ? "#9ca3af"
                      : "#6b7280",
                  }}
                >
                  {t("noDocumentsFound")}
                </h3>
                <p
                  style={{
                    color: document.documentElement.classList.contains("dark")
                      ? "#6b7280"
                      : "#9ca3af",
                  }}
                >
                  {t("newDocumentsWillAppear")}
                </p>
              </div>
            )}
          </>
        )}

        {/* PDF Preview Modal */}
        {showPreviewModal && selectedPDF && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closePDFPreview}
          >
            <div
              className="rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col"
              style={{
                backgroundColor: document.documentElement.classList.contains(
                  "dark"
                )
                  ? "#374151"
                  : "white",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                className="flex justify-between items-center p-4 border-b"
                style={{
                  borderColor: document.documentElement.classList.contains(
                    "dark"
                  )
                    ? "#4b5563"
                    : "#e5e7eb",
                }}
              >
                <h2
                  className="text-lg font-semibold"
                  style={{
                    color: document.documentElement.classList.contains("dark")
                      ? "white"
                      : "#1f2937",
                  }}
                >
                  {t("pdfPreview")}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      window.open(
                        `${API_URL}/purchase/pdf/${selectedPDF}`,
                        "_blank"
                      )
                    }
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors"
                  >
                    {t("openInNewTab")}
                  </button>
                  <button
                    onClick={closePDFPreview}
                    className="px-3 py-1 rounded text-sm transition-colors"
                    style={{
                      backgroundColor:
                        document.documentElement.classList.contains("dark")
                          ? "#6b7280"
                          : "#9ca3af",
                      color: "white",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        document.documentElement.classList.contains("dark")
                          ? "#4b5563"
                          : "#6b7280";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        document.documentElement.classList.contains("dark")
                          ? "#6b7280"
                          : "#9ca3af";
                    }}
                  >
                    {t("close")}
                  </button>
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="flex-1 overflow-hidden">
                <iframe
                  src={`${API_URL}/purchase/pdf/${selectedPDF}`}
                  className="w-full h-full border-0"
                  title="PDF Preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
