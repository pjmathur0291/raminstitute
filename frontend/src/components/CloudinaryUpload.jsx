import { useState, useRef } from "react";
import { Upload, Loader2, X, Image as ImageIcon } from "lucide-react";

// Cloudinary credentials (direct - as requested)
const CLOUDINARY_CLOUD_NAME = "nuho7rn8";
const CLOUDINARY_API_KEY = "491998869984852";
const CLOUDINARY_UPLOAD_PRESET = "blog_uploads"; // You'll need to create this in Cloudinary dashboard

/**
 * CloudinaryUpload Component
 * 
 * Direct upload to Cloudinary with optimized delivery URLs
 * Uses Cloudinary transformations for efficient credit usage
 */
export default function CloudinaryUpload({ value, onChange, label = "Upload Image" }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);
      formData.append("api_key", CLOUDINARY_API_KEY);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      
      // Generate optimized URL with transformations
      // f_auto = automatic format selection (WebP for supported browsers)
      // q_auto = automatic quality optimization
      // c_limit = limit dimensions while maintaining aspect ratio
      const optimizedUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,c_limit,w_1200/${data.public_id}`;
      
      onChange(optimizedUrl);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      
      <div className="space-y-3">
        {/* Upload Button */}
        {!value && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="cloudinary-upload"
            />
            <label
              htmlFor="cloudinary-upload"
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium
                border border-gray-300 bg-white text-gray-700
                hover:bg-gray-50 cursor-pointer transition-colors
                ${uploading ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {label}
                </>
              )}
            </label>
          </div>
        )}

        {/* Image Preview */}
        {value && (
          <div className="relative inline-block">
            <div className="relative group">
              <img
                src={value}
                alt="Uploaded preview"
                className="w-full max-w-md h-auto rounded-sm border border-gray-200"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <ImageIcon className="w-3 h-3 inline mr-1" />
              Image uploaded to Cloudinary
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* Info Text */}
        {!value && !uploading && (
          <p className="text-xs text-gray-500">
            Supports JPG, PNG, WebP. Max 10MB. Images are automatically optimized.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Helper function to generate optimized Cloudinary URLs
 * Use this in frontend components for efficient image delivery
 * 
 * @param {string} cloudinaryUrl - Original Cloudinary URL
 * @param {object} options - Transformation options
 * @returns {string} - Optimized URL
 */
export function getOptimizedCloudinaryUrl(cloudinaryUrl, options = {}) {
  if (!cloudinaryUrl || !cloudinaryUrl.includes("cloudinary.com")) {
    return cloudinaryUrl;
  }

  const {
    width = 1200,
    height = null,
    quality = "auto",
    format = "auto",
    crop = "limit"
  } = options;

  try {
    const urlParts = cloudinaryUrl.split("/upload/");
    if (urlParts.length !== 2) return cloudinaryUrl;

    let transformations = [`f_${format}`, `q_${quality}`, `c_${crop}`];
    
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);

    return `${urlParts[0]}/upload/${transformations.join(",")}/${urlParts[1]}`;
  } catch {
    return cloudinaryUrl;
  }
}
