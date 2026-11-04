const mainContainer = document.getElementById('main-container');

const backgrounds = [
    'images/bg1.png',
    'images/bg2.png',
    'images/thanksimonsarris.png'
];

// Sprite regions in images/entities.png (453x300), mapped from the image's drawings.
const houses = [
    { width: '65px', height: '23px', backgroundPosition: '-8px -12px' },
    { width: '31px', height: '30px', backgroundPosition: '-93px -3px' },
    { width: '65px', height: '32px', backgroundPosition: '-134px -7px' },
    { width: '62px', height: '26px', backgroundPosition: '-217px -8px' },
    { width: '24px', height: '21px', backgroundPosition: '-280px -6px' },
    { width: '22px', height: '23px', backgroundPosition: '-309px -17px' },
    { width: '67px', height: '39px', backgroundPosition: '-66px -44px' },
    { width: '55px', height: '31px', backgroundPosition: '-144px -51px' },
    { width: '43px', height: '27px', backgroundPosition: '-216px -49px' },
    { width: '23px', height: '22px', backgroundPosition: '-273px -40px' },
    { width: '31px', height: '27px', backgroundPosition: '-299px -43px' },
    { width: '25px', height: '21px', backgroundPosition: '-271px -76px' },
    { width: '27px', height: '23px', backgroundPosition: '-313px -76px' },
    { width: '39px', height: '17px', backgroundPosition: '-243px -103px' },
    { width: '37px', height: '31px', backgroundPosition: '-93px -144px' },
    { width: '50px', height: '33px', backgroundPosition: '-154px -142px' },
    { width: '61px', height: '31px', backgroundPosition: '-146px -177px' },
    { width: '38px', height: '24px', backgroundPosition: '-95px -180px' },
];

const trees = [
    { width: '23px', height: '26px', backgroundPosition: '-2px -42px' },
    { width: '27px', height: '25px', backgroundPosition: '-35px -43px' },
    { width: '68px', height: '36px', backgroundPosition: '-7px -83px' },
    { width: '63px', height: '58px', backgroundPosition: '-82px -82px' },
    { width: '76px', height: '56px', backgroundPosition: '-161px -82px' },
    { width: '71px', height: '69px', backgroundPosition: '-1px -140px' },
    { width: '26px', height: '30px', backgroundPosition: '-224px -167px' },
    { width: '22px', height: '33px', backgroundPosition: '-255px -168px' },
    { width: '30px', height: '31px', backgroundPosition: '-282px -168px' },
    { width: '26px', height: '34px', backgroundPosition: '-316px -166px' },
    { width: '67px', height: '63px', backgroundPosition: '-167px -215px' },
];

const structures = [
    { width: '99px', height: '46px', backgroundPosition: '-330px -25px' },
    { width: '68px', height: '63px', backgroundPosition: '-344px -72px' },
    { width: '56px', height: '64px', backgroundPosition: '-275px -98px' },
    { width: '86px', height: '85px', backgroundPosition: '-348px -135px' },
    { width: '136px', height: '75px', backgroundPosition: '-1px -213px' },
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


