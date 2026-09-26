/* =========================================================
   SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL =
    "https://zswoqjzlmudgjbwiczgd.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_-p67JfzM9k0naK6eKsE8Jw_j8-dsJ5o";




/* =========================================================
   CREATE SUPABASE CLIENT
========================================================= */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   MAKE CLIENT AVAILABLE TO ALL PAGE SCRIPTS
========================================================= */

window.supabaseClient =
    supabaseClient;


console.log(
    "SUPABASE CLIENT INITIALIZED"
);

console.log(
    "SUPABASE CLIENT READY:",
    !!window.supabaseClient
);