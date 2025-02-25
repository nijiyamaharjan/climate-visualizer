import { useCallback } from 'react';
import domtoimage from 'dom-to-image';

const useDownloadImage = () => {
  const downloadImage = useCallback((elementId, fileName = 'image.png', backgroundColor = 'white') => {
    const chartNode = document.getElementById(elementId); // Get the DOM element by ID
    if (chartNode) {
      domtoimage.toBlob(chartNode, { bgcolor: backgroundColor })
        .then((blob) => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = fileName; // Name the file with the provided fileName
          link.click(); // Trigger the download
        })
        .catch((error) => {
          console.error('Error downloading image:', error);
        });
    }
  }, []);

  return { downloadImage };
};

export default useDownloadImage;
