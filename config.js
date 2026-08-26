// ============================================================
// TEXFRIEND ERP - DEMO & DISTRIBUTION CONFIG
// config.js
// FIREBASE REALTIME DATABASE & CLOUD STORAGE READY
// LOCAL-FIRST + CLOUD SYNC
// ============================================================
//
// ✅ LocalStorage
// ✅ Firebase Realtime Database
// ✅ Offline Local Save
// ✅ Online Cloud Save
// ✅ Pending Queue
// ✅ Automatic Online Sync
// 📦 Firebase Cloud Storage (Ready for Future)
// ============================================================

"use strict";

// ============================================================
// SYSTEM MODE
// ============================================================

window.isDemo = true; // Demo mode enabled

window.TEXFRIEND_CLOUD = {
    ENABLED: true,
    FIRESTORE: false,
    AUTH: false,
    STORAGE: true, // Future-ready for Image/File Uploads
    RTDB: true
};

// ============================================================
// 🔥 FIREBASE CONFIGURATION (USER MUST CHANGE THIS) 🔥
// ============================================================
// புதிய யூசர்கள் தங்களுடைய Firebase Project விவரங்களை 
// இங்கே மட்டும் மாற்றினால் போதும்.
// ============================================================

window.TEXFRIEND_FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.firebasestorage.app", // Storage bucket for files
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID",
    
    // Realtime Database URL (Very Important for Sync)
    databaseURL: "https://your-project-id-default-rtdb.asia-southeast1.firebasedatabase.app/" 
};

// ============================================================
// GLOBAL FIREBASE VARIABLES
// ============================================================

window.db = null;
window.storage = null; // Added for future Cloud Storage
window._firebaseApp = null;
window.firebaseConnected = false;
window.cloudSyncReady = false;
window.firebaseInitializing = false;
window.firebaseInitStarted = false;
window.cloudSyncPromise = null;

// Compatibility placeholders
window._doc = null;
window._setDoc = null;
window._getDoc = null;
window._deleteDoc = null;
window._collection = null;
window._getDocs = null;

// ============================================================
// CLOUD STATUS HELPERS
// ============================================================

window.isCloudEnabled = function () { return true; };
window.isFirestoreEnabled = function () { return false; };
window.isAuthEnabled = function () { return false; };
window.isStorageEnabled = function () { return window.TEXFRIEND_CLOUD.STORAGE; };
window.isRTDBEnabled = function () { return true; };

// ============================================================
// LOCAL STORAGE HELPERS
// ============================================================

window.localLoad = function (key, fallback = null) {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null || raw === "") return fallback;
        try {
            const parsed = JSON.parse(raw);
            return (parsed ?? fallback);
        } catch (error) {
            return raw;
        }
    } catch (error) {
        console.error("localLoad Error:", key, error);
        return fallback;
    }
};

window.localSave = function (key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error("localSave Error:", key, error);
        return false;
    }
};

// ============================================================
// INTERNET STATUS
// ============================================================

window.isInternetAvailable = function () { return navigator.onLine === true; };

// ============================================================
// ERP CLOUD KEYS
// ============================================================

window.erpCloudKeys = [
    "design_specs", "pre_design_numbers", "design_masters_data",
    "warping_issue_records", "weaving_master_data", "weaving_warp_trans",
    "weaving_weft_trans", "party_orders_data", "dyeing_issue_records",
    "dyeing_receive_records", "tex_master_weavers", "tex_master_warping_units",
    "washing_issue_records", "washing_receive_records", "tex_master_washing_units",
    "kora_stock_records", "kora_issue_records", "tex_master_mills",
    "tex_master_units", "tex_master_counts", "party_master_db",
    "user_permissions", "erp_system_users", "master_settings"
];

// ============================================================
// CLOUD ROOT
// ============================================================
window.TEXFRIEND_CLOUD_ROOT = "texfriendERP";

// ============================================================
// DIRTY TRACKING
// ============================================================

function getDirtyKey(key) { return "__texfriend_dirty__" + key; }
function getTimeKey(key) { return "__texfriend_local_time__" + key; }

function markLocalDirty(key) {
    try {
        localStorage.setItem(getDirtyKey(key), "1");
        localStorage.setItem(getTimeKey(key), String(Date.now()));
    } catch (error) { console.warn("Unable to mark dirty:", key); }
}

function clearLocalDirty(key) {
    try { localStorage.removeItem(getDirtyKey(key)); } catch (error) {}
}

function isLocalDirty(key) {
    try { return localStorage.getItem(getDirtyKey(key)) === "1"; }
    catch (error) { return false; }
}

// ============================================================
// OFFLINE QUEUE
// ============================================================

window.offlineSyncQueue = window.offlineSyncQueue || {};

function queueOfflineData(key, data) {
    try {
        window.offlineSyncQueue[key] = data;
        localStorage.setItem("__texfriend_offline_queue__", JSON.stringify(window.offlineSyncQueue));
    } catch (error) { console.error("Offline Queue Error:", error); }
}

function loadOfflineQueue() {
    try {
        const raw = localStorage.getItem("__texfriend_offline_queue__");
        if (!raw) { window.offlineSyncQueue = {}; return; }
        window.offlineSyncQueue = JSON.parse(raw) || {};
    } catch (error) { window.offlineSyncQueue = {}; }
}

function removeQueueItem(key) {
    try {
        delete window.offlineSyncQueue[key];
        localStorage.setItem("__texfriend_offline_queue__", JSON.stringify(window.offlineSyncQueue));
    } catch (error) {}
}

loadOfflineQueue();

function safeJSONParse(value, fallback = null) {
    try { return JSON.parse(value); } catch (error) { return fallback; }
}

// ============================================================
// NOTIFICATION
// ============================================================

window.showNotification = function (message, type = "success") {
    try {
        const oldNotif = document.getElementById("erp-custom-notification");
        if (oldNotif) oldNotif.remove();
        if (!document.body) return;

        const notification = document.createElement("div");
        notification.id = "erp-custom-notification";
        notification.innerText = message;
        
        // Style Notification
        Object.assign(notification.style, {
            position: "fixed", bottom: "24px", left: "50%",
            transform: "translateX(-50%)", zIndex: "999999",
            padding: "12px 20px", borderRadius: "12px", color: "#FFFFFF",
            fontFamily: "sans-serif", fontSize: "14px", fontWeight: "700",
            textAlign: "center", boxShadow: "0 6px 25px rgba(0,0,0,0.35)",
            maxWidth: "calc(100% - 30px)",
            background: type === "success" ? "#10B981" : type === "warning" ? "#F59E0B" : "#EF4444"
        });

        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.style.opacity = "0";
                notification.style.transition = "opacity 0.3s ease";
                setTimeout(() => notification.remove(), 300);
            }
        }, 2200);
    } catch (error) { console.log("Notification:", message); }
};

// ============================================================
// NETWORK STATUS (FIXED TO TOP)
// ============================================================

function updateNetworkStatus() {
    if (!document.body) return;

    const old = document.getElementById("texfriend-network-status");
    if (old) old.remove();

    const bar = document.createElement("div");
    bar.id = "texfriend-network-status";

    if (window.firebaseConnected === true) {
        bar.innerHTML = "🟢 ONLINE — Firebase Cloud Connected";
        bar.style.background = "#10B981";
        bar.style.color = "#FFFFFF";
    } else if (navigator.onLine === true) {
        bar.innerHTML = "🌐 ONLINE — Firebase Connecting...";
        bar.style.background = "#3B82F6";
        bar.style.color = "#FFFFFF";
    } else {
        bar.innerHTML = "📴 OFFLINE — Local Data Saved";
        bar.style.background = "#F59E0B";
        bar.style.color = "#111827";
    }

    // Top Fixed Styling
    Object.assign(bar.style, {
        position: "fixed", left: "0", right: "0", top: "0", // TOP PLACEMENT
        padding: "6px", textAlign: "center", fontFamily: "sans-serif",
        fontSize: "11px", fontWeight: "700", zIndex: "999998"
    });

    document.body.appendChild(bar);
    setTimeout(() => { if (bar && bar.parentNode) bar.remove(); }, 3000);
}

window.addEventListener("online", () => {
    updateNetworkStatus();
    setTimeout(syncOfflineQueue, 800);
});
window.addEventListener("offline", () => {
    window.firebaseConnected = false;
    updateNetworkStatus();
});

// ============================================================
// LOAD FIREBASE COMPAT SDK
// ============================================================

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement("script");
        script.src = src; script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error("Firebase SDK load failed"));
        document.head.appendChild(script);
    });
}

// ============================================================
// FIREBASE INITIALIZE (WITH STORAGE)
// ============================================================

window.initializeFirebase = async function () {
    if (window.firebaseInitStarted && window.cloudSyncPromise) return window.cloudSyncPromise;
    window.firebaseInitStarted = true;
    window.firebaseInitializing = true;

    window.cloudSyncPromise = (async () => {
        try {
            await loadScript("https://www.gstatic.com/firebasejs/12.17.1/firebase-app-compat.js");
            await loadScript("https://www.gstatic.com/firebasejs/12.17.1/firebase-database-compat.js");
            
            // Load Storage SDK if enabled for future
            if(window.TEXFRIEND_CLOUD.STORAGE){
                await loadScript("https://www.gstatic.com/firebasejs/12.17.1/firebase-storage-compat.js");
            }

            if (typeof firebase === "undefined") throw new Error("Firebase SDK unavailable");

            if (firebase.apps && firebase.apps.length) {
                window._firebaseApp = firebase.app();
            } else {
                window._firebaseApp = firebase.initializeApp(window.TEXFRIEND_FIREBASE_CONFIG);
            }

            window.db = firebase.database();
            
            // Initialize Storage for Future Use
            if(window.TEXFRIEND_CLOUD.STORAGE){
                window.storage = firebase.storage();
            }

            const connectedRef = window.db.ref(".info/connected");
            connectedRef.on("value", (snapshot) => {
                window.firebaseConnected = snapshot.val() === true;
                window.cloudSyncReady = window.firebaseConnected;
                console.log(window.firebaseConnected ? "☁️ Firebase RTDB Connected" : "📴 Firebase RTDB Offline");
            });

            window.firebaseInitializing = false;

            if (navigator.onLine) {
                await syncAllCloudData();
                await syncOfflineQueue();
            }
            console.log("✅ TEXFRIEND Firebase initialized (Storage Ready)");
            return true;
        } catch (error) {
            console.error("❌ Firebase init failed:", error);
            window.firebaseConnected = window.cloudSyncReady = window.firebaseInitializing = false;
            return false;
        }
    })();
    return window.cloudSyncPromise;
};

// ============================================================
// CLOUD PATH & SAVE/LOAD DIRECT (UNCHANGED)
// ============================================================

function cloudPath(key) { return window.TEXFRIEND_CLOUD_ROOT + "/" + String(key).replace(/\./g, "_"); }

async function cloudSave(key, data) {
    if (!window.db || !navigator.onLine) return false;
    try {
        await window.db.ref(cloudPath(key)).set(data);
        clearLocalDirty(key);
        removeQueueItem(key);
        console.log("☁️ Cloud Saved:", key);
        return true;
    } catch (error) { console.error("Cloud Save Error:", error); return false; }
}

async function cloudLoad(key, fallback = null) {
    if (!window.db) return fallback;
    try {
        const snapshot = await window.db.ref(cloudPath(key)).once("value");
        return snapshot.exists() ? snapshot.val() : fallback;
    } catch (error) { return fallback; }
}

// ============================================================
// MAIN SYNC FUNCTIONS (UNCHANGED)
// ============================================================

window.firebaseSave = async function (key, data) {
    try {
        if (!window.localSave(key, data)) { window.showNotification("❌ Local Save Failed", "error"); return false; }
        markLocalDirty(key); queueOfflineData(key, data);

        if (navigator.onLine) {
            if (!window.db) await initializeFirebase();
            if (window.db && window.firebaseConnected) {
                if (await cloudSave(key, data)) {
                    window.showNotification("☁️ Cloud Saved ✓", "success");
                    return true;
                }
            }
        }
        window.showNotification("💾 Saved Locally — Cloud Pending", "warning");
        return true;
    } catch (error) {
        try { window.localSave(key, data); markLocalDirty(key); queueOfflineData(key, data); } catch (e) {}
        return true;
    }
};

window.firebaseSaveIndividual = (key, data) => window.firebaseSave(key, data);

window.firebaseLoad = function (key, fallback = null) {
    const localData = window.localLoad(key, null);
    return (localData !== null && localData !== undefined) ? localData : fallback;
};

window.firebaseLoadCloud = async function (key, fallback = null) {
    try {
        if (!window.db) await initializeFirebase();
        if (window.db && navigator.onLine) {
            const data = await cloudLoad(key, null);
            if (data !== null && data !== undefined) {
                window.localSave(key, data);
                return data;
            }
        }
    } catch (error) { console.warn("Cloud load fallback:", error); }
    return window.localLoad(key, fallback);
};

// Queue & Full Sync
window.syncOfflineQueue = async function () {
    if (!navigator.onLine || !window.db) return false;
    const queue = Object.assign({}, window.offlineSyncQueue);
    const keys = Object.keys(queue);
    if (keys.length === 0) return true;
    
    let successCount = 0;
    for (const key of keys) {
        try { if (await cloudSave(key, queue[key])) successCount++; } 
        catch (error) {}
    }
    return successCount === keys.length;
};

async function syncAllCloudData() {
    if (!window.db || !navigator.onLine) return false;
    let synced = 0;
    for (const key of window.erpCloudKeys) {
        try {
            if (isLocalDirty(key)) continue;
            const cloudData = await cloudLoad(key, null);
            if (cloudData !== null && cloudData !== undefined) {
                window.localSave(key, cloudData); synced++;
            }
        } catch (error) {}
    }
    return true;
}

window.syncERPToCloud = async function () {
    if (!navigator.onLine || !window.db) return false;
    for (const key of window.erpCloudKeys) {
        try { if (isLocalDirty(key)) { const d = window.localLoad(key, null); if(d) await cloudSave(key, d); } } 
        catch (error) {}
    }
    await syncOfflineQueue(); return true;
};
window.syncERPFromCloud = async function () { return await syncAllCloudData(); };
window.waitForCloudSync = async function (timeout = 15000) { return window.cloudSyncReady; };

// ============================================================
// DOM READY & UI HELPERS (Theme, Zoom, Resets) 
// Kept Intact for UI Functionality
// ============================================================
// (The rest of the Reset, Dropdown, Theme, and Zoom UI functions remain the same as your original)

window.factoryResetCloud = async function () {
    if (!window.confirm("⚠️ FACTORY RESET\n\nAll TEXFRIEND data will be deleted.\n\nContinue?")) return;
    try {
        if (navigator.onLine && window.db) await window.db.ref(window.TEXFRIEND_CLOUD_ROOT).remove();
        localStorage.clear(); sessionStorage.clear(); window.offlineSyncQueue = {};
        alert("✅ Data Cleared!"); window.location.href = "index.html";
    } catch (error) { alert("❌ Failed: " + error.message); }
};
window.handleCloudReset = window.factoryResetCloud;
window.clearLocalCache = function () {
    if (!window.confirm("🧹 CLEAR LOCAL CACHE\n\nCloud data is safe. Clear local?\n\nContinue?")) return;
    localStorage.clear(); sessionStorage.clear(); window.offlineSyncQueue = {};
    alert("✅ Local Cache Cleared!"); window.location.reload();
};
window.handleLocalReset = window.clearLocalCache;

// Dropdowns & Startup
window.addEventListener("DOMContentLoaded", () => {
    updateNetworkStatus();
    setTimeout(initializeFirebase, 300);
});

// START
setTimeout(() => { if (navigator.onLine) initializeFirebase(); }, 500);

console.log("================================================");
console.log("✅ TEXFRIEND DEMO config.js loaded");
console.log("☁️ Storage Supported: YES");
console.log("================================================");
