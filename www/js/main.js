Neutralino.init();
Neutralino.events.on("windowClose", () => Neutralino.app.exit());

// funcion main
(() => {
    /**
     * manejador del boton
     * @param {string} value valor del boton
     */
    const handleClick = value => {
        if (!input) return;

        if (value === '=') {
            calculateOperation();
            return;
        }

        if (value === 'C') {

            if (input.value.length > 1)  {
                input.value = input.value.substring(0, (input.value.length - 1));
                return;
            }
            
            input.value = '0';
            return;
        }

        if (value === 'AC') {
            input.value = '0'
            return;
        };

        // si es un digito concatena a la derecha
        if (input.value === '0') {
            input.value = value;
            return 
        } 
        
        input.value += value;
    };

    /** metodo que calcula la operacion */
    const calculateOperation = () => {
        if (!input) return;

        /**
         * Orden de las operaciones
         * 1.- multiplicacion
         * 2.- division
         * 3.- suma 
         * 4.- resta
         */

        // eliminamos los espacios en blanco
        const operation = input.value.trim();

        // debemos extraer las operaciones usamos regex
        let symbols = operation.match(/[\+\-\/x]+/g);
        let values = operation.match(/\d+/g);

        // en caso en que no haya operaciones o valores
        // se conserva el valor del input
        if (!symbols || !values) {
            input.value = operation;
            return;
        }

        // algoritmo de shunting yard
        // tomando en precedencia los signos

        /** @type {string[]} */
        const stackOperators = [];

        /** @type {string[]} */
        const exit = [];

        // recorremos cada digito de la operacion
        for (let i = 0; i < operation.length; i++) {
            const caracter = operation[i];
            const isNumber = !isNaN(caracter);

            if (isNumber) {
                let number = caracter;
    
                // si el siguiente es un numero y no es ultimo caracter
                // contatena el string o es un digito decimal
                while (
                    (((i + 1) < operation.length) && 
                    !isNaN(operation[i + 1])) || 
                    (operation[i + 1] === '.') // en caso de que llegue decimal
                ) {
                    // console.log(i);
                    number += operation[++i];
                }
                
                // si es numero push al exit stack
                exit.push(number);
                
                continue;
            }

            // si el caracter es un parentesis abierto aplilamos en el stack
            if (caracter === '(') {
                stackOperators.push(caracter);
                
                continue;
            }

            // si es parentesis cerrado
            if (caracter === ')') {

                // buscamos el parentesis abierto y desapilamos del stack
                // hasta encontrar el parentesis abierto  
                while ((stackOperators.length > 0) && (stackOperators[stackOperators.length - 1] !== '(')) {
                    exit.push(stackOperators.pop());
                }

                stack.pop(); // elimina el parentesis abierto del stack
                
                continue;
            }

            // en este punto hay que determinar el orden de precedencia
            // para reordenar la salida
            while (
                (stackOperators.length > 0) && 
                (determinePrecedence(stackOperators[stackOperators.length - 1]) >= determinePrecedence(caracter))
            ) {
                exit.push(stackOperators.pop());
            }

            // si es un operador push token al stack
            stackOperators.push(caracter);
        }

        // desapilamos los operadores restantes
        while (stackOperators.length > 0) {
            exit.push(stackOperators.pop());
        }


        // evaluamos la salida
        try {
            input.value = evaluateRPN(exit);
            
        } catch (error) {
            console.error(error);
            input.value = 'No se puede realizar la operacion';
        }
    };

    /**
     * Funcion que determina la procedencia del operador
     * @param {string} operator operador aritmetico
     * 
     */
    const determinePrecedence = operator => {
        switch (operator) {
            case '+':
                return 1;
            
            case '-':
                return 1;

            case 'x':
                return 2;

            case '/':
                return 2;

            default:
                return 0;
        }
    };

    /**
     * genera la salida con la expresion en notacion polaca inversa
     * @param {string[]} rpn evalua los stacks y salida de la ordenacion
     */
    const evaluateRPN = rpn => {
        /** @type {number[]} */
        const stack = [];

        // console.log(rpn);

        for (let i = 0; i < rpn.length; i++) {
            let token = rpn[i];
            const isNumber = !isNaN(token);

            if (isNumber) {
                stack.push(Number.parseFloat(token));
                
                continue;
            }

            let number2 = stack.pop();
            let number1 = stack.pop();

            // evaluamos la expresion
            switch (token) {
                case '+':
                    stack.push(number1 + number2);
                    
                    break;

                case '-':
                    stack.push(number1 - number2);
                    
                    break;

                case 'x':
                    stack.push(number1 * number2);
                    
                    break;

                case '/':
                    if (number2 === 0) throw 'No se puede dividir entre 0';

                    stack.push(number1 / number2);

                    break;
            }
        }

        // extraemos el resultado en la posicion 0
        return stack[0];
    };

    const buttons = document.querySelectorAll('button');
    const input = document.querySelector('input');

    if (buttons.length === 0) return

    buttons.forEach(button => {
        button.addEventListener('click', event => handleClick(event.target.innerText));
    });
})();