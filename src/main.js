import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, onSnapshot, serverTimestamp, getDocFromServer } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

let db, auth;

// Load config and initialize
async function initFirebase() {
    try {
        const response = await fetch('firebase-applet-config.json');
        const firebaseConfig = await response.json();

        const app = initializeApp(firebaseConfig);
        db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
        auth = getAuth();
        
        // Try sign in but don't block if it fails (Anonymous auth might be disabled)
        signInAnonymously(auth).then(() => {
            console.log("Firebase Signed In Anonymously");
        }).catch(e => {
            console.warn("Anonymous Auth disabled in console. Browsing as guest.", e.message);
        });
        
        console.log("Firebase Initialized");
    } catch (e) {
        console.error("Firebase Init Failed", e);
    }
}

initFirebase();

const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check
async function testConnection() {
  let attempts = 0;
  while (!db && attempts < 50) {
    await new Promise(r => setTimeout(r, 100));
    attempts++;
  }
  if (!db) {
    console.error("Firebase DB not initialized in time.");
    return;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// DATA CONSTANTS
const SHOPS = [
    {
        id: "shop_001",
        name: "Urban Streetwear Co.",
        logo: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200",
        hero: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200",
        pass: "11"
    },
    {
        id: "shop_002",
        name: "Minimalist Wardrobe",
        logo: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200",
        hero: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200",
        pass: "minimal88"
    },
    {
        id: "shop_003",
        name: "Vintage Vault",
        logo: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=200",
        hero: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200",
        pass: "retro99"
    },
    {
        id: "shop_004",
        name: "Zen Athleisure",
        logo: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=200",
        hero: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200",
        pass: "zen123"
    }
];

const MASTER_KEY = "aneeq_master_99";

const TRANSLATIONS = {
    en: {
        marketplace: "Marketplace",
        trackOrder: "Track Order",
        sellerPortal: "Seller Portal",
        home: "Home",
        heroTitle: "Where Style Meets ",
        heroIdentity: "Identity.",
        heroText: "Welcome to aneeq, the premium marketplace for independent creators and discerning collectors.",
        enterMarketplace: "Enter Marketplace",
        trackMyOrder: "Track My Order",
        curatedExcellence: "Curated Excellence",
        curatedText: "Every shop on our platform is hand-picked for quality and originality.",
        directConnect: "Direct Connect",
        directText: "Request pieces directly from creators through our secure portal.",
        globalVision: "Global Vision",
        globalText: "Wear pieces that aren't available anywhere else in the world.",
        promoTitle: "Own items that tell a story.",
        promoText: "Moving away from fast fashion towards intentional ownership. aneeq connects you to the makers behind the craft.",
        discoverBrands: "Discover Brands",
        independentBrands: "Independent Brands",
        curatedCollections: "Curated collections from unique creators, delivered directly to you.",
        marketplaceFeed: "Marketplace Feed",
        browseProducts: "Browse products from all independent sellers in one place.",
        trackTitle: "Track Order",
        trackText: "Enter your number to see messages from Master.",
        viewStatus: "View Status",
        requestStatus: "My Request Status",
        sellerLogin: "Seller Login",
        storePasskey: "Store Passkey",
        enterDashboard: "Enter Dashboard",
        storeManager: "Store Manager",
        logout: "Logout",
        addNewProduct: "Add New Product",
        productName: "Product Name",
        category: "Category (e.g. Hoodies)",
        price: "Price ($)",
        imageUrl: "Image URL",
        publishProduct: "Publish Product",
        inventory: "Inventory",
        masterLogin: "aneeq Master",
        authorizedOnly: "Authorized access only.",
        verifyIdentity: "Verify Identity",
        commandCenter: "Marketplace Command Center",
        totalLabel: "Total: ",
        systemOnline: "System Online",
        purchaseRequest: "Purchase Request",
        phoneLabel: "Phone Number (e.g. 0770 000 0000)",
        confirmRequest: "Confirm Request",
        toastSent: "Request Sent to Master!",
        noProducts: "No products yet.",
        noItemsMarket: "No items in the marketplace yet.",
        buyNow: "Buy Now",
        backToMarket: "← Back to Marketplace",
        phonePlaceholder: "07XX XXX XXXX",
        noOrdersFound: "No orders found for this number.",
        waitMaster: "Wait for the Master to review your request.",
        messageSent: "Message Sent:",
        removeHistory: "Remove from History",
        masterAction: "MASTER ACTION",
        typeMessage: "Type a message for the customer...",
        acceptRequest: "Accept Request",
        refuseRequest: "Refuse Request",
        accessDenied: "ACCESS_DENIED.",
        wrongKey: "Wrong key.",
        fillFields: "Fill fields",
        delete: "Delete",
        platform: "Platform",
        support: "Support",
        contactUs: "Contact Us",
        terms: "Terms of Service",
        footerText: "Redefining independent retail for the modern age.",
        statusAccepted: "Accepted",
        statusRefused: "Refused",
        phLabel: "PH:",
    },
    ar: {
        marketplace: "المتجر",
        trackOrder: "تتبع الطلب",
        sellerPortal: "بوابة البائع",
        home: "الرئيسية",
        heroTitle: "حيث يلتقي الأسلوب بـ ",
        heroIdentity: "الهوية.",
        heroText: "مرحباً بكم في أنيق، المتجر المميز للمبدعين المستقلين وجامعي القطع الفريدة.",
        enterMarketplace: "دخول المتجر",
        trackMyOrder: "تتبع طلبي",
        curatedExcellence: "تميز منتقى",
        curatedText: "يتم اختيار كل متجر على منصتنا يدوياً لضمان الجودة والأصالة.",
        directConnect: "اتصال مباشر",
        directText: "اطلب القطع مباشرة من المبدعين من خلال بوابتنا الآمنة.",
        globalVision: "رؤية عالمية",
        globalText: "ارتدِ قطعاً لا تتوفر في أي مكان آخر في العالم.",
        promoTitle: "امتلك قطعاً تحكي قصة.",
        promoText: "الابتعاد عن الموضة السريعة نحو الملكية المقصودة. أنيق يربطك بالمبدعين وراء الحرفة.",
        discoverBrands: "اكتشف العلامات التجارية",
        independentBrands: "العلامات التجارية المستقلة",
        curatedCollections: "مجموعات مختارة من مبدعين فريدين، تصل إليك مباشرة.",
        marketplaceFeed: "تغذية المتجر",
        browseProducts: "تصفح المنتجات من جميع البائعين المستقلين في مكان واحد.",
        trackTitle: "تتبع الطلب",
        trackText: "أدخل رقمك لرؤية رسائل الماستر.",
        viewStatus: "عرض الحالة",
        requestStatus: "حالة طلبي",
        sellerLogin: "تسجيل دخول البائع",
        storePasskey: "مفتاح مرور المتجر",
        enterDashboard: "دخول لوحة التحكم",
        storeManager: "مدير المتجر",
        logout: "تسجيل الخروج",
        addNewProduct: "إضافة منتج جديد",
        productName: "اسم المنتج",
        category: "الفئة (مثل: هوديز)",
        price: "السعر ($)",
        imageUrl: "رابط الصورة",
        publishProduct: "نشر المنتج",
        inventory: "المخزون",
        masterLogin: "أنيق ماستر",
        authorizedOnly: "وصول مصرح به فقط.",
        verifyIdentity: "التحقق من الهوية",
        commandCenter: "مركز قيادة المتجر",
        totalLabel: "الإجمالي: ",
        systemOnline: "النظام متصل",
        purchaseRequest: "طلب شراء",
        phoneLabel: "رقم الهاتف (مثال: 0770 000 0000)",
        confirmRequest: "تأكيد الطلب",
        toastSent: "تم إرسال الطلب إلى الماستر!",
        noProducts: "لا توجد منتجات بعد.",
        noItemsMarket: "لا توجد عناصر في المتجر بعد.",
        buyNow: "اشترِ الآن",
        backToMarket: "← العودة إلى المتجر",
        phonePlaceholder: "07XX XXX XXXX",
        noOrdersFound: "لم يتم العثور على طلبات لهذا الرقم.",
        waitMaster: "يرجى انتظار مراجعة الماستر لطلبك.",
        messageSent: "الرسالة المرسلة:",
        removeHistory: "إزالة من السجل",
        masterAction: "إجراء الماستر",
        typeMessage: "اكتب رسالة للزبون...",
        acceptRequest: "قبول الطلب",
        refuseRequest: "رفض الطلب",
        accessDenied: "تم رفض الوصول.",
        wrongKey: "مفتاح خاطئ.",
        fillFields: "املأ الحقول",
        delete: "حذف",
        platform: "المنصة",
        support: "الدعم",
        contactUs: "اتصل بنا",
        terms: "شروط الخدمة",
        footerText: "إعادة تعريف التجزئة المستقلة للعصر الحديث.",
        statusAccepted: "مقبول",
        statusRefused: "مرفوض",
        phLabel: "هاتف:",
    }
};

// STATE
let currentView = "home";
let activeShop = null;
let loggedInShopId = null;
let currentProductToBuy = null;
let currentLang = localStorage.getItem('aneeq_lang') || 'en';
let currentCategory = 'all';

// INIT
document.addEventListener('DOMContentLoaded', async () => {
    setLanguage(currentLang);
    
    // Wait for Firestore to be ready
    let attempts = 0;
    while (!db && attempts < 50) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
    }

    // Check URL hash on load
    const hash = window.location.hash.substring(1);
    if (hash && ['home', 'marketplace', 'track', 'admin', 'master'].includes(hash)) {
        showView(hash);
    } else {
        showView('home');
    }
    setupAdminSelect();
});

// LANGUAGE
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('aneeq_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Update static strings
    updateStaticTranslations();
    
    // Re-render current view components if needed
    if(currentView === 'marketplace') {
        initMarketplace();
        renderProductFeed();
    }
    if(currentView === 'track') handleTrackOrder();
    if(currentView === 'master') renderMasterOrders();
    if(loggedInShopId) renderAdminInventory();
}

function updateStaticTranslations() {
    const t = TRANSLATIONS[currentLang];
    
    // Nav
    const navButtons = document.querySelectorAll('.navbar nav button');
    if(navButtons.length >= 3) {
        navButtons[0].innerText = t.marketplace;
        navButtons[1].innerText = t.trackOrder;
        navButtons[2].innerText = t.sellerPortal;
    }
    
    // Home
    const homeHero = document.querySelector('.home-hero');
    if(homeHero) {
        homeHero.querySelector('h1').innerHTML = `${t.heroTitle} <span class="accent-text">${t.heroIdentity}</span>`;
        homeHero.querySelector('p').innerText = t.heroText;
        homeHero.querySelectorAll('button')[0].innerText = t.enterMarketplace;
        homeHero.querySelectorAll('button')[1].innerText = t.trackMyOrder;
    }
    
    const features = document.querySelectorAll('.feature-card');
    if(features.length >= 3) {
        features[0].querySelector('h3').innerText = t.curatedExcellence;
        features[0].querySelector('p').innerText = t.curatedText;
        features[1].querySelector('h3').innerText = t.directConnect;
        features[1].querySelector('p').innerText = t.directText;
        features[2].querySelector('h3').innerText = t.globalVision;
        features[2].querySelector('p').innerText = t.globalText;
    }
    
    const promo = document.querySelector('.home-promo');
    if(promo) {
        promo.querySelector('h2').innerText = t.promoTitle;
        promo.querySelector('p').innerText = t.promoText;
        promo.querySelector('button').innerText = t.discoverBrands;
    }
    
    // Marketplace
    const mpHero = document.querySelector('#view-marketplace .hero');
    if(mpHero) {
        mpHero.querySelector('h1').innerText = t.independentBrands;
        mpHero.querySelector('p').innerText = t.curatedCollections;
    }
    const mpFeedHeader = document.querySelector('.feed-header');
    if(mpFeedHeader) {
        mpFeedHeader.querySelector('h2').innerText = t.marketplaceFeed;
    }
    
    // Track
    const trackCard = document.querySelector('#view-track .auth-card');
    if(trackCard) {
        trackCard.querySelector('h2').innerText = t.trackTitle;
        trackCard.querySelector('p').innerText = t.trackText;
        trackCard.querySelector('input').placeholder = t.phonePlaceholder;
        trackCard.querySelector('button').innerText = t.viewStatus;
    }
    const trackResults = document.querySelector('#track-results');
    if(trackResults) {
        trackResults.querySelector('h3').innerText = t.requestStatus;
    }
    
    // Seller Admin
    const adminLogin = document.getElementById('admin-login');
    if(adminLogin) {
        adminLogin.querySelector('h2').innerText = t.sellerLogin;
        document.getElementById('admin-pass').placeholder = t.storePasskey;
        adminLogin.querySelector('button').innerText = t.enterDashboard;
    }
    const adminDashboard = document.getElementById('admin-dashboard');
    if(adminDashboard) {
        adminDashboard.querySelector('.btn-outline').innerText = t.logout;
        adminDashboard.querySelectorAll('.cardi h3')[0].innerText = t.addNewProduct;
        document.getElementById('p-name').placeholder = t.productName;
        document.getElementById('p-cat').placeholder = t.category;
        document.getElementById('p-price').placeholder = t.price;
        adminDashboard.querySelector('.admin-form button').innerText = t.publishProduct;
        adminDashboard.querySelectorAll('.cardi h3')[1].innerText = t.inventory;
    }
    
    // Master Admin
    const masterLogin = document.getElementById('master-login');
    if(masterLogin) {
        masterLogin.querySelector('h2').innerText = t.masterLogin;
        masterLogin.querySelector('p').innerText = t.authorizedOnly;
        document.getElementById('master-pass').placeholder = t.verifyIdentity; // Wait, text is "Master Key" originally
        masterLogin.querySelector('button').innerText = t.verifyIdentity;
    }
    const masterDashboard = document.getElementById('master-dashboard');
    if(masterDashboard) {
        masterDashboard.querySelector('h2').innerText = t.commandCenter;
    }
    
    // Modal
    const buyModal = document.querySelector('.modal-content');
    if(buyModal) {
        buyModal.querySelector('h3').innerText = t.purchaseRequest;
        buyModal.querySelector('.modal-hint').innerText = t.phoneLabel;
        document.getElementById('customer-phone').placeholder = t.phoneLabel;
        buyModal.querySelector('.btn-primary').innerText = t.confirmRequest;
    }
    
    // Toast
    document.getElementById('toast').innerText = t.toastSent;
    
    // Footer
    const footer = document.querySelector('footer');
    if(footer) {
        footer.querySelector('.footer-brand p').innerText = t.footerText;
        footer.querySelectorAll('.footer-links h4')[0].innerText = t.platform;
        const footerLinks = footer.querySelectorAll('.footer-links button');
        if(footerLinks.length >= 3) {
            footerLinks[0].innerText = t.home;
            footerLinks[1].innerText = t.marketplace;
            footerLinks[2].innerText = t.sellerPortal;
        }
        footer.querySelector('.footer-legal h4').innerText = t.support;
        const legalPs = footer.querySelectorAll('.footer-legal p');
        if(legalPs.length >= 2) {
            legalPs[0].innerText = t.contactUs;
            legalPs[1].innerText = t.terms;
        }
    }
}

// Listen for hash changes
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash && ['home', 'marketplace', 'track', 'admin', 'master'].includes(hash)) {
        showView(hash);
    }
});

// ROUTING
function showView(viewId) {
    currentView = viewId;
    window.location.hash = viewId;
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(`view-${viewId}`);
    if(target) target.classList.remove('hidden');
    
    if(viewId === 'marketplace') {
        initMarketplace();
        renderProductFeed();
    }
    if(viewId === 'master') renderMasterOrders();
    
    window.scrollTo(0,0);
}

// MARKETPLACE
function initMarketplace() {
    const list = document.getElementById('shops-list');
    list.innerHTML = SHOPS.map(shop => `
        <div class="shop-card" onclick="openShop('${shop.id}')">
            <div class="shop-frame">
                <div class="shop-img-wrapper">
                    <img src="${shop.hero}" alt="${shop.name}">
                </div>
                <div class="shop-card-content">
                    <img src="${shop.logo}" class="shop-logo" alt="${shop.name} logo">
                    <div class="shop-info">
                        <h3>${shop.name}</h3>
                        <div class="shop-hint">${currentLang === 'ar' ? 'عرض المتجر' : 'Visit Shop'}</div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function filterByCategory(cat) {
    currentCategory = cat;
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.innerText.toLowerCase() === (cat === 'all' ? 'all' : cat.toLowerCase())) {
            btn.classList.add('active');
        }
    });
    renderProductFeed();
}

function renderProductFeed() {
    if (!db) {
        setTimeout(renderProductFeed, 500);
        return;
    }
    const t = TRANSLATIONS[currentLang];
    const feedContainer = document.getElementById('marketplace-feed');
    if(!feedContainer) return;

    // Use onSnapshot for real-time updates
    const q = query(collection(db, "inventory"));
    onSnapshot(q, (snapshot) => {
        let allProducts = [];
        snapshot.forEach(doc => {
            const p = { ...doc.data(), id: doc.id };
            if(currentCategory === 'all' || p.category === currentCategory) {
                const shop = SHOPS.find(s => s.id === p.shopId);
                if(shop) {
                    allProducts.push({ ...p, shopName: shop.name });
                }
            }
        });

        if(allProducts.length === 0) {
            feedContainer.innerHTML = `<p style="text-align:center; color:#999; padding:40px; grid-column: 1/-1;">${t.noItemsMarket}</p>`;
            return;
        }

        // Shuffle for variety if 'all', otherwise sort by recent
        if(currentCategory === 'all') {
            allProducts.sort(() => Math.random() - 0.5);
        } else {
            allProducts.reverse();
        }

        feedContainer.innerHTML = allProducts.map(p => `
            <div class="product-card">
                <div class="product-img-wrapper">
                    <div class="badge-shop">${p.shopName}</div>
                    <img src="${p.image}" alt="${p.name}">
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <div class="product-price">$${p.price}</div>
                    <button class="btn-buy" onclick="buyFromFeed('${p.shopId}', '${p.id}', '${p.name}', ${p.price}, '${p.image}')">
                        ${t.buyNow}
                    </button>
                </div>
            </div>
        `).join('');
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "inventory");
    });
}

function buyFromFeed(shopId, pId, name, price, image) {
    const shop = SHOPS.find(s => s.id === shopId);
    activeShop = shop;
    openBuyModal(pId, name, price, image);
}

// SHOP DETAIL
function openShop(shopId) {
    const shop = SHOPS.find(s => s.id === shopId);
    activeShop = shop;
    showView('shop');
    
    document.getElementById('shop-header-container').innerHTML = `
        <div class="hero" style="background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${shop.hero}') center/cover; color: white;">
            <h1>${shop.name}</h1>
        </div>
    `;
    
    renderProducts(shopId);
}

function renderProducts(shopId) {
    if (!db) {
        setTimeout(() => renderProducts(shopId), 500);
        return;
    }
    const t = TRANSLATIONS[currentLang];
    const container = document.getElementById('shop-products-container');
    
    // Back to Market text
    const backBtn = document.querySelector('#view-shop .back-nav button');
    if(backBtn) backBtn.innerText = t.backToMarket;

    const q = query(collection(db, "inventory"), where("shopId", "==", shopId));
    onSnapshot(q, (snapshot) => {
        let shopProducts = [];
        snapshot.forEach(doc => shopProducts.push({ ...doc.data(), id: doc.id }));

        if(shopProducts.length === 0) {
            container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">${t.noProducts}</p>`;
            return;
        }

        container.innerHTML = shopProducts.map(p => `
            <div class="product-card">
                <div class="product-img-wrapper">
                    <img src="${p.image}" alt="${p.name}">
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <div class="product-price">$${p.price}</div>
                    <button class="btn-buy" onclick="openBuyModal('${p.id}', '${p.name}', ${p.price}, '${p.image}')">
                        ${t.buyNow}
                    </button>
                </div>
            </div>
        `).join('');
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "inventory");
    });
}

// BUY MODAL
function openBuyModal(id, name, price, image) {
    currentProductToBuy = { id, name, price, image };
    document.getElementById('modal-product-info').innerHTML = `
        <div style="display:flex; gap:15px; align-items:center; margin-bottom:20px;">
            <img src="${image}" style="width:60px; height:60px; border-radius:8px; object-fit:cover; border: 2px solid #000;">
            <div>
                <strong>${name}</strong><br>
                <span style="color:var(--accent)">$${price}</span>
            </div>
        </div>
    `;
    document.getElementById('buy-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('buy-modal').classList.add('hidden');
}

async function submitOrder() {
    const t = TRANSLATIONS[currentLang];
    let phone = document.getElementById('customer-phone').value;
    if(!phone) return alert(currentLang === 'ar' ? "يرجى إدخال رقم الهاتف" : "Please enter phone");
    
    // Ensure +964 prefix for IQ
    if(!phone.startsWith('+')) {
        // If it starts with 0, replace with +964
        if(phone.startsWith('0')) {
            phone = '+964' + phone.substring(1);
        } else if(!phone.startsWith('964')) {
            phone = '+964' + phone;
        } else {
            phone = '+' + phone;
        }
    }
    
    const orderData = {
        productName: currentProductToBuy.name,
        price: Number(currentProductToBuy.price),
        shopName: activeShop.name,
        phone: phone,
        time: new Date().toLocaleString(),
        status: 'pending',
        masterMessage: '',
        createdAt: serverTimestamp()
    };
    
    try {
        await addDoc(collection(db, "orders"), orderData);
        closeModal();
        showToast();
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "orders");
    }
}

function showToast() {
    const t = document.getElementById('toast');
    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 3000);
}

// SELLER ADMIN
function setupAdminSelect() {
    const sel = document.getElementById('admin-shop-select');
    sel.innerHTML = SHOPS.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

function handleSellerLogin() {
    const t = TRANSLATIONS[currentLang];
    const id = document.getElementById('admin-shop-select').value;
    const pass = document.getElementById('admin-pass').value;
    const shop = SHOPS.find(s => s.id === id);
    
    if(shop.pass === pass) {
        loggedInShopId = id;
        document.getElementById('admin-login').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        document.getElementById('admin-store-name').innerText = shop.name;
        renderAdminInventory();
    } else {
        alert(t.wrongKey);
    }
}

function renderAdminInventory() {
    if (!db) {
        setTimeout(renderAdminInventory, 500);
        return;
    }
    const t = TRANSLATIONS[currentLang];
    const list = document.getElementById('admin-inventory-list');
    
    const q = query(collection(db, "inventory"), where("shopId", "==", loggedInShopId));
    onSnapshot(q, (snapshot) => {
        let products = [];
        snapshot.forEach(doc => products.push({ ...doc.data(), id: doc.id }));

        list.innerHTML = products.map((p) => `
            <div style="display:flex; align-items:center; gap: 15px; padding:15px 0; border-bottom:1px solid #eee;">
                <img src="${p.image}" style="width:40px; height:40px; border-radius:8px; object-fit:cover; border: 1px solid #000;">
                <div style="flex:1;">
                    <div style="font-weight:600; font-size:14px;">${p.name}</div>
                    <div style="font-size:12px; color:#999;">$${p.price}</div>
                </div>
                <button onclick="deleteProduct('${p.id}')" style="color:#ff4444; border:none; background:none; cursor:pointer; font-weight:600; font-size:13px; padding: 5px;">${t.delete}</button>
            </div>
        `).join('') || `<p style="color:#999; text-align:center; padding:40px;">${t.noProducts}</p>`;
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "inventory");
    });
}

let currentBase64Image = null;

function previewProductImage(input) {
    const preview = document.getElementById('product-preview');
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentBase64Image = e.target.result;
            preview.innerHTML = `<img src="${currentBase64Image}" style="width:100px; height:100px; object-fit:cover; border-radius:10px; border: 2px solid #000; margin-top: 10px;">`;
        };
        reader.readAsDataURL(file);
    } else {
        currentBase64Image = null;
        preview.innerHTML = '';
    }
}

async function addNewProduct() {
    const t = TRANSLATIONS[currentLang];
    const name = document.getElementById('p-name').value;
    const cat = document.getElementById('p-cat').value;
    const price = document.getElementById('p-price').value;
    const img = currentBase64Image;
    
    if(!name || !price || !img) return alert(t.fillFields);
    
    const productData = {
        name,
        category: cat || 'General',
        price: Number(price),
        image: img,
        shopId: loggedInShopId,
        createdAt: serverTimestamp()
    };
    
    try {
        await addDoc(collection(db, "inventory"), productData);
        
        // Clear
        document.getElementById('p-name').value = '';
        document.getElementById('p-cat').value = '';
        document.getElementById('p-price').value = '';
        document.getElementById('product-preview').innerHTML = '';
        currentBase64Image = null;
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "inventory");
    }
}

async function deleteProduct(productId) {
    try {
        await deleteDoc(doc(db, "inventory", productId));
    } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `inventory/${productId}`);
    }
}

function logout() {
    loggedInShopId = null;
    document.getElementById('admin-login').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('admin-pass').value = '';
}

// TRACK ORDER (CUSTOMER)
function handleTrackOrder() {
    if (!db) {
        setTimeout(handleTrackOrder, 500);
        return;
    }
    const t = TRANSLATIONS[currentLang];
    let phone = document.getElementById('track-phone').value;
    if(!phone) return;

    if(!phone.startsWith('+')) {
        if(phone.startsWith('0')) {
            phone = '+964' + phone.substring(1);
        } else if(!phone.startsWith('964')) {
            phone = '+964' + phone;
        } else {
            phone = '+' + phone;
        }
    }

    const resultsDiv = document.getElementById('track-results');
    const listDiv = document.getElementById('customer-orders-list');
    resultsDiv.classList.remove('hidden');

    const q = query(collection(db, "orders"), where("phone", "==", phone));
    onSnapshot(q, (snapshot) => {
        let customerOrders = [];
        snapshot.forEach(doc => customerOrders.push({ ...doc.data(), id: doc.id }));

        if(customerOrders.length === 0) {
            listDiv.innerHTML = `<p style="text-align:center; padding:40px; color:#999; background:white; border-radius:15px;">${t.noOrdersFound}</p>`;
        } else {
            customerOrders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            listDiv.innerHTML = customerOrders.map(o => {
                const statusColor = o.status === 'Accepted' ? '#4CAF50' : (o.status === 'Refused' ? '#F44336' : '#999');
                let displayStatus = (o.status === 'pending' || !o.status) ? (currentLang === 'ar' ? 'قيد الانتظار' : 'Pending') : o.status;
                if(o.status === 'Accepted') displayStatus = t.statusAccepted;
                if(o.status === 'Refused') displayStatus = t.statusRefused;

                return `
                    <div class="order-item" style="flex-direction: column; align-items: stretch; gap: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>${o.productName}</strong><br>
                                <small>${o.shopName} | ${o.time}</small>
                            </div>
                            <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase;">${displayStatus}</span>
                        </div>
                        
                        ${o.masterMessage ? `
                            <div style="background: #f8f8f8; padding: 15px; border-radius: 12px; border-left: 4px solid ${statusColor}; margin-top: 5px;">
                                <p style="font-size: 11px; color: #999; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">${currentLang === 'ar' ? 'رسالة من أنيق ماستر' : 'Message from aneeq Master'}</p>
                                <p style="color: #333; font-style: italic; line-height: 1.5;">"${o.masterMessage}"</p>
                            </div>
                        ` : `
                            <p style="font-size: 12px; color: #999; margin-top: 5px;">${t.waitMaster}</p>
                        `}
                    </div>
                `;
            }).join('');
        }
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "orders");
    });
}

// MASTER ADMIN
function handleMasterLogin() {
    const t = TRANSLATIONS[currentLang];
    const pass = document.getElementById('master-pass').value;
    if(pass === MASTER_KEY) {
        document.getElementById('master-login').classList.add('hidden');
        document.getElementById('master-dashboard').classList.remove('hidden');
        renderMasterOrders();
    } else {
        alert(t.accessDenied);
    }
}

function renderMasterOrders() {
    if (!db) {
        setTimeout(renderMasterOrders, 500);
        return;
    }
    const t = TRANSLATIONS[currentLang];
    const container = document.getElementById('master-orders-list');
    
    // Real-time listener for master
    const q = query(collection(db, "orders"));
    onSnapshot(q, (snapshot) => {
        let orders = [];
        snapshot.forEach(doc => orders.push({ ...doc.data(), id: doc.id }));

        document.getElementById('master-stats').innerHTML = `
            <div style="display:flex; gap:20px; margin-top:20px;">
                <div>${t.totalLabel}${orders.length}</div>
                <div style="color:lawngreen">${t.systemOnline}</div>
            </div>
        `;

        orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        container.innerHTML = orders.map((o) => {
            const statusColor = o.status === 'Accepted' ? '#4CAF50' : (o.status === 'Refused' ? '#F44336' : '#999');
            let displayStatus = (o.status === 'pending' || !o.status) ? (currentLang === 'ar' ? 'قيد الانتظار' : 'Pending') : o.status;
            if(o.status === 'Accepted') displayStatus = t.statusAccepted;
            if(o.status === 'Refused') displayStatus = t.statusRefused;

            return `
            <div class="order-item" style="flex-direction: column; align-items: stretch; gap: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="font-size: 1.1em;">${o.productName}</strong><br>
                        <small>${o.shopName} | ${o.time}</small><br>
                        <span style="color:var(--accent); font-weight:700;">$${o.price}</span>
                    </div>
                    <div style="text-align:right">
                        <span style="background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase;">${displayStatus}</span><br>
                        <span style="color:#999; font-size:12px; display: block; margin-top: 5px;">${t.phLabel} ${o.phone}</span>
                    </div>
                </div>

                ${(o.status === 'pending' || !o.status) ? `
                    <div style="border-top: 1px solid #eee; padding-top: 15px;">
                        <p style="font-size: 12px; font-weight: bold; margin-bottom: 8px; color: #444;">${t.masterAction}</p>
                        <textarea id="msg-${o.id}" placeholder="${t.typeMessage}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 10px; font-size: 14px; min-height: 60px;"></textarea>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="updateOrderStatus('${o.id}', 'Accepted')" style="flex: 1; background: #4CAF50; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold;">${t.acceptRequest}</button>
                            <button onclick="updateOrderStatus('${o.id}', 'Refused')" style="flex: 1; background: #F44336; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold;">${t.refuseRequest}</button>
                        </div>
                    </div>
                ` : `
                    <div style="border-top: 1px solid #eee; padding-top: 10px; font-size: 13px;">
                        <strong>${t.messageSent}</strong> <span style="color: #666;">${o.masterMessage || 'No message provided.'}</span>
                        <button onclick="deleteOrderByID('${o.id}')" style="display: block; margin-top: 10px; background: none; border: none; color: #999; cursor: pointer; font-size: 11px; text-decoration: underline; padding: 0;">${t.removeHistory}</button>
                    </div>
                `}
            </div>
        `}).join('') || `<p style="color:#999; text-align:center;">${t.noItemsMarket}</p>`;
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "orders");
    });
}

async function updateOrderStatus(orderId, newStatus) {
    const msgInput = document.getElementById(`msg-${orderId}`);
    const msg = msgInput ? msgInput.value : "";
    
    try {
        await updateDoc(doc(db, "orders", orderId), {
            status: newStatus,
            masterMessage: msg
        });
    } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
}

async function deleteOrderByID(orderId) {
    try {
        await deleteDoc(doc(db, "orders", orderId));
    } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `orders/${orderId}`);
    }
}

// Attach to window for global access
window.showView = showView;
window.openShop = openShop;
window.buyFromFeed = buyFromFeed;
window.openBuyModal = openBuyModal;
window.closeModal = closeModal;
window.submitOrder = submitOrder;
window.handleSellerLogin = handleSellerLogin;
window.addNewProduct = addNewProduct;
window.deleteProduct = deleteProduct;
window.logout = logout;
window.handleTrackOrder = handleTrackOrder;
window.handleMasterLogin = handleMasterLogin;
window.updateOrderStatus = updateOrderStatus;
window.deleteOrderByID = deleteOrderByID;
window.setLanguage = setLanguage;
window.filterByCategory = filterByCategory;
window.previewProductImage = previewProductImage;

