'use strict'
var gMinesCount;
var gMinesSetCount;
//Define function that update the mines on board (good for starting the game with no mine)
function loadMinesOnBoard(board, minesNum, cellPos) {
    var positions = getArrayWithAllPoses(board, cellPos);
    for (var i = 0; i < minesNum; i++) {
        var num = getRandomInt(0, positions.length);
        var position = positions[num];
        board[position.i][position.j].isMine = true;
        positions.splice(num, 1);
    }
}
//Define function that update the Model with num of mines negs
function updateMinesCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = getMinesNegsCount(board, i, j);
        }
    }
}
//Define function that mark cells with flag if he think it's mine.
function MarkMines(cell) {
    //If first click start the stop watch
    if (!gIsWatchCount) {
        gWatchIvl = setInterval(stopWatch, 1000);
        gIsWatchCount = true;
    }
    //If game over return nothing (win or lose)
    if (gIsWin) return;
    if (isGameOver) return;
    //Get the position of clicking for model updating.
    var cellPosition = getCellPos(cell);
    if (gBoard[cellPosition.i][cellPosition.j].isShown) return;
    //Check if need to add flag or remove the flag
    if (gBoard[cellPosition.i][cellPosition.j].isMarked) {
        gFlagged--;
        //Update the model:
        gBoard[cellPosition.i][cellPosition.j].isMarked = false;
        //update the DOM:
        var type = '';
        renderCell(cell, type);
    } else {
        if (gFlagged === gMinesCount) return;
        gFlagged++
        //Update the model:
        gBoard[cellPosition.i][cellPosition.j].isMarked = true;
        //update the DOM:
        var type = FLAG;
        renderCell(cell, type);
    }
    saveHistory(cellPosition, true);
    //Update the DOM text of mines remainnig:
    renderTxts('.mines-counter', `Mines count remaining: ${gMinesCount - gFlagged}`);
    //Check if victory
    gIsWin = checkIfWin(gBoard);
    if (gIsWin) victory();
}
//Define function that set the mines counter (The counter will use us to check the victory and more)
function setMinesCount(diff) {
    gDifficulty = diff;
    if (diff === 16) {
        gMinesCount = 2;
    } else if (diff === 64) {
        gMinesCount = 12;
    } else if (diff === 144) {
        gMinesCount = 30;
    }
}
//Define function that call when user will use in manually mode and set the mine by himself
function setMinesManual(board, i, j) {
    //Return nothing if user clicked on cell with mine
    if (board[i][j].isMine) return;
    var modalHtml = document.querySelector('.manual-modal');
    if (modalHtml.classList.contains('block')) return;
    gIsFirstClick = false;
    //Check if this click is the last mine.
    if (gMinesSetCount === gMinesCount - 1) {
        gIsManually = false;
        document.querySelector('.manually').classList.remove('green');
        board[i][j].isMine = true;
        updateMinesCount(board);
        renderTxts('.mines-counter', `Mines count remaining: ${gMinesCount}`);
    } else {
        board[i][j].isMine = true;
        gMinesSetCount++;
        renderTxts('.mines-counter', `Set more ${(gMinesCount - gMinesSetCount)} mine(s) to start`);
    }
    board[i][j].isShown = false;
}