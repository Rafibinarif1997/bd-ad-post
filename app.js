const sb = supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);

const $ = s => document.querySelector(s);

const esc = s =>
  String(s ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));

/* =========================
   AUTH
========================= */

async function getSession() {
  const { data } = await sb.auth.getSession();
  return data.session;
}

async function protect() {
  const s = await getSession();

  if (!s) {
    location.href = 'login.html';
    return null;
  }

  return s;
}

async function loadNav() {
  const n = $('#authNav');

  if (!n) return;

  const s = await getSession();

  n.innerHTML = s
    ? `
      <a href="dashboard.html">ড্যাশবোর্ড</a>
      <button class="btn secondary" onclick="logout()">লগআউট</button>
    `
    : `
      <a href="login.html">লগইন</a>
      <a class="btn" href="register.html">রেজিস্টার</a>
    `;
}

async function logout() {
  await sb.auth.signOut();
  location.href = 'index.html';
}


/* =========================
   REGISTER
========================= */

async function register() {

  const name = $('#name').value.trim();
  const email = $('#email').value.trim();
  const password = $('#password').value;

  if (!name || !email || !password) {

    $('#msg').innerHTML = `
      <div class="notice">
        সব তথ্য পূরণ করুন।
      </div>
    `;

    return;
  }

  if (password.length < 6) {

    $('#msg').innerHTML = `
      <div class="notice">
        পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।
      </div>
    `;

    return;
  }

  const { error } = await sb.auth.signUp({

    email: email,

    password: password,

    options: {

      data: {
        full_name: name
      },

      emailRedirectTo:
        'https://rafibinarif1997.github.io/bd-ad-post/login.html'

    }

  });

  if (error) {

    $('#msg').innerHTML = `
      <div class="notice">
        ${esc(error.message)}
      </div>
    `;

    return;
  }

  $('#msg').innerHTML = `
    <div class="notice">
      ✅ রেজিস্ট্রেশন সফল হয়েছে।<br><br>

      আপনার ইমেইলে একটি verification link পাঠানো হয়েছে।
      <br><br>

      ইমেইলের <b>Verify Email</b> বাটনে ক্লিক করুন।
      তারপর Login করুন।
    </div>
  `;

}


/* =========================
   LOGIN
========================= */

async function login() {

  const email = $('#email').value.trim();
  const password = $('#password').value;

  const { error } =
    await sb.auth.signInWithPassword({
      email,
      password
    });

  if (error) {

    $('#msg').innerHTML = `
      <div class="notice">
        ${esc(error.message)}
      </div>
    `;

    return;
  }

  location.href = 'dashboard.html';

}


/* =========================
   HOME
========================= */

function card(a) {

  return `
    <article class="bizCard">

      <div class="pic">

        ${
          a.image_url
            ? `<img src="${esc(a.image_url)}">`
            : '🏪'
        }

      </div>

      <div class="bizBody">

        ${
          a.featured
            ? '<span class="featured">⭐ FEATURED</span>'
            : ''
        }

        <h3>
          ${esc(a.business_name)}
        </h3>

        <p class="muted">
          ${esc(a.category)}
          · 📍 ${esc(a.district)}, ${esc(a.area)}
        </p>

        <p>
          ${esc(a.description).slice(0, 100)}...
        </p>

        <a
          class="btn secondary"
          href="ad-details.html?id=${a.id}"
        >
          বিস্তারিত দেখুন
        </a>

      </div>

    </article>
  `;
}


async function homeLists() {

  const lists = [

    ['featured', { featured: true }],

    ['recent', {}]

  ];

  for (const [id, filter] of lists) {

    let q = sb
      .from('ads')
      .select('*')
      .eq('status', 'approved')
      .limit(6);

    if (filter.featured) {

      q = q
        .eq('featured', true)
        .order('created_at', {
          ascending: false
        });

    } else {

      q = q.order('created_at', {
        ascending: false
      });

    }

    const { data } = await q;

    const box = $('#' + id);

    if (!box) continue;

    box.innerHTML =
      data?.length
        ? data.map(card).join('')
        : '<div class="empty">এখনও কোনো listing নেই।</div>';
  }

}


/* =========================
   SEARCH
========================= */

function goSearch() {

  const q =
    encodeURIComponent(
      $('#q')?.value || ''
    );

  const d =
    encodeURIComponent(
      $('#district')?.value || ''
    );

  location.href =
    `ads.html?q=${q}&district=${d}`;
}


async function loadAds() {

  const params =
    new URLSearchParams(location.search);

  const qv =
    $('#q')?.value ||
    params.get('q') ||
    '';

  const dv =
    $('#district')?.value ||
    params.get('district') ||
    '';

  const cv =
    $('#category')?.value ||
    params.get('category') ||
    '';

  if ($('#q'))
    $('#q').value = qv;

  if ($('#district'))
    $('#district').value = dv;

  if ($('#category'))
    $('#category').value = cv;

  let query =
    sb
      .from('ads')
      .select('*')
      .eq('status', 'approved');

  if (qv) {

    query = query.or(
      `business_name.ilike.%${qv}%,description.ilike.%${qv}%`
    );

  }

  if (dv)
    query = query.eq('district', dv);

  if (cv)
    query = query.eq('category', cv);

  const featured =
    params.get('featured');

  if (
    $('#sort')?.value === 'featured' ||
    featured
  ) {

    query =
      query
        .order('featured', {
          ascending: false
        })
        .order('created_at', {
          ascending: false
        });

  } else {

    query =
      query.order('created_at', {
        ascending: false
      });

  }

  const {
    data,
    error
  } = await query;

  if (error) {

    $('#ads').innerHTML = `
      <div class="empty">
        Search error।
      </div>
    `;

    return;
  }

  $('#ads').innerHTML =
    data?.length
      ? data.map(card).join('')
      : '<div class="empty">কোনো বিজ্ঞাপন পাওয়া যায়নি।</div>';

}


/* =========================
   BUSINESS DETAILS
========================= */

async function loadDetail() {

  const id =
    new URLSearchParams(
      location.search
    ).get('id');

  const {
    data,
    error
  } =
    await sb
      .from('ads')
      .select('*')
      .eq('id', id)
      .eq('status', 'approved')
      .single();

  if (error) {

    $('#detail').innerHTML =
      '<div class="empty">Listing পাওয়া যায়নি।</div>';

    return;
  }

  $('#detail').innerHTML = `

    <div class="profileImage">

      ${
        data.image_url
          ? `<img src="${esc(data.image_url)}">`
          : '🏪'
      }

    </div>

    <div class="profileInfo">

      ${
        data.featured
          ? '<span class="featured">⭐ FEATURED BUSINESS</span>'
          : ''
      }

      <h1>
        ${esc(data.business_name)}
      </h1>

      <span class="badge">
        ${esc(data.category)}
      </span>

      <p>
        📍 ${esc(data.address)},
        ${esc(data.area)},
        ${esc(data.district)}
      </p>

      <p>
        📞
        <a href="tel:${esc(data.phone)}">
          ${esc(data.phone)}
        </a>
      </p>

      <p>
        ${esc(data.description)}
      </p>

      <div class="heroBtns">

        <a
          class="btn"
          href="tel:${esc(data.phone)}"
        >
          📞 কল করুন
        </a>

        ${
          data.facebook
            ? `
              <a
                class="btn secondary"
                target="_blank"
                href="${esc(data.facebook)}"
              >
                Facebook
              </a>
            `
            : ''
        }

        ${
          data.website
            ? `
              <a
                class="btn secondary"
                target="_blank"
                href="${esc(data.website)}"
              >
                Website
              </a>
            `
            : ''
        }

      </div>

    </div>

  `;

}


/* =========================
   SUBMIT AD
========================= */

async function submitAd() {

  const s = await protect();

  if (!s) return;

  const ids = [

    'business_name',
    'category',
    'district',
    'area',
    'address',
    'phone',
    'description'

  ];

  if (
    ids.some(
      i => !$('#' + i).value.trim()
    )
  ) {

    $('#msg').innerHTML =
      '<div class="notice">সব প্রয়োজনীয় ঘর পূরণ করুন।</div>';

    return;
  }

  let image_url = null;

  const f = $('#image')?.files[0];

  if (f) {

    const path =
      s.user.id +
      '/' +
      crypto.randomUUID() +
      '.' +
      f.name.split('.').pop();

    const upload =
      await sb
        .storage
        .from('ad-images')
        .upload(path, f);

    if (upload.error) {

      $('#msg').innerHTML =
        `<div class="notice">
          ${esc(upload.error.message)}
        </div>`;

      return;
    }

    image_url =
      sb
        .storage
        .from('ad-images')
        .getPublicUrl(path)
        .data
        .publicUrl;

  }

  const ad = {

    user_id: s.user.id,

    business_name:
      $('#business_name').value.trim(),

    category:
      $('#category').value,

    district:
      $('#district').value.trim(),

    area:
      $('#area').value.trim(),

    address:
      $('#address').value.trim(),

    phone:
      $('#phone').value.trim(),

    website:
      $('#website').value.trim(),

    facebook:
      $('#facebook').value.trim(),

    description:
      $('#description').value.trim(),

    image_url

  };

  const { error } =
    await sb
      .from('ads')
      .insert(ad);

  $('#msg').innerHTML = `

    <div class="notice">

      ${
        error
          ? esc(error.message)
          : '✅ সফলভাবে জমা হয়েছে। Admin approve করলে Live হবে।'
      }

    </div>

  `;

  if (!error)
    $('#submit').disabled = true;

}


/* =========================
   USER DASHBOARD
========================= */

async function loadDashboard() {

  const s = await protect();

  if (!s) return;

  const profile =
    (
      await sb
        .from('profiles')
        .select('*')
        .eq('id', s.user.id)
        .single()
    ).data;

  $('#profile').innerHTML = `

    <div class="notice">

      👤 ${esc(profile?.full_name || s.user.email)}
      · ${esc(s.user.email)}

    </div>

  `;

  const { data } =
    await sb
      .from('ads')
      .select('*')
      .eq('user_id', s.user.id)
      .order('created_at', {
        ascending: false
      });

  $('#myads').innerHTML =
    data?.length

      ? data.map(a => `

          <article class="bizCard">

            <div class="bizBody">

              <h3>
                ${esc(a.business_name)}
              </h3>

              <span class="badge ${a.status}">
                ${esc(a.status)}
              </span>

              ${
                a.featured
                  ? '<span class="featured">⭐ FEATURED</span>'
                  : ''
              }

              <p>
                ${esc(a.rejection_reason || '')}
              </p>

            </div>

          </article>

        `).join('')

      : '<div class="empty">আপনার কোনো বিজ্ঞাপন নেই।</div>';

}


/* =========================
   ADMIN
========================= */

async function adminCheck() {

  const s = await protect();

  if (!s) return false;

  const profile =
    (
      await sb
        .from('profiles')
        .select('role')
        .eq('id', s.user.id)
        .single()
    ).data;

  if (profile?.role !== 'admin') {

    document.body.innerHTML = `
      <div class="empty">
        <h2>Admin permission প্রয়োজন।</h2>
      </div>
    `;

    return false;
  }

  return true;
}


async function initAdmin() {

  if (!await adminCheck())
    return;

  const [

    { count: pending },

    { count: approved },

    { count: users }

  ] = await Promise.all([

    sb
      .from('ads')
      .select('*', {
        count: 'exact',
        head: true
      })
      .eq('status', 'pending'),

    sb
      .from('ads')
      .select('*', {
        count: 'exact',
        head: true
      })
      .eq('status', 'approved'),

    sb
      .from('profiles')
      .select('*', {
        count: 'exact',
        head: true
      })

  ]);

  $('#stats').innerHTML = `

    <div>
      🟡 Pending
      <b>${pending || 0}</b>
    </div>

    <div>
      🟢 Live
      <b>${approved || 0}</b>
    </div>

    <div>
      👤 Users
      <b>${users || 0}</b>
    </div>

  `;

  loadPending();

}


async function loadPending() {

  const { data } =
    await sb
      .from('ads')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', {
        ascending: true
      });

  adminRows(data, 'pending');

}


async function loadApproved() {

  const { data } =
    await sb
      .from('ads')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', {
        ascending: false
      });

  adminRows(data, 'approved');

}


async function loadRejected() {

  const { data } =
    await sb
      .from('ads')
      .select('*')
      .eq('status', 'rejected')
      .order('created_at', {
        ascending: false
      });

  adminRows(data, 'rejected');

}


async function loadPayments() {

  const { data } =
    await sb
      .from('payments')
      .select('*')
      .order('created_at', {
        ascending: false
      });

  $('#adminRows').innerHTML = `

    <div class="tableWrap">

      <table>

        <tr>
          <th>Ad</th>
          <th>Amount</th>
          <th>Method</th>
          <th>Status</th>
        </tr>

        ${
          (data || []).map(x => `

            <tr>

              <td>
                ${esc(x.ad_id)}
              </td>

              <td>
                ৳${esc(x.amount)}
              </td>

              <td>
                ${esc(x.method)}
              </td>

              <td>
                ${esc(x.status)}
              </td>

            </tr>

          `).join('')
        }

      </table>

    </div>

  `;

}


function adminRows(data, type) {

  $('#adminRows').innerHTML = `

    <div class="tableWrap">

      <table>

        <tr>

          <th>
            Business
          </th>

          <th>
            Location
          </th>

          <th>
            Phone
          </th>

          <th>
            Action
          </th>

        </tr>

        ${
          (data || []).map(a => `

            <tr>

              <td>

                <b>
                  ${esc(a.business_name)}
                </b>

                <br>

                <small>
                  ${esc(a.category)}
                </small>

              </td>

              <td>
                ${esc(a.district)},
                ${esc(a.area)}
              </td>

              <td>
                ${esc(a.phone)}
              </td>

              <td class="actions">

                ${
                  type === 'pending'

                    ? `

                      <button
                        class="btn"
                        onclick="approve('${a.id}')"
                      >
                        Approve
                      </button>

                      <button
                        class="btn danger"
                        onclick="rejectAd('${a.id}')"
                      >
                        Reject
                      </button>

                    `

                    : type === 'approved'

                    ? `

                      <button
                        class="btn gold"
                        onclick="toggleFeatured(
                          '${a.id}',
                          ${!a.featured}
                        )"
                      >
                        ${
                          a.featured
                            ? 'Unfeature'
                            : 'Feature'
                        }
                      </button>

                    `

                    : '—'
                }

              </td>

            </tr>

          `).join('')
        }

      </table>

    </div>

  `;

}


async function approve(id) {

  const { error } =
    await sb
      .from('ads')
      .update({

        status: 'approved',

        updated_at:
          new Date().toISOString()

      })
      .eq('id', id);

  if (error)
    alert(error.message);

  loadPending();

}


async function rejectAd(id) {

  const reason =
    prompt(
      'Reject করার কারণ:',
      'তথ্য অসম্পূর্ণ'
    );

  if (reason === null)
    return;

  await sb
    .from('ads')
    .update({

      status: 'rejected',

      rejection_reason: reason,

      updated_at:
        new Date().toISOString()

    })
    .eq('id', id);

  loadPending();

}


async function toggleFeatured(id, value) {

  const { error } =
    await sb
      .from('ads')
      .update({

        featured: value,

        updated_at:
          new Date().toISOString()

      })
      .eq('id', id);

  if (error)
    alert(error.message);

  loadApproved();

}


/* =========================
   PAGE START
========================= */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    const path =
      location.pathname;

    if (
      path.endsWith('index.html') ||
      path.endsWith('/')
    ) {

      loadNav();
      homeLists();

    }

  }
);
