const {elementos_gui} = require('./utilidades');
const {ipcRenderer} = require('electron');

class Temporizador {
    constructor(modo, minutos) {
        this.minutos = minutos;
        this.modo = modo;
        this.cuentaRegresiva = null;
        this.enEjecucion = false;
        this.id = null;
    }

    contador() {
        if (!this.enEjecucion) {
            clearInterval(this.id);
            return;
        }

        if (this.cuentaRegresiva == null) {
            this.cuentaRegresiva = this.minutos * 60 * 1000;
        }

        this.id = setInterval(() => {
            if (this.enEjecucion === true) {
                this.cuentaRegresiva -= 1000;

                let minutos = Math.floor(this.cuentaRegresiva / (60 * 1000));
                let segundos = Math.floor((this.cuentaRegresiva - (minutos * 60 * 1000)) / 1000);

                if (this.cuentaRegresiva <= 0) {
                    this.detener();

                    if (this.modo == 'concentrado') {
                        ipcRenderer.send('CuentaRegresivaCompletada');
                    } else if (this.modo == 'break') {
                        ipcRenderer.send('CerrarVentanaBreak');
                        ipcRenderer.send('AplicacionMaximizar');
                        ipcRenderer.send('IniciarSiguienteIteracion');
                    }
                } else if (this.cuentaRegresiva === 5000) {
                    this.renderizarMinutosSegundos(minutos, segundos)
                    ipcRenderer.send('AlertaBreak', this.modo);
                } else {
                    this.renderizarMinutosSegundos(minutos, segundos);
                }
            }
        }, 1000);
    }

    iniciar() {
        this.enEjecucion = true;
        this.contador();
    }

    pausar() {
        this.enEjecucion = false;
        clearInterval(this.id);
    }

    detener() {
        this.cuentaRegresiva = null;
        clearInterval(this.id);
        this.id = null;
        this.enEjecucion = false;
    }

    renderizarMinutosSegundos(minutos, segundos) {
        elementos_gui.RELOJ_MINUTOS.firstElementChild.innerHTML = minutos;
        elementos_gui.RELOJ_SEGUNDOS.firstElementChild.innerHTML = segundos;
    }
}

modules.exports = Temporizador;