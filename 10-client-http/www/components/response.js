class ResponseComponent extends HTMLElement {
    static get observedAttributes() {
        return ['status', 'body'];
    }
    
    constructor() {
        super();

        // properties
        this.status = '';
        this.body = '';

        const title = document.createElement('h2');
        title.className = 'response-container-title';

        const span1 = document.createElement('span');
        const span2 = document.createElement('span');

        span1.innerText = 'Response:';
        span2.id = 'status';
        span2.innerText = `status: 0`;

        title.appendChild(span1);
        title.appendChild(span2);

        const responseContainer = document.createElement('pre')
        responseContainer.className = 'response-container';

        const clearButton = document.createElement('button');
        clearButton.className = 'reset-button';
        clearButton.type = 'reset';
        clearButton.innerText = 'Limpiar consulta';

        clearButton.addEventListener('click', this.handleClear.bind(this));

        this.appendChild(title);
        this.appendChild(responseContainer);
        this.appendChild(clearButton);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // console.log({name, oldValue, newValue});

        if (oldValue === newValue) return;

        if (name === 'status') this.status = newValue;

        if (name === 'body') this.body = newValue;

        this.render();
    }

    render() {
        const spanStatus = this.querySelector('#status');
        if (!spanStatus) return;

        const codeElement = this.querySelector('pre');
        if (!codeElement) return;

        codeElement.innerText = '';
        codeElement.innerText = this.body;

        spanStatus.innerText = `status: ${this.status}`;
    }

    handleClear() {
        const spanStatus = this.querySelector('#status');
        if (!spanStatus) return;

        const codeElement = this.querySelector('pre');
        if (!codeElement) return;

        spanStatus.innerText = `status: 0`;
        codeElement.innerText = ''; 
    }
}

window.customElements.define('postman-response', ResponseComponent);