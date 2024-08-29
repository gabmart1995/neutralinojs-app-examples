/**  Patron observer JS */
class Subject {
    constructor() {
        /** @type {Array<TableObserver | StateObserver | ConstantsObserver>} */
        this.observers = [];
    }

    /**
     * crea las suscripciones al observer
     * @param {TableObserver | StateObserver | ConstantsObserver} observer 
     */
    subscribe(observer) {
        this.observers.push(observer);
    }


    /**
     * elimina las suscripciones al observer
     * @param {TableObserver | StateObserver | ConstantsObserver} observer 
     */
    unsubscribe(observer) {
        this.observers = this.observers.filter(obs => observer !== obs);
    }

    /**
     * funcion que ejecuta todos los observers
     * @param {SpreadSheetSubject} payload instancia de la hoja de calculo
     */
    notify(payload) {
        this.observers.forEach(observer => observer.notify(payload));
    }
}

class SpreadSheetSubject extends Subject {
    constructor(rows = 10, columns = 10) {
        super();

        this.selectedColumn = null;
        this.constants = '';
        this.rows = rows;
        this.columns = columns;
        this.FIRST_CHAR_CODE = 65;
        this.STATE = this.getRange(this.columns)
            .map(() => this.getRange(this.rows).map(() => ({
                computedValue: 0, 
                value: 0
            })));
    }

    /** notifica al padre de los cambios */
    notify() {
        super.notify(this);
    }

    /**
     * obtiene el rango de las cuadriculas
     * @param {number} length longitud del array
     * @returns number[]
     */
    getRange(length) {
        return Array.from({length}, (_, index) => index);
    }

    /**
     * Devuelve el caracter unicode
     * @param {number} index 
     * @returns {string}
     */
    getColumnName(index) {
        return String.fromCharCode(this.FIRST_CHAR_CODE + index);
    }
}

// si existen cambios en la tabla se renderiza el contenido
class TableObserver {
    constructor(tag) {
        this.tag = tag;

        /** @type {HTMLTableElement} */
        this.thead = this.tag.querySelector('thead');

        /** @type {HTMLTableElement} */
        this.tbody = this.tag.querySelector('tbody');
    }

    /**
     * ejecuta la funcion con cambios en la hoja de excel
     * @param {SpreadSheetSubject} subject 
     */
    notify(subject) {
        this.thead.innerHTML = (`
            <tr>
                <th></th>
                ${subject.getRange(subject.columns).map(i => 
                    (`<th>${subject.getColumnName(i)}</th>`)
                ).join('')}
            </tr>
        `);
        
        this.tbody.innerHTML = subject.getRange(subject.rows).map(row => (`
            <tr>
                <td>${row + 1}</td>
                ${subject.getRange(subject.columns).map(column => (`
                    <td data-x="${column}" data-y="${row}">
                        <span>
                            ${subject.STATE[column][row].computedValue}
                        </span>
                        <input 
                            type="text" 
                            value="${subject.STATE[column][row].value}" 
                        />
                    </td>
                `)).join('')}
            </tr>    
        `))
        .join('');
        
        // event listeners
        this.tbody.addEventListener('click', event => {
            const td = event.target.closest('td');
            if (!td) return;

            const {x, y} = td.dataset;

            /** @type {HTMLInputElement} */
            const input = td.querySelector('input');

            /** @type {HTMLSpanElement} */
            const span = td.querySelector('span');

            if (!input || !span) return;

            const end = input.value.length;

            input.setSelectionRange(0, end);
            input.focus();

            input.addEventListener('keydown', event => {
                if (event.key === 'Enter') input.blur();
            });

            input.addEventListener('blur', () => {
                if (Number(input.value) === subject.STATE[x][y].value) return;


                updateCell(
                    subject, 
                    {x, y, value: input.value}
                );
            }, {once: true});
        });

        this.thead.addEventListener('click', event => {
            const th = event.target.closest('th');
            if (!th) return;

            const index = Array.from(th.parentNode.children).indexOf(th);
            if (index <= 0) return;

            subject.selectedColumn = index - 1;

            document.querySelectorAll('.selected')
                .forEach(element => element.classList.remove('selected'));

            th.classList.add('selected');

            // luego seleccionamos todos los hijos de la columna seleccionada
            document.querySelectorAll(`tr td:nth-child(${index + 1})`)
                .forEach(element => element.classList.add('selected'));
        });

        document.addEventListener('keydown', event => {            
            if (event.key === 'Backspace' && subject.selectedColumn !== null) {        
                
                subject.getRange(subject.rows).forEach((row, index, array) => {
                    const notify = index === (array.length - 1);
                    const data = {x: subject.selectedColumn, y: row, value: 0};
                    
                    updateCell(subject, data, notify);
                });    
                
                subject.selectedColumn = null;
            } 
        });

        // event copy
        document.addEventListener('copy', event => {
            if (subject.selectedColumn !== null) {
                const columnValues = subject.getRange(subject.rows).map(row => {
                    return subject.STATE[subject.selectedColumn][row].computedValue;
                });
                
                event.clipboardData.setData('text/plain', columnValues.join('\n'));
                event.preventDefault();
            }
        });

        document.addEventListener('click', event => {
            const {target} = event;

            const isThClicked = target.closest('th');
            const isTdClicked = target.closest('td');

            if (!isTdClicked && !isThClicked) {
                document.querySelectorAll('.selected').forEach(element => element.classList.remove('selected'));
                subject.selectedColumn = null;
            }
        });
    }
}

// actualiza las constantes cuando se actualiza la celda
class ConstantsObserver {
    /**
     * notifca los cambios en el state y actualiza las constantes
     * @param {SpreadSheetSubject} subject 
     */
    notify(subject) {
        subject.constants = subject.STATE.map((rows, x) => {
            return rows.map((cell, y) => {
                const letter = subject.getColumnName(x);
                const cellId = (`${letter.toUpperCase()}${y + 1}`);

                return (`const ${cellId} = ${cell.computedValue};`);
            }).join('\n');
        }).join('\n');

        // console.log(subject.constants);
    }
}

// cuando se actualiza las constantes actualiza el estado
class StateObserver {
    /**
     * Volvemos a computar y calcular los valores
     * @param {SpreadSheetSubject} subject 
     */
    notify(subject) {
        subject.STATE.forEach(rows => {
            rows.forEach(cell => {
                const computedValue = computeValue(cell.value, subject.constants);
                cell.computedValue = computedValue;
            });
        });
    }
}

/**
 * Actualiza la celda
 * @param {SpreadSheetSubject} subject 
 * @param {{x: number, y: number, value: string}} data 
 * @param {boolean} [notify] renderiza la tabla
 */
function updateCell(subject, {x, y, value}, notify = true) {
    const newState = structuredClone(subject.STATE);
    const cell = newState[x][y];
    // const constants = this.generateCellsConstants(subject, newState);

    cell.value = value.length === 0 ? 0 : value;
    cell.computedValue = computeValue(value, subject.constants);

    newState[x][y] = cell;

    subject.STATE = newState;

    // notifcamos todos los cambios
    if (notify) spreadSheetSubject.notify();
}

/**
 * genera el valor computado
 * @param {string} value 
 * @param {string} constants 
 * @returns {string}
 */
function computeValue(value, constants) { 
    if (value[0] !== '=') return value;

    const formula = value.slice(1);
    let computedValue;
    
    const exec = (`
        (() => {
            ${constants}

            return ${formula.toUpperCase()} 
        })();
    `);

    // console.log(exec);

    try {
        computedValue = eval(exec);

    } catch (error) {
        computedValue = `Error: ${error.message}`
    }

    return computedValue;
}


// Initialize Neutralino
Neutralino.init();

// Register event listeners
Neutralino.events.on("windowClose", () => {
    Neutralino.app.exit();
});

const spreadSheetSubject = new SpreadSheetSubject(10, 10);

const tableObserver = new TableObserver(document.querySelector('table'));
const stateObserver = new StateObserver();
const constantsObserver = new ConstantsObserver();

spreadSheetSubject.subscribe(constantsObserver);
spreadSheetSubject.subscribe(stateObserver);
spreadSheetSubject.subscribe(tableObserver);

// inicializa los constantes, computa los valores y construye la tabla
spreadSheetSubject.notify();