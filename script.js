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
        
        // Look ahead for spawns
        // We want the tile to hit the "sweet spot" (e.g., bottom 20% or just fully visible) when the music note plays.
        // Let's say travel time is screenHeight / velocity.
        // But 'velocity' is per frame. Assuming 60fps, pixels/sec = velocity * 60.
        // tileSpeed = 17 * 60 = 1020 px/s.
        // if height is 900px, travel time is ~0.9s.
        // So we spawn 0.9s BEFORE the note time.
        
        // However, a simpler synced approach for V1:
        // Spawn when (noteTime - leadTime) <= currentTime.
        // Let's try spawning exactly at noteTime for now to see, or slightly earlier.
        // User asked "keluarnya tails sekaranng sesuai midi".
        
        const spawnLeadTime = 1.0; // Seconds before note to spawn
        
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
    
    // Update Score
    document.getElementById('go-score').textContent = score;
    
    // Update Song Name
    // Update Song Name
    const savedSong = localStorage.getItem('_song') || "Unknown Song";
    document.getElementById('go-song-name').textContent = savedSong;
    
    // High Score Logic (Hardcoded as requested)
    // const highScoreKey = `highscore_${savedSong.replace(/\s+/g, '_')}`;
    // let highScore = parseInt(localStorage.getItem(highScoreKey)) || 0;
    
    // if (score > highScore) {
    //    highScore = score;
    //    localStorage.setItem(highScoreKey, highScore);
    // }
    
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

    // Fetch MIDI (Embedded to avoid CORS on local file protocol)
    const MIDI_DATA_BASE64 = "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";

    let midiNotes = [];
    try {
        // Decode Base64 to ArrayBuffer
        const binaryString = atob(MIDI_DATA_BASE64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Parse MIDI directly from buffer
        const midi = new Midi(bytes);
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
        let audioSrc = "assets/sounds/theme/theme_one.mp3"; // Default
        if(selectedOption.dataset.song === "song one") audioSrc = "assets/sounds/theme/theme_one.mp3";
        bgm = new Audio(audioSrc);
        bgm.volume = 0.5;
        // midi_one.mid usually matches theme_one.mp3.
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
