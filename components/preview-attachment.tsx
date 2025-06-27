import type { Attachment } from 'ai';
import { useState } from 'react';

import { LoaderIcon } from './icons';

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
}: {
  attachment: Attachment;
  isUploading?: boolean;
}) => {
  const { name, url, contentType } = attachment;
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const handleImageClick = () => {
    if (contentType?.startsWith('image')) {
      setIsImageModalOpen(true);
    }
  };

  const handleImageDoubleClick = () => {
    if (contentType?.startsWith('image')) {
      window.open(url, '_blank');
    }
  };

  return (
    <>
      <div
        data-testid="input-attachment-preview"
        className="flex flex-col gap-2"
      >
        <div className="w-32 h-24 aspect-video bg-muted rounded-md relative flex flex-col items-center justify-center">
          {contentType ? (
            contentType.startsWith('image') ? (
              // NOTE: it is recommended to use next/image for images
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt={name ?? 'An image attachment'}
                className="rounded-md size-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={handleImageClick}
                onDoubleClick={handleImageDoubleClick}
              />
            ) : (
              <div className="" />
            )
          ) : (
            <div className="" />
          )}

          {isUploading && (
            <div
              data-testid="input-attachment-loader"
              className="animate-spin absolute text-zinc-500"
            >
              <LoaderIcon />
            </div>
          )}
        </div>
        <div className="text-xs text-zinc-500 max-w-32 truncate">{name}</div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && contentType?.startsWith('image') && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={url}
              alt={name ?? 'Full size image'}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors"
              onClick={() => setIsImageModalOpen(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};
