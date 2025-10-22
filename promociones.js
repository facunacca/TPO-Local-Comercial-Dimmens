const CATALOG = [
  { id: "colchon-dimmons",   name: "Colchón Dimmons", price: 250000 },
  { id: "colchon-yolo",   name: "Colchón Yolo by Dimmons",  price: 180000 },
  { id: "colchon-spatherapy",   name: "Colchón SpaTherapy",  price: 200000 },
  { id: "colchon-beautyspring",   name: "Colchón Beautyspring", price: 250000 },
  { id: "colchon-belmo",   name: "Colchón Belmo",  price: 180000 },
  { id: "colchon-density",   name: "Colchón Density",  price: 200000 },
  { id: "sommier-dimmons",   name: "Sommier Dimmons", price: 150000 },
  { id: "sommier-yolo",   name: "Sommier Yolo by Dimmons",  price: 80000 },
  { id: "sommier-spatherapy",   name: "Sommier SpaTherapy",  price: 100000 },
  { id: "sommier-beautyspring",   name: "Sommier Beautyspring", price: 150000 },
  { id: "sommier-belmo",   name: "Sommier Belmo",  price: 80000 },
  { id: "sommier-density",   name: "Sommier Density",  price: 100000 },
  { id: "almohada-dimmons",     name: "Almohada Dimmons",         price: 20000  },
  { id: "almohada-inteligent",         name: "Almohada Inteligent",     price: 28000  },
  { id: "colchon-mascotas",         name: "Colchón para mascotas",    price: 12000  },
  { id: "cubrecolchon-dimmons",         name: "Cubrecolchon Dimmons",    price: 52000  },
  { id: "cubrecolchon-simmons",         name: "Cubrecolchon Simmons",    price: 14000  },
  { id: "almohada-Bedgear",    name: "Almohada Bedgear",     price: 39000  }
];

const fmt = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

let items = [];
const tbody = document.getElementById("items-body");
const subtotalEl = document.getElementById("subtotal");
const discountEl = document.getElementById("discount");
const totalEl = document.getElementById("total");
const promoMsg = document.getElementById("promo-message");

function init() {
  document.getElementById("add-item").addEventListener("click", addRow);
  addRow();
  document.querySelectorAll('input[name="promotion"]').forEach((el) => el.addEventListener("change", recalc));
}

function addRow() {
  const rowIndex = items.length;
  items.push({ productId: CATALOG[0].id, qty: 1 });

  const tr = document.createElement("tr");
  tr.dataset.index = rowIndex;

  const sel = document.createElement("select");
  sel.className = "form-select";
  sel.setAttribute("aria-label", "Producto");
  [...CATALOG].sort((a,b) => a.name.localeCompare(b.name, "es")).forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    sel.appendChild(opt);
  });
  sel.value = items[rowIndex].productId;
  sel.addEventListener("change", (e) => {
    items[rowIndex].productId = e.target.value;
    updatePriceCell(tr, items[rowIndex].productId);
    recalc();
  });

  const priceSpan = document.createElement("span");
  priceSpan.className = "monospace";

  const qtyInput = document.createElement("input");
  qtyInput.type = "number";
  qtyInput.min = 1;
  qtyInput.value = 1;
  qtyInput.className = "form-control";
  qtyInput.setAttribute("aria-label", "Cantidad");
  qtyInput.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    items[rowIndex].qty = Number.isFinite(val) && val > 0 ? val : 1;
    recalc();
  });

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "btn btn-link text-danger";
  removeBtn.textContent = "Quitar";
  removeBtn.addEventListener("click", () => {
    items.splice(rowIndex, 1);
    tr.remove();
    Array.from(tbody.querySelectorAll("tr")).forEach((row, i) => (row.dataset.index = i));
    recalc();
  });

  tr.innerHTML = `
    <td></td>
    <td class="price-cell"></td>
    <td></td>
    <td class="text-end"></td>
  `;
  tr.children[0].appendChild(sel);
  tr.children[1].appendChild(priceSpan);
  tr.children[2].appendChild(qtyInput);
  tr.children[3].appendChild(removeBtn);

  tbody.appendChild(tr);
  updatePriceCell(tr, items[rowIndex].productId);
  recalc();
}

function updatePriceCell(tr, productId) {
  const p = CATALOG.find((x) => x.id === productId);
  const cell = tr.querySelector(".price-cell span") || tr.querySelector(".price-cell");
  cell.textContent = fmt.format(p.price);
}

function computeSubtotal() {
  return items.reduce((acc, it) => {
    const p = CATALOG.find((x) => x.id === it.productId);
    return acc + p.price * it.qty;
  }, 0);
}

function computeDiscount(subtotal) {
  const promo = document.querySelector('input[name="promotion"]:checked').value;
  let discount = 0;
  let message = "";

  if (promo === "50segundo") {
    items.forEach((it) => {
      const p = CATALOG.find((x) => x.id === it.productId);
      const pairs = Math.floor(it.qty / 2);
      discount += pairs * (p.price * 0.5);
    });
    message = "Se aplicó 50% en el 2.º ítem de cada par del mismo producto.";
  }

  if (promo === "3x2") {
    items.forEach((it) => {
      const p = CATALOG.find((x) => x.id === it.productId);
      const trios = Math.floor(it.qty / 3);
      discount += trios * p.price;
    });
    message = "Promoción 3x2: cada 3 unidades iguales, una es sin cargo.";
  }

  if (promo === "10sobre30") {
    if (subtotal > 30000) {
      discount = subtotal * 0.1;
      message = "10% aplicado por superar los $30.000 en el carrito.";
    } else {
      discount = 0;
      message = "Tu compra aún no supera los $30.000. Agregá productos para activar el 10%.";
    }
  }

  return { discount, message };
}

function recalc() {
  const subtotal = computeSubtotal();
  const { discount, message } = computeDiscount(subtotal);
  const total = Math.max(0, subtotal - discount);

  subtotalEl.textContent = fmt.format(subtotal);
  discountEl.textContent = `- ${fmt.format(discount)}`;
  totalEl.textContent = fmt.format(total);
  promoMsg.textContent = message;
}

init();