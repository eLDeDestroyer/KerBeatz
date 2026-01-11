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
    game: document.getElementById('page-game')
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

    // Button Listener for Page 3 -> Page 4
    const nextBtnP3 = document.getElementById('btn-next-p3');
    const dragonP3 = document.getElementById('dragon-p3');
    const dragonBubbleP3 = dragonP3 ? dragonP3.querySelector('.dragon-bubble') : null;

    if (nextBtnP3) {
        nextBtnP3.addEventListener('click', () => {
             const input = document.querySelector('#page-input .game-input');
             if(input && input.value.trim() !== "") {
                 console.log("User Input:", input.value);
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
const TILE_IMAGE_URL = "assets/image/block/block_normal.png"; 

class Tile {
    constructor(x, y, width, height, image) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
        this.width = width;
        this.height = height;
        this.image = image;
        this.velocity = 17; // Increased speed as requested
        this.hit = false;
        this.hit = false;
        
        // Animation properties
        this.hitProgress = 0; // 0 to 1 representing the gradient fill
    }

    update() {
        if (!this.hit) {
            this.y += this.velocity;
        } else {
            // Hit animation: Red gradient rises up
            this.hitProgress += 0.05;
        }
    }

    draw(ctx) {
        // Draw Main Image
        // If hit, we might fade it out or just overlay. 
        // User asked for "gradasi merah dari bawah ke atas ... perlahan lalu menghilang"
        // Let's keep image visible but overlay the gradient, then fade everything out if needed.
        // Or simply draw the image, and if hit, draw the gradient on top.
        
        let opacity = 1;
        if (this.hit && this.hitProgress > 0.8) {
            // Fade out at the very end
            opacity = 1 - (this.hitProgress - 0.8) * 5; 
        }
        if (opacity < 0) opacity = 0;

        ctx.save();
        ctx.globalAlpha = opacity;
        
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);

        if (this.hit) {
            // Draw Red Gradient
            // Height of gradient determined by hitProgress
            const gradHeight = this.height * Math.min(this.hitProgress, 1);
            
            // Calculate limit of the rising bar
            // rising from bottom (this.y + this.height) upwards
            const currentY = this.y + this.height - gradHeight;
            
            // Dynamic Gradient: Relative to the rising bar
            // From Bottom of bar (currentY + gradHeight) to Top of bar (currentY)
            // We want the Top to be Red, Bottom to be Transparent (Tail effect)
            const gradient = ctx.createLinearGradient(0, currentY + gradHeight, 0, currentY);
            gradient.addColorStop(0, "rgba(255, 0, 0, 0)");   // Transparent at bottom of wave
            gradient.addColorStop(1, "rgba(255, 0, 0, 0.8)"); // Red at top of wave (Leading Edge)

            ctx.fillStyle = gradient;
            
            // Rounded Rectangle for the hit effect with 16px radius
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                 // Draw the rect at currentY position
                 ctx.roundRect(this.x, currentY, this.width, gradHeight, 16);
            } else {
                 // Fallback
                 const r = 16;
                 const y = currentY;
                 const h = gradHeight;
                 // Ensure radius isn't larger than half height if very small
                 const effR = Math.min(r, h/2);
                 
                 ctx.moveTo(this.x + effR, y);
                 ctx.lineTo(this.x + this.width - effR, y);
                 ctx.quadraticCurveTo(this.x + this.width, y, this.x + this.width, y + effR);
                 ctx.lineTo(this.x + this.width, y + h - effR);
                 ctx.quadraticCurveTo(this.x + this.width, y + h, this.x + this.width - effR, y + h);
                 ctx.lineTo(this.x + effR, y + h);
                 ctx.quadraticCurveTo(this.x, y + h, this.x, y + h - effR);
                 ctx.lineTo(this.x, y + effR);
                 ctx.quadraticCurveTo(this.x, y, this.x + effR, y);
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
    constructor(ctx, canvas, image, audio) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.image = image;
        this.audio = audio; // Background music

        this.tiles = [];
        this.score = 0;
        this.fails = 0;
        this.active = false;

        this.columns = 3;
        this.columns = 3;
        this.gap = 10; // Gap between tiles
        // Calculate lane width considering gaps
        // We want (width - (gaps)) / columns
        this.tileWidth = (this.width - (this.columns - 1) * this.gap) / this.columns;
        this.laneWidth = this.width / this.columns; // Still useful for spawning logic base? 
        // Actually simpler:
        // col 0: x = 0
        // col 1: x = tileWidth + gap
        // col 2: x = 2 * (tileWidth + gap)
        
        this.tileHeight = 220; // User preferred height
        
        this.scoreDisplay = document.getElementById('score-display');
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.tileWidth = (this.width - (this.columns - 1) * this.gap) / this.columns;
    }

    start() {
        this.active = true;
        this.bindInput();
        this.spawnTimer = setInterval(() => this.spawnTile(), 600);
        requestAnimationFrame(this.update.bind(this));
    }

    bindInput() {
        // Handle both mouse and touch
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

            // Scale coordinates if canvas display size differs from internal resolution
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;

            const x = (clientX - rect.left) * scaleX;
            const y = (clientY - rect.top) * scaleY;

            this.handleTap(x, y);
        };

        this.canvas.addEventListener("pointerdown", handleInteraction);
    }

    handleTap(x, y) {
        // Check lowest tiles first (visual priority)
        // Usually tiles at the bottom are the first ones in the array if we push to end? 
        // No, we push new tiles. New tiles are at top (y < 0). Old tiles are at bottom.
        // So iterate tiles.
        
        let hitMade = false;
        
        // Find the specific tile clicked.
        // We iterate backwards to prioritize those on top (z-index wise) conceptually, 
        // though here they don't overlap much.
        for (let i = 0; i < this.tiles.length; i++) {
            let tile = this.tiles[i];
            if (tile.contains(x, y) && !tile.hit) {
                tile.hit = true;
                this.score++;
                this.updateScoreUI();
                hitMade = true;
                break; // One tap per tile
            }
        }
    }

    spawnTile() {
        if (!this.active) return;
        let col = Math.floor(Math.random() * this.columns);
        // Position: col * (width + gap)
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

    update() {
        if (!this.active) return;
        requestAnimationFrame(this.update.bind(this));
        
        this.ctx.clearRect(0, 0, this.width, this.height);

        for (let i = 0; i < this.tiles.length; i++) {
            let tile = this.tiles[i];
            tile.update();
            tile.draw(this.ctx);

            // Remove if animation done
            if (tile.hit && tile.hitProgress >= 1) {
                this.tiles.splice(i, 1);
                i--;
                continue;
            }

            // Remove if fell off screen
            if (tile.y > this.height) {
                // If it wasn't hit, it's a fail -> Game Over
                if (!tile.hit) {
                    this.fails++;
                    this.stop(); // Stop the game loop
                    // Simple Game Over logic
                    alert("Game Over! Score: " + this.score);
                    // Reload or reset?
                    location.reload(); 
                    return; 
                }
                this.tiles.splice(i, 1);
                i--;
            }
        }
    }
    
    updateScoreUI() {
        if(this.scoreDisplay) this.scoreDisplay.textContent = this.score;
    }
    
    stop() {
        this.active = false;
        clearInterval(this.spawnTimer);
        
        // Stop music if playing
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
    }
}

function initGame() {
    showPage('game');
    
    const canvas = document.getElementById("board");
    const container = document.getElementById("page-game");
    
    // Set internal resolution to match container's rendered size for crispness
    // or fix it to a logical size like 360x700 for consistency.
    // Let's use the container size.
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    const ctx = canvas.getContext("2d");
    
    const tileImage = new Image();
    tileImage.src = TILE_IMAGE_URL;
    
    let game; // Define game visible to resize scope

    // Handle Resize
    window.addEventListener('resize', () => {
        if (!document.getElementById('page-game').classList.contains('hidden')) {
             canvas.width = container.clientWidth;
             canvas.height = container.clientHeight;
             if (game) {
                 game.resize(canvas.width, canvas.height);
             }
        }
    });

    // Handle Music Playback
    // Assuming 'selectedSong' global variable holds the data-song value
    // Map "song one" to theme_one.mp3
    // We need to access selectedSong from the outer scope or pass it in. 
    // It's defined in DOMContentLoaded scope. We should move InitGame inside or pass it.
    // But initGame is called by startCountdown which is global.
    // Let's attach selectedSong to a global or just check the DOM element selected?
    // The previously selected element has 'selected' class.
    
    const selectedOption = document.querySelector('.song-option.selected');
    let bgm = null;
    if (selectedOption) {
        const songName = selectedOption.dataset.song; // "song one"
        let audioSrc = null;
        
        if (songName === "song one") {
            audioSrc = "assets/sounds/theme/theme_one.mp3";
        }
        // Add other mappings if needed
        
        if (audioSrc) {
            bgm = new Audio(audioSrc);
            bgm.volume = 0.5;
            bgm.loop = true;
            bgm.play().catch(e => console.log("Music play failed:", e));
        }
    }

    tileImage.onload = () => {
        game = new Gameboard(ctx, canvas, tileImage, bgm);
        game.start();
    };
}

