// ========================
// Fade-in Sections on Scroll
// ========================
const faders = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

faders.forEach(fader => observer.observe(fader));

// ========================
// Floating Elements: Plates & Steam
// ========================
const floatingElements = document.querySelectorAll('.floating-food, .plate, .steam');

floatingElements.forEach(elem => {
  // Random horizontal position
  let startX = Math.random() * (window.innerWidth - 50);
  elem.style.left = startX + 'px';

  // Horizontal sway for natural movement
  let swayAmplitude = 15 + Math.random() * 10; // px
  let direction = 1;

  setInterval(() => {
    const currentX = parseFloat(elem.style.left);
    if (currentX > startX + swayAmplitude) direction = -1;
    if (currentX < startX - swayAmplitude) direction = 1;
    elem.style.left = currentX + direction * 0.2 + 'px';
  }, 30);
});

// ========================
// Floating Emoji Animation (Hero)
// ========================
const hero = document.querySelector('.hero');
const foodIcons = ['🍕','🥗','🥘','🍔','🍩'];
const maxEmojis = 8; // Limit maximum emojis
let activeEmojis = 0;

setInterval(() => {
  if(activeEmojis >= maxEmojis) return; // Avoid overcrowding

  const food = document.createElement('div');
  food.classList.add('floating-food');
  food.textContent = foodIcons[Math.floor(Math.random() * foodIcons.length)];

  // Random horizontal start within hero width
  food.style.left = Math.random() * (window.innerWidth - 50) + 'px';
  food.style.bottom = '-50px';
  food.style.fontSize = (18 + Math.random() * 18) + 'px';
  food.style.opacity = 0.5 + Math.random() * 0.3;
  hero.appendChild(food);
  activeEmojis++;

  // Animate upward
  let bottom = -50;
  const speed = 0.3 + Math.random() * 0.5; // Vertical speed
  const swayAmplitude = 15 + Math.random() * 10; // Horizontal sway
  let direction = 1;

  const interval = setInterval(() => {
    bottom += speed;
    food.style.bottom = bottom + 'px';

    // Horizontal sway
    let currentX = parseFloat(food.style.left);
    if (currentX > parseFloat(food.style.left) + swayAmplitude) direction = -1;
    if (currentX < parseFloat(food.style.left) - swayAmplitude) direction = 1;
    food.style.left = currentX + direction * 0.2 + 'px';

    // Remove when out of screen
    if (bottom > window.innerHeight + 50) {
      clearInterval(interval);
      hero.removeChild(food);
      activeEmojis--;
    }
  }, 20);

}, 2500); // Spawn every 2.5s

// ========================
// Load Today's Menu from Backend API
// ========================
async function loadTodaysMenu() {
  try {
    const response = await fetch('http://localhost:8080/api/menu/daily/today');
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        displayTodaysMenu(result.data);
      } else {
        displayFallbackMenu();
      }
    } else {
      displayFallbackMenu();
    }
  } catch (error) {
    console.error('Error loading today\'s menu:', error);
    displayFallbackMenu();
  }
}

function displayTodaysMenu(dailyMenu) {
  const menuSection = document.querySelector('.daily-menu-items');
  if (!menuSection) return;

  if (dailyMenu.menuItems && dailyMenu.menuItems.length > 0) {
    menuSection.innerHTML = dailyMenu.menuItems.map(item => `
      <div class="menu-item">
        <h4>${item.name}</h4>
        <p>${item.description || 'Delicious meal'}</p>
        <span class="price">₹${item.price}</span>
        <span class="category ${item.isVegetarian ? 'veg' : 'non-veg'}">
          ${item.isVegetarian ? '🥬 VEG' : '🍖 NON-VEG'}
        </span>
      </div>
    `).join('');
  } else {
    displayFallbackMenu();
  }
}

function displayFallbackMenu() {
  const menuSection = document.querySelector('.daily-menu-items');
  if (!menuSection) return;

  menuSection.innerHTML = `
    <div class="menu-item">
      <h4>Idli Sambar</h4>
      <p>Steamed rice cakes with lentil curry</p>
      <span class="price">₹25</span>
      <span class="category veg">🥬 VEG</span>
    </div>
    <div class="menu-item">
      <h4>Chicken Curry</h4>
      <p>Spicy chicken curry with rice</p>
      <span class="price">₹45</span>
      <span class="category non-veg">🍖 NON-VEG</span>
    </div>
    <div class="menu-item">
      <h4>Dal Tadka</h4>
      <p>Tempered lentil curry</p>
      <span class="price">₹25</span>
      <span class="category veg">🥬 VEG</span>
    </div>
  `;
}

// Load menu when page loads
document.addEventListener('DOMContentLoaded', loadTodaysMenu);

// ========================
// Floating Reactions in Testimonials/CTA
// ========================
const reactions = document.querySelectorAll('.floating-reactions, .reaction-icons');
reactions.forEach(el => {
  let startX = Math.random() * (window.innerWidth - 50);
  el.style.left = startX + 'px';
  let swayAmplitude = 15 + Math.random() * 10;
  let direction = 1;

  setInterval(() => {
    const currentX = parseFloat(el.style.left);
    if(currentX > startX + swayAmplitude) direction = -1;
    if(currentX < startX - swayAmplitude) direction = 1;
    el.style.left = currentX + direction * 0.3 + 'px';
  }, 30);
});
