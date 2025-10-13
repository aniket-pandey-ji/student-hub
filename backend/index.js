// Wait until the entire HTML document is loaded and parsed before running the script.
// This is a best practice to prevent errors from trying to access elements that don't exist yet.
document.addEventListener('DOMContentLoaded', () => {

    // --- Element Selection ---
    // Get all the major components from the HTML file using their IDs and classes.
    const navLinks = document.querySelectorAll('nav a');
    const pages = document.querySelectorAll('.page');
    const hamburger = document.getElementById('hamburger');
    const nav = document.querySelector('nav');

    // Notes elements
    const addNoteBtn = document.getElementById('add-note');
    const noteFormModal = document.getElementById('note-form');
    const saveNoteBtn = document.getElementById('save-note');
    const cancelNoteBtn = document.getElementById('cancel-note');
    const notesList = document.getElementById('notes-list');
    const noteTitleInput = document.getElementById('note-title');
    const noteBodyInput = document.getElementById('note-body');

    // Assignment elements
    const addAssignBtn = document.getElementById('add-assignment');
    const assignFormModal = document.getElementById('assignment-form');
    const saveAssignBtn = document.getElementById('save-assign');
    const cancelAssignBtn = document.getElementById('cancel-assign');
    const assignList = document.getElementById('assign-list');
    const assignTitleInput = document.getElementById('assign-title');
    const assignDueInput = document.getElementById('assign-due');
    const assignDescInput = document.getElementById('assign-desc');

    // Timetable element
    const timetableGrid = document.getElementById('timetable-grid');

    // --- Initial Setup ---
    // Show the first page (Dashboard) by default when the app loads.
    if (pages.length > 0) {
        pages[0].classList.remove('hidden');
    }
    if (navLinks.length > 0) {
        navLinks[0].classList.add('active');
    }

    // --- Navigation Logic ---
    // Function to switch between pages (Dashboard, Notes, etc.)
    function showPage(pageId) {
        // Hide all pages
        pages.forEach(page => {
            page.classList.add('hidden');
        });

        // Show the target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
        }
    }

    // Add click event listeners to all navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent the browser from following the link's href

            // Update active state for nav links
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');

            // The 'href' attribute is '#dashboard', '#notes', etc.
            // .substring(1) removes the '#' to get the page ID.
            const pageId = link.getAttribute('href').substring(1);
            showPage(pageId);

            // Close the mobile menu after a link is clicked
            nav.classList.remove('nav-open');
        });
    });

    // --- Mobile Hamburger Menu ---
    hamburger.addEventListener('click', () => {
        nav.classList.toggle('nav-open');
    });


    // --- Generic Modal Logic ---
    // Function to open a modal
    function openModal(modal) {
        modal.classList.remove('hidden');
    }

    // Function to close a modal
    function closeModal(modal) {
        modal.classList.add('hidden');
    }

    // --- Notes Functionality ---
    addNoteBtn.addEventListener('click', () => openModal(noteFormModal));
    cancelNoteBtn.addEventListener('click', () => closeModal(noteFormModal));

    saveNoteBtn.addEventListener('click', () => {
        const title = noteTitleInput.value.trim();
        const body = noteBodyInput.value.trim();

        // Simple validation
        if (title === '' || body === '') {
            alert('Please fill in both the title and the note body.');
            return; // Stop the function if validation fails
        }

        // Create a new note card element
        const noteCard = document.createElement('div');
        noteCard.className = 'card';
        noteCard.innerHTML = `
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <h4>${title}</h4>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <p>${body}</p>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                `;

        // Add the new card to the list
        notesList.appendChild(noteCard);

        // Clear the input fields and close the modal
        noteTitleInput.value = '';
        noteBodyInput.value = '';
        closeModal(noteFormModal);
    });

    // --- Assignments Functionality ---
    addAssignBtn.addEventListener('click', () => openModal(assignFormModal));
    cancelAssignBtn.addEventListener('click', () => closeModal(assignFormModal));

    saveAssignBtn.addEventListener('click', () => {
        const title = assignTitleInput.value.trim();
        const dueDate = assignDueInput.value;
        const description = assignDescInput.value.trim();

        if (title === '' || dueDate === '') {
            alert('Please provide at least a title and a due date.');
            return;
        }

        // Create a new assignment card
        const assignCard = document.createElement('div');
        assignCard.className = 'card';
        assignCard.innerHTML = `
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <h4>${title}</h4>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <p><strong>Due:</strong> ${new Date(dueDate).toDateString()}</p>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <p>${description}</p>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                `;

        assignList.appendChild(assignCard);

        // Clear inputs and close modal
        assignTitleInput.value = '';
        assignDueInput.value = '';
        assignDescInput.value = '';
        closeModal(assignFormModal);
    });


    // --- Timetable Generation ---
    // This part dynamically creates the timetable grid.
    // This is much better than hard-coding it in HTML.
    function generateTimetable() {
        const days = ['Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const times = ['9-10', '10-11', '11-12', '1-2', '2-3', '3-4'];

        // Sample data for your subjects. This is a great example of using data structures!
        const schedule = {
            '9-10': ['Maths', 'DSA', 'Maths', 'OS', 'DBMS'],
            '10-11': ['C++', 'DBMS', 'C++', 'DSA', 'OS'],
            '11-12': ['OS', 'Maths', 'SE', 'C++', 'DSA'],
            '1-2': ['DBMS', 'OS', 'DSA', 'SE', 'Maths'],
            '2-3': ['SE', 'C++', 'DBMS', 'Maths', 'C++'],
            '3-4': ['Comm.', 'Library', 'Comm.', 'Library', 'SE'],
        };

        // Create headers (Monday, Tuesday, etc.)
        days.forEach(day => {
            const headerCell = document.createElement('div');
            headerCell.className = 'timetable-header';
            headerCell.textContent = day;
            timetableGrid.appendChild(headerCell);
        });

        // Create the grid cells row by row
        times.forEach(time => {
            // First cell is the time slot
            const timeCell = document.createElement('div');
            timeCell.className = 'timetable-time';
            timeCell.textContent = time;
            timetableGrid.appendChild(timeCell);

            // Then create a cell for each day in that time slot
            for (let i = 0; i < 5; i++) {
                const subjectCell = document.createElement('div');
                subjectCell.className = 'timetable-cell';
                subjectCell.textContent = schedule[time][i];
                timetableGrid.appendChild(subjectCell);
            }
        });
    }

    // Call the function to build the timetable when the page loads
    generateTimetable();
});