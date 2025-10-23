import React, { useState, useEffect } from 'https://esm.sh/react@18.2.0';
import { createRoot } from 'https://esm.sh/react-dom@18.2.0/client';

// Firebase imports ko abhi hata dete hain agar config nahi hai, 
// ya sirf initializeApp ko shamil karte hain lekin use nahi karte.
// Magar behtar hai ke hum unn hisson ko chalaen hi nahi jahan config ki zaroorat hai.

// *** Temporary Firebase initialization (for deployment purposes) ***
const firebaseConfig = {}; // Abhi khali hai

// Hum sirf woh hissa chalaenge jo config par depend nahi karta.
// Lekin agar code mein imports hain toh unko rehne dete hain.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { getFirestore, collection, onSnapshot } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

// Initialization ko try-catch mein daal dete hain taake agar config khali ho toh fail na ho.
let app, auth, db;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (e) {
    console.warn("Firebase config missing. Data functionality will not work.", e);
}


function App() {
    // employees ki value 0 hi rahegi jab tak Firebase set nahi hota.
    const [employees, setEmployees] = useState([]); 
    const [userId, setUserId] = useState(null);

    // Ye saara hissa try-catch mein daalna hoga taake agar auth ya db define nahi hue toh error na aaye
    useEffect(() => {
        if (!auth || !db) return; // Agar Firebase initialize nahi hua toh ruk jao

        const setupAuth = async () => {
            try { await signInAnonymously(auth); } catch(e){ console.error(e); }
        };
        const unsub = onAuthStateChanged(auth, (user) => {
            if(user) setUserId(user.uid);
            else setUserId(crypto.randomUUID());
        });
        setupAuth();
        return () => unsub();
    }, []);

    useEffect(() => {
        if(!db || !userId) return;
        const ref = collection(db, `users/${userId}/employees`);
        const unsub = onSnapshot(ref, (snap) => setEmployees(snap.docs.map(d => ({id: d.id, ...d.data()}))));
        return () => unsub();
    }, [db, userId]);

    return (
        <div className="p-6 text-white">
            <h1 className="text-2xl font-bold mb-4">Vision HR & Payroll (Demo)</h1>
            {/* Display warning if Firebase is not working */}
            {!db && <p className="text-red-400">Warning: Firebase is not initialized. Please add your config to see employee data.</p>}
            
            <div>Employees: {employees.length}</div>
        </div>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
