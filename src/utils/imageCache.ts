const imageCache = new Map<string, HTMLImageElement>();
const loadingPromises = new Map<string, Promise<void>>();

export const preloadImage = (src: string): Promise<void> => {
  if (typeof window === "undefined") return Promise.resolve();

  if (imageCache.has(src)) {
    return Promise.resolve();
  }

  if (loadingPromises.has(src)) {
    return loadingPromises.get(src)!;
  }

  const img = new Image();
  img.src = src;

  const promise = new Promise<void>((resolve, reject) => {
    img.onload = () => {
      if (img.decode) {
        img.decode()
          .then(() => {
            imageCache.set(src, img);
            loadingPromises.delete(src);
            resolve();
          })
          .catch((decodeError) => {
            console.warn(`Image decode failed for ${src}:`, decodeError);
            imageCache.set(src, img);
            loadingPromises.delete(src);
            resolve();
          });
      } else {
        imageCache.set(src, img);
        loadingPromises.delete(src);
        resolve();
      }
    };

    img.onerror = (error) => {
      console.error(`Failed to load image: ${src}`, error);
      loadingPromises.delete(src);
      reject(new Error(`Failed to load image: ${src}`));
    };
  });

  loadingPromises.set(src, promise);
  return promise;
};

export const getCachedImage = (src: string): HTMLImageElement | undefined => {
  return imageCache.get(src);
};

export const isImageCached = (src: string): boolean => {
  return imageCache.has(src);
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type PreloadOptions = {
  batchSize?: number;
  delayBetweenBatches?: number;
};

export const preloadAllComposerImages = async (
  imageUrls: string[],
  options?: PreloadOptions,
): Promise<void> => {
  if (typeof window === "undefined") return;

  const uniqueUrls = [...new Set(imageUrls)];

  // Load images in small batches with delays to avoid mobile startup contention.
  const batchSize = options?.batchSize ?? 3;
  const delayBetweenBatches = options?.delayBetweenBatches ?? 500;

  for (let i = 0; i < uniqueUrls.length; i += batchSize) {
    const batch = uniqueUrls.slice(i, i + batchSize);
    await Promise.allSettled(
      batch.map(url => preloadImage(url))
    );

    // Add delay between batches (except for the last batch)
    if (i + batchSize < uniqueUrls.length) {
      await delay(delayBetweenBatches);
    }
  }
};
