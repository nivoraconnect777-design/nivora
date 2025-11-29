import cloudinary from '../config/cloudinary';

class MediaService {
  async generateUploadSignature(folder: string = 'profile_pictures') {
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Only include transformation for profile pictures
    const params: any = {
      timestamp,
      folder,
    };

    // Add transformation only for profile pictures
    if (folder === 'profile_pictures') {
      params.transformation = 'c_fill,g_face,h_150,w_150';
    }

    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET!
    );

    return {
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
    };
  }

  async deleteImage(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      throw new Error('Failed to delete image');
    }
  }
}

export default new MediaService();
