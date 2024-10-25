class ResponseComponent extends HTMLElement {
    constructor() {
        super();

        const title = document.createElement('h2');
        title.innerText = 'Response:';

        const responseContainer = document.createElement('div')
        responseContainer.className = 'response-container';

        this.appendChild(title);
        this.appendChild(responseContainer);
    }
}

window.customElements.define('postman-response', ResponseComponent);