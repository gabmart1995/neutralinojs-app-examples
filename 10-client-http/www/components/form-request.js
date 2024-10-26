class FormRequestComponent extends HTMLElement {
    constructor() {
        super();

        const divElement = document.createElement('div');
        divElement.className = 'request-form';

        const selectElement = document.createElement('select');
        selectElement.name = 'method';
        [
            {method: 'GET', color: 'green'}, 
            {method: 'POST', color: 'yellow'}, 
            {method: 'PUT', color: 'blue'},
            {method: 'PATCH', color: 'cyan'}, 
            {method: 'DELETE', color: 'red'}
        ]
        .forEach(({method, color}) => {
            const option = document.createElement('option');
            option.value = method;
            option.innerText = method;
            option.style.color = color;

            selectElement.appendChild(option);
        });

        const inputElement = document.createElement('input');
        inputElement.name = 'url';
        inputElement.type = 'url';
        inputElement.autocomplete = 'off';

        const buttonElement = document.createElement('button');
        buttonElement.className = 'send-button'
        buttonElement.type = 'submit';
        buttonElement.innerText = 'Enviar';

        divElement.appendChild(selectElement);
        divElement.appendChild(inputElement);
        divElement.appendChild(buttonElement);

        this.appendChild(divElement);
    }
}

window.customElements.define('postman-request-form', FormRequestComponent);