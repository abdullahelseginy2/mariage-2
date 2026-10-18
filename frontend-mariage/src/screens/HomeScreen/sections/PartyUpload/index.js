import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { invitationAPI } from '../../../../utils/api';
import { CustomBottom, CustomInput } from '../../../../components';
import { compressImageToSize } from '../../../../utils/imageCompression';

let sessionUploaderId = null;
const getUploaderId = () => {
  const storageKey = 'guest_photo_uploader_id';
  if (sessionUploaderId) return sessionUploaderId;
  try {
    sessionUploaderId = localStorage.getItem(storageKey);
  } catch {}
  if (!sessionUploaderId) {
    sessionUploaderId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      localStorage.setItem(storageKey, sessionUploaderId);
    } catch {}
  }
  return sessionUploaderId;
};

const themeStyles = {
  classic: {
    sectionBg: "bg-[#120c15]",
    border: "border-[#3b2d41]/30",
    gradientFrom: "from-[#2d1b32]/25",
    cardBg: "bg-[#17101A]/90",
    cardBorder: "border-gold/25",
    cardRoundness: "rounded-xl",
    previewRoundness: "rounded-lg",
    textColor: "text-[#F7EBD2]",
    textSecondary: "text-[#F7EBD2]/70",
    kickerColor: "text-gold",
    lineClass: "w-16 h-1 mx-auto mt-4 bg-gold",
    buttonStyles: "bg-gold text-[#0B0A10] hover:bg-[#F7EBD2] hover:text-[#0B0A10] active:bg-[#C9B56A] active:text-[#0B0A10] disabled:bg-gold/45 disabled:text-[#0B0A10]/50 disabled:border-transparent",
    cameraIcon: "text-gold/60 group-hover:text-gold",
    dashedBorder: "rounded-lg border-gold/30 hover:border-gold/60",
    inputBg: "bg-[#100E16]/80",
    progressBar: "bg-gold",
    inputLabelClass: "text-[#F7EBD2]",
    inputClass: "border-champagne bg-[#100E16] text-[#F7EBD2] focus:border-gold focus:ring-gold/25 placeholder:text-[#F7EBD2]/40"
  },
  signature: {
    sectionBg: "bg-[linear-gradient(135deg,#fffdf8,#f5f2ec_55%,#e8e2d8)]",
    border: "border-[#c8a96a]/30",
    gradientFrom: "from-[#c8a96a]/10",
    cardBg: "bg-white/70 backdrop-blur-sm",
    cardBorder: "border-[#c8a96a]/42 shadow-[0_20px_42px_rgba(88,70,38,0.08)]",
    cardRoundness: "rounded-md",
    previewRoundness: "rounded-md",
    textColor: "text-[#514936]",
    textSecondary: "text-[#706754]",
    kickerColor: "text-[#a88143]",
    lineClass: "h-px w-24 mx-auto mt-5 bg-[#c8a96a]/65",
    buttonStyles: "min-h-14 rounded-md bg-[#c8a96a] text-white hover:bg-[#ae8b4d] active:bg-[#9d7b40] shadow-[0_14px_30px_rgba(174,139,77,0.20)] disabled:opacity-50",
    cameraIcon: "text-[#b48e4a]/70 group-hover:text-[#a88143]",
    uploadHint: "text-[#706754]",
    dashedBorder: "rounded-md border-[#c8a96a]/42 hover:border-[#b48e4a]",
    inputBg: "bg-[#fffdf8]/80",
    progressBar: "bg-[#c8a96a]",
    inputLabelClass: "text-[#6d5a36] font-black",
    inputClass: "min-h-[3.25rem] rounded-md border-[#c8a96a]/40 bg-[#fffdf8] text-[#514936] placeholder:text-[#8e8678] focus:border-[#b48e4a] focus:bg-white focus:ring-[#c8a96a]/25"
  },
  royal: {
    sectionBg: "bg-[#100a06]",
    border: "border-[#f5c65c]/28",
    gradientFrom: "from-[#f5c65c]/10",
    cardBg: "bg-white/[0.07] backdrop-blur-xl",
    cardBorder: "border-[#f5c65c]/28",
    cardRoundness: "rounded-xl",
    previewRoundness: "rounded-lg",
    textColor: "text-[#fff8e7]",
    textSecondary: "text-[#fff8e7]/70",
    kickerColor: "text-[#f5c65c]",
    lineClass: "h-px w-24 mx-auto mt-5 bg-[#d7a93f]/70",
    buttonStyles: "rounded-lg bg-[#f5c65c] text-[#160c05] hover:bg-[#fff8e7] active:bg-[#fff8e7] shadow-[0_18px_44px_rgba(245,198,92,0.22)] disabled:opacity-50",
    cameraIcon: "text-[#f5c65c]/60 group-hover:text-[#f5c65c]",
    uploadHint: "text-[#fff8e7]",
    dashedBorder: "rounded-lg border-[#f5c65c]/35 hover:border-[#f5c65c]/60",
    inputBg: "bg-[#070504]/75",
    progressBar: "bg-[#f5c65c]",
    inputLabelClass: "text-[#fff8e7] font-black",
    inputClass: "rounded-lg border-[#f5c65c]/35 bg-[#070504]/75 text-[#fff8e7] placeholder:text-[#fff8e7]/35 focus:border-[#f5c65c] focus:ring-[#f5c65c]/25"
  },
  'love-letter': {
    sectionBg: "bg-[linear-gradient(180deg,#fffdf8,#f7ebe5)]",
    border: "border-[#c58c85]/20",
    gradientFrom: "from-[#c58c85]/10",
    cardBg: "bg-[#fffdf8]",
    cardBorder: "border-[#c58c85]/20 shadow-[0_18px_42px_rgba(197,140,133,0.10)] ring-1 ring-white/80",
    cardRoundness: "rounded-[32px]",
    previewRoundness: "rounded-[22px]",
    textColor: "text-[#3d2d2a]",
    textSecondary: "text-[#4a4a4a]/70",
    kickerColor: "text-[#7a4039]",
    lineClass: "h-px w-24 mx-auto mt-5 bg-[#7a4039]/40",
    buttonStyles: "rounded-[24px] bg-[#c58c85] text-white hover:bg-[#a66f68] hover:text-white active:bg-[#8e5d57] shadow-[0_18px_38px_rgba(197,140,133,0.26)] disabled:opacity-50",
    cameraIcon: "text-[#c58c85]/60 group-hover:text-[#c58c85]",
    dashedBorder: "rounded-[22px] border-[#c58c85]/30 hover:border-[#c58c85]/60",
    inputBg: "bg-[#fffdf8]/80",
    progressBar: "bg-[#c58c85]",
    inputLabelClass: "text-[#3d2d2a] font-black",
    inputClass: "rounded-[22px] border-[#c58c85]/30 bg-[#fffdf8] text-[#3d2d2a] placeholder:text-[#3d2d2a]/35 focus:border-[#c58c85] focus:ring-[#c58c85]/25"
  },
  'floral-butterfly': {
    sectionBg: "bg-[#fbf7ff]",
    border: "border-[#cba7ee]/26",
    gradientFrom: "from-[#7e3f99]/10",
    cardBg: "bg-white/86 backdrop-blur shadow-[0_24px_80px_rgba(126,63,153,0.14)]",
    cardBorder: "border-[#cba7ee]/26",
    cardRoundness: "rounded-[2rem]",
    previewRoundness: "rounded-[1.35rem]",
    textColor: "text-[#33273c]",
    textSecondary: "text-[#33273c]/80",
    kickerColor: "text-[#7e3f99]",
    lineClass: "h-px w-24 mx-auto mt-5 bg-[#9f73c2]/70",
    buttonStyles: "rounded-[1.4rem] bg-[#7e3f99] text-white hover:bg-[#5f744a] hover:text-white active:bg-[#5d2f70] active:text-white shadow-[0_18px_38px_rgba(126,63,153,0.24)] disabled:opacity-50",
    cameraIcon: "text-[#7e3f99]/60 group-hover:text-[#7e3f99]",
    dashedBorder: "rounded-[1.35rem] border-[#cba7ee]/35 hover:border-[#7e3f99]",
    inputBg: "bg-[#fffdf8]/80",
    progressBar: "bg-[#7e3f99]",
    inputLabelClass: "text-[#33273c] font-black",
    inputClass: "rounded-[1.35rem] border-[#cba7ee]/35 bg-[#fffdf8] text-[#33273c] placeholder:text-[#33273c]/35 focus:border-[#7e3f99] focus:ring-[#7e3f99]/25"
  },
  'modern-minimal': {
    sectionBg: "bg-[#07070b]",
    border: "border-[#e6c387]/10",
    gradientFrom: "from-[#e6c387]/5",
    cardBg: "bg-white/3 backdrop-blur-[30px] shadow-[0_40px_80px_rgba(0,0,0,0.6)]",
    cardBorder: "border-[#e6c387]/20 border-1.5",
    cardRoundness: "rounded-3xl",
    previewRoundness: "rounded-2xl",
    titleFontClass: "font-serif-lux font-bold text-3xl md:text-5xl lg:text-6xl",
    textColor: "text-white",
    textSecondary: "text-white/60",
    kickerColor: "text-[#e6c387]/80",
    lineClass: "h-[1.5px] w-20 mx-auto mt-5 bg-gradient-to-r from-transparent via-[#e6c387] to-transparent",
    buttonStyles: "w-full inline-flex min-h-[3.75rem] items-center justify-center gap-3 rounded-2xl bg-[#e6c387] text-[#07070b] hover:bg-[#edd1a4] font-bold text-xs uppercase tracking-[0.25em] transition duration-300 shadow-lg hover:shadow-[#e6c387]/10 disabled:opacity-50",
    cameraIcon: "text-[#e6c387]/60 group-hover:text-[#e6c387]",
    dashedBorder: "rounded-2xl border-white/10 hover:border-[#e6c387]/50",
    inputBg: "bg-[#07070b]/60",
    progressBar: "bg-[#e6c387]",
    inputLabelClass: "text-white/80 font-bold",
    inputClass: "luxury-glass-input rounded-2xl border border-[#e6c387]/15 bg-white/3 text-white placeholder:text-white/30 focus:border-[#e6c387] focus:bg-white/6 focus:ring-[#e6c387]/20"
  },
  burgundy: {
    sectionBg: "bg-[radial-gradient(circle_at_15%_10%,rgba(164,43,80,.22),transparent_28%),linear-gradient(145deg,#21020b,#4c091d_55%,#26030e)]",
    border: "border-[#e8c78d]/24",
    gradientFrom: "from-[#e8c78d]/8",
    cardBg: "bg-[#2d0411]/80 backdrop-blur-xl",
    cardBorder: "border-[#e8c78d]/28 shadow-[0_30px_70px_rgba(0,0,0,.28)]",
    cardRoundness: "rounded-2xl",
    previewRoundness: "rounded-xl",
    textColor: "text-[#fff7ec]",
    textSecondary: "text-[#fff0e4]/70",
    kickerColor: "text-[#e8c78d]",
    lineClass: "h-px w-24 mx-auto mt-5 bg-gradient-to-r from-transparent via-[#e8c78d] to-transparent",
    buttonStyles: "rounded-xl bg-[#e8c78d] text-[#3a0616] hover:bg-[#fff0d3] active:bg-[#d9b470] shadow-[0_16px_38px_rgba(232,199,141,.18)] disabled:opacity-50",
    cameraIcon: "text-[#e8c78d]/65 group-hover:text-[#e8c78d]",
    dashedBorder: "rounded-xl border-[#e8c78d]/30 hover:border-[#e8c78d]/65",
    inputBg: "bg-[#190108]/78",
    progressBar: "bg-[#e8c78d]",
    inputLabelClass: "text-[#fff0e4] font-black",
    inputClass: "rounded-xl border-[#e8c78d]/25 bg-[#190108]/78 text-[#fff7ec] placeholder:text-[#fff0e4]/35 focus:border-[#e8c78d] focus:ring-[#e8c78d]/20"
  }
};

const PartyUpload = ({ invitation, invitationPath }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const copy = invitation?.party_upload || {};

  const pathKey = invitation?.public_path || invitationPath;
  const [guestName, setGuestName] = useState('');
  const maxImages = Number(invitation?.guest_upload_limits?.max_images || copy.max_images || 4);
  const maxImageSizeKb = Number(invitation?.guest_upload_limits?.max_image_size_kb || 350);
  const countStorageKey = `guest_photo_count_${pathKey}`;
  const [uploadedCount, setUploadedCount] = useState(() => Number(localStorage.getItem(countStorageKey) || 0));
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, uploading, succeeded, failed
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!pathKey || !copy.is_enabled) return;
    invitationAPI.getGuestUploadStatus(pathKey, getUploaderId())
      .then((response) => {
        const count = Number(response?.data?.data?.uploaded_count || 0);
        setUploadedCount(count);
        try {
          localStorage.setItem(countStorageKey, String(count));
        } catch {}
      })
      .catch(() => {});
  }, [copy.is_enabled, countStorageKey, pathKey]);

  // If section is disabled or not configured, don't render it
  if (!copy.is_enabled) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (files.some((file) => !file.type.startsWith('image/'))) {
      setErrorMsg(t('partyUpload.invalid_file_error', 'Please select a valid image file.'));
      return;
    }

    if (files.some((file) => file.size > 20 * 1024 * 1024)) {
      setErrorMsg(t('partyUpload.file_size_error', 'Image size must be less than 20MB.'));
      return;
    }

    const remainingImages = Math.max(0, maxImages - uploadedCount);
    if (files.length > remainingImages) {
      setErrorMsg(t('partyUpload.remaining_upload_error', {
        remaining: remainingImages,
        defaultValue: `You can upload ${remainingImages} more photo(s) for this invitation.`,
      }));
      return;
    }

    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles(files);
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
    setErrorMsg('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFiles.length) {
      setErrorMsg(t('partyUpload.no_file_error', 'Please select or capture a photo first.'));
      return;
    }

    setStatus('uploading');
    setProgress(0);
    setErrorMsg('');

    let successfulUploads = 0;
    try {
      const publicPath = invitation?.public_path || invitationPath;
      let latestCount = uploadedCount;
      for (let index = 0; index < selectedFiles.length; index += 1) {
        const compressedFile = await compressImageToSize(selectedFiles[index], maxImageSizeKb);
        const formData = new FormData();
        formData.append('file', compressedFile);
        formData.append('uploader_id', getUploaderId());
        if (guestName.trim()) formData.append('guest_name', guestName.trim());

        const response = await invitationAPI.uploadGuestPhoto(publicPath, formData, (progressEvent) => {
          const fileProgress = progressEvent.total ? progressEvent.loaded / progressEvent.total : 0;
          setProgress(Math.round(((index + fileProgress) / selectedFiles.length) * 100));
        });
        latestCount = Number(response?.data?.meta?.uploaded_count || latestCount + 1);
        successfulUploads += 1;
        setUploadedCount(latestCount);
        try {
          localStorage.setItem(countStorageKey, String(latestCount));
        } catch {}
      }

      setProgress(100);
      setStatus('succeeded');
    } catch (err) {
      console.error(err);
      if (successfulUploads > 0) {
        previewUrls.slice(0, successfulUploads).forEach((url) => URL.revokeObjectURL(url));
        setSelectedFiles((current) => current.slice(successfulUploads));
        setPreviewUrls((current) => current.slice(successfulUploads));
      }
      setStatus('failed');
      const message = err.response?.data?.errors?.file?.[0]
        || err.response?.data?.message
        || err.message
        || t('partyUpload.upload_failed_error', 'Failed to upload photo. Please try again.');
      setErrorMsg(successfulUploads > 0
        ? t('partyUpload.partial_upload', {
            count: successfulUploads,
            message,
            defaultValue: `${successfulUploads} photo(s) uploaded. ${message}`,
          })
        : message);
    }
  };

  const resetForm = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    setGuestName('');
    setStatus('idle');
    setProgress(0);
    setErrorMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Determine active styling theme depending on template type
  const templateId = invitation?.template || 'classic';
  const themeKey = templateId === 'modern-minimalist' ? 'modern-minimal' : templateId;
  const theme = themeStyles[themeKey] || themeStyles.classic;

  return (
    <div id="party-upload" className={`py-20 ${theme.sectionBg} relative overflow-hidden border-t ${theme.border} transition-colors duration-500`}>
      <div className={`absolute inset-0 bg-radial-gradient ${theme.gradientFrom} to-transparent pointer-events-none`}></div>

      <div className="container mx-auto px-6 max-w-3xl relative z-10">
        <div className="text-center mb-10">
          <span className={`uppercase tracking-[0.24em] text-sm font-bold ${theme.kickerColor}`}>
            {copy.kicker || t('partyUpload.kicker', 'Party Moments')}
          </span>
          <h2 className={`${theme.titleFontClass || 'text-4xl md:text-5xl font-serif'} mb-4 ${theme.textColor}`}>
            {copy.title || t('partyUpload.title', 'Share Your Photos')}
          </h2>
          <p className={`max-w-lg mx-auto ${theme.textSecondary}`}>
            {copy.description || t('partyUpload.description', 'Take photos during our wedding celebration and upload them here!')}
          </p>
          <div className={theme.lineClass}></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={`${theme.cardBg} p-6 md:p-8 ${theme.cardRoundness || 'rounded-xl'} shadow-xl border ${theme.cardBorder} transition-colors duration-500`}
        >
          <AnimatePresence mode="wait">
            {status === 'succeeded' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-8"
              >
                <FiCheckCircle className="text-6xl text-emerald-400 mx-auto mb-4 animate-bounce" />
                <h3 className={`text-3xl font-serif mb-3 ${theme.textColor}`}>
                  {t('partyUpload.upload_success', 'Upload Successful!')}
                </h3>
                <p className={`text-lg mb-6 ${theme.textSecondary}`}>
                  {t('partyUpload.success_thank_you', 'Thank you for sharing your wonderful memory with us!')}
                </p>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={uploadedCount >= maxImages}
                  className={`px-6 py-3 font-black transition ${theme.buttonStyles}`}
                >
                  {uploadedCount >= maxImages
                    ? t('partyUpload.upload_limit_reached', {
                        max: maxImages,
                        defaultValue: `Upload limit reached (${maxImages})`,
                      })
                    : t('partyUpload.upload_another', 'Upload More Photos')}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleUpload} className="space-y-6">
                <CustomInput
                  label={copy.name_label || t('partyUpload.name_label', 'Your Name (Optional)')}
                  name="guest_name"
                  type="text"
                  placeholder={copy.name_placeholder || t('partyUpload.name_placeholder', 'Enter your name')}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  disabled={status === 'uploading'}
                  labelClassName={theme.inputLabelClass}
                  inputClassName={theme.inputClass}
                />

                <div>
                  <label className={`block font-medium mb-2 ${theme.textColor}`}>
                    {t('partyUpload.select_photo_label', 'Select or Take a Photo')}
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={status === 'uploading' || uploadedCount >= maxImages}
                  />

                  {!previewUrls.length ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full min-h-[180px] flex flex-col items-center justify-center border-2 border-dashed transition-colors p-6 group cursor-pointer ${theme.dashedBorder} ${theme.inputBg}`}
                      disabled={status === 'uploading' || uploadedCount >= maxImages}
                    >
                      <FiCamera className={`text-4xl mb-3 transition-colors ${theme.cameraIcon}`} />
                      <span className={`text-sm font-semibold opacity-90 group-hover:opacity-100 transition-opacity ${theme.uploadHint || theme.textColor}`}>
                        {t('partyUpload.click_to_upload', 'Click to Take or Upload Images')}
                      </span>
                      <span className={`text-xs opacity-65 mt-1 ${theme.uploadHint || theme.textColor}`}>
                        {t('partyUpload.compression_summary', {
                          remaining: Math.max(0, maxImages - uploadedCount),
                          max: maxImages,
                          defaultValue: `${Math.max(0, maxImages - uploadedCount)} of ${maxImages} remaining.`,
                        })}
                      </span>
                    </button>
                  ) : (
                    <div className={`relative grid grid-cols-2 gap-2 p-2 ${theme.previewRoundness || 'rounded-lg'} overflow-hidden border ${theme.cardBorder} ${theme.inputBg}`}>
                      {previewUrls.map((url, index) => (
                        <img
                          key={url}
                          src={url}
                          alt={`Selected preview ${index + 1}`}
                          className="h-40 w-full rounded-md object-cover"
                        />
                      ))}
                      {status !== 'uploading' && (
                        <button
                          type="button"
                          onClick={() => {
                            previewUrls.forEach((url) => URL.revokeObjectURL(url));
                            setSelectedFiles([]);
                            setPreviewUrls([]);
                          }}
                          className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                          title={t('partyUpload.remove_photo', 'Remove Photo')}
                        >
                          <FiXCircle className="text-xl" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 text-rose-300 bg-rose-950/30 border border-rose-900/50 p-3 rounded-lg text-sm">
                    <FiXCircle className="shrink-0 text-lg" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {status === 'uploading' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-inherit opacity-85">
                      <span>{t('partyUpload.uploading', 'Uploading photo...')}</span>
                      <span className="font-bold">{progress}%</span>
                    </div>
                    <div className={`h-2 w-full rounded-full overflow-hidden border ${theme.cardBorder} ${theme.inputBg}`}>
                      <motion.div
                        className={`h-full ${theme.progressBar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                )}

                <CustomBottom
                  type="submit"
                  text={copy.button_text || t('partyUpload.upload_button', 'Upload Photo')}
                  loading={status === 'uploading'}
                  disabled={status === 'uploading' || !selectedFiles.length}
                  buttonStyles={theme.buttonStyles}
                />
              </form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default PartyUpload;
