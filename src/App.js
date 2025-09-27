import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [winner, setWinner] = useState(null);
  const [round, setRound] = useState(1);
  const [roundScore, setRoundScore] = useState({ X: 0, O: 0, Draw: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [final, setFinal] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const roundCompletedRef = useRef(false); // <--- use ref to track round completion

  const winningCombos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  const checkWinner = (boardToCheck) => {
    if (roundCompletedRef.current) return; // prevent double score

    for (let combo of winningCombos){
      const [a,b,c] = combo;
      if(boardToCheck[a] && boardToCheck[a] === boardToCheck[b] && boardToCheck[a] === boardToCheck[c]){
        setWinner(boardToCheck[a]);
        setGameOver(true);
        setRoundScore(prev => ({...prev, [boardToCheck[a]]: prev[boardToCheck[a]] + 1}));
        setShowMessage(true);
        roundCompletedRef.current = true; // mark round completed
        return;
      }
    }

    if(!boardToCheck.includes(null)){
      setWinner("Draw");
      setGameOver(true);
      setRoundScore(prev => ({...prev, Draw: prev.Draw + 1}));
      setShowMessage(true);
      roundCompletedRef.current = true; // mark round completed
    }
  }

  const handleClick = (index) => {
    if(board[index] || roundCompletedRef.current) return;
    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    checkWinner(newBoard);

    // AI move
    setTimeout(() => {
      if(roundCompletedRef.current) return; // prevent AI from playing after round ends
      const emptySquares = newBoard.map((v,i)=>v===null?i:null).filter(v=>v!==null);
      if(emptySquares.length){
        const aiIndex = emptySquares[Math.floor(Math.random()*emptySquares.length)];
        newBoard[aiIndex] = "O";
        setBoard([...newBoard]);
        checkWinner([...newBoard]);
      }
    }, 300)
  }

  // Hide message after 2 seconds
  useEffect(()=>{
    if(showMessage){
      const timer = setTimeout(()=>setShowMessage(false), 2000);
      return ()=>clearTimeout(timer);
    }
  },[showMessage])

  // Move to next round or final
  useEffect(()=>{
    if(gameOver && !final){
      if(round<3){
        const timer = setTimeout(()=>{
          setBoard(Array(9).fill(null));
          setWinner(null);
          setGameOver(false);
          setRound(prev=>prev+1);
          roundCompletedRef.current = false; // reset flag for next round
        },2000)
        return ()=>clearTimeout(timer);
      } else {
        setFinal(true);
      }
    }
  },[gameOver, round, final])

  const finalWinner = () => {
    if(roundScore.X>roundScore.O) return "You are the ultimate winner!";
    if(roundScore.O>roundScore.X) return "AI is the ultimate winner!";
    return "It's a tie!";
  }

  const restartGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setRound(1);
    setRoundScore({X:0,O:0,Draw:0});
    setGameOver(false);
    setFinal(false);
    setShowMessage(false);
    roundCompletedRef.current = false; // reset ref
  }

  return (
    <div className="App">
      <h1>Tic-Tac-Toe</h1>

      <h2>Round: {round}</h2>

    
      <div className="round-score">
         Your Wins: {roundScore.X} |    AI Wins: {roundScore.O} | Draws: {roundScore.Draw}
      </div>

      <div className={`board-wrapper ${showMessage ? "blur" : ""}`}>
        <div className="board">
          {board.map((value,index)=>(
            <button key={index} className={`square ${value?value:""}`} onClick={()=>handleClick(index)}>
              {value}
            </button>
          ))}
        </div>
        {showMessage && !final && (
          <div className="overlay">
            {winner==="Draw" ? "Round Draw!" : `${winner} Wins This Round!`}
          </div>
        )}
      </div>

      {final && (
        <div className="overlay final">
          {finalWinner()} <br/>
          <button className="restart-btn" onClick={restartGame}>Restart Game</button>
        </div>
      )}

      {/* Confetti */}
      {showMessage && !final && (
        <div className="confetti">
          {Array.from({length:50}).map((_,i)=><div key={i} className="confetti-piece" />)}
        </div>
      )}
    </div>
  )
}

export default App;
