import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { WS_NATIVE_URL } from '@/constants/api';

type MessageCallback = (body: unknown) => void;

/**
 * Service WebSocket STOMP — singleton partagé dans toute l'application.
 *
 * Gestion automatique :
 * - Reconnexion avec backoff exponentiel (5s → 10s → 20s, max 60s)
 * - Ré-abonnement automatique après reconnexion (géré par @stomp/stompjs)
 * - Envoi du JWT dans les headers de connexion STOMP
 */
class WebSocketService {
  private client: Client | null = null;
  private reconnectDelay = 5000;

  /** Initialise et active la connexion STOMP avec le token JWT fourni */
  connect(token: string): void {
    if (this.client?.active) return;

    this.client = new Client({
      webSocketFactory: () => new WebSocket(WS_NATIVE_URL) as unknown as WebSocket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: this.reconnectDelay,
      onConnect: () => {
        this.reconnectDelay = 5000;
      },
      onDisconnect: () => {
        // Doublement du délai à chaque déconnexion, plafonné à 60s
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 60000);
      },
      onStompError: (frame) => {
        console.warn('[WS] Erreur STOMP :', frame.headers?.message);
      },
    });

    this.client.activate();
  }

  /** Déconnecte proprement le client STOMP */
  disconnect(): void {
    this.client?.deactivate();
    this.client = null;
    this.reconnectDelay = 5000;
  }

  /**
   * S'abonne à une destination STOMP.
   * Retourne une fonction d'annulation à appeler dans le cleanup du composant.
   * Si le client n'est pas encore connecté, attend la connexion via onConnect.
   */
  subscribe(destination: string, callback: MessageCallback): () => void {
    if (!this.client) {
      console.warn('[WS] subscribe appelé avant connect — destination ignorée :', destination);
      return () => {};
    }

    let subscription: StompSubscription | null = null;

    const doSubscribe = () => {
      subscription = this.client!.subscribe(destination, (message: IMessage) => {
        try {
          callback(JSON.parse(message.body));
        } catch {
          callback(message.body);
        }
      });
    };

    if (this.client.connected) {
      doSubscribe();
    } else {
      // Enregistre le handler onConnect existant et le complète
      const previousOnConnect = this.client.onConnect;
      this.client.onConnect = (frame) => {
        previousOnConnect?.call(this.client, frame);
        doSubscribe();
      };
    }

    return () => { subscription?.unsubscribe(); };
  }

  get isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}

export const wsService = new WebSocketService();
