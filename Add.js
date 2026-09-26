
/* =========================================================
   ADD PRODUCT JAVASCRIPT
   SUPABASE + CLIP IMAGE EMBEDDING

   FEATURES:
   - Camera
   - Gallery
   - Image preview
   - Client-side image resize
   - WebP conversion
   - Image compression
   - Maximum approximately 150 KB target
   - Barcode validation
   - Duplicate barcode checking
   - Supabase Storage upload
   - Supabase productsImages insert
   - CLIP 512-dimensional image embedding
   - Automatic image embedding on product save
   - Modern toast notifications
   - No browser alert() popups
========================================================= */


console.log("ADD.JS LOADED SUCCESSFULLY");


/* =========================================================
   VARIABLES
========================================================= */

let selectedImage = null;

let imageEmbeddingExtractor = null;

let toastTimer = null;


/* =========================================================
   IMAGE SETTINGS
========================================================= */

const IMAGE_MAX_WIDTH = 800;

const IMAGE_MAX_HEIGHT = 800;

const IMAGE_TARGET_SIZE =
    150 * 1024; // Approximately 150 KB

const IMAGE_START_QUALITY = 0.72;

const IMAGE_MIN_QUALITY = 0.35;

const IMAGE_QUALITY_STEP = 0.07;


/* =========================================================
   CLIP SETTINGS
========================================================= */

const IMAGE_MODEL =
    "Xenova/clip-vit-base-patch32";

const IMAGE_EMBEDDING_SIZE = 512;


/* =========================================================
   TOAST NOTIFICATION SYSTEM
========================================================= */

/*
   type:
   - success
   - error
   - info
*/

function showToast(
    message,
    type = "success",
    title = null
) {

    const toast =
        document.getElementById(
            "appToast"
        );

    const toastIcon =
        document.getElementById(
            "toastIcon"
        );

    const toastTitle =
        document.getElementById(
            "toastTitle"
        );

    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    /* =============================================
       FALLBACK
       If toast HTML is missing, don't use alert.
    ============================================= */

    if (
        !toast ||
        !toastIcon ||
        !toastTitle ||
        !toastMessage
    ) {

        console.log(
            type.toUpperCase() +
            ": " +
            message
        );

        return;

    }


    /* =============================================
       CLEAR PREVIOUS TIMER
    ============================================= */

    if (
        toastTimer
    ) {

        clearTimeout(
            toastTimer
        );

        toastTimer =
            null;

    }


    /* =============================================
       REMOVE OLD TYPES
    ============================================= */

    toast.classList.remove(
        "error",
        "info"
    );


    /* =============================================
       SET TYPE
    ============================================= */

    if (
        type === "error"
    ) {

        toast.classList.add(
            "error"
        );

        toastIcon.textContent =
            "!";

        toastTitle.textContent =
            title ||
            "Something went wrong";

    }
    else if (
        type === "info"
    ) {

        toast.classList.add(
            "info"
        );

        toastIcon.textContent =
            "i";

        toastTitle.textContent =
            title ||
            "Information";

    }
    else {

        toastIcon.textContent =
            "✓";

        toastTitle.textContent =
            title ||
            "Success";

    }


    /* =============================================
       SET MESSAGE
    ============================================= */

    toastMessage.textContent =
        message;


    /* =============================================
       SHOW TOAST
    ============================================= */

    toast.classList.add(
        "show"
    );


    /* =============================================
       AUTO HIDE
    ============================================= */

    toastTimer =
        setTimeout(
            function () {

                hideToast();

            },
            3500
        );

}


/* =========================================================
   HIDE TOAST
========================================================= */

function hideToast() {

    const toast =
        document.getElementById(
            "appToast"
        );


    if (
        toast
    ) {

        toast.classList.remove(
            "show"
        );

    }


    if (
        toastTimer
    ) {

        clearTimeout(
            toastTimer
        );

        toastTimer =
            null;

    }

}


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Add Product page initialized."
        );


        const cameraInput =
            document.getElementById(
                "cameraInput"
            );


        const galleryInput =
            document.getElementById(
                "galleryInput"
            );


        /* =============================================
           CAMERA INPUT
        ============================================= */

        if (
            cameraInput
        ) {

            cameraInput.addEventListener(
                "change",
                function () {

                    if (
                        this.files &&
                        this.files.length > 0
                    ) {

                        showImage(
                            this.files[0]
                        );

                    }

                }
            );

        }


        /* =============================================
           GALLERY INPUT
        ============================================= */

        if (
            galleryInput
        ) {

            galleryInput.addEventListener(
                "change",
                function () {

                    if (
                        this.files &&
                        this.files.length > 0
                    ) {

                        showImage(
                            this.files[0]
                        );

                    }

                }
            );

        }

    }
);


/* =========================================================
   GO HOME
========================================================= */

function goHome() {

    window.location.href =
        "index.html";

}


/* =========================================================
   OPEN CAMERA
========================================================= */

function openCamera() {

    const cameraInput =
        document.getElementById(
            "cameraInput"
        );


    if (
        !cameraInput
    ) {

        console.error(
            "cameraInput element was not found."
        );

        showToast(
            "Camera input is unavailable.",
            "error",
            "Camera error"
        );

        return;

    }


    cameraInput.click();

}


/* =========================================================
   OPEN GALLERY
========================================================= */

function openGallery() {

    const galleryInput =
        document.getElementById(
            "galleryInput"
        );


    if (
        !galleryInput
    ) {

        console.error(
            "galleryInput element was not found."
        );

        showToast(
            "Gallery input is unavailable.",
            "error",
            "Gallery error"
        );

        return;

    }


    galleryInput.click();

}


/* =========================================================
   SHOW SELECTED IMAGE
========================================================= */

function showImage(file) {

    if (
        !file
    ) {

        return;

    }


    /* =============================================
       CHECK FILE TYPE
    ============================================= */

    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        showToast(
            "Please select a valid image file.",
            "error",
            "Invalid image"
        );

        return;

    }


    /* =============================================
       SAVE SELECTED IMAGE
    ============================================= */

    selectedImage =
        file;


    const imagePreview =
        document.getElementById(
            "imagePreview"
        );


    if (
        !imagePreview
    ) {

        console.error(
            "imagePreview element was not found."
        );

        showToast(
            "Image preview is unavailable.",
            "error",
            "Preview error"
        );

        return;

    }


    /* =============================================
       CREATE PREVIEW URL
    ============================================= */

    const imageURL =
        URL.createObjectURL(
            file
        );


    /* =============================================
       CLEAR OLD PREVIEW
    ============================================= */

    imagePreview.innerHTML =
        "";


    /* =============================================
       CREATE IMAGE
    ============================================= */

    const image =
        document.createElement(
            "img"
        );


    image.src =
        imageURL;

    image.alt =
        "Product image";


    /* =============================================
       ADD IMAGE
    ============================================= */

    imagePreview.appendChild(
        image
    );


    console.log(
        "Image selected:",
        file.name
    );


    console.log(
        "Original size:",
        formatBytes(
            file.size
        )
    );

}


/* =========================================================
   SCAN BARCODE
========================================================= */

function scanBarcode() {

    const barcodeInput =
        document.getElementById(
            "barcode"
        );


    if (
        !barcodeInput
    ) {

        console.error(
            "Barcode input was not found."
        );

        showToast(
            "Barcode field is unavailable.",
            "error",
            "Barcode error"
        );

        return;

    }


    /*
       Temporary barcode function.

       Currently focuses the barcode field.
       Real camera barcode scanning can
       be added later.
    */

    barcodeInput.focus();

    barcodeInput.select();

}


/* =========================================================
   LOAD CLIP MODEL
========================================================= */

async function loadImageEmbeddingModel() {

    /* =============================================
       MODEL ALREADY LOADED
    ============================================= */

    if (
        imageEmbeddingExtractor
    ) {

        return;

    }


    console.log(
        "Loading CLIP image embedding model..."
    );


    /*
       Transformers.js is loaded dynamically.

       This avoids loading the large model
       when the user only opens the Add page.
    */

    const transformers =
        await import(
            "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1"
        );


    if (
        !transformers.pipeline
    ) {

        throw new Error(
            "Transformers.js pipeline is unavailable."
        );

    }


    imageEmbeddingExtractor =
        await transformers.pipeline(
            "image-feature-extraction",
            IMAGE_MODEL
        );


    console.log(
        "CLIP image embedding model loaded."
    );

}


/* =========================================================
   CREATE IMAGE EMBEDDING
========================================================= */

async function createImageEmbedding(
    imageFile
) {

    if (
        !imageFile
    ) {

        throw new Error(
            "No image available for embedding."
        );

    }


    /* =============================================
       LOAD MODEL
    ============================================= */

    await loadImageEmbeddingModel();


    console.log(
        "Generating image embedding..."
    );


    /* =============================================
       GENERATE EMBEDDING
    ============================================= */

    const output =
        await imageEmbeddingExtractor(
            imageFile,
            {
                pooling: "mean",
                normalize: true
            }
        );


    if (
        !output ||
        !output.data
    ) {

        throw new Error(
            "CLIP did not return an image embedding."
        );

    }


    const embedding =
        Array.from(
            output.data
        );


    /* =============================================
       VALIDATE VECTOR SIZE
    ============================================= */

    if (
        embedding.length !==
        IMAGE_EMBEDDING_SIZE
    ) {

        throw new Error(
            "Invalid image embedding size: " +
            embedding.length +
            ". Expected " +
            IMAGE_EMBEDDING_SIZE +
            "."
        );

    }


    console.log(
        "Image embedding generated.",
        "Dimensions:",
        embedding.length
    );


    return embedding;

}


/* =========================================================
   SAVE PRODUCT
========================================================= */

async function saveProduct() {

    /* =============================================
       GET FORM ELEMENTS
    ============================================= */

    const styleNumberInput =
        document.getElementById(
            "styleNumber"
        );


    const barcodeInput =
        document.getElementById(
            "barcode"
        );


    const priceInput =
        document.getElementById(
            "price"
        );


    /* =============================================
       CHECK ELEMENTS
    ============================================= */

    if (
        !styleNumberInput ||
        !barcodeInput ||
        !priceInput
    ) {

        console.error(
            "One or more form elements were not found."
        );

        showToast(
            "The product form could not be loaded correctly.",
            "error",
            "Form error"
        );

        return;

    }


    /* =============================================
       GET VALUES
    ============================================= */

    const styleNumber =
        styleNumberInput.value.trim();


    const barcode =
        barcodeInput.value.trim();


    const priceText =
        priceInput.value.trim();


    /* =============================================
       BARCODE VALIDATION
    ============================================= */

    if (
        barcode === ""
    ) {

        showToast(
            "Please enter the product barcode.",
            "error",
            "Barcode required"
        );

        barcodeInput.focus();

        return;

    }


    /* =============================================
       PRICE VALIDATION
    ============================================= */

    let price = null;


    if (
        priceText !== ""
    ) {

        price =
            Number.parseFloat(
                priceText
            );


        if (
            Number.isNaN(price) ||
            price < 0
        ) {

            showToast(
                "Please enter a valid price.",
                "error",
                "Invalid price"
            );

            priceInput.focus();

            return;

        }

    }


    /* =============================================
       CHECK SUPABASE
    ============================================= */

    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        showToast(
            "The database connection is not available.",
            "error",
            "Connection error"
        );

        console.error(
            "supabaseClient is undefined."
        );

        return;

    }


    /* =============================================
       DISABLE SAVE BUTTON
    ============================================= */

    const saveButton =
        document.getElementById(
            "saveButton"
        );


    if (
        saveButton
    ) {

        saveButton.disabled =
            true;

        saveButton.textContent =
            "Checking...";

    }


    let imagePath = null;


    try {

        /* =========================================
           CHECK DUPLICATE BARCODE
        ========================================= */

        console.log(
            "Checking barcode..."
        );


        const {
            data: existingProducts,
            error: duplicateError
        } =
            await supabaseClient
                .from(
                    "productsImages"
                )
                .select("id")
                .eq(
                    "barcode",
                    barcode
                )
                .limit(1);


        if (
            duplicateError
        ) {

            throw duplicateError;

        }


        if (
            existingProducts &&
            existingProducts.length > 0
        ) {

            showToast(
                "A product with this barcode already exists.",
                "error",
                "Duplicate barcode"
            );

            barcodeInput.focus();

            return;

        }


        /* =========================================
           CREATE PRODUCT ID
        ========================================= */

        const productId =
            crypto.randomUUID();


        /* =========================================
           IMAGE VARIABLES
        ========================================= */

        let compressedImage =
            null;

        let imageEmbedding =
            null;


        /* =========================================
           COMPRESS IMAGE
        ========================================= */

        if (
            selectedImage
        ) {

            if (
                saveButton
            ) {

                saveButton.textContent =
                    "Preparing Image...";

            }


            console.log(
                "Compressing image..."
            );


            compressedImage =
                await compressImage(
                    selectedImage
                );


            console.log(
                "Original image:",
                formatBytes(
                    selectedImage.size
                )
            );


            console.log(
                "Compressed image:",
                formatBytes(
                    compressedImage.size
                )
            );


            /* =====================================
               GENERATE EMBEDDING
            ===================================== */

            if (
                saveButton
            ) {

                saveButton.textContent =
                    "Generating Image Data...";

            }


            console.log(
                "Generating CLIP embedding..."
            );


            /*
               IMPORTANT:

               Generate the embedding from the
               SAME compressed WebP file that
               will be uploaded to Storage.
            */

            imageEmbedding =
                await createImageEmbedding(
                    compressedImage
                );


            console.log(
                "Embedding ready:",
                imageEmbedding.length,
                "dimensions"
            );


            /* =====================================
               STORAGE FILE NAME
            ===================================== */

            const fileName =
                productId +
                ".webp";


            imagePath =
                fileName;


            /* =====================================
               UPLOAD TO STORAGE
            ===================================== */

            if (
                saveButton
            ) {

                saveButton.textContent =
                    "Uploading Image...";

            }


            console.log(
                "Uploading image..."
            );


            const {
                error: uploadError
            } =
                await supabaseClient
                    .storage
                    .from(
                        "product-images"
                    )
                    .upload(
                        fileName,
                        compressedImage,
                        {
                            cacheControl:
                                "31536000",

                            contentType:
                                "image/webp",

                            upsert:
                                false
                        }
                    );


            if (
                uploadError
            ) {

                throw uploadError;

            }


            console.log(
                "Image uploaded."
            );

        }


        /* =========================================
           SAVE PRODUCT
        ========================================= */

        if (
            saveButton
        ) {

            saveButton.textContent =
                "Saving Product...";

        }


        console.log(
            "Saving product..."
        );


        const {
            data: productData,
            error: productError
        } =
            await supabaseClient
                .from(
                    "productsImages"
                )
                .insert({

                    id:
                        productId,

                    barcode:
                        barcode,

                    style_number:
                        styleNumber !== ""
                            ? styleNumber
                            : null,

                    price:
                        price,

                    image_path:
                        imagePath,

                    image_embedding:
                        imageEmbedding

                })
                .select()
                .single();


        if (
            productError
        ) {

            /*
               If database insert fails after
               image upload, remove the uploaded
               image to prevent an orphan file.
            */

            if (
                imagePath
            ) {

                await supabaseClient
                    .storage
                    .from(
                        "product-images"
                    )
                    .remove([
                        imagePath
                    ]);

            }


            throw productError;

        }


        /* =========================================
           SUCCESS
        ========================================= */

        console.log(
            "Product saved:",
            productData
        );


        console.log(
            "Image embedding saved:",
            !!imageEmbedding
        );


        showToast(
            imageEmbedding
                ? "Product saved and image search data generated."
                : "Product saved successfully.",
            "success",
            "Product saved"
        );


        /* =========================================
           CLEAR FORM
        ========================================= */

        clearForm();


    }
    catch (
        error
    ) {

        console.error(
            "SAVE PRODUCT ERROR:",
            error
        );


        /*
           If something fails after the Storage
           upload, remove the uploaded image.
        */

        if (
            imagePath
        ) {

            try {

                await supabaseClient
                    .storage
                    .from(
                        "product-images"
                    )
                    .remove([
                        imagePath
                    ]);


                console.log(
                    "Uploaded image removed after error."
                );

            }
            catch (
                cleanupError
            ) {

                console.error(
                    "IMAGE CLEANUP ERROR:",
                    cleanupError
                );

            }

        }


        showToast(
            error.message ||
                "Unable to save the product.",
            "error",
            "Save failed"
        );

    }
    finally {

        /* =========================================
           ENABLE SAVE BUTTON
        ========================================= */

        if (
            saveButton
        ) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "Save Product";

        }

    }

}


/* =========================================================
   COMPRESS IMAGE
========================================================= */

async function compressImage(
    file
) {

    const image =
        await loadImage(
            file
        );


    /* =============================================
       ORIGINAL DIMENSIONS
    ============================================= */

    let width =
        image.naturalWidth;


    let height =
        image.naturalHeight;


    /* =============================================
       CALCULATE RESIZED DIMENSIONS
    ============================================= */

    const scale =
        Math.min(

            1,

            IMAGE_MAX_WIDTH /
                width,

            IMAGE_MAX_HEIGHT /
                height

        );


    width =
        Math.round(
            width * scale
        );


    height =
        Math.round(
            height * scale
        );


    /* =============================================
       CREATE CANVAS
    ============================================= */

    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        width;


    canvas.height =
        height;


    const context =
        canvas.getContext(
            "2d",
            {
                alpha: false
            }
        );


    if (
        !context
    ) {

        throw new Error(
            "Unable to create image canvas."
        );

    }


    /* =============================================
       WHITE BACKGROUND

       Useful for transparent PNG images.
    ============================================= */

    context.fillStyle =
        "#ffffff";


    context.fillRect(
        0,
        0,
        width,
        height
    );


    /* =============================================
       HIGH QUALITY RESIZE
    ============================================= */

    context.imageSmoothingEnabled =
        true;


    context.imageSmoothingQuality =
        "high";


    context.drawImage(
        image,
        0,
        0,
        width,
        height
    );


    /* =============================================
       TRY QUALITY LEVELS
    ============================================= */

    let quality =
        IMAGE_START_QUALITY;


    let blob =
        null;


    while (
        quality >=
        IMAGE_MIN_QUALITY
    ) {

        blob =
            await canvasToWebP(
                canvas,
                quality
            );


        if (
            blob.size <=
            IMAGE_TARGET_SIZE
        ) {

            break;

        }


        quality -=
            IMAGE_QUALITY_STEP;

    }


    if (
        !blob
    ) {

        throw new Error(
            "Unable to compress image."
        );

    }


    console.log(
        "Final image quality:",
        Math.round(
            quality * 100
        ) + "%"
    );


    console.log(
        "Final dimensions:",
        width +
        " x " +
        height
    );


    return new File(
        [blob],
        "product.webp",
        {
            type:
                "image/webp"
        }
    );

}


/* =========================================================
   LOAD IMAGE
========================================================= */

function loadImage(
    file
) {

    return new Promise(
        function (
            resolve,
            reject
        ) {

            const url =
                URL.createObjectURL(
                    file
                );


            const image =
                new Image();


            image.onload =
                function () {

                    URL.revokeObjectURL(
                        url
                    );


                    resolve(
                        image
                    );

                };


            image.onerror =
                function () {

                    URL.revokeObjectURL(
                        url
                    );


                    reject(
                        new Error(
                            "Unable to read image."
                        )
                    );

                };


            image.src =
                url;

        }
    );

}


/* =========================================================
   CANVAS → WEBP
========================================================= */

function canvasToWebP(
    canvas,
    quality
) {

    return new Promise(
        function (
            resolve,
            reject
        ) {

            canvas.toBlob(
                function (
                    blob
                ) {

                    if (
                        !blob
                    ) {

                        reject(
                            new Error(
                                "WebP conversion failed."
                            )
                        );

                        return;

                    }


                    resolve(
                        blob
                    );

                },

                "image/webp",

                quality

            );

        }
    );

}


/* =========================================================
   FORMAT BYTES
========================================================= */

function formatBytes(
    bytes
) {

    if (
        !bytes ||
        bytes === 0
    ) {

        return "0 KB";

    }


    const units =
        [
            "Bytes",
            "KB",
            "MB"
        ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    return (
        bytes /
        Math.pow(
            1024,
            index
        )
    ).toFixed(
        1
    )
    + " "
    + units[index];

}


/* =========================================================
   CLEAR FORM
========================================================= */

function clearForm() {

    const styleNumberInput =
        document.getElementById(
            "styleNumber"
        );


    const barcodeInput =
        document.getElementById(
            "barcode"
        );


    const priceInput =
        document.getElementById(
            "price"
        );


    /* =============================================
       CLEAR TEXT FIELDS
    ============================================= */

    if (
        styleNumberInput
    ) {

        styleNumberInput.value =
            "";

    }


    if (
        barcodeInput
    ) {

        barcodeInput.value =
            "";

    }


    if (
        priceInput
    ) {

        priceInput.value =
            "";

    }


    /* =============================================
       CLEAR SELECTED IMAGE
    ============================================= */

    selectedImage =
        null;


    /* =============================================
       RESET PREVIEW
    ============================================= */

    const imagePreview =
        document.getElementById(
            "imagePreview"
        );


    if (
        imagePreview
    ) {

        imagePreview.innerHTML = `

            <div class="empty-image">

                <div class="image-icon">
                    +
                </div>

                <p>
                    No image selected
                </p>

            </div>

        `;

    }


    /* =============================================
       RESET FILE INPUTS
    ============================================= */

    const cameraInput =
        document.getElementById(
            "cameraInput"
        );


    const galleryInput =
        document.getElementById(
            "galleryInput"
        );


    if (
        cameraInput
    ) {

        cameraInput.value =
            "";

    }


    if (
        galleryInput
    ) {

        galleryInput.value =
            "";

    }

}

