let isDemoMode = false;

const demoUserDatabase = [
    { name: "Super Admin", username: "super", password: "123", role: "Super Admin", title: "Facility Administrator", level: "Admin", status: "approved", company: "Demo EMR" },
    { name: "Dr. Cindy", username: "doc", password: "123", role: "General Practice", title: "Chief Medical Officer", level: "Head", status: "approved", company: "Demo EMR" },
    { name: "John R.", username: "rx", password: "123", role: "Pharmacist", title: "Lead Pharmacist", level: "Head", status: "approved", company: "Demo EMR" },
    { name: "Dr. Vance", username: "cardio", password: "123", role: "Cardiologist", title: "Chief of Cardiology", level: "Head", status: "approved", company: "Demo EMR" },
    { name: "Dr. Grey", username: "surgeon", password: "123", role: "Surgeon", title: "Chief of Surgery", level: "Head", status: "approved", company: "Demo EMR" },
    { name: "Sarah N.", username: "nurse", password: "123", role: "Nurse", title: "Head Charge Nurse", level: "Head", status: "approved", company: "Demo EMR" },
    { name: "Mark F.", username: "desk", password: "123", role: "Front Desk", title: "Registration Director", level: "Head", status: "approved", company: "Demo EMR" },
    { name: "System Admin", username: "it", password: "123", role: "IT Dept", title: "IT Director", level: "Head", status: "approved", company: "Demo EMR" }
];

let userDatabase = [];
let currentUserIndex = 0;

function getCurrentDB() {
    return isDemoMode ? demoUserDatabase : userDatabase;
}

function getCurrentUser() {
    return getCurrentDB()[currentUserIndex];
}

/* Other databases */
let companyRegistry = [];
let shiftDatabase = [];
let chatDatabase = [];
let availabilityStatus = {};
let rxDatabase = [
    { id: 88219, time: "09:15 AM", patient: "Doe, John", medication: "Lisinopril", dosage: "10mg PO Daily", notes: "Standard protocol", status: "Pending", doctor: "Cindy" },
    { id: 88220, time: "09:30 AM", patient: "Chen, Robert", medication: "Atorvastatin", dosage: "20mg PO QHS", notes: "Check liver enzymes in 3 mos", status: "Pending", doctor: "Vance" }
];

/* CMS slides */
let publicDashboardSlides = [
    {
        content: `<div class="p-4 p-md-5 text-center bg-white"><h3 class="text-primary fw-bold mb-2">Cardiology Seminar 2026</h3><p class="text-secondary m-0">Register for upcoming CME credits in Advanced EKG Interpretation.</p></div>`,
        roles: ["Cardiologist", "General Practice", "Super Admin"]
    },
    {
        content: `<div class="p-4 p-md-5 text-center bg-light"><h3 class="text-dark fw-bold mb-2">Pharma Supply Update</h3><p class="text-secondary m-0">Notice: Lisinopril 10mg is currently backordered globally.</p></div>`,
        roles: ["Pharmacist", "General Practice", "Nurse", "Super Admin"]
    },
    {
        content: `<div class="p-4 p-md-5 text-center bg-danger text-white"><h3 class="fw-bold mb-2">Critical System Maintenance</h3><p class="m-0 opacity-75">The EMR will be taken offline for database updates at 0200 hours.</p></div>`,
        roles: ["All"]
    }
];
let cmsDashboardSlides = JSON.parse(JSON.stringify(publicDashboardSlides));
let pendingDashboardApproval = false;

function renderDashboardCarousel() {
    const carouselInner = document.querySelector('#roleAds .carousel-inner');
    if (!carouselInner) return;
    
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const visibleSlides = publicDashboardSlides.filter(slide => (slide.roles && slide.roles.includes("All")) || (slide.roles && slide.roles.includes(currentUser.role)));
    
    if (visibleSlides.length === 0) {
        document.getElementById('roleAds').style.display = 'none';
        return;
    }

    document.getElementById('roleAds').style.display = 'block';
    let html = '';
    visibleSlides.forEach((slide, index) => {
        html += `<div class="carousel-item ${index === 0 ? 'active' : ''}">${slide.content}</div>`;
    });
    carouselInner.innerHTML = html;
}

function renderCMSView() {
    const currentUser = getCurrentUser();
    let banner = '';

    if (pendingDashboardApproval) {
        if (currentUser.level === "Head" || currentUser.role === "Super Admin") {
            banner = `
                <div class="alert alert-warning d-flex flex-column flex-md-row justify-content-between align-items-md-center shadow-sm mb-4">
                    <div class="mb-3 mb-md-0">
                        <strong class="d-block"><i class="bi bi-exclamation-triangle-fill me-2"></i>Pending Draft Changes</strong>
                        <span class="small text-dark">An IT Staff member has submitted a new draft of the dashboard slides for your approval.</span>
                    </div>
                    <div class="text-nowrap">
                        <button class="btn btn-success fw-bold shadow-sm me-2" onclick="approveCMSSlides()">✓ Approve & Publish</button>
                        <button class="btn btn-danger fw-bold shadow-sm" onclick="rejectCMSSlides()">✗ Reject</button>
                    </div>
                </div>
            `;
        } else {
            banner = `<div class="alert alert-info shadow-sm mb-4"><i class="bi bi-info-circle-fill me-2"></i><strong>Draft Mode:</strong> Your changes are pending approval from an IT Head.</div>`;
        }
    }

    let html = `
        ${banner}
        <div class="card border-0 shadow-sm overflow-hidden mb-4">
            <div class="card-header bg-dark text-white fw-bold py-3 border-0 d-flex justify-content-between align-items-center">
                <span>Manage Dashboard Slides</span>
                <button class="btn btn-sm btn-success fw-bold shadow-sm" onclick="addCMSSlide()">+ Add Blank Slide</button>
            </div>
            <div class="card-body p-4 bg-light">
                <p class="text-muted small mb-4">Edit the raw HTML for the Dashboard Carousel below. You can insert images via <code>&lt;img src="..."&gt;</code>, modify background colors, or add custom text formatting.</p>
                <div id="cms-slides-wrapper">
    `;

    const systemRoles = ["All", "Super Admin", "General Practice", "Pharmacist", "Cardiologist", "Surgeon", "Nurse", "Front Desk", "IT Dept"];

    cmsDashboardSlides.forEach((slide, index) => {
        let roleCheckboxes = systemRoles.map(r => `
            <div class="form-check form-check-inline">
                <input class="form-check-input role-check ${r === 'All' ? 'role-check-all' : 'role-check-sub'}" type="checkbox" value="${r}" ${(slide.roles && slide.roles.includes(r)) ? 'checked' : ''} onchange="handleRoleCheckboxChange(this)">
                <label class="form-check-label small">${r}</label>
            </div>
        `).join('');

        html += `
            <div class="card shadow-sm border-0 mb-4 slide-editor-card">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                    <span class="fw-bold text-secondary">Slide ${index + 1}</span>
                    <button class="btn btn-sm btn-outline-danger" onclick="removeCMSSlide(${index})"><i class="bi bi-trash"></i> Remove Slide</button>
                </div>
                <div class="card-body p-3">
                    <div class="mb-3">
                        <label class="form-label fw-bold text-secondary small text-uppercase">Slide Content (HTML)</label>
                        <textarea class="form-control font-monospace cms-slide-content" rows="4" style="font-size: 0.85rem;">${slide.content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</textarea>
                    </div>
                    <div>
                        <label class="form-label fw-bold text-secondary small text-uppercase">Visible To Roles</label>
                        <div class="d-flex flex-wrap gap-2 border p-3 rounded bg-white shadow-sm">
                            ${roleCheckboxes}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += `
                </div>
                <button class="btn btn-primary fw-bold w-100 py-3 shadow-sm" onclick="saveCMSSlides()">💾 Save All Changes & Update Dashboard</button>
            </div>
        </div>
    `;
    return html;
}

function addCMSSlide() {
    cmsDashboardSlides.push({
        content: `<div class="p-4 p-md-5 text-center bg-white">\n  <h3 class="text-dark fw-bold mb-2">New Slide</h3>\n  <p class="text-secondary m-0">Description goes here.</p>\n</div>`,
        roles: ["All"]
    });
    document.getElementById('dynamic-cms-container').innerHTML = renderCMSView();
}

function removeCMSSlide(index) {
    if (confirm("Are you sure you want to remove this slide?")) {
        cmsDashboardSlides.splice(index, 1);
        document.getElementById('dynamic-cms-container').innerHTML = renderCMSView();
    }
}

function saveCMSSlides() {
    const cards = document.querySelectorAll('.slide-editor-card');
    let newSlides = Array.from(cards).map(card => {
        const content = card.querySelector('.cms-slide-content').value;
        const checkedBoxes = card.querySelectorAll('.role-check:checked');
        let roles = Array.from(checkedBoxes).map(cb => cb.value);
        if (roles.length === 0) roles.push("All");
        return { content, roles };
    });

    cmsDashboardSlides = newSlides;

    const currentUser = getCurrentUser();
    if (currentUser.role === "IT Dept" && currentUser.level !== "Head") {
        pendingDashboardApproval = true;
        alert("Changes saved as Draft and submitted for IT Head approval.");
    } else {
        publicDashboardSlides = JSON.parse(JSON.stringify(cmsDashboardSlides));
        pendingDashboardApproval = false;
        renderDashboardCarousel();
        alert("Dashboard slides updated successfully! Check the Dashboard tab to see your changes.");
    }

    document.getElementById('dynamic-cms-container').innerHTML = renderCMSView();
}

function approveCMSSlides() {
    publicDashboardSlides = JSON.parse(JSON.stringify(cmsDashboardSlides));
    pendingDashboardApproval = false;
    renderDashboardCarousel();
    document.getElementById('dynamic-cms-container').innerHTML = renderCMSView();
    alert("Pending changes approved and published to the Master Dashboard!");
}

function rejectCMSSlides() {
    cmsDashboardSlides = JSON.parse(JSON.stringify(publicDashboardSlides));
    pendingDashboardApproval = false;
    document.getElementById('dynamic-cms-container').innerHTML = renderCMSView();
}

function handleRoleCheckboxChange(checkbox) {
    const container = checkbox.closest('.d-flex');
    if (checkbox.value === 'All') {
        const isChecked = checkbox.checked;
        container.querySelectorAll('.role-check').forEach(cb => cb.checked = isChecked);
    } else {
        if (!checkbox.checked) {
            const allCb = container.querySelector('.role-check-all');
            if (allCb) allCb.checked = false;
        } else {
            const allSubs = Array.from(container.querySelectorAll('.role-check-sub'));
            if (allSubs.every(cb => cb.checked)) {
                const allCb = container.querySelector('.role-check-all');
                if (allCb) allCb.checked = true;
            }
        }
    }
}

/* Dashboard widgets */
function renderDashboardWidgets(user) {
    let widget1 = '';
    let widget2 = '';

    if (user.role === "IT Dept") {
        const latestTickets = typeof ticketDatabase !== 'undefined' ? ticketDatabase.slice(-2).reverse() : [];
        let ticketList = latestTickets.length > 0 
            ? latestTickets.map(t => `<li class="list-group-item p-3"><strong>Ticket #${t.id}:</strong> ${t.subject}</li>`).join('')
            : `<li class="list-group-item p-3 text-muted">No active tickets.</li>`;

        widget1 = `<div class="card h-100 border-0 shadow-sm"><div class="card-header bg-danger text-white border-0 py-3">Active Complaints / Tickets</div><div class="card-body p-0"><ul class="list-group list-group-flush">${ticketList}</ul></div></div>`;
        widget2 = `<div class="card h-100 border-0 shadow-sm"><div class="card-header bg-dark text-white border-0 py-3">IT Tasks & Server Status</div><div class="card-body p-4"><p><strong>Database Uptime:</strong> <span class="badge bg-success bg-opacity-10 text-success border border-success">99.9% Operational</span></p><p class="m-0"><strong>System Logs:</strong> ${typeof auditDatabase !== 'undefined' ? auditDatabase.length : 0} security events recorded.</p></div></div>`;
    } 
    else if (user.role === "Pharmacist") {
        const pendingRxCount = rxDatabase.filter(rx => rx.status === "Pending").length;
        widget1 = `<div class="card h-100 border-0 shadow-sm"><div class="card-header text-white border-0 py-3" style="background-color: var(--blue);">Pending Rx Orders</div><div class="card-body p-4 d-flex align-items-center"><h3 class="m-0 text-primary fw-bold me-3">${pendingRxCount}</h3> <p class="m-0 text-secondary">prescriptions awaiting verification.</p></div></div>`;
        widget2 = `<div class="card h-100 border-0 shadow-sm"><div class="card-header bg-dark text-white border-0 py-3">Vendor & Supply Alerts</div><div class="card-body p-4"><p class="text-success fw-bold m-0"><i class="bi bi-check-circle-fill me-2"></i>System Stock Levels: Normal</p></div></div>`;
    }
    else if (user.role === "Nurse") {
        const pendingTriage = shiftDatabase.filter(s => s.status === "Accepted" && s.patient && !s.intakeNotes && s.opStatus !== 'POST_OP');
        const nextTriage = pendingTriage.length > 0 ? pendingTriage[0] : null;
        let triageContent = nextTriage 
            ? `<div class="d-flex align-items-center mb-2"><span class="badge bg-danger me-2">HIGH PRIORITY</span> <h5 class="m-0 fw-bold text-truncate" style="max-width: 200px;">${nextTriage.patient}</h5></div><p class="text-muted m-0">Awaiting Clinical Vitals Intake.</p>`
            : `<div class="d-flex align-items-center mb-2"><span class="badge bg-success me-2">CLEAR</span> <h5 class="m-0 fw-bold">Queue Empty</h5></div><p class="text-muted m-0">No patients awaiting triage.</p>`;
        
        const postOpCount = shiftDatabase.filter(s => s.opStatus === "POST_OP").length;
        widget1 = `<div class="card h-100 border-0 shadow-sm"><div class="card-header bg-success text-white border-0 py-3">Triage Queue</div><div class="card-body p-4">${triageContent}</div></div>`;
        widget2 = `<div class="card h-100 border-0 shadow-sm"><div class="card-header bg-dark text-white border-0 py-3">Post-Visit Education</div><div class="card-body p-4"><p class="m-0"><strong>${postOpCount} Patients</strong> ready for discharge instructions and summaries.</p></div></div>`;
    }
    else if (user.role === "Surgeon") {
        const myShifts = shiftDatabase.filter(s => s.username === user.username && s.status === "Accepted");
        const inOp = myShifts.find(s => s.opStatus === "IN_PROGRESS");
        const postOpCount = myShifts.filter(s => s.opStatus === "POST_OP").length;
        
        let orContent = inOp 
            ? `<div class="d-flex align-items-center mb-2"><span class="badge bg-danger text-white me-2">IN SURGERY</span> <h5 class="m-0 fw-bold">OR Active</h5></div><p class="text-muted m-0">Operating on <strong>${inOp.patient}</strong></p>`
            : `<div class="d-flex align-items-center mb-2"><span class="badge bg-success text-white me-2">AVAILABLE</span> <h5 class="m-0 fw-bold">OR Clear</h5></div><p class="text-muted m-0">Awaiting next surgical case.</p>`;

        widget1 = `<div class="card h-100 border-0 shadow-sm"><div class="card-header bg-danger text-white border-0 py-3">Operating Room (OR) Status</div><div class="card-body p-4">${orContent}</div></div>`;
        widget2 = `<div class="card h-100 border-0 shadow-sm"><div class="card-header bg-dark text-white border-0 py-3">Surgical Ward / PACU</div><div class="card-body p-4"><p class="m-0"><strong>${postOpCount} Patients</strong> currently in post-op recovery for observation.</p></div></div>`;
    }
    else if (user.role === "Front Desk") {
        const availableDocs = getCurrentDB().filter(u => !["Super Admin", "IT Dept", "Front Desk", "Pharmacist"].includes(u.role) && u.status === "approved" && (!availabilityStatus[u.username] || availabilityStatus[u.username].free)).length;
        const totalEncounters = shiftDatabase.filter(s => s.patient).length;

        widget1 = `<div class="card h-100 border-0 shadow-sm"><div class="card-header bg-dark text-white border-0 py-3">Provider Availability</div><div class="card-body p-4"><div class="d-flex align-items-center mb-2"><span class="badge bg-success me-2">AVAILABLE</span> <h5 class="m-0 fw-bold">${availableDocs} Providers</h5></div><p class="text-muted m-0">Ready to accept incoming patients.</p></div></div>`;
        widget2 = `<div class="card h-100 border-0 shadow-sm"><div class="card-header bg-primary text-white border-0 py-3">Daily Operations</div><div class="card-body p-4"><p class="m-0"><strong>${totalEncounters} Encounters</strong> registered today.</p></div></div>`;
    }
    else if (["General Practice", "Cardiologist"].includes(user.role)) {
        const myShifts = shiftDatabase.filter(s => s.username === user.username && s.status === "Accepted" && s.patient);
        const nextPatient = myShifts.find(s => s.opStatus !== "POST_OP");
        
        let encounterContent = nextPatient
            ? `<div class="d-flex align-items-center mb-2"><span class="badge bg-primary me-2">NEXT</span> <h5 class="m-0 fw-bold text-truncate" style="max-width: 200px;">${nextPatient.patient}</h5></div><p class="text-muted m-0">${nextPatient.start} • ${nextPatient.complaint || 'General Checkup'}</p>`
            : `<div class="d-flex align-items-center mb-2"><span class="badge bg-secondary me-2">CLEAR</span> <h5 class="m-0 fw-bold">No Patients</h5></div><p class="text-muted m-0">Your schedule is currently clear.</p>`;
        
        let title = user.role === "Cardiologist" ? "STAT Consults" : "Today's Encounters";

        widget1 = `<div class="card h-100 border-0 shadow-sm"><div class="card-header bg-dark text-white border-0 py-3">${title}</div><div class="card-body p-4">${encounterContent}</div></div>`;
        widget2 = `<div class="card h-100 border-0 shadow-sm"><div class="card-header bg-dark text-white border-0 py-3">Clinical Inbox</div><div class="card-body p-4"><p class="m-0">You have <strong>${myShifts.length} active assignment(s)</strong> on your roster.</p></div></div>`;
    }

    if(widget1 && widget2) {
        return `<div class="col-md-6">${widget1}</div><div class="col-md-6">${widget2}</div>`;
    }
    return '';
}

/* Role records mapping */
const roleRecords = {
    "General Practice": `
        <div class="col-lg-3 me-lg-4 h-100 d-flex flex-column mb-3 mb-lg-0">
            <h6 class="fw-bold mb-3 text-secondary text-uppercase tracking-wider">Active Roster</h6>
            <div class="list-group list-group-flush rounded-3 border shadow-sm overflow-auto flex-grow-1 bg-white" id="list-tab" role="tablist">
                <a class="list-group-item list-group-item-action active" id="list-pt1-list" data-bs-toggle="list" href="#list-pt1" role="tab"><strong>John Doe</strong><br><small class="opacity-75">MRN: 9482-A</small></a>
                <a class="list-group-item list-group-item-action" id="list-pt2-list" data-bs-toggle="list" href="#list-pt2" role="tab"><strong>Jane Smith</strong><br><small class="text-muted">MRN: 1104-B</small></a>
            </div>
        </div>
        <div class="col-lg tab-content h-100 overflow-auto" id="nav-tabContent">
            <div class="tab-pane fade show active h-100" id="list-pt1" role="tabpanel">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body p-4 p-md-5">
                        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-4 border-bottom">
                            <div><h2 class="fw-bold text-dark mb-1">Doe, John</h2><p class="text-secondary m-0">DOB: 05/12/1980 (Age 45) &bull; Sex: M &bull; MRN: 9482-A</p></div>
                            <div class="mt-3 mt-md-0"><span class="badge bg-danger bg-opacity-10 text-danger border border-danger p-2 fs-6">ALLERGIES: PENICILLIN</span></div>
                        </div>
                        <h6 class="fw-bold text-secondary text-uppercase mb-3">Recent Notes</h6>
                        <div class="p-4 bg-light rounded-3 border"><p class="m-0">Patient reports mild headaches. BP elevated. Adjusted Lisinopril protocol.</p></div>
                        <button class="btn btn-primary mt-3 fw-bold shadow-sm" onclick="openPrescribeModal('Doe, John')">💊 e-Prescribe Medication</button>
                    </div>
                </div>
            </div>
            <div class="tab-pane fade h-100" id="list-pt2" role="tabpanel">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body p-4 p-md-5">
                        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-4 border-bottom">
                            <div><h2 class="fw-bold text-dark mb-1">Smith, Jane</h2><p class="text-secondary m-0">DOB: 11/04/1993 (Age 32) &bull; Sex: F &bull; MRN: 1104-B</p></div>
                            <div class="mt-3 mt-md-0"><span class="badge bg-light text-dark border p-2 fs-6">ALLERGIES: NKDA</span></div>
                        </div>
                        <button class="btn btn-primary mt-3 fw-bold shadow-sm" onclick="openPrescribeModal('Smith, Jane')">💊 e-Prescribe Medication</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    "Cardiologist": `
        <div class="col-lg-3 me-lg-4 h-100 d-flex flex-column mb-3 mb-lg-0">
            <h6 class="fw-bold mb-3 text-secondary text-uppercase tracking-wider">Cardiac Ward Roster</h6>
            <div class="list-group list-group-flush rounded-3 border shadow-sm overflow-auto flex-grow-1 bg-white" id="list-tab" role="tablist">
                <a class="list-group-item list-group-item-action active" id="list-pt1-list" data-bs-toggle="list" href="#list-pt1" role="tab"><strong>Robert Chen</strong><br><small class="opacity-75">MRN: 8831-C | Afib</small></a>
            </div>
        </div>
        <div class="col-lg tab-content h-100 overflow-auto" id="nav-tabContent">
            <div class="tab-pane fade show active h-100" id="list-pt1" role="tabpanel">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body p-4 p-md-5">
                        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-4 border-bottom">
                            <div><h2 class="fw-bold text-dark mb-1">Chen, Robert</h2><p class="text-secondary m-0">DOB: 02/18/1958 (Age 68) &bull; Sex: M &bull; MRN: 8831-C</p></div>
                            <div class="mt-3 mt-md-0"><span class="badge bg-danger bg-opacity-10 text-danger border border-danger p-2 fs-6">ALLERGIES: SULFA</span></div>
                        </div>
                        <h6 class="fw-bold text-secondary text-uppercase mb-3">Latest EKG Report</h6>
                        <div class="p-4 bg-danger bg-opacity-10 rounded-3 border border-danger"><p class="text-danger fw-bold m-0">Irregular rhythm detected. Heart Rate: 110bpm.</p></div>
                        <button class="btn btn-primary mt-3 fw-bold shadow-sm" onclick="openPrescribeModal('Chen, Robert')">💊 e-Prescribe Medication</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    "IT Dept": `
        <div class="col-12 h-100 d-flex flex-column">
            <div class="card border-0 shadow-sm flex-grow-1 overflow-hidden">
                <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3 border-0">
                    <span class="fw-bold">System Access Logs</span><button class="btn btn-sm btn-outline-light">Export CSV</button>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive h-100">
                        <table class="table table-hover m-0 font-monospace text-sm" style="font-size: 0.85rem;">
                            <thead><tr><th>Timestamp</th><th>User ID</th><th>IP Address</th><th>Action Event</th><th>Status</th></tr></thead>
                            <tbody>
                                <tr><td>2026-04-18 10:01:22</td><td>doc_cindy</td><td>192.168.1.45</td><td>Accessed Chart MRN:9482-A</td><td><span class="badge bg-success">SUCCESS</span></td></tr>
                                <tr><td>2026-04-18 10:03:05</td><td>rx_john</td><td>192.168.1.88</td><td>Verified Rx #88219</td><td><span class="badge bg-success">SUCCESS</span></td></tr>
                                <tr><td>2026-04-18 10:04:10</td><td>UNKNOWN</td><td>10.0.0.5</td><td>Failed Login Attempt</td><td><span class="badge bg-danger">FAILED</span></td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `,
    "Front Desk": `
        <div class="col-md-6"><div class="card h-100 border-0 shadow-sm"><div class="card-header bg-dark text-white border-0 py-3">Registration Operations</div><div class="card-body p-4"><p class="text-muted m-0">Use the <strong>Availability</strong> tab to assign incoming patients to active providers.</p></div></div></div>
        <div class="col-md-6"><div class="card h-100 border-0 shadow-sm"><div class="card-header bg-primary text-white border-0 py-3">Master Directory</div><div class="card-body p-4"><p class="text-muted m-0">Check the <strong>Registration</strong> tab to track full patient clinical journeys, surgical referrals, and discharge statuses.</p></div></div></div>
    `
};

const roleDefinitions = {
    "General Practice": "Patients",
    "Pharmacist": "Pharmacy Queue",
    "Cardiologist": "Cardiac Patients",
    "Surgeon": "Surgical Ward",
    "Nurse": "Active Triage",
    "Front Desk": "Registration",
    "IT Dept": "All Records"
};

/* Hierarchy logic */
function renderHierarchyView() {
    const user = getCurrentUser();
    const titleText = user.role === "Super Admin" ? "Facility-Wide Roster (Super Admin)" : `${user.role} - Department Roster`;
    
    let html = `
        <div class="card border-0 shadow-sm overflow-hidden">
            <div class="card-header bg-dark text-white fw-bold py-3 border-0">${titleText}</div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover m-0 align-middle text-nowrap">
                        <thead class="bg-light">
                            <tr>
                                ${user.role === "Super Admin" ? '<th>Department</th>' : ''}
                                <th>Name</th>
                                <th>Official Title</th>
                                <th>Hierarchy Level</th>
                                ${user.role === "Super Admin" ? '<th class="text-end">Admin Action</th>' : ''}
                            </tr>
                        </thead>
                        <tbody>
    `;

    const db = getCurrentDB();
    const rolesToDisplay = user.role === "Super Admin" 
        ? [...new Set(db.filter(u => u.status === "approved" && u.role !== "Super Admin").map(u => u.role))] 
        : [user.role];

    rolesToDisplay.forEach((role, roleIndex) => {
        const departmentStaff = db.filter(u => u.role === role && u.status === "approved")
            .sort((a, b) => (a.level === "Head" || a.level === "Admin") ? -1 : 1);

        const displayRole = role === "General Practice" ? "Doctor" : role;

        departmentStaff.forEach((staff, index) => {
            const isHead = staff.level === "Head" || staff.level === "Admin";
            const badgeClass = isHead ? "bg-primary" : "bg-secondary bg-opacity-50 text-dark";
            
            let actionBtn = '';
            if (user.role === "Super Admin") {
                if (isHead) {
                    actionBtn = `<button class="btn btn-sm btn-outline-danger fw-medium" onclick="demoteToStaff('${staff.username}')">↓ Demote</button>`;
                } else {
                    actionBtn = `<button class="btn btn-sm btn-outline-success fw-medium" onclick="promoteToHead('${staff.username}')">↑ Promote Head</button>`;
                }
            }

            html += `
                <tr>
                    ${user.role === "Super Admin" ? `<td class="text-secondary fw-medium">${displayRole}</td>` : ''}
                    <td><strong class="${isHead ? 'text-primary' : 'text-dark'}">${staff.name}</strong></td>
                    <td class="text-secondary">${staff.title}</td>
                    <td><span class="badge ${badgeClass} px-2 py-1">${isHead ? 'Department Head' : 'Staff'}</span></td>
                    ${user.role === "Super Admin" ? `<td class="text-end">${actionBtn}</td>` : ''}
                </tr>
            `;
        });
    });

    html += `</tbody></table></div></div></div>`;
    return html;
}

/* Availability board */
function renderAvailabilityView() {
    const user = getCurrentUser();
    const isFrontDesk = user.role === "Front Desk";
    let html = `
        <div class="card border-0 shadow-sm overflow-hidden">
            <div class="card-header bg-dark text-white fw-bold py-3 border-0">Provider Availability Board</div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover m-0 align-middle text-nowrap">
                        <thead class="bg-light">
                            <tr>
                                <th>Provider Name</th>
                                <th>Department</th>
                                <th>Current Status</th>
                                <th class="text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
    `;

    const db = getCurrentDB();
    const providers = db.filter(u => !["Super Admin", "IT Dept", "Front Desk", "Pharmacist"].includes(u.role) && u.status === "approved");

    providers.forEach(staff => {
        const status = availabilityStatus[staff.username] || { free: true };
        const badge = status.free 
            ? `<span class="badge bg-success px-3 py-1">FREE - Ready for Patient</span>`
            : (status.state === 'In Surgery' 
                ? `<span class="badge bg-danger px-3 py-1">IN SURGERY</span>`
                : `<span class="badge bg-warning px-3 py-1">BUSY - With Patient</span>`);

        let actionBtn = '';
        
        if (user.username === staff.username) {
            actionBtn = `<button class="btn btn-sm btn-outline-dark" onclick="toggleAvailability('${staff.username}')">Toggle My Status</button>`;
        } 
        else if (isFrontDesk) {
            if (status.free) {
                actionBtn = `<button class="btn btn-sm btn-primary fw-bold shadow-sm" onclick="frontDeskAssign('${staff.username}')">+ Assign Patient</button>`;
            } else {
                actionBtn = `<button class="btn btn-sm btn-outline-secondary" disabled>Currently Unavailable</button>`;
            }
        }

        html += `
            <tr>
                <td><strong>${staff.name}</strong></td>
                <td class="text-secondary">${staff.role}</td>
                <td>${badge}</td>
                <td class="text-end">${actionBtn}</td>
            </tr>
        `;
    });

    html += `</tbody></table></div></div></div>`;
    return html;
}

/* Master patient directory */
function renderRegistrationDirectory() {
    let html = `
        <div class="col-12 h-100 d-flex flex-column w-100">
            <div class="card border-0 shadow-sm flex-grow-1 overflow-hidden">
                <div class="card-header bg-dark text-white py-3 border-0 d-flex justify-content-between align-items-center">
                    <span class="fw-bold fs-5">Master Patient Registry (Encounter History)</span>
                    <span class="badge bg-light text-dark rounded-pill px-3 py-1">${shiftDatabase.filter(s => s.patient).length} Encounters</span>
                </div>
                <div class="card-body p-0 overflow-auto bg-white">
                    <div class="accordion accordion-flush" id="registryAccordion">
    `;

    const patientShifts = shiftDatabase.filter(s => s.patient).reverse();

    if (patientShifts.length === 0) {
        html += `<div class="text-center py-5 text-muted bg-light h-100 d-flex flex-column justify-content-center"><h5>No patient encounters registered yet.</h5><p>Use the Availability tab to assign a new patient.</p></div>`;
    } else {
        patientShifts.forEach((shift, index) => {
            const statusBadge = shift.status === 'Declined' ? `<span class="badge bg-danger">Declined</span>` 
                : (shift.opStatus === 'POST_OP' ? `<span class="badge bg-success">Discharged / Post-Op</span>` 
                : (shift.opStatus === 'IN_PROGRESS' ? `<span class="badge bg-danger">In Surgery</span>` 
                : `<span class="badge bg-primary">Active (${shift.role})</span>`));

            const parsedNotes = shift.intakeNotes ? shift.intakeNotes.replace(/\n/g, '<br>') : `<span class="text-muted">No clinical notes recorded yet.</span>`;

            html += `
                <div class="accordion-item border-bottom">
                    <h2 class="accordion-header" id="heading${shift.id}">
                        <button class="accordion-button ${index === 0 ? '' : 'collapsed'} bg-light shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${shift.id}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse${shift.id}">
                            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center w-100 me-3">
                                <div class="mb-2 mb-md-0">
                                    <strong class="text-dark d-block fs-5">${shift.patient}</strong>
                                    <small class="text-muted">${shift.date} ${shift.start} • Currently under: <strong>${shift.name} (${shift.role})</strong></small>
                                </div>
                                <div>${statusBadge}</div>
                            </div>
                        </button>
                    </h2>
                    <div id="collapse${shift.id}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="heading${shift.id}" data-bs-parent="#registryAccordion">
                        <div class="accordion-body bg-white p-4">
                            <div class="row g-4">
                                <div class="col-md-4 border-end-md">
                                    <h6 class="fw-bold text-secondary text-uppercase mb-3" style="font-size: 0.8rem;">Initial Intake Details</h6>
                                    <p class="mb-2 small"><strong>Registered By:</strong> ${shift.assignedBy}</p>
                                    <p class="mb-2 small"><strong>Arrival Time:</strong> ${shift.date} at ${shift.start}</p>
                                    <p class="mb-2 small"><strong>Chief Complaint:</strong> <span class="text-danger fw-medium">${shift.complaint || 'None specified'}</span></p>
                                    <p class="mb-0 small"><strong>Allergies:</strong> ${shift.allergies || 'Pending Verification'}</p>
                                </div>
                                <div class="col-md-8">
                                    <h6 class="fw-bold text-secondary text-uppercase mb-3" style="font-size: 0.8rem;">Clinical Journey & Action Log</h6>
                                    <div class="p-3 bg-light border border-secondary border-opacity-25 rounded-3 small font-monospace text-dark" style="white-space: normal; line-height: 1.6;">
                                        ${parsedNotes}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    html += `</div></div></div></div>`;
    return html;
}

let assignModalInstance = null;

function frontDeskAssign(providerUsername) {
    document.getElementById('assign-provider-username').value = providerUsername;
    document.getElementById('assign-patient-name').value = '';
    
    const provider = getCurrentDB().find(u => u.username === providerUsername);
    const complaintInput = document.getElementById('assign-patient-complaint');
    
    if (provider && provider.role === "Surgeon") {
        complaintInput.value = "Emergency Surgery";
        complaintInput.readOnly = true;
        complaintInput.className = "form-control bg-light text-danger fw-bold";
    } else {
        complaintInput.value = "";
        complaintInput.readOnly = false;
        complaintInput.className = "form-control";
    }

    // Default to current time automatically
    const now = new Date();
    document.getElementById('assign-patient-time').value = now.toTimeString().slice(0, 5);

    if (!assignModalInstance) {
        assignModalInstance = new bootstrap.Modal(document.getElementById('assignPatientModal'));
    }
    assignModalInstance.show();
}

function submitFrontDeskAssignment(event) {
    event.preventDefault();
    
    const providerUsername = document.getElementById('assign-provider-username').value;
    const patientName = document.getElementById('assign-patient-name').value.trim();
    const complaint = document.getElementById('assign-patient-complaint').value.trim();
    const timeValue = document.getElementById('assign-patient-time').value;

    const [hours, minutes] = timeValue.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedTime = `${h % 12 || 12}:${minutes} ${ampm}`;

    const provider = getCurrentDB().find(u => u.username === providerUsername);

    shiftDatabase.push({
        id: Date.now(),
        username: provider.username,
        name: provider.name,
        role: provider.role,
        date: new Date().toLocaleDateString(),
        start: formattedTime,
        end: "Pending Completion",
        assignedBy: getCurrentUser().name,
        patient: patientName,
        complaint: complaint,
        status: "Pending"
    });

    availabilityStatus[providerUsername] = { free: false };

    assignModalInstance.hide();
    
    document.getElementById('dynamic-availability-container').innerHTML = renderAvailabilityView();
}

function toggleAvailability(username) {
    if (!availabilityStatus[username]) availabilityStatus[username] = { free: true };
    availabilityStatus[username].free = !availabilityStatus[username].free;
    document.getElementById('dynamic-availability-container').innerHTML = renderAvailabilityView();
}

/* Group chat logic */
function renderChatView() {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    let html = '';
    const currentUser = getCurrentUser().name;

    chatDatabase.forEach(msg => {
        if (msg.sender === "System") {
            html += `<div class="text-center my-4"><span class="badge bg-white text-secondary border px-3 py-2 rounded-pill shadow-sm">${msg.text}</span></div>`;
        } else {
            const isMe = msg.sender === currentUser;
            const align = isMe ? "justify-content-end" : "justify-content-start";
            const bgClass = isMe ? "bg-primary text-white" : "bg-white border text-dark";
            const borderRadius = isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px";
            
            html += `
                <div class="d-flex ${align} mb-3">
                    <div class="d-flex flex-column" style="max-width: 75%;">
                        <div class="d-flex align-items-baseline mb-1 ${isMe ? 'flex-row-reverse' : ''}">
                            <span class="fw-bold text-dark fs-6 mx-1">${isMe ? 'You' : msg.sender}</span>
                            <span class="text-muted" style="font-size: 0.7rem;">${msg.role} &bull; ${msg.time}</span>
                        </div>
                        <div class="p-3 shadow-sm ${bgClass}" style="border-radius: ${borderRadius};">
                            ${msg.text}
                        </div>
                    </div>
                </div>
            `;
        }
    });

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
}

function sendChatMessage(event) {
    event.preventDefault();
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    const currentUser = getCurrentUser();
    chatDatabase.push({
        sender: currentUser.name,
        role: currentUser.role,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        text: text
    });

    input.value = '';
    renderChatView();
}

function promoteToHead(targetUsername) {
    const db = getCurrentDB();
    const target = db.find(u => u.username === targetUsername);
    if (!target) return;
    if (target.status !== "approved") {
        alert("❌ Cannot promote — user is still PENDING approval.");
        return;
    }

    const existingHead = db.find(u => u.role === target.role && (u.level === "Head" || u.level === "Admin"));
    if (existingHead && existingHead.username !== target.username) {
        alert(`Only ONE Department Head allowed for ${target.role}.`);
        return;
    }

    target.level = "Head";
    target.title = "Head " + target.title.replace(/^(Head|Chief|Lead|Director)\s+/i, '');
    document.getElementById('dynamic-hierarchy-container').innerHTML = renderHierarchyView();
}

function demoteToStaff(targetUsername) {
    const db = getCurrentDB();
    const target = db.find(u => u.username === targetUsername);
    if (!target || target.level !== "Head") return;
    if (target.status !== "approved") {
        alert("❌ Cannot demote — user is still PENDING approval.");
        return;
    }

    target.level = "Regular";
    target.title = target.title.replace(/^(Head|Chief|Lead|Director)\s+/i, '');
    document.getElementById('dynamic-hierarchy-container').innerHTML = renderHierarchyView();
}
function enableTouchScrolling() {
    const scrollContainers = [
        '#dynamic-records-container',
        '#dynamic-hierarchy-container',
        '#dynamic-schedule-container',
        '#dynamic-settings-container',
        '#dynamic-cms-container',
        '#chat-messages',
        '.card-body.overflow-auto'
    ];
    
    scrollContainers.forEach(selector => {
        const els = document.querySelectorAll(selector);
        els.forEach(el => {
            if (el) {
                el.style.overflow = 'auto';
                el.style.WebkitOverflowScrolling = 'touch';   // iOS smooth scroll
                el.style.scrollBehavior = 'smooth';
            }
        });
    });
}

function renderSettingsView(user) {
    let html = ``;
    const isAdmin = user.role === "Super Admin" || user.role === "IT Dept";

    if (isAdmin) {
        const myCompany = companyRegistry.find(c => c.name === user.company);
        const inviteKey = myCompany ? myCompany.key : "NO-KEY-FOUND";

        html += `
        <div class="card border-0 shadow-sm mb-4 overflow-hidden">
            <div class="card-header border-0 py-3 d-flex justify-content-between align-items-center" style="background-color: var(--blue);">
                <span class="text-white fw-bold">Facility Administration</span>
                <span class="badge bg-white text-primary rounded-pill px-3 py-1">High Access Level</span>
            </div>
            <div class="card-body p-4">
                <div class="d-flex align-items-center justify-content-between bg-light border p-3 rounded-3 mb-2">
                    <strong class="text-dark">Your Secure Invite Key:</strong> 
                    <span class="badge bg-white text-dark border px-3 py-2 fs-6 font-monospace shadow-sm" style="cursor: pointer; user-select: none;" onclick="copyInviteKey(this, '${inviteKey}')" title="Tap to copy">${inviteKey}</span>
                </div>
                <p class="small text-muted mb-0"><i class="bi bi-info-circle me-1"></i>Share this key with new staff members so they can link their accounts to ${user.company} upon registration.</p>
            </div>
        </div>
        `;

        const pendingUsers = userDatabase.filter(u => u.company === user.company && u.status === "pending");
        let tableRows = pendingUsers.map(u => `
            <tr>
                <td><strong class="text-dark">${u.name}</strong></td>
                <td class="text-secondary">${u.role}</td>
                <td><span class="badge bg-warning text-dark px-2 py-1">Waiting</span></td>
                <td class="text-end"><button class="btn btn-sm btn-success fw-medium px-3" onclick="approveStaff('${u.username}')">Accept User</button></td>
            </tr>
        `).join('');

        if (pendingUsers.length === 0) tableRows = `<tr><td colspan="4" class="text-center text-muted py-5 bg-light">No staff pending approval.</td></tr>`;

        html += `
        <div class="card border-0 shadow-sm overflow-hidden">
            <div class="card-header bg-dark text-white fw-bold py-3 border-0">Pending Staff Approvals</div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover m-0 align-middle text-nowrap">
                        <thead class="bg-light"><tr><th>Name</th><th>Requested Role</th><th>Status</th><th class="text-end">Action</th></tr></thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                </div>
            </div>
        </div>
        `;
    } else {
        html += `<div class="card border-0 shadow-sm"><div class="card-body p-5 text-center text-secondary"><h5 class="fw-bold mb-2">General User Settings</h5><p class="m-0">You do not have facility admin privileges to manage staff or settings.</p></div></div>`;
    }
    return html;
}

function copyInviteKey(element, key) {
    const showCopied = () => {
        element.innerText = "COPIED!";
        element.classList.replace("text-dark", "text-success");
        setTimeout(() => {
            element.innerText = key;
            element.classList.replace("text-success", "text-dark");
        }, 1500);
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(key).then(showCopied);
    } else {
        let textArea = document.createElement("textarea");
        textArea.value = key;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showCopied();
        } catch (err) { }
        document.body.removeChild(textArea);
    }
}

/* Assign shift */
function assignShift() {
    const staffSelect = document.getElementById('assign-staff');
    if(staffSelect && (staffSelect.disabled || !staffSelect.value)) return alert("No staff available to assign.");

    const startEl = document.getElementById('assign-start');
    const endEl = document.getElementById('assign-end');
    if(!startEl || !endEl) return;

    const start = startEl.value;
    const end = endEl.value;

    if(!start || !end) return alert("Please select both start and end times.");

    const targetUser = getCurrentDB().find(u => u.username === staffSelect.value);
    const currentUser = getCurrentUser();

    shiftDatabase.push({
        id: Date.now(),
        username: targetUser.username,
        name: targetUser.name,
        role: targetUser.role,
        date: new Date().toLocaleDateString(),
        start: start,
        end: end,
        assignedBy: currentUser.name,
        status: "Accepted"
    });

    document.getElementById('assign-start').value = '';
    document.getElementById('assign-end').value = '';

    document.getElementById('dynamic-schedule-container').innerHTML = renderScheduleView(currentUser);
    alert(`Shift successfully assigned to ${targetUser.name}!`);
}

function approveStaff(username) {
    const user = userDatabase.find(u => u.username === username);
    if (user) {
        user.status = "approved";
        document.getElementById('dynamic-settings-container').innerHTML = renderSettingsView(getCurrentUser());
        document.getElementById('dynamic-hierarchy-container').innerHTML = renderHierarchyView();
    }
}

/* Accept shift */
function acceptShift(shiftId) {
    const shift = shiftDatabase.find(s => s.id === shiftId);
    if (shift) {
        shift.status = "Accepted";
        const currentUser = getCurrentUser();
        document.getElementById('dynamic-schedule-container').innerHTML = renderScheduleView(currentUser);
        
        if (["General Practice", "Cardiologist", "Nurse", "Surgeon"].includes(currentUser.role)) {
            const recordsContainer = document.getElementById('dynamic-records-container');
            if (recordsContainer) recordsContainer.innerHTML = renderPatientDirectory(currentUser);
            
            switchMainView('records', document.getElementById('dynamic-patient-tab'));
        }
    }
}

function renderPatientDirectory(user) {
    let basePatients = [];
    
    if (user.role === "General Practice") {
        basePatients.push({ id: "mock_pt1", shiftId: "", name: "Doe, John", mrn: "9482-A", dob: "05/12/1980 (Age 45)", sex: "M", badgeClass: "bg-danger bg-opacity-10 text-danger border-danger", badgeText: "ALLERGIES: PENICILLIN", notes: "Patient reports mild headaches. BP elevated. Adjusted Lisinopril protocol.", isCardiac: false });
        basePatients.push({ id: "mock_pt2", shiftId: "", name: "Smith, Jane", mrn: "1104-B", dob: "11/04/1993 (Age 32)", sex: "F", badgeClass: "bg-light text-dark border", badgeText: "ALLERGIES: NKDA", notes: "Annual physical. No immediate concerns.", isCardiac: false });
    } else if (user.role === "Cardiologist") {
        basePatients.push({ id: "mock_pt3", shiftId: "", name: "Chen, Robert", mrn: "8831-C", dob: "02/18/1958 (Age 68)", sex: "M", badgeClass: "bg-danger bg-opacity-10 text-danger border-danger", badgeText: "ALLERGIES: SULFA", notes: "Irregular rhythm detected. Heart Rate: 110bpm.", isCardiac: true });
    } else if (user.role === "Nurse") {
        basePatients.push({ id: "mock_pt4", shiftId: "", name: "Taylor, Mark", mrn: "3391-D", dob: "09/11/1988 (Age 37)", sex: "M", badgeClass: "bg-warning bg-opacity-10 text-dark border-warning", badgeText: "PENDING TRIAGE", notes: "Walk-in. Patient complains of persistent cough for 3 days. Awaiting Vitals Intake.", isCardiac: false });
    } else if (user.role === "Surgeon") {
        basePatients.push({ id: "mock_pt5", shiftId: "", name: "Williams, Tom", mrn: "5122-E", dob: "08/21/1975 (Age 50)", sex: "M", badgeClass: "bg-danger text-white border-danger", badgeText: "PRE-OP CLEARED", notes: "Procedure: Coronary Artery Bypass Graft (CABG).\nECG: Cleared.\nX-Ray: Cleared.\nNurse Verified: Yes.", isCardiac: true });
    }

    const acceptedShifts = shiftDatabase.filter(s => s.username === user.username && s.status === "Accepted" && s.patient);
    acceptedShifts.forEach((shift) => {
        let badgeClass = "bg-warning bg-opacity-10 text-dark border-warning";
        let badgeText = "PENDING TRIAGE";
        let finalNotes = `Chief Complaint: ${shift.complaint}\nAssigned by: ${shift.assignedBy} at ${shift.start}`;

        if (shift.intakeNotes) {
            finalNotes = shift.intakeNotes;
            badgeClass = (shift.allergies && shift.allergies !== 'NKDA' && shift.allergies !== 'NONE') ? "bg-danger bg-opacity-10 text-danger border-danger" : "bg-light text-dark border";
            badgeText = "ALLERGIES: " + (shift.allergies || "NKDA");
        }
        if (shift.opStatus === 'IN_PROGRESS') {
            badgeClass = "bg-danger text-white";
            badgeText = "SURGERY IN PROGRESS";
        } else if (shift.opStatus === 'POST_OP') {
            badgeClass = "bg-success text-white";
            badgeText = "RECOVERY / POST-OP";
        }

        basePatients.push({
            id: `dyn_pt_${shift.id}`,
            shiftId: shift.id,
            name: shift.patient,
            mrn: `NEW-${Math.floor(Math.random() * 9000) + 1000}`,
            dob: "Pending Intake",
            sex: "Unknown",
            badgeClass: badgeClass,
            badgeText: badgeText,
            notes: finalNotes,
            isCardiac: false
        });
    });

    if (basePatients.length === 0) {
        return `<div class="col-12 w-100 d-flex flex-column"><div class="card border-0 shadow-sm flex-grow-1"><div class="card-body p-5 text-center mt-5"><h5 class="text-muted">No active patients in your directory.</h5></div></div></div>`;
    }

    let rosterList = '';
    let rosterContent = '';

    basePatients.forEach((pt, index) => {
        const isActive = index === 0 ? 'active' : '';
        const showActive = index === 0 ? 'show active' : '';
        
        rosterList += `
            <a class="list-group-item list-group-item-action ${isActive}" id="list-${pt.id}-list" data-bs-toggle="list" href="#list-${pt.id}" role="tab">
                <strong>${pt.name}</strong><br><small class="${index === 0 ? 'opacity-75' : 'text-muted'}">MRN: ${pt.mrn}</small>
            </a>
        `;

        const isEKG = pt.isCardiac && pt.id.startsWith("mock");
        const notesStyle = isEKG ? "bg-danger bg-opacity-10 text-danger border-danger" : "bg-light";
        const notesTitle = isEKG ? "Latest EKG Report" : "Clinical Notes";
        
        let actionBtn = '';
        const shift = pt.shiftId ? shiftDatabase.find(s => s.id === pt.shiftId) : null;

        if (user.role === "Nurse") {
            actionBtn = `<button class="btn btn-success mt-3 fw-bold shadow-sm" onclick="openIntakeModal('${pt.shiftId || ''}', '${pt.name}')">📋 Perform Clinical Intake</button>`;
        } else if (user.role === "Surgeon") {
            if (shift && shift.opStatus === 'IN_PROGRESS') {
                 actionBtn = `<button class="btn btn-success mt-3 fw-bold shadow-sm" onclick="completeSurgery(${pt.shiftId})">✓ Complete Surgery & Transfer to PACU</button>`;
            } else if (shift && shift.opStatus === 'POST_OP') {
                 actionBtn = `
                    <button class="btn btn-outline-secondary mt-3 fw-bold shadow-sm me-2" disabled>Surgery Complete</button>
                    <button class="btn btn-primary mt-3 fw-bold shadow-sm" onclick="openPrescribeModal('${pt.name}')">💊 e-Prescribe Post-Op Meds</button>`;
            } else {
                 actionBtn = `<button class="btn btn-danger mt-3 fw-bold shadow-sm me-2" onclick="openBeginSurgeryModal(${pt.shiftId || ''}, '${pt.name}')"> Begin Surgery</button>`;
            }
        } else {
            actionBtn = `
                <button class="btn btn-primary mt-3 fw-bold shadow-sm me-2" onclick="openPrescribeModal('${pt.name}')">💊 e-Prescribe Medication</button>
                <button class="btn btn-outline-danger mt-3 fw-bold shadow-sm" onclick="openSurgeryModal('${pt.shiftId || ''}', '${pt.name}')"> Refer to Surgery</button>`;
        }

        rosterContent += `
            <div class="tab-pane fade ${showActive} h-100" id="list-${pt.id}" role="tabpanel">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body p-4 p-md-5">
                        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-4 border-bottom">
                            <div><h2 class="fw-bold text-dark mb-1">${pt.name}</h2><p class="text-secondary m-0">DOB: ${pt.dob} &bull; Sex: ${pt.sex} &bull; MRN: ${pt.mrn}</p></div>
                            <div class="mt-3 mt-md-0"><span class="badge border p-2 fs-6 ${pt.badgeClass}">${pt.badgeText}</span></div>
                        </div>
                        <h6 class="fw-bold text-secondary text-uppercase mb-3">${notesTitle}</h6>
                        <div class="p-4 rounded-3 border ${notesStyle}">
                            <p class="m-0 ${isEKG ? 'fw-bold' : ''}" style="white-space: pre-wrap;">${pt.notes}</p>
                        </div>
                        ${actionBtn}
                    </div>
                </div>
            </div>
        `;
    });

    return `
        <div class="col-lg-3 me-lg-4 h-100 d-flex flex-column mb-3 mb-lg-0">
            <h6 class="fw-bold mb-3 text-secondary text-uppercase tracking-wider">${user.role === "Cardiologist" ? 'Cardiac Ward Roster' : (user.role === "Surgeon" ? 'Surgical Ward' : (user.role === "Nurse" ? 'Triage Queue' : 'Active Roster'))}</h6>
            <div class="list-group list-group-flush rounded-3 border shadow-sm overflow-auto flex-grow-1 bg-white" id="list-tab" role="tablist">
                ${rosterList}
            </div>
        </div>
        <div class="col-lg tab-content h-100 overflow-auto" id="nav-tabContent">
            ${rosterContent}
        </div>
    `;
}

function declineShift(shiftId) {
    const shift = shiftDatabase.find(s => s.id === shiftId);
    if (shift) {
        shift.status = "Declined";
        if (availabilityStatus[shift.username]) {
            availabilityStatus[shift.username].free = true;
        }
        document.getElementById('dynamic-schedule-container').innerHTML = renderScheduleView(getCurrentUser());
        if (document.getElementById('dynamic-availability-container')) document.getElementById('dynamic-availability-container').innerHTML = renderAvailabilityView();
    }
}

function renderScheduleView(user) {
    let shiftsToShow = [];
    if (user.level === "Head") {
        shiftsToShow = shiftDatabase.filter(s => s.role === user.role);
    } else {
        shiftsToShow = shiftDatabase.filter(s => s.username === user.username);
    }

    let rows = shiftsToShow.map(s => {
        const patientInfo = s.patient 
            ? `<br><small class="text-danger fw-bold mt-1 d-block"><i class="bi bi-person-fill"></i> Patient: ${s.patient} (${s.complaint})</small>` 
            : '';
            
        let statusUI = '';
        if (s.status === "Pending") {
            statusUI = `<span class="badge bg-warning text-dark border border-warning px-2 py-1 mb-1 d-inline-block shadow-sm">Pending Acceptance</span>`;
            if (s.username === user.username) {
                statusUI += `<div class="mt-2">
                    <button class="btn btn-sm btn-success fw-bold py-1 px-2 me-1 shadow-sm" onclick="acceptShift(${s.id})">✓ Accept</button>
                    <button class="btn btn-sm btn-danger fw-bold py-1 px-2 shadow-sm" onclick="declineShift(${s.id})">✗ Decline</button>
                </div>`;
            }
        } else if (s.status === "Declined") {
            statusUI = `<span class="badge bg-danger border px-2 py-1 mb-1 d-inline-block shadow-sm">Declined</span>`;
        } else {
            statusUI = `<span class="badge bg-success border px-2 py-1 mb-1 d-inline-block shadow-sm">Accepted / Active</span>`;
        }

        return `
        <tr>
            <td><strong class="text-dark">${s.date}</strong></td>
            <td><span class="text-primary fw-bold">${s.start} - ${s.end}</span>${patientInfo}</td>
            ${user.level === "Head" ? `<td><span class="text-secondary fw-medium">${s.name}</span></td>` : ''}
            <td>
                ${statusUI}
                <div class="mt-1"><small class="text-muted">Assigned by ${s.assignedBy}</small></div>
            </td>
        </tr>
        `;
    }).join('');

    if (shiftsToShow.length === 0) {
        rows = `<tr><td colspan="4" class="text-center text-muted py-5 bg-light">No shifts scheduled yet.</td></tr>`;
    }

    return `
        <div class="card border-0 shadow-sm overflow-hidden">
            <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3 border-0">
                <span class="fw-bold">${user.level === 'Head' ? 'Department Schedule Overview' : 'My Assigned Shifts'}</span>
                <span class="badge bg-white text-dark rounded-pill px-3 py-1">${shiftsToShow.length} Active Shifts</span>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover m-0 align-middle text-nowrap">
                        <thead class="bg-light">
                            <tr>
                                <th>Date</th>
                                <th>Time (Start - End)</th>
                                ${user.level === "Head" ? '<th>Staff Member</th>' : ''}
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

/* Authentication logic */
function toggleAuth(view) {
    document.getElementById('login-error').style.display = 'none';
    document.getElementById('register-error').style.display = 'none';
    document.getElementById('company-error').style.display = 'none';
    
    document.getElementById('login-view').style.display = view === 'login' ? 'block' : 'none';
    document.getElementById('register-view').style.display = view === 'register' ? 'block' : 'none';
    document.getElementById('company-view').style.display = view === 'company' ? 'block' : 'none';

    const topBtn = document.getElementById('top-auth-btn');
    if (topBtn) {
        if (view === 'login') {
            topBtn.setAttribute('onclick', "toggleAuth('company')");
            topBtn.innerHTML = "🏢 Register Clinic / Company";
        } else {
            topBtn.setAttribute('onclick', "toggleAuth('login')");
            topBtn.innerHTML = "🔑 Return to Log In";
        }
    }
}

function handleCompanyRegister(event) {
    event.preventDefault();
    const errorDiv = document.getElementById('company-error');
    errorDiv.style.display = 'none';
    
    const companyName = document.getElementById('comp-name').value.trim();
    const name = document.getElementById('comp-admin-name').value.trim();
    const username = document.getElementById('comp-admin-user').value.trim();
    const password = document.getElementById('comp-password').value;

    if (password !== document.getElementById('comp-confirm').value) {
        errorDiv.innerText = "Error: Passwords do not match.";
        errorDiv.style.display = 'block';
        return;
    }
    if (userDatabase.find(u => u.username === username)) {
        errorDiv.innerText = "Error: Admin username already taken.";
        errorDiv.style.display = 'block';
        return;
    }

    const generatedKey = "KEY-" + Math.random().toString(36).substr(2, 8).toUpperCase();
    companyRegistry.push({ name: companyName, key: generatedKey });

    userDatabase.push({ 
        name, username, password, 
        role: "Super Admin", title: "Facility Administrator", level: "Admin",
        company: companyName, status: "approved"
    });
    
    document.getElementById('company-success').style.display = 'block';
    event.target.reset();
    setTimeout(() => toggleAuth('login'), 2000);
}

function handleRegister(event) {
    event.preventDefault();
    const errorDiv = document.getElementById('register-error');
    errorDiv.style.display = 'none';
    
    const keyInput = document.getElementById('reg-company-key').value.trim();
    const name = document.getElementById('reg-name').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    const role = document.getElementById('reg-role').value;

    if (password !== confirm) {
        errorDiv.innerText = "Error: Passwords do not match.";
        errorDiv.style.display = 'block';
        return;
    }

    const validCompany = companyRegistry.find(c => c.key === keyInput);
    if (!validCompany) {
        errorDiv.innerText = "Error: Invalid Company Invite Key.";
        errorDiv.style.display = 'block';
        return;
    }
    if (userDatabase.find(u => u.username === username)) {
        errorDiv.innerText = "Error: Username taken.";
        errorDiv.style.display = 'block';
        return;
    }

    userDatabase.push({ 
        name, username, password, role, 
        title: "Staff " + role, level: "Regular", 
        company: validCompany.name, status: "pending" 
    });
    
    document.getElementById('register-success').style.display = 'block';
    event.target.reset();
    setTimeout(() => toggleAuth('login'), 2000);
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (username.toLowerCase() === "public" && password.toLowerCase() === "public") {
        isDemoMode = true;
        currentUserIndex = 0;
        document.getElementById('dev-warning').style.display = 'block';
        finishLogin(demoUserDatabase[0]);
        return;
    }

    isDemoMode = false;
    const userIndex = userDatabase.findIndex(u => u.username === username && u.password === password);
    if (userIndex !== -1) {
        currentUserIndex = userIndex;
        document.getElementById('dev-warning').style.display = 'none';
        finishLogin(userDatabase[userIndex]);
    } else {
        const errorDiv = document.getElementById('login-error');
        errorDiv.innerText = "Invalid.";
        errorDiv.style.display = 'block';
    }
}

function finishLogin(user) {
    chatDatabase = [];
    shiftDatabase = [];

    document.getElementById('auth-container').style.setProperty('display', 'none', 'important');
    document.getElementById('app-container').style.setProperty('display', 'flex', 'important');

    const cycleBtn = document.getElementById('cycle-role-btn');
    if (cycleBtn) {
        cycleBtn.style.display = isDemoMode ? 'inline-block' : 'none';
    }

    if (user.status === "pending") {
        document.getElementById('sidebar').style.setProperty('display', 'none', 'important');
        switchMainView('lobby', null);
    } else {
        document.getElementById('sidebar').style.setProperty('display', 'flex', 'important');
        applyRoleToUI(user.name, user.role);
    }
}

function handleLogout() {
    document.getElementById('app-container').style.setProperty('display', 'none', 'important');
    document.getElementById('auth-container').style.setProperty('display', 'flex', 'important');
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
}

/* Apply role to UI */
function applyRoleToUI(name, roleTitle) {
    document.getElementById('user-name').innerText = name;
    document.getElementById('user-role').innerText = roleTitle;

    const navDash = document.querySelector('a[onclick*="dashboard"]');
    const navPatients = document.getElementById('dynamic-patient-tab');
    const navSchedule = document.querySelector('a[onclick*="schedule"]');
    const navIT = document.getElementById('nav-item-complaint');
    const navHierarchy = document.querySelector('a[onclick*="hierarchy"]');
    const navChat = document.querySelector('a[onclick*="chat"]');
    const navAvailability = document.getElementById('nav-item-availability');
    const navCMS = document.getElementById('nav-item-cms');

    if (roleTitle === "Super Admin") {
        navDash.parentElement.style.display = 'none';
        navDash.parentElement.style.display = 'block';
        navPatients.parentElement.style.display = 'none';
        navSchedule.parentElement.style.display = 'none';
        navIT.style.display = 'none';
        navChat.parentElement.style.display = 'block';
        navHierarchy.parentElement.style.display = 'block';
        if (navAvailability) navAvailability.style.display = 'none';
        if (navCMS) navCMS.style.display = 'none';
        navHierarchy.click(); 
        navDash.click(); 
    } else {
        navDash.parentElement.style.display = 'block';
        navPatients.parentElement.style.display = 'block';
        navSchedule.parentElement.style.display = 'block';
        navIT.style.display = roleTitle === "IT Dept" ? 'none' : 'block';
        
        if (navAvailability) {
            const hideAvailability = ["Super Admin", "IT Dept", "Pharmacist"].includes(roleTitle);
            navAvailability.style.display = hideAvailability ? 'none' : 'block';
        }
        
        if (navCMS) {
            navCMS.style.display = roleTitle === "IT Dept" ? 'block' : 'none';
        }

        const currentUser = getCurrentUser();
        navChat.parentElement.style.display = (currentUser.level === "Head" || currentUser.level === "Admin") ? 'block' : 'none';
        
        navDash.click();
    }

    document.getElementById('dynamic-hierarchy-container').innerHTML = renderHierarchyView();
    document.getElementById('dynamic-schedule-container').innerHTML = renderScheduleView(getCurrentUser());
    document.getElementById('dynamic-settings-container').innerHTML = renderSettingsView(getCurrentUser());
    document.getElementById('dynamic-availability-container').innerHTML = renderAvailabilityView();
    if (document.getElementById('dynamic-cms-container')) {
        document.getElementById('dynamic-cms-container').innerHTML = renderCMSView();
    }
    renderChatView();
    renderDashboardCarousel();
    enableTouchScrolling();

    const tabName = roleDefinitions[roleTitle] || "Records";
    document.getElementById('dynamic-patient-tab').innerText = tabName;
    document.getElementById('patient-header-title').innerText = tabName + " Directory";

    const customWidgets = renderDashboardWidgets(getCurrentUser());
    if (customWidgets) {
        document.getElementById('dynamic-dashboard-widgets').innerHTML = customWidgets;
    } else {
        document.getElementById('dynamic-dashboard-widgets').innerHTML = `<div class="col-12"><div class="card border-0 shadow-sm"><div class="card-body p-5 text-center text-muted">No specific dashboard widgets mapped for ${roleTitle} yet.</div></div></div>`;
    }

    const recordsContainer = document.getElementById('dynamic-records-container');

    if (roleTitle === "IT Dept") {
        recordsContainer.innerHTML = `
            <div class="row w-100 h-100 m-0 g-4">
                <div class="col-xl-6 h-100 d-flex flex-column pb-3">
                    ${renderAuditLogs().replace(/col-12 h-100/g, 'w-100 flex-grow-1 d-flex flex-column')}
                </div>
                <div class="col-xl-6 h-100 d-flex flex-column pb-3">
                    ${renderITRecordsView().replace(/col-12 h-100/g, 'w-100 flex-grow-1 d-flex flex-column')}
                </div>
            </div>
        `;
        
    } else if (roleTitle === "Front Desk") {
        recordsContainer.innerHTML = renderRegistrationDirectory();
        
    } else if (roleTitle === "Pharmacist") {
        recordsContainer.innerHTML = renderPharmacyQueue();
    } else if (["General Practice", "Cardiologist", "Nurse", "Surgeon"].includes(roleTitle)) {
        recordsContainer.innerHTML = renderPatientDirectory(getCurrentUser());
    } else if (roleRecords[roleTitle]) {
        recordsContainer.innerHTML = roleRecords[roleTitle];
        
    } else {
        recordsContainer.innerHTML = `
        <div class="col-12 w-100">
            <div class="card border-0 shadow-sm w-100">
                <div class="card-body p-5 text-center mt-5">
                    <h5 class="text-muted">No specific records view mapped for ${roleTitle} yet.</h5>
                </div>
            </div>
        </div>`;
    }

}

function cycleRole() {
    if (!isDemoMode) return;
    currentUserIndex++;
    if (currentUserIndex >= demoUserDatabase.length) currentUserIndex = 0;
    const nextUser = demoUserDatabase[currentUserIndex];
    applyRoleToUI(nextUser.name, nextUser.role);
}

function switchMainView(viewName, clickedElement) {
    if (clickedElement) {
        document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
        clickedElement.classList.add('active');
    }
    document.querySelectorAll('#main-content-area > div[id^="view-"]').forEach(div => div.style.display = 'none');
    const target = document.getElementById('view-' + viewName);
    if (target) target.style.display = 'flex';
    
    if (viewName === 'dashboard') {
        const user = getCurrentUser();
        const customWidgets = renderDashboardWidgets(user);
        if (customWidgets) {
            document.getElementById('dynamic-dashboard-widgets').innerHTML = customWidgets;
        }
    }

    const sidebar = document.getElementById('sidebar');
    if(sidebar && sidebar.classList.contains('mobile-show')) {
        sidebar.classList.remove('mobile-show');
    }
}

function submitITTicket(event) {
    event.preventDefault();
    
    const subject = document.getElementById('ticket-subject').value;
    const desc = document.getElementById('ticket-desc').value;
    
    const activeUser = getCurrentUser();

    const newTicket = {
        id: 1000 + ticketDatabase.length + 1,
        sender: activeUser.name,
        subject: subject,
        desc: desc,
        priority: "Normal",
        date: new Date().toLocaleDateString()
    };

    ticketDatabase.push(newTicket);
    
    const successMsg = document.getElementById('ticket-success');
    successMsg.classList.remove('d-none');
    successMsg.style.display = 'block';
    event.target.reset();
    
    setTimeout(() => { 
        successMsg.classList.add('d-none');
        successMsg.style.display = 'none'; 
    }, 3000);
    
    auditDatabase.push({
        id: 5000 + auditDatabase.length + 1,
        time: new Date().toLocaleString(),
        user: activeUser.username,
        ip: "10.0." + Math.floor(Math.random() * 255) + "." + Math.floor(Math.random() * 255),
        action: "Submitted IT Ticket",
        status: "SUCCESS",
        details: `Ticket Category: ${subject}\n\nDescription provided:\n${desc}`
    });
}

/* Pharmacy queue logic */
let ePrescribeModalInstance = null;

function openPrescribeModal(patientName) {
    document.getElementById('rx-patient-name').value = patientName;
    
    const container = document.getElementById('rx-meds-container');
    container.innerHTML = '';
    addRxRow();

    if (!ePrescribeModalInstance) {
        ePrescribeModalInstance = new bootstrap.Modal(document.getElementById('ePrescribeModal'));
    }
    ePrescribeModalInstance.show();
}

function addRxRow() {
    const container = document.getElementById('rx-meds-container');
    const row = document.createElement('div');
    row.className = "rx-row border p-3 mb-3 rounded position-relative bg-white shadow-sm";
    row.innerHTML = `
        ${container.children.length > 0 ? '<button type="button" class="btn-close position-absolute top-0 end-0 m-2" onclick="this.parentElement.remove()" aria-label="Remove"></button>' : ''}
        <div class="mb-2">
            <label class="form-label fw-bold text-secondary small text-uppercase">Medication</label>
            <input type="text" class="form-control rx-medication" required placeholder="e.g., Amoxicillin">
        </div>
        <div class="mb-2">
            <label class="form-label fw-bold text-secondary small text-uppercase">Dosage & Frequency</label>
            <input type="text" class="form-control rx-dosage" required placeholder="e.g., 500mg PO TID">
        </div>
        <div class="mb-0">
            <label class="form-label fw-bold text-secondary small text-uppercase">Instructions / Notes (Optional)</label>
            <textarea class="form-control rx-notes" rows="1" placeholder="e.g., Take with food."></textarea>
        </div>
    `;
    container.appendChild(row);
}

function submitPrescription(event) {
    event.preventDefault();
    const patientName = document.getElementById('rx-patient-name').value;
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const currentUser = getCurrentUser();

    let medsAdded = 0;
    const rows = document.querySelectorAll('.rx-row');
    
    rows.forEach(row => {
        const medication = row.querySelector('.rx-medication').value.trim();
        const dosage = row.querySelector('.rx-dosage').value.trim();
        const notes = row.querySelector('.rx-notes').value.trim();
        
        if (medication && dosage) {
            rxDatabase.push({
                id: Date.now() + Math.floor(Math.random() * 10000),
                time: timeString,
                patient: patientName,
                medication: medication,
                dosage: dosage,
                notes: notes,
                status: "Pending",
                doctor: currentUser.name.replace('Dr. ', '') 
            });
            medsAdded++;
        }
    });

    ePrescribeModalInstance.hide();
    
    alert(`Success! ${medsAdded} medication(s) prescribed for ${patientName} transmitted securely to the Pharmacy.`);
}

function verifyPrescription(rxId) {
    const rx = rxDatabase.find(r => r.id === rxId);
    if (rx) {
        rx.status = "Filled";
        document.getElementById('dynamic-records-container').innerHTML = renderPharmacyQueue();
    }
}

function renderPharmacyQueue() {
    const pendingCount = rxDatabase.filter(rx => rx.status === "Pending").length;
    
    let rows = rxDatabase.map(rx => {
        const actionBtn = rx.status === "Pending" 
            ? `<button class="btn btn-sm btn-primary shadow-sm fw-bold px-3" onclick="verifyPrescription(${rx.id})">Verify & Fill</button>`
            : `<span class="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2"><i class="bi bi-check-circle-fill me-1"></i>Filled</span>`;
        return `
            <tr>
                <td class="text-secondary fw-medium">${rx.time}</td>
                <td><strong class="text-dark">${rx.patient}</strong><br><small class="text-muted">Dr. ${rx.doctor}</small></td>
                <td><span class="badge bg-primary bg-opacity-10 text-primary border border-primary px-3 py-2 fs-6 shadow-sm">${rx.medication}</span></td>
                <td><strong class="text-dark">${rx.dosage}</strong><br><small class="text-muted">${rx.notes || 'No special instructions'}</small></td>
                <td class="text-end">${actionBtn}</td>
            </tr>
        `;
    }).reverse().join('');

    if (rxDatabase.length === 0) rows = `<tr><td colspan="5" class="text-center py-5 text-muted bg-light">No prescriptions in queue.</td></tr>`;

    return `
        <div class="col-12 h-100 d-flex flex-column w-100">
            <div class="card border-0 shadow-sm flex-grow-1 overflow-hidden">
                <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3 border-0">
                    <span class="fw-bold fs-5">Pharmacy Fulfillment Queue</span>
                    <span class="badge ${pendingCount > 0 ? 'bg-danger' : 'bg-secondary'} rounded-pill px-3 py-2">${pendingCount} STAT Orders</span>
                </div>
                <div class="card-body p-0 overflow-auto">
                    <div class="table-responsive h-100">
                        <table class="table table-hover align-middle m-0 text-nowrap">
                            <thead class="bg-light">
                                <tr><th>Time Sent</th><th>Patient & Prescriber</th><th>Medication</th><th>Dosage & Notes</th><th class="text-end">Action</th></tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/* Intake and triage logic */
let intakeModalInstance = null;

function openIntakeModal(shiftId, patientName) {
    if (!shiftId) {
        alert("This is a demo patient. To test the Intake workflow, please use the Front Desk to assign a real Walk-in patient to your schedule.");
        return;
    }
    document.getElementById('intake-shift-id').value = shiftId;
    document.getElementById('intake-patient-name').value = patientName;
    document.getElementById('intake-bp').value = '';
    document.getElementById('intake-hr').value = '';
    document.getElementById('intake-temp').value = '';
    document.getElementById('intake-pain').value = '';
    document.getElementById('intake-meds').value = '';
    document.getElementById('intake-allergies').value = '';

    const docSelect = document.getElementById('intake-doctor');
    const doctors = getCurrentDB().filter(u => ["General Practice", "Cardiologist"].includes(u.role) && u.status === "approved");
    
    let options = '<option value="" disabled selected>Select an available Doctor...</option>';
    doctors.forEach(doc => {
        const status = availabilityStatus[doc.username] || { free: true };
        options += `<option value="${doc.username}">${doc.name} - ${doc.role}${status.free ? " (Available)" : " (Busy)"}</option>`;
    });
    docSelect.innerHTML = options;

    if (!intakeModalInstance) intakeModalInstance = new bootstrap.Modal(document.getElementById('intakeModal'));
    intakeModalInstance.show();
}

function submitIntake(event) {
    event.preventDefault();
    
    const shift = shiftDatabase.find(s => s.id === parseInt(document.getElementById('intake-shift-id').value, 10));
    const doc = getCurrentDB().find(u => u.username === document.getElementById('intake-doctor').value);
    const currentUser = getCurrentUser();

    if (shift && doc) {
        const existingNote = shift.complaint ? `CHIEF COMPLAINT: ${shift.complaint}\n\n` : '';
        shift.intakeNotes = `${existingNote}VITALS: BP ${document.getElementById('intake-bp').value} | HR ${document.getElementById('intake-hr').value} bpm | Temp ${document.getElementById('intake-temp').value}°F\nPAIN SCALE: ${document.getElementById('intake-pain').value}/10\nCURRENT MEDS: ${document.getElementById('intake-meds').value}\nALLERGIES: ${document.getElementById('intake-allergies').value.toUpperCase()}`;
        
        shift.allergies = document.getElementById('intake-allergies').value.toUpperCase();
        
        shift.username = doc.username; shift.name = doc.name; shift.role = doc.role; shift.status = "Pending";
        
        if (availabilityStatus[currentUser.username]) availabilityStatus[currentUser.username].free = true;
        availabilityStatus[doc.username] = { free: false };

        intakeModalInstance.hide();
        document.getElementById('dynamic-records-container').innerHTML = renderPatientDirectory(currentUser);
        alert(`Intake complete! Patient transferred successfully to ${doc.name}.`);
    }
}

/* Surgical referral logic */
let surgeryModalInstance = null;

function openSurgeryModal(shiftId, patientName) {
    if (!shiftId) {
        alert("This is a demo patient. To test the Surgical Referral workflow, please use the Front Desk to assign a real patient and perform intake first.");
        return;
    }
    document.getElementById('surgery-shift-id').value = shiftId;
    document.getElementById('surgery-patient-name').value = patientName;
    document.getElementById('surgery-diagnosis').value = '';
    ['chk-diagnosis', 'chk-ecg', 'chk-imaging', 'chk-nurse'].forEach(id => document.getElementById(id).checked = false);

    const docSelect = document.getElementById('surgery-doctor');
    const surgeons = getCurrentDB().filter(u => u.role === "Surgeon" && u.status === "approved");
    
    let options = '<option value="" disabled selected>Select an available Surgeon...</option>';
    surgeons.forEach(doc => {
        const status = availabilityStatus[doc.username] || { free: true };
        options += `<option value="${doc.username}">${doc.name} - ${doc.role}${status.free ? " (Available)" : " (Busy)"}</option>`;
    });
    docSelect.innerHTML = options;

    if (!surgeryModalInstance) surgeryModalInstance = new bootstrap.Modal(document.getElementById('surgeryModal'));
    surgeryModalInstance.show();
}

function submitSurgeryReferral(event) {
    event.preventDefault();
    const shift = shiftDatabase.find(s => s.id === parseInt(document.getElementById('surgery-shift-id').value, 10));
    const doc = getCurrentDB().find(u => u.username === document.getElementById('surgery-doctor').value);
    const currentUser = getCurrentUser();

    if (shift && doc) {
        const diagnosis = document.getElementById('surgery-diagnosis').value;
        const existingNote = shift.intakeNotes ? shift.intakeNotes + '\n\n' : (shift.complaint ? `CHIEF COMPLAINT: ${shift.complaint}\n\n` : '');
        shift.intakeNotes = `${existingNote}SURGICAL REFERRAL: ${diagnosis}\nPRE-OP CHECKLIST: Confirmed Diagnosis, ECG Cleared, Imaging Cleared, Nurse Verified.`;
        shift.username = doc.username; shift.name = doc.name; shift.role = doc.role; shift.status = "Pending";
        
        if (availabilityStatus[currentUser.username]) availabilityStatus[currentUser.username].free = true;
        availabilityStatus[doc.username] = { free: false };
        surgeryModalInstance.hide();
        document.getElementById('dynamic-records-container').innerHTML = renderPatientDirectory(currentUser);
        alert(`Surgical Referral complete! Patient transferred to ${doc.name} for immediate operation.`);
    }
}

/* Surgical workflow logic */
let beginSurgeryModalInstance = null;

function openBeginSurgeryModal(shiftId, patientName) {
    if (!shiftId) {
        alert("This is a demo patient. A real patient record is required to initiate a surgical procedure.");
        return;
    }
    document.getElementById('begin-surgery-shift-id').value = shiftId;
    document.getElementById('begin-surgery-patient-name').innerText = patientName;

    ['to-identity', 'to-site', 'to-equipment'].forEach(id => document.getElementById(id).checked = false);
    document.getElementById('surgery-duration').value = '';

    const now = new Date();
    document.getElementById('surgery-time-out').value = now.toTimeString().slice(0, 5);

    if (!beginSurgeryModalInstance) {
        beginSurgeryModalInstance = new bootstrap.Modal(document.getElementById('beginSurgeryModal'));
    }
    beginSurgeryModalInstance.show();
}

function submitBeginSurgery(event) {
    event.preventDefault();
    const shiftId = parseInt(document.getElementById('begin-surgery-shift-id').value, 10);
    const shift = shiftDatabase.find(s => s.id === shiftId);
    const currentUser = getCurrentUser();

    if (shift) {
        const timeOut = document.getElementById('surgery-time-out').value;
        const duration = document.getElementById('surgery-duration').value;

        const [hours, minutes] = timeOut.split(':');
        const h = parseInt(hours, 10);
        const formattedTimeOut = `${h % 12 || 12}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`;

        shift.opStatus = "IN_PROGRESS";
        shift.intakeNotes += `\n\n[SURGERY INITIATED]\nTime Out Conducted: ${formattedTimeOut}\nEstimated Duration: ${duration} hours\nVerification: Identity, Site, & Equipment Confirmed.`;
        
        availabilityStatus[currentUser.username] = { free: false, state: 'In Surgery' };

        auditDatabase.push({
            id: 5000 + auditDatabase.length + 1,
            time: new Date().toLocaleString(),
            user: currentUser.username,
            ip: "10.0." + Math.floor(Math.random() * 255) + "." + Math.floor(Math.random() * 255),
            action: "Began Surgical Procedure",
            status: "SUCCESS",
            details: `Surgeon ${currentUser.name} initiated surgery for patient ${shift.patient}.\nTime Out Recorded at: ${formattedTimeOut}\nEstimated Time in OR: ${duration} hours.`
        });

        beginSurgeryModalInstance.hide();
        
        document.getElementById('dynamic-records-container').innerHTML = renderPatientDirectory(currentUser);
        if (document.getElementById('dynamic-availability-container')) {
            document.getElementById('dynamic-availability-container').innerHTML = renderAvailabilityView();
        }
        alert(`Time Out successful. Surgery logged as initiated at ${formattedTimeOut}.`);
    }
}

function completeSurgery(shiftId) {
    if (!confirm("Are you sure you want to mark this surgery as complete? The patient will be moved to Post-Op status.")) {
        return;
    }

    const shift = shiftDatabase.find(s => s.id === shiftId);
    const currentUser = getCurrentUser();

    if (shift) {
        shift.opStatus = "POST_OP";
        shift.intakeNotes += "\n\nPROCEDURE COMPLETE. Patient transferred to PACU for recovery.";
        
        availabilityStatus[currentUser.username] = { free: true };

        document.getElementById('dynamic-records-container').innerHTML = renderPatientDirectory(currentUser);
        if (document.getElementById('dynamic-availability-container')) {
            document.getElementById('dynamic-availability-container').innerHTML = renderAvailabilityView();
        }
        alert('Surgery complete. Patient is now in post-op recovery.');
    }
}