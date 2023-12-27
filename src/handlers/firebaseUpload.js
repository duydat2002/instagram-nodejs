const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const admin = require("firebase-admin");
const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } = require("firebase/storage");

const upload = multer({ storage: multer.memoryStorage() });

// const firebaseConfig = require("@/configs/firebase.json");
// const serviceAccount = require("@/configs/firebase-admin.json");

const firebaseConfig = require("../../firebase.json");
const serviceAccount = require("../../firebase-admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "instagram-storage-bc9c9.appspot.com",
});

const bucket = admin.storage().bucket();
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const singleUpload = async (file, destination) => {
  if (file) {
    const storageRef = ref(storage, `${destination}/${uuidv4()}.${file.originalname.split(".").reverse()[0]}`);

    const uploaded = await uploadBytes(storageRef, file.buffer, {
      contentType: file.mimetype,
    });

    const url = await getDownloadURL(uploaded.ref);

    return url;
  }
  return null;
};

const multipleUpload = async (files, destination) => {
  const promises = files.map(async (file) => {
    return await singleUpload(file, destination);
  });

  const urls = await Promise.all(promises);

  return urls;
};

const deleteFileStorageByUrl = async (url) => {
  try {
    const fileRef = ref(storage, url.split("?")[0]);

    await deleteObject(fileRef);
  } catch (error) {
    console.log(error.message);
  }
};

const deleteFolderStorage = async (destination) => {
  try {
    await bucket.deleteFiles({ prefix: destination });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  singleUpload,
  multipleUpload,
  deleteFileStorageByUrl,
  deleteFolderStorage,
  upload,
};
