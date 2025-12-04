import React, { useCallback, useState } from 'react';
import { Upload, X, File, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import Button from './Button';

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  onChange?: (files: File[]) => void;
  onError?: (error: string) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  showPreview?: boolean;
  className?: string;
}

interface FileWithPreview extends File {
  preview?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept = 'image/*',
  multiple = false,
  maxSize = 5, // 5MB default
  maxFiles = 5,
  onChange,
  onError,
  label,
  description,
  disabled = false,
  showPreview = true,
  className,
}) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      return t('common.fileUpload.errors.fileSizeExceeds', { maxSize });
    }

    // Check file type
    if (accept && accept !== '*') {
      const acceptedTypes = accept.split(',').map((type) => type.trim());
      const fileType = file.type;
      const isAccepted = acceptedTypes.some((type) => {
        if (type.endsWith('/*')) {
          const category = type.split('/')[0];
          return fileType.startsWith(category + '/');
        }
        return fileType === type;
      });

      if (!isAccepted) {
        return t('common.fileUpload.errors.fileTypeNotAccepted', { accept });
      }
    }

    return null;
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve('');
      }
    });
  };

  const handleFiles = useCallback(
    async (newFiles: File[]) => {
      if (disabled) return;

      // Check max files limit
      const totalFiles = files.length + newFiles.length;
      if (totalFiles > maxFiles) {
        onError?.(t('common.fileUpload.errors.maxFilesExceeded', { maxFiles }));
        return;
      }

      // Validate and process files
      const validFiles: FileWithPreview[] = [];
      for (const file of newFiles) {
        const error = validateFile(file);
        if (error) {
          onError?.(error);
          continue;
        }

        const preview = showPreview ? await createPreview(file) : undefined;
        validFiles.push(Object.assign(file, { preview }));
      }

      const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
      setFiles(updatedFiles);
      onChange?.(updatedFiles);
    },
    [files, multiple, maxFiles, maxSize, accept, disabled, showPreview, onChange, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFiles(droppedFiles);
    },
    [disabled, handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      handleFiles(selectedFiles);
      e.target.value = ''; // Reset input
    },
    [handleFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      const updatedFiles = files.filter((_, i) => i !== index);
      setFiles(updatedFiles);
      onChange?.(updatedFiles);

      // Revoke preview URL to free memory
      if (files[index].preview) {
        URL.revokeObjectURL(files[index].preview!);
      }
    },
    [files, onChange]
  );

  const isImage = (file: File) => file.type.startsWith('image/');

  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-all duration-200',
          isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
            : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer'
        )}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="p-8 text-center">
          <Upload
            className={cn(
              'w-12 h-12 mx-auto mb-4',
              isDragging ? 'text-primary-500' : 'text-slate-400 dark:text-slate-500'
            )}
          />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {isDragging ? t('common.fileUpload.dropFiles') : t('common.fileUpload.dropFilesOrBrowse')}
          </p>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
          )}
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            Max size: {maxSize}MB • Max files: {maxFiles}
          </p>
        </div>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                {/* Preview or Icon */}
                {showPreview && file.preview && isImage(file) ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded">
                    {isImage(file) ? (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    ) : (
                      <File className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                )}

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                  className="shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
