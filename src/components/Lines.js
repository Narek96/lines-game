import React, { Component } from 'react';
import ScoreBox from './ScoreBox'
import Board from './Board'
import { emptyContent, addAmount } from '../Constants'
import { addNewBall, cloneContent, findPath } from '../utils'
import { newGame, choose, target, move, unchoose, relocateFuture, next, markRemoveBalls, removeBalls, addFuture } from '../reducer';
import { colors } from '../styles'

class Lines extends Component {
  constructor(props) {
    super(props);

    this.newGame = this.newGame.bind(this);
    this.choose = this.choose.bind(this);
    this.target = this.target.bind(this);
    this.move = this.move.bind(this)
  }

  newGame() {
    const newContent = cloneContent(emptyContent);

    for (let i = 0; i < addAmount; i++) {
      const {x, y, color} = addNewBall(newContent);
      newContent[y][x].color = color
    }

    for (let i = 0; i < addAmount; i++) {
      const {x, y, color} = addNewBall(newContent);
      newContent[y][x].future = {color}
    }

    this.props.dispatch(newGame(newContent, addAmount))
  }

  choose(x, y) {
    this.props.dispatch(choose(x, y))
  }

  move(fromX, fromY, toX, toY, content) {
    const path = findPath(fromX, fromY, toX, toY, content);
    let currentX = fromX;
    let currentY = fromY;
    if (path !== undefined) {
      for (let i = 0; i < path.length; i++) {
        const node = path[i].split('-');
        const nextX = parseInt(node[0], 10);
        const nextY = parseInt(node[1], 10);
        this.props.dispatch(move(currentX,  currentY, nextX, nextY));
        currentX = nextX;
        currentY = nextY;
      }
      this.props.dispatch(unchoose());
      this.props.dispatch(relocateFuture(currentX, currentY, toX, toY));
      this.props.dispatch(next());
      this.props.dispatch(markRemoveBalls());
      this.props.dispatch(removeBalls());
      const { content } = this.props;
      for (let i = 0; i < addAmount; i++) {
        const newContent = cloneContent(content);

        const obj = addNewBall(newContent);
        if (obj !== null) {
          this.props.dispatch(addFuture([obj]));
        }
      }
    }
  }

  target(fromX, fromY, toX, toY, content) {
    this.props.dispatch(target(fromX, fromY, toX, toY, content));
    this.move(fromX, fromY, toX, toY, content);
  }

  render() {
    const {score, content, chosen} = this.props;

    return (
      <div style={{width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        <div style={{padding: '30px', borderRadius: '10px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <button style={{padding: '5px', borderRadius: '5px', fontSize: '17px'}} onClick={this.newGame}>New game</button>
          <div style={{height: '10px'}}>
          </div>
          <ScoreBox score={score}/>
        </div>
        <div style={{boxShadow: `0 0 5px 2px ${colors.grey}`}}>
          <Board
            content={content}
            choose={this.choose}
            target={this.target}
            chosen={chosen}/>
        </div>
      </div>
    );
  }
}

export default Lines;
