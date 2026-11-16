// In-browser demo backend. Mirrors the Express API (same routes and response shapes) and stores data in
// localStorage, so the app works on GitHub Pages with no server. Data lives only in this browser.
const KEY = "hcs_demo_db_v1";
const day = (n) => new Date(Date.now() - n * 864e5).toISOString();

const seed = () => ({
  seq: 100,
  users: [
    { _id: "u1", name: "Arjun Sharma", email: "student@hostel.com", password: "student123", role: "student", room_no: "A-204", contact: "9876543210" },
    { _id: "u2", name: "Dr. Ramesh Warden", email: "admin@hostel.com", password: "admin123", role: "admin", contact: "9123456780" },
    { _id: "u3", name: "Suresh Kumar", email: "staff@hostel.com", password: "staff123", role: "maintenance", department: "Electrical", contact: "9001122334" },
    { _id: "u4", name: "Mahesh Plumber", email: "mahesh@hostel.com", password: "staff123", role: "maintenance", department: "Plumbing", contact: "9234567890" },
    { _id: "u5", name: "Ravi Carpenter", email: "ravi@hostel.com", password: "staff123", role: "maintenance", department: "Carpentry", contact: "9345678901" },
  ],
  complaints: [
    { _id: "c1", category: "Electrical", description: "Ceiling fan in room makes a loud noise and wobbles.", priority: "High", status: "In Progress", student_id: "u1", student_name: "Arjun Sharma", room_no: "A-204", staff_id: "u3", staff_name: "Suresh Kumar", resolution_notes: null, createdAt: day(5) },
    { _id: "c2", category: "Plumbing", description: "Bathroom tap is leaking continuously.", priority: "Medium", status: "Assigned", student_id: "u1", student_name: "Arjun Sharma", room_no: "A-204", staff_id: "u4", staff_name: "Mahesh Plumber", resolution_notes: null, createdAt: day(3) },
    { _id: "c3", category: "Carpentry", description: "Study table drawer is broken and will not close.", priority: "Low", status: "Resolved", student_id: "u1", student_name: "Arjun Sharma", room_no: "A-204", staff_id: "u5", staff_name: "Ravi Carpenter", resolution_notes: "Replaced drawer rail and lock.", createdAt: day(12) },
    { _id: "c4", category: "Internet", description: "Wi-Fi keeps disconnecting on the second floor.", priority: "Critical", status: "Raised", student_id: "u1", student_name: "Arjun Sharma", room_no: "B-110", staff_id: null, staff_name: null, resolution_notes: null, createdAt: day(1) },
    { _id: "c5", category: "Cleaning", description: "Corridor near the common room has not been cleaned for days.", priority: "Medium", status: "Raised", student_id: "u9", student_name: "Priya Nair", room_no: "C-305", staff_id: null, staff_name: null, resolution_notes: null, createdAt: day(2) },
  ],
});

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const db = seed();
  save(db);
  return db;
};
function save(db) {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* ignore */ }
}
export const resetDemoData = () => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } };

const pub = (u) => { const { password, ...rest } = u; void password; return { ...rest, id: u._id }; };
const ok = (data, status = 200) => ({ status, data });
const err = (status, message) => ({ status, data: { message } });

export function handle(method, path, body = {}, token = "") {
  const db = load();
  const me = db.users.find((u) => `demo-${u._id}` === token);
  const need = (...roles) => (!me ? err(401, "Authentication required") : roles.length && !roles.includes(me.role) ? err(403, "Access denied") : null);
  const [, a, b, c] = path.split("?")[0].split("/");

  if (a === "auth" && b === "login" && method === "POST") {
    const u = db.users.find((x) => x.email === body.email && x.password === body.password);
    if (!body.email || !body.password) return err(400, "Email and password are required");
    if (!u) return err(401, "Invalid email or password");
    return ok({ message: "Login successful", token: `demo-${u._id}`, user: pub(u) });
  }
  if (a === "auth" && b === "register" && method === "POST") {
    if (!body.name || !body.email || !body.password || !body.role) return err(400, "Name, email, password, and role are required");
    if (db.users.some((x) => x.email === body.email)) return err(400, "User already exists");
    const u = { _id: `u${++db.seq}`, ...body };
    db.users.push(u); save(db);
    return ok({ message: "User registered successfully", user: pub(u) }, 201);
  }

  if (a === "complaints") {
    if (b === "raise" && method === "POST") {
      const e = need("student"); if (e) return e;
      const cm = { _id: `c${++db.seq}`, category: body.category, description: body.description, priority: body.priority || "Medium", status: "Raised",
        student_id: me._id, student_name: me.name, room_no: me.room_no || "Unknown", staff_id: null, staff_name: null, resolution_notes: null, createdAt: new Date().toISOString() };
      db.complaints.unshift(cm); save(db);
      return ok({ message: "Complaint raised successfully", complaint: cm }, 201);
    }
    if (!b && method === "GET") {
      const e = need(); if (e) return e;
      const list = db.complaints.filter((x) => me.role === "admin" || (me.role === "student" ? x.student_id === me._id : x.staff_id === me._id));
      return ok({ complaints: list });
    }
    if (b === "stats" && c === "overview") {
      const e = need("admin"); if (e) return e;
      const count = (s) => db.complaints.filter((x) => x.status === s).length;
      return ok({ total: db.complaints.length, raised: count("Raised"), assigned: count("Assigned"), inProgress: count("In Progress"), resolved: count("Resolved"), rejected: count("Rejected") });
    }
    const cm = db.complaints.find((x) => x._id === b);
    if (b && !c && method === "GET") {
      const e = need(); if (e) return e;
      return cm ? ok({ complaint: cm }) : err(404, "Complaint not found");
    }
    if (b && c && method === "PUT") {
      const e = need(...(c === "status" ? ["maintenance", "admin"] : ["admin"])); if (e) return e;
      if (!cm) return err(404, "Complaint not found");
      if (c === "assign") { Object.assign(cm, { staff_id: body.staff_id, staff_name: body.staff_name, status: "Assigned", assignedDate: new Date().toISOString() }); save(db); return ok({ message: "Complaint assigned successfully", complaint: cm }); }
      if (c === "status") {
        cm.status = body.status;
        if (body.status === "Resolved") { cm.resolvedDate = new Date().toISOString(); cm.resolution_notes = body.resolution_notes; }
        save(db); return ok({ message: "Complaint status updated successfully", complaint: cm });
      }
      if (c === "reject") { cm.status = "Rejected"; save(db); return ok({ message: "Complaint rejected successfully", complaint: cm }); }
    }
  }

  if (a === "users" || a === "staff") {
    if (a === "users" && b === "profile" && c === "me") { const e = need(); if (e) return e; return ok({ user: pub(me) }); }
    const e = need("admin"); if (e) return e;
    let list = db.users;
    if (a === "staff") list = list.filter((u) => u.role === "maintenance" && (b !== "department" || u.department === c));
    else if (b === "role") list = list.filter((u) => u.role === c);
    return ok(a === "staff" ? { staff: list.map(pub) } : { users: list.map(pub) });
  }
  return err(404, "Not found");
}
