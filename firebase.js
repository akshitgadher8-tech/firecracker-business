// Firebase compat SDK scripts are loaded by index.html before this file.
if (typeof firebase === "undefined") {
  window.firestoreSyncStatus = {
    available: false,
    syncedAt: null,
    error: "Firebase SDK could not be loaded."
  };
  console.error("Firebase SDK could not be loaded; Firestore sync is unavailable.");
} else {
  const firebaseConfig = {
    apiKey: "AIzaSyDQMBoP2kuclQ35YjjoeimTw5MDdafps8E",
    authDomain: "firecracker-ak08.firebaseapp.com",
    projectId: "firecracker-ak08",
    storageBucket: "firecracker-ak08.firebasestorage.app",
    messagingSenderId: "369501759127",
    appId: "1:369501759127:web:e6be9ab08500ab5a65abd2"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const db = firebase.firestore();
  db.settings({ ignoreUndefinedProperties: true });
  let firestoreSaveQueue = Promise.resolve(true);
  window.firestoreSyncStatus = {
    available: true,
    syncedAt: null,
    error: ""
  };

  window.saveAllDataToFirestore = function () {
    if (typeof activeBusinessId === "undefined" || !activeBusinessId) {
      return Promise.resolve(false);
    }

    const businessId = String(activeBusinessId);
    const data = businessDataSnapshot();
    const payload = {
      ...data,
      updatedBy: typeof session !== "undefined" ? (session?.name || "Owner") : "Owner",
      updatedById: typeof session !== "undefined" ? (session?.id || "owner") : "owner",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    const write = firestoreSaveQueue.then(() =>
      db.collection("businesses").doc(businessId).set(payload, { merge: true })
    );
    firestoreSaveQueue = write.then(() => {
      window.firestoreSyncStatus.syncedAt = new Date().toISOString();
      window.firestoreSyncStatus.error = "";
      return true;
    }, error => {
      window.firestoreSyncStatus.error = error?.message || String(error);
      console.error("Firestore business data sync failed:", error);
      return false;
    });
    return firestoreSaveQueue;
  };
}
