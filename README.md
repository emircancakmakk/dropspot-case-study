DropSpot – Sınırlı Stok ve Bekleme Listesi Platformu

Başlangıç Zamanı (UTC): 2025-11-04 04:47

## Proje Özeti

DropSpot, sınırlı stokla yayınlanan ürünler/etkinlikler için adil ve ölçeklenebilir bir bekleme listesi ve “claim” akışı sunar. Kullanıcılar kayıt olur, aktif drop’lara katılır, claim penceresi açıldığında sırayla hak kazanır ve tek-seferlik claim kodu ile ilerler. Admin paneli üzerinden drop CRUD işlemleri yapılır.


## Mimari

- Monorepo: `apps/backend` (Fastify + Prisma + PostgreSQL), `apps/web` (Next.js)
- DB: PostgreSQL (Docker Compose ile)
- Kimlik Doğrulama: JWT
- Idempotency ve Adalet:
  - Unique constraint ve transaction kullanımı
  - Claim sırasında satır kilidi yerine atomik koşullu UPDATE (`WHERE claimed=false`) kullanımı
  - Tekil `claimCode` üretimi ve idempotent yanıt garantisi

- Not: `markClaimedIfNot` fonksiyonu `updateMany({ where: { claimed: false } })`
kullanarak atomic check-and-update uygular. Bu desen PostgreSQL’de row-level lock gerektirmez.

Klasörler:

- `apps/backend/src/modules/*`: auth, drops, claim
- `apps/backend/src/shared/priority.ts`: seed tabanlı öncelik puanı
- `apps/web/app/*`: kullanıcı ve admin ekranları


## Veri Modeli (Prisma)

Özet (tam şema için `apps/backend/prisma/schema.prisma`):

- `User(id, fullName, email(unique), password, role=USER)`
- `Drop(id, title, description?, stock, claimStart, claimEnd, isActive)`
- `Waitlist(id, userId, dropId, joinedAt, claimed, claimCode(unique)?, claimAt?, priorityScore, @@unique(userId,dropId))`

Bu yapı:
- Aynı kullanıcının aynı drop’a iki kez katılamamasını garanti eder
- Claim kodunun tekil olmasını sağlar
- Claim sıralaması için `priorityScore` ve ek indeksler içerir

## Endpoint’ler

- POST `api/auth/signup` → kayıt (email, password, fullName), JWT döner
- POST `api/auth/signin` → giriş, JWT döner
- GET `api/drops` → aktif drop listesi (public)
- GET `api/drops/:id` → bir drop detay + kullanıcı durumu (auth)
- POST `api/drops/:id/join` → waitlist’e katıl (auth, idempotent)
- POST `api/drops/:id/leave` → waitlist’ten ayrıl (auth, idempotent)
- POST `api/drops/:id/claim` → claim penceresinde hak talebi (auth, idempotent)
- GET `api/me/claims` → kullanıcının claim’leri (auth)
- GET `api/admin/drops` → tüm drop’ları listele (admin)
- POST `api/admin/drops` → yeni drop oluştur (admin)
- PUT `api/admin/drops/:id` → drop güncelle (admin)
- DELETE `api/admin/drops/:id` → drop sil (admin)

Örnek cevaplar (özet):
- join: `{ status: "joined" }` veya tekrar çağrıda `{ status: "already_joined" }`
- leave: `{ status: "left" }` veya `{ status: "not_in_waitlist" }`
- claim: `{ claimCode: "XXXX-YYYY" }` veya stok bitmişse `409 Conflict`


## Admin CRUD Modülü

`apps/web/app/admin` altında yönetim arayüzü bulunur:
- Listeleme, arama/filtreleme
- Yeni drop ekleme (başlık, açıklama, stok, claim penceresi)
- Güncelleme ve silme
- (Bonus) Rol bazlı görünürlük; admin olmayan kullanıcılar erişemez

**Erişim Kontrolü:**

Frontend (Next.js Middleware/Proxy):
- `apps/web/proxy.ts` içinde route koruması: `/admin` ile başlayan tüm istekler kontrol edilir
- Cookie'den `token` ve `role` okunur; token yoksa `/signin`'e yönlendirilir
- `role !== "ADMIN"` ise ana sayfaya (`/`) yönlendirilir
- Giriş yapmış admin kullanıcılar `/signin` veya `/signup`'a erişmeye çalışırsa `/admin`'e yönlendirilir

Backend (Fastify Guards):
- `apps/backend/src/shared/guards.ts`: `requireAuth` (JWT doğrulama) ve `requireRoles("ADMIN")` guard'ları
- Tüm `/admin/drops` endpoint'leri bu guard'lar ile korunur: `preHandler: [requireAuth, requireRoles("ADMIN")]`
- 401 (unauthorized) veya 403 (forbidden) döner
- DTO doğrulaması Zod schema'ları ile yapılır


## Idempotency ve Transaction Stratejisi

- Drop Join/Leave:
  - `Waitlist` üzerinde `@@unique([userId, dropId])`
  - Join: unique ihlali durumunda 200 ile idempotent başarı yanıtı
  - Leave: yoksa 200 ile `not_in_waitlist`

- Drop Claim:
  - Zaman penceresi kontrolü (`claimStart <= now <= claimEnd`), stok > 0 kontrolü
  - Transaction içinde:
    - Kullanıcı için bekleme kaydı al
    - Zaten `claimed` ise var olan `claimCode` ile dön (idempotent)
    - Stok doğrulaması ve sıraya/önceliğe göre hak ver
    - Tekil `claimCode` üret ve koşullu UPDATE yap (`WHERE claimed=false`)
  - Doğru HTTP kodları: 400 (pencere kapalı), 401/403 (yetki), 422 (drop yok), 409 (stok tükendi), 409/200 (idempotent durumlar)


## Seed Üretimi ve Kullanımı

Seed, öncelik katsayılarında ve `priorityScore` hesaplamasında deterministik rastlantısallık sağlar.

Girdi Bileşenleri:
1) Proje başlangıç zamanı (UTC, `YYYYMMDDHHmm`): `202511040447`
2) Remote URL: `git@github.com:emircancakmakk/dropspot-case-study.git`
3) İlk commit epoch: `1762304518`

Birleştirme ve Hash:

```
git@github.com:emircancakmakk/dropspot-case-study.git|1762304518|202511040447
→ SHA256 → 670afcb359e73b327555e4479fa2ea61dba7181b40f1792c5ccf15b37d0335c3
```

Kullanılan SEED (ilk 12 karakter): `670afcb359e7`

Uygulama Kullanımı:
- Backend `apps/backend/src/shared/priority.ts` içinde (ENV: `DS_SEED`)
- `computePriorityScore(userId, dropId)` fonksiyonu çağrılır (opsiyonel parametreler kullanılmaz)
- Base değer: `SHA256(userId:dropId:SEED)[0:6] % 100`
- Gerçek formül (mevcut implementasyonda):
  ```
  priority_score = base
  ```
- Not: Fonksiyon `signupLatencyMs`, `accountAgeDays`, `rapidActions` parametrelerini destekler ancak şu anda kullanılmamaktadır. Gelecekte genişletilebilir.

## Kurulum

Önkoşullar: Node 20+, Docker, Yarn 4+, OpenSSL (opsiyonel)

**Monorepo Yapısı:** Yarn Workspaces kullanılmaktadır. Root dizinde tüm bağımlılıklar yönetilir.

1) Ortam Değişkenleri

`.env` dosyaları:

`apps/backend/.env`
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dropspot
JWT_SECRET=dev_jwt_secret
DS_SEED=670afcb359e7
```

`apps/web/.env.local`
```
NEXT_PUBLIC_API_BASE=http://localhost:3001
```

2) Veritabanı
```bash
docker compose up -d
```

3) Bağımlılıklar (Root dizinde)
```bash
yarn install
```

4) Prisma migrate & generate
```bash
yarn workspace backend prisma:dev
```

5) Geliştirme Ortamını Başlatma

**Tüm uygulamaları birlikte başlat:**
```bash
yarn dev
```

**Veya ayrı ayrı:**
```bash
# Backend (port 3001)
yarn dev:backend
# veya
yarn workspace backend dev

# Frontend (port 3000)
yarn dev:web
# veya
yarn workspace web dev
```


## Ekran Görüntüleri

- Giriş ekranı

![Giriş ekranı](apps/web/public/screens/signin.png)

- Kayıt ekranı

![Kayıt ekranı](apps/web/public/screens/signup.png)

- Drop listesi

![Drop listesi](apps/web/public/screens/drop-list.png)

- Drop detay sayfası

![Drop detay](apps/web/public/screens/drop-detail.png)

- Waitlist’e katılma akışı

![Join drop](apps/web/public/screens/join-drop.png)

- Waitlist’ten ayrılma akışı

![Leave drop](apps/web/public/screens/leave-drop.png)

- Claim süreci (örnek 1)

![Claim drop 1](apps/web/public/screens/claim-drop-1.png)

- Claim süreci (örnek 2)

![Claim drop 2](apps/web/public/screens/claim-drop-2.png)

- Kullanıcının claim kodları listesi

![Claim kodları](apps/web/public/screens/claim-codes.png)

- Admin panel (liste)

![Admin panel](apps/web/public/screens/admin-panel.png)

- Admin yeni drop ekleme

![Admin add drop](apps/web/public/screens/admin-add-drop.png)

- Admin drop düzenleme

![Admin edit drop](apps/web/public/screens/admin-edit-drop.png)


## Test ve Kalite

### Backend Testleri

**Unit Test:**
- `apps/backend/src/shared/priority.test.ts`: `computePriorityScore` fonksiyonu test edilir
- Deterministik skor hesaplama, farklı girdiler için farklı sonuçlar, tutarlılık kontrolü

**Integration Test:**
- `apps/backend/src/modules/drops/drops.integration.test.ts`: Signup → Join → Claim akışı test edilir
- Idempotency testleri: join/leave/claim işlemlerinin tekrar çağrılması durumunda aynı sonucu vermesi
- Edge case'ler: stok doluyken claim denemesi, claim penceresi kapalıyken işlem yapma

**Çalıştırma:**
```bash
cd apps/backend
yarn test
```

### Frontend Testleri

**Component Testleri:**
- `apps/web/components/ui/button.test.tsx`: Button component'i test edilir
  - Render, variant'lar, size'lar, disabled durumu, click event'leri
- `apps/web/components/drops/components/drop-actions.test.tsx`: DropActions component'i test edilir
  - Join/leave/claim butonları, state yönetimi, action çağrıları

**Çalıştırma:**
```bash
cd apps/web
yarn test
```

### Test Kapsamı

- Idempotency: Join, leave, claim işlemlerinin tekrar çağrılması durumunda tutarlı sonuçlar
- Edge cases: Stok doluyken claim, claim penceresi kapalıyken işlem
- Component rendering: UI component'lerinin doğru render edilmesi
- User interactions: Button click'leri, form submit'leri


## Teknik Tercihler ve Gerekçeler

- Fastify: performans, tip güvenliği (zod ile), plugin ekosistemi
- Prisma: açık şema, migration ve unique/constraint yönetimi
- PostgreSQL: transaction, unique constraint ve koşullu UPDATE gibi atomik işlemleri destekler
- Next.js: app router, iyi geliştirici deneyimi, modern UI bileşenleri
- Idempotency: unique + transaction; API tekrar çağrılarında sonuç değişmez


## Geliştirme Süreci ve Repo Yönetimi

- Branch stratejisi: `feature/auth`, `feature/auth-jwt-migration`, `feature/drops`, `feature/frontend`
- Her özellik için ayrı PR: problem tanımı, çözüm özeti


## Hızlı API Kullanım Notları

Signup
```
curl -X POST http://localhost:3001/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"a@b.com","password":"secret","fullName":"Ada Lovelace"}'
```

Join
```
curl -X POST http://localhost:3001/api/drops/<DROP_ID>/join -H 'Authorization: Bearer <JWT>'
```

Claim
```
curl -X POST http://localhost:3001/api/drops/<DROP_ID>/claim -H 'Authorization: Bearer <JWT>'
```


—
Alpaco – Full Stack Developer Case için Emircan Çakmak tarafından hazırlandı.
