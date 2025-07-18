// connections.js
import { getFirestore, doc, setDoc, updateDoc, collection } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { app } from './firebase-config.js';

const db = getFirestore(app);

async function createConnection(connectionData) {
    return await setDoc(doc(collection(db, "connections")), connectionData);
}

async function updateConnectionStatus(connectionId, status, updatedBy) {
    const connectionRef = doc(db, "connections", connectionId);
    return await updateDoc(connectionRef, {
        status: status,
        updatedAt: new Date().toISOString(),
        statusUpdatedBy: updatedBy
    });
}

export { createConnection, updateConnectionStatus }; 