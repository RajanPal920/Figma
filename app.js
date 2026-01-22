const canvas = document.getElementById("canvas");
const box = document.getElementById("box");
const layersContainer = document.createElement("div");
layersContainer.id = "layers";
layersContainer.className = "Properties";
document.querySelector("#toolbar2").appendChild(layersContainer);

const [widthInput, heightInput, colorInput, textInput, rotateInput] =
  document.querySelectorAll("#toolbar2 input");

let selectedElement = null;
let dragData = null;

function createElement(type) {
  const el = document.createElement("div");
  el.className = "canvas-element";
  el.dataset.type = type;

  if (type === "box" || type === "circle") {
    el.style.width = "100px";
    el.style.height = "100px";
    el.style.background = "#ddd";
    if (type === "circle") el.style.borderRadius = "50%";
  }

  if (type === "text") {
    el.style.width = "100px";
    el.style.height = "100px";
    el.style.background = "#ddd";
    const span = document.createElement("span");
    span.className = "text-content";
    span.textContent = "Hello World";
    el.appendChild(span);
  }

  if (type === "triangle") {
    el.style.width = "0";
    el.style.height = "0";
    el.style.borderLeft = "50px solid transparent";
    el.style.borderRight = "50px solid transparent";
    el.style.borderBottom = "100px solid #ddd";
  }

  const elWidth =
    type === "triangle"
      ? parseInt(el.style.borderLeft) * 2
      : el.offsetWidth || 100;
  const elHeight =
    type === "triangle"
      ? parseInt(el.style.borderBottom)
      : el.offsetHeight || 100;

  el.style.left =
    Math.floor(Math.random() * (canvas.clientWidth - elWidth)) + "px";
  el.style.top =
    Math.floor(Math.random() * (canvas.clientHeight - elHeight)) + "px";

  addDeleteIcon(el);
  enableDrag(el);
  canvas.appendChild(el);
  selectElement(el);
  updateLayersPanel();
  return el;
}

function addDeleteIcon(el) {
  const del = document.createElement("div");
  del.className = "delete-btn";
  del.textContent = "✕";
  del.onclick = (e) => {
    e.stopPropagation();
    el.remove();
    if (el === selectedElement) selectedElement = null;
    updateLayersPanel();
  };
  el.appendChild(del);
}

function selectElement(el) {
  clearSelection();
  selectedElement = el;
  el.classList.add("selected");
  updateProperties();
  updateLayersPanel();
  scrollLayerIntoView(el);
}

function clearSelection() {
  document
    .querySelectorAll(".canvas-element")
    .forEach((el) => el.classList.remove("selected"));
  selectedElement = null;
  updateLayersPanel();
}

function enableDrag(el) {
  el.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("delete-btn")) return;
    const canvasRect = canvas.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    dragData = {
      offsetX: e.clientX - elRect.left,
      offsetY: e.clientY - elRect.top,
      canvasLeft: canvasRect.left,
      canvasTop: canvasRect.top,
    };
    selectElement(el);
  });
}

document.addEventListener("mousemove", (e) => {
  if (!dragData || !selectedElement) return;
  let x = e.clientX - dragData.canvasLeft - dragData.offsetX;
  let y = e.clientY - dragData.canvasTop - dragData.offsetY;

  const type = selectedElement.dataset.type;
  const elWidth =
    type === "triangle"
      ? parseInt(selectedElement.style.borderLeft) * 2
      : selectedElement.offsetWidth;
  const elHeight =
    type === "triangle"
      ? parseInt(selectedElement.style.borderBottom)
      : selectedElement.offsetHeight;

  x = Math.max(0, Math.min(x, canvas.clientWidth - elWidth));
  y = Math.max(0, Math.min(y, canvas.clientHeight - elHeight));

  selectedElement.style.left = x + "px";
  selectedElement.style.top = y + "px";
});

document.addEventListener("mouseup", () => (dragData = null));

function updateProperties() {
  if (!selectedElement) return;
  const type = selectedElement.dataset.type;
  widthInput.value =
    type === "triangle"
      ? parseInt(selectedElement.style.borderLeft) * 2
      : selectedElement.offsetWidth;
  heightInput.value =
    type === "triangle"
      ? parseInt(selectedElement.style.borderBottom)
      : selectedElement.offsetHeight;
  textInput.value =
    type === "text"
      ? selectedElement.querySelector(".text-content").textContent
      : "";
  rotateInput.value = 0;
}

widthInput.oninput = () => {
  if (!selectedElement) return;
  if (selectedElement.dataset.type === "triangle") {
    const half = widthInput.value / 2;
    selectedElement.style.borderLeft = `${half}px solid transparent`;
    selectedElement.style.borderRight = `${half}px solid transparent`;
  } else {
    selectedElement.style.width = widthInput.value + "px";
  }
  updateLayersPanel();
};

heightInput.oninput = () => {
  if (!selectedElement) return;
  if (selectedElement.dataset.type === "triangle") {
    selectedElement.style.borderBottom = `${heightInput.value}px solid ${colorInput.value}`;
  } else {
    selectedElement.style.height = heightInput.value + "px";
  }
  updateLayersPanel();
};

colorInput.oninput = () => {
  if (!selectedElement) return;
  if (selectedElement.dataset.type === "text") {
    selectedElement.querySelector(".text-content").style.color =
      colorInput.value;
  } else if (selectedElement.dataset.type === "triangle") {
    selectedElement.style.borderBottomColor = colorInput.value;
  } else {
    selectedElement.style.backgroundColor = colorInput.value;
  }
};

textInput.oninput = () => {
  if (!selectedElement || selectedElement.dataset.type !== "text") return;
  selectedElement.querySelector(".text-content").textContent = textInput.value;
};

rotateInput.oninput = () => {
  if (!selectedElement) return;
  selectedElement.style.transform = `rotate(${rotateInput.value}deg)`;
};

box.addEventListener("click", (e) => {
  if (e.target.classList.contains("ri-square-line")) createElement("box");
  if (e.target.classList.contains("ri-circle-line")) createElement("circle");
  if (e.target.classList.contains("ri-text")) createElement("text");
  if (e.target.classList.contains("ri-triangle-line"))
    createElement("triangle");
});

function updateLayersPanel() {
  layersContainer.innerHTML = "";
  const elements = Array.from(canvas.children).filter((el) =>
    el.classList.contains("canvas-element"),
  );
  elements.reverse().forEach((el) => {
    const layer = document.createElement("div");
    layer.style.display = "flex";
    layer.style.alignItems = "center";
    layer.style.justifyContent = "space-between";
    layer.style.padding = "6px 10px";
    layer.style.background = el === selectedElement ? "#4c9aff33" : "#4a4848";
    layer.style.borderRadius = "6px";
    layer.style.cursor = "pointer";
    layer.style.color = "#fff";
    layer.style.fontSize = "14px";

    const label = document.createElement("span");
    label.textContent = el.dataset.type.toUpperCase();
    layer.appendChild(label);

    const delBtn = document.createElement("span");
    delBtn.textContent = "✕";
    delBtn.style.marginLeft = "10px";
    delBtn.style.color = "#ff4d4f";
    delBtn.style.cursor = "pointer";
    delBtn.onclick = (e) => {
      e.stopPropagation();
      el.remove();
      if (el === selectedElement) selectedElement = null;
      updateLayersPanel();
    };
    layer.appendChild(delBtn);

    layer.onclick = () => selectElement(el);
    layersContainer.appendChild(layer);
  });
}

function scrollLayerIntoView(el) {
  const layerDivs = Array.from(layersContainer.children);
  const index = layerDivs.findIndex((div) =>
    div.textContent.includes(el.dataset.type.toUpperCase()),
  );
  if (index >= 0)
    layerDivs[index].scrollIntoView({ behavior: "smooth", block: "nearest" });
}
