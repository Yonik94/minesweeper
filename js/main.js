'use strict'
const MINE = '<img src="img/mine.png" alt="">';
const FLAG = '<img src="img/flag.png" alt="">';
const SMILEY = '<img src="img/smiley.png" alt="">';
const SAD_SMILEY = '<img src="img/smileySad.png" alt="">';
const WIN = '<img src="img/happy.png" alt="">';
const LIVES = '<img src="img/heart.png" alt="">';
const HINT = '<img src="img/hint.png" alt="">';
const HINT_ACTIVE = '<img src="img/hintActive.png" alt="">';

var gBoard;
var gIsFirstClick;
var isGameOver;
var gFlagged;
var gDifficulty;
var gIsWin;
var gIsWatchCount
var gWatchIvl
var gLives;
var gSafeClicks;
var gStartTime;
var gEndTime;
var gHintsCount;
var gHintStatus;
var gIsManually;
var gHistory;

function init(difficulty) {
    gHintsCount = 3;
    gLives = 3;
    gHintStatus = false;
    gIsManually = false;
    gMinesSetCount = 0;
    gHistory = [];
    setMinesCount(difficulty);
    updateHtml(gLives, LIVES, '.lives');
    updateHtml(gHintsCount, HINT, '.hints');
    gSafeClicks = 3;
    gIsFirstClick = true;
    isGameOver = false;
    gIsWin = false;
    gFlagged = 0;
    gIsWatchCount = false;
    document.querySelector('.restart-button').innerHTML = SMILEY;
    renderTxts('.win-txt', '');
    renderTxts('.safe-num', gSafeClicks);
    gBoard = createBoard(difficulty);
    var bestScoreEasy = setBestScore(16);
    var bestScoreHard = setBestScore(64);
    var bestScoreExtreme = setBestScore(144);
    renderTxts('.Easy', (bestScoreEasy) ? ` ${bestScoreEasy} seconds` : '-');
    renderTxts('.Hard', (bestScoreHard) ? ` ${bestScoreHard} seconds` : '-');
    renderTxts('.Extreme', (bestScoreExtreme) ? ` ${bestScoreExtreme} seconds` : '-');
    renderTxts('.mines-counter', `Mines count remaining: ${gMinesCount}`);
    renderBoard(gBoard);
    resetStopWatch();
}
//Define function that set the manually status and button design.
function createManually() {
    if (!gIsFirstClick) return;
    renderTxts('.mines-counter', `Set more ${(gMinesCount - gMinesSetCount)} mine(s) to start`);
    var modalHtml = document.querySelector('.manual-modal');
    gIsManually = !gIsManually;
    if (document.querySelector('.manually').classList.contains('green')) {
        document.querySelector('.manually').classList.remove('green');
        modalHtml.classList.remove('block');
    } else {
        modalHtml.classList.add('block');
        setTimeout(function () { modalHtml.classList.remove('block') }, 4000);
        document.querySelector('.manually').classList.add('green');
    }
}
//Define function that take the game one step back in every click on it's button
function undo() {
    //if the game over or if the game in the start return nothing
    if (isGameOver) return;
    if (gIsWin) return;
    if (gHistory.length < 1) return;
    //Get the details of the last click.
    var lastAction = gHistory.splice(gHistory.length - 1, 1);
    lastAction = lastAction[0];
    //If user was on safe mode that what will happen
    if (lastAction.isSafe) {
        gSafeClicks++;
        var safeInHtml = document.querySelector('.safe-num');
        safeInHtml.innerText = gSafeClicks;
        return;
    }
    var cell = document.querySelector(`.i-${lastAction.cellPositionI}-j-${lastAction.cellPositionJ}`);
    gBoard[lastAction.cellPositionI][lastAction.cellPositionJ].isShown = false;
    //If user was on manually mode that what will happen
    if (lastAction.manuallyStatus) {
        gMinesSetCount--;
        gBoard[lastAction.cellPositionI][lastAction.cellPositionJ].isMine = false;
        if (gHistory.length < 1) {
            gIsManually = false;
            document.querySelector('.manually').classList.remove('green');
        } else {
            gIsManually = true;
            document.querySelector('.manually').classList.add('green');
        }
    }
    //If user was on hint mode that what will happen
    if (lastAction.hintStatus) {
        gHintsCount++;
        updateHtml(gHintsCount, HINT, '.hints');
    }
    //If it's the first click set the first click to true
    if (lastAction.firstClickStatus) {
        gIsFirstClick = true;
    }
    //IF the user clicked on mine the live increase back
    if (lastAction.isMine) {
        gLives++;
        updateHtml(gLives, LIVES, '.lives');
    }
    //If the user change flag status:
    if (lastAction.isRight) {
        if (lastAction.isMarked) {
            gBoard[lastAction.cellPositionI][lastAction.cellPositionJ].isMarked = false;
            gFlagged--;
            renderCell(cell, '');
        } else {
            gBoard[lastAction.cellPositionI][lastAction.cellPositionJ].isMarked = true;
            gFlagged++;
            renderCell(cell, FLAG);
        }
        renderTxts('.mines-counter', `Mines count remaining: ${gMinesCount - gFlagged}`);
        return;
    }
    renderCell(cell, '');
    cell.classList.remove('clicked');
}
/*Define function that update the game (DOM and Model) by the click of user on the board
with left mouse button*/
function cellClicked(cell) {
    var modalHtml = document.querySelector('.manual-modal');
    var cellPosition = getCellPos(cell);
    if (modalHtml.classList.contains('block')) return;
    if (gBoard[cellPosition.i][cellPosition.j].isShown) return;
    gBoard[cellPosition.i][cellPosition.j].isShown = true;
    if (gIsWin) return;
    if (isGameOver) return;
    if (gBoard[cellPosition.i][cellPosition.j].isMarked) return;
    //Save the turn to history (it will use us for undo button)
    saveHistory(cellPosition, false);
    //Check if in hint mode:
    if (gHintStatus) {
        gHintStatus = false;
        gBoard[cellPosition.i][cellPosition.j].isShown = false;
        showTheNegs(gBoard, cellPosition.i, cellPosition.j);
        return;
    }
    //Check if in manually mode:
    if (gIsManually) {
        setMinesManual(gBoard, cellPosition.i, cellPosition.j);
        return;
    }
    //Check if the watch stop started
    if (!gIsWatchCount) {
        startStopWatch();
    }
    // Check if first click
    if (gIsFirstClick) {
        loadMinesOnBoard(gBoard, gMinesCount, cellPosition);
        updateMinesCount(gBoard);
        gIsFirstClick = false;
        //If 0 mines negs open all the negs cells in recursion 
        if (gBoard[cellPosition.i][cellPosition.j].minesAroundCount === 0) {
            expandShown(gBoard, cellPosition.i, cellPosition.j, cell);
        }
        var type = gBoard[cellPosition.i][cellPosition.j].minesAroundCount;
        renderCell(cell, type);
    } else {
        //If click on mine:
        if (gBoard[cellPosition.i][cellPosition.j].isMine) {
            //If have more lives:
            if (gLives > 1) {
                gLives--;
                updateHtml(gLives, LIVES, '.lives');
                gBoard[cellPosition.i][cellPosition.j].isShown = false;
                return;
            } else {
                //No live remaining - game over
                renderCell(cell, MINE);
                cell.classList.add('red');
                gameOver(gBoard);
            }
        } else {
            //regular cell open only it:
            if (gBoard[cellPosition.i][cellPosition.j].minesAroundCount !== 0) {
                type = gBoard[cellPosition.i][cellPosition.j].minesAroundCount;
                renderCell(cell, type);
            } else {
                // 0 negs mines - open all negs cells in recursion
                expandShown(gBoard, cellPosition.i, cellPosition.j, cell);
            }
        }
    }
    cell.classList.add('clicked');
    //Check if win
    gIsWin = checkIfWin(gBoard);
    if (gIsWin) victory();
}

//Helping function:
//Define function that return object with the position of cell (i, j), it will use us to update the model. 
function getCellPos(cell) {
    var cellValues = cell.classList.value.split('-');
    var cellPosition = { i: +cellValues[1], j: parseInt(cellValues[3]) };
    return cellPosition;
}
/* Define function that return object with al details we need to check when player want to do 'undo'
and the enter the click details to history array*/
function saveHistory(cellPosition, isRightClick, isSafeClick) {
    var thisAction = {
        cellShown: gBoard[cellPosition.i][cellPosition.j].isShown,
        cellPositionI: cellPosition.i,
        cellPositionJ: cellPosition.j,
        manuallyStatus: gIsManually,
        hintStatus: gHintStatus,
        firstClickStatus: gIsFirstClick,
        isMine: gBoard[cellPosition.i][cellPosition.j].isMine,
        isMarked: gBoard[cellPosition.i][cellPosition.j].isMarked,
        isRight: isRightClick,
        isSafe: isSafeClick
    };
    gHistory.push(thisAction);
}
//Define function that over the game when user click on mine and have no live anymore
function gameOver(board) {
    clearInterval(gWatchIvl);
    updateHtml(0, LIVES, '.lives');
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (!board[i][j].isShown) {
                if (board[i][j].isMine) {
                    var cell = document.querySelector(`.i-${i}-j-${j}`);
                    renderCell(cell, MINE);
                }
            }
        }
    }
    var emoji = document.querySelector('.restart-button');
    emoji.innerHTML = SAD_SMILEY;
    isGameOver = true;
}
//Define function that check winning

//Define function that check winning
function checkIfWin(board) {
    if (gFlagged !== gMinesCount) return false;
    debugger
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            console.log(board[i][j])
            if (board[i][j].isMine) continue;
            if (board[i][j].isShown === false) return false;
        }
    }
    return true;
}
//Define function that stop and change the game when user win
function victory() {
    var elEmoji = document.querySelector('.restart-button');
    elEmoji.innerHTML = WIN;
    var elWinTxt = document.querySelector('.win-txt');
    var strHtml = 'Winner';
    elWinTxt.innerHTML = strHtml;
    clearInterval(gWatchIvl);
    gEndTime = Date.now();
    saveBestScore();
}
//Define function that open negs cells in ricursion
function expandShown(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue;
            if (i === rowIdx && j === colIdx) continue;
            if (board[i][j].isMarked) continue;
            if (board[i][j].isShown) continue;
            if (!board[i][j].isMine) {
                var cell = document.querySelector(`.i-${i}-j-${j}`);
                cellClicked(cell);
            }
        }
    }
}

//Define function that active the safe click mode:
function safeClicked() {
    if (gSafeClicks < 1) return;
    if (gIsFirstClick) return;
    //Get array with all position that bo have mine or shown and get one of them randomally
    var boardCellsPoses = getNoMinesOrShown(gBoard);
    if (boardCellsPoses.length < 1) {
        return;
    }
    var random = getRandomInt(0, boardCellsPoses.length);
    var position = boardCellsPoses[random];
    //update the safe click counter and html
    gSafeClicks--;
    renderTxts('.safe-num', gSafeClicks);
    //update the position on the DOM but do'n change the model
    var cell = document.querySelector(`.i-${position.i}-j-${position.j}`);
    cell.classList.add('safe');
    //Save it to history:
    saveHistory(position, false, true);
    setTimeout(function () { cell.classList.remove('safe') }, 1000);
}
//Define function to save the bests scores
//TODO - to find shortest way to write it (one function with parameters or something)
//Didn't find the effective way yet.
function saveBestScore() {
    var currTime = (gEndTime - gStartTime) / 1000;
    var bestScore;
    if (gDifficulty === 16) {
        var bestPrevScore = localStorage.getItem('bestScoreEasy');
        bestScore = checkIfBestScore(currTime, bestPrevScore, 'Easy');
        var diff = 'Easy';
    } else if (gDifficulty === 64) {
        var bestPrevScore = localStorage.getItem('bestScoreHard');
        bestScore = checkIfBestScore(currTime, bestPrevScore, 'Hard');
        diff = 'Hard';
    } else {
        var bestPrevScore = localStorage.getItem('bestScoreExtreme');
        bestScore = checkIfBestScore(currTime, bestPrevScore, 'Extreme');
        diff = 'Extreme';
    }
    document.querySelector(`.${diff}`).innerText = `${bestScore} seconds`;
}
// Define function that get the curr score and check if it's the best score of this level
function checkIfBestScore(currTime, bestScore, diff) {
    if (!bestScore || +bestScore > currTime) {
        localStorage.setItem(`bestScore${diff}`, currTime);
        bestScore = localStorage.getItem(`bestScore${diff}`);
        return bestScore;
    } else {
        return bestScore;
    }
}
// Define function to start the stop watch will use it in the first click.
function startStopWatch() {
    gWatchIvl = setInterval(stopWatch, 1000);
    gIsWatchCount = true;
    gStartTime = Date.now();
}
//Define function to set the best scores each level (will use us in unit function to render the txt of score table)
function setBestScore(difficulty) {
    if (difficulty === 16) {
        var bestScore = localStorage.getItem('bestScoreEasy');
    } else if (difficulty === 64) {
        bestScore = localStorage.getItem('bestScoreHard');
    } else if (difficulty === 144) {
        bestScore = localStorage.getItem('bestScoreExtreme');
    }
    return bestScore;
}
//Define function taht show the cell that was clicked and it's negs (will use us in hints mode)
function showTheNegs(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue;
            if (board[i][j].isMarked) continue;
            if (board[i][j].isShown) continue;
            var neg = document.querySelector(`.i-${i}-j-${j}`);
            if (board[i][j].isMine) {
                cellClickWithHint(neg, MINE);
            } else {
                var type = board[i][j].minesAroundCount;
                cellClickWithHint(neg, type);
            }
        }
    }
}
//Define function that active the hints mode.
function getHints() {
    if (gHintStatus) return;
    if (gIsFirstClick) return;
    gHintStatus = true;
    gHintsCount--;
    updateHtml(gHintsCount, HINT, '.hints');
    updateHtml(1, HINT_ACTIVE, '.hint-active');
}
//Define function that show cells only in hint mode (will not change the model, only the dom for 1 sec)
function cellClickWithHint(neg, type) {
    renderCell(neg, type);
    setTimeout(function () {
        renderCell(neg, '');
        updateHtml(1, '', '.hint-active')
    }, 1000);
}