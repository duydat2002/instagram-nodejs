const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");

const upload = multer({ storage: multer.memoryStorage() });

const firebaseConfig = require("@/configs/firebase-config.json");

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const singleUpload = async (file, destination) => {
  if (file) {
    const storageRef = ref(
      storage,
      `${destination}/${uuidv4()}.${file.originalname.split(".").reverse()[0]}`
    );

    const uploaded = await uploadBytes(storageRef, file.buffer, {
      contentType: file.mimetype,
    });

    const url = await getDownloadURL(uploaded.ref);

    return url;
  }
};

module.exports = {
  singleUpload,
  upload,
};
