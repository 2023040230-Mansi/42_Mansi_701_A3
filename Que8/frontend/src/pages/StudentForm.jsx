import React, { useEffect, useState } from 'react'

export default function StudentForm({ student, onSaved }){
  const [form, setForm] = useState({ name:'', age:18, course:'', year:1 })

  useEffect(()=>{
    if (student) setForm({ name: student.name, age: student.age, course: student.course, year: student.year, id: student.id })
    else setForm({ name:'', age:18, course:'', year:1 })
  }, [student])

  async function submit(e){
    e.preventDefault()
    if (form.id) {
      await fetch('http://localhost:3015/api/students/'+form.id, { method:'PUT', headers:{'content-type':'application/json'}, body: JSON.stringify(form) })
    } else {
      await fetch('http://localhost:3015/api/students', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(form) })
    }
    onSaved()
  }

  return (
    <div>
      <h3>{form.id ? 'Edit Student' : 'Add Student'}</h3>
      <form onSubmit={submit}>
        <label>Name<br /><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></label><br />
        <label>Age<br /><input type="number" value={form.age} onChange={e=>setForm({...form,age:Number(e.target.value)})} required /></label><br />
        <label>Course<br /><input value={form.course} onChange={e=>setForm({...form,course:e.target.value})} /></label><br />
        <label>Year<br /><input type="number" value={form.year} onChange={e=>setForm({...form,year:Number(e.target.value)})} /></label><br />
        <button type="submit">Save</button>
        {form.id && <button type="button" onClick={()=>onSaved()}>Cancel</button>}
      </form>
    </div>
  )
}
