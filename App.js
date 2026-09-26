/* =========================================================
   GARMENT STORE PWA
   HOME PAGE
========================================================= */


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function openPage(page) {

    if (!page) {

        console.error("No page specified.");

        return;

    }


    console.log("Opening page:", page);


    window.location.href = page;

}