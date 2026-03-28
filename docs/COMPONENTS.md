# Komponens-terv

## Jelenlegi komponensstruktúra

```text
AppComponent
├── HeaderComponent
└── RouterOutlet
    ├── HomeComponent
    ├── LoginComponent
    ├── RegisterComponent
    ├── ServiceDetailComponent
    ├── BookingComponent
    ├── ProfileComponent
    └── NotFoundComponent
```

## Oldalak és felelősségek

### Főoldal (`/`)
- **Komponens**: `HomeComponent`
- **Funkció**: szolgáltatások kiemelése, navigáció szolgáltatás részleteire

### Bejelentkezés (`/login`)
- **Komponens**: `LoginComponent`
- **Funkció**: bejelentkezési űrlap, kliensoldali hibajelzés

### Regisztráció (`/register`)
- **Komponens**: `RegisterComponent`
- **Funkció**: regisztrációs űrlap, mezővalidáció

### Szolgáltatás részletek (`/services/:id`)
- **Komponens**: `ServiceDetailComponent`
- **Funkció**: szolgáltatás részletes nézet + foglalás indítása

### Foglalás (`/booking`)
- **Komponens**: `BookingComponent`
- **Funkció**: szakember, dátum és időpont kiválasztása; foglalás mentése

### Profil (`/profile`)
- **Komponens**: `ProfileComponent`
- **Funkció**: saját foglalások listázása, lemondás

### 404 (`/not-found`)
- **Komponens**: `NotFoundComponent`
- **Funkció**: nem létező útvonal kezelése

## Keresztmetszeti elemek

### HeaderComponent
- Brand/logo
- Navigációs linkek
- Aktív menüpont jelölés

### Guard és szolgáltatások
- `AuthGuard`: védett route-ok
- `AuthService`: bejelentkezési állapot
- `BookingService`: foglalási folyamat műveletei
- `MockDataService`: mock adatok + localStorage perzisztencia

## Jövőbeli bővíthetőség (megtartható terv)

- A `BookingComponent` később bontható kisebb UI egységekre:
  - szakember-választó
  - dátumválasztó
  - idősáv-választó
  - foglalási összesítő

Ezek jelenleg egy oldalkomponensben vannak, de a felbontás logikailag később is megvalósítható.
