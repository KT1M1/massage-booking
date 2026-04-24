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

## 4) Supabase auth bekötése
- Dátum: 2026-04-24
- Cél: A mock bejelentkezés lecserélése valós Supabase autentikációra.
- Prompt: "A régi mock auth helyett Supabase bejelentkezést és kijelentkezést szeretnék, a meglévő Angular felülettel."
- AI javaslat: `SupabaseService` létrehozása, `AuthService` átírása session alapú működésre.
- Döntésem: Elfogadtam.
- Eredmény: A login és logout már a Supabase authot használja, a route guard is ehhez igazodik.

## 5) Elérhető időpontok számítása munkaidő alapján
- Dátum: 2026-04-24
- Cél: A választható időpontok dinamikusan számolódjanak a munkaidő, ebédszünet, szabadság és foglalások alapján.
- Prompt: "A working_hours, time_off, blocked_slots és bookings alapján generálj foglalható időpontokat."
- AI javaslat: 30 perces léptetésű időpontgenerálás, ütközésvizsgálattal.
- Döntésem: Elfogadtam.
- Eredmény: A felület csak a ténylegesen szabad időpontokat mutatja.

## 6) Profilkép adatbázisból szakemberhez
- Dátum: 2026-04-24
- Cél: A szakemberek képei ne beégetett frontend mappingből, hanem adatbázisból jöjjenek.
- Prompt: "Az adminhoz kapcsolódjon profilkép, és a foglaláskor ez jelenjen meg."
- AI javaslat: `profile_image_url` mező hozzáadása az `admins` táblához és frontend lekérdezés bővítése.
- Döntésem: Elfogadtam.
- Eredmény: A foglalási oldalon a szakember képe már adatbázisból töltődik.

## 7) Szolgáltatáslista keresővel és rendezéssel
- Dátum: 2026-04-24
- Cél: A főoldali szolgáltatáslista kereshető és rendezhető legyen.
- Prompt: "A szolgáltatások blokkban lehessen név szerint keresni, illetve ár és idő szerint rendezni."
- AI javaslat: Keresőmező + rendező select + szűrt lista computed logikával.
- Döntésem: Elfogadtam.
- Eredmény: A főoldalon a szolgáltatások között lehet keresni és többféleképp rendezni.

## 8) AI hibája: hibás magyar szövegek és ékezetek
- Dátum: 2026-04-24
- Cél: A felhasználói szövegek helyes magyar nyelvűek legyenek.
- Prompt: "Javítsd a státuszokat és üzeneteket."
- AI javaslat: Több helyen ékezet nélküli vagy hibás kódolású szövegek maradtak, például `Fuggoben`.
- Döntésem: Javítást kértem.
- Mit javítottam: Jeleztem, hogy UTF-8-as, helyes magyar szövegek kellenek minden felületen.
- Eredmény: A státuszok és visszajelzések helyesen, magyar ékezetekkel jelennek meg.

## 9) AI hibája: a profilkártyán rossz kép jelent meg
- Dátum: 2026-04-24
- Cél: A profil oldali foglaláskártyán a szolgáltatás képe jelenjen meg.
- Prompt: "A foglaláskártya vizuálisan jobban kapcsolódjon a szolgáltatáshoz."
- AI javaslat: Először a szakember profilképe maradt a kártyán.
- Döntésem: Módosítást kértem.
- Mit javítottam: Kértem, hogy a kártya a lefoglalt szolgáltatás képét használja.
- Eredmény: A profil oldalon a foglaláskártya már a szolgáltatás vizuális azonosítóját mutatja.

## 10) AI hibája: nem adott elég visszajelzést üres állapotban
- Dátum: 2026-04-24
- Cél: A foglalási oldal legyen érthető akkor is, ha nincs választható időpont.
- Prompt: "Dátum választás után jelenjen meg az óraválasztó."
- AI javaslat: Technikailag helyes volt, de ha nem volt időpont, a felület nem adott egyértelmű üzenetet.
- Döntésem: Kiegészítést kértem.
- Mit javítottam: Kértem külön `Nincs szabad időpont` állapotot.
- Eredmény: A felhasználó most már nem marad magyarázat nélkül.
