## 📋 Prérequis Système

Avant de commencer, assurez-vous d'avoir installé :

1.  **Node.js (v20+)** : [Télécharger ici](https://nodejs.org/) (Recommandé pour Hardhat 3)
2.  **PostgreSQL** : Une base de données locale ou distante.
3.  **Prisma 6** : Le projet utilise Prisma 6 pour une meilleure compatibilité des configurations.
4.  **MetaMask** : Extension de navigateur.
5.  **Hardhat 3** : Déjà configuré dans le projet.

---

## 🚀 Étape 1 : Configuration de la Blockchain (Hardhat 3)

Nous utilisons la version 3 de Hardhat pour une performance optimale.

1.  Ouvrez un terminal dans le dossier `blockchain/`.
2.  Installez les dépendances :
    ```bash
    npm install
    ```
3.  Lancez le noeud local Hardhat (laissez ce terminal ouvert) :
    ```bash
    npx hardhat node
    ```
    > [!NOTE]
    > Le fichier `hardhat.config.js` est configuré avec `type: "edr-simulated"` pour assurer la compatibilité avec Hardhat 3.

4.  Dans un **nouveau terminal** (toujours dans `blockchain/`), déployez les contrats :
    ```bash
    npx hardhat run scripts/deploy.js --network localhost
    ```
    > [!IMPORTANT]
    > Notez les adresses des contrats affichées dans le terminal (AccessControl, Marketplace, Booking). Vous en aurez besoin pour le backend.

---

## ⚙️ Étape 2 : Configuration du Backend (Express & Prisma)

Le backend sert d'indexeur et gère l'authentification.

1.  Allez dans le dossier `backend/`.
2.  Installez les dépendances :
    ```bash
    npm install
    ```
3.  Configurez le fichier `.env` :
    *   Ouvrez `backend/.env`.
    *   Remplacez `DATABASE_URL` par votre lien de connexion PostgreSQL.
    *   Collez les adresses des contrats récupérées à l'étape 1.
4.  Initialisez la base de données avec Prisma :
    ```bash
    npx prisma db push
    ```
5.  Lancez le serveur :
    ```bash
    node server.js
    ```

---

## 💻 Étape 3 : Configuration du Frontend (React & Vite)

L'interface utilisateur premium.

1.  Allez dans le dossier `frontend/`.
2.  Installez les dépendances :
    ```bash
    npm install
    ```
3.  Configurez les adresses des contrats dans le code :
    *   Ouvrez `frontend/src/services/contracts.js`.
    *   Assurez-vous que `CONTRACT_ADDRESSES` contient les bonnes adresses du déploiement.
4.  Lancez l'application en mode développement :
    ```bash
    npm run dev
    ```
5.  Ouvrez l'URL affichée (généralement `http://localhost:5173`).

---

## 🦊 Étape 4 : Configuration de MetaMask

Pour interagir avec votre blockchain locale, vous devez configurer MetaMask.

### A. Ajouter le Réseau Hardhat
1.  Ouvrez MetaMask et cliquez sur le sélecteur de réseau (en haut à gauche).
2.  Cliquez sur **"Ajouter un réseau"** > **"Ajouter un réseau manuellement"**.
3.  Remplissez avec ces informations :
    -   **Nom du réseau** : `Hardhat Local`
    -   **Nouvelle URL RPC** : `http://127.0.0.1:8545`
    -   **ID de chaîne** : `31337` (C'est l'ID par défaut de Hardhat)
    -   **Symbole de la devise** : `ETH`
4.  Cliquez sur **Enregistrer**.

### B. Importer un Compte de Test (Riche en ETH)
1.  Dans MetaMask, cliquez sur l'icône de votre profil (cercle coloré en haut à droite).
2.  Sélectionnez **"Importer le compte"**.
3.  Copiez la **Private Key** de l'Account #0 affichée dans votre terminal :
    `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
4.  Collez-la dans le champ "Chaîne de clé privée" et cliquez sur **Importer**.
5.  Vous devriez maintenant voir un solde de **10 000 ETH** !

---

## ✅ Utilisation de la Plateforme

-   **Admin** : Le compte #0 (`0xf39f...`) est l'Admin par défaut car il déploie les contrats.
-   **Client** : Vous pouvez importer le compte #1 pour tester en tant que client.
-   **Employé** : Utilisez le scanner avec un compte autorisé par l'Admin.
