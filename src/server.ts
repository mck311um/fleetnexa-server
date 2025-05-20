import app from "./app";
import logUtil from "./config/logger.config";

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  logUtil.logger.info(`Server is running on port ${PORT}`);
});
