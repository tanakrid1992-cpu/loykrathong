# ลอยกระทงออนไลน์ — เทศบาลตำบลคลองตำหรุ

| ไฟล์ | หน้าที่ |
|---|---|
| `index.html` | หน้าลอยกระทงสำหรับประชาชน |
| `admin.html` | หน้าเจ้าหน้าที่: สรุปยอดผู้บริหาร, ตรวจ/ซ่อน/ลบคำอธิษฐาน, ลบชื่อตาม PDPA, CSV |
| `config.js` | **ตั้งค่าทั้งหมด** (ชื่อ, โลโก้, สี, วันเวลาสถานที่งาน, เบอร์ติดต่อ, คีย์ Supabase) |
| `common.js` | แบบกระทง 8 แบบ + รายการคำไม่สุภาพ |
| `logo.svg` | โลโก้ชั่วคราว — แทนด้วยตราเทศบาลจริง |
| `supabase/schema.sql` | สร้างฐานข้อมูล + สิทธิ์ + ระบบกรองคำ |

## 1. ตั้งค่าฐานข้อมูล Supabase (ฟรี)
1. สมัคร https://supabase.com → **New project** (Region: Singapore)
2. เมนู **SQL Editor** → วางไฟล์ `supabase/schema.sql` ทั้งหมด → **Run**
3. **Authentication → Users → Add user** สร้างบัญชีเจ้าหน้าที่ (อีเมล+รหัสผ่าน, ติ๊ก Auto confirm)
4. SQL Editor รัน: `insert into staff(email) values ('อีเมลเจ้าหน้าที่');`
5. **Authentication → Sign In / Providers** → ปิด **Allow new users to sign up** (กันคนนอกสมัคร)
6. **Project Settings → API** คัดลอก *Project URL* และ *anon public key* ใส่ใน `config.js`
   (anon key เปิดเผยได้ ปลอดภัยด้วย RLS — ห้ามใส่ `service_role` key เด็ดขาด)

## 2. เผยแพร่ด้วย GitHub Pages
Repository → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `(root)` → Save
เว็บจะอยู่ที่ `https://<ชื่อผู้ใช้>.github.io/<ชื่อ repo>/` · หน้าเจ้าหน้าที่ต่อท้าย `admin.html`

ใช้โดเมนเทศบาล (ถ้ามี): ใส่ชื่อโดเมนในช่อง *Custom domain* แล้วให้ผู้ดูแล DNS เพิ่ม CNAME ชี้ไป `<ชื่อผู้ใช้>.github.io`

## 3. ก่อนเปิดใช้จริง
- [ ] เปลี่ยนโลโก้ (`logo.png`) และสีใน `config.js` ตามตราเทศบาล
- [ ] ใส่สถานที่จัดงาน เบอร์โทร ใน `config.js`
- [ ] ให้ DPO/นิติกรเทศบาลตรวจข้อความประกาศความเป็นส่วนตัว (อยู่ใน `index.html`)
- [ ] ทดสอบลอย 1 กระทง แล้วดูในหน้า `admin.html`
- [ ] ทำ QR Code ลิงก์เว็บ ติดหน้างาน/โพสต์เพจเทศบาล
- [ ] หลังจบงานครบ `retentionDays` วัน กด “ลบชื่อทั้งหมด (PDPA)” ในหน้าเจ้าหน้าที่

ไม่ใส่คีย์ Supabase = ทำงานแบบ “โหมดทดลอง” (ไม่บันทึกข้อมูล)
Supabase ฟรี: โปรเจกต์ที่ไม่มีการใช้งาน 7 วันจะถูกพัก — เข้าไปกด Restore ก่อนงานได้
