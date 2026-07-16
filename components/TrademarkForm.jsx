"use client";
import { useState, useRef } from 'react';

export default function TrademarkForm({ trademark, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const formRef = useRef(null);

  const [classesList, setClassesList] = useState(() => {
    if (!trademark?.niceClasses) return [];
    try {
      const parsed = JSON.parse(trademark.niceClasses);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // Legacy format fallback
      return [{ type: 'Otros', description: trademark.niceClasses }];
    }
    return [];
  });
  
  const [classType, setClassType] = useState('Clase 1');
  const [classDescription, setClassDescription] = useState('');

  const [existingDocs, setExistingDocs] = useState(() => trademark?.documents || []);
  const [newDocs, setNewDocs] = useState([]);
  
  const [docDate, setDocDate] = useState('');
  const [docDesc, setDocDesc] = useState('');
  const [docFile, setDocFile] = useState(null);
  const fileInputRef = useRef(null);

  const classOptions = [
    ...Array.from({ length: 45 }, (_, i) => `Clase ${i + 1}`),
    'Nombre Comercial',
    'Señal de Propaganda',
    'Otros'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    
    // Append the classes list as a JSON string
    formData.set('niceClasses', JSON.stringify(classesList));

    // Append documents
    formData.set('existing_docs_ids', JSON.stringify(existingDocs.map(d => d.id)));
    newDocs.forEach((doc, i) => {
      formData.set(`doc_file_${i}`, doc.file);
      formData.set(`doc_date_${i}`, doc.date);
      formData.set(`doc_desc_${i}`, doc.description);
    });
    formData.set('doc_count', newDocs.length);

    try {
      const url = trademark ? `/api/trademarks/${trademark.id}` : '/api/trademarks';
      const method = trademark ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al guardar la marca');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <div className="surface" style={{ padding: '2.5rem', marginBottom: '2.5rem', borderTop: '4px solid var(--primary)' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>
          {trademark ? '✏️ Editar Marca' : '✨ Registrar Nueva Marca'}
        </h2>
        <p className="text-muted" style={{ margin: '0.5rem 0 0', fontSize: '0.95rem' }}>
          Completa los detalles de la marca a continuación. El diseño ha sido optimizado para mayor claridad y alineación.
        </p>
      </header>
      
      <form ref={formRef} onSubmit={handleSubmit}>
        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span> <strong>Error:</strong> {error}
          </div>
        )}

        <div className="grid-2">
          <div className="form-group">
            <label className="label">
              Nombre del Cliente <span style={{ color: 'red', fontSize: '0.85em', fontWeight: 'normal' }}>* (obligatorio)</span>
            </label>
            <input type="text" name="clientName" className="input" defaultValue={trademark?.clientName} required placeholder="Ej. Empresa S.A." />
          </div>
          <div className="form-group">
            <label className="label">
              Nombre de la Marca <span style={{ color: 'red', fontSize: '0.85em', fontWeight: 'normal' }}>* (obligatorio)</span>
            </label>
            <input type="text" name="trademarkName" className="input" defaultValue={trademark?.trademarkName} required placeholder="Ej. SuperMarca" />
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="label">
              Titular (Dueño Legal) <span style={{ color: 'red', fontSize: '0.85em', fontWeight: 'normal' }}>* (obligatorio)</span>
            </label>
            <input type="text" name="owner" className="input" defaultValue={trademark?.owner} required placeholder="Nombre del propietario legal de la marca" />
          </div>
          <div className="form-group">
            <label className="label">
              Estado Legal Actual <span style={{ color: 'red', fontSize: '0.85em', fontWeight: 'normal' }}>* (obligatorio)</span>
            </label>
            <select name="status" className="input" defaultValue={trademark?.status || 'Solicitada'} required>
              <option value="Solicitada">Solicitada</option>
              <option value="Registrada">Registrada</option>
              <option value="En Renovación">En Renovación</option>
              <option value="Modificada">Modificada (Cesión, etc)</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="label">Número de Expediente</label>
            <input type="text" name="fileNumber" className="input" defaultValue={trademark?.fileNumber} placeholder="Ej. 12345/2023" />
          </div>
          <div className="form-group">
            <label className="label">Número de Registro</label>
            <input type="text" name="registrationNumber" className="input" defaultValue={trademark?.registrationNumber} placeholder="Ej. 9876543" />
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="label">Fecha de Solicitud</label>
            <input type="date" name="applicationDate" className="input" defaultValue={formatDate(trademark?.applicationDate)} />
          </div>
          <div className="form-group">
            <label className="label">Fecha de Registro</label>
            <input type="date" name="registrationDate" className="input" defaultValue={formatDate(trademark?.registrationDate)} />
          </div>
          <div className="form-group">
            <label className="label">Fecha de Vencimiento</label>
            <input type="date" name="expirationDate" className="input" defaultValue={formatDate(trademark?.expirationDate)} />
          </div>
        </div>

        <div className="form-group" style={{ backgroundColor: 'var(--background)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <label className="label">Clases y Productos / Servicios</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <select 
              className="input" 
              style={{ width: '200px' }}
              value={classType}
              onChange={(e) => setClassType(e.target.value)}
            >
              {classOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <input 
              type="text" 
              className="input" 
              style={{ flex: 1 }}
              placeholder="Descripción (ej. Café, té, cacao...)"
              value={classDescription}
              onChange={(e) => setClassDescription(e.target.value)}
            />
            <button 
              type="button" 
              className="btn btn-outline"
              style={{ padding: '0.5rem 1rem' }}
              onClick={() => {
                if (!classDescription.trim()) {
                  alert("Por favor ingresa una descripción para la clase.");
                  return;
                }
                setClassesList([...classesList, { type: classType, description: classDescription }]);
                setClassDescription('');
              }}
            >
              Agregar
            </button>
          </div>

          {classesList.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {classesList.map((item, index) => (
                <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div>
                    <strong style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>{item.type}:</strong>
                    <span>{item.description}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setClassesList(classesList.filter((_, i) => i !== index))}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.5rem' }}
                    title="Eliminar"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group">
          <label className="label">Logotipo de la Marca</label>
          {trademark?.logoUrl && (
            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8fafc', border: '1px dashed var(--border)', borderRadius: '8px', display: 'inline-block' }}>
              <img src={trademark.logoUrl} alt="Logo actual" style={{ height: '80px', objectFit: 'contain' }} />
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input type="file" name="logo" className="input" accept="image/*" style={{ flex: 1, padding: '0.6rem' }} />
            <span className="text-muted" style={{ fontSize: '0.85rem', flex: 1 }}>* Formatos soportados: JPG, PNG. La imagen se guardará localmente.</span>
          </div>
        </div>

        <div className="form-group" style={{ backgroundColor: 'var(--background)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <label className="label">Documentos de Respaldo</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input 
              type="date" 
              className="input" 
              style={{ width: '150px' }}
              value={docDate}
              onChange={(e) => setDocDate(e.target.value)}
            />
            <input 
              type="text" 
              className="input" 
              style={{ flex: 1, minWidth: '200px' }}
              placeholder="Descripción del documento..."
              value={docDesc}
              onChange={(e) => setDocDesc(e.target.value)}
            />
            <input 
              type="file" 
              className="input" 
              style={{ flex: 1, minWidth: '200px', padding: '0.6rem' }}
              ref={fileInputRef}
              onChange={(e) => setDocFile(e.target.files[0])}
            />
            <button 
              type="button" 
              className="btn btn-outline"
              style={{ padding: '0.5rem 1rem' }}
              onClick={() => {
                if (!docDesc.trim() || !docFile) {
                  alert("Por favor ingresa una descripción y selecciona un archivo.");
                  return;
                }
                setNewDocs([...newDocs, { date: docDate, description: docDesc, file: docFile }]);
                setDocDate('');
                setDocDesc('');
                setDocFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              Añadir
            </button>
          </div>

          {(existingDocs.length > 0 || newDocs.length > 0) && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {existingDocs.map((doc) => (
                <li key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div>
                    <strong style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>{doc.date ? new Date(doc.date).toLocaleDateString() : 'Sin fecha'}:</strong>
                    <span>{doc.description}</span>
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" style={{ marginLeft: '1rem', fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'underline' }}>Ver archivo</a>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setExistingDocs(existingDocs.filter(d => d.id !== doc.id))}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.5rem' }}
                    title="Eliminar"
                  >
                    ×
                  </button>
                </li>
              ))}
              {newDocs.map((doc, index) => (
                <li key={`new-${index}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px dashed var(--primary)' }}>
                  <div>
                    <span className="badge badge-solicitada" style={{ marginRight: '0.5rem' }}>Nuevo</span>
                    <strong style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>{doc.date ? new Date(doc.date).toLocaleDateString() : 'Sin fecha'}:</strong>
                    <span>{doc.description}</span> <em style={{ fontSize: '0.85rem', color: 'var(--muted)', marginLeft: '0.5rem' }}>({doc.file.name})</em>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setNewDocs(newDocs.filter((_, i) => i !== index))}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.5rem' }}
                    title="Eliminar"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group">
          <label className="label">Notas y Observaciones</label>
          <textarea name="notes" className="input" placeholder="Agrega detalles extra como historial de cesiones, oposiciones o comentarios internos." defaultValue={trademark?.notes}></textarea>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button type="button" onClick={onCancel} className="btn btn-outline" disabled={loading}>
            Cancelar Operación
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : (trademark ? '💾 Actualizar Marca' : '💾 Guardar Nueva Marca')}
          </button>
        </div>
      </form>
    </div>
  );
}
