export const getImageUrl = (url: string) => {
    if (url.includes('firebasestorage.googleapis.com')) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
};