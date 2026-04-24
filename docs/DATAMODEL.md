# Adatmodell — Masszázs Időpont Foglalási Alkalmazás

## Entitások (Supabase/PostgreSQL)

### 1. **Profiles** (Felhasználók)

Az alkalmazás összes felhasználóját tároljuk itt. Az `id` az `auth.users`-ből származik.

| Mező         | Típus       | Leírás                               |
| ------------ | ----------- | ------------------------------------ |
| `id`         | UUID        | Elsődleges kulcs (Supabase Auth UID) |
| `email`      | TEXT        | E-mail cím (egyedi)                  |
| `full_name`  | TEXT        | Teljes név                           |
| `phone`      | TEXT        | Telefonszám                          |
| `role`       | ENUM        | `'client'`, `'admin'`                |
| `is_active`  | BOOLEAN     | Aktív-e a felhasználó                |
| `created_at` | TIMESTAMPTZ | Létrehozás dátuma                    |
| `updated_at` | TIMESTAMPTZ | Módosítás dátuma                     |

> Megjegyzés: az `admin` szerepkör jelenti a masszőr szakembert. Nincs külön `therapist` szerepkör, és nincs harmadik, rendszer-adminisztrátori role.

---

### 2. **Admins** (Masszőr szakemberek)

Az admin, vagyis a masszőr szakember specifikus adatait tárolja.
Ez a korábbi `Therapists` entitás átnevezett és egyszerűsített megfelelője.

| Mező                    | Típus       | Leírás                       |
| ----------------------- | ----------- | ---------------------------- |
| `id`                    | UUID        | Elsődleges kulcs             |
| `profile_id`            | UUID        | Referencia Profiles-ra (1:1) |
| `bio`                   | TEXT        | Masszőr szakember bemutatása |
| `experience_years`      | INTEGER     | Tapasztalat években          |
| `is_accepting_bookings` | BOOLEAN     | Fogad-e új foglalásokat      |
| `created_at`            | TIMESTAMPTZ | Regisztráció dátuma          |
| `updated_at`            | TIMESTAMPTZ | Módosítás dátuma             |

---

### 3. **Services** (Szolgáltatások)

Masszázs típusok és szolgáltatások globális listája.

| Mező               | Típus       | Leírás                                                 |
| ------------------ | ----------- | ------------------------------------------------------ |
| `id`               | UUID        | Elsődleges kulcs                                       |
| `name`             | TEXT        | Szolgáltatás neve, például „Svéd masszázs”             |
| `description`      | TEXT        | Leírás                                                 |
| `category`         | ENUM        | `'relaxation'`, `'therapeutic'`, `'sports'`, `'other'` |
| `duration_minutes` | INTEGER     | Alapértelmezett időtartam percben                      |
| `price_huf`        | INTEGER     | Alapértelmezett ár HUF-ban                             |
| `is_active`        | BOOLEAN     | Aktív-e a szolgáltatás                                 |
| `created_at`       | TIMESTAMPTZ | Létrehozás                                             |
| `updated_at`       | TIMESTAMPTZ | Módosítás                                              |

---

### 4. **Admin_Services** (Masszőr-Szolgáltatás Kapcsolat)

Melyik admin, vagyis masszőr szakember milyen szolgáltatást végez.
Opcionálisan egyedi ár és időtartam is megadható.

| Mező                      | Típus       | Leírás                                           |
| ------------------------- | ----------- | ------------------------------------------------ |
| `id`                      | UUID        | Elsődleges kulcs                                 |
| `admin_id`                | UUID        | Admin / masszőr szakember referencia (N:1)       |
| `service_id`              | UUID        | Szolgáltatás referencia (N:1)                    |
| `custom_price_huf`        | INTEGER     | Egyedi ár opcionálisan                           |
| `custom_duration_minutes` | INTEGER     | Egyedi időtartam opcionálisan                    |
| `is_active`               | BOOLEAN     | Elérhető-e ez a szolgáltatás az adott masszőrnél |
| `created_at`              | TIMESTAMPTZ | Létrehozás                                       |

---

### 5. **Working_Hours** (Heti Munkaidő)

Admin, vagyis masszőr szakember fix heti munkaideje.

| Mező             | Típus       | Leírás                                     |
| ---------------- | ----------- | ------------------------------------------ |
| `id`             | UUID        | Elsődleges kulcs                           |
| `admin_id`       | UUID        | Admin / masszőr szakember referencia (N:1) |
| `day_of_week`    | INTEGER     | 0=vasárnap, 1=hétfő, ..., 6=szombat        |
| `start_time`     | TIME        | Munkaidő kezdete, például 09:00            |
| `end_time`       | TIME        | Munkaidő vége, például 17:00               |
| `is_working_day` | BOOLEAN     | Dolgozik-e ezen a napon                    |
| `created_at`     | TIMESTAMPTZ | Létrehozás                                 |
| `updated_at`     | TIMESTAMPTZ | Módosítás                                  |

---

### 6. **Time_Off** (Szabadság/Kimaradás)

Admin, vagyis masszőr szakember által bejelentett szabadság, betegszabadság vagy egyedi kimaradás.

| Mező         | Típus       | Leírás                                                |
| ------------ | ----------- | ----------------------------------------------------- |
| `id`         | UUID        | Elsődleges kulcs                                      |
| `admin_id`   | UUID        | Admin / masszőr szakember referencia (N:1)            |
| `type`       | ENUM        | `'vacation'`, `'sick_leave'`, `'holiday'`, `'custom'` |
| `title`      | TEXT        | Cím, például „Beteg” vagy „Nyaralás”                  |
| `reason`     | TEXT        | Indoklás opcionálisan                                 |
| `start_at`   | TIMESTAMPTZ | Kezdés időpontja                                      |
| `end_at`     | TIMESTAMPTZ | Befejezés időpontja                                   |
| `created_at` | TIMESTAMPTZ | Létrehozás                                            |
| `updated_at` | TIMESTAMPTZ | Módosítás                                             |

---

### 7. **Bookings** (Foglalások)

Az alkalmazás központi objektuma: az ügyfél által foglalt időpontok.

| Mező                      | Típus       | Leírás                                                   |
| ------------------------- | ----------- | -------------------------------------------------------- |
| `id`                      | UUID        | Elsődleges kulcs                                         |
| `client_id`               | UUID        | Ügyfél referencia (Profiles, N:1)                        |
| `admin_id`                | UUID        | Admin / masszőr szakember referencia (N:1)               |
| `service_id`              | UUID        | Szolgáltatás referencia (N:1)                            |
| `status`                  | ENUM        | `'pending'`, `'confirmed'`, `'completed'`, `'cancelled'` |
| `starts_at`               | TIMESTAMPTZ | Foglalás kezdése                                         |
| `ends_at`                 | TIMESTAMPTZ | Foglalás vége                                            |
| `client_note`             | TEXT        | Ügyfél megjegyzése                                       |
| `admin_note`              | TEXT        | Admin / masszőr szakember megjegyzése                    |
| `booked_price_huf`        | INTEGER     | Rögzített ár HUF-ban                                     |
| `booked_duration_minutes` | INTEGER     | Rögzített időtartam                                      |
| `created_at`              | TIMESTAMPTZ | Foglalás dátuma                                          |
| `updated_at`              | TIMESTAMPTZ | Módosítás dátuma                                         |

---

### 8. **Reviews** (Értékelések)

Ügyfél által adott értékelések a masszőr szakember munkájáról.

| Mező          | Típus       | Leírás                                              |
| ------------- | ----------- | --------------------------------------------------- |
| `id`          | UUID        | Elsődleges kulcs                                    |
| `booking_id`  | UUID        | Referencia Bookings-ra (1:1)                        |
| `reviewer_id` | UUID        | Értékelő ügyfél (Profiles referencia)               |
| `admin_id`    | UUID        | Értékelt admin / masszőr szakember referencia (N:1) |
| `rating`      | INTEGER     | Értékelés 1-5 között                                |
| `comment`     | TEXT        | Szöveges értékelés                                  |
| `created_at`  | TIMESTAMPTZ | Értékelés dátuma                                    |

---

### 9. **Blocked_Slots** (Opcionális — Zárolt Időpontok)

Admin, vagyis masszőr szakember által manuálisan zárolt időpontok.

| Mező         | Típus       | Leírás                                     |
| ------------ | ----------- | ------------------------------------------ |
| `id`         | UUID        | Elsődleges kulcs                           |
| `admin_id`   | UUID        | Admin / masszőr szakember referencia (N:1) |
| `title`      | TEXT        | Ok, például „Ebéd” vagy „Tisztítás”        |
| `start_at`   | TIMESTAMPTZ | Kezdés                                     |
| `end_at`     | TIMESTAMPTZ | Befejezés                                  |
| `created_at` | TIMESTAMPTZ | Létrehozás                                 |
| `updated_at` | TIMESTAMPTZ | Módosítás                                  |

---

## Relációs Diagram

```text
Profiles (1) ──────── (N) Bookings
  │                        │
  │                        ├─ Admins (N:1)
  │                        ├─ Services (N:1)
  │                        └─ Reviews
  │
  ├─ Admins (1:1 profile_id)
  │    ├─ (1) ────── (N) Admin_Services
  │    ├─ (1) ────── (N) Working_Hours
  │    ├─ (1) ────── (N) Time_Off
  │    ├─ (1) ────── (N) Bookings
  │    └─ (1) ────── (N) Blocked_Slots
  │
  └─ (1) ──────── (N) Reviews

Services (1) ──────── (N) Admin_Services ──────── (1) Admins
Services (1) ──────── (N) Bookings
```

---

## Felhasználói Szerepkörök

### 1. **Client (Ügyfél)**

* Regisztrálhat és bejelentkezhet
* Láthatja az admin / masszőr szakember profilját, a szolgáltatásokat és az értékeléseket
* Foglalhat időpontot
* Módosíthatja vagy törölheti saját függőben lévő foglalásait
* Értékelheti a befejezett foglalásokat
* Tekintheti saját foglalásait

### 2. **Admin (Masszőr szakember)**

* Kliens jogokkal is rendelkezhet
* Definiálhat heti munkaidőt (Working_Hours)
* Bejelenthet szabadságot vagy kimaradást (Time_Off)
* Láthatja saját foglalásait
* Módosíthatja a foglalások státuszát
* Zárolt időpontokat hozhat létre (Blocked_Slots)
* Kezelheti a saját szolgáltatásait, árait és elérhetőségét

---
