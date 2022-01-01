function newElement(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barrier(reverse = false) {
    this.element = newElement('div', 'barrier')

    const border = newElement('div', 'border')
    const body = newElement('div', 'body')
    this.element.appendChild(reverse ? body : border)
    this.element.appendChild(reverse ? border: body)
    this.setHeight = height => body.style.height = `${height}px` 
}

// const b = new Barrier(true)
// b.setHeight(200)
// document.querySelector('[wm-flappy]').appendChild(b.element)

function PairOfBarriers(height, opening, x) {
    this.element = newElement('div', 'pair-of-barriers')
    
    this.top = new Barrier(true)
    this.bottom = new Barrier(false)

    this.element.appendChild(this.top.element)
    this.element.appendChild(this.bottom.element)

    this.openingSort = () => {
        const topHeight = Math.random() * (height - opening)
        const topBottom = height - opening - topHeight
        this.top.setHeight(topHeight)
        this.bottom.setHeight(topBottom)

    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.openingSort()
    this.setX(x)
}

// const b = new PairOfBarriers(600, 300, 700)
// document.querySelector('[wm-flappy]').appendChild(b.element)

function Barriers(height, opening, width, space, pointNotification) {
    this.pairs = [
        new PairOfBarriers(height, opening, width),
        new PairOfBarriers(height, opening, width + space),
        new PairOfBarriers(height, opening, width + space * 2),
        new PairOfBarriers(height, opening, width + space * 3)
    ]

    const displacement = 3

    this.cheer = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement)

            // when the element leaves the game

            if(pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + space * this.pairs.length)
                pair.openingSort()
            }

            const quite = width / 2
            const crossedTheMiddle = pair.getX() + displacement >= quite && pair.getX() < quite
            if(crossedTheMiddle) pointNotification()
        })
    }
}

// const barriers = new Barriers(500, 200, 800, 400)
// const gameArea = document.querySelector('[wm-flappy]')
// barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))

// setInterval(() => {
//     barriers.cheer()

// }, 20)

function Bird(gameHeight) {
    let flying = false

    this.element = newElement('img', 'bird')
    this.element.src = 'img/bird.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => flying = true
    window.onkeyup = e => flying = false

    this.cheer = () => {
        const newY = this.getY() + (flying ? 8 : -5)
        const maxHeight = gameHeight - this.element.clientHeight

        if(newY <= 0) {
            this.setY(0)
        }else if(newY >= maxHeight) {
            this.setY(maxHeight)
        }else {
            this.setY(newY)
        }
    }
    this.setY(gameHeight / 2)
}



function Progress() {
    this.element = newElement('span', 'progress')
    this.pointUpdate = points => {
        this.element.innerHTML = points 
    }

    this.pointUpdate(0)
}

function areSuperimposed(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

function crashed(bird, barriers) {
    let crashed = false

    barriers.pairs.forEach(pairOfBarriers => {
        if(!crashed) {
            const top = pairOfBarriers.top.element
            const bottom = pairOfBarriers.bottom.element
            crashed = areSuperimposed(bird.element, top) || areSuperimposed(bird.element, bottom)
        }
    })

    return crashed
}

function FlappyBird() {
    let point = 0

    const gameArea = document.querySelector('[wm-flappy]')
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth

    const progress = new Progress()
    const barriers = new Barriers(height, 200, width, 400, () => progress.pointUpdate(++point))

    const bird = new Bird(height)

    gameArea.appendChild(progress.element)
    gameArea.appendChild(bird.element)
    barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))

    this.start = () => {
        const timer = setInterval(() => {
            bird.cheer()
            barriers.cheer()

            if(crashed(bird, barriers)) {
                clearInterval(timer)
            }
        }, 20)
    }
}

new FlappyBird().start()