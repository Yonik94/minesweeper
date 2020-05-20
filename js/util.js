'use strict'
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
function getArrayWithAllPoses(board, cellToCut) {
    var positions = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var position = { i: i, j: j }
            if (position.i === cellToCut.i && position.j === cellToCut.j) continue
            positions.push(position)
        }
    }
    return positions
}
function getNoMinesOrShown(board) {
  var positions = []
  for (var i = 0; i < board.length; i++) {
      for (var j = 0; j < board[i].length; j++) {
          var position = { i: i, j: j }
          if ((board[position.i][position.j].isMine) || (board[position.i][position.j].isShown)) continue
          positions.push(position)
      }
  }
  return positions
}
function renderCell(cell, type) {
        cell.innerHTML = type
}
function countMinesNegs(board, rowIdx, colIdx) {
    var minesCount = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var cell = board[i][j]
            if (cell.isMine) minesCount++
        }
    }
    return minesCount
}

// this is the setting of stopwatch
  // This is the variables of the time   of the stopwatch
  var seconds = 0
  var minutes = 0
  var hours = 0
  
    // This is the variables of the display time in the stopwatch:
  var dispalySeconds = 0
  var displayMinutes = 0
  var displayHours = 0
  
  function stopWatch(){
  
  seconds++
  
  if (seconds / 60 === 1){
    seconds = 0;
    minutes++;
  }
  if (minutes / 60 === 1){
    minutes = 0;
    hours++;
  }
  if (seconds<10){
    dispalySeconds = "0" + seconds;
  }else{
  dispalySeconds = seconds;
  }
  if (minutes<10){
    displayMinutes = "0" + minutes;
  }else{
    displayMinutes = minutes;
  }
  if (hours<10){
    displayHours = "0" + hours;
  }else{
    displayHours = hours;
  }
  document.querySelector('.stop-watch').innerHTML =  displayHours + ":" + displayMinutes + ":" + dispalySeconds;
  }  