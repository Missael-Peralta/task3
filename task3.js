const crypto = require('crypto');
const Table = require("cli-table3");

/**
 * Clase para generar claves y HMACs utilizando crypto.
 */
class CryptoGenerate {
    /**
     * Genera una clave aleatoria.
     * @returns {string} La clave generada en formato hexadecimal.
     */
    static generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Genera un HMAC para un mensaje dado utilizando una clave.
     * @param {string} key - La clave para el HMAC.
     * @param {string} message - El mensaje para el HMAC.
     * @returns {string} El HMAC generado en formato hexadecimal.
     */
    static generateHMAC(key, message) {
        return crypto.createHmac('sha256', key).update(message).digest('hex');
    }
}

/**
 * Clase para determinar las reglas del juego y el ganador.
 */
class PlayRules {
    /**
     * Crea una nueva instancia de PlayRules.
     * @param {string[]} moves - Las posibles jugadas del juego.
     */
    constructor(moves) {
        /**
         * Las posibles jugadas del juego.
         * @type {string[]}
         */
        this.moves = moves;

        /**
         * El número de jugadas posibles.
         * @type {number}
         */
        this.numMoves = moves.length;
    }

    /**
     * Determina el ganador del juego basado en las jugadas del usuario y la computadora.
     * @param {string} userMove - La jugada del usuario.
     * @param {string} computerMove - La jugada de la computadora.
     * @returns {string} El resultado del juego ('Draw', 'Computer wins', 'You win').
     */
    determineWinner(userMove, computerMove) {
        const userIndex = this.moves.indexOf(userMove);
        const computerIndex = this.moves.indexOf(computerMove);

        if (userIndex === computerIndex) {
            return 'Draw';
        }

        const half = Math.floor(this.numMoves / 2);
        if ((computerIndex > userIndex && computerIndex <= userIndex + half) ||
            (computerIndex < userIndex && computerIndex + this.numMoves <= userIndex + half)) {
            return 'Computer wins';
        } else {
            return 'You win';
        }
    }
}

/**
 * Clase para mostrar una tabla de ayuda con los resultados posibles del juego.
 */
class HelpTable {
    /**
     * Crea una nueva instancia de HelpTable.
     * @param {string[]} moves - Las posibles jugadas del juego.
     */
    constructor(moves) {
        /**
         * Las posibles jugadas del juego.
         * @type {string[]}
         */
        this.moves = moves;

        /**
         * El número de jugadas posibles.
         * @type {number}
         */
        this.numMoves = moves.length;
    }

    /**
     * Muestra la tabla de ayuda en la consola.
     */
    display() {
        const table = new Table({
            head: ['v PC\\User >', ...this.moves],
            colWidths: new Array(this.moves.length + 1).fill(10),
            style: { head: ['cyan'] }
        });

        for (let i = 0; i < this.numMoves; i++) {
            const row = [this.moves[i]];
            for (let j = 0; j < this.numMoves; j++) {
                if (i === j) {
                    row.push('Draw');
                } else {
                    const half = Math.floor(this.numMoves / 2);
                    if ((j > i && j <= i + half) || (j < i && j + this.numMoves <= i + half)) {
                        row.push('Win');
                    } else {
                        row.push('Lose');
                    }
                }
            }
            table.push(row);
        }

        console.log("The results are from the user's point of view. For example, 'Rock' wins against 'Scissors' but loses to 'Paper'.\n");
        console.log(table.toString());
    }
}

/**
 * Clase para gestionar el juego de Piedra, Papel o Tijeras.
 */
class RockPaperScissorsGame {
    /**
     * Crea una nueva instancia de RockPaperScissorsGame.
     * @param {string[]} moves - Las posibles jugadas del juego.
     */
    constructor(moves) {
        /**
         * Las posibles jugadas del juego.
         * @type {string[]}
         */
        this.moves = moves;

        /**
         * Las reglas del juego.
         * @type {PlayRules}
         */
        this.rules = new PlayRules(moves);
    }

    /**
     * Inicia el juego.
     */
    start() {
        const key = CryptoGenerate.generateKey();
        const computerMove = this.moves[Math.floor(Math.random() * this.moves.length)];
        const hmac = CryptoGenerate.generateHMAC(key, computerMove);

        console.log(`HMAC: ${hmac}`);
        console.log('Available moves:');
        this.moves.forEach((move, index) => {
            console.log(`${index + 1} - ${move}`);
        });
        console.log('0 - exit');
        console.log('? - help');

        this.getUserMove(computerMove, key);
    }

    /**
     * Obtiene la jugada del usuario y determina el resultado del juego.
     * @param {string} computerMove - La jugada de la computadora.
     * @param {string} key - La clave HMAC.
     */
    getUserMove(computerMove, key) {
        const stdin = process.openStdin();
        stdin.addListener('data', d => {
            const input = d.toString().trim();
            if (input === '0') {
                console.log('Exiting the game.');
                process.exit();
            } else if (input === '?') {
                new HelpTable(this.moves).display();
                console.log('Enter your move:');
            } else {
                const moveIndex = parseInt(input, 10) - 1;
                if (moveIndex >= 0 && moveIndex < this.moves.length) {
                    const userMove = this.moves[moveIndex];
                    console.log(`Your move: ${userMove}`);
                    console.log(`Computer move: ${computerMove}`);
                    console.log(this.rules.determineWinner(userMove, computerMove));
                    console.log(`HMAC key: ${key}`);
                    process.exit();
                } else {
                    console.log('Invalid move. Please try again.');
                    console.log('Available moves:');
                    this.moves.forEach((move, index) => {
                        console.log(`${index + 1} - ${move}`);
                    });
                    console.log('0 - exit');
                    console.log('? - help');
                }
            }
        });
    }
}

const args = process.argv.slice(2);
if (args.length < 3 || args.length % 2 === 0 || new Set(args).size !== args.length) {
    console.error('Error: You must provide an odd number of non-repeating strings (≥ 3) as command line arguments.');
    console.error('Example: node game.js rock paper scissors');
    process.exit(1);
}

const game = new RockPaperScissorsGame(args);
game.start();
