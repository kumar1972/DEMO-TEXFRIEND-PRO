// ============================================================
// TEXFRIEND ERP
// config.js
// FIREBASE REALTIME DATABASE CLOUD SYNC
// LOCAL-FIRST + CLOUD SYNC
// ============================================================
//
// ✅ LocalStorage
// ✅ Firebase Realtime Database
// ✅ Offline Local Save
// ✅ Online Cloud Save
// ✅ Pending Queue
// ✅ Automatic Online Sync
// ✅ Existing ERP firebaseSave() compatibility
// ============================================================

"use strict";


// ============================================================
// SYSTEM MODE
// ============================================================

window.isDemo = false;

window.TEXFRIEND_CLOUD = {

    ENABLED: true,

    FIRESTORE: false,

    AUTH: false,

    STORAGE: false,

    RTDB: true

};


// ============================================================
// FIREBASE CONFIG
// ============================================================

window.TEXFRIEND_FIREBASE_CONFIG = {

    apiKey:
        "AIzaSyAZf02FHVU7zskrDjZJKOOLl8Ngrnql9J0",

    authDomain:
        "texfriend-2-in-1.firebaseapp.com",

    projectId:
        "texfriend-2-in-1",

    storageBucket:
        "texfriend-2-in-1.firebasestorage.app",

    messagingSenderId:
        "202469954740",

    appId:
        "1:202469954740:web:67855889710ce3379fb3e1",

    measurementId:
        "G-RYX6CFKLV9",

    databaseURL:
        "https://texfriend-2-in-1-default-rtdb.asia-southeast1.firebasedatabase.app/"

};


// ============================================================
// GLOBAL FIREBASE VARIABLES
// ============================================================

window.db = null;

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

window.isCloudEnabled = function () {

    return true;

};


window.isFirestoreEnabled = function () {

    return false;

};


window.isAuthEnabled = function () {

    return false;

};


window.isStorageEnabled = function () {

    return false;

};


window.isRTDBEnabled = function () {

    return true;

};


// ============================================================
// LOCAL STORAGE HELPERS
// ============================================================

window.localLoad = function (
    key,
    fallback = null
) {

    try {

        const raw =
            localStorage.getItem(key);

        if (
            raw === null ||
            raw === ""
        ) {

            return fallback;

        }

        try {

            const parsed =
                JSON.parse(raw);

            return (
                parsed ?? fallback
            );

        } catch (error) {

            return raw;

        }

    } catch (error) {

        console.error(
            "localLoad Error:",
            key,
            error
        );

        return fallback;

    }

};


// ============================================================
// LOCAL SAVE
// ============================================================

window.localSave = function (
    key,
    data
) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

        return true;

    } catch (error) {

        console.error(
            "localSave Error:",
            key,
            error
        );

        return false;

    }

};


// ============================================================
// INTERNET STATUS
// ============================================================

window.isInternetAvailable =
    function () {

        return (
            navigator.onLine === true
        );

    };


// ============================================================
// ERP CLOUD KEYS
// ============================================================

window.erpCloudKeys = [

    "design_specs",
    "pre_design_numbers",
    "design_masters_data",

    "warping_issue_records",

    "weaving_master_data",
    "weaving_warp_trans",
    "weaving_weft_trans",

    "party_orders_data",

    "dyeing_issue_records",
    "dyeing_receive_records",

    "tex_master_weavers",
    "tex_master_warping_units",

    "washing_issue_records",
    "washing_receive_records",

    "tex_master_washing_units",

    "kora_stock_records",
    "kora_issue_records",

    "tex_master_mills",
    "tex_master_units",
    "tex_master_counts",

    "party_master_db",

    "user_permissions",
    "erp_system_users",

    "master_settings"

];


// ============================================================
// CLOUD ROOT
// ============================================================

window.TEXFRIEND_CLOUD_ROOT =
    "texfriendERP";


// ============================================================
// DIRTY TRACKING
// ============================================================

function getDirtyKey(key) {

    return (
        "__texfriend_dirty__" +
        key
    );

}


function getTimeKey(key) {

    return (
        "__texfriend_local_time__" +
        key
    );

}


function markLocalDirty(key) {

    try {

        localStorage.setItem(
            getDirtyKey(key),
            "1"
        );

        localStorage.setItem(
            getTimeKey(key),
            String(Date.now())
        );

    } catch (error) {

        console.warn(
            "Unable to mark dirty:",
            key
        );

    }

}


function clearLocalDirty(key) {

    try {

        localStorage.removeItem(
            getDirtyKey(key)
        );

    } catch (error) {}

}


function isLocalDirty(key) {

    try {

        return (
            localStorage.getItem(
                getDirtyKey(key)
            ) === "1"
        );

    } catch (error) {

        return false;

    }

}


// ============================================================
// OFFLINE QUEUE
// ============================================================

window.offlineSyncQueue =
    window.offlineSyncQueue || {};


function queueOfflineData(
    key,
    data
) {

    try {

        window.offlineSyncQueue[key] =
            data;

        localStorage.setItem(

            "__texfriend_offline_queue__",

            JSON.stringify(
                window.offlineSyncQueue
            )

        );

    } catch (error) {

        console.error(
            "Offline Queue Error:",
            error
        );

    }

}


function loadOfflineQueue() {

    try {

        const raw =
            localStorage.getItem(
                "__texfriend_offline_queue__"
            );

        if (!raw) {

            window.offlineSyncQueue = {};

            return;

        }

        window.offlineSyncQueue =
            JSON.parse(raw) || {};

    } catch (error) {

        window.offlineSyncQueue = {};

    }

}


function removeQueueItem(key) {

    try {

        delete window.offlineSyncQueue[key];

        localStorage.setItem(

            "__texfriend_offline_queue__",

            JSON.stringify(
                window.offlineSyncQueue
            )

        );

    } catch (error) {}

}


loadOfflineQueue();


// ============================================================
// SAFE JSON
// ============================================================

function safeJSONParse(
    value,
    fallback = null
) {

    try {

        return JSON.parse(value);

    } catch (error) {

        return fallback;

    }

}


// ============================================================
// NOTIFICATION
// ============================================================

window.showNotification = function (

    message,

    type = "success"

) {

    try {

        const oldNotif =
            document.getElementById(
                "erp-custom-notification"
            );

        if (oldNotif) {

            oldNotif.remove();

        }

        if (!document.body) {

            console.log(
                "Notification:",
                message
            );

            return;

        }

        const notification =
            document.createElement("div");

        notification.id =
            "erp-custom-notification";

        notification.innerText =
            message;

        notification.style.position =
            "fixed";

        notification.style.bottom =
            "24px";

        notification.style.left =
            "50%";

        notification.style.transform =
            "translateX(-50%)";

        notification.style.zIndex =
            "999999";

        notification.style.padding =
            "12px 20px";

        notification.style.borderRadius =
            "12px";

        notification.style.color =
            "#FFFFFF";

        notification.style.fontFamily =
            "sans-serif";

        notification.style.fontSize =
            "14px";

        notification.style.fontWeight =
            "700";

        notification.style.textAlign =
            "center";

        notification.style.boxShadow =
            "0 6px 25px rgba(0,0,0,0.35)";

        notification.style.maxWidth =
            "calc(100% - 30px)";

        notification.style.background =

            type === "success"

                ? "#10B981"

                : type === "warning"

                    ? "#F59E0B"

                    : "#EF4444";


        document.body.appendChild(
            notification
        );


        setTimeout(
            function () {

                if (
                    notification &&
                    notification.parentNode
                ) {

                    notification.style.opacity =
                        "0";

                    notification.style.transition =
                        "opacity 0.3s ease";


                    setTimeout(
                        function () {

                            if (
                                notification &&
                                notification.parentNode
                            ) {

                                notification.remove();

                            }

                        },
                        300
                    );

                }

            },
            2200
        );


    } catch (error) {

        console.log(
            "Notification:",
            message
        );

    }

};


// ============================================================
// NETWORK STATUS
// ============================================================

function updateNetworkStatus() {

    if (!document.body) {
        return;
    }

    const old =
        document.getElementById(
            "texfriend-network-status"
        );

    if (old) {
        old.remove();
    }

    const bar =
        document.createElement("div");

    bar.id =
        "texfriend-network-status";


    // ========================================================
    // FIREBASE CLOUD CONNECTED
    // ========================================================

    if (window.firebaseConnected === true) {

        bar.innerHTML =
            "🟢 ONLINE — Firebase Cloud Connected";

        bar.style.background =
            "#10B981";

        bar.style.color =
            "#FFFFFF";


    // ========================================================
    // INTERNET AVAILABLE — FIREBASE CONNECTING
    // ========================================================

    } else if (navigator.onLine === true) {

        bar.innerHTML =
            "🌐 ONLINE — Firebase Connecting...";

        bar.style.background =
            "#3B82F6";

        bar.style.color =
            "#FFFFFF";


    // ========================================================
    // OFFLINE
    // ========================================================

    } else {

        bar.innerHTML =
            "📴 OFFLINE — Local Data Saved";

        bar.style.background =
            "#F59E0B";

        bar.style.color =
            "#111827";
    }


    // ========================================================
    // BAR STYLE
    // ========================================================

    bar.style.position =
        "fixed";

    bar.style.left =
        "0";

    bar.style.right =
        "0";

    bar.style.bottom =
        "0";

    bar.style.padding =
        "7px";

    bar.style.textAlign =
        "center";

    bar.style.fontFamily =
        "sans-serif";

    bar.style.fontSize =
        "12px";

    bar.style.fontWeight =
        "700";

    bar.style.zIndex =
        "999998";


    document.body.appendChild(
        bar
    );


    // ========================================================
    // AUTO HIDE
    // ========================================================

    setTimeout(
        function () {

            if (
                bar &&
                bar.parentNode
            ) {

                bar.remove();

            }

        },
        3000
    );

}

window.addEventListener(
    "online",
    function () {

        updateNetworkStatus();

        setTimeout(
            function () {

                syncOfflineQueue();

            },
            800
        );

    }
);


window.addEventListener(
    "offline",
    function () {

        window.firebaseConnected =
            false;

        updateNetworkStatus();

    }
);


// ============================================================
// LOAD FIREBASE COMPAT SDK
// ============================================================

function loadScript(src) {

    return new Promise(
        function (resolve, reject) {

            const existing =
                document.querySelector(
                    'script[src="' +
                    src +
                    '"]'
                );


            if (existing) {

                resolve();

                return;

            }


            const script =
                document.createElement(
                    "script"
                );


            script.src =
                src;

            script.async =
                true;


            script.onload =
                function () {

                    resolve();

                };


            script.onerror =
                function () {

                    reject(
                        new Error(
                            "Firebase SDK failed to load"
                        )
                    );

                };


            document.head.appendChild(
                script
            );

        }
    );

}


// ============================================================
// FIREBASE INITIALIZE
// ============================================================

window.initializeFirebase =
    async function () {

        if (
            window.firebaseInitStarted &&
            window.cloudSyncPromise
        ) {

            return window.cloudSyncPromise;

        }


        window.firebaseInitStarted =
            true;

        window.firebaseInitializing =
            true;


        window.cloudSyncPromise =
            (async function () {

                try {

                    // ----------------------------------------
                    // Firebase App
                    // ----------------------------------------

                    await loadScript(
                        "https://www.gstatic.com/firebasejs/12.17.1/firebase-app-compat.js"
                    );


                    // ----------------------------------------
                    // Firebase RTDB
                    // ----------------------------------------

                    await loadScript(
                        "https://www.gstatic.com/firebasejs/12.17.1/firebase-database-compat.js"
                    );


                    if (
                        typeof firebase ===
                        "undefined"
                    ) {

                        throw new Error(
                            "Firebase SDK unavailable"
                        );

                    }


                    // ----------------------------------------
                    // Initialize App
                    // ----------------------------------------

                    if (
                        firebase.apps &&
                        firebase.apps.length
                    ) {

                        window._firebaseApp =
                            firebase.app();

                    } else {

                        window._firebaseApp =
                            firebase.initializeApp(
                                window.TEXFRIEND_FIREBASE_CONFIG
                            );

                    }


                    // ----------------------------------------
                    // RTDB
                    // ----------------------------------------

                    window.db =
                        firebase.database();


                    // ----------------------------------------
                    // Firebase connection monitor
                    // ----------------------------------------

                    const connectedRef =
                        window.db.ref(
                            ".info/connected"
                        );


                    connectedRef.on(
                        "value",
                        function (snapshot) {

                            window.firebaseConnected =
                                snapshot.val() === true;


                            window.cloudSyncReady =
                                window.firebaseConnected;


                            console.log(

                                window.firebaseConnected

                                    ? "☁️ Firebase RTDB Connected"

                                    : "📴 Firebase RTDB Offline"

                            );

                        }
                    );


                    window.firebaseInitializing =
                        false;


                    // ----------------------------------------
                    // Initial Cloud Sync
                    // ----------------------------------------

                    if (
                        navigator.onLine
                    ) {

                        await syncAllCloudData();

                        await syncOfflineQueue();

                    }


                    console.log(
                        "✅ TEXFRIEND Firebase RTDB initialized"
                    );


                    return true;


                } catch (error) {

                    console.error(
                        "❌ Firebase initialization failed:",
                        error
                    );


                    window.firebaseConnected =
                        false;

                    window.cloudSyncReady =
                        false;

                    window.firebaseInitializing =
                        false;


                    return false;

                }

            })();


        return window.cloudSyncPromise;

    };


// ============================================================
// CLOUD PATH
// ============================================================

function cloudPath(key) {

    return (

        window.TEXFRIEND_CLOUD_ROOT +
        "/" +
        String(key)
            .replace(/\./g, "_")

    );

}


// ============================================================
// CLOUD SAVE DIRECT
// ============================================================

async function cloudSave(
    key,
    data
) {

    if (
        !window.db
    ) {

        return false;

    }


    if (
        !navigator.onLine
    ) {

        return false;

    }


    try {

        const ref =
            window.db.ref(
                cloudPath(key)
            );


        await ref.set(
            data
        );


        clearLocalDirty(key);

        removeQueueItem(key);


        console.log(
            "☁️ Cloud Saved:",
            key
        );


        return true;


    } catch (error) {

        console.error(
            "Cloud Save Error:",
            key,
            error
        );


        return false;

    }

}


// ============================================================
// CLOUD LOAD DIRECT
// ============================================================

async function cloudLoad(
    key,
    fallback = null
) {

    if (
        !window.db
    ) {

        return fallback;

    }


    try {

        const snapshot =
            await window.db
                .ref(
                    cloudPath(key)
                )
                .once("value");


        if (
            snapshot.exists()
        ) {

            return snapshot.val();

        }


        return fallback;


    } catch (error) {

        console.error(
            "Cloud Load Error:",
            key,
            error
        );


        return fallback;

    }

}


// ============================================================
// MAIN SAVE FUNCTION
// ============================================================

window.firebaseSave =
    async function (
        key,
        data
    ) {

        try {

            // --------------------------------------------
            // ALWAYS SAVE LOCAL FIRST
            // --------------------------------------------

            const localSaved =
                window.localSave(
                    key,
                    data
                );


            if (!localSaved) {

                window.showNotification(
                    "❌ Local Save Failed",
                    "error"
                );

                return false;

            }


            // --------------------------------------------
            // MARK LOCAL CHANGE
            // --------------------------------------------

            markLocalDirty(key);


            // --------------------------------------------
            // QUEUE
            // --------------------------------------------

            queueOfflineData(
                key,
                data
            );


            // --------------------------------------------
            // TRY FIREBASE
            // --------------------------------------------

            if (
                navigator.onLine
            ) {

                if (
                    !window.db
                ) {

                    await initializeFirebase();

                }


                if (
                    window.db &&
                    window.firebaseConnected
                ) {

                    const cloudSaved =
                        await cloudSave(
                            key,
                            data
                        );


                    if (cloudSaved) {

                        window.showNotification(
                            "☁️ Cloud Saved ✓",
                            "success"
                        );


                        return true;

                    }

                }

            }


            // --------------------------------------------
            // OFFLINE / CLOUD UNAVAILABLE
            // --------------------------------------------

            window.showNotification(
                "💾 Saved Locally — Cloud Pending",
                "warning"
            );


            return true;


        } catch (error) {

            console.error(
                "firebaseSave Error:",
                error
            );


            // Emergency local save

            try {

                window.localSave(
                    key,
                    data
                );

                markLocalDirty(key);

                queueOfflineData(
                    key,
                    data
                );

            } catch (e) {}


            window.showNotification(
                "💾 Local Save — Cloud Pending",
                "warning"
            );


            return true;

        }

    };


// ============================================================
// COMPATIBILITY SAVE
// ============================================================

window.firebaseSaveIndividual =
    function (
        key,
        data,
        storageType = "both"
    ) {

        return window.firebaseSave(
            key,
            data
        );

    };


// ============================================================
// MAIN LOAD FUNCTION
// ============================================================

window.firebaseLoad =
    function (
        key,
        fallback = null
    ) {

        // --------------------------------------------
        // Local first
        // --------------------------------------------

        const localData =
            window.localLoad(
                key,
                null
            );


        if (
            localData !== null &&
            localData !== undefined
        ) {

            return localData;

        }


        return fallback;

    };


// ============================================================
// CLOUD LOAD + LOCAL CACHE
// ============================================================

window.firebaseLoadCloud =
    async function (
        key,
        fallback = null
    ) {

        try {

            if (
                !window.db
            ) {

                await initializeFirebase();

            }


            if (
                window.db &&
                navigator.onLine
            ) {

                const data =
                    await cloudLoad(
                        key,
                        null
                    );


                if (
                    data !== null &&
                    data !== undefined
                ) {

                    window.localSave(
                        key,
                        data
                    );


                    return data;

                }

            }

        } catch (error) {

            console.warn(
                "Cloud load fallback:",
                error
            );

        }


        return window.localLoad(
            key,
            fallback
        );

    };


// ============================================================
// SYNC ONE LOCAL KEY TO CLOUD
// ============================================================

async function syncOneKey(
    key
) {

    if (
        !window.db ||
        !navigator.onLine
    ) {

        return false;

    }


    const data =
        window.localLoad(
            key,
            null
        );


    if (
        data === null
    ) {

        return false;

    }


    return await cloudSave(
        key,
        data
    );

}


// ============================================================
// OFFLINE QUEUE SYNC
// ============================================================

window.syncOfflineQueue =
    async function () {

        if (
            !navigator.onLine
        ) {

            return false;

        }


        if (
            !window.db
        ) {

            await initializeFirebase();

        }


        if (
            !window.db
        ) {

            return false;

        }


        const queue =
            Object.assign(
                {},
                window.offlineSyncQueue
            );


        const keys =
            Object.keys(queue);


        if (
            keys.length === 0
        ) {

            return true;

        }


        let successCount =
            0;


        for (
            const key of keys
        ) {

            try {

                const saved =
                    await cloudSave(
                        key,
                        queue[key]
                    );


                if (saved) {

                    successCount++;

                }

            } catch (error) {

                console.error(
                    "Queue sync error:",
                    key,
                    error
                );

            }

        }


        if (
            successCount > 0
        ) {

            console.log(
                "☁️ Queue synced:",
                successCount
            );

        }


        return (
            successCount ===
            keys.length
        );

    };


// ============================================================
// INITIAL CLOUD → LOCAL SYNC
// ============================================================
//
// IMPORTANT:
// If this device has unsynced local changes,
// local dirty data is NOT overwritten.
// ============================================================

async function syncAllCloudData() {

    if (
        !window.db ||
        !navigator.onLine
    ) {

        return false;

    }


    let synced =
        0;


    for (
        const key of window.erpCloudKeys
    ) {

        try {

            // ----------------------------------------
            // Don't overwrite unsynced local changes
            // ----------------------------------------

            if (
                isLocalDirty(key)
            ) {

                continue;

            }


            const cloudData =
                await cloudLoad(
                    key,
                    null
                );


            if (
                cloudData !== null &&
                cloudData !== undefined
            ) {

                window.localSave(
                    key,
                    cloudData
                );


                synced++;

            }

        } catch (error) {

            console.warn(
                "Initial sync failed:",
                key,
                error
            );

        }

    }


    console.log(
        "☁️ Cloud → Local synced:",
        synced
    );


    return true;

}


// ============================================================
// FULL LOCAL → CLOUD SYNC
// ============================================================

window.syncERPToCloud =
    async function () {

        if (
            !navigator.onLine
        ) {

            return false;

        }


        if (
            !window.db
        ) {

            await initializeFirebase();

        }


        if (
            !window.db
        ) {

            return false;

        }


        let count =
            0;


        for (
            const key of window.erpCloudKeys
        ) {

            try {

                if (
                    isLocalDirty(key)
                ) {

                    const result =
                        await syncOneKey(
                            key
                        );


                    if (result) {

                        count++;

                    }

                }

            } catch (error) {

                console.warn(
                    "Sync error:",
                    key,
                    error
                );

            }

        }


        await syncOfflineQueue();


        console.log(
            "☁️ Local → Cloud completed:",
            count
        );


        return true;

    };


// ============================================================
// OLD FUNCTION COMPATIBILITY
// ============================================================

window.syncERPFromCloud =
    async function () {

        if (
            !navigator.onLine
        ) {

            return false;

        }


        if (
            !window.db
        ) {

            await initializeFirebase();

        }


        if (
            !window.db
        ) {

            return false;

        }


        return await syncAllCloudData();

    };


// ============================================================
// WAIT FOR CLOUD
// ============================================================

window.waitForCloudSync =
    async function (
        timeout = 15000
    ) {

        if (
            window.cloudSyncReady
        ) {

            return true;

        }


        if (
            !navigator.onLine
        ) {

            return false;

        }


        try {

            await Promise.race([

                initializeFirebase(),

                new Promise(
                    function (
                        resolve
                    ) {

                        setTimeout(
                            resolve,
                            timeout
                        );

                    }
                )

            ]);


            return (
                window.cloudSyncReady ||
                !!window.db
            );

        } catch (error) {

            return false;

        }

    };


// ============================================================
// FACTORY RESET
// ============================================================

window.factoryResetCloud =
    async function () {

        const confirmed =
            window.confirm(

                "⚠️ FACTORY RESET\n\n" +

                "இந்த device-ல் உள்ள TEXFRIEND ERP data அனைத்தும் அழிக்கப்படும்.\n\n" +

                "Continue செய்ய OK அழுத்தவும்."

            );


        if (!confirmed) {

            return;

        }


        const finalConfirm =
            window.confirm(

                "🚨 FINAL CONFIRMATION 🚨\n\n" +

                "OK = DELETE ALL LOCAL ERP DATA\n\n" +

                "Cancel = KEEP DATA"

            );


        if (!finalConfirm) {

            return;

        }


        try {

            // ----------------------------------------
            // Delete Cloud ERP data
            // ----------------------------------------

            if (
                navigator.onLine
            ) {

                if (
                    !window.db
                ) {

                    await initializeFirebase();

                }


                if (
                    window.db
                ) {

                    await window.db
                        .ref(
                            window.TEXFRIEND_CLOUD_ROOT
                        )
                        .remove();

                }

            }


            localStorage.clear();

            sessionStorage.clear();


            window.offlineSyncQueue =
                {};


            alert(
                "✅ Local + Cloud ERP Data Cleared!"
            );


            window.location.href =
                "index.html";


        } catch (error) {

            console.error(
                "Factory Reset Error:",
                error
            );


            alert(
                "❌ Factory Reset Failed: " +
                error.message
            );

        }

    };


window.handleCloudReset =
    window.factoryResetCloud;


// ============================================================
// CLEAR LOCAL CACHE
// ============================================================

window.clearLocalCache =
    function () {

        const confirmed =
            window.confirm(

                "🧹 CLEAR LOCAL CACHE\n\n" +

                "Local ERP data மட்டும் இந்த device-ல் இருந்து அழிக்கப்படும்.\n\n" +

                "Firebase Cloud data அழிக்கப்படாது.\n\n" +

                "Continue செய்ய OK அழுத்தவும்."

            );


        if (!confirmed) {

            return;

        }


        try {

            localStorage.clear();

            sessionStorage.clear();


            window.offlineSyncQueue =
                {};


            alert(
                "✅ Local Cache Cleared!"
            );


            window.location.reload();


        } catch (error) {

            alert(
                "❌ Clear Cache Error: " +
                error.message
            );

        }

    };


window.handleLocalReset =
    window.clearLocalCache;


// ============================================================
// CROSS PAGE DATA
// ============================================================

window.getCrossPageData =
    function (
        designNo,
        recordKey
    ) {

        const cleanTarget =
            designNo

                ? String(designNo)
                    .replace("#", "")
                    .trim()
                    .toLowerCase()

                : "";


        if (!cleanTarget) {

            return null;

        }


        try {

            const records =
                window.localLoad(
                    recordKey,
                    []
                );


            if (
                Array.isArray(records)
            ) {

                const match =
                    records
                        .slice()
                        .reverse()
                        .find(
                            function (r) {

                                if (
                                    !r ||
                                    typeof r !==
                                    "object"
                                ) {

                                    return false;

                                }


                                const d =

                                    r.designNo ||

                                    r.designNumber ||

                                    r.design ||

                                    r.name ||

                                    "";


                                return (

                                    String(d)

                                        .replace(
                                            "#",
                                            ""
                                        )

                                        .trim()

                                        .toLowerCase()

                                    ===

                                    cleanTarget

                                );

                            }
                        );


                if (match) {

                    return match;

                }

            }


            const specs =
                window.localLoad(
                    "design_specs",
                    {}
                );


            if (
                specs &&
                typeof specs === "object"
            ) {

                const key =
                    Object.keys(specs)
                        .find(
                            function (k) {

                                return (

                                    String(k)

                                        .replace(
                                            "#",
                                            ""
                                        )

                                        .trim()

                                        .toLowerCase()

                                    ===

                                    cleanTarget

                                );

                            }
                        );


                if (
                    key &&
                    specs[key]
                ) {

                    return specs[key];

                }

            }


        } catch (error) {

            console.error(
                "getCrossPageData Error:",
                error
            );

        }


        return null;

    };


// ============================================================
// DROPDOWN BUILDER
// ============================================================

window.populateDropdowns =
    function () {

        try {

            const designSpecs =
                window.localLoad(
                    "design_specs",
                    {}
                );


            let preDesignList =

                window.localLoad(
                    "pre_design_numbers",
                    null
                ) ||

                window.localLoad(
                    "tex_master_designs",
                    []
                );


            if (
                !Array.isArray(
                    preDesignList
                )
            ) {

                preDesignList = [];

            }


            const cleaned =
                preDesignList

                    .map(
                        function (d) {

                            return (

                                typeof d ===
                                "object" &&
                                d !== null

                            )

                                ? (

                                    d.designNo ||

                                    d.designNumber ||

                                    ""

                                )

                                : d;

                        }
                    )

                    .filter(
                        Boolean
                    );


            cleaned.forEach(
                function (name) {

                    const clean =
                        String(name)

                            .replace(
                                "#",
                                ""
                            )

                            .trim()
                            .toLowerCase();


                    const exists =
                        Object.keys(
                            designSpecs
                        ).some(
                            function (k) {

                                return (

                                    String(k)

                                        .replace(
                                            "#",
                                            ""
                                        )

                                        .trim()
                                        .toLowerCase()

                                    ===
                                    clean

                                );

                            }
                        );


                    if (!exists) {

                        designSpecs[name] = {

                            designNumber:
                                name,

                            status:
                                "running"

                        };

                    }

                }
            );


            const combined =
                Array.from(

                    new Set(

                        [
                            ...cleaned,

                            ...Object.keys(
                                designSpecs
                            )
                        ]

                    )

                );


            localStorage.setItem(

                "design_specs",

                JSON.stringify(
                    designSpecs
                )

            );


            localStorage.setItem(

                "pre_design_numbers",

                JSON.stringify(
                    combined
                )

            );


            document
                .querySelectorAll(
                    "select"
                )
                .forEach(
                    function (select) {

                        const id =

                            (

                                String(
                                    select.id ||
                                    ""
                                ) +

                                " " +

                                String(
                                    select.className ||
                                    ""
                                )

                            ).toLowerCase();


                        if (

                            id.includes(
                                "design"
                            ) ||

                            select.id ===
                                "designNumber" ||

                            select.id ===
                                "designSelect" ||

                            select.classList.contains(
                                "item-design"
                            )

                        ) {

                            const current =
                                select.value;


                            select.innerHTML =
                                '<option value="">Select Design No</option>';


                            combined.forEach(
                                function (name) {

                                    const opt =
                                        document.createElement(
                                            "option"
                                        );


                                    opt.value =
                                        name;


                                    opt.textContent =
                                        name;


                                    select.appendChild(
                                        opt
                                    );

                                }
                            );


                            if (current) {

                                select.value =
                                    current;

                            }

                        }

                    }
                );


        } catch (error) {

            console.error(
                "Dropdown Populate Error:",
                error
            );

        }

    };


// ============================================================
// ENTER KEY NAVIGATION
// ============================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !== "Enter"
        ) {

            return;

        }


        const activeElement =
            document.activeElement;


        if (!activeElement) {

            return;

        }


        if (
            activeElement.tagName ===
            "TEXTAREA"
        ) {

            return;

        }


        if (

            activeElement.classList.contains(
                "edit-btn"
            ) ||

            activeElement.classList.contains(
                "delete-btn"
            ) ||

            activeElement.id ===
                "editBtn" ||

            activeElement.id ===
                "deleteBtn"

        ) {

            return;

        }


        const focusableElements =
            Array.from(

                document.querySelectorAll(

                    'input:not([type="hidden"]):not([disabled]),' +

                    'select:not([disabled]),' +

                    'textarea:not([disabled]),' +

                    'button:not([disabled]),' +

                    '[tabindex]:not([tabindex="-1"])'

                )

            ).filter(
                function (el) {

                    return (

                        el.offsetParent !==
                            null &&

                        !el.classList.contains(
                            "edit-btn"
                        ) &&

                        !el.classList.contains(
                            "delete-btn"
                        )

                    );

                }
            );


        const currentIndex =
            focusableElements.indexOf(
                activeElement
            );


        if (

            currentIndex > -1 &&

            currentIndex <
                focusableElements.length - 1

        ) {

            event.preventDefault();


            const next =
                focusableElements[
                    currentIndex + 1
                ];


            if (!next) {

                return;

            }


            next.focus();


            if (

                next.tagName ===
                    "INPUT" &&

                next.type ===
                    "text"

            ) {

                next.select();

            }

        }

    }
);


// ============================================================
// DOM READY
// ============================================================

window.addEventListener(
    "DOMContentLoaded",
    function () {

        try {

            window.populateDropdowns();

        } catch (error) {

            console.warn(
                "Dropdown init error:",
                error
            );

        }


        updateNetworkStatus();


        // Firebase initialization

        setTimeout(
            function () {

                initializeFirebase();

            },
            300
        );

    }
);


// ============================================================
// GLOBAL THEME ENGINE
// ============================================================

(function () {

    function applyGlobalTheme() {

        const savedMode =
            localStorage.getItem(
                "erp_theme_mode"
            ) || "dark";


        const old =
            document.getElementById(
                "global-perfect-theme"
            );


        if (old) {

            old.remove();

        }


        let css = `

        html,
        body {

            min-height: 100% !important;

            margin: 0 !important;

            transition:
                background 0.3s ease,
                color 0.3s ease;

        }


        .container,
        .main-card,
        .form-container,
        .card {

            width: 96% !important;

            max-width: 1100px !important;

            margin-left: auto !important;

            margin-right: auto !important;

        }

        `;


        if (
            savedMode === "dark"
        ) {

            css += `

            html,
            body {

                background:
                    #030712 !important;

                color:
                    #F8FAFC !important;

            }


            .top-header-container,
            .container,
            .main-card,
            .form-container,
            .card {

                background:
                    #0F172A !important;

                color:
                    #F8FAFC !important;

                border-color:
                    #38BDF8 !important;

            }


            .stats-banner,
            .stat-box {

                background:
                    #111827 !important;

                color:
                    #F8FAFC !important;

                border-color:
                    #38BDF8 !important;

            }


            .stat-value,
            .live-clock {

                color:
                    #38BDF8 !important;

            }


            .menu-btn {

                border-color:
                    #38BDF8 !important;

            }


            input,
            select,
            textarea {

                background:
                    #FFFFFF !important;

                color:
                    #111827 !important;

                border-color:
                    #CBD5E1 !important;

            }

            `;


        } else if (
            savedMode === "softgreen"
        ) {

            css += `

            html,
            body {

                background:
                    #ECFDF5 !important;

                color:
                    #064E3B !important;

            }


            .top-header-container,
            .container,
            .main-card,
            .form-container,
            .card {

                background:
                    #D1FAE5 !important;

                color:
                    #064E3B !important;

                border-color:
                    #10B981 !important;

            }


            .stats-banner,
            .stat-box {

                background:
                    #ECFDF5 !important;

                color:
                    #064E3B !important;

                border-color:
                    #34D399 !important;

            }


            .stat-value,
            .live-clock {

                color:
                    #059669 !important;

            }


            .menu-btn {

                border-color:
                    #34D399 !important;

            }


            input,
            select,
            textarea {

                background:
                    #FFFFFF !important;

                color:
                    #064E3B !important;

                border-color:
                    #A7F3D0 !important;

            }

            `;


        } else if (
            savedMode === "darkgreen"
        ) {

            css += `

            html,
            body {

                background:
                    #021C12 !important;

                color:
                    #ECFDF5 !important;

            }


            .top-header-container,
            .container,
            .main-card,
            .form-container,
            .card {

                background:
                    #063B27 !important;

                color:
                    #ECFDF5 !important;

                border-color:
                    #22C55E !important;

            }


            .stats-banner,
            .stat-box {

                background:
                    #075E45 !important;

                color:
                    #ECFDF5 !important;

                border-color:
                    #22C55E !important;

            }


            .stat-value,
            .live-clock {

                color:
                    #4ADE80 !important;

            }


            .menu-btn {

                border-color:
                    #22C55E !important;

            }


            input,
            select,
            textarea {

                background:
                    #FFFFFF !important;

                color:
                    #064E3B !important;

                border-color:
                    #86EFAC !important;

            }

            `;


        } else if (
            savedMode === "sunset"
        ) {

            css += `

            html,
            body {

                background:
                    #1C0F05 !important;

                color:
                    #FFF7ED !important;

            }


            .top-header-container,
            .container,
            .main-card,
            .form-container,
            .card {

                background:
                    #3B1F0B !important;

                color:
                    #FFF7ED !important;

                border-color:
                    #F59E0B !important;

            }


            .stats-banner,
            .stat-box {

                background:
                    #6B3508 !important;

                color:
                    #FFF7ED !important;

                border-color:
                    #FBBF24 !important;

            }


            .stat-value,
            .live-clock {

                color:
                    #FBBF24 !important;

            }


            .menu-btn {

                border-color:
                    #F59E0B !important;

            }


            input,
            select,
            textarea {

                background:
                    #FFFFFF !important;

                color:
                    #7C2D12 !important;

                border-color:
                    #FCD34D !important;

            }

            `;


        } else if (
            savedMode === "royalblue"
        ) {

            css += `

            html,
            body {

                background:
                    #050B2E !important;

                color:
                    #EEF2FF !important;

            }


            .top-header-container,
            .container,
            .main-card,
            .form-container,
            .card {

                background:
                    #101A4C !important;

                color:
                    #EEF2FF !important;

                border-color:
                    #6366F1 !important;

            }


            .stats-banner,
            .stat-box {

                background:
                    #1E3A8A !important;

                color:
                    #EEF2FF !important;

                border-color:
                    #818CF8 !important;

            }


            .stat-value,
            .live-clock {

                color:
                    #A5B4FC !important;

            }


            .menu-btn {

                border-color:
                    #818CF8 !important;

            }


            input,
            select,
            textarea {

                background:
                    #FFFFFF !important;

                color:
                    #172554 !important;

                border-color:
                    #A5B4FC !important;

            }

            `;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "global-perfect-theme";


        style.innerHTML =
            css;


        document.head.appendChild(
            style
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            applyGlobalTheme
        );

    } else {

        applyGlobalTheme();

    }


    window.applySystemTheme =
        applyGlobalTheme;


    window.setTheme =
        function (
            themeName
        ) {

            const validThemes = [

                "dark",
                "softgreen",
                "darkgreen",
                "sunset",
                "royalblue"

            ];


            if (
                !validThemes.includes(
                    themeName
                )
            ) {

                return;

            }


            localStorage.setItem(
                "erp_theme_mode",
                themeName
            );


            applyGlobalTheme();

        };


    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key ===
                "erp_theme_mode"
            ) {

                applyGlobalTheme();

            }

        }
    );


})();


// ============================================================
// DISPLAY / ZOOM CONTROLLER
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            document.getElementById(
                "texfriend-display-controller"
            )
        ) {

            return;

        }


        let currentZoom =
            parseFloat(

                localStorage.getItem(
                    "texfriend_zoom_level"
                )

            ) || 1.0;


        function applyZoom(val) {

            document.body.style.zoom =
                val;


            if (

                navigator.userAgent
                    .toLowerCase()
                    .indexOf(
                        "firefox"
                    ) > -1

            ) {

                document.body.style.transform =
                    `scale(${val})`;

                document.body.style
                    .transformOrigin =
                    "top left";

                document.body.style.width =
                    `${100 / val}%`;

            }


            localStorage.setItem(
                "texfriend_zoom_level",
                val
            );

        }


        applyZoom(
            currentZoom
        );


        let savedTop =
            localStorage.getItem(
                "texfriend_zoom_top"
            ) ||
            "15px";


        let savedLeft =
            localStorage.getItem(
                "texfriend_zoom_left"
            ) ||
            (
                window.innerWidth - 65
            ) +
            "px";


        const controllerDiv =
            document.createElement(
                "div"
            );


        controllerDiv.id =
            "texfriend-display-controller";


        controllerDiv.style.position =
            "fixed";

        controllerDiv.style.top =
            savedTop;

        controllerDiv.style.left =
            savedLeft;

        controllerDiv.style.zIndex =
            "999999";


        controllerDiv.innerHTML = `

        <div

            id="btnToggleZoom"

            style="

            touch-action:none;
            user-select:none;
            -webkit-user-select:none;

            background:
                linear-gradient(
                    135deg,
                    #059669,
                    #10B981
                );

            color:white;

            width:45px;
            height:45px;

            border-radius:50%;

            font-size:20px;

            cursor:pointer;

            box-shadow:
                0 6px 18px
                rgba(16,185,129,0.4);

            display:flex;

            align-items:center;

            justify-content:center;

            "

        >

            🔍

        </div>


        <div

            id="zoomAppPanel"

            style="

            display:none;

            flex-direction:column;

            gap:10px;

            background:
                rgba(18,30,25,0.95);

            backdrop-filter:
                blur(8px);

            border:
                1px solid #4A7C59;

            padding:12px;

            border-radius:12px;

            box-shadow:
                0 10px 40px
                rgba(0,0,0,0.6);

            color:white;

            width:150px;

            position:absolute;

            top:55px;

            right:0;

            "

        >

            <div
                style="
                font-size:10px;
                font-weight:800;
                text-align:center;
                color:#78d18a;
                "
            >
                SCREEN SIZE
            </div>


            <div
                style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                background:#080f0c;
                border-radius:8px;
                padding:5px;
                "
            >

                <div
                    id="btnZoomOut"
                    style="
                    color:#EF4444;
                    font-size:22px;
                    cursor:pointer;
                    width:30px;
                    height:30px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-weight:bold;
                    user-select:none;
                    "
                >
                    -
                </div>


                <span
                    id="zoomLabel"
                    style="
                    font-size:13px;
                    font-weight:bold;
                    "
                >
                    ${Math.round(
                        currentZoom * 100
                    )}%
                </span>


                <div
                    id="btnZoomIn"
                    style="
                    color:#10B981;
                    font-size:20px;
                    cursor:pointer;
                    width:30px;
                    height:30px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-weight:bold;
                    user-select:none;
                    "
                >
                    +
                </div>

            </div>


            <div
                id="btnFitScreen"
                style="
                background:#3B82F6;
                color:white;
                padding:8px;
                border-radius:6px;
                font-size:11px;
                font-weight:bold;
                text-align:center;
                cursor:pointer;
                user-select:none;
                "
            >
                Fit to Screen
            </div>

        </div>

        `;


        document.body.appendChild(
            controllerDiv
        );


        const btnToggle =
            document.getElementById(
                "btnToggleZoom"
            );


        const panel =
            document.getElementById(
                "zoomAppPanel"
            );


        let isPanelOpen =
            false;


        let didMove =
            false;


        let startX,
            startY,
            initialX,
            initialY;


        btnToggle.addEventListener(
            "touchstart",
            function (e) {

                startX =
                    e.touches[0].clientX;

                startY =
                    e.touches[0].clientY;

                initialX =
                    controllerDiv.offsetLeft;

                initialY =
                    controllerDiv.offsetTop;

                didMove =
                    false;

            },
            {
                passive: true
            }
        );


        btnToggle.addEventListener(
            "touchmove",
            function (e) {

                const dx =
                    e.touches[0].clientX -
                    startX;

                const dy =
                    e.touches[0].clientY -
                    startY;


                if (

                    Math.abs(dx) > 5 ||
                    Math.abs(dy) > 5

                ) {

                    didMove =
                        true;

                    controllerDiv.style.left =
                        (
                            initialX + dx
                        ) +
                        "px";

                    controllerDiv.style.top =
                        (
                            initialY + dy
                        ) +
                        "px";

                    controllerDiv.style.right =
                        "auto";

                    e.preventDefault();

                }

            },
            {
                passive: false
            }
        );


        btnToggle.addEventListener(
            "touchend",
            function () {

                if (didMove) {

                    localStorage.setItem(
                        "texfriend_zoom_top",
                        controllerDiv.style.top
                    );

                    localStorage.setItem(
                        "texfriend_zoom_left",
                        controllerDiv.style.left
                    );

                }

            }
        );


        btnToggle.addEventListener(
            "mousedown",
            function (e) {

                startX =
                    e.clientX;

                startY =
                    e.clientY;

                initialX =
                    controllerDiv.offsetLeft;

                initialY =
                    controllerDiv.offsetTop;

                didMove =
                    false;


                function onMouseMove(me) {

                    const dx =
                        me.clientX -
                        startX;

                    const dy =
                        me.clientY -
                        startY;


                    if (

                        Math.abs(dx) > 5 ||
                        Math.abs(dy) > 5

                    ) {

                        didMove =
                            true;

                        controllerDiv.style.left =
                            (
                                initialX + dx
                            ) +
                            "px";

                        controllerDiv.style.top =
                            (
                                initialY + dy
                            ) +
                            "px";

                        controllerDiv.style.right =
                            "auto";

                    }

                }


                function onMouseUp() {

                    if (didMove) {

                        localStorage.setItem(
                            "texfriend_zoom_top",
                            controllerDiv.style.top
                        );

                        localStorage.setItem(
                            "texfriend_zoom_left",
                            controllerDiv.style.left
                        );

                    }


                    document.removeEventListener(
                        "mousemove",
                        onMouseMove
                    );

                    document.removeEventListener(
                        "mouseup",
                        onMouseUp
                    );

                }


                document.addEventListener(
                    "mousemove",
                    onMouseMove
                );

                document.addEventListener(
                    "mouseup",
                    onMouseUp
                );

            }
        );


        btnToggle.addEventListener(
            "click",
            function () {

                if (didMove) {

                    didMove =
                        false;

                    return;

                }


                isPanelOpen =
                    !isPanelOpen;


                panel.style.display =
                    isPanelOpen
                        ? "flex"
                        : "none";


                btnToggle.innerHTML =
                    isPanelOpen
                        ? "✖"
                        : "🔍";

            }
        );


        document.getElementById(
            "btnZoomIn"
        ).onclick =
            function () {

                if (
                    currentZoom < 2.0
                ) {

                    currentZoom =
                        Math.min(
                            2.0,
                            currentZoom + 0.05
                        );

                    applyZoom(
                        currentZoom
                    );

                    updateZoomLabel();

                }

            };


        document.getElementById(
            "btnZoomOut"
        ).onclick =
            function () {

                if (
                    currentZoom > 0.4
                ) {

                    currentZoom =
                        Math.max(
                            0.4,
                            currentZoom - 0.05
                        );

                    applyZoom(
                        currentZoom
                    );

                    updateZoomLabel();

                }

            };


        document.getElementById(
            "btnFitScreen"
        ).onclick =
            function () {

                currentZoom =
                    1.0;

                applyZoom(
                    currentZoom
                );

                updateZoomLabel();

            };


        function updateZoomLabel() {

            const label =
                document.getElementById(
                    "zoomLabel"
                );


            if (label) {

                label.innerText =
                    Math.round(
                        currentZoom * 100
                    ) +
                    "%";

            }

        }

    }
);


// ============================================================
// START FIREBASE
// ============================================================

setTimeout(
    function () {

        if (
            navigator.onLine
        ) {

            initializeFirebase();

        }

    },
    500
);


// ============================================================
// FINAL STATUS
// ============================================================

console.log(
    "================================================"
);

console.log(
    "✅ TEXFRIEND config.js loaded"
);

console.log(
    "☁️ MODE: LOCAL-FIRST + FIREBASE RTDB"
);

console.log(
    "☁️ Firebase: ENABLED"
);

console.log(
    "☁️ Database: asia-southeast1"
);

console.log(
    "💾 LocalStorage: ENABLED"
);

console.log(
    "📴 Offline Queue: ENABLED"
);

console.log(
    "🔐 Firebase Auth: DISABLED"
);

console.log(
    "📦 Cloud Storage: DISABLED"
);

console.log(
    "================================================"
);