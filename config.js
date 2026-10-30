/* ===== ตั้งค่าระบบ — แก้ไขไฟล์นี้ไฟล์เดียว ===== */
window.LK_CONFIG = {
  orgName: 'เทศบาลตำบลคลองตำหรุ',
  orgSub: 'อำเภอเมืองชลบุรี จังหวัดชลบุรี',
  title: 'ลอยกระทงออนไลน์ ๒๕๖๙',
  logo: 'logo.svg',                 // เปลี่ยนเป็นไฟล์โลโก้จริง เช่น 'logo.png'
  colors: { primary: '#0b3a6e', accent: '#f2c14e' },  // สีประจำหน่วยงาน
  event: {
    show: true,
    date: 'วันอังคารที่ 24 พฤศจิกายน 2569',
    time: '18:00 น. เป็นต้นไป',
    place: '(ระบุสถานที่จัดงาน)',
    note: 'ร่วมลอยกระทงรักษ์โลก ใช้วัสดุธรรมชาติ งดโฟมและพลาสติก',
    link: ''                        // ลิงก์โพสต์ประชาสัมพันธ์ (ถ้ามี)
  },
  contact: { phone: '(ระบุเบอร์โทรเทศบาล)', email: '' },
  retentionDays: 30,                // เก็บชื่อผู้ใช้กี่วันหลังจบงาน
  supabaseUrl: '',                  // เช่น 'https://xxxx.supabase.co'
  supabaseAnonKey: ''               // anon public key จาก Supabase
};
