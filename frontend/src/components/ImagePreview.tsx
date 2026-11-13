export function ImagePreview({ previewUrl }: { previewUrl: string | null }) {
    if (!previewUrl) return null;
  
    return (
      <div style={{ marginTop: '1rem', width: '100%', maxWidth: '200px' }}>
        <img
          src={previewUrl}
          alt="Uploaded preview"
          style={{ height: 'auto', width: '100%', borderRadius: '0.5rem', objectFit: 'cover' }}
        />
      </div>
    );
}

export default ImagePreview;