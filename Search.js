/* =========================================================
   RK GARMENT PRODUCT MANAGER
   SEARCH PAGE
========================================================= */

console.log("========================================");
console.log("SEARCH.JS STARTING");
console.log("========================================");


/* =========================================================
   CONFIGURATION
========================================================= */

const PRODUCTS_TABLE = "productsImages";

const IMAGE_BUCKET = "product-images";

const IMAGE_MODEL = "Xenova/clip-vit-base-patch32";

const SIMILARITY_THRESHOLD = 0.75;

const RESULT_LIMIT = 12;


/* =========================================================
   SUPABASE
========================================================= */

/*
   IMPORTANT:
   supabase.js creates:

   window.supabaseClient

   We use a different local variable name here
   to avoid duplicate declaration errors.
*/

const db = window.supabaseClient;


/* =========================================================
   ELEMENTS
========================================================= */

const barcodeInput =
    document.getElementById("barcodeSearch");

const styleInput =
    document.getElementById("styleSearch");

const cameraInput =
    document.getElementById("cameraInput");

const galleryInput =
    document.getElementById("galleryInput");

const placeholder =
    document.getElementById("imagePlaceholder");

const selectedSearchImage =
    document.getElementById("selectedSearchImage");

const clearImageButton =
    document.getElementById("clearImageButton");

const imageSearchButton =
    document.getElementById("imageSearchButton");

const resultList =
    document.getElementById("searchResults");

const resultCount =
    document.getElementById("resultCount");

const noResults =
    document.getElementById("noResults");

const loading =
    document.getElementById("searchLoading");

const errorMessage =
    document.getElementById("searchError");


/* =========================================================
   STATE
========================================================= */

let selectedFile = null;

let imageExtractor = null;

let modelLoadingPromise = null;

let previewObjectUrl = null;


/* =========================================================
   CAMERA
========================================================= */

window.openCamera = function () {

    console.log("OPEN CAMERA");

    clearError();

    if (!cameraInput) {

        showError(
            "Camera input was not found."
        );

        return;
    }

    cameraInput.value = "";

    cameraInput.click();

};


/* =========================================================
   GALLERY
========================================================= */

window.openGallery = function () {

    console.log("OPEN GALLERY");

    clearError();

    if (!galleryInput) {

        showError(
            "Gallery input was not found."
        );

        return;
    }

    galleryInput.value = "";

    galleryInput.click();

};


/* =========================================================
   CLEAR IMAGE
========================================================= */

window.clearImage = function () {

    console.log("CLEAR IMAGE");

    selectedFile = null;


    if (cameraInput) {

        cameraInput.value = "";

    }


    if (galleryInput) {

        galleryInput.value = "";

    }


    if (previewObjectUrl) {

        URL.revokeObjectURL(
            previewObjectUrl
        );

        previewObjectUrl = null;

    }


    if (selectedSearchImage) {

        selectedSearchImage.src = "";

        selectedSearchImage.hidden = true;

    }


    if (placeholder) {

        placeholder.hidden = false;

    }


    if (clearImageButton) {

        clearImageButton.hidden = true;

    }


    if (imageSearchButton) {

        imageSearchButton.disabled = true;

    }


    clearResults();

    clearError();

};


/* =========================================================
   CLEAR BARCODE
========================================================= */

window.clearBarcode = function () {

    if (barcodeInput) {

        barcodeInput.value = "";

        barcodeInput.focus();

    }

    clearError();

};


/* =========================================================
   CLEAR STYLE
========================================================= */

window.clearStyle = function () {

    if (styleInput) {

        styleInput.value = "";

        styleInput.focus();

    }

    clearError();

};


/* =========================================================
   HOME
========================================================= */

window.goHome = function () {

    console.log("GO HOME");

    window.location.href = "index.html";

};


/* =========================================================
   IMAGE INPUT EVENTS
========================================================= */

if (cameraInput) {

    cameraInput.addEventListener(
        "change",
        handleImageSelection
    );

}


if (galleryInput) {

    galleryInput.addEventListener(
        "change",
        handleImageSelection
    );

}


/* =========================================================
   IMAGE SELECTION
========================================================= */

function handleImageSelection(event) {

    const file =
        event.target.files?.[0];


    if (!file) {

        return;

    }


    if (!file.type.startsWith("image/")) {

        showError(
            "Please select an image file."
        );

        return;

    }


    selectedFile = file;


    console.log("IMAGE SELECTED");
    console.log("Name:", file.name);
    console.log("Type:", file.type);
    console.log("Size:", file.size);


    showImagePreview(file);

    clearResults();

    clearError();

}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

function showImagePreview(file) {

    if (!selectedSearchImage) {

        return;

    }


    if (previewObjectUrl) {

        URL.revokeObjectURL(
            previewObjectUrl
        );

    }


    previewObjectUrl =
        URL.createObjectURL(file);


    selectedSearchImage.src =
        previewObjectUrl;


    selectedSearchImage.hidden =
        false;


    if (placeholder) {

        placeholder.hidden =
            true;

    }


    if (clearImageButton) {

        clearImageButton.hidden =
            false;

    }


    if (imageSearchButton) {

        imageSearchButton.disabled =
            false;

    }

}


/* =========================================================
   TEXT SEARCH
========================================================= */

window.searchProducts = async function () {

    console.log("SEARCH PRODUCTS");

    clearError();


    if (!db) {

        showError(
            "Supabase client is not available."
        );

        return;

    }


    const barcode =
        barcodeInput?.value.trim();


    const style =
        styleInput?.value.trim();


    if (!barcode && !style) {

        showError(
            "Enter a barcode or style number."
        );

        return;

    }


    try {

        clearResults();

        showLoading(
            "Searching products..."
        );


        let query =
            db
                .from(PRODUCTS_TABLE)
                .select(
                    "id, barcode, style_number, price, image_path, created_at"
                );


        /* =================================================
           BARCODE FILTER
        ================================================== */

        if (barcode) {

            query =
                query.ilike(
                    "barcode",
                    `%${barcode}%`
                );

        }


        /* =================================================
           STYLE FILTER
        ================================================== */

        if (style) {

            query =
                query.ilike(
                    "style_number",
                    `%${style}%`
                );

        }


        query =
            query.order(
                "created_at",
                {
                    ascending: false
                }
            );


        const {
            data,
            error
        } = await query;


        if (error) {

            throw error;

        }


        console.log(
            "TEXT SEARCH RESULTS:",
            data
        );


        renderResults(
            data || []
        );

    }
    catch (error) {

        console.error(
            "TEXT SEARCH ERROR:",
            error
        );


        showError(
            error?.message ||
            "Search failed."
        );

    }
    finally {

        hideLoading();

    }

};


/* =========================================================
   LOAD TRANSFORMERS.JS DYNAMICALLY
========================================================= */

async function loadTransformers() {

    if (
        window.__transformersModule
    ) {

        return window.__transformersModule;

    }


    if (
        window.__transformersLoading
    ) {

        return await window.__transformersLoading;

    }


    console.log(
        "LOADING TRANSFORMERS.JS"
    );


    window.__transformersLoading =
        import(
            "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1"
        )
        .then(module => {

            console.log(
                "TRANSFORMERS.JS LOADED"
            );


            window.__transformersModule =
                module;


            return module;

        })
        .catch(error => {

            console.error(
                "TRANSFORMERS.JS LOAD ERROR:",
                error
            );


            window.__transformersLoading =
                null;


            throw new Error(
                "Could not load the image search engine. " +
                "Please check your internet connection."
            );

        });


    return await window.__transformersLoading;

}


/* =========================================================
   LOAD CLIP MODEL
========================================================= */

async function loadImageModel() {

    if (imageExtractor) {

        return imageExtractor;

    }


    if (modelLoadingPromise) {

        return await modelLoadingPromise;

    }


    modelLoadingPromise =
        (async function () {

            try {

                showLoading(
                    "Loading image search model..."
                );


                const transformers =
                    await loadTransformers();


                const pipeline =
                    transformers.pipeline;


                if (
                    typeof pipeline !== "function"
                ) {

                    throw new Error(
                        "Transformers.js pipeline is unavailable."
                    );

                }


                console.log(
                    "LOADING CLIP MODEL:",
                    IMAGE_MODEL
                );


                imageExtractor =
                    await pipeline(
                        "image-feature-extraction",
                        IMAGE_MODEL
                    );


                console.log(
                    "CLIP MODEL LOADED"
                );


                return imageExtractor;

            }
            catch (error) {

                console.error(
                    "CLIP MODEL ERROR:",
                    error
                );


                throw error;

            }
            finally {

                hideLoading();

                modelLoadingPromise =
                    null;

            }

        })();


    return await modelLoadingPromise;

}


/* =========================================================
   CREATE IMAGE EMBEDDING
========================================================= */

async function createImageEmbedding(file) {

    const extractor =
        await loadImageModel();


    showLoading(
        "Analyzing image..."
    );


    console.log(
        "CREATING IMAGE EMBEDDING"
    );


    const output =
        await extractor(
            file,
            {
                pooling: "mean",
                normalize: true
            }
        );


    const embedding =
        Array.from(
            output.data
        );


    console.log(
        "EMBEDDING DIMENSIONS:",
        embedding.length
    );


    if (
        embedding.length !== 512
    ) {

        throw new Error(
            "Unexpected image embedding size: " +
            embedding.length
        );

    }


    return embedding;

}


/* =========================================================
   IMAGE SEARCH
========================================================= */

window.searchByImage =
async function () {

    console.log(
        "SEARCH BY IMAGE"
    );


    clearError();


    if (!selectedFile) {

        showError(
            "Please select or take a photo first."
        );

        return;

    }


    if (!db) {

        showError(
            "Supabase client is not available."
        );

        return;

    }


    try {

        disableImageSearchButton();

        clearResults();


        const embedding =
            await createImageEmbedding(
                selectedFile
            );


        console.log(
            "VECTOR CREATED"
        );


        showLoading(
            "Finding similar products..."
        );


        const {
            data,
            error
        } =
            await db.rpc(
                "match_product_images",
                {
                    query_embedding:
                        embedding,

                    match_threshold:
                        SIMILARITY_THRESHOLD,

                    match_count:
                        RESULT_LIMIT
                }
            );


        if (error) {

            console.error(
                "SUPABASE VECTOR ERROR:",
                error
            );


            throw error;

        }


        console.log(
            "VECTOR SEARCH RESULTS:",
            data
        );


        renderResults(
            data || []
        );

    }
    catch (error) {

        console.error(
            "IMAGE SEARCH FAILED:",
            error
        );


        showError(
            error?.message ||
            "Image search failed."
        );

    }
    finally {

        hideLoading();

        enableImageSearchButton();

    }

};


/* =========================================================
   RENDER RESULTS
========================================================= */

function renderResults(products) {

    if (!resultList) {

        return;

    }


    resultList.innerHTML =
        "";


    if (resultCount) {

        resultCount.textContent =
            products.length;

    }


    if (!products.length) {

        if (noResults) {

            noResults.textContent =
                "No matching products found.";

            noResults.hidden =
                false;

        }

        return;

    }


    if (noResults) {

        noResults.hidden =
            true;

    }


    products.forEach(
        product => {

            const card =
                createResultCard(
                    product
                );


            resultList.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   CREATE RESULT CARD
========================================================= */

function createResultCard(product) {

    const card =
        document.createElement("div");


    card.className =
        "result-card";


    /* =====================================================
       IMAGE
    ====================================================== */

    const image =
        document.createElement("img");


    image.className =
        "result-image";


    image.alt =
        "Product image";


    image.loading =
        "lazy";


    if (product.image_path) {

        const {
            data
        } =
            db
                .storage
                .from(IMAGE_BUCKET)
                .getPublicUrl(
                    product.image_path
                );


        if (
            data?.publicUrl
        ) {

            image.src =
                data.publicUrl;

        }

    }


    /* =====================================================
       INFORMATION
    ====================================================== */

    const info =
        document.createElement("div");


    info.className =
        "result-info";


    /* =====================================================
       STYLE
    ====================================================== */

    if (product.style_number) {

        const style =
            document.createElement("div");


        style.className =
            "result-style";


        style.textContent =
            "Style: " +
            product.style_number;


        info.appendChild(
            style
        );

    }


    /* =====================================================
       BARCODE
    ====================================================== */

    const barcode =
        document.createElement("div");


    barcode.className =
        "result-detail";


    barcode.textContent =
        "Barcode: " +
        product.barcode;


    info.appendChild(
        barcode
    );


    /* =====================================================
       PRICE
    ====================================================== */

    if (
        product.price !== null &&
        product.price !== undefined
    ) {

        const price =
            document.createElement("div");


        price.className =
            "result-price";


        const numericPrice =
            Number(
                product.price
            );


        if (
            Number.isFinite(
                numericPrice
            )
        ) {

            price.textContent =
                "AED " +
                numericPrice.toFixed(2);

        }
        else {

            price.textContent =
                "AED " +
                product.price;

        }


        info.appendChild(
            price
        );

    }


    /* =====================================================
       SIMILARITY
    ====================================================== */

    if (
        product.similarity !== undefined &&
        product.similarity !== null
    ) {

        const similarity =
            document.createElement("div");


        similarity.className =
            "result-detail";


        const percentage =
            Math.round(
                Number(
                    product.similarity
                ) * 100
            );


        similarity.textContent =
            "Visual match: " +
            percentage +
            "%";


        info.appendChild(
            similarity
        );

    }


    /* =====================================================
       BUILD CARD
    ====================================================== */

    card.appendChild(
        image
    );


    card.appendChild(
        info
    );


    return card;

}


/* =========================================================
   CLEAR RESULTS
========================================================= */

function clearResults() {

    if (resultList) {

        resultList.innerHTML =
            "";

    }


    if (resultCount) {

        resultCount.textContent =
            "0";

    }


    if (noResults) {

        noResults.hidden =
            true;

    }

}


/* =========================================================
   LOADING
========================================================= */

function showLoading(message) {

    if (!loading) {

        return;

    }


    loading.textContent =
        message;


    loading.hidden =
        false;

}


function hideLoading() {

    if (!loading) {

        return;

    }


    loading.hidden =
        true;

}


/* =========================================================
   BUTTON STATE
========================================================= */

function disableImageSearchButton() {

    if (!imageSearchButton) {

        return;

    }


    imageSearchButton.disabled =
        true;


    imageSearchButton.textContent =
        "Searching...";

}


function enableImageSearchButton() {

    if (!imageSearchButton) {

        return;

    }


    imageSearchButton.disabled =
        !selectedFile;


    imageSearchButton.textContent =
        "Search Similar Products";

}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    console.error(
        "SEARCH ERROR:",
        message
    );


    if (!errorMessage) {

        return;

    }


    errorMessage.textContent =
        message;


    errorMessage.hidden =
        false;

}


function clearError() {

    if (!errorMessage) {

        return;

    }


    errorMessage.textContent =
        "";


    errorMessage.hidden =
        true;

}


/* =========================================================
   FINAL INITIALIZATION
========================================================= */

console.log(
    "SEARCH FUNCTIONS REGISTERED"
);


console.log(
    "openCamera:",
    typeof window.openCamera
);


console.log(
    "openGallery:",
    typeof window.openGallery
);


console.log(
    "clearImage:",
    typeof window.clearImage
);


console.log(
    "searchByImage:",
    typeof window.searchByImage
);


console.log(
    "searchProducts:",
    typeof window.searchProducts
);


console.log(
    "clearBarcode:",
    typeof window.clearBarcode
);


console.log(
    "clearStyle:",
    typeof window.clearStyle
);


console.log(
    "goHome:",
    typeof window.goHome
);


console.log(
    "Supabase DB:",
    !!db
);


console.log(
    "========================================"
);


console.log(
    "SEARCH.JS READY"
);


console.log(
    "========================================"
);


/* =========================================================
   BARCODE SCANNER
========================================================= */

let barcodeStream = null;

let barcodeDetector = null;

let barcodeScanning = false;


/* =========================================================
   OPEN BARCODE SCANNER
========================================================= */

window.openBarcodeScanner = async function () {

    console.log("OPEN BARCODE SCANNER");

    clearError();

    const modal =
        document.getElementById(
            "barcodeScannerModal"
        );

    const video =
        document.getElementById(
            "barcodeVideo"
        );

    const status =
        document.getElementById(
            "barcodeScannerStatus"
        );


    if (!modal || !video) {

        showError(
            "Barcode scanner interface was not found."
        );

        return;

    }


    if (
        !("BarcodeDetector" in window)
    ) {

        showError(
            "Barcode scanning is not supported by this browser."
        );

        return;

    }


    try {

        modal.hidden = false;


        status.textContent =
            "Starting camera...";


        barcodeDetector =
            new BarcodeDetector({
                formats: [
                    "ean_13",
                    "ean_8",
                    "upc_a",
                    "upc_e",
                    "code_128",
                    "code_39",
                    "code_93",
                    "itf",
                    "codabar"
                ]
            });


        barcodeStream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: {
                        ideal: "environment"
                    }
                },
                audio: false
            });


        video.srcObject =
            barcodeStream;


        await video.play();


        status.textContent =
            "Point the camera at a barcode";


        barcodeScanning = true;


        scanBarcode();

    }
    catch (error) {

        console.error(
            "BARCODE CAMERA ERROR:",
            error
        );


        status.textContent =
            "Camera could not be started.";


        stopBarcodeCamera();

    }

};


/* =========================================================
   SCAN LOOP
========================================================= */

async function scanBarcode() {

    if (!barcodeScanning) {

        return;

    }


    const video =
        document.getElementById(
            "barcodeVideo"
        );


    if (
        !video ||
        video.readyState <
        HTMLMediaElement.HAVE_ENOUGH_DATA
    ) {

        requestAnimationFrame(
            scanBarcode
        );

        return;

    }


    try {

        const barcodes =
            await barcodeDetector.detect(
                video
            );


        if (barcodes.length > 0) {

            const barcode =
                barcodes[0].rawValue;


            console.log(
                "BARCODE DETECTED:",
                barcode
            );


            if (barcode) {

                const barcodeInput =
                    document.getElementById(
                        "barcodeSearch"
                    );


                if (barcodeInput) {

                    barcodeInput.value =
                        barcode;

                }


                const status =
                    document.getElementById(
                        "barcodeScannerStatus"
                    );


                if (status) {

                    status.textContent =
                        "Barcode detected.";

                }


                closeBarcodeScanner();


                // Automatically search
                searchProducts();


                return;

            }

        }

    }
    catch (error) {

        console.error(
            "BARCODE DETECTION ERROR:",
            error
        );

    }


    requestAnimationFrame(
        scanBarcode
    );

}


/* =========================================================
   CLOSE BARCODE SCANNER
========================================================= */

window.closeBarcodeScanner = function () {

    console.log(
        "CLOSE BARCODE SCANNER"
    );


    barcodeScanning = false;


    stopBarcodeCamera();


    const modal =
        document.getElementById(
            "barcodeScannerModal"
        );


    if (modal) {

        modal.hidden = true;

    }

};


/* =========================================================
   STOP CAMERA
========================================================= */

function stopBarcodeCamera() {

    if (barcodeStream) {

        barcodeStream
            .getTracks()
            .forEach(
                track => track.stop()
            );

        barcodeStream = null;

    }


    const video =
        document.getElementById(
            "barcodeVideo"
        );


    if (video) {

        video.srcObject = null;

    }

}