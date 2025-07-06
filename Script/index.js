const hamburger = document.getElementById("hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navLinks.classList.toggle("show");
});

// ========== GRID BLOCK DRAWING IMPROVED ==========

const generateBtn = document.getElementById("generateBtn");
const clearBtn = document.getElementById("clear");
const gridContainer = document.getElementById("grid");

const rowsInput = document.getElementById("rows");
const colsInput = document.getElementById("cols");
const gapInput = document.getElementById("gap");

const htmlCode = document.getElementById("htmlCode");
const cssCode = document.getElementById("cssCode");
const copyBtn = document.getElementById("copyBtn");

let isMouseDown = false;
let startCell = null;
let currentBlock = null;
let blocks = [];

let cellWidth = 0;
let cellHeight = 0;

generateBtn.addEventListener("click", () => {
  const rows = parseInt(rowsInput.value);
  const cols = parseInt(colsInput.value);
  const gap = parseInt(gapInput.value);

  gridContainer.innerHTML = "";
  gridContainer.style.position = "relative";
  gridContainer.style.display = "grid";

  // calculate cell sizes to fill the grid preview fully
  const containerWidth = gridContainer.clientWidth;
  const containerHeight = gridContainer.clientHeight;

  cellWidth = (containerWidth - (cols - 1) * gap) / cols;
  cellHeight = (containerHeight - (rows - 1) * gap) / rows;

  gridContainer.style.gridTemplateRows = `repeat(${rows}, ${cellHeight}px)`;
  gridContainer.style.gridTemplateColumns = `repeat(${cols}, ${cellWidth}px)`;
  gridContainer.style.gap = `${gap}px`;

  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("mousedown", (e) => startDraw(e, cell));
      cell.addEventListener("mouseenter", (e) => continueDraw(e, cell));
      gridContainer.appendChild(cell);
    }
  }

  blocks = [];
  document.addEventListener("mouseup", endDraw);
  generateCode();
});

clearBtn.addEventListener("click", () => {
  gridContainer.innerHTML = "";
  htmlCode.value = "";
  cssCode.value = "";
  blocks = [];
});

function startDraw(e, cell) {
  e.preventDefault();
  isMouseDown = true;
  startCell = cell;
  createBlock(cell, cell);
}

function continueDraw(e, cell) {
  if (!isMouseDown || !currentBlock) return;
  updateBlock(startCell, cell);
}

function endDraw() {
  isMouseDown = false;
  currentBlock = null;
  startCell = null;
  generateCode();
}

function createBlock(start, end) {
  const block = document.createElement("div");
  block.className = "block";
  block.style.position = "absolute";
  block.dataset.number = blocks.length + 1;

  block.addEventListener("dblclick", () => {
    block.remove();
    blocks = blocks.filter((b) => b !== block);
    renumberBlocks();
    generateCode();
  });

  updateBlockCoords(block, start, end);
  blocks.push(block);
  gridContainer.appendChild(block);
  currentBlock = block;
}

function updateBlock(start, end) {
  if (!currentBlock) return;
  updateBlockCoords(currentBlock, start, end);
}

function updateBlockCoords(block, start, end) {
  const rows = parseInt(rowsInput.value);
  const cols = parseInt(colsInput.value);
  const gap = parseInt(gapInput.value);

  const r1 = Math.max(1, Math.min(rows, parseInt(start.dataset.row)));
  const r2 = Math.max(1, Math.min(rows, parseInt(end.dataset.row)));
  const c1 = Math.max(1, Math.min(cols, parseInt(start.dataset.col)));
  const c2 = Math.max(1, Math.min(cols, parseInt(end.dataset.col)));

  const rowStart = Math.min(r1, r2);
  const rowEnd = Math.max(r1, r2);
  const colStart = Math.min(c1, c2);
  const colEnd = Math.max(c1, c2);

  const left = (colStart - 1) * (cellWidth + gap);
  const top = (rowStart - 1) * (cellHeight + gap);
  const width =
    (colEnd - colStart + 1) * cellWidth + (colEnd - colStart) * gap - 4;
  const height =
    (rowEnd - rowStart + 1) * cellHeight + (rowEnd - rowStart) * gap - 4;

  block.style.left = `${left + 2}px`;
  block.style.top = `${top + 2}px`;
  block.style.width = `${width}px`;
  block.style.height = `${height}px`;
  block.style.background = "#C084FC";
  block.style.border = "2px solid white";
  block.textContent = `Block ${block.dataset.number}`;
}

function renumberBlocks() {
  blocks.forEach((b, i) => {
    b.dataset.number = i + 1;
    b.textContent = `Block ${i + 1}`;
  });
}

window.addEventListener("resize", () => {
  const rows = parseInt(rowsInput.value);
  const cols = parseInt(colsInput.value);
  const gap = parseInt(gapInput.value);
  if (!cols || !rows) return;

  const containerWidth = gridContainer.clientWidth;
  const containerHeight = gridContainer.clientHeight;

  cellWidth = (containerWidth - (cols - 1) * gap) / cols;
  cellHeight = (containerHeight - (rows - 1) * gap) / rows;

  blocks.forEach((block) => {
    const n = parseInt(block.dataset.number);
    const rowStart =
      Math.floor(parseInt(block.style.top) / (cellHeight + gap)) + 1;
    const colStart =
      Math.floor(parseInt(block.style.left) / (cellWidth + gap)) + 1;
    const rowEnd =
      rowStart +
      Math.round(parseInt(block.style.height) / (cellHeight + gap)) -
      1;
    const colEnd =
      colStart +
      Math.round(parseInt(block.style.width) / (cellWidth + gap)) -
      1;

    updateBlockCoords(
      block,
      { dataset: { row: rowStart, col: colStart } },
      { dataset: { row: rowEnd, col: colEnd } }
    );
  });
});

function generateCode() {
  let html = `<div class="my-grid">\n`;
  blocks.forEach((b) => {
    html += `  <div class="block">${b.textContent}</div>\n`;
  });
  html += `</div>`;
  htmlCode.value = html;

  const rows = rowsInput.value;
  const cols = colsInput.value;
  const gap = gapInput.value;

  let css = `
.my-grid {
  display: grid;
  grid-template-rows: repeat(${rows}, ${cellHeight}px);
  grid-template-columns: repeat(${cols}, ${cellWidth}px);
  gap: ${gap}px;
  position: relative;
}
.block {
  position: absolute;
  background: rgba(0,0,0,0.2);
  border: 2px solid black;
  box-sizing: border-box;
}
  `.trim();
  cssCode.value = css;

  // =========== REACT JSX CODE GENERATION ==========
  let react = `import "./MyGrid.css";\n\n`;
  react += `export default function MyGrid() {\n`;
  react += `  return (\n`;
  react += `    <div className="my-grid">\n`;
  blocks.forEach((b) => {
    react += `      <div className="block">${b.textContent}</div>\n`;
  });
  react += `    </div>\n  );\n}`;
  // =========== END REACT JSX ==========

  const reactCode = document.getElementById("reactCode");
  if (reactCode) {
    reactCode.value = react;
  }
}
// Tab switching logic
const tabs = document.querySelectorAll(".tab");
const textareas = {
  html: document.getElementById("htmlCode"),
  css: document.getElementById("cssCode"),
  react: document.getElementById("reactCode"),
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    // Remove active class from all tabs
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    // Hide all textareas
    Object.values(textareas).forEach((ta) => ta.classList.add("hidden"));

    // Show the textarea that matches clicked tab's data-target
    const target = tab.dataset.target;
    if (textareas[target]) {
      textareas[target].classList.remove("hidden");
    }
  });
});

// Copy button copies only the visible textarea content
copyBtn.addEventListener("click", () => {
  // Find visible textarea (the one without 'hidden' class)
  const visibleTextarea = Object.values(textareas).find(
    (ta) => !ta.classList.contains("hidden")
  );
  if (!visibleTextarea) return;

  navigator.clipboard
    .writeText(visibleTextarea.value)
    .then(() => {
      copyBtn.textContent = "Copied!";
      setTimeout(
        () => (copyBtn.innerHTML = `<i class="fas fa-copy"></i> Copy Code`),
        1500
      );
    })
    .catch(() => {
      copyBtn.textContent = "Copy failed!";
      setTimeout(
        () => (copyBtn.innerHTML = `<i class="fas fa-copy"></i> Copy Code`),
        1500
      );
    });
});
