import express from "express";
import cors from "cors";
import apiRouter from "./routes/apiRouter";
import config from "./config";
import { asyncHandler } from "./middleware/misc";
import { generateOneTimeDownloadUrl } from "./services/s3Service";

const { PORT, FRONTEND_URL } = config;

const app = express();

app.use(cors({
  origin: FRONTEND_URL,
}));
app.use(express.json());

app.use("/api/v1", apiRouter);

// For constella to verify any attestation, it will call agent-host/presigned-url?key=<key>
// This endpoint will need to generate a s3 presigned url for the given key for the wallet to download and verify
app.get(
  '/presigned-url',
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { key } = req.query
    if (!key) {
      return res.status(400).json({ error: 'Key is required' })
    }
    const presignedUrl = await generateOneTimeDownloadUrl(
      'tlsn-notary-test',
      key as string
    )
    if (!presignedUrl) {
      return res.status(500).json({ error: 'Failed to generate presigned URL' })
    }
    res.send(presignedUrl)
  })
)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
