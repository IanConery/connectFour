const createBoard = (rows, columns) => {
  const board = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    row.length = columns;
    board.push(row.fill(false));
  }
  return board;
};

const colors = {
  one: 'red',
  two: 'black'
};

const columns = 7;
const rows = 6;
const board = createBoard(rows, columns);
const currentPlayers = {};
let playerTurn = 'one';

const parseInfo = (info) => {
  info.forEach((pair) => {
    const { name, value } = pair;
    currentPlayers[name] = value;
  });
};

const htmlBoard = board.map((row, rowIndex) => {
  const innerRow = row.map((column, columnIndex) => {
    return `<div class="board-square col-md"><div id="${rowIndex}${columnIndex}" class="circle text-center"></div></div>`
  });
  return `<div class="row">${innerRow.join('')}</div>`;
});

const isOccupied = (row, column) => {
  return board[row][column]
};

const isBoardFull = (firstRow) => {
  // we only need to check the first row to see if the borad is full
  return firstRow.every((col) => col !== false);
};

const checkPlacement = (id) => {
  let [row, column] = id.toString().split('');
  let correctRow = parseInt(row, 10);
  column = parseInt(column, 10);

  if (isOccupied(correctRow, column)) {
    for (let i = correctRow - 1; i >= 0; i--) {
      if (!isOccupied(i, column)){
        correctRow = i;
        break;
      }
    }
  } else {
    for (let i = correctRow + 1; i < rows; i++) {
      if (isOccupied(i, column)) {
        break;
      } else {
        correctRow = i;
      }
    }
  }
  return isOccupied(correctRow, column) ? [false, column] : [correctRow, column];
};

const animateDrop = (row, column) => {
  for (let i = 0; i <= row; i++) {
    const prev = i - 1;
    setTimeout(() => {
      if (prev >= 0){
        $(`#${prev}${column}`).css('background-color', 'lightgrey');
      }
      $(`#${i}${column}`).css('background-color', colors[playerTurn]);
    }, i * 150)
  }
};

const findStartingPoint = (row, column, direction) => {
  if (direction === 'left') {
    while (row > 0 && column > 0) {
      row--;
      column--;
    }
  } else {
    while (row > 0 && column < columns) {
      row--;
      column++;
    }
  }
  return [row, column];
};

const getLeftAndRightDiagonals = (matrix, rowIndex, columnIndex) => {
  const leftDiagonal = [];
  const rightDiagonal = [];

  let [leftRow, leftColumn] = findStartingPoint(rowIndex, columnIndex, 'left');
  let [rightRow, rightColumn] = findStartingPoint(rowIndex, columnIndex, 'right');

  for (let i = leftRow; i < rows; i++) {
    if (leftColumn < columns) {
      leftDiagonal.push(matrix[i][leftColumn]);
      leftColumn++;
    }
  }

  for (let i = rightRow; i < rows; i++) {
    if (rightColumn >= 0) {
      rightDiagonal.push(matrix[i][rightColumn]);
      rightColumn--;
    }
  }

  return [leftDiagonal, rightDiagonal];
};

const getRowFromColumn = (matrix, columnIndex) => {
  const columnArray = [];
  matrix.forEach((row) => {
    columnArray.push(row[columnIndex]);
  });
  return columnArray;
};

const isFourInARow = (array, color) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === color && array[i + 1] === color && array[i + 2] === color && array[i + 3] === color) {
      return true;
    }
  }
  return false;
};

const isWinningSolution = (rowIndex, columnIndex, color) => {
  const copy = board.slice();
  const row = copy[rowIndex];
  const columnRow = getRowFromColumn(copy, columnIndex);
  const [leftDiagonal, rightDiagonal] = getLeftAndRightDiagonals(copy, rowIndex, columnIndex);

  if (isFourInARow(row, color)) {
    return true;
  }
  if (isFourInARow(columnRow, color)) {
    return true;
  }
  if (isFourInARow(leftDiagonal, color)) {
    return true;
  }
  if (isFourInARow(rightDiagonal, color)) {
    return true;
  }
  return false;
};

$(document).ready(()=>{

  $('#board').append(htmlBoard.join(''));

  $('#player-popup').toggle();

  $('#start').on('click', (e) => {
    e.preventDefault();
    parseInfo($('#player-form').serializeArray());
    $('#player-popup').toggle();
    $('#one').text(currentPlayers.one);
    $('#one').addClass('highlight');
    $('#two').text(currentPlayers.two)
  });

  $('.circle').on('click', (e) => {
    const { id } = e.target;
    const color = colors[playerTurn];
    const [row, column] = checkPlacement(id);

    if (row === false) {
      alert('That column is full please choose another');
    } else {
      board[row][column] = color;
      animateDrop(row,column);
      if (isWinningSolution(row, column, color)) {
        setTimeout(() => {
          const result = confirm(`${currentPlayers[playerTurn]} is the winner. Would you like to play again?`);
          if (result) location.reload(true);
        }, 900); // delay so the animation can finish
      }
      if (isBoardFull(board[0])) {
        setTimeout(() => {
          const result = confirm('There seems to be a tie. Would you like to play again?');
          if (result) location.reload(true);
        }, 900);
      }
      setTimeout(() => {
        $(`#${playerTurn}`).removeClass('highlight');
        playerTurn = playerTurn === 'one' ? 'two' : 'one';
        $(`#${playerTurn}`).addClass('highlight');
      }, 900);
    }
  });

});