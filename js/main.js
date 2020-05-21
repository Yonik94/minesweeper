'use strict'
const MINE = '<img src="img/mine.png" alt="">'
const FLAG = '<img src="img/flag.png" alt="">'
const SMILEY = '<img src="img/smiley.png" alt="">'
const SAD_SMILEY = '<img src="img/smileySad.png" alt="">'
const WIN = '<img src="img/happy.png" alt="">'
const LIVES = '<img src="img/heart.png" alt="">'
const HINT = '<img src="img/hint.png" alt="">'
const HINT_ACTIVE = '<img src="img/hintActive.png" alt="">'

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
    gHintStatus = false
    gIsManually = false
    gMinesSetCount = 0
    gHistory = []
    setMinesCount(difficulty)
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
    var bestScoreEasy = setDiffAndScore(16);
    var bestScoreHard = setDiffAndScore(64);
    var bestScoreExtreme = setDiffAndScore(144);
    renderTxts('.Easy', (bestScoreEasy) ? ` ${bestScoreEasy} seconds` : '-');
    renderTxts('.Hard', (bestScoreHard) ? ` ${bestScoreHard} seconds` : '-');
    renderTxts('.Extreme', (bestScoreExtreme) ? ` ${bestScoreExtreme} seconds` : '-');
    renderTxts('.mines-counter', `Mines count remaining: ${gMinesCount}`);
    renderBoard(gBoard);
    resetStopWatch();
}
//Define function that set the manually status and button design.
function createManually() {
    if (!gIsFirstClick) return
    renderTxts('.mines-counter', `Set more ${(gMinesCount - gMinesSetCount)} mine(s) to start`)
    var modalHtml = document.querySelector('.manualModal')
    gIsManually = !gIsManually
    if (document.querySelector('.manually').classList.contains('green')) {
        document.querySelector('.manually').classList.remove('green')
        modalHtml.classList.remove('block')
    } else {
        modalHtml.classList.add('block')
        setTimeout(function(){modalHtml.classList.remove('block')}, 4000)
        document.querySelector('.manually').classList.add('green')
    }
}
//Define function that take the game one step back in every click on it's button
function undo() {
    //if the game over or if the game in the start return nothing
    if (isGameOver) return
    if (gIsWin) return
    if (gHistory.length < 1) return
    //Get the details of the last click.
    var lastAction = gHistory.splice(gHistory.length - 1, 1)
    lastAction = lastAction[0]
    //If user was on safe mode that what will happen
    if (lastAction.isSafe) {
        gSafeClicks++
        var safeInHtml = document.querySelector('.safe-num')
        safeInHtml.innerText = gSafeClicks
        return
    }
    var cell = document.querySelector(`.i-${lastAction.cellPositionI}-j-${lastAction.cellPositionJ}`)
    gBoard[lastAction.cellPositionI][lastAction.cellPositionJ].isShown = false
    //If user was on manually mode that what will happen
    if (lastAction.manuallyStatus) {
        gMinesSetCount--
        gBoard[lastAction.cellPositionI][lastAction.cellPositionJ].isMine = false
        if (gHistory.length < 1) {
            gIsManually = false
            document.querySelector('.manually').classList.remove('green')
        } else {
            gIsManually = true
            document.querySelector('.manually').classList.add('green')
        }
    }
    //If user was on hint mode that what will happen
    if (lastAction.hintStatus) {
        gHintsCount++
        updateHtml(gHintsCount, HINT, '.hints')
    }
    //If it's the first click set the first click to true
    if (lastAction.firstClickStatus) {
        gIsFirstClick = true
    }
    //IF the user clicked on mine the live increase back
    if (lastAction.isMine) {
        gLives++
        updateHtml(gLives, LIVES, '.lives')
    }
    //If the user change flag status:
    if (lastAction.isRight) {
        if (lastAction.isMarked) {
            gBoard[lastAction.cellPositionI][lastAction.cellPositionJ].isMarked = false
            gFlagged--
            renderCell(cell, '')
        } else {
            gBoard[lastAction.cellPositionI][lastAction.cellPositionJ].isMarked = true
            gFlagged++
            renderCell(cell, FLAG)
        }
        renderTxts('.mines-counter', `Mines count remaining: ${gMinesCount - gFlagged}`);
        return
    }
    renderCell(cell, '')
    cell.classList.remove('clicked')
}
/*Define function that update the game (DOM and Model) by the click of user on the board
with left mouse button*/
function cellClicked(cell) {
    var modalHtml = document.querySelector('.manualModal')
    var cellPosition = getCellPos(cell)
    if (modalHtml.classList.contains('block'))return
    if (gBoard[cellPosition.i][cellPosition.j].isShown) return
    gBoard[cellPosition.i][cellPosition.j].isShown = true
    if (gIsWin) return
    if (isGameOver) return
    if (gBoard[cellPosition.i][cellPosition.j].isMarked) return
    //Save the turn to history (it will use us for undo button)
    saveHistory(cellPosition, false)
    //Check if in hint mode:
    if (gHintStatus) {
        gHintStatus = false
        gBoard[cellPosition.i][cellPosition.j].isShown = false
        showTheNegs(gBoard, cellPosition.i, cellPosition.j)
        return
    }
    //Check if in manually mode:
    if (gIsManually) {
        setMinesManual(gBoard, cellPosition.i, cellPosition.j)
        return
    }
    //Check if the watch stop started
    if (!gIsWatchCount) {
        startStopWatch()
    }
    // Check if first click
    if (gIsFirstClick) {
        loadMinesOnBoard(gBoard, gMinesCount, cellPosition)
        updateMinesCount(gBoard);
        gIsFirstClick = false
        if (gBoard[cellPosition.i][cellPosition.j].minesAroundCount === 0) {
            expandShown(gBoard, cellPosition.i, cellPosition.j, cell)
        }
        var type = gBoard[cellPosition.i][cellPosition.j].minesAroundCount
        renderCell(cell, type)
    } else {
        if (gBoard[cellPosition.i][cellPosition.j].isMine) {
            if (gLives > 1) {
                gLives--
                updateHtml(gLives, LIVES, '.lives')
                gBoard[cellPosition.i][cellPosition.j].isShown = false
                return
            } else {
                renderCell(cell, MINE);
                cell.classList.add('red');
                gameOver(gBoard);
            }
        } else {
            if (gBoard[cellPosition.i][cellPosition.j].minesAroundCount !== 0) {
                type = gBoard[cellPosition.i][cellPosition.j].minesAroundCount
                renderCell(cell, type);
            } else {
                expandShown(gBoard, cellPosition.i, cellPosition.j, cell)
            }
        }
    }
    cell.classList.add('clicked')
    gIsWin = checkIfWin(gBoard)
    if (gIsWin) victory()
}

//Helping function:
function getCellPos(cell) {
    var cellValues = cell.classList.value.split('-')
    var cellPosition = { i: +cellValues[1], j: parseInt(cellValues[3]) }
    return cellPosition
}
function saveHistory(cellPosition, isRightClick, safeClick) {
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
        isSafe: safeClick
    }
    gHistory.push(thisAction)
}


function gameOver(board) {
    clearInterval(gWatchIvl);
    updateHtml(0, LIVES, '.lives')
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (!board[i][j].isShown) {
                if (board[i][j].isMine) {
                    var cell = document.querySelector(`.i-${i}-j-${j}`)
                    renderCell(cell, MINE)
                }
            }
        }
    }
    var emoji = document.querySelector('.restart-button')
    emoji.innerHTML = SAD_SMILEY
    isGameOver = true
}
function checkIfWin(board) {
    if (gFlagged !== gMinesCount) return false
    for (var i = 0; i < board.length; i++)
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) continue
            if (!board[i][j].isShown) return false
        }
    return true
}
function victory() {
    var elEmoji = document.querySelector('.restart-button')
    elEmoji.innerHTML = WIN
    var elWinTxt = document.querySelector('.win-txt')
    var strHtml = 'Winner'
    elWinTxt.innerHTML = strHtml
    clearInterval(gWatchIvl)
    gEndTime = Date.now()
    saveBestScore()
}
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
                cellClicked(cell)
            }
        }
    }
}
function safeClicked() {
    if (gSafeClicks < 1) return
    gSafeClicks--
    var safeInHtml = document.querySelector('.safe-num')
    safeInHtml.innerText = gSafeClicks
    var boardCellsPoses = getNoMinesOrShown(gBoard)
    var random = getRandomInt(0, boardCellsPoses.length)
    var position = boardCellsPoses[random]
    var cell = document.querySelector(`.i-${position.i}-j-${position.j}`)
    cell.classList.add('safe')
    saveHistory(position, false, true)
    setTimeout(function () { cell.classList.remove('safe') }, 1000)
}
function saveBestScore() {
    var currTime = (gEndTime - gStartTime) / 1000
    var bestScore;
    if (gDifficulty === 16) {
        var bestPrevScore = localStorage.getItem('bestScoreEasy')
        bestScore = checkIfBestScore(currTime, bestPrevScore, 'Easy')
        var diff = 'Easy'
    } else if (gDifficulty === 64) {
        var bestPrevScore = localStorage.getItem('bestScoreHard')
        bestScore = checkIfBestScore(currTime, bestPrevScore, 'Hard')
        diff = 'Hard'
    } else {
        var bestPrevScore = localStorage.getItem('bestScoreExtreme')
        bestScore = checkIfBestScore(currTime, bestPrevScore, 'Extreme')
        diff = 'Extreme'
    }
    document.querySelector(`.${diff}`).innerText = `${bestScore} seconds`
}
function checkIfBestScore(currTime, bestScore, diff) {
    if (!bestScore || +bestScore > currTime) {
        localStorage.setItem(`bestScore${diff}`, currTime)
        bestScore = localStorage.getItem(`bestScore${diff}`)
        return bestScore;
    } else {
        return bestScore;
    }
}
function startStopWatch() {
    gWatchIvl = setInterval(stopWatch, 1000)
    gIsWatchCount = true
    gStartTime = Date.now()
}
function setDiffAndScore(difficulty) {
    if (difficulty === 16) {
        var bestScore = localStorage.getItem('bestScoreEasy')
    } else if (difficulty === 64) {
        bestScore = localStorage.getItem('bestScoreHard')
    } else if (difficulty === 144) {
        bestScore = localStorage.getItem('bestScoreExtreme')
    }
    return bestScore
}
function showTheNegs(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue;
            if (board[i][j].isMarked) continue;
            if (board[i][j].isShown) continue;
            var neg = document.querySelector(`.i-${i}-j-${j}`);
            if (board[i][j].isMine) {
                cellClickWithHint(neg, MINE)
            } else {
                var type = board[i][j].minesAroundCount
                cellClickWithHint(neg, type)
            }
        }
    }
}
function getHints() {
    if (gHintStatus) return;
    if (gIsFirstClick) return
    gHintStatus = true;
    gHintsCount--
    updateHtml(gHintsCount, HINT, '.hints')
    updateHtml(1, HINT_ACTIVE, '.hint-active')
}
function cellClickWithHint(neg, type) {
    renderCell(neg, type)
    setTimeout(function () {
        renderCell(neg, '')
        updateHtml(1, '', '.hint-active')
    }, 1000)
}