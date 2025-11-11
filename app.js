import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc 
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyB6A97CHEHa82IAdP7bqUpqRjz42Hz3Kqc",
  authDomain: "online-todo-app-fd009.firebaseapp.com",
  projectId: "online-todo-app-fd009",
  storageBucket: "online-todo-app-fd009.firebasestorage.app",
  messagingSenderId: "333462586991",
  appId: "1:333462586991:web:f14ee3a9a21511d2ca2f9a",
  measurementId: "G-WH61L7VW3V"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Elements ---
const signupBtn = document.getElementById("signup");
const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");
const email = document.getElementById("email");
const password = document.getElementById("password");
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTask");
const taskList = document.getElementById("taskList");
const authSection = document.getElementById("auth-section");
const todoSection = document.getElementById("todo-section");

let userId = null;

// --- AUTH ---
signupBtn.addEventListener("click", async () => {
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    alert("Signup successful!");
  } catch (err) {
    alert(err.message);
  }
});

loginBtn.addEventListener("click", async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
  } catch (err) {
    alert(err.message);
  }
});

logoutBtn.addEventListener("click", () => signOut(auth));

// --- STATE CHANGE ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    userId = user.uid;
    authSection.classList.add("hidden");
    todoSection.classList.remove("hidden");
    loadTasks();
  } else {
    userId = null;
    authSection.classList.remove("hidden");
    todoSection.classList.add("hidden");
    taskList.innerHTML = "";
  }
});

// --- FIRESTORE TASKS ---
async function loadTasks() {
  const tasksRef = collection(db, "users", userId, "tasks");

  // Real-time listener
  onSnapshot(tasksRef, (snapshot) => {
    taskList.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const task = docSnap.data();

      // Create task item
      const li = document.createElement("li");
      li.classList.add("task-item");
      if (task.completed) li.classList.add("completed");

      // Task text
      const span = document.createElement("span");
      span.textContent = task.text;
      span.classList.add("task-text");

      // Delete (❌) button
      const delBtn = document.createElement("button");
      delBtn.textContent = "❌";
      delBtn.classList.add("delete-btn");

      // Delete functionality
      delBtn.addEventListener("click", async () => {
        await deleteDoc(doc(db, "users", userId, "tasks", docSnap.id));
      });

      // Append elements
      li.appendChild(span);
      li.appendChild(delBtn);
      taskList.appendChild(li);
    });
  });
}

// --- ADD TASK ---
addTaskBtn.addEventListener("click", async () => {
  const text = taskInput.value.trim();
  if (!text) return;
  await addDoc(collection(db, "users", userId, "tasks"), {
    text,
    completed: false,
    createdAt: new Date()
  });
  taskInput.value = "";
});
