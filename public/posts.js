// posts.js
import { getFirestore, doc, setDoc, collection } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { app } from './firebase-config.js';

const db = getFirestore(app);

async function createPost(postData) {
    return await setDoc(doc(collection(db, "posts")), postData);
}

export { createPost }; 