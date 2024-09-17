/*
    Function to handle the window close event by gracefully exiting the Neutralino application.
*/

// construinmos un objeto que contenga todas las refencias de la interfaz
/**@type {{[key: string]: HTMLSpanElement | HTMLDivElement | null}} */
const elementsUI = {};

/** instancia de la animacion de la onda */
let wave = null;

function onWindowClose() {
    Neutralino.app.exit();
}

// Initialize Neutralino
Neutralino.init();
Neutralino.events.on("windowClose", onWindowClose);

class Player {

    /** @type {{title: string, file: string, howl: any}[]}  */
    playlist = [];
    
    index = 0;

    /**
     * constructor
     * @param {{title: string, file: string, howl: any}[]} playlist 
     */
    constructor(playlist = []) {
        this.playlist = playlist;

        if (this.playlist.length === 0) {
            elementsUI['track'].innerHTML = (`No track`);
            return;
        }

        this.createPlayList();
    }

    createPlayList() {
        elementsUI['list'].innerHTML = '';

        this.playlist.forEach(song => {
            const div = document.createElement('div');
            div.className = 'list-song';
            div.innerHTML = song.title;

            div.addEventListener('click', () => {
                this.skipTo(this.playlist.indexOf(song));
            });

            elementsUI['list'].appendChild(div);
        });
    }

    /**
     * Reproduce una cancion de la playlist
     * @param {number} [index] numero de la pista 
     */
    play(index = this.index) {
        const self = this;

        if (typeof index !== 'number') return;

        // extraemos la pista del listado
        const data = self.playlist[index];

        // comprobamos si existe una instancia de howl.js
        if (!data.howl) {
            data.howl = new Howl({
                src: [
                    `audio/${data.file}.webm`, // soporte de audio en la web
                    `audio/${data.file}.mp3`
                ],
                html5: true,
                onplay: function() {
                    

                    elementsUI['duration'].innerHTML = self.formatTime(
                        Math.round(data.howl.duration())
                    );

                    requestAnimationFrame(self.step.bind(self));

                    // inicia la animacion de la onda
                    wave.container.style.display = 'block';
                    elementsUI['bar'].style.display = 'none';
                    elementsUI['pauseBtn'].style.display = 'block';
                },
                onload: function() {
                    wave.container.style.display = 'block';
                    elementsUI['bar'].style.display = 'none';
                    elementsUI['loading'].style.display = 'none';
                },
                onend: function() {
                    wave.container.style.display = 'none';
                    elementsUI['bar'].style.display = 'block';

                    // pasa a la siguiente pista
                    self.skip('next');
                },
                onpause: function() {
                    // detenemos la animacion
                    wave.container.style.display = 'none';
                    elementsUI['bar'].style.display = 'block';
                },
                onstop: function() {
                    // detenemos la animacion
                    wave.container.style.display = 'none';
                    elementsUI['bar'].style.display = 'block';
                },
                onseek: function() {
                    requestAnimationFrame(self.step.bind(self));
                }
            });
        }
        
        // inicia la reproduccion
        data.howl.play();

        // actualiza el display
        elementsUI['track'].innerHTML = `${index + 1}. ${data.title}`;

        if (data.howl.state() === 'loaded') {
            elementsUI['playBtn'].style.display = 'none';
            elementsUI['pauseBtn'].style.display = 'block';

        } else {
            elementsUI['loading'].style.display = 'block';
            elementsUI['playBtn'].style.display = 'none';
            elementsUI['pauseBtn'].style.display = 'block';

        }

        // actualizamos el indice del playlist
        self.index = index;
    }

    pause() {
        const sound = this.playlist[this.index].howl;

        // pause
        sound.pause();

        elementsUI['playBtn'].style.display = 'block';
        elementsUI['pauseBtn'].style.display = 'none';
    }

    /**
     * salta a la siguiente pista
     * @param {'prev'|'next'} direction 
     */
    skip(direction) {
        let index = 0;

        if (direction === 'prev') {
            index = this.index - 1;

            // actualiza la ultima posicion
            if (index < 0) index = this.playlist.length - 1;
        
        } else {
            index = this.index + 1;

            // vuelve a la primera posicion
            if (index >= this.playlist.length) index = 0;
        }

        this.skipTo(index);
    }

    /**
     * salta a una pista especifica basado en el indice del array
     * @param {number} index
     */
    skipTo(index) {

        // si hay una pista montada la detiene
        if (this.playlist[this.index].howl) {
            this.playlist[this.index].howl.stop();
        }

        // limpia el progreso
        elementsUI['progress'].style.width = '0%';

        // reproduce la pista
        this.play(index);
    }

    /** 
     * establece la posicion del elemento reproducido 
     * @param {number} percentage
     * */
    seek(percentage) {
        const sound = this.playlist[this.index].howl;

        if (sound.playing()) sound.seek(sound.duration() * percentage);
    }

    /** actualiza el temporizador de la duracion */
    step() {
        const sound = this.playlist[this.index].howl;
        const seek = sound.seek() || 0;
        
        elementsUI['timer'].innerHTML = this.formatTime(Math.round(seek));
        elementsUI['progress'].style.width = (((seek / sound.duration()) * 100) || 0) + '%';

        if (sound.playing()) requestAnimationFrame(this.step.bind(this));
    }

    /**
     * Formatea el tiempo de reproduccion M:SS
     * @param {number} secounds Segundos por formatear
     * @returns {string} 
    */
    formatTime(secounds) {
        const minutes = Math.floor(secounds / 60) || 0;
        const secs = (secounds - minutes * 60) || 0;

        return (`${minutes}:${secs < 10 ? '0': ''}${secs}`);
    }

    /** muestra la lista de reproduccion */
    togglePlayList() {
        const playlist = elementsUI['playlist'];
        const display = (playlist.style.display === 'block') ? 'none' : 'block';

        setTimeout(
            () => playlist.style.display = display,
            (display === 'block') ? 0 : 500
        );
        
        // ajustamos la animacion
        playlist.className = (display === 'block') ? 'fadein' : 'fadeout';
    }

    /** muestra la barra del volumen */
    toggleVolume() {
        const voulume = elementsUI['volume'];
        const display = (voulume.style.display === 'block') ? 'none' : 'block';

        setTimeout(
            () => voulume.style.display = display,
            (display === 'block') ? 0 : 500
        );
        
        // ajustamos la animacion
        voulume.className = (display === 'block') ? 'fadein' : 'fadeout';
    }

    /**
     * Establece el volumen del reproductor
     * @param {number} value 
     */
    volume(value) {
        // actualiza el volumen global en cada una de las instancias
        // de howler
        Howler.volume(value);

        // actualiza el slider
        let barWidth = (value * 90) / 100;

        elementsUI['barFull'].style.width = `${barWidth * 100}%`;
        elementsUI['sliderBtn'].style.left = `${window.innerWidth * barWidth + window.innerWidth * 0.05 - 25}px`;
    }
}

/**
 * funcion responsive que actualiza el tamano de la onda dependiendo del dispositivo
 */
function resize() {
    let height = window.innerHeight * 0.3;
    let width = window.innerWidth;
    
    wave.height = height;
    wave.height_2 = height / 2;
    wave.MAX = wave.height_2 - 4;
    wave.width = width;
    wave.width_2 = width / 2;
    wave.width_4 = width / 4;
    wave.canvas.height = height;
    wave.canvas.width = width;
    wave.container.style.margin = -(height / 2) + 'px auto';
}


function main() {
    const elements = ['track', 'timer', 'duration', 'playBtn', 'pauseBtn', 'prevBtn', 'nextBtn', 'playlistBtn', 'volumeBtn', 'progress', 'bar', 'waveform', 'loading', 'playlist', 'list', 'volume', 'barEmpty', 'barFull', 'sliderBtn'];
    
    // obtenemos los elementos DOM
    elements.forEach(element => elementsUI[element] = document.getElementById(element));

    /** creamos la instancia del reproductor */
    const player = new Player([
        {
            title: 'Rave Digger',
            file: 'rave_digger',
            howl: null
        },
        {
            title: '80s Vibe',
            file: '80s_vibe',
            howl: null
        },
        {
            title: 'Running Out',
            file: 'running_out',
            howl: null
        },
        {
            title: 'Denise Julia BAD',
            file: 'denise_julia_bad',
            howl: null
        }
    ]);

    const move = event => {
        if (window.sliderDown) {
            let x = event.clientX || event.touches[0].clientX;
            let startX = window.innerWidth * 0.05;
            let layerX = x - startX;
    
            let percentage = Math.min(1, Math.max(0, layerX / parseFloat(elementsUI['barEmpty'].scrollWidth)));
            player.volume(percentage);
        }
    };

    // eventos
    elementsUI['playBtn'].addEventListener('click', () => {
        player.play();
    });

    elementsUI['pauseBtn'].addEventListener('click', () => {
        player.pause();
    });

    elementsUI['prevBtn'].addEventListener('click', () => {
        player.skip('prev');
    });

    elementsUI['nextBtn'].addEventListener('click', () => {
        player.skip('next');
    });

    elementsUI['waveform'].addEventListener('click', event => {
        player.seek(event.clientX / window.innerWidth);
    });

    elementsUI['playlistBtn'].addEventListener('click', () => {
        player.togglePlayList();
    });

    elementsUI['playlist'].addEventListener('click', () => {
        player.togglePlayList();
    });

    elementsUI['volumeBtn'].addEventListener('click', () => {
        player.toggleVolume();
    });

    elementsUI['volume'].addEventListener('click', () => {
        player.toggleVolume();
    });

    // inicializamos los eventos para habilitar el volumen slider
    elementsUI['barEmpty'].addEventListener('click', event => {
        const percentage = event.layerX / parseFloat(elementsUI['barEmpty'].scrollWidth);
        player.volume(percentage);
    });

    elementsUI['sliderBtn'].addEventListener('mousedown', () => {
        window.sliderDown = true;
    });

    elementsUI['sliderBtn'].addEventListener('touchstart', () => {
        window.sliderDown = true;
    });

    elementsUI['volume'].addEventListener('mouseup', () => {
        window.sliderDown = false;
    });

    elementsUI['volume'].addEventListener('touchend', () => {
        window.sliderDown = false;
    });

    elementsUI['volume'].addEventListener('mousemove', move);
    elementsUI['volume'].addEventListener('touchmove', move);

    // wave animation
    wave = new SiriWave({
        container: elementsUI['waveform'],
        width: window.innerWidth,
        height: window.innerHeight * 0.3,
        cover: true,
        speed: 0.03,
        amplitude: 0.7,
        frequency: 2
    });

    wave.start();

    window.addEventListener('resize', resize);
    resize();
}

main();