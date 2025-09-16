const mainContainer = document.getElementById('main-container');

const backgrounds = [
    'images/bg1.png',
    'images/bg2.png',
    'images/thanksimonsarris.png'
];

const houses = [
    { width: '71px', height: '23px', backgroundPosition: '-2px -12px' },
    { width: '21px', height: '24px', backgroundPosition: '-309px -17px' },
    { width: '25px', height: '22px', backgroundPosition: '-279px -6px' },
    { width: '53px', height: '27px', backgroundPosition: '-206px -49px' },
];

const trees = [
    { width: '83px', height: '65px', backgroundPosition: '-151px -214px' },
    { width: '72px', height: '70px', backgroundPosition: '0 -139px' },
];

const structures = [
    { width: '149px', height: '80px', backgroundPosition: '0 -210px' },
];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function createEntity(entity, top, left) {
    const div = document.createElement('div');
    div.classList.add('sprite');
    div.style.width = entity.width;
    div.style.height = entity.height;
    div.style.backgroundPosition = entity.backgroundPosition;
    div.style.top = (top + 20) + 'px'; // Start 20px below
    div.style.left = left + 'px';
    mainContainer.appendChild(div);

    setTimeout(() => {
        div.style.top = top + 'px';
        div.style.opacity = 1;
    }, 100);
}

window.addEventListener('load', () => {
    const randomBackground = getRandomElement(backgrounds);
    mainContainer.style.backgroundImage = `url(${randomBackground})`;

    const numEntities = 30;

    const allPossibleEntities = [...houses, ...trees];

    for (let i = 0; i < numEntities; i++) {
        setTimeout(() => {
            const entity = getRandomElement(allPossibleEntities);
            const top = Math.random() * (mainContainer.clientHeight - parseInt(entity.height));
            const left = Math.random() * (mainContainer.clientWidth - parseInt(entity.width));
            createEntity(entity, top, left);
        }, i * 100); // 100ms delay between each spawn
    }
});

mainContainer.addEventListener('click', (e) => {
    const allEntities = [...houses, ...trees, ...structures];
    const entity = getRandomElement(allEntities);
    const top = e.clientY - mainContainer.getBoundingClientRect().top - (parseInt(entity.height) / 2);
    const left = e.clientX - mainContainer.getBoundingClientRect().left - (parseInt(entity.width) / 2);
    createEntity(entity, top, left);
});


