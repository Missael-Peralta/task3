const crypto = require('crypto');
const Table = require("cli-table3");

/**
 * Class to generate keys and HMAC using cryptography.
 */
class CryptoGenerate {
    /**
     * Generate a random key.
     * @returns {string} The generated key in hexadecimal format.
     */
    static generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Generates an HMAC for a given message using a key.
     * @param {string} key - The key to HMAC.
     * @param {string} message - The message for the HMAC.
     * @returns {string} The HMAC generated in hexadecimal format.
     */
    static generateHMAC(key, message) {
        return crypto.createHmac('sha256', key).update(message).digest('hex');
    }
}

/**
 * Class to determine the rules of the game and the winner.
 */
class PlayRules {
    /**
     * Create a new PlayRules instance.
     * @param {string[]} moves - The possible plays of the game.
     */
    constructor(moves) {
        /**
         * The possible plays of the game.
         * @type {string[]}
         */
        this.moves = moves;

        /**
         * The number of possible plays.
         * @type {number}
         */
        this.numMoves = moves.length;
    }

    /**
     * Determines the winner of the game based on the moves of the user and the computer.
     * @param {string} userMove - The user's move.
     * @param {string} computerMove - The computer play.
     * @returns {string} The result of the game ('Draw', 'Computer wins', 'You win').
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
 * Class to display a help table with possible game outcomes.
 */
class HelpTable {
    /**
     * Create a new HelpTable instance.
     * @param {string[]} moves - The possible plays of the game.
     */
    constructor(moves) {
        /**
         * The possible plays of the game.
         * @type {string[]}
         */
        this.moves = moves;

        /**
         * The number of possible plays.
         * @type {number}
         */
        this.numMoves = moves.length;
    }

    /**
     * Displays the help table in the console.
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
 * Class to manage the game of Rock, Paper or Scissors.
 */
class RockPaperScissorsGame {
    /**
     * Create a new instance of RockPaperScissorsGame.
     * @param {string[]} moves - The possible plays of the game.
     */
    constructor(moves) {
        /**
         * The possible plays of the game.
         * @type {string[]}
         */
        this.moves = moves;

        /**
         * the rules of game.
         * @type {PlayRules}
         */
        this.rules = new PlayRules(moves);
    }

    /**
     * Start the game.
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
     * Gets the user's move and determines the outcome of the game.
     * @param {string} computerMove - The computer play.
     * @param {string} key - The HMAC key.
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
