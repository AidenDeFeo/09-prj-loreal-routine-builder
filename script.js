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
  const detailsBtn = document.querySelector(`[data-product-id="${productId}"] .details-btn`);
  
  if (descElement.style.display === 'none' || descElement.style.display === '') {
    descElement.style.display = 'block';
    detailsBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Hide';
  } else {
    descElement.style.display = 'none';
    detailsBtn.innerHTML = '<i class="fa-solid fa-info-circle"></i> Details';
  }
}

/* Update visual states for selected products */
function updateProductVisualStates() {
  selectedProducts.forEach(selectedProduct => {
    const productCard = document.querySelector(`[data-product-id="${selectedProduct.id}"]`);
    if (productCard) {
      productCard.classList.add('selected');
      
      const addBtn = productCard.querySelector('.add-product-btn');
      if (addBtn) {
        addBtn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
        addBtn.classList.add('added');
      }
    }
  });
}

/* Store selected products */
let selectedProducts = [];

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
      
      // Add visual selection state to the tile
      const productCard = document.querySelector(`[data-product-id="${productId}"]`);
      if (productCard) {
        productCard.classList.add('selected');
        
        // Update the Add button to show it's added
        const addBtn = productCard.querySelector('.add-product-btn');
        if (addBtn) {
          addBtn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
          addBtn.classList.add('added');
        }
      }
    }
  });
}

/* Remove product from selection */
function removeFromSelection(productId) {
  selectedProducts = selectedProducts.filter((p) => p.id !== productId);
  updateSelectedProductsDisplay();
  
  // Remove visual selection state from the tile
  const productCard = document.querySelector(`[data-product-id="${productId}"]`);
  if (productCard) {
    productCard.classList.remove('selected');
    
    // Reset the Add button to original state
    const addBtn = productCard.querySelector('.add-product-btn');
    if (addBtn) {
      addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add';
      addBtn.classList.remove('added');
    }
  }
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

  selectedProductsList.innerHTML = selectedProducts
    .map(
      (product) => `
      <div class="selected-product-item">
        <img src="${product.image}" alt="${product.name}">
        <div class="selected-product-info">
          <span class="selected-product-name">${product.name}</span>
          <span class="selected-product-brand">${product.brand}</span>
        </div>
        <button class="remove-btn" onclick="removeFromSelection(${product.id})">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
    `
    )
    .join("");
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;

  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  displayProducts(filteredProducts);
});

/* Initialize the selected products display on page load */
document.addEventListener("DOMContentLoaded", () => {
  updateSelectedProductsDisplay();
  
  // Add event listener for Generate Routine button
  const generateBtn = document.getElementById('generateRoutine');
  if (generateBtn) {
    generateBtn.addEventListener('click', generatePersonalizedRoutine);
  }
});

/* Generate personalized routine using selected products */
async function generatePersonalizedRoutine() {
  const generateBtn = document.getElementById('generateRoutine');
  const chatWindow = document.getElementById('chatWindow');
  
  // Check if any products are selected
  if (selectedProducts.length === 0) {
    chatWindow.innerHTML = `
      <div class="chat-message ai-message">
        <strong>AI Assistant:</strong> Please select some products first to generate a personalized routine!
      </div>
    `;
    return;
  }
  
  // Show loading state
  generateBtn.disabled = true;
  generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating Routine...';
  
  chatWindow.innerHTML = `
    <div class="chat-message ai-message">
      <strong>AI Assistant:</strong> Analyzing your selected products and creating a personalized routine...
    </div>
  `;
  
  try {
    // Prepare product data for the API
    const productData = selectedProducts.map(product => ({
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description
    }));
    
    // Call OpenAI API
    const routine = await callOpenAIForRoutine(productData);
    
    // Display the generated routine
    chatWindow.innerHTML = `
      <div class="chat-message ai-message">
        <strong>AI Assistant:</strong> Here's your personalized beauty routine based on your selected products:
        <div class="routine-content">${routine}</div>
      </div>
    `;
    
  } catch (error) {
    console.error('Error generating routine:', error);
    chatWindow.innerHTML = `
      <div class="chat-message ai-message error">
        <strong>AI Assistant:</strong> Sorry, I encountered an error while generating your routine. Please make sure your OpenAI API key is configured and try again.
        <br><br>Error: ${error.message}
      </div>
    `;
  } finally {
    // Reset button state
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Routine';
  }
}

/* Call secure Netlify function to generate routine */
async function callOpenAIForRoutine(productData) {
  const response = await fetch('/.netlify/functions/generate-routine', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      productData: productData
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate routine');
  }
  
  const data = await response.json();
  return data.routine;
}

/* Chat form submission handler - for general questions */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const userInput = document.getElementById('userInput');
  const chatWindow = document.getElementById('chatWindow');
  const userMessage = userInput.value.trim();
  
  if (!userMessage) return;
  
  // Display user message
  chatWindow.innerHTML += `
    <div class="chat-message user-message">
      <strong>You:</strong> ${userMessage}
    </div>
  `;
  
  // Clear input
  userInput.value = '';
  
  // Show loading
  chatWindow.innerHTML += `
    <div class="chat-message ai-message" id="loading-message">
      <strong>AI Assistant:</strong> <i class="fa-solid fa-spinner fa-spin"></i> Thinking...
    </div>
  `;
  
  try {
    // Call OpenAI for general chat
    const response = await callOpenAIForChat(userMessage);
    
    // Remove loading message
    document.getElementById('loading-message').remove();
    
    // Display AI response
    chatWindow.innerHTML += `
      <div class="chat-message ai-message">
        <strong>AI Assistant:</strong> ${response}
      </div>
    `;
    
  } catch (error) {
    // Remove loading message
    document.getElementById('loading-message').remove();
    
    chatWindow.innerHTML += `
      <div class="chat-message ai-message error">
        <strong>AI Assistant:</strong> Sorry, I encountered an error. Please make sure your OpenAI API key is configured.
        <br><br>Error: ${error.message}
      </div>
    `;
  }
  
  // Scroll to bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

/* Call secure Netlify function for general chat */
async function callOpenAIForChat(userMessage) {
  const response = await fetch('/.netlify/functions/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: userMessage
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get chat response');
  }
  
  const data = await response.json();
  return data.response;
}
