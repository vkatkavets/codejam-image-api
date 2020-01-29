let link;
async function getLinkToImage(city) {
  const urlFirst = 'https://api.unsplash.com/photos/random?query=town,';
  const urlSecond = '&client_id=a6b156e34015e0044eb8949c7077b02d79a176132613bc9394c5b460dcf83286';
  const url = urlFirst + city + urlSecond;
  const response = await fetch(url);
  const data = await response.json();
  link = await data.urls.small;
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let saveCanvas;

function drawImg(url) {
  const image = new Image();
  image.src = url;
  image.crossOrigin = 'Anonymous';
  image.onload = () => {
    let x;
    let y;
    let width;
    let height;
    if (image.width === image.height) {
      x = 0;
      y = 0;
      width = canvas.width;
      height = canvas.height;
    } else if (image.width > image.height) {
      width = canvas.width;
      if (canvas.width > image.width) {
        height = canvas.width - image.width + image.height;
        x = 0;
        y = (canvas.height - height) / 2;
      } else {
        height = image.height - (image.width - canvas.width);
        x = 0;
        y = (canvas.height - height) / 2;
      }
    } else if (image.width < image.height) {
      height = canvas.height;
      if (canvas.width > image.width) {
        width = canvas.height - image.height + image.width;
        x = (canvas.width - width) / 2;
        y = 0;
      } else {
        width = image.width - (image.height - canvas.height);
        x = (canvas.width - width) / 2;
        y = 0;
      }
    }
    ctx.drawImage(image, x, y, width, height);
  };
}

function getPixelPos(x, y) {
  return (y * canvas.width + x) * 4;
}

function matchStartColor(data, pos, startColor) {
  return (
    data[pos] === startColor.r &&
    data[pos + 1] === startColor.g &&
    data[pos + 2] === startColor.b &&
    data[pos + 3] === startColor.a
  );
}

function colorPixel(data, pos, color) {
  data[pos] = color.r || 0;
  data[pos + 1] = color.g || 0;
  data[pos + 2] = color.b || 0;
  data[pos + 3] = Object.prototype.hasOwnProperty.call(color, 'a') ? color.a : 255;
}

function floodFill(startX, startY, fillColor) {
  const dstImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const dstData = dstImg.data;

  const startPos = getPixelPos(startX, startY);
  const startColor = {
    r: dstData[startPos],
    g: dstData[startPos + 1],
    b: dstData[startPos + 2],
    a: dstData[startPos + 3],
  };
  const todo = [[startX, startY]];

  while (todo.length) {
    const pos = todo.pop();
    const x = pos[0];
    let y = pos[1];
    let currentPos = getPixelPos(x, y);

    while (y >= 0 && matchStartColor(dstData, currentPos, startColor)) {
      y -= 1;
      currentPos -= canvas.width * 4;
    }

    currentPos += canvas.width * 4;
    y += 1;
    let reachLeft = false;
    let reachRight = false;

    while (y < canvas.height - 1 && matchStartColor(dstData, currentPos, startColor)) {
      y += 1;
      colorPixel(dstData, currentPos, fillColor);

      if (x > 0) {
        if (matchStartColor(dstData, currentPos - 4, startColor)) {
          if (!reachLeft) {
            todo.push([x - 1, y]);
            reachLeft = true;
          }
        } else if (reachLeft) {
          reachLeft = false;
        }
      }

      if (x < canvas.width - 1) {
        if (matchStartColor(dstData, currentPos + 4, startColor)) {
          if (!reachRight) {
            todo.push([x + 1, y]);
            reachRight = true;
          }
        } else if (reachRight) {
          reachRight = false;
        }
      }
      currentPos += canvas.width * 4;
    }
  }

  ctx.putImageData(dstImg, 0, 0);
}

function makeImageBlackAndWhite() {
  const imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < imgPixels.height; y += 1) {
    for (let x = 0; x < imgPixels.width; x += 1) {
      const i = y * 4 * imgPixels.width + x * 4;
      const avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
      imgPixels.data[i] = avg;
      imgPixels.data[i + 1] = avg;
      imgPixels.data[i + 2] = avg;
    }
  }
  ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
  localStorage.setItem(saveCanvas, canvas.toDataURL('image/png'));
}

const input = document.getElementById('input');
const image = document.getElementById('btn-image');
const blackAndWhite = document.getElementById('btn-bw');
let imageLoad;

image.onclick = async () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  imageLoad = false;

  drawImg(link);
  imageLoad = true;
  localStorage.setItem(saveCanvas, canvas.toDataURL('image/png'));

  await getLinkToImage(input.value);
};

window.onload = () => {
  if (localStorage.getItem(saveCanvas)) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawImg(localStorage.getItem(saveCanvas));
    imageLoad = true;
  }
};

const save = document.getElementById('save');
const clear = document.getElementById('reset');

save.onclick = () => {
  localStorage.setItem(saveCanvas, canvas.toDataURL('image/png'));
};

clear.onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  localStorage.setItem(saveCanvas, canvas.toDataURL('image/png'));
};

blackAndWhite.onclick = () => {
  if (imageLoad === true) {
    makeImageBlackAndWhite();
  } else {
    alert('You must first upload an image!');
  }
};

/*-------------------------------------------------------------------------------------*/
const json4 = [
  ['00BCD4', 'FFEB3B', 'FFEB3B', '00BCD4'],
  ['FFEB3B', 'FFC107', 'FFC107', 'FFEB3B'],
  ['FFEB3B', 'FFC107', 'FFC107', 'FFEB3B'],
  ['00BCD4', 'FFEB3B', 'FFEB3B', '00BCD4'],
];

function draw(data, type) {
  const pixel = canvas.width / data.length;
  for (let i = 0; i < data.length; i += 1) {
    for (let j = 0; j < data.length; j += 1) {
      if (type === 'hex') {
        ctx.fillStyle = `#${data[i][j]}`;
      }
      ctx.fillRect(i * pixel, j * pixel, pixel, pixel);
    }
  }
}

const button4 = document.getElementById('btn-4');

button4.addEventListener('click', () => {
  draw(json4, 'hex');
  localStorage.setItem(saveCanvas, canvas.toDataURL('image/png'));
});

const pencil = document.querySelector('.button_pencil');
pencil.focus();
const paint = document.querySelector('.button_paint');
const current = document.getElementById('input_color');
const choose = document.querySelector('.button_choose');
const indicatorChoose = document.querySelector('.button_choose span');
indicatorChoose.style.background = '#00BCD4';
const transform = document.querySelector('.button_transform');

const prevButton = document.querySelector('.button_prev');
const prev = document.querySelector('.button_prev span');

const redButton = document.querySelector('.button_red');
const red = document.querySelector('.button_red span');
const styleSpanRed = window.getComputedStyle(red, null);

const blueButton = document.querySelector('.button_blue');
const blue = document.querySelector('.button_blue span');
const styleSpanBlue = window.getComputedStyle(blue, null);

const spanCurrent = document.querySelector('.block_colors--button-current');
spanCurrent.style.backgroundColor = current.value;
const styleSpanCurrent = window.getComputedStyle(spanCurrent, null);
const bodys = document.getElementById('body');

sessionStorage.setItem('localCurrent', styleSpanCurrent.getPropertyValue('background-color'));
sessionStorage.setItem('localPrev', sessionStorage.getItem('localCurrent'));

document.addEventListener('keydown', e => {
  if (e.code === 'KeyP' && e.ctrlKey) {
    e.preventDefault();
    pencil.focus();

    bodys.classList.add('cursor_pencil');
    bodys.classList.remove('cursor_paint');
    bodys.classList.remove('cursor_choose');

    pencil.classList.add('focus');
    choose.classList.remove('focus');
    indicatorChoose.classList.remove('indicator');
    paint.classList.remove('focus');
    transform.classList.remove('focus');

    sessionStorage.setItem('pencilFocused', 'true');
    sessionStorage.setItem('paintFocused', 'false');
    sessionStorage.setItem('chooseFocused', 'false');
  }
  if (e.code === 'KeyB' && e.ctrlKey) {
    e.preventDefault();
    paint.focus();

    bodys.classList.add('cursor_paint');
    bodys.classList.remove('cursor_pencil');
    bodys.classList.remove('cursor_choose');

    paint.classList.add('focus');
    choose.classList.remove('focus');
    indicatorChoose.classList.remove('indicator');
    pencil.classList.remove('focus');
    transform.classList.remove('focus');

    sessionStorage.setItem('paintFocused', 'true');
    sessionStorage.setItem('pencilFocused', 'false');
    sessionStorage.setItem('chooseFocused', 'false');
  }
  if (e.code === 'KeyC' && e.ctrlKey) {
    e.preventDefault();
    choose.focus();

    bodys.classList.add('cursor_choose');
    bodys.classList.remove('cursor_paint');
    bodys.classList.remove('cursor_pencil');

    choose.classList.add('focus');
    indicatorChoose.classList.add('indicator');
    pencil.classList.remove('focus');
    paint.classList.remove('focus');
    transform.classList.remove('focus');

    sessionStorage.setItem('chooseFocused', 'true');
    sessionStorage.setItem('pencilFocused', 'false');
    sessionStorage.setItem('paintFocused', 'false');
  }
});

current.oninput = () => {
  sessionStorage.setItem('localPrev', sessionStorage.getItem('localCurrent'));
  prev.style.backgroundColor = sessionStorage.getItem('localPrev');
  spanCurrent.style.backgroundColor = current.value;
  sessionStorage.setItem('localCurrent', styleSpanCurrent.getPropertyValue('background-color'));
  indicatorChoose.style.background = styleSpanCurrent.getPropertyValue('background-color');
};

prevButton.onclick = () => {
  spanCurrent.style.backgroundColor = sessionStorage.getItem('localPrev');
  prev.style.backgroundColor = sessionStorage.getItem('localCurrent');
  sessionStorage.setItem('localPrev', sessionStorage.getItem('localCurrent'));
  sessionStorage.setItem('localCurrent', styleSpanCurrent.getPropertyValue('background-color'));
  indicatorChoose.style.background = styleSpanCurrent.getPropertyValue('background-color');
};

redButton.onclick = () => {
  spanCurrent.style.backgroundColor = styleSpanRed.getPropertyValue('background-color');
  prev.style.backgroundColor = sessionStorage.getItem('localCurrent');
  sessionStorage.setItem('localPrev', sessionStorage.getItem('localCurrent'));
  sessionStorage.setItem('localCurrent', styleSpanCurrent.getPropertyValue('background-color'));
  indicatorChoose.style.background = styleSpanCurrent.getPropertyValue('background-color');
};

blueButton.onclick = () => {
  spanCurrent.style.backgroundColor = styleSpanBlue.getPropertyValue('background-color');
  prev.style.backgroundColor = sessionStorage.getItem('localCurrent');
  sessionStorage.setItem('localPrev', sessionStorage.getItem('localCurrent'));
  sessionStorage.setItem('localCurrent', styleSpanCurrent.getPropertyValue('background-color'));
  indicatorChoose.style.background = styleSpanCurrent.getPropertyValue('background-color');
};

sessionStorage.setItem('pencilFocused', 'true');
sessionStorage.setItem('paintFocused', 'false');
sessionStorage.setItem('chooseFocused', 'false');
pencil.classList.add('focus');

paint.onclick = () => {
  bodys.classList.add('cursor_paint');
  bodys.classList.remove('cursor_pencil');
  bodys.classList.remove('cursor_choose');

  paint.classList.add('focus');
  choose.classList.remove('focus');
  indicatorChoose.classList.remove('indicator');
  pencil.classList.remove('focus');
  transform.classList.remove('focus');

  sessionStorage.setItem('paintFocused', 'true');
  sessionStorage.setItem('pencilFocused', 'false');
  sessionStorage.setItem('chooseFocused', 'false');
};

pencil.onclick = () => {
  bodys.classList.add('cursor_pencil');
  bodys.classList.remove('cursor_paint');
  bodys.classList.remove('cursor_choose');

  pencil.classList.add('focus');
  choose.classList.remove('focus');
  indicatorChoose.classList.remove('indicator');
  paint.classList.remove('focus');
  transform.classList.remove('focus');

  sessionStorage.setItem('pencilFocused', 'true');
  sessionStorage.setItem('paintFocused', 'false');
  sessionStorage.setItem('chooseFocused', 'false');
};

choose.onclick = () => {
  bodys.classList.add('cursor_choose');
  bodys.classList.remove('cursor_paint');
  bodys.classList.remove('cursor_pencil');

  choose.classList.add('focus');
  indicatorChoose.classList.add('indicator');
  pencil.classList.remove('focus');
  paint.classList.remove('focus');
  transform.classList.remove('focus');

  sessionStorage.setItem('chooseFocused', 'true');
  sessionStorage.setItem('pencilFocused', 'false');
  sessionStorage.setItem('paintFocused', 'false');
};

transform.onclick = () => {
  bodys.classList.remove('cursor_paint');
  bodys.classList.remove('cursor_pencil');
  bodys.classList.remove('cursor_paint');

  transform.classList.add('focus');
  indicatorChoose.classList.remove('indicator');
  choose.classList.remove('focus');
  pencil.classList.remove('focus');
  paint.classList.remove('focus');

  sessionStorage.setItem('pencilFocused', 'false');
  sessionStorage.setItem('paintFocused', 'false');
  sessionStorage.setItem('chooseFocused', 'false');
};

canvas.onmousedown = e => {
  if (sessionStorage.getItem('pencilFocused') === 'true') {
    canvas.getContext('2d').fillStyle = styleSpanCurrent.getPropertyValue('background-color');
    canvas
      .getContext('2d')
      .fillRect(128 * Math.floor(e.offsetX / 128), 128 * Math.floor(e.offsetY / 128), 128, 128);

    canvas.onmousemove = event => {
      canvas
        .getContext('2d')
        .fillRect(
          128 * Math.floor(event.offsetX / 128),
          128 * Math.floor(event.offsetY / 128),
          128,
          128,
        );
      localStorage.setItem(saveCanvas, canvas.toDataURL('image/png'));
    };

    document.onmouseup = () => {
      canvas.onmousemove = null;
    };
    localStorage.setItem(saveCanvas, canvas.toDataURL('image/png'));
  }
  if (sessionStorage.getItem('paintFocused') === 'true') {
    const x = e.offsetX;
    const y = e.offsetY;
    const pixel = ctx.getImageData(x, y, 1, 1);
    const { data } = pixel;
    const rgbaCanvas = data.slice(0, -1).join(', ');

    const rgb = spanCurrent.style.backgroundColor;

    const arr = rgb.slice(4, -1).split(', ');

    const colorFill = {};
    colorFill.r = +arr[0];
    colorFill.g = +arr[1];
    colorFill.b = +arr[2];
    colorFill.a = +arr[3] || 255;

    const rgbaCurrent = arr.join(', ');

    if (rgbaCanvas !== rgbaCurrent) {
      floodFill(e.offsetX, e.offsetY, colorFill);
      localStorage.setItem(saveCanvas, canvas.toDataURL('image/png'));
    }
  }
};

canvas.addEventListener('mousemove', event => {
  if (sessionStorage.getItem('chooseFocused') === 'true') {
    const x = event.layerX;
    const y = event.layerY;
    const pixel = ctx.getImageData(x, y, 1, 1);
    const { data } = pixel;
    const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
    indicatorChoose.style.background = rgba;
  }
});

canvas.addEventListener('click', event => {
  if (sessionStorage.getItem('chooseFocused') === 'true') {
    const x = event.layerX;
    const y = event.layerY;
    const pixel = ctx.getImageData(x, y, 1, 1);
    const { data } = pixel;
    const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;

    sessionStorage.setItem('localPrev', sessionStorage.getItem('localCurrent'));
    prev.style.backgroundColor = sessionStorage.getItem('localPrev');
    spanCurrent.style.backgroundColor = rgba;
    sessionStorage.setItem('localCurrent', styleSpanCurrent.getPropertyValue('background-color'));
  }
});
