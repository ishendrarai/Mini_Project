const API_URL = "http://localhost:3000";

const app = {
  init: function () {
    this.loadAll();
    // Setup Search
    document
      .getElementById("globalSearch")
      .addEventListener("keyup", this.searchTable);
  },

  loadAll: function () {
    dashboardManager.updateStats();
    studentManager.fetch();
    sectionManager.fetch();
    resultManager.fetch();
  },

  switchTab: function (tabName) {
    // UI Updates
    document
      .querySelectorAll(".menu-item")
      .forEach((btn) => btn.classList.remove("active"));
    if (event && event.currentTarget)
      event.currentTarget.classList.add("active");

    document
      .querySelectorAll(".view-section")
      .forEach((view) => (view.style.display = "none"));
    document.getElementById(`${tabName}-view`).style.display = "block";

    // Update Title
    document.getElementById("page-title").innerText =
      tabName.charAt(0).toUpperCase() +
      tabName.slice(1) +
      (tabName === "dashboard" ? " Overview" : " Management");

    if (tabName === "dashboard") dashboardManager.updateStats();
  },

  openModal: function (modalId) {
    document.getElementById(modalId).style.display = "flex";
    if (modalId === "studentModal")
      sectionManager.populateDropdown("studentSectionDropdown");
    if (modalId === "resultModal")
      studentManager.populateDropdown("resultStudentDropdown");
  },

  closeModal: function (modalId) {
    document.getElementById(modalId).style.display = "none";
    document.querySelector(`#${modalId} form`).reset();
  },

  showToast: function (title, message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
            <i class="fas ${
              type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
            }"></i>
            <div class="toast-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  searchTable: function () {
    const input = document.getElementById("globalSearch").value.toLowerCase();

    // FIX: Find the view that is NOT hidden (works on first load too)
    const activeView = document.querySelector(
      '.view-section:not([style*="display: none"])'
    );

    if (!activeView) return;

    // Find all rows in the active table
    const rows = activeView.querySelectorAll("tbody tr");

    // If we are on Dashboard, there are no rows, so do nothing
    if (rows.length === 0) return;

    rows.forEach((row) => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(input) ? "" : "none";
    });
  },
};

const dashboardManager = {
  updateStats: async () => {
    try {
      const [sRes, secRes, rRes] = await Promise.all([
        fetch(`${API_URL}/students`),
        fetch(`${API_URL}/sections`),
        fetch(`${API_URL}/results`),
      ]);

      const students = await sRes.json();
      const sections = await secRes.json();
      const results = await rRes.json();

      // Animate Numbers
      document.getElementById("stat-total-students").innerText =
        students.length;
      document.getElementById("stat-total-sections").innerText =
        sections.length;

      const avg = results.length
        ? (
            results.reduce((a, b) => a + parseInt(b.marks), 0) / results.length
          ).toFixed(1)
        : 0;
      document.getElementById("stat-avg-score").innerText = avg + "%";
    } catch (e) {
      console.error("Stats Error", e);
    }
  },
};

const studentManager = {
  fetch: async () => {
    const res = await fetch(`${API_URL}/students`);
    const data = await res.json();
    const tbody = document.getElementById("students-body");
    tbody.innerHTML = "";
    data.forEach((s) => {
      tbody.innerHTML += `
                <tr>
                    <td style="font-weight:600"><i class="fas fa-user-circle" style="color:#cbd5e1; margin-right:8px"></i> ${s.name}</td>
                    <td>${s.email}</td>
                    <td><span style="background:#f1f5f9; padding:4px 8px; border-radius:6px; font-size:0.85rem">${s.section}</span></td>
                    <td>${s.enrollmentDate}</td>
                    <td>
                        <button class="btn-text" style="color:var(--primary)" onclick="app.showToast('Info', 'Edit coming soon', 'info')"><i class="fas fa-edit"></i></button>
                        <button class="btn-text" style="color:#ef4444" onclick="studentManager.delete('${s.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
    });
  },

  add: async (e) => {
    e.preventDefault();
    const student = {
      name: document.getElementById("studentName").value,
      email: document.getElementById("studentEmail").value,
      section: document.getElementById("studentSectionDropdown").value,
      enrollmentDate: document.getElementById("studentDate").value,
    };
    await fetch(`${API_URL}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    });
    app.closeModal("studentModal");
    app.showToast("Success", "Student added successfully");
    app.loadAll();
  },

  delete: async (id) => {
    if (confirm("Delete student?")) {
      await fetch(`${API_URL}/students/${id}`, { method: "DELETE" });
      app.showToast("Deleted", "Student removed");
      app.loadAll();
    }
  },

  populateDropdown: async (id) => {
    const res = await fetch(`${API_URL}/students`);
    const data = await res.json();
    const select = document.getElementById(id);
    select.innerHTML = '<option value="">Select Student</option>';
    data.forEach(
      (s) =>
        (select.innerHTML += `<option value="${s.name}">${s.name}</option>`)
    );
  },
};

const sectionManager = {
  fetch: async () => {
    const res = await fetch(`${API_URL}/sections`);
    const data = await res.json();
    const tbody = document.getElementById("sections-body");
    tbody.innerHTML = "";
    data.forEach((s) => {
      tbody.innerHTML += `
                <tr>
                    <td style="font-weight:600">${s.name}</td>
                    <td>${s.description}</td>
                    <td>${s.totalStudents || 0} / 40</td>
                    <td><button class="btn-text" style="color:#ef4444" onclick="sectionManager.delete('${
                      s.id
                    }')"><i class="fas fa-trash"></i></button></td>
                </tr>
            `;
    });
  },

  add: async (e) => {
    e.preventDefault();
    const section = {
      name: document.getElementById("sectionName").value,
      description: document.getElementById("sectionDesc").value,
    };
    await fetch(`${API_URL}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(section),
    });
    app.closeModal("sectionModal");
    app.showToast("Success", "Section created");
    app.loadAll();
  },

  delete: async (id) => {
    await fetch(`${API_URL}/sections/${id}`, { method: "DELETE" });
    app.showToast("Deleted", "Section removed");
    app.loadAll();
  },

  populateDropdown: async (id) => {
    const res = await fetch(`${API_URL}/sections`);
    const data = await res.json();
    const select = document.getElementById(id);
    select.innerHTML = '<option value="">Select Section</option>';
    data.forEach(
      (s) =>
        (select.innerHTML += `<option value="${s.name}">${s.name}</option>`)
    );
  },
};

const resultManager = {
  fetch: async () => {
    const res = await fetch(`${API_URL}/results`);
    const data = await res.json();
    const tbody = document.getElementById("results-body");
    tbody.innerHTML = "";
    if (!data.length)
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align:center; padding:20px; color:#94a3b8">No results yet</td></tr>';

    data.forEach((r) => {
      let color =
        r.marks >= 90 ? "#10b981" : r.marks >= 50 ? "#3b82f6" : "#ef4444";
      tbody.innerHTML += `
                <tr>
                    <td style="font-weight:600">${r.studentName}</td>
                    <td>${r.subject}</td>
                    <td>${r.marks}</td>
                    <td><span style="color:${color}; background:${color}15; padding:4px 12px; border-radius:20px; font-weight:700">${
        r.marks >= 50 ? "PASS" : "FAIL"
      }</span></td>
                    <td>${r.examDate}</td>
                    <td><button class="btn-text" style="color:#ef4444" onclick="resultManager.delete('${
                      r.id
                    }')"><i class="fas fa-trash"></i></button></td>
                </tr>
            `;
    });
  },

  add: async (e) => {
    e.preventDefault();
    const result = {
      studentName: document.getElementById("resultStudentDropdown").value,
      subject: document.getElementById("resultSubject").value,
      marks: document.getElementById("resultMarks").value,
      examDate: document.getElementById("resultDate").value,
    };
    await fetch(`${API_URL}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    });
    app.closeModal("resultModal");
    app.showToast("Success", "Result added");
    app.loadAll();
  },

  delete: async (id) => {
    await fetch(`${API_URL}/results/${id}`, { method: "DELETE" });
    app.showToast("Deleted", "Result removed");
    app.loadAll();
  },
};

document.addEventListener("DOMContentLoaded", () => app.init());
document
  .getElementById("studentForm")
  .addEventListener("submit", studentManager.add);
document
  .getElementById("sectionForm")
  .addEventListener("submit", sectionManager.add);
document
  .getElementById("resultForm")
  .addEventListener("submit", resultManager.add);
