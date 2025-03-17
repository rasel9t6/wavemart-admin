'use server';

import { v2 as cloud, type UploadApiResponse } from 'cloudinary';

cloud.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadFile = async (
  data: FormData,
  folder: string
): Promise<UploadApiResponse | undefined> => {
  const file = data.get('file');

  if (file instanceof File) {
    // Check if the file is an image or video
    if (file.type.startsWith('image') || file.type.startsWith('video')) {
      const buffer = Buffer.from(await file.arrayBuffer());

      // Determine resource type
      const resourceType = file.type.startsWith('image') ? 'image' : 'video';

      return new Promise((resolve, reject) => {
        interface UploadOptions {
          folder: string;
          timeout: number;
          resource_type: 'image' | 'video';
        }

        interface UploadCallback {
          (
            error: Error | undefined,
            result: UploadApiResponse | undefined
          ): void;
        }

        cloud.uploader
          .upload_stream(
            {
              folder,
              timeout: 120000, // Increased timeout
              resource_type: resourceType,
            } as UploadOptions,
            ((error, result) => {
              if (error) {
                console.error('Upload Error:', error);
                reject(new Error(error.message ?? 'Upload failed'));
              } else {
                resolve(result);
              }
            }) as UploadCallback
          )
          .end(buffer);
      });
    } else {
      throw new Error('Invalid file type. Only images and videos are allowed.');
    }
  } else {
    throw new Error('Invalid file. Please upload a valid file.');
  }
};
export async function readAllMedia(prefix?: string) {
  try {
    // Fetch images
    const imagesResult = await cloud.api.resources({
      type: 'upload',
      prefix,
      resource_type: 'image',
      max_results: 50,
    });

    // Fetch videos
    const videosResult = await cloud.api.resources({
      type: 'upload',
      prefix,
      resource_type: 'video',
      max_results: 50,
    });

    // Combine results and add resource_type property to each item
    const imageResources = imagesResult.resources.map((resource: any) => ({
      ...resource,
      resource_type: 'image',
    }));

    const videoResources = videosResult.resources.map((resource: any) => ({
      ...resource,
      resource_type: 'video',
    }));

    // Combine and sort by created_at (newest first)
    const allMedia = [...imageResources, ...videoResources].sort((a, b) => {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return allMedia;
  } catch (error) {
    console.error('Error fetching media from Cloudinary:', error);
    throw new Error('Failed to load media');
  }
}
export const removeMedia = async (url: string) => {
  // Extract public_id from the URL
  try {
    const publicId = extractPublicIdFromUrl(url);
    if (!publicId) {
      throw new Error('Could not extract public ID from URL');
    }

    // Determine if it's a video or image
    const resourceType =
      url.includes('video') || url.endsWith('.mp4') || url.endsWith('.mov')
        ? 'video'
        : 'image';

    await cloud.uploader.destroy(publicId, { resource_type: resourceType });
    return { success: true };
  } catch (error) {
    console.error('Failed to remove media:', error);
    throw error;
  }
};

// Helper function to extract public_id from Cloudinary URL
function extractPublicIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');

    // Remove the version part if it exists (e.g., /v1234567/)
    let startIndex = 3; // Default position after /image/upload/
    if (pathParts[3] && pathParts[3].startsWith('v')) {
      startIndex = 4;
    }

    // Join the remaining parts to form the public_id
    const publicId = pathParts.slice(startIndex).join('/');

    // Remove file extension
    return publicId.replace(/\.\w+$/, '');
  } catch (e) {
    console.error('Error extracting public_id:', e);
    return null;
  }
}

// Remove media with folder prefix (both images and videos)
export const removeMediaByFolder = async (folder: string) => {
  // Handle images
  try {
    const { resources: imageResources } = (await cloud.api.resources({
      type: 'upload',
      prefix: folder,
      resource_type: 'image',
      max_results: 100,
    })) as { resources: UploadApiResponse[] };

    const imagePublicIds = imageResources.map((resource) => resource.public_id);
    if (imagePublicIds.length > 0) {
      await cloud.api.delete_resources(imagePublicIds, {
        resource_type: 'image',
      });
    }
  } catch (error) {
    console.error('Error removing images:', error);
  }

  // Handle videos
  try {
    const { resources: videoResources } = (await cloud.api.resources({
      type: 'upload',
      prefix: folder,
      resource_type: 'video',
      max_results: 100,
    })) as { resources: UploadApiResponse[] };

    const videoPublicIds = videoResources.map((resource) => resource.public_id);
    if (videoPublicIds.length > 0) {
      await cloud.api.delete_resources(videoPublicIds, {
        resource_type: 'video',
      });
    }
  } catch (error) {
    console.error('Error removing videos:', error);
  }
};
