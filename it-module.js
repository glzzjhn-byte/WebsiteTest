/* IT support module */
let ticketDatabase = [
    { id: 1001, sender: "Dr. Cindy", subject: "Forgot Password", desc: "I cannot log into the secondary terminal in Room 4.", priority: "High", date: "4/18/2026" },
    { id: 1002, sender: "Sarah N.", subject: "Bug Report", desc: "The triage scheduling dropdown is freezing.", priority: "Normal", date: "4/18/2026" }
];
/* Audit log database */
let auditDatabase = [
    { id: 5001, time: "2026-04-18 10:01:22", user: "doc", ip: "192.168.1.45", action: "Accessed Chart MRN:9482-A", status: "SUCCESS", details: "Viewed patient history and prescribed 10mg Lisinopril." },
    { id: 5002, time: "2026-04-18 10:03:05", user: "rx", ip: "192.168.1.88", action: "Verified Rx #88219", status: "SUCCESS", details: "Cross-referenced allergies. No contraindications found. Approved." },
    { id: 5003, time: "2026-04-18 10:04:10", user: "UNKNOWN", ip: "10.0.0.5", action: "Failed Login Attempt", status: "FAILED", details: "Attempted password 3 times incorrectly. IP flagged for security review." }
];

/* Master ticket view */
function renderITRecordsView() {
    let tableRows = '';
    for (let i = ticketDatabase.length - 1; i >= 0; i--) {
        const t = ticketDatabase[i];
        const badgeColor = t.priority === "High" ? "background-color: var(--red);" : "background-color: var(--blue);";
        
        tableRows += `
            <tr style="cursor: pointer;" onclick="openTicketView(${t.id})">
                <td>#${t.id}</td>
                <td>${t.date}</td>
                <td class="fw-bold">${t.sender}</td>
                <td>${t.subject}</td>
                <td><span class="badge" style="${badgeColor}">${t.priority}</span></td>
                <td><span class="text-muted small">Click to open &rarr;</span></td>
            </tr>
        `;
    }

    return `
        <div class="col-12 h-100 d-flex flex-column" id="it-master-table">
            <div class="card border-slate flex-grow-1 shadow-sm">
                <div class="card-header bg-slate text-white d-flex flex-wrap justify-content-between align-items-center py-3 gap-2">
                    <span class="fw-bold">Helpdesk Ticket Queue</span>
                    <span class="badge bg-light text-dark">${ticketDatabase.length} Total</span>
                </div>
                <div class="card-body p-0">
                <div class="table-responsive h-100">
                    <table class="table table-striped table-hover m-0 align-middle" style="font-size: 0.9em;">
                        <thead style="background-color: var(--slate); color: var(--white);">
                            <tr><th>Ticket ID</th><th>Date</th><th>Sender</th><th>Subject</th><th>Priority</th><th>Action</th></tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                </div>
                </div>
            </div>
        </div>
    `;
}

/* Master audit view */
function renderAuditLogs() {
    let tableRows = '';
    
    for (let i = auditDatabase.length - 1; i >= 0; i--) {
        const log = auditDatabase[i];
        const statusColor = log.status === 'SUCCESS' ? 'text-success' : 'text-danger';
        
        tableRows += `
            <tr style="cursor: pointer;" onclick="openAuditDetail(${log.id})">
                <td class="text-nowrap">${log.time}</td>
                <td>${log.user}</td>
                <td>${log.ip}</td>
                <td class="text-wrap">${log.action}</td>
                <td class="${statusColor} fw-bold">${log.status}</td>
            </tr>
        `;
    }

    return `
        <div class="col-12 h-100 d-flex flex-column" id="it-audit-master">
            <div class="card border-slate flex-grow-1 shadow-sm">
                <div class="card-header bg-slate text-white d-flex flex-wrap justify-content-between align-items-center py-3 gap-2">
                    <span class="fw-bold">System Access Logs </span>
                    <span class="badge bg-light text-dark">${auditDatabase.length} Total Logs</span>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive h-100">
                        <table class="table table-sm table-hover m-0 align-middle" style="font-family: monospace; font-size: 0.85em;">
                            <thead style="background-color: var(--slate); color: var(--white);">
                                <tr><th>Timestamp</th><th>User ID</th><th>IP Address</th><th>Action Event</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/* Audit detail view */
function openAuditDetail(logId) {
    const log = auditDatabase.find(l => l.id === logId);
    if (!log) return;

    const container = document.getElementById('dynamic-records-container');
    
    container.innerHTML = `
        <div class="col-12 h-100 d-flex flex-column" id="it-audit-detail">
            <div class="mb-3">
                <button class="btn btn-sm text-white fw-bold shadow-sm" style="background-color: var(--slate); border-radius: 4px;" onclick="closeAuditDetail()">
                    &larr; Return to System Access Logs
                </button>
            </div>
            
            <div class="card border-slate flex-grow-1 shadow-sm">
                <div class="card-header bg-slate text-white d-flex flex-wrap justify-content-between align-items-center py-3 gap-2">
                    <span class="fw-bold">Audit Log Entry #${log.id}</span>
                    <span class="badge" style="background-color: ${log.status === 'SUCCESS' ? 'green' : 'var(--red)'}; font-size: 0.85em;">${log.status}</span>
                </div>
                
                <div class="card-body p-3 p-md-4 overflow-auto" style="font-family: monospace; font-size: 0.9em;">
                    <div class="row mb-4 border-bottom border-slate pb-3 g-3">
                        <div class="col-12 col-md-6">
                            <p class="mb-1 text-break"><strong>Timestamp:</strong> ${log.time}</p>
                            <p class="mb-1 text-break"><strong>User ID:</strong> ${log.user}</p>
                            <p class="mb-1 text-break"><strong>IP Address:</strong> ${log.ip}</p>
                        </div>
                        <div class="col-12 col-md-6">
                            <p class="mb-1 text-break"><strong>Action Trigger:</strong> <span style="color: var(--blue);">${log.action}</span></p>
                        </div>
                    </div>
                    
                    <h6 class="fw-bold mb-2" style="color: var(--slate);">Full Context / Payload:</h6>
                    <div class="p-3 bg-light border-slate rounded text-break" style="border: 1px solid; min-height: 120px; white-space: pre-wrap; font-size: 0.95em;">${log.details}</div>
                </div>
            </div>
        </div>
    `;
}

/* Close audit view */
function closeAuditDetail() {
    if (typeof applyRoleToUI === 'function') {
        const user = getCurrentUser();
        applyRoleToUI(user.name, user.role);
    } else {
        document.getElementById('dynamic-records-container').innerHTML = renderAuditLogs();
    }
}

/* Ticket detail view */
function openTicketView(ticketId) {
    const ticket = ticketDatabase.find(t => t.id === ticketId);
    if (!ticket) return;

    const container = document.getElementById('dynamic-records-container');
    container.innerHTML = `
        <div class="col-12 h-100 d-flex flex-column" id="it-detail-view">
            <div class="mb-3">
                <button class="btn btn-sm text-white shadow-sm fw-bold" style="background-color: var(--slate); border-radius: 4px;" onclick="closeTicketView()">← Back to All Records</button>
            </div>
            <div class="card border-slate flex-grow-1 shadow-sm">
                <div class="card-header bg-slate text-white d-flex flex-wrap justify-content-between align-items-center py-3 gap-2">
                    <span class="fw-bold">Ticket #${ticket.id} Details</span>
                    <span class="badge" style="background-color: ${ticket.priority === 'High' ? 'var(--red)' : 'var(--blue)'};">${ticket.priority} Priority</span>
                </div>
                <div class="card-body p-3 p-md-4 overflow-auto">
                    <h4 class="mb-1 text-break" style="color: var(--blue);">${ticket.subject}</h4>
                    <p class="text-muted small border-bottom border-slate pb-3 mb-3">Submitted by: <strong class="text-dark">${ticket.sender}</strong> on ${ticket.date}</p>
                    <div class="p-3 mb-4 border-slate bg-light rounded text-break" style="border: 1px solid; min-height: 120px; font-size: 0.95em; white-space: pre-wrap;">${ticket.desc}</div>
                    <div class="w-100 mt-auto" style="max-width: 300px;">
                        <label class="form-label fw-bold">Update Priority:</label>
                        <select id="edit-ticket-priority" class="form-select border-slate mb-3 shadow-sm">
                            <option value="Normal" ${ticket.priority === 'Normal' ? 'selected' : ''}>Normal</option>
                            <option value="High" ${ticket.priority === 'High' ? 'selected' : ''}>High (Urgent)</option>
                        </select>
                        <button class="btn text-white fw-bold w-100 shadow-sm" style="background-color: var(--blue);" onclick="saveTicketUpdates(${ticket.id})">Save & Close Ticket</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/* Close ticket view */
function closeTicketView() {
    if (typeof applyRoleToUI === 'function') {
        const user = getCurrentUser();
        applyRoleToUI(user.name, user.role);
    } else {
        document.getElementById('dynamic-records-container').innerHTML = renderITRecordsView();
    }
}

/* Save ticket priority */
function saveTicketUpdates(ticketId) {
    const newPriority = document.getElementById('edit-ticket-priority').value;
    const ticketIndex = ticketDatabase.findIndex(t => t.id === ticketId);
    if (ticketIndex !== -1) ticketDatabase[ticketIndex].priority = newPriority;
    closeTicketView();
}