"use client";
import { useState, useEffect } from 'react';
import TrademarkForm from '../components/TrademarkForm';
import Link from 'next/link';

export default function Dashboard() {
  const [trademarks, setTrademarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMark, setEditingMark] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTrademarks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trademarks', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setTrademarks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrademarks();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta marca?")) {
      await fetch(`/api/trademarks/${id}`, { method: 'DELETE' });
      fetchTrademarks();
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingMark(null);
    fetchTrademarks();
  };

  const filteredMarks = trademarks.filter(mark => 
    mark.trademarkName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    mark.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBadgeClass = (status) => {
    const map = {
      'Solicitada': 'badge-solicitada',
      'Registrada': 'badge-registrada',
      'En Renovación': 'badge-renovacion',
      'Modificada': 'badge-modificada',
      'Cancelada': 'badge-cancelada',
    };
    return `badge ${map[status] || 'badge-solicitada'}`;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 700 }}>Gestión de Marcas</h1>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--muted)' }}>Panel de control para marcas registradas y en trámite</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => { setShowForm(true); setEditingMark(null); }}
        >
          + Nueva Marca
        </button>
      </header>

      {showForm && (
        <TrademarkForm 
          trademark={editingMark} 
          onSuccess={handleFormSuccess} 
          onCancel={() => { setShowForm(false); setEditingMark(null); }} 
        />
      )}

      <div className="surface" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Tus Marcas</h2>
          <input 
            type="text" 
            placeholder="Buscar por marca o cliente..." 
            className="input" 
            style={{ width: '300px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>Cargando datos...</p>
        ) : filteredMarks.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No se encontraron marcas.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--muted)' }}>
                  <th style={{ padding: '0.75rem', fontWeight: 500 }}>Logo</th>
                  <th style={{ padding: '0.75rem', fontWeight: 500 }}>Marca</th>
                  <th style={{ padding: '0.75rem', fontWeight: 500 }}>Cliente</th>
                  <th style={{ padding: '0.75rem', fontWeight: 500 }}>Estado</th>
                  <th style={{ padding: '0.75rem', fontWeight: 500 }}>Vencimiento</th>
                  <th style={{ padding: '0.75rem', fontWeight: 500, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarks.map(mark => (
                  <tr key={mark.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      {mark.logoUrl ? (
                        <img src={mark.logoUrl} alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', backgroundColor: 'var(--background)', border: '1px solid var(--border)' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--background)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '0.75rem', border: '1px solid var(--border)' }}>N/A</div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 500 }}>{mark.trademarkName}</td>
                    <td style={{ padding: '0.75rem' }}>{mark.clientName}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={getBadgeClass(mark.status)}>{mark.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem', color: mark.expirationDate && new Date(mark.expirationDate) < new Date() ? 'var(--danger)' : 'inherit' }}>
                      {mark.expirationDate ? new Date(mark.expirationDate).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <Link href={`/reporte/${mark.id}`} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginRight: '0.5rem', textDecoration: 'none' }}>
                        Reporte
                      </Link>
                      <button onClick={() => { setEditingMark(mark); setShowForm(true); window.scrollTo(0,0); }} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginRight: '0.5rem' }}>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(mark.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
