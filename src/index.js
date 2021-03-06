const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")

const width = 20
const gridElem = width * 2
let shapes = [
    {middle: 1, color: "purple", block: [{x:9,y:1}, {x:10,y:1}, {x:11,y:1}, {x:10,y:0}]},
    {middle: 1, color: "cyan", block: [{x:8,y:0}, {x:9,y:0}, {x:10,y:0}, {x:11,y:0}]},
    {middle: 2, color: "green", block: [{x:8,y:0}, {x:9,y:0}, {x:8,y:1}, {x:7,y:1}]},
    {middle: 2, color: "yellow", block: [{x:8,y:0}, {x:9,y:0}, {x:8,y:1}, {x:9,y:1}]},
    {middle: 1, color: "blue", block: [{x:7,y:0}, {x:8,y:0}, {x:9,y:0}, {x:9,y:1}]},
    {middle: 2, color: "red", block: [{x:7,y:0}, {x:8,y:0}, {x:8,y:1}, {x:9,y:1}]},
    {middle: 1, color: "orange", block: [{x:7,y:0}, {x:8,y:0}, {x:9,y:0}, {x:7,y:1}]},
]
let currentShape = [], activeShapes = [], nextMovePosition = [], gameover = false, points = 0

// Random default starting shape
currentShape.push(JSON.parse(JSON.stringify(shapes[Math.floor(Math.random() * shapes.length)])))

const drawMap = () => {
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, 800, 800)
}

const drawShape = () => {
    // currentShape
    for (let el in currentShape) {
        ctx.fillStyle = currentShape[el].color
        for (let key in currentShape[el].block) {
            ctx.fillRect(
                currentShape[el].block[key].x * gridElem,
                currentShape[el].block[key].y * gridElem,
                gridElem,
                gridElem
            )
        }
    }
    // activeShapes
    for (let el in activeShapes) {
        ctx.fillStyle = activeShapes[el].color
        for (let key in activeShapes[el].block) {
            ctx.fillRect(
                activeShapes[el].block[key].x * gridElem,
                activeShapes[el].block[key].y * gridElem,
                gridElem,
                gridElem
            )
        }
    }
}

const detectCollision = (shape) => {
    let collision = false
    let block = {}
    // loop sur shape
    nextMovePosition = JSON.parse(JSON.stringify(shape))
    activeShapesWithoutCurrent = JSON.parse(JSON.stringify(activeShapes))
    activeShapesWithoutCurrent = activeShapesWithoutCurrent.filter((v, i, a) => activeShapes.indexOf(shape) !== i)
    
    for (let key in nextMovePosition.block) {
        nextMovePosition.block[key].y += 1
        // loop sur les formes déjà sur le plateau
        for (let shape in activeShapesWithoutCurrent) {
            // loop sur chaque block de la forme en cours de descente
                if (activeShapesWithoutCurrent[shape].block.find(el => JSON.stringify(el) === JSON.stringify(nextMovePosition.block[key]))) {
                    if (nextMovePosition.block.find(el => el.y == 0)) {
                        gameover = true
                    }
                    collision = true
                    block = nextMovePosition.block[key]
                    break;
                }
        }
    }
    return {'collision': collision, 'block': block}
}

const detectLineComplete = (linesToCheck) => {
    for (var i = 0; i < (width - 1); i++) {
        // récupère tous les block remplis pour la ligne en itération
        let filledBlock = activeShapes.map(el => el.block.filter(el2 => (el2.y === linesToCheck[i] ? el2  : null))).flat().map(el => el.x).sort((a, b) => a - b)
        // vérifie si la sequence est complète
        let missingBlock = Array.from(Array(width-0),(v,i)=>i+0).filter(i=>!filledBlock.includes(i));
        if(Array.isArray(missingBlock) && missingBlock.length === 0) {
            console.log("Line : " + linesToCheck[i] + " is full")
            points += 20
            //supprime la ligne remplie et descend toute la ligne de 1 
            for (let shape in activeShapes) {
                activeShapes[shape].block = activeShapes[shape].block.filter(el => el.y !== linesToCheck[i])
                if (!detectCollision(activeShapes[shape]).collision) {
                    activeShapes[shape].block.filter(el => el.y < 19).map((el, index) => {el.y += 1; return el})
                }
            }
        }
    }
}

const moveShapes = () => {
    if (!currentShape[0].block.find(el => el.y >= (width - 1)) && !detectCollision(currentShape[0]).collision){
        currentShape[0] = nextMovePosition
    } else {
        // vérifie si les lignes modifiées sont complètes
        activeShapes.push(currentShape[0])
        let linesToCheck = currentShape[0].block.map(el => el.y).filter((v, i, a) => a.indexOf(v) === i)
        detectLineComplete(linesToCheck)

         // ajoute nouvelle forme au plateau
        currentShape.shift()
        currentShape.push(JSON.parse(JSON.stringify(shapes[Math.floor(Math.random() * shapes.length)])))
        points += 10
    }
}

const rotateShape = () => {
    // Matrice rotation +90°
    let r = [new Vector(0, 1), new Vector(-1, 0)];
    // Point de rotation
    let middle = new Vector(currentShape[0].block[currentShape[0].middle].x, currentShape[0].block[currentShape[0].middle].y) 
    // loop sur tous les block de la forme
    for (key in currentShape[0].block) {
        let p = new Vector(currentShape[0].block[key].x, currentShape[0].block[key].y).subtract(middle)
        let p2 = new Vector((r[0].x*p.x)+(r[1].x*p.y), (r[0].y*p.x)+(r[1].y*p.y))
        let p3 = middle.add(p2)
        currentShape[0].block[key].x = p3.x
        currentShape[0].block[key].y = p3.y
    }

}

const keyPushed = e => {
    switch (e.key) {
        case "ArrowRight":
            if (!currentShape[0].block.find(el => el.x >= (width - 1))) {
                for (let key in currentShape[0].block) {
                    currentShape[0].block[key].x += 1
                }
            }
            break;
        case "ArrowLeft":
            if (!currentShape[0].block.find(el => el.x === 0)) {
                for (let key in currentShape[0].block) {
                    currentShape[0].block[key].x -= 1
                }
            }
            break;
        case "ArrowUp":
            rotateShape()
        default:
            break;
    }
};
  
window.addEventListener("keydown", keyPushed);

drawMap()

const nextMove = () => {
    drawMap()
    moveShapes()
    drawShape()
    ctx.fillStyle = "white";
    ctx.font = "25px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Points : " + points, 20, 50);

    
    setTimeout(() => {
        if (!gameover) {
            requestAnimationFrame(nextMove);
          } else {
            ctx.font = "80px Arial";
            ctx.textAlign = "center";
            ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
          }
    }, 250)
}
requestAnimationFrame(nextMove)