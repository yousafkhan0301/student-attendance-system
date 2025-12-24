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
  fileInput.click();
  fileInput.onchange = () => {
    const reader = new FileReader();
    reader.onload = e => {
      students = e.target.result
        .split("\n")
        .map(n => n.trim())
        .filter(n => n)
        .map(name => ({ name, status: "" }));

      filteredStudents = students;
      render();
      showMessage("Students loaded successfully");
    };
    reader.readAsText(fileInput.files[0]);
  };
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
