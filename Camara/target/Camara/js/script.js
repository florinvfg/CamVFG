window.onload = function () {
    let videoElement = document.querySelector("#camara");
    let takePhotoButton = document.querySelector("#take-photo");
    let clearPhotoButton = document.querySelector("#clear-photo");
    let photoGalery = document.querySelector("#photo-galery");

    // Solicitar acceso a la cámara
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            videoElement.srcObject = stream;
        })
        .catch(error => {
            console.log("Error al acceder a la cámara: " + error);
        });

    // Declaramos un contador de fotos para generar un id y poder borrar o descargar
    let photoIdCounter = getNextPhotoId();

    // ¿Qué pasa si le das click al botón tomar foto?
    takePhotoButton.addEventListener("click", () => {
        // Crear un canvas para tomar la captura
        const canvas = document.createElement("canvas");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const context = canvas.getContext("2d");
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Convertir en una imagen a base 64 y guardarla en el navegador
        const dataUrl = canvas.toDataURL("image/jpeg", 0.90);
        const photoId = photoIdCounter++;
        guardarFoto({ id: photoId, dataUrl });
        setNextPhotoId(photoIdCounter);
    });

    function guardarFoto(photo, isFromLoad = false) {
        const photoContainer = document.createElement("div");
        photoContainer.className = "photo-container";
        photoContainer.dataset.id = photo.id;

        const img = new Image();
        img.src = photo.dataUrl;
        img.className = "photo";

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "photo-buttons";

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("css-button-sliding-to-left--rose");
        deleteButton.textContent = "Eliminar";
        deleteButton.addEventListener("click", () => {
            eliminarPhoto(photo.id);
        });

        const downloadButton = document.createElement("button");
        downloadButton.classList.add("css-button-sliding-to-left--rose");
        downloadButton.textContent = "Descargar";
        downloadButton.addEventListener("click", () => {
            descargarPhoto(photo.dataUrl, `foto-${photo.id}.jpg`);
        });

        buttonContainer.appendChild(downloadButton);
        buttonContainer.appendChild(deleteButton);
        photoContainer.appendChild(img);
        photoContainer.appendChild(buttonContainer);
        photoGalery.appendChild(photoContainer);

        if (!isFromLoad) {
            const fotos = JSON.parse(localStorage.getItem("fotos")) || [];
            fotos.push(photo);
            localStorage.setItem("fotos", JSON.stringify(fotos));
        }
    }

    function eliminarPhoto(id) {
        const photoContainer = document.querySelector(`.photo-container[data-id="${id}"]`);
        if (photoContainer) {
            photoGalery.removeChild(photoContainer);
        }
        let fotos = JSON.parse(localStorage.getItem("fotos")) || [];
        fotos = fotos.filter(photo => photo.id !== id);
        localStorage.setItem("fotos", JSON.stringify(fotos));
    }

    function descargarPhoto(dataUrl, nombreArchivo) {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    clearPhotoButton.addEventListener("click", () => {
        localStorage.removeItem("fotos");
        while (photoGalery.firstChild) {
            photoGalery.removeChild(photoGalery.firstChild);
        }
        photoIdCounter = 0;
        setNextPhotoId(photoIdCounter);
    });

    const fotosGuardadas = JSON.parse(localStorage.getItem("fotos")) || [];
    fotosGuardadas.forEach(photo => {
        guardarFoto(photo, true);
    });

    function getNextPhotoId() {
        return JSON.parse(localStorage.getItem("photoIdCounter")) || 0;
    }

    function setNextPhotoId(counter) {
        localStorage.setItem("photoIdCounter", JSON.stringify(counter));
    }
};
