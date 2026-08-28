"use strict";

/*

শাহমাহমুদপুর বাজার
Authentication System — Step 2

IMPORTANT:

নিচের দুইটি value Supabase Dashboard থেকে নিতে হবে।

SUPABASE_URL
SUPABASE_ANON_KEY

এগুলো পাওয়ার পর এখানে বসাতে হবে।
*/

const SUPABASE_URL =
"YOUR_SUPABASE_PROJECT_URL";

const SUPABASE_ANON_KEY =
"YOUR_SUPABASE_ANON_KEY";

/*

Supabase Client

*/

let supabaseClient = null;

/*
Supabase JS CDN dynamically load করা হচ্ছে।
*/

function loadSupabase() {

return new Promise((resolve, reject) => {

if (window.supabase) {

  supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

  resolve(supabaseClient);

  return;
}


const script =
  document.createElement("script");

script.src =
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

script.onload = () => {

  supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

  resolve(supabaseClient);

};

script.onerror = () => {

  reject(
    new Error(
      "Supabase library load করা যায়নি।"
    )
  );

};

document.head.appendChild(script);

});

}

/*

Helpers

*/

function showMessage(
element,
message,
type = "error"
) {

if (!element) return;

element.textContent = message;

element.className =
"auth-message show ${type}";

}

function hideMessage(element) {

if (!element) return;

element.textContent = "";

element.className =
"auth-message";

}

function setLoading(
button,
loading,
normalText
) {

if (!button) return;

button.disabled = loading;

button.textContent =
loading
? "PLEASE WAIT..."
: normalText;

}

/*

LOGIN

*/

const loginForm =
document.getElementById("loginForm");

if (loginForm) {

const emailInput =
document.getElementById("loginEmail");

const passwordInput =
document.getElementById("loginPassword");

const submitButton =
document.getElementById("loginSubmit");

const message =
document.getElementById("loginMessage");

loginForm.addEventListener(
"submit",
async (event) => {

  event.preventDefault();

  hideMessage(message);

  const email =
    emailInput.value.trim();

  const password =
    passwordInput.value;


  if (!email || !password) {

    showMessage(
      message,
      "Email এবং password দিন।"
    );

    return;
  }


  setLoading(
    submitButton,
    true,
    "LOGIN →"
  );


  try {

    const client =
      await loadSupabase();


    const {
      data,
      error
    } =
      await client.auth.signInWithPassword({

        email,
        password

      });


    if (error) {

      throw error;

    }


    if (!data.session) {

      throw new Error(
        "Login session তৈরি হয়নি।"
      );

    }


    showMessage(
      message,
      "Login সফল হয়েছে। Redirect করা হচ্ছে...",
      "success"
    );


    setTimeout(() => {

      window.location.href =
        "index.html";

    }, 700);


  } catch (error) {

    console.error(
      "Login error:",
      error
    );


    let text =
      "Login করা যায়নি। আবার চেষ্টা করুন।";


    if (
      error.message
        ?.toLowerCase()
        .includes("invalid login credentials")
    ) {

      text =
        "Email অথবা password সঠিক নয়।";

    }


    showMessage(
      message,
      text,
      "error"
    );


    setLoading(
      submitButton,
      false,
      "LOGIN →"
    );

  }

}

);

}

/*

REGISTER

*/

const registerForm =
document.getElementById(
"registerForm"
);

if (registerForm) {

const nameInput =
document.getElementById(
"registerName"
);

const emailInput =
document.getElementById(
"registerEmail"
);

const phoneInput =
document.getElementById(
"registerPhone"
);

const passwordInput =
document.getElementById(
"registerPassword"
);

const confirmInput =
document.getElementById(
"registerConfirm"
);

const termsInput =
document.getElementById(
"terms"
);

const submitButton =
document.getElementById(
"registerSubmit"
);

const message =
document.getElementById(
"registerMessage"
);

registerForm.addEventListener(
"submit",
async (event) => {

  event.preventDefault();

  hideMessage(message);


  const name =
    nameInput.value.trim();

  const email =
    emailInput.value.trim();

  const phone =
    phoneInput.value.trim();

  const password =
    passwordInput.value;

  const confirmPassword =
    confirmInput.value;


  if (
    !name ||
    !email ||
    !phone ||
    !password ||
    !confirmPassword
  ) {

    showMessage(
      message,
      "সব তথ্য পূরণ করুন।"
    );

    return;
  }


  if (
    !termsInput.checked
  ) {

    showMessage(
      message,
      "Terms & Conditions গ্রহণ করুন।"
    );

    return;
  }


  if (
    password.length < 6
  ) {

    showMessage(
      message,
      "Password কমপক্ষে ৬ অক্ষরের হতে হবে।"
    );

    return;
  }


  if (
    password !== confirmPassword
  ) {

    showMessage(
      message,
      "দুইটি password একই নয়।"
    );

    return;
  }


  /*
    Bangladesh mobile number basic validation
  */

  const cleanPhone =
    phone.replace(
      /[\s-]/g,
      ""
    );


  const phonePattern =
    /^(?:\+8801|01)[3-9]\d{8}$/;


  if (
    !phonePattern.test(
      cleanPhone
    )
  ) {

    showMessage(
      message,
      "সঠিক বাংলাদেশি mobile number দিন।"
    );

    return;
  }


  setLoading(
    submitButton,
    true,
    "CREATE ACCOUNT →"
  );


  try {

    const client =
      await loadSupabase();


    /*
      Supabase account তৈরি
    */

    const {
      data,
      error
    } =
      await client.auth.signUp({

        email,
        password,

        options: {

          data: {

            full_name: name,

            phone: cleanPhone

          }

        }

      });


    if (error) {

      throw error;

    }


    /*
      Email confirmation ON থাকলে
      session null থাকতে পারে।
    */

    if (
      data.user &&
      !data.session
    ) {

      showMessage(
        message,
        "Account তৈরি হয়েছে। আপনার email-এ confirmation link পাঠানো হয়েছে। Email verify করে Login করুন।",
        "success"
      );


      setTimeout(() => {

        window.location.href =
          "login.html";

      }, 2500);


      return;

    }


    /*
      Email confirmation OFF থাকলে
      সরাসরি login করা যায়।
    */

    if (data.session) {

      showMessage(
        message,
        "Account সফলভাবে তৈরি হয়েছে।",
        "success"
      );


      setTimeout(() => {

        window.location.href =
          "index.html";

      }, 1000);


      return;

    }


    showMessage(
      message,
      "Account তৈরি হয়েছে। এখন Login করুন।",
      "success"
    );


  } catch (error) {

    console.error(
      "Registration error:",
      error
    );


    let text =
      "Registration করা যায়নি। আবার চেষ্টা করুন।";


    if (
      error.message
        ?.toLowerCase()
        .includes("already registered")
    ) {

      text =
        "এই email দিয়ে আগে থেকেই account আছে।";

    }


    showMessage(
      message,
      text
    );


  } finally {

    setLoading(
      submitButton,
      false,
      "CREATE ACCOUNT →"
    );

  }

}

);

}

/*

SHOW / HIDE PASSWORD

*/

const togglePassword =
document.getElementById(
"togglePassword"
);

if (togglePassword) {

const password =
document.getElementById(
"loginPassword"
);

togglePassword.addEventListener(
"click",
() => {

  if (
    password.type ===
    "password"
  ) {

    password.type =
      "text";

    togglePassword.textContent =
      "HIDE";

  } else {

    password.type =
      "password";

    togglePassword.textContent =
      "SHOW";

  }

}

);

}

/*

FORGOT PASSWORD

*/

const forgotPassword =
document.getElementById(
"forgotPassword"
);

if (forgotPassword) {

forgotPassword.addEventListener(
"click",
async (event) => {

  event.preventDefault();


  const emailInput =
    document.getElementById(
      "loginEmail"
    );

  const message =
    document.getElementById(
      "loginMessage"
    );


  const email =
    emailInput.value.trim();


  if (!email) {

    showMessage(
      message,
      "আগে আপনার email লিখুন।"
    );

    emailInput.focus();

    return;

  }


  try {

    const client =
      await loadSupabase();


    const {
      error
    } =
      await client.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            `${window.location.origin}/reset-password.html`
        }
      );


    if (error) {

      throw error;

    }


    showMessage(
      message,
      "Password reset link আপনার email-এ পাঠানো হয়েছে।",
      "success"
    );


  } catch (error) {

    console.error(
      "Password reset error:",
      error
    );


    showMessage(
      message,
      "Password reset করা যায়নি।"
    );

  }

}

);

}

/*

SESSION CHECK

*/

async function getCurrentUser() {

try {

const client =
  await loadSupabase();


const {
  data,
  error
} =
  await client.auth.getUser();


if (error) {

  return null;

}


return data.user || null;

} catch {

return null;

}

}

/*

GLOBAL EXPORT

পরবর্তী Step-এ অন্য page থেকে ব্যবহার করব।

*/

window.ShahmahmudpurAuth = {

getCurrentUser,

logout: async () => {

try {

  const client =
    await loadSupabase();

  await client.auth.signOut();

  window.location.href =
    "index.html";

} catch (error) {

  console.error(
    "Logout error:",
    error
  );

}

}

};
