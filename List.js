/* =========================================================
   PRODUCT LIST
   SUPABASE VERSION
   LIST + SEARCH + EDIT + DELETE
========================================================= */


/* =========================================================
   SETTINGS
========================================================= */

const PRODUCTS_TABLE = "productsImages";

const IMAGE_BUCKET = "product-images";

const IMAGE_MODEL =
    "Xenova/clip-vit-base-patch32";

const IMAGE_EMBEDDING_SIZE = 512;


/* =========================================================
   SUPABASE
========================================================= */

const db = window.supabaseClient;


/* =========================================================
   PAGE ELEMENTS
========================================================= */

const productList =
    document.getElementById("productList");

const productCount =
    document.getElementById("productCount");

const emptyState =
    document.getElementById("emptyState");

const noResults =
    document.getElementById("noResults");

const listSearch =
    document.getElementById("listSearch");

const clearSearchButton =
    document.getElementById("clearSearch");


/* =========================================================
   EDIT ELEMENTS
========================================================= */

const editModal =
    document.getElementById("editModal");

const editModalBackdrop =
    document.querySelector(
        ".edit-modal-backdrop"
    );

const closeEditModalButton =
    document.getElementById(
        "closeEditModal"
    );

const cancelEditButton =
    document.getElementById(
        "cancelEditButton"
    );

const saveEditButton =
    document.getElementById(
        "saveEditButton"
    );

const editStyleNumber =
    document.getElementById(
        "editStyleNumber"
    );

const editBarcode =
    document.getElementById(
        "editBarcode"
    );

const editPrice =
    document.getElementById(
        "editPrice"
    );

const editProductImage =
    document.getElementById(
        "editProductImage"
    );

const editImagePlaceholder =
    document.getElementById(
        "editImagePlaceholder"
    );

const editCameraButton =
    document.getElementById(
        "editCameraButton"
    );

const editGalleryButton =
    document.getElementById(
        "editGalleryButton"
    );

const editCameraInput =
    document.getElementById(
        "editCameraInput"
    );

const editGalleryInput =
    document.getElementById(
        "editGalleryInput"
    );


/* =========================================================
   TOAST ELEMENTS
========================================================= */

const listToast =
    document.getElementById(
        "listToast"
    );

const listToastIcon =
    document.getElementById(
        "listToastIcon"
    );

const listToastTitle =
    document.getElementById(
        "listToastTitle"
    );

const listToastMessage =
    document.getElementById(
        "listToastMessage"
    );


/* =========================================================
   DATA
========================================================= */

let allProducts = [];

let editingProduct = null;

let selectedEditImage = null;

let imageEmbeddingExtractor = null;

let toastTimer = null;


/* =========================================================
   PAGE START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "PRODUCT LIST STARTED"
        );


        if (!window.supabase) {

            console.error(
                "Supabase library not loaded."
            );

            showError(
                "Supabase library could not be loaded."
            );

            return;

        }


        if (!db) {

            console.error(
                "supabaseClient not found."
            );

            showError(
                "Supabase configuration was not loaded."
            );

            return;

        }


        setupEditEvents();

        loadProducts();

    }
);


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    showLoading();

    console.log(
        "Loading products..."
    );


    const {
        data,
        error
    } = await db

        .from(PRODUCTS_TABLE)

        .select(
            "id, barcode, style_number, price, image_path, created_at"
        )

        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "PRODUCT LOAD ERROR:",
            error
        );

        showError(
            "Unable to load products."
        );

        return;

    }


    allProducts =
        data || [];


    console.log(
        "Products loaded:",
        allProducts.length
    );


    updateProductCount(
        allProducts.length
    );


    renderProducts(
        allProducts
    );

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts(products) {

    productList.innerHTML = "";

    noResults.hidden = true;


    if (
        allProducts.length === 0
    ) {

        emptyState.hidden = false;

        return;

    }


    emptyState.hidden = true;


    if (
        products.length === 0
    ) {

        noResults.hidden = false;

        return;

    }


    products.forEach(
        product => {

            const card =
                createProductCard(
                    product
                );

            productList.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   CREATE PRODUCT CARD
========================================================= */

function createProductCard(product) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "product-card";


    /* =====================================================
       IMAGE
    ====================================================== */

    const imageContainer =
        document.createElement(
            "div"
        );

    imageContainer.className =
        "product-image";


    if (product.image_path) {

        const image =
            document.createElement(
                "img"
            );


        image.alt =
            product.style_number
                ? `Product ${product.style_number}`
                : `Product ${product.barcode}`;


        image.loading =
            "lazy";

        image.decoding =
            "async";


        const {
            data: publicUrlData
        } = db

            .storage

            .from(IMAGE_BUCKET)

            .getPublicUrl(
                product.image_path
            );


        if (
            publicUrlData &&
            publicUrlData.publicUrl
        ) {

            image.src =
                publicUrlData.publicUrl;


            image.onerror = () => {

                image.remove();

                showImagePlaceholder(
                    imageContainer
                );

            };


            imageContainer.appendChild(
                image
            );

        }
        else {

            showImagePlaceholder(
                imageContainer
            );

        }

    }
    else {

        showImagePlaceholder(
            imageContainer
        );

    }


    /* =====================================================
       INFORMATION
    ====================================================== */

    const info =
        document.createElement(
            "div"
        );

    info.className =
        "product-info";


    /* -----------------------------------------------------
       STYLE NUMBER
    ----------------------------------------------------- */

    const style =
        document.createElement(
            "div"
        );

    style.className =
        "product-style";


    if (
        product.style_number &&
        product.style_number.trim() !== ""
    ) {

        style.textContent =
            product.style_number;

    }
    else {

        style.textContent =
            "No style number";

        style.classList.add(
            "no-style"
        );

    }


    info.appendChild(
        style
    );


    /* -----------------------------------------------------
       BARCODE
    ----------------------------------------------------- */

    const barcodeRow =
        document.createElement(
            "div"
        );

    barcodeRow.className =
        "product-detail";


    const barcodeLabel =
        document.createElement(
            "span"
        );

    barcodeLabel.className =
        "product-detail-label";

    barcodeLabel.textContent =
        "Barcode";


    const barcodeValue =
        document.createElement(
            "span"
        );

    barcodeValue.textContent =
        product.barcode || "—";


    barcodeRow.appendChild(
        barcodeLabel
    );

    barcodeRow.appendChild(
        barcodeValue
    );


    info.appendChild(
        barcodeRow
    );


    /* -----------------------------------------------------
       PRICE
    ----------------------------------------------------- */

    if (
        product.price !== null &&
        product.price !== undefined &&
        product.price !== ""
    ) {

        const price =
            document.createElement(
                "div"
            );

        price.className =
            "product-price";


        price.textContent =
            formatPrice(
                product.price
            );


        info.appendChild(
            price
        );

    }


    /* =====================================================
       ACTIONS
    ====================================================== */

    const actions =
        document.createElement(
            "div"
        );

    actions.className =
        "product-actions";


    /* -----------------------------------------------------
       EDIT BUTTON
    ----------------------------------------------------- */

    const editButton =
        document.createElement(
            "button"
        );

    editButton.type =
        "button";

    editButton.className =
        "edit-button";

    editButton.textContent =
        "Edit";

    editButton.setAttribute(
        "aria-label",
        "Edit product"
    );


    editButton.addEventListener(
        "click",
        () => {

            openEditModal(
                product
            );

        }
    );


    /* -----------------------------------------------------
       DELETE BUTTON
    ----------------------------------------------------- */

    const deleteButton =
        document.createElement(
            "button"
        );

    deleteButton.type =
        "button";

    deleteButton.className =
        "delete-button";

    deleteButton.setAttribute(
        "aria-label",
        "Delete product"
    );

    deleteButton.title =
        "Delete product";

    deleteButton.textContent =
        "Delete";


    deleteButton.addEventListener(
        "click",
        () => {

            deleteProduct(
                product
            );

        }
    );


    actions.appendChild(
        editButton
    );

    actions.appendChild(
        deleteButton
    );


    /* =====================================================
       CARD
    ====================================================== */

    card.appendChild(
        imageContainer
    );

    card.appendChild(
        info
    );

    card.appendChild(
        actions
    );


    return card;

}


/* =========================================================
   IMAGE PLACEHOLDER
========================================================= */

function showImagePlaceholder(
    container
) {

    container.innerHTML = "";


    const placeholder =
        document.createElement(
            "div"
        );

    placeholder.className =
        "product-image-placeholder";

    placeholder.textContent =
        "□";


    container.appendChild(
        placeholder
    );

}


/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(price) {

    const numericPrice =
        Number(price);


    if (
        !Number.isFinite(
            numericPrice
        )
    ) {

        return "";

    }


    return `AED ${numericPrice.toFixed(2)}`;

}


/* =========================================================
   SEARCH
========================================================= */

if (listSearch) {

    listSearch.addEventListener(
        "input",
        handleSearch
    );

}


/* =========================================================
   HANDLE SEARCH
========================================================= */

function handleSearch() {

    if (!listSearch) {

        return;

    }


    const searchText =
        listSearch.value
            .trim()
            .toLowerCase();


    if (clearSearchButton) {

        clearSearchButton.style.visibility =
            searchText
                ? "visible"
                : "hidden";

    }


    if (!searchText) {

        renderProducts(
            allProducts
        );

        return;

    }


    const filteredProducts =
        allProducts.filter(
            product => {

                const barcode =
                    String(
                        product.barcode || ""
                    ).toLowerCase();


                const styleNumber =
                    String(
                        product.style_number || ""
                    ).toLowerCase();


                return (
                    barcode.includes(
                        searchText
                    ) ||
                    styleNumber.includes(
                        searchText
                    )
                );

            }
        );


    renderProducts(
        filteredProducts
    );

}


/* =========================================================
   CLEAR SEARCH
========================================================= */

function clearSearch() {

    if (!listSearch) {

        return;

    }


    listSearch.value = "";


    if (clearSearchButton) {

        clearSearchButton.style.visibility =
            "hidden";

    }


    renderProducts(
        allProducts
    );


    listSearch.focus();

}


/* =========================================================
   EDIT EVENT SETUP
========================================================= */

function setupEditEvents() {

    if (closeEditModalButton) {

        closeEditModalButton.addEventListener(
            "click",
            closeEditModal
        );

    }


    if (cancelEditButton) {

        cancelEditButton.addEventListener(
            "click",
            closeEditModal
        );

    }


    if (editModalBackdrop) {

        editModalBackdrop.addEventListener(
            "click",
            closeEditModal
        );

    }


    if (saveEditButton) {

        saveEditButton.addEventListener(
            "click",
            saveEditedProduct
        );

    }


    if (editCameraButton) {

        editCameraButton.addEventListener(
            "click",
            () => {

                if (editCameraInput) {

                    editCameraInput.click();

                }

            }
        );

    }


    if (editGalleryButton) {

        editGalleryButton.addEventListener(
            "click",
            () => {

                if (editGalleryInput) {

                    editGalleryInput.click();

                }

            }
        );

    }


    if (editCameraInput) {

        editCameraInput.addEventListener(
            "change",
            handleEditImageSelection
        );

    }


    if (editGalleryInput) {

        editGalleryInput.addEventListener(
            "change",
            handleEditImageSelection
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                editModal &&
                !editModal.hidden
            ) {

                closeEditModal();

            }

        }
    );

}


/* =========================================================
   OPEN EDIT MODAL
========================================================= */

function openEditModal(product) {

    if (!product) {

        return;

    }


    editingProduct =
        product;

    selectedEditImage =
        null;


    /* -----------------------------------------------------
       FILL FORM
    ----------------------------------------------------- */

    if (editStyleNumber) {

        editStyleNumber.value =
            product.style_number || "";

    }


    if (editBarcode) {

        editBarcode.value =
            product.barcode || "";

    }


    if (editPrice) {

        editPrice.value =
            product.price !== null &&
            product.price !== undefined
                ? product.price
                : "";

    }


    /* -----------------------------------------------------
       EXISTING IMAGE
    ----------------------------------------------------- */

    if (
        product.image_path &&
        editProductImage
    ) {

        const {
            data: publicUrlData
        } = db

            .storage

            .from(IMAGE_BUCKET)

            .getPublicUrl(
                product.image_path
            );


        if (
            publicUrlData &&
            publicUrlData.publicUrl
        ) {

            editProductImage.src =
                publicUrlData.publicUrl;

            editProductImage.hidden =
                false;


            if (editImagePlaceholder) {

                editImagePlaceholder.hidden =
                    true;

            }

        }

    }
    else {

        showEditImagePlaceholder();

    }


    if (editModal) {

        editModal.hidden =
            false;

        document.body.classList.add(
            "modal-open"
        );

    }


    setTimeout(
        () => {

            if (editBarcode) {

                editBarcode.focus();

            }

        },
        50
    );

}


/* =========================================================
   CLOSE EDIT MODAL
========================================================= */

function closeEditModal() {

    if (!editModal) {

        return;

    }


    editModal.hidden =
        true;


    document.body.classList.remove(
        "modal-open"
    );


    editingProduct =
        null;

    selectedEditImage =
        null;


    if (editCameraInput) {

        editCameraInput.value =
            "";

    }


    if (editGalleryInput) {

        editGalleryInput.value =
            "";

    }

}


/* =========================================================
   SHOW EDIT IMAGE PLACEHOLDER
========================================================= */

function showEditImagePlaceholder() {

    if (editProductImage) {

        editProductImage.hidden =
            true;

        editProductImage.removeAttribute(
            "src"
        );

    }


    if (editImagePlaceholder) {

        editImagePlaceholder.hidden =
            false;

    }

}


/* =========================================================
   HANDLE EDIT IMAGE
========================================================= */

function handleEditImageSelection(
    event
) {

    const file =
        event.target.files &&
        event.target.files[0];


    if (!file) {

        return;

    }


    if (
        !file.type ||
        !file.type.startsWith(
            "image/"
        )
    ) {

        showListToast(
            "Please select a valid image.",
            "error",
            "Invalid image"
        );

        return;

    }


    selectedEditImage =
        file;


    const reader =
        new FileReader();


    reader.onload =
        () => {

            if (editProductImage) {

                editProductImage.src =
                    reader.result;

                editProductImage.hidden =
                    false;

            }


            if (editImagePlaceholder) {

                editImagePlaceholder.hidden =
                    true;

            }

        };


    reader.readAsDataURL(
        file
    );

}


/* =========================================================
   SAVE EDITED PRODUCT
========================================================= */

async function saveEditedProduct() {

    if (
        !editingProduct ||
        !editingProduct.id
    ) {

        return;

    }


    const styleNumber =
        editStyleNumber
            ? editStyleNumber.value.trim()
            : "";


    const barcode =
        editBarcode
            ? editBarcode.value.trim()
            : "";


    const priceText =
        editPrice
            ? editPrice.value.trim()
            : "";


    /* =====================================================
       VALIDATION
    ====================================================== */

    if (!barcode) {

        showListToast(
            "Please enter the product barcode.",
            "error",
            "Barcode required"
        );

        if (editBarcode) {

            editBarcode.focus();

        }

        return;

    }


    let price = null;


    if (priceText !== "") {

        price =
            Number(priceText);


        if (
            !Number.isFinite(price) ||
            price < 0
        ) {

            showListToast(
                "Please enter a valid price.",
                "error",
                "Invalid price"
            );

            if (editPrice) {

                editPrice.focus();

            }

            return;

        }

    }


    /* =====================================================
       PREVENT DUPLICATE BARCODE
    ====================================================== */

    const {
        data: duplicateProducts,
        error: duplicateError
    } = await db

        .from(PRODUCTS_TABLE)

        .select("id")

        .eq(
            "barcode",
            barcode
        )
        .neq(
            "id",
            editingProduct.id
        )
        .limit(1);


    if (duplicateError) {

        console.error(
            "DUPLICATE CHECK ERROR:",
            duplicateError
        );

        showListToast(
            "Could not verify the barcode.",
            "error",
            "Barcode check failed"
        );

        return;

    }


    if (
        duplicateProducts &&
        duplicateProducts.length > 0
    ) {

        showListToast(
            "Another product already uses this barcode.",
            "error",
            "Duplicate barcode"
        );

        if (editBarcode) {

            editBarcode.focus();

        }

        return;

    }


    /* =====================================================
       DISABLE SAVE
    ====================================================== */

    setEditSaving(
        true,
        "Checking..."
    );


    let newImagePath = null;

    let uploadedNewImage = false;


    try {

        /* =================================================
           IMAGE CHANGE
        ================================================== */

        if (selectedEditImage) {

            setEditSaving(
                true,
                "Preparing Image..."
            );


            const compressedBlob =
                await compressImage(
                    selectedEditImage
                );


            setEditSaving(
                true,
                "Generating Image Data..."
            );


            const embedding =
                await createImageEmbedding(
                    compressedBlob
                );


            if (
                !embedding ||
                embedding.length !==
                    IMAGE_EMBEDDING_SIZE
            ) {

                throw new Error(
                    "Image embedding could not be generated."
                );

            }


            /* =============================================
               NEW IMAGE PATH
            ============================================== */

            const productId =
                editingProduct.id;


            newImagePath =
                `${productId}/${Date.now()}.webp`;


            setEditSaving(
                true,
                "Uploading Image..."
            );


            const {
                error: uploadError
            } = await db

                .storage

                .from(IMAGE_BUCKET)

                .upload(
                    newImagePath,
                    compressedBlob,
                    {
                        contentType:
                            "image/webp",
                        upsert:
                            false
                    }
                );


            if (uploadError) {

                throw uploadError;

            }


            uploadedNewImage =
                true;


            /* =============================================
               UPDATE WITH NEW IMAGE + EMBEDDING
            ============================================== */

            setEditSaving(
                true,
                "Saving Product..."
            );


            const {
                error: updateError
            } = await db

                .from(PRODUCTS_TABLE)

                .update({
                    barcode:
                        barcode,

                    style_number:
                        styleNumber || null,

                    price:
                        price,

                    image_path:
                        newImagePath,

                    image_embedding:
                        embedding
                })

                .eq(
                    "id",
                    editingProduct.id
                );


            if (updateError) {

                throw updateError;

            }


            /* =============================================
               DELETE OLD IMAGE
            ============================================== */

            if (
                editingProduct.image_path &&
                editingProduct.image_path.trim() !== ""
            ) {

                const {
                    error: oldImageDeleteError
                } = await db

                    .storage

                    .from(IMAGE_BUCKET)

                    .remove([
                        editingProduct.image_path
                    ]);


                if (oldImageDeleteError) {

                    console.warn(
                        "OLD IMAGE DELETE FAILED:",
                        oldImageDeleteError
                    );

                }

            }

        }
        else {

            /* =============================================
               NO IMAGE CHANGE
            ============================================== */

            setEditSaving(
                true,
                "Saving Product..."
            );


            const {
                error: updateError
            } = await db

                .from(PRODUCTS_TABLE)

                .update({
                    barcode:
                        barcode,

                    style_number:
                        styleNumber || null,

                    price:
                        price
                })

                .eq(
                    "id",
                    editingProduct.id
                );


            if (updateError) {

                throw updateError;

            }

        }


        /* =================================================
           UPDATE LOCAL DATA
        ================================================== */

        const productIndex =
            allProducts.findIndex(
                item =>
                    item.id ===
                    editingProduct.id
            );


        if (productIndex !== -1) {

            allProducts[
                productIndex
            ] = {

                ...allProducts[
                    productIndex
                ],

                barcode:
                    barcode,

                style_number:
                    styleNumber || null,

                price:
                    price,

                image_path:
                    newImagePath ||
                    allProducts[
                        productIndex
                    ].image_path

            };

        }


        updateProductCount(
            allProducts.length
        );


        handleSearch();


        closeEditModal();


        showListToast(
            selectedEditImage
                ? "Product and image updated successfully."
                : "Product updated successfully.",
            "success",
            "Product updated"
        );


        console.log(
            "PRODUCT UPDATED SUCCESSFULLY"
        );

    }
    catch (error) {

        console.error(
            "PRODUCT UPDATE ERROR:",
            error
        );


        /* -------------------------------------------------
           CLEAN UP NEW IMAGE IF DATABASE UPDATE FAILED
        ------------------------------------------------- */

        if (
            uploadedNewImage &&
            newImagePath
        ) {

            await db

                .storage

                .from(IMAGE_BUCKET)

                .remove([
                    newImagePath
                ]);

        }


        showListToast(
            error.message ||
                "Unable to update the product.",
            "error",
            "Update failed"
        );

    }
    finally {

        setEditSaving(
            false
        );

    }

}


/* =========================================================
   EDIT SAVE BUTTON STATE
========================================================= */

function setEditSaving(
    saving,
    text = "Save Changes"
) {

    if (!saveEditButton) {

        return;

    }


    saveEditButton.disabled =
        saving;


    const span =
        saveEditButton.querySelector(
            "span"
        );


    if (span) {

        span.textContent =
            text;

    }


    if (saving) {

        saveEditButton.classList.add(
            "saving"
        );

    }
    else {

        saveEditButton.classList.remove(
            "saving"
        );

    }

}


/* =========================================================
   IMAGE COMPRESSION
========================================================= */

async function compressImage(
    file
) {

    const image =
        await loadImage(
            file
        );


    const MAX_SIZE =
        800;

    let width =
        image.naturalWidth;

    let height =
        image.naturalHeight;


    if (
        width > MAX_SIZE ||
        height > MAX_SIZE
    ) {

        if (width > height) {

            height =
                Math.round(
                    height *
                    MAX_SIZE /
                    width
                );

            width =
                MAX_SIZE;

        }
        else {

            width =
                Math.round(
                    width *
                    MAX_SIZE /
                    height
                );

            height =
                MAX_SIZE;

        }

    }


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


    context.drawImage(
        image,
        0,
        0,
        width,
        height
    );


    const blob =
        await new Promise(
            resolve => {

                canvas.toBlob(
                    resolve,
                    "image/webp",
                    0.82
                );

            }
        );


    if (!blob) {

        throw new Error(
            "Image compression failed."
        );

    }


    return blob;

}


/* =========================================================
   LOAD IMAGE
========================================================= */

function loadImage(
    file
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const image =
                new Image();


            image.onload =
                () => {

                    URL.revokeObjectURL(
                        image.src
                    );

                    resolve(
                        image
                    );

                };


            image.onerror =
                () => {

                    URL.revokeObjectURL(
                        image.src
                    );

                    reject(
                        new Error(
                            "Could not read the selected image."
                        )
                    );

                };


            image.src =
                URL.createObjectURL(
                    file
                );

        }
    );

}


/* =========================================================
   LOAD CLIP MODEL
========================================================= */

async function loadImageEmbeddingModel() {

    if (
        imageEmbeddingExtractor
    ) {

        return imageEmbeddingExtractor;

    }


    console.log(
        "Loading CLIP image model..."
    );


    const transformers =
        await import(
            "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1"
        );


    const {
        pipeline
    } = transformers;


    imageEmbeddingExtractor =
        await pipeline(
            "image-feature-extraction",
            IMAGE_MODEL
        );


    console.log(
        "CLIP image model loaded."
    );


    return imageEmbeddingExtractor;

}


/* =========================================================
   CREATE IMAGE EMBEDDING
========================================================= */

async function createImageEmbedding(
    imageSource
) {

    const extractor =
        await loadImageEmbeddingModel();


    const output =
        await extractor(
            imageSource,
            {
                pooling:
                    "mean",

                normalize:
                    true
            }
        );


    const embedding =
        Array.from(
            output.data
        );


    if (
        embedding.length !==
        IMAGE_EMBEDDING_SIZE
    ) {

        throw new Error(
            `Unexpected image embedding size: ${embedding.length}. Expected ${IMAGE_EMBEDDING_SIZE}.`
        );

    }


    return embedding;

}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct(
    product
) {

    if (
        !product ||
        !product.id
    ) {

        return;

    }


    const displayName =
        product.style_number ||
        product.barcode ||
        "this product";


    const confirmed =
        window.confirm(
            `Delete ${displayName}?\n\n` +
            `This will permanently delete the product and its image.`
        );


    if (!confirmed) {

        return;

    }


    console.log(
        "Deleting product:",
        product.id
    );


    /* =====================================================
       DELETE DATABASE RECORD
    ====================================================== */

    const {
        error: databaseError
    } = await db

        .from(PRODUCTS_TABLE)

        .delete()

        .eq(
            "id",
            product.id
        );


    if (databaseError) {

        console.error(
            "DATABASE DELETE ERROR:",
            databaseError
        );


        showListToast(
            databaseError.message ||
                "Could not delete the product.",
            "error",
            "Delete failed"
        );

        return;

    }


    /* =====================================================
       DELETE STORAGE IMAGE
    ====================================================== */

    let imageDeleteFailed =
        false;


    if (
        product.image_path &&
        product.image_path.trim() !== ""
    ) {

        const {
            error: storageError
        } = await db

            .storage

            .from(IMAGE_BUCKET)

            .remove([
                product.image_path
            ]);


        if (storageError) {

            imageDeleteFailed =
                true;

            console.error(
                "STORAGE DELETE ERROR:",
                storageError
            );

        }

    }


    /* =====================================================
       REMOVE LOCAL PRODUCT
    ====================================================== */

    allProducts =
        allProducts.filter(
            item =>
                item.id !== product.id
        );


    updateProductCount(
        allProducts.length
    );


    handleSearch();


    if (imageDeleteFailed) {

        showListToast(
            "Product deleted, but its image could not be removed from Storage.",
            "info",
            "Product deleted"
        );

    }
    else {

        showListToast(
            "Product and image deleted successfully.",
            "success",
            "Product deleted"
        );

    }


    console.log(
        "PRODUCT DELETED SUCCESSFULLY"
    );

}


/* =========================================================
   TOAST
========================================================= */

function showListToast(
    message,
    type = "success",
    title = "Success"
) {

    if (
        !listToast ||
        !listToastIcon ||
        !listToastTitle ||
        !listToastMessage
    ) {

        console.warn(
            "List toast elements not found."
        );

        return;

    }


    clearTimeout(
        toastTimer
    );


    listToast.classList.remove(
        "error",
        "info",
        "show"
    );


    if (type) {

        listToast.classList.add(
            type
        );

    }


    if (type === "error") {

        listToastIcon.textContent =
            "×";

    }
    else if (type === "info") {

        listToastIcon.textContent =
            "i";

    }
    else {

        listToastIcon.textContent =
            "✓";

    }


    listToastTitle.textContent =
        title;


    listToastMessage.textContent =
        message;


    requestAnimationFrame(
        () => {

            listToast.classList.add(
                "show"
            );

        }
    );


    toastTimer =
        setTimeout(
            () => {

                hideListToast();

            },
            3500
        );

}


/* =========================================================
   HIDE TOAST
========================================================= */

function hideListToast() {

    if (!listToast) {

        return;

    }


    listToast.classList.remove(
        "show"
    );

}


/* =========================================================
   UPDATE PRODUCT COUNT
========================================================= */

function updateProductCount(
    count
) {

    if (!productCount) {

        return;

    }


    productCount.textContent =
        count.toLocaleString();

}


/* =========================================================
   LOADING STATE
========================================================= */

function showLoading() {

    if (emptyState) {

        emptyState.hidden =
            true;

    }


    if (noResults) {

        noResults.hidden =
            true;

    }


    productList.innerHTML =
        "";


    const loading =
        document.createElement(
            "div"
        );

    loading.className =
        "no-results";

    loading.textContent =
        "Loading products...";


    productList.appendChild(
        loading
    );

}


/* =========================================================
   ERROR STATE
========================================================= */

function showError(
    message
) {

    if (emptyState) {

        emptyState.hidden =
            true;

    }


    if (noResults) {

        noResults.hidden =
            true;

    }


    productList.innerHTML =
        "";


    const errorBox =
        document.createElement(
            "div"
        );

    errorBox.className =
        "no-results";

    errorBox.textContent =
        message;


    productList.appendChild(
        errorBox
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function goHome() {

    window.location.href =
        "index.html";

}


function goAdd() {

    window.location.href =
        "Add.html";

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.clearSearch =
    clearSearch;

window.hideListToast =
    hideListToast;

window.goHome =
    goHome;

window.goAdd =
    goAdd;


/* =========================================================
   DEBUG
========================================================= */

console.log(
    "list.js loaded successfully"
);