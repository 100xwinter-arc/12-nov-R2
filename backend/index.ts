import express from "express";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import cors from "cors";


const app = express();
app.use(express.json());
app.use(cors());



app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

//keys are dummy for push
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "cb9530027dcb7fc640";
const R2_ACCESS_SECRET_KEY = process.env.R2_ACCESS_SECRET_KEY || "8a47d4146d57d4a3a76e213333a85f58915746";
const R2_ENDPOINT = process.env.R2_ENDPOINT || "https://428e2045ae0453caa8b3.r2.cloudflarestorage.com";
const R2_BUCKET = process.env.R2_BUCKET || "100x"
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-bb0e4fe4b226cb0de45c7.r2.dev";

if (!R2_ACCESS_KEY_ID || !R2_ACCESS_SECRET_KEY || !R2_ENDPOINT || !R2_BUCKET) {
  throw new Error("Missing required R2 env vars");
}


const s3Client = new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_ACCESS_SECRET_KEY,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
});

function getFileExtension(fileName: string) {
    const parts = fileName.split(".");
    const extension = parts[parts.length - 1];
    return extension && extension !== fileName ? extension : "bin";
}

app.post("/presign", async (req, res) => {
    const { fileName, fileType } = req.body ?? {};
  
    if (!fileName || !fileType)
      return res.status(400).json({ error: "fileName and fileType are required" });
  
    if (!fileType.startsWith("image/"))
      return res.status(400).json({ error: "Only image uploads allowed" });
  
    const extension = getFileExtension(fileName);
    const key = `uploads/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  
    try {
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        ContentType: fileType,
      });
  
      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 60,
      });
  
      const publicUrl = R2_PUBLIC_URL
        ? `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`
        : null;
  
      res.json({ signedUrl, key, publicUrl });
    } catch {
      res.status(500).json({ error: "Failed to generate URL" });
    }
});


app.listen(3001, () => {
  console.log("Server is running on port 3001");
});