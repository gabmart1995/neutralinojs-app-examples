/*
    Function to handle the window close event by gracefully exiting the Neutralino application.
*/
function onWindowClose() {
    Neutralino.app.exit();
}

// Initialize Neutralino
Neutralino.init();
Neutralino.events.on("windowClose", onWindowClose);

(function () {
    const buttonUpload = document.querySelector('#upload-btn');
    if (!buttonUpload) return;

    buttonUpload.addEventListener('click', () => {
        Neutralino.os.showOpenDialog('Selecciona archivo', {defaultPath: '.'})
            .then(console.log)
            .catch(console.error)
    });
})();