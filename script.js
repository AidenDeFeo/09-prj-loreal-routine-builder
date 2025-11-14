/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  if (products.length === 0) {
    productsContainer.innerHTML = `
      <div class="placeholder-message">
        No products found for this category
      </div>
    `;
    return;
  }

  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-info">
        <div class="product-brand">${product.brand}</div>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-actions">
          <button class="details-btn" onclick="toggleDescription(${product.id})">
            <i class="fa-solid fa-info-circle"></i> Details
          </button>
          <button class="add-product-btn" onclick="toggleProductSelection(${product.id})">
            <i class="fa-solid fa-plus"></i> Add
          </button>
        </div>
        <p class="product-description" id="desc-${product.id}" style="display: none;">${product.description}</p>
      </div>
    </div>
  `
    )
    .join("");

  // Update visual states for already selected products
  updateProductVisualStates();
}

/* Toggle product description visibility */
function toggleDescription(productId) {
  const descElement = document.getElementById(`desc-${productId}`);
  const detailsBtn = document.querySelector(
    `[data-product-id="${productId}"] .details-btn`
  );

  if (
    descElement.style.display === "none" ||
    descElement.style.display === ""
  ) {
    descElement.style.display = "block";
    detailsBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Hide';
  } else {
    descElement.style.display = "none";
    detailsBtn.innerHTML = '<i class="fa-solid fa-info-circle"></i> Details';
  }
}

/* Update visual states for selected products */
function updateProductVisualStates() {
  selectedProducts.forEach((selectedProduct) => {
    const productCard = document.querySelector(
      `[data-product-id="${selectedProduct.id}"]`
    );
    if (productCard) {
      productCard.classList.add("selected");

      const addBtn = productCard.querySelector(".add-product-btn");
      if (addBtn) {
        addBtn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
        addBtn.classList.add("added");
      }
    }
  });
}

/* Store selected products */
let selectedProducts = [];

/* Current filter state */
let currentFilters = {
  category: "",
  search: "",
};

/* Conversation history and user profile tracking */
let conversationHistory = [];
let userProfile = {
  name: null,
  preferences: [],
  skinType: null,
  concerns: [],
  selectedProducts: [],
  sessionStarted: null,
  totalMessages: 0,
};

/* Load conversation history from localStorage */
function loadConversationHistory() {
  try {
    const savedHistory = localStorage.getItem("lorealChatHistory");
    const savedProfile = localStorage.getItem("lorealUserProfile");

    if (savedHistory) {
      conversationHistory = JSON.parse(savedHistory);
    }

    if (savedProfile) {
      userProfile = { ...userProfile, ...JSON.parse(savedProfile) };
    }
  } catch (error) {
    console.log("No previous conversation history found");
  }
}

/* Save conversation history to localStorage */
function saveConversationHistory() {
  try {
    // Keep only last 50 messages to prevent localStorage overflow
    const recentHistory = conversationHistory.slice(-50);
    localStorage.setItem("lorealChatHistory", JSON.stringify(recentHistory));
    localStorage.setItem("lorealUserProfile", JSON.stringify(userProfile));
  } catch (error) {
    console.warn("Could not save conversation history:", error);
  }
}

/* Clear conversation history */
function clearConversationHistory() {
  conversationHistory = [];
  userProfile = {
    name: null,
    preferences: [],
    skinType: null,
    concerns: [],
    selectedProducts: [],
    sessionStarted: null,
    totalMessages: 0,
  };
  localStorage.removeItem("lorealChatHistory");
  localStorage.removeItem("lorealUserProfile");
}

/* Clear conversation and restart chat */
function clearConversationAndRestart() {
  if (
    confirm(
      "Are you sure you want to clear the conversation history? This will remove all previous messages and start fresh."
    )
  ) {
    clearConversationHistory();

    // Clear chat window
    const chatWindow = document.getElementById("chatWindow");
    chatWindow.innerHTML = "";

    // Reset input placeholder
    const userInput = document.getElementById("userInput");
    if (userInput) {
      userInput.placeholder = "Ask me about products or routines…";
    }

    // Restart with name request
    askForUserName();
  }
}

/* Toggle language direction between LTR and RTL */
function toggleLanguageDirection() {
  const html = document.documentElement;
  const currentDir = html.getAttribute("dir");
  const newDir = currentDir === "rtl" ? "ltr" : "rtl";

  setLanguageDirection(newDir);
}

/* Set language direction and update UI */
function setLanguageDirection(direction) {
  const html = document.documentElement;
  const languageText = document.getElementById("languageText");

  html.setAttribute("dir", direction);
  html.setAttribute("lang", direction === "rtl" ? "ar" : "en");

  // Update language button text
  if (languageText) {
    languageText.textContent = direction === "rtl" ? "English" : "عربي";
  }

  // Update input placeholders for RTL
  updatePlaceholdersForDirection(direction);

  // Save language preference
  localStorage.setItem("languageDirection", direction);
}

/* Update input placeholders based on language direction */
function updatePlaceholdersForDirection(direction) {
  const productSearch = document.getElementById("productSearch");
  const userInput = document.getElementById("userInput");

  if (direction === "rtl") {
    if (productSearch) {
      productSearch.placeholder =
        "ابحث عن المنتجات بالاسم أو الكلمة المفتاحية...";
    }
    if (userInput) {
      const userName = userProfile.name || "";
      userInput.placeholder = `اسألني عن المنتجات أو الروتين${
        userName ? "، " + userName : ""
      }…`;
    }
  } else {
    if (productSearch) {
      productSearch.placeholder = "Search products by name or keyword...";
    }
    if (userInput) {
      const userName = userProfile.name || "";
      userInput.placeholder = `Ask me about products or routines${
        userName ? ", " + userName : ""
      }…`;
    }
  }
}

/* Load selected products from localStorage */
function loadSelectedProducts() {
  try {
    const savedProducts = localStorage.getItem("lorealSelectedProducts");
    if (savedProducts) {
      selectedProducts = JSON.parse(savedProducts);
      updateSelectedProductsDisplay();
      // Update visual states for products that are displayed
      updateProductVisualStates();
    }
  } catch (error) {
    console.warn("Could not load selected products:", error);
    selectedProducts = [];
  }
}

/* Save selected products to localStorage */
function saveSelectedProducts() {
  try {
    localStorage.setItem(
      "lorealSelectedProducts",
      JSON.stringify(selectedProducts)
    );
  } catch (error) {
    console.warn("Could not save selected products:", error);
  }
}

/* Clear all selected products */
function clearAllSelectedProducts() {
  if (selectedProducts.length === 0) {
    return;
  }

  if (confirm("Are you sure you want to remove all selected products?")) {
    // Remove visual selection states from all product tiles
    selectedProducts.forEach((product) => {
      const productCard = document.querySelector(
        `[data-product-id="${product.id}"]`
      );
      if (productCard) {
        productCard.classList.remove("selected");
        const addBtn = productCard.querySelector(".add-product-btn");
        if (addBtn) {
          addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add';
          addBtn.classList.remove("added");
        }
      }
    });

    // Clear the array and update display
    selectedProducts = [];
    updateSelectedProductsDisplay();
    saveSelectedProducts();

    // Update user profile
    userProfile.selectedProducts = [];
    saveConversationHistory();
  }
}

/* Toggle product selection (add or remove) */
function toggleProductSelection(productId) {
  // Check if product is already selected
  if (selectedProducts.some((p) => p.id === productId)) {
    // Remove from selection
    removeFromSelection(productId);
  } else {
    // Add to selection
    addToSelection(productId);
  }
}

/* Add product to selection */
function addToSelection(productId) {
  // Load products and find the selected one
  loadProducts().then((products) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      selectedProducts.push(product);
      updateSelectedProductsDisplay();
      saveSelectedProducts(); // Save to localStorage

      // Add visual selection state to the tile
      const productCard = document.querySelector(
        `[data-product-id="${productId}"]`
      );
      if (productCard) {
        productCard.classList.add("selected");

        // Update the Add button to show it's added
        const addBtn = productCard.querySelector(".add-product-btn");
        if (addBtn) {
          addBtn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
          addBtn.classList.add("added");
        }
      }

      // Update user profile
      userProfile.selectedProducts = selectedProducts.map((p) => ({
        name: p.name,
        brand: p.brand,
        category: p.category,
      }));
      saveConversationHistory();
    }
  });
}

/* Remove product from selection */
function removeFromSelection(productId) {
  selectedProducts = selectedProducts.filter((p) => p.id !== productId);
  updateSelectedProductsDisplay();
  saveSelectedProducts(); // Save to localStorage

  // Remove visual selection state from the tile
  const productCard = document.querySelector(
    `[data-product-id="${productId}"]`
  );
  if (productCard) {
    productCard.classList.remove("selected");

    // Reset the Add button to original state
    const addBtn = productCard.querySelector(".add-product-btn");
    if (addBtn) {
      addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add';
      addBtn.classList.remove("added");
    }
  }

  // Update user profile
  userProfile.selectedProducts = selectedProducts.map((p) => ({
    name: p.name,
    brand: p.brand,
    category: p.category,
  }));
  saveConversationHistory();
}

/* Update the selected products display */
function updateSelectedProductsDisplay() {
  const selectedProductsList = document.getElementById("selectedProductsList");

  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML = `
      <p class="no-products">No products selected yet. Choose products from the categories above.</p>
    `;
    return;
  }

  const productsHtml = selectedProducts
    .map(
      (product) => `
      <div class="selected-product-item">
        <img src="${product.image}" alt="${product.name}">
        <div class="selected-product-info">
          <span class="selected-product-name">${product.name}</span>
          <span class="selected-product-brand">${product.brand}</span>
        </div>
        <button class="remove-btn" onclick="removeFromSelection(${product.id})" title="Remove ${product.name}">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
    `
    )
    .join("");

  const clearAllButton =
    selectedProducts.length > 1
      ? `
    <div class="selected-products-actions">
      <button class="clear-all-btn" onclick="clearAllSelectedProducts()" title="Remove all selected products">
        <i class="fa-solid fa-trash-can"></i> Clear All (${selectedProducts.length})
      </button>
    </div>
  `
      : "";

  selectedProductsList.innerHTML = productsHtml + clearAllButton;
}

/* Combined filtering function for category and search */
async function filterAndDisplayProducts() {
  const products = await loadProducts();
  let filteredProducts = products;

  // Apply category filter
  if (currentFilters.category) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === currentFilters.category
    );
  }

  // Apply search filter
  if (currentFilters.search) {
    const searchTerm = currentFilters.search.toLowerCase();
    filteredProducts = filteredProducts.filter((product) => {
      return (
        product.name.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
      );
    });
  }

  displayProducts(filteredProducts);

  // Update search results info
  updateSearchResultsInfo(filteredProducts.length, products.length);
}

/* Update search results information */
function updateSearchResultsInfo(filteredCount, totalCount) {
  let existingInfo = document.getElementById("search-results-info");

  if (filteredCount === totalCount) {
    // Remove info if showing all products
    if (existingInfo) {
      existingInfo.remove();
    }
    return;
  }

  const infoText = `Showing ${filteredCount} of ${totalCount} products`;

  if (existingInfo) {
    existingInfo.textContent = infoText;
  } else {
    const productsContainer = document.getElementById("productsContainer");
    const infoElement = document.createElement("div");
    infoElement.id = "search-results-info";
    infoElement.className = "search-results-info";
    infoElement.textContent = infoText;
    productsContainer.parentNode.insertBefore(infoElement, productsContainer);
  }
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  currentFilters.category = e.target.value;
  await filterAndDisplayProducts();
});

/* Get user's name for personalized conversation */
function askForUserName() {
  const chatWindow = document.getElementById("chatWindow");

  if (!userProfile.name) {
    chatWindow.innerHTML = `
      <div class="chat-message ai-message">
        <div class="message-avatar">
          <i class="fa-solid fa-sparkles"></i>
        </div>
        <div class="message-bubble">
          <div class="message-sender">L'Oréal Beauty Expert</div>
          Hello! I'm your L'Oréal beauty expert. What's your name so I can provide you with personalized beauty advice?
          <div class="name-input-container">
            <input type="text" id="nameInput" placeholder="Enter your name..." maxlength="30">
            <button onclick="setUserName()" class="name-submit-btn">
              <i class="fa-solid fa-check"></i> Continue
            </button>
          </div>
        </div>
      </div>
    `;

    // Focus on name input
    setTimeout(() => {
      const nameInput = document.getElementById("nameInput");
      if (nameInput) {
        nameInput.focus();
        nameInput.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            setUserName();
          }
        });
      }
    }, 100);
  }
}

/* Set user name and update profile */
function setUserName() {
  const nameInput = document.getElementById("nameInput");
  const name = nameInput?.value.trim();

  if (name && name.length > 0) {
    userProfile.name = name;

    // Add to conversation history
    conversationHistory.push({
      role: "user",
      content: `My name is ${name}`,
      timestamp: new Date().toISOString(),
      context: "name_introduction",
    });

    conversationHistory.push({
      role: "assistant",
      content: `Nice to meet you, ${name}! I'm here to help you discover the perfect L'Oréal products and create personalized beauty routines. Feel free to ask me about skincare, makeup, haircare, or any beauty concerns you might have.`,
      timestamp: new Date().toISOString(),
      context: "welcome_message",
    });

    // Update chat display
    const chatWindow = document.getElementById("chatWindow");
    chatWindow.innerHTML = `
      <div class="chat-message ai-message">
        <div class="message-avatar">
          <i class="fa-solid fa-sparkles"></i>
        </div>
        <div class="message-bubble">
          <div class="message-sender">L'Oréal Beauty Expert</div>
          Nice to meet you, ${name}! I'm here to help you discover the perfect L'Oréal products and create personalized beauty routines. Feel free to ask me about skincare, makeup, haircare, or any beauty concerns you might have.
        </div>
      </div>
    `;

    // Update chat placeholder
    const userInput = document.getElementById("userInput");
    if (userInput) {
      userInput.placeholder = `Ask me about products or routines, ${name}…`;
    }
  } else {
    // Show error for empty name
    nameInput.style.borderColor = "#ff4444";
    nameInput.placeholder = "Please enter your name";
  }
}

/* Extract user preferences and concerns from conversation */
function extractUserContext(message) {
  const lowerMessage = message.toLowerCase();

  // Extract skin type mentions
  const skinTypes = [
    "oily",
    "dry",
    "combination",
    "sensitive",
    "normal",
    "mature",
  ];
  skinTypes.forEach((type) => {
    if (lowerMessage.includes(type) && !userProfile.skinType) {
      userProfile.skinType = type;
    }
  });

  // Extract beauty concerns
  const concerns = [
    "acne",
    "wrinkles",
    "fine lines",
    "dark spots",
    "dullness",
    "pores",
    "aging",
    "hydration",
    "brightening",
    "firming",
  ];
  concerns.forEach((concern) => {
    if (
      lowerMessage.includes(concern) &&
      !userProfile.concerns.includes(concern)
    ) {
      userProfile.concerns.push(concern);
    }
  });

  // Update selected products in profile
  userProfile.selectedProducts = selectedProducts.map((p) => ({
    name: p.name,
    brand: p.brand,
    category: p.category,
  }));
}

/* Restore conversation history and display previous messages */
function restoreConversationDisplay() {
  const chatWindow = document.getElementById("chatWindow");

  if (conversationHistory.length > 0) {
    // Display recent conversation history (last 10 messages)
    const recentMessages = conversationHistory.slice(-10);

    chatWindow.innerHTML = recentMessages
      .map((msg) => {
        if (msg.context === "name_introduction") return ""; // Skip name introduction

        if (msg.role === "user") {
          const userInitials = userProfile.name
            ? userProfile.name.charAt(0).toUpperCase()
            : "U";
          return `
          <div class="chat-message user-message">
            <div class="message-avatar">${userInitials}</div>
            <div class="message-bubble">
              <div class="message-sender">${userProfile.name || "You"}</div>
              ${msg.content.replace(`My name is ${userProfile.name}`, "")}
            </div>
          </div>
        `;
        } else {
          return `
          <div class="chat-message ai-message">
            <div class="message-avatar"><i class="fa-solid fa-sparkles"></i></div>
            <div class="message-bubble">
              <div class="message-sender">L'Oréal Beauty Expert</div>
              ${msg.content}
              ${
                msg.context === "routine_generation"
                  ? '<div class="routine-content">' + msg.content + "</div>"
                  : ""
              }
            </div>
          </div>
        `;
        }
      })
      .filter((html) => html !== "")
      .join("");

    // Add welcome back message for returning users
    if (userProfile.name && userProfile.totalMessages > 0) {
      chatWindow.innerHTML += `
        <div class="chat-message ai-message">
          <div class="message-avatar"><i class="fa-solid fa-sparkles"></i></div>
          <div class="message-bubble">
            <div class="message-sender">L'Oréal Beauty Expert</div>
            Welcome back, ${
              userProfile.name
            }! I remember our previous conversations about your ${
        userProfile.skinType ? userProfile.skinType + " skin" : "beauty needs"
      }${
        userProfile.concerns.length > 0
          ? " and concerns with " +
            userProfile.concerns.slice(0, 2).join(" and ")
          : ""
      }. How can I help you today?
          </div>
        </div>
      `;
    }

    // Scroll to bottom
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
}

/* Initialize the selected products display on page load */
document.addEventListener("DOMContentLoaded", () => {
  // Load selected products first
  loadSelectedProducts();

  // Load previous conversation history
  loadConversationHistory();

  // Set session start time if new session
  if (!userProfile.sessionStarted) {
    userProfile.sessionStarted = new Date().toISOString();
  }

  // Initialize search filters
  currentFilters = {
    category: "",
    search: "",
  };

  // Initialize chat - either restore history or ask for name
  if (userProfile.name && conversationHistory.length > 0) {
    restoreConversationDisplay();
    // Update chat placeholder with user's name
    const userInput = document.getElementById("userInput");
    if (userInput) {
      userInput.placeholder = `Ask me about products or routines, ${userProfile.name}…`;
    }
  } else {
    askForUserName();
  }

  // Add event listener for Generate Routine button
  const generateBtn = document.getElementById("generateRoutine");
  if (generateBtn) {
    generateBtn.addEventListener("click", generatePersonalizedRoutine);
  }

  // Add event listener for Clear Chat button
  const clearChatBtn = document.getElementById("clearChatBtn");
  if (clearChatBtn) {
    clearChatBtn.addEventListener("click", clearConversationAndRestart);
  }

  // Add event listener for language toggle
  const languageToggle = document.getElementById("languageToggle");
  const languageText = document.getElementById("languageText");

  if (languageToggle) {
    languageToggle.addEventListener("click", toggleLanguageDirection);

    // Load saved language preference
    const savedDirection = localStorage.getItem("languageDirection") || "ltr";
    setLanguageDirection(savedDirection);
  }

  // Add event listeners for product search
  const productSearch = document.getElementById("productSearch");
  const clearSearchBtn = document.getElementById("clearSearch");
  const searchContainer = document.querySelector(".search-input-container");

  if (productSearch) {
    // Real-time search as user types
    productSearch.addEventListener("input", async (e) => {
      currentFilters.search = e.target.value.trim();

      // Show/hide clear button
      if (currentFilters.search) {
        searchContainer.classList.add("has-text");
      } else {
        searchContainer.classList.remove("has-text");
      }

      // Debounce search to avoid too many calls
      clearTimeout(productSearch.searchTimeout);
      productSearch.searchTimeout = setTimeout(() => {
        filterAndDisplayProducts();
      }, 300);
    });

    // Handle Enter key
    productSearch.addEventListener("keypress", async (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        clearTimeout(productSearch.searchTimeout);
        await filterAndDisplayProducts();
      }
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", async () => {
      productSearch.value = "";
      currentFilters.search = "";
      searchContainer.classList.remove("has-text");
      await filterAndDisplayProducts();
      productSearch.focus();
    });
  }
});

/* Generate personalized routine using selected products */
async function generatePersonalizedRoutine() {
  const generateBtn = document.getElementById("generateRoutine");
  const chatWindow = document.getElementById("chatWindow");

  // Check if any products are selected
  if (selectedProducts.length === 0) {
    chatWindow.innerHTML = `
      <div class="chat-message ai-message">
        <div class="message-avatar">
          <i class="fa-solid fa-info-circle"></i>
        </div>
        <div class="message-bubble">
          <div class="message-sender">L'Oréal Beauty Expert</div>
          Please select some products first to generate a personalized routine!
        </div>
      </div>
    `;
    return;
  }

  // Show loading state
  generateBtn.disabled = true;
  generateBtn.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Generating Routine...';

  chatWindow.innerHTML = `
    <div class="chat-message ai-message">
      <div class="message-avatar">
        <i class="fa-solid fa-sparkles"></i>
      </div>
      <div class="message-bubble">
        <div class="message-sender">L'Oréal Beauty Expert</div>
        Analyzing your selected products and creating a personalized routine<div class="loading-dots"><span></span><span></span><span></span></div>
      </div>
    </div>
  `;

  try {
    // Prepare product data for the API
    const productData = selectedProducts.map((product) => ({
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description,
    }));

    // Call OpenAI API
    const routine = await callOpenAIForRoutine(productData);

    // Add routine response to conversation history
    conversationHistory.push({
      role: "assistant",
      content: routine,
      timestamp: new Date().toISOString(),
      context: "routine_generation",
      messageId: Date.now() + Math.random(),
      products: productData,
    });

    // Save conversation history
    saveConversationHistory();

    // Display the generated routine
    const displayMessage = userProfile.name
      ? `Here's your personalized beauty routine, ${userProfile.name}, based on your selected products:`
      : "Here's your personalized beauty routine based on your selected products:";

    chatWindow.innerHTML = `
      <div class="chat-message ai-message">
        <div class="message-avatar">
          <i class="fa-solid fa-sparkles"></i>
        </div>
        <div class="message-bubble">
          <div class="message-sender">L'Oréal Beauty Expert</div>
          ${displayMessage}
          <div class="routine-content">${routine}</div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error generating routine:", error);
    chatWindow.innerHTML = `
      <div class="chat-message ai-message error">
        <div class="message-avatar">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div class="message-bubble">
          <div class="message-sender">L'Oréal Beauty Expert</div>
          Sorry, I encountered an error while generating your routine. Please make sure your OpenAI API key is configured and try again.
          <br><br>Error: ${error.message}
        </div>
      </div>
    `;
  } finally {
    // Reset button state
    generateBtn.disabled = false;
    generateBtn.innerHTML =
      '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Routine';
  }
}

/* Call OpenAI API to generate routine (local testing) */
async function callOpenAIForRoutine(productData) {
  // Check if API key is available
  if (typeof OPENAI_API_KEY === "undefined") {
    throw new Error(
      "OpenAI API key not found. Please add your API key to secrets.js"
    );
  }

  // Build user context for routine generation
  let userContext = "";
  if (userProfile.name) {
    userContext += `User's name: ${userProfile.name}\n`;
  }
  if (userProfile.skinType) {
    userContext += `Skin type: ${userProfile.skinType}\n`;
  }
  if (userProfile.concerns.length > 0) {
    userContext += `Beauty concerns: ${userProfile.concerns.join(", ")}\n`;
  }

  // Add routine generation to conversation history
  conversationHistory.push({
    role: "user",
    content: `Generate personalized routine with selected products`,
    timestamp: new Date().toISOString(),
    context: "routine_generation",
    products: productData,
    messageId: Date.now() + Math.random(),
  });

  const messages = [
    {
      role: "system",
      content: `You are a L'Oréal beauty and skincare expert. I only provide advice about L'Oréal products, beauty routines, skincare, makeup, and haircare topics. If asked about anything unrelated to beauty, skincare, makeup, haircare, or L'Oréal products, I will politely decline and redirect the conversation back to beauty topics where I can best help you. Create personalized L'Oréal beauty routines based on the products provided, drawing on L'Oréal's expertise and innovation in beauty. Format your response using bullet points (•) and numbered lists (1., 2., 3.) instead of markdown symbols like # or *. Use clear, simple formatting that's easy to read in a web browser.\n\n${
        userContext ? `User Context:\n${userContext}` : ""
      }

Personalize the routine based on the user's profile and previous conversations.`,
    },
    {
      role: "user",
      content: `${
        userProfile.name ? `Hi, this is ${userProfile.name}. ` : ""
      }Please create a personalized beauty routine using these products: ${JSON.stringify(
        productData,
        null,
        2
      )}. 

Please format your response with:
• Bullet points for lists and tips
• Numbers (1., 2., 3.) for step-by-step instructions
• Clear section breaks with simple text headings
• NO markdown symbols like # or *

Include:
• Morning routine (if applicable)
• Evening routine (if applicable) 
• Application order and timing
• Important tips or precautions
• How often to use each product

Make it comprehensive but easy to follow with clear formatting.`,
    },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `OpenAI API Error: ${errorData.error?.message || "Unknown error"}`
    );
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/* Chat form submission handler - for general questions */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userInput = document.getElementById("userInput");
  const chatWindow = document.getElementById("chatWindow");
  const userMessage = userInput.value.trim();

  if (!userMessage) return;

  // Check if user name is set, if not ask for it first
  if (!userProfile.name) {
    askForUserName();
    return;
  }

  // Extract user context from message
  extractUserContext(userMessage);

  // Add user message to conversation history
  conversationHistory.push({
    role: "user",
    content: userMessage,
    timestamp: new Date().toISOString(),
    context: "general_chat",
    messageId: Date.now() + Math.random(), // Unique ID for message
  });

  // Display user message with name
  const displayName = userProfile.name || "You";
  const userInitials = userProfile.name
    ? userProfile.name.charAt(0).toUpperCase()
    : "U";
  chatWindow.innerHTML += `
    <div class="chat-message user-message">
      <div class="message-avatar">
        ${userInitials}
      </div>
      <div class="message-bubble">
        <div class="message-sender">${displayName}</div>
        ${userMessage}
      </div>
    </div>
  `;

  // Clear input
  userInput.value = "";

  // Show loading
  chatWindow.innerHTML += `
    <div class="chat-message ai-message" id="loading-message">
      <div class="message-avatar">
        <i class="fa-solid fa-sparkles"></i>
      </div>
      <div class="message-bubble">
        <div class="message-sender">L'Oréal Beauty Expert</div>
        Thinking<div class="loading-dots"><span></span><span></span><span></span></div>
      </div>
    </div>
  `;

  try {
    // Call OpenAI for general chat with conversation history
    const response = await callOpenAIForChat(userMessage);

    // Add AI response to conversation history
    conversationHistory.push({
      role: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
      context: "general_chat",
      messageId: Date.now() + Math.random(),
    });

    // Save conversation history after each exchange
    saveConversationHistory();

    // Remove loading message
    document.getElementById("loading-message").remove();

    // Display AI response
    chatWindow.innerHTML += `
      <div class="chat-message ai-message">
        <div class="message-avatar">
          <i class="fa-solid fa-sparkles"></i>
        </div>
        <div class="message-bubble">
          <div class="message-sender">L'Oréal Beauty Expert</div>
          ${response}
        </div>
      </div>
    `;
  } catch (error) {
    // Remove loading message
    document.getElementById("loading-message").remove();

    chatWindow.innerHTML += `
      <div class="chat-message ai-message error">
        <div class="message-avatar">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div class="message-bubble">
          <div class="message-sender">L'Oréal Beauty Expert</div>
          Sorry, I encountered an error. Please make sure your OpenAI API key is configured.
          <br><br>Error: ${error.message}
        </div>
      </div>
    `;
  }

  // Scroll to bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

/* Call OpenAI API for general chat (local testing) */
async function callOpenAIForChat(userMessage) {
  if (typeof OPENAI_API_KEY === "undefined") {
    throw new Error(
      "OpenAI API key not found. Please add your API key to secrets.js"
    );
  }

  // Build context from user profile and conversation history
  let userContext = "";
  if (userProfile.name) {
    userContext += `User's name: ${userProfile.name}\n`;
  }
  if (userProfile.skinType) {
    userContext += `Skin type: ${userProfile.skinType}\n`;
  }
  if (userProfile.concerns.length > 0) {
    userContext += `Beauty concerns: ${userProfile.concerns.join(", ")}\n`;
  }
  if (userProfile.selectedProducts.length > 0) {
    userContext += `Currently selected products: ${userProfile.selectedProducts
      .map((p) => p.name)
      .join(", ")}\n`;
  }
  if (userProfile.age) {
    userContext += `Age: ${userProfile.age}\n`;
  }
  if (userProfile.totalMessages > 5) {
    userContext += `This is a returning user with ${userProfile.totalMessages} previous messages. Reference previous conversations when relevant.\n`;
  }

  const messages = [
    {
      role: "system",
      content: `You are a L'Oréal beauty and skincare expert assistant. I only provide advice about L'Oréal products, beauty routines, skincare, makeup, and haircare topics. If you ask me about anything unrelated to beauty, skincare, makeup, haircare, or L'Oréal products, I will politely decline and redirect our conversation back to beauty topics where I can best help you. I provide helpful advice about L'Oréal beauty products, routines, and skincare with the expertise and quality you expect from L'Oréal. Format responses using bullet points (•) and numbered lists (1., 2., 3.) instead of markdown symbols like # or *. Keep responses concise but informative and easy to read while maintaining L'Oréal's commitment to beauty excellence.\n\n${
        userContext ? `User Context:\n${userContext}` : ""
      }

Remember previous conversations and refer to the user by name when appropriate. Build upon previous discussions about their beauty needs and preferences.`,
    },
  ];

  // Add recent conversation history (last 8 messages to keep context manageable)
  const recentHistory = conversationHistory.slice(-8);
  messages.push(
    ...recentHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))
  );

  // Add current message
  messages.push({
    role: "user",
    content: `${userMessage}\n\nPlease format your response with bullet points (•) and numbers (1., 2., 3.) for easy reading. Avoid using markdown symbols like # or *.`,
  });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `OpenAI API Error: ${errorData.error?.message || "Unknown error"}`
    );
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
