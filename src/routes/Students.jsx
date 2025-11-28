import React, { useEffect, useState } from 'react'
import { API } from '../api'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'

export default function Students() {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [sections, setSections] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', sectionId: '', enrollmentDate: '' })
  const [notif, setNotif] = useState('')

  async function fetchData() {
    setLoading(true)
    try {
      const [sRes, secRes] = await Promise.all([API.get('/students'), API.get('/sections')])
      setStudents(sRes.data)
      setSections(secRes.data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  function openCreate() { setEditing(null); setForm({ name: '', email: '', sectionId: '', enrollmentDate: '' }); setOpen(true) }
  function openEdit(s) { setEditing(s); setForm({ ...s }); setOpen(true) }

  async function createOrUpdate() {
    try {
      if (editing) {
        await API.put(`/students/${editing.id}`, form)
        setNotif('Student updated')
      } else {
        await API.post('/students', form)
        setNotif('Student created')
      }
      setOpen(false)
      fetchData()
      setTimeout(() => setNotif(''), 2000)
    } catch (e) { console.error(e) }
  }

  async function remove(id) {
    if (!confirm('Delete student?')) return
    await API.delete(`/students/${id}`)
    fetchData()
  }

  return (
    <div>
      <div className="section-header">
        <h3>Student Management</h3>
        <Button onClick={openCreate}><span style={{ marginRight: 8 }}>＋</span>Add New Student</Button>
      </div>
      {notif && <div style={{ marginBottom: 12 }}>{notif}</div>}

      {loading ? <div className="loading">Loading...</div> : (
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Section</th><th>Enrollment Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {students.length === 0 && <tr><td colSpan={5} className="loading">No students found. Add a new student to get started.</td></tr>}
            {students.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{sections.find(x => x.id === Number(s.sectionId))?.name || '-'}</td>
                <td>{s.enrollmentDate || '-'}</td>
                <td>
                  <Button onClick={() => openEdit(s)} style={{ marginRight: 8 }}>Edit</Button>
                  <Button variant="danger" onClick={() => remove(s.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Student' : 'Add New Student'}>
        <div style={{ display: 'grid', gap: 10 }}>
          <label>Name *<Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
          <label>Email *<Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
          <label>Section
            <Select value={form.sectionId} onChange={e => setForm({ ...form, sectionId: e.target.value })}>
              <option value="">-- None --</option>
              {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
            </Select>
          </label>
          <label>Enrollment Date
            <Input type="date" value={form.enrollmentDate} onChange={e => setForm({ ...form, enrollmentDate: e.target.value })} />
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={createOrUpdate}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
