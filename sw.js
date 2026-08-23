// ============================================================
// TEXFRIEND ERP
// sw.js
// PWA + OFFLINE ALL PAGES + LOCAL-FIRST + CLOUD READY
// ============================================================
//
// ✅ All ERP HTML pages pre-cached
// ✅ CSS / JS / Images runtime cached
// ✅ Offline navigation
// ✅ Online Network First
// ✅ Offline Cache Fallback
// ✅ Firebase / Google API NOT cached
// ✅ Old TEXFRIEND caches cleaned
// ✅ Service Worker update support
// ============================================================

"use strict";


// ============================================================
// VERSION
// ============================================================

const CACHE_VERSION = "v4";

const CACHE_NAME =
    "texfriend-erp-" + CACHE_VERSION;

const APP_SHELL_CACHE =
    "texfriend-shell-" + CACHE_VERSION;


// ============================================================
// ALL ERP FILES
// ============================================================
//
// File names must exactly match the files in Vercel.
// ============================================================

const APP_SHELL = [

    "./",
    "./index.html",

    // -------------------------
    // CORE
    // -------------------------

    "./config.js",
    "./translator.js",
    "./manifest.json",
    "./style.css",

    // -------------------------
    // ICONS
    // -------------------------

    "./icon-192.png",
    "./icon-512.png",

    // -------------------------
    // DASHBOARD
    // -------------------------

    "./dashboard.html",

    // -------------------------
    // DESIGN
    // -------------------------

    "./design_list.html",
    "./design_master.html",
    "./design_sheet_print.html",

    // -------------------------
    // ORDERS
    // -------------------------

    "./Party_Orders.html",

    // -------------------------
    // KORA / YARN
    // -------------------------

    "./kora_yarn.html",
    "./yarn_calc.html",

    // -------------------------
    // PROCESS
    // -------------------------

    "./process_matrix.html",

    // -------------------------
    // WARP / WEFT
    // -------------------------

    "./warp_entry.html",
    "./warping.html",
    "./weft_entry.html",

    // -------------------------
    // WEAVING
    // -------------------------

    "./weaving.html",
    "./weaving_received.html",
    "./weave_3d.html",

    // -------------------------
    // DYEING
    // -------------------------

    "./dyeing_issue.html",
    "./dyeing_receive.html",

    // -------------------------
    // WASHING
    // -------------------------

    "./washing.html",

    // -------------------------
    // DESPATCH
    // -------------------------

    "./Despatch.html",

    // -------------------------
    // INVOICE
    // -------------------------

    "./invoice.html",

    // -------------------------
    // REPORT
    // -------------------------

    "./report.html",

    // -------------------------
    // SETTINGS
    // -------------------------

    "./settings.html"

];


// ============================================================
// INSTALL
// ============================================================

self.addEventListener(
    "install",
    event => {

        console.log(
            "📦 TEXFRIEND ERP SW installing:",
            CACHE_NAME
        );


        event.waitUntil(

            caches.open(
                APP_SHELL_CACHE
            )

            .then(
                async cache => {

                    console.log(
                        "📥 Caching all ERP pages..."
                    );


                    /*
                     * Cache files individually.
                     *
                     * If one optional file is missing,
                     * installation should continue.
                     */

                    for (
                        const file of APP_SHELL
                    ) {

                        try {

                            const response =
                                await fetch(
                                    file,
                                    {
                                        cache:
                                            "no-cache"
                                    }
                                );


                            if (
                                response.ok
                            ) {

                                await cache.put(
                                    file,
                                    response
                                );


                                console.log(
                                    "✅ Cached:",
                                    file
                                );

                            } else {

                                console.warn(
                                    "⚠️ Not cached:",
                                    file,
                                    response.status
                                );

                            }

                        } catch (error) {

                            console.warn(
                                "⚠️ Cache failed:",
                                file,
                                error
                            );

                        }

                    }

                }
            )

            .then(
                () => {

                    console.log(
                        "✅ TEXFRIEND ERP pages cached"
                    );


                    /*
                     * Activate immediately.
                     */

                    return self.skipWaiting();

                }
            )

            .catch(
                error => {

                    console.error(
                        "❌ Service Worker install error:",
                        error
                    );

                }
            )

        );

    }
);


// ============================================================
// ACTIVATE
// ============================================================

self.addEventListener(
    "activate",
    event => {

        console.log(
            "⚡ TEXFRIEND ERP SW activated:",
            CACHE_NAME
        );


        event.waitUntil(

            caches.keys()

            .then(
                cacheNames => {

                    return Promise.all(

                        cacheNames.map(
                            cacheName => {

                                /*
                                 * Delete old TEXFRIEND
                                 * caches.
                                 */

                                if (

                                    cacheName.startsWith(
                                        "texfriend-"
                                    ) &&

                                    cacheName !==
                                        CACHE_NAME &&

                                    cacheName !==
                                        APP_SHELL_CACHE

                                ) {

                                    console.log(
                                        "🗑️ Removing old cache:",
                                        cacheName
                                    );


                                    return caches.delete(
                                        cacheName
                                    );

                                }


                                return Promise.resolve();

                            }
                        )

                    );

                }
            )

            .then(
                () => {

                    /*
                     * Control all open pages.
                     */

                    return self.clients.claim();

                }
            )

        );

    }
);


// ============================================================
// SAME ORIGIN CHECK
// ============================================================

function isSameOrigin(request) {

    try {

        return (

            new URL(
                request.url
            ).origin ===

            self.location.origin

        );

    } catch (error) {

        return false;

    }

}


// ============================================================
// CLOUD / API CHECK
// ============================================================

function isCloudRequest(request) {

    const url =
        request.url.toLowerCase();


    return (

        url.includes("/api/") ||

        url.includes(
            "firebaseio.com"
        ) ||

        url.includes(
            "firebasedatabase.app"
        ) ||

        url.includes(
            "googleapis.com"
        ) ||

        url.includes(
            "firestore.googleapis.com"
        ) ||

        url.includes(
            "supabase.co"
        )

    );

}


// ============================================================
// NAVIGATION
// ============================================================
//
// ONLINE:
// Network → Cache
//
// OFFLINE:
// Cache → index.html
// ============================================================

async function handleNavigation(
    request
) {

    try {

        /*
         * Try network first.
         */

        const networkResponse =
            await fetch(
                request
            );


        if (
            networkResponse &&
            networkResponse.ok
        ) {

            /*
             * Save latest page version.
             */

            const cache =
                await caches.open(
                    CACHE_NAME
                );


            await cache.put(
                request,
                networkResponse.clone()
            );


            return networkResponse;

        }

    } catch (error) {

        console.log(
            "📴 Network unavailable:",
            request.url
        );

    }


    /*
     * Offline fallback.
     */

    const cached =
        await caches.match(
            request
        );


    if (cached) {

        return cached;

    }


    /*
     * Try APP SHELL cache.
     */

    const shellCached =
        await caches.match(
            request,
            {
                cacheName:
                    APP_SHELL_CACHE
            }
        );


    if (shellCached) {

        return shellCached;

    }


    /*
     * Last fallback:
     * index.html
     */

    const indexPage =
        await caches.match(
            "./index.html"
        );


    if (indexPage) {

        return indexPage;

    }


    return new Response(
        "TEXFRIEND ERP is offline.",
        {
            status: 503,
            headers: {
                "Content-Type":
                    "text/plain; charset=utf-8"
            }
        }
    );

}


// ============================================================
// STATIC FILE REQUEST
// ============================================================
//
// ONLINE:
// Network → Cache
//
// OFFLINE:
// Cache
// ============================================================

async function handleStaticRequest(
    request
) {

    try {

        const networkResponse =
            await fetch(
                request
            );


        if (

            networkResponse &&

            networkResponse.status ===
                200 &&

            networkResponse.type ===
                "basic"

        ) {

            const cache =
                await caches.open(
                    CACHE_NAME
                );


            await cache.put(
                request,
                networkResponse.clone()
            );

        }


        return networkResponse;


    } catch (error) {

        console.log(
            "📴 Offline resource:",
            request.url
        );


        const cached =
            await caches.match(
                request
            );


        if (cached) {

            return cached;

        }


        return new Response(
            "TEXFRIEND ERP offline.\n\n" +
            "This resource is not cached.",
            {
                status: 503,
                headers: {
                    "Content-Type":
                        "text/plain; charset=utf-8"
                }
            }
        );

    }

}


// ============================================================
// FETCH
// ============================================================

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;


        /*
         * GET only.
         */

        if (
            request.method !== "GET"
        ) {

            return;

        }


        /*
         * HTTP / HTTPS only.
         */

        if (
            !request.url.startsWith(
                "http"
            )
        ) {

            return;

        }


        /*
         * Never intercept cloud/API.
         */

        if (
            isCloudRequest(
                request
            )
        ) {

            return;

        }


        /*
         * External domains:
         * browser handles normally.
         */

        if (
            !isSameOrigin(
                request
            )
        ) {

            return;

        }


        /*
         * HTML navigation.
         */

        if (

            request.mode ===
                "navigate" ||

            request.destination ===
                "document"

        ) {

            event.respondWith(
                handleNavigation(
                    request
                )
            );

            return;

        }


        /*
         * CSS / JS / images /
         * local assets.
         */

        event.respondWith(
            handleStaticRequest(
                request
            )
        );

    }
);


// ============================================================
// MESSAGE HANDLER
// ============================================================

self.addEventListener(
    "message",
    event => {

        if (
            !event.data
        ) {

            return;

        }


        /*
         * Force update.
         */

        if (
            event.data.type ===
            "SKIP_WAITING"
        ) {

            console.log(
                "🔄 TEXFRIEND: Force update"
            );


            self.skipWaiting();

        }


        /*
         * Clear TEXFRIEND caches.
         */

        if (
            event.data.type ===
            "CLEAR_TEXFRIEND_CACHE"
        ) {

            event.waitUntil(

                caches.keys()

                .then(
                    cacheNames => {

                        return Promise.all(

                            cacheNames

                                .filter(
                                    name =>
                                        name.startsWith(
                                            "texfriend-"
                                        )
                                )

                                .map(
                                    name =>
                                        caches.delete(
                                            name
                                        )
                                )

                        );

                    }
                )

                .then(
                    () => {

                        console.log(
                            "🧹 TEXFRIEND caches cleared"
                        );

                    }
                )

            );

        }

    }
);


// ============================================================
// ERROR
// ============================================================

self.addEventListener(
    "error",
    event => {

        console.error(
            "❌ TEXFRIEND SW Error:",
            event.error
        );

    }
);


// ============================================================
// UNHANDLED PROMISE
// ============================================================

self.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "❌ TEXFRIEND SW Promise Error:",
            event.reason
        );

    }
);


// ============================================================
// READY
// ============================================================

console.log(
    "🚀 TEXFRIEND ERP Service Worker Ready:",
    CACHE_NAME
);