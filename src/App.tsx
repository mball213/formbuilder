import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

// Drop-in replacement for: src/App.tsx
// Fixes TypeScript build error by attaching native HTML5 drag handlers to a plain <div>
// inside motion.div (so handlers receive React.DragEvent, not Mouse/Pointer events).

type FieldType = 'text' | 'number' | 'date' | 'select'

type Field = {
  id: string
  type: FieldType
  label: string
  required?: boolean
  options?: string[] // for select
}

// --- helpers (kept local to avoid extra files) ---
function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function createField(type: FieldType, label: string): Field {
  return {
    id: uid(),
    type,
    label,
    required: false,
    options: type === 'select' ? ['Option 1', 'Option 2'] : undefined,
  }
}

function reorder<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) return list.slice()
  const next = list.slice()
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

const PALETTE: { type: FieldType; label: string }[] = [
  { type: 'text', label: 'Text' },
  { type: 'number', label: 'Number' },
  { type: 'date', label: 'Date' },
  { type: 'select', label: 'Select' },
]

export default function App() {
  const [fields, setFields] = useState<Field[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  // --- native DnD handlers (typed as React.DragEvent) ---
  function onDragStart(e: React.DragEvent, payload: any) {
    e.dataTransfer.setData('application/json', JSON.stringify(payload))
    e.dataTransfer.effectAllowed = 'copyMove'
  }

  function onDropToCanvas(e: React.DragEvent) {
    e.preventDefault()
    const data = e.dataTransfer.getData('application/json')
    if (!data) return
    const payload = JSON.parse(data)
    if (payload.kind === 'palette') {
      const f = createField(payload.type as FieldType, payload.label)
      setFields(prev => [...prev, f])
    } else if (payload.kind === 'reorder') {
      setFields(prev => reorder(prev, payload.fromIndex, payload.toIndex))
    }
  }

  function onDragOverCanvas(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const selectedField = useMemo(
    () => fields.find(f => f.id === selected) || null,
    [fields, selected],
  )

  function updateSelected(patch: Partial<Field>) {
    if (!selectedField) return
    setFields(prev => prev.map(f => (f.id === selectedField.id ? { ...f, ...patch } : f)))
  }

  function removeSelected() {
    if (!selectedField) return
    setFields(prev => prev.filter(f => f.id !== selectedField.id))
    setSelected(null)
  }

  return (
    <div style={{ minHeight: '100vh', padding: 16, background: '#f7f7fb' }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gap: 16,
          gridTemplateColumns: '260px 1fr 360px',
        }}
      >
        <header style={{ gridColumn: '1/-1' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>rapidECM — Formbuilder v3</h1>
          <p style={{ color: '#666', fontSize: 13 }}>
            Drag fields from the palette to the canvas, select a field to edit, and preview schema.
          </p>
        </header>

        {/* Palette */}
        <section>
          <div
            style={{
              background: 'white',
              borderRadius: 14,
              padding: 12,
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Palette</h2>
            <div style={{ display: 'grid', gap: 8 }}>
              {PALETTE.map(p => (
                <motion.div
                  key={p.type}
                  whileHover={{ scale: 1.02 }}
                  style={{
                    border: '1px dashed #cbd5e1',
                    borderRadius: 12,
                    padding: '10px 12px',
                    background: '#fafafa',
                  }}
                >
                  {/* Use a plain div for native draggable events so TS sees React.DragEvent */}
                  <div
                    role="button"
                    draggable
                    onDragStart={(e: React.DragEvent) =>
                      onDragStart(e, { kind: 'palette', type: p.type, label: p.label })
                    }
                    style={{ cursor: 'grab' }}
                    aria-label={`Drag ${p.label} field`}
                  >
                    {p.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Canvas */}
        <section onDrop={onDropToCanvas} onDragOver={onDragOverCanvas}>
          <div
            style={{
              background: 'white',
              borderRadius: 14,
              padding: 12,
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              minHeight: 360,
            }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Canvas</h2>
            {fields.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Drag a field here…</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {fields.map((f, idx) => (
                  <div
                    key={f.id}
                    draggable
                    onDragStart={(e: React.DragEvent) =>
                      onDragStart(e, { kind: 'reorder', fromIndex: idx, toIndex: idx })
                    }
                    onDrop={(e: React.DragEvent) => {
                      e.preventDefault()
                      const data = e.dataTransfer.getData('application/json')
                      if (!data) return
                      const payload = JSON.parse(data)
                      if (payload.kind === 'reorder') {
                        setFields(prev => reorder(prev, payload.fromIndex, idx))
                      }
                    }}
                    onDragOver={(e: React.DragEvent) => e.preventDefault()}
                    onClick={() => setSelected(f.id)}
                    style={{
                      borderRadius: 12,
                      padding: '10px 12px',
                      border: selected === f.id ? '2px solid #6366f1' : '1px solid #e5e7eb',
                      background: selected === f.id ? '#f5f5ff' : '#fff',
                    }}
                  >
                    <div style={{ fontSize: 13, color: '#64748b' }}>{f.type.toUpperCase()}</div>
                    <div style={{ fontWeight: 600 }}>
                      {f.label}
                      {f.required ? ' *' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Inspector */}
        <section>
          <div
            style={{
              background: 'white',
              borderRadius: 14,
              padding: 12,
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Inspector</h2>
            {!selectedField ? (
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Select a field to edit…</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ fontSize: 12, color: '#475569' }}>Label</label>
                <input
                  value={selectedField.label}
                  onChange={e => updateSelected({ label: e.target.value })}
                  style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px' }}
                />
                <label style={{ fontSize: 12, color: '#475569' }}>
                  <input
                    type="checkbox"
                    checked={!!selectedField.required}
                    onChange={e => updateSelected({ required: e.target.checked })}
                    style={{ marginRight: 8 }}
                  />
                  Required
                </label>
                {selectedField.type === 'select' && (
                  <>
                    <label style={{ fontSize: 12, color: '#475569' }}>Options (comma separated)</label>
                    <input
                      value={(selectedField.options || []).join(', ')}
                      onChange={e =>
                        updateSelected({
                          options: e.target.value
                            .split(',')
                            .map(s => s.trim())
                            .filter(Boolean),
                        })
                      }
                      style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px' }}
                    />
                  </>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={removeSelected}
                    style={{
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      borderRadius: 8,
                      padding: '8px 10px',
                      background: 'white',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ height: 12 }} />

          <div
            style={{
              background: 'white',
              borderRadius: 14,
              padding: 12,
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Schema Preview</h2>
            <pre
              style={{
                fontSize: 12,
                background: '#0f172a',
                color: '#e2e8f0',
                borderRadius: 12,
                padding: 12,
                overflowX: 'auto',
              }}
            >{JSON.stringify(fields, null, 2)}</pre>
          </div>
        </section>
      </div>
    </div>
  )
}
