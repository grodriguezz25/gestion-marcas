"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';

export default function Reporte({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [trademark, setTrademark] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrademark = async () => {
      try {
        const res = await fetch(`/api/trademarks/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTrademark(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrademark();
  }, [id]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando reporte...</div>;
  if (!trademark) return <div style={{ padding: '2rem', textAlign: 'center' }}>Marca no encontrada.</div>;

  const printReport = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', backgroundColor: 'white', minHeight: '100vh' }}>
      
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" className="btn btn-outline" style={{ textDecoration: 'none' }}>
          &larr; Volver al Panel
        </Link>
        <button onClick={printReport} className="btn btn-primary">
          Imprimir / Guardar como PDF
        </button>
      </div>

      <div style={{ padding: '2rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} className="surface">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#000' }}>Reporte de Marca</h1>
            <p style={{ margin: '0.5rem 0 0', color: '#4a5568', fontSize: '1.1rem' }}>Estado Legal y Detalles del Registro</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, color: '#4a5568', fontWeight: 500 }}>Fecha del Reporte:</p>
            <p style={{ margin: 0 }}>{new Date().toLocaleDateString()}</p>
          </div>
        </header>

        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Información Principal</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ display: 'block', fontSize: '0.85rem', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre de la Marca</span>
              <strong style={{ fontSize: '1.5rem' }}>{trademark.trademarkName}</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.85rem', color: '#718096', textTransform: 'uppercase' }}>Cliente</span>
                <strong>{trademark.clientName}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.85rem', color: '#718096', textTransform: 'uppercase' }}>Titular (Dueño)</span>
                <strong>{trademark.owner}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.85rem', color: '#718096', textTransform: 'uppercase' }}>Estado Actual</span>
                <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 600 }}>
                  {trademark.status}
                </span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.85rem', color: '#718096', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Clases y Productos / Servicios</span>
                {(() => {
                  if (!trademark.niceClasses) return <strong>N/A</strong>;
                  try {
                    const parsed = JSON.parse(trademark.niceClasses);
                    if (Array.isArray(parsed)) {
                      if (parsed.length === 0) return <strong>N/A</strong>;
                      return (
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#1a202c' }}>
                          {parsed.map((c, i) => (
                            <li key={i} style={{ marginBottom: '0.25rem' }}>
                              <strong>{c.type}:</strong> {c.description}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                  } catch (e) {
                    // legacy text fallback
                  }
                  return <strong>{trademark.niceClasses}</strong>;
                })()}
              </div>
            </div>
          </div>

          <div style={{ width: '250px' }}>
             <span style={{ display: 'block', fontSize: '0.85rem', color: '#718096', textTransform: 'uppercase', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Logotipo</span>
             {trademark.logoUrl ? (
               <img src={trademark.logoUrl} alt="Logo de la marca" style={{ width: '100%', height: 'auto', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.5rem', objectFit: 'contain' }} />
             ) : (
               <div style={{ width: '100%', height: '150px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Sin Logotipo</div>
             )}
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Fechas Críticas</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.85rem', color: '#718096', textTransform: 'uppercase' }}>Solicitud</span>
              <strong>{trademark.applicationDate ? new Date(trademark.applicationDate).toLocaleDateString() : 'No registrada'}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.85rem', color: '#718096', textTransform: 'uppercase' }}>Registro / Concesión</span>
              <strong>{trademark.registrationDate ? new Date(trademark.registrationDate).toLocaleDateString() : 'No registrada'}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.85rem', color: '#718096', textTransform: 'uppercase' }}>Próximo Vencimiento</span>
              <strong style={{ color: trademark.expirationDate && new Date(trademark.expirationDate) < new Date() ? '#dc2626' : 'inherit' }}>
                {trademark.expirationDate ? new Date(trademark.expirationDate).toLocaleDateString() : 'No registrada'}
              </strong>
            </div>
          </div>
        </div>

        {trademark.documents && trademark.documents.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Documentos de Respaldo</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {trademark.documents.map((doc) => (
                <li key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ color: '#4f46e5', marginRight: '0.5rem' }}>{doc.date ? new Date(doc.date).toLocaleDateString() : 'Sin fecha'}:</strong>
                    <span>{doc.description}</span>
                  </div>
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="no-print" style={{ marginLeft: '1rem', fontSize: '0.85rem', color: '#4f46e5', textDecoration: 'underline' }}>Ver Archivo</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {trademark.notes && (
          <div>
            <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Notas y Observaciones</h2>
            <div style={{ padding: '1rem', borderLeft: '4px solid #cbd5e1', backgroundColor: '#f8fafc', whiteSpace: 'pre-wrap' }}>
              {trademark.notes}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
