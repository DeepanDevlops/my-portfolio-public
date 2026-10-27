// ============================================
// SINGLE CURSOR
// ============================================
const cursor = document.getElementById('customCursor');
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

// Idle cursor detection
let lastMouseX = 0;
let lastMouseY = 0;
let idleTimer = null;
let isIdle = false;
let idleSpawnInterval = null;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  // Check if cursor moved significantly
  const moved = Math.abs(e.clientX - lastMouseX) > 2 || Math.abs(e.clientY - lastMouseY) > 2;
  
  if (moved) {
    // Cursor moved, reset idle state
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    
    // Stop idle spawn if active
    if (isIdle) {
      stopIdleSpawn();
    }
    
    // Clear existing idle timer
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
    
    // Start new idle timer
    idleTimer = setTimeout(() => {
      if (!isIdle) {
        isIdle = true;
        startIdleSpawn();
      }
    }, 3500); // 3.5 seconds of no movement
  }
});

// Click effect - spawn programming syntax
const allSyntax = [
  'const', 'let', 'var', 'function', 'class',
  '{}', '()', '[]', '=>', 'async',
  'await', 'return', 'if', 'else', 'for',
  'while', 'import', 'export', 'new', 'this',
  'null', 'undefined', 'true', 'false', 'typeof',
  'instanceof', 'try', 'catch', 'finally', 'developer',
  'backend', 'cloud', 'api', 'server', 'database',
  'microservice', 'architecture', 'system', 'code',
  'variable', 'object', 'array', 'promise', 'async',
  'await', 'module', 'require', 'export', 'default'
];

// Track used syntax for uniqueness per click
let lastUsedSyntax = [];

// Track all syntax elements for scroll hiding
let allSyntaxElements = new Set();
let isScrolling = false;
let scrollTimeout = null;

// Hide syntax elements while scrolling
window.addEventListener('scroll', () => {
  // Stop idle spawn while scrolling
  if (isIdle) {
    stopIdleSpawn();
  }
  
  // Hide all syntax elements
  allSyntaxElements.forEach(element => {
    if (element && element.parentNode) {
      element.style.opacity = '0';
      element.style.pointerEvents = 'none';
    }
  });
  
  isScrolling = true;
  
  // Clear existing timeout
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  
  // Show syntax elements after scrolling stops (500ms delay)
  scrollTimeout = setTimeout(() => {
    isScrolling = false;
    allSyntaxElements.forEach(element => {
      if (element && element.parentNode) {
        element.style.opacity = '';
        element.style.pointerEvents = '';
      }
    });
  }, 500);
}, { passive: true });

// Idle spawn effect - queue system with 3-4 visible at once
let idleSyntaxQueue = []; // Queue to maintain 3-4 syntax elements
let idleSpawnIndex = 0;
const MAX_IDLE_SYNTAX = 4; // Maximum 4 syntax visible at once
let idleSyntaxPositions = []; // Track positions to avoid overlaps
const MIN_DISTANCE = 30; // Minimum distance between syntax elements (reduced)

function startIdleSpawn() {
  if (idleSpawnInterval) return;
  
  // Get unique syntax for idle spawn
  const availableSyntax = allSyntax.filter(s => !lastUsedSyntax.includes(s));
  const shuffled = [...availableSyntax].sort(() => Math.random() - 0.5);
  const idleSyntaxList = shuffled.slice(0, 20); // Get 20 unique syntax for idle
  
  idleSpawnIndex = 0;
  idleSyntaxPositions = []; // Reset positions
  
  // Spawn first 4 one by one with delays (500ms between each)
  for (let i = 0; i < MAX_IDLE_SYNTAX; i++) {
    setTimeout(() => {
      if (!isIdle) return; // Check if still idle
      spawnIdleSyntax(mouseX, mouseY, idleSyntaxList);
      
      // After all 4 are spawned, start the continuous interval
      if (i === MAX_IDLE_SYNTAX - 1) {
        // Wait a bit then start continuous spawn
        setTimeout(() => {
          if (!isIdle) return;
          
          // Start continuous spawn: every 2 seconds, remove oldest and add new one
          idleSpawnInterval = setInterval(() => {
            if (!isIdle) {
              stopIdleSpawn();
              return;
            }
            
            // Ensure we have exactly 4 before removing oldest
            // Remove oldest syntax (first in queue) ONLY if we have 4 or more
            if (idleSyntaxQueue.length >= MAX_IDLE_SYNTAX) {
              const oldest = idleSyntaxQueue.shift(); // Remove first (oldest)
              if (oldest && oldest.parentNode) {
                // Remove position from tracking using stored position
                const storedPos = oldest._idlePosition;
                if (storedPos) {
                  idleSyntaxPositions = idleSyntaxPositions.filter(pos => {
                    return pos !== storedPos; // Remove exact reference
                  });
                }
                allSyntaxElements.delete(oldest);
                oldest.remove();
              }
            }
            
            // Always spawn next syntax (this will maintain exactly 4)
            // After removing oldest, we'll have 3, then add 1 to make 4
            spawnIdleSyntax(mouseX, mouseY, idleSyntaxList);
          }, 2000); // 2 second interval
        }, 500); // Small delay after last spawn
      }
    }, i * 500); // 500ms delay between each spawn
  }
}

function createIdleSyntaxElement(x, y, syntaxList) {
  // Get next syntax from list (cycle through)
  const syntax = syntaxList[idleSpawnIndex % syntaxList.length];
  idleSpawnIndex++;
  
  // Find a position that doesn't overlap with existing syntax
  let spawnX, spawnY;
  let attempts = 0;
  const maxAttempts = 50;
  
  // Find which slots (0-3) are currently occupied
  const occupiedSlots = new Set();
  idleSyntaxPositions.forEach(pos => {
    if (pos.slot !== undefined) {
      occupiedSlots.add(pos.slot);
    }
  });
  
  // Find an available slot (prefer empty slot, but if all occupied, use next in sequence)
  let targetSlot = -1;
  for (let i = 0; i < MAX_IDLE_SYNTAX; i++) {
    if (!occupiedSlots.has(i)) {
      targetSlot = i;
      break;
    }
  }
  
  // If all slots occupied, use next slot in sequence based on spawn index
  if (targetSlot === -1) {
    targetSlot = (idleSpawnIndex - 1) % MAX_IDLE_SYNTAX;
  }
  
  do {
    // Calculate angle for the target slot with randomness
    const baseAngle = (targetSlot * (Math.PI * 2 / MAX_IDLE_SYNTAX));
    // Add more randomness to ensure different positions
    const randomOffset = (Math.random() - 0.5) * 0.8; // ±0.4 radians (wider range)
    const angle = baseAngle + randomOffset;
    
    // Vary radius more
    const baseRadius = 25;
    const radius = baseRadius + Math.random() * 20; // 25-45px from cursor (more variation)
    
    spawnX = x + Math.cos(angle) * radius;
    spawnY = y + Math.sin(angle) * radius;
    attempts++;
    
    // If overlapping, try a different slot or wider angle
    if (isPositionOverlapping(spawnX, spawnY) && attempts < maxAttempts) {
      // Try next slot
      if (attempts % 5 === 0) {
        targetSlot = (targetSlot + 1) % MAX_IDLE_SYNTAX;
      }
      const newAngle = (targetSlot * (Math.PI * 2 / MAX_IDLE_SYNTAX)) + (Math.random() - 0.5) * 1.2;
      const newRadius = baseRadius + Math.random() * 20;
      spawnX = x + Math.cos(newAngle) * newRadius;
      spawnY = y + Math.sin(newAngle) * newRadius;
    }
  } while (attempts < maxAttempts && isPositionOverlapping(spawnX, spawnY));
  
  // Create syntax element at calculated position
  const element = document.createElement('div');
  element.className = 'syntax-spawn syntax-idle'; // Add idle class to distinguish
  element.textContent = syntax;
  element.style.left = spawnX + 'px';
  element.style.top = spawnY + 'px';
  element.style.transform = 'translate(-50%, -50%)';
  element.style.animation = 'none'; // Disable fade-out animation for idle elements
  element.style.opacity = '1'; // Keep visible
  document.body.appendChild(element);

  // Add random scale only (no rotation)
  const scale = 0.8 + Math.random() * 0.3;
  element.style.transform = `translate(-50%, -50%) scale(${scale})`;

  // Track element and hide if scrolling
  allSyntaxElements.add(element);
  if (isScrolling) {
    element.style.opacity = '0';
    element.style.pointerEvents = 'none';
  }

  // Track position with slot information
  const positionObj = { x: spawnX, y: spawnY, slot: targetSlot };
  idleSyntaxPositions.push(positionObj);
  
  // Store position reference on element for easy removal
  element._idlePosition = positionObj;

  // Add to queue
  idleSyntaxQueue.push(element);
  
  return element;
}

function spawnIdleSyntax(x, y, syntaxList) {
  // Use the shared function to create element
  createIdleSyntaxElement(x, y, syntaxList);
}

function isPositionOverlapping(x, y) {
  // Check if position is too close to existing syntax elements
  for (let pos of idleSyntaxPositions) {
    const distance = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
    if (distance < MIN_DISTANCE) {
      return true; // Overlapping
    }
  }
  return false; // No overlap
}

function stopIdleSpawn() {
  if (idleSpawnInterval) {
    clearInterval(idleSpawnInterval);
    idleSpawnInterval = null;
  }
  
  // Remove all idle syntax
  idleSyntaxQueue.forEach(element => {
    if (element && element.parentNode) {
      allSyntaxElements.delete(element);
      element.remove();
    }
  });
  idleSyntaxQueue = [];
  idleSyntaxPositions = []; // Clear position tracking
  
  isIdle = false;
  idleSpawnIndex = 0;
}

function animateCursor() {
  if (cursor) {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
  }
  requestAnimationFrame(animateCursor);
}

if (cursor) {
  animateCursor();
}

// Hover effect
const hoverElements = document.querySelectorAll('a, button, [data-magnetic]');
hoverElements.forEach((el) => {
  el.addEventListener('mouseenter', () => {
    if (cursor) cursor.classList.add('hover');
  });
  el.addEventListener('mouseleave', () => {
    if (cursor) cursor.classList.remove('hover');
  });
});

// Spawn syntax function
function spawnSyntaxAtPosition(x, y, count = 5) {
  // Get unique syntax not used in previous click
  const availableSyntax = allSyntax.filter(s => !lastUsedSyntax.includes(s));
  const syntaxToUse = [];
  
  // Shuffle and pick unique syntax
  const shuffled = [...availableSyntax].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    syntaxToUse.push(shuffled[i]);
  }
  
  // If we need more, allow repeats but ensure variety
  while (syntaxToUse.length < count) {
    const randomSyntax = allSyntax[Math.floor(Math.random() * allSyntax.length)];
    if (!syntaxToUse.includes(randomSyntax)) {
      syntaxToUse.push(randomSyntax);
    }
  }
  
  // Update last used syntax
  lastUsedSyntax = [...syntaxToUse];
  
  // Spawn all syntax instantly (no delays)
  syntaxToUse.forEach((syntax, index) => {
    const angle = (Math.PI * 2 * index) / count;
    const radius = 60 + Math.random() * 40;
    const offsetX = Math.cos(angle) * radius;
    const offsetY = Math.sin(angle) * radius;
    
    const spawnX = x + offsetX;
    const spawnY = y + offsetY;
    
    spawnProgrammingSyntax(spawnX, spawnY, syntax);
  });
}

document.addEventListener('click', (e) => {
  // Always trigger click effect regardless of cursor position
  if (cursor) {
    cursor.classList.add('click');
    setTimeout(() => {
      if (cursor) cursor.classList.remove('click');
    }, 200);
  }

  const clickX = e.clientX;
  const clickY = e.clientY;
  
  // Get unique syntax not used in previous click
  const availableSyntax = allSyntax.filter(s => !lastUsedSyntax.includes(s));
  const shuffled = [...availableSyntax].sort(() => Math.random() - 0.5);
  const syntax = shuffled.length > 0 ? shuffled[0] : allSyntax[Math.floor(Math.random() * allSyntax.length)];
  
  // Update last used syntax
  lastUsedSyntax = [syntax];
  
  // Spawn only one syntax at click position
  spawnProgrammingSyntax(clickX, clickY, syntax);
});

function spawnProgrammingSyntax(x, y, text) {
  const element = document.createElement('div');
  element.className = 'syntax-spawn';
  element.textContent = text;
  element.style.left = x + 'px';
  element.style.top = y + 'px';
  element.style.transform = 'translate(-50%, -50%)';
  document.body.appendChild(element);

  // Add random scale only (no rotation)
  const scale = 0.8 + Math.random() * 0.4;
  element.style.transform = `translate(-50%, -50%) scale(${scale})`;

  // Track element and hide if scrolling
  allSyntaxElements.add(element);
  if (isScrolling) {
    element.style.opacity = '0';
    element.style.pointerEvents = 'none';
  }

  setTimeout(() => {
    allSyntaxElements.delete(element);
    if (element.parentNode) {
      element.remove();
    }
  }, 2000);
}

// ============================================
// MATRIX CANVAS ANIMATION
// ============================================
const matrixCanvas = document.getElementById('matrix-canvas');
if (matrixCanvas) {
  const ctx = matrixCanvas.getContext('2d');
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;

  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  const fontSize = 14;
  const columns = matrixCanvas.width / fontSize;
  const drops = [];

  for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * -100;
  }

  function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    ctx.fillStyle = '#00ff41';
    ctx.font = fontSize + 'px JetBrains Mono';

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillText(text, x, y);

      if (y > matrixCanvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(drawMatrix, 50);

  window.addEventListener('resize', () => {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    const newColumns = matrixCanvas.width / fontSize;
    while (drops.length < newColumns) {
      drops.push(Math.random() * -100);
    }
    drops.length = newColumns;
  });
}

// ============================================
// NAVIGATION
// ============================================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
  });
}

// Active link highlighting
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (window.pageYOffset >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      if (navMenu) navMenu.classList.remove('active');
    }
  });
});

// ============================================
// MAGNETIC EFFECT
// ============================================
const magneticElements = document.querySelectorAll('[data-magnetic]');

magneticElements.forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'translate(0, 0)';
  });
});

// ============================================
// SCROLL ANIMATIONS
// ============================================
const animationObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const element = entry.target;
      const animation = element.getAttribute('data-animate');
      const delay = parseInt(element.getAttribute('data-delay')) || 0;

      setTimeout(() => {
        element.classList.add('animated', animation);
      }, delay);

      animationObserver.unobserve(element);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('[data-animate]').forEach((el) => {
  animationObserver.observe(el);
});

// Observe section headers
document.querySelectorAll('.section-header-terminal').forEach((el) => {
  const headerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        headerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  headerObserver.observe(el);
});

// Observe skill categories
document.querySelectorAll('.skill-category-terminal').forEach((el) => {
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  skillObserver.observe(el);
});

// Observe project cards
document.querySelectorAll('.project-card-terminal').forEach((el) => {
  const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        projectObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  projectObserver.observe(el);
});

// Observe service and achievement cards
document.querySelectorAll('.service-card-terminal, .achievement-card-terminal').forEach((el) => {
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  cardObserver.observe(el);
});

// Observe about elements
document.querySelectorAll('.about-content-terminal, .about-visual-terminal').forEach((el) => {
  const aboutObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        aboutObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  aboutObserver.observe(el);
});

// Observe contact elements
document.querySelectorAll('.contact-info-terminal, .contact-form-terminal').forEach((el) => {
  const contactObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        contactObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  contactObserver.observe(el);
});

// Observe timeline items
document.querySelectorAll('.timeline-item-terminal').forEach((el) => {
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        timelineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  timelineObserver.observe(el);
});

// ============================================
// SKILL BARS ANIMATION
// ============================================
const skillBars = document.querySelectorAll('.skill-progress-terminal');

const skillBarObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const progressBar = entry.target;
      const width = progressBar.getAttribute('data-width');
      setTimeout(() => {
        progressBar.style.width = width + '%';
      }, Math.random() * 500);
      skillBarObserver.unobserve(progressBar);
    }
  });
}, { threshold: 0.5 });

skillBars.forEach((bar) => {
  skillBarObserver.observe(bar);
});

// ============================================
// TYPING ANIMATION FOR HERO
// ============================================
const typingCommand = document.getElementById('typing-command');
const commands = [
  'ls projects',
  'cat skills.txt',
  'git status',
  'npm start',
  'node server.js',
  'docker run',
];

let commandIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeCommand() {
  const currentCommand = commands[commandIndex];

  if (!isDeleting && charIndex < currentCommand.length) {
    typingCommand.textContent = currentCommand.substring(0, charIndex + 1);
    charIndex++;
    setTimeout(typeCommand, 100);
  } else if (isDeleting && charIndex > 0) {
    typingCommand.textContent = currentCommand.substring(0, charIndex - 1);
    charIndex--;
    setTimeout(typeCommand, 50);
  } else if (!isDeleting && charIndex === currentCommand.length) {
    isDeleting = true;
    setTimeout(typeCommand, 2000);
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    commandIndex = (commandIndex + 1) % commands.length;
    setTimeout(typeCommand, 500);
  }
}

if (typingCommand) {
  typeCommand();
}

// ============================================
// SCROLL PROGRESS
// ============================================
const scrollProgress = document.getElementById('scrollProgress');

if (scrollProgress) {
  window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    scrollProgress.style.width = scrolled + '%';
  });
}

// ============================================
// STATS COUNTER
// ============================================
const statNumbers = document.querySelectorAll('.stat-number');

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const statNumber = entry.target;
      const text = statNumber.textContent;
      const hasPlus = text.includes('+');
      const hasPercent = text.includes('%');
      const target = parseFloat(text.replace(/[^0-9.]/g, ''));

      if (!isNaN(target) && target > 0) {
        let current = 0;
        const duration = 2000;
        const startTime = Date.now();

        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

        const updateCounter = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = easeOutCubic(progress);
          current = target * eased;

          statNumber.textContent =
            current.toFixed(hasPercent ? 0 : 1) +
            (hasPlus ? '+' : '') +
            (hasPercent ? '%' : '');

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            statNumber.textContent = text;
          }
        };

        updateCounter();
        statsObserver.unobserve(statNumber);
      }
    }
  });
}, { threshold: 0.5 });

statNumbers.forEach((stat) => {
  statsObserver.observe(stat);
});

// ============================================
// LOADING ANIMATION
// ============================================
window.addEventListener('load', () => {
  const loader = document.querySelector('.page-loader');
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    }, 2000);
  }

  document.body.classList.add('loaded');
});

// ============================================
// FORM SUBMISSION
// ============================================
const contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    const originalText = submitBtn.innerHTML;

    submitBtn.innerHTML = '<span>Message Sent ✓</span>';
    submitBtn.style.background = 'var(--terminal-green)';
    submitBtn.style.color = 'var(--bg-darker)';

    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.style.background = 'transparent';
      submitBtn.style.color = 'var(--terminal-green)';
      contactForm.reset();
    }, 3000);
  });


  

}

// ============================================
// CONSOLE MESSAGE
// ============================================
console.log(
  '%c$ whoami',
  'color: #00ff41; font-size: 20px; font-weight: bold; font-family: monospace;'
);
console.log(
  '%cDeepankumar Palaniyappan - Software Developer',
  'color: #00ff88; font-size: 14px; font-family: monospace;'
);
console.log(
  '%cPortfolio initialized successfully.',
  'color: #00ff41; font-size: 12px; font-family: monospace;'
);


