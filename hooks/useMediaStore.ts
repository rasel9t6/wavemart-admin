'use client';

import { removeMedia, uploadFile } from '@/lib/actions/media.action';
import { create } from 'zustand';

// Define a media type to handle both images and videos
interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface MediaStore {
  media: MediaItem[];
  loading: boolean;
  uploadMedia: (files: File[], folder: string) => Promise<string[]>;
  updateMedia: (newMedia: MediaItem[]) => void;
  removeItem: (url: string) => Promise<void>;
  clearMedia: () => void;
}

export const useMediaStore = create<MediaStore>((set, get) => ({
  media: [],
  loading: false,

  // Upload multiple files (images and videos)
  uploadMedia: async (files, folder) => {
    console.log('Original files:', files);
    const filesArray = (
      Array.isArray(files) ? files : Array.from(files)
    ) as File[];
    console.log('Converted filesArray:', filesArray);

    if (!filesArray.length) {
      console.error('No files to upload.');
      return [];
    }
    try {
      set({ loading: true });
      const uploadPromises = filesArray.map(async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const result = await uploadFile(formData, folder);
        console.log(result);
        if (result) {
          // Determine media type
          const type = file.type.startsWith('image') ? 'image' : 'video';

          // Update the store with the new media
          set((state) => ({
            media: [{ url: result.secure_url, type }, ...state.media],
          }));

          return result.secure_url;
        }
        return null;
      });

      const results = await Promise.all(uploadPromises);
      set({ loading: false });

      // Filter out null results
      return results.filter(Boolean) as string[];
    } catch (error) {
      console.error('Failed to upload media:', error);
      set({ loading: false });
      throw error;
    }
  },

  // Add new media items
  updateMedia: (newMedia) => {
    set((state) => ({
      media: [...newMedia, ...state.media],
    }));
  },

  // Remove media item by URL
  removeItem: async (url) => {
    try {
      set({ loading: true });
      await removeMedia(url);

      set((state) => ({
        media: state.media.filter((item) => item.url !== url),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to remove media:', error);
      set({ loading: false });
      throw error;
    }
  },

  // Clear all media
  clearMedia: () => {
    set({ media: [] });
  },
}));
