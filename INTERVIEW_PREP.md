# ShopKart — Interview ki tayari (Roman Urdu)

Sabse pehli baat: interviewer ko "fraud" tab lagta hai jab candidate apne hi project ka sawal na samjha sake.
Is ka ilaaj ek hi hai: **code ko khud samjho, khud chalao, khud chhota sa change karke dekho.**
Interview se pehle kam az kam 2–3 din is file ke saath code khol kar baitho.

## 1. Agar poocha jaye "ye sab aap ne khud banaya?"

Sach bolo. Aaj kal companies ko pata hai developers AI tools use karte hain, masla sirf tab hota hai jab
banda chhupaye aur phir explain na kar sake. Ek achha jawab:

> "Base project maine banaya tha. Phir maine isay upgrade kiya: admin dashboard, settings, dark mode.
> Is mein maine AI tools se bhi madad li, lekin har file maine parhi hai aur main bata sakta hoon ke kya kaam karta hai aur kyun."

Ye jawab tabhi kaam karega jab aap waqai bata sako. Isliye neeche wala hissa zaroor parho.

## 2. Project 60 seconds mein (ye yaad kar lo)

"ShopKart ek MERN e-commerce store hai. Frontend React + Vite hai, backend Node/Express, database MongoDB with
Mongoose. Customer products search aur filter kar sakta hai, cart mein daal kar Cash on Delivery order kar sakta hai,
aur order track kar sakta hai. Admin ka alag dashboard hai jahan se products, categories, orders, customers aur poore
store ki settings control hoti hain — store ka naam, colours, homepage text, delivery fee, sab kuch. Authentication
JWT se hai, aur order ki price hamesha server calculate karta hai, client se aayi price pe trust nahi karta."

## 3. Request ka safar (sabse common sawal)

Example: customer "Place order" dabata hai.

1. `client/src/pages/Checkout.jsx` → `api.post('/orders', { items, shippingAddress })`
   Sirf product ID aur quantity bhejte hain, **price nahi bhejte**.
2. `client/src/api.js` → axios interceptor localStorage se token utha kar header lagata hai:
   `Authorization: Bearer <token>`
3. `server/server.js` → `/api/orders` ko `routes/orders.js` pe bhejta hai.
4. `middleware/auth.js` → `protect` token verify karta hai (`jwt.verify`), user DB se nikaal kar `req.user` mein rakhta hai.
5. `routes/orders.js` (POST) →
   - har item ki price **database se** leta hai
   - stock reserve karta hai: `updateOne({ _id, countInStock: { $gte: qty } }, { $inc: { countInStock: -qty } })`
     Ye condition + update ek hi atomic operation hai, isliye do log ek saath aakhri piece nahi khareed sakte.
     Agar koi item fail ho to pehle wale items ka stock wapas kar deta hai (rollback).
   - Settings se delivery fee calculate karta hai (free delivery limit ke saath)
   - `Order.create(...)` aur 201 response
6. Frontend cart clear karta hai aur `/orders/:id` pe le jata hai.

## 4. Har folder kya karta hai

| Jagah | Kaam |
|---|---|
| `server/models/` | Mongoose schemas. `User` mein password `select: false` hai aur `pre('save')` hook bcrypt se hash karta hai |
| `server/middleware/auth.js` | `protect` (login zaroori) aur `admin` (isAdmin check) |
| `server/middleware/error.js` | Saare errors ek jagah handle: CastError → 404, duplicate key 11000 → 400, ValidationError → 400 |
| `server/utils/asyncHandler.js` | Async route ka error `next()` tak pohanchata hai, taake har route mein try/catch na likhna pade |
| `server/routes/stats.js` | Dashboard ke numbers. MongoDB aggregation (`$group`, `$dateToString`) se din-wise sales |
| `server/routes/upload.js` | Multer se image upload (memory mein), sirf image types, 2 MB limit, phir MongoDB mein save. `routes/images.js` wahan se image serve karta hai |
| `server/app.js` + `api/index.js` | Express app alag file mein export hai. Laptop pe `server.js` usay `listen` karta hai, Vercel pe `api/index.js` usay serverless function bana deta hai |
| `server/models/Settings.js` | Ek hi document jisme store ki saari settings hain (singleton pattern) |
| `client/src/context/` | Global state React Context se: Auth, Cart, Settings, Theme, UI (toast/confirm) |
| `client/src/layouts/` | `StoreLayout` (header/footer) aur `AdminLayout` (sidebar). Nested routes + `<Outlet />` |
| `client/src/components/ProtectedRoute.jsx` | Login na ho to `/login` pe bhejta hai, admin route pe non-admin ko home pe |

## 5. Dashboard se theme kaise change hota hai

- Admin Settings mein colour chunta hai → `PUT /api/settings` → MongoDB mein save.
- Har visitor ke liye `SettingsContext` app load hote hi `GET /api/settings` karta hai aur
  `document.documentElement.style.setProperty('--brand', colour)` se CSS variable badal deta hai.
- `styles.css` mein har button/link `var(--brand)` use karta hai, isliye poori site ek line se re-theme ho jati hai.
- `inkFor()` (utils/format.js) colour ki brightness dekh kar button text black ya white chunta hai, taake parhne mein aaye.
- Dark mode: `<html data-theme="dark">` lagne se `[data-theme='dark']` wale variables apply hote hain.
  Visitor ki apni choice localStorage mein; warna admin ka default.

## 6. Mumkin sawal aur jawab

**JWT kya hai, kahan store karte ho?**
Login pe server `jwt.sign({ id })` se token deta hai (7 din expiry). Client localStorage mein rakhta hai aur har request
ke header mein bhejta hai. Server har request pe verify karta hai — server pe session store nahi hota (stateless).
*Agar poochein kamzori kya hai:* localStorage XSS se chori ho sakta hai; production mein httpOnly cookie behtar option hai.
Ye seedha maan lena achha impression deta hai.

**Password kaise save hota hai?**
bcrypt hash (10 salt rounds), `pre('save')` hook mein. Login pe `bcrypt.compare`. Schema mein `select: false`, isliye
normal queries mein password aata hi nahi.

**Koi user khud ko admin bana sakta hai?**
Nahi. Register route body se sirf `name, email, password` uthata hai. Product route bhi `pick()` se sirf allowed fields leta hai.

**Client price change kar de to?**
Kuch nahi hoga, server DB se price leta hai. Cart ka total sirf dikhane ke liye hai.

**Do log ek saath aakhri item kharidein?**
Section 3 dekho: conditional atomic `updateOne`. Ek hi kamyab hoga, doosre ko "Not enough stock" milega.

**Order cancel pe kya hota hai?**
Stock wapas (`$inc`), aur cancelled order dobara open nahi ho sakta (warna stock do baar ghatega).

**Pagination kaise hai?**
`skip((page-1)*limit).limit(limit)` + `countDocuments` se total pages. Shop page ke filters URL mein hain
(`useSearchParams`), isliye link share ho sakta hai aur back button kaam karta hai.

**Search kaise kaam karti hai?**
Name pe case-insensitive regex. User input ko pehle escape karte hain taake special characters regex na torein.
Typing pe 350ms debounce taake har keystroke pe API call na ho.

**Context API kyun, Redux kyun nahi?**
App ki global state chhoti hai (user, cart, settings, theme). Context kaafi tha, extra library nahi chahiye thi.
Bara app hota to Redux Toolkit ya React Query consider karta.

**Vercel pe deploy kaise kiya?**
Ek hi Vercel project: React ka build static files ki tarah, aur Express `api/index.js` se serverless function.
`vercel.json` mein rewrites hain: `/api/*` function ko jata hai, baaki sab `index.html` ko (taake React Router refresh pe 404 na de).
Serverless mein har request pe naya DB connection na khule, is liye `config/db.js` connection cache karta hai.
Images disk pe nahi, MongoDB mein save hoti hain kyunke Vercel ka file system temporary hai.
Agar database bilkul khali ho to pehli request pe `seedData.js` demo data khud daal deta hai (`seedDatabase.ifEmpty`).

**Agar aur time milta to kya add karte?**
Online payment (JazzCash/Stripe), product ke multiple images aur variants (size/colour), reviews, email notifications,
tests (Jest + Supertest), images Cloudinary pe (MongoDB mein images rakhna chhote project ke liye theek hai, bare mein CDN behtar), rate limiting on login.
Ye list batana dikhata hai ke aap project ki limits samajhte ho.

## 7. Demo ka tareeqa (5 minute)

1. Home page dikhao → dark mode toggle.
2. Shop: "headphones" search, category filter, price sort.
3. Customer login (demo button) → cart → checkout → order tracking page.
4. Admin login → Overview chart → Orders mein wo naya order "Shipped" karo.
5. Settings mein "Plum" preset choose karo → poori site ka colour live badalta hai → Save → store mein dikhao.
6. Products mein ek product edit karo, featured star lagao → homepage pe nazar aata hai.

## 8. Interview se pehle khud ye karo (sabse zaroori)

In mein se har kaam khud karo. Agar kar liya to aap is project ko waqai jaante ho:

- [ ] Project apne laptop pe chalao, aur ek order place karke MongoDB Atlas mein `orders` collection mein dekho.
- [ ] Order model mein ek naya field add karo (jaise `paymentStatus`) aur admin order modal mein dikhao.
- [ ] Settings mein ek naya option add karo (jaise "Store closed" message) — model + admin form + store pe dikhana.
- [ ] Ek bug khud daalo (jaise `protect` middleware hata do) aur dekho kya hota hai, phir theek karo.
- [ ] `routes/orders.js` POST ko line by line kisi dost ko ya khud ko awaaz mein samjhao.
- [ ] Postman se `/api/auth/login` hit karo, token lo, aur `/api/orders/my` call karo.

Ye checklist complete ho gayi to interview mein confidence khud aa jayega. Best of luck!
