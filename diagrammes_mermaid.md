# Diagrammes Mermaid - Crypto Follow
Réalisé sur https://mermaid.live
## 1. Use Case Diagram
```mermaid
graph LR
    subgraph Actors
        User((Utilisateur))
        Admin((Administrateur))
        System((Système\nCron/Scheduler))
        CoinGeko((API CoinGeko))
    end

    subgraph "Crypto Follow App"
        UC1(S'inscrire / Se connecter)
        UC2(Consulter le Dashboard\nPrix, Graphiques)
        UC3(Rechercher / Filtrer Cryptos)
        UC4(Gérer Portefeuille Virtuel\nAchat/Vente)
        UC5(Configurer Alertes de Prix)
        UC6(Voir Prédictions IA)
        UC7(Gérer Utilisateurs)
        UC8(Collecter Données Marché)
        UC9(Envoyer Notifications)
    end

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6

    Admin --> UC1
    Admin --> UC7
    Admin --> UC2

    System --> UC8
    System --> UC9

    UC8 --> CoinGeko
    UC9 -.-> UC5
```

## 2. Class Diagram (Supabase)
```mermaid
classDiagram
    class Profiles {
        +UUID id (PK, FK auth.users)
        +String username
        +String role
        +Timestamp created_at
    }

    class CryptoAssets {
        +String symbol (PK)
        +String name
        +String coin_cap_id
    }

    class MarketData {
        +Integer id (PK)
        +String crypto_symbol (FK)
        +Float price_usd
        +Float volume_24h
        +Float market_cap
        +Timestamp timestamp
    }

    class Alerts {
        +Integer id (PK)
        +UUID user_id (FK)
        +String crypto_symbol (FK)
        +Float threshold_price
        +String condition (ABOVE/BELOW)
        +Boolean is_active
    }

    class PortfolioTransactions {
        +Integer id (PK)
        +UUID user_id (FK)
        +String crypto_symbol (FK)
        +String type (BUY/SELL)
        +Float amount
        +Float price_at_transaction
        +Timestamp created_at
    }

    class Predictions {
        +Integer id (PK)
        +String crypto_symbol (FK)
        +Float predicted_price
        +Timestamp prediction_date
        +String model_version
    }

    Profiles "1" -- "0..*" Alerts : crée
    Profiles "1" -- "0..*" PortfolioTransactions : effectue
    CryptoAssets "1" -- "0..*" MarketData : possède historique
    CryptoAssets "1" -- "0..*" Alerts : concerne
    CryptoAssets "1" -- "0..*" PortfolioTransactions : concerne
    CryptoAssets "1" -- "0..*" Predictions : a des
```

## 3. Sequence Diagrams
### Collecte de Données
```mermaid
sequenceDiagram
    participant Cron as Vercel Cron / GitHub Action
    participant API as Next.js API Route
    participant Ext as API CoinGeko
    participant DB as Supabase DB
    participant Notif as Service Notification

    Cron->>API: Trigger /api/cron/collect
    activate API
    API->>Ext: GET /assets
    activate Ext
    Ext-->>API: JSON (Liste Cryptos & Prix)
    deactivate Ext
    
    API->>DB: Upsert MarketData (Prix, Vol, Time)
    activate DB
    DB-->>API: Success
    deactivate DB

    API->>DB: Select Active Alerts
    activate DB
    DB-->>API: Liste Alertes
    deactivate DB

    loop Pour chaque alerte
        alt Condition remplie
            API->>Notif: Envoyer Email/Discord
        end
    end

    API-->>Cron: 200 OK
    deactivate API
```

### Connexion Utilisateur
```mermaid
sequenceDiagram
    participant Client as Navigateur (Next.js)
    participant Auth as Supabase Auth
    participant DB as Supabase DB

    Client->>Auth: Login (Email, Password)
    activate Auth
    Auth-->>Client: Session JWT
    deactivate Auth

    Client->>DB: Select * FROM MarketData (via Supabase Client)
    activate DB
    Note right of DB: RLS (Row Level Security) vérifie le JWT
    DB-->>Client: Données JSON
    deactivate DB

    Client->>Client: Rendu des Graphiques
```

## 4. Activity Diagram
```mermaid
stateDiagram-v2
    [*] --> Début
    Début --> FetchData : Requête API CoinGeko
    
    state FetchData {
        [*] --> AppelAPI
        AppelAPI --> Succès : 200 OK
        AppelAPI --> Échec : Erreur Réseau
        Échec --> Retry : Attendre 5s
        Retry --> AppelAPI
    }

    FetchData --> Traitement : Données reçues
    
    state Traitement {
        Parsing --> StockageDB : Sauvegarde PostgreSQL
        StockageDB --> VérifAlertes : Récupérer alertes actives
        
        state VérifAlertes {
            [*] --> CheckCondition
            CheckCondition --> Trigger : Seuil dépassé
            CheckCondition --> Ignore : Seuil non atteint
            Trigger --> SendNotif : Envoi Email
            SendNotif --> [*]
            Ignore --> [*]
        }
    }

    Traitement --> Fin
    Fin --> [*]
```

## 5. Deployment Diagram
```mermaid
graph TD
    subgraph "Client Side"
        Browser["Navigateur Web"]
    end

    subgraph "Vercel Platform (Serverless)"
        NextFront["Next.js Frontend\n(React Components)"]
        NextAPI["Next.js API Routes\n(Serverless Functions)"]
    end

    subgraph "Supabase (BaaS)"
        Auth["Auth Service\n(GoTrue)"]
        Postgres[("PostgreSQL DB")]
        Realtime["Realtime Engine"]
    end

    subgraph "External Services"
        CoinGeko["API CoinGeko"]
        SMTP["Service Email"]
    end

    Browser -- HTTPS --> NextFront
    Browser -- HTTPS / WebSocket --> Supabase
    NextFront -- API Calls --> NextAPI
    NextAPI -- SQL / REST --> Postgres
    NextAPI -- HTTPS --> CoinGeko
    NextAPI -- SMTP --> SMTP
    
    Auth -- gère --> Postgres
```
