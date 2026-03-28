# AI Prompt Napló

## 1) Foglalás mentése profilhoz
- Dátum: 2026-03-28
- Cél: A lefoglalt időpont mentése és visszanézhetősége a profil oldalon
- Prompt: "Tároljuk lokálisan a foglalt időpontot, és a felhasználó meg tudja tekinteni a saját profiljában a foglalását."
- AI javaslat: `localStorage` alapú mentés a booking és timeslot adatokhoz, profil oldali listázással.
- Döntésem: Elfogadtam.
- Eredmény: A foglalás mentődik, profilból visszanézhető, a kiválasztott idősáv foglalttá válik.

## 2) Dátum validáció szigorítása
- Dátum: 2026-03-28
- Cél: Ne lehessen múltbeli vagy túl korai dátumra foglalni
- Prompt: "A holnapi napnál korábbi időpontot semmiképp ne fogadja el az időpontfoglaló."
- AI javaslat: Datepicker `minDate` + submit oldali extra validáció.
- Döntésem: Módosítást kértem.
- Mit kértem: Kézi beviteli mezős beírásnál is ellenőrzött legyen, ne csak picker választásnál.
- Eredmény: Kézi dátumbevitel is megfelelően ellenőrzött, csak érvényes és holnaptól kezdődő dátum fogadható el.

## 3) Bejelentkezés oldal vizuális blokk
- Dátum: 2026-03-28
- Cél: A `login-visual` oszlop a login kártya szerves folytatása legyen
- Prompt: "A képet tartalmazó rész oszlop érjen össze a login-carddal, mintha annak kiegészítése lenne."
- AI javaslat: Kétoszlopos grid, desktopon nullás gap, közös konténer lekerekítés.
- Döntésem: Elfogadtam.
- Módosítási kérésem: A regisztrációs oldal is nézzen ki ugyanígy.
- Eredmény: Login és regisztráció oldalon egységes, összeérő card + visual elrendezés.