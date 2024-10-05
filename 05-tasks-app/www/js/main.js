/** nombre de la extension */
const EXTENSION_NAME = 'js.neutralino.sqlite3extension';
const {extensions, init, os, events} = Neutralino;

/*
    Function to handle the window close event by gracefully exiting the Neutralino application.
*/
const onWindowClose = () => {
    extensions.dispatch(EXTENSION_NAME, 'dbDisconnect', null)
        .then(() => Neutralino.app.exit())
        .catch(console.error);
}

/** genera las fechas */
const generateDate = () => {
    const date = new Date();
    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate().toString();
    
    let mounth = date.getMonth() + 1;
    mounth = mounth < 10 ? '0' + mounth : mounth.toString(); 

    let year = date.getFullYear().toString();

    const dateString = (`${mounth}-${day}-${year}`);

    return dateString
}

/** inicio de la app */
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

        const dateString = generateDate();
        const SQL = `INSERT INTO tasks VALUES (NULL, "${data.title}", "${data.description}", ${data.completed}, "${dateString}", "${dateString}");`
        
        // mandamos a la base de datos
        // si inserta correctamente leemos los registros
        extensions.dispatch(EXTENSION_NAME, 'write', SQL)
            .then(() => {
                const SQL = 'SELECT * FROM tasks';
                
                // solicitamos la lectura de BD
                return extensions.dispatch(
                    EXTENSION_NAME, 
                    'read', 
                    SQL
                );
            })
            .then(() => {
                console.log('consulta realizada con exito');
                form.reset();
            })
            .catch(console.error);
    });

    // consultamos si existen registros de tareas existentes
    extensions.dispatch(EXTENSION_NAME, 'read', 'SELECT * FROM tasks');
}

// Initialize Neutralino
init();

// Register event listeners
events.on("windowClose", onWindowClose);

events.on('dbConnectSuccessful', event => {
    //console.log(event);

    const stateContainer = document.querySelector('#state');
    if (!stateContainer) return;

    stateContainer.innerHTML = event.detail.message;
    stateContainer.style = '--state: green';
});

events.on('tasks', event => {
    const tasks = event.detail;

    const tasksBody = document.querySelector('#tasks');
    if (!tasksBody) return;

    if (!Array.isArray(tasks)) {
        tasksBody.innerHTML = (`
            <tr>
                <td colspan="7" style="text-align: center">
                    No se hallaron registros
                </td>
            <tr>    
        `)

        return;
    }

    tasksBody.innerHTML = tasks.map(task => {
        return (`
            <tr>
                <td>${task.id}</td>
                <td>${task.title}</td>
                <td>${task.description}</td>
                <td>
                    <input 
                        type="checkbox" 
                        ${task.completed === 1 ? 'checked' : ''} 
                        class="check w3-check"
                    />
                </td>
                <td>${task.created_at}</td>
                <td>${task.updated_at}</td>
                <td>
                    <button class="delete w3-button w3-red">Eliminar</button>
                </td>
            </tr>    
        `)
    })
    .join('');

    // añadimos los eventos
    const inputs = document.querySelectorAll('.check');
    if (inputs.length === 0) return;

    const buttonDelete = document.querySelectorAll('.delete');
    if (buttonDelete.length === 0) return;

    inputs.forEach(input => {
        input.addEventListener('change', event => {
            const { checked } = event.target;

            const idTask = event.target.parentNode.parentNode.children[0].innerText;
            const completed = checked ? 1 : 0;
            const dateString = generateDate();

            const SQL = (`UPDATE tasks SET completed=${completed}, updated_at="${dateString}" WHERE id=${idTask}`);

            extensions.dispatch(EXTENSION_NAME, 'write', SQL)
                .then(() => {
                    const SQL = 'SELECT * FROM tasks';
                
                    // solicitamos la lectura de BD
                    return extensions.dispatch(
                        EXTENSION_NAME, 
                        'read', 
                        SQL
                    );
                })
                .then(() => {
                    // console.log('consulta realizada con exito');
                    // no va a funcionar no soporta el entono xfce                    
                    return os.showNotification(
                        'Success', 
                        'Consulta realizada con éxito'
                    );
                })
                .catch(console.error);
        });
    });

    buttonDelete.forEach(button => {
        button.addEventListener('click', event => {
            const idTask = event.target.parentNode.parentNode.children[0].innerText;
            const SQL = `DELETE FROM tasks WHERE id = ${idTask}`;

            extensions.dispatch(EXTENSION_NAME, 'write', SQL)
                .then(() => {
                    const SQL = 'SELECT * FROM tasks';
                
                    // solicitamos la lectura de BD
                    return extensions.dispatch(
                        EXTENSION_NAME, 
                        'read', 
                        SQL
                    );
                })
                .then(() => {
                    // console.log('consulta realizada con exito');
                    // no va a funcionar no soporta el entono xfce                    
                    return os.showNotification(
                        'Success', 
                        'Consulta realizada con éxito'
                    );
                })
                .catch(console.error);
        }, {once: true});
    })
});

// iniciamos las extensiones
// junto a la conexion a la base de datos
extensions.getStats()
    .then(stats => {
        if (stats.connected.includes(EXTENSION_NAME)) {
            return extensions.dispatch(EXTENSION_NAME, 'dbConnect', null);
        } 

        throw new Error('la extension de base de datos falló')
    })
    .then(main)
    .catch(console.error);