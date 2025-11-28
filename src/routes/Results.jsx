import React, { useEffect, useState } from "react";
import { API } from "../api";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";

// ---- FIXED GRADE BADGES ----
function gradeBadge(marks) {
  if (marks >= 95)
    return <span className="badge grade-Aplus">A+</span>;
  if (marks >= 85)
    return <span className="badge grade-A">A</span>;
  if (marks >= 75)
    return <span className="badge grade-B">B</span>;
  if (marks >= 60)
    return <span className="badge grade-C">C</span>;
  if (marks >= 40)
    return <span className="badge grade-D">D</span>;

  return <span className="badge grade-F">F</span>;
}

export default function Results() {
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    studentId: "",
    subject: "",
    marks: "",
    examDate: "",
  });

  // Load students + results
  async function fetchData() {
    const [sRes, rRes] = await Promise.all([
      API.get("/students"),
      API.get("/results"),
    ]);

    setStudents(sRes.data);
    setResults(rRes.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ---- OPEN EDIT MODAL ----
  function openEdit(result) {
    setEditing(result);

    setForm({
      studentId: result.studentId,
      subject: result.subject,
      marks: result.marks,
      examDate: result.examDate,
    });

    setOpen(true);
  }

  // ---- OPEN CREATE MODAL ----
  function openCreate() {
    setEditing(null);
    setForm({ studentId: "", subject: "", marks: "", examDate: "" });
    setOpen(true);
  }

  // ---- SAVE (CREATE/UPDATE) ----
  async function save() {
    if (editing) {
      await API.put(`/results/${editing.id}`, form);
    } else {
      await API.post("/results", form);
    }

    setOpen(false);
    setEditing(null);
    fetchData();
  }

  // ---- DELETE RESULT ----
  async function remove(id) {
    if (!confirm("Delete result?")) return;
    await API.delete(`/results/${id}`);
    fetchData();
  }

  return (
    <div>
      <div className="section-header">
        <h3>Results</h3>
        <Button onClick={openCreate}>＋ Add New Result</Button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Subject</th>
            <th>Marks</th>
            <th>Grade</th>
            <th>Exam Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {results.length === 0 && (
            <tr>
              <td colSpan={6} className="loading">
                No records found
              </td>
            </tr>
          )}

          {results.map((r) => (
            <tr key={r.id}>
              <td>
                {students.find((s) => s.id === Number(r.studentId))?.name ||
                  "-"}
              </td>
              <td>{r.subject}</td>
              <td>{r.marks}</td>
              <td>{gradeBadge(Number(r.marks))}</td>
              <td>{r.examDate || "-"}</td>

              <td>
                <Button onClick={() => openEdit(r)}>Edit</Button>
                <Button
                  variant="danger"
                  onClick={() => remove(r.id)}
                  style={{ marginLeft: 8 }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ---------- ADD/EDIT MODAL ---------- */}
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit Result" : "Add New Result"}
      >
        <div style={{ display: "grid", gap: 10 }}>
          <label>
            Student *
            <Select
              value={form.studentId}
              onChange={(e) =>
                setForm({ ...form, studentId: e.target.value })
              }
            >
              <option value="">-- choose --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </label>

          <label>
            Subject *
            <Input
              value={form.subject}
              onChange={(e) =>
                setForm({ ...form, subject: e.target.value })
              }
            />
          </label>

          <label>
            Marks *
            <Input
              type="number"
              min={0}
              max={100}
              value={form.marks}
              onChange={(e) =>
                setForm({ ...form, marks: e.target.value })
              }
            />
          </label>

          <label>
            Exam Date
            <Input
              type="date"
              value={form.examDate}
              onChange={(e) =>
                setForm({ ...form, examDate: e.target.value })
              }
            />
          </label>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            <Button
              variant="secondary"
              onClick={() => {
                setOpen(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>

            <Button onClick={save}>
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
