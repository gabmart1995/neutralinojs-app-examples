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
    const regex = {
        TEXT: /^[A-Za-z0-9\s]*$/       
    };

    const form = document.querySelector('form');
    if (!form) return;

    const completedCheck = form.querySelector('#completed');
    if (!completedCheck) return;

    // listeners
    form.addEventListener('submit', event => {
        event.preventDefault();
        
        const data = Object.fromEntries(new FormData(event.target));
        data.completed = completedCheck.checked ? 1 : 0;

        // validation
        if (!regex.TEXT.test(data.title)) {
            console.error('El campo titulo es incorrecto')
            return;
        }
        
        if (!regex.TEXT.test(data.description)) {
            console.error('El campo descricion es incorrecto')
            return;
        }

        const date = new Date();
        let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate().toString();
        
        let mounth = date.getMonth() + 1;
        mounth = mounth < 10 ? '0' + mounth : mounth.toString(); 

        let year = date.getFullYear().toString();

        const dateString = (`${mounth}-${day}-${year}`);

        const SQL = `INSERT INTO tasks VALUES (NULL, "${data.title}", "${data.description}", ${data.completed}, "${dateString}", "${dateString}");`
        
        // mandamos a la base de datos
        // si inserta correctamente leemos los registros
        Neutralino.extensions.dispatch(EXTENSION_NAME, 'write', SQL)
            .then(() => {
                const SQL = 'SELECT * FROM tasks';
                
                // solicitamos la lectura de BD
                return Neutralino.extensions.dispatch(
                    EXTENSION_NAME, 
                    'read', 
                    SQL
                );
            })
            .then(() => {
                console.log('consulta realizada con exito');
            })
            .catch(console.error);
    });

    // consultamos si existen registros de tareas existentes
    Neutralino.extensions.dispatch(EXTENSION_NAME, 'read', 'SELECT * FROM tasks');
}

// Initialize Neutralino
Neutralino.init();

// Register event listeners
Neutralino.events.on("windowClose", onWindowClose);

Neutralino.events.on('dbConnectSuccessful', event => {
    //console.log(event);

    const stateContainer = document.querySelector('#state');
    if (!stateContainer) return;

    stateContainer.innerHTML = event.detail.message;
    stateContainer.style = '--state: green';
});

Neutralino.events.on('tasks', event => {
    const tasks = event.detail;

    const tasksBody = document.querySelector('#tasks');
    if (!tasksBody) return;

    if (!Array.isArray(tasks)) {
        tasksBody.innerHTML = (`
            <tr>
                <td colspan="6" style="text-align: center">No se hallaron registros</td>
            <tr>    
        `)

        return;
    }

    tasksBody.innerHTML = tasks.map(task => (`
        <tr>
            <td>${task.id}</td>
            <td>${task.title}</td>
            <td>${task.description}</td>
            <td>${task.completed === 0 ? 'No completado' : 'Completado'}</td>
            <td>${task.created_at}</td>
            <td>${task.updated_at}</td>
        </tr>    
    `))
    .join('');
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

