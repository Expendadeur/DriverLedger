OBJECTIF

Tu es un architecte logiciel senior expert en Web3, Blockchain, Sécurité et Full-Stack.

Tu dois générer une application complète, fonctionnelle, prête à être exécutée, qui est une plateforme unique combinant :

1️⃣ Un système E-commerce entièrement on-chain
2️⃣ Un système de réservation de véhicules entièrement on-chain

La plateforme doit être conçue comme une solution entreprise avec gestion multi-rôles :

ADMIN

EMPLOYEE

CLIENT

⚠️ EXIGENCES CRITIQUES

TOUTES les transactions doivent passer par la blockchain.

Il ne doit pas y avoir :

Simulation

Paiement hors chaîne

Données critiques stockées uniquement en base

Logique métier principale hors smart contract

La blockchain est la source unique de vérité.

Le backend ne doit jamais remplacer la logique on-chain.

🔥 RÈGLES ABSOLUES

Aucun pseudo-code

Aucun exemple partiel

Aucun fichier manquant

Aucun “à compléter”

Aucun résumé théorique

Aucun commentaire vague

Code complet exécutable uniquement

Mobile First obligatoire

Responsive total

Production-ready

Sécurisé niveau entreprise

🧱 ARCHITECTURE GLOBALE

UNE SEULE application structurée en modules internes :

Platform
│
├── Module E-commerce (On-chain)
├── Module Booking (On-chain)
├── Module Auth & Roles
├── Dashboards (Admin / Employee / Client)
└── Blockchain Layer (Source de vérité)

🛒 MODULE 1 : E-COMMERCE 100% ON-CHAIN

Obligatoire :

Création produit via smart contract

Mise à jour produit via smart contract

Achat produit via smart contract

Paiement crypto natif

Décrémentation stock on-chain

Historique commandes stocké on-chain

Events blockchain détaillés

Mapping produits

Mapping commandes

Génération facture PDF après confirmation transaction

QR Code basé sur transaction hash

🚗 MODULE 2 : BOOKING VÉHICULES 100% ON-CHAIN

Obligatoire :

Création véhicule via smart contract

Mise à jour disponibilité via smart contract

Réservation via smart contract

Paiement crypto obligatoire

Gestion disponibilité on-chain

Mapping véhicules

Mapping réservations

Events blockchain détaillés

QR code généré depuis transaction hash

Validation réservation basée sur données blockchain

Génération facture PDF

👥 GESTION DES RÔLES (OBLIGATOIRE)

La plateforme doit inclure 3 rôles distincts :

👑 ADMIN

Gestion produits

Gestion véhicules

Gestion employés

Gestion clients

Retrait fonds smart contract

Accès statistiques globales

🧑‍💼 EMPLOYEE

Scanner QR Code

Valider réservations

Mettre statut commande

Voir réservations du jour

Gestion opérationnelle uniquement

🛍 CLIENT

Acheter produits

Réserver véhicules

Voir historique

Télécharger factures

Voir QR Code

La gestion des rôles doit être intégrée :

Soit via smart contract (mapping address → role)

Soit via backend + vérification ownership blockchain

🔗 SMART CONTRACTS OBLIGATOIRES

Le générateur doit créer :

Contract Marketplace

Contract Booking

Gestion des rôles

Utilisation OpenZeppelin

ReentrancyGuard

Ownable

Protection overflow (Solidity ^0.8)

Vérification msg.value

Withdraw sécurisé

Events détaillés

Tests Hardhat complets

Script deploy.js complet

hardhat.config.js complet

🖥 BACKEND (INDEXEUR & SERVICES)

Le backend ne doit PAS stocker les transactions comme source principale.

Il sert uniquement à :

Authentification JWT

Vérification signature wallet

Indexation des events blockchain

Cache PostgreSQL

Génération QR code

Génération PDF

Notifications push

Gestion sessions

Validation des rôles

Les données critiques doivent être lues depuis la blockchain.

🌐 FRONTEND

React + Vite

TailwindCSS

Mobile First

Responsive complet

Connexion MetaMask

Support WalletConnect

Interaction directe avec smart contracts via ethers.js

Dashboard séparé selon rôle

UX Web3 fluide

CLOUD

Firebase Cloud Messaging

Configuration complète

Service Worker configuré

Notification après confirmation transaction

WebSocket 

SÉCURITÉ OBLIGATOIRE

Inclure :

ReentrancyGuard

Validation ownership

Vérification msg.value

Rate limiting backend

Helmet

bcrypt

Vérification signature wallet

Expiration QR code

Middleware de protection routes

Gestion erreurs globale

STRUCTURE À FOURNIR

Obligatoire :

Structure dossiers complète

Tous les fichiers smart contracts

Tous les fichiers backend

Tous les fichiers frontend

Tests Hardhat

Scripts déploiement

.env

README complet

Configuration Hardhat

Configuration Prisma

Configuration PostgreSQL

Configuration Firebase

Aucun fichier manquant.


PRIORITÉ ABSOLUE

Tu dois générer :

UNE PLATEFORME ENTREPRISE RÉELLEMENT DÉCENTRALISÉE
100% BASÉE SUR LA BLOCKCHAIN
POUR E-COMMERCE ET BOOKING
AVEC GESTION MULTI-RÔLES

PAS UNE SIMULATION
PAS UN MOCK
PAS UN HYBRIDE CENTRALISÉ


La blockchain doit être la source unique de vérité pour toutes les transactions commerciales et réservations. Le backend ne doit jamais remplacer la logique on-chain.