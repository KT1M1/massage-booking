# Receptgyűjtemény

**Webes alkalmazás specifikáció**
**Programrendszerek fejlesztése gyakorlat**
**MEAN Stack – Demonstrációs projekt**
**2026. tavasz**

---

## 1. Bevezetés

A Receptgyűjtemény egy MEAN stack alapú webes alkalmazás, amely lehetővé teszi receptek létrehozását, böngészését és értékelését. A projekt célja a kurzus során tanult technológiák demonstrálása egy egyszerű, de teljes értékű CRUD rendszeren keresztül.

A rendszer két szerepkört különböztet meg: adminisztrátor és felhasználó. Az admin előre regisztrálva van, a felhasználók pedig a regisztrációs felületen keresztül hozhatnak létre fiókot.

### 1.1. Technológiai stack

- **MongoDB** – NoSQL adatbázis
- **Express.js** – Szerver oldali keretrendszer
- **Angular** – Kliens oldali keretrendszer
- **Node.js** – Futási környezet

---

## 2. Szerepkörök

### 2.1. Adminisztrátor

Az admin előre regisztrált fiókkal rendelkezik (seed adat). Jogosultságai:

- Kategóriák létrehozása, módosítása és törlése
- Receptek létrehozása, módosítása és törlése
- Összes értékelés megtekintése és moderálása (törlés)

### 2.2. Felhasználó

A felhasználó a regisztrációs felületen keresztül hozhat létre fiókot. Jogosultságai:

- Receptek böngészése és részleteinek megtekintése
- Értékelés írása receptekhez
- Saját értékeléseinek módosítása és törlése
- Receptek szűrése kategória szerint

---

## 3. Funkcionális követelmények

1. A felhasználó regisztrálhat az alkalmazásba felhasználónév, e-mail és jelszó megadásával.
2. A felhasználó bejelentkezhet az e-mail és jelszó párosával, sikeres bejelentkezés után JWT tokent kap.
3. Az admin kategóriákat hozhat létre, módosíthat és törölhet.
4. Az admin recepteket hozhat létre hozzávalókkal együtt, módosíthatja és törölheti azokat.
5. A bejelentkezett felhasználó értékelést írhat receptekhez (1–5 pontszám + opcionális komment).
6. A felhasználó módosíthatja és törölheti a saját értékeléseit.
7. Bárki (bejelentkezés nélkül is) böngészheti a recepteket és szűrhet kategória szerint.
8. A recept részletei oldalon megjeleníthetőek a hozzávalók és az értékelések.
9. Az adatbázis demo adatokat tartalmaz (legalább 3 kategória, 5 recept, hozzávalókkal).

---

## 4. Nem-funkcionális követelmények

1. A jelszó tárolás bcrypt hash-sel történik.
2. JWT alapú autentikáció, token lejárati idővel.
3. Role-based hozzáférés-vezérlés middleware-rel megvalósítva.
4. CORS konfiguráció a kliens-szerver kommunikációhoz.
5. Hibakezelés: a szerver értelmes HTTP státuszkodokat és hibaüzeneteket ad vissza.
6. Reszponzív felhasználói felület Angular Material komponensekkel.

---

## 5. Kliens oldali nézetek

Az Angular alkalmazás az alábbi fő nézeteket (oldalakat) tartalmazza:

### 5.1. Nyilvános nézetek

- **Kezdőlap** – Receptek listája, kategória szűrővel
- **Recept részletek** – Leírás, hozzávalók, értékelések
- **Bejelentkezés** – E-mail és jelszó megadása
- **Regisztráció** – Új fiók létrehozása

### 5.2. Bejelentkezett felhasználói nézetek

- **Értékelés írása / módosítása** – Pontszám és komment űrlap

### 5.3. Admin nézetek

- **Kategória kezelés** – CRUD műveletek kategóriákra
- **Recept kezelés** – CRUD műveletek receptekre és hozzávalókra
- **Értékelés moderálás** – Értékelések áttekintése és törlése

---

## 6. Telepítés és futtatás

A rendszer minden komponense konténerizált formában lesz üzemeltetve. A rendszer futtatásához szükséges előfeltételek:

- Node.js (v24)
- MongoDB (lokális)
- Angular CLI (v21)

---

## 7. Mappaszerkezet

A GitHub repository várt struktúrája:

| Mappa / Fájl | Leírás |
|---|---|
| `/server` | Express.js szerver forráskód |
| `/client` | Angular alkalmazás forráskód |
| `/docs` | Dokumentáció (ez a specifikáció is) |
| `/prompts` | AI prompt-ok és elemzés |
| `README.md` | Telepítési útmutató |
