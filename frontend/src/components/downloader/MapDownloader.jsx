import React, { useState } from 'react';
import { Button, CircularProgress, Alert } from '@mui/material';
import { Download } from 'lucide-react';

const MapDownloader = ({ variable, date }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const downloadMap = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/generate-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date, variable
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate map');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `map-${variable}-${date}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={downloadMap} 
        variant="contained" 
        color="primary" 
        fullWidth 
        disabled={isLoading}
        startIcon={!isLoading ? <Download /> : null} // Use the download icon
      >
        {isLoading ? (
          <>
            <CircularProgress size={24} color="inherit" style={{ marginRight: 8 }} />
            Generating Map...
          </>
        ) : (
          'PNG'
        )}
      </Button>

      {error && (
        <Alert severity="error">
          Failed to download map: {error}
        </Alert>
      )}
    </div>
  );
};

export default MapDownloader;
