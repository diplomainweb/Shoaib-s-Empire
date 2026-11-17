tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        danger: {
                            50: '#fef2f2',
                            100: '#fee2e2',
                            500: '#ef4444',
                            600: '#dc2626',
                            700: '#b91c1c',
                            850: '#991b1b',
                            900: '#7f1d1d',
                        }
                    }
                }
            }
        }

/* ==========================================
           APPLICATION STATE & LOCAL STORAGE MANAGER
           ========================================== */
        const STORAGE_KEY_USER = 'atogoti_user_profile';
        const STORAGE_KEY_DATA = 'atogoti_tracker_data_v1';

        let appState = {
            currentUser: null,
            currentPage: 'Dashboard',
            selectedMonth: getCurrentMonthKey(), // Format: "YYYY-MM"
            mobileDateGroupIndex: 0, // 0: days 1-3, 1: 4-6, etc.
            data: {
                users: [],
                profiles: {}, // username -> { displayName, email, settings }
                tasks: {}, // "YYYY-MM" -> { date_timeSlot: { taskName, status } }
                atogoti: {
                    count: 47,
                    history: [
                        { id: 1, timestamp: new Date(Date.now() - 86400000*2).toISOString(), note: "Initial system count", correct: true },
                        { id: 2, timestamp: new Date(Date.now() - 86400000).toISOString(), note: "Discipline benchmark achieved", correct: true }
                    ]
                },
                timeSlots: [
                    "03:00 AM - 03:30 AM", "03:30 AM - 04:00 AM", "04:00 AM - 04:30 AM", "04:30 AM - 05:00 AM",
                    "05:00 AM - 05:30 AM", "05:30 AM - 06:00 AM", "06:00 AM - 06:30 AM", "06:30 AM - 07:00 AM",
                    "07:00 AM - 07:30 AM", "07:30 AM - 08:00 AM", "08:00 AM - 08:30 AM", "08:30 AM - 09:00 AM",
                    "09:00 AM - 09:30 AM", "09:30 AM - 10:00 AM", "10:00 AM - 10:30 AM", "10:30 AM - 11:00 AM",
                    "11:00 AM - 11:30 AM", "11:30 AM - 12:00 PM", "12:00 PM - 12:30 PM", "12:30 PM - 01:00 PM",
                    "01:00 PM - 01:30 PM", "01:30 PM - 02:00 PM", "02:00 PM - 02:30 PM", "02:30 PM - 03:00 PM",
                    "03:00 PM - 03:30 PM", "03:30 PM - 04:00 PM", "04:00 PM - 04:30 PM", "04:30 PM - 05:00 PM",
                    "05:00 PM - 05:30 PM", "05:30 PM - 06:00 PM", "06:00 PM - 06:30 PM", "06:30 PM - 07:00 PM",
                    "07:00 PM - 07:30 PM", "07:30 PM - 08:00 PM", "08:00 PM - 08:30 AM", "08:30 PM - 09:00 PM", // wait 08:30 PM - 09:00 PM
                    "09:00 PM - 09:30 PM", "09:30 PM - 10:00 PM", "10:00 PM - 10:30 PM", "10:30 PM - 11:00 PM",
                    "11:00 PM - 11:30 PM", "11:30 PM - 12:00 AM", "12:00 AM - 12:30 AM", "12:30 AM - 01:00 AM",
                    "01:00 AM - 01:30 AM", "01:30 AM - 02:00 AM", "02:00 AM - 02:30 AM", "02:30 AM - 03:00 AM"
                ],
                meditationHistory: [],
                armyWorkouts: [],
                studyTopics: []
            }
        };

        function getCurrentMonthKey() {
            const now = new Date();
            const y = now.getFullYear();
            const m = String(now.getMonth() + 1).padStart(2, '0');
            return `${y}-${m}`;
        }

        function loadData() {
            const savedUser = localStorage.getItem(STORAGE_KEY_USER);
            if (savedUser) {
                appState.currentUser = JSON.parse(savedUser);
            }
            const savedData = localStorage.getItem(STORAGE_KEY_DATA);
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    appState.data = Object.assign({}, appState.data, parsed);
                } catch (e) {
                    console.error("Error loading local storage data", e);
                }
            }
            // Ensure Atogoti count >= 47
            if (typeof appState.data.atogoti.count !== 'number' || appState.data.atogoti.count < 47) {
                appState.data.atogoti.count = 47;
            }
        }

        function saveData() {
            localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(appState.data));
            if (appState.currentUser) {
                localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(appState.currentUser));
            }
        }

        /* ==========================================
           TOAST NOTIFICATION SYSTEM
           ========================================== */
        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            const bgClass = type === 'success' ? 'bg-slate-900 border-slate-700 text-white' : type === 'danger' ? 'bg-danger-950 border-danger-700 text-danger-200' : 'bg-slate-900 border-slate-700 text-slate-200';
            const icon = type === 'success' ? 'check-circle' : type === 'danger' ? 'alert-triangle' : 'info';
            const iconColor = type === 'success' ? 'text-emerald-400' : type === 'danger' ? 'text-danger-500' : 'text-blue-400';

            toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md transform transition-all duration-300 translate-y-2 opacity-0 ${bgClass}`;
            toast.innerHTML = `
                <i data-lucide="${icon}" class="w-5 h-5 ${iconColor} shrink-0"></i>
                <span class="text-sm font-medium">${message}</span>
            `;
            container.appendChild(toast);
            lucide.createIcons();

            setTimeout(() => {
                toast.classList.remove('translate-y-2', 'opacity-0');
            }, 10);

            setTimeout(() => {
                toast.classList.add('translate-y-2', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 3500);
        }

        /* ==========================================
           NAVIGATION & PAGE ROUTING
           ========================================== */
        const pages = [
            { name: 'Dashboard', icon: 'layout-dashboard' },
            { name: 'Register Office', icon: 'clipboard-list' },
            { name: 'History', icon: 'history' },
            { name: 'Monthly Performance', icon: 'bar-chart-3' },
            { name: 'Meditation', icon: 'heart-pulse' },
            { name: 'Army', icon: 'shield-alert' },
            { name: 'Study Room', icon: 'book-open' },
            { name: 'Settings', icon: 'settings' }
        ];

        function renderSidebarNav() {
            const nav = document.getElementById('nav-links');
            if (!appState.currentUser) {
                nav.innerHTML = `
                    <button onclick="navigateTo('Login')" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${appState.currentPage === 'Login' ? 'bg-danger-600 text-white font-semibold shadow-lg shadow-danger-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}">
                        <i data-lucide="log-in" class="w-4 h-4"></i> Login
                    </button>
                    <button onclick="navigateTo('Signup')" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${appState.currentPage === 'Signup' ? 'bg-danger-600 text-white font-semibold shadow-lg shadow-danger-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}">
                        <i data-lucide="user-plus" class="w-4 h-4"></i> Signup
                    </button>
                `;
                lucide.createIcons();
                return;
            }

            let html = '';
            pages.forEach(p => {
                const active = appState.currentPage === p.name;
                html += `
                    <button onclick="navigateTo('${p.name}')" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${active ? 'bg-danger-600 text-white font-semibold shadow-lg shadow-danger-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}">
                        <i data-lucide="${p.icon}" class="w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}"></i>
                        <span>${p.name}</span>
                    </button>
                `;
            });
            nav.innerHTML = html;
            lucide.createIcons();
        }

        function navigateTo(pageName) {
            if (!appState.currentUser && pageName !== 'Login' && pageName !== 'Signup') {
                appState.currentPage = 'Login';
            } else {
                appState.currentPage = pageName;
            }
            renderSidebarNav();
            renderPage();
            
            // Close mobile sidebar if open
            const sidebar = document.getElementById('sidebar');
            if (!sidebar.classList.contains('-translate-x-full')) {
                sidebar.classList.add('-translate-x-full');
            }
        }

        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('-translate-x-full');
        }

        function updateHeaderInfo() {
            if (appState.currentUser) {
                document.getElementById('user-display-name').innerText = appState.currentUser.displayName || appState.currentUser.username;
                document.getElementById('user-email-display').innerText = appState.currentUser.email || 'Local User';
                document.getElementById('user-avatar').innerText = (appState.currentUser.displayName || 'U')[0].toUpperCase();
            }
            document.getElementById('header-atogoti-count').innerText = appState.data.atogoti.count;
            const now = new Date();
            document.getElementById('header-current-date').innerText = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        }

        /* ==========================================
           PAGE RENDER DISPATCHER
           ========================================== */
        function renderPage() {
            updateHeaderInfo();
            const main = document.getElementById('main-content');
            const titleEl = document.getElementById('page-title');
            const subtitleEl = document.getElementById('page-subtitle');
            
            titleEl.innerText = appState.currentPage;
            
            if (!appState.currentUser && appState.currentPage !== 'Login' && appState.currentPage !== 'Signup') {
                appState.currentPage = 'Login';
                renderSidebarNav();
            }

            switch(appState.currentPage) {
                case 'Login':
                    subtitleEl.innerText = 'Local secure workspace login';
                    main.innerHTML = renderLoginPage();
                    break;
                case 'Signup':
                    subtitleEl.innerText = 'Create your local profile';
                    main.innerHTML = renderSignupPage();
                    break;
                case 'Dashboard':
                    subtitleEl.innerText = 'Daily tactical overview & statistics';
                    main.innerHTML = renderDashboardPage();
                    break;
                case 'Register Office':
                    subtitleEl.innerText = 'Spreadsheet-style monthly time & mission tracker (3:00 AM start)';
                    main.innerHTML = renderRegisterOfficePage();
                    setupRegisterOfficeInteractions();
                    break;
                case 'History':
                    subtitleEl.innerText = 'Archive of previous months & Shoaib\'s Empire records';
                    main.innerHTML = renderHistoryPage();
                    break;
                case 'Monthly Performance':
                    subtitleEl.innerText = 'Productivity analytics, time breakdown & charts';
                    main.innerHTML = renderMonthlyPerformancePage();
                    renderCharts();
                    break;
                case 'Meditation':
                    subtitleEl.innerText = 'Mindfulness & spiritual clarity tracker';
                    main.innerHTML = renderMeditationPage();
                    break;
                case 'Army':
                    subtitleEl.innerText = 'Military-inspired physical fitness & discipline suite';
                    main.innerHTML = renderArmyPage();
                    break;
                case 'Study Room':
                    subtitleEl.innerText = 'Academic mastery, subject & topic tracker';
                    main.innerHTML = renderStudyRoomPage();
                    break;
                case 'Settings':
                    subtitleEl.innerText = 'Local data management, backups & preferences';
                    main.innerHTML = renderSettingsPage();
                    break;
                default:
                    main.innerHTML = `<div class="text-slate-400">Page under construction.</div>`;
            }
            lucide.createIcons();
        }

        /* ==========================================
           1. AUTHENTICATION PAGES (Login / Signup)
           ========================================== */
        function renderLoginPage() {
            return `
                <div class="max-w-md mx-auto mt-12 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <div class="text-center mb-6">
                        <div class="w-12 h-12 bg-danger-600 text-white rounded-2xl mx-auto flex items-center justify-center font-bold text-xl shadow-lg shadow-danger-600/30 mb-3">
                            <i data-lucide="shield" class="w-6 h-6"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white">Welcome Back, Commander</h3>
                        <p class="text-xs text-slate-400 mt-1">Local Browser Authentication (No Cloud Sync)</p>
                    </div>

                    <form onsubmit="handleLogin(event)" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-300 uppercase mb-1">Username</label>
                            <input type="text" id="login-username" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-danger-500">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
                            <input type="password" id="login-password" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-danger-500">
                        </div>
                        <button type="submit" class="w-full bg-danger-600 hover:bg-danger-700 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-danger-600/30">
                            Access Terminal
                        </button>
                    </form>

                    <div class="mt-6 text-center text-xs text-slate-400">
                        Don't have a local profile? <a href="#" onclick="navigateTo('Signup')" class="text-danger-400 font-semibold hover:underline">Signup here</a>
                    </div>

                    <div class="mt-8 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400">
                        <p class="font-semibold text-slate-300 mb-1 flex items-center gap-1.5"><i data-lucide="info" class="w-3.5 h-3.5 text-danger-500"></i> Local Storage Notice</p>
                        This is a client-side offline app. Your data resides securely in your browser's local storage and is never transmitted to any external server.
                    </div>
                </div>
            `;
        }

        function handleLogin(e) {
            e.preventDefault();
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;

            const users = appState.data.users || [];
            const found = users.find(u => u.username === username && u.password === password);
            if (found || (users.length === 0 && username)) {
                const user = found || { username, displayName: username, email: `${username}@local.com` };
                if (!found) appState.data.users.push(user);
                appState.currentUser = user;
                saveData();
                showToast("Access granted. Welcome to Shoaib's Empire.");
                navigateTo('Dashboard');
            } else {
                showToast("Invalid credentials or user does not exist.", "danger");
            }
        }

        function renderSignupPage() {
            return `
                <div class="max-w-md mx-auto mt-12 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <div class="text-center mb-6">
                        <div class="w-12 h-12 bg-danger-600 text-white rounded-2xl mx-auto flex items-center justify-center font-bold text-xl shadow-lg shadow-danger-600/30 mb-3">
                            <i data-lucide="user-plus" class="w-6 h-6"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white">Initialize Local Account</h3>
                        <p class="text-xs text-slate-400 mt-1">Set up your local productivity workspace</p>
                    </div>

                    <form onsubmit="handleSignup(event)" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-300 uppercase mb-1">Display Name</label>
                            <input type="text" id="signup-name" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-danger-500" placeholder="Commander Alex">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-300 uppercase mb-1">Username</label>
                            <input type="text" id="signup-username" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-danger-500" placeholder="alex_commander">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
                            <input type="password" id="signup-password" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-danger-500">
                        </div>
                        <button type="submit" class="w-full bg-danger-600 hover:bg-danger-700 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-danger-600/30">
                            Create Local Account
                        </button>
                    </form>

                    <div class="mt-6 text-center text-xs text-slate-400">
                        Already have an account? <a href="#" onclick="navigateTo('Login')" class="text-danger-400 font-semibold hover:underline">Login here</a>
                    </div>
                </div>
            `;
        }

        function handleSignup(e) {
            e.preventDefault();
            const displayName = document.getElementById('signup-name').value.trim();
            const username = document.getElementById('signup-username').value.trim();
            const password = document.getElementById('signup-password').value;

            if (!appState.data.users) appState.data.users = [];
            if (appState.data.users.some(u => u.username === username)) {
                showToast("Username already exists in local storage.", "danger");
                return;
            }

            const newUser = { username, displayName, email: `${username}@local.com`, password };
            appState.data.users.push(newUser);
            appState.currentUser = newUser;
            saveData();
            showToast("Account created successfully!");
            navigateTo('Dashboard');
        }

        function logout() {
            appState.currentUser = null;
            localStorage.removeItem(STORAGE_KEY_USER);
            navigateTo('Login');
            showToast("Logged out successfully.");
        }

        /* ==========================================
           2. DASHBOARD PAGE
           ========================================== */
        function renderDashboardPage() {
            const stats = calculateMonthStats(appState.selectedMonth);
            const today = new Date();
            const dayNum = today.getDate();
            const todayTasks = getTasksForDay(appState.selectedMonth, dayNum);
            
            let todayCompleted = 0;
            let todayTotal = todayTasks.length;
            todayTasks.forEach(t => {
                if (t.status === 100) todayCompleted++;
                else if (t.status === 50) todayCompleted += 0.5;
            });
            const todayPct = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

            return `
                <div class="space-y-6 max-w-7xl mx-auto pb-12">
                    <!-- Welcome Banner & Quick Shoaib's Empire Widget -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Left Hero Card -->
                        <div class="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
                            <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-danger-600/10 rounded-full blur-3xl pointer-events-none"></div>
                            <div>
                                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-danger-950 border border-danger-700/50 text-danger-400 text-xs font-semibold mb-4">
                                    <span class="w-2 h-2 rounded-full bg-danger-500 animate-pulse"></span> Tactical Readiness Active
                                </div>
                                <h3 class="text-2xl md:text-3xl font-bold text-white tracking-tight">Welcome back, ${appState.currentUser?.displayName || 'Commander'}</h3>
                                <p class="text-slate-400 text-sm mt-2 max-w-xl">Monitor your daily missions, time allocation, discipline records, and Shoaib's Empire counter. Total consistency drives peak performance.</p>
                            </div>
                            <div class="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-slate-800">
                                <button onclick="navigateTo('Register Office')" class="bg-danger-600 hover:bg-danger-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-lg shadow-danger-600/30 flex items-center gap-2">
                                    <i data-lucide="clipboard-list" class="w-4 h-4"></i> Open Register Office
                                </button>
                                <button onclick="navigateTo('Monthly Performance')" class="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-2.5 rounded-xl text-sm transition border border-slate-700 flex items-center gap-2">
                                    <i data-lucide="bar-chart-3" class="w-4 h-4"></i> View Analytics
                                </button>
                            </div>
                        </div>

                        <!-- Danger Red Shoaib's Empire Hero Widget -->
                        <div class="bg-gradient-to-br from-danger-950 via-danger-900 to-slate-900 border border-danger-700/60 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                            <div class="absolute top-0 right-0 p-6 opacity-10 text-white pointer-events-none">
                                <i data-lucide="shield-alert" class="w-32 h-32"></i>
                            </div>
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-xs font-bold uppercase tracking-widest text-danger-300">SHOAIB'S EMPIRE COUNTER</span>
                                    <span class="px-2.5 py-0.5 rounded-full bg-danger-800 text-white text-xs font-black">STRICT +1</span>
                                </div>
                                <div class="text-5xl md:text-6xl font-black text-white tracking-tight mt-2" id="dash-atogoti-count">
                                    ${appState.data.atogoti.count}
                                </div>
                                <p class="text-xs text-danger-200/80 mt-1">Continuous discipline count across all months. Increases only.</p>
                            </div>
                            <div class="mt-6">
                                <button onclick="addAtogotiEntry()" class="w-full bg-white hover:bg-danger-100 text-danger-900 font-bold py-3 px-4 rounded-xl shadow-xl transition flex items-center justify-center gap-2 text-sm">
                                    <i data-lucide="plus-circle" class="w-4 h-4 text-danger-700"></i> + Add to Shoaib's Empire
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Statistics Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <!-- Today's Progress -->
                        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                            <div class="flex items-center justify-between text-slate-400 mb-2">
                                <span class="text-xs font-semibold uppercase tracking-wider">Today's Progress</span>
                                <i data-lucide="target" class="w-4 h-4 text-danger-400"></i>
                            </div>
                            <div class="text-3xl font-bold text-white">${todayPct}%</div>
                            <p class="text-xs text-slate-400 mt-1">${todayTasks.filter(t=>t.status===100).length} of ${todayTotal} slots fully completed</p>
                        </div>

                        <!-- Monthly Completion -->
                        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                            <div class="flex items-center justify-between text-slate-400 mb-2">
                                <span class="text-xs font-semibold uppercase tracking-wider">Monthly Completion</span>
                                <i data-lucide="award" class="w-4 h-4 text-emerald-400"></i>
                            </div>
                            <div class="text-3xl font-bold text-white">${stats.completionPct}%</div>
                            <p class="text-xs text-slate-400 mt-1">Weighted score for ${appState.selectedMonth}</p>
                        </div>

                        <!-- Used Time -->
                        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                            <div class="flex items-center justify-between text-slate-400 mb-2">
                                <span class="text-xs font-semibold uppercase tracking-wider">Used Time</span>
                                <i data-lucide="clock" class="w-4 h-4 text-blue-400"></i>
                            </div>
                            <div class="text-3xl font-bold text-white">${formatHoursMinutes(stats.usedTimeMinutes)}</div>
                            <p class="text-xs text-slate-400 mt-1">Total productive hours logged</p>
                        </div>

                        <!-- Wasted Time -->
                        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                            <div class="flex items-center justify-between text-slate-400 mb-2">
                                <span class="text-xs font-semibold uppercase tracking-wider">Wasted Time</span>
                                <i data-lucide="alert-circle" class="w-4 h-4 text-amber-400"></i>
                            </div>
                            <div class="text-3xl font-bold text-white">${formatHoursMinutes(stats.wastedTimeMinutes)}</div>
                            <p class="text-xs text-slate-400 mt-1">0% incomplete slot duration</p>
                        </div>
                    </div>

                    <!-- Quick Navigation Cards -->
                    <div>
                        <h4 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Tactical Command Modules</h4>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div onclick="navigateTo('Register Office')" class="bg-slate-900 border border-slate-800 hover:border-danger-600/50 p-5 rounded-2xl cursor-pointer transition group shadow-md hover:shadow-xl">
                                <div class="w-10 h-10 rounded-xl bg-danger-950 text-danger-400 flex items-center justify-center mb-3 group-hover:bg-danger-600 group-hover:text-white transition">
                                    <i data-lucide="clipboard-list" class="w-5 h-5"></i>
                                </div>
                                <h5 class="font-bold text-white text-sm">Register Office</h5>
                                <p class="text-xs text-slate-400 mt-1">Spreadsheet monthly time & mission tracker.</p>
                            </div>
                            <div onclick="navigateTo('History')" class="bg-slate-900 border border-slate-800 hover:border-danger-600/50 p-5 rounded-2xl cursor-pointer transition group shadow-md hover:shadow-xl">
                                <div class="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center mb-3 group-hover:bg-danger-600 group-hover:text-white transition">
                                    <i data-lucide="history" class="w-5 h-5"></i>
                                </div>
                                <h5 class="font-bold text-white text-sm">History</h5>
                                <p class="text-xs text-slate-400 mt-1">Past months archive & Shoaib's Empire logs.</p>
                            </div>
                            <div onclick="navigateTo('Monthly Performance')" class="bg-slate-900 border border-slate-800 hover:border-danger-600/50 p-5 rounded-2xl cursor-pointer transition group shadow-md hover:shadow-xl">
                                <div class="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center mb-3 group-hover:bg-danger-600 group-hover:text-white transition">
                                    <i data-lucide="bar-chart-3" class="w-5 h-5"></i>
                                </div>
                                <h5 class="font-bold text-white text-sm">Performance</h5>
                                <p class="text-xs text-slate-400 mt-1">Productivity metrics & PDF reports.</p>
                            </div>
                            <div onclick="navigateTo('Settings')" class="bg-slate-900 border border-slate-800 hover:border-danger-600/50 p-5 rounded-2xl cursor-pointer transition group shadow-md hover:shadow-xl">
                                <div class="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center mb-3 group-hover:bg-danger-600 group-hover:text-white transition">
                                    <i data-lucide="settings" class="w-5 h-5"></i>
                                </div>
                                <h5 class="font-bold text-white text-sm">Settings</h5>
                                <p class="text-xs text-slate-400 mt-1">JSON backups, slots & profile.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        /* ==========================================
           3. REGISTER OFFICE PAGE (Spreadsheet Layout)
           ========================================== */
        function getDaysInMonth(yearMonthStr) {
            const [y, m] = yearMonthStr.split('-').map(Number);
            return new Date(y, m, 0).getDate();
        }

        function renderRegisterOfficePage() {
            const [year, month] = appState.selectedMonth.split('-');
            const totalDays = getDaysInMonth(appState.selectedMonth);
            const timeSlots = appState.data.timeSlots || [];

            // Mobile view date grouping (3 days per group)
            const groupIndex = appState.mobileDateGroupIndex || 0;
            const startDay = groupIndex * 3 + 1;
            const endDay = Math.min(startDay + 2, totalDays);
            const maxGroups = Math.ceil(totalDays / 3);

            let headerDaysHtml = '';
            for (let d = 1; d <= totalDays; d++) {
                headerDaysHtml += `<th class="border border-slate-700 px-2 py-1.5 text-center text-xs font-bold text-slate-300 bg-slate-900 min-w-[36px]">${d}</th>`;
            }

            let mobileHeaderDaysHtml = '';
            for (let d = startDay; d <= endDay; d++) {
                if (d <= totalDays) {
                    mobileHeaderDaysHtml += `<th class="border border-slate-700 px-2 py-1.5 text-center text-xs font-bold text-slate-300 bg-slate-900 min-w-[50px]">Day ${d}</th>`;
                }
            }

            // Generate rows for desktop
            let rowsHtml = '';
            timeSlots.forEach((slot, slotIdx) => {
                rowsHtml += `
                    <tr class="hover:bg-slate-900/50 transition">
                        <td class="border border-slate-800 px-3 py-2 text-xs font-mono text-slate-300 bg-slate-900/80 whitespace-nowrap sticky left-0 z-10">${slot}</td>
                `;
                for (let d = 1; d <= totalDays; d++) {
                    const taskKey = `${appState.selectedMonth}_d${d}_s${slotIdx}`;
                    const taskObj = (appState.data.tasks[appState.selectedMonth] && appState.data.tasks[appState.selectedMonth][taskKey]) || { taskName: '', status: 0 };
                    
                    let bgCol = 'bg-slate-950';
                    let symbol = '○';
                    let textCol = 'text-slate-600';
                    if (taskObj.status === 100) {
                        bgCol = 'bg-emerald-950/40';
                        symbol = '✓';
                        textCol = 'text-emerald-400 font-bold';
                    } else if (taskObj.status === 50) {
                        bgCol = 'bg-amber-950/40';
                        symbol = '◐';
                        textCol = 'text-amber-400 font-bold';
                    } else if (taskObj.status === -100) {
                        bgCol = 'bg-danger-950/60';
                        symbol = '-100%';
                        textCol = 'text-danger-400 font-bold text-[10px]';
                    }

                    rowsHtml += `
                        <td class="border border-slate-800 p-1 text-center cursor-pointer ${bgCol} hover:bg-slate-800 transition relative group" onclick="openCellEditor(${d}, ${slotIdx})">
                            <div class="w-full h-full min-h-[30px] flex items-center justify-center ${textCol}" title="${taskObj.taskName || 'Empty'} (${taskObj.status}%)">
                                ${symbol}
                            </div>
                        </td>
                    `;
                }
                rowsHtml += `</tr>`;
            });

            // Generate rows for mobile (3 days view)
            let mobileRowsHtml = '';
            timeSlots.forEach((slot, slotIdx) => {
                mobileRowsHtml += `
                    <tr class="hover:bg-slate-900/50 transition">
                        <td class="border border-slate-800 px-2 py-2 text-xs font-mono text-slate-300 bg-slate-900/80">${slot}</td>
                `;
                for (let d = startDay; d <= endDay; d++) {
                    if (d <= totalDays) {
                        const taskKey = `${appState.selectedMonth}_d${d}_s${slotIdx}`;
                        const taskObj = (appState.data.tasks[appState.selectedMonth] && appState.data.tasks[appState.selectedMonth][taskKey]) || { taskName: '', status: 0 };
                        
                        let bgCol = 'bg-slate-950';
                        let symbol = '○';
                        let textCol = 'text-slate-600';
                        if (taskObj.status === 100) {
                            bgCol = 'bg-emerald-950/40'; symbol = '✓'; textCol = 'text-emerald-400 font-bold';
                        } else if (taskObj.status === 50) {
                            bgCol = 'bg-amber-950/40'; symbol = '◐'; textCol = 'text-amber-400 font-bold';
                        } else if (taskObj.status === -100) {
                            bgCol = 'bg-danger-950/60'; symbol = '-100%'; textCol = 'text-danger-400 font-bold text-[10px]';
                        }

                        mobileRowsHtml += `
                            <td class="border border-slate-800 p-1 text-center cursor-pointer ${bgCol}" onclick="openCellEditor(${d}, ${slotIdx})">
                                <div class="w-full h-full min-h-[34px] flex items-center justify-center ${textCol}">${symbol}</div>
                            </td>
                        `;
                    }
                }
                mobileRowsHtml += `</tr>`;
            });

            return `
                <div class="space-y-6 max-w-[1600px] mx-auto pb-16">
                    <!-- Top Toolbar & Month Selector -->
                    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
                        <div class="flex items-center gap-3">
                            <label class="text-xs font-bold text-slate-300 uppercase">Select Month:</label>
                            <input type="month" id="tracker-month-input" value="${appState.selectedMonth}" onchange="changeSelectedMonth(this.value)" class="bg-slate-950 border border-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-danger-500">
                        </div>

                        <!-- Shoaib's Empire Quick Bar -->
                        <div class="flex items-center gap-3 bg-danger-950/80 border border-danger-700 px-4 py-2 rounded-xl shadow-md">
                            <span class="text-xs font-black uppercase text-danger-300">SHOAIB'S EMPIRE:</span>
                            <span class="text-lg font-black text-white">${appState.data.atogoti.count}</span>
                            <button onclick="addAtogotiEntry()" class="bg-white hover:bg-danger-100 text-danger-900 font-bold px-3 py-1 rounded-lg text-xs transition shadow">
                                + Add to Shoaib's Empire
                            </button>
                            <button onclick="openAtogotiHistoryModal()" class="text-danger-200 hover:text-white text-xs font-semibold underline ml-1">History</button>
                        </div>

                        <!-- PDF Export Buttons -->
                        <div class="flex items-center gap-2">
                            <button onclick="downloadFullTrackerPDF()" class="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-3.5 py-2 rounded-xl text-xs transition border border-slate-700 flex items-center gap-1.5 shadow">
                                <i data-lucide="file-text" class="w-3.5 h-3.5 text-danger-400"></i> Full Tracker PDF
                            </button>
                            <button onclick="downloadPerformancePDF()" class="bg-danger-600 hover:bg-danger-700 text-white font-semibold px-3.5 py-2 rounded-xl text-xs transition shadow-lg shadow-danger-600/30 flex items-center gap-1.5">
                                <i data-lucide="download" class="w-3.5 h-3.5"></i> Performance PDF
                            </button>
                        </div>
                    </div>

                    <!-- DESKTOP SPREADSHEET VIEW -->
                    <div class="hidden lg:block bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                        <div class="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                            <div class="flex items-center gap-2 text-sm font-bold text-white">
                                <i data-lucide="grid" class="w-4 h-4 text-danger-500"></i>
                                Monthly Time Tracker (Starts 3:00 AM) - ${appState.selectedMonth}
                            </div>
                            <span class="text-xs text-slate-400">Click any cell to edit mission task & status</span>
                        </div>
                        <div class="overflow-x-auto custom-scrollbar max-h-[70vh]">
                            <table class="w-full border-collapse text-left">
                                <thead>
                                    <tr>
                                        <th class="border border-slate-700 px-4 py-2 text-xs font-bold text-slate-200 bg-slate-900 sticky left-0 z-20 min-w-[160px]">TIME / MISSION</th>
                                        ${headerDaysHtml}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rowsHtml}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- MOBILE 3-DAY GROUPED VIEW -->
                    <div class="block lg:hidden bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                        <div class="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                            <div class="text-sm font-bold text-white">
                                Days ${startDay} - ${endDay} (of ${totalDays})
                            </div>
                            <div class="flex items-center gap-2">
                                <button onclick="prevMobileDays()" ${groupIndex === 0 ? 'disabled class="opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold"' : 'class="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded-lg text-xs font-bold"'}>
                                    Prev
                                </button>
                                <button onclick="nextMobileDays(${maxGroups})" ${groupIndex >= maxGroups - 1 ? 'disabled class="opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold"' : 'class="bg-danger-600 hover:bg-danger-700 text-white px-3 py-1 rounded-lg text-xs font-bold"'}>
                                    Next
                                </button>
                            </div>
                        </div>
                        <div class="overflow-x-auto custom-scrollbar">
                            <table class="w-full border-collapse text-left">
                                <thead>
                                    <tr>
                                        <th class="border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 bg-slate-900 min-w-[130px]">TIME</th>
                                        ${mobileHeaderDaysHtml}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${mobileRowsHtml}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }

        function setupRegisterOfficeInteractions() {
            // Additional setup if needed
        }

        function changeSelectedMonth(val) {
            if (!val) return;
            appState.selectedMonth = val;
            appState.mobileDateGroupIndex = 0;
            renderPage();
        }

        function prevMobileDays() {
            if (appState.mobileDateGroupIndex > 0) {
                appState.mobileDateGroupIndex--;
                renderPage();
            }
        }

        function nextMobileDays(maxGroups) {
            if (appState.mobileDateGroupIndex < maxGroups - 1) {
                appState.mobileDateGroupIndex++;
                renderPage();
            }
        }

        // Cell Editor Modal
        function openCellEditor(day, slotIdx) {
            const timeSlots = appState.data.timeSlots || [];
            const slotName = timeSlots[slotIdx];
            const taskKey = `${appState.selectedMonth}_d${day}_s${slotIdx}`;
            
            if (!appState.data.tasks[appState.selectedMonth]) {
                appState.data.tasks[appState.selectedMonth] = {};
            }
            const currentTask = appState.data.tasks[appState.selectedMonth][taskKey] || { taskName: '', status: 0 };

            const modalContainer = document.getElementById('modal-container');
            modalContainer.innerHTML = `
                <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <h3 class="font-bold text-white text-lg">Edit Mission / Slot</h3>
                                <p class="text-xs text-slate-400">Day ${day}, ${appState.selectedMonth} | ${slotName}</p>
                            </div>
                            <button onclick="closeModal()" class="text-slate-400 hover:text-white p-1 rounded-lg"><i data-lucide="x" class="w-5 h-5"></i></button>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-300 uppercase mb-1">Mission / Task Name</label>
                                <input type="text" id="modal-task-name" value="${currentTask.taskName || ''}" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-danger-500" placeholder="e.g. Deep Study / Workout">
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-300 uppercase mb-1">Completion Status</label>
                                <div class="grid grid-cols-4 gap-2">
                                    <button type="button" onclick="setModalStatus(0)" id="status-btn-0" class="py-2.5 rounded-xl border text-xs font-bold transition ${currentTask.status === 0 ? 'bg-slate-800 border-slate-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}">0%</button>
                                    <button type="button" onclick="setModalStatus(50)" id="status-btn-50" class="py-2.5 rounded-xl border text-xs font-bold transition ${currentTask.status === 50 ? 'bg-amber-950/60 border-amber-600 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'}">50%</button>
                                    <button type="button" onclick="setModalStatus(100)" id="status-btn-100" class="py-2.5 rounded-xl border text-xs font-bold transition ${currentTask.status === 100 ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'}">100%</button>
                                    <button type="button" onclick="setModalStatus(-100)" id="status-btn-neg100" class="py-2.5 rounded-xl border text-xs font-bold transition ${currentTask.status === -100 ? 'bg-danger-950 border-danger-600 text-danger-300' : 'bg-slate-950 border-slate-800 text-slate-400'}">-100%</button>
                                </div>
                                <input type="hidden" id="modal-status-val" value="${currentTask.status}">
                            </div>

                            <div class="flex items-center gap-3 pt-2">
                                <button onclick="saveCellTask('${taskKey}')" class="flex-1 bg-danger-600 hover:bg-danger-700 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-danger-600/30">Save Task</button>
                                <button onclick="clearCellTask('${taskKey}')" class="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-3 rounded-xl transition border border-slate-700">Clear</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            lucide.createIcons();
        }

        function setModalStatus(val) {
            document.getElementById('modal-status-val').value = val;
            ['0', '50', '100', 'neg100'].forEach(k => {
                const btn = document.getElementById(`status-btn-${k}`);
                if (btn) {
                    btn.className = 'py-2.5 rounded-xl border text-xs font-bold transition bg-slate-950 border-slate-800 text-slate-400';
                }
            });
            const activeKey = val === -100 ? 'neg100' : val;
            const activeBtn = document.getElementById(`status-btn-${activeKey}`);
            if (activeBtn) {
                if (val === 100) activeBtn.className = 'py-2.5 rounded-xl border text-xs font-bold transition bg-emerald-950/60 border-emerald-600 text-emerald-300';
                else if (val === 50) activeBtn.className = 'py-2.5 rounded-xl border text-xs font-bold transition bg-amber-950/60 border-amber-600 text-amber-300';
                else if (val === -100) activeBtn.className = 'py-2.5 rounded-xl border text-xs font-bold transition bg-danger-950 border-danger-600 text-danger-300';
                else activeBtn.className = 'py-2.5 rounded-xl border text-xs font-bold transition bg-slate-800 border-slate-500 text-white';
            }
        }

        function saveCellTask(taskKey) {
            const taskName = document.getElementById('modal-task-name').value.trim();
            const status = parseInt(document.getElementById('modal-status-val').value, 10) || 0;

            if (!appState.data.tasks[appState.selectedMonth]) {
                appState.data.tasks[appState.selectedMonth] = {};
            }
            appState.data.tasks[appState.selectedMonth][taskKey] = { taskName, status };
            saveData();
            closeModal();
            renderPage();
            showToast("Mission task saved successfully.");
        }

        function clearCellTask(taskKey) {
            if (appState.data.tasks[appState.selectedMonth] && appState.data.tasks[appState.selectedMonth][taskKey]) {
                delete appState.data.tasks[appState.selectedMonth][taskKey];
                saveData();
            }
            closeModal();
            renderPage();
            showToast("Mission task cleared.");
        }

        function closeModal() {
            document.getElementById('modal-container').innerHTML = '';
        }

        /* ==========================================
           SHOAIB'S EMPIRE COUNTER SYSTEM & HISTORY MODAL
           ========================================== */
        function addAtogotiEntry() {
            appState.data.atogoti.count += 1;
            if (!appState.data.atogoti.history) appState.data.atogoti.history = [];
            appState.data.atogoti.history.unshift({
                id: Date.now(),
                timestamp: new Date().toISOString(),
                note: "Manual Shoaib's Empire increment (+1)",
                correct: true
            });
            saveData();
            updateHeaderInfo();
            const counterEl = document.getElementById('dash-atogoti-count');
            if (counterEl) counterEl.innerText = appState.data.atogoti.count;
            showToast("Shoaib's Empire increased by +1! Discipline recorded.");
        }

        function openAtogotiHistoryModal() {
            const history = appState.data.atogoti.history || [];
            let historyHtml = '';
            history.forEach(h => {
                const dateStr = new Date(h.timestamp).toLocaleString();
                const statusBadge = h.correct ? '<span class="text-xs bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">Valid</span>' : '<span class="text-xs bg-danger-950 text-danger-400 px-2 py-0.5 rounded-full font-semibold">Marked Incorrect</span>';
                historyHtml += `
                    <div class="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl mb-2">
                        <div>
                            <p class="text-xs font-mono text-slate-300">${dateStr}</p>
                            <p class="text-xs text-slate-400 mt-0.5">${h.note}</p>
                        </div>
                        <div class="flex items-center gap-3">
                            ${statusBadge}
                            ${h.correct ? `<button onclick="markAtogotiIncorrect(${h.id})" class="text-xs text-danger-400 hover:text-danger-300 underline">Mark Incorrect</button>` : ''}
                        </div>
                    </div>
                `;
            });

            const modalContainer = document.getElementById('modal-container');
            modalContainer.innerHTML = `
                <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div class="bg-slate-900 border border-danger-700/60 rounded-3xl p-6 max-w-xl w-full shadow-2xl">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 rounded-full bg-danger-500 animate-pulse"></div>
                                <h3 class="font-bold text-white text-lg">Shoaib's Empire Permanent History</h3>
                            </div>
                            <button onclick="closeModal()" class="text-slate-400 hover:text-white p-1 rounded-lg"><i data-lucide="x" class="w-5 h-5"></i></button>
                        </div>
                        <div class="bg-danger-950/40 border border-danger-900 p-3 rounded-xl mb-4 text-xs text-danger-200">
                            Current Shoaib's Empire Count: <strong class="text-white text-sm">${appState.data.atogoti.count}</strong>. Counter is increase-only. Accidental entries can be marked incorrect without subtracting from total.
                        </div>
                        <div class="max-h-[50vh] overflow-y-auto custom-scrollbar space-y-1">
                            ${historyHtml || '<p class="text-xs text-slate-500 text-center py-4">No entries recorded yet.</p>'}
                        </div>
                    </div>
                </div>
            `;
            lucide.createIcons();
        }

        function markAtogotiIncorrect(id) {
            const h = appState.data.atogoti.history.find(item => item.id === id);
            if (h) {
                h.correct = false;
                saveData();
                openAtogotiHistoryModal();
                showToast("Entry marked incorrect (Counter integrity preserved).", "danger");
            }
        }

        /* ==========================================
           4. HISTORY PAGE
           ========================================== */
        function renderHistoryPage() {
            const tasksMap = appState.data.tasks || {};
            const months = Object.keys(tasksMap).sort().reverse();
            if (!months.includes(appState.selectedMonth)) months.unshift(appState.selectedMonth);

            let monthsHtml = '';
            months.forEach(m => {
                const stats = calculateMonthStats(m);
                monthsHtml += `
                    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <h4 class="font-bold text-white text-lg">${m}</h4>
                                <span class="px-2.5 py-1 rounded-full bg-danger-950 text-danger-400 text-xs font-bold">${stats.completionPct}% Complete</span>
                            </div>
                            <div class="grid grid-cols-2 gap-3 text-xs text-slate-300 my-4">
                                <div class="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                    <p class="text-slate-500">Assigned Missions</p>
                                    <p class="text-base font-bold text-white mt-0.5">${stats.assignedTasks}</p>
                                </div>
                                <div class="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                    <p class="text-slate-500">Used Time</p>
                                    <p class="text-base font-bold text-white mt-0.5">${formatHoursMinutes(stats.usedTimeMinutes)}</p>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 pt-4 border-t border-slate-800">
                            <button onclick="changeSelectedMonth('${m}'); navigateTo('Register Office');" class="flex-1 bg-danger-600 hover:bg-danger-700 text-white text-xs font-semibold py-2.5 rounded-xl transition shadow">
                                View Tracker
                            </button>
                            <button onclick="downloadFullTrackerPDFForMonth('${m}')" class="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2.5 rounded-xl transition border border-slate-700" title="Download Tracker PDF">
                                <i data-lucide="file-text" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                `;
            });

            return `
                <div class="space-y-6 max-w-7xl mx-auto pb-16">
                    <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-bold text-white">Monthly Tracker Archive</h3>
                            <p class="text-xs text-slate-400 mt-1">Independent records for each month with continuous Shoaib's Empire counting.</p>
                        </div>
                        <button onclick="openAtogotiHistoryModal()" class="bg-danger-950 hover:bg-danger-900 text-danger-300 font-semibold px-4 py-2 rounded-xl text-xs border border-danger-700 transition">
                            View Shoaib's Empire History
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${monthsHtml}
                    </div>
                </div>
            `;
        }

        /* ==========================================
           5. MONTHLY PERFORMANCE & CALCULATIONS
           ========================================== */
        function getTasksForDay(monthKey, dayNum) {
            const timeSlots = appState.data.timeSlots || [];
            let tasks = [];
            timeSlots.forEach((slot, slotIdx) => {
                const taskKey = `${monthKey}_d${dayNum}_s${slotIdx}`;
                const t = (appState.data.tasks[monthKey] && appState.data.tasks[monthKey][taskKey]);
                if (t && t.taskName) {
                    tasks.push({ slotIdx, ...t });
                }
            });
            return tasks;
        }

        function calculateMonthStats(monthKey) {
            const timeSlots = appState.data.timeSlots || [];
            const totalDays = getDaysInMonth(monthKey);
            
            let assignedTasks = 0;
            let total100 = 0;
            let total50 = 0;
            let total0 = 0;
            let totalNeg100 = 0;
            let totalPoints = 0;
            let possiblePoints = 0;
            let usedTimeMinutes = 0;
            let wastedTimeMinutes = 0;

            for (let d = 1; d <= totalDays; d++) {
                timeSlots.forEach((slot, slotIdx) => {
                    const taskKey = `${monthKey}_d${d}_s${slotIdx}`;
                    const t = (appState.data.tasks[monthKey] && appState.data.tasks[monthKey][taskKey]);
                    if (t && t.taskName) {
                        assignedTasks++;
                        possiblePoints += 1;
                        if (t.status === 100) {
                            total100++;
                            totalPoints += 1;
                            usedTimeMinutes += 30;
                        } else if (t.status === 50) {
                            total50++;
                            totalPoints += 0.5;
                            usedTimeMinutes += 15;
                        } else if (t.status === 0) {
                            total0++;
                            wastedTimeMinutes += 30;
                        } else if (t.status === -100) {
                            totalNeg100++;
                            // negative time entry rules
                        }
                    }
                });
            }

            const completionPct = possiblePoints > 0 ? Math.round((totalPoints / possiblePoints) * 100) : 0;
            const scheduledTimeMinutes = assignedTasks * 30;

            return {
                assignedTasks,
                total100,
                total50,
                total0,
                totalNeg100,
                completionPct,
                scheduledTimeMinutes,
                usedTimeMinutes,
                wastedTimeMinutes
            };
        }

        function formatHoursMinutes(mins) {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `${h}h ${m}m`;
        }

        function renderMonthlyPerformancePage() {
            const stats = calculateMonthStats(appState.selectedMonth);
            
            // Previous month comparison
            const [y, m] = appState.selectedMonth.split('-').map(Number);
            const prevDate = new Date(y, m - 2, 1);
            const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth()+1).padStart(2,'0')}`;
            const prevStats = calculateMonthStats(prevMonthKey);

            return `
                <div class="space-y-6 max-w-7xl mx-auto pb-16">
                    <!-- Top Bar -->
                    <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h3 class="text-lg font-bold text-white">Monthly Performance Analytics</h3>
                            <p class="text-xs text-slate-400 mt-1">Automatic weighted productivity metrics & comparison for ${appState.selectedMonth}</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <input type="month" value="${appState.selectedMonth}" onchange="changeSelectedMonth(this.value)" class="bg-slate-950 border border-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-danger-500">
                            <button onclick="downloadPerformancePDF()" class="bg-danger-600 hover:bg-danger-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-danger-600/30">
                                Download Performance PDF
                            </button>
                        </div>
                    </div>

                    <!-- Statistics Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall Completion</span>
                            <div class="text-3xl font-bold text-white mt-1">${stats.completionPct}%</div>
                            <p class="text-xs text-emerald-400 mt-1">vs ${prevStats.completionPct}% last month</p>
                        </div>
                        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned Missions</span>
                            <div class="text-3xl font-bold text-white mt-1">${stats.assignedTasks}</div>
                            <p class="text-xs text-slate-400 mt-1">100%(${stats.total100}) | 50%(${stats.total50}) | 0%(${stats.total0})</p>
                        </div>
                        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Used Time</span>
                            <div class="text-3xl font-bold text-white mt-1">${formatHoursMinutes(stats.usedTimeMinutes)}</div>
                            <p class="text-xs text-blue-400 mt-1">Productive time logged</p>
                        </div>
                        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Negative Entries (-100%)</span>
                            <div class="text-3xl font-bold text-danger-400 mt-1">${stats.totalNeg100}</div>
                            <p class="text-xs text-slate-400 mt-1">Explicitly marked negative slots</p>
                        </div>
                    </div>

                    <!-- Charts Grid -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                            <h4 class="font-bold text-white text-sm mb-4 flex items-center gap-2">
                                <i data-lucide="bar-chart-2" class="w-4 h-4 text-danger-500"></i> Task Completion Distribution
                            </h4>
                            <div class="h-64 flex items-center justify-center">
                                <canvas id="chart-distribution" class="w-full h-full"></canvas>
                            </div>
                        </div>

                        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                            <h4 class="font-bold text-white text-sm mb-4 flex items-center gap-2">
                                <i data-lucide="pie-chart" class="w-4 h-4 text-blue-500"></i> Used Time vs Wasted Time
                            </h4>
                            <div class="h-64 flex items-center justify-center">
                                <canvas id="chart-timelog" class="w-full h-full"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderCharts() {
            // Simple canvas rendering helper
            const stats = calculateMonthStats(appState.selectedMonth);
            
            const canvasDist = document.getElementById('chart-distribution');
            if (canvasDist) {
                const ctx = canvasDist.getContext('2d');
                canvasDist.width = canvasDist.parentElement.clientWidth;
                canvasDist.height = 250;
                
                const total = stats.assignedTasks || 1;
                const p100 = (stats.total100 / total) * canvasDist.height;
                const p50 = (stats.total50 / total) * canvasDist.height;
                const p0 = (stats.total0 / total) * canvasDist.height;

                ctx.clearRect(0, 0, canvasDist.width, canvasDist.height);
                
                // Draw simple bar visualization
                const barWidth = 60;
                const gap = 40;
                let startX = 60;

                // 100% bar
                ctx.fillStyle = '#10b981';
                ctx.fillRect(startX, canvasDist.height - p100 - 30, barWidth, p100);
                ctx.fillStyle = '#cbd5e1';
                ctx.font = '12px Inter';
                ctx.fillText(`100% (${stats.total100})`, startX, canvasDist.height - 10);

                // 50% bar
                startX += barWidth + gap;
                ctx.fillStyle = '#f59e0b';
                ctx.fillRect(startX, canvasDist.height - p50 - 30, barWidth, p50);
                ctx.fillStyle = '#cbd5e1';
                ctx.fillText(`50% (${stats.total50})`, startX, canvasDist.height - 10);

                // 0% bar
                startX += barWidth + gap;
                ctx.fillStyle = '#64748b';
                ctx.fillRect(startX, canvasDist.height - p0 - 30, barWidth, p0);
                ctx.fillStyle = '#cbd5e1';
                ctx.fillText(`0% (${stats.total0})`, startX, canvasDist.height - 10);
            }

            const canvasTime = document.getElementById('chart-timelog');
            if (canvasTime) {
                const ctx = canvasTime.getContext('2d');
                canvasTime.width = canvasTime.parentElement.clientWidth;
                canvasTime.height = 250;

                ctx.clearRect(0, 0, canvasTime.width, canvasTime.height);
                const used = stats.usedTimeMinutes;
                const wasted = stats.wastedTimeMinutes;
                const max = Math.max(used, wasted, 60);

                const uHeight = (used / max) * (canvasTime.height - 50);
                const wHeight = (wasted / max) * (canvasTime.height - 50);

                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(80, canvasTime.height - uHeight - 30, 80, uHeight);
                ctx.fillStyle = '#cbd5e1';
                ctx.fillText(`Used (${formatHoursMinutes(used)})`, 70, canvasTime.height - 10);

                ctx.fillStyle = '#f59e0b';
                ctx.fillRect(220, canvasTime.height - wHeight - 30, 80, wHeight);
                ctx.fillStyle = '#cbd5e1';
                ctx.fillText(`Wasted (${formatHoursMinutes(wasted)})`, 210, canvasTime.height - 10);
            }
        }

        /* ==========================================
           6. SMART PDF EXPORT SYSTEM
           ========================================== */
        function getCompletionLabel(status) {
            if (status === 100) return 'Complete';
            if (status === 50) return 'Partial';
            if (status === -100) return 'Negative';
            return 'Open';
        }

        function getMonthLabel(monthKey) {
            const [year, month] = monthKey.split('-').map(Number);
            return new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
        }

        function buildSmartReportShell(title, subtitle, bodyHtml) {
            return `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${title}</title>
                    <style>
                        body {
                            margin: 0;
                            font-family: 'Inter', 'Segoe UI', sans-serif;
                            background: #f8fafc;
                            color: #0f172a;
                        }
                        * { box-sizing: border-box; }
                        .report-shell {
                            max-width: 1080px;
                            margin: 32px auto;
                            background: #ffffff;
                            border: 1px solid #e2e8f0;
                            border-radius: 22px;
                            padding: 28px;
                            box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
                        }
                        .report-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            gap: 16px;
                            border-bottom: 1px solid #e2e8f0;
                            padding-bottom: 18px;
                            margin-bottom: 24px;
                        }
                        .report-kicker {
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                            background: #fee2e2;
                            color: #991b1b;
                            font-size: 11px;
                            letter-spacing: 0.12em;
                            padding: 6px 10px;
                            border-radius: 999px;
                            text-transform: uppercase;
                            font-weight: 800;
                        }
                        .report-title {
                            margin: 10px 0 4px;
                            font-size: 30px;
                            line-height: 1.1;
                            letter-spacing: -0.04em;
                            font-weight: 800;
                            color: #0f172a;
                        }
                        .report-subtitle {
                            margin: 0;
                            color: #475569;
                            font-size: 14px;
                        }
                        .report-meta {
                            text-align: right;
                            font-size: 12px;
                            color: #475569;
                            min-width: 150px;
                        }
                        .report-grid {
                            display: grid;
                            grid-template-columns: repeat(4, minmax(0, 1fr));
                            gap: 14px;
                            margin-bottom: 24px;
                        }
                        .report-card {
                            background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
                            border: 1px solid #e2e8f0;
                            border-radius: 16px;
                            padding: 18px;
                        }
                        .report-card-label {
                            font-size: 11px;
                            letter-spacing: 0.1em;
                            text-transform: uppercase;
                            color: #64748b;
                            font-weight: 700;
                            margin-bottom: 8px;
                        }
                        .report-card-value {
                            font-size: 28px;
                            font-weight: 800;
                            color: #0f172a;
                            letter-spacing: -0.05em;
                        }
                        .report-card-foot {
                            margin-top: 6px;
                            font-size: 12px;
                            color: #475569;
                        }
                        .report-panel {
                            background: #f8fafc;
                            border: 1px solid #e2e8f0;
                            border-radius: 16px;
                            padding: 18px 20px;
                            margin-bottom: 24px;
                        }
                        .report-panel h3 {
                            margin: 0 0 12px;
                            font-size: 14px;
                            color: #0f172a;
                            text-transform: uppercase;
                            letter-spacing: 0.12em;
                        }
                        .insight-list {
                            margin: 0;
                            padding-left: 18px;
                            color: #334155;
                            font-size: 14px;
                            line-height: 1.8;
                        }
                        .report-table-wrap {
                            overflow: hidden;
                            border: 1px solid #e2e8f0;
                            border-radius: 16px;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            font-size: 12px;
                        }
                        th, td {
                            padding: 12px 10px;
                            border-bottom: 1px solid #e2e8f0;
                            text-align: left;
                            vertical-align: top;
                        }
                        th {
                            background: #0f172a;
                            color: #f8fafc;
                            font-size: 11px;
                            letter-spacing: 0.09em;
                            text-transform: uppercase;
                            font-weight: 700;
                        }
                        tbody tr:nth-child(even) {
                            background: #f8fafc;
                        }
                        .status-pill {
                            display: inline-block;
                            padding: 4px 8px;
                            border-radius: 999px;
                            font-size: 10px;
                            font-weight: 700;
                            letter-spacing: 0.06em;
                            text-transform: uppercase;
                        }
                        .status-complete { background: #dcfce7; color: #166534; }
                        .status-partial { background: #fef3c7; color: #92400e; }
                        .status-negative { background: #fee2e2; color: #991b1b; }
                        .status-open { background: #e2e8f0; color: #475569; }
                        @media print {
                            body { background: #ffffff; }
                            .report-shell {
                                box-shadow: none;
                                border: none;
                                border-radius: 0;
                                margin: 0;
                                padding: 0;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="report-shell">
                        ${bodyHtml}
                    </div>
                </body>
                </html>
            `;
        }

        function openSmartReportPopup(reportHtml, fileName) {
            const reportWindow = window.open('', '_blank', 'width=1200,height=900');
            if (!reportWindow) {
                showToast('Report popup was blocked. Please allow popups and retry.', 'danger');
                return;
            }

            reportWindow.document.write(buildSmartReportShell(fileName, '', reportHtml));
            reportWindow.document.close();
            setTimeout(() => {
                try {
                    reportWindow.focus();
                    reportWindow.print();
                } catch (error) {
                    console.error('PDF report print error:', error);
                }
            }, 350);
        }

        function buildTrackerReportHtml(monthKey) {
            const totalDays = getDaysInMonth(monthKey);
            const stats = calculateMonthStats(monthKey);
            const daySummaries = [];
            let bestDay = { day: 1, score: -1 };
            let worstDay = { day: 1, score: 101 };

            for (let day = 1; day <= totalDays; day++) {
                const dayTasks = getTasksForDay(monthKey, day);
                const complete = dayTasks.filter(t => t.status === 100).length;
                const partial = dayTasks.filter(t => t.status === 50).length;
                const total = dayTasks.length || 1;
                const score = Math.round(((complete + (partial * 0.5)) / total) * 100);

                daySummaries.push({
                    day,
                    complete,
                    partial,
                    total,
                    score,
                    open: dayTasks.filter(t => t.status === 0 || t.status === -100).length
                });

                if (score > bestDay.score) bestDay = { day, score };
                if (score < worstDay.score) worstDay = { day, score };
            }

            const topDays = daySummaries
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map(item => `<li>Day ${item.day}: ${item.score}% completion with ${item.complete} complete and ${item.partial} partial slots.</li>`)
                .join('');

            const dayRows = daySummaries.map(item => `
                <tr>
                    <td>Day ${item.day}</td>
                    <td>${item.total}</td>
                    <td>${item.complete}</td>
                    <td>${item.partial}</td>
                    <td>${item.open}</td>
                    <td>${item.score}%</td>
                </tr>
            `).join('');

            return `
                <div class="report-header">
                    <div>
                        <div class="report-kicker">Shoaib's Empire</div>
                        <h1 class="report-title">Monthly Mission Report</h1>
                        <p class="report-subtitle">${getMonthLabel(monthKey)} • Tactical schedule and activity summary</p>
                    </div>
                    <div class="report-meta">
                        Generated: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br>
                        Shoaib's Empire Count: ${appState.data.atogoti.count}
                    </div>
                </div>

                <div class="report-grid">
                    <div class="report-card">
                        <div class="report-card-label">Completion</div>
                        <div class="report-card-value">${stats.completionPct}%</div>
                        <div class="report-card-foot">Weighted completion rate</div>
                    </div>
                    <div class="report-card">
                        <div class="report-card-label">Assigned</div>
                        <div class="report-card-value">${stats.assignedTasks}</div>
                        <div class="report-card-foot">Mission entries</div>
                    </div>
                    <div class="report-card">
                        <div class="report-card-label">Used Time</div>
                        <div class="report-card-value">${formatHoursMinutes(stats.usedTimeMinutes)}</div>
                        <div class="report-card-foot">Productive work</div>
                    </div>
                    <div class="report-card">
                        <div class="report-card-label">Best Day</div>
                        <div class="report-card-value">${bestDay.score}%</div>
                        <div class="report-card-foot">Day ${bestDay.day}</div>
                    </div>
                </div>

                <div class="report-panel">
                    <h3>Executive summary</h3>
                    <ul class="insight-list">
                        <li>The month is currently tracking at <strong>${stats.completionPct}%</strong> completion across <strong>${stats.assignedTasks}</strong> assigned slots.</li>
                        <li>Best performing day: <strong>Day ${bestDay.day}</strong> with <strong>${bestDay.score}%</strong> completion.</li>
                        <li>Lowest performing day: <strong>Day ${worstDay.day}</strong> with <strong>${worstDay.score}%</strong> completion.</li>
                        <li>Productive time logged: <strong>${formatHoursMinutes(stats.usedTimeMinutes)}</strong>, with <strong>${formatHoursMinutes(stats.wastedTimeMinutes)}</strong> flagged as wasted or open time.</li>
                        ${topDays}
                    </ul>
                </div>

                <div class="report-table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Total</th>
                                <th>Complete</th>
                                <th>Partial</th>
                                <th>Open</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dayRows}
                        </tbody>
                    </table>
                </div>
            `;
        }

        function buildPerformanceReportHtml(monthKey) {
            const stats = calculateMonthStats(monthKey);
            const [year, month] = monthKey.split('-').map(Number);
            const prevDate = new Date(year, month - 2, 1);
            const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
            const prevStats = calculateMonthStats(prevMonthKey);
            const delta = stats.completionPct - prevStats.completionPct;
            const recommendation = stats.total0 > stats.total100
                ? 'Focus on reducing open slots and re-prioritizing the next block of work.'
                : 'Maintain your current rhythm, and protect your high-output blocks from disruption.';

            return `
                <div class="report-header">
                    <div>
                        <div class="report-kicker">Performance Report</div>
                        <h1 class="report-title">Monthly Productivity Analysis</h1>
                        <p class="report-subtitle">${getMonthLabel(monthKey)} • Strategy review and output measurement</p>
                    </div>
                    <div class="report-meta">
                        Generated: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br>
                        Shoaib's Empire Count: ${appState.data.atogoti.count}
                    </div>
                </div>

                <div class="report-grid">
                    <div class="report-card">
                        <div class="report-card-label">Overall Completion</div>
                        <div class="report-card-value">${stats.completionPct}%</div>
                        <div class="report-card-foot">${delta >= 0 ? '+' : ''}${delta}% vs last month</div>
                    </div>
                    <div class="report-card">
                        <div class="report-card-label">Assigned Missions</div>
                        <div class="report-card-value">${stats.assignedTasks}</div>
                        <div class="report-card-foot">${stats.total100} complete / ${stats.total50} partial</div>
                    </div>
                    <div class="report-card">
                        <div class="report-card-label">Used Time</div>
                        <div class="report-card-value">${formatHoursMinutes(stats.usedTimeMinutes)}</div>
                        <div class="report-card-foot">Productive session hours</div>
                    </div>
                    <div class="report-card">
                        <div class="report-card-label">Negative Entries</div>
                        <div class="report-card-value">${stats.totalNeg100}</div>
                        <div class="report-card-foot">Marked as blocked or negative</div>
                    </div>
                </div>

                <div class="report-panel">
                    <h3>Insight summary</h3>
                    <ul class="insight-list">
                        <li>Your current month scored <strong>${stats.completionPct}%</strong> completion against a previous month baseline of <strong>${prevStats.completionPct}%</strong>.</li>
                        <li>You logged <strong>${formatHoursMinutes(stats.usedTimeMinutes)}</strong> of effective work and <strong>${formatHoursMinutes(stats.wastedTimeMinutes)}</strong> of wasted or inactive time.</li>
                        <li><strong>${stats.total0}</strong> slots are currently unproductive or open, which is the biggest opportunity for improvement.</li>
                        <li>Recommendation: <strong>${recommendation}</strong></li>
                    </ul>
                </div>

                <div class="report-table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>Current</th>
                                <th>Previous</th>
                                <th>Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Completion Rate</td>
                                <td>${stats.completionPct}%</td>
                                <td>${prevStats.completionPct}%</td>
                                <td>${delta >= 0 ? '+' : ''}${delta}%</td>
                            </tr>
                            <tr>
                                <td>Assigned Missions</td>
                                <td>${stats.assignedTasks}</td>
                                <td>${prevStats.assignedTasks}</td>
                                <td>${stats.assignedTasks - prevStats.assignedTasks}</td>
                            </tr>
                            <tr>
                                <td>Used Time</td>
                                <td>${formatHoursMinutes(stats.usedTimeMinutes)}</td>
                                <td>${formatHoursMinutes(prevStats.usedTimeMinutes)}</td>
                                <td>${formatHoursMinutes(Math.max(0, stats.usedTimeMinutes - prevStats.usedTimeMinutes))}</td>
                            </tr>
                            <tr>
                                <td>Wasted / Open Time</td>
                                <td>${formatHoursMinutes(stats.wastedTimeMinutes)}</td>
                                <td>${formatHoursMinutes(prevStats.wastedTimeMinutes)}</td>
                                <td>${formatHoursMinutes(Math.max(0, stats.wastedTimeMinutes - prevStats.wastedTimeMinutes))}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        }

        function downloadFullTrackerPDF() {
            const reportHtml = buildTrackerReportHtml(appState.selectedMonth);
            openSmartReportPopup(reportHtml, `Shoaib's Empire - ${appState.selectedMonth}`);
        }

        function downloadFullTrackerPDFForMonth(monthKey) {
            appState.selectedMonth = monthKey;
            renderPage();
            const reportHtml = buildTrackerReportHtml(monthKey);
            openSmartReportPopup(reportHtml, `Shoaib's Empire - ${monthKey}`);
        }

        function downloadPerformancePDF() {
            const reportHtml = buildPerformanceReportHtml(appState.selectedMonth);
            openSmartReportPopup(reportHtml, `Performance Report - ${appState.selectedMonth}`);
        }

        /* ==========================================
           7. ADDITIONAL PAGES (Meditation, Army, Study, Settings)
           ========================================== */
        function renderMeditationPage() {
            const history = appState.data.meditationHistory || [];
            return `
                <div class="space-y-6 max-w-5xl mx-auto pb-16">
                    <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-bold text-white">Daily Meditation & Mindfulness</h3>
                            <p class="text-xs text-slate-400 mt-1">Track duration, spiritual clarity, and daily mindfulness goals.</p>
                        </div>
                        <button onclick="logMeditationSession()" class="bg-danger-600 hover:bg-danger-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow">
                            + Log Session (20 mins)
                        </button>
                    </div>

                    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <h4 class="font-bold text-white text-sm mb-4">Meditation History Log</h4>
                        <div class="space-y-2">
                            ${history.length > 0 ? history.map(h => `
                                <div class="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                                    <span class="text-xs font-mono text-slate-300">${new Date(h.timestamp).toLocaleString()}</span>
                                    <span class="text-xs font-bold text-emerald-400">${h.duration} Minutes</span>
                                </div>
                            `).join('') : '<p class="text-xs text-slate-500 text-center py-6">No meditation sessions logged yet.</p>'}
                        </div>
                    </div>
                </div>
            `;
        }

        function logMeditationSession() {
            if (!appState.data.meditationHistory) appState.data.meditationHistory = [];
            appState.data.meditationHistory.unshift({ timestamp: new Date().toISOString(), duration: 20 });
            saveData();
            renderPage();
            showToast("Meditation session logged (+20 mins).");
        }

        function renderArmyPage() {
            const workouts = appState.data.armyWorkouts || [];
            return `
                <div class="space-y-6 max-w-5xl mx-auto pb-16">
                    <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-bold text-white">Army Discipline & Fitness Tracker</h3>
                            <p class="text-xs text-slate-400 mt-1">Military physical training, running, and strength logs.</p>
                        </div>
                        <button onclick="logArmyWorkout()" class="bg-danger-600 hover:bg-danger-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow">
                            + Log PT Session
                        </button>
                    </div>

                    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <h4 class="font-bold text-white text-sm mb-4">Physical Training History</h4>
                        <div class="space-y-2">
                            ${workouts.length > 0 ? workouts.map(w => `
                                <div class="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                                    <span class="text-xs font-mono text-slate-300">${new Date(w.timestamp).toLocaleString()}</span>
                                    <span class="text-xs font-bold text-danger-400">${w.title}</span>
                                </div>
                            `).join('') : '<p class="text-xs text-slate-500 text-center py-6">No workouts logged yet.</p>'}
                        </div>
                    </div>
                </div>
            `;
        }

        function logArmyWorkout() {
            if (!appState.data.armyWorkouts) appState.data.armyWorkouts = [];
            appState.data.armyWorkouts.unshift({ timestamp: new Date().toISOString(), title: "Morning 5KM Run & Strength Conditioning" });
            saveData();
            renderPage();
            showToast("Army PT session logged successfully.");
        }

        function renderStudyRoomPage() {
            const topics = appState.data.studyTopics || [];
            return `
                <div class="space-y-6 max-w-5xl mx-auto pb-16">
                    <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-bold text-white">Study Room & Academic Mastery</h3>
                            <p class="text-xs text-slate-400 mt-1">Manage subjects, topics, and study hours.</p>
                        </div>
                        <button onclick="addStudyTopic()" class="bg-danger-600 hover:bg-danger-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow">
                            + Add Study Topic
                        </button>
                    </div>

                    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <h4 class="font-bold text-white text-sm mb-4">Active Study Topics</h4>
                        <div class="space-y-2">
                            ${topics.length > 0 ? topics.map(t => `
                                <div class="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                                    <span class="text-xs font-medium text-slate-200">${t.name}</span>
                                    <span class="text-xs bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">${t.hours} Hours Logged</span>
                                </div>
                            `).join('') : '<p class="text-xs text-slate-500 text-center py-6">No study topics added yet.</p>'}
                        </div>
                    </div>
                </div>
            `;
        }

        function addStudyTopic() {
            if (!appState.data.studyTopics) appState.data.studyTopics = [];
            appState.data.studyTopics.push({ name: "Advanced Tactical Systems & Architecture", hours: 4 });
            saveData();
            renderPage();
            showToast("Study topic added.");
        }

        function renderSettingsPage() {
            return `
                <div class="space-y-6 max-w-3xl mx-auto pb-16">
                    <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                        <h3 class="text-lg font-bold text-white">Data Management & JSON Backups</h3>
                        <p class="text-xs text-slate-400">Export your local storage data as a JSON file or restore from a previous backup.</p>
                        
                        <div class="flex flex-wrap items-center gap-3 pt-2">
                            <button onclick="exportJSONBackup()" class="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition flex items-center gap-2">
                                <i data-lucide="download" class="w-4 h-4 text-danger-400"></i> Export JSON Backup
                            </button>
                            <label class="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition flex items-center gap-2">
                                <i data-lucide="upload" class="w-4 h-4 text-emerald-400"></i> Import JSON Backup
                                <input type="file" accept=".json" onchange="importJSONBackup(event)" class="hidden">
                            </label>
                        </div>
                    </div>

                    <div class="bg-slate-900 border border-danger-900/60 p-6 rounded-2xl shadow-xl space-y-4">
                        <h3 class="text-lg font-bold text-danger-400">Danger Zone</h3>
                        <p class="text-xs text-slate-400">Clear all local storage data and reset the tracker to factory state.</p>
                        <button onclick="clearAllData()" class="bg-danger-600 hover:bg-danger-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow">
                            Clear All Data & Reset
                        </button>
                    </div>
                </div>
            `;
        }

        function exportJSONBackup() {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState.data, null, 2));
            const dlAnchor = document.createElement('a');
            dlAnchor.setAttribute("href", dataStr);
            dlAnchor.setAttribute("download", `atogoti_tracker_backup_${getCurrentMonthKey()}.json`);
            document.body.appendChild(dlAnchor);
            dlAnchor.click();
            dlAnchor.remove();
            showToast("JSON backup exported successfully.");
        }

        function importJSONBackup(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const parsed = JSON.parse(e.target.result);
                    if (parsed && parsed.atogoti) {
                        appState.data = parsed;
                        saveData();
                        renderPage();
                        showToast("JSON backup imported successfully.");
                    } else {
                        showToast("Invalid backup file structure.", "danger");
                    }
                } catch (err) {
                    showToast("Error parsing JSON file.", "danger");
                }
            };
            reader.readAsText(file);
        }

        function clearAllData() {
            if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
                localStorage.removeItem(STORAGE_KEY_DATA);
                localStorage.removeItem(STORAGE_KEY_USER);
                location.reload();
            }
        }

        /* ==========================================
           INITIALIZATION ON WINDOW LOAD
           ========================================== */
        window.onload = function() {
            loadData();
            if (!appState.currentUser) {
                appState.currentPage = 'Login';
            }
            renderSidebarNav();
            renderPage();
        };