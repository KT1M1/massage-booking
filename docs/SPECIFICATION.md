# Masszázs Időpontfoglaló Webalkalmazás

**Webes alkalmazás specifikáció**  
**Angular alapú időpontfoglaló rendszer**  
**2026. tavasz**

---

## 1. Bevezetés

A Masszázs Időpontfoglaló egy Angular alapú webes alkalmazás, amely lehetővé teszi masszázs szolgáltatások böngészését, szakemberek kiválasztását és időpontfoglalást.

A rendszer két fő szerepkört különböztet meg:
- `customer` (vendég/felhasználó)
- `professional` (szakember/masszőr)

Jelenlegi állapotban a hangsúly a kliensoldali működésen van, mock adatokkal és localStorage perzisztenciával.

---

## 2. Technológiai stack

- **Angular** - kliens oldali keretrendszer
- **TypeScript** - programozási nyelv
- **SCSS** - stílusozás
- **Angular Material** - dátumválasztó komponens
- **Flaticon UIcons** - ikonok
- **MockDataService + localStorage** - jelenlegi adatkezelés

Megjegyzés: valódi backend (pl. Supabase) később beköthető, de jelenleg nincs aktív backend integráció.

---

## 3. Funkcionális követelmények

1. A felhasználó regisztrálhat (UI + kliensoldali validáció).
2. A felhasználó bejelentkezhet e-mail/jelszó párossal (mock autentikáció).
3. A főoldalon szolgáltatások listázása történik névvel, leírással, időtartammal és árral.
4. A szolgáltatás részleteinél elérhető a foglalás indítása.
5. A foglalási oldalon választható szakember, dátum és időpont.
6. A foglalás dátuma csak holnaptól érvényes.
7. Sikeres foglalás után a profil oldalon megjelenik a foglalás.
8. A foglalás profil oldalon lemondható.
9. Védett oldalak (`/services/:id`, `/booking`, `/profile`) csak bejelentkezve érhetők el.
10. Nem létező útvonal esetén 404 oldal jelenik meg.

---

## 4. Nem-funkcionális követelmények

- **Reszponzivitás**: mobil, tablet, desktop támogatás
- **Akadálymentesség**: szemantikus HTML, olvasható kontrasztok, használható űrlapmezők
- **Felhasználói élmény**: konzisztens UI, egyértelmű foglalási folyamat
- **Adatkezelés**: foglalások és időpontfoglaltság localStorage-ben tárolva

---

## 5. Útvonalak / Sitemap

- `/` - Főoldal
- `/login` - Bejelentkezés
- `/register` - Regisztráció
- `/services/:id` - Szolgáltatás részletei
- `/booking?serviceId=...` - Foglalás
- `/profile` - Profilom
- `/not-found` - 404 oldal
- `**` -> átirányítás `/not-found` oldalra

---

## 6. Navigáció

A fejléc fő elemei:
- Főoldal
- Profilom (bejelentkezett állapotban)
- Bejelentkezés / Regisztráció
- Kijelentkezés

A rendszer route guardot használ a védett oldalakhoz.
