const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
let firstOpen = true;

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'players.json');

// Store active SSE connections
const sseClients = new Set();

// In-memory storage for current game state
let gameState = {
    currentQuestion: null,
    questionIndex: 0,
    isActive: true,
    isGameEnded: false
};

const questions = [
    {
        id: 1,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 2
    },
    {
        id: 2,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 0
    },
    {
        id: 3,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 3
    },
    {
        id: 4,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 1
    },
    {
        id: 5,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 0
    },
    {
        id: 6,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 2
    },
    {
        id: 7,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 3
    },
    {
        id: 8,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 1
    },
    {
        id: 9,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 0
    },
    {
        id: 10,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 2
    },
    {
        id: 11,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 1
    },
    {
        id: 12,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 3
    }
];

const questions2 = [
    {
        id: 1,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 0
    },
    {
        id: 2,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 2
    },
    {
        id: 3,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 1
    },
    {
        id: 4,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 3
    },
    {
        id: 5,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 0
    },
    {
        id: 6,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 1
    },
    {
        id: 7,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 2
    },
    {
        id: 8,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 3
    },
    {
        id: 9,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 1
    },
    {
        id: 10,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 0
    },
    {
        id: 11,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 2
    },
    {
        id: 12,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 3
    }
];

const questions3 = [
    {
        id: 1,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 1
    },
    {
        id: 2,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 0
    },
    {
        id: 3,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 3
    },
    {
        id: 4,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 2
    },
    {
        id: 5,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 1
    },
    {
        id: 6,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 0
    },
    {
        id: 7,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 3
    },
    {
        id: 8,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 2
    },
    {
        id: 9,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 0
    },
    {
        id: 10,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 1
    },
    {
        id: 11,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 3
    },
    {
        id: 12,
        question: "What song is playing?",
        options: ["A", "B", "C", "D"],
        correctAnswer: 2
    }
];

let currentQuestionsIndex = 0
let currentQuestions = questions

console.log("Server starting...");

// Middleware
app.use(express.json());
app.use(express.static('public'));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Initialize game with first question
function initializeGame() {
    gameState.currentQuestion = currentQuestions[0];
    gameState.questionIndex = 0;
    gameState.isActive = true;
    gameState.isGameEnded = false;
    console.log('Game initialized with question:', gameState.currentQuestion.question);
}

// Function to calculate score for a player
function calculatePlayerScore(playerAnswers, roomCode) {
    let score = 0;
    
    playerAnswers.forEach(answer => {
        // Skip "z" answers (no answer submitted) and invalid question indices
        if (answer.answer === "z" || answer.questionIndex < 0 || answer.questionIndex >= currentQuestions.length) {
            return;
        }
        
        const question = currentQuestions[answer.questionIndex];
        const correctAnswerLetter = ['a', 'b', 'c', 'd'][question.correctAnswer];
        
        if (answer.answer === correctAnswerLetter) {
            score++;
        }
    });
    
    return score;
}

// Function to update all player scores in a room
function updateAllPlayerScores(roomCode) {
    const playersData = readPlayersData();
    
    if (!playersData.rooms[roomCode]) {
        return false;
    }
    
    // Update scores for each player in the room
    for (const playerName in playersData.rooms[roomCode]) {
        const player = playersData.rooms[roomCode][playerName];
        player.score = calculatePlayerScore(player.answers, roomCode);
    }
    
    return writePlayersData(playersData);
}

// Function to reset all player scores in all rooms
function resetAllPlayerScores() {
    const playersData = readPlayersData();
    
    // Reset scores and answers for all players in all rooms
    for (const roomCode in playersData.rooms) {
        for (const playerName in playersData.rooms[roomCode]) {
            playersData.rooms[roomCode][playerName].score = 0;
            playersData.rooms[roomCode][playerName].answers = [];
        }
    }
    
    return writePlayersData(playersData);
}

// Broadcast to all connected SSE clients
function broadcastToClients(data) {
    console.log('Broadcasting to', sseClients.size, 'clients:', data);
    sseClients.forEach(client => {
        try {
            client.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (error) {
            console.error('Error sending to client:', error);
            sseClients.delete(client);
        }
    });
}

// Move to next question
function nextQuestion() {
    const previousQuestionIndex = gameState.questionIndex;
    const nextIndex = (gameState.questionIndex + 1) % currentQuestions.length;
    
    // Check if we've cycled back to the first question (game should end)
    if (firstOpen != true) {
        if (nextIndex === 0 && previousQuestionIndex === questions.length - 1) {
            gameState.isGameEnded = true;
            gameState.isActive = false;
            gameState.currentQuestion = null;
            gameState.questionIndex = -1;
            
            // Broadcast game end to all clients
            broadcastToClients({
                type: 'gameEnd',
                question: null,
                questionIndex: -1,
                isGameEnded: true,
                isActive: false
            });
            console.log('Game ended - cycled through all questions');
            return;
        }
    }
    // Update game state
    gameState.questionIndex = nextIndex;
    gameState.currentQuestion = currentQuestions[gameState.questionIndex];
    gameState.isActive = true;
    firstOpen = false;
    
    console.log('Moving to question', gameState.questionIndex, ':', gameState.currentQuestion.question);
    
    // Broadcast new question to all clients
    broadcastToClients({
        type: 'question',
        question: gameState.currentQuestion,
        questionIndex: gameState.questionIndex,
        isActive: gameState.isActive,
        isGameEnded: gameState.isGameEnded
    });
}

// Read players data
function readPlayersData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading players data:', error);
        return { rooms: {} };
    }
}

// Write players data
function writePlayersData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing players data:', error);
        return false;
    }
}

// Get current question endpoint
app.get('/api/question', (req, res) => {
    console.log('Question requested, current state:', {
        question: gameState.currentQuestion?.question,
        questionIndex: gameState.questionIndex,
        isActive: gameState.isActive,
        isGameEnded: gameState.isGameEnded
    });
    
    res.json({
        question: gameState.currentQuestion,
        isActive: gameState.isActive,
        questionIndex: gameState.questionIndex,
        isGameEnded: gameState.isGameEnded
    });
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/quiz', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz.html'));
});

app.get('/data/players.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'data', "players.json"));
    console.log("Sent player JSON file");
});

// SSE endpoint for real-time updates
app.get('/events', (req, res) => {
    console.log('New SSE client connected');
    
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Add this client to the set
    sseClients.add(res);

    // Send current state immediately
    const currentState = {
        type: gameState.isGameEnded ? 'gameEnd' : 'question',
        question: gameState.currentQuestion,
        questionIndex: gameState.questionIndex,
        isActive: gameState.isActive,
        isGameEnded: gameState.isGameEnded
    };
    
    console.log('Sending initial state to new client:', currentState);
    res.write(`data: ${JSON.stringify(currentState)}\n\n`);

    // Handle client disconnect
    req.on('close', () => {
        console.log('SSE client disconnected');
        sseClients.delete(res);
    });
});

// External endpoint to trigger next question
app.post('/api/next-question', (req, res) => {
    console.log('Received request to move to next question');
    nextQuestion();
    
    res.status(200).json({
        success: true,
        message: 'Moved to next question',
        currentQuestion: gameState.currentQuestion,
        questionIndex: gameState.questionIndex,
        isGameEnded: gameState.isGameEnded
    });
    
    const JSONDATA = readPlayersData();
    const rooms = "2222";
    const previousQuestionIndex = gameState.questionIndex - 1;

    // Check each player in the room
    for (const player in JSONDATA.rooms[rooms]) {
        console.log(`Checking player: ${player}`);
        
        let hasAnswerForCurrentQuestion = false;
        const playerAnswers = JSONDATA.rooms[rooms][player].answers;
        
        // Check each of this player's answers
        for (const answer of playerAnswers) {
            if (answer.questionIndex === previousQuestionIndex) {
                console.log(`  Player ${player} already has answer for question ${previousQuestionIndex}`);
                hasAnswerForCurrentQuestion = true;
                break;
            }
        }
        
        // If player doesn't have an answer for previous question, add a "z" answer
        if (!hasAnswerForCurrentQuestion && previousQuestionIndex >= 0) {
            console.log(`  Player ${player} needs "z" answer for question ${previousQuestionIndex}`);
            
            const newAnswer = {
                questionIndex: previousQuestionIndex,
                answer: "z",
                submittedAt: new Date().toISOString()
            };
            
            // Add the new answer to the player's answers array
            JSONDATA.rooms[rooms][player].answers.push(newAnswer);
            console.log(`  Added "z" answer for player ${player}`);
        }
    }

    // Update scores for all players in the room after adding missing answers
    updateAllPlayerScores(rooms);

    // Write the updated data back to the file
    fs.writeFileSync(DATA_FILE, JSON.stringify(JSONDATA, null, 2));
});

// Reset all player scores endpoint
app.post('/api/reset-scores', (req, res) => {
    console.log('Received request to reset all player scores');
    
    try {
        const success = resetAllPlayerScores();
        
        if (success) {
            // Reset game state
            gameState.currentQuestion = currentQuestions[0];
            gameState.questionIndex = 0;
            gameState.isActive = true;
            gameState.isGameEnded = false;
            firstOpen = true;
            
            if (currentQuestionsIndex = 0) {
                currentQuestions = questions
                currentQuestionsIndex = currentQuestionsIndex + 1
            } else if (currentQuestionsIndex = 1) {
                currentQuestions = questions2
                currentQuestionsIndex = currentQuestionsIndex + 1
            } else if (currentQuestionsIndex = 2) {
                currentQuestions = questions3
                currentQuestionsIndex = 0
            } else {
                console.log('currentQuestionIndex is messed up!')
            }
            
            
            // Broadcast game end to all clients
            broadcastToClients({
                type: 'question',
                question: gameState.currentQuestion,
                questionIndex: gameState.questionIndex,
                isActive: gameState.isActive,
                isGameEnded: gameState.isGameEnded
            });
            
            res.status(200).json({
                success: true,
                message: 'All player scores reset successfully',
                isGameEnded: true
            });
            
            console.log('All player scores reset successfully');
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to reset player scores'
            });
        }
    } catch (error) {
        console.error('Error resetting player scores:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while resetting scores'
        });
    }
});

// Handle POST requests from Roku device
app.post('/api/endpoint', (req, res) => {
    console.log('Received POST request from Roku');
    console.log('Headers: ', req.headers);
    console.log('Body: ', req.body);

    const { roomCodeFromRoku, questions } = req.body;

    console.log(`roomCodeFromRoku: ${roomCodeFromRoku}`);
    console.log(`number of questions received: ${questions ? questions.length : 0}`);

    if (questions && Array.isArray(questions)) {
        console.log('Questions: ');
        questions.forEach((question, index) => {
            console.log(`${index + 1}. ${question}`);
        });
    }

    const responseData = {
        status: 'success',
        received: true,
        roomCodeFromRoku: roomCodeFromRoku,
        questionsReceived: questions ? questions.length : 0,
        message: `Successfully received ${questions ? questions.length : 0} questions for room ${roomCodeFromRoku}`
    };

    res.status(200).json(responseData);
});

// Handle player registration
app.post('/api/register', (req, res) => {
    const { username, roomCode } = req.body;
    
    if (!username || !roomCode) {
        return res.status(400).json({ error: 'Username and room code are required' });
    }
    
    const playersData = readPlayersData();
    
    // Initialize rooms object if it doesn't exist
    if (!playersData.rooms) {
        playersData.rooms = {};
    }
    
    // Create room if it doesn't exist
    if (!playersData.rooms[roomCode]) {
        playersData.rooms[roomCode] = {};
    }
    
    // Check if player already exists in this room
    if (!playersData.rooms[roomCode][username]) {
        // Add new player to room with initial score of 0
        playersData.rooms[roomCode][username] = {
            answers: [],
            score: 0,
            createdAt: new Date().toISOString()
        };
        
        if (writePlayersData(playersData)) {
            res.json({ success: true, message: 'Player registered successfully' });
        } else {
            res.status(500).json({ error: 'Failed to save player data' });
        }
    } else {
        res.json({ success: true, message: 'Player already exists' });
    }
});

// Handle answer submission
app.post('/api/submit-answer', (req, res) => {
    const { username, roomCode, answer } = req.body;
    const roomId = "2222"
    
    if (!username || !roomCode || !answer) {
        return res.status(400).json({ error: 'Username, room code, and answer are required' });
    }
    
    const playersData = readPlayersData();
    

    let canAnswer = true
    canAnswer = hasPlayerNotAnsweredQuestion(playersData, roomId, username, gameState.questionIndex);



    // Add answer to player's answers array
    if (canAnswer === true) {
        playersData.rooms[roomCode][username].answers.push({
            questionIndex: gameState.questionIndex,
            answer: answer,
            submittedAt: new Date().toISOString()
        });
    }
    // Recalculate and update the player's score
    const playerAnswers = playersData.rooms[roomCode][username].answers;
    playersData.rooms[roomCode][username].score = calculatePlayerScore(playerAnswers, roomCode);
    if (canAnswer === true) {
        if (writePlayersData(playersData)) {
            res.json({ 
                success: true, 
                message: 'Answer submitted successfully',
                currentScore: playersData.rooms[roomCode][username].score
            });
        } else {
            res.status(500).json({ error: 'Failed to save answer' });
        }
    } else {
        if (writePlayersData(playersData)) {
            res.json({ 
                success: true, 
                message: 'Too slow!',
                currentScore: playersData.rooms[roomCode][username].score
            });
        } else {
            res.status(500).json({ error: 'Failed to save answer' });
    }
}
});

function hasPlayerNotAnsweredQuestion(jsonData, roomId, playerName, questionIndex) {
    console.log('=== DEBUG INFO ===');
    console.log('Looking for player:', playerName);
    console.log('In room:', roomId);
    console.log('For question index:', questionIndex);

    // First check if the room exists
    if (!jsonData.rooms || !jsonData.rooms[roomId]) {
        console.log('Room does not exist');
        return true; // No room = no answer
    }
    
    // Check if the player exists in the room
    if (!jsonData.rooms[roomId][playerName]) {
        console.log('Player does not exist in room');
        return true; // No player = no answer
    }
    
    // Check if the player has answers
    const playerAnswers = jsonData.rooms[roomId][playerName].answers;
    console.log('Player answers:', playerAnswers);
    if (!playerAnswers || !Array.isArray(playerAnswers)) {
        console.log('No answers array found');
        return true; // No answers array = no answer
    }
    
    // Check if there's an answer for the specific question index
    for (const answer of playerAnswers) {
        console.log('Checking answer:', answer);
        console.log('Answer questionIndex:', answer.questionIndex, 'vs looking for:', questionIndex);
        if (answer.questionIndex === questionIndex) {
            console.log('FOUND MATCH - returning false');
            return false; // Found an answer = they HAVE answered
        }
    }
    console.log('NO MATCH FOUND - returning true');
    return true; // No answer found = they have NOT answered
}

// Get player data (for viewing)
app.get('/api/players', (req, res) => {
    const playersData = readPlayersData();
    res.json(playersData);
});

// Get player's current score
app.get('/api/player-score/:roomCode/:username', (req, res) => {
    const { roomCode, username } = req.params;
    const playersData = readPlayersData();
    
    if (!playersData.rooms[roomCode] || !playersData.rooms[roomCode][username]) {
        return res.status(404).json({ error: 'Player not found' });
    }
    
    const player = playersData.rooms[roomCode][username];
    res.json({ 
        username: username,
        score: player.score || 0,
        totalAnswers: player.answers.length
    });
});

// Update question text
app.post('/api/update-question', (req, res) => {
    const { newQuestion } = req.body;
    
    if (!newQuestion) {
        return res.status(400).json({ error: 'New question text is required' });
    }
    
    res.json({ success: true, message: 'Question updated successfully' });
});

// Clear room data
app.post('/api/clear-room', (req, res) => {
    const { roomCode } = req.body;
    
    if (!roomCode) {
        return res.status(400).json({ error: 'Room code is required' });
    }
    
    const playersData = readPlayersData();
    
    if (playersData.rooms[roomCode]) {
        delete playersData.rooms[roomCode];
        
        if (writePlayersData(playersData)) {
            res.json({ success: true, message: 'Room data cleared successfully' });
        } else {
            res.status(500).json({ error: 'Failed to clear room data' });
        }
    } else {
        res.json({ success: true, message: 'Room not found or already empty' });
    }
});

// Updated endpoint for external servers to control game flow
app.post('/update', (req, res) => {
    console.log("Received post request from roku");
    console.log('Body: ', req.body);

    const updateBool = req.body.value;
    console.log(`Value received: ${updateBool}`);

    if (updateBool === true) {
        // Move to next question
        nextQuestion();
        console.log('Moving to next question');
    } else if (updateBool === false) {
        // Reset to first question
        initializeGame();
        
        // Broadcast game reset to all clients
        broadcastToClients({
            type: 'gameReset',
            question: gameState.currentQuestion,
            questionIndex: gameState.questionIndex,
            isActive: gameState.isActive,
            isGameEnded: gameState.isGameEnded
        });
        console.log('Game reset to first question');
    }

    res.status(200).json({
        success: true,
        message: 'Data received successfully',
        receivedValue: updateBool,
        processedAt: new Date().toISOString()
    });
});

// Initialize game when server starts
initializeGame();

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Game initialized with first question');
});