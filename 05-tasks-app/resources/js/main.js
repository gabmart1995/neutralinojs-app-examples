const EXTENSION_NAME = 'js.neutralino.sqlite3extension';

/*
    Function to handle the window close event by gracefully exiting the Neutralino application.
*/
const onWindowClose = () => {
    Neutralino.extensions.dispatch(EXTENSION_NAME, 'dbDisconnect', null)
        .then(() => Neutralino.app.exit())
        .catch(console.error);
}


// app
const main = () => {
    const form = document.querySelector('form');
    if (!form) return;

    const completedCheck = form.querySelector('#completed');
    if (!completedCheck) return;

    const tasksBody = document.querySelector('#tasks');
    if (!tasksBody) return;

    form.addEventListener('submit', event => {
        const data = Object.fromEntries(new FormData(event.target));
        data.completed = completedCheck.checked;

        console.log(data);

        event.preventDefault();
    })
}

// Initialize Neutralino
Neutralino.init();

// Register event listeners
Neutralino.events.on("windowClose", onWindowClose);
Neutralino.events.on('dbConnectSuccessful', event => {
    console.log(event);
});

// iniciamos las extensiones
// junto a la conexion a la base de datos
Neutralino.extensions.getStats()
    .then(stats => {
        if (stats.connected.includes(EXTENSION_NAME)) {
            return Neutralino.extensions.dispatch(EXTENSION_NAME, 'dbConnect', null);
        } 

        throw new Error('la extension de base de datos falló')
    })
    .then(main)
    .catch(console.error)

