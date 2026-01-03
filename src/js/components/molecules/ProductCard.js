/**
 * Atom: Product Card Component
 * Optimized for reusability in Grid and Lists
 */
export function createProductCard(product, onBuy) {
  // Container
  const card = document.createElement('div');
  card.className = "border border-purple-800 p-2 hover:bg-purple-900/30 transition group cursor-pointer flex flex-col h-full";

  // Image Area
  const imgContainer = document.createElement('div');
  imgContainer.className = "h-24 bg-gray-900 mb-2 overflow-hidden relative w-full";

  const img = document.createElement('img');
  img.src = product.img;
  img.className = "w-full h-full object-cover";
  img.alt = product.title;

  imgContainer.appendChild(img);

  // Title
  const title = document.createElement('h3');
  title.className = "retro-font text-[10px] text-purple-300 break-words leading-tight";
  title.innerText = product.title;

  // Footer (Price + Button)
  const footer = document.createElement('div');
  footer.className = "flex justify-between items-end mt-2 mt-auto";

  const
    priceSpan = document.createElement('span');
  priceSpan.className = "text-white";
  priceSpan.innerText = `R$ ${product.price.toFixed(2).replace('.', ',')}`;

  const btn = document.createElement('button');
  btn.className = "bg-purple-600 text-black text-[10px] px-2 py-1 hover:bg-white retro-font transition-colors";
  btn.innerText = "COMPRAR";
  btn.onclick = (e) => {
    e.stopPropagation(); // prevent card click if any
    onBuy(product);
  };

  if (product.soldOut) {
    const soldOutOverlay = document.createElement('div');
    soldOutOverlay.className = "absolute inset-0 bg-black/60 flex items-center justify-center";
    soldOutOverlay.innerHTML = '<span class="text-red-500 font-bold retro-font text-xs border border-red-500 px-2 py-1 rotate-12">ESGOTADO</span>';
    imgContainer.appendChild(soldOutOverlay);
  }

  footer.appendChild(priceSpan);

  if (product.soldOut) {
    const soldOutBtn = document.createElement('span');
    soldOutBtn.className = "text-gray-500 text-[10px] px-2 py-1 retro-font font-bold border border-gray-700 cursor-not-allowed";
    soldOutBtn.innerText = "ESGOTADO";
    footer.appendChild(soldOutBtn);
  } else {
    footer.appendChild(btn);
  }

  // Assemble
  card.appendChild(imgContainer);
  card.appendChild(title);
  card.appendChild(footer);

  return card;
}
