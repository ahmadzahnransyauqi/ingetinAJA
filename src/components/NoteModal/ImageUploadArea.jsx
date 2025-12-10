import React, { useRef } from "react";
import { uploadService } from "../../services/api";

const ImageUploadArea = ({ images = [], onChange }) => {
  const fileInputRef = useRef(null);

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert("Hanya file gambar yang diizinkan");
        continue;
      }

      try {
        const response = await uploadService.uploadImage(file);
        const newImage = {
          filename: response.data.filename,
          originalName: response.data.originalName,
          url: response.data.url,
          mimetype: response.data.mimetype,
          size: response.data.size,
        };

        onChange([...images, newImage]);
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Gagal mengupload gambar: " + error.message);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold">Gambar</h3>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        multiple
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <div className="text-sm text-gray-500">
        Upload gambar (JPEG, PNG, GIF) - Maksimal 10MB per file
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.url}
                alt={image.originalName}
                className="w-full h-24 object-cover rounded-md border"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
              <div className="text-xs text-gray-600 truncate mt-1">
                {image.originalName}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploadArea;
