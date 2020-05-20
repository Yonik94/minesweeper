'use strict'
const MINE = '<img src="img/mine.png" alt="">'
const FLAG = '<img src="img/flag.png" alt="">'
const SMILEY = '<img src="img/smiley.png" alt="">'
const SAD_SMILEY = '<img src="img/smileySad.png" alt="">'
const WIN = '<img src="img/happy.png" alt="">'
const LIVES = '<img src="img/heart.png" alt="">'

var gBoard;
var gIsFirstClick;
var isGameOver = false;
var gMinesCount = 2;
var gFlagged = 0;
var gDifficulty;
var gIsWin;
var gIsWatchCount
var gWatchIvl
var gLives;
var gSafeClicks;
var gStartTime;
var gEndTime;
function init(difficulty) {
    gLives = 3
    updateLives(gLives)
    gSafeClicks = 3
    gIsFirstClick = true
    isGameOver = false
    gIsWin = false
    gFlagged = 0;
    gIsWatchCount = false
    var emoji = document.querySelector('.restart-button')
    emoji.innerHTML = SMILEY
    var minesCounter = document.querySelector('.mines-counter')
    var elBoardContainer = document.querySelector('.win-txt')
    var safeInHtml = document.querySelector('.safe-num')
    safeInHtml.innerText = gSafeClicks
    elBoardContainer.innerText = ''
    gBoard = createBoard(difficulty)
    if (difficulty === 16) {
        gDifficulty = 16
        gMinesCount = 2
    } else if (difficulty === 64) {
        gDifficulty = 64
        gMinesCount = 12
    } else if (difficulty === 144) {
        gDifficulty = 144
        gMinesCount = 30
    }
    minesCounter.innerText = gMinesCount
    renderBoard(gBoard)
}


function createBoard(cellsNum) {
    var board = []
    var length = Math.sqrt(cellsNum)
    for (var i = 0; i < length; i++) {
        board[i] = []
        for (var j = 0; j < length; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

function renderBoard(board) {
    var tableInHtml = document.querySelector('tbody')
    var strHtml = ''
    for (var i = 0; i < board.length; i++) {
        strHtml += `<tr>`
        for (var j = 0; j < board[i].length; j++) {
            strHtml += `<td class="i-${i}-j-${j}"; oncontextmenu="MarkMines(this); return false" onclick="cellClicked(this)"; style="border:1px solid black">`
            if (board[i][j].isShown) {
                strHtml += board[i][j].minesAroundCount + '</td>'
            } else {
                strHtml += '</td>'
            }
        }
    }
    tableInHtml.innerHTML = strHtml
}

function cellClicked(cell) {
    var cellPosition = getCellPos(cell)
    if (gBoard[cellPosition.i][cellPosition.j].isShown) return
    if (gIsWin) return
    if (isGameOver) return
    if (gBoard[cellPosition.i][cellPosition.j].isMarked) return
    if (gIsFirstClick) {
        if (!gIsWatchCount) {
            gWatchIvl = setInterval(stopWatch, 1000)
            gIsWatchCount = true
            gStartTime = Date.now()
            console.log(gStartTime)
        }
        loadMinesOnBoard(gBoard, gMinesCount, cellPosition)
        updateMinesCount(gBoard);
        cell.classList.add('clicked')
        if (gBoard[cellPosition.i][cellPosition.j].minesAroundCount === 0) {
            expandShown(gBoard, cellPosition.i, cellPosition.j, cell)
        }
        gIsFirstClick = false
        var type = gBoard[cellPosition.i][cellPosition.j].minesAroundCount
        renderCell(cell, type)
    } else {
        if (gBoard[cellPosition.i][cellPosition.j].isMine) {
            if (gLives > 1) {
                gLives--
                updateLives(gLives)
                return
            } else {
                renderCell(cell, MINE);
                cell.classList.add('red');
                gameOver(gBoard);
            }
        } else {
            cell.classList.add('clicked')
            if (gBoard[cellPosition.i][cellPosition.j].minesAroundCount !== 0) {
                var type = gBoard[cellPosition.i][cellPosition.j].minesAroundCount
                renderCell(cell, type);
            } else {
                expandShown(gBoard, cellPosition.i, cellPosition.j, cell)
            }
        }
    }
    gBoard[cellPosition.i][cellPosition.j].isShown = true
    gIsWin = checkIfWin(gBoard)
    if (gIsWin) victory()

}

//Helping function:
function updateLives(num) {
    var liveHtml = document.querySelector('.lives')
    var strHtml = ''
    for (var i = 0; i < num; i++) {
        strHtml += LIVES
    }
    liveHtml.innerHTML = strHtml
}
function getCellPos(cell) {
    var cellValues = cell.classList.value.split('-')
    var cellPosition = { i: +cellValues[1], j: +cellValues[3] }
    return cellPosition
}

function loadMinesOnBoard(board, minesNum, cellPos) {
    var positions = getArrayWithAllPoses(board, cellPos)
    for (var i = 0; i < minesNum; i++) {
        var num = getRandomInt(0, positions.length);
        var position = positions[num]
        board[position.i][position.j].isMine = true
        positions.splice(num, 1)
    }
}

function updateMinesCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = countMinesNegs(board, i, j)
        }
    }
}

function MarkMines(cell) {
    if (!gIsWatchCount) {
        gWatchIvl = setInterval(stopWatch, 1000)
        gIsWatchCount = true
    }
    if (gIsWin) return
    var cellPosition = getCellPos(cell)
    if (gBoard[cellPosition.i][cellPosition.j].isMarked) {
        gFlagged--
        //Update the model:
        gBoard[cellPosition.i][cellPosition.j].isMarked = false;
        //update the DOM:
        var type = ''
        renderCell(cell, type)
    } else {
        if (gFlagged === gMinesCount) return
        gFlagged++
        //Update the model:
        gBoard[cellPosition.i][cellPosition.j].isMarked = true;
        //update the DOM:
        var type = FLAG
        renderCell(cell, type)
    }
    var minesCounter = document.querySelector('.mines-counter')
    minesCounter.innerText = (gMinesCount - gFlagged)
    gIsWin = checkIfWin(gBoard)
    if (gIsWin) victory()
}
function gameOver(board) {
    clearInterval(gWatchIvl);
    updateLives(0)
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
    var elBoardContainer = document.querySelector('.win-txt')
    var strHtml = 'Winner'
    elBoardContainer.innerHTML += strHtml
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
            var cell = document.querySelector(`.i-${i}-j-${j}`);
            cell.classList.add('clicked');
            //Update the model
            board[i][j].isShown = true;
            //update the DOM
            var type = (board[i][j].minesAroundCount) ? board[i][j].minesAroundCount : ''
            renderCell(cell, type);
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
    console.log(cell)
    cell.classList.add('safe')
    setTimeout(function () { cell.classList.remove('safe') }, 1000)
}
function saveBestScore(){
    var currTime = (gEndTime - gStartTime)/1000
    if (gDifficulty === 16){
        var bestPrevScore = localStorage.getItem('bestScoreEasy')
        bestScore = checkIfBestScore(currTime, bestPrevScore, 'Easy')
    }else if (gDifficulty === 64){
        var bestPrevScore = localStorage.getItem('bestScoreHard')
        bestScore = checkIfBestScore(currTime, bestPrevScore, 'Hard')
    }else{
        var bestPrevScore = localStorage.getItem('bestScoreExtreme')
        bestScore = checkIfBestScore(currTime, bestPrevScore, 'Extreme')
    }
    document.querySelector('.best-score').innerText = ` ${bestScore}`
}
function checkIfBestScore(currTime, bestScore, diff){
    if (!bestScore || +bestScore > currTime){
        localStorage.setItem(`bestScore${diff}`, currTime)
        bestScore = localStorage.getItem('bestScore')
        return bestScore;
    }else {
        return bestScore;
    }
}