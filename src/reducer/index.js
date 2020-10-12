import { cloneContent } from '../utils'
import { lineSize } from '../Constants';

const NEW_GAME = 'NEW_GAME';
export const CHOOSE = 'CHOOSE';
export const UNCHOOSE = 'UNCHOOSE';
export const TARGET = 'TARGET';
export const MOVE = 'MOVE';
export const RELOCATE_FUTURE = 'RELOCATE_FUTURE';
export const NEXT = 'NEXT';
export const ADD_FUTURE = 'ADD_FUTURE';
export const MARK_REMOVE_BALLS = 'MARK_REMOVE_BALLS';
export const REMOVE_BALLS = 'REMOVE_BALLS';

export function newGame(content, count) {
  return {
    type: NEW_GAME,
    content,
    count
  }
}

export function choose(x, y) {
  return {
    type: CHOOSE,
    x, y
  }
}

export function target(fromX, fromY, toX, toY, content) {
  return {
    type: TARGET,
    fromX, fromY, toX, toY, content
  }
}

export function move(fromX, fromY, toX, toY) {
  return {
    type: MOVE,
    fromX, fromY, toX, toY
  }
}

export function unchoose() {
  return {
    type: UNCHOOSE,
  }
}

export function next() {
  return {
    type: NEXT,
  }
}

export function relocateFuture(fromX, fromY, x, y) {
  return {
    type: RELOCATE_FUTURE,
    fromX, fromY, x, y
  }
}

export function markRemoveBalls(currentX, currentY) {
  return {
    type: MARK_REMOVE_BALLS,
    currentX, currentY
  }
}

export function removeBalls() {
  return {
    type: REMOVE_BALLS,
  }
}

export function addFuture(futures) {
  return {
    type: ADD_FUTURE,
    futures
  }
}

export default function reducer(state = {}, action) {
  switch (action.type) {
    case NEW_GAME:
      return { content: action.content, count: action.count, score: 0 };
    case CHOOSE:
      return { ...state, chosenX: action.x, chosenY: action.y };
    case UNCHOOSE:
      return { ...state, chosenX: undefined, chosenY: undefined };
    case MOVE: {
      const content = cloneContent(state.content);
      content[action.toY][action.toX].color = content[action.fromY][action.fromX].color;
      content[action.fromY][action.fromX].color = undefined;
      return {
        ...state,
        content
      }
    }
    case RELOCATE_FUTURE: {
      if (state.content[action.y][action.x].future) {
        const content = cloneContent(state.content);
        content[action.fromY][action.fromX].future = content[action.y][action.x].future;
        content[action.y][action.x].future = undefined;
        return {
          ...state,
          content
        }
      }
      return state
    }
    case NEXT: {
      let count = state.count
      const content = cloneContent(state.content)
      for (let i = 0; i < content.length; i++) {
        for (let j = 0; j < content[0].length; j++) {
          const cell = content[i][j]
          if (cell.future) {
            cell.color = cell.future.color
            cell.future = undefined
            count++
          }
        }
      }
      return {
        ...state,
        count, content
      }
    }
    case ADD_FUTURE: {
      const content = cloneContent(state.content)
      for (let i = 0; i < action.futures.length; i++) {
        const future = action.futures[i];
        content[future.y][future.x] = { future: { color: future.color } }
      }
      return {
        ...state,
        content
      }
    }
    case MARK_REMOVE_BALLS: {
      const content = state.content;
      const newContent = cloneContent(state.content);
      const startX = action.currentX;
      const startY = action.currentY;
      let count = state.count;
      let score = state.score;

      // horizontal
      let horizontalLength = 1;
      for (let j = 1; j < content[startY].length; j++) {
        if (content[startY][j].color && content[startY][j].color === content[startY][j - 1].color) {
          horizontalLength++;
          if (horizontalLength >= lineSize) {
            if (j + 1 === content[startY].length || content[startY][j + 1].color !== content[startY][j].color) {
              for (let k = 0; k < horizontalLength; k++) {
                newContent[startY][j - k].remove = true;
                count--;
                score++
              }
            }
          }
        } else {
          horizontalLength = 1
        }
      }

      // vertical
      let verticalLength = 1
      for (let j = 1; j < content.length; j++) {
        if (content[j][startX].color && content[j][startX].color === content[j - 1][startX].color) {
          verticalLength++

          if (verticalLength >= lineSize) {
            if (j + 1 === content.length || content[j + 1][startX].color !== content[j][startX].color) {
              for (let k = 0; k < verticalLength; k++) {
                newContent[j - k][startX].remove = true
                count--
                score++
              }
            }
          }
        } else {
          verticalLength = 1
        }
      }

      // diagonal left to down
      let leftStartIndexI = 0;
      let leftEndIndexI = 0;
      let leftStartIndexJ = 0;
      let leftEndIndexJ = 0;

      if (startX > startY) {
        leftStartIndexI = 0;
        leftEndIndexI = content.length - (startX - startY);
        leftStartIndexJ = startX - startY;
        leftEndIndexJ = content.length;
      } else {
        leftStartIndexI = startY - startX;
        leftEndIndexI = content.length;
        leftStartIndexJ = 0;
        leftEndIndexJ = content.length - (startY - startX);
      }

      let leftDiaganalLength = 1;
      let j = leftStartIndexJ + 1;
      for (let i = leftStartIndexI + 1; i < leftEndIndexI; i++) {
        if (content[i][j].color && content[i][j].color === content[i - 1][j - 1].color) {
          leftDiaganalLength++
          if (leftDiaganalLength >= lineSize) {
            for (let k = 0; k < leftDiaganalLength; k++) {
              newContent[i - k][j - k].remove = true
              count--;
              score++
            }
          }
        } else {
          leftDiaganalLength = 1
        }
        j = j + 1;
      }

      // diagonal right to down
      let rightStartIndexI = 0;
      let rightEndIndexI = 0;
      let rightStartIndexJ = 0;
      let rightEndIndexJ = 0;

      if (startY * (-1) > startX - (content.length - 1)) {
        rightStartIndexI = 0;
        rightEndIndexI = startX + startY + 1;
        rightStartIndexJ = 0;
        rightEndIndexJ = startX + startY ;
      } else {
        rightStartIndexI = startY - (content.length - 1 - startX);
        rightEndIndexI = content.length;
        rightStartIndexJ = startX - (content.length - 1 - startY);
        rightEndIndexJ = content.length - 1;
      }

      let rightDiaganalLength = 1;
      let p = rightEndIndexJ - 1;
      for (let i = rightStartIndexI + 1; i < rightEndIndexI; i++) {
        if (content[i][p].color && content[i][p].color === content[i - 1][p + 1].color) {
          rightDiaganalLength++;
          if (rightDiaganalLength >= lineSize) {
            for (let k = 0; k < rightDiaganalLength; k++) {
              newContent[i - k][p + k].remove = true
              count--;
              score++
            }
          }
        } else {
          rightDiaganalLength = 1
        }
        p = p - 1;
      }


      return {
        ...state,
        content: newContent,
        count,
        score
      }
    }
    case REMOVE_BALLS: {
      const newContent = cloneContent(state.content)
      newContent.forEach(row => {
        row.forEach(cell => {
          if (cell.remove) {
            cell.color = undefined;
            cell.remove = undefined
          }
        })
      })
      return {
        ...state,
        content: newContent
      }
    }
    default:
      return state;
  }
}
