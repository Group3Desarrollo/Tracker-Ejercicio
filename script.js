document.addEventListener('DOMContentLoaded', () => {

    // =========================
    // SUPABASE INIT
    // =========================
    const supabaseClient = supabase.createClient(
        "https://ovcvgufkvrpngaehqjlz.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92Y3ZndWZrdnJwbmdhZWhxamx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NzI4NTAsImV4cCI6MjA5MzI0ODg1MH0.5w6uSpvNWmf3ZUVntoDjh44BabN3EGu2IvejunZIn0U"
    );

    // =========================
    // ICONS (SVGs)
    // =========================
    const ICON_CHECK = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    const ICON_CROSS = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    const ICON_REST = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path></svg>`;


    // =========================
    // VISTAS
    // =========================
    const loginView = document.getElementById('login-view');
    const menuView = document.getElementById('menu-view');
    const trackerView = document.getElementById('tracker-view');
    const skincareSetupView = document.getElementById('skincare-setup-view');
    const skincareTrackerView = document.getElementById('skincare-tracker-view');
    const skincareDayView = document.getElementById('skincare-day-view');
    const skincareEditView = document.getElementById('skincare-edit-view');

    // LOGIN
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');

    // NAV
    const navTrackerBtn = document.getElementById('nav-tracker');
    const backToMenuBtn = document.getElementById('back-to-menu');
    const navSkincareBtn = document.getElementById('nav-skincare');

    // SKINCARE WIZARD
    const backFromSkincareSetupBtn = document.getElementById('back-from-skincare-setup');
    const setupQuestion = document.getElementById('setup-question');
    const setupStepName = document.getElementById('skincare-step-name');
    const setupStepStart = document.getElementById('skincare-step-start');
    const setupStepEnd = document.getElementById('skincare-step-end');
    const setupNextBtn = document.getElementById('setup-next-btn');
    const setupFinishBtn = document.getElementById('setup-finish-btn');
    const setupError = document.getElementById('setup-error');

    // SKINCARE TRACKER
    const backFromSkincareTrackerBtn = document.getElementById('back-from-skincare-tracker');
    const editSkincareBtn = document.getElementById('edit-skincare-btn');
    const resetSkincareBtn = document.getElementById('reset-skincare-btn');
    const skincareTrackerGrid = document.getElementById('skincare-tracker-grid');

    // SKINCARE EDIT
    const backFromSkincareEditBtn = document.getElementById('back-from-skincare-edit');
    const skincareEditList = document.getElementById('skincare-edit-list');
    const skincareEditAddBtn = document.getElementById('skincare-edit-add-btn');
    const skincareEditSaveBtn = document.getElementById('skincare-edit-save-btn');
    const editError = document.getElementById('edit-error');
    const skincareCurrentMonthDisplay = document.getElementById('skincare-current-month-display');
    const skincarePrevMonthBtn = document.getElementById('skincare-prev-month');
    const skincareNextMonthBtn = document.getElementById('skincare-next-month');

    // SKINCARE DAY
    const backToSkincareTrackerBtn = document.getElementById('back-to-skincare-tracker');
    const skincareDayTitle = document.getElementById('skincare-day-title');
    const skincareStepsList = document.getElementById('skincare-steps-list');
    const skincareDayProgressBar = document.getElementById('skincare-day-progress-bar');
    const skincareDayProgressText = document.getElementById('skincare-day-progress-text');

    // DAILY STATUS
    const dailyStatusContainer = document.getElementById('daily-status-container');
    const dailyStatusTitle = document.getElementById('daily-status-title');
    const dailyStatusDesc = document.getElementById('daily-status-desc');

    // TRACKER
    const trackerGrid = document.getElementById('tracker-grid');
    const currentMonthDisplay = document.getElementById('current-month-display');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    // =========================
    // DATA
    // =========================
    const MONTHS = [
        { name: 'Enero', days: 31 },
        { name: 'Febrero', days: 28 },
        { name: 'Marzo', days: 31 },
        { name: 'Abril', days: 30 },
        { name: 'Mayo', days: 31 },
        { name: 'Junio', days: 30 },
        { name: 'Julio', days: 31 },
        { name: 'Agosto', days: 31 },
        { name: 'Septiembre', days: 30 },
        { name: 'Octubre', days: 31 },
        { name: 'Noviembre', days: 30 },
        { name: 'Diciembre', days: 31 }
    ];

    const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    let currentMonthIndex = new Date().getMonth();
    let skincareMonthIndex = new Date().getMonth();
    let currentUser = null;
    let trackerData = {};
    let skincareRoutine = [];
    let skincareTrackerData = {};
    let currentSkincareDayKey = null;
    let isAppInitialized = false;
    let _initInProgress = false; // Mutex: evita llamadas concurrentes a initializeAppData

    // =========================
    // NAV
    // =========================
    function showView(view) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        view.classList.add('active');
    }

    // =========================
    // LOGIN
    // =========================
    loginBtn.addEventListener('click', async () => {
        const email = usernameInput.value.trim();
        const password = passwordInput.value;

        loginBtn.disabled = true;
        loginBtn.textContent = "Cargando...";
        loginError.style.display = "none";

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                loginError.style.display = "block";
                loginError.textContent = error.message;
                return;
            }
            // La sesión la maneja onAuthStateChange → no llamar initializeAppData aquí

        } catch (err) {
            console.error(err);
            loginError.style.display = "block";
            loginError.textContent = "Error de conexión";
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = "Entrar";
        }
    });

    // =========================
    // LOGOUT
    // =========================
    logoutBtn.addEventListener('click', async () => {
        console.log("[Auth] Cerrando sesión manualmente.");
        await supabaseClient.auth.signOut();
        handleLogoutState();
    });

    function handleLogoutState() {
        currentUser = null;
        trackerData = {};
        skincareRoutine = [];
        skincareTrackerData = {};
        isAppInitialized = false;
        _initInProgress = false; // Resetear mutex en logout
        SkincareScheduler.stop();
        showView(loginView);
    }

    // =========================
    // NAV
    // =========================
    navTrackerBtn.addEventListener('click', () => {
        showView(trackerView);
        renderTracker();
    });

    backToMenuBtn.addEventListener('click', () => {
        showView(menuView);
        updateDailyStatus();
    });

    // Helper: wraps a Supabase query con timeout para evitar promesas colgadas
    function withTimeout(promise, ms = 12000, label = 'query') {
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`[Timeout] ${label} excedió ${ms}ms`)), ms)
        );
        return Promise.race([promise, timeout]);
    }

    // =========================
    // INIT & LOAD DATA
    // =========================
    async function initializeAppData() {
        // Mutex: evitar llamadas concurrentes o redundantes
        if (_initInProgress) {
            console.log('[App] Inicialización ya en progreso, ignorando llamada duplicada.');
            return;
        }
        if (isAppInitialized && currentUser) {
            console.log('[App] Ya inicializado, saltando.');
            return;
        }

        _initInProgress = true;
        console.log('[App] Inicializando datos globales...');

        try {
            await withTimeout(
                Promise.all([loadUserData(), loadSkincareData()]),
                12000,
                'initializeAppData'
            );
            console.log('[App] Datos globales cargados exitosamente.');
            isAppInitialized = true;
            updateDailyStatus();
            SkincareScheduler.scheduleDailyNotifications();
        } catch (error) {
            console.error('[App] Error crítico inicializando datos:', error);
            // Resetear flags para permitir reintento
            isAppInitialized = false;
        } finally {
            _initInProgress = false;
        }
    }

    async function loadUserData() {
        console.log('[App] Cargando tracker_data...');
        const { data, error } = await withTimeout(
            supabaseClient
                .from('tracker_data')
                .select('*')
                .eq('user_id', currentUser.id),
            10000,
            'loadUserData'
        );

        if (error) {
            console.error('[Data] Error cargando tracker_data:', error);
            return;
        }

        trackerData = {};
        (data || []).forEach(row => {
            trackerData[row.day_key] = row.status;
        });
        console.log('[App] tracker_data cargado.');
    }

    // =========================
    // SAVE DATA
    // =========================
    async function saveDayData(dayKey, status) {
        if (!currentUser) return;

        const { error } = await supabaseClient
            .from('tracker_data')
            .upsert({
                user_id: currentUser.id,
                day_key: dayKey,
                status: status
            }, {
                onConflict: 'user_id, day_key'
            });

        if (error) {
            console.error("Error guardando:", error);
        }
    }

    // =========================
    // DAILY STATUS
    // =========================
    function updateDailyStatus() {
        const today = new Date();
        const year = today.getFullYear();
        const dayKey = `${year}-${today.getMonth()}-${today.getDate()}`;

        const isDone = trackerData[dayKey] === 1;

        dailyStatusContainer.style.display = "block";
        dailyStatusContainer.classList.remove('status-success', 'status-pending');

        if (isDone) {
            dailyStatusContainer.classList.add('status-success');
            dailyStatusTitle.textContent = "¡Día completado!";
            dailyStatusDesc.textContent = "Rutina registrada.";
        } else {
            dailyStatusContainer.classList.add('status-pending');
            dailyStatusTitle.textContent = "Pendiente";
            dailyStatusDesc.textContent = "Aún no registras hoy.";
        }
    }

    // =========================
    // RENDER TRACKER
    // =========================
    function renderTracker() {

        trackerGrid.innerHTML = "";
        const month = MONTHS[currentMonthIndex];
        currentMonthDisplay.textContent = month.name;

        DAYS_OF_WEEK.forEach(d => {
            const el = document.createElement('div');
            el.className = "day-name";
            el.textContent = d;
            trackerGrid.appendChild(el);
        });

        const year = new Date().getFullYear();

        const firstDay = new Date(year, currentMonthIndex, 1).getDay();
        let offset = firstDay === 0 ? 6 : firstDay - 1;

        for (let i = 0; i < offset; i++) {
            const empty = document.createElement('div');
            empty.className = "empty-box";
            trackerGrid.appendChild(empty);
        }

        let restsCount = 0;
        for (let day = 1; day <= month.days; day++) {
            const key = `${year}-${currentMonthIndex}-${day}`;
            if (trackerData[key] === 2) {
                restsCount++;
            }
        }

        for (let day = 1; day <= month.days; day++) {

            const key = `${year}-${currentMonthIndex}-${day}`;
            const status = trackerData[key] || 0;

            const box = document.createElement('div');
            box.className = "day-box";

            const num = document.createElement('span');
            num.className = "day-number";
            num.textContent = day;

            const icon = document.createElement('span');
            icon.className = "day-icon";

            if (status === 1) {
                box.classList.add("status-1");
                icon.innerHTML = ICON_CHECK;
            } else if (status === 2) {
                if (restsCount > 4) {
                    box.classList.add("status-3");
                    icon.innerHTML = ICON_CROSS;
                } else {
                    box.classList.add("status-2");
                    icon.innerHTML = ICON_REST;
                }
            }

            box.appendChild(num);
            box.appendChild(icon);

            box.addEventListener('click', () => {

                const currentStatus = trackerData[key] || 0;
                const newStatus = (currentStatus + 1) % 3;

                trackerData[key] = newStatus;

                saveDayData(key, newStatus);

                renderTracker();
            });

            trackerGrid.appendChild(box);
        }
    }

    // =========================
    // MONTH NAV
    // =========================
    prevMonthBtn.addEventListener('click', () => {
        currentMonthIndex--;
        if (currentMonthIndex < 0) currentMonthIndex = 11;
        renderTracker();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonthIndex++;
        if (currentMonthIndex > 11) currentMonthIndex = 0;
        renderTracker();
    });

    // =========================
    // MANEJO DE SESIÓN
    // =========================
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log(`[Auth] Evento recibido: ${event}`);

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
            if (session) {
                // Solo inicializar si el usuario cambió (o es la primera vez)
                if (!currentUser || currentUser.id !== session.user.id) {
                    currentUser = session.user;
                    console.log(`[Auth] Sesión activa para: ${currentUser.email}`);

                    // NO bloquear el callback con await → correr en background
                    initializeAppData().then(() => {
                        if (loginView.classList.contains('active')) {
                            showView(menuView);
                        }
                    }).catch(err => {
                        console.error('[Auth] Error en initializeAppData:', err);
                    });
                }
            } else if (event === 'INITIAL_SESSION') {
                console.log('[Auth] INITIAL_SESSION sin sesión. Redirigiendo a Login.');
                handleLogoutState();
            }
        } else if (event === 'SIGNED_OUT') {
            console.log('[Auth] Evento SIGNED_OUT recibido.');
            handleLogoutState();
        }
    });

    // =========================
    // SKIN-CARE LOGIC
    // =========================

    async function loadSkincareData() {
        console.log('[App] Cargando skincare_data...');
        if (!currentUser) return;

        // Load Routine con timeout
        const { data: routineData, error: routineError } = await withTimeout(
            supabaseClient
                .from('skincare_routine')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('step_order', { ascending: true }),
            10000,
            'loadSkincareRoutine'
        );

        if (routineError) {
            console.error('[Data] Error loading routine:', routineError);
        } else {
            skincareRoutine = (routineData || []).map(r => ({
                name: r.step_name || 'Paso',
                start: (r.start_time || '00:00:00').substring(0, 5),
                end: (r.end_time || '00:00:00').substring(0, 5)
            }));
        }

        // Load Tracker con timeout
        const { data: trackerDataRes, error: trackerError } = await withTimeout(
            supabaseClient
                .from('skincare_tracker_data')
                .select('*')
                .eq('user_id', currentUser.id),
            10000,
            'loadSkincareTracker'
        );

        if (trackerError) {
            console.error('[Data] Error loading tracker data:', trackerError);
        } else {
            skincareTrackerData = {};
            (trackerDataRes || []).forEach(row => {
                if (!skincareTrackerData[row.day_key]) {
                    skincareTrackerData[row.day_key] = {};
                }
                skincareTrackerData[row.day_key][row.step_index] = {
                    done: row.done,
                    frozenRatio: row.frozen_ratio
                };
            });
        }
        console.log('[App] skincare_data cargado.');
    }

    async function saveSkincareRoutine() {
        if (!currentUser) return;

        // Delete old routine
        await supabaseClient
            .from('skincare_routine')
            .delete()
            .eq('user_id', currentUser.id);

        // Insert new routine
        if (skincareRoutine.length > 0) {
            const inserts = skincareRoutine.map((step, index) => ({
                user_id: currentUser.id,
                step_order: index,
                step_name: step.name,
                start_time: step.start + ":00",
                end_time: step.end + ":00"
            }));

            const { error } = await supabaseClient
                .from('skincare_routine')
                .insert(inserts);

            if (error) console.error("Error saving routine:", error);
        }
    }

    async function upsertSkincareStep(dayKey, index, done, frozenRatio) {
        if (!currentUser) return;

        const { error } = await supabaseClient
            .from('skincare_tracker_data')
            .upsert({
                user_id: currentUser.id,
                day_key: dayKey,
                step_index: index,
                done: done,
                frozen_ratio: frozenRatio
            }, {
                onConflict: 'user_id, day_key, step_index'
            });

        if (error) console.error("Error updating step:", error);
    }

    async function resetAllSkincareData() {
        if (!currentUser) return;
        await supabaseClient.from('skincare_routine').delete().eq('user_id', currentUser.id);
        await supabaseClient.from('skincare_tracker_data').delete().eq('user_id', currentUser.id);
    }

    navSkincareBtn.addEventListener('click', async () => {
        if (!isAppInitialized) {
            console.warn("[App] Esperando a que los datos se inicialicen...");
            return;
        }

        if (skincareRoutine.length === 0) {
            setupStepName.value = "";
            setupStepStart.value = "";
            setupStepEnd.value = "";
            setupError.style.display = "none";
            setupFinishBtn.style.display = "none";
            setupQuestion.textContent = "¿Con qué empezarás?";
            showView(skincareSetupView);
        } else {
            showView(skincareTrackerView);
            renderSkincareTracker();
        }
    });

    backFromSkincareSetupBtn.addEventListener('click', () => {
        showView(menuView);
    });

    backFromSkincareTrackerBtn.addEventListener('click', () => {
        showView(menuView);
    });

    editSkincareBtn.addEventListener('click', () => {
        showView(skincareEditView);
        renderSkincareEditList();
    });

    resetSkincareBtn.addEventListener('click', async () => {
        if (confirm("¿Estás seguro de reiniciar tu rutina? Perderás todo el progreso de Skin-Care.")) {
            resetSkincareBtn.disabled = true;
            await resetAllSkincareData();
            skincareRoutine = [];
            skincareTrackerData = {};
            resetSkincareBtn.disabled = false;
            showView(menuView);
        }
    });

    backToSkincareTrackerBtn.addEventListener('click', () => {
        SkincareScheduler.stop();
        showView(skincareTrackerView);
        renderSkincareTracker();
    });

    setupNextBtn.addEventListener('click', () => {
        const name = setupStepName.value.trim();
        const start = setupStepStart.value;
        const end = setupStepEnd.value;

        if (!name || !start || !end || start >= end) {
            setupError.style.display = "block";
            setupError.textContent = "Campos inválidos o rango de hora incorrecto.";
            return;
        }

        setupError.style.display = "none";
        skincareRoutine.push({ name, start, end });

        setupStepName.value = "";
        setupStepStart.value = end;
        setupStepEnd.value = "";
        setupQuestion.textContent = "¿Qué sigue?";

        if (skincareRoutine.length >= 3) {
            setupFinishBtn.style.display = "inline-block";
        }
    });

    setupFinishBtn.addEventListener('click', async () => {
        const name = setupStepName.value.trim();
        const start = setupStepStart.value;
        const end = setupStepEnd.value;

        if (name && start && end && start < end) {
            skincareRoutine.push({ name, start, end });
        }

        if (skincareRoutine.length < 4) {
            setupError.style.display = "block";
            setupError.textContent = "Debes agregar al menos 4 pasos.";
            return;
        }

        setupFinishBtn.disabled = true;
        setupFinishBtn.textContent = "Guardando...";
        await saveSkincareRoutine();
        setupFinishBtn.textContent = "Terminar";
        setupFinishBtn.disabled = false;

        showView(skincareTrackerView);
        renderSkincareTracker();
    });

    function getSkincareDayStatus(key) {
        if (!skincareTrackerData[key]) return 0;
        const dayData = skincareTrackerData[key] || {};
        let allDone = true;
        let anyFailed = false;

        const now = new Date();
        const [y, m, d] = key.split('-').map(Number);
        const isToday = now.getFullYear() === y && now.getMonth() === m && now.getDate() === d;
        const isPast = new Date(y, m, d, 23, 59, 59) < now;
        const isBlockedDate = new Date(y, m, d) <= new Date(2026, 4, 13);

        if (isBlockedDate) return 0;

        if (!skincareRoutine || skincareRoutine.length === 0) return 0;

        for (let i = 0; i < skincareRoutine.length; i++) {
            const stepState = dayData[i] || { done: false };
            if (!stepState.done) {
                allDone = false;

                if (isPast && !isToday) anyFailed = true;

                if (isToday && skincareRoutine[i]?.end) {
                    const [endH, endM] = skincareRoutine[i].end.split(':').map(Number);
                    if (!isNaN(endH) && !isNaN(endM)) {
                        const endTime = new Date(y, m, d, endH, endM, 0);
                        if (now > endTime) anyFailed = true;
                    }
                }
            }
        }

        if (anyFailed) return 2;
        if (allDone) return 1;
        return 0;
    }

    function renderSkincareTracker() {
        skincareTrackerGrid.innerHTML = "";
        const month = MONTHS[skincareMonthIndex];
        skincareCurrentMonthDisplay.textContent = month.name;

        DAYS_OF_WEEK.forEach(d => {
            const el = document.createElement('div');
            el.className = "day-name";
            el.textContent = d;
            skincareTrackerGrid.appendChild(el);
        });

        const year = new Date().getFullYear();
        const firstDay = new Date(year, skincareMonthIndex, 1).getDay();
        let offset = firstDay === 0 ? 6 : firstDay - 1;

        for (let i = 0; i < offset; i++) {
            const empty = document.createElement('div');
            empty.className = "empty-box";
            skincareTrackerGrid.appendChild(empty);
        }

        for (let day = 1; day <= month.days; day++) {
            const key = `${year}-${skincareMonthIndex}-${day}`;
            const status = getSkincareDayStatus(key);

            const box = document.createElement('div');
            box.className = "day-box";

            const now = new Date();
            const isToday = now.getFullYear() === year && now.getMonth() === skincareMonthIndex && now.getDate() === day;
            const isPast = new Date(year, skincareMonthIndex, day, 23, 59, 59) < now && !isToday;
            const isBlockedDate = new Date(year, skincareMonthIndex, day) <= new Date(2026, 4, 13);

            if (isPast || isBlockedDate) {
                box.classList.add('past');
            } else {
                box.addEventListener('click', () => {
                    currentSkincareDayKey = key;
                    if (!skincareTrackerData[key]) skincareTrackerData[key] = {};
                    showView(skincareDayView);
                    skincareDayTitle.textContent = `${day} de ${month.name}`;
                    renderSkincareDay();
                });
            }

            const num = document.createElement('span');
            num.className = "day-number";
            num.textContent = day;

            const icon = document.createElement('span');
            icon.className = "day-icon";

            if (status === 1) {
                box.classList.add("status-1");
                icon.innerHTML = ICON_CHECK;
            } else if (status === 2) {
                box.classList.add("status-3"); // Red Cross style for failed skincare
                icon.innerHTML = ICON_CROSS;
            }

            box.appendChild(num);
            box.appendChild(icon);

            skincareTrackerGrid.appendChild(box);
        }
    }

    skincarePrevMonthBtn.addEventListener('click', () => {
        skincareMonthIndex--;
        if (skincareMonthIndex < 0) skincareMonthIndex = 11;
        renderSkincareTracker();
    });

    skincareNextMonthBtn.addEventListener('click', () => {
        skincareMonthIndex++;
        if (skincareMonthIndex > 11) skincareMonthIndex = 0;
        renderSkincareTracker();
    });

    function renderSkincareDay() {
        skincareStepsList.innerHTML = "";
        SkincareScheduler.stop();

        const now = new Date();
        const [y, m, d] = (currentSkincareDayKey || "2000-01-01").split('-').map(Number);
        const dayData = skincareTrackerData[currentSkincareDayKey] || {};

        skincareRoutine.forEach((step, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = "step-wrapper";

            const card = document.createElement('div');
            card.className = "step-card";

            const progOuter = document.createElement('div');
            progOuter.className = "step-progress-outer";

            const batteryTop = document.createElement('div');
            batteryTop.className = "step-progress-battery-top";

            const progWrap = document.createElement('div');
            progWrap.className = "step-progress-wrapper";

            const progFill = document.createElement('div');
            progFill.className = "step-progress-fill";
            progFill.id = `skincare-prog-${index}`;

            progWrap.appendChild(progFill);
            progOuter.appendChild(batteryTop);
            progOuter.appendChild(progWrap);

            const info = document.createElement('div');
            info.className = "step-info";
            const nameEl = document.createElement('div');
            nameEl.className = "step-name";
            nameEl.textContent = step.name;
            const timeEl = document.createElement('div');
            timeEl.className = "step-time";
            timeEl.textContent = `${step.start} - ${step.end}`;
            info.appendChild(nameEl);
            info.appendChild(timeEl);

            const check = document.createElement('div');
            check.className = "step-checkbox";
            check.id = `skincare-check-${index}`;

            const stepState = dayData[index] || { done: false, frozenRatio: null };

            if (stepState.done) {
                check.classList.add('checked');
                if (stepState.frozenRatio !== null) {
                    progFill.style.height = `${stepState.frozenRatio * 100}%`;
                    updateFillColor(progFill, stepState.frozenRatio);
                } else {
                    progFill.style.height = `100%`;
                    updateFillColor(progFill, 1);
                }
            }

            check.addEventListener('click', async () => {
                if (wrapper.classList.contains('failed')) return;

                if (check.classList.contains('checked')) {
                    check.classList.remove('checked');
                    dayData[index] = { done: false, frozenRatio: null };
                    skincareTrackerData[currentSkincareDayKey] = dayData;

                    updateSkincareProgress();
                    updateSkincareHorizontalProgress();
                    await upsertSkincareStep(currentSkincareDayKey, index, false, null);
                } else {
                    check.classList.add('checked');

                    const currentHeight = progFill.style.height || "100%";
                    const currentRatio = parseFloat(currentHeight) / 100;

                    dayData[index] = { done: true, frozenRatio: currentRatio };
                    skincareTrackerData[currentSkincareDayKey] = dayData;

                    updateSkincareHorizontalProgress();
                    await upsertSkincareStep(currentSkincareDayKey, index, true, currentRatio);
                }
            });

            card.appendChild(progOuter);
            card.appendChild(info);

            wrapper.appendChild(card);
            wrapper.appendChild(check);
            skincareStepsList.appendChild(wrapper);
        });

        updateSkincareProgress();
        updateSkincareHorizontalProgress();
        SkincareScheduler.start();
    }

    function updateSkincareHorizontalProgress() {
        const dayData = skincareTrackerData[currentSkincareDayKey] || {};
        let doneCount = 0;
        const totalCount = skincareRoutine.length;

        for (let i = 0; i < totalCount; i++) {
            if (dayData[i] && dayData[i].done) {
                doneCount++;
            }
        }

        let percentage = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
        skincareDayProgressBar.style.width = `${percentage}%`;
        skincareDayProgressText.textContent = `${percentage}%`;
    }

    function updateFillColor(el, ratio) {
        if (ratio > 0.5) {
            el.style.backgroundColor = "var(--green-color)";
        } else if (ratio > 0.2) {
            el.style.backgroundColor = "#d4a017";
        } else {
            el.style.backgroundColor = "var(--red-color)";
        }
    }

    function updateSkincareProgress() {
        if (!currentSkincareDayKey) return;

        const now = new Date();
        const [y, m, d] = currentSkincareDayKey.split('-').map(Number);
        const dayData = skincareTrackerData[currentSkincareDayKey] || {};

        const isToday = now.getFullYear() === y && now.getMonth() === m && now.getDate() === d;
        const isPast = new Date(y, m, d, 23, 59, 59) < now;

        skincareRoutine.forEach((step, index) => {
            const stepState = dayData[index] || { done: false };
            if (stepState.done) return;

            const progFill = document.getElementById(`skincare-prog-${index}`);
            const check = document.getElementById(`skincare-check-${index}`);

            if (!check) return;
            const wrapper = check.closest('.step-wrapper');
            if (!progFill || !wrapper) return;

            const startStr = step.start || "00:00";
            const endStr = step.end || "00:00";
            const [startH, startM] = startStr.split(':').map(Number);
            const [endH, endM] = endStr.split(':').map(Number);

            const startTime = new Date(y, m, d, startH || 0, startM || 0, 0);
            const endTime = new Date(y, m, d, endH || 0, endM || 0, 0);

            if (isPast && !isToday) {
                wrapper.classList.add('failed');
                return;
            }

            if (isToday) {
                if (now < startTime) {
                    progFill.style.height = "100%";
                    progFill.style.backgroundColor = "var(--green-color)";
                } else if (now > endTime) {
                    wrapper.classList.add('failed');
                } else {
                    const totalDuration = endTime - startTime;
                    const elapsed = now - startTime;
                    let ratio = 1 - (elapsed / totalDuration);
                    if (ratio < 0) ratio = 0;

                    progFill.style.height = `${ratio * 100}%`;
                    updateFillColor(progFill, ratio);
                }
            } else {
                progFill.style.height = "100%";
                progFill.style.backgroundColor = "var(--green-color)";
            }
        });
    }

    // =========================
    // SKIN-CARE EDIT LOGIC
    // =========================

    backFromSkincareEditBtn.addEventListener('click', () => {
        showView(skincareTrackerView);
        renderSkincareTracker();
    });

    function renderSkincareEditList() {
        skincareEditList.innerHTML = "";
        editError.style.display = "none";

        skincareRoutine.forEach((step, index) => {
            const row = document.createElement('div');
            row.className = "edit-step-row";

            const nameInput = document.createElement('input');
            nameInput.type = "text";
            nameInput.value = step.name;
            nameInput.placeholder = "Paso";

            const startInput = document.createElement('input');
            startInput.type = "time";
            startInput.value = step.start;

            const endInput = document.createElement('input');
            endInput.type = "time";
            endInput.value = step.end;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = "delete-step-btn";
            deleteBtn.innerHTML = "×";
            deleteBtn.title = "Eliminar paso";

            deleteBtn.addEventListener('click', () => {
                row.remove();
            });

            row.appendChild(nameInput);
            row.appendChild(startInput);
            row.appendChild(endInput);
            row.appendChild(deleteBtn);

            skincareEditList.appendChild(row);
        });
    }

    skincareEditAddBtn.addEventListener('click', () => {
        const row = document.createElement('div');
        row.className = "edit-step-row";

        const nameInput = document.createElement('input');
        nameInput.type = "text";
        nameInput.placeholder = "Nuevo paso";

        const startInput = document.createElement('input');
        startInput.type = "time";

        const endInput = document.createElement('input');
        endInput.type = "time";

        const deleteBtn = document.createElement('button');
        deleteBtn.className = "delete-step-btn";
        deleteBtn.innerHTML = "×";

        deleteBtn.addEventListener('click', () => {
            row.remove();
        });

        row.appendChild(nameInput);
        row.appendChild(startInput);
        row.appendChild(endInput);
        row.appendChild(deleteBtn);

        skincareEditList.appendChild(row);
    });

    skincareEditSaveBtn.addEventListener('click', async () => {
        const rows = skincareEditList.querySelectorAll('.edit-step-row');
        const newRoutine = [];
        let valid = true;

        rows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            const name = inputs[0].value.trim();
            const start = inputs[1].value;
            const end = inputs[2].value;

            if (!name || !start || !end || start >= end) {
                valid = false;
            } else {
                newRoutine.push({ name, start, end });
            }
        });

        if (!valid || newRoutine.length < 4) {
            editError.style.display = "block";
            return;
        }

        skincareEditSaveBtn.disabled = true;
        skincareEditSaveBtn.textContent = "Guardando...";
        skincareRoutine = newRoutine;
        await saveSkincareRoutine();
        skincareEditSaveBtn.textContent = "Guardar Cambios";
        skincareEditSaveBtn.disabled = false;

        showView(skincareTrackerView);
        renderSkincareTracker();
    });

    // =========================
    // PWA & NOTIFICATIONS
    // =========================
    // (Service Worker registrado en <head> de index.html)

    const NotificationManager = {
        async requestPermission() {
            if (!('Notification' in window)) return false;
            if (Notification.permission === 'granted') return true;
            const perm = await Notification.requestPermission();
            return perm === 'granted';
        },
        async schedule(title, body, timestamp, tag) {
            if (!('Notification' in window)) return;
            if (Notification.permission !== 'granted') return;

            const delay = timestamp - Date.now();
            const options = {
                body,
                icon: 'icon-192.png',
                badge: 'icon-192.png',
                tag,
                requireInteraction: false
            };

            if (delay <= 0 && delay > -60000) {
                // Ya pasó hace menos de 1 minuto → mostrar inmediatamente
                new Notification(title, options);
                return;
            }
            if (delay <= 0) return; // Pasó hace mucho, ignorar

            // Fallback universal: setTimeout (funciona mientras la pestaña está abierta)
            // Es la única estrategia cross-browser confiable sin servidor push propio
            setTimeout(async () => {
                try {
                    // Intentar vía Service Worker registration (más confiable que new Notification)
                    const reg = await navigator.serviceWorker.ready;
                    if (reg && reg.active) {
                        await reg.showNotification(title, options);
                    } else {
                        new Notification(title, options);
                    }
                } catch (e) {
                    // Último fallback
                    try { new Notification(title, options); } catch (_) { }
                }
            }, delay);
        }
    };


    const SkincareScheduler = {
        timerId: null,
        notifiedToday: {},
        _notifScheduled: false, // Flag para evitar programar notificaciones múltiples veces al día

        start() {
            this.stop(); // Garantiza un solo interval activo
            this.timerId = setInterval(() => {
                if (currentSkincareDayKey) {
                    updateSkincareProgress();
                }
            }, 1000);
        },

        stop() {
            if (this.timerId) {
                clearInterval(this.timerId);
                this.timerId = null;
            }
        },

        scheduleDailyNotifications() {
            if (!skincareRoutine || skincareRoutine.length === 0 || !currentUser) return;

            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            const date = now.getDate();
            const todayKey = `${year}-${month}-${date}`;

            const storedNotifs = JSON.parse(localStorage.getItem('notifiedTracker') || '{}');
            if (storedNotifs.date !== todayKey) {
                // Nuevo día: resetear flags
                this.notifiedToday = {};
                this._notifScheduled = false;
            } else {
                this.notifiedToday = storedNotifs.flags || {};
            }

            // Evitar reprogramar si ya se hizo hoy en esta sesión
            if (this._notifScheduled) {
                console.log('[Scheduler] Notificaciones ya programadas para hoy, saltando.');
                return;
            }

            const todayData = skincareTrackerData[todayKey] || {};
            skincareRoutine.forEach((step, index) => {
                if (todayData[index] && todayData[index].done) return;

                const startStr = step.start || "00:00";
                const endStr = step.end || "00:00";
                const [startH, startM] = startStr.split(':').map(Number);
                const [endH, endM] = endStr.split(':').map(Number);

                const endTime = new Date(year, month, date, endH, endM, 0).getTime();

                // 30 min antes
                const t30 = endTime - (30 * 60 * 1000);
                if (t30 > now.getTime() && !this.notifiedToday[`${index}-30`]) {
                    NotificationManager.schedule("⏳ Prepárate", `Faltan 30 min para finalizar: ${step.name}`, t30, `step-${index}-30`);
                    this.notifiedToday[`${index}-30`] = true;
                }

                // 10 min antes
                const t10 = endTime - (10 * 60 * 1000);
                if (t10 > now.getTime() && !this.notifiedToday[`${index}-10`]) {
                    NotificationManager.schedule("⚠️ Último aviso", `Solo quedan 10 min para: ${step.name}`, t10, `step-${index}-10`);
                    this.notifiedToday[`${index}-10`] = true;
                }

                // Expirado
                if (endTime > now.getTime() && !this.notifiedToday[`${index}-0`]) {
                    NotificationManager.schedule("❌ Tiempo expirado", `El tiempo para ${step.name} ha terminado.`, endTime, `step-${index}-0`);
                    this.notifiedToday[`${index}-0`] = true;
                }
            });

            const toSave = { date: todayKey, flags: this.notifiedToday };
            localStorage.setItem('notifiedTracker', JSON.stringify(toSave));
            this._notifScheduled = true; // Marcar como programado para esta sesión
            console.log('[Scheduler] Notificaciones del día programadas.');
        }
    };

    // Botón de activar notificaciones (declarado después del Scheduler para evitar ReferenceError)
    const enableNotifsBtn = document.getElementById('enable-notifications-btn');
    if (enableNotifsBtn) {
        const updateNotifsBtn = () => {
            if ('Notification' in window && Notification.permission === 'granted') {
                enableNotifsBtn.style.display = 'none';
            } else if ('Notification' in window && Notification.permission !== 'denied') {
                enableNotifsBtn.style.display = 'inline-block';
            } else {
                enableNotifsBtn.style.display = 'none'; // Denegado permanentemente
            }
        };
        updateNotifsBtn();
        enableNotifsBtn.addEventListener('click', async () => {
            const granted = await NotificationManager.requestPermission();
            if (granted) {
                updateNotifsBtn();
                SkincareScheduler.scheduleDailyNotifications();
            }
        });
    }
});