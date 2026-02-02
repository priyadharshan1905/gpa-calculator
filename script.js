// script.js - IT Department GPA Calculator

// Subject database for B.Tech IT 2021 Regulation
const subjectDatabase = {
    "1": {
        "HS3152": 3,
        "MA3151": 4,
        "PH3151": 3,
        "CY3151": 3,
        "GE3151": 3,
        "GE3152": 1,
        "GE3171": 2,
        "BS3171": 2,
        "GE3172": 1
    },
    "2": {
        "HS3252": 2,
        "MA3251": 4,
        "PH3256": 3,
        "BE3251": 3,
        "GE3251": 4,
        "CS3251": 3,
        "GE3252": 1,
        "GE3271": 2,
        "CS3271": 2,
        "GE3272": 2
    },
    "3": {
        "MA3354": 4,
        "CS3351": 4,
        "CS3352": 3,
        "CD3291": 3,
        "CS3391": 3,
        "CD3281": 2,
        "CS3381": 1.5,
        "CS3361": 2,
        "GE3361": 1
    },
    "4": {
        "CS3452": 3,
        "CS3491": 4,
        "CS3492": 3,
        "IT3401": 4,
        "CS3451": 3,
        "GE3451": 2,
        "CS3461": 1.5,
        "CS3481": 1.5
    },
    "5": {
        "CS3591": 4,
        "IT3501": 3,
        "CS3551": 3,
        "CS3691": 4,
        "IT3511": 2
    },
    "6": {
        "CCS356": 4,
        "IT3681": 1.5
    },
    "7": {
        "GE3791": 2,
        "IT3711": 2
    },
    "8": {
        "IT3811": 10
    }
};

// All elective courses (3 credits each)
const electiveCourses = [
    "GE3751", "GE3752", "GE3753", "GE3754", "GE3755", "GE3792", "CCS346", "CCS360", 
    "CCS355", "CCS369", "CCW331", "CCS349", "CCS338", "CCS334", "CCS335", "CCS332", 
    "CCS336", "CCS370", "CCS366", "CCS374", "CCS342", "CCS358", "CCS372", "CCS341", 
    "CCS367", "CCS365", "CCS368", "CCS362", "CCS344", "CCS343", "CCS363", "CCS351", 
    "CB3591", "CCS339", "CCS354", "CCS333", "CCS352", "CCS371", "CCW332", "CCS373", 
    "CCS347", "CCS353", "CCS361", "CCS340", "CCS359", "CCS331", "CCS350", "CCS364", 
    "CCS357", "CCS337", "CCS345", "OAS351", "OIE351", "OBT351", "OCE351", "OEE351", 
    "OEI351", "OMA351", "OIE352", "OMG351", "OFD351", "AI3021", "OEI352", "OPY351", 
    "OAE351", "OHS351", "OMG352", "OMG353", "CME365", "OME354", "MF3003", "OPR351", 
    "AU3791", "OAS352", "OIM351", "OIE354", "OSF351", "OML351", "OMR351", "ORA351", 
    "OAE352", "OGI351", "OAI351", "OEN351", "OEE352", "OEI353", "OCH351", "OCH352", 
    "OFD352", "OFD353", "OPY352", "OTT351", "OTT352", "OTT353", "OPE351", "CPE334", 
    "OPT351", "OEC351", "OEC352", "CBM348", "CBM333", "OMA352", "OMA353", "OMA354", 
    "OCE353", "OBT352", "OBT353", "OBT354", "OHS352", "OMA355", "OMA356", "OMA357", 
    "OMG354", "OMG355", "OME352", "CME343", "OME355", "MF3010", "OMF354", "AU3002", 
    "AU3008", "OAS353", "OIM352", "OIM353", "OIE353", "OSF352", "OSF353", "OML352", 
    "OML353", "OMR352", "OMR353", "ORA352", "MV3501", "OMV351", "OMV352", "CRA332", 
    "OGI352", "OAI352", "OEN352", "OEE353", "OEI354", "OCH353", "OCH354", "OFD354", 
    "OFD355", "OPY353", "OTT354", "FT3201", "OTT355", "OPE353", "OPE354", "OPT352", 
    "OPT353", "OEC353", "CBM370", "CBM356", "OCE354", "OBT355", "OBT356", "OBT357",
    "CMG331", "CMG332", "CMG333", "CMG334", "CMG335", "CMG336", "CMG337", "CMG338", 
    "CMG339", "CMG340", "CMG341", "CMG342", "CMG343", "CMG344", "CMG345", "CMG346", 
    "CMG347", "CMG348", "CMG349", "CMG350", "CMG351", "CMG352", "CMG353", "CMG354", 
    "CES331", "CES332", "CES333", "CES334", "CES335", "CES336", "CES337", "CES338"
];

// Grade points mapping
const gradePoints = {
    "10": 10, // O
    "9": 9,   // A+
    "8": 8,   // A
    "7": 7,   // B+
    "6": 6,   // B
    "5": 5,   // C
    "0": 0    // F (Fail)
};

// Current active autocomplete list
let currentFocus;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const regulationSelect = document.getElementById('regulation');
    const courseSelect = document.getElementById('course');
    const semesterSelect = document.getElementById('semester');
    const inputSection = document.getElementById('input-section');
    const calculateContainer = document.getElementById('calculate-container');
    const subjectTableBody = document.getElementById('subject-table-body');
    const addSubjectBtn = document.getElementById('add-subject');
    const calculateBtn = document.getElementById('calculate-gpa');
    const saveBtn = document.getElementById('save-data');
    const resultContainer = document.getElementById('result-container');
    const gpaValue = document.getElementById('gpa-value');
    
    let subjectCount = 0;
    
    // Set default values
    regulationSelect.value = "2021";
    courseSelect.value = "btech";
    
    // Load saved data if available
    loadSavedData();
    
    // Check if all dropdowns are selected
    function checkSelections() {
        if (regulationSelect.value && courseSelect.value && semesterSelect.value) {
            inputSection.style.display = 'block';
            calculateContainer.style.display = 'block';
            
            // Auto-fill subjects for semesters 1-8
            autoFillSubjects(semesterSelect.value);
        }
    }
    
    // Auto-fill subjects for the selected semester
    function autoFillSubjects(semester) {
        clearSubjectTable();
        
        // Add subjects from database
        if (subjectDatabase[semester]) {
            for (const [code, credits] of Object.entries(subjectDatabase[semester])) {
                addSubjectRow(code);
            }
        }
        
        // For semesters 5-8, add some empty rows for elective courses
        if (parseInt(semester) >= 5) {
            for (let i = 0; i < 3; i++) {
                addSubjectRow();
            }
        }
        
        // Add a note about pre-filled subjects
        if (subjectDatabase[semester]) {
            const noteRow = document.createElement('tr');
            noteRow.innerHTML = `
                <td colspan="4">
                    <span class="prefilled-hint">
                        <i class="fas fa-info-circle"></i> 
                        Core subjects pre-filled for Semester ${semester}. You can add elective courses.
                    </span>
                </td>
            `;
            subjectTableBody.appendChild(noteRow);
        }
    }
    
    // Clear the subject table
    function clearSubjectTable() {
        subjectTableBody.innerHTML = '';
        subjectCount = 0;
    }
    
    // Add event listeners to dropdowns
    semesterSelect.addEventListener('change', checkSelections);
    
    // Add subject row function
    function addSubjectRow(prefilledCode = '') {
        subjectCount++;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${subjectCount}</td>
            <td>
                <div class="autocomplete">
                    <input type="text" class="subject-input" placeholder="Enter subject code" value="${prefilledCode}">
                </div>
            </td>
            <td>
                <select class="grade-select">
                    <option value="">Select Grade</option>
                    <option value="10">O (10 points)</option>
                    <option value="9">A+ (9 points)</option>
                    <option value="8">A (8 points)</option>
                    <option value="7">B+ (7 points)</option>
                    <option value="6">B (6 points)</option>
                    <option value="5">C (5 points)</option>
                    <option value="0">F (0 points)</option>
                </select>
            </td>
            <td class="delete-row" onclick="deleteRow(this)">
                <i class="fas fa-trash-alt"></i>
            </td>
        `;
        subjectTableBody.appendChild(row);
        
        // Initialize autocomplete for the new input
        initAutocomplete(row.querySelector('.subject-input'));
    }
    
    // Initialize autocomplete for an input field
    function initAutocomplete(input) {
        input.addEventListener('input', function() {
            const val = this.value.toUpperCase();
            closeAllLists();
            
            if (!val) return false;
            
            currentFocus = -1;
            
            // Create autocomplete list
            const list = document.createElement('DIV');
            list.setAttribute('id', this.id + 'autocomplete-list');
            list.setAttribute('class', 'autocomplete-items');
            this.parentNode.appendChild(list);
            
            // Get all subject codes (core + elective)
            const allSubjects = [
                ...Object.keys(subjectDatabase[1] || {}),
                ...Object.keys(subjectDatabase[2] || {}),
                ...Object.keys(subjectDatabase[3] || {}),
                ...Object.keys(subjectDatabase[4] || {}),
                ...Object.keys(subjectDatabase[5] || {}),
                ...Object.keys(subjectDatabase[6] || {}),
                ...Object.keys(subjectDatabase[7] || {}),
                ...Object.keys(subjectDatabase[8] || {}),
                ...electiveCourses
            ];
            
            // Remove duplicates and sort
            const uniqueSubjects = [...new Set(allSubjects)].sort();
            
            // Filter and add matching items
            for (let i = 0; i < uniqueSubjects.length; i++) {
                if (uniqueSubjects[i].substr(0, val.length).toUpperCase() === val) {
                    const item = document.createElement('DIV');
                    item.innerHTML = '<strong>' + uniqueSubjects[i].substr(0, val.length) + '</strong>';
                    item.innerHTML += uniqueSubjects[i].substr(val.length);
                    item.innerHTML += '<input type="hidden" value="' + uniqueSubjects[i] + '">';
                    
                    item.addEventListener('click', function() {
                        input.value = this.getElementsByTagName('input')[0].value;
                        closeAllLists();
                    });
                    
                    list.appendChild(item);
                }
            }
        });
        
        input.addEventListener('keydown', function(e) {
            let x = document.getElementById(this.id + 'autocomplete-list');
            if (x) x = x.getElementsByTagName('div');
            
            if (e.keyCode === 40) { // Down arrow
                currentFocus++;
                addActive(x);
            } else if (e.keyCode === 38) { // Up arrow
                currentFocus--;
                addActive(x);
            } else if (e.keyCode === 13) { // Enter
                e.preventDefault();
                if (currentFocus > -1) {
                    if (x) x[currentFocus].click();
                }
            }
        });
        
        function addActive(x) {
            if (!x) return false;
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            x[currentFocus].classList.add('autocomplete-active');
        }
        
        function removeActive(x) {
            for (let i = 0; i < x.length; i++) {
                x[i].classList.remove('autocomplete-active');
            }
        }
        
        function closeAllLists(elmnt) {
            const x = document.getElementsByClassName('autocomplete-items');
            for (let i = 0; i < x.length; i++) {
                if (elmnt !== x[i] && elmnt !== input) {
                    x[i].parentNode.removeChild(x[i]);
                }
            }
        }
        
        document.addEventListener('click', function(e) {
            closeAllLists(e.target);
        });
    }
    
    // Close all autocomplete lists
    function closeAllLists(elmnt) {
        const x = document.getElementsByClassName('autocomplete-items');
        for (let i = 0; i < x.length; i++) {
            if (elmnt !== x[i]) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    
    // Delete row function (made global for inline onclick)
    window.deleteRow = function(element) {
        if (subjectCount > 1) {
            const row = element.parentNode.parentNode;
            row.parentNode.removeChild(row);
            subjectCount--;
            
            // Update serial numbers
            const rows = subjectTableBody.querySelectorAll('tr');
            rows.forEach((row, index) => {
                if (row.cells[0]) row.cells[0].textContent = index + 1;
            });
        } else {
            alert("You need at least one subject to calculate GPA!");
        }
    };
    
    // Add subject event listener
    addSubjectBtn.addEventListener('click', function() {
        addSubjectRow();
    });
    
    // Save data to local storage
    saveBtn.addEventListener('click', function() {
        const userData = collectUserData();
        if (userData) {
            localStorage.setItem('gpaCalculatorData', JSON.stringify(userData));
            alert('Data saved successfully!');
        }
    });
    
    // Load saved data from local storage
    function loadSavedData() {
        const savedData = localStorage.getItem('gpaCalculatorData');
        if (savedData) {
            const userData = JSON.parse(savedData);
            
            // Populate dropdowns
            document.getElementById('regulation').value = userData.regulation || '2021';
            document.getElementById('course').value = userData.course || 'btech';
            document.getElementById('semester').value = userData.semester || '';
            
            // Check if we should show the input section
            if (userData.semester) {
                checkSelections();
                
                // After a short delay, populate the subjects
                setTimeout(() => {
                    if (userData.subjects && userData.subjects.length > 0) {
                        clearSubjectTable();
                        userData.subjects.forEach(subject => {
                            addSubjectRow(subject.code);
                            
                            // Set the grade for the last added row
                            const rows = subjectTableBody.querySelectorAll('tr');
                            const lastRow = rows[rows.length - 1];
                            if (lastRow && subject.grade) {
                                lastRow.querySelector('.grade-select').value = subject.grade;
                            }
                        });
                    }
                }, 100);
            }
        }
    }
    
    // Collect user data for saving or calculation
    function collectUserData() {
        const userData = {
            regulation: document.getElementById('regulation').value,
            course: document.getElementById('course').value,
            semester: document.getElementById('semester').value,
            subjects: []
        };
        
        // Get all subject rows
        const rows = subjectTableBody.querySelectorAll('tr');
        
        // Extract data from each row
        rows.forEach(row => {
            const subjectInput = row.querySelector('.subject-input');
            const gradeSelect = row.querySelector('.grade-select');
            
            if (subjectInput && gradeSelect) {
                const subjectCode = subjectInput.value;
                const grade = gradeSelect.value;
                
                if (subjectCode || grade) {
                    userData.subjects.push({
                        code: subjectCode,
                        grade: grade
                    });
                }
            }
        });
        
        return userData;
    }
    
    // Calculate GPA event listener
    calculateBtn.addEventListener('click', function() {
        // Collect all data to send to calculateGPA function
        const userData = collectUserData();
        
        // Validate user data
        const validation = validateUserData(userData);
        if (!validation.isValid) {
            alert(validation.message);
            return;
        }
        
        // Calculate GPA
        const result = calculateGPA(userData);
        
        // Display result or error
        if (result.success) {
            resultContainer.style.display = 'block';
            gpaValue.textContent = result.gpa.toFixed(2);
            
            // Save successful calculation to history
            saveToHistory(userData, result.gpa);
        } else {
            alert(result.message);
            resultContainer.style.display = 'none';
        }
    });
    
    // Save calculation to history
    function saveToHistory(userData, gpa) {
        let history = JSON.parse(localStorage.getItem('gpaHistory') || '[]');
        
        // Add new entry
        history.unshift({
            date: new Date().toISOString(),
            regulation: userData.regulation,
            course: userData.course,
            semester: userData.semester,
            gpa: gpa,
            subjects: userData.subjects
        });
        
        // Keep only last 10 entries
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        
        localStorage.setItem('gpaHistory', JSON.stringify(history));
    }
});

// Calculate GPA function
function calculateGPA(userData) {
    const { regulation, course, semester, subjects } = userData;
    let totalCreditPoints = 0;
    let totalCredits = 0;
    let hasArrear = false;
    let invalidSubjects = [];
    
    // Check for arrears (F grades) first
    for (const subject of subjects) {
        if (subject.grade === "0") {
            hasArrear = true;
            break;
        }
    }
    
    if (hasArrear) {
        return {
            success: false,
            message: "Arrear Found! You have failed in one or more subjects.",
            gpa: 0
        };
    }
    
    // Calculate GPA for each subject
    for (const subject of subjects) {
        const subjectCode = subject.code.toUpperCase().trim();
        
        // Skip empty subject codes
        if (!subjectCode) continue;
        
        // Skip NM subjects (include in UI but not in calculation)
        if (subjectCode.startsWith("NM")) {
            continue;
        }
        
        // Get credit value for the subject
        let credits = 0;
        
        // Check if subject exists in database for the selected semester
        if (subjectDatabase[semester] && subjectDatabase[semester][subjectCode]) {
            credits = subjectDatabase[semester][subjectCode];
        } 
        // Check if subject is an elective course (3 credits)
        else if (electiveCourses.includes(subjectCode)) {
            credits = 3;
        }
        // Invalid subject code
        else {
            invalidSubjects.push(subjectCode);
            continue;
        }
        
        const gradePoint = gradePoints[subject.grade];
        
        // Add to totals
        totalCreditPoints += credits * gradePoint;
        totalCredits += credits;
    }
    
    // Check for invalid subjects
    if (invalidSubjects.length > 0) {
        return {
            success: false,
            message: `Invalid subject code(s): ${invalidSubjects.join(", ")}`,
            gpa: 0
        };
    }
    
    // Check if we have any valid subjects
    if (totalCredits === 0) {
        return {
            success: false,
            message: "No valid subjects found for calculation.",
            gpa: 0
        };
    }
    
    // Calculate GPA
    const gpa = totalCreditPoints / totalCredits;
    
    return {
        success: true,
        message: "GPA calculated successfully.",
        gpa: Math.round(gpa * 100) / 100, // Round to 2 decimal places
        totalCredits: totalCredits,
        totalCreditPoints: totalCreditPoints
    };
}

// Function to validate user data before calculation
function validateUserData(userData) {
    const { regulation, course, semester, subjects } = userData;
    
    // Check if all required fields are present
    if (!regulation || !course || !semester) {
        return {
            isValid: false,
            message: "Please select regulation, course, and semester."
        };
    }
    
    // Check if we have at least one subject
    if (!subjects || subjects.length === 0) {
        return {
            isValid: false,
            message: "Please enter at least one subject."
        };
    }
    
    // Check if all subjects have codes and grades
    for (const subject of subjects) {
        if (subject.code && !subject.grade) {
            return {
                isValid: false,
                message: "Please select grades for all subjects."
            };
        }
    }
    
    return {
        isValid: true,
        message: "Validation successful."
    };
}