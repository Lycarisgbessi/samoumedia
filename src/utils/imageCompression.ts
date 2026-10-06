// Limite pratique des requêtes JSON sur Vercel (~4,5 Mo base64 inclus)
export const MAX_RAW_UPLOAD_BYTES = 3 * 1024 * 1024;

export const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    // GIF animés : JAMAIS de compression — elle détruirait l'animation.
    // Le fichier original est envoyé tel quel (dans la limite de 3 Mo).
    if (file.type === 'image/gif') {
      if (file.size > MAX_RAW_UPLOAD_BYTES) {
        return reject(new Error(`GIF trop lourd (${(file.size / 1024 / 1024).toFixed(1)} Mo) : 3 Mo maximum pour préserver l'animation.`));
      }
      const gifReader = new FileReader();
      gifReader.onload = (event) => resolve(event.target?.result as string);
      gifReader.onerror = () => reject(new Error('Lecture du GIF impossible'));
      gifReader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context null'));

        ctx.drawImage(img, 0, 0, width, height);
        // Compression en JPEG avec la qualité spécifiée
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
