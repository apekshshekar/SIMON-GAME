
class FuturisticSimon {
    constructor() {
        this.sequence = [];
        this.playerSequence = [];
        this.level = 1;
        this.score = 0;
        this.isPlaying = false;
        this.isShowingSequence = false;
        this.currentStep = 0;
        this.gameStarted = false;
        this.playerName = 'Guest';
        this.leaderboard = [];
        
        this.buttons = document.querySelectorAll('.simon-button');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.statusEl = document.getElementById('status');
        this.levelEl = document.getElementById('level');
        this.scoreEl = document.getElementById('score');
        this.playerNameInput = document.getElementById('playerName');
        this.currentPlayerEl = document.getElementById('currentPlayer');
        this.leaderboardListEl = document.getElementById('leaderboardList');

        this.sounds = this.createSounds();
        this.loadLeaderboard();
        this.initEventListeners();
        this.createParticles();
        this.updateLeaderboardDisplay();
    }

    createSounds() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const frequencies = [440, 554, 659, 523]; // Red, Blue, Green, Yellow - musical notes
        
        const buttonSounds = frequencies.map(freq => ({
            frequency: freq,
            play: () => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                const filter = audioContext.createBiquadFilter();
                
                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // Create a more musical tone
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                
                // Add some filtering for a warmer sound
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(2000, audioContext.currentTime);
                filter.Q.setValueAtTime(1, audioContext.currentTime);
                
                // Smooth volume envelope
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.6);
            }
        }));

        // Add special sound effects
        const specialSounds = {
            success: () => {
                const oscillator1 = audioContext.createOscillator();
                const oscillator2 = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator1.connect(gainNode);
                oscillator2.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator1.type = 'sine';
                oscillator2.type = 'sine';
                oscillator1.frequency.setValueAtTime(523, audioContext.currentTime); // C5
                oscillator2.frequency.setValueAtTime(659, audioContext.currentTime); // E5
                oscillator1.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
                oscillator2.frequency.setValueAtTime(1047, audioContext.currentTime + 0.2); // C6
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
                
                oscillator1.start(audioContext.currentTime);
                oscillator2.start(audioContext.currentTime);
                oscillator1.stop(audioContext.currentTime + 0.8);
                oscillator2.stop(audioContext.currentTime + 0.8);
            },
            
            gameOver: () => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 1);
                
                gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.2);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 1.2);
            },
            
            levelUp: () => {
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.type = 'square';
                        oscillator.frequency.setValueAtTime(400 + (i * 100), audioContext.currentTime);
                        
                        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.2);
                    }, i * 100);
                }
            },
            
            gameStart: () => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.3);
                oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.6);
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.9);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.9);
            }
        };

        return { buttons: buttonSounds, effects: specialSounds };
    }

    createParticles() {
        const particlesContainer = document.getElementById('particles');
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    initEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        
        this.playerNameInput.addEventListener('input', (e) => {
            const name = e.target.value.trim() || 'Guest';
            this.playerName = name;
            this.currentPlayerEl.textContent = `Player: ${name}`;
        });
        
        this.buttons.forEach((button, index) => {
            button.addEventListener('click', () => {
                if (!this.isPlaying || this.isShowingSequence) return;
                this.handleButtonClick(index);
            });
        });
    }

    startGame() {
        this.gameStarted = true;
        this.isPlaying = true;
        this.sequence = [];
        this.playerSequence = [];
        this.level = 1;
        this.score = 0;
        this.currentStep = 0;
        
        this.updateDisplay();
        this.setStatus("Get ready...", "");
        this.startBtn.disabled = true;
        
        // Play game start sound
        this.sounds.effects.gameStart();
        
        setTimeout(() => {
            this.nextLevel();
        }, 1000);
    }

    resetGame() {
        this.gameStarted = false;
        this.isPlaying = false;
        this.isShowingSequence = false;
        this.sequence = [];
        this.playerSequence = [];
        this.level = 1;
        this.score = 0;
        this.currentStep = 0;
        
        this.updateDisplay();
        this.setStatus("Click START to begin your journey", "");
        this.startBtn.disabled = false;
    }

    nextLevel() {
        this.addToSequence();
        this.playerSequence = [];
        this.currentStep = 0;
        this.setStatus(`Level ${this.level} - Watch the pattern`, "");
        
        setTimeout(() => {
            this.showSequence();
        }, 1000);
    }

    addToSequence() {
        const randomButton = Math.floor(Math.random() * 4);
        this.sequence.push(randomButton);
    }

    async showSequence() {
        this.isShowingSequence = true;
        
        for (let i = 0; i < this.sequence.length; i++) {
            await this.delay(600);
            await this.flashButton(this.sequence[i]);
        }
        
        this.isShowingSequence = false;
        this.setStatus("Your turn! Repeat the pattern", "");
    }

    async flashButton(index) {
        const button = this.buttons[index];
        button.classList.add('active');
        this.sounds.buttons[index].play();
        
        await this.delay(400);
        button.classList.remove('active');
    }

    handleButtonClick(index) {
        this.flashButton(index);
        this.playerSequence.push(index);
        
        if (this.playerSequence[this.currentStep] !== this.sequence[this.currentStep]) {
            this.gameOver();
            return;
        }
        
        this.currentStep++;
        
        if (this.currentStep === this.sequence.length) {
            this.score += this.level * 10;
            this.level++;
            this.updateDisplay();
            this.setStatus(`Excellent! Level ${this.level} incoming...`, "success");
            
            // Play level up sound
            this.sounds.effects.levelUp();
            
            setTimeout(() => {
                this.nextLevel();
            }, 1500);
        } else {
            this.setStatus(`${this.sequence.length - this.currentStep} more to go...`, "");
        }
    }

    gameOver() {
        this.isPlaying = false;
        this.addToLeaderboard(this.playerName, this.score);
        this.setStatus(`Game Over! Final Score: ${this.score}`, "game-over");
        this.startBtn.disabled = false;
        
        // Play game over sound
        this.sounds.effects.gameOver();
        
        // Flash all buttons red
        this.buttons.forEach(button => {
            button.style.animation = 'pulse 0.5s ease-in-out 3';
        });
        
        setTimeout(() => {
            this.buttons.forEach(button => {
                button.style.animation = '';
            });
        }, 1500);
    }

    setStatus(message, className) {
        this.statusEl.textContent = message;
        this.statusEl.className = `status-message ${className}`;
    }

    updateDisplay() {
        this.levelEl.textContent = this.level;
        this.scoreEl.textContent = this.score;
    }

    loadLeaderboard() {
        const saved = localStorage.getItem('futuristicSimonLeaderboard');
        this.leaderboard = saved ? JSON.parse(saved) : [];
    }

    saveLeaderboard() {
        localStorage.setItem('futuristicSimonLeaderboard', JSON.stringify(this.leaderboard));
    }

    addToLeaderboard(playerName, score) {
        this.leaderboard.push({ name: playerName, score: score, date: new Date().toLocaleDateString() });
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 5); // Keep top 5
        this.saveLeaderboard();
        this.updateLeaderboardDisplay();
    }

    updateLeaderboardDisplay() {
        if (this.leaderboard.length === 0) {
            this.leaderboardListEl.innerHTML = `
                <div class="leaderboard-item">
                    <span class="leaderboard-rank">1.</span>
                    <span class="leaderboard-name">No scores yet</span>
                    <span class="leaderboard-score">-</span>
                </div>`;
            return;
        }

        this.leaderboardListEl.innerHTML = this.leaderboard.map((entry, index) => `
            <div class="leaderboard-item">
                <span class="leaderboard-rank">${index + 1}.</span>
                <span class="leaderboard-name">${entry.name}</span>
                <span class="leaderboard-score">${entry.score}</span>
            </div>
        `).join('');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new FuturisticSimon();
});
