import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, onSnapshot, serverTimestamp, getDocFromServer, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "gen-lang-client-0293781004",
  "appId": "1:1002839908496:web:52aa50ad60d3aa92603815",
  "apiKey": "AIzaSyB_mOuYbRx3IHAduhIXChdXmfPM_9R4ppo",
  "authDomain": "gen-lang-client-0293781004.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-1243ade3-2460-42a3-a0ef-abfd1118c9d3",
  "storageBucket": "gen-lang-client-0293781004.firebasestorage.app",
  "messagingSenderId": "1002839908496",
  "measurementId": ""
};

// INITIALIZATION
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const auth = getAuth();

let isAuthReady = false;

// Sign in anonymously
signInAnonymously(auth).catch(e => console.warn("Anonymous Auth disabled:", e.message));

onAuthStateChanged(auth, (user) => {
    isAuthReady = true;
    console.log("Auth state changed:", user ? "Signed in" : "Signed out");
});

// Hide loader once JS is running
const loader = document.getElementById('app-loader');
if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.classList.add('hidden'), 500);
}

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
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

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

const MASTER_KEY = "1111";

const TRANSLATIONS = {
    en: {
        storeSettings: "Store Settings",
        storeHero: "Store Header Image",
        saveStore: "Update Store Front",
        marketplace: "Marketplace",
        trackOrder: "Track Order",
        sellerPortal: "Seller Portal",
        home: "Home",
        heroTitle: "Where Style Meets ",
        heroIdentity: "Identity.",
        heroText: "Welcome to aneeq, the premium marketplace for independent creators and discerning collectors.",
        enterMarketplace: "Enter Marketplace",
        basket: "Basket",
        account: "Account",
        login: "Login",
        register: "Register",
        fullName: "Full Name",
        phone: "Phone Number",
        password: "Password",
        createAccount: "Create Account",
        myProfile: "My Profile",
        contactInfo: "Contact Info",
        shippingLocation: "Shipping Location",
        updateLocation: "Update Location",
        enterLocation: "City, Neighborhood, Street No...",
        deliveryHint: "Enter your delivery location. Our team will contact you.",
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
        backToMarket: "Back to Marketplace",
        backToHome: "Back to Home",
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
        all: "All",
        men: "Men",
        women: "Women",
        kids: "Kids",
        statusAccepted: "Accepted",
        statusRefused: "Refused",
        phLabel: "PH:",
    },
    ar: {
        storeSettings: "إعدادات المتجر",
        storeHero: "صورة غلاف المتجر",
        saveStore: "تحديث واجهة المتجر",
        marketplace: "المتجر",
        trackOrder: "تتبع الطلب",
        sellerPortal: "بوابة البائع",
        home: "الرئيسية",
        heroTitle: "حيث يلتقي الأسلوب بـ ",
        heroIdentity: "الهوية.",
        heroText: "مرحباً بكم في أنيق، المتجر المميز للمبدعين المستقلين وجامعي القطع الفريدة.",
        enterMarketplace: "دخول المتجر",
        basket: "السلة",
        account: "الحساب",
        login: "تسجيل الدخول",
        register: "إنشاء حساب",
        fullName: "الاسم الكامل",
        phone: "رقم الهاتف",
        password: "كلمة المرور",
        createAccount: "إنشاء الحساب",
        myProfile: "ملفي الشخصي",
        contactInfo: "معلومات الاتصال",
        shippingLocation: "موقع الشحن",
        updateLocation: "تحديث الموقع",
        enterLocation: "المدينة، الحي، رقم الشارع...",
        deliveryHint: "أدخل موقع التوصيل الخاص بك. سيتصل بك فريقنا.",
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
        backToMarket: "العودة للمتجر",
        backToHome: "العودة للرئيسية",
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
        all: "الكل",
        men: "الرجال",
        women: "النساء",
        kids: "الأطفال",
        statusAccepted: "مقبول",
        statusRefused: "مرفوض",
        phLabel: "هاتف:",
    }
};

// STATE
let currentView = "home";
let activeShop = null;
let loggedInShopId = localStorage.getItem('aneeq_seller_id');
let loggedInUser = JSON.parse(localStorage.getItem('aneeq_user') || 'null');
let trackOrdersUnsubscribe = null;
let isMasterLoggedIn = localStorage.getItem('aneeq_master_session') === 'true';
let currentProductToBuy = null;
let currentLang = localStorage.getItem('aneeq_lang') || 'en';
let currentCategory = 'all';

// INIT
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize real-time settings listener
    initSettingsListener();
    
    // 2. Set language
    setLanguage(currentLang);
    
    // 3. Recovery of states
    if (loggedInUser) {
        // If logged in as user, update UI
        updateProfileUI();
    }

    if (loggedInShopId) {
        const id = loggedInShopId; 
        const shop = SHOPS.find(s => s.id === id);
        if (shop) {
            document.getElementById('seller-tools').classList.remove('hidden');
            renderAdminInventory();
        } else {
            loggedInShopId = null;
            localStorage.removeItem('aneeq_seller_id');
        }
    }

    if (isMasterLoggedIn) {
        document.getElementById('master-login').classList.add('hidden');
        document.getElementById('master-dashboard').classList.remove('hidden');
        renderMasterOrders();
    }
    
    // Check URL hash on load
    const hash = window.location.hash.substring(1);
    if (hash && ['home', 'marketplace', 'track', 'account', 'master'].includes(hash)) {
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
    if(currentView === 'basket') handleBasketAutoTrack();
    if(currentView === 'master') renderMasterOrders();
    if(loggedInShopId) renderAdminInventory();
}

function updateStaticTranslations() {
    const t = TRANSLATIONS[currentLang];
    
    // Nav
    const navButtons = document.querySelectorAll('.navbar nav button');
    if(navButtons.length >= 3) {
        navButtons[0].innerText = t.marketplace;
        navButtons[1].innerText = t.basket;
        navButtons[2].innerText = t.account;
    }
    
    // Account View
    const authCard = document.getElementById('account-auth');
    if(authCard) {
        document.getElementById('tab-login').innerText = t.login;
        document.getElementById('tab-register').innerText = t.register;
        
        document.getElementById('login-phone').placeholder = t.phone;
        document.getElementById('login-pass').placeholder = t.password;
        const loginBtn = authCard.querySelector('#form-login button');
        if(loginBtn) loginBtn.innerText = t.login;
        
        document.getElementById('reg-name').placeholder = t.fullName;
        document.getElementById('reg-phone').placeholder = t.phone;
        document.getElementById('reg-pass').placeholder = t.password;
        const regBtn = authCard.querySelector('#form-register button');
        if(regBtn) regBtn.innerText = t.createAccount;
    }
    
    const profileView = document.getElementById('account-profile');
    if(profileView) {
       document.getElementById('user-display-name').innerText = loggedInUser ? loggedInUser.name : t.myProfile;
       profileView.querySelectorAll('h3')[0].innerText = t.contactInfo;
       profileView.querySelectorAll('h3')[1].innerText = t.shippingLocation;
       document.getElementById('profile-location').placeholder = t.enterLocation;
       const updateLocBtn = profileView.querySelector('button[onclick="saveProfileLocation()"]');
       if(updateLocBtn) updateLocBtn.innerText = t.updateLocation;
    }

    // Basket View
    const basketView = document.getElementById('view-basket');
    if(basketView) {
        const basketTitle = document.getElementById('basket-title');
        if(basketTitle) basketTitle.innerHTML = currentLang === 'ar' ? `سلتي <span class="accent-text">الخاصة</span>` : `My <span class="accent-text">Basket</span>`;
        document.getElementById('basket-status-title').innerText = t.requestStatus;
    }

    // Modal
    const buyModal = document.querySelector('.modal-content');
    if(buyModal) {
        document.getElementById('buy-modal-title').innerText = t.purchaseRequest;
        document.getElementById('buy-modal-hint').innerText = t.deliveryHint;
        document.getElementById('customer-location').placeholder = t.enterLocation;
        buyModal.querySelector('.btn-primary').innerText = t.confirmRequest;
    }
    // Home
    const homeHero = document.querySelector('.home-hero');
    if(homeHero) {
        homeHero.querySelector('h1').innerHTML = `${t.heroTitle} <span class="accent-text">${t.heroIdentity}</span>`;
        homeHero.querySelector('p').innerText = t.heroText;
        homeHero.querySelectorAll('button')[0].innerText = t.enterMarketplace;
        homeHero.querySelectorAll('button')[1].innerText = t.basket;
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
    
    // Categories
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const cat = btn.dataset.category;
        if (cat === 'all') btn.innerText = t.all;
        if (cat === 'Men') btn.innerText = t.men;
        if (cat === 'Women') btn.innerText = t.women;
        if (cat === 'Kids') btn.innerText = t.kids;
    });

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
        
        const settingsCard = adminDashboard.querySelector('.admin-settings-card');
        if(settingsCard) {
            settingsCard.querySelector('h3').innerText = t.storeSettings;
            settingsCard.querySelectorAll('label')[0].innerText = currentLang === 'ar' ? 'اسم المتجر' : 'Store Display Name';
            settingsCard.querySelector('#store-name-input').placeholder = currentLang === 'ar' ? 'أدخل اسم المتجر' : 'Enter Store Name';
            settingsCard.querySelector('.upload-text').innerText = t.storeHero;
            settingsCard.querySelector('button').innerText = t.saveStore;

            // Pre-fill current name from memory or SHOPS
            const shop = SHOPS.find(s => s.id === loggedInShopId);
            const currentName = shopSettingsOverrides[loggedInShopId]?.name || shop?.name || "";
            document.getElementById('store-name-input').value = currentName;
        }

        adminDashboard.querySelectorAll('.cardi h3')[1].innerText = t.addNewProduct;
        document.getElementById('p-name').placeholder = t.productName;
        document.getElementById('p-price').placeholder = t.price;
        adminDashboard.querySelector('.admin-form button').innerText = t.publishProduct;
        adminDashboard.querySelectorAll('.cardi h3')[1].innerText = t.inventory;

        const catSelect = document.getElementById('p-cat');
        if (catSelect) {
            catSelect.options[0].text = currentLang === 'ar' ? 'اختر الفئة' : 'Select Category';
            catSelect.options[1].text = t.men;
            catSelect.options[2].text = t.women;
            catSelect.options[3].text = t.kids;
        }
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
    if (hash && ['home', 'marketplace', 'basket', 'account', 'master'].includes(hash)) {
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
    
    if(viewId === 'basket') {
        handleBasketAutoTrack();
    }
    
    if(viewId === 'marketplace') {
        initMarketplace();
        renderProductFeed();
    }
    if(viewId === 'master') renderMasterOrders();
    
    window.scrollTo(0,0);
}

// UTILITIES
const shopSettingsOverrides = {};

function initSettingsListener() {
    if (!db) return;
    onSnapshot(collection(db, "shop_settings"), (snapshot) => {
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.shopId) {
                shopSettingsOverrides[data.shopId] = data;
            }
        });
        
        // Update UI dynamically
        if (loggedInShopId) {
            const shop = SHOPS.find(s => s.id === loggedInShopId);
            const displayName = shopSettingsOverrides[loggedInShopId]?.name || shop?.name;
            const el = document.getElementById('admin-store-name');
            if (el) el.innerText = displayName;
        }

        if (currentView === 'marketplace') {
            initMarketplace();
        }

        if (currentView === 'shop' && activeShop) {
            const heroImage = shopSettingsOverrides[activeShop.id]?.hero || activeShop.hero;
            const shopName = shopSettingsOverrides[activeShop.id]?.name || activeShop.name;
            const heroEl = document.querySelector('#view-shop .hero');
            if (heroEl) {
                heroEl.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${heroImage}')`;
                const h1 = heroEl.querySelector('h1');
                if (h1) h1.innerText = shopName;
            }
        }
    });
}

function initMarketplace() {
    const list = document.getElementById('shops-list');
    if (!list) return;

    list.innerHTML = SHOPS.map(shop => {
        const shopName = shopSettingsOverrides[shop.id]?.name || shop.name;
        return `
            <div class="shop-card" onclick="openShop('${shop.id}')">
                <div class="shop-frame">
                    <div class="shop-card-content">
                        <img src="${shop.logo}" class="shop-logo" alt="${shopName} logo">
                        <div class="shop-info">
                            <h3>${shopName}</h3>
                            <div class="shop-hint">${currentLang === 'ar' ? 'عرض المتجر' : 'Visit Shop'}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterByCategory(cat) {
    currentCategory = cat;
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.dataset.category === cat) {
            btn.classList.add('active');
        }
    });
    renderProductFeed();
}

let productFeedUnsubscribe = null;

function renderProductFeed() {
    if (!db) return;
    if (productFeedUnsubscribe) productFeedUnsubscribe();
    const t = TRANSLATIONS[currentLang];
    const feedContainer = document.getElementById('marketplace-feed');
    if(!feedContainer) return;

    // Use onSnapshot for real-time updates
    const q = query(collection(db, "inventory"));
    productFeedUnsubscribe = onSnapshot(q, (snapshot) => {
        let allProducts = [];
        snapshot.forEach(doc => {
            const p = { ...doc.data(), id: doc.id };
            if(currentCategory === 'all' || p.category === currentCategory) {
                const shop = SHOPS.find(s => s.id === p.shopId);
                if(shop) {
                    const shopName = shopSettingsOverrides[p.shopId]?.name || shop.name;
                    allProducts.push({ ...p, shopName: shopName });
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
    
    const heroImage = shopSettingsOverrides[shopId]?.hero || shop.hero;
    const shopName = shopSettingsOverrides[shopId]?.name || shop.name;
    
    document.getElementById('shop-header-container').innerHTML = `
        <div class="hero" style="background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${heroImage}') center/cover; color: white;">
            <h1>${shopName}</h1>
        </div>
    `;
    
    renderProducts(shopId);
}

let shopProductsUnsubscribe = null;

function renderProducts(shopId) {
    if (!db) return;
    if (shopProductsUnsubscribe) shopProductsUnsubscribe();
    const t = TRANSLATIONS[currentLang];
    const container = document.getElementById('shop-products-container');
    
    // Back to Market text
    const backBtnText = document.querySelector('#view-shop .btn-back span');
    if(backBtnText) backBtnText.innerText = t.backToMarket;

    // Marketplace and Track back buttons
    const mBack = document.querySelector('#view-marketplace .btn-back span');
    if(mBack) mBack.innerText = t.backToHome;
    const tBack = document.querySelector('#view-track .btn-back span');
    if(tBack) tBack.innerText = t.backToHome;

    const q = query(collection(db, "inventory"), where("shopId", "==", shopId));
    shopProductsUnsubscribe = onSnapshot(q, (snapshot) => {
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
    
    // Pre-fill location if user is logged in
    if(loggedInUser && loggedInUser.location) {
        document.getElementById('customer-location').value = loggedInUser.location;
    }
    
    document.getElementById('buy-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('buy-modal').classList.add('hidden');
}

async function submitOrder() {
    if (!db) return;
    const t = TRANSLATIONS[currentLang];
    const location = document.getElementById('customer-location').value;
    if(!location) return alert(currentLang === 'ar' ? "يرجى إدخال الموقع" : "Please enter location");
    
    // Check if logged in to get user details
    if(!loggedInUser) {
        alert(currentLang === 'ar' ? "يرجى تسجيل الدخول أولاً" : "Please login to place an order");
        showView('account');
        closeModal();
        return;
    }

    const shopName = shopSettingsOverrides[activeShop.id]?.name || activeShop.name;
    const orderData = {
        productName: currentProductToBuy.name,
        price: Number(currentProductToBuy.price),
        shopName: shopName,
        phone: loggedInUser.phone,
        customerName: loggedInUser.name,
        location: location,
        userId: loggedInUser.phone, // using phone as ID for simplicity in this demo logic
        time: new Date().toLocaleString(),
        status: 'pending',
        masterMessage: '',
        createdAt: serverTimestamp()
    };
    
    try {
        await addDoc(collection(db, "orders"), orderData);
        closeModal();
        showToast();
        
        // Update user location if it was empty
        if(!loggedInUser.location) {
            loggedInUser.location = location;
            saveProfileLocation(true);
        }
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "orders");
    }
}

function showToast(message) {
    const t = document.getElementById('toast');
    if (message) t.innerText = message;
    t.classList.remove('hidden');
    setTimeout(() => {
        t.classList.add('hidden');
        // Reset to default message for other uses
        setTimeout(() => { t.innerText = "Request Sent to Master!"; }, 500);
    }, 4000);
}

// ACCOUNT & AUTH
function toggleAuthMode(mode) {
    const loginTab = document.getElementById('tab-login');
    const regTab = document.getElementById('tab-register');
    const loginForm = document.getElementById('form-login');
    const regForm = document.getElementById('form-register');
    
    if(mode === 'login') {
        loginTab.style.fontWeight = '700';
        loginTab.style.borderBottom = '2px solid #000';
        loginTab.style.color = '#000';
        regTab.style.fontWeight = '400';
        regTab.style.borderBottom = 'none';
        regTab.style.color = '#999';
        loginForm.classList.remove('hidden');
        regForm.classList.add('hidden');
    } else {
        regTab.style.fontWeight = '700';
        regTab.style.borderBottom = '2px solid #000';
        regTab.style.color = '#000';
        loginTab.style.fontWeight = '400';
        loginTab.style.borderBottom = 'none';
        loginTab.style.color = '#999';
        regForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

async function handleRegister() {
    console.log("Register button clicked");
    if (!db) {
        console.error("Database not initialized");
        return;
    }
    
    if (!isAuthReady) {
        showToast(currentLang === 'ar' ? 'جاري تهيئة النظام... حاول مرة أخرى' : "Initializing system... please try again in a few seconds.");
        return;
    }

    const name = document.getElementById('reg-name').value.trim();
    const phoneInput = document.getElementById('reg-phone').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();
    
    if(!name || !phoneInput || !pass) {
        showToast(currentLang === 'ar' ? 'يرجى ملء جميع الحقول' : "Please fill all fields");
        return;
    }
    
    let phone = normalizePhone(phoneInput);
    if (phone.length < 10) {
        showToast(currentLang === 'ar' ? 'رقم هاتف غير صالح' : "Invalid phone number.");
        return;
    }
    
    console.log("Registering phone:", phone);
    
    try {
        const userRef = doc(db, "users", phone);
        const userDoc = await getDoc(userRef);
        if(userDoc.exists()) {
            showToast(currentLang === 'ar' ? 'رقم الهاتف مسجل بالفعل' : "Phone number already registered.");
            return;
        }
        
        const userData = {
            name,
            phone,
            password: pass,
            location: "",
            createdAt: serverTimestamp()
        };
        
        await setDoc(userRef, userData);
        showToast(currentLang === 'ar' ? 'تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول' : "Account created successfully! Please login.");
        
        // Reset fields
        document.getElementById('reg-name').value = '';
        document.getElementById('reg-phone').value = '';
        document.getElementById('reg-pass').value = '';
        
        setTimeout(() => toggleAuthMode('login'), 2000);
    } catch (e) {
        console.error("Registration error:", e);
        handleFirestoreError(e, OperationType.WRITE, 'users');
        showToast("Error: " + e.message);
    }
}

async function handleLogin() {
    if (!db) return;
    
    if (!isAuthReady) {
        showToast(currentLang === 'ar' ? 'جاري تهيئة النظام... حاول مرة أخرى' : "Initializing system... please try again.");
        return;
    }

    const phoneInput = document.getElementById('login-phone').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    
    if(!phoneInput || !pass) {
        showToast(currentLang === 'ar' ? 'يرجى إدخال الهاتف وكلمة المرور' : "Please enter phone and password");
        return;
    }
    
    let phone = normalizePhone(phoneInput);
    
    try {
        const userDoc = await getDoc(doc(db, "users", phone));
        if(userDoc.exists()) {
            const data = userDoc.data();
            if(data.password === pass) {
                loggedInUser = data;
                localStorage.setItem('aneeq_user', JSON.stringify(data));
                
                const sellerShop = SHOPS.find(s => s.pass === pass);
                if(sellerShop) {
                    loggedInShopId = sellerShop.id;
                    localStorage.setItem('aneeq_seller_id', loggedInShopId);
                }
                
                loginSuccess();
                return;
            }
        }
        
        const legacyShop = SHOPS.find(s => s.pass === pass);
        if(legacyShop) {
             loggedInUser = { name: legacyShop.name, phone: phone, location: "" };
             loggedInShopId = legacyShop.id;
             localStorage.setItem('aneeq_user', JSON.stringify(loggedInUser));
             localStorage.setItem('aneeq_seller_id', loggedInShopId);
             loginSuccess();
             return;
        }

        showToast(currentLang === 'ar' ? 'هاتف أو كلمة مرور غير صالحة' : "Invalid phone or password.");
    } catch (e) {
        handleFirestoreError(e, OperationType.GET, 'users');
        showToast("Login Error: " + e.message);
    }
}

function normalizePhone(phone) {
    // Remove all non-numeric characters except +
    let clean = phone.replace(/[^\d+]/g, '');
    
    // If it starts with 0 and isn't + prefixed, replace with 964
    if(clean.startsWith('0')) {
        clean = '964' + clean.substring(1);
    }
    
    // Ensure it has 964 prefix if it doesn't have + or 964
    if(!clean.startsWith('+') && !clean.startsWith('964')) {
        clean = '964' + clean;
    }
    
    // Ensure + prefix
    if(!clean.startsWith('+')) {
        clean = '+' + clean;
    }
    
    return clean;
}

function loginSuccess() {
    document.getElementById('account-auth').classList.add('hidden');
    document.getElementById('account-profile').classList.remove('hidden');
    updateProfileUI();
    
    if(loggedInShopId) {
        document.getElementById('seller-tools').classList.remove('hidden');
        renderAdminInventory();
    }
    
    showToast();
}

function updateProfileUI() {
    if(!loggedInUser) return;
    document.getElementById('account-auth').classList.add('hidden');
    document.getElementById('account-profile').classList.remove('hidden');
    
    document.getElementById('user-display-name').innerText = loggedInUser.name;
    document.getElementById('profile-info-display').innerHTML = `
        <p style="margin-bottom: 5px;"><strong>Phone:</strong> ${loggedInUser.phone}</p>
        <p style="font-size: 13px; color: #666;">Account active.</p>
    `;
    if(loggedInUser.location) {
        document.getElementById('profile-location').value = loggedInUser.location;
    }
}

async function saveProfileLocation(silent = false) {
    if(!db || !loggedInUser) return;
    const loc = document.getElementById('profile-location').value.trim();
    
    try {
        await updateDoc(doc(db, "users", loggedInUser.phone), { location: loc });
        loggedInUser.location = loc;
        localStorage.setItem('aneeq_user', JSON.stringify(loggedInUser));
        if(!silent) alert("Location updated!");
    } catch (e) {
        handleFirestoreError(e, 'UPDATE', 'users');
    }
}

// SELLER ADMIN
function setupAdminSelect() {
    const sel = document.getElementById('admin-shop-select');
    if(sel) sel.style.display = 'none';
}

function handleSellerLogin() {
    showView('account');
}

function logout() {
    loggedInShopId = null;
    loggedInUser = null;
    localStorage.removeItem('aneeq_seller_id');
    localStorage.removeItem('aneeq_user');
    document.getElementById('account-auth').classList.remove('hidden');
    document.getElementById('account-profile').classList.add('hidden');
    document.getElementById('seller-tools').classList.add('hidden');
    
    document.getElementById('login-phone').value = '';
    document.getElementById('login-pass').value = '';
}

// Global Exports
window.toggleAuthMode = toggleAuthMode;
window.handleBasketAutoTrack = handleBasketAutoTrack;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.saveProfileLocation = saveProfileLocation;
window.logout = logout;
window.showView = showView;
window.openShop = openShop;
window.buyFromFeed = buyFromFeed;
window.openBuyModal = openBuyModal;
window.closeModal = closeModal;
window.submitOrder = submitOrder;
window.handleSellerLogin = handleSellerLogin;
window.addNewProduct = addNewProduct;
window.deleteProduct = deleteProduct;
window.handleTrackOrder = handleBasketAutoTrack;
window.handleMasterLogin = handleMasterLogin;
window.masterLogout = masterLogout;
window.updateOrderStatus = updateOrderStatus;
window.deleteOrderByID = deleteOrderByID;
window.setLanguage = setLanguage;
window.filterByCategory = filterByCategory;
window.previewProductImage = previewProductImage;
window.previewStoreImage = previewStoreImage;
window.saveStoreSettings = saveStoreSettings;

let adminInventoryUnsubscribe = null;

function renderAdminInventory() {
    if (!db) return;
    if (adminInventoryUnsubscribe) adminInventoryUnsubscribe();
    const t = TRANSLATIONS[currentLang];
    const list = document.getElementById('admin-inventory-list');
    
    const q = query(collection(db, "inventory"), where("shopId", "==", loggedInShopId));
    adminInventoryUnsubscribe = onSnapshot(q, (snapshot) => {
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

// UTILITIES
async function compressImage(base64Str, maxWidth = 1024, quality = 0.6) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // Fill white background for JPEGs (transparency fix)
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, width, height);
            
            ctx.drawImage(img, 0, 0, width, height);
            // Using image/jpeg for smaller file sizes compared to png
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(base64Str);
    });
}

let currentBase64Image = null;
let currentStoreBase64 = null;

async function previewStoreImage(input) {
    const preview = document.getElementById('store-settings-preview');
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const compressed = await compressImage(e.target.result, 1200, 0.6);
            currentStoreBase64 = compressed;
            preview.innerHTML = `<img src="${currentStoreBase64}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">`;
        };
        reader.readAsDataURL(file);
    }
}

async function saveStoreSettings() {
    const newName = document.getElementById('store-name-input').value.trim();
    if (!loggedInShopId) return;

    const btn = document.querySelector('.admin-settings-card .btn-primary');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = currentLang === 'ar' ? 'جاري الحفظ...' : 'Saving...';

    const updateData = {
        shopId: loggedInShopId,
        updatedAt: serverTimestamp()
    };
    if (newName) updateData.name = newName;
    if (currentStoreBase64) updateData.hero = currentStoreBase64;

    try {
        await setDoc(doc(db, "shop_settings", loggedInShopId), updateData, { merge: true });
        alert(currentLang === 'ar' ? 'تم تحديث الإعدادات!' : "Store settings updated!");
        if (currentStoreBase64) {
            currentStoreBase64 = null;
            document.getElementById('store-settings-preview').innerHTML = '';
        }
    } catch (e) {
        handleFirestoreError(e, 'WRITE', 'shop_settings');
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
    }
}

async function previewProductImage(input) {
    const preview = document.getElementById('product-preview');
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const compressed = await compressImage(e.target.result, 800, 0.7);
            currentBase64Image = compressed;
            preview.innerHTML = `<img src="${currentBase64Image}" style="width:100px; height:100px; object-fit:cover; border-radius:10px; border: 2px solid #000; margin-top: 10px;">`;
        };
        reader.readAsDataURL(file);
    } else {
        currentBase64Image = null;
        preview.innerHTML = '';
    }
}

async function addNewProduct() {
    if (!db) return;
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

function masterLogout() {
    isMasterLoggedIn = false;
    localStorage.removeItem('aneeq_master_session');
    document.getElementById('master-login').classList.remove('hidden');
    document.getElementById('master-dashboard').classList.add('hidden');
    document.getElementById('master-pass').value = '';
}

// BASKET & TRACKING
function handleBasketAutoTrack() {
    if (!db) return;
    const t = TRANSLATIONS[currentLang];
    const authPrompt = document.getElementById('basket-auth-prompt');
    const resultsDiv = document.getElementById('basket-results');
    const desc = document.getElementById('basket-desc');

    if (!loggedInUser) {
        authPrompt.classList.remove('hidden');
        resultsDiv.classList.add('hidden');
        desc.innerText = currentLang === 'ar' ? 'يرجى تسجيل الدخول لعرض سلتك.' : 'Please login to view your basket.';
        return;
    }

    authPrompt.classList.add('hidden');
    resultsDiv.classList.remove('hidden');
    desc.innerText = currentLang === 'ar' ? 'عرض وتتبع طلبات الشراء الحالية.' : 'View and track your current purchase requests.';

    if (trackOrdersUnsubscribe) trackOrdersUnsubscribe();
    
    const phone = loggedInUser.phone;
    const listDiv = document.getElementById('customer-orders-list');
    
    const q = query(collection(db, "orders"), where("phone", "==", phone));
    trackOrdersUnsubscribe = onSnapshot(q, (snapshot) => {
        let customerOrders = [];
        snapshot.forEach(doc => customerOrders.push({ ...doc.data(), id: doc.id }));

        if(customerOrders.length === 0) {
            listDiv.innerHTML = `<p style="text-align:center; padding:40px; color:#999; background:white; border-radius:15px; border: 1px solid #eee;">${t.noOrdersFound}</p>`;
        } else {
            customerOrders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            listDiv.innerHTML = customerOrders.map(o => {
                const statusColor = o.status === 'Accepted' ? '#4CAF50' : (o.status === 'Refused' ? '#F44336' : '#999');
                let displayStatus = (o.status === 'pending' || !o.status) ? (currentLang === 'ar' ? 'قيد الانتظار' : 'Pending') : o.status;
                if(o.status === 'Accepted') displayStatus = t.statusAccepted;
                if(o.status === 'Refused') displayStatus = t.statusRefused;

                return `
                    <div class="order-item" style="flex-direction: column; align-items: stretch; gap: 10px; border: 1px solid #eee; margin-bottom: 15px; border-radius: 16px; padding: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="font-size: 16px;">${o.productName}</strong><br>
                                <small style="color: #999;">${o.shopName} | ${o.time}</small>
                            </div>
                            <span style="background: ${statusColor}; color: white; padding: 6px 14px; border-radius: 20px; font-size: 10px; font-weight: bold; text-transform: uppercase;">${displayStatus}</span>
                        </div>
                        
                        ${o.masterMessage ? `
                            <div style="background: #fdfdfd; padding: 15px; border-radius: 12px; border-left: 4px solid ${statusColor}; margin-top: 10px;">
                                <p style="font-size: 10px; color: #999; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Aneeq Master</p>
                                <p style="color: #333; font-style: italic; line-height: 1.5; font-size: 14px;">"${o.masterMessage}"</p>
                            </div>
                        ` : `
                            <p style="font-size: 12px; color: #999; margin-top: 10px; font-style: italic;">Waiting for validation from Aneeq Master...</p>
                        `}
                    </div>
                `;
            }).join('');
        }
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "orders");
    });
}

function handleMasterLogin() {
    const t = TRANSLATIONS[currentLang];
    const pass = document.getElementById('master-pass').value;
    if(pass === MASTER_KEY) {
        isMasterLoggedIn = true;
        localStorage.setItem('aneeq_master_session', 'true');
        document.getElementById('master-login').classList.add('hidden');
        document.getElementById('master-dashboard').classList.remove('hidden');
        renderMasterOrders();
    } else {
        alert(t.accessDenied);
    }
}

let masterOrdersUnsubscribe = null;
function renderMasterOrders() {
    if (!db) return;
    if (masterOrdersUnsubscribe) masterOrdersUnsubscribe();
    const t = TRANSLATIONS[currentLang];
    const container = document.getElementById('master-orders-list');
    const q = query(collection(db, "orders"));
    masterOrdersUnsubscribe = onSnapshot(q, (snapshot) => {
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
                ${(o.status === 'pending' || !o.status) ? `<div style="border-top: 1px solid #eee; padding-top: 15px;">
                        <p style="font-size: 12px; font-weight: bold; margin-bottom: 8px; color: #444;">${t.masterAction}</p>
                        <textarea id="msg-${o.id}" placeholder="${t.typeMessage}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 10px; font-size: 14px; min-height: 60px;"></textarea>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="updateOrderStatus('${o.id}', 'Accepted')" style="flex: 1; background: #4CAF50; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold;">${t.acceptRequest}</button>
                            <button onclick="updateOrderStatus('${o.id}', 'Refused')" style="flex: 1; background: #F44336; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold;">${t.refuseRequest}</button>
                        </div>
                    </div>` : `<div style="border-top: 1px solid #eee; padding-top: 10px; font-size: 13px;">
                        <strong>${t.messageSent}</strong> <span style="color: #666;">${o.masterMessage || 'No message provided.'}</span>
                        <button onclick="deleteOrderByID('${o.id}')" style="display: block; margin-top: 10px; background: none; border: none; color: #999; cursor: pointer; font-size: 11px; text-decoration: underline; padding: 0;">${t.removeHistory}</button>
                    </div>`}
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

