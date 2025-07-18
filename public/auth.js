// auth.js
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

async function registerUser({ name, email, password, userType, phone }) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
        name, email, userType, phone, createdAt: new Date().toISOString()
    });
    return user;
}

async function loginUser(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
}

async function logoutUser() {
    return await signOut(auth);
}

function onUserAuthStateChanged(callback) {
    onAuthStateChanged(auth, callback);
}

async function fetchCurrentUser(user) {
    if (!user) return null;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
        return { id: user.uid, ...userDoc.data() };
    }
    return null;
}

function setCurrentUser(user) {
    currentUser = user;
}

function getCurrentUser() {
    return currentUser;
}

export { 
    auth, 
    db, 
    currentUser, 
    registerUser, 
    loginUser, 
    logoutUser, 
    onUserAuthStateChanged, 
    fetchCurrentUser,
    setCurrentUser,
    getCurrentUser
}; 