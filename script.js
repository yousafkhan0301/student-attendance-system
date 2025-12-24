let students = [];
let filteredStudents = [];
let attendanceData = JSON.parse(localStorage.getItem("attendanceData")) || {};

/* MESSAGE SYSTEM */
function showMessage(msg) {
  messageText.innerText = msg;
  messageBox.style.display = "flex";
  mainContent.classList.add("blur");
}

function closeMessage() {
  messageBox.style.display = "none";
  mainContent.classList.remove("blur");
}

/* LOAD STUDENTS */
function selectStudentFile() {
  const url = "https://yousafkhan0301.github.io/student-attendance-system/students.md";

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error("Unable to fetch students file");
      return response.text();
    })
    .then(data => {
      students = data
        .split("\n")
        .map(n => n.trim())
        .filter(n => n)
        .map(name => ({ name, status: "" }));

      filteredStudents = students;
      render();

      // Automatically set today's date
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      document.getElementById("attendanceDate").value = `${yyyy}-${mm}-${dd}`;

      showMessage("Students loaded successfully");
    })
    .catch(err => {
      showMessage("Error loading students: " + err.message);
    });
}


/* RENDER */
function render() {
  table.innerHTML = "";
  filteredStudents.forEach(s => {
    table.innerHTML += `
      <tr>
        <td>${s.name}</td>
        <td>
          <button class="circle-btn present ${s.status==="Present"?"active":""}"
            onclick="setStatus('${s.name}','Present')">P</button>
          <button class="circle-btn absent ${s.status==="Absent"?"active":""}"
            onclick="setStatus('${s.name}','Absent')">A</button>
          <button class="circle-btn late ${s.status==="Late"?"active":""}"
            onclick="setStatus('${s.name}','Late')">L</button>
        </td>
      </tr>
    `;
  });
  updateSummary();
}

function setStatus(name, status) {
  students.find(s => s.name === name).status = status;
  render();
}

/* SEARCH */
function searchStudent() {
  const val = searchInput.value.toLowerCase();
  filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(val)
  );
  render();
}

/* SUMMARY */
function updateSummary() {
  let p=0,a=0,l=0;
  students.forEach(s=>{
    if(s.status==="Present")p++;
    if(s.status==="Absent")a++;
    if(s.status==="Late")l++;
  });
  summary.innerText = `Summary → Present: ${p} | Absent: ${a} | Late: ${l}`;
}

/* SAVE */
function saveTodayAttendance() {
  const date = attendanceDate.value;
  if (!date) return showMessage("Please select a date");

  attendanceData[date] = JSON.parse(JSON.stringify(students));
  localStorage.setItem("attendanceData", JSON.stringify(attendanceData));
  showMessage("Today's attendance saved successfully");
}

/* HEADER EFFECT */
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) mainHeader.classList.add("scrolled");
  else mainHeader.classList.remove("scrolled");
});

function downloadMonthlyReport() {
  const date = document.getElementById("attendanceDate").value;
  if (!date) return showMessage("Please select any date of the month");

  const month = date.slice(0, 7); // YYYY-MM
  let content = `
    <html>
      <head>
        <title>Monthly Attendance Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background: #f0f0f0; }
        </style>
      </head>
      <body>
        <h2>Monthly Attendance Report - ${month}</h2>
  `;

  let found = false;

  // Loop through saved attendance
  Object.keys(attendanceData).forEach(d => {
    if (d.startsWith(month)) {
      found = true;
      content += `<h3>Date: ${d}</h3>`;
      content += `<table><tr><th>#</th><th>Student Name</th><th>Status</th></tr>`;
      attendanceData[d].forEach((s, i) => {
        content += `<tr><td>${i + 1}</td><td>${s.name}</td><td>${s.status || "-"}</td></tr>`;
      });
      content += `</table><br>`;
    }
  });

  // If no saved data, use current students array
  if (!found && students.length > 0) {
    found = true;
    content += `<h3>Date: ${date}</h3>`;
    content += `<table><tr><th>#</th><th>Student Name</th><th>Status</th></tr>`;
    students.forEach((s, i) => {
      content += `<tr><td>${i + 1}</td><td>${s.name}</td><td>${s.status || "-"}</td></tr>`;
    });
    content += `</table><br>`;
  }

  if (!found) return showMessage("No attendance found for this month");

  content += `</body></html>`;

  // Create a Blob and download
  const blob = new Blob([content], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `Attendance_Report_${month}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showMessage("Monthly report downloaded successfully");
}

