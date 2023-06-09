document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid')
    let squares = Array.from(document.querySelectorAll('.grid div'))
    let smallSquares = Array.from(document.querySelectorAll('.mini-grid div'))
    const scoreDisplay = document.querySelector('#score')
    const startBtn = document.querySelector('#start-button')
    const width = 10
    let nextRandom = 0
    let timerId
    let score = 0
    let isGameOver = false
    let iIsPrevAtLeft = false

    //Add dots to gameboard
    squares.forEach(square => {
      if (square.classList.contains('taken-permanently')) {
        square.innerHTML = "&nbsp=&nbsp"
      } else if (square.classList.contains('bottom-border')) {
        square.innerHTML = "&nbsp&#92;/&nbsp"
      }  else {
        square.innerHTML = "&nbsp&nbsp&nbsp."
      }
      
    })
    smallSquares.forEach(square => {
      square.innerHTML = "&nbsp&nbsp&nbsp."
    })
    const colors = [
      'blue',
      'orange',
      'red',
      'green',
      'purple',
      'yellow',
      'blue'
    ]
  
    //The Tetrominoes
    const jTetromino = [
        [0, width, width+1, width+2],
        [1, 2, width+1, width*2+1],
        [width, width+1, width+2, width*2+2],
        [1, width+1, width*2, width*2+1]
    ]

    const lTetromino = [
        [2, width, width+1, width+2],
        [1, width+1, width*2+1, width*2+2],
        [width, width+1, width+2, width*2],
        [0, 1, width+1, width*2+1]
    ]

    const zTetromino = [
        [0, 1, width+1, width+2],
        [2, width+1, width+2, width*2+1],
        [width, width+1, width*2+1, width*2+2],
        [1, width, width+1, width*2]
    ]

    const sTetromino = [
        [1, 2, width, width+1],
        [1, width+1, width+2, width*2+2],
        [width+1, width+2, width*2, width*2+1],
        [0, width, width+1, width*2+1]
    ]
  
    const tTetromino = [
        [1, width, width+1, width+2],
        [1, width+1, width+2, width*2+1],
        [width, width+1, width+2, width*2+1],
        [1, width, width+1, width*2+1]
    ]
  
    const oTetromino = [
        [1,2,width+1,width+2],
        [1,2,width+1,width+2],
        [1,2,width+1,width+2],
        [1,2,width+1,width+2]
    ]
  
    const iTetromino = [
        [width,width+1,width+2,width+3],
        [2,width+2,width*2+2,width*3+2],
        [width*2,width*2+1,width*2+2,width*2+3],
        [1,width+1,width*2+1,width*3+1]
    ]
  
    const theTetrominoes = [jTetromino, lTetromino, zTetromino, sTetromino, tTetromino, oTetromino, iTetromino]
  
    let currentPosition = 3
    let currentRotation = 0
  
    //console.log(theTetrominoes[0][0])
  
    //randomly select a Tetromino and its first rotation
    let random = Math.floor(Math.random()*theTetrominoes.length)
    let current = theTetrominoes[random][0]
  
    //draw the Tetromino
    function draw() {
      current.forEach(index => {
        squares[currentPosition + index].classList.add('tetromino')
        //squares[currentPosition + index].style.backgroundColor = colors[random]
        squares[currentPosition + index].innerHTML = "[ ]"
      })
    }
  
    //undraw the Tetromino
    function undraw() {
      current.forEach(index => {
        squares[currentPosition + index].classList.remove('tetromino')
        //squares[currentPosition + index].style.backgroundColor = ''
        squares[currentPosition + index].innerHTML = "&nbsp&nbsp&nbsp."
      })
    }
  
    //assign functions to keyCodes
    function control(e) {
      if((e.keyCode === 37) || (e.keyCode === 65)) {
        moveLeft()
      } else if ((e.keyCode === 38) || (e.keyCode === 87)) {
        rotate()
      } else if ((e.keyCode === 39) || (e.keyCode === 68)) {
        moveRight()
      } else if ((e.keyCode === 40) || (e.keyCode === 83)) {
        moveDown()
      }
    }
    /*document.addEventListener('keyup', control)*/
  
    //move down function
    function moveDown() {
        draw()
        if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
          current.forEach(index => squares[currentPosition + index].classList.add('taken'))
        } else {
          undraw()
          currentPosition += width
          draw()
          freeze()
        }
        
    }
  
    //freeze function
    function freeze() {
      if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
        current.forEach(index => squares[currentPosition + index].classList.add('taken'))
        //start a new tetromino falling
        random = nextRandom
        nextRandom = Math.floor(Math.random() * theTetrominoes.length)
        currentRotation = 0
        current = theTetrominoes[random][currentRotation]
        currentPosition = 3
        draw()
        displayShape()
        freeze()
        addScore()
        draw()
      }
    }
  
    //move the tetromino left, unless is at the edge or there is a blockage
    function moveLeft() {
      undraw()
      const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
      if(!isAtLeftEdge) currentPosition -=1
      if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        currentPosition +=1
      }
      draw()
    }
  
    //move the tetromino right, unless is at the edge or there is a blockage
    function moveRight() {
      undraw()
      const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1)
      if(!isAtRightEdge) currentPosition +=1
      if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        currentPosition -=1
      }
      draw()
    }
  
    
    ///FIX ROTATION OF TETROMINOS A THE EDGE 
    function isAtRight() {
      return current.some(index => (currentPosition + index) % width === width -1)  
    }
    
    function isAtLeft() {
      return current.some(index=> (currentPosition + index) % width === 0)
    }
    
    function checkRotatedPosition(P){
      P = P || currentPosition         //get current position.  Then, check if the piece is near the left side.
      if ((P+1) % width < 4) {         //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).     
        if (isAtRight()){              //use actual position to check if it's flipped over to right side
          currentPosition -= 1         //if so, add one to wrap it back around
          checkRotatedPosition(P)      //check again.  Pass position from start, since long block might need to move more.
          }
      }
      else if (P % width > 5) {
        if (theTetrominoes[random] == iTetromino) {
          if (P % width > 7) {
            if (isAtLeft()) {
              if (currentRotation === 0) {
                currentPosition += 1
              }
              else {
                currentPosition += 2
              }
            }
          }
        }
        else if (isAtLeft()) {
          currentPosition += 1
          checkRotatedPosition(P)
        }
      }
    }
    
    function cRP(P) {
      P = P || currentPosition
      if (theTetrominoes[random] == iTetromino) {
        if ((P % width > 7) && (iIsPrevAtLeft))  {
          if (isAtLeft()){
            if (currentRotation === 0) {
              currentPosition += 1
            }
            else {
              currentPosition += 2
            }
          }
        } 
        else if (P % width < 9) {
          if (P % width === 7){
            currentPosition -= 1
          }
          else if (P % width === 8) {
            currentPosition -= 2
          }
        }
      }
      else {
        if ((P+1) % width < 4) {         //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).     
          if (isAtRight()){            //use actual position to check if it's flipped over to right side
            currentPosition += 1    //if so, add one to wrap it back around
            checkRotatedPosition(P) //check again.  Pass position from start, since long block might need to move more.
            }
        }
        else if (P % width > 5) {
          if (isAtLeft()){
            currentPosition -= 1
          checkRotatedPosition(P)
          }
        }
      }
    }
    //rotate the tetromino
    function rotate() {
        iIsPrevAtLeft = false
        let tryCurrentRotation = (currentRotation + 1)
        if(tryCurrentRotation === current.length) { //if the current rotation gets to 4, make it go back to 0
            tryCurrentRotation = 0
        }
        let tryCurrent = theTetrominoes[random][tryCurrentRotation] 
        
    
        undraw()
        iIsPrevAtLeft = current.every(index=> (currentPosition + index) % width < 5)
        currentRotation ++
        if(currentRotation === current.length) { //if the current rotation gets to 4, make it go back to 0
          currentRotation = 0
        }
        current = theTetrominoes[random][currentRotation]
        /*checkRotatedPosition()*/
        cRP()
        current = theTetrominoes[random][currentRotation]
        draw()
    }
    /////////
  
    //show up-next tetromino in mini-grid display
    const displaySquares = document.querySelectorAll('.mini-grid div')
    const displayWidth = 4
    const displayIndex = 0
  
  
    //the Tetrominos without rotations
    const upNextTetrominoes = [
        [0, displayWidth, displayWidth+1, displayWidth+2], //jTetromino
        [2, displayWidth, displayWidth+1, displayWidth+2], //lTetromino
        [0, 1, displayWidth+1, displayWidth+2], //zTetromino
        [1, 2, displayWidth, displayWidth+1], //sTetromino
        [1, displayWidth, displayWidth+1, displayWidth+2], //tTetromino
        [0, 1, displayWidth, displayWidth+1], //oTetromino
        [displayWidth, displayWidth+1, displayWidth+2, displayWidth+3] //iTetromino
    ]
  
    //display the shape in the mini-grid display
    function displayShape() {
      //remove any trace of a tetromino form the entire grid
      displaySquares.forEach(square => {
        square.classList.remove('tetromino')
        square.style.backgroundColor = ''
        square.innerHTML = "&nbsp&nbsp&nbsp."
      })
      upNextTetrominoes[nextRandom].forEach( index => {
        displaySquares[displayIndex + index].classList.add('tetromino')
        //displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
        displaySquares[displayIndex + index].innerHTML = "[ ]"
      })
    }
  
    //add functionality to the button
    startBtn.addEventListener('click', () => {
      if (timerId) {
        clearInterval(timerId)
        timerId = null
        document.removeEventListener('keyup', control)
      } 

      else if (isGameOver && timerId == null) {
        location.reload();
      }
      
      else {
        isGameOver = false
        draw()
        timerId = setInterval(moveDown, 400)
        //nextRandom = Math.floor(Math.random()*theTetrominoes.length)
        displayShape()
        document.addEventListener('keyup', control)
      }
    })
  
    //add score
    function addScore() {
      for (let i = 0; i < 199; i +=width) {
        const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]
        
        // pause 
        clearInterval(timerId)
        timerId = null
        document.removeEventListener('keyup', control)

        if(row.every(index => squares[index].classList.contains('taken'))) {
            
            timerId = null
            score +=10
            scoreDisplay.innerHTML = score
            row.forEach(index => {
                squares[index].classList.remove('taken')
                squares[index].classList.remove('tetromino')
                //squares[index].style.backgroundColor = ''
                squares[index].innerHTML = "&nbsp&nbsp&nbsp."
            })
            const squaresRemoved = squares.splice(i, width)
            squares = squaresRemoved.concat(squares)
            squares.forEach(cell => grid.appendChild(cell))

            
        }
        
        // resume
        undraw()
        displayShape()
        document.addEventListener('keyup', control)
        timerId = setInterval(moveDown, 400)
      }
    }
  
    //game over
    function gameOver() {
      if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        scoreDisplay.innerHTML = 'end'
        clearInterval(timerId)
        /*timerId = null*/
        isGameOver = true
        startBtn.innerHTML = "New game"
        document.removeEventListener('keyup', control)
      }
      //current.some(index => squares[3 + index].classList.contains('taken'))
    }
  
  })
