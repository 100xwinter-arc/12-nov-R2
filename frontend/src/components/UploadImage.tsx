import { useState } from "react";

export function UploadImageForm({onUploadSuccess}: {onUploadSuccess: (url: string) => void;}) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState("");
  
    async function handleUpload() {
      if (!selectedFile) {
        setMessage("Please choose an image.");
        return;
      }
  
      setIsUploading(true);
  
      try {
        const presignResponse = await fetch("http://localhost:3001/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: selectedFile.name,
            fileType: selectedFile.type,
          }),
        });
  
        if (!presignResponse.ok) throw new Error("Presign failed");
  
        const { signedUrl, key, publicUrl } = await presignResponse.json();
        console.log(publicUrl);
  
        const uploadResponse = await fetch(signedUrl, {
          method: "PUT",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
  
        if (!uploadResponse.ok) throw new Error("Upload to R2 failed");
  
        onUploadSuccess(URL.createObjectURL(selectedFile));

        // backend api call to store the public url userid
        setMessage("Upload successful!");
      } catch {
        setMessage("Upload failed");
      } finally {
        setIsUploading(false);
      }
    }
  
    return (
      <div className="flex flex-col gap-3">
        <input
          type="file"
          accept="image/*"
          onChange={(e: any) =>
            setSelectedFile(e.target.files?.[0] ?? null)
          }
        />
        <button onClick={handleUpload}>
          {isUploading ? "Uploading..." : "Upload Image"}
        </button>
        {message && <p>{message}</p>}
      </div>
    );
  }