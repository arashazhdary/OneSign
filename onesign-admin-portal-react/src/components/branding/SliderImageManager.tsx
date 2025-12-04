import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Eye,
  X,
  Save,
  Edit3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Modal from '@/components/common/Modal';

export interface SliderImage {
  id: string;
  url: string;
  title?: string;
  description?: string;
  order: number;
}

interface SliderImageManagerProps {
  images: SliderImage[];
  onChange: (images: SliderImage[]) => void;
  primaryColor?: string;
}

export default function SliderImageManager({ images, onChange, primaryColor = '#6366f1' }: SliderImageManagerProps) {
  const { t } = useTranslation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingImage, setEditingImage] = useState<SliderImage | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [newImage, setNewImage] = useState<Partial<SliderImage>>({
    url: '',
    title: '',
    description: ''
  });

  const handleAddImage = () => {
    if (!newImage.url) return;

    const image: SliderImage = {
      id: `slider-${Date.now()}`,
      url: newImage.url,
      title: newImage.title || '',
      description: newImage.description || '',
      order: images.length
    };

    onChange([...images, image]);
    setNewImage({ url: '', title: '', description: '' });
    setShowAddModal(false);
  };

  const handleEditImage = () => {
    if (!editingImage) return;

    const updatedImages = images.map(img =>
      img.id === editingImage.id ? editingImage : img
    );
    onChange(updatedImages);
    setEditingImage(null);
  };

  const handleDeleteImage = (id: string) => {
    const updatedImages = images
      .filter(img => img.id !== id)
      .map((img, index) => ({ ...img, order: index }));
    onChange(updatedImages);
  };

  const handleReorder = (reorderedImages: SliderImage[]) => {
    const updatedImages = reorderedImages.map((img, index) => ({
      ...img,
      order: index
    }));
    onChange(updatedImages);
  };

  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5" style={{ color: primaryColor }} />
            {t('tenant.branding.slider.title', 'Slider Images')}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('tenant.branding.slider.description', 'Manage images that appear in the login page slider')}
          </p>
        </div>
        <div className="flex gap-2">
          {sortedImages.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setPreviewIndex(0);
                setShowPreviewModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <Eye className="w-4 h-4" />
              {t('common.preview', 'Preview')}
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
          >
            <Plus className="w-4 h-4" />
            {t('tenant.branding.slider.addImage', 'Add Image')}
          </motion.button>
        </div>
      </div>

      {/* Images List */}
      {sortedImages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center"
        >
          <ImageIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {t('tenant.branding.slider.noImages', 'No slider images configured. Default images will be used.')}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-sm font-medium hover:underline"
            style={{ color: primaryColor }}
          >
            {t('tenant.branding.slider.addFirstImage', 'Add your first image')}
          </button>
        </motion.div>
      ) : (
        <Reorder.Group
          axis="y"
          values={sortedImages}
          onReorder={handleReorder}
          className="space-y-3"
        >
          {sortedImages.map((image, index) => (
            <Reorder.Item
              key={image.id}
              value={image}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center gap-4">
                {/* Drag Handle */}
                <div className="text-slate-400 dark:text-slate-500">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Thumbnail */}
                <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0">
                  <img
                    src={image.url}
                    alt={image.title || `Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="60" viewBox="0 0 100 60"><rect fill="%23e2e8f0" width="100" height="60"/><text x="50" y="30" fill="%2394a3b8" font-size="10" text-anchor="middle" alignment-baseline="middle">Image</text></svg>';
                    }}
                  />
                  <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                    #{index + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900 dark:text-white truncate">
                    {image.title || t('tenant.branding.slider.untitled', 'Untitled')}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {image.description || t('tenant.branding.slider.noDescription', 'No description')}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-1">
                    {image.url}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setEditingImage({ ...image })}
                    className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteImage(image.id)}
                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* Add Image Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewImage({ url: '', title: '', description: '' });
        }}
        title={t('tenant.branding.slider.addImage', 'Add Slider Image')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('tenant.branding.slider.imageUrl', 'Image URL')} *
            </label>
            <input
              type="url"
              value={newImage.url || ''}
              onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {newImage.url && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <img
                src={newImage.url}
                alt="Preview"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('tenant.branding.slider.imageTitle', 'Title')}
            </label>
            <input
              type="text"
              value={newImage.title || ''}
              onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              placeholder={t('tenant.branding.slider.titlePlaceholder', 'Enter slide title')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('tenant.branding.slider.imageDescription', 'Description')}
            </label>
            <textarea
              value={newImage.description || ''}
              onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder={t('tenant.branding.slider.descriptionPlaceholder', 'Enter slide description')}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setShowAddModal(false);
                setNewImage({ url: '', title: '', description: '' });
              }}
              className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleAddImage}
              disabled={!newImage.url}
              className="px-4 py-2 text-white rounded-xl transition-all disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
            >
              {t('common.add', 'Add')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Image Modal */}
      <Modal
        isOpen={!!editingImage}
        onClose={() => setEditingImage(null)}
        title={t('tenant.branding.slider.editImage', 'Edit Slider Image')}
      >
        {editingImage && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('tenant.branding.slider.imageUrl', 'Image URL')} *
              </label>
              <input
                type="url"
                value={editingImage.url}
                onChange={(e) => setEditingImage({ ...editingImage, url: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {editingImage.url && (
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <img
                  src={editingImage.url}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('tenant.branding.slider.imageTitle', 'Title')}
              </label>
              <input
                type="text"
                value={editingImage.title || ''}
                onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('tenant.branding.slider.imageDescription', 'Description')}
              </label>
              <textarea
                value={editingImage.description || ''}
                onChange={(e) => setEditingImage({ ...editingImage, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={() => setEditingImage(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleEditImage}
                className="px-4 py-2 text-white rounded-xl transition-all"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
              >
                {t('common.save', 'Save')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={t('tenant.branding.slider.preview', 'Slider Preview')}
        size="xl"
      >
        {sortedImages.length > 0 && (
          <div className="relative">
            <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={previewIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <img
                    src={sortedImages[previewIndex].url}
                    alt={sortedImages[previewIndex].title || ''}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">
                      {sortedImages[previewIndex].title || t('tenant.branding.slider.untitled', 'Untitled')}
                    </h3>
                    <p className="text-white/80">
                      {sortedImages[previewIndex].description || ''}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            {sortedImages.length > 1 && (
              <>
                <button
                  onClick={() => setPreviewIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setPreviewIndex((prev) => (prev + 1) % sortedImages.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {sortedImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setPreviewIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === previewIndex
                      ? 'w-6 bg-purple-500'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                  style={index === previewIndex ? { backgroundColor: primaryColor } : {}}
                />
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
