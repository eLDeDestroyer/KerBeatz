// Game State Management
const PRELOAD_DELAY = 2000; // 2 seconds for Splash
const LOADING_DELAY = 3000; // 3 seconds for Loading Page

// Page Elements
const pages = {
    splash: document.getElementById('page-splash'),
    loading: document.getElementById('page-loading'),
    input: document.getElementById('page-input'),
    songSelect: document.getElementById('page-song-select'),
    countdown: document.getElementById('page-countdown'),
    game: document.getElementById('page-game'),
    'game-over': document.getElementById('page-game-over')
};

const countdownAudio = new Audio('assets/sounds/countdown/countdown.mp3');

function startCountdown() {
    showPage('countdown');
    const numberEl = document.getElementById('countdown-number');
    let count = 3;

    // Reset animation helper
    const animate = () => {
        numberEl.classList.remove('scale-in-center');
        void numberEl.offsetWidth; // Trigger reflow
        numberEl.classList.add('scale-in-center');
    };

    // Play Sound immediately for '3'
    countdownAudio.currentTime = 0;
    countdownAudio.play().catch(e => console.log("Audio play failed:", e));

    numberEl.textContent = count;
    animate();

    const timer = setInterval(() => {
        count--;
        if (count > 0) {
            numberEl.textContent = count;
            animate();
            // Play sound again for '2' and '1'
            countdownAudio.currentTime = 0;
            countdownAudio.play().catch(e => console.log("Audio play failed:", e));
        } else {
            clearInterval(timer);
            // End of countdown
             setTimeout(() => {
                 initGame(); 
             }, 500); 
        }
    }, 1500); // 1.5 second interval
}

// Utility to switch pages
function showPage(pageKey) {
    // Hide all pages
    Object.values(pages).forEach(page => {
        if(page) page.classList.add('hidden');
    });

    // Show target page
    if (pages[pageKey]) {
        pages[pageKey].classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Check for existing session
    const isPlayed = localStorage.getItem('_is_played') === 'true';
    if (isPlayed) {
        // Direct to Game Over
        const savedScore = localStorage.getItem('_score') || 0;
        showGameOver(savedScore);
    } else {
        // Start with Splash Screen
        showPage('splash');

        // Transition to Loading after delay
        setTimeout(() => {
            showPage('loading');

            // Transition to Input Page after loading delay
            setTimeout(() => {
                showPage('input');
            }, LOADING_DELAY);

        }, PRELOAD_DELAY);
    }

    // Button Listener for Page 3 -> Page 4
    const nextBtnP3 = document.getElementById('btn-next-p3');
    const dragonP3 = document.getElementById('dragon-p3');
    const dragonBubbleP3 = dragonP3 ? dragonP3.querySelector('.dragon-bubble') : null;

    if (nextBtnP3) {
        nextBtnP3.addEventListener('click', () => {
             const input = document.querySelector('#page-input .game-input');
             if(input && input.value.trim() !== "") {
                 console.log("User Input:", input.value);
                 // Save Name & Auth to LS
                 localStorage.setItem('_name', input.value.trim());
                 localStorage.setItem('_is_played', 'true');

                 // Hide Dragon if visible
                 if(dragonP3) dragonP3.classList.add('hidden');
                 
                 // Navigate to Song Selection (Page 4)
                 showPage('songSelect');
             } else {
                 // Show Dragon Error
                 if(dragonP3) {
                    if(dragonBubbleP3) dragonBubbleP3.textContent = "Please input your name!";
                    dragonP3.classList.remove('hidden');
                 } else {
                    alert("Please input your name!");
                 }
             }
        });
        
        // Hide dragon when user starts typing
        const input = document.querySelector('#page-input .game-input');
        if(input) {
            input.addEventListener('input', () => {
                if(dragonP3) dragonP3.classList.add('hidden');
            });
        }
    }

    // Song Selection Logic
    const songOptions = document.querySelectorAll('.song-option');
    const dragonP4 = document.getElementById('dragon-p4');
    const dragonBubbleP4 = dragonP4 ? dragonP4.querySelector('.dragon-bubble') : null;
    let selectedSong = null;

    songOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Check if locked
            if (option.classList.contains('locked')) {
                // Show Dragon Warning
                if (dragonP4) {
                    dragonP4.classList.remove('hidden');
                    // Reset animation to play it again for effect (optional, or just show)
                    dragonP4.style.animation = 'none';
                    dragonP4.offsetHeight; /* trigger reflow */
                    dragonP4.style.animation = 'gentleFade 0.5s ease-out both';
                }
                return; // Stop here, do not select
            }

            // Normal Selection
            // Hide Dragon if it was showing
            if (dragonP4) dragonP4.classList.add('hidden');

            // Remove selected class from all
            songOptions.forEach(opt => opt.classList.remove('selected'));
            // Add to clicked
            option.classList.add('selected');
            selectedSong = option.dataset.song;
            console.log("Selected Song:", selectedSong);
        });
    });

    // Button Listener for Page 4
    const nextBtnP4 = document.getElementById('btn-next-p4');
    if (nextBtnP4) {
        nextBtnP4.addEventListener('click', () => {
             if (selectedSong) {
                console.log(`Starting with: ${selectedSong}`);
                localStorage.setItem('_song', selectedSong);
                startCountdown();
             } else {
                 // Show Dragon Error instead of alert
                 if (dragonP4) {
                     if (dragonBubbleP4) dragonBubbleP4.textContent = "Please select a song first!";
                     dragonP4.classList.remove('hidden');
                     
                     // Re-trigger animation
                     dragonP4.style.animation = 'none';
                     dragonP4.offsetHeight; /* trigger reflow */
                     dragonP4.style.animation = 'gentleFade 0.5s ease-out both';
                 }
             }
        });
    }
});

/* =========================
   GAME LOGIC (Piano Tiles)
========================= */


/* =========================
   GAME LOGIC (Piano Tiles)
   ========================= */
const TILE_IMAGE_URL = "assets/image/block/block_normal.png"; 

class Tile {
    constructor(x, y, width, height, image) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
        this.velocity = 17; // Speed
        this.hit = false;
        
        // Animation properties
        this.hitProgress = 0; 
    }

    update() {
        // Tiles ALWAYS fall, even if hit
        this.y += this.velocity;
        
        if (this.hit) {
            // Hit animation: Red gradient rises up
            // Increased speed as requested
            this.hitProgress += 0.1; 
        }
    }

    draw(ctx) {
        // ... (keep existing draw logic)
        let opacity = 1;
        if (this.hit && this.hitProgress > 0.8) {
            opacity = 1 - (this.hitProgress - 0.8) * 5; 
        }
        if (opacity < 0) opacity = 0;

        ctx.save();
        ctx.globalAlpha = opacity;
        
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);

        if (this.hit) {
             const gradHeight = this.height * Math.min(this.hitProgress, 1);
             const currentY = this.y + this.height - gradHeight;
             const gradient = ctx.createLinearGradient(0, currentY + gradHeight, 0, currentY);
             gradient.addColorStop(0, "rgba(255, 0, 0, 0)");   
             gradient.addColorStop(1, "rgba(255, 0, 0, 0.8)"); 

             ctx.fillStyle = gradient;
             
             ctx.beginPath();
             if (typeof ctx.roundRect === 'function') {
                  ctx.roundRect(this.x, currentY, this.width, gradHeight, 16);
             } else {
                  // Fallback
                  const r = 16;
                  const effR = Math.min(r, gradHeight/2);
                  ctx.rect(this.x, currentY, this.width, gradHeight); 
             }
             ctx.closePath();
             ctx.fill();
        }
        ctx.restore();
    }
    
    contains(px, py) {
        return px >= this.x &&
               px <= this.x + this.width &&
               py >= this.y &&
               py <= this.y + this.height;
    }
}

class Gameboard {
    constructor(ctx, canvas, image, audio, midiNotes) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.image = image;
        this.audio = audio; 

        this.tiles = [];
        this.score = 0;
        this.fails = 0;
        this.active = false;

        this.columns = 3;
        this.gap = 10; 
        this.tileWidth = (this.width - (this.columns - 1) * this.gap) / this.columns;
        this.tileHeight = 220; 
        
        this.scoreDisplay = document.getElementById('score-display');
        
        // MIDI Notes Queue
        // Format: { time: seconds, midi: number, spawned: false }
        this.noteQueue = midiNotes || [];
        this.startTime = 0;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.tileWidth = (this.width - (this.columns - 1) * this.gap) / this.columns;
    }

    start() {
        this.active = true;
        this.startTime = performance.now(); // Start sync clock
        this.bindInput();
        
        // Start Audio if available
        if (this.audio) {
            this.audio.currentTime = 0;
            this.audio.loop = true; // Enable looping
            this.audio.play().catch(e => console.log("Music play failed:", e));
        }

        requestAnimationFrame(this.update.bind(this));
    }

    bindInput() {
        const handleInteraction = (e) => {
            if (!this.active) return;
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            let clientX, clientY;
             if (e.changedTouches) {
                clientX = e.changedTouches[0].clientX;
                clientY = e.changedTouches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = (clientX - rect.left) * scaleX;
            const y = (clientY - rect.top) * scaleY;
            this.handleTap(x, y);
        };
        this.canvas.addEventListener("pointerdown", handleInteraction);
    }

    handleTap(x, y) {
        // Restrict input to bottom 50%
        if (y < this.height * 0.5) return;

        let hitMade = false;
        for (let i = 0; i < this.tiles.length; i++) {
            let tile = this.tiles[i];
            if (tile.contains(x, y) && !tile.hit) {
                tile.hit = true;
                this.score++;
                this.updateScoreUI();
                hitMade = true;
                break; 
            }
        }
    }

    update() {
        if (!this.active) return;
        requestAnimationFrame(this.update.bind(this));
        
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Spawn Logic based on MIDI
        const currentTime = (performance.now() - this.startTime) / 1000; // Seconds
        
        // Calculate accurate spawn lead time based on screen height and velocity
        // Tiles should arrive at the bottom (tap zone) exactly when the music plays
        // velocity = 17 pixels per frame
        // At 60fps: 17 * 60 = 1020 pixels/second
        // Travel distance = screen height + tile height (to fully enter screen)
        // Lead time = (height + tileHeight) / (velocity * 60)
        
        const pixelsPerSecond = this.tiles[0]?.velocity * 60 || 17 * 60; // 1020 px/s
        const travelDistance = this.height + this.tileHeight;
        const spawnLeadTime = travelDistance / pixelsPerSecond; // Dynamic calculation
        
        for (let note of this.noteQueue) {
            if (!note.spawned && note.time - spawnLeadTime <= currentTime) {
                this.spawnTileForNote(note);
                note.spawned = true;
            }
        }

        for (let i = 0; i < this.tiles.length; i++) {
            let tile = this.tiles[i];
            tile.update();
            tile.draw(this.ctx);

            if (tile.hit && tile.hitProgress >= 1) {
                // Keep it until fully off screen or opaque?
                // Logic says "menghilang" (disappear). User said "tetap lanjut" (continue falling).
                // Our update() continues falling. 
                // We should remove if off screen OR invisible.
            }
            // Remove if invisible
            if (tile.hit && tile.hitProgress >= 1) {
                 // Actually the fade out logic makes it invisible. Remove it.
                 this.tiles.splice(i, 1);
                 i--;
                 continue;
            }

            if (tile.y > this.height) {
                if (!tile.hit) {
                    this.fails++;
                    this.stop(); 
                    showGameOver(this.score);
                    return; 
                }
                this.tiles.splice(i, 1);
                i--;
            }
        }
    }
    
    spawnTileForNote(note) {
         // Map note midi value to 0, 1, 2
         const col = note.midi % this.columns;
         this.tiles.push(
            new Tile(
                col * (this.tileWidth + this.gap), 
                -this.tileHeight,
                this.tileWidth, 
                this.tileHeight,
                this.image
            )
        );
    }
    
    updateScoreUI() {
        if(this.scoreDisplay) this.scoreDisplay.textContent = this.score;
    }
    
    stop() {
        this.active = false;
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
    }
}

function showGameOver(score) {
    showPage('game-over'); // Ensure this ID matches HTML
    
    // Save Score to LS
    localStorage.setItem('_score', score);
    
    // Calculate Rank based on score
    let rank = 'D';
    if (score >= 200) {
        rank = 'S';
    } else if (score >= 100) {
        rank = 'A';
    } else if (score >= 80) {
        rank = 'B';
    } else if (score >= 50) {
        rank = 'C';
    } else {
        rank = 'D';
    }
    
    // Update Dragon Image based on rank
    const dragonImg = document.getElementById('go-dragon');
    const dragonImages = {
        'D': './assets/image/game_over/dragon/d_dragon.png',
        'C': './assets/image/game_over/dragon/d_dragon.png', // Using D dragon for C (only D, B, S available)
        'B': './assets/image/game_over/dragon/b_dragon.png',
        'A': './assets/image/game_over/dragon/b_dragon.png', // Using B dragon for A
        'S': './assets/image/game_over/dragon/s_dragon.png'
    };
    if (dragonImg) {
        dragonImg.src = dragonImages[rank];
    }
    
    // Update Rank Image
    const rankImg = document.getElementById('go-rank');
    const rankImages = {
        'D': './assets/image/game_over/score/d_scoe.png',
        'C': './assets/image/game_over/score/c_score.png',
        'B': './assets/image/game_over/score/b_score.png',
        'A': './assets/image/game_over/score/a_score.png',
        'S': './assets/image/game_over/score/s_score.png'
    };
    if (rankImg) {
        rankImg.src = rankImages[rank];
    }
    
    // Update Score
    document.getElementById('go-score').textContent = score;
    
    // Update Song Name
    const savedSong = localStorage.getItem('_song') || "Unknown Song";
    document.getElementById('go-song-name').textContent = savedSong;
    
    // High Score Logic (Hardcoded as requested)
    document.getElementById('go-high-score').textContent = `High Score : 211`;
    
    // Add logic to hide 'page-game-over' properly on restart if not using reload
    const restartBtn = document.getElementById('btn-restart');
    // Remove old listeners to prevent stacking? Or just use one global listener?
    // Better to have one global listener. Check initGame.
}

async function initGame() {
    // ... initGame logic ... (Keeping minimal changes here, restart logic added globally below)
    showPage('game');
    const canvas = document.getElementById("board");
    const container = document.getElementById("page-game");
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    const ctx = canvas.getContext("2d");
    const tileImage = new Image();
    tileImage.src = TILE_IMAGE_URL;

    // MIDI byte array for ayo_melangkah.mid (embedded)
    const midiBytes = new Uint8Array([
        77,84,104,100,0,0,0,6,0,1,0,1,1,224,77,84,114,107,0,0,
        15,189,0,255,81,3,6,26,128,0,255,88,4,4,1,24,8,131,115,144,
        55,78,38,128,55,64,39,144,60,88,130,12,128,60,64,39,144,62,99,0,
        81,93,77,128,62,64,115,81,64,0,144,62,91,77,128,62,64,76,144,64,
        89,116,128,64,64,38,144,62,67,77,128,62,64,115,144,64,77,0,65,74,
        0,100,108,38,128,64,64,0,65,64,0,100,64,39,144,62,28,38,128,62,
        64,131,0,144,67,81,39,128,67,64,115,144,67,84,38,128,67,64,129,26,
        144,64,50,38,128,64,64,129,64,144,71,81,39,128,71,64,0,144,72,83,
        129,25,128,72,64,129,64,144,64,66,39,128,64,64,129,25,144,60,83,77,
        128,60,64,115,144,55,68,0,64,42,115,128,64,64,39,55,64,0,144,62,
        81,130,13,128,62,64,38,144,64,82,38,128,64,64,129,64,144,63,54,77,
        128,63,64,39,144,65,54,0,66,76,38,128,66,64,0,144,55,63,38,128,
        65,64,0,55,64,39,144,67,86,38,128,67,64,130,13,144,67,81,0,176,
        64,63,38,64,127,129,26,64,63,38,64,0,116,128,67,64,132,25,144,43,
        86,39,128,43,64,130,51,144,62,81,0,81,90,77,128,62,64,0,81,64,
        115,144,62,66,77,128,62,64,38,144,64,88,38,128,64,64,129,64,144,60,
        59,77,128,60,64,39,144,65,70,129,25,128,65,64,129,26,144,67,84,38,
        55,74,39,128,55,64,131,0,67,64,38,144,69,74,0,81,92,77,128,81,
        64,38,69,64,39,144,70,76,38,128,70,64,130,51,144,55,75,39,128,55,
        64,129,64,144,57,58,38,128,57,64,131,38,144,43,67,0,71,86,129,103,
        128,43,64,0,71,64,129,25,144,64,37,39,128,64,64,131,0,144,81,86,
        129,25,128,81,64,131,116,144,64,28,0,67,78,38,128,64,64,0,67,64,
        129,26,144,67,81,0,101,96,38,128,67,64,115,144,64,56,39,128,101,64,
        38,64,64,77,144,94,87,38,128,94,64,130,51,144,48,77,0,64,72,39,
        128,64,64,129,64,48,64,115,144,60,84,38,128,60,64,116,144,64,51,38,
        128,64,64,115,144,62,77,77,128,62,64,130,13,144,64,83,38,128,64,64,
        131,77,144,65,78,115,128,65,64,0,144,64,79,39,128,64,64,129,25,144,
        67,73,115,128,67,64,116,144,64,79,76,128,64,64,129,64,144,64,80,39,
        128,64,64,129,25,144,64,72,116,128,64,64,129,25,176,64,63,39,64,127,
        76,64,63,39,64,0,38,144,68,96,39,80,96,129,64,128,68,64,0,80,
        64,129,102,176,64,63,38,64,127,129,26,144,43,77,38,128,43,64,0,176,
        64,63,39,64,0,135,102,144,69,27,0,81,78,39,128,81,64,38,69,64,
        129,64,144,69,82,0,81,85,38,128,69,64,0,81,64,133,13,144,72,80,
        39,128,72,64,129,102,144,71,75,38,128,71,64,130,90,144,69,84,38,128,
        69,64,130,13,144,71,81,0,83,94,39,128,71,64,76,144,90,75,39,128,
        83,64,0,90,64,77,144,67,57,129,102,176,64,63,38,128,67,64,39,176,
        64,2,131,77,144,62,67,38,128,62,64,77,144,64,69,129,25,128,64,64,
        39,144,60,78,115,128,60,64,77,144,59,60,38,128,59,64,115,144,62,72,
        39,81,75,38,128,62,64,0,81,64,77,144,64,63,0,65,70,38,128,64,
        64,0,65,64,129,103,144,65,64,77,128,65,64,129,25,144,62,63,77,128,
        62,64,77,144,64,62,77,128,64,64,76,144,76,91,39,128,76,64,77,144,
        62,47,0,81,82,0,86,89,38,128,81,64,0,86,64,38,62,64,39,144,
        60,73,38,128,60,64,115,144,64,60,39,128,64,64,129,25,144,60,71,39,
        128,60,64,38,144,59,68,39,128,59,64,130,51,144,60,83,38,128,60,64,
        0,144,59,77,39,128,59,64,129,25,144,60,77,39,59,57,38,128,60,64,
        0,59,64,131,0,144,36,77,38,128,36,64,137,116,144,58,88,0,62,69,
        0,64,82,0,74,72,38,128,58,64,0,62,64,0,64,64,0,74,64,0,
        144,52,84,0,59,64,0,76,95,38,128,52,64,0,59,64,0,76,64,39,
        144,83,78,77,128,83,64,115,144,52,86,0,64,81,0,71,90,38,128,52,
        64,0,64,64,0,71,64,0,144,76,102,0,79,83,39,128,76,64,0,79,
        64,129,25,144,52,75,39,128,52,64,76,144,52,83,0,64,82,0,76,89,
        39,128,52,64,0,64,64,0,144,83,89,38,128,76,64,0,83,64,0,144,
        80,58,39,128,80,64,129,64,144,52,80,0,71,76,0,76,92,0,77,97,
        38,128,52,64,0,71,64,0,76,64,0,77,64,0,144,79,75,0,80,76,
        0,83,80,38,128,79,64,0,80,64,0,83,64,130,13,144,53,82,39,128,
        53,64,0,144,65,74,0,74,77,0,76,89,0,77,96,0,81,94,38,128,
        65,64,0,74,64,0,76,64,0,77,64,0,81,64,0,144,71,56,0,72,
        77,38,128,71,64,0,72,64,129,26,144,48,37,77,128,48,64,0,144,53,
        87,0,65,77,38,128,53,64,0,65,64,0,144,60,72,0,72,76,0,77,
        91,0,79,61,0,81,69,39,128,60,64,0,72,64,0,77,64,0,79,64,
        0,81,64,129,102,144,77,87,38,128,77,64,116,144,53,65,115,128,53,64,
        38,144,65,74,0,77,91,39,128,65,64,0,144,74,70,0,81,85,38,128,
        77,64,0,74,64,0,81,64,0,144,78,94,0,79,76,0,84,86,38,128,
        78,64,0,79,64,0,84,64,129,26,144,52,69,38,128,52,64,0,144,60,
        34,77,128,60,64,0,144,52,76,0,64,79,0,76,79,39,128,52,64,0,
        64,64,0,144,83,67,38,128,76,64,0,83,64,0,144,79,45,77,128,79,
        64,38,144,82,64,39,128,82,64,144,64,144,59,30,129,64,128,59,64,38,
        144,52,70,0,53,74,38,128,52,64,0,53,64,0,144,47,70,39,128,47,
        64,0,144,77,91,0,79,89,0,81,96,0,82,88,38,128,77,64,0,79,
        64,0,81,64,0,82,64,0,144,83,93,39,128,83,64,129,102,144,52,79,
        0,64,82,0,77,96,38,128,52,64,0,64,64,0,77,64,0,144,79,84,
        0,80,77,0,81,77,0,82,85,0,83,98,39,128,79,64,0,80,64,0,
        81,64,0,82,64,0,83,64,130,13,144,52,73,0,64,76,0,76,91,38,
        128,52,64,0,64,64,0,76,64,0,144,71,75,38,128,71,64,130,13,144,
        52,76,39,128,52,64,38,144,71,68,0,76,66,38,128,71,64,0,76,64,
        129,64,144,50,85,0,51,72,0,62,90,0,74,85,39,128,50,64,0,51,
        64,0,62,64,0,74,64,130,13,144,51,76,0,62,79,0,74,82,0,76,
        83,38,128,51,64,0,62,64,0,74,64,0,76,64,0,144,50,81,0,77,
        87,0,78,78,0,79,79,0,80,77,0,81,96,0,82,92,38,128,50,64,
        0,77,64,0,78,64,0,79,64,0,80,64,0,81,64,0,82,64,39,144,
        86,85,38,128,86,64,0,144,59,50,39,128,59,64,129,25,144,59,67,39,
        128,59,64,0,144,50,70,0,71,79,0,74,81,38,128,71,64,0,74,64,
        38,50,64,0,144,64,81,0,79,70,39,128,64,64,0,79,64,0,144,52,
        72,38,128,52,64,115,144,76,85,0,77,80,39,128,76,64,0,77,64,0,
        144,50,71,0,62,73,0,79,66,0,82,93,38,128,79,64,0,82,64,0,
        144,81,94,39,128,81,64,38,50,64,0,62,64,77,144,48,60,38,128,48,
        64,115,144,60,80,39,128,60,64,77,144,59,58,38,128,59,64,38,144,47,
        49,0,48,46,39,128,47,64,38,48,64,143,115,144,36,68,0,43,76,0,
        48,67,0,64,85,129,26,128,48,64,0,64,64,0,144,48,67,0,176,64,
        63,77,64,0,77,128,43,64,0,48,64,0,144,48,80,0,64,87,0,176,
        64,63,76,64,0,39,128,64,64,129,64,48,64,77,144,48,70,0,52,80,
        0,64,86,76,128,64,64,129,64,48,64,0,144,48,72,39,128,52,64,0,
        144,64,81,115,128,64,64,129,64,48,64,0,144,48,75,0,52,81,0,55,
        87,0,64,82,77,128,52,64,0,55,64,0,64,64,129,102,48,64,39,144,
        62,66,0,77,98,0,81,92,0,84,86,38,128,62,64,0,77,64,0,81,
        64,0,84,64,130,13,144,62,58,0,65,88,0,74,88,0,77,98,0,81,
        90,38,128,62,64,0,65,64,0,74,64,0,77,64,0,81,64,0,144,101,
        106,39,128,101,64,129,64,144,52,66,76,128,52,64,0,144,72,83,0,74,
        84,39,128,72,64,0,74,64,0,144,77,89,0,101,94,38,128,77,64,0,
        101,64,77,144,62,56,38,128,62,64,129,26,144,62,59,0,74,90,0,77,
        97,0,79,82,0,81,90,38,128,62,64,0,74,64,0,77,64,0,79,64,
        0,81,64,77,144,79,93,39,128,79,64,129,25,144,55,93,39,128,55,64,
        0,144,76,88,38,128,76,64,38,144,64,76,116,128,64,64,76,144,64,60,
        116,176,64,62,38,64,125,129,64,128,64,64,38,176,64,63,39,64,0,130,
        13,144,64,55,130,89,128,64,64,129,26,144,64,74,115,128,64,64,38,144,
        52,83,39,128,52,64,130,51,144,64,72,130,90,128,64,64,130,51,144,69,
        102,0,71,89,38,128,69,64,0,71,64,0,144,76,103,39,128,76,64,129,
        102,144,64,90,77,128,64,64,77,144,52,68,38,128,52,64,129,26,144,52,
        83,0,64,92,38,128,52,64,0,64,64,38,144,79,90,0,80,77,0,83,
        89,39,128,79,64,0,80,64,0,83,64,115,144,80,71,38,128,80,64,0,
        144,76,103,39,128,76,64,0,144,52,73,0,64,88,38,128,64,64,39,52,
        64,130,51,144,50,73,0,59,67,0,62,74,0,71,59,38,128,59,64,0,
        62,64,0,71,64,0,144,81,86,39,128,81,64,0,144,83,55,38,128,50,
        64,0,83,64,129,26,144,50,67,0,80,54,0,81,83,38,128,80,64,0,
        81,64,0,144,59,69,0,62,75,0,71,55,38,128,59,64,0,71,64,39,
        144,81,85,0,83,52,38,128,50,64,0,62,64,0,81,64,0,83,64,39,
        144,59,61,0,80,65,38,128,59,64,0,80,64,115,144,50,85,0,59,77,
        0,62,82,0,71,82,0,74,93,39,128,62,64,0,71,64,0,74,64,38,
        50,64,0,59,64,38,144,64,64,39,128,64,64,38,144,52,68,39,128,52,
        64,76,144,50,73,0,59,69,39,62,76,0,77,90,0,79,79,0,81,99,
        0,82,92,0,83,85,38,128,50,64,0,59,64,0,62,64,0,77,64,0,
        79,64,0,81,64,0,82,64,0,83,64,115,144,74,68,39,128,74,64,115,
        144,48,67,77,128,48,64,0,144,60,79,38,128,60,64,137,77,144,60,102,
        38,128,60,64,0,144,52,78,0,59,87,39,128,52,64,0,59,64,130,13,
        144,62,80,38,128,62,64,0,144,81,93,38,128,81,64,0,144,77,86,0,
        83,70,39,128,77,64,0,83,64,38,144,81,90,39,128,81,64,0,144,62,
        77,38,128,62,64,0,144,58,88,0,77,86,38,128,58,64,0,77,64,77,
        144,64,92,77,128,64,64,38,144,59,46,39,128,59,64,129,25,144,66,73,
        0,67,80,39,128,66,64,0,67,64,0,144,62,44,0,63,65,38,128,62,
        64,0,63,64,39,144,68,82,0,69,85,38,128,68,64,0,69,64,129,64,
        144,79,79,0,80,89,38,128,79,64,0,80,64,129,26,144,60,44,129,26,
        176,64,63,38,64,126,77,128,36,64,0,60,64,0,176,64,63,38,64,0,
        129,26,144,77,79,38,128,77,64,132,103,144,84,84,38,60,81,0,79,68,
        0,81,69,0,83,84,38,128,79,64,0,81,64,0,83,64,77,144,79,90,
        39,128,60,64,0,79,64,129,25,144,62,75,39,128,62,64,38,144,77,78,
        38,128,77,64,0,144,86,88,39,128,86,64,38,144,62,63,39,128,62,64,
        76,144,55,84,39,128,55,64,130,51,144,60,59,0,79,90,0,100,105,38,
        128,60,64,0,79,64,0,100,64,77,144,69,75,0,81,82,39,128,69,64,
        0,81,64,129,25,144,62,29,39,67,72,38,128,62,64,0,67,64,38,144,
        91,80,39,128,91,64,77,144,59,46,130,12,128,59,64,134,77,144,59,85,
        0,62,88,0,81,90,39,128,81,64,76,59,64,0,62,64,130,13,144,92,
        104,39,128,92,64,129,25,144,60,68,77,128,60,64,0,144,65,81,0,77,
        85,38,128,65,64,0,77,64,129,103,144,65,71,38,128,65,64,39,144,62,
        63,38,128,62,64,38,144,81,91,39,128,81,64,0,144,69,85,38,128,69,
        64,129,103,144,60,75,0,67,86,76,128,60,64,116,67,64,38,144,60,65,
        0,66,82,38,128,60,64,0,66,64,39,144,64,68,38,128,64,64,129,103,
        144,60,86,130,12,128,60,64,77,144,60,84,115,128,60,64,129,103,144,60,
        82,0,62,50,0,79,94,0,80,91,38,128,79,64,0,80,64,0,144,81,
        71,0,91,94,39,128,60,64,0,81,64,0,91,64,76,144,81,89,0,86,
        88,39,128,62,64,0,81,64,0,86,64,0,144,62,42,129,102,128,62,64,
        0,144,62,53,77,128,62,64,0,144,81,83,38,128,81,64,116,144,64,80,
        38,128,64,64,130,13,144,65,83,38,128,65,64,0,144,60,59,0,77,92,
        39,128,60,64,0,77,64,0,144,81,80,38,128,81,64,129,102,144,81,88,
        39,128,81,64,77,144,77,85,0,89,89,38,128,77,64,129,102,144,65,54,
        39,77,77,38,128,89,64,0,65,64,0,77,64,129,64,144,65,53,0,77,
        81,39,128,77,64,115,65,64,132,25,144,60,90,39,128,60,64,115,144,65,
        46,77,128,65,64,77,144,62,68,38,81,87,38,128,81,64,129,26,62,64,
        132,64,144,69,74,38,128,69,64,39,144,60,33,115,128,60,64,0,144,60,
        31,0,80,84,38,128,80,64,39,60,64,38,84,64,0,144,84,78,115,83,
        73,77,128,83,64,77,144,64,26,0,67,41,0,83,70,38,128,84,64,0,
        144,84,73,116,128,64,64,0,67,64,0,83,64,76,144,78,89,39,128,84,
        64,0,78,64,0,144,59,38,0,65,39,38,128,59,64,0,65,64,0,144,
        61,36,0,62,52,39,128,61,64,0,144,74,65,0,83,60,38,128,62,64,
        0,74,64,0,83,64,0,144,48,39,0,69,64,38,128,48,64,0,69,64,
        132,26,144,60,78,129,26,128,60,64,129,25,144,62,81,0,81,69,129,64,
        128,62,64,0,81,64,129,26,144,64,80,0,76,90,0,83,75,38,128,64,
        64,0,76,64,0,83,64,130,13,144,66,82,0,67,70,38,128,66,64,77,
        67,64,39,144,69,73,0,81,74,76,128,81,64,77,144,81,80,39,128,69,
        64,0,144,59,38,0,83,75,38,128,81,64,0,83,64,38,144,67,62,130,
        90,128,67,64,115,144,67,63,77,128,67,64,77,144,67,63,77,128,67,64,
        132,25,59,64,0,144,60,73,39,128,60,64,0,144,62,76,0,81,75,0,
        86,86,129,102,128,62,64,0,81,64,0,86,64,38,144,62,86,129,64,128,
        62,64,129,26,144,62,86,130,13,128,62,64,38,144,64,74,129,26,128,64,
        64,115,144,63,71,77,128,63,64,0,144,81,74,38,64,70,0,83,72,115,
        128,64,64,0,83,64,0,144,65,66,39,84,68,129,102,176,64,63,77,64,
        0,129,26,128,65,64,0,84,64,38,144,64,73,38,83,85,116,128,83,64,
        38,64,64,77,144,63,64,38,128,63,64,0,144,62,74,39,128,62,64,0,
        144,61,66,38,128,81,64,0,61,64,0,144,57,77,38,128,57,64,129,103,
        144,60,83,0,79,88,38,128,79,64,77,60,64,38,144,81,82,39,62,74,
        77,128,62,64,76,144,62,80,77,128,81,64,0,62,64,39,144,64,70,38,
        128,64,64,129,26,144,63,69,38,82,83,38,128,63,64,0,82,64,0,144,
        62,79,0,81,74,129,64,128,62,64,77,144,60,81,0,79,73,39,128,79,
        64,76,60,64,129,64,144,60,78,0,79,71,77,128,79,64,115,60,64,116,
        144,60,74,76,128,60,64,77,144,60,76,77,128,60,64,115,144,60,75,77,
        128,60,64,115,144,60,71,77,128,60,64,115,144,60,62,77,128,60,64,130,
        51,176,64,63,39,64,127,134,76,144,55,87,0,176,64,63,39,64,0,38,
        128,81,64,0,55,64,39,144,54,66,38,128,54,64,0,144,53,74,38,128,
        53,64,39,144,52,76,38,128,52,64,77,144,48,81,38,128,48,64,77,176,
        64,63,39,64,127,115,64,63,38,64,0,39,144,60,92,0,61,89,38,128,
        61,64,0,144,79,95,38,128,60,64,0,79,64,130,13,144,52,57,0,60,
        85,39,128,60,64,38,52,64,0,144,54,52,38,128,54,64,77,144,60,86,
        39,128,60,64,76,144,52,82,0,60,90,0,79,83,39,128,52,64,0,60,
        64,0,79,64,77,144,60,63,38,128,60,64,129,64,144,64,86,0,76,91,
        38,128,64,64,0,76,64,0,144,80,67,0,81,80,0,100,97,39,128,80,
        64,0,100,64,0,144,83,75,0,92,95,38,128,83,64,0,92,64,39,144,
        65,56,0,101,100,38,77,88,38,128,81,64,0,65,64,0,101,64,0,77,
        64,0,144,81,73,39,128,81,64,38,144,65,73,129,26,128,65,64,77,144,
        52,32,0,60,12,38,128,52,64,38,60,64,39,144,65,78,38,53,74,39,
        128,53,64,115,65,64,38,144,53,67,39,128,53,64,38,144,66,75,0,77,
        68,38,128,66,64,0,77,64,0,144,84,87,39,128,84,64,77,144,67,81,
        76,128,67,64,116,144,79,86,38,128,79,64,0,144,77,78,38,128,77,64,
        0,144,64,64,0,83,76,39,128,83,64,115,64,64,38,144,64,83,116,128,
        64,64,143,115,176,64,0,0,255,47,0
    ]);
   
    let midiNotes = [];
    try {
        // Parse MIDI directly from byte array (no base64 decoding needed!)
        const midi = new Midi(midiBytes);
        console.log("MIDI loaded:", midi);
        
        if (midi.tracks.length > 0) {
            const rawNotes = midi.tracks[0].notes;
            
            // Filter Notes: Progressive Difficulty
            // 0-15s: Moderate (Gap 0.6s)
            // 15-30s: Dense (Gap 0.4s)
            // 30-45s: Very Dense (Gap 0.3s)
            // 45s+: Max Density (Gap 0.2s - Phys limit)
            
            rawNotes.sort((a, b) => a.time - b.time);
            
            let lastSpawnTime = -2.0; // Initialize so first note can spawn
            
            midiNotes = rawNotes.filter(note => {
                const time = note.time;
                const segment = Math.floor(time / 15);
                let currentGap = 0.2; // Default (Max)
                
                if (segment === 0) currentGap = 0.6; 
                else if (segment === 1) currentGap = 0.4;
                else if (segment === 2) currentGap = 0.3;
                else currentGap = 0.2; 
                
                if (time - lastSpawnTime >= currentGap) {
                    lastSpawnTime = time;
                    return true;
                }
                return false;
            });

            console.log(`Loaded MIDI notes: ${midiNotes.length} (Filtered from ${rawNotes.length})`);
        }
    } catch (e) {
        console.error("Failed to load MIDI:", e);
    }

    let game; 
    window.addEventListener('resize', () => {
        if (!document.getElementById('page-game').classList.contains('hidden')) {
             canvas.width = container.clientWidth;
             canvas.height = container.clientHeight;
             if (game) game.resize(canvas.width, canvas.height);
        }
    });

    // Audio Setup
    const selectedOption = document.querySelector('.song-option.selected');
    let bgm = null;
    if (selectedOption) {
        let audioSrc = "assets/sounds/theme/ayo_melangkah.mp3"; // Default
        if(selectedOption.dataset.song === "Ayo Melangkah") audioSrc = "assets/sounds/theme/ayo_melangkah.mp3";
        bgm = new Audio(audioSrc);
        bgm.volume = 0.5;
        bgm.loop = true; // Enable looping
        // ayo_melangkah.mid matches ayo_melangkah.mp3.
    }

    tileImage.onload = () => {
        game = new Gameboard(ctx, canvas, tileImage, bgm, midiNotes);
        // Start game immediately or wait? The previous logic had a countdown.
        // This initGame is called AFTER countdown.
        game.start();
    };
}


// Global Restart Listener
const btnRestart = document.getElementById('btn-restart');
if(btnRestart) {
    btnRestart.addEventListener('click', () => {
        location.reload();
    });
}
