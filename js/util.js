'use strict'
//Define function that create and return board with objects.
function createBoard(cellsNum) {
  var board = [];
  var length = Math.sqrt(cellsNum);
  for (var i = 0; i < length; i++) {
    board[i] = [];
    for (var j = 0; j < length; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
      };
    }
  }
  return board;
}
//Define function that render board to html
function renderBoard(board) {
  var tableInHtml = document.querySelector('tbody');
  var strHtml = '';
  for (var i = 0; i < board.length; i++) {
    strHtml += `<tr>`
    for (var j = 0; j < board[i].length; j++) {
      strHtml += `<td class="i-${i}-j-${j}"; oncontextmenu="MarkMines(this); return false"
          onclick="cellClicked(this)"; style="border:3px solid grey">`;
      if (board[i][j].isShown) {
        strHtml += board[i][j].minesAroundCount + '</td>';
      } else {
        strHtml += '</td>';
      }
    }
  }
  tableInHtml.innerHTML = strHtml;
}
//Define function the render txt with "innerText" by prameters of slector and txt.
function renderTxts(selector, txt) {
  var tagInHtml = document.querySelector(selector);
  tagInHtml.innerText = txt;
}
//Define function that return random num between min and max (max is not include) 
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
/*Define function that return array with objects of all positions in the board
(have optional parameter to cut spec pos from the array)*/
function getArrayWithAllPoses(board, cellToCut) {
  var positions = [];
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      var position = { i: i, j: j };
      if (position.i === cellToCut.i && position.j === cellToCut.j) continue;
      positions.push(position);
    }
  }
  return positions;
}
//Define function that return array with al cell that not mine or shown
function getNoMinesOrShown(board) {
  var positions = [];
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      var position = { i: i, j: j };
      if ((board[position.i][position.j].isMine) || (board[position.i][position.j].isShown)) continue;
      positions.push(position);
    }
  }
  return positions;
}
//Define function that render specific cell by positin and the type to enter the cell.
function renderCell(cell, type) {
  cell.innerHTML = type;
}
//Define function that return the count of mine negs of spec cell
function getMinesNegsCount(board, rowIdx, colIdx) {
  var minesCount = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > board.length - 1) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > board[0].length - 1) continue;
      if (i === rowIdx && j === colIdx) continue;
      var cell = board[i][j];
      if (cell.isMine) minesCount++;
    }
  }
  return minesCount;
}
// this is the setting of stopwatch
// This is the variables of the time   of the stopwatch
var gSeconds = 0;
var gMinutes = 0;
var gHours = 0;

// This is the variables of the display time in the stopwatch:
var gDispalySeconds = 0;
var gDisplayMinutes = 0;
var gDisplayHours = 0;

function stopWatch() {

  gSeconds++;

  if (gSeconds / 60 === 1) {
    gSeconds = 0;
    gMinutes++;
  }
  if (gMinutes / 60 === 1) {
    gMinutes = 0;
    gHours++;
  }
  if (gSeconds < 10) {
    gDispalySeconds = "0" + gSeconds;
  } else {
    gDispalySeconds = gSeconds;
  }
  if (gMinutes < 10) {
    gDisplayMinutes = "0" + gMinutes;
  } else {
    gDisplayMinutes = gMinutes;
  }
  if (gHours < 10) {
    gDisplayHours = "0" + gHours;
  } else {
    gDisplayHours = gHours;
  }
  document.querySelector('.stop-watch').innerHTML = gDisplayHours + ":" + gDisplayMinutes + ":" + gDispalySeconds;
}
//Define function that reset the stop-watch
function resetStopWatch() {
  clearInterval(gWatchIvl);
  gSeconds = 0;
  gMinutes = 0;
  gHours = 0;
  gDispalySeconds = 0;
  gDisplayMinutes = 0;
  gDisplayHours = 0;
  document.querySelector('.stop-watch').innerHTML = "00:00:00";
}
/*Define function that update the innerHTML by parameters of selector,
txt and num of times the txt should appearin the spec selector (usee loop to increase the string)*/
function updateHtml(num, txt, selector) {
  var liveHtml = document.querySelector(selector);
  var strHtml = '';
  for (var i = 0; i < num; i++) {
    strHtml += txt;
  }
  liveHtml.innerHTML = strHtml;
}