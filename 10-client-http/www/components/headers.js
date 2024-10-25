class Headers extends HTMLElement {
    constructor() {
        super();

        this.fields = [
            {header: '', value: '', description: ''},
            {header: '', value: '', description: ''},
            {header: '', value: '', description: ''}
        ];

        const title = document.createElement('h2')
        title.innerText = 'Headers:';

        const tableElement = document.createElement('table');
        tableElement.className = 'headers-table-form';
        
        const theadElement = document.createElement('thead');
        const tbodyElement = document.createElement('tbody');
        const trElement = document.createElement('tr');
        
        ['Nombre de cabecera:', 'Valor:', 'Descripcion:'].forEach((name) => {
            const th = document.createElement('th');
            th.innerText = name;    
            trElement.appendChild(th);
        });

        this.fields.forEach((field, index) => {
            const trElement = document.createElement('tr');

            // recorremos cada campo
            Object.entries(field).forEach(([key, value]) => {
                const tdElement = document.createElement('td');
                const inputElement = document.createElement('input');
                
                inputElement.name = (`${key}-${index}`);
                inputElement.type = 'text';
                inputElement.value = value;

                tdElement.appendChild(inputElement);
                trElement.appendChild(tdElement);
            });

            tbodyElement.appendChild(trElement);
        });
        
        theadElement.appendChild(trElement);
        tableElement.appendChild(theadElement);
        tableElement.appendChild(tbodyElement);

        this.appendChild(title);
        this.appendChild(tableElement);
    }
}

window.customElements.define('postman-headers', Headers);