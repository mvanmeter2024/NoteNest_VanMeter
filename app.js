// ===============================
// SUPABASE CONNECTION
// ===============================

const SUPABASE_URL = "https://jrizrbytzoezjgmmvwel.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7falQdbw5CH--Z4zw_eJ-A__TdgSGfS";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ===============================
// GET HTML ELEMENTS
// ===============================

const authScreen = document.getElementById("auth-screen");
const dashboardScreen = document.getElementById("dashboard-screen");

const authForm = document.getElementById("auth-form");
const authTitle = document.getElementById("auth-title");
const switchAuthButton = document.getElementById("switch-auth");

const logoutButton = document.getElementById("logout-button");

const noteForm = document.getElementById("note-form");
const noteTitle = document.getElementById("note-title");
const noteContent = document.getElementById("note-content");

const notesContainer = document.getElementById("notes-container");
const noteCount = document.getElementById("note-count");


// ===============================
// APP STATE
// ===============================

let isRegistering = false;
let currentUser = null;


// ===============================
// LOGIN / REGISTER SWITCH
// ===============================

switchAuthButton.addEventListener("click", function () {

    isRegistering = !isRegistering;

    if (isRegistering) {

        authTitle.textContent = "Create an Account";

        authForm.querySelector(".primary-button").textContent =
            "Register";

        switchAuthButton.textContent = "Login";

        document.querySelector(".switch-text").firstChild.textContent =
            "Already have an account? ";

    } else {

        authTitle.textContent = "Welcome Back!";

        authForm.querySelector(".primary-button").textContent =
            "Login";

        switchAuthButton.textContent = "Register";

        document.querySelector(".switch-text").firstChild.textContent =
            "Don't have an account? ";
    }
});


// ===============================
// LOGIN / REGISTER
// ===============================

authForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    try {

        if (isRegistering) {

            // CREATE ACCOUNT

            const { data, error } =
                await supabaseClient.auth.signUp({
                    email: email,
                    password: password
                });

            if (error) {
                throw error;
            }

            // Supabase may require email confirmation
            if (!data.session) {

                alert(
                    "Account created! Please check your email to confirm your account, then log in."
                );

                return;
            }

            currentUser = data.user;

            showDashboard();

        } else {

            // LOGIN

            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

            if (error) {
                throw error;
            }

            currentUser = data.user;

            showDashboard();
        }

    } catch (error) {

        console.error(error);

        alert(error.message);
    }
});


// ===============================
// SHOW DASHBOARD
// ===============================

async function showDashboard() {

    authScreen.classList.add("hidden");
    dashboardScreen.classList.remove("hidden");

    await loadNotes();
}


// ===============================
// LOGOUT
// ===============================

logoutButton.addEventListener("click", async function () {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        alert(error.message);
        return;
    }

    currentUser = null;

    dashboardScreen.classList.add("hidden");
    authScreen.classList.remove("hidden");

    authForm.reset();
});


// ===============================
// CREATE NOTE
// ===============================

noteForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    if (!title || !content) {
        alert("Please enter both a title and some content.");
        return;
    }

    if (!currentUser) {
        alert("Please log in first.");
        return;
    }

    try {

        const { error } = await supabaseClient
            .from("notes")
            .insert({
                user_id: currentUser.id,
                title: title,
                content: content
            });

        if (error) {
            throw error;
        }

        noteForm.reset();

        await loadNotes();

    } catch (error) {

        console.error(error);

        alert("Could not create note: " + error.message);
    }
});


// ===============================
// LOAD NOTES
// ===============================

async function loadNotes() {

    if (!currentUser) {
        return;
    }

    try {

        const { data, error } = await supabaseClient
            .from("notes")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {
            throw error;
        }

        renderNotes(data);

    } catch (error) {

        console.error(error);

        alert("Could not load your notes: " + error.message);
    }
}


// ===============================
// DISPLAY NOTES
// ===============================

function renderNotes(notes) {

    notesContainer.innerHTML = "";

    if (notes.length === 0) {

        notesContainer.innerHTML = `
            <div class="note-card">
                <div class="note-card-content">
                    <h3>No notes yet 🌸</h3>
                    <p>Create your first note above!</p>
                </div>
            </div>
        `;

        noteCount.textContent = "0 notes";

        return;
    }

    notes.forEach(function (note) {

        const noteCard = document.createElement("div");

        noteCard.className = "note-card";

        const contentDiv = document.createElement("div");

        contentDiv.className = "note-card-content";

        const titleElement = document.createElement("h3");

        titleElement.textContent = note.title;

        const contentElement = document.createElement("p");

        contentElement.textContent = note.content;

        contentDiv.appendChild(titleElement);
        contentDiv.appendChild(contentElement);


        // Buttons

        const actionsDiv = document.createElement("div");

        actionsDiv.className = "note-actions";


        const editButton = document.createElement("button");

        editButton.className = "edit-button";

        editButton.textContent = "Edit";


        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-button";

        deleteButton.textContent = "Delete";


        // Edit

        editButton.addEventListener("click", function () {

            editNote(note);
        });


        // Delete

        deleteButton.addEventListener("click", function () {

            deleteNote(note.id);
        });


        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);

        noteCard.appendChild(contentDiv);
        noteCard.appendChild(actionsDiv);

        notesContainer.appendChild(noteCard);
    });


    if (notes.length === 1) {
        noteCount.textContent = "1 note";
    } else {
        noteCount.textContent = `${notes.length} notes`;
    }
}


// ===============================
// EDIT NOTE
// ===============================

async function editNote(note) {

    const newTitle = prompt(
        "Edit your note title:",
        note.title
    );

    if (newTitle === null) {
        return;
    }

    const newContent = prompt(
        "Edit your note:",
        note.content
    );

    if (newContent === null) {
        return;
    }

    if (!newTitle.trim() || !newContent.trim()) {
        alert("Title and content cannot be empty.");
        return;
    }

    try {

        const { error } = await supabaseClient
            .from("notes")
            .update({
                title: newTitle.trim(),
                content: newContent.trim()
            })
            .eq("id", note.id);

        if (error) {
            throw error;
        }

        await loadNotes();

    } catch (error) {

        console.error(error);

        alert("Could not update note: " + error.message);
    }
}


// ===============================
// DELETE NOTE
// ===============================

async function deleteNote(noteId) {

    const confirmed = confirm(
        "Are you sure you want to delete this note?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const { error } = await supabaseClient
            .from("notes")
            .delete()
            .eq("id", noteId);

        if (error) {
            throw error;
        }

        await loadNotes();

    } catch (error) {

        console.error(error);

        alert("Could not delete note: " + error.message);
    }
}


// ===============================
// CHECK EXISTING LOGIN
// ===============================

async function checkUser() {

    const { data, error } =
        await supabaseClient.auth.getSession();

    if (error) {
        console.error(error);
        return;
    }

    if (data.session) {

        currentUser = data.session.user;

        showDashboard();

    } else {

        authScreen.classList.remove("hidden");
        dashboardScreen.classList.add("hidden");
    }
}


// Start application

checkUser();