import './components/body.js';
import './components/headers.js';
import './components/form-request.js';
import './components/form-payload.js';
import './components/response.js';

const {init, events, app} = Neutralino;

// inicalizamos la libreria
init();

events.on('windowClose', () => {
    app.exit();
});


const main = () => {
    const formElement = document.querySelector('#request-form');
    if (!formElement) return;

    formElement.addEventListener('submit', handleSubmit);
}

/**
 * evento principal del formulario de peticiones
 * @param {SubmitEvent} event 
 */
const handleSubmit = event => {
    event.preventDefault();
    
    // recogemos toda la informacion
    const formData = new FormData(event.target);
    const data = Array
        .from(formData.entries())
        .reduce((acum, [key, value]) => {
            acum[key] = value;
            return acum;
        }, {});

    // extraemos los headers
    const headers = {};
    const quantityFields = 3;

    for (let i = 0; i < quantityFields; i++) {
        Object.entries(data).forEach(([key, value]) => {
            
            /** @type {string} */
            const valueData = data['value-' + i.toString()];
            const hasHeaderInfo = ((new RegExp(`^header-${i}$`).test(key)) && valueData.length > 0); 
            
            if (hasHeaderInfo) {
                headers[value] = data['value-' + i.toString()]
            } 
        });
    }

    // construimos la peticion
    const request = new Request(data.url, {
        headers,
        method: data.method,
    });

    console.log({request, data});
}

window.addEventListener('DOMContentLoaded', main);