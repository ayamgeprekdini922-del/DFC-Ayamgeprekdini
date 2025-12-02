// ------------------- Data Produk -------------------
const WA_NUMBER = '6285212234557'; // Nomor utama

// Data produk
const products = [
  { id: 'g1', name: 'Ayam Geprek Dada/Paha atas + Nasi', price: 20000, img: 'img/gambar2.jpg' },
  { id: 'g6', name: 'Ayam Geprek Sayap/Paha bawah + Nasi', price: 18000, img: 'img/gambar7.jpg' },
  { id: 'g2', name: 'Ayam Krispy Paha Atas + Nasi', price: 15000, img: 'img/gambar1.jpg' },
  { id: 'g3', name: 'Ayam Krispy Dada + Nasi', price: 15000, img: 'img/gambar4.jpg' },
  { id: 'g4', name: 'Ayam Krispy Sayap + Nasi', price: 13000, img: 'img/gambar3.jpg' },
  { id: 'g5', name: 'Ayam Krispy Paha bawah + Nasi', price: 13000, img: 'img/gambar6.jpg' },
  { id: 'f1', name: 'Frozen Chicken Geprek (1 pack)', price: 45000, img: 'img/gambar8.jpg' }
];

// Placeholder image SVG
const PLACEHOLDER_IMG = `data:image/svg+xml;utf8,
  <svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>
    <rect width='100%' height='100%' fill='#eef1f4'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
      fill='#9aa3ab' font-family='Arial' font-size='16'>
      Ganti gambar di sini
    </text>
  </svg>`;

// Format Rupiah
function formatRupiah(n){
  return 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Render menu
function renderMenu(){
  const grid = document.getElementById('menuGrid');
  grid.innerHTML = '';

  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'menu-item';

    const thumb = p.img
      ? `<div class="menu-thumb" data-img="${p.img}" style="background-image:url('${p.img}')"></div>`
      : `<div class="menu-thumb" data-img=""><div style="padding:8px;text-align:center">GANTI GAMBAR</div></div>`;

    div.innerHTML = `
      ${thumb}
      <div class="menu-body">
        <h3>${p.name}</h3>
        <p>Resep khas, dibuat dengan bahan pilihan. Pilih jumlah dan tambah ke keranjang atau pesan cepat lewat WhatsApp.</p>
        <div class="menu-footer">
          <div>
            <button class="price-btn" onclick="quickOrder('${p.id}')">${formatRupiah(p.price)}</button>
          </div>
          <div style="display:flex;gap:8px">
            <button class="small-btn" onclick="addToCart('${p.id}', 1)">Tambah</button>
            <button class="small-btn" onclick="addToCart('${p.id}', 2)">+2</button>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(div);
  });
}

// ------------------- Cart Logic -------------------
let cart = {};

function saveCart(){
  localStorage.setItem('agd_cart', JSON.stringify(cart));
}

function loadCart(){
  try {
    cart = JSON.parse(localStorage.getItem('agd_cart')) || {};
  } catch {
    cart = {};
  }
}

function addToCart(id, qty=1){
  if(!cart[id]) cart[id] = 0;
  cart[id] += qty;
  if(cart[id] < 1) delete cart[id];
  saveCart();
  renderCart();
  openCart();
}

function updateQty(id, qty){
  if(qty <= 0){
    delete cart[id];
  } else {
    cart[id] = qty;
  }
  saveCart();
  renderCart();
}

function removeFromCart(id){
  delete cart[id];
  saveCart();
  renderCart();
}

function clearCart(){
  cart = {};
  saveCart();
  renderCart();
}

function cartSummary(){
  let total = 0, items = 0;
  for(const id in cart){
    const p = products.find(x => x.id === id);
    if(!p) continue;

    const qty = cart[id];
    total += p.price * qty;
    items += qty;
  }
  return { total, items };
}

function renderCart(){
  const itemsWrap = document.getElementById('cartItems');
  const count = document.getElementById('cartCount');
  const itemCount = document.getElementById('cartItemCount');
  const totalEl = document.getElementById('cartTotal');

  itemsWrap.innerHTML = '';
  let any = false;

  for(const id in cart){
    const p = products.find(x => x.id === id);
    if(!p) continue;

    any = true;
    const qty = cart[id];
    const row = document.createElement('div');
    row.className = 'cart-row';
    const imgSrc = p.img ? p.img : PLACEHOLDER_IMG;

    row.innerHTML = `
      <img src="${imgSrc}" alt="${p.name}">
      <div style="flex:1">
        <div style="font-weight:700">${p.name}</div>
        <div style="color:var(--muted);font-size:13px">
          ${formatRupiah(p.price)} x ${qty} = <strong>${formatRupiah(p.price * qty)}</strong>
        </div>
        <div style="margin-top:8px;display:flex;gap:6px;align-items:center">
          <div class="qty-control">
            <button class="small-btn" onclick="updateQty('${id}', ${qty - 1})">-</button>
            <div style="padding:6px 10px;border-radius:8px;background:#f7f7f9">${qty}</div>
            <button class="small-btn" onclick="updateQty('${id}', ${qty + 1})">+</button>
          </div>
          <button class="small-btn" onclick="removeFromCart('${id}')">Hapus</button>
        </div>
      </div>
    `;
    itemsWrap.appendChild(row);
  }

  const { total, items } = cartSummary();
  count.textContent = items;
  itemCount.textContent = items + ' item';
  totalEl.textContent = formatRupiah(total);

  if(!any){
    itemsWrap.innerHTML = `<div style="padding:14px;color:var(--muted)">Keranjang kosong. Tambah menu untuk memesan.</div>`;
  }
}

// ------------------- Quick Order -------------------
function quickOrder(id){
  const p = products.find(x => x.id === id);
  if(!p) return;

  let qty = prompt(`Jumlah ${p.name} yang dipesan:`, '1');
  if(qty === null) return;
  qty = parseInt(qty) || 1;

  let address = prompt('Masukkan alamat pengiriman:', '');
  if(address === null) return;

  const subtotal = p.price * qty;

  let message = 
`Halo Ayam Geprek Dini

Saya mau pesan:
- ${qty} x ${p.name}
Harga per pcs: ${formatRupiah(p.price)}
Subtotal: ${formatRupiah(subtotal)}

Alamat antar: ${address}

Terima kasih.`

  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${WA_NUMBER}?text=${encodedMessage}`;
  window.open(url, '_blank');
}

// ------------------- Cart UI Controls -------------------
const cartDrawer = document.getElementById('cartDrawer');
const openCartBtn = document.getElementById('openCartBtn');

function openCart(){
  cartDrawer.classList.add('open');
}

function closeCart(){
  cartDrawer.classList.remove('open');
}

openCartBtn.addEventListener('click', () => {
  cartDrawer.classList.toggle('open');
});

// ------------------- Checkout -------------------
const modalBackdrop = document.getElementById('modalBackdrop');

function openCheckout(){
  const { items } = cartSummary();
  if(items === 0){
    alert('Keranjang kosong.');
    return;
  }
  modalBackdrop.classList.add('show');
}

function closeCheckout(){
  modalBackdrop.classList.remove('show');
}

document.getElementById('checkoutForm').addEventListener('submit', function(e){
  e.preventDefault();

  const name = document.getElementById('checkoutName').value.trim();
  const address = document.getElementById('checkoutAddress').value.trim();
  const note = document.getElementById('checkoutNote').value.trim();

  if(!name || !address){
    alert('Nama dan alamat wajib diisi.');
    return;
  }

  let message =
`Halo Ayam Geprek Dini

Pesanan dari: ${name}
Alamat: ${address}

Detail pesanan:
`;

  let total = 0;
  let hasItems = false;

  for(const id in cart){
    const p = products.find(x => x.id === id);
    if(!p) continue;

    hasItems = true;
    const qty = cart[id];
    const subtotal = p.price * qty;
    total += subtotal;

    message += `- ${qty} x ${p.name} = ${formatRupiah(subtotal)}\n`;
  }

  message += `\nTotal: ${formatRupiah(total)}\n`;

  if(note){
    message += `Note: ${note}\n`;
  }

  message += `\nTerima kasih.`;

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');

  clearCart();
  closeCheckout();
  closeCart();
});

// ------------------- Quick Contact -------------------
document.getElementById('quickContact').addEventListener('submit', function(e){
  e.preventDefault();

  const name = document.getElementById('contactName').value.trim();
  const order = document.getElementById('contactOrder').value.trim();
  const address = document.getElementById('contactAddress').value.trim();

  if(!name || !address){
    alert('Nama dan alamat wajib diisi.');
    return;
  }

  let message =
`Halo Ayam Geprek Dini

Nama: ${name}
Alamat: ${address}
`;

  if(order){
    message += `Pesanan: ${order}\n`;
  }

  message += `\nTerima kasih.`;

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
});

// ------------------- Navigation -------------------
function initNavigation(){
  const navLinks = document.querySelectorAll('.nav-link');
  const pageSections = document.querySelectorAll('.page-section');

  navLinks.forEach(link => {
    link.addEventListener('click', function(e){
      e.preventDefault();
      const target = this.dataset.target;

      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');

      pageSections.forEach(s => s.classList.remove('active'));
      document.getElementById(target).classList.add('active');

      document.getElementById('navUl').classList.remove('show');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  document.getElementById('mobileToggle').addEventListener('click', () => {
    document.getElementById('navUl').classList.toggle('show');
  });
}

// ------------------- Posters -------------------
function setupPosters(){
  const posters = [...document.querySelectorAll('.poster')];

  posters.forEach(p => {
    const url = p.getAttribute('data-img');
    if(url){
      p.style.backgroundImage = `url('${url}')`;
    }
  });

  let idx = 0;
  setInterval(() => {
    posters[idx].classList.remove('active');
    idx = (idx + 1) % posters.length;
    setTimeout(() => posters[idx].classList.add('active'), 60);
  }, 3000);
}

// ------------------- About Image -------------------
function initAboutImage(){
  const aboutImg = document.getElementById('aboutImage');
  if(!aboutImg.src){
    aboutImg.src = PLACEHOLDER_IMG;
  }
}

// ------------------- Init -------------------
document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  loadCart();
  renderCart();
  initNavigation();
  setupPosters();
  initAboutImage();
});
