
/*
    Function to handle the window close event by gracefully exiting the Neutralino application.
*/
function onWindowClose() {
    Neutralino.app.exit();
}

// Initialize Neutralino
Neutralino.init();

// Register event listeners
Neutralino.events.on("windowClose", onWindowClose);

Neutralino.extensions.getStats()
    .then(console.log)
    .catch(console.error);

Neutralino.events.on('getUserDirectory', data => {
    console.log(data);
});

Neutralino.events.on('ready' , () => {
    console.log('ready');
    Neutralino.extensions.dispatch('js.neutralino.filepath', 'getUserDirectory', null)
        .then(console.log);
});