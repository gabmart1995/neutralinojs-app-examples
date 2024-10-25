class FormPayloadComponent extends HTMLElement {
    constructor() {
        super();

        this.options = ['headers', 'body'];
        this.optionSelected = this.options[1];

        this.contentElement = document.createElement('div');
        this.contentElement.id = 'content-menu';
        this.contentElement.style.padding = '20px 0';
        this.contentElement.innerHTML = (`
            <postman-headers></postman-headers>
            <postman-body></postman-body>
            <postman-response></postman-response>
        `);
        
        this.appendChild(this.contentElement);
    }
}

window.customElements.define('postman-payload-form', FormPayloadComponent);