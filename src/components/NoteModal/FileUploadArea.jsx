import React, { useRef } from "react";
import { uploadService } from "../../services/api";

const FileUploadArea = ({ files = [], onChange }) => {
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const response = await uploadService.uploadFile(file);
      const newFile = {
        filename: response.data.filename,
        originalName: response.data.originalName,
        url: response.data.url,
        mimetype: response.data.mimetype,
        size: response.data.size,
      };

      onChange([...files, newFile]);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Gagal mengupload file: " + error.message);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold">File</h3>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <div className="text-sm text-gray-500">
        Upload file (PDF, DOC, TXT) - Maksimal 10MB
      </div>

      {files.length > 0 && (
        <div className="space-y-2 mt-3">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white rounded border"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {file.originalName}
                </div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(file.size)} • {file.mimetype}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition"
                >
                  Lihat
                </a>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadArea;
