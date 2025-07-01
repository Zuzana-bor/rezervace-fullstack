# Kosmetika Rezervace – Fullstack aplikace

Moderní rezervační systém pro kosmetické služby. Postaveno na stacku React + Node.js (Express) + MongoDB.

---

## Funkce

- Registrace a přihlášení uživatele (JWT autentizace)
- Vytváření a správa rezervací (propojeno s uživatelem)
- Okamžité zobrazení rezervací po vytvoření
- Ochrana citlivých stránek (pouze pro přihlášené)
- Moderní UI (Material UI)

---

## Struktura projektu

```
kosmetika-rezervace/
  client/   # React frontend
  server/   # Express backend
```

### Backend (`server/`)

- `src/index.ts` – start serveru, připojení k DB, registrace rout
- `src/models/User.ts` – schéma uživatele
- `src/models/Appointments.ts` – schéma rezervace
- `src/routes/auth.ts` – registrace, login, JWT
- `src/routes/appointments.ts` – CRUD rezervací
- `src/middleware/auth.ts` – ověření JWT

### Frontend (`client/`)

- `src/pages/Profile.tsx` – hlavní stránka uživatele
- `src/components/MyAppointments.tsx` – výpis rezervací
- `src/components/NewAppointment.tsx` – formulář pro novou rezervaci
- `src/context/AuthContext.tsx` – správa přihlášení a tokenu
- `src/api/appointments.ts` – komunikace s backendem

---

## Jak spustit projekt

### 1. MongoDB

- Spusťte lokální MongoDB nebo použijte MongoDB Atlas.
- Vytvořte soubor `.env` v `server/` a nastavte proměnné:
  ```
  MONGO_URI=mongodb://localhost:27017/rezervace
  JWT_SECRET=něco_tajného
  ```

### 2. Backend

```bash
cd server
npm install
npm run dev
```

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

Frontend poběží na http://localhost:5173, backend na http://localhost:5000.

---

## Uživatelské scénáře

- **Registrace:** Vyplňte jméno, email, heslo. Po registraci jste automaticky přihlášeni.
- **Přihlášení:** Zadejte email a heslo. Po přihlášení můžete spravovat své rezervace.
- **Nová rezervace:** Vyberte službu a datum, odešlete formulář. Rezervace se ihned zobrazí v seznamu.
- **Odhlášení:** Klikněte na tlačítko Odhlásit se.

---

## Technologie

- **Frontend:** React, TypeScript, Material UI, Axios
- **Backend:** Node.js, Express, TypeScript, JWT, Mongoose
- **DB:** MongoDB

---

## Vývojářské tipy

- Pro úpravy backendu sledujte logy v terminálu.
- Pro úpravy frontendu používejte React DevTools.
- Pro správu dat použijte MongoDB Compass.

---

## Autor

- Vytvořeno pro studijní účely. Moderní fullstack architektura.
