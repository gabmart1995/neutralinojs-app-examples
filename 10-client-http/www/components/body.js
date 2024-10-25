class BodyComponent extends HTMLElement {
    constructor() {
        super();

        const title = document.createElement('h2');
        title.innerText = 'Body:';

        const textArea = document.createElement('textarea');
        textArea.name = 'body';
        textArea.className = 'body-request'

        this.appendChild(title);
        this.appendChild(textArea);
    }
}

window.customElements.define('postman-body', BodyComponent);