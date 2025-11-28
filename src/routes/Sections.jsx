import React, { useEffect, useState } from 'react'
import { API } from '../api'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Button from '../components/Button'

export default function Sections() {
  const [sections, setSections] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })

  async function fetchData() {
    const res = await API.get('/sections')
    setSections(res.data)
  }
  useEffect(() => { fetchData() }, [])

  function openCreate() { setEditing(null); setForm({ name: '', description: '' }); setOpen(true) }
  function openEdit(s) { setEditing(s); setForm({ ...s }); setOpen(true) }

  async function save() {
    if (editing) await API.put(`/sections/${editing.id}`, form)
    else await API.post('/sections', form)
    setOpen(false)
    fetchData()
  }
  async function remove(id) { if (!confirm('Delete section?')) return; await API.delete(`/sections/${id}`); fetchData() }

  return (
    <div>
      <div className="section-header">
        <h3>Sections</h3>
        <Button onClick={openCreate}>＋ Add New Section</Button>
      </div>
      <table className="table">
        <thead><tr><th>Name</th><th>Description</th><th>Total Students</th><th>Actions</th></tr></thead>
        <tbody>
          {sections.length === 0 && <tr><td colSpan={4} className="loading">No records found</td></tr>}
          {sections.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.description || '-'}</td>
              <td>-</td>
              <td>
                <Button onClick={() => openEdit(s)}>Edit</Button>
                <Button variant="danger" onClick={() => remove(s.id)} style={{ marginLeft: 8 }}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Section' : 'Add New Section'}>
        <div style={{ display: 'grid', gap: 10 }}>
          <label>Name *<Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
          <label>Description<textarea className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
