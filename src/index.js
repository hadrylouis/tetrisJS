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
let currentShape = [], activeShapes = [], nextMovePosition = [], gameover = false
// Default starting shape
currentShape.push(JSON.parse(JSON.stringify(shapes[0])))

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

const detectCollision = () => {
    let collision = false;
    // loop sur l'élément en cours de descente
    nextMovePosition = JSON.parse(JSON.stringify(currentShape[0]))
    for (let key in nextMovePosition.block) {
        nextMovePosition.block[key].y += 1
        // loop sur les formes déjà sur le plateau
        for (let shape in activeShapes) {
            // loop sur chaque block de la forme en cours de descente
                if (activeShapes[shape].block.find(el => JSON.stringify(el) === JSON.stringify(nextMovePosition.block[key]))) {
                    if (nextMovePosition.block.find(el => el.y == 0)) {
                        gameover = true
                    }
                    collision = true
                    break;
                }
        }
    }
    return collision
}

const moveShapes = () => {
    if (!currentShape[0].block.find(el => el.y >= (width - 1)) && !detectCollision()){
        currentShape[0] = nextMovePosition
    } else {
        // ajoute nouvelle forme au plateau
        activeShapes.push(currentShape[0])
        currentShape.shift()
        currentShape.push(JSON.parse(JSON.stringify(shapes[Math.floor(Math.random() * shapes.length)])))
    }
}

const rotateShape = () => {
    // Matrice rotation +90°
    let r = [new Vector(0, 1), new Vector(-1, 0)];
    // Point de rotation
    let middle = new Vector(currentShape[0].block[currentShape[0].middle].x, currentShape[0].block[currentShape[0].middle].y) 
    // loop sur tous les block de la forme
    for (key in currentShape[0].block) {
        let p = new Vector(currentShape[0].block[key].x, currentShape[0].block[key].y)
        let p1 = p.subtract(middle)
        let p2 = new Vector((r[0].x*p1.x)+(r[1].x*p1.y), (r[0].y*p1.x)+(r[1].y*p1.y))
        p3 = middle.add(p2)
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

    
    setTimeout(() => {
        if (!gameover) {
            requestAnimationFrame(nextMove);
          } else {
            ctx.fillStyle = "white";
            ctx.font = "80px Arial";
            ctx.textAlign = "center";
            ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
          }
    }, 100)
}
requestAnimationFrame(nextMove)