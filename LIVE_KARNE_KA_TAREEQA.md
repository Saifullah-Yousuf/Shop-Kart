# Vercel pe live karna (5 minute)

Database ka data khud ban jayega. Aapko seed chalane ki zaroorat nahi.

1. **Purana kaam hata dein**
   - Vercel mein purana project: Settings > (sab se neeche) Delete Project.
   - GitHub pe purana repo: Settings > (sab se neeche) Delete this repository.

2. **Naya GitHub repo** banayein aur use **Private** rakhein.
   "uploading an existing file" pe click karein. Is zip ke ANDAR ki saari cheezein
   (api, client, server, vercel.json, package.json waghera) drag karke daalein. Phir Commit.
   Repo ki pehli screen pe seedha `api`, `client`, `server` folders dikhne chahiyen.

3. **Vercel** > Add New > Project > repo Import karein.
   - Framework Preset: **Other**
   - Root Directory: khali chhod dein
   - Environment Variables: neeche wali 3 lines copy karke pehle box mein paste karein
     (Vercel khud teen variables bana deta hai):

   ```
   MONGO_URI=mongodb+srv://saifullahyousuf175_db_user:Ig6tc6l6iNOZe9dL@cluster0.wkjk2jj.mongodb.net/shopkart?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=ShopKartLive2026-k7Qp9vXz3mWt8RbN
   JWT_EXPIRES=7d
   ```

   - **Deploy** dabayein.

4. **MongoDB Atlas** > Network Access > Add IP Address > **Allow Access from Anywhere** (0.0.0.0/0) > Confirm.

5. Site kholein. Pehli dafa 10–15 second lag sakte hain, kyunke demo data ban raha hota hai. Phir refresh karein.
   Check ke liye ye kholein: `aapki-site.vercel.app/api/health` → `{"status":"ok"}`

Admin: admin@shopkart.com / admin123 · Customer: user@shopkart.com / user123
