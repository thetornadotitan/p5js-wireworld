let canvas;
let container;

let inputs;

let slider;
let sliderDiv;
let sliderVal;

let playButton;
let clearButton;

let grid0;

let gridSize = 50;
let gridResolution;

let playing;
let touching;

function setup() {
	container = select("#canvasTarget");
	canvas = createCanvas(container.width, container.width);
	canvas.parent(container);
	createInputs();
	SetupGrid(gridSize);
}

function draw() {
	if (playing) {
		let grid1 = Create2dArray(gridSize);
		let changedCells = [];

		//Calc
		/*
			Cells behave as follows {
	
				○ empty → empty, 0

				○ conductor 1 → electron head 2 if exactly one or two of the neighbouring cells are electron heads
				otherwise remains conductor.
	
				○ electron head 2 → electron tail 3
	
				○ electron tail 3 → conductor 1
			}
		*/

		for (let x = 0; x < gridSize; x++) {
			for (let y = 0; y < gridSize; y++) {
				grid1[x][y] = grid0[x][y];

				if (grid0[x][y] == 2) {
					grid1[x][y] = 3;
					changedCells.push({ x: x, y: y, val: grid1[x][y] })
				}

				if (grid0[x][y] == 3) {
					grid1[x][y] = 1;
					changedCells.push({ x: x, y: y, val: grid1[x][y] })
				}

				if (grid0[x][y] == 1) {
					let localElectronHeads = GetLocalElectronsHeads(grid0, x, y);
					if (localElectronHeads == 1 || localElectronHeads == 2) {
						grid1[x][y] = 2
						changedCells.push({ x: x, y: y, val: grid1[x][y] })
					}
				}
			}
		}

		//Render
		RenderChangedCells(changedCells);

		//update grid
		grid0 = grid1;
	}
}

function keyPressed() {
	if (key == ' ') {
		playing = !playing;
		return false;
	}
}

function mousePressed() {
	if (mouseButton == LEFT) {
		let x = Math.floor(mouseX / gridResolution);
		let y = Math.floor(mouseY / gridResolution);

		if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
			grid0[x][y] = (grid0[x][y] + 1) % 4;
			let changedCells = [];
			changedCells.push({ x: x, y: y, val: grid0[x][y] });
			RenderChangedCells(changedCells);
		}
	}
}

function SetupGrid(size) {
	grid0 = Create2dArray(size);
	gridResolution = width / gridSize;
	background(0);
	if (playing) {
		playPress();
	}
}

function ResizeGrid() {
	gridResolution = width / gridSize;
	RenderGrid(grid0);
	if (playing) {
		playPress();
	}
}

function Create2dArray(size) {
	let arr = [];
	for (let x = 0; x < size; x++) {
		arr.push([]);
		for (let y = 0; y < size; y++) {
			arr[x].push(0);
		}
	}
	return arr;
}

function GetLocalElectronsHeads(arr, x, y) {
	let electrons = 0;
	for (let i = -1; i <= 1; i++) {
		for (let j = -1; j <= 1; j++) {
			let xOff = x + i;
			let yOff = y + j;

			if (xOff >= 0 && xOff < gridSize && yOff >= 0 && yOff < gridSize) {
				if (arr[xOff][yOff] == 2) {
					electrons++;
				}
			}
		}
	}
	return electrons;
}

function RenderGrid(arr) {
	stroke(0);
	background(0);
	for (let x = 0; x < gridSize; x++) {
		for (let y = 0; y < gridSize; y++) {
			if (arr[x][y] > 0) {
				fill(GetColorByValue(arr[x][y]));
				rect(x * gridResolution, y * gridResolution, gridResolution, gridResolution);
			}
		}
	}
}

function RenderChangedCells(arr) {
	stroke(0);
	arr.forEach(cell => {
		fill(GetColorByValue(cell.val));
		rect(cell.x * gridResolution, cell.y * gridResolution, gridResolution, gridResolution);
	});
}

function GetColorByValue(val) {
	let c;

	switch (val) {
		case 0:
			c = color(0);
			break;
		case 1:
			c = color(255, 255, 0);
			break;
		case 2:
			c = color(255, 0, 0);
			break;
		case 3:
			c = color(0, 0, 255);
			break;
		default:
			break;
	}

	return c;
}

function windowResized() {
	container = select("#canvasTarget");
	canvas.resize(container.width, container.width);
	canvas.parent(container);

	ResizeGrid();
}

function createInputs() {
	inputs = select("#inputField");

	touching = false;

	//gridSize Slider
	sliderDiv = createDiv("");
	sliderDiv.parent(inputs);
	sliderVal = createSpan(`Grid Size : ${gridSize} x ${gridSize}`);

	slider = createSlider(10, 150, gridSize);
	slider.parent(sliderDiv);
	slider.elt.oninput = ((e) => {
		let value = Math.floor(slider.value());
		sliderVal.elt.innerHTML = `Grid Size : ${value} x ${value}`;
		gridSize = value;
		SetupGrid(gridSize);
		RenderGrid(grid0);
	})

	sliderVal.parent(sliderDiv);

	//Play / Pause Button
	playButton = createButton("Play");
	playButton.mousePressed((e) => {
		playPress();
	});
	playButton.parent(inputs);

	//Clear Button
	clearButton = createButton("Clear");
	clearButton.mousePressed((e) => {
		SetupGrid(gridSize);
	});
	clearButton.parent(inputs);
}

function playPress() {
	playing = !playing;
	if (playing) {
		RenderGrid(grid0);
		playButton.elt.innerHTML = "Pause";
	} else {
		playButton.elt.innerHTML = "Play";
	}
}