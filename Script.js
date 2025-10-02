// --- Canvas and Game Setup ---
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const gameOverMessage = document.getElementById('game-over-message');

        // Set canvas dimensions - making it responsive for different screen sizes
        let canvasWidth = Math.min(800, window.innerWidth - 40);
        let canvasHeight = 250;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // --- Game Variables ---
        let dino, obstacles, score, gameSpeed, gameOver, keys;
        
        const initialGameSpeed = 5;
        const gameSpeedIncrement = 0.001;
        const groundHeight = 40; // Height of the ground line

        // --- Dinosaur Properties ---
        const dinoProps = {
            width: 40,
            height: 50,
            x: 50,
            y: canvasHeight - groundHeight,
            dy: 0, // Vertical velocity
            jumpStrength: 13,
            gravity: 0.7,
            isJumping: false,
            groundY: canvasHeight - groundHeight, // Y position when on the ground
        };

        // --- Obstacle Properties ---
        const obstacleTypes = [
            { width: 20, height: 40 }, // Small cactus
            { width: 40, height: 40 }, // Two small cacti
            { width: 60, height: 40 }, // Large cactus
        ];

        // --- Game Initialization ---
        function init() {
            dino = { ...dinoProps, y: dinoProps.groundY, isJumping: false, dy: 0 };
            obstacles = [];
            score = 0;
            gameSpeed = initialGameSpeed;
            gameOver = false;
            keys = {};

            // Add first obstacle
            spawnObstacle();

            // Hide the game over message and start the game loop
            gameOverMessage.style.display = 'none';
            requestAnimationFrame(gameLoop);
        }

        // --- Game Loop ---
        function gameLoop() {
            if (gameOver) {
                // Show game over message if the game has ended
                gameOverMessage.style.display = 'block';
                return;
            }

            // Update game state
            update();
            // Draw everything on the canvas
            draw();

            // Request the next frame to continue the loop
            requestAnimationFrame(gameLoop);
        }

        // --- Update Function ---
        function update() {
            // Update Dino's position
            // Apply gravity
            dino.dy += dino.gravity;
            dino.y += dino.dy;

            // Prevent dino from falling through the ground
            if (dino.y + dino.height > dino.groundY) {
                dino.y = dino.groundY - dino.height;
                dino.dy = 0;
                dino.isJumping = false;
            }

            // Update obstacles
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obstacle = obstacles[i];
                obstacle.x -= gameSpeed;

                // Collision detection
                if (
                    dino.x < obstacle.x + obstacle.width &&
                    dino.x + dino.width > obstacle.x &&
                    dino.y < obstacle.y + obstacle.height &&
                    dino.y + dino.height > obstacle.y
                ) {
                    gameOver = true;
                }

                // Remove obstacles that have moved off-screen
                if (obstacle.x + obstacle.width < 0) {
                    obstacles.splice(i, 1);
                }
            }

            // Spawn new obstacles
            // The next spawn time is random to make the game less predictable
            const lastObstacle = obstacles[obstacles.length - 1];
            const minDistance = canvasWidth / 2 + Math.random() * (canvasWidth / 2);
            if (!lastObstacle || canvasWidth - lastObstacle.x > minDistance) {
                spawnObstacle();
            }

            // Update score and game speed
            score++;
            gameSpeed += gameSpeedIncrement;
            scoreElement.textContent = Math.floor(score / 10);
        }
        
        // --- Drawing Functions ---
        function draw() {
            // Clear the entire canvas
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            // Draw the ground
            ctx.beginPath();
            ctx.moveTo(0, canvasHeight - groundHeight + 1);
            ctx.lineTo(canvasWidth, canvasHeight - groundHeight + 1);
            ctx.strokeStyle = '#535353';
            ctx.stroke();

            // Draw Dino (using an emoji for fun)
            ctx.font = '30px sans-serif';
            ctx.fillText('🦖', dino.x, dino.y + dino.height - 10);

            // Draw Obstacles
            ctx.fillStyle = '#535353';
            obstacles.forEach(obstacle => {
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            });
        }
        
        // --- Obstacle Spawning ---
        function spawnObstacle() {
            // Choose a random type of obstacle
            const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            const newObstacle = {
                ...type,
                x: canvasWidth,
                y: canvasHeight - type.height - groundHeight + 5,
            };
            obstacles.push(newObstacle);
        }
        
        // --- Player Controls ---
        function handleJump() {
            if (!dino.isJumping && !gameOver) {
                dino.isJumping = true;
                dino.dy = -dino.jumpStrength;
            } else if (gameOver) {
                // If the game is over, any jump action will restart it
                init();
            }
        }
        
        // Event listeners for keyboard input
        document.addEventListener('keydown', (e) => {
            // Jump on Space or ArrowUp
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                handleJump();
            } else if (gameOver) {
                // Restart on any other key press if game is over
                init();
            }
        });
        
        // Event listeners for touch input on mobile
        document.addEventListener('touchstart', handleJump);

        // --- Initial Call ---
        init();