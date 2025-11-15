'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const BACKEND_HTTP =
  process.env.NEXT_PUBLIC_BACKEND_HTTP_URL || 'http://localhost:3001';

export default function HomePage() {
  const router = useRouter();

  const [format, setFormat] = useState<
    'COMMANDER' | 'TWO_HEADED_GIANT' | 'EMPEROR' | 'CUSTOM'
  >('COMMANDER');
  const [startingLifePlayer, setStartingLifePlayer] = useState(40);
  const [startingLifeTeam, setStartingLifeTeam] = useState<number | ''>('');
  const [useCommanderDamage, setUseCommanderDamage] = useState(true);
  const [commanderDamageLimit, setCommanderDamageLimit] = useState(21);
  const [usePoison, setUsePoison] = useState(true);
  const [poisonLimit, setPoisonLimit] = useState(10);

  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(`${BACKEND_HTTP}/game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          startingLifePlayer: Number(startingLifePlayer),
          startingLifeTeam:
            startingLifeTeam === '' ? undefined : Number(startingLifeTeam),
          useCommanderDamage,
          commanderDamageLimit: Number(commanderDamageLimit),
          usePoison,
          poisonLimit: Number(poisonLimit),
        }),
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }

      const game = await res.json();
      // vamos a /game/CODIGO
      router.push(`/game/${game.code}`);
    } catch (err: any) {
      setError(err.message ?? 'Error al crear la partida');
    }
  };

  const handleJoin = (e: FormEvent) => {
    e.preventDefault();
    if (!joinCode) return;
    router.push(`/game/${joinCode.toUpperCase()}`);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: '#0f172a',
        color: '#e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        alignItems: 'center',
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
        MTG Table – Commander Tools
      </h1>

      {/* Crear partida */}
      <section
        style={{
          width: '100%',
          maxWidth: '600px',
          padding: '1rem',
          backgroundColor: '#1e293b',
          borderRadius: '0.75rem',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>
          Crear partida
        </h2>

        <form
          onSubmit={handleCreate}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span>Formato</span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              style={{
                backgroundColor: '#020617',
                color: '#e5e7eb',
                borderRadius: '0.375rem',
                padding: '0.25rem 0.5rem',
              }}
            >
              <option value="COMMANDER">Commander</option>
              <option value="TWO_HEADED_GIANT">Gigante de Dos Cabezas</option>
              <option value="EMPEROR">Emperador</option>
              <option value="CUSTOM">Personalizado</option>
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span>Vida inicial por jugador</span>
            <input
              type="number"
              value={startingLifePlayer}
              onChange={(e) => setStartingLifePlayer(Number(e.target.value))}
              style={{
                backgroundColor: '#020617',
                color: '#e5e7eb',
                borderRadius: '0.375rem',
                padding: '0.25rem 0.5rem',
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span>Vida inicial por equipo (opcional)</span>
            <input
              type="number"
              value={startingLifeTeam}
              onChange={(e) =>
                setStartingLifeTeam(
                  e.target.value === '' ? '' : Number(e.target.value),
                )
              }
              placeholder="Deja vacío si no aplica"
              style={{
                backgroundColor: '#020617',
                color: '#e5e7eb',
                borderRadius: '0.375rem',
                padding: '0.25rem 0.5rem',
              }}
            />
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={useCommanderDamage}
                onChange={(e) => setUseCommanderDamage(e.target.checked)}
              />
              <span>Daño de comandante</span>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span>Límite daño de comandante</span>
              <input
                type="number"
                value={commanderDamageLimit}
                onChange={(e) => setCommanderDamageLimit(Number(e.target.value))}
                style={{
                  backgroundColor: '#020617',
                  color: '#e5e7eb',
                  borderRadius: '0.375rem',
                  padding: '0.25rem 0.5rem',
                }}
              />
            </label>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={usePoison}
                onChange={(e) => setUsePoison(e.target.checked)}
              />
              <span>Daño de veneno</span>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span>Límite de veneno</span>
              <input
                type="number"
                value={poisonLimit}
                onChange={(e) => setPoisonLimit(Number(e.target.value))}
                style={{
                  backgroundColor: '#020617',
                  color: '#e5e7eb',
                  borderRadius: '0.375rem',
                  padding: '0.25rem 0.5rem',
                }}
              />
            </label>
          </div>

          {error && (
            <p style={{ color: '#fca5a5', fontSize: '0.875rem' }}>{error}</p>
          )}

          <button
            type="submit"
            style={{
              marginTop: '0.5rem',
              backgroundColor: '#10b981',
              color: '#020617',
              fontWeight: 600,
              borderRadius: '0.375rem',
              padding: '0.5rem 0.75rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Crear partida
          </button>
        </form>
      </section>

      {/* Unirse a partida */}
      <section
        style={{
          width: '100%',
          maxWidth: '600px',
          padding: '1rem',
          backgroundColor: '#1e293b',
          borderRadius: '0.75rem',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>
          Unirse a partida
        </h2>

        <form
          onSubmit={handleJoin}
          style={{ display: 'flex', gap: '0.5rem' }}
        >
          <input
            type="text"
            placeholder="Código (ej: ABC123)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            style={{
              flexGrow: 1,
              backgroundColor: '#020617',
              color: '#e5e7eb',
              borderRadius: '0.375rem',
              padding: '0.25rem 0.5rem',
              textTransform: 'uppercase',
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: '#0ea5e9',
              color: '#020617',
              fontWeight: 600,
              borderRadius: '0.375rem',
              padding: '0.5rem 0.75rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Unirse
          </button>
        </form>
      </section>
    </main>
  );
}
