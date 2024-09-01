/*
                Function to handle the window close event by gracefully exiting the Neutralino application.
            */
function onWindowClose() {
    Neutralino.app.exit();
}

// Initialize Neutralino
Neutralino.init();
Neutralino.events.on("windowClose", onWindowClose);

const MODES = {
    DRAW: 'draw',
    ERASE: 'erase',
    RECTANGLE: 'reactangle',
    ELLIPSE: 'ellipse',
    PICKER: 'picker'
};

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

const $canvas = $('#canvas');
const ctx = $canvas.getContext('2d');

const $colorPicker = $('#color-picker');
const $clearButton = $('#clear-btn');
const $rectangleButton = $('#rectangle-btn');
const $drawButton = $('#draw-btn');
const $eraseButton = $('#erase-btn');
const $pickerButton = $('#picker-btn');
const $ellipsisButton = $('#ellipse-btn');

// State
let isDrawing = false;
let isShiftPressed = false;
let lastPositionX = 0;
let lastPositionY = 0;
let startPositionX = 0;
let startPositionY = 0;

let mode = MODES.DRAW;
let imageData = null;

// events
$canvas.addEventListener('mousedown', startDrawing);
$canvas.addEventListener('mousemove', draw);
$canvas.addEventListener('mouseup', stopDrawing);
$canvas.addEventListener('mouseleave', stopDrawing);

$colorPicker.addEventListener('change', handleChangeColor);
$clearButton.addEventListener('click', handleClear);

$rectangleButton.addEventListener('click', () => {
    setMode(MODES.RECTANGLE);
});

$ellipsisButton.addEventListener('click', () => {
    setMode(MODES.ELLIPSE);
});

$drawButton.addEventListener('click', () => {
    setMode(MODES.DRAW);
});

$eraseButton.addEventListener('click', () => {
    setMode(MODES.ERASE);
});

$pickerButton.addEventListener('click', () => {
    setMode(MODES.PICKER);
});

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

// Methods
// cambia el modo del UI
async function setMode(newMode) {
    const previousMode = mode;
    mode = newMode;

    const buttonActive = $('button.active');

    if (buttonActive) buttonActive.classList.remove('active');


    if (mode === MODES.RECTANGLE) {
        $rectangleButton.classList.add('active');
        canvas.style.cursor = 'nw-resize';

        // sobreescribe el contexto global del context
        ctx.globalCompositeOperation = 'source-over';

        ctx.lineWidth = 2;

        return;
    }

    if (mode === MODES.ELLIPSE) {
        $ellipsisButton.classList.add('active');
        canvas.style.cursor = 'nw-resize';

        ctx.lineWidth = 2;

        // sobreescribe el contexto global del context
        ctx.globalCompositeOperation = 'source-over';

        return;
    }


    if (mode === MODES.DRAW) {
        $drawButton.classList.add('active');
        canvas.style.cursor = 'crosshair';

        // sobreescribe el contexto global del context
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = 2;

        return;
    }

    if (mode === MODES.ERASE) {
        $eraseButton.classList.add('active');
        canvas.style.cursor = 'url("cursors/erase.png") 0 24, auto';

        // sobreescribe el contexto global del context
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 20;

        return;
    }

    if (mode === MODES.PICKER) {
        $pickerButton.classList.add('active');

        const eyeDropper = new window.EyeDropper();

        try {
            const { sRGBHex } = await eyeDropper.open();

            ctx.strokeStyle = sRGBHex;
            $colorPicker.value = sRGBHex;

            setMode(previousMode);

        } catch (error) {
            console.error(error);

        }

        return;
    }
}

function startDrawing(event) {
    // console.log(event);

    isDrawing = true;
    const { offsetX, offsetY } = event;

    // guardamos las coordenadas actuales
    [lastPositionX, lastPositionY] = [offsetX, offsetY];
    [startPositionX, startPositionY] = [offsetX, offsetY];

    // establecemos una foto
    imageData = ctx.getImageData(0, 0, $canvas.width, $canvas.height);
}

function draw(event) {
    if (!isDrawing) return;

    const { offsetX, offsetY } = event;

    if (mode === MODES.DRAW || mode === MODES.ERASE) {
        // comenzar el trazado
        ctx.beginPath();
        ctx.moveTo(lastPositionX, lastPositionY);

        // dibujar una linea
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();

        // actualizamos las ultimas coordenadas
        [lastPositionX, lastPositionY] = [offsetX, offsetY];

        return;
    }

    if (mode === MODES.RECTANGLE) {
        // sobreescribe la imagen con la posicion inicial
        ctx.putImageData(imageData, 0, 0);

        let width = offsetX - startPositionX;
        let height = offsetY - startPositionY;

        // crea el rectangulo perfecto
        if (isShiftPressed) {
            const sideLength = Math.min(Math.abs(width), Math.abs(height));

            width = width > 0 ? sideLength : -sideLength;
            height = height > 0 ? sideLength : -sideLength;
        }

        ctx.beginPath();
        ctx.rect(startPositionX, startPositionY, width, height);

        ctx.stroke();

        return;
    }

    if (mode === MODES.ELLIPSE) {
        // sobreescribe la imagen con la posicion inicial
        ctx.putImageData(imageData, 0, 0);

        let width = offsetX - startPositionX;
        let height = offsetY - startPositionY;

        if (isShiftPressed) {
            const sideLength = Math.min(Math.abs(width), Math.abs(height));

            width = width > 0 ? sideLength : -sideLength;
            height = height > 0 ? sideLength : -sideLength;
        }

        ctx.beginPath();
        ctx.ellipse(startPositionX, startPositionY, width, height, Math.PI / 4, 0, 2 * Math.PI);

        ctx.stroke();

        return;
    }
}

function stopDrawing(event) {
    isDrawing = false;
}

function handleChangeColor(event) {
    const value = event.target.value;
    ctx.strokeStyle = value;
}

function handleClear() {
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);
}

function handleKeyUp({ key }) {
    if (key === 'Shift') isShiftPressed = false;
}

function handleKeyDown({ key }) {
    isShiftPressed = key === 'Shift';
}

// inicializa la app
setMode(MODES.DRAW);

// api de dropper de google solo se muestra si posee el api
if (!!window.EyeDropper) {
    $pickerButton.style.display = 'block';
}