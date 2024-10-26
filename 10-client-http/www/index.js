import './components/body.js';
import './components/headers.js';
import './components/form-request.js';
import './components/form-payload.js';
import './components/response.js';

// const {init, events, app} = Neutralino;
const HEADERS_FIELDS = 3;

// inicializamos la libreria
/*init();

events.on('windowClose', () => {
    app.exit();
});*/

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
    
    /** @type {{
     *  url: string,
     *  method: string,
     *  "value-0": string,
     *  "value-1": string,
     *  "value-2": string,
     *  "header-0": string,
     *  "header-1": string,
     *  "header-2": string,
     *  "description-0": string
     *  "description-1": string
     *  "description-2": string
     * }} */
    const data = Array
        .from(formData.entries())
        .reduce((acum, [key, value]) => {
            acum[key] = value;
            return acum;
        }, {});

    // extraemos y clasificamos los headers
    /** @type {HeadersInit} */
    const headers = {};

    for (let i = 0; i < HEADERS_FIELDS; i++) {
        Object.entries(data).forEach(([key, value]) => {
            
            /** @type {string} */
            const valueData = data['value-' + i.toString()];
            const hasHeaderInfo = ((new RegExp(`^header-${i}$`).test(key)) && valueData.length > 0); 
            
            if (hasHeaderInfo) headers[value] = data['value-' + i.toString()];
        });
    }

    // obtenemos la referencia del elemento DOM
    const responseElement = document.querySelector('postman-response');
    if (!responseElement) return;

    // construimos la peticion
    const request = new Request(data.url, {
        headers,
        method: data.method,
    });

    // ejecutamos la peticion
    fetch(request)
        .then(response => {
            if (!response.ok) throw new Error('Revisa la conexion a internet o no se tiene acceso CORS');
        
            // establecemos los datos de la metadata de la peticion
            responseElement.setAttribute('status', response.status.toString());

            // transforma el body
            return response.text();
        })
        .then(data => responseElement.setAttribute('body', data))
        .catch(error => alert(error));
}

window.addEventListener('DOMContentLoaded', main);