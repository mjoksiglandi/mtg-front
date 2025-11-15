'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

const BACKEND_HTTP =
  process.env.NEXT_PUBLIC_BACKEND_HTTP_URL || 'http://localhost:3001';
const BACKEND_WS =
  process.env.NEXT_PUBLIC_BACKEND_WS_URL || 'http://localhost:3001';

interface PlayerState {
  id: string;
  name: string;
  teamId?: string | null;
  life: number;
  poison: number;
  isAlive: boolean;
}

interface GameState {
  gameId: string;
  code: string;
  players: PlayerState[];
}

let socket: Socket | null = null;

export default function GamePage() {
  const params = useParams<{ code: string }>();
  const code = (params.code || '').toString().toUpperCase();

  const [game, setGame] = useState<GameState | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar estado inicial por REST
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`${BACKEND_HTTP}/game/${code}`);
        if (!res.ok) {
          setGame(null);
        } else {
          const data = await res.json();
          setGame(data);
        }
      } catch (e) {
        setGame(null);
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchGame();
    }
  }, [code]);

  // Conectar socket
  useEffect(() => {
    socket = io(BACKEND_WS);

    socket.on('game_state', (state: GameState) => {
      setGame(state);
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, []);

  const handleJoin = () => {
    if (!socket || !playerName) return;
    socket.emit('join_game', { gameCode: code, playerName });
    setJoined(true);
  };

  const sendAction = (playerId: string, type: string, value?: number) => {
    if (!socket) return;
    socket.emit('action', {
      gameCode: code,
      type,
      playerId,
      value,
    });
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          backgroundColor: '#0f172a',
          color: '#e5e7eb',
          padding: '1.5rem',
        }}
      >
        Cargando partida...
      </main>
    );
  }

  if (!game) {
    return (
      <main
        style={{
          minHeight: '100vh',
          backgroundColor: '#0f172a',
          color: '#e5e7eb',
          padding: '1.5rem',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          Partida no encontrada
        </h1>
        <p>Código: {code}</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#e5e7eb',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          Mesa {game.code}
        </h1>
      </header>

      {!joined && (
        <section
          style={{
            maxWidth: '400px',
            padding: '1rem',
            backgroundColor: '#1e293b',
            borderRadius: '0.75rem',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Unirse como jugador
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Tu nombre"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              style={{
                flexGrow: 1,
                backgroundColor: '#020617',
                color: '#e5e7eb',
                borderRadius: '0.375rem',
                padding: '0.25rem 0.5rem',
              }}
            />
            <button
              onClick={handleJoin}
              style={{
                backgroundColor: '#10b981',
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
          </div>
        </section>
      )}

      <section
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        {game.players.map((p) => (
          <article
            key={p.id}
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '0.75rem',
              padding: '1rem',
              border: p.isAlive ? '1px solid #22c55e66' : '1px solid #f9737366',
              opacity: p.isAlive ? 1 : 0.6,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <header
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 style={{ fontWeight: 600 }}>{p.name}</h3>
              {!p.isAlive && (
                <span style={{ color: '#fca5a5', fontSize: '0.75rem' }}>
                  Fuera del juego
                </span>
              )}
            </header>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{p.life}</p>
                <p style={{ fontSize: '0.75rem', color: '#cbd5f5' }}>Vida</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={() => sendAction(p.id, 'ADD_LIFE', 1)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#020617',
                      color: '#e5e7eb',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    +1
                  </button>
                  <button
                    onClick={() => sendAction(p.id, 'ADD_LIFE', -1)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#020617',
                      color: '#e5e7eb',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    -1
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={() => sendAction(p.id, 'ADD_LIFE', 5)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#020617',
                      color: '#e5e7eb',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    +5
                  </button>
                  <button
                    onClick={() => sendAction(p.id, 'ADD_LIFE', -5)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#020617',
                      color: '#e5e7eb',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    -5
                  </button>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <p style={{ fontSize: '1.4rem', fontWeight: '600' }}>{p.poison}</p>
                <p style={{ fontSize: '0.75rem', color: '#cbd5f5' }}>Veneno</p>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  onClick={() => sendAction(p.id, 'ADD_POISON', 1)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#020617',
                    color: '#e5e7eb',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  +1
                </button>
                <button
                  onClick={() => sendAction(p.id, 'ADD_POISON', -1)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#020617',
                    color: '#e5e7eb',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  -1
                </button>
              </div>
            </div>

            <button
              onClick={() => sendAction(p.id, 'MARK_DEAD')}
              style={{
                marginTop: '0.5rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#f97373bb',
                color: '#020617',
                fontWeight: 600,
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              Marcar fuera del juego
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
