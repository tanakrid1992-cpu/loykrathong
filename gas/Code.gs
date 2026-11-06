/**
 * ลอยกระทงออนไลน์ เทศบาลตำบลคลองตำหรุ 2569 — Backend (Google Apps Script)
 * เก็บข้อมูลผู้ลอยกระทงลง Google Sheet + เก็บรูปลง Google Drive
 * วิธีติดตั้ง: ดู README.md
 */
const SHEET = 'krathong';
const FOLDER = 'ลอยกระทงออนไลน์2569_รูปผู้ลอย';
const HEAD = ['id','created_at','name','wish','img','base','flower','candle','deco','photo','approved','photo_file_id'];
const BAD = ['เหี้ย','สัส','ควย','เย็ด','หี','แตด','ส้นตีน','ไอ้สัตว์','ชิบหาย','อีดอก','fuck','shit','bitch'];
const LIMIT = 50;             // แสดงเฉพาะผู้ลอย 50 ลำดับล่าสุด (ข้อมูลทั้งหมดยังเก็บในชีตถาวร)
const CACHE_SEC = 5;          // แคชผลลัพธ์ลดภาระ quota

function sheet_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) { sh = ss.insertSheet(SHEET); sh.appendRow(HEAD); sh.setFrozenRows(1);
    sh.getRange('K2:K').insertCheckboxes(); }
  return sh;
}
function folder_() {
  const it = DriveApp.getFoldersByName(FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER);
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function pub_(r) { // ส่งเฉพาะข้อมูลที่แสดงบนเว็บ
  return { id:r[0], created_at:r[1] instanceof Date ? r[1].toISOString() : r[1], name:r[2], wish:r[3],
    img:r[4], base:r[5], flower:r[6], candle:r[7], deco:r[8], photo:r[9] };
}

function list_() {
  const cache = CacheService.getScriptCache(), hit = cache.get('list');
  if (hit) return JSON.parse(hit);
  const v = sheet_().getDataRange().getValues(); v.shift();
  const ok = v.filter(r => r[0] && r[10] !== false && String(r[10]).toUpperCase() !== 'FALSE');
  const res = { total: ok.length, rows: ok.slice(-LIMIT).reverse().map(pub_) };
  try { cache.put('list', JSON.stringify(res), CACHE_SEC); } catch (e) {}
  return res;
}

function doGet(e) {
  const res = list_(), since = e && e.parameter && e.parameter.since;
  if (since) res.rows = res.rows.filter(r => r.created_at > since);  // ส่งเฉพาะกระทงใหม่
  return out_(res);
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const name = String(d.name || '').trim().slice(0, 40), wish = String(d.wish || '').trim().slice(0, 200);
    if (!name) return out_({ ok:false, error:'กรุณาใส่ชื่อ' });
    if (BAD.some(w => (name + wish).toLowerCase().indexOf(w) > -1)) return out_({ ok:false, error:'กรุณาใช้ถ้อยคำที่สุภาพ' });
    const pick = (x, re) => (typeof x === 'string' && re.test(x)) ? x : '';
    let photo = '', fid = '';
    if (typeof d.photo === 'string' && d.photo.indexOf('data:image/jpeg;base64,') === 0) {
      const bytes = Utilities.base64Decode(d.photo.split(',')[1]);
      if (bytes.length > 400000) return out_({ ok:false, error:'รูปใหญ่เกินไป' });
      const id0 = Utilities.getUuid();
      const f = folder_().createFile(Utilities.newBlob(bytes, 'image/jpeg', id0 + '.jpg'));
      f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fid = f.getId(); photo = 'https://lh3.googleusercontent.com/d/' + fid + '=w240';
    }
    const row = [Utilities.getUuid(), new Date(), name, wish,
      pick(d.img, /^k\d\d$/), pick(d.base, /^\w{1,12}$/), pick(d.flower, /^\w{1,12}$/),
      pick(d.candle, /^\w{1,12}$/), pick(d.deco, /^\w{1,12}$/), photo, true, fid];
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try { sheet_().appendRow(row); } finally { lock.releaseLock(); }
    CacheService.getScriptCache().remove('list');
    return out_({ ok:true, row: pub_(row) });
  } catch (err) { return out_({ ok:false, error:'ระบบขัดข้อง ลองใหม่อีกครั้ง' }); }
}

/** รันครั้งแรกจาก editor เพื่อสร้างชีต/โฟลเดอร์ และอนุญาตสิทธิ์ */
function setup() { sheet_(); folder_(); }
