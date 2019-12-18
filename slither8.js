window.onload = function() {
  const c = document.getElementById("c");
  const ctx = c.getContext("2d");
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const startx = 10;
  const starty = 10;
  const dotRad = 2.5;
  const boxSize = 30;

  // const puzzle = [ //requires 'hard' guess
  //   [ 3, 2,-1, 1,-1,-1],
  //   [ 2, 2, 3,-1,-1,-1],
  //   [ 3, 2, 2, 0, 3,-1],
  //   [-1,-1,-1, 2,-1,-1],
  //   [ 3,-1,-1,-1, 3,-1],
  //   [-1,-1,-1,-1,-1,-1]
  // ]
  // const puzzle = [[3,-1,2,-1,-1,-1,3,1,-1,-1,-1,2,3,-1,3,-1],[-1,-1,3,-1,2,2,-1,3,-1,-1,-1,-1,1,-1,-1,-1],[-1,1,3,-1,1,-1,-1,-1,-1,3,3,-1,-1,2,3,-1],[-1,2,2,-1,-1,-1,1,3,-1,-1,2,2,2,-1,-1,-1],[-1,-1,-1,-1,2,-1,-1,-1,-1,-1,-1,1,1,3,-1,-1],[-1,-1,-1,-1,-1,2,-1,-1,-1,2,3,-1,2,3,-1,-1],[-1,-1,2,2,3,-1,3,-1,-1,-1,2,2,2,-1,1,-1],[-1,-1,-1,2,-1,-1,-1,-1,1,1,-1,-1,-1,-1,2,-1],[1,3,-1,2,-1,1,2,-1,-1,-1,1,-1,3,-1,-1,-1],[-1,-1,-1,-1,-1,-1,2,2,-1,3,-1,3,-1,3,-1,-1],
  // [2,2,1,3,-1,-1,-1,3,-1,-1,-1,-1,-1,1,-1,-1],[-1,-1,-1,3,1,-1,-1,2,2,1,1,-1,-1,-1,-1,-1],[-1,-1,1,3,-1,-1,2,-1,-1,3,-1,-1,-1,2,1,-1],[-1,2,2,-1,2,-1,2,3,-1,3,-1,-1,2,3,-1,-1],[-1,1,-1,2,2,-1,-1,-1,1,-1,-1,-1,2,2,3,-1],[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]];
  const puzzle = [[-1,2,2,3,-1,2,2,-1,-1,-1,-1],[-1,-1,1,-1,-1,-1,3,-1,2,1,-1],[3,-1,1,2,2,2,1,-1,3,3,-1],[-1,2,-1,2,2,-1,-1,3,-1,2,-1],[-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1],[-1,2,2,1,2,-1,2,3,2,1,-1],[-1,-1,3,2,3,1,-1,-1,-1,-1,-1],[3,-1,-1,1,3,2,-1,3,3,-1,-1],[-1,-1,3,-1,2,1,-1,-1,-1,-1,-1],[3,-1,-1,2,-1,2,-1,3,3,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]];
  const w = puzzle[0].length - 1;
  const h = puzzle.length - 1;
  const numlines = 2*(w + 1)*(h + 1);

  function load(puzzle) {
    for (j = 0; j <= h; j++) {
      squares.push([]);
      for (i = 0; i <= w; i++) {
        var n = puzzle[j][i];
        squares[j].push(new Square(n,i,j));
      }
    }
    nullSquare = new Square(null,null,null);
  }

  class Square {
    constructor(val, x, y) {
      this.val = val;
      this.x = x;
      this.y = y;
      this.ind = this.y * (w + 1) + this.x;
      this.path = -1;
      this.head = false;
      this.tail = false;

      //tells whether this block is hidden/outside view
      this.outside = (this.x == w || this.y == h);

      //neighbors are links to the node
      this.neighbors = [0,0,0,0] //R,U,L,D
      if (this.x == w) {
        this.neighbors[0] = {x:this.x + 1,y:this.y,linked:-1,visible:false, guessed:false, prodguess:-1};} //R
      else {
        this.neighbors[0] = {x:this.x + 1,y:this.y,linked: 0,visible:true, guessed:false, prodguess:-1};}//R
      if (this.y == 0) {
        this.neighbors[1] = {x:this.x,y:this.y - 1,linked:-1,visible:false, guessed:false, prodguess:-1};} //U
      else {
        this.neighbors[1] = {x:this.x,y:this.y - 1,linked: 0,visible:true, guessed:false, prodguess:-1}; }//U
      if (this.x == 0) {
        this.neighbors[2] = {x:this.x - 1,y:this.y,linked:-1,visible:false, guessed:false, prodguess:-1};} //L
      else {
        this.neighbors[2] = {x:this.x - 1,y:this.y,linked: 0,visible:true, guessed:false, prodguess:-1}; }//L
      if (this.y == h) {
        this.neighbors[3] = {x:this.x,y:this.y + 1,linked:-1,visible:false, guessed:false, prodguess:-1}; } //D
      else {
        this.neighbors[3] = {x:this.x,y:this.y + 1,linked: 0,visible:true, guessed:false, prodguess:-1}; }//D
    }
    //these four functions return the square object that is in the given direction
    right() {
      if (this.x == w) return nullSquare;
      else return squares[this.neighbors[0].y][this.neighbors[0].x];
    }
    top() {
      if (this.y == 0) return nullSquare;
      else return squares[this.neighbors[1].y][this.neighbors[1].x];
    }
    left() {
      if (this.x == 0) return nullSquare;
      else return squares[this.neighbors[2].y][this.neighbors[2].x];
    }
    bottom() {
      if (this.y == h) return nullSquare;
      else return squares[this.neighbors[3].y][this.neighbors[3].x];
    }


    //returns the fill states of the four sides of a box, as well as the total number of filled and blocked sides
    getSides() {
      var sides = {filled:0,blocked:0}; //R,T,L,B,filled,blocked
      sides.top = this.neighbors[0].linked; //top side is linkage to right
      sides.left = this.neighbors[3].linked; //left side is linkage to below
      sides.right = squares[this.y][this.x+1].neighbors[3].linked;//right side is right square's down linkage
      sides.bottom = squares[this.y+1][this.x].neighbors[0].linked;//bottom side is right linkage of square below
      var sidesArr = [sides.top,sides.left,sides.right,sides.bottom];
      var k;
      for (k = 0; k < 4; k++){
        if (sidesArr[k] == 1){
          sides.filled++;
        }
        else if (sidesArr[k] == -1) {
          sides.blocked++;
        }
      }
      return sides;
    }

    getArms() {
      var data = {filled:0,blocked:0};
      for (var k = 0; k < 4; k++) {
        if (this.neighbors[k].linked == 1) {
          data.filled++;
        }
        else if (this.neighbors[k].linked == -1) {
          data.blocked++;
        }
      }
      data.right = this.neighbors[0];
      data.up = this.neighbors[1];
      data.left = this.neighbors[2];
      data.down = this.neighbors[3];
      return data;
    }
  }

  function draw() {
    //clear canvas
    ctx.clearRect(0,0,c.width,c.height);

    //draw numbers
    ctx.font = "16px Arial";
    x = startx + boxSize/2;
    y = starty + boxSize/2;
    for (j = 0; j < h; j++) {
      for (i = 0; i < w; i++) {
        if (squares[j][i].val != -1) {
          ctx.fillText(squares[j][i].val,x,y);
        }
        x += boxSize;
      }
      x = startx + boxSize/2;
      y += boxSize;
    }

    //draw lines
    ctx.font = "12px Arial";
    for (j = 0; j <= h; j++) {
      for (i = 0; i <= w; i++) {
        var square = squares[j][i];
        var x0 = startx + square.x*boxSize;
        var y0 = starty + square.y*boxSize;
        if (square.neighbors[0].visible) {
          //draw top line
          if (square.neighbors[0].linked == 1) {
            ctx.beginPath();
            ctx.moveTo(x0,y0);
            ctx.lineTo(x0 + boxSize,y0);
            ctx.stroke();
            // ctx.fillText(square.neighbors[0].prodguess,x0 + boxSize/2,y0);
            // ctx.fillText(square.path,x0 + boxSize/2,y0);
          }
          // else if (square.neighbors[0].linked == -1) {
          //   ctx.fillStyle="#991F00";
          //   ctx.fillText('x', x0 + boxSize/2, y0);
          //   ctx.fillStyle="#000000";
          // }
        }
        if (square.neighbors[3].visible) {
          //draw left line
          if (square.neighbors[3].linked == 1) {
            ctx.beginPath();
            ctx.moveTo(x0,y0);
            ctx.lineTo(x0,y0 + boxSize);
            ctx.stroke();
            // ctx.fillText(square.path,x0,y0 + boxSize/2);
            // ctx.fillText(square.neighbors[3].prodguess,x0,y0 + boxSize/2);
          }
          // else if (square.neighbors[3].linked == -1) {
          //   ctx.fillStyle="#991F00";
          //   ctx.fillText('x', x0, y0 + boxSize/2);
          //   ctx.fillStyle="#000000";
          // }
        }
      }
    }

    //draw dots
    var x = startx;
    var y = starty;
    for (j = 0; j < h + 1; j++) {
      for (i = 0; i < w + 1; i++) {
        var square = squares[j][i];
        ctx.beginPath();
        ctx.arc(x,y,dotRad,0,2*Math.PI);

        // for (var k = 0; k < guesslocs.length; k++) {
        //   if (square == guesslocs[k]) {
        //     ctx.fillStyle="#00FFFF";
        //   }
        // }
        // if (square == guessloc) {
        //   ctx.fillStyle="#FF0000";
        // }
        // if (square.tail) {
        //   ctx.fillStyle="#0000FF";
        // }
        ctx.fill()
        ctx.fillStyle="#000000"
        x += boxSize;
      }
      x = startx;
      y += boxSize;
    }
  }

  function initial() {
    for (j = 0; j < h; j++) {
      for (i = 0; i < w; i++) {
        square = squares[j][i];
        //handle 3's in four corners of the grid
        if (square.val == 3) {
          if (square.x == 0 && square.y == 0) { //top left square
            link(square,square.right(),1);
            link(square,square.bottom(),1);
          }
          else if (square.x == (w - 1) && square.y == 0) { //top right
            link(square,square.right(),1);
            link(square.right(),square.right().bottom(),1);
          }
          else if (square.x == 0 && square.y == (h - 1)) { //bottom left
            link(square,square.bottom(),1);
            link(square.bottom(),square.bottom().right(),1);
          }
          else if (square.x == (w - 1) && square.y == (h - 1)) { //bottom right
            link(square.right(),square.right().bottom(),1);
            link(square.bottom(),square.bottom().right(),1);
          }
        }
        //handle side-by-side threes
        if (square.val == 3) {
          if (square.right().val == 3) {
            link(square,square.bottom(),1);
            link(square.right(),square.right().bottom(),1);
            link(square.right().right(),square.right().right().bottom(),1);
            if (square.y > 0) {
              link(square.right(),square.right().top(),-1);
            }
            if (square.y < h - 1) {
              link(square.right().bottom(),square.right().bottom().bottom(),-1);
            }
          }
          else if (square.bottom().val == 3) {
            link(square,square.right(),1);
            link(square.bottom(),square.bottom().right(),1);
            link(square.bottom().bottom(),square.bottom().bottom().right(),1);
            if (square.x > 0) {
              link(square.bottom(),square.bottom().left(),-1);
            }
            if (square.x < w - 1) {
              link(square.bottom().right(),square.bottom().right().right(),-1);
            }
          }
          else if (square.bottom().right().val == 3) {
            link(square,square.right(),1);
            link(square,square.bottom(),1);
            link(square.bottom().right().bottom().right(),square.bottom().right().bottom().right().top(),1);
            link(square.bottom().right().bottom().right(),square.bottom().right().bottom().right().left(),1);
          }
          if (square.x > 0) {
            if (square.bottom().left().val == 3) {
              link(square,square.right(),1);
              link(square.right(),square.right().bottom(),1);
              link(square.bottom().left(),square.bottom().left().bottom(),1);
              link(square.bottom().bottom(),square.bottom().bottom().left(),1);
            }
          }
        }
      }
    }
  }

  function getPaths() {
    var paths = [];
    var count = 0;
    var longest = 0; //index of longest path in paths array
    //set all path values to -1
    for (j = 0; j <= h; j++) {
      for (i = 0; i <= w; i++) {
        squares[j][i].head = false;
        squares[j][i].tail = false;
        squares[j][i].path = -1;
      }
    }
    for (j = 0; j <= h; j++) {
      for (i = 0; i <= w; i++) {
        var square = squares[j][i];
        if (square.getArms().filled == 1 && !square.tail) {
          paths.push({id:count, head:square, length:0});
          square.head = true;
          square.path = count;
          var tailFound = false;
          var fromDir = -1;
          while (!tailFound) {
            var arms = square.getArms();
            if (arms.right.linked == 1 && fromDir != 0) {
              fromDir = 2;
              square = square.right();
            }
            else if (arms.up.linked == 1 && fromDir != 1) {
              fromDir = 3;
              square = square.top();
            }
            else if (arms.left.linked == 1 && fromDir != 2) {
              fromDir = 0;
              square = square.left();
            }
            else if (arms.down.linked == 1 && fromDir != 3) {
              fromDir = 1;
              square = square.bottom();
            }
            else {
              tailFound = true;
              paths[count].tail = square;
              square.tail = true;
            }
            paths[count].length++;
            square.path = count;
          }
          count++;
        }
      }
    }
    for (i = 0; i < paths.length; i++) {
      if (paths[i].length > paths[longest].length) {
        longest = i;
      }
    }
    return {count:count, paths:paths, longest:longest};
  }

  function link(a,b,t,g = false) { //t = type
    if (b==0) b = a.right();
    else if (b==1) b = a.top();
    else if (b==2) b = a.left();
    else if (b==3) b = a.bottom();



    if (g) {
      if (b.tail){
        // pathData = getPaths();
        guesslocs.push(pathData.paths[b.path].head);
      }
      else if (b.head) {
        // pathData = getPaths();
        guesslocs.push(pathData.paths[b.path].tail);
      }
      else {
        guesslocs.push(b);
      }
      guessloc = guesslocs[guesslocs.length - 1];
    }
    else if (a == guessloc && t == 1) {
      if (b.tail){
        // pathData = getPaths();
        guesslocs[guesslocs.length - 1] = pathData.paths[b.path].head;
      }
      else if (b.head) {
        // pathData = getPaths();
        guesslocs[guesslocs.length - 1] = pathData.paths[b.path].tail;
      }
      else {
        guesslocs[guesslocs.length - 1] = b;
      }
      guessloc = guesslocs[guesslocs.length - 1];
    }
    else if (b == guessloc && t == 1) {
      if (a.tail){
        // pathData = getPaths();
        guesslocs[guesslocs.length - 1] = pathData.paths[a.path].head;
      }
      else if (a.head) {
        // pathData = getPaths();
        guesslocs[guesslocs.length - 1] = pathData.paths[a.path].tail;
      }
      else {
        guesslocs[guesslocs.length - 1] = a;
      }
      guessloc = guesslocs[guesslocs.length - 1];
    }

    var guessNum;
    if (t == 0) {
      guessNum = -1;
    }
    else {
      guessNum = guessID;
    }

    if (a.x == b.x) {
      if (b.y > a.y) {
        //b is below a
        a.neighbors[3].linked = t;
        b.neighbors[1].linked = t;
        a.neighbors[3].prodguess = guessNum;
        b.neighbors[1].prodguess = guessNum;
        // if(g) {
        // a.neighbors[3].guessed = g;
        // b.neighbors[1].guessed = g;}
      }
      else {
        //b is above a
        a.neighbors[1].linked = t;
        b.neighbors[3].linked = t;
        a.neighbors[1].prodguess = guessNum;
        b.neighbors[3].prodguess = guessNum;
        // if(g) {
        // a.neighbors[1].guessed = g;
        // b.neighbors[3].guessed = g};
      }
    }
    else {
      if (b.x > a.x) {
        //b is right of a
        a.neighbors[0].linked = t;
        b.neighbors[2].linked = t;
        a.neighbors[0].prodguess = guessNum;
        b.neighbors[2].prodguess = guessNum;
        // if(g) {
        // a.neighbors[0].guessed = g;
        // b.neighbors[2].guessed = g};
      }
      else {
        //b is left of a
        a.neighbors[2].linked = t;
        b.neighbors[0].linked = t;
        a.neighbors[2].prodguess = guessNum;
        b.neighbors[0].prodguess = guessNum;
        // if(g) {
        // a.neighbors[2].guessed = g;
        // b.neighbors[0].guessed = g};
      }
    }
  }

  function finished(){
    for (var j = 0; j <= h; j++) {
      for (var i = 0; i <= w; i++) {
        var square = squares[j][i];
        if (square.val != -1){
          if (square.getSides().filled != square.val){
            return false;
          }
        }
      }
    }
    return true;
  }

  function update() {
    for (var j = 0; j < h + 1; j++) {
      for (var i = 0; i < w + 1; i++) {
        var square = squares[j][i];
        var arms = square.neighbors;
        var armsData = square.getArms();
        var sides;
        if (!square.outside) {
          sides = square.getSides();
        }
        var filled = armsData.filled;
        var blocked = armsData.blocked;

        // block links that would form a loop (if more than one path exists)
        if (pathData.count > 1) {
          if (square.head) {
            var pathID = square.path;
            if (square.right().tail && square.right().path == pathID && arms[0].linked == 0){
              link(square,square.right(),-1);
              return true; //
            }
            if (square.top().tail && square.top().path == pathID && arms[1].linked == 0){
              link(square,square.top(),-1);
              return true;
            }
            if (square.left().tail && square.left().path == pathID && arms[2].linked == 0){
              link(square,square.left(),-1);
              return true;
            }
            if (square.bottom().tail && square.bottom().path == pathID && arms[3].linked == 0){
              link(square,square.bottom(),-1);
              return true;
            }
          }
        }

        //if node is saturated or can't be saturated, block remaining node arms
        if ((filled == 2 || blocked == 3) && (filled + blocked != 4)) {
          if (arms[0].linked == 0) {
            link(square,square.right(),-1);
            return true;
          }
          if (arms[1].linked == 0) {
            link(square,square.top(),-1);
            return true;
          }
          if (arms[2].linked == 0) {
            link(square,square.left(),-1);
            return true;
          }
          if (arms[3].linked == 0) {
            link(square,square.bottom(),-1);
            return true;
          }
        }

        if (!square.outside) {
          //if already correct number of sides, block remaining sides
          if ((sides.filled == square.val) && (sides.filled + sides.blocked != 4)) {
            if (sides.right == 0) {
              link(square.right(),square.right().bottom(),-1);
              return true;
            }
            if (sides.top == 0) {
              link(square,square.right(),-1);
              return true;
            }
            if (sides.left == 0) {
              link(square,square.bottom(),-1);
              return true;
            }
            if (sides.bottom == 0) {
              link(square.bottom(),square.bottom().right(),-1);
              return true;
            }
          }
        }
      }
    }
    for (j = 0; j < h + 1; j++) {
      for (i = 0; i < w + 1; i++) {
        var square = squares[j][i];
        var arms = square.neighbors;
        var armsData = square.getArms();
        var sides;
        if (!square.outside) {
          sides = square.getSides();
        }
        var filled = armsData.filled;
        var blocked = armsData.blocked;

        if (!square.outside) {
          // fill in sides that are certain
          if ((4 - sides.blocked == square.val) && sides.blocked + sides.filled != 4) {
            if (sides.right == 0) {
              link(square.right(),square.right().bottom(),1);
              return true;
            }
            if (sides.top == 0) {
              link(square,square.right(),1);
              return true;
            }
            if (sides.left == 0) {
              link(square,square.bottom(),1);
              return true;
            }
            if (sides.bottom == 0) {
              link(square.bottom(),square.bottom().right(),1);
              return true;
            }
          }
        }



        //if only one direction, take it
        if (filled == 1 && blocked == 2) {
          if (arms[0].linked == 0) {
            link(square,square.right(),1);
            return true;
          }
          if (arms[1].linked == 0) {
            link(square,square.top(),1);
            return true;
          }
          if (arms[2].linked == 0) {
            link(square,square.left(),1);
            return true;
          }
          if (arms[3].linked == 0) {
            link(square,square.bottom(),1);
            return true;
          }
        }
      }
    }
    return false;
  }



  function check() {
    getPaths();
    for (var j = 0; j <= h; j++) {
      for (var i = 0; i <= w; i++) {
        square = squares[j][i];
        //check if any node has more than two connections
        if (square.getArms().filled > 2){
          return false;
        }
        //check if any square has more sides filled than is allowed
        if (!square.outside && square.val != -1) {
          if (square.getSides().filled > square.val){
            return false;
          }
        }
        //check if any node has an input without a possible output
        if ((square.getArms().filled == 1) && (square.getArms().blocked == 3)){
          return false;
        }
        //check if any square has fewer available sides than will be needed to fill it
        if(!square.outside){
          if ((4 - square.getSides().blocked)< square.val){
            return false;
          }
        }
        //check if any loops have been formed without the entire puzzle being correct
        if ((square.getArms().filled == 2 && square.path == -1)) {
          if (!finished()){
            return false;
          }
          else {
            finish = Date.now();
            draw();
            var totalTime = (finish - start)/1000;
            alert("Solved in " + totalTime + " seconds.");
            solved = true;
            return true;
          }
        }
      }
    }
    return true;
  }

  function clear() {
    for (var j = 0; j <= h; j++) {
      for (var i = 0; i <= w; i++) {
        var square = squares[j][i];
        var arms = square.getArms();
        if (arms.right.prodguess == guessID) {
          link(square,square.right(),0);
          pathData = getPaths();
          // draw();
        }
        if (arms.down.prodguess == guessID) {
          link(square,square.bottom(),0);
          pathData = getPaths();
          // draw();
        }
      }
    }
  }

  function guess() {
    // var max = pathData.count;
    // if (totalGuesses == 1000){
    //   if (max > 3) {
    //     max = 3;
    //   }
    //   totalGuesses = 0;
    //   guessPos = (guessPos + 1) % max;
    // }
    // if (guessPos >= max){
    //   guessPos = 0;
    // }
    // guessloc = pathData.paths[max-1].head;
    // var n = Math.floor(Math.random()*pathData.count);
    // var guessloc = pathData.paths[n].head;

    // var guessloc = pathData.paths[pathData.longest].head;
    if (guesslocs.length == 0) {
      guesslocs.push(pathData.paths[0].head);
      guessloc = guesslocs[guesslocs.length - 1];
    }


    var square = squares[guessloc.y][guessloc.x];
    var armsData = square.getArms();
    var arms = [armsData.right,armsData.up,armsData.left,armsData.down];

    for (var i = 0; i < 4; i++) {
      if (arms[i].linked == 0) {
        if (i > guesses[guessID + 1]) {
          totalGuesses++;
          guessID++;
          link(square,i,1,true);
          guesses[guessID] = i;
          guesses.push(-1);
          return true;
        }
      }
    }
    return false;
  }

  function setup() {
    solved = false;
    start = Date.now();
    finish = 0;
    drawCount = 0;
    guessPos = 0;
    totalGuesses = 0;
    guesses = [-1];
    squares = [];
    guessID = -1;

    load(puzzle);
    guessloc = nullSquare;
    initial();
    pathData = getPaths();
    // guessloc = pathData.paths[0].head;
    guesslocs = [];

    draw();
  }

  function fullUpdate() {
    change = true;
    error = false;
    var fullUp = setInterval(function() {
      if (change && !error) {
        change = update();
        pathData = getPaths();
        // drawCount++;
        // if (drawCount >= 10000) {
        //   draw();
        //   drawCount = 0;
        // }
        draw();
        error = !check();
        if (solved) {
          draw();
          clearInterval(fullUp);
          return;
        }
      }
      else {
        clearInterval(fullUp);
        if (error){
          clear();
          guesses.pop();
          guesslocs.pop();
          if (guesslocs.length == 0) {
            guesslocs.push(pathData.paths[0].head);
          }
          guessloc = guesslocs[guesslocs.length - 1];
          guessID--;
          pathData = getPaths();
          // draw();
          fullUpdate();
          return;
        }
        if (guess()){
          draw();
          fullUpdate();
          return;
        }
        else  {
          clear();
          guessID--;
          guesses.pop();
          guesslocs.pop();
          if (guesslocs.length == 0) {
            guesslocs.push(pathData.paths[0].head);
          }
          guessloc = guesslocs[guesslocs.length - 1];
          pathData = getPaths();
          // draw();
          fullUpdate();
          return;
        }

      }
    }, 0);
  }

  setup();
  fullUpdate();
}
