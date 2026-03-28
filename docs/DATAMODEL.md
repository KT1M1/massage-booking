# Adatmodell

## Entitások

### 1. User (Felhasználó)
- `id`: string (UUID)
- `email`: string
- `password`: string (mock környezetben plain text)
- `firstName`: string
- `lastName`: string
- `phone?`: string
- `role`: `'customer' | 'professional'`

### 2. Service (Szolgáltatás)
- `id`: string (UUID)
- `name`: string (pl. `Svéd masszázs`)
- `description`: string
- `price`: number (HUF)
- `duration`: number (perc)
- `category`: string (pl. `Relaxációs`, `Sport`)
- `image?`: string

### 3. Professional (Szakember)
- `id`: string (UUID)
- `firstName`: string
- `lastName`: string
- `email`: string
- `phone`: string
- `specialties`: string[]
- `bio?`: string
- `image?`: string

### 4. Booking (Foglalás)
- `id`: string (UUID)
- `userId`: string (`User.id`)
- `serviceId`: string (`Service.id`)
- `professionalId`: string (`Professional.id`)
- `date`: Date
- `timeSlot`: string (pl. `10:00 - 11:00`)
- `timeSlotId?`: string (`TimeSlot.id`)
- `status`: `'pending' | 'confirmed' | 'cancelled'`
- `notes?`: string

### 5. TimeSlot (Időpont)
- `id`: string (UUID)
- `professionalId`: string (`Professional.id`)
- `date`: Date
- `startTime`: string (`HH:MM`)
- `endTime`: string (`HH:MM`)
- `available`: boolean

## Kapcsolatok

- **User -> Booking**: 1:N
- **Professional -> Booking**: 1:N
- **Service -> Booking**: 1:N
- **Professional -> TimeSlot**: 1:N
- **Booking -> TimeSlot**: 1:1 (a `timeSlotId` mezőn keresztül)

## Megvalósítási megjegyzés

A jelenlegi projektben az adatok mock szolgáltatásból érkeznek, a foglalások és idősávok állapota localStorage-ben perzisztálódik.
