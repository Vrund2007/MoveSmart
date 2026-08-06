import React, { useState, useRef } from 'react';
import api from '../../lib/api';

/**
 * Utility to extract Cloudinary Public ID from a URL if publicId is missing
 */
export const extractPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  try {
    if (url.includes('/upload/')) {
      const afterUpload = url.split('/upload/')[1];
      const parts = afterUpload.split('/');
      // Skip version string if present (e.g. v1700000000)
      const pathParts = parts[0].startsWith('v') && !isNaN(parts[0].substring(1)) ? parts.slice(1) : parts;
      const fullPath = pathParts.join('/');
      return fullPath.replace(/\.[^/.]+$/, ''); // remove extension
    }
  } catch (e) {
    console.error('Error parsing Cloudinary Public ID from URL:', e);
  }
  return url.split('/').pop().split('.')[0] || url;
};

/**
 * PropertyImageUploader Component
 *
 * State can be either:
 *   A) Lifted (controlled): parent passes pendingItems + onPendingItemsChange
 *   B) Internal (uncontrolled): parent only passes images[] + onChange
 *
 * Preferred: use mode A so previews survive step navigation.
 */
export default function PropertyImageUploader({
  // Lifted state (preferred)
  pendingItems: externalItems,
  onPendingItemsChange,
  // Legacy fallback
  images = [],
  onChange,
}) {
  const isControlled = externalItems !== undefined && onPendingItemsChange !== undefined;

  const [internalItems, setInternalItems] = useState(() => {
    return (images || []).map((url, idx) => ({
      id: `existing_${idx}_${Date.now()}`,
      file: null,
      previewUrl: url,
      isUploaded: true,
      url: url,
      publicId: extractPublicIdFromUrl(url),
    }));
  });

  const pendingItems = isControlled ? externalItems : internalItems;

  const setPendingItems = (updater) => {
    const next = typeof updater === 'function' ? updater(pendingItems) : updater;
    if (isControlled) {
      onPendingItemsChange(next);
    } else {
      setInternalItems(next);
      // Sync cloudinary URLs to legacy onChange
      if (onChange) {
        const urls = next.filter(it => it.isUploaded && it.url).map(it => it.url);
        onChange(urls);
      }
    }
  };

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef(null);

  // Drag handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addLocalFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      addLocalFiles(Array.from(e.target.files));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Add files → immediate local preview (no upload yet)
  const addLocalFiles = (files) => {
    const newItems = files.map((file) => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      file: file,
      previewUrl: URL.createObjectURL(file),
      isUploaded: false,
      url: null,
      publicId: null,
    }));
    const updated = [...pendingItems, ...newItems];
    setPendingItems(updated);
    setUploadProgress(`📷 ${newItems.length} photo(s) added. Click "☁️ Upload to Cloudinary" to sync & get Public IDs.`);
  };

  // Upload all unuploaded files to Cloudinary
  const handleUploadAllToCloudinary = async () => {
    const unuploaded = pendingItems.filter(it => !it.isUploaded && it.file);
    if (unuploaded.length === 0) {
      setUploadProgress('ℹ️ All photos are already synced with Cloudinary!');
      return;
    }

    setUploading(true);
    setUploadProgress(`☁️ Uploading ${unuploaded.length} photo(s) to Cloudinary...`);

    try {
      const formData = new FormData();
      unuploaded.forEach((item) => formData.append('images', item.file));

      // IMPORTANT: Do NOT manually set Content-Type — let Axios detect FormData
      // and auto-set multipart/form-data with the correct boundary string.
      const response = await api.post('/listings/upload-image', formData, {
        headers: { 'Content-Type': undefined },
      });

      const data = response.data?.data || response.data;
      const uploadedImages = data.images || [];
      const uploadedUrls = data.urls || (data.url ? [data.url] : []);
      const publicIds = data.public_ids || [];

      if (uploadedImages.length > 0 || uploadedUrls.length > 0) {
        let urlIdx = 0;
        const updated = pendingItems.map((item) => {
          if (!item.isUploaded && item.file && urlIdx < (uploadedImages.length || uploadedUrls.length)) {
            const imgObj = uploadedImages[urlIdx];
            const cUrl = imgObj ? imgObj.url : uploadedUrls[urlIdx];
            const pubId = imgObj ? imgObj.public_id : (publicIds[urlIdx] || extractPublicIdFromUrl(cUrl));
            urlIdx++;
            return {
              ...item,
              isUploaded: true,
              url: cUrl,
              previewUrl: cUrl,
              publicId: pubId,
            };
          }
          return item;
        });
        setPendingItems(updated);
        setUploadProgress(`✅ ${urlIdx} photo(s) uploaded to Cloudinary! Public IDs obtained.`);
      } else {
        setUploadProgress('⚠️ Cloudinary returned no URLs. Try again.');
      }
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      setUploadProgress(`❌ Upload failed: ${msg}`);
    } finally {
      setUploading(false);
    }
  };

  // Remove image
  const handleRemoveItem = (idToRemove) => {
    const item = pendingItems.find(it => it.id === idToRemove);
    if (item?.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(item.previewUrl);
    const updated = pendingItems.filter(it => it.id !== idToRemove);
    setPendingItems(updated);
  };

  const unuploadedCount = pendingItems.filter(it => !it.isUploaded).length;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all select-none ${
          dragActive
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-gray-300 hover:border-primary bg-gray-50/50 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl">
            🖼️
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">
              Click to Select Photos — or Drag &amp; Drop Here
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Photos appear as <span className="font-bold text-amber-600">local preview</span> first.
              Then click <span className="font-extrabold text-primary">☁️ Upload to Cloudinary</span> to sync &amp; get Public IDs.
            </p>
          </div>
          <span className="text-[11px] text-text-secondary bg-white px-3 py-1 rounded-full border border-border">
            PNG • JPG • WEBP • Max 10MB per file
          </span>
        </div>
      </div>

      {/* Status Banner */}
      {uploadProgress && (
        <div className={`text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-2 ${
          uploading
            ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
            : uploadProgress.startsWith('✅')
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : uploadProgress.startsWith('❌')
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <span>{uploading ? '⏳' : '•'}</span>
          <span>{uploadProgress}</span>
        </div>
      )}

      {/* Image Grid + Upload Button */}
      {pendingItems.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-xs font-bold text-text-primary block">
                Selected Photos ({pendingItems.length})
              </span>
              <span className="text-[10px] text-text-secondary">
                {unuploadedCount > 0
                  ? `⚠️ ${unuploadedCount} photo(s) pending Cloudinary upload`
                  : `✓ All ${pendingItems.length} photo(s) synced with Cloudinary`}
              </span>
            </div>

            {unuploadedCount > 0 && (
              <button
                type="button"
                onClick={handleUploadAllToCloudinary}
                disabled={uploading}
                className="bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {uploading ? '⏳ Uploading...' : '☁️ Upload to Cloudinary'}
              </button>
            )}
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {pendingItems.map((item, idx) => {
              const displayPublicId = item.publicId || (item.url ? extractPublicIdFromUrl(item.url) : null);

              return (
                <div
                  key={item.id}
                  className={`group relative rounded-xl overflow-hidden border-2 aspect-video shadow-sm transition-all bg-black/5 ${
                    item.isUploaded ? 'border-emerald-400' : 'border-amber-400'
                  }`}
                >
                  <img
                    src={item.previewUrl || item.url}
                    alt={`Property view ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />

                  {/* Status Badge */}
                  <div className={`absolute top-1.5 left-1.5 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded backdrop-blur-md z-10 ${
                    item.isUploaded ? 'bg-emerald-600/90' : 'bg-amber-600/90'
                  }`}>
                    {item.isUploaded ? '✓ Cloudinary Synced' : '⏳ Local Preview'}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-transform active:scale-95 z-10 opacity-90 group-hover:opacity-100"
                    title="Remove photo"
                  >
                    ✕
                  </button>

                  {/* Footer with Public ID & Access details */}
                  <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-md text-white text-[10px] p-2 flex flex-col gap-0.5">
                    {item.isUploaded ? (
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-extrabold text-emerald-400 text-[9px] uppercase tracking-wide">Public ID:</span>
                          <span className="text-[10px] font-mono text-gray-200 truncate max-w-[150px]" title={displayPublicId}>
                            {displayPublicId || 'Uploaded'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="truncate text-amber-300 font-medium text-[10px]">
                        📁 {item.file ? item.file.name : 'Local file'} (Not synced yet)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

