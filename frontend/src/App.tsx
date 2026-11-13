import { useState } from "react";
import ImagePreview from "./components/ImagePreview";
import { UploadImageForm } from "./components/UploadImage";

export function App() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <UploadImageForm onUploadSuccess={setPreviewUrl} />
      <ImagePreview previewUrl={previewUrl} />
    </div>
  );
}

export default App;