-- =====================================================
-- Schéma initial Giftly
-- =====================================================

-- Utilisateurs
CREATE TABLE users (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),                          -- nullable : compte OAuth2 sans mot de passe
    name          VARCHAR(100) NOT NULL,
    avatar_url    VARCHAR(500),
    plan          ENUM('FREE', 'PREMIUM') NOT NULL DEFAULT 'FREE',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Comptes OAuth2 liés à un utilisateur (Google, etc.)
CREATE TABLE oauth_accounts (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    provider    VARCHAR(50) NOT NULL,                    -- ex: "google"
    provider_id VARCHAR(255) NOT NULL,                   -- id retourné par le provider
    UNIQUE KEY uq_provider_account (provider, provider_id),
    CONSTRAINT fk_oauth_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Événements cadeaux (Noël, anniversaire, etc.)
CREATE TABLE events (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    type           ENUM('CHRISTMAS', 'BIRTHDAY', 'OTHER') NOT NULL DEFAULT 'OTHER',
    event_date     DATE,
    created_by     BIGINT NOT NULL,
    is_active      TINYINT(1) NOT NULL DEFAULT 1,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_event_creator FOREIGN KEY (created_by) REFERENCES users (id)
);

-- Participants à un événement
CREATE TABLE event_participants (
    event_id   BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    role       ENUM('ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    joined_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, user_id),
    CONSTRAINT fk_participant_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    CONSTRAINT fk_participant_user  FOREIGN KEY (user_id)  REFERENCES users (id)  ON DELETE CASCADE
);

-- Liste de souhaits (une par utilisateur par événement)
CREATE TABLE wish_lists (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id   BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_list_per_user_event (event_id, user_id),
    CONSTRAINT fk_list_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    CONSTRAINT fk_list_user  FOREIGN KEY (user_id)  REFERENCES users (id)  ON DELETE CASCADE
);

-- Souhaits dans une liste
CREATE TABLE wish_items (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    list_id     BIGINT NOT NULL,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    url         VARCHAR(1000),
    price       DECIMAL(10, 2),
    image_url   VARCHAR(1000),
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_item_list FOREIGN KEY (list_id) REFERENCES wish_lists (id) ON DELETE CASCADE
);

-- Réservations de cadeaux
-- Règle : jamais retournées à l'appelant si celui-ci est propriétaire de la liste
CREATE TABLE reservations (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id     BIGINT NOT NULL UNIQUE,                  -- un item ne peut être réservé qu'une fois
    reserved_by BIGINT NOT NULL,
    reserved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reservation_item FOREIGN KEY (item_id)     REFERENCES wish_items (id) ON DELETE CASCADE,
    CONSTRAINT fk_reservation_user FOREIGN KEY (reserved_by) REFERENCES users (id)      ON DELETE CASCADE
);

-- Invitations à rejoindre un événement
CREATE TABLE invitations (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id   BIGINT NOT NULL,
    code       VARCHAR(10) NOT NULL UNIQUE,              -- code court ex: "NOEL25"
    email      VARCHAR(255),                             -- null si invitation par lien générique
    expires_at DATETIME NOT NULL,
    used_at    DATETIME,                                 -- null si pas encore utilisée
    CONSTRAINT fk_invitation_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_events_created_by   ON events (created_by, is_active);
CREATE INDEX idx_wish_items_list     ON wish_items (list_id);
CREATE INDEX idx_reservations_item   ON reservations (item_id);
CREATE INDEX idx_invitations_code    ON invitations (code);
CREATE INDEX idx_invitations_event   ON invitations (event_id);
