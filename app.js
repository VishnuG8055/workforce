/* =====================================================
   WORKFORCEIQ - COMPLETE APPLICATION LOGIC
   HR Planning Analysis Dashboard with All Questions
   ===================================================== */

let hrData = null;
const charts = {};

const chartColors = [
    "#6557F5",
    "#F59B4A",
    "#4C9BEA",
    "#3DBB91",
    "#ED6B83",
    "#8B7CF6",
    "#F4C95D",
    "#58B4AE",
    "#A78BFA",
    "#FB7185"
];

/* =====================================================
   INITIALIZATION
   ===================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    initializeDate();
    initializeNavigation();
    initializeIcons();

    try {
        // Load data from JSON file
        const response = await fetch("hr-data.json");
        if (!response.ok) {
            throw new Error("Could not load hr-data.json");
        }

        hrData = await response.json();
        renderDashboard();
        initializeIcons();

    } catch (error) {
        console.error("Error loading data:", error);
    }
});

/* =====================================================
   BASIC INITIALIZATION
   ===================================================== */

function initializeDate() {
    const dateElement = document.getElementById("currentDate");
    const footerDate = document.getElementById("footerDate");
    
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    if (dateElement) dateElement.textContent = formattedDate;
    if (footerDate) footerDate.textContent = formattedDate;
}

function initializeNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const section = item.dataset.section;
            showSection(section);
            
            // Update nav active state
            navItems.forEach(ni => ni.classList.remove("active"));
            item.classList.add("active");
            
            // Update breadcrumb
            const title = item.textContent.trim();
            const breadcrumb = document.getElementById("breadcrumbTitle");
            if (breadcrumb) breadcrumb.textContent = title;
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.remove("active-section");
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add("active-section");
        
        // Recreate charts if it's a chart section
        if (sectionId === "gaps") {
            setTimeout(() => {
                createGapCharts();
            }, 100);
        } else if (sectionId === "recruitment") {
            setTimeout(() => {
                createRecruitmentCharts();
            }, 100);
        } else if (sectionId === "planning") {
            setTimeout(() => {
                createProjectionCharts();
            }, 100);
        } else if (sectionId === "learning") {
            setTimeout(() => {
                createLDCharts();
                populateLDTable();
            }, 100);
        } else if (sectionId === "succession") {
            setTimeout(() => {
                createSuccessionChart();
            }, 100);
        }
    }
}

function initializeIcons() {
    if (window.lucide) {
        lucide.createIcons();
    }
}

/* =====================================================
   MAIN DASHBOARD RENDER
   ===================================================== */

function renderDashboard() {
    if (!hrData) return;

    // Update KPIs
    updateOverviewKPIs();
    
    // Populate Gap Analysis Table
    populateGapTable();
    
    // Create initial charts
    setTimeout(() => {
        createGapCharts();
    }, 100);
}

/* =====================================================
   OVERVIEW KPIs
   ===================================================== */

function updateOverviewKPIs() {
    if (!hrData || !hrData.summary) return;

    const summary = hrData.summary;
    
    document.getElementById("totalEmployees").textContent = summary.totalEmployees || "350";
    document.getElementById("attritionCount").textContent = summary.totalAttrition || "29";
    document.getElementById("hrGaps").textContent = summary.totalAttrition || "29";
    document.getElementById("successionGaps").textContent = summary.totalSuccessionGap || "30";
}

/* =====================================================
   QUESTION 1: GAP ANALYSIS
   ===================================================== */

const gapData = [
    { department: "Regulatory Affairs", position: "Compliance Officer", current: 20, attrition: 4, gap: 4 },
    { department: "Human Resources", position: "Talent Acquisition Specialist", current: 17, attrition: 3, gap: 3 },
    { department: "Marketing", position: "Marketing Executive", current: 18, attrition: 3, gap: 3 },
    { department: "IT", position: "Cybersecurity Analyst", current: 13, attrition: 2, gap: 2 },
    { department: "Marketing", position: "Digital Marketing Specialist", current: 21, attrition: 2, gap: 2 },
    { department: "Sales", position: "Enterprise Sales Manager", current: 11, attrition: 2, gap: 2 },
    { department: "Sales", position: "Sales Executive", current: 10, attrition: 2, gap: 2 },
    { department: "Supply Chain", position: "Procurement Executive", current: 21, attrition: 2, gap: 2 },
    { department: "Customer Support", position: "Customer Support Executive", current: 17, attrition: 1, gap: 1 },
    { department: "Finance", position: "Financial Analyst", current: 24, attrition: 1, gap: 1 },
    { department: "Finance", position: "Accountant", current: 7, attrition: 1, gap: 1 },
    { department: "IT", position: "Systems Administrator", current: 7, attrition: 1, gap: 1 },
    { department: "IT", position: "Software Engineer", current: 11, attrition: 1, gap: 1 },
    { department: "Network Operations", position: "Field Operations Engineer", current: 9, attrition: 1, gap: 1 },
    { department: "Network Operations", position: "Transmission Engineer", current: 11, attrition: 1, gap: 1 },
    { department: "Regulatory Affairs", position: "Regulatory Specialist", current: 13, attrition: 1, gap: 1 },
    { department: "RF Planning", position: "RF Engineer", current: 26, attrition: 1, gap: 1 }
];

function populateGapTable() {
    const tbody = document.getElementById("gapTableBody");
    if (!tbody) return;

    tbody.innerHTML = gapData.map(item => `
        <tr>
            <td>${item.department}</td>
            <td>${item.position}</td>
            <td>${item.current}</td>
            <td>${item.attrition}</td>
            <td>${item.current - item.attrition}</td>
            <td>${((item.attrition / item.current) * 100).toFixed(1)}%</td>
        </tr>
    `).join("");
}

function createGapCharts() {
    // Chart 1: Gap Distribution
    const gapCtx = document.getElementById("gapChart");
    if (gapCtx && !charts.gapChart) {
        const gapPositions = gapData.map(g => g.position.substring(0, 15));
        const gapValues = gapData.map(g => g.gap);

        charts.gapChart = new Chart(gapCtx, {
            type: "bar",
            data: {
                labels: gapPositions,
                datasets: [{
                    label: "Gap Count",
                    data: gapValues,
                    backgroundColor: gapValues.map((v, i) => 
                        v >= 3 ? "#ED6B83" : v === 2 ? "#F59B4A" : "#4C9BEA"
                    ),
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { beginAtZero: true, max: 5 }
                }
            }
        });
    }

    // Chart 2: Department Attrition
    const deptAttritionCtx = document.getElementById("departmentAttritionChart");
    if (deptAttritionCtx && !charts.deptAttritionChart) {
        const deptMap = {};
        gapData.forEach(g => {
            if (!deptMap[g.department]) {
                deptMap[g.department] = { total: 0, attrition: 0 };
            }
            deptMap[g.department].attrition += g.attrition;
            deptMap[g.department].total += g.current;
        });

        const depts = Object.keys(deptMap);
        const attritions = depts.map(d => deptMap[d].attrition);

        charts.deptAttritionChart = new Chart(deptAttritionCtx, {
            type: "doughnut",
            data: {
                labels: depts,
                datasets: [{
                    data: attritions,
                    backgroundColor: chartColors,
                    borderColor: "#fff",
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: "right",
                        labels: { font: { size: 11 }, padding: 10 }
                    }
                }
            }
        });
    }
}

/* =====================================================
   QUESTION 2: RECRUITMENT PRIORITY
   ===================================================== */

const recruitmentData = [
    { department: "Regulatory Affairs", positions: 4, priority: "critical", timeline: "Q1 2025" },
    { department: "Human Resources", positions: 3, priority: "critical", timeline: "Q1 2025" },
    { department: "Marketing", positions: 5, priority: "high", timeline: "Q1-Q2 2025" },
    { department: "Sales", positions: 4, priority: "high", timeline: "Q1 2025" },
    { department: "IT", positions: 2, priority: "medium", timeline: "Q2 2025" },
    { department: "Others", positions: 11, priority: "medium", timeline: "Q2-Q3 2025" }
];

function createRecruitmentCharts() {
    const recruitCtx = document.getElementById("recruitmentPriorityChart");
    if (recruitCtx && !charts.recruitmentChart) {
        const departments = recruitmentData.map(r => r.department);
        const positions = recruitmentData.map(r => r.positions);
        const colors = recruitmentData.map(r => {
            if (r.priority === "critical") return "#ED6B83";
            if (r.priority === "high") return "#F59B4A";
            return "#4C9BEA";
        });

        charts.recruitmentChart = new Chart(recruitCtx, {
            type: "bar",
            data: {
                labels: departments,
                datasets: [{
                    label: "Positions to Hire",
                    data: positions,
                    backgroundColor: colors,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: "x",
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, max: 12 }
                }
            }
        });
    }
}

/* =====================================================
   QUESTION 3: WORKFORCE PROJECTION
   ===================================================== */

function createProjectionCharts() {
    const projectionCtx = document.getElementById("projectionChart");
    if (projectionCtx && !charts.projectionChart) {
        charts.projectionChart = new Chart(projectionCtx, {
            type: "line",
            data: {
                labels: ["2025\nCurrent", "2026\nProjected", "2027\nTarget"],
                datasets: [{
                    label: "Headcount",
                    data: [350, 380, 415],
                    borderColor: "#6557F5",
                    backgroundColor: "rgba(101, 87, 245, 0.1)",
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 8,
                    pointBackgroundColor: "#6557F5",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 300,
                        max: 450
                    }
                }
            }
        });
    }

    // Department growth chart
    const deptGrowthCtx = document.getElementById("departmentGrowthChart");
    if (deptGrowthCtx && !charts.deptGrowthChart) {
        const departments = [
            "RF Planning", "IT", "Sales", "Marketing", 
            "Network Operations", "Finance", "Others"
        ];
        const growth2027 = [12, 8, 7, 6, 5, 4, 7];

        charts.deptGrowthChart = new Chart(deptGrowthCtx, {
            type: "bar",
            data: {
                labels: departments,
                datasets: [{
                    label: "2027 Growth (New Hires)",
                    data: growth2027,
                    backgroundColor: chartColors,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

/* =====================================================
   QUESTION 4: L&D ANALYSIS
   ===================================================== */

const ldData = [
    { 
        program: "5G Network Fundamentals", 
        participants: 59, 
        hours: 8, 
        avgProductivity: 85.9,
        effectiveness: "Highly Effective",
        trend: "declining"
    },
    { 
        program: "Fiber Optic Maintenance", 
        participants: 65, 
        hours: 11, 
        avgProductivity: 88.1,
        effectiveness: "Effective",
        trend: "declining"
    },
    { 
        program: "Customer Experience", 
        participants: 163, 
        hours: 11, 
        avgProductivity: 88.15,
        effectiveness: "Effective",
        trend: "up"
    },
    { 
        program: "Leadership Essentials", 
        participants: 159, 
        hours: 10, 
        avgProductivity: 83.3,
        effectiveness: "Neutral",
        trend: "variable"
    },
    { 
        program: "Cybersecurity Awareness", 
        participants: 61, 
        hours: 8, 
        avgProductivity: 81.5,
        effectiveness: "Neutral",
        trend: "declining"
    },
    { 
        program: "Sales Excellence", 
        participants: 121, 
        hours: 20, 
        avgProductivity: 89.1,
        effectiveness: "Neutral",
        trend: "variable"
    },
    { 
        program: "Regulatory Compliance", 
        participants: 161, 
        hours: 16, 
        avgProductivity: 81.55,
        effectiveness: "Effective",
        trend: "declining"
    },
    { 
        program: "Project Management", 
        participants: 127, 
        hours: 20, 
        avgProductivity: 91.2,
        effectiveness: "Effective",
        trend: "up"
    },
    { 
        program: "Cloud Infrastructure", 
        participants: 81, 
        hours: 16, 
        avgProductivity: 89.25,
        effectiveness: "Effective",
        trend: "stable"
    },
    { 
        program: "Workplace Safety", 
        participants: 50, 
        hours: 14, 
        avgProductivity: 87.0,
        effectiveness: "Highly Effective",
        trend: "declining"
    }
];

function populateLDTable() {
    const tbody = document.getElementById("ldTableBody");
    if (!tbody) return;

    tbody.innerHTML = ldData.map(item => `
        <tr>
            <td>${item.program}</td>
            <td>${item.participants}</td>
            <td>${item.hours} hrs</td>
            <td>${item.avgProductivity.toFixed(1)}%</td>
            <td>
                <span style="
                    background: ${item.effectiveness === "Highly Effective" ? "#e6f9f5" : 
                                 item.effectiveness === "Effective" ? "#e8f2ff" : "#fef3e6"};
                    color: ${item.effectiveness === "Highly Effective" ? "#3DBB91" : 
                            item.effectiveness === "Effective" ? "#4C9BEA" : "#F59B4A"};
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                ">
                    ${item.effectiveness}
                </span>
            </td>
            <td>${item.trend}</td>
        </tr>
    `).join("");
}

function createLDCharts() {
    // Effectiveness distribution chart
    const effectivenessCtx = document.getElementById("effectivenessChart");
    if (effectivenessCtx && !charts.effectivenessChart) {
        const effectivenessCounts = {
            "Highly Effective": ldData.filter(d => d.effectiveness === "Highly Effective").length,
            "Effective": ldData.filter(d => d.effectiveness === "Effective").length,
            "Neutral": ldData.filter(d => d.effectiveness === "Neutral").length
        };

        charts.effectivenessChart = new Chart(effectivenessCtx, {
            type: "doughnut",
            data: {
                labels: Object.keys(effectivenessCounts),
                datasets: [{
                    data: Object.values(effectivenessCounts),
                    backgroundColor: ["#3DBB91", "#4C9BEA", "#F59B4A"],
                    borderColor: "#fff",
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { font: { size: 11 }, padding: 15 }
                    }
                }
            }
        });
    }

    // Productivity by quarter
    const productivityCtx = document.getElementById("productivityChart");
    if (productivityCtx && !charts.productivityChart) {
        const quarters = ["Q1", "Q2", "Q3", "Q4"];
        const q1Prod = [91.1, 92.6, 89.2, 89.6, 92.9, 83.2, 89.0, 79.4, 87.1, 93.0];
        const q4Prod = [77.3, 81.4, 95.5, 92.4, 75.0, 96.8, 76.0, 95.8, 90.6, 80.5];

        charts.productivityChart = new Chart(productivityCtx, {
            type: "line",
            data: {
                labels: quarters,
                datasets: [
                    {
                        label: "Q1 Average",
                        data: [91.1, 91.1, 91.1, 91.1],
                        borderColor: "#3DBB91",
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: "Q4 Average",
                        data: [86.0, 86.0, 86.0, 86.0],
                        borderColor: "#ED6B83",
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        labels: { font: { size: 11 } }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 70,
                        max: 100
                    }
                }
            }
        });
    }
}

/* =====================================================
   QUESTION 5: SUCCESSION PLANNING
   ===================================================== */

const successionData = [
    { position: "HR Business Partner", current: 11, required: 16, gap: 5, priority: "critical" },
    { position: "Cybersecurity Analyst", current: 13, required: 18, gap: 5, priority: "critical" },
    { position: "Enterprise Sales Manager", current: 11, required: 16, gap: 5, priority: "high" },
    { position: "Systems Administrator", current: 7, required: 11, gap: 4, priority: "high" },
    { position: "Financial Analyst", current: 24, required: 28, gap: 4, priority: "high" },
    { position: "Senior RF Engineer", current: 14, required: 16, gap: 2, priority: "medium" },
    { position: "Compliance Officer", current: 20, required: 22, gap: 2, priority: "medium" },
    { position: "NOC Engineer", current: 11, required: 12, gap: 1, priority: "low" },
    { position: "Area Sales Manager", current: 13, required: 14, gap: 1, priority: "low" },
    { position: "Network Engineer", current: 8, required: 9, gap: 1, priority: "low" }
];

function createSuccessionChart() {
    const successionCtx = document.getElementById("successionChart");
    if (successionCtx && !charts.successionChart) {
        const positions = successionData.map(s => s.position.substring(0, 12));
        const gaps = successionData.map(s => s.gap);
        const colors = successionData.map(s => {
            if (s.priority === "critical") return "#ED6B83";
            if (s.priority === "high") return "#F59B4A";
            if (s.priority === "medium") return "#4C9BEA";
            return "#3DBB91";
        });

        charts.successionChart = new Chart(successionCtx, {
            type: "bar",
            data: {
                labels: positions,
                datasets: [{
                    label: "Succession Gap",
                    data: gaps,
                    backgroundColor: colors,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { beginAtZero: true, max: 6 }
                }
            }
        });
    }
}

/* =====================================================
   UTILITY FUNCTIONS
   ===================================================== */

function formatNumber(value) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }
    return Number(value).toLocaleString("en-IN");
}

function formatDecimal(value, digits = 2) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }
    return Number(value).toFixed(digits);
}

// Make showSection globally available
window.showSection = showSection;
