import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const drops = [
    {
      title: "Limited Edition Hoodie",
      description: "DropSpot özel sınırlı üretim hoodie. Yalnızca 100 adet.",
      stock: 100,
      claimStart: new Date("2025-11-06T18:00:00Z"),
      claimEnd: new Date("2025-11-06T21:00:00Z"),
      isActive: true,
    },
    {
      title: "VIP Concert Pass",
      description: "2025 kış konser serisine özel backstage erişimi.",
      stock: 50,
      claimStart: new Date("2025-11-07T17:00:00Z"),
      claimEnd: new Date("2025-11-07T20:00:00Z"),
      isActive: true,
    },
    {
      title: "Digital Art NFT",
      description: "Sınırlı sayıda mint edilebilen özel NFT koleksiyonu.",
      stock: 25,
      claimStart: new Date("2025-11-08T15:00:00Z"),
      claimEnd: new Date("2025-11-08T18:00:00Z"),
      isActive: true,
    },
    {
      title: "Coffee Lovers Box",
      description: "Kahve tutkunlarına özel deneme paketi.",
      stock: 200,
      claimStart: new Date("2025-11-09T09:00:00Z"),
      claimEnd: new Date("2025-11-09T12:00:00Z"),
      isActive: true,
    },
    {
      title: "Sneaker Drop",
      description: "Yalnızca DropSpot kullanıcılarına özel yeni model sneaker.",
      stock: 75,
      claimStart: new Date("2025-11-10T10:00:00Z"),
      claimEnd: new Date("2025-11-10T13:00:00Z"),
      isActive: true,
    },
    {
      title: "Tech Gadget Mystery Box",
      description: "Rastgele seçilmiş teknoloji ürünlerinden oluşan gizemli kutu.",
      stock: 30,
      claimStart: new Date("2025-11-11T14:00:00Z"),
      claimEnd: new Date("2025-11-11T17:00:00Z"),
      isActive: true,
    },
    {
      title: "Early Access Game Key",
      description: "Yeni çıkacak oyuna erken erişim anahtarı.",
      stock: 300,
      claimStart: new Date("2025-11-12T16:00:00Z"),
      claimEnd: new Date("2025-11-12T19:00:00Z"),
      isActive: true,
    },
    {
      title: "Wellness Retreat Pass",
      description: "Hafta sonu spa ve wellness etkinliği için giriş bileti.",
      stock: 40,
      claimStart: new Date("2025-11-13T07:00:00Z"),
      claimEnd: new Date("2025-11-13T10:00:00Z"),
      isActive: true,
    },
    {
      title: "Book Club Collectible Edition",
      description: "Özel baskı imzalı kitap. Koleksiyoncular için birebir.",
      stock: 60,
      claimStart: new Date("2025-11-14T11:00:00Z"),
      claimEnd: new Date("2025-11-14T14:00:00Z"),
      isActive: true,
    },
    {
      title: "Premium Coffee Subscription",
      description: "3 aylık özel kahve aboneliği. DropSpot üyelerine özel.",
      stock: 120,
      claimStart: new Date("2025-11-15T10:00:00Z"),
      claimEnd: new Date("2025-11-15T13:00:00Z"),
      isActive: true,
    },
  ];

  await prisma.drop.createMany({ data: drops });
  console.log("Seed tamamlandı: 10 drop eklendi.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
