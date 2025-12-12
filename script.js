// ==========================================
// 1. DATA CONFIGURATION
// ==========================================
const portfolioData = {
    games: {
        id: 0,
        label: "Games",
        path: "Directory/Games/", 
        items: [
            { name: "Dungeon Crawler", type: "file" },
            { name: "Specter", type: "file" },
            { name: "Doctor Gear", type: "file" },
            { name: "The Last Hope", type: "file" },
            { name: "Story Game", type: "file" }
        ]
    },
    university: {
        id: 1,
        label: "Shaders",
        path: "Directory/Shaders/",
        items: [
            { name: "Water", type: "file" },
            { name: "Toon", type: "file" },
            { name: "PBR", type: "file" },
            { name: "Realistic", type: "file" },
        ] 
    },
    personal: {
        id: 2,
        label: "Physics",
        path: "Directory/Physics/",
        items: [
            { name: "Demo", type: "file" },
            { name: "Soft Body Sim", type: "file" },
            { name: "Soft Body Sim", type: "file" },
            { name: "Soft Body Sim", type: "file" },
        ] 
    },
    python: {
        id: 3,
        label: "Python",
        path: "Directory/Python/",
        items: [
            { name: "Sound Categoriser", type: "file" },
            { name: "Auto-Rigger", type: "file" },
            { name: "Auto-Rigger", type: "file" },
        ] 
    },
    info: {
        id: 4,
        label: "Info",
        path: "Directory/Info/",
        items: [
            { 
                name: "CV", 
                type: "url", 
                url: "https://docs.google.com/document/d/1i38kEMADnhAN9wzD0wU-nwPqG2sznC_xePIa3-dL1RU/edit?usp=sharing" 
            },
            { name: "Contacts", type: "file" },
            { name: "Privacy Policy", type: "file" }
        ]
    }
};

// ==========================================
// 2. DOM ELEMENTS & STATE
// ==========================================
const categoryContainer = document.getElementById("category-tabs");
const listContainer = document.getElementById("list-container");
const showcaseWindow = document.getElementById("showcase-window");
const mainFrame = document.getElementById("main-frame");

let currentCategory = 'games'; 
let isAnimating = false;        // Locked during Click-Scroll
let ignoreScrollEvents = false; // Locked during Click-Scroll
let isInfiniteScrollActive = false;
let setHeight = 0; 
let scrollRafId = null;         // RequestAnimationFrame ID

// ==========================================
// 3. INITIALIZATION
// ==========================================
function init() {
    renderCategories(); 
    renderVerticalList(); 
    
    // Initial Setup
    setTimeout(() => {
        updateSetHeight();
        if (isInfiniteScrollActive) {
            const startHeader = listContainer.querySelector(`.list-header[data-section="games"][data-set-index="1"]`);
            if(startHeader) listContainer.scrollTop = startHeader.offsetTop;
        }
    }, 100);

    // Optimized Scroll Listener
    listContainer.addEventListener('scroll', onScroll);
    window.addEventListener('resize', updateSetHeight);
}

function updateSetHeight() {
    const sets = document.querySelectorAll('.list-set');
    if(sets.length > 0) setHeight = sets[0].offsetHeight;
}

// ==========================================
// 4. RENDER TOP TABS
// ==========================================
function renderCategories() {
    let track = document.getElementById("category-track");
    if (!track) {
        categoryContainer.innerHTML = '';
        track = document.createElement("div");
        track.className = "category-track";
        track.id = "category-track";
        categoryContainer.appendChild(track);
    } else {
        track.innerHTML = ''; 
    }
    
    const keys = Object.keys(portfolioData);
    const total = keys.length;
    const currentIndex = keys.indexOf(currentCategory);
    
    // Increased Buffer (-7 to +7) to prevent running out of tabs during fast scrolling
    for (let i = -7; i <= 7; i++) {
        let wrappedIndex = (currentIndex + i + total) % total;
        wrappedIndex = (wrappedIndex + total) % total;
        
        const key = keys[wrappedIndex];
        const data = portfolioData[key];
        
        const tab = document.createElement("div");
        tab.className = "categories";
        
        if (key === currentCategory) {
            tab.classList.add("selected"); 
            tab.style.transform = "scale(1.1)";
            tab.style.color = "var(--clr-accent)";
            tab.id = "selected"; 
        } else {
            tab.classList.add("unselected");
            tab.style.transform = "scale(1.0)";
            tab.style.opacity = "0.5";
            tab.id = "unselected";
        }
        
        tab.innerText = data.label;
        tab.dataset.key = key;
        tab.dataset.indexOffset = i; // 0 is center

        tab.addEventListener("click", (e) => {
            switchCategory(key, e.currentTarget, false);
        });

        track.appendChild(tab);
    }
}

// ==========================================
// 5. RENDER VERTICAL LIST
// ==========================================
function renderVerticalList() {
    listContainer.innerHTML = '';
    const keys = Object.keys(portfolioData);
    
    let totalItems = 0;
    keys.forEach(key => totalItems += portfolioData[key].items.length);
    isInfiniteScrollActive = totalItems > 5; 

    const startSet = isInfiniteScrollActive ? 0 : 1;
    const endSet = isInfiniteScrollActive ? 3 : 2;

    for(let setIndex = startSet; setIndex < endSet; setIndex++) {
        const setWrapper = document.createElement("div");
        setWrapper.className = "list-set";
        setWrapper.dataset.setIndex = setIndex;
        
        keys.forEach(key => {
            const data = portfolioData[key];
            const header = document.createElement("div");
            header.className = "list-header";
            header.innerText = `-- ${data.label} --`;
            header.dataset.section = key;
            header.dataset.setIndex = setIndex; 
            setWrapper.appendChild(header);
            
            if(data.items.length > 0) {
                data.items.forEach(itemObj => {
                    setWrapper.appendChild(createListItem(itemObj, data.path, key));
                });
            } else {
                const empty = document.createElement("div");
                empty.className = "empty-msg";
                empty.innerText = "Empty";
                setWrapper.appendChild(empty);
            }
        });
        listContainer.appendChild(setWrapper);
    }
}

function createListItem(itemObj, path, sectionKey) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "menu-row"; 
    
    const boxDiv = document.createElement("div");
    boxDiv.className = "checkbox-icon"; 
    boxDiv.id = "box"; 
    const textDiv = document.createElement("div");
    textDiv.innerText = itemObj.name;
    textDiv.className = "hoverable";
    
    rowDiv.addEventListener("click", () => {
        handleItemClick(itemObj, rowDiv, path);
        if(currentCategory !== sectionKey) {
            switchCategory(sectionKey, null, false); 
        }
    });

    rowDiv.appendChild(boxDiv);
    rowDiv.appendChild(textDiv);
    return rowDiv;
}

// ==========================================
// 6. SWITCH CATEGORY (Manual Click)
// ==========================================
function switchCategory(key, clickedElement, fromScroll = false) {
    if (key === currentCategory && !fromScroll) return;
    
    if (!fromScroll) {
        if (isAnimating) return;
        isAnimating = true;
        ignoreScrollEvents = true; 
    }

    let targetElement = clickedElement;
    const track = document.getElementById("category-track");
    
    // Find visual target
    if (!targetElement) {
        const center = track.querySelector('.categories[data-index-offset="0"]');
        if(center) {
            const next = center.nextElementSibling;
            const prev = center.previousElementSibling;
            if(next && next.dataset.key === key) targetElement = next;
            else if(prev && prev.dataset.key === key) targetElement = prev;
        }
        if(!targetElement) targetElement = track.querySelector(`.categories[data-key="${key}"]`);
    }

    if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const elementCenter = rect.left + (rect.width / 2);
        const containerRect = categoryContainer.getBoundingClientRect();
        const containerCenterAbs = containerRect.left + (containerRect.width / 2);
        const shiftAmount = containerCenterAbs - elementCenter;

        // Apply Transition
        track.style.transition = "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)";
        track.style.transform = `translateX(${shiftAmount}px)`;
        
        // Instant visual update if clicked
        if (!fromScroll) {
            track.querySelectorAll('.categories').forEach(el => {
                el.style.transform = 'scale(1.0)';
                el.style.opacity = '0.5';
                el.style.color = "var(--clr-dark)";
            });
            targetElement.style.transform = 'scale(1.1)';
            targetElement.style.opacity = '1.0';
            targetElement.style.color = "var(--clr-accent)";
        }
    }

    // Scroll List if Clicked
    if (!fromScroll) {
        scrollToCategory(key);
    }

    currentCategory = key;

    // Reset Logic
    if (!fromScroll) {
        setTimeout(() => {
            renderCategories(); 
            const newTrack = document.getElementById("category-track");
            if(newTrack) {
                newTrack.style.transition = "none";
                newTrack.style.transform = "translateX(0)";
            }
            isAnimating = false;
            // Re-enable scroll listener ONLY after scrolling has settled
            setTimeout(() => { ignoreScrollEvents = false; }, 800);
        }, 300);
    }
}

// ==========================================
// 7. HANDLE LIST SCROLL (Optimized)
// ==========================================
function onScroll() {
    if (ignoreScrollEvents) return;
    // Debounce/Throttle using RequestAnimationFrame for performance
    if (scrollRafId) cancelAnimationFrame(scrollRafId);
    scrollRafId = requestAnimationFrame(performScrollLogic);
}

function performScrollLogic() {
    const scrollTop = listContainer.scrollTop;
    
    // --- 1. INFINITE SCROLL RESET ---
    if (isInfiniteScrollActive && setHeight > 0) {
        if (scrollTop < setHeight * 0.1) {
            listContainer.scrollTop += setHeight;
            return; 
        }
        if (scrollTop > setHeight * 1.9) {
            listContainer.scrollTop -= setHeight;
            return; 
        }
    }

    // --- 2. FIND ACTIVE SECTION ---
    const allHeaders = Array.from(listContainer.querySelectorAll('.list-header'));
    
    let activeIndex = 0;
    // Scan for the header currently closest to top
    for (let i = 0; i < allHeaders.length; i++) {
        if (allHeaders[i].offsetTop <= scrollTop + 50) {
            activeIndex = i;
        } else {
            break; 
        }
    }

    const currentHeader = allHeaders[activeIndex];
    const nextHeader = allHeaders[activeIndex + 1];
    
    if (!currentHeader) return;

    const newCategory = currentHeader.dataset.section;

    // --- 3. CALCULATE PROGRESS ---
    let progress = 0;
    let nextCategory = null;

    if (nextHeader) {
        nextCategory = nextHeader.dataset.section;
        const startY = currentHeader.offsetTop;
        const endY = nextHeader.offsetTop;
        const distance = endY - startY;
        const scrolled = scrollTop - startY;
        progress = Math.min(Math.max(scrolled / distance, 0), 1);
    }

    // --- 4. DOM UPDATE (Only when fully settled) ---
    // If we have fully transitioned to a new category, update the "Center" of the world.
    if (newCategory !== currentCategory) {
        // Only re-render if we are safely settled (not mid-transition)
        // This prevents the "Jitter" by ensuring we don't snap the DOM while tweening
        if (progress < 0.05 || progress > 0.95) {
             currentCategory = newCategory;
             renderCategories(); 
             // Force zero transform immediately after render to prevent jump
             const track = document.getElementById("category-track");
             if(track) {
                 track.style.transition = "none";
                 track.style.transform = "translateX(0)";
             }
        }
    }

    // --- 5. INTERPOLATE (Smooth Tween) ---
    if (nextCategory) {
        interpolateTopBar(newCategory, nextCategory, progress);
    }
}

function interpolateTopBar(keyA, keyB, progress) {
    const track = document.getElementById("category-track");
    if(!track) return;

    // Use currentCategory as the anchor.
    // If we haven't switched currentCategory yet (progress < 0.95), keyA == currentCategory.
    
    const tabA = track.querySelector(`.categories[data-key="${keyA}"][data-index-offset="0"]`);
    if (!tabA) return;

    let tabB = null;
    let direction = 0;

    const next = tabA.nextElementSibling;
    const prev = tabA.previousElementSibling;

    if (next && next.dataset.key === keyB) {
        tabB = next;
        direction = -1; // Moving to Next -> Track moves Left
    } else if (prev && prev.dataset.key === keyB) {
        tabB = prev;
        direction = 1; // Moving to Prev -> Track moves Right
    }

    if (tabA && tabB) {
        const dist = (tabA.offsetWidth / 2) + 15 + (tabB.offsetWidth / 2); 
        const moveX = (dist * progress) * direction;
        
        // FORCE NO TRANSITION so scrollbar controls it 1:1
        track.style.transition = "none"; 
        track.style.transform = `translateX(${moveX}px)`;

        // Scale & Opacity
        const scaleA = 1.1 - (0.1 * progress);
        const opacityA = 1 - (0.5 * progress);
        const scaleB = 1.0 + (0.1 * progress);
        const opacityB = 0.5 + (0.5 * progress);

        tabA.style.transform = `scale(${scaleA})`;
        tabA.style.opacity = opacityA;
        tabA.style.color = progress > 0.5 ? "var(--clr-dark)" : "var(--clr-accent)";
        
        tabB.style.transform = `scale(${scaleB})`;
        tabB.style.opacity = opacityB;
        tabB.style.color = progress > 0.5 ? "var(--clr-accent)" : "var(--clr-dark)";
    }
}

// ==========================================
// 9. SCROLL HELPERS (SHORTEST PATH)
// ==========================================
function scrollToCategory(targetKey) {
    if (!isInfiniteScrollActive) {
        const header = listContainer.querySelector(`.list-header[data-section="${targetKey}"]`);
        if (header) {
            listContainer.scrollTo({ top: header.offsetTop, behavior: 'smooth' });
        }
        return;
    }

    // Find Shortest Path among sets
    const headers = listContainer.querySelectorAll(`.list-header[data-section="${targetKey}"]`);
    let bestHeader = null;
    let minDistance = Infinity;
    const currentScroll = listContainer.scrollTop;

    headers.forEach(h => {
        const dist = Math.abs(h.offsetTop - currentScroll);
        if (dist < minDistance) {
            minDistance = dist;
            bestHeader = h;
        }
    });

    if (bestHeader) {
        listContainer.scrollTo({
            top: bestHeader.offsetTop,
            behavior: 'smooth'
        });
    }
}

// ==========================================
// 10. CLICK HANDLER
// ==========================================
// ==========================================
// 10. CLICK HANDLER (UPDATED WITH ERROR CHECK)
// ==========================================
// ==========================================
// UPDATE 1: CREATE LIST ITEM (Generates CSS Checkboxes)
// ==========================================
function createListItem(itemObj, path, sectionKey) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "menu-row"; 
    
    // Create the CSS Checkbox (No ID needed for images anymore)
    const boxDiv = document.createElement("div");
    boxDiv.className = "checkbox-icon"; 
    
    const textDiv = document.createElement("div");
    textDiv.innerText = itemObj.name;
    textDiv.className = "hoverable";
    
    rowDiv.addEventListener("click", () => {
        handleItemClick(itemObj, rowDiv, path);
        if(currentCategory !== sectionKey) {
            switchCategory(sectionKey, null, false); 
        }
    });

    rowDiv.appendChild(boxDiv);
    rowDiv.appendChild(textDiv);
    return rowDiv;
}

// ==========================================
// UPDATE 2: HANDLE CLICK (Toggles CSS Class)
// ==========================================
function handleItemClick(itemObj, clickedRow, basePath) {
    // 1. Setup Visuals (Active State)
    document.body.classList.add('layout-active');
    
    // Reset all checkboxes by removing the 'checked' class
    const allBoxes = listContainer.querySelectorAll(".checkbox-icon");
    allBoxes.forEach(b => b.classList.remove("checked"));
    
    // Check the clicked one
    const checkbox = clickedRow.querySelector(".checkbox-icon");
    if(checkbox) checkbox.classList.add("checked");

    // 2. Determine Target URL
    let targetSrc = "";
    let isExternal = false;

    if (itemObj.type === "url") {
        isExternal = true;
        let cleanUrl = itemObj.url;
        if(cleanUrl.includes("/edit") || cleanUrl.includes("/view")) {
            cleanUrl = cleanUrl.replace(/\/edit.*$/, "/preview").replace(/\/view.*$/, "/preview");
        }
        targetSrc = cleanUrl;
    } else {
        targetSrc = `${basePath}${itemObj.name}.html`;
    }

    // 3. FILE EXISTENCE CHECK
    if (isExternal) {
        startAnimation(() => { mainFrame.src = targetSrc; });
    } else {
        fetch(targetSrc, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    startAnimation(() => { mainFrame.src = targetSrc; });
                } else {
                    triggerErrorEffect(clickedRow);
                    loadWIPScreen();
                }
            })
            .catch(error => {
                triggerErrorEffect(clickedRow);
                loadWIPScreen();
            });
    }
}

// Helper: Triggers the Red Text & Aggressive Shake
function triggerErrorEffect(rowElement) {
    const container = document.querySelector('.container'); // The menu box
    
    // Add Classes
    rowElement.classList.add('text-error');
    container.classList.add('shake-aggressive');

    // Remove Classes after 0.5s
    setTimeout(() => {
        rowElement.classList.remove('text-error');
        container.classList.remove('shake-aggressive');
    }, 500);
}

// Helper: Loads the "Work In Progress" screen into the iframe
function loadWIPScreen() {
    startAnimation(() => {
        // We inject HTML directly into the iframe using 'data:text/html'
        // This creates a valid page without needing a separate WIP.html file
        const wipHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <style>
                @font-face { font-family: "Nitw"; src: url('../../Nitw.otf'); }
                body {
                    background: #fff; color: #303030; font-family: "Nitw", sans-serif;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    height: 100vh; margin: 0; text-align: center;
                }
                .box {
                    border: 2px solid #000; padding: 2rem;
                    border-radius: 2px 5px 3px 25px / 25px 3px 5px 2px;
                    animation: jitter 0.2s steps(2) infinite;
                }
                h1 { font-size: 2rem; margin: 0; }
                p { margin-top: 0.5rem; opacity: 0.7; }
                @keyframes jitter {
                    0% { transform: translate(0,0); }
                    50% { transform: translate(1px, 1px); }
                    100% { transform: translate(-1px, -1px); }
                }
            </style>
            </head>
            <body>
                <div class="box">
                    <h1>WORK IN PROGRESS</h1>
                    <p>This file has not been linked yet.</p>
                </div>
            </body>
            </html>
        `;
        mainFrame.src = "data:text/html;charset=utf-8," + encodeURIComponent(wipHTML);
    });
}

function startAnimation(cb) {
    showcaseWindow.classList.remove("showcase_border-switched");
    showcaseWindow.classList.add("retract-animation"); 
    setTimeout(() => {
        if (cb) cb();
        showcaseWindow.classList.remove("retract-animation");
        showcaseWindow.classList.add("showcase_border-switched");
    }, 500); 
}

init();