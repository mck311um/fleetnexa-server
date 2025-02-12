import aws from "../utils/awsUtils";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const viewFile = async (req: any, res: any) => {
  const { path } = req.body;

  if (!path) {
    return res.status(400).json({ message: "File path is required." });
  }

  try {
    const imageUrl = await aws.getUrl(path);
    res.status(200).json({ imageUrl });
  } catch (error: any) {
    console.error(error.message);
    res.status(404).json({ message: "File not found." });
  }
};

const uploadImage = async (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const { tenantCode, imageKey } = req.body;

  try {
    if (!tenantCode) {
      return res.status(400).send("Tenant code is required.");
    }

    if (!imageKey) {
      return res.status(400).send("Image key is required.");
    }

    const imageBuffer = req.file.buffer;
    const imageUrl = await aws.uploadImage(
      tenantCode,
      imageBuffer,
      imageKey,
      req.file.mimetype
    );

    return res.status(201).json({ imageUrl });
  } catch (error: any) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
};

export default { upload, uploadImage, viewFile };
